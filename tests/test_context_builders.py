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
