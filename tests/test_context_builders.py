from here_spec.agents.claude import ClaudeLauncher


def test_claude_step_context_includes_personality():
    launcher = ClaudeLauncher()
    context = {
        "project_name": "demo",
        "step": "spec",
        "next_command": "/speckit.specify",
        "answers": {
            "big_picture": "A photo app",
            "audience": "team",
            "features": "Albums",
            "quality_level": "production",
        },
        "completed_steps": ["constitution"],
    }

    text = launcher._build_step_context(context)
    assert "Spec, a friendly Golden Retriever" in text
    assert "/speckit.specify" in text
    assert "Great progress" in text or "Woof" in text


def test_claude_build_context_mentions_completed_steps():
    launcher = ClaudeLauncher()
    context = {
        "project_name": "demo",
        "step": "build",
        "next_command": "/speckit.implement",
        "answers": {
            "big_picture": "A photo app",
            "audience": "team",
            "features": "Albums",
            "quality_level": "production",
            "constraints": ["offline"],
            "tech_stack": "auto",
        },
        "completed_steps": ["constitution", "spec", "plan"],
    }

    text = launcher._build_build_context(context)
    assert "Spec Kit Assistant - Build Context" in text
    assert "constitution, spec, plan" in text
    assert "friendly Golden Retriever" in text

def test_claude_step_context_saved(monkeypatch, tmp_path):
    from here_spec.agents import claude as claude_module

    launcher = claude_module.ClaudeLauncher()
    context = {
        "project_name": "demo",
        "step": "spec",
        "next_command": "/speckit.specify",
        "answers": {
            "big_picture": "A photo app",
            "audience": "team",
            "features": "Albums",
            "quality_level": "production",
        },
        "completed_steps": ["constitution"],
    }

    monkeypatch.setattr(claude_module.sys.stdin, "isatty", lambda: False)
    launcher.launch_for_step(context, tmp_path)

    assert (tmp_path / ".speckit" / "context-spec.md").exists()
    assert (tmp_path / ".claude" / "commands" / "interview-context.md").exists()


def test_opencode_step_context_saved(monkeypatch, tmp_path):
    from here_spec.agents import opencode as opencode_module

    launcher = opencode_module.OpencodeLauncher()
    context = {
        "project_name": "demo",
        "step": "plan",
        "next_command": "/speckit.plan",
        "answers": {
            "big_picture": "A photo app",
            "audience": "team",
            "features": "Albums",
            "quality_level": "production",
        },
        "completed_steps": ["constitution", "spec"],
    }

    monkeypatch.setattr(opencode_module.sys.stdin, "isatty", lambda: False)
    launcher.launch_for_step(context, tmp_path)

    assert (tmp_path / ".speckit" / "context-plan.md").exists()
    assert (tmp_path / ".opencode" / "commands" / "interview-context.md").exists()

def test_claude_build_context_saved(monkeypatch, tmp_path):
    from here_spec.agents import claude as claude_module

    launcher = claude_module.ClaudeLauncher()
    context = {
        "project_name": "demo",
        "step": "build",
        "next_command": "/speckit.implement",
        "answers": {
            "big_picture": "A photo app",
            "audience": "team",
            "features": "Albums",
            "quality_level": "production",
            "constraints": ["offline"],
            "tech_stack": "auto",
        },
        "completed_steps": ["constitution", "spec", "plan"],
    }

    monkeypatch.setattr(claude_module.sys.stdin, "isatty", lambda: False)
    launcher.launch(context, tmp_path)

    assert (tmp_path / ".speckit" / "launcher-context.md").exists()
    assert (tmp_path / ".claude" / "commands" / "interview-context.md").exists()


def test_opencode_build_context_saved(monkeypatch, tmp_path):
    from here_spec.agents import opencode as opencode_module

    launcher = opencode_module.OpencodeLauncher()
    context = {
        "project_name": "demo",
        "step": "build",
        "next_command": "/speckit.implement",
        "answers": {
            "big_picture": "A photo app",
            "audience": "team",
            "features": "Albums",
            "quality_level": "production",
            "constraints": ["offline"],
            "tech_stack": "auto",
        },
        "completed_steps": ["constitution", "spec", "plan"],
    }

    monkeypatch.setattr(opencode_module.sys.stdin, "isatty", lambda: False)
    launcher.launch(context, tmp_path)

    assert (tmp_path / ".speckit" / "launcher-context.md").exists()
    assert (tmp_path / ".opencode" / "commands" / "interview-context.md").exists()
