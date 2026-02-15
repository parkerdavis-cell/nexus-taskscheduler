# Nexus

**AI-powered task management where agents don't just assist — they execute.**

Nexus is a local-first task management app designed for humans and AI agents to work together. Assign tasks to your AI agent the same way you'd assign them to a team member. It picks up the work, completes it, and sends it back for your review.

Built with Next.js and SQLite. All data stays on your machine — no cloud accounts, no external databases, no subscriptions required.

---

## What Makes Nexus Different

Most AI tools are **pull-based** — you go to the AI, ask it something, copy the result, and manage everything yourself. Nexus is **push-based** — you assign work to an AI agent, it executes autonomously, and hands it back for your review. The AI doesn't just help. It owns tasks.

The agent reads its task queue, picks up work, executes it using your real tools and data, logs what it did, and routes it back to you for approval. You stay in control. The work gets done.

---

## Features

### Workspaces
Organize everything by project, client, or area of life. Each workspace is an isolated container with its own tasks, goals, contacts, and schedules. A consultant might have one workspace per client plus a personal workspace — they never bleed into each other.

### Smart Task Management
Every task carries the full picture:
- **Priority levels** — Urgent, High, Medium, Low
- **Assignee** — assign to yourself or to an AI agent
- **Status tracking** — TODO, In Progress, Review, Blocked, Done, Archived
- **Due dates and time estimates** — for realistic planning
- **Activity thread** — every comment, status change, and handoff is logged automatically

### Goals and Milestones
Set high-level objectives and break them into milestones. Link tasks to goals to track progress. The agent prioritizes work that moves goals forward.

### Weekly Planner
Time-block your week with a visual planner. Drag and drop tasks into time slots, or use the auto-scheduler to fill your calendar based on task priority, due dates, and your configured work schedules (Deep Work, Meetings, Admin blocks).

### Calendar Integration
Import external calendars using shared ICS links — works with Google Calendar, Outlook, Apple Calendar, or any service that provides a shareable calendar URL. Events sync automatically and appear in your weekly planner alongside your scheduled tasks.

No API keys or OAuth setup required. Just paste a shared calendar link in **Settings > Calendar Feeds**.

### Agent Chat and Terminal
A built-in chat interface and terminal emulator for interacting with your AI agent directly from the app. Run commands, ask questions, and see results without leaving Nexus.

### Workflows
Define reusable multi-step agent workflows. Each workflow is a sequence of instructions the agent follows — useful for recurring processes like weekly reviews, meeting note processing, or client onboarding checklists.

### Contacts
A simple CRM per workspace. Track names, emails, phone numbers, companies, roles, and notes for the people you work with.

### Dashboard
See everything at a glance — task counts by status, upcoming deadlines, recent activity, and productivity metrics across all your workspaces.

---

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, TanStack Query
- **Database**: SQLite via Prisma 7 + better-sqlite3 (single portable file, no server needed)
- **Validation**: Zod for type-safe input validation across all API routes

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or higher
- npm (comes with Node.js)

### Installation

```bash
# Clone the repo
git clone https://github.com/parkerdavis-cell/nexus-taskscheduler.git
cd nexus-taskscheduler

# Install dependencies
npm install

# Set up the database
npm run setup
```

The setup script does three things:
1. Creates a `.env` file from the included template
2. Generates the Prisma client (TypeScript database interface)
3. Creates a local SQLite database at `prisma/nexus.db` and seeds it with default work schedules

### Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll see a welcome screen — create your first workspace to get started.

### What You'll See

1. **Welcome screen** — prompts you to create your first workspace
2. **Dashboard** — overview of tasks, goals, and activity across workspaces
3. **Tasks page** — create, assign, prioritize, and track tasks
4. **Goals page** — set objectives with milestones and linked tasks
5. **Planner** — weekly time-blocking view with drag-and-drop scheduling
6. **Settings** — configure your profile, workspaces, schedules, and calendar feeds

---

## Adding Calendar Feeds

Nexus imports external calendars via shared ICS links. No API keys or accounts needed.

### Google Calendar
1. Open [Google Calendar](https://calendar.google.com)
2. Click the three dots next to a calendar > **Settings and sharing**
3. Scroll to **Integrate calendar** > copy the **Secret address in iCal format**
4. In Nexus, go to **Settings > Calendar Feeds > Add Feed** and paste the URL

### Outlook / Microsoft 365
1. Open [Outlook Calendar](https://outlook.live.com/calendar)
2. Click the gear icon > **View all Outlook settings** > **Calendar** > **Shared calendars**
3. Under **Publish a calendar**, select the calendar and click **Create**
4. Copy the ICS link and add it in Nexus

### Apple Calendar (iCloud)
1. Go to [icloud.com/calendar](https://www.icloud.com/calendar)
2. Click the share icon next to a calendar > enable **Public Calendar**
3. Copy the link and add it in Nexus

Events sync automatically and appear in your weekly planner.

---

## Using with Claude Code (AI Agent Setup)

Nexus is designed to work with [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — Anthropic's CLI tool that lets Claude act as an autonomous agent on your machine. This is where Nexus becomes more than a task app — it becomes a human-agent collaboration system.

### How It Works

Claude Code reads and writes to your Nexus SQLite database directly. When you assign a task to the agent, Claude picks it up, does the work, and hands it back for your review. The workflow:

```
You assign a task to "agent"
        ↓
Claude sets it to IN_PROGRESS and does the work
        ↓
Claude sets it to REVIEW with a comment explaining what was done
        ↓
You review and mark it DONE (or send it back with notes)
```

The agent never marks its own work as done — you always have the final say.

### Setup

1. **Install Claude Code** if you haven't already:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. **Customize the agent manual.** Open `CLAUDE.md` in the project root and fill in:
   - Your name
   - Your workspace names and IDs (find these in Settings or by querying the database)
   - Any external tools or integrations you've connected (MCP servers, APIs, etc.)
   - Context about your organization, team, and workflows

3. **Start Claude Code** from the Nexus project directory:
   ```bash
   cd nexus
   claude
   ```

4. **Assign tasks to the agent.** In the Nexus UI, create a task and set the assignee to "agent". Claude will find it when it checks its task queue.

### The Agent Manual (`CLAUDE.md`)

The `CLAUDE.md` file is the agent's operating manual. It contains:
- Database schemas so the agent knows how to read and write tasks
- The exact status workflow and rules (never mark DONE, always add review comments)
- SQL templates for common operations (finding tasks, creating tasks, logging activity)
- A section for your custom context — your business, team, tools, and preferences

This file gives the agent **continuity across sessions**. It doesn't need to be re-briefed. It reads the manual, checks its queue, and gets to work.

### Automated Agent Checks (Optional)

The `scripts/agent-check.sh` script launches Claude Code to check and execute agent tasks on a schedule. To use it:

1. Open `scripts/agent-check.sh` and update `NEXUS_DIR` to your project path
2. Run it manually or add it to a cron job:
   ```bash
   # Run every hour during work hours (8am-6pm)
   0 8-18 * * 1-5 /path/to/nexus/scripts/agent-check.sh >> /path/to/nexus/logs/agent.log 2>&1
   ```

---

## Project Structure

```
src/
  app/             # Next.js pages and API routes
    api/           # REST API endpoints for all data operations
    settings/      # Settings page (profile, workspaces, schedules, calendar feeds)
  components/      # React components organized by feature
    dashboard/     # Dashboard widgets and stats
    tasks/         # Task list, detail view, activity thread
    goals/         # Goal tracking, milestones, check-ins
    planner/       # Weekly planner, time blocks, auto-scheduler
    settings/      # Settings panels and dialogs
    ui/            # Shared UI primitives (shadcn/ui)
  hooks/           # TanStack Query hooks for data fetching and mutations
  lib/             # Utilities — database client, date helpers, calendar sync, validation schemas
prisma/
  schema.prisma    # Database schema (13 models)
  seed.ts          # Seeds default work schedules
scripts/
  setup.sh         # First-time setup (creates .env, database, seeds data)
  agent-check.sh   # Automated Claude Code agent task check
CLAUDE.md          # AI agent operating manual (customize this)
```

---

## Customization

- **Workspaces** — create, rename, recolor, and reorder via Settings or the welcome screen
- **Schedules** — configure work blocks (Deep Work, Meetings, Admin) with custom time windows per day
- **Profile** — set your name in Settings — it appears in the header and task assignments
- **Calendar Feeds** — add ICS links from Google Calendar, Outlook, Apple Calendar, or any ICS-compatible service
- **Agent Manual** — edit `CLAUDE.md` to define your agent's operating context, tools, and rules

---

## License

MIT
