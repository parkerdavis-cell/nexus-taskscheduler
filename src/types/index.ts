export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "BLOCKED" | "DONE" | "ARCHIVED";
export type TaskPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW" | "BACKLOG";
export type GoalStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "PAUSED";
export type GoalProgressType = "TASK_COUNT" | "PERCENTAGE" | "CUSTOM";
export type TimeBlockStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
export type BusyStatus = "BUSY" | "FREE" | "TENTATIVE";
export type ActivityType = "COMMENT" | "STATUS_CHANGE" | "NOTE" | "SYSTEM" | "ASSIGNMENT";
export type Assignee = "user" | "agent";
export type Author = "user" | "agent";

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  BACKLOG: 4,
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  URGENT: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#f59e0b",
  LOW: "#3b82f6",
  BACKLOG: "#6b7280",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  BLOCKED: "Blocked",
  DONE: "Done",
  ARCHIVED: "Archived",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: "#6b7280",
  IN_PROGRESS: "#3b82f6",
  REVIEW: "#f59e0b",
  BLOCKED: "#ef4444",
  DONE: "#22c55e",
  ARCHIVED: "#9ca3af",
};

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  PAUSED: "Paused",
};

export type GoalPriority = "HIGH" | "MEDIUM" | "LOW";

export const GOAL_PRIORITY_LABELS: Record<GoalPriority, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const GOAL_PRIORITY_COLORS: Record<GoalPriority, string> = {
  HIGH: "#f97316",
  MEDIUM: "#3b82f6",
  LOW: "#6b7280",
};

export type WorkflowStepType = "instruction" | "mcp_tool" | "bash";

export const STEP_TYPE_LABELS: Record<WorkflowStepType, string> = {
  instruction: "Instruction",
  mcp_tool: "MCP Tool",
  bash: "Bash Command",
};

export const STEP_TYPE_COLORS: Record<WorkflowStepType, string> = {
  instruction: "#3b82f6",
  mcp_tool: "#8b5cf6",
  bash: "#10b981",
};
