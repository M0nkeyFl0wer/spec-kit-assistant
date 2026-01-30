#!/usr/bin/env python3
"""
here-spec - Spec Kit Assistant CLI
Progressive checkpoints throughout Spec-Driven Development workflow
"""

import os
import typer
from typer import Context
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Confirm, Prompt, IntPrompt
from pathlib import Path
import sys
import json
from typing import Optional, List

from here_spec.art.dog_art import (
    display_art,
    display_welcome,
    display_milestone,
)
from here_spec.core.system_detector import SystemDetector
from here_spec.checkpoint import CheckpointManager
from here_spec.agents.claude import ClaudeLauncher
from here_spec.agents.opencode import OpencodeLauncher

console = Console()
app = typer.Typer(
    name="here-spec",
    help="🐕 Spec Kit Assistant - Progressive checkpoints for Spec-Driven Development",
    add_completion=False,
)


@app.command()
def init(
    project_name: Optional[str] = typer.Argument(None, help="Name of your project (optional)"),
    agent: Optional[str] = typer.Option(
        None, "--agent", "-a", help="AI agent (claude or opencode)"
    ),
    free: bool = typer.Option(False, "--free", help="Use free tier (opencode)"),
    quick: bool = typer.Option(False, "--quick", help="Skip interviews, use defaults"),
):
    """
    Initialize a new project with progressive checkpoints
    Asks questions before: constitution → spec → plan → tasks → validate → build
    """
    display_welcome()

    env_project = os.environ.get("HERE_SPEC_PROJECT_NAME")
    if not project_name:
        project_name = env_project
    if not project_name:
        project_name = Prompt.ask(
            "🐕 What would you like to name your project?", default="my-project"
        )
    project_name = str(project_name)

    if not quick and _env_flag(os.environ.get("HERE_SPEC_QUICK")):
        quick = True
    if not free and _env_flag(os.environ.get("HERE_SPEC_FREE")):
        free = True

    env_agent = os.environ.get("HERE_SPEC_AGENT")
    if not agent and env_agent:
        env_agent = env_agent.strip().lower()
        if env_agent in ["claude", "opencode"]:
            agent = env_agent

    # Setup project directory
    project_path = Path.cwd() / project_name
    project_path.mkdir(exist_ok=True)

    console.print(f"\n[green]✅ Created project: {project_name}[/green]")
    console.print(f"[dim]Location: {project_path.absolute()}[/dim]\n")

    # System detection
    console.print("\n[dim]🔍 Checking your system...[/dim]")
    detector = SystemDetector()
    system_info = detector.detect()
    display_system_check(system_info)

    # Agent selection
    if not agent:
        agent = select_agent(system_info, free)

    auto_confirm_env = _env_flag(os.environ.get("HERE_SPEC_AUTO_CONFIRM"))

    # Initialize checkpoint manager
    checkpoints = CheckpointManager(console, project_path, auto_confirm=(auto_confirm_env or quick))

    # Check if this is a fresh init or continuing
    if checkpoints.state.get("current_step") != "init" and not checkpoints.state.get("answers"):
        console.print("[dim]Resuming existing project...[/dim]")
    else:
        # Fresh start - clear any old state
        console.print("[dim]Starting fresh project...[/dim]")
        checkpoints.state = {
            "project_name": "",
            "current_step": "init",
            "completed_steps": [],
            "answers": {},
        }

    # Save agent choice in checkpoints
    checkpoints.state["agent"] = agent
    checkpoints._save_state()

    if quick:
        # Quick mode: use defaults and skip to build
        _setup_quick_defaults(checkpoints, project_name)
        _run_build_step(agent, checkpoints, project_path)
    else:
        # Progressive mode: go through each checkpoint
        _run_progressive_flow(agent, checkpoints, project_path)


def _setup_quick_defaults(checkpoints: CheckpointManager, project_name: str):
    """Setup default values for quick mode"""
    checkpoints.state["project_name"] = project_name or "my-project"
    checkpoints.state["answers"] = {
        "big_picture": f"A {checkpoints.state['project_name']} application",
        "audience": "personal",
        "features": "Core functionality",
        "constraints": [],
        "tech_stack": "auto",
        "quality_level": "prototype",
    }
    checkpoints.state["current_step"] = "build"
    checkpoints.state["completed_steps"] = ["constitution", "spec", "plan", "tasks", "validate"]
    checkpoints._save_state()


def _run_progressive_flow(agent: str, checkpoints: CheckpointManager, project_path: Path):
    """Run through each checkpoint, asking questions before each step"""
    steps = ["constitution", "spec", "plan", "tasks", "validate", "build"]

    for step in steps:
        # Check if we should skip this step (already done or quick mode)
        if step in checkpoints.state.get("completed_steps", []):
            continue

        # Run the checkpoint interview for this step
        context = checkpoints.run_checkpoint(step)

        if context is None:
            # User chose to pause
            console.print(f"\n[yellow]⏸️  Paused at {step} step[/yellow]")
            console.print(f"\n[dim]Project: {project_path.name}[/dim]")
            console.print("\n[bold]To resume:[/bold]")
            console.print(f"  cd {project_path.name}")
            console.print("  here-spec continue")
            return

        if step == "build":
            # Final step - run the build
            _run_build_step(agent, checkpoints, project_path)
        else:
            # Launch agent for this step
            _run_step_agent(agent, context, project_path)

            # Ask if they want to continue
            if not Confirm.ask(f"\nContinue to next step?", default=True):
                console.print(f"\n[yellow]Paused after {step}[/yellow]")
                console.print(f"\n[dim]Project: {project_path.name}[/dim]")
                console.print("\n[bold]To resume:[/bold]")
                console.print(f"  cd {project_path.name}")
                console.print("  here-spec continue")
                return

    # All steps completed!
    console.print(f"\n[bold green]✅ All steps completed for {project_path.name}![/bold green]")
    console.print("\n[dim]Your project is ready at:[/dim]")
    console.print(f"  {project_path.absolute()}")


def _run_step_agent(agent: str, context: dict, project_path: Path):
    """Launch agent for a specific step (constitution, spec, plan, etc.)"""
    step = context["step"]
    command = context.get("next_command", "/speckit.help")

    console.print(f"\n[bold blue]🚀 Running {command}...[/bold blue]")

    if agent == "claude":
        launcher = ClaudeLauncher()
    elif agent == "opencode":
        launcher = OpencodeLauncher()
    else:
        console.print(f"[red]❌ Unknown agent: {agent}[/red]")
        return

    launcher.launch_for_step(context, project_path)


def _run_build_step(agent: str, checkpoints: CheckpointManager, project_path: Path):
    """Final build step"""
    context = checkpoints.run_checkpoint("build")

    if context is None:
        console.print("\n[yellow]⏸️  Build paused[/yellow]")
        console.print(f"\n[dim]Project: {project_path.name}[/dim]")
        console.print("\n[bold]To resume building:[/bold]")
        console.print(f"  cd {project_path.name}")
        console.print("  here-spec continue")
        return

    # Mark build as in progress
    checkpoints.state["current_step"] = "building"
    checkpoints._save_state()

    console.print("\n[bold green]🏗️  Starting Implementation[/bold green]\n")

    if agent == "claude":
        launcher = ClaudeLauncher()
    elif agent == "opencode":
        launcher = OpencodeLauncher()
    else:
        console.print(f"[red]❌ Unknown agent: {agent}[/red]")
        return

    launcher.launch(context, project_path)


@app.command()
def continue_project(
    path: str = typer.Argument(
        ".", help="Path to existing project (optional - auto-detects current directory)"
    ),
):
    """
    Continue from last checkpoint
    Resumes the progressive workflow where you left off

    If run without arguments, automatically detects if you're in a project directory.
    """
    project_path = Path(path).resolve()
    checkpoint_file = project_path / ".speckit" / "checkpoints.json"

    if not checkpoint_file.exists():
        if path == ".":
            selected_project = _choose_project_from_directory(Path.cwd())
            if not selected_project:
                raise typer.Exit(1)
            project_path = selected_project
            checkpoint_file = project_path / ".speckit" / "checkpoints.json"
        else:
            console.print(f"[red]❌ No project found at: {path}[/red]")
            console.print("\n[dim]To start a new project:[/dim]")
            console.print("  here-spec init [project-name]")
            raise typer.Exit(1)

    # Load checkpoint state
    auto_confirm_env = _env_flag(os.environ.get("HERE_SPEC_AUTO_CONFIRM"))
    checkpoints = CheckpointManager(console, project_path, auto_confirm=auto_confirm_env)

    # Get current progress
    progress = checkpoints.get_progress()

    display_art("happy", f"Resuming: {progress['project_name']}", "blue")
    console.print(f"Current step: {progress['current_step']}")
    console.print(f"Completed: {', '.join(progress['completed_steps']) or 'None'}")

    # Get agent from state
    agent = checkpoints.state.get("agent", "claude")

    # Continue from current step
    current_step = checkpoints.get_next_step()

    # Map the current step to resume properly
    if current_step == "building":
        console.print("\n[yellow]Build was in progress. Restarting build step...[/yellow]")
        _run_build_step(agent, checkpoints, project_path)
    elif current_step in ["constitution", "spec", "plan", "tasks", "validate", "build"]:
        # Run from current checkpoint
        context = checkpoints.run_checkpoint(current_step)
        if context is None:
            console.print(f"\n[yellow]⏸️  Paused at {current_step} step[/yellow]")
            console.print("[dim]Run 'here-spec continue' to resume[/dim]")
            return

        if current_step == "build":
            _run_build_step(agent, checkpoints, project_path)
        else:
            _run_step_agent(agent, context, project_path)

            # Ask if they want to continue to next steps
            if Confirm.ask(f"\nContinue with remaining steps?", default=True):
                _run_progressive_flow(agent, checkpoints, project_path)
    else:
        # Unknown state, run full flow
        _run_progressive_flow(agent, checkpoints, project_path)


@app.command()
def step(
    name: str = typer.Argument(
        ..., help="Step name (constitution, spec, plan, tasks, validate, build)"
    ),
    path: str = typer.Option(".", "--path", help="Project path"),
    agent: str = typer.Option(None, "--agent", help="AI agent to use"),
):
    """
    Run a specific checkpoint step directly
    Useful for jumping to a specific part of the workflow
    """
    project_path = Path(path).resolve()
    auto_confirm_env = _env_flag(os.environ.get("HERE_SPEC_AUTO_CONFIRM"))
    checkpoints = CheckpointManager(console, project_path, auto_confirm=auto_confirm_env)

    # Set agent if provided
    if agent:
        checkpoints.state["agent"] = agent
        checkpoints._save_state()

    valid_steps = ["constitution", "spec", "plan", "tasks", "validate", "build"]
    if name not in valid_steps:
        console.print(f"[red]❌ Unknown step: {name}[/red]")
        console.print(f"Valid steps: {', '.join(valid_steps)}")
        raise typer.Exit(1)

    context = checkpoints.run_checkpoint(name)
    if context:
        console.print(f"\n[green]✅ Step '{name}' interview complete![/green]")
        console.print(f"Next: Run 'here-spec continue' or manually run the spec kit command")


@app.command()
def check():
    """Check system requirements and installed agents"""
    display_art("detective", "System Check", "blue")

    detector = SystemDetector()
    info = detector.detect()
    display_full_system_check(info)


@app.command()
def status(
    path: str = typer.Argument(".", help="Project path"),
):
    """Show project status and progress through checkpoints"""
    project_path = Path(path).resolve()
    checkpoint_file = project_path / ".speckit" / "checkpoints.json"

    if not checkpoint_file.exists():
        console.print("[yellow]⚠️  No project found[/yellow]")
        return

    checkpoints = CheckpointManager(console, project_path)
    progress = checkpoints.get_progress()

    display_art("working", f"Project: {progress['project_name']}", "blue")

    steps = ["constitution", "spec", "plan", "tasks", "validate", "build"]
    completed = progress.get("completed_steps", [])
    current = progress.get("current_step", "constitution")

    console.print("\n[bold]Progress:[/bold]")
    for step in steps:
        if step in completed:
            console.print(f"  ✅ {step}")
        elif step == current:
            console.print(f"  ⏳ {step} (current)")
        else:
            console.print(f"  ⬜ {step}")

    agent = checkpoints.state.get("agent", "not set")
    console.print(f"\n[dim]Agent: {agent}[/dim]")


@app.command()
def config(
    show: bool = typer.Option(False, "--show", help="Show current configuration"),
    reset: bool = typer.Option(False, "--reset", help="Reset to defaults"),
):
    """Configure here-spec preferences"""
    display_art("thinking", "Configuration", "blue")

    config_path = Path.home() / ".config" / "here-spec" / "config.json"

    if show:
        if config_path.exists():
            with open(config_path) as f:
                console.print_json(data=json.load(f))
        else:
            console.print("[dim]No configuration found. Using defaults.[/dim]")
    elif reset:
        if config_path.exists():
            config_path.unlink()
        console.print("[green]✅ Configuration reset[/green]")
    else:
        interactive_config()


def display_system_check(info: dict):
    """Display system check results"""
    checks = []

    if info.get("git"):
        checks.append("[green]✅[/green] Git detected")
    else:
        checks.append("[red]❌[/red] Git not found")

    if info.get("python"):
        checks.append(f"[green]✅[/green] Python {info['python_version']}")
    else:
        checks.append("[red]❌[/red] Python not found")

    agents_found = [a for a, installed in info.get("agents", {}).items() if installed]
    if agents_found:
        checks.append(f"[green]✅[/green] AI agents: {', '.join(agents_found)}")
    else:
        checks.append("[yellow]⚠️[/yellow] No AI agents found")

    console.print(Panel("\n".join(checks), title="System Check", border_style="blue"))


def select_agent(system_info: dict, free: bool) -> str:
    """Select AI agent - only Claude and Opencode supported"""
    agents = system_info.get("agents", {})

    if free:
        if not agents.get("opencode"):
            console.print("\n[yellow]🆓 Free tier: Opencode[/yellow]")
            console.print("[dim]Install with: npm install -g opencode-ai[/dim]")
            console.print("[dim]Then: opencode auth login[/dim]\n")
        return "opencode"

    if agents.get("claude"):
        console.print("\n[green]✅ Using Claude Code[/green]")
        return "claude"

    if agents.get("opencode"):
        console.print("\n[green]✅ Using Opencode[/green]")
        return "opencode"

    # Ask user to choose
    console.print("\n[bold]🤖 Choose your AI assistant:[/bold]\n")
    console.print("  1. Claude Code (recommended - $20/month after trial)")
    console.print("  2. Opencode (FREE tier available)\n")

    choice = console.input("Enter choice (1 or 2): ")
    return "opencode" if choice == "2" else "claude"


def display_full_system_check(info: dict):
    """Display detailed system check"""
    os_info = f"[bold]OS:[/bold] {info.get('os', 'Unknown')}"
    python_info = f"[bold]Python:[/bold] {info.get('python_version', 'Not found')}"

    agents_info = "[bold]AI Agents:[/bold]\n"
    for agent, installed in info.get("agents", {}).items():
        status = "✅" if installed else "❌"
        agents_info += f"  {status} {agent}\n"

    console.print(
        Panel(
            f"{os_info}\n\n{python_info}\n\n{agents_info}",
            title="System Information",
            border_style="blue",
        )
    )


def interactive_config():
    """Interactive configuration - fully implemented"""
    config_path = Path.home() / ".config" / "here-spec" / "config.json"
    config_path.parent.mkdir(parents=True, exist_ok=True)

    # Load existing or defaults
    if config_path.exists():
        with open(config_path) as f:
            config = json.load(f)
    else:
        config = {
            "celebrations_enabled": True,
            "default_agent": "claude",
            "default_quality": "production",
        }

    while True:
        console.print("\n[bold]⚙️  Configuration Menu[/bold]\n")
        console.print(
            f"  1. Celebrations: {'✅ On' if config['celebrations_enabled'] else '❌ Off'}"
        )
        console.print(f"  2. Default agent: {config['default_agent']}")
        console.print(f"  3. Default quality: {config['default_quality']}")
        console.print("  4. View full config")
        console.print("  5. Save and exit")
        console.print("  6. Exit without saving\n")

        choice = console.input("Select option (1-6): ")

        if choice == "1":
            config["celebrations_enabled"] = not config["celebrations_enabled"]
        elif choice == "2":
            agent = console.input("Default agent (claude/opencode): ").lower()
            if agent in ["claude", "opencode"]:
                config["default_agent"] = agent
        elif choice == "3":
            quality = console.input("Default quality (prototype/production): ").lower()
            if quality in ["prototype", "production"]:
                config["default_quality"] = quality
        elif choice == "4":
            console.print_json(data=config)
        elif choice == "5":
            with open(config_path, "w") as f:
                json.dump(config, f, indent=2)
            console.print("[green]✅ Configuration saved![/green]")
            break
        elif choice == "6":
            break


def _discover_projects(base_path: Path) -> List[Path]:
    projects: List[Path] = []
    for item in sorted(base_path.iterdir()):
        checkpoint = item / ".speckit" / "checkpoints.json"
        if item.is_dir() and checkpoint.exists():
            projects.append(item)
    return projects


def _choose_project_from_directory(base_path: Path) -> Optional[Path]:
    projects = _discover_projects(base_path)
    if not projects:
        console.print("[red]❌ No projects found in this directory.[/red]")
        console.print("\n[dim]To start a new project:[/dim]")
        console.print("  here-spec init [project-name]")
        return None

    if len(projects) == 1:
        console.print(f"[dim]Found project: {projects[0].name}[/dim]")
        console.print("[dim]Resuming automatically...[/dim]")
        return projects[0]

    console.print("\n[bold]Select a project to continue:[/bold]")
    for idx, project in enumerate(projects, 1):
        console.print(f"  {idx}. {project.name}")

    selection = IntPrompt.ask("Enter number", default=1, show_default=True)

    try:
        return projects[selection - 1]
    except IndexError:
        console.print("[red]Invalid selection.[/red]")
        return None


def _env_flag(value: Optional[str]) -> bool:
    if value is None:
        return False
    return value.strip().lower() in {"1", "true", "yes", "on"}


@app.callback(invoke_without_command=True)
def main_callback(ctx: Context):
    """
    Spec Kit Assistant - Just run 'here-spec' and go!

    Automatically detects what to do:
    - In a project directory? Continue where you left off
    - Not in a project? Start creating a new one
    """
    if ctx.invoked_subcommand is not None:
        return

    # No command specified - be smart about it
    checkpoint_file = Path.cwd() / ".speckit" / "checkpoints.json"

    if checkpoint_file.exists():
        console.print("[dim]🐕 Detected project in current directory![/dim]")
        ctx.invoke(continue_project, path=".")
    else:
        console.print("[dim]🐕 Starting new project...[/dim]\n")
        ctx.invoke(init, project_name=None, agent=None, free=False, quick=False)


def main():
    """Entry point"""
    app()


if __name__ == "__main__":
    main()
