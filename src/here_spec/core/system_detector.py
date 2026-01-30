"""
System Detector Module
Detects OS, installed tools, and AI agents
"""

import platform
import shutil
import subprocess
from pathlib import Path
from typing import Dict, List


class SystemDetector:
    """Detects system configuration and available tools"""

    def detect(self) -> Dict:
        """Run full system detection"""
        return {
            "os": self._detect_os(),
            "git": self._check_git(),
            "python": self._check_python(),
            "python_version": self._get_python_version(),
            "node": self._check_node(),
            "agents": self._detect_agents(),
            "package_managers": self._detect_package_managers(),
        }

    def _detect_os(self) -> str:
        """Detect operating system"""
        system = platform.system()
        if system == "Darwin":
            return "macOS"
        elif system == "Linux":
            # Check for WSL
            if "microsoft" in platform.release().lower():
                return "Linux (WSL)"
            return "Linux"
        elif system == "Windows":
            return "Windows"
        return system

    def _check_git(self) -> bool:
        """Check if git is installed"""
        return shutil.which("git") is not None

    def _check_python(self) -> bool:
        """Check if python3 is installed"""
        return shutil.which("python3") is not None

    def _get_python_version(self) -> str:
        """Get Python version"""
        try:
            result = subprocess.run(["python3", "--version"], capture_output=True, text=True)
            return result.stdout.strip() or result.stderr.strip()
        except:
            return "Unknown"

    def _check_node(self) -> bool:
        """Check if Node.js is installed"""
        return shutil.which("node") is not None

    def _detect_agents(self) -> Dict[str, bool]:
        """Detect installed AI agents - only Claude and Opencode are supported"""
        agents = {
            "claude": False,
            "opencode": False,
        }

        # Check for each supported agent
        agents["claude"] = shutil.which("claude") is not None
        agents["opencode"] = shutil.which("opencode") is not None

        return agents

    def _detect_package_managers(self) -> List[str]:
        """Detect available package managers"""
        managers = []

        if shutil.which("pip3"):
            managers.append("pip3")
        if shutil.which("npm"):
            managers.append("npm")
        if shutil.which("brew"):
            managers.append("brew")
        if shutil.which("apt"):
            managers.append("apt")

        return managers

    def check_agent_installation(self, agent: str) -> bool:
        """Check if a specific agent is installed"""
        agents = self._detect_agents()
        return agents.get(agent, False)

    def get_recommended_agent(self) -> str:
        """Get recommended agent based on availability"""
        agents = self._detect_agents()

        # Priority order: Claude first, then Opencode
        if agents.get("claude"):
            return "claude"
        if agents.get("opencode"):
            return "opencode"

        return ""
