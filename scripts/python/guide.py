#!/usr/bin/env python3
"""Spec Kit Guide: one script that reads where a project is and holds the agent to it.

Why this exists
---------------
Spec Kit's commands are prompts. Nothing stops a coding agent from skipping
ahead, writing code before there is a plan, or wandering off the task list when
the user asks a side question halfway through. This script is the deterministic
half of the Guide extension. It never asks the agent to remember anything:
every answer is recomputed from the files on disk.

Modes
-----
    guide.py status [--json]   Show the stage, the next step and the gate state.
    guide.py event             Handle an agent runtime event. The JSON payload
                               arrives on stdin; the kind of event is read from
                               the payload (see detect_event).
    guide.py pause             End an implementation run so the agent may stop.

The guide's own slash commands (pause, unlock, next) are recognised in the
text of the user's message by the prompt event, so they work without the
agent running anything.

Event contract (the same one Claude Code hooks use)
---------------------------------------------------
    exit 0 + stdout   allow; stdout is added to the agent's context
    exit 2 + stderr   block; stderr is shown to the agent as the reason

Standard library only. Spec Kit runs this with whatever Python launched its
event dispatcher, so nothing here may need a pip install.
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
from pathlib import Path

EXTENSION_ID = "guide"

# The order a feature moves through. "done" means every task is checked off.
STAGES = ["constitution", "specify", "plan", "tasks", "implement", "done"]

# The core Spec Kit command that completes each stage.
STAGE_COMMAND = {
    "constitution": "constitution",
    "specify": "specify",
    "plan": "plan",
    "tasks": "tasks",
    "implement": "implement",
}

# What each stage produces, in plain words, for messages shown to people.
STAGE_PRODUCES = {
    "constitution": "the project's ground rules",
    "specify": "spec.md, which says what to build and why",
    "plan": "plan.md, which says how to build it",
    "tasks": "tasks.md, the ordered task list",
    "implement": "the code, one task at a time",
}

# Settings and their defaults. guide-config.yml documents each one.
DEFAULTS = {
    "persona": "spec",        # spec | plain
    "gate": "block",          # block | warn | off
    "require_spec": True,     # lock code edits even before any feature exists
    "keep_going": True,       # refuse to stop mid-implementation
    "free_paths": ["docs/"],  # extra places the agent may always edit
}

# Tools that change files. Shell commands are deliberately not in this list:
# a shell string cannot be reliably classified as "writes code" or not, and a
# gate that guesses is worse than one with a documented gap.
EDIT_TOOLS = {"write", "edit", "multiedit", "notebookedit", "create", "str_replace_editor"}

CHECKBOX = re.compile(r"^\s*(?:[-*+]|\d+[.)])\s+\[( |x|X)\]\s+(.*\S)\s*$")

# A file path inside a task line, such as "src/models/user.py". Needs a folder
# and an extension so ordinary words and version numbers are not mistaken for one.
TASK_PATH = re.compile(r"(?<![\w/.-])((?:[\w.-]+/)+[\w.-]+\.[A-Za-z0-9]{1,8})(?![\w/])")


# --------------------------------------------------------------------------
# Locating the project and its settings
# --------------------------------------------------------------------------

def find_root(start: Path) -> Path:
    """Return the nearest directory at or above `start` that holds .specify/.

    Spec Kit's dispatcher already runs us from the project root; the walk
    upward is for people who run `guide.py status` from a subdirectory.
    """
    start = start.resolve()
    for candidate in [start, *start.parents]:
        if (candidate / ".specify").is_dir():
            return candidate
    return start


def parse_simple_yaml(text: str) -> dict:
    """Read the small subset of YAML that guide-config.yml uses.

    Supported: `key: value` pairs and `key:` followed by `- item` lines.
    PyYAML is not in the standard library, and a gate that fails to start
    because of a missing package would fail open, so the config format is kept
    simple enough to parse by hand.
    """
    result: dict = {}
    current_list = None
    for raw in text.splitlines():
        line = raw.split(" #", 1)[0].rstrip()
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        stripped = line.strip()
        if stripped.startswith("- ") and current_list is not None:
            result[current_list].append(stripped[2:].strip().strip("\"'"))
            continue
        if ":" not in stripped or line[0].isspace():
            continue
        key, _, value = stripped.partition(":")
        key, value = key.strip(), value.strip().strip("\"'")
        if value == "":
            result[key] = []
            current_list = key
        elif value == "[]":
            result[key] = []
            current_list = None
        else:
            result[key] = value
            current_list = None
    return result


def as_bool(value, default: bool) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        if value.strip().lower() in {"1", "true", "yes", "on"}:
            return True
        if value.strip().lower() in {"0", "false", "no", "off"}:
            return False
    return default


def load_config(root: Path) -> dict:
    """Merge settings: defaults, then project config, then local, then env.

    This is the same layering Spec Kit documents for extension config, so a
    setting behaves the way an extension user would expect.
    """
    config = dict(DEFAULTS)
    ext_dir = root / ".specify" / "extensions" / EXTENSION_ID
    for name in ("guide-config.yml", "local-config.yml"):
        path = ext_dir / name
        if path.is_file():
            try:
                config.update(parse_simple_yaml(path.read_text(encoding="utf-8")))
            except OSError:
                pass
    for key in DEFAULTS:
        env_value = os.environ.get("SPECKIT_GUIDE_" + key.upper())
        if env_value is not None and not isinstance(DEFAULTS[key], list):
            config[key] = env_value

    config["require_spec"] = as_bool(config.get("require_spec"), True)
    config["keep_going"] = as_bool(config.get("keep_going"), True)
    if config.get("gate") not in {"block", "warn", "off"}:
        config["gate"] = "block"
    if config.get("persona") not in {"spec", "plain"}:
        config["persona"] = "spec"
    if not isinstance(config.get("free_paths"), list):
        config["free_paths"] = list(DEFAULTS["free_paths"])
    return config


def command_name(root: Path, command: str) -> str:
    """Spell a Spec Kit command the way this project's agent expects.

    Skills-based integrations such as Claude Code use hyphens
    (/speckit-plan); the others use dots (/speckit.plan).
    """
    separator = "."
    try:
        options = json.loads((root / ".specify" / "init-options.json").read_text(encoding="utf-8"))
        if options.get("ai_skills"):
            separator = "-"
    except (OSError, ValueError):
        pass
    return "/speckit" + separator + command.replace(".", separator)


# --------------------------------------------------------------------------
# Reading the stage from the files on disk
# --------------------------------------------------------------------------

def inside(root: Path, path: Path) -> bool:
    try:
        path.resolve().relative_to(root.resolve())
        return True
    except (OSError, ValueError):
        return False


def find_feature_dir(root: Path):
    """Return the active feature directory, or None when there is none yet.

    Spec Kit records the active feature in .specify/feature.json. When that
    is missing (older projects, or a fresh clone, since the file is
    gitignored) fall back to the most recently edited spec under specs/.
    """
    try:
        data = json.loads((root / ".specify" / "feature.json").read_text(encoding="utf-8"))
        value = data.get("feature_directory")
        if isinstance(value, str) and value.strip():
            candidate = (root / value).resolve()
            if candidate.is_dir() and inside(root, candidate):
                return candidate
    except (OSError, ValueError):
        pass

    specs = root / "specs"
    if specs.is_dir():
        found = sorted(specs.glob("**/spec.md"), key=lambda p: p.stat().st_mtime, reverse=True)
        if found:
            return found[0].parent
    return None


def constitution_ready(root: Path) -> bool:
    """True once the constitution has been filled in, not merely copied.

    `specify init` drops a template full of [PLACEHOLDER] tokens, so the
    file existing proves nothing. A filled-in one has no such tokens left.
    """
    path = root / ".specify" / "memory" / "constitution.md"
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return False
    return not re.search(r"\[[A-Z][A-Z0-9_]{3,}\]", text)


def read_tasks(path: Path):
    """Return (done, total, text of the first unchecked task or None)."""
    done = total = 0
    next_task = None
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return 0, 0, None
    for line in lines:
        match = CHECKBOX.match(line)
        if not match:
            continue
        total += 1
        if match.group(1).lower() == "x":
            done += 1
        elif next_task is None:
            next_task = match.group(2)
    return done, total, next_task


def ticked_but_missing(root: Path, tasks_path: Path) -> list:
    """List files that ticked tasks name but that are not on disk.

    Agents sometimes tick a task without doing it (github/spec-kit#1865).
    This cannot judge whether the work is right. It catches the cheapest
    case only: the task says it creates a file and the file is not there.
    A task that deletes or renames a file will show up here too, which is
    why the result is worded as "check these" and never as proof.
    """
    missing = []
    try:
        lines = tasks_path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return missing
    for line in lines:
        match = CHECKBOX.match(line)
        if not match or match.group(1).lower() != "x":
            continue
        for found in TASK_PATH.findall(match.group(2)):
            candidate = root / found
            if inside(root, candidate) and not candidate.exists() and found not in missing:
                missing.append(found)
    return missing


def read_status(root: Path) -> dict:
    """Work out where the project is. Everything else builds on this."""
    feature = find_feature_dir(root)
    has_spec = bool(feature and (feature / "spec.md").is_file())
    has_plan = bool(feature and (feature / "plan.md").is_file())
    has_tasks = bool(feature and (feature / "tasks.md").is_file())
    done, total, next_task = read_tasks(feature / "tasks.md") if has_tasks else (0, 0, None)
    has_constitution = constitution_ready(root)

    if not has_spec:
        # The constitution only counts as a stage before the first spec.
        # Many working projects never fill it in, and holding a feature
        # hostage to it would be a gate nobody asked for.
        stage = "specify" if has_constitution else "constitution"
        feature = None
    elif not has_plan:
        stage = "plan"
    elif not has_tasks:
        stage = "tasks"
    elif total > 0 and done == total:
        stage = "done"
    else:
        stage = "implement"

    open_questions = 0
    if has_spec:
        try:
            open_questions = (feature / "spec.md").read_text(encoding="utf-8").count("[NEEDS CLARIFICATION")
        except OSError:
            pass

    return {
        "root": str(root),
        "feature": str(feature.relative_to(root)) if feature else None,
        "stage": stage,
        "constitution": has_constitution,
        "spec": has_spec,
        "plan": has_plan,
        "tasks": has_tasks,
        "tasks_done": done,
        "tasks_total": total,
        "next_task": next_task,
        "open_questions": open_questions,
        "ticked_but_missing": ticked_but_missing(root, feature / "tasks.md") if has_tasks else [],
    }


def next_step(root: Path, status: dict) -> str:
    """One sentence saying what should happen next."""
    stage = status["stage"]
    if stage == "constitution":
        # Idea first. A newcomer asked for "ground rules" before they have
        # said what they want to build has nothing to base them on, so the
        # guide takes the idea and writes the rules and the spec from it.
        return ("Start with %s and say what you want to build. It writes the project's ground rules "
                "and then the spec from one conversation." % command_name(root, "guide.start"))
    if stage == "done":
        return "Every task is checked off. Start the next feature with %s." % command_name(root, "specify")
    if stage == "specify" and status["open_questions"] == 0:
        return "Run %s to write %s." % (command_name(root, "specify"), STAGE_PRODUCES["specify"])
    if stage == "plan" and status["open_questions"]:
        return "The spec has %d open question(s). Run %s first, then %s." % (
            status["open_questions"], command_name(root, "clarify"), command_name(root, "plan"))
    if stage == "implement":
        return "Run %s to build %s. %d of %d tasks are done." % (
            command_name(root, "implement"), STAGE_PRODUCES["implement"],
            status["tasks_done"], status["tasks_total"])
    return "Run %s to write %s." % (command_name(root, STAGE_COMMAND[stage]), STAGE_PRODUCES[stage])


# --------------------------------------------------------------------------
# Run state: is an implementation run in progress, and in which session?
# --------------------------------------------------------------------------
# This is the only thing the script stores. It cannot be read from the spec
# artifacts: "tasks.md has unchecked boxes" does not mean the user asked the
# agent to work through them right now.

def state_dir(root: Path) -> Path:
    return root / ".specify" / EXTENSION_ID


def load_run(root: Path) -> dict:
    try:
        return json.loads((state_dir(root) / "run.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def ensure_state_dir(root: Path) -> Path:
    directory = state_dir(root)
    directory.mkdir(parents=True, exist_ok=True)
    # Per-checkout state, like Spec Kit's own feature.json: keep it out of git.
    ignore = directory / ".gitignore"
    if not ignore.exists():
        ignore.write_text("*\n", encoding="utf-8")
    return directory


def update_run(root: Path, **changes) -> dict:
    """Change some fields of the run state and return the result."""
    run = load_run(root)
    run.update(changes)
    (ensure_state_dir(root) / "run.json").write_text(json.dumps(run, indent=2), encoding="utf-8")
    return run


def end_run(root: Path) -> dict:
    return update_run(root, implementing=False, nudges=0)


def beat(root: Path, kind: str) -> None:
    """Note that an event reached this script.

    `status` reads this back. "The hooks are in the settings file" and "the
    hooks actually fire" are different facts, and only the second one means
    the project is guarded.
    """
    try:
        (ensure_state_dir(root) / "heartbeat.json").write_text(
            json.dumps({"at": time.time(), "event": kind}), encoding="utf-8")
    except OSError:
        pass


def last_beat(root: Path):
    try:
        return json.loads((state_dir(root) / "heartbeat.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def log_error(root: Path, message: str) -> None:
    """Record a failure so that failing open is never silent.

    A broken gate must not lock someone out of their own project, so errors
    let the action through. They are written here and `status` reports the
    count, which is how you find out the gate was not actually guarding.
    """
    try:
        directory = state_dir(root)
        directory.mkdir(parents=True, exist_ok=True)
        with open(directory / "errors.log", "a", encoding="utf-8") as handle:
            handle.write("%s %s\n" % (time.strftime("%Y-%m-%dT%H:%M:%S"), message))
    except OSError:
        pass


def error_count(root: Path) -> int:
    try:
        return len((state_dir(root) / "errors.log").read_text(encoding="utf-8").splitlines())
    except OSError:
        return 0


# --------------------------------------------------------------------------
# The gate: may this file be edited at this stage?
# --------------------------------------------------------------------------

def is_free_path(root: Path, target: Path, config: dict) -> bool:
    """True for files the agent may edit at any stage.

    Planning has to be able to write its own artifacts, so specs, Spec Kit's
    and the agent's own dot-directories, and top-level Markdown are always
    open. Files outside the project are not this gate's business.
    """
    try:
        relative = target.resolve().relative_to(root.resolve())
    except (OSError, ValueError):
        return True
    parts = relative.parts
    if not parts:
        return True
    if parts[0].startswith(".") or parts[0] == "specs":
        return True
    if len(parts) == 1 and relative.suffix.lower() in {".md", ".txt"}:
        return True
    posix = relative.as_posix()
    for prefix in config["free_paths"]:
        prefix = str(prefix).strip().lstrip("./")
        if prefix and (posix == prefix.rstrip("/") or posix.startswith(prefix.rstrip("/") + "/")):
            return True
    return False


def gate_reason(root: Path, status: dict, config: dict, target: Path, unlocked: bool = False):
    """Return why an edit is out of order, or None when it is allowed."""
    if config["gate"] != "block" or unlocked:
        return None
    if status["stage"] in {"implement", "done"}:
        return None
    if status["feature"] is None and not config["require_spec"]:
        return None
    if is_free_path(root, target, config):
        return None

    try:
        shown = target.resolve().relative_to(root.resolve()).as_posix()
    except (OSError, ValueError):
        shown = str(target)
    missing = [name for name in ("spec", "plan", "tasks") if not status[name]]
    return (
        "Spec Kit Guide blocked this edit to %s.\n"
        "This project is at the '%s' stage and has no %s yet, so code edits are locked.\n"
        "%s\n"
        "Do not look for another way to write this file. Tell the user, in plain words, which step comes first and offer to run it.\n"
        "If the user wants this edit anyway, they can type %s to open code edits for this session. "
        "Only the user can do that; do not run it or change the guide's settings yourself."
        % (shown, status["stage"], " or ".join(m + ".md" for m in missing), next_step(root, status),
           command_name(root, "guide.unlock"))
    )


# --------------------------------------------------------------------------
# Event handlers
# --------------------------------------------------------------------------

def detect_event(payload: dict) -> str:
    """Work out which lifecycle event this payload is.

    One command serves all four events so the extension adds a single entry
    to the agent's command list instead of four. Claude Code names the event
    in the payload. For agents that do not, the shape of the payload is
    enough to tell them apart.
    """
    name = re.sub(r"[^a-z]", "", str(payload.get("hook_event_name") or payload.get("event") or "").lower())
    if name in {"sessionstart"}:
        return "session"
    if name in {"userpromptsubmit", "beforeagent"}:
        return "prompt"
    if name in {"pretooluse", "beforetool", "beforetooluse"}:
        return "edit"
    if name in {"stop", "afteragent"}:
        return "stop"
    if "tool_name" in payload or "tool" in payload:
        return "edit"
    if "prompt" in payload:
        return "prompt"
    if "stop_hook_active" in payload:
        return "stop"
    return "session"


def stage_line(root: Path, status: dict) -> str:
    where = status["feature"] or "no feature yet"
    return "[Spec Kit Guide] %s | stage: %s. %s" % (where, status["stage"], next_step(root, status))


def run_is_active(run: dict, payload: dict, status: dict) -> bool:
    """True when this session is in the middle of an implementation run."""
    return (
        bool(run.get("implementing"))
        and run.get("session_id") == payload.get("session_id")
        and run.get("feature") == status["feature"]
        and status["stage"] == "implement"
    )


def is_unlocked(run: dict, payload: dict) -> bool:
    """True when the user opened code edits for this session."""
    session = payload.get("session_id")
    return bool(session) and run.get("unlocked_session") == session


def status_block(root: Path, status: dict, config: dict, run: dict, payload: dict) -> str:
    """The full status as JSON, for the guide's own commands.

    The commands used to tell the agent to run this script through the
    shell. For a first-time user that meant a permission prompt for a Python
    command before anything had happened. The prompt event already runs
    here, so the answer is handed over directly instead.
    """
    data = dict(status)
    data.pop("root", None)
    data["next"] = next_step(root, status)
    data["next_command"] = command_name(root, STAGE_COMMAND.get(status["stage"], "specify"))
    data["persona"] = config["persona"]
    data["gate"] = config["gate"]
    data["code_edits_unlocked_this_session"] = is_unlocked(run, payload)
    data["implementation_run_active"] = run_is_active(run, payload, status)
    data["first_time"] = not status["constitution"] and status["feature"] is None
    data["harness"] = harness_state(root)
    data["code_edits_locked"] = bool(
        config["gate"] == "block" and not data["code_edits_unlocked_this_session"]
        and status["stage"] not in {"implement", "done"}
        and (status["feature"] is not None or config["require_spec"]))
    return "[Spec Kit Guide status]\n" + json.dumps(data, indent=2)


def on_session(root: Path, payload: dict, status: dict, config: dict) -> int:
    """Session start: tell the agent where things stand.

    This also fires when the agent compacts its context (Claude Code sends
    source "compact"). That is the moment agents most often lose the plan
    (github/spec-kit discussions 2914 and 1273), so an active run is
    re-pinned here with its next task rather than merely mentioned.
    """
    run = load_run(root)
    lines = [stage_line(root, status)]
    if run_is_active(run, payload, status):
        lines.append(
            "An implementation run is in progress in this session: %d of %d tasks done. "
            "Carry on from the next unchecked task: %s"
            % (status["tasks_done"], status["tasks_total"], status["next_task"] or "(none found)"))
    elif run.get("implementing") and status["stage"] == "implement":
        lines.append(
            "An implementation run was left unfinished (%d of %d tasks done). Ask the user whether to resume with %s."
            % (status["tasks_done"], status["tasks_total"], command_name(root, "implement")))
    if config["gate"] == "block" and status["stage"] not in {"implement", "done"}:
        lines.append("Code edits are locked until tasks.md exists. Planning files (specs/, .specify/, docs/) stay open.")
    if not status["constitution"] and status["feature"] is None:
        lines.append(
            "Nothing has been written here yet, so the user may be new to Spec Kit. If they say what they want to "
            "build, explain in two or three plain sentences that the idea gets written down first and built after, "
            "then offer %s. Do not list commands at them." % command_name(root, "guide.start"))
    else:
        lines.append(
            "Follow the Spec Kit order: specify, plan, tasks, implement. "
            "When the user is unsure what to do, offer %s rather than listing commands." % command_name(root, "guide.next"))
    if config["persona"] == "spec":
        lines.append(
            "Voice: you are Spec, a friendly dog who guides people through spec-driven development. "
            "Be warm, plain and brief. One small dog touch per reply at most, and never at the cost of clarity.")
    print("\n".join(lines))
    return 0


def on_prompt(root: Path, payload: dict, status: dict, config: dict) -> int:
    """Every user message: re-pin the stage so the agent cannot lose the thread.

    This is the answer to "the agent jumped out of the plan when I asked it
    something halfway through". The reminder is rebuilt from disk each time,
    so it survives compaction and long sessions.
    """
    prompt = str(payload.get("prompt") or "")
    run = load_run(root)

    # Starting, pausing and unlocking are detected from the command the user
    # typed. Nothing the agent says about itself can change this state, which
    # is the point: the agent cannot talk its way past the gate.
    if re.search(r"speckit[-.]guide[-.]pause", prompt):
        run = end_run(root)
    elif re.match(r"\s*/speckit[-.]guide[-.]unlock\b", prompt):
        # Anchored to the start of the message: asking "what does
        # /speckit-guide-unlock do?" must not unlock anything.
        run = update_run(root, unlocked_session=payload.get("session_id"))
    elif status["stage"] == "implement" and re.search(r"speckit[-.](implement|guide[-.](next|start))", prompt):
        run = update_run(
            root, implementing=True, session_id=payload.get("session_id"),
            feature=status["feature"], since=time.strftime("%Y-%m-%dT%H:%M:%S"),
            nudges=0, nudge_done=status["tasks_done"])

    if run_is_active(run, payload, status):
        lines = [
            "[Spec Kit Guide] %s | implementation run in progress, %d of %d tasks done."
            % (status["feature"], status["tasks_done"], status["tasks_total"])]
        lines.append(
            "Next unchecked task: %s\n"
            "If this message is a question or a small request, deal with it briefly, then carry on from that task. "
            "Do not re-plan, reorder or drop tasks unless the user asks in so many words. "
            "Check each task off in tasks.md as you finish it, and only once its files exist."
            % (status["next_task"] or "(none found)"))
    else:
        lines = [stage_line(root, status)]
        if is_unlocked(run, payload):
            lines.append("The user has opened code edits for this session. The steps above are still the recommended order.")
        elif status["stage"] not in {"implement", "done"} and config["gate"] != "off":
            lines.append(
                "If the user asks for code now, say which step comes first and offer to run it. Do not write code yet.")
    if re.search(r"speckit[-.]guide", prompt):
        lines.append(status_block(root, status, config, run, payload))
    print("\n".join(lines))
    return 0


def on_edit(root: Path, payload: dict, status: dict, config: dict) -> int:
    """Before a file edit: block it when it is out of order."""
    tool = str(payload.get("tool_name") or payload.get("tool") or "").lower()
    if tool not in EDIT_TOOLS:
        return 0
    tool_input = payload.get("tool_input") or payload.get("input") or {}
    if not isinstance(tool_input, dict):
        return 0
    raw = tool_input.get("file_path") or tool_input.get("notebook_path") or tool_input.get("path")
    if not isinstance(raw, str) or not raw.strip():
        return 0
    target = Path(raw)
    if not target.is_absolute():
        target = root / target

    reason = gate_reason(root, status, config, target, unlocked=is_unlocked(load_run(root), payload))
    if reason:
        sys.stderr.write(reason + "\n")
        return 2
    return 0


# How many times in a row the agent may be sent back without ticking a single
# new task. After that it is let go. A stop hook with no limit has burned a
# whole usage quota in under an hour (anthropics/claude-code#55754).
MAX_NUDGES_WITHOUT_PROGRESS = 2


def on_stop(root: Path, payload: dict, status: dict, config: dict) -> int:
    """When the agent tries to stop: send it back if tasks remain.

    Three limits keep this from becoming a runaway loop:
      1. `stop_hook_active` is true when the agent is already continuing
         because of a stop hook. It is then let go, so one stop gets at most
         one nudge.
      2. Nudges that produce no newly ticked task are counted, and after
         MAX_NUDGES_WITHOUT_PROGRESS the agent is let go until progress resumes.
      3. It applies only to the session in which the user started the run.
    """
    run = load_run(root)
    if payload.get("stop_hook_active") or not run.get("implementing"):
        return 0
    if run.get("session_id") != payload.get("session_id"):
        return 0

    if status["stage"] == "done":
        end_run(root)
        # Last check before the agent reports that everything is finished.
        missing = status["ticked_but_missing"]
        if missing and config["keep_going"]:
            sys.stderr.write(
                "Spec Kit Guide: every task is ticked, but these files named by ticked tasks do not exist:\n  %s\n"
                "Check each one. If the task was not really done, untick it and do it. "
                "If the file was meant to be removed or renamed, tell the user so.\n" % "\n  ".join(missing[:10]))
            return 2
        return 0

    if not config["keep_going"] or not run_is_active(run, payload, status):
        return 0
    remaining = status["tasks_total"] - status["tasks_done"]
    if remaining <= 0:
        return 0

    progressed = status["tasks_done"] > int(run.get("nudge_done") or 0)
    nudges = 1 if progressed else int(run.get("nudges") or 0) + 1
    if nudges > MAX_NUDGES_WITHOUT_PROGRESS:
        return 0
    update_run(root, nudges=nudges, nudge_done=status["tasks_done"])
    sys.stderr.write(
        "Spec Kit Guide: the implementation run is not finished. %d of %d tasks remain.\n"
        "Next unchecked task: %s\n"
        "Carry on with that task and check it off in tasks.md when it is done.\n"
        "If you need something from the user, or you are blocked, say exactly what you need and then stop.\n"
        % (remaining, status["tasks_total"], status["next_task"] or "(none found)"))
    return 2


HANDLERS = {"session": on_session, "prompt": on_prompt, "edit": on_edit, "stop": on_stop}


def handle_event(root: Path) -> int:
    raw = sys.stdin.read()
    try:
        payload = json.loads(raw) if raw.strip() else {}
        if not isinstance(payload, dict):
            payload = {}
    except ValueError:
        log_error(root, "event payload was not JSON; the action was allowed")
        return 0
    try:
        kind = detect_event(payload)
        beat(root, kind)
        return HANDLERS[kind](root, payload, read_status(root), load_config(root))
    except Exception as exc:  # noqa: BLE001 - fail open, but leave a trace
        log_error(root, "event handler failed (%s: %s); the action was allowed" % (type(exc).__name__, exc))
        return 0


# --------------------------------------------------------------------------
# Commands for people
# --------------------------------------------------------------------------

def harness_state(root: Path) -> str:
    """Say whether the hooks are in place and whether they have ever fired.

    Presets and integration upgrades can drop an extension's wiring without
    any error (github/spec-kit#5532), and a guide that is installed but not
    running looks exactly like one that is. So this reports what it can see.
    """
    beat_info = last_beat(root)
    if beat_info:
        minutes = int((time.time() - float(beat_info.get("at", 0))) // 60)
        ago = "just now" if minutes < 1 else ("%d min ago" % minutes if minutes < 120 else "%d h ago" % (minutes // 60))
        return "running (last event: %s, %s)" % (beat_info.get("event", "?"), ago)
    settings = root / ".claude" / "settings.json"
    try:
        wired = "speckit.guide.harness" in settings.read_text(encoding="utf-8")
    except OSError:
        wired = False
    if wired:
        return "wired for Claude Code, but no event has arrived yet. Start a new session."
    return "NOT RUNNING: no event has ever arrived. The agent is not being held to the plan. Try: specify integration upgrade"


def print_status(root: Path, as_json: bool) -> int:
    status = read_status(root)
    config = load_config(root)
    run = load_run(root)
    status["next"] = next_step(root, status)
    status["next_command"] = command_name(root, STAGE_COMMAND.get(status["stage"], "specify"))
    status["gate"] = config["gate"]
    status["code_edits_locked"] = bool(
        config["gate"] == "block"
        and status["stage"] not in {"implement", "done"}
        and (status["feature"] is not None or config["require_spec"]))
    status["implementing"] = bool(run.get("implementing"))
    status["unlocked_session"] = run.get("unlocked_session")
    status["persona"] = config["persona"]
    status["gate_errors"] = error_count(root)
    status["harness"] = harness_state(root)

    if as_json:
        print(json.dumps(status, indent=2))
        return 0

    def mark(done: bool) -> str:
        return "[x]" if done else "[ ]"

    print("Spec Kit Guide")
    print("  Feature: %s" % (status["feature"] or "none yet"))
    print("  %s rules   %s spec   %s plan   %s tasks   %s built" % (
        mark(status["constitution"]), mark(status["spec"]), mark(status["plan"]),
        mark(status["tasks"]), mark(status["stage"] == "done")))
    if status["tasks_total"]:
        print("  Tasks: %d of %d done" % (status["tasks_done"], status["tasks_total"]))
    print("  Next:  %s" % status["next"])
    lock = "locked" if status["code_edits_locked"] else "open"
    if status["code_edits_locked"] and status["unlocked_session"]:
        lock = "locked, opened by you for one session"
    print("  Gate:  %s (code edits %s)" % (status["gate"], lock))
    if status["implementing"]:
        print("  Run:   implementation in progress; %s ends it" % command_name(root, "guide.pause"))
    print("  Harness: %s" % status["harness"])
    if status["ticked_but_missing"]:
        print("  Check: ticked tasks name files that do not exist: %s" % ", ".join(status["ticked_but_missing"][:5]))
    if status["gate_errors"]:
        print("  Warning: the gate failed open %d time(s). See .specify/guide/errors.log" % status["gate_errors"])
    return 0


def main(argv: list) -> int:
    root = find_root(Path.cwd())
    mode = argv[1] if len(argv) > 1 else "status"
    if mode == "status":
        return print_status(root, "--json" in argv)
    if mode == "event":
        return handle_event(root)
    if mode == "pause":
        end_run(root)
        print("Implementation run paused. The agent may stop; run %s to resume." % command_name(root, "implement"))
        return 0
    sys.stderr.write("usage: guide.py [status [--json] | event | pause]\n")
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
