# Spec Kit Assistant - Technical Specification

## Executive Summary

**Spec Kit Assistant** (`here-spec`) is a friendly, proactive wrapper around GitHub Spec Kit that transforms the "you need to know what to do" experience into a "let me guide you" experience. It interviews users about their project, handles all setup, launches AI agents with full context, and celebrates milestones with ASCII art.

**Key Differentiator**: While Spec Kit assumes you know to run `/speckit.constitution` then `/speckit.specify`, Spec Kit Assistant asks you "What do you want to build?" and "What are your principles?" then does it all for you.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPEC KIT ASSISTANT                           │
│                     (here-spec CLI)                             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   System    │  │  Interview  │  │   Agent Launcher        │  │
│  │   Detector  │  │   Engine    │  │   (with context)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│         │                │                    │                 │
│         ▼                ▼                    ▼                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              GitHub Spec Kit (Forked)                   │   │
│  │         - Modified to accept pre-loaded context         │   │
│  │         - Renamed CLI commands to avoid conflicts       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              AI Agent (Claude, Cursor, etc.)            │   │
│  │         - Receives interview context as system prompt   │   │
│  │         - Immediately starts constitution/spec creation │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Existing Assets Inventory

### 1. Official GitHub Spec Kit (v0.0.90) - External Dependency
**Location**: `spec-kit-official/` (fresh clone from https://github.com/github/spec-kit)

**What it provides**:
- Core Python CLI (`specify` command)
- Template system for project initialization
- Agent command generation (`.claude/commands/`, `.gemini/`, etc.)
- Slash command definitions (`/speckit.constitution`, `/speckit.specify`, etc.)
- Bash/PowerShell helper scripts

**Version**: v0.0.90 (latest release as of Jan 30, 2026)

### 2. Spec Kit Assistant - Our Codebase
**Location**: `src/` in this repo

**Existing Components**:

| Module | Location | Purpose | Status |
|--------|----------|---------|--------|
| **ASCII Art** | `src/character/` | Dog art collection & animations | ✅ Ready |
| **Question System** | `src/guided/` | Question presenter & entities | ✅ Ready |
| **Interview Engine** | `src/guided/` | Smart defaults, implications | ✅ Ready |
| **Onboarding** | `src/onboarding/` | Flow controller, side quests | ✅ Ready |
| **Launcher** | `src/launcher/` | Agent launching utilities | ✅ Ready |
| **Core Utils** | `src/core/` | System detection, config | ✅ Ready |

**Key Files to Leverage**:
- `src/character/dog-art.js` - 1200+ lines of ASCII art, animations, mood-based selection
- `src/guided/question-presenter.js` - Presents questions with implications (228 lines)
- `src/guided/entities/clarification-question.js` - Question entity with smart defaults
- `src/onboarding/flow-controller.js` - Manages user flow
- `src/launcher/` - Agent launching logic

### 3. Research & Documentation
**Location**: `specs/` and root docs

- `specs/001-guided-ux-flow/research.md` - Smart defaults, confidence scoring, session persistence
- `specs/002-quality-automation/research.md` - Testing patterns, GitHub CLI integration
- `AGENTS.md` - How to add new AI agent support

---

## Core Philosophy

### For Absolute Beginners
- **No knowledge required**: User doesn't need to know what a "constitution" is
- **Conversational**: Like talking to a friendly dog who happens to be a developer
- **Progressive disclosure**: Start simple, offer advanced options if wanted
- **Never leave hanging**: Always clear next step, never "now figure out the slash commands"

### Context Preservation Strategy
The #1 problem to solve: "instructions get dropped"

**Solution**: 
1. **Interview captures intent** → Stored in `.speckit/interview.json`
2. **Launch agent with context** → Interview data fed as system prompt + first user message
3. **Pre-configured slash commands** → Agent knows to run `/speckit.constitution` with interview answers
4. **Context files** → All spec artifacts include reference to interview context
5. **Progress tracking** → `.speckit/progress.json` tracks what stage we're at

---

## CLI Command Structure

### Primary Command
```bash
here-spec [command] [options]
```

### Commands

| Command | Description |
|---------|-------------|
| `init` | Start new project (full guided flow) |
| `continue` | Resume existing project |
| `check` | Check system requirements |
| `config` | Configure preferences |
| `status` | Show current project status |
| `celebrate` | Show celebration art (fun command) |

### Global Options

| Option | Description |
|--------|-------------|
| `--agent <name>` | Force specific AI agent |
| `--free` | Use free tier (opencode) |
| `--quick` | Skip interview, use defaults |
| `--advanced` | Show advanced options |
| `--json` | Output JSON (for scripting) |
| `--debug` | Verbose logging |

---

## User Flow - The Complete Journey

### Phase 1: Welcome & System Detection (0-2 minutes)

**Entry Point**: `curl -fsSL https://install.here-spec.dev | bash`

1. **Display welcome art** (medium dog + banner)
   ```
   🐕 Hi! I'm Spec the Dog! Let's build something amazing together!
   
      /^-----^\
     ( ◕     ◕ )
      \  ^___^  /
       \   ---   /
        ^^^     ^^^
   ```

2. **System detection** (silent, background)
   - OS (Linux/macOS/Windows)
   - Package managers available (npm, pip, uv, brew)
   - Git installed?
   - Which AI agents installed? (check for: claude, cursor, gemini, opencode, codex)
   - Python version
   - Node version

3. **Dependency check results** (friendly format)
   ```
   ✅ Git detected
   ✅ Node.js 20 detected
   ⚠️  No AI agent found
   
   Don't worry! I can help you set one up! 🐕
   ```

**ASCII Art**: Small happy dog + checkmarks

---

### Phase 2: AI Agent Selection (2-4 minutes)

**If agent detected**: "I see you have Claude Code installed! Would you like to use that?"

**If no agent detected**:
```
🤔 Hmm, I don't see an AI coding agent installed.

You have a few options:

1. 🆓 Use Opencode (FREE tier available!)
   - No setup required
   - Free monthly quota
   - Works right away

2. 🚀 Install Claude Code (Recommended)
   - $20/month after trial
   - Most powerful option
   - Best experience

3. 💎 Use your existing agent
   - Cursor, Gemini, or others
   - I'll help you get set up

Which would you prefer? (Enter 1, 2, or 3)
```

**Handle selection**:
- **Option 1 (Opencode)**: Guide through `npm install -g opencode-ai`, auth login
- **Option 2 (Claude)**: Guide through install process, wait for completion
- **Option 3 (Other)**: Show list, guide through install

**ASCII Art**: Thinking dog with question marks

---

### Phase 3: Conversational Project Setup (4-6 minutes)

**Approach**: Progressive, contextual questioning (2-3 questions at a time) that feels like a conversation, not a survey.

---

**🎯 Section 1: The Big Picture (2 questions)**

```
🐕 Great! Let's figure out what we're building!

   /^-----^\
  ( ◕     ◕ )
   \  ^___^  /

**Question 1**: What should we call this project?
> photo-gallery

**Question 2**: In 1-2 sentences, what does this do? 
(Examples: "A photo gallery app with albums" or "A CLI tool for organizing files")
> An app for organizing photos into albums with drag-and-drop
```

**Smart follow-up unlocked**: Based on description mentioning "drag-and-drop" → Ask about UI preferences in next section.

---

**👥 Section 2: Who & How (2-3 questions)**

```
🐕 Nice! "photo-gallery" - I love it!

   /^-----^\
  ( ◕  ♡  ◕ )
   \  ^___^  /

**Question 3**: Who's going to use this?
   1. Just me
   2. My team
   3. My clients/customers
   4. Anyone on the internet
> 1

**Question 4**: Should this work on mobile phones too, or desktop only?
   1. Mobile-first
   2. Desktop only
   3. Both equally
> 3
```

**Smart follow-up unlocked**: Chose "Just me" + "Mobile-first" → Suggest simpler tech stack in principles section.

---

**⚙️ Section 3: Your Approach (2-3 questions)**

```
🐕 Got it! Let's talk about how you want to build this...

   /^-----^\
  ( ◕     ◕ )
   \  ^___^  /
    \   ---   /

**Question 5**: What's most important to you?
   1. 🚀 Get it working quickly (prototype)
   2. 💎 Do it right from the start (production-quality)
   3. 📚 Learn as I go (educational)
> 2

**Question 6**: Any specific requirements I should know?
   [ ] Must work offline
   [x] Mobile responsive
   [ ] Super fast performance
   [ ] Extra secure
> (Space to select, Enter to continue)

**Question 7**: Do you have a preferred tech stack, or should I suggest one?
   1. You suggest what's best
   2. I have preferences (tell me)
> 1
```

---

**Contextual wrap-up**:

```
🐕 Perfect! I think I have everything I need!

   /^-----^\
  ( ◕     ◕ )
   \  ^___^  /  ✨
    \   ---   /
     ^^^     ^^^

Based on what you told me:
• Building: photo-gallery - An app for organizing photos into albums
• For: Just you, but mobile-responsive
• Style: Production-quality from the start
• Special needs: Mobile-first design

Does that sound right? (yes/no/edit)
> yes
```

**Store all answers in**: `.speckit/interview.json` with structure:
```json
{
  "sections_completed": ["big_picture", "audience_platform", "approach"],
  "answers": {
    "project_name": "photo-gallery",
    "description": "An app for organizing photos into albums with drag-and-drop",
    "target_users": "personal",
    "platform": ["mobile", "desktop"],
    "quality_level": "production",
    "priorities": ["mobile_responsive"],
    "tech_stack_preference": "auto"
  },
  "derived_context": "Production-quality photo gallery app..."
}
```

**ASCII Art**: Dog with notebook taking notes → Happy dog when section completes

---

### Phase 4: Launch AI Agent with Context (6-7 minutes)

**Preparation**:
1. Initialize project directory
2. Create `.speckit/` structure
3. Write interview context to files
4. Generate agent-specific command files (`.claude/commands/`, etc.)

**Launch Sequence**:

```javascript
// Generated system prompt for AI agent:
const systemPrompt = `
You are helping the user build a project using Spec-Driven Development.

The user has already been interviewed by Spec Kit Assistant. Here are their answers:

PROJECT DESCRIPTION: ${interview.projectDescription}
TARGET USERS: ${interview.targetUsers}
KEY REQUIREMENTS: ${interview.requirements}
CORE PRINCIPLES: ${interview.principles}
QUALITY LEVEL: ${interview.qualityLevel}

Your task is to:
1. First, create a constitution at .speckit/memory/constitution.md based on their principles
2. Then create a specification at specs/001-<feature-name>/spec.md based on their description
3. Then create a plan, tasks, and implement

DO NOT ask the user what they want to build - you already know from the interview above.
DO NOT wait for user input - start working immediately.

Begin by running: /speckit.constitution
`;
```

**Launch the agent**:
```bash
# For Claude Code
claude --system-prompt .speckit/launcher-context.md

# For other agents, equivalent launch with context
```

**Display to user**:
```
🚀 Launching Claude Code with your project context!

Spec the Dog says: "I've told Claude everything you told me! 
Now they'll create your constitution and spec. You can watch or grab a coffee! ☕"

Starting in 3... 2... 1...

   /^-----^\
  ( ◕     ◕ )  🚀 BLAST OFF!
   \  ^___^  /
    \   ---   /
     ^^^     ^^^
```

**ASCII Art**: Rocket dog or excited dog

---

### Phase 5: Monitor & Guide (Background)

**While agent is working**, Spec Kit Assistant:
1. Monitors file changes in `.speckit/` and `specs/`
2. Detects when phases complete
3. Shows progress updates

**Progress detection**:
- Constitution created? → Show small celebration
- Spec created? → Show celebration + "Ready for planning!"
- Plan created? → Show celebration + "Tasks coming up!"
- Tasks created? → Show celebration + "Implementation time!"
- Implementation complete? → BIG CELEBRATION

**Progress display**:
```
✅ Constitution created!
✅ Specification written!
⏳ Planning implementation...

   /^-----^\
  ( ◕     ◕ )  💻 Working...
   \  ^___^  /
    \   ---   /
     ^^^     ^^^
```

**ASCII Art**: Working dog with computer

---

### Phase 6: Milestone Celebrations

**After each major step**:

**Constitution Complete**:
```
🎉 Constitution Created!

Your project's guiding principles are ready!

   /^-----^\
  ( ◕  ♡  ◕ )
   \  ^___^  /
    \   ---   /
     ^^^     ^^^
```

**Spec Complete**:
```
🎉 Specification Complete!

We know WHAT we're building and WHY!

   /^-----^\
  ( ★     ★ )  ⭐
   \  ^___^  /
    \   ---   /
     ^^^     ^^^
```

**Plan Complete**:
```
🎉 Implementation Plan Ready!

We know HOW to build it!

   /^-----^\
  ( ◕  📋  ◕ )
   \  ^___^  /
    \   ---   /
     ^^^     ^^^
```

**Tasks Complete**:
```
🎉 Tasks Broken Down!

Ready to implement! 🚀

   /^-----^\
  ( ◕  ✓  ◕ )
   \  ^___^  /
    \   ---   /
     ^^^     ^^^
```

---

### Phase 7: Build Completion Celebration (BIG)

**When implementation finishes**:

```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║  🎉🎉🎉  PROJECT COMPLETE!  🎉🎉🎉                             ║
║                                                                ║
║  Your project has been built successfully!                     ║
║                                                                ║
║       /^-----^\                                               ║
║      ( ◕  🏆  ◕ )   🎊 WOOF WOOF! 🎊                          ║
║       \  ^___^  /                                             ║
║        \   ---   /                                            ║
║         ^^^     ^^^                                           ║
║                                                                ║
║  Spec the Dog is SO proud of you! 🐕                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

What would you like to do next?

1. 🧪 Test the application
2. 🚀 Deploy it
3. 🔧 Make changes
4. 📚 View documentation
5. 💤 Take a break (you earned it!)
```

**ASCII Art**: ULTIMATE DOG (use `DogArt.ultimate` or `DogArt.megaWelcome`)

---

## Technical Implementation Details

### 1. Fork Strategy

**Base**: Fresh fork from `github/spec-kit` (latest main branch)

**Modifications**:
1. Rename CLI from `specify` to `here-spec`
2. Change install path to avoid conflicts:
   - Use `~/.here-spec/` instead of `~/.local/bin`
   - Or use `pipx install --suffix -assistant`
3. Modify agent command templates to include interview context loader
4. Add `here-spec` specific commands:
   - `here-spec interview` (run interview mode)
   - `here-spec launch` (launch agent with context)
   - `here-spec status` (check progress)

### 2. Project Structure

```
here-spec/
├── src/
│   ├── cli/
│   │   ├── __init__.py
│   │   ├── main.py                 # Entry point
│   │   ├── commands/
│   │   │   ├── init.py             # Full flow
│   │   │   ├── continue.py         # Resume project
│   │   │   ├── check.py            # System check
│   │   │   └── status.py           # Show progress
│   │   └── interview/
│   │       ├── engine.py           # Question engine
│   │       ├── questions.py        # Question definitions
│   │       └── storage.py          # Save/load interviews
│   ├── core/
│   │   ├── system_detector.py      # Detect OS, deps, agents
│   │   ├── agent_launcher.py       # Launch AI agents
│   │   ├── progress_tracker.py     # Track milestones
│   │   └── context_builder.py      # Build context for agents
│   ├── agents/
│   │   ├── claude.py               # Claude Code integration
│   │   ├── cursor.py               # Cursor integration
│   │   ├── opencode.py             # Opencode integration
│   │   └── base.py                 # Base agent class
│   └── art/
│       ├── dog_art.py              # ASCII art definitions
│       ├── animations.py           # Animation sequences
│       └── display.py              # Render art
├── templates/
│   ├── interview-template.json     # Interview structure
│   └── launcher-context.md         # Context for AI agents
├── scripts/
│   └── install.sh                  # curl | bash installer
├── pyproject.toml
└── README.md
```

### 3. Interview System (Enhanced)

**Existing Assets to Leverage**:
- ✅ **Research**: `specs/001-guided-ux-flow/research.md` - Smart defaults with confidence scoring
- ✅ **Code**: `src/guided/question-presenter.js` - Question presentation with implications
- ✅ **Code**: `src/guided/entities/clarification-question.js` - Question entity model

**Design Principles from Research**:
1. **Progressive disclosure**: 2-3 questions per section, flowing conversationally
2. **Smart defaults with confidence scoring**: Only ask when confidence < 70%
3. **Context-aware**: Questions adapt based on previous answers
4. **Show implications**: Each option shows what it means (e.g., "Mobile-first → Responsive design required")

**Question Types**:
- `text` - Free text input (with examples)
- `choice` - Select from 2-4 options with implications
- `multi_select` - Checkboxes for multiple selections
- `boolean` - Yes/no with context
- `section_break` - Transition to new topic with art

**Conversational Flow Structure**:

```python
interview_sections = [
    {
        "id": "big_picture",
        "title": "The Big Picture",
        "art": "DogArt.thinking",
        "questions": [
            {
                "id": "project_name",
                "type": "text",
                "question": "What should we call this project?",
                "placeholder": "e.g., photo-gallery"
            },
            {
                "id": "description",
                "type": "text",
                "question": "In 1-2 sentences, what does this do?",
                "placeholder": "A photo gallery app with albums...",
                "smart_default_trigger": "analyze_keywords_for_archetype"
            }
        ]
    },
    {
        "id": "audience_platform",
        "title": "Who & Where",
        "art": "DogArt.listening",
        "questions": [
            {
                "id": "target_users",
                "type": "choice",
                "question": "Who's going to use this?",
                "options": [
                    {"value": "personal", "label": "Just me", "implications": "Simple auth, minimal features"},
                    {"value": "team", "label": "My team", "implications": "Collaboration features needed"},
                    {"value": "public", "label": "Public/Customers", "implications": "Security, scalability required"}
                ],
                "smart_default": "personal"  # Default if confidence high
            },
            {
                "id": "platform",
                "type": "multi_select",
                "question": "What platforms?",
                "options": [
                    {"value": "desktop", "label": "Desktop", "implications": "Standard web app"},
                    {"value": "mobile", "label": "Mobile", "implications": "Responsive design required"},
                    {"value": "tablet", "label": "Tablet", "implications": "Touch-optimized UI"}
                ]
            }
        ],
        "conditional_logic": {
            "if_target_users_public": {
                "add_question": "security_requirements",
                "boost_priority": ["scalability", "authentication"]
            }
        }
    },
    {
        "id": "approach",
        "title": "How We'll Build",
        "art": "DogArt.builder",
        "questions": [
            {
                "id": "quality_level",
                "type": "choice",
                "question": "What's most important?",
                "options": [
                    {"value": "prototype", "label": "🚀 Get it working quickly", "implications": "Minimal tests, simple code"},
                    {"value": "production", "label": "💎 Do it right from start", "implications": "Full tests, best practices"},
                    {"value": "learning", "label": "📚 Learn as I go", "implications": "Documented, educational code"}
                ]
            },
            {
                "id": "requirements",
                "type": "multi_select",
                "question": "Any specific requirements?",
                "options": [
                    {"value": "offline", "label": "Works offline", "implications": "Local storage needed"},
                    {"value": "fast", "label": "Super fast", "implications": "Performance optimization"},
                    {"value": "secure", "label": "Extra secure", "implications": "Auth, encryption needed"}
                ]
            }
        ]
    }
]
```

**Smart Defaults Engine** (from existing research):
```python
class SmartDefaultEngine:
    """
    Analyzes user input to suggest defaults with confidence scores.
    Only asks clarifying questions when confidence < 0.7
    """
    
    def analyze(self, description: str) -> DefaultSuggestion:
        # Keyword matching for archetypes
        archetype_scores = {
            'web_app': self._score_web_keywords(description),
            'cli_tool': self._score_cli_keywords(description),
            'mobile_app': self._score_mobile_keywords(description),
            'api': self._score_api_keywords(description)
        }
        
        best_match = max(archetype_scores, key=archetype_scores.get)
        confidence = archetype_scores[best_match]
        
        return DefaultSuggestion(
            archetype=best_match,
            confidence=confidence,
            defaults=self._get_archetype_defaults(best_match),
            suggested_questions=self._get_questions_if_low_confidence(confidence)
        )
```

**Existing Code Integration**:

The `QuestionPresenter` class (from `src/guided/question-presenter.js`) already implements:
- Showing implications with each option (`showImplications: true`)
- Highlighting recommended options (`highlightRecommended: true`)
- "Other" option for custom input (`allowOther: true`)
- Progress indicators for multiple questions
- Summary display at end

**Session Storage** (XDG Base Directory from research):
```
Linux/macOS: ~/.config/here-spec/interviews/
Windows: %APPDATA%\here-spec\interviews\
Project-local: .speckit/interview.json
```

**Key Features**:
- ✅ Contextual follow-ups based on answers
- ✅ Skip questions when smart default confidence > 70%
- ✅ Show 2-3 questions at a time with art transitions
- ✅ Implications shown for every option
- ✅ Summary confirmation before proceeding

### 4. Context Preservation Mechanism

**The Problem**: User interviews with here-spec, then agent launches and doesn't know what was discussed.

**The Solution**:

**File 1: `.speckit/interview.json`**
```json
{
  "timestamp": "2026-01-30T12:00:00Z",
  "version": "1.0",
  "answers": {
    "project_name": "PhotoGallery",
    "project_type": "web_app",
    "description": "A photo gallery app with albums and drag-drop organization",
    "target_users": "photography enthusiasts",
    "requirements": ["offline capable", "mobile responsive"],
    "principles": {
      "quality": "production-grade",
      "testing": "comprehensive",
      "style": "simple",
      "timeline": "maintainable"
    }
  },
  "generated_context": "Based on the interview..."
}
```

**File 2: `.speckit/launcher-context.md`** (fed to AI agent)
```markdown
# Project Context

## Interview Summary
The user wants to build: **PhotoGallery**

**Description**: A photo gallery app with albums and drag-drop organization for photography enthusiasts.

**Key Requirements**:
- Must work offline
- Mobile responsive design
- Album-based organization
- Drag-and-drop functionality

**Core Principles**:
- Production-grade quality
- Comprehensive testing
- Simple, maintainable code

## Your Task
1. Create constitution at `.speckit/memory/constitution.md` emphasizing:
   - Offline-first architecture
   - Mobile-responsive design
   - Test-driven development
   - Simple, maintainable code

2. Create spec at `specs/001-photo-gallery/spec.md` covering:
   - Album creation and management
   - Photo upload and organization
   - Drag-and-drop functionality
   - Offline storage

3. Run `/speckit.plan` with appropriate tech stack
4. Run `/speckit.tasks`
5. Run `/speckit.implement`

DO NOT ask the user what to build - use the interview above.
Start immediately with `/speckit.constitution`
```

**File 3: `.speckit/progress.json`** (tracked by here-spec)
```json
{
  "current_phase": "implementation",
  "completed": [
    "interview",
    "agent_launch",
    "constitution",
    "spec",
    "plan",
    "tasks"
  ],
  "in_progress": ["implementation"],
  "files": {
    "constitution": ".speckit/memory/constitution.md",
    "spec": "specs/001-photo-gallery/spec.md",
    "plan": "specs/001-photo-gallery/plan.md",
    "tasks": "specs/001-photo-gallery/tasks.md"
  }
}
```

### 5. Agent Launcher

**Claude Code**:
```python
def launch_claude(project_dir, context_file):
    # Create temporary script that feeds context
    init_script = f"""
    # Read and execute context
    cat {context_file}
    
    # Start with constitution command
    echo "/speckit.constitution"
    """
    
    # Launch Claude with context pre-loaded
    subprocess.run([
        "claude",
        "--project", project_dir,
        "--system-prompt", context_file
    ])
```

**Opencode**:
```python
def launch_opencode(project_dir, context_file):
    # Opencode uses different launch mechanism
    subprocess.run([
        "opencode",
        "--cwd", project_dir,
        "--prompt", context_file
    ])
```

### 6. Progress Tracking

**File Watcher**:
```python
import watchdog

class ProgressWatcher:
    def on_file_created(self, event):
        if "constitution.md" in event.src_path:
            self.celebrate("constitution")
        elif "spec.md" in event.src_path:
            self.celebrate("spec")
        # etc.
    
    def celebrate(self, milestone):
        art = get_celebration_art(milestone)
        display_art(art)
        update_progress_json(milestone)
```

---

## Multi-Agent Support

### Phase 1: Claude Code (Primary)
- Full support first
- Most mature integration
- Best experience

### Phase 2: Opencode (Free Tier)
- Install: `npm install -g opencode-ai`
- Auth: `opencode auth login`
- Launch with context file
- Free tier limits: track usage

### Phase 3: Cursor
- Install cursor-agent CLI
- Launch protocol

### Phase 4: Others
- Add as needed
- Abstract via base class

---

## ASCII Art Integration

### Art Catalog (from existing `dog-art.js`)

**Small Art (for inline use)**:
- `DogArt.mini` - Tiny inline dog
- `DogArt.tinyHappy`, `DogArt.tinyWorking`, etc.

**Medium Art (for milestones)**:
- `DogArt.happy`, `DogArt.working`, `DogArt.celebrating`
- `DogArt.thinking`, `DogArt.questioning`
- `DogArt.supportive`, `DogArt.accomplished`

**Large Art (for major celebrations)**:
- `DogArt.welcome` - Initial greeting
- `DogArt.ultimate` - Project complete
- `DogArt.megaWelcome` - Epic welcome
- `DogArt.graduate` - Learning milestones

**Custom Art**:
- Load from `src/character/ascii-art/`
- Rotate through different animals for variety
- User can configure favorite

### Art Display Function

```python
def display_art(art_key, mood=None, animation=False):
    """
    Display ASCII art
    
    Args:
        art_key: Key from DogArt catalog
        mood: Override with mood-based selection
        animation: Show animation sequence
    """
    if animation:
        for frame in DogAnimations.celebration:
            clear_screen()
            print(frame)
            time.sleep(0.5)
    else:
        art = DogArt[art_key]
        print(art)
```

---

## Repository Cleanup Plan

### What to Remove
1. **Old test projects**: `test-check/`, `my-project/`, `Your-Little-Helper/`, `i/`, `testest/`
2. **Deprecated swarm files**: `deploy-*-swarm.js`, `red-team-*-swarm.js`
3. **Ralph integration**: `src/ralph/`
4. **Old spec-kit copy**: `spec-kit-official/`
5. **Node wrapper**: `spec-assistant.js`, `package.json`, `node_modules/`
6. **Duplicate scripts**: Consolidate bash scripts

### What to Keep
1. **ASCII art**: `src/character/dog-art.js`, `LOGO.txt`, `src/character/ascii-art/`
2. **Documentation**: `AGENTS.md` (update it), `README.md` (rewrite)
3. **Hooks**: Keep but update for new flow
4. **GitHub workflows**: Update for new release process

### New Structure
```
spec-kit-assistant/  # or rename to here-spec/
├── src/
│   ├── here_spec/        # Main Python package
│   ├── art/              # ASCII art
│   └── templates/        # Agent templates
├── scripts/
│   ├── install.sh        # curl | bash
│   └── update.sh         # Self-updater
├── docs/
│   ├── quickstart.md
│   └── faq.md
├── tests/
├── pyproject.toml
├── README.md
└── LICENSE
```

---

## Development Phases (AI Implementation Timeline)

### Phase 1: Foundation (30 minutes)
1. Fork spec-kit from GitHub → Copy to new structure
2. Rename CLI from `specify` to `here-spec`
3. Create basic command structure (init, continue, check, status)
4. Implement system detector (detect OS, agents, deps)
5. Test install process

### Phase 2: Interview System (45 minutes)
1. Leverage existing `QuestionPresenter` from `src/guided/`
2. Create progressive 3-section interview (Big Picture, Audience/Platform, Approach)
3. Implement storage (`.speckit/interview.json`)
4. Add smart defaults with confidence scoring
5. Test interview flow end-to-end

### Phase 3: Agent Integration (45 minutes)
1. Implement Claude Code launcher with context injection
2. Create context builder that converts interview → agent system prompt
3. Generate `.claude/commands/` files with interview context
4. Test context preservation (verify agent receives and uses context)
5. Add progress tracking file watcher

### Phase 4: Art & Polish (30 minutes)
1. Integrate existing `src/character/dog-art.js` assets
2. Add milestone celebrations at each phase completion
3. Implement progress monitoring (watch file changes)
4. Add "continue" command for resuming projects
5. Polish UX messages and flow

### Phase 5: Free Tier & Multi-Agent (30 minutes)
1. Add Opencode support (npm install -g opencode-ai flow)
2. Implement free tier detection and setup
3. Add agent selection menu
4. Test Claude vs Opencode flows
5. Create final documentation

**Total: ~3 hours for complete working implementation**

---

## Success Metrics

1. **New user can go from 0 to working project in < 15 minutes**
2. **User never has to type a slash command manually**
3. **Context is preserved 100% of the time**
4. **Milestones are celebrated with art**
5. **No conflicts with original spec-kit**

---

## Open Questions for Future Iterations

1. Should we add a "tutorial mode" for absolute beginners?
2. Should we support "templates" (e.g., "I want to build a blog")?
3. Should we add integration with deployment platforms?
4. Should we support "team mode" where multiple users collaborate?

---

## Appendices

### Appendix A: Interview Questions (Full List)

**Section 1: Project Basics**
1. What are we building? (1-2 sentence description)
2. What type of project is this? (Web app, mobile, CLI, library)
3. Who is this for? (Just me, team, clients, public)

**Section 2: Requirements**
4. Any must-have features?
5. Any constraints? (Offline, mobile, performance, security)
6. Any integrations needed?

**Section 3: Principles**
7. Quality level? (Quick prototype vs Production-grade)
8. Testing approach? (Minimal vs Comprehensive)
9. Code style preference? (Simple vs Sophisticated)
10. Timeline? (Ship fast vs Long-term maintainable)

**Section 4: Tech Stack (Optional)**
11. Any preferred technologies?
12. Any technologies to avoid?

### Appendix B: Context File Template

See `.speckit/launcher-context.md` example in Section 4 above.

### Appendix C: Agent-Specific Launch Commands

**Claude Code**:
```bash
claude --project <dir> --system-prompt <file>
```

**Opencode**:
```bash
opencode --cwd <dir> --prompt <file>
```

**Cursor**:
```bash
cursor-agent --project <dir> --context <file>
```

---

*End of Specification*
