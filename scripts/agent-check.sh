#!/bin/bash
# Nexus Agent Hourly Check
# Runs Claude Code in a new Terminal window to check and execute tasks
# Customize the paths and tools below for your setup.

HOUR=$(date +%H)

# Only run between 8am and 6pm
if [ "$HOUR" -lt 8 ] || [ "$HOUR" -gt 18 ]; then
  echo "$(date): Outside working hours ($HOUR), skipping."
  exit 0
fi

echo "$(date): Starting Nexus agent check..."

# UPDATE THESE PATHS TO MATCH YOUR SETUP
NEXUS_DIR="<PATH_TO_YOUR_NEXUS_PROJECT>"
CLAUDE_BIN="claude"

PROMPT="You are the PM/EA agent for Nexus. Read $NEXUS_DIR/CLAUDE.md for your full operating manual.

Your hourly checklist:
1. Check for tasks assigned to you (assignee = 'agent') that are TODO or IN_PROGRESS
2. Check for overdue tasks across all workspaces and flag them
3. Execute any tasks assigned to you that you can complete autonomously
4. For each task you complete: set status to REVIEW, reassign to user, add a comment explaining what you did and what needs review

Start by running your task queue query against the database at $NEXUS_DIR/prisma/nexus.db and report what you find."

osascript -e "
tell application \"Terminal\"
    activate
    set newTab to do script \"cd $NEXUS_DIR && $CLAUDE_BIN --allowedTools 'Bash,Read,Write,Edit,Glob,Grep,WebFetch,WebSearch' -p \\\"$PROMPT\\\"\"
end tell
"

echo "$(date): Agent check launched."
