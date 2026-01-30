import os
from pathlib import Path

from typer.testing import CliRunner

from here_spec.cli.main import app

runner = CliRunner()


def test_quick_init_and_continue_flow():
    with runner.isolated_filesystem():
        env = {
            "HERE_SPEC_PROJECT_NAME": "flow-demo",
            "HERE_SPEC_AGENT": "claude",
            "HERE_SPEC_QUICK": "1",
            "HERE_SPEC_AUTO_CONFIRM": "1",
        }
        result = runner.invoke(app, [], env=env)
        assert result.exit_code == 0
        assert Path("flow-demo/.speckit/checkpoints.json").exists()

        os.chdir("flow-demo")
        result2 = runner.invoke(app, [], env={"HERE_SPEC_AUTO_CONFIRM": "1"})
        assert result2.exit_code == 0
        assert "Detected project" in result2.stdout
