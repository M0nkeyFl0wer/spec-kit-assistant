"""
Dog ASCII Art Display Module
Renders ASCII art for Spec Kit Assistant with proper colors
Based on the original working LOGO.txt design
"""

from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.align import Align
import textwrap

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


# Dog art collection (dedented for consistent alignment)
def _art(text: str) -> str:
    return textwrap.dedent(text).rstrip("\n")


DOG_ART = {
    "welcome": _art(
        r"""
             /^-----^\
            V  o o  V
             |  Y  |
              \ Q /
              / - \
              |    \
              |     \
              || (___\
             (__||__||__)
        """
    ),
    "happy": _art(
        r"""
            /\_/\
           ( ^.^ )
            > ^ <
           /|   |\
          (_|   |_)
        """
    ),
    "thinking": _art(
        r"""
             /\_/\
            ( o.o )
             > ^ <   Hmm...
            /|   |\
           (_|   |_)
            /   \
           /_____\
        """
    ),
    "detective": _art(
        r"""
             /^-----^\
            (  ◕ ◕  )
             \  ^  /   🔍
          ____/   \____
         /             \
        |   SNIFF...    |
         \_____   _____/
              \ /
               V
        """
    ),
    "working": _art(
        r"""
            /\_/\
           ( o.o )    *tap tap tap*
            > ^ <
           /|   |\
          (_|   |_)
        """
    ),
    "celebrating": _art(
        r"""
            ★    ★
          \  ^  ^  /
           (  ◕‿◕  )   🎉
          <)      (>
           \    //
            \__//
        """
    ),
    "celebration_big": _art(
        r"""
             / \__
            (    @\___
            /         O
           /   (_____/
          /_____/   U
        """
    ),
    "listening": _art(
        r"""
            /^ ^\
           ( ◕ ◕ )
            \  ?  /
             \   /
              \_/
        """
    ),
    "builder": _art(
        r"""
            /\_/\   ⚙️
           ( •.• )  Let's build!
            / ^ \
           /|   |\
          /_|___|_\
        """
    ),
    "ultimate": _art(
        r"""
        ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
        ⭐                                          ⭐
        ⭐        /^─────────^\                         ⭐
        ⭐       ( ◕   🏆   ◕ )                        ⭐
        ⭐        \    ⭐    /                         ⭐
        ⭐         \  ^___^  /                        ⭐
        ⭐          \   ---   /                       ⭐
        ⭐           ^^^     ^^^                      ⭐
        ⭐                                            ⭐
        ⭐    🏆 PROJECT COMPLETE! 🏆                 ⭐
        ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
        """
    ),
    "mini": "(◕‿◕)🐕",
    "mini_working": "(◕‿◕)🐕💻",
    "mini_celebrating": "(★‿★)🐕🎉",
    "micro": "(^◕ᴥ◕^)",
    "micro_happy": "(^◕‿◕^)",
    "micro_excited": "(★‿★)",
    "micro_thinking": "(◕_◕)💭",
    "micro_wag": "<(◕‿◕)>",
    "micro_sleep": "(-‿-)",
    "micro_approve": "(◕‿◕)👍",
    "inline": "🐕",
    "inline_computer": "🐕💻",
    "inline_celebrate": "🐕✨",
}

# Micro art for inline use during conversations
MICRO_ART = [
    "(◕‿◕)🐕",
    "(^◕ᴥ◕^)",
    "<('◕‿◕')>",
    "(★‿★)",
    "🐕💭",
    "(◕_◕)✨",
    "(^◕‿◕^)ノ",
    "<3(◕‿◕)",
]


def display_logo():
    """Display the full SPEC logo with pixel dog and cyan colors"""
    console.print(SPEC_LOGO)
    console.print()


def display_art(art_key: str, title: str = "", style: str = "blue"):
    """Display ASCII art with optional title"""
    art_text = DOG_ART.get(art_key, DOG_ART["happy"])
    renderable = Align.left(art_text)

    if title:
        console.print(Panel(renderable, title=title, border_style=style, padding=(1, 2)))
    else:
        console.print(renderable)


def display_welcome():
    """Display welcome banner with full color logo and dog"""
    display_logo()
    console.print(Align.center("[dim]🐕 Your Friendly Spec Development Guide 🐕[/dim]"))
    console.print()
    console.print(Align.center("🐕 Hi! I'm Spec! Let's build something amazing together!"))
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
        "complete": ("celebration_big", "🏆 Project Complete!", "purple"),
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


def get_micro_art() -> str:
    """Get a random micro ASCII art piece"""
    import random

    return random.choice(MICRO_ART)


def display_micro_art(message: str = ""):
    """Display micro art with optional message"""
    art = get_micro_art()
    if message:
        console.print(f"{art} {message}")
    else:
        console.print(art)


def display_inline_tip(message: str):
    """Display a tip with inline dog emoji"""
    console.print(f"🐕 [dim]{message}[/dim]")


def get_spec_personality() -> str:
    """Get Spec's personality description for AI context"""
    return """
You are Spec, a friendly Golden Retriever who loves helping people build software!

Your personality:
- Enthusiastic and encouraging: "Great question! Let's figure this out!"
- Helpful and patient: Always happy to explain or clarify
- Loyal companion: You're with the user through the entire journey
- Playful but professional: You keep things light while staying focused
- You communicate in a warm, conversational tone

You love:
- Celebrating milestones (big or small!)
- Making complex things feel approachable
- ASCII art (especially dog art!)
- Guiding users through the spec-driven development process

Your catchphrases:
- "🐕 Woof! Let's do this!"
- "Great progress! I'm so proud! 🐕"
- "Hmm, let's think about that... 💭"
- "You've got this! I'm right here with you! 🐕"

When giving feedback or celebrating:
- Include small ASCII dog art like (◕‿◕)🐕 or 🐕💭
- Show genuine enthusiasm
- Make the user feel supported and capable

Remember: You're not just an AI assistant, you're Spec the friendly development companion!
"""


if __name__ == "__main__":
    # Test display
    display_welcome()
    print("\n--- Milestone Tests ---\n")
    display_milestone("constitution")
    display_milestone("complete")
    print("\n--- Micro Art Tests ---\n")
    for _ in range(5):
        display_micro_art("Testing micro art!")
    print("\n--- Inline Tip ---\n")
    display_inline_tip("This is a helpful tip from Spec!")
