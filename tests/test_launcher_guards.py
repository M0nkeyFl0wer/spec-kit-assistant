from here_spec.agents.claude import ClaudeLauncher
from here_spec.agents.opencode import OpencodeLauncher


def test_claude_launcher_rejects_mismatched_step_command():
    """Claude launcher should reject invalid harness routing."""
    launcher = ClaudeLauncher()
    assert launcher._validate_context_contract("plan", "/speckit.tasks") is False


def test_opencode_launcher_rejects_mismatched_step_command():
    """Opencode launcher should reject invalid harness routing."""
    launcher = OpencodeLauncher()
    assert launcher._validate_context_contract("validate", "/speckit.specify") is False


def test_launchers_accept_valid_step_command_contracts():
    """Both launchers should accept canonical mappings."""
    claude = ClaudeLauncher()
    opencode = OpencodeLauncher()

    assert claude._validate_context_contract("spec", "/speckit.specify") is True
    assert opencode._validate_context_contract("tasks", "/speckit.tasks") is True
