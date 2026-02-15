# Nexus

## Your AI-powered operations team. Not another chatbot.

Nexus is a task management platform where AI agents don't just assist — they **execute**. Assign a task to your agent the same way you'd assign it to an employee. It picks up the work, completes it using your real tools and data, and sends it back for your approval. You stay in control. The work gets done.

---

## The Problem

You're running a business. You're also running the operations behind that business — updating spreadsheets, processing meeting notes, drafting documents, sending follow-ups, tracking deadlines, managing a pipeline. Every hour you spend on operations is an hour you're not spending on the work that actually grows your business.

You've tried AI tools. They're impressive in a chat window. But here's what happens in practice: you prompt the AI, copy the output, paste it into the right place, update your task list, remember to follow up, and do it all again tomorrow. **The AI helped, but you still managed everything.**

That's not leverage. That's a smarter clipboard.

---

## What Nexus Does Differently

### AI agents that own tasks, not just answer questions

In Nexus, your AI agent has a task queue — just like a team member. It checks what's assigned to it, picks up the next item, does the work, and hands it back to you for review. You don't manage the AI. You manage the output.

### A trust loop, not a black box

Every task follows a structured workflow:

**You assign** a task to the agent with context and priority.

**The agent works** — it researches, writes, updates spreadsheets, sends messages, creates deliverables. Real work against your real systems.

**The agent submits for review** — it sets the task to REVIEW, explains exactly what it did and what you need to check, and reassigns it to you.

**You approve or redirect** — mark it done, send it back with notes, or take it over yourself.

The agent never marks its own work as complete. You always have the final say. This isn't about replacing your judgment — it's about freeing up your time so you can use that judgment on what matters.

---

## Features

### Workspace Isolation

Run multiple businesses, clients, or projects from one app. Each workspace is a separate container with its own tasks, goals, schedules, and context. Your consulting firm, your side project, and your personal life don't bleed into each other.

The agent understands which workspace it's operating in and adapts accordingly.

### Smart Task Management

Every task carries the full picture:

- **Title and description** with rich context
- **Priority levels** — Urgent, High, Medium, Low
- **Assignee** — human or agent
- **Status tracking** — TODO, In Progress, Review, Blocked, Done, Archived
- **Due dates and time estimates** for realistic planning
- **Activity thread** — every comment, status change, and handoff is logged

Sort by priority, filter by assignee, track by deadline. See exactly what's on your plate and what's on the agent's plate.

### Meeting-to-Task Pipeline

Your meetings generate action items. Those action items usually live in a doc that nobody looks at again.

Nexus processes your meeting notes — transcripts from Plaud, Otter, Fireflies, Google Docs, or any other source — and **extracts every action item into a tracked task** with:

- The right owner assigned
- A clear deliverable defined
- A due date set
- Full context from the discussion preserved

A 60-minute meeting with 15 action items becomes 15 tracked, prioritized, assigned tasks in under a minute. Nothing falls through the cracks. Ever.

### Agent Operating Manual

Every Nexus instance includes a configuration file that acts as your agent's **operating manual**. It defines:

- How your business works and who the key people are
- What tools the agent has access to and how to use them
- The exact workflow rules — what it can do, what it can't, how to hand work back
- Communication standards — how to write comments, format deliverables, escalate issues
- Ready-to-use templates for common operations

This means **continuity across sessions**. The agent doesn't need to be re-trained or re-briefed. It reads the manual, checks its queue, and gets to work. Any session, any time, it picks up exactly where the last one left off. The state lives in the system, not in a conversation that expires.

### Real Integrations, Real Execution

The agent doesn't generate text for you to copy somewhere. It works directly in your systems:

**Google Sheets** — Updates your KPI scorecards, sales trackers, and dashboards. Not a draft of what to put in the sheet. The actual sheet, updated.

**Google Drive** — Searches and reads your documents. Pulls context from shared files to inform its work. Processes meeting notes stored in Drive automatically.

**Google Chat** — Sends deliverables and updates to your team members directly. Doesn't just draft a message — sends it.

**Google Calendar** — Views schedules and manages appointments.

**Gmail** — Reads incoming messages for context. Sends follow-ups and responses.

**Web Research** — Finds data, sources metrics, researches competitors, gathers information from across the internet with citations.

**Document Creation** — Writes reports, frameworks, proposals, playbooks, case studies, and any other deliverable. Saves them to your file system, ready to use or share.

### Goal Tracking

Set high-level goals and connect tasks to them. See progress toward quarterly objectives, client deliverables, or personal milestones. The agent prioritizes work that moves goals forward.

### Activity History

Every action on every task is logged — who did what, when, and why. Full audit trail of agent work, human decisions, status changes, and handoffs. Nothing happens silently.

### Color-Coded Status System

Visual status indicators across the board:

- **Gray** — TODO (waiting to start)
- **Blue** — In Progress (actively being worked)
- **Amber** — Review (agent completed, awaiting human approval)
- **Red** — Blocked (needs something to continue)
- **Green** — Done (human approved)

See the state of everything at a glance.

---

## Who This Is For

### Solo Operators and Founders

You're one person doing the job of five. Nexus gives you an operations team without the payroll. The agent handles research, document creation, data entry, meeting follow-ups, and administrative work. You focus on client relationships, strategic decisions, and the work only you can do.

**Before Nexus:** You attend a meeting, take notes, spend 30 minutes turning notes into tasks, then spend hours executing on the administrative items.

**With Nexus:** You attend the meeting. Nexus processes the notes into tasks. The agent completes what it can. You review over coffee. Your afternoon is free for client work.

### Small Teams (2-10 people)

Coordination overhead kills small teams. Nexus handles the project management layer — processing meetings into tasks, tracking who owes what by when, preparing status updates, maintaining shared dashboards, and flagging blockers before they become problems.

Your team spends less time in project management tools and more time doing the work those tools are supposed to track.

### Consultancies and Agencies

Multiple clients, multiple workspaces, one system. Each client gets isolated task management with the agent handling operational overhead — tracking deliverables, managing timelines, processing intake, drafting proposals, maintaining scorecards.

The agent context-switches between clients the way a dedicated project manager would. Except it doesn't take PTO, doesn't need to be managed, and costs a fraction of an FTE.

### Anyone Drowning in Administrative Work

If you spend more than 2 hours a day on tasks that don't require your unique human judgment — data entry, follow-up messages, document formatting, meeting note processing, spreadsheet updates, status tracking — Nexus gives those hours back.

---

## How It's Built

- **Local-first architecture** — your data stays on your machine. No cloud dependency for the core app. The database is a single portable file.
- **Modern web stack** — Next.js, React, Tailwind CSS. Fast, responsive, runs in your browser.
- **Lightweight database** — SQLite. No database server to configure or maintain. Backups are copying one file.
- **Open integration layer** — connects to Google Workspace, web APIs, and file systems through the Model Context Protocol (MCP). Extensible to any service with an API.
- **Real-time sync** — changes the agent makes appear in your UI immediately. You're both working on the same system.

---

## What Makes This Different From...

### ...Asana / Monday / ClickUp?

Those are task management tools for humans. Nexus is a task management tool for **humans and AI agents working together**. The agent isn't a sidebar feature or a chatbot bolted onto a project board. It's a first-class participant that reads its queue, executes work, and follows a defined workflow. The task system was designed from day one for this handoff pattern.

### ...ChatGPT / Claude / Copilot?

Those are conversational AI tools. You ask, they answer, and the conversation disappears. Nexus gives AI **persistent state and accountability**. Tasks carry over between sessions. Work is tracked and reviewed. The agent doesn't need to be re-briefed because the system remembers everything. It's the difference between texting a friend for advice and hiring an employee who shows up every day.

### ...AI automation tools (Zapier, Make, n8n)?

Those automate specific, predefined workflows. If X happens, do Y. Nexus handles **unstructured work** — the kind that requires judgment, research, writing, and multi-step execution. "Research our competitors and draft a comparison matrix" isn't a Zap. It's a task an agent can own.

### ...Virtual assistants (human)?

A human VA costs $2,000-5,000/month and handles 20-30 hours of work per week. They need onboarding, management, and communication overhead. Nexus agents work on demand, scale instantly, don't need PTO, and cost a fraction of the price. They also can't make phone calls or attend meetings in person — so for some tasks, you still need a human. Nexus makes that distinction clear by routing human-dependent tasks back to you with specific instructions on what needs your personal touch.

---

## The Bottom Line

Every business has two types of work: the work that requires human judgment and the work that doesn't. Most people spend most of their time on the second type.

Nexus doesn't replace you. It handles the operational load so you can focus on the strategic work that actually moves your business forward. Assign it tasks. Review its output. Approve and move on.

Your AI doesn't just answer questions anymore. It shows up, checks its task list, and gets to work.
