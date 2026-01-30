from rich.console import Console

from here_spec.checkpoint import CheckpointManager


def test_checkpoint_initial_state(tmp_path):
    cm = CheckpointManager(Console(), tmp_path)
    assert cm.get_next_step() in ("init", "constitution")
    progress = cm.get_progress()
    assert progress["project_name"] == ""
    assert progress["completed_steps"] == []
    assert cm.state["version"] == 1


def test_checkpoint_persists_state(tmp_path):
    cm = CheckpointManager(Console(), tmp_path)
    cm.state["project_name"] = "demo"
    cm.state["current_step"] = "plan"
    cm.state["completed_steps"].append("spec")
    cm.state["agent"] = "opencode"
    cm._save_state()

    cm2 = CheckpointManager(Console(), tmp_path)
    assert cm2.get_next_step() == "plan"
    progress = cm2.get_progress()
    assert progress["project_name"] == "demo"
    assert "spec" in progress["completed_steps"]
    assert cm2.state["agent"] == "opencode"


def test_checkpoint_invalid_json_resets_state(tmp_path):
    state_file = tmp_path / ".speckit" / "checkpoints.json"
    state_file.parent.mkdir(parents=True, exist_ok=True)
    state_file.write_text("not-json")

    cm = CheckpointManager(Console(), tmp_path)
    assert cm.get_next_step() in ("init", "constitution")
    assert cm.state["project_name"] == ""


def test_checkpoint_version_mismatch(tmp_path):
    state_file = tmp_path / ".speckit" / "checkpoints.json"
    state_file.parent.mkdir(parents=True, exist_ok=True)
    state_file.write_text('{"version": 999, "project_name": "old"}')

    cm = CheckpointManager(Console(), tmp_path)
    assert cm.state["project_name"] == ""
