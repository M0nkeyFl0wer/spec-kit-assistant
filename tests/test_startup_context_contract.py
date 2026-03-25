import json

from here_spec.core.startup_context import (
    consume_startup_context,
    validate_startup_context,
    write_startup_context,
)


def test_startup_context_round_trip(tmp_path):
    """Valid startup context should pass contract validation."""
    context_file, payload = write_startup_context(
        project_path=tmp_path,
        current_step="plan",
        next_command="/speckit.plan",
        state_version=1,
    )

    assert context_file.exists()
    assert validate_startup_context(payload, expected_step="plan", expected_command="/speckit.plan")


def test_startup_context_detects_tampering(tmp_path):
    """Checksum validation should fail when payload fields are altered."""
    context_file, payload = write_startup_context(
        project_path=tmp_path,
        current_step="spec",
        next_command="/speckit.specify",
        state_version=1,
    )

    with open(context_file) as handle:
        disk_payload = json.load(handle)

    disk_payload["next_command"] = "/speckit.tasks"

    assert (
        validate_startup_context(
            disk_payload,
            expected_step="spec",
            expected_command="/speckit.specify",
        )
        is False
    )


def test_startup_context_is_consumed(tmp_path):
    """Consumption should remove both JSON and markdown artifacts."""
    write_startup_context(
        project_path=tmp_path,
        current_step="tasks",
        next_command="/speckit.tasks",
        state_version=1,
    )

    consume_startup_context(tmp_path)

    assert (tmp_path / ".speckit" / "startup-context.json").exists() is False
    assert (tmp_path / ".speckit" / "startup-context.md").exists() is False
