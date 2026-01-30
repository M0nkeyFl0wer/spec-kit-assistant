"""
Interview Engine Module
Conducts progressive, conversational interviews with users
2-3 questions per section with smart defaults
"""

import json
from pathlib import Path
from typing import Dict, List, Optional
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, IntPrompt, Confirm

from here_spec.art.dog_art import display_section_header, display_art


class InterviewEngine:
    """Conducts progressive interviews with users"""

    def __init__(self, console: Console):
        self.console = console
        self.answers = {}

    def run(self, project_name: Optional[str] = None) -> Dict:
        """
        Run the full interview flow
        Returns: Dict with all interview answers
        """
        self.console.print("\n[bold]Let's figure out what we're building![/bold]\n")

        # Section 1: Big Picture (2 questions)
        self._section_big_picture(project_name)

        # Section 2: Audience & Platform (2-3 questions)
        self._section_audience_platform()

        # Section 3: Approach (2-3 questions)
        self._section_approach()

        # Summary and confirmation
        return self._confirm_and_finalize()

    def _section_big_picture(self, project_name: Optional[str]):
        """Section 1: Project basics (2 questions)"""
        display_section_header("big_picture")

        # Question 1: Project name
        if not project_name:
            project_name = Prompt.ask("What should we call this project?", default="my-project")
        self.answers["project_name"] = project_name

        # Question 2: Description
        self.answers["description"] = Prompt.ask(
            "In 1-2 sentences, what does this do?",
            default=f"A new {project_name} application",
        )

        # Smart default: Detect project type from description
        self.answers["project_type"] = self._detect_project_type(self.answers["description"])

        self.console.print(f"[dim]Detected: {self.answers['project_type']}[/dim]\n")

    def _section_audience_platform(self):
        """Section 2: Who and where (2-3 questions)"""
        display_section_header("audience")

        # Question 3: Target users
        self.console.print("[bold]Who's going to use this?[/bold]\n")
        user_options = [
            ("personal", "Just me", "Simple auth, minimal features"),
            ("team", "My team", "Collaboration features needed"),
            ("public", "Public/Customers", "Security, scalability required"),
        ]

        for i, (value, label, implication) in enumerate(user_options, 1):
            self.console.print(f"  {i}. {label} - [dim]{implication}[/dim]")

        choice = IntPrompt.ask("\nEnter choice", default=1)
        self.answers["target_users"] = (
            user_options[choice - 1][0] if 1 <= choice <= len(user_options) else "personal"
        )

        # Question 4: Platform
        self.console.print("\n[bold]What platforms?[/bold] (select all that apply)\n")
        platforms = []

        if Confirm.ask("  Desktop?", default=True):
            platforms.append("desktop")
        if Confirm.ask("  Mobile?", default=False):
            platforms.append("mobile")
        if Confirm.ask("  Tablet?", default=False):
            platforms.append("tablet")

        self.answers["platform"] = platforms if platforms else ["desktop"]

    def _section_approach(self):
        """Section 3: How to build (2-3 questions)"""
        display_section_header("approach")

        # Question 5: Quality level
        self.console.print("[bold]What's most important?[/bold]\n")
        quality_options = [
            ("prototype", "🚀 Get it working quickly", "Minimal tests, simple code"),
            ("production", "💎 Do it right from start", "Full tests, best practices"),
            ("learning", "📚 Learn as I go", "Documented, educational code"),
        ]

        for i, (value, label, implication) in enumerate(quality_options, 1):
            self.console.print(f"  {i}. {label}")
            self.console.print(f"     [dim]{implication}[/dim]\n")

        choice = IntPrompt.ask("Enter choice", default=2)
        self.answers["quality_level"] = (
            quality_options[choice - 1][0] if 1 <= choice <= len(quality_options) else "production"
        )

        # Question 6: Requirements
        self.console.print("\n[bold]Any specific requirements?[/bold] (y/n for each)\n")
        requirements = []

        if Confirm.ask("  Must work offline?", default=False):
            requirements.append("offline")
        if Confirm.ask("  Extra fast performance?", default=False):
            requirements.append("performance")
        if Confirm.ask("  Extra secure?", default=False):
            requirements.append("security")
        if Confirm.ask(
            "  Mobile responsive?", default="mobile" in self.answers.get("platform", [])
        ):
            requirements.append("mobile_responsive")

        self.answers["requirements"] = requirements

        # Question 7: Tech stack (optional)
        if Confirm.ask("\nDo you have preferred technologies?", default=False):
            self.answers["tech_stack"] = Prompt.ask("What technologies?", default="auto")
        else:
            self.answers["tech_stack"] = "auto"

    def _confirm_and_finalize(self) -> Dict:
        """Show summary and get confirmation"""
        display_art("happy", "Let's Review", "green")

        self.console.print("\n[bold]Here's what you told me:[/bold]\n")
        self.console.print(f"  • Project: [cyan]{self.answers['project_name']}[/cyan]")
        self.console.print(f"  • Description: {self.answers['description']}")
        self.console.print(f"  • Type: {self.answers['project_type']}")
        self.console.print(f"  • For: {self.answers['target_users']}")
        self.console.print(f"  • Platforms: {', '.join(self.answers['platform'])}")
        self.console.print(f"  • Quality: {self.answers['quality_level']}")
        if self.answers["requirements"]:
            self.console.print(f"  • Requirements: {', '.join(self.answers['requirements'])}")

        confirmed = Confirm.ask("\nDoes this look right?", default=True)

        if not confirmed:
            self.console.print(
                "[yellow]Let's adjust things. Which section should we redo?[/yellow]"
            )
            # For simplicity, just re-run the whole interview
            self.answers = {}
            return self.run(self.answers.get("project_name"))

        # Add metadata
        self.answers["interview_complete"] = True
        self.answers["_version"] = "1.0"

        return self.answers

    def _detect_project_type(self, description: str) -> str:
        """Smart default: Detect project type from description"""
        description_lower = description.lower()

        keywords = {
            "web_app": ["website", "web app", "web application", "browser", "frontend"],
            "mobile_app": ["mobile", "ios", "android", "app"],
            "cli_tool": ["cli", "command line", "terminal", "tool", "script"],
            "api": ["api", "backend", "server", "service"],
            "library": ["library", "package", "module", "sdk"],
        }

        scores = {}
        for project_type, words in keywords.items():
            score = sum(1 for word in words if word in description_lower)
            if score > 0:
                scores[project_type] = score

        if scores:
            return max(scores, key=scores.get)

        return "web_app"  # Default

    def save(self, project_path: Path):
        """Save interview to .speckit/interview.json"""
        speckit_dir = project_path / ".speckit"
        speckit_dir.mkdir(exist_ok=True)

        interview_file = speckit_dir / "interview.json"
        with open(interview_file, "w") as f:
            json.dump(self.answers, f, indent=2)

        self.console.print(f"[dim]Interview saved to {interview_file}[/dim]")
