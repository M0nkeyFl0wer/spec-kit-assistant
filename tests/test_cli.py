from pathlib import Path

from typer.testing import CliRunner

from here_spec.cli.main import app

runner = CliRunner()


def test_help_command_shows_commands():
    result = runner.invoke(app, ["--help"])
    assert result.exit_code == 0
    assert "here-spec" in result.stdout
    assert "continue" in result.stdout


def test_status_without_project(tmp_path):
    with runner.isolated_filesystem():
        result = runner.invoke(app, ["status"])
        assert result.exit_code == 0
        assert "No project found" in result.stdout


from pathlib import Path


def test_env_project_name_quick():
    with runner.isolated_filesystem():
        env = {"HERE_SPEC_PROJECT_NAME": "env-demo"}
        result = runner.invoke(app, ["init", "--quick", "--agent", "claude"], env=env)
        assert result.exit_code == 0
        assert Path("env-demo/.speckit/checkpoints.json").exists()


def test_env_noninteractive_autostart():
    with runner.isolated_filesystem():
        env = {
            "HERE_SPEC_PROJECT_NAME": "auto-project",
            "HERE_SPEC_AGENT": "claude",
            "HERE_SPEC_QUICK": "1",
        }
        result = runner.invoke(app, [], env=env)
        assert result.exit_code == 0
        assert Path("auto-project/.speckit/checkpoints.json").exists()
