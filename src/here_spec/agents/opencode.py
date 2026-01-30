"""
Opencode Launcher (Free Tier Support)
Launches Opencode with interview context
"""

import subprocess
import sys
from pathlib import Path
from typing import Dict
from rich.console import Console
from rich.prompt import Confirm

console = Console()


class OpencodeLauncher:
    """Launches Opencode with pre-loaded interview context"""

    def launch_for_step(self, context: Dict, project_path: Path):
        """Launch Opencode for a specific step"""
        step = context.get("step", "unknown")
        command = context.get("next_command", "/speckit.help")

        # Build step-specific context
        step_context = self._build_step_context(context)

        # Save context file
        context_file = project_path / ".speckit" / f"context-{step}.md"
        context_file.parent.mkdir(exist_ok=True)
        with open(context_file, "w") as f:
            f.write(step_context)

        console.print(f"[dim]Context saved to {context_file}[/dim]")

        # Generate agent command files
        self._generate_agent_files(context, project_path)

        # Check if we're in an interactive terminal
        if not sys.stdin.isatty():
            console.print(f"\n[bold yellow]⚠️  Non-interactive mode[/bold yellow]")
            console.print(f"[dim]To run this step manually:[/dim]")
            console.print(f"  cd {project_path.name}")
            console.print(f"  opencode")
            console.print(f"[dim]Then run: {command}[/dim]")
            return

        # Launch Opencode
        console.print(f"\n[bold green]🚀 Launching Opencode for {step}...[/bold green]\n")

        try:
            subprocess.run(
                ["opencode", "--prompt", str(context_file.absolute())],
                check=True,
                cwd=str(project_path),
            )
        except FileNotFoundError:
            console.print("[red]❌ Opencode not found![/red]")
            console.print("[yellow]Install: npm install -g opencode-ai[/yellow]")
            console.print("[yellow]Then: opencode auth login[/yellow]")
        except subprocess.CalledProcessError:
            console.print(f"\n[yellow]👋 Opencode session ended[/yellow]")

    def launch(self, context: Dict, project_path: Path):
        """Launch Opencode for the final build step"""
        # Build full context
        build_context = self._build_build_context(context)

        # Save context file
        context_file = project_path / ".speckit" / "launcher-context.md"
        context_file.parent.mkdir(exist_ok=True)
        with open(context_file, "w") as f:
            f.write(build_context)

        console.print(f"[dim]Context saved to {context_file}[/dim]")

        # Generate agent command files
        self._generate_agent_files(context, project_path)

        # Check if we're in an interactive terminal
        if not sys.stdin.isatty():
            console.print("\n[bold yellow]⚠️  Non-interactive mode detected[/bold yellow]")
            console.print("\n[bold green]✅ Ready to build![/bold green]")
            console.print(f"\nTo start building:")
            console.print(f"  1. cd {project_path.name}")
            console.print(f"  2. opencode")
            console.print(f"\nOpencode will use the context from:")
            console.print(f"  {context_file.absolute()}")
            return

        # Launch Opencode
        console.print("\n[bold green]🚀 Launching Opencode...[/bold green]\n")

        try:
            subprocess.run(
                ["opencode", "--prompt", str(context_file.absolute())],
                check=True,
                cwd=str(project_path),
            )
        except FileNotFoundError:
            console.print("[red]❌ Opencode not found![/red]")
            console.print("[yellow]Install: npm install -g opencode-ai[/yellow]")
            console.print("[yellow]Then: opencode auth login[/yellow]")
        except subprocess.CalledProcessError:
            console.print("\n[yellow]👋 Opencode session ended[/yellow]")
            console.print("[dim]Run 'here-spec continue' to resume[/dim]")

    def _build_step_context(self, context: Dict) -> str:
        """Build context for a specific step"""
        step = context.get("step", "unknown")
        command = context.get("next_command", "/speckit.help")
        answers = context.get("answers", {})

        lines = [
            f"# Step: {step.title()}",
            "",
            f"**Project**: {context.get('project_name', 'Unnamed')}",
            f"**Step**: {step}",
            f"**Command**: {command}",
            "",
            "## Context from Interview",
            f"**Description**: {answers.get('big_picture', 'N/A')}",
            f"**Audience**: {answers.get('audience', 'N/A')}",
            f"**Features**: {answers.get('features', 'N/A')}",
            f"**Quality**: {answers.get('quality_level', 'production')}",
            "",
            "## Your Task",
            f"Run: {command}",
            "",
            "Use the interview context above to inform your work.",
        ]

        return "\n".join(lines)

    def _build_build_context(self, context: Dict) -> str:
        """Build full context for the build step"""
        answers = context.get("answers", {})
        completed = context.get("completed_steps", [])

        lines = [
            "# Spec Kit Assistant - Build Context",
            "",
            f"**Project**: {context.get('project_name', 'Unnamed Project')}",
            f"**Completed Steps**: {', '.join(completed) if completed else 'None'}",
            "",
            "## Project Details",
            f"**Description**: {answers.get('big_picture', 'N/A')}",
            f"**Audience**: {answers.get('audience', 'N/A')}",
            f"**Features**: {answers.get('features', 'N/A')}",
            f"**Constraints**: {', '.join(answers.get('constraints', [])) or 'None'}",
            f"**Tech Stack**: {answers.get('tech_stack', 'auto')}",
            f"**Quality Level**: {answers.get('quality_level', 'production')}",
            "",
            "## Your Task",
            "Implement the project based on the specification and plan.",
            "Run: /speckit.implement",
            "",
            "All previous steps (constitution, spec, plan, tasks) should be complete.",
        ]

        return "\n".join(lines)

    def _generate_agent_files(self, context: Dict, project_path: Path):
        """Generate .opencode/commands/ files"""
        opencode_dir = project_path / ".opencode" / "commands"
        opencode_dir.mkdir(parents=True, exist_ok=True)

        command_file = opencode_dir / "interview-context.md"
        with open(command_file, "w") as f:
            f.write(f"""---
description: Show project context
---

# Project Context

Name: {context.get("project_name", "N/A")}
Step: {context.get("step", "N/A")}

Full context in .speckit/checkpoints.json
""")

        console.print(f"[dim]Created agent command: {command_file}[/dim]")
