"""
Checkpoint Manager - Progressive Questions Before Each Spec Kit Step
Handles interview moments throughout the workflow, not just at the start
"""

import json
from pathlib import Path
from typing import Dict, Optional, List
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, IntPrompt, Confirm

from here_spec.art.dog_art import display_art, display_micro_art, display_inline_tip

STATE_VERSION = 1


class CheckpointManager:
    """
    Manages progressive checkpoints throughout spec kit workflow.
    Each step has its own mini-interview before the AI agent runs.
    """

    def __init__(self, console: Console, project_path: Path, auto_confirm: bool = False):
        self.console = console
        self.project_path = project_path
        self.auto_confirm = auto_confirm
        self.state_file = project_path / ".speckit" / "checkpoints.json"
        self.state = self._load_state()

    def _load_state(self) -> Dict:
        """Load checkpoint state with versioning + validation"""
        default_state = self._default_state()
        if not self.state_file.exists():
            return default_state

        try:
            with open(self.state_file) as f:
                data = json.load(f)
        except Exception as exc:  # noqa: BLE001
            self.console.print(
                f"[yellow]⚠️  Could not read checkpoint file ({exc}). Resetting state.[/yellow]"
            )
            return default_state

        if data.get("version") != STATE_VERSION:
            self.console.print(
                "[yellow]⚠️  Checkpoint format changed. Resetting state (old version detected).[/yellow]"
            )
            return default_state

        state = self._default_state()
        state["project_name"] = data.get("project_name", "")
        state["current_step"] = data.get("current_step", "init")
        state["completed_steps"] = data.get("completed_steps") or []
        state["answers"] = data.get("answers") or {}
        state["agent"] = data.get("agent", "claude")
        return state

    def _save_state(self):
        """Save checkpoint state"""
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        self.state["version"] = STATE_VERSION
        with open(self.state_file, "w") as f:
            json.dump(self.state, f, indent=2)

    def _default_state(self) -> Dict:
        return {
            "version": STATE_VERSION,
            "project_name": "",
            "current_step": "init",
            "completed_steps": [],
            "answers": {},
            "agent": "claude",
        }

    def run_checkpoint(self, step: str) -> Optional[Dict]:
        """
        Run the interview for a specific step.
        Returns context dict if ready to proceed, None if user wants to pause.
        """
        if step == "constitution":
            return self._checkpoint_constitution()
        elif step == "spec":
            return self._checkpoint_spec()
        elif step == "plan":
            return self._checkpoint_plan()
        elif step == "tasks":
            return self._checkpoint_tasks()
        elif step == "validate":
            return self._checkpoint_validate()
        elif step == "build":
            return self._checkpoint_build()
        return None

    def _checkpoint_constitution(self) -> Optional[Dict]:
        """Step 1: Questions before creating constitution"""
        display_art("thinking", "Step 1: Project Foundation", "blue")

        self.console.print("\n[bold]Let's establish your project's foundation![/bold]\n")

        # Q1: Project name (if not set)
        if not self.state["project_name"]:
            self.state["project_name"] = Prompt.ask(
                "What should we call this project?", default="my-project"
            )
            display_micro_art(f"Great name! {self.state['project_name']} sounds awesome!")

        # Q2: Big picture - what are we building
        if "big_picture" not in self.state["answers"]:
            self.state["answers"]["big_picture"] = Prompt.ask(
                "In 1-2 sentences, what does this do?",
                default=f"A {self.state['project_name']} application",
            )

        # Q3: Who is this for
        if "audience" not in self.state["answers"]:
            self.console.print("\n[bold]Who will use this?[/bold]")
            options = [
                ("personal", "Just me"),
                ("team", "My team"),
                ("public", "Public/Customers"),
            ]
            for i, (value, label) in enumerate(options, 1):
                self.console.print(f"  {i}. {label}")
            choice = IntPrompt.ask("Select", default=1)
            self.state["answers"]["audience"] = (
                options[choice - 1][0] if 1 <= choice <= len(options) else "personal"
            )

        # Confirm and proceed
        self.console.print(
            f"\n[dim]Ready to create constitution for: {self.state['project_name']}[/dim]"
        )
        if self._confirm("Create constitution now?", default=True):
            self.state["current_step"] = "spec"  # Next step
            self._save_state()
            return self._build_context("constitution")

        self._save_state()
        return None  # User wants to pause

    def _checkpoint_spec(self) -> Optional[Dict]:
        """Step 2: Questions before creating spec"""
        display_art("listening", "Step 2: Requirements", "blue")

        self.console.print("\n[bold]Let's define what we're building![/bold]\n")

        # Q4: Core features
        if "features" not in self.state["answers"]:
            self.state["answers"]["features"] = Prompt.ask(
                "What are the 2-3 most important features?",
                default="Core functionality, user interface, data management",
            )
            display_inline_tip("Great features! This is going to be awesome!")

        # Q5: Constraints/requirements
        if "constraints" not in self.state["answers"]:
            self.console.print("\n[bold]Any specific requirements?[/bold]")
            constraints = []
            if self._confirm("Must work offline?", default=False):
                constraints.append("offline")
            if self._confirm("Mobile/tablet support needed?", default=False):
                constraints.append("mobile")
            if self._confirm("Extra security?", default=False):
                constraints.append("security")
            if self._confirm("High performance?", default=False):
                constraints.append("performance")
            self.state["answers"]["constraints"] = constraints
            if constraints:
                display_micro_art(f"Good thinking! {len(constraints)} requirements noted!")

        self.console.print("\n[dim]Ready to create specification[/dim]")
        if self._confirm("Create spec now?", default=True):
            self.state["current_step"] = "plan"
            self._mark_complete("constitution")
            self._save_state()
            return self._build_context("spec")

        self._save_state()
        return None

    def _checkpoint_plan(self) -> Optional[Dict]:
        """Step 3: Questions before creating plan"""
        display_art("builder", "Step 3: Technical Approach", "blue")

        self.console.print("\n[bold]How should we build this?[/bold]\n")

        # Q6: Tech stack preference
        if "tech_stack" not in self.state["answers"]:
            if self._confirm("Do you have preferred technologies?", default=False):
                self.state["answers"]["tech_stack"] = Prompt.ask(
                    "What technologies?", default="auto"
                )
            else:
                self.state["answers"]["tech_stack"] = "auto"

        # Q7: Quality level
        if "quality_level" not in self.state["answers"]:
            self.console.print("\n[bold]What's the quality approach?[/bold]")
            options = [
                ("prototype", "🚀 Quick prototype - get it working fast"),
                ("production", "💎 Production-quality - do it right"),
            ]
            for i, (value, label) in enumerate(options, 1):
                self.console.print(f"  {i}. {label}")
            choice = IntPrompt.ask("Select", default=2)
            self.state["answers"]["quality_level"] = (
                options[choice - 1][0] if 1 <= choice <= len(options) else "production"
            )
            quality_msg = (
                "prototype"
                if self.state["answers"]["quality_level"] == "prototype"
                else "production"
            )
            display_micro_art(f"{quality_msg} approach - perfect choice!")

        self.console.print("\n[dim]Ready to create implementation plan[/dim]")
        if Confirm.ask("Create plan now?", default=True):
            self.state["current_step"] = "tasks"
            self._mark_complete("spec")
            self._save_state()
            return self._build_context("plan")

        self._save_state()
        return None

    def _checkpoint_tasks(self) -> Optional[Dict]:
        """Step 4: Questions before creating task list"""
        display_art("working", "Step 4: Task Breakdown", "blue")

        self.console.print("\n[bold]Let's break this into actionable tasks![/bold]\n")

        # Confirm we're ready
        self.console.print(
            f"Based on your [bold]{self.state['answers'].get('quality_level', 'production')}[/bold] approach,"
        )
        self.console.print("I'll create a detailed task breakdown.")

        if self._confirm("\nReady to generate tasks?", default=True):
            self.state["current_step"] = "validate"
            self._mark_complete("plan")
            self._save_state()
            return self._build_context("tasks")

        self._save_state()
        return None

    def _checkpoint_validate(self) -> Optional[Dict]:
        """Step 5: Questions before validation"""
        display_art("detective", "Step 5: Validation", "blue")

        self.console.print("\n[bold]Let's validate everything is ready![/bold]\n")

        self.console.print("I'll verify:")
        self.console.print("  ✅ Constitution is complete")
        self.console.print("  ✅ Specification covers all requirements")
        self.console.print("  ✅ Implementation plan is solid")
        self.console.print("  ✅ Task list is actionable")

        if self._confirm("\nReady to validate?", default=True):
            self.state["current_step"] = "build"
            self._mark_complete("tasks")
            self._save_state()
            return self._build_context("validate")

        self._save_state()
        return None

    def _checkpoint_build(self) -> Optional[Dict]:
        """Step 6: Final confirmation before build"""
        display_art("celebrating", "Step 6: Ready to Build!", "green")

        self.console.print("\n[bold green]Everything is ready![/bold green]\n")

        # Show summary
        self.console.print("[bold]Summary:[/bold]")
        self.console.print(f"  Project: {self.state['project_name']}")
        self.console.print(f"  Description: {self.state['answers'].get('big_picture', 'N/A')}")
        self.console.print(f"  Quality: {self.state['answers'].get('quality_level', 'production')}")
        completed = len(self.state["completed_steps"])
        self.console.print(f"  Steps completed: {completed}/5")

        self.console.print(
            "\n[yellow]⚠️  The AI will now implement everything. This may take several minutes.[/yellow]"
        )

        if self._confirm("\nReady to start building?", default=True):
            self._mark_complete("validate")
            self._save_state()
            return self._build_context("build")

        self._save_state()
        return None

    def _mark_complete(self, step: str):
        """Mark a step as completed"""
        if step not in self.state["completed_steps"]:
            self.state["completed_steps"].append(step)

    def _build_context(self, step: str) -> Dict:
        """Build context for AI agent at this step"""
        return {
            "project_name": self.state["project_name"],
            "step": step,
            "answers": self.state["answers"],
            "completed_steps": self.state["completed_steps"],
            "next_command": self._get_command(step),
        }

    def _get_command(self, step: str) -> str:
        """Get the spec kit command for this step"""
        commands = {
            "constitution": "/speckit.constitution",
            "spec": "/speckit.specify",
            "plan": "/speckit.plan",
            "tasks": "/speckit.tasks",
            "validate": "/speckit.checklist",
            "build": "/speckit.implement",
        }
        return commands.get(step, "/speckit.help")

    def _confirm(self, message: str, default: bool = True) -> bool:
        if self.auto_confirm:
            return True
        return Confirm.ask(message, default=default)

    def get_next_step(self) -> str:
        """Get the next step that needs to be done"""
        return self.state.get("current_step", "constitution")

    def get_progress(self) -> Dict:
        """Get current progress for status display"""
        return {
            "project_name": self.state["project_name"],
            "current_step": self.state["current_step"],
            "completed_steps": self.state["completed_steps"],
            "answers": self.state["answers"],
        }
