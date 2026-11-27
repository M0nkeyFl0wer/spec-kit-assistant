"""Tests for scripts/python/guide.py.

Every test builds a throwaway Spec Kit project under pytest's tmp_path and
runs the script as a subprocess, the same way Spec Kit's event dispatcher
does. Nothing here touches a real project.
"""

import json
import os
import subprocess
import sys
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "python" / "guide.py"
FILLED_CONSTITUTION = "# Demo Constitution\n\n## Core Principles\n\n### I. Keep it small\n"
TEMPLATE_CONSTITUTION = "# [PROJECT_NAME] Constitution\n\n### [PRINCIPLE_1_NAME]\n"


def run(project, *args, payload=None, env=None):
    """Run guide.py inside `project`; return (exit code, stdout, stderr)."""
    full_env = {k: v for k, v in os.environ.items() if not k.startswith("SPECKIT_GUIDE_")}
    full_env.update(env or {})
    result = subprocess.run(
        [sys.executable, str(SCRIPT), *args],
        input=json.dumps(payload) if isinstance(payload, dict) else (payload or ""),
        capture_output=True, text=True, cwd=str(project), env=full_env,
    )
    return result.returncode, result.stdout, result.stderr


def status(project, **kwargs):
    code, out, _ = run(project, "status", "--json", **kwargs)
    assert code == 0
    return json.loads(out)


def edit(project, path, tool="Write", **kwargs):
    return run(project, "event", payload={
        "hook_event_name": "PreToolUse", "session_id": "s1",
        "tool_name": tool, "tool_input": {"file_path": path}}, **kwargs)


def prompt(project, text, session="s1"):
    return run(project, "event", payload={
        "hook_event_name": "UserPromptSubmit", "session_id": session, "prompt": text})


def stop(project, session="s1", active=False):
    return run(project, "event", payload={
        "hook_event_name": "Stop", "session_id": session, "stop_hook_active": active})


@pytest.fixture
def project(tmp_path):
    """A project as `specify init --integration claude` leaves it."""
    (tmp_path / ".specify" / "memory").mkdir(parents=True)
    (tmp_path / ".specify" / "memory" / "constitution.md").write_text(TEMPLATE_CONSTITUTION)
    (tmp_path / ".specify" / "init-options.json").write_text(json.dumps({"ai_skills": True}))
    return tmp_path


def add_feature(project, spec=True, plan=False, tasks=None, name="001-demo"):
    """Create a feature directory holding the given artifacts."""
    feature = project / "specs" / name
    feature.mkdir(parents=True, exist_ok=True)
    if spec:
        (feature / "spec.md").write_text("# Spec\n")
    if plan:
        (feature / "plan.md").write_text("# Plan\n")
    if tasks is not None:
        (feature / "tasks.md").write_text(tasks)
    (project / ".specify" / "feature.json").write_text(
        json.dumps({"feature_directory": "specs/" + name}))
    return feature


TWO_OF_THREE = "- [x] T001 Set up\n- [ ] T002 Add the model\n- [ ] T003 Add the CLI\n"
ALL_DONE = "- [x] T001 Set up\n- [X] T002 Add the model\n"


# ---- reading the stage from disk ------------------------------------------

def test_template_constitution_does_not_count_as_written(project):
    assert status(project)["stage"] == "constitution"


def test_filled_constitution_moves_to_specify(project):
    (project / ".specify" / "memory" / "constitution.md").write_text(FILLED_CONSTITUTION)
    assert status(project)["stage"] == "specify"


@pytest.mark.parametrize("plan, tasks, expected", [
    (False, None, "plan"),
    (True, None, "tasks"),
    (True, TWO_OF_THREE, "implement"),
    (True, ALL_DONE, "done"),
])
def test_stage_follows_the_artifacts(project, plan, tasks, expected):
    add_feature(project, plan=plan, tasks=tasks)
    assert status(project)["stage"] == expected


def test_a_spec_is_not_held_up_by_a_missing_constitution(project):
    add_feature(project)
    assert status(project)["stage"] == "plan"


def test_task_progress_and_next_task(project):
    add_feature(project, plan=True, tasks=TWO_OF_THREE)
    result = status(project)
    assert (result["tasks_done"], result["tasks_total"]) == (1, 3)
    assert result["next_task"] == "T002 Add the model"


def test_open_questions_send_the_user_to_clarify(project):
    feature = add_feature(project)
    (feature / "spec.md").write_text("# Spec\n[NEEDS CLARIFICATION: who logs in?]\n")
    result = status(project)
    assert result["open_questions"] == 1
    assert "/speckit-clarify" in result["next"]


def test_feature_found_without_feature_json(project):
    add_feature(project, plan=True)
    (project / ".specify" / "feature.json").unlink()
    assert status(project)["feature"] == "specs/001-demo"


def test_feature_json_cannot_point_outside_the_project(project, tmp_path_factory):
    outside = tmp_path_factory.mktemp("outside")
    (outside / "spec.md").write_text("# Spec\n")
    (project / ".specify" / "feature.json").write_text(
        json.dumps({"feature_directory": str(outside)}))
    assert status(project)["feature"] is None


def test_command_spelling_follows_the_integration(project):
    assert status(project)["next_command"] == "/speckit-constitution"
    (project / ".specify" / "init-options.json").write_text(json.dumps({"ai_skills": False}))
    assert status(project)["next_command"] == "/speckit.constitution"


# ---- the gate --------------------------------------------------------------

def test_code_edit_is_blocked_before_any_spec(project):
    code, _, err = edit(project, "src/app.py")
    assert code == 2
    assert "src/app.py" in err and "/speckit-constitution" in err


@pytest.mark.parametrize("plan, tasks", [(False, None), (True, None)])
def test_code_edit_is_blocked_until_tasks_exist(project, plan, tasks):
    add_feature(project, plan=plan, tasks=tasks)
    assert edit(project, "src/app.py")[0] == 2


@pytest.mark.parametrize("tasks", [TWO_OF_THREE, ALL_DONE])
def test_code_edit_is_allowed_once_tasks_exist(project, tasks):
    add_feature(project, plan=True, tasks=tasks)
    assert edit(project, "src/app.py")[0] == 0


@pytest.mark.parametrize("path", [
    "specs/001-demo/plan.md", ".specify/memory/constitution.md", ".claude/settings.json",
    "README.md", "CLAUDE.md", "docs/notes/idea.md",
])
def test_planning_files_are_never_blocked(project, path):
    assert edit(project, path)[0] == 0


def test_absolute_path_inside_the_project_is_gated(project):
    assert edit(project, str(project / "src" / "app.py"))[0] == 2


def test_files_outside_the_project_are_not_gated(project, tmp_path_factory):
    assert edit(project, str(tmp_path_factory.mktemp("elsewhere") / "x.py"))[0] == 0


def test_dotdot_cannot_dress_code_up_as_a_spec(project):
    assert edit(project, "specs/../src/app.py")[0] == 2


@pytest.mark.parametrize("tool", ["Edit", "MultiEdit", "NotebookEdit"])
def test_every_edit_tool_is_gated(project, tool):
    assert edit(project, "src/app.py", tool=tool)[0] == 2


def test_other_tools_pass_through(project):
    code, _, _ = run(project, "event", payload={
        "hook_event_name": "PreToolUse", "tool_name": "Bash", "tool_input": {"command": "ls"}})
    assert code == 0


@pytest.mark.parametrize("mode", ["warn", "off"])
def test_gate_setting_from_environment(project, mode):
    assert edit(project, "src/app.py", env={"SPECKIT_GUIDE_GATE": mode})[0] == 0


def test_gate_setting_from_config_file(project):
    config = project / ".specify" / "extensions" / "guide"
    config.mkdir(parents=True)
    (config / "guide-config.yml").write_text("# comment\ngate: warn  # trailing\n")
    assert edit(project, "src/app.py")[0] == 0
    (config / "local-config.yml").write_text("gate: block\n")
    assert edit(project, "src/app.py")[0] == 2


def test_require_spec_false_leaves_a_featureless_project_alone(project):
    env = {"SPECKIT_GUIDE_REQUIRE_SPEC": "false"}
    assert edit(project, "src/app.py", env=env)[0] == 0
    add_feature(project)
    assert edit(project, "src/app.py", env=env)[0] == 2


def test_free_paths_from_config(project):
    config = project / ".specify" / "extensions" / "guide"
    config.mkdir(parents=True)
    (config / "guide-config.yml").write_text("free_paths:\n  - scratch/\n")
    assert edit(project, "scratch/try.py")[0] == 0
    assert edit(project, "scratchpad/try.py")[0] == 2
    assert edit(project, "docs/x.md")[0] == 2  # the list replaces the default


def test_bad_payload_fails_open_and_is_recorded(project):
    code, _, _ = run(project, "event", payload="not json")
    assert code == 0
    assert status(project)["gate_errors"] == 1


# ---- prompts and the keep-going nudge -------------------------------------

def test_prompt_before_tasks_steers_away_from_code(project):
    add_feature(project)
    code, out, _ = prompt(project, "just write the code")
    assert code == 0
    assert "stage: plan" in out and "Do not write code yet" in out


def test_stop_is_free_when_no_run_was_started(project):
    add_feature(project, plan=True, tasks=TWO_OF_THREE)
    assert stop(project)[0] == 0


@pytest.mark.parametrize("command", ["/speckit-implement", "/speckit.implement", "/speckit-guide-next"])
def test_implement_starts_a_run_and_stop_sends_the_agent_back(project, command):
    add_feature(project, plan=True, tasks=TWO_OF_THREE)
    prompt(project, command)
    code, _, err = stop(project)
    assert code == 2
    assert "2 of 3 tasks remain" in err and "T002 Add the model" in err


def test_side_question_mid_run_is_pinned_to_the_next_task(project):
    add_feature(project, plan=True, tasks=TWO_OF_THREE)
    prompt(project, "/speckit-implement")
    _, out, _ = prompt(project, "what does the model do?")
    assert "implementation run in progress" in out and "T002 Add the model" in out


def test_stop_nudges_only_once(project):
    add_feature(project, plan=True, tasks=TWO_OF_THREE)
    prompt(project, "/speckit-implement")
    assert stop(project, active=True)[0] == 0


def test_another_session_is_not_held(project):
    add_feature(project, plan=True, tasks=TWO_OF_THREE)
    prompt(project, "/speckit-implement", session="s1")
    assert stop(project, session="s2")[0] == 0


@pytest.mark.parametrize("how", ["prompt", "command"])
def test_pause_releases_the_run(project, how):
    add_feature(project, plan=True, tasks=TWO_OF_THREE)
    prompt(project, "/speckit-implement")
    if how == "prompt":
        prompt(project, "/speckit-guide-pause")
    else:
        assert run(project, "pause")[0] == 0
    assert stop(project)[0] == 0


def test_run_ends_when_every_task_is_checked(project):
    feature = add_feature(project, plan=True, tasks=TWO_OF_THREE)
    prompt(project, "/speckit-implement")
    (feature / "tasks.md").write_text(ALL_DONE)
    assert stop(project)[0] == 0
    assert status(project)["implementing"] is False


def test_keep_going_can_be_switched_off(project):
    add_feature(project, plan=True, tasks=TWO_OF_THREE)
    prompt(project, "/speckit-implement")
    code, _, _ = run(project, "event", env={"SPECKIT_GUIDE_KEEP_GOING": "false"}, payload={
        "hook_event_name": "Stop", "session_id": "s1", "stop_hook_active": False})
    assert code == 0


def test_run_state_is_kept_out_of_git(project):
    add_feature(project, plan=True, tasks=TWO_OF_THREE)
    prompt(project, "/speckit-implement")
    assert (project / ".specify" / "guide" / ".gitignore").read_text() == "*\n"


# ---- session start and event detection ------------------------------------

def test_session_start_reports_stage_and_persona(project):
    code, out, _ = run(project, "event", payload={"hook_event_name": "SessionStart"})
    assert code == 0
    assert "stage: constitution" in out and "Spec, a friendly dog" in out
    _, plain, _ = run(project, "event", payload={"hook_event_name": "SessionStart"},
                      env={"SPECKIT_GUIDE_PERSONA": "plain"})
    assert "friendly dog" not in plain


def test_event_kind_is_inferred_when_the_agent_does_not_name_it(project):
    code, _, _ = run(project, "event", payload={
        "tool_name": "Write", "tool_input": {"file_path": "src/app.py"}})
    assert code == 2


# ---- the manifest ----------------------------------------------------------

def test_manifest_command_files_exist():
    """Every command the manifest names has a file, and every event's
    command has a script to run (Spec Kit needs one for runtime events)."""
    import re
    root = SCRIPT.parents[2]
    manifest = (root / "extension.yml").read_text()
    files = re.findall(r'file: "(commands/[^"]+)"', manifest)
    assert len(files) == 4
    for name in files:
        assert (root / name).is_file(), name
    harness = (root / "commands" / "speckit.guide.harness.md").read_text()
    assert "py: scripts/python/guide.py event" in harness
    version = re.search(r'version: "(\d+\.\d+\.\d+)"', manifest)
    assert version, "community catalog needs a plain X.Y.Z version"
