from rich.console import Console

from here_spec.checkpoint import CheckpointManager, get_command_for_step


def test_checkpoint_allows_valid_transition_sequence(tmp_path):
    """Harness should allow canonical progression through all stages."""
    manager = CheckpointManager(Console(), tmp_path)

    manager.transition_to("constitution")
    manager.transition_to("spec")
    manager.transition_to("plan")
    manager.transition_to("tasks")
    manager.transition_to("validate")
    manager.transition_to("build")
    manager.transition_to("building")
    manager.transition_to("completed")

    assert manager.state["current_step"] == "completed"


def test_checkpoint_blocks_invalid_transition(tmp_path):
    """Harness should block skipping directly from init to tasks."""
    manager = CheckpointManager(Console(), tmp_path)

    try:
        manager.transition_to("tasks")
        raised = False
    except ValueError:
        raised = True

    assert raised is True
    assert manager.state["current_step"] == "init"


def test_step_command_map_is_canonical():
    """Each stage should map to one deterministic command."""
    assert get_command_for_step("constitution") == "/speckit.constitution"
    assert get_command_for_step("plan") == "/speckit.plan"
    assert get_command_for_step("build") == "/speckit.implement"
