"""
Startup context contract helpers.

This module creates and validates a machine-readable startup context so the
harness can reliably direct the agent to exactly one next command.
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, Tuple


def _now_utc() -> datetime:
    """Return timezone-aware UTC timestamp for deterministic serialization."""
    return datetime.now(timezone.utc)


def _payload_checksum(payload: Dict) -> str:
    """Create a stable checksum for contract integrity validation."""
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def write_startup_context(
    project_path: Path,
    current_step: str,
    next_command: str,
    state_version: int,
    ttl_minutes: int = 120,
) -> Tuple[Path, Dict]:
    """
    Write startup context JSON + markdown mirror.

    JSON is authoritative and consumed by automation.
    Markdown is human-readable for easy review.
    """
    speckit_dir = project_path / ".speckit"
    speckit_dir.mkdir(parents=True, exist_ok=True)

    issued_at = _now_utc()
    expires_at = issued_at + timedelta(minutes=ttl_minutes)

    payload = {
        "project_path": str(project_path.resolve()),
        "state_version": state_version,
        "current_step": current_step,
        "next_command": next_command,
        "issued_at": issued_at.isoformat(),
        "expires_at": expires_at.isoformat(),
    }
    payload["checksum"] = _payload_checksum(payload)

    json_path = speckit_dir / "startup-context.json"
    with open(json_path, "w") as handle:
        json.dump(payload, handle, indent=2)

    # Keep a lightweight markdown mirror for humans reviewing the harness state.
    md_path = speckit_dir / "startup-context.md"
    md_contents = [
        "# Startup Context",
        "",
        f"- current_step: `{current_step}`",
        f"- next_command: `{next_command}`",
        f"- issued_at: `{payload['issued_at']}`",
        f"- expires_at: `{payload['expires_at']}`",
        f"- checksum: `{payload['checksum']}`",
        "",
        "This file is informational. Use `startup-context.json` as source of truth.",
    ]
    md_path.write_text("\n".join(md_contents))

    return json_path, payload


def validate_startup_context(
    context_payload: Dict,
    expected_step: str,
    expected_command: str,
) -> bool:
    """Validate integrity, freshness, and routing alignment."""
    checksum = context_payload.get("checksum", "")
    payload_without_checksum = {
        key: value for key, value in context_payload.items() if key != "checksum"
    }

    if checksum != _payload_checksum(payload_without_checksum):
        return False

    # Reject expired context to prevent stale harness directives.
    try:
        expires_at = datetime.fromisoformat(str(context_payload["expires_at"]))
    except Exception:  # noqa: BLE001
        return False
    if _now_utc() > expires_at:
        return False

    if context_payload.get("current_step") != expected_step:
        return False
    if context_payload.get("next_command") != expected_command:
        return False

    return True


def consume_startup_context(project_path: Path) -> None:
    """Delete startup context artifacts after successful consumption."""
    for file_name in ("startup-context.json", "startup-context.md"):
        target = project_path / ".speckit" / file_name
        if target.exists():
            target.unlink()
