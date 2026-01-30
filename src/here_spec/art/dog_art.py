"""
Dog ASCII Art Display Module
Renders ASCII art for Spec Kit Assistant with proper colors
Based on the original working LOGO.txt design
"""

from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.align import Align

console = Console()

# The original working SPEC logo with dog positioned on the right side
SPEC_LOGO = """[bright_cyan]
                                                              ░░                          ⠀                               
                                         ██████          ██████                                                          
                                       ██▓▓▓▓▓▓██████████▓▓▓▓▓▓██                                                        
                                       ██▓▓▓▓██          ██▓▓▓▓██                                                        
                                     ⠀██▓▓████    ▓▓▓▓▓▓████▓▓██    ⠀  ⠀⠀  ⠀⠀                                           
   ███████╗██████╗ ███████╗ ██████╗─ ⠀⠀⠀██  ██  ██▓▓██▓▓██  ██                                                        
   ██╔════╝██╔══██╗██╔════╝██╔════╝         ██    ▓▓▓▓▓▓██                                                             
   ███████╗██████╔╝█████╗  ██║            ██              ██                                                           
   ╚════██║██╔═══╝ ██╔══╝  ██║            ██    ██████    ██                                                           
   ███████║██║     ███████╗╚██████╗       ██    ██████    ██                                                           
   ╚══════╝╚═╝     ╚══════╝ ╚═════╝       ██              ██                                                           
                                             ██    ██    ██                                                             
                                               ████░░████                                                               
                                                 ██░░██                                                                 
                                                 ██░░██                                                                 
                                                   ████                                                                 
[/bright_cyan]"""

# Dog art collection
DOG_ART = {
    "welcome": """
    🐕 Hi! I'm Spec! Let's build something amazing together!
    
       /^-----^\\
      ( ◕     ◕ )
       \\  ^___^  /
        \\   ---   /
         ^^^     ^^^
    """,
    "happy": """
       /^-----^\\
      ( ◕     ◕ )
       \\  ^___^  /
        \\   ---   /
         ^^^     ^^^
    """,
    "thinking": """
       /^-----^\\
      ( ◕  ?  ◕ )
       \\  ^___^  /
        \\   ---   /
         ^^^     ^^^
            💭
    """,
    "detective": """
       /^-----^\\   🔍
      ( ◔     ◔ )
       \\  ^___^  /
        \\   ---   /
         ^^^     ^^^
    """,
    "working": """
       /^-----^\\   💻
      ( ◕  ▄  ◕ )
       \\  ^___^  /
        \\   ---   /
         ^^^     ^^^
    """,
    "celebrating": """
       /^-----^\\   🎉
      ( ★     ★ )
       \\  ^___^  /
        \\   ---   /
         ^^^     ^^^
      *WOOF!*
    """,
    "listening": """
       /^-----^\\   👂
      ( ◕     ◕ )
       \\  ^___^  /
        \\   ---   /
         ^^^     ^^^
    """,
    "builder": """
       /^-----^\\   ⚒️
      ( ◕  ⚙️  ◕ )
       \\  ^___^  /
        \\   ---   /
         ^^^     ^^^
    """,
    "ultimate": """
    ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
    ⭐                                          ⭐
    ⭐        /^─────────^\\                         ⭐
    ⭐       ( ◕   🏆   ◕ )                        ⭐
    ⭐        \\    ⭐    /                         ⭐
    ⭐         \\  ^___^  /                        ⭐
    ⭐          \\   ---   /                       ⭐
    ⭐           ^^^     ^^^                      ⭐
    ⭐                                            ⭐
    ⭐    🏆 PROJECT COMPLETE! 🏆                 ⭐
    ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
    """,
    "mini": "(◕‿◕)🐕",
    "mini_working": "(◕‿◕)🐕💻",
    "mini_celebrating": "(★‿★)🐕🎉",
}


def display_logo():
    """Display the full SPEC logo with pixel dog and cyan colors"""
    console.print(SPEC_LOGO)
    console.print()


def display_art(art_key: str, title: str = "", style: str = "blue"):
    """Display ASCII art with optional title"""
    art_text = DOG_ART.get(art_key, DOG_ART["happy"])

    if title:
        console.print(Panel(art_text, title=title, border_style=style, padding=(1, 2)))
    else:
        console.print(art_text)


def display_welcome():
    """Display welcome banner with full color logo and dog"""
    display_logo()
    console.print(Align.center("[dim]🐕 Your Friendly Spec Development Guide 🐕[/dim]"))
    console.print()

    # Show the friendly dog mascot below
    console.print(Align.center(DOG_ART["welcome"]))
    console.print()


def display_milestone(milestone: str):
    """Display milestone celebration"""
    milestones = {
        "constitution": ("celebrating", "🎉 Constitution Created!", "green"),
        "spec": ("celebrating", "🎉 Specification Complete!", "green"),
        "plan": ("builder", "🎉 Plan Ready!", "blue"),
        "tasks": ("working", "🎉 Tasks Ready!", "blue"),
        "complete": ("ultimate", "🏆 Project Complete!", "purple"),
    }

    art_key, title, style = milestones.get(milestone, ("happy", "Milestone!", "blue"))
    display_art(art_key, title, style)

    if milestone == "complete":
        console.print("\n[bold green]🐕 Spec is SO proud of you! 🐕[/bold green]\n")
        console.print("What would you like to do next?")
        console.print("  1. 🧪 Test the application")
        console.print("  2. 🚀 Deploy it")
        console.print("  3. 🔧 Make changes")
        console.print("  4. 💤 Take a break (you earned it!)")


def display_section_header(section: str):
    """Display section header with appropriate art"""
    sections = {
        "big_picture": ("thinking", "🎯 The Big Picture"),
        "audience": ("listening", "👥 Who & Where"),
        "approach": ("builder", "⚙️ How We'll Build"),
    }

    art_key, title = sections.get(section, ("happy", section))
    display_art(art_key, title, "blue")


if __name__ == "__main__":
    # Test display
    display_welcome()
    print("\n--- Milestone Tests ---\n")
    display_milestone("constitution")
    display_milestone("complete")
