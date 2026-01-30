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
