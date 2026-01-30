"""
Claude Code Launcher
Launches Claude with interview context
"""

import subprocess
import sys
from pathlib import Path
from typing import Dict
from rich.console import Console

from here_spec.art.dog_art import get_spec_personality

console = Console()


class ClaudeLauncher:
    """Launches Claude Code with pre-loaded interview context"""

    def launch_for_step(self, context: Dict, project_path: Path):
        """Launch Claude for a specific step (constitution, spec, plan, tasks, validate)"""
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
            console.print(f"  claude")
            console.print(f"[dim]Then run: {command}[/dim]")
            return

        # Launch Claude
        console.print(f"\n[bold green]🚀 Launching Claude for {step}...[/bold green]\n")

        try:
            subprocess.run(
                ["claude", "--system-prompt", str(context_file.absolute())],
                check=True,
                cwd=str(project_path),
            )
        except FileNotFoundError:
            console.print("[red]❌ Claude Code not found![/red]")
            console.print("[yellow]Install: npm install -g @anthropic-ai/claude-code[/yellow]")
        except subprocess.CalledProcessError:
            console.print(f"\n[yellow]👋 Claude session ended[/yellow]")

    def launch(self, context: Dict, project_path: Path):
        """Launch Claude for the final build step"""
        # Build full context for build
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
            console.print(f"  2. claude")
            console.print(f"\nClaude will use the context from:")
            console.print(f"  {context_file.absolute()}")
            return

        # Launch Claude
        console.print("\n[bold green]🚀 Launching Claude Code...[/bold green]\n")

        try:
            subprocess.run(
                ["claude", "--system-prompt", str(context_file.absolute())],
                check=True,
                cwd=str(project_path),
            )
        except FileNotFoundError:
            console.print("[red]❌ Claude Code not found![/red]")
            console.print("[yellow]Install: npm install -g @anthropic-ai/claude-code[/yellow]")
        except subprocess.CalledProcessError:
            console.print("\n[yellow]👋 Claude session ended[/yellow]")
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
            "",
            "---",
            "",
            get_spec_personality(),
            "",
            "## Communication Style",
            "",
            "Throughout this process:",
            "- Show enthusiasm and encouragement! 🐕",
            "- Use small ASCII art like (◕‿◕)🐕 or 🐕💭 occasionally",
            "- Celebrate small wins and milestones",
            "- Keep the tone friendly and supportive",
            "- Make the user feel capable and supported",
            "",
            "Remember: You're Spec, their loyal development companion!",
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
            "",
            "---",
            "",
            get_spec_personality(),
            "",
            "## Implementation Notes",
            "",
            "This is the big moment! (◕‿◕)🐕",
            "",
            "As you implement:",
            "- Show progress updates with enthusiasm!",
            "- Use small ASCII art like (◕‿◕)🐕 or 🐕✨ for milestones",
            "- Celebrate when modules are completed",
            "- Encourage the user throughout the process",
            "- Make it feel like a collaborative journey",
            "",
            "The user has been guided through all the preparation steps",
            "and now trusts you to bring their vision to life!",
            "",
            "Let's build something amazing together! 🐕✨",
        ]

        return "\n".join(lines)

    def _generate_agent_files(self, context: Dict, project_path: Path):
        """Generate .claude/commands/ files"""
        claude_dir = project_path / ".claude" / "commands"
        claude_dir.mkdir(parents=True, exist_ok=True)

        command_file = claude_dir / "interview-context.md"
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
