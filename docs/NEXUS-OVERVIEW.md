# Nexus: Human-Agent Task Management

## What It Is

Nexus is a task management system where **AI agents are full participants in the workflow, not just tools you query**. Tasks are assigned to either a human or an agent. The agent reads its queue, executes work, delivers results, and routes tasks back for human review — the same way a junior team member would.

The result: a solo operator or small team runs at the capacity of a much larger organization.

---

## The Core Problem

Most professionals juggle dozens of tasks across multiple projects. They attend meetings that generate action items, manage spreadsheets, draft documents, send follow-ups, and track progress — all manually. AI assistants today can answer questions and generate text, but they don't **own work**. You still have to manage everything yourself.

Nexus changes the relationship. Instead of asking an AI for help, you **assign it tasks** and it operates autonomously within defined boundaries.

---

## How It Works

### 1. Workspaces

Everything is organized into workspaces — separate containers for different businesses, clients, or areas of life. A consultant might have:

- **Company A** — client delivery, sales pipeline, internal ops
- **Company B** — a separate venture with its own tasks
- **Personal** — errands, appointments, personal projects

Each workspace has its own tasks, goals, and schedules. An agent working in one workspace has full context for that workspace without bleeding into others.

### 2. Tasks

Every task has:

- **Title and description** — what needs to be done and why
- **Assignee** — `user` (human) or `agent` (AI)
- **Status** — TODO, IN_PROGRESS, REVIEW, BLOCKED, DONE, ARCHIVED
- **Priority** — URGENT, HIGH, MEDIUM, LOW
- **Due date and time estimate** — for planning and accountability
- **Activity log** — a running thread of comments, status changes, and handoff notes

Tasks are the atomic unit of work. Everything flows through them.

### 3. The Human-Agent Workflow

This is what makes Nexus different from a standard task app.

```
Human creates/assigns task
        ↓
Agent picks up task (status → IN_PROGRESS)
        ↓
Agent executes work autonomously
  - Researches information
  - Creates documents and deliverables
  - Updates spreadsheets
  - Sends messages to team members
  - Makes API calls to external services
        ↓
Agent sets status → REVIEW
Agent reassigns → human
Agent adds comment: "Here's what I did. Here's what you need to check."
        ↓
Human reviews the work
  - Approves → DONE
  - Needs changes → reassigns back to agent with notes
  - Takes over → completes it themselves
```

The human never marks something DONE that they haven't reviewed. The agent never assumes its work is final. This creates a **trust loop** — the agent does the heavy lifting, the human maintains quality control.

### 4. Meeting-to-Task Pipeline

One of the highest-value workflows: the agent processes meeting notes (transcripts, recordings, shared docs) and automatically extracts every action item into tasks with:

- Who owns it
- What the deliverable is
- When it's due
- Full context from the meeting

A 60-minute meeting that generates 15 action items goes from "notes in a doc" to "tracked, assigned, and scheduled tasks" in under a minute. Nothing falls through the cracks.

### 5. External Integrations

The agent doesn't just manage a task list — it **executes work** through integrations:

| Integration | What the Agent Can Do |
|---|---|
| Google Drive | Search and read documents, pull context from shared files |
| Google Sheets | Read and update spreadsheets — KPI tracking, scorecards, data entry |
| Google Chat | Send messages and deliverables to team members |
| Google Calendar | View and manage scheduling |
| Gmail | Read and send emails |
| Web Search | Research topics, find data, source information |
| File System | Create documents, reports, frameworks, and deliverables |

The agent uses these tools as part of completing tasks — not as standalone actions. "Update the sales scorecard" becomes a task the agent picks up, executes against the actual spreadsheet, and returns for review.

---

## What This Looks Like at Scale

### For a Solo Operator

You run a consulting business alone. You have 5 active clients, a sales pipeline to manage, and internal projects to build.

- Monday morning: the agent has already processed your Friday meeting notes into 20 tasks, prioritized them, and started on the 8 it can handle autonomously.
- You review 8 completed items over coffee. Approve 6, send 2 back with notes.
- You focus your day on the 12 tasks that require your human judgment — client calls, strategic decisions, relationship-building.
- The agent handles research, document creation, data entry, follow-up messages, and scheduling in the background.

You're doing the work of a 3-person team.

### For a Small Team (2-5 people)

Each team member has tasks assigned to them. The agent handles the operational overhead:

- Processes all meeting notes into tasks and assigns them to the right person
- Tracks who's behind on deadlines and flags it
- Prepares meeting agendas based on open tasks and blockers
- Creates first drafts of deliverables for team members to refine
- Sends status updates and reminders via Google Chat
- Maintains shared spreadsheets and dashboards

The team spends less time on coordination and more time on execution.

### For an Agency or Consultancy

Multiple workspaces map to multiple clients. The agent becomes a **virtual operations layer**:

- Client A workspace: tracks deliverables, manages timelines, prepares status reports
- Client B workspace: processes intake forms, schedules onboarding tasks, drafts proposals
- Internal workspace: manages sales pipeline, tracks KPIs, processes meeting follow-ups

Each workspace is isolated. The agent context-switches between clients the way a dedicated project manager would, but without the overhead of another salary.

---

## The Agent Operating Manual

Every Nexus instance includes a `CLAUDE.md` file — an operating manual that any AI agent reads before starting work. It contains:

- **Database schemas** — how to read and write tasks
- **Workflow rules** — the exact status flow, what the agent can and can't do
- **SQL templates** — ready-to-use queries for finding work, creating tasks, adding comments
- **Integration guides** — how to use Google Drive, Sheets, Chat, and other connected services
- **Company context** — who the key people are, what the business does, current priorities
- **Communication standards** — how to write task comments, what format to use for deliverables

This means the agent doesn't need to be re-trained every session. It reads the manual, checks its task queue, and gets to work. Any agent — in any session — picks up exactly where the last one left off because the state lives in the database, not in conversation history.

---

## Technical Architecture

- **Frontend**: Next.js 16 with shadcn/ui components and Tailwind CSS 4
- **Database**: SQLite via Prisma 7 ORM — lightweight, portable, no server required
- **Agent Interface**: Direct SQLite read/write — the agent operates on the same database the UI renders
- **Integrations**: Google Workspace APIs via MCP (Model Context Protocol) — Drive, Sheets, Chat, Calendar, Gmail
- **State Management**: TanStack Query for real-time UI updates

The entire system runs locally. No cloud dependency for the core app. The database is a single file. Backups are trivial. The agent connects through the same database the user sees in the browser — changes are immediately visible to both.

---

## Why This Matters

The gap between "AI can help with tasks" and "AI can own tasks" is enormous. Most AI usage today is **pull-based** — you go to the AI, ask it something, copy the output, paste it somewhere, and move on. That workflow doesn't scale.

Nexus makes AI usage **push-based**. You assign work. The agent does it. You review. The overhead of managing the AI disappears because the AI manages itself within a structured system.

The limiting factor for most small businesses isn't ideas or capability — it's **execution capacity**. Nexus multiplies that capacity by turning every AI interaction into tracked, reviewable, completable work.
