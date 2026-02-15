import { z } from "zod/v4";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "BLOCKED", "DONE", "ARCHIVED"]).optional().default("TODO"),
  priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW", "BACKLOG"]).optional().default("MEDIUM"),
  dueDate: z.string().optional(),
  estimatedMins: z.number().int().positive().optional(),
  workspaceId: z.string().min(1, "Workspace is required"),
  goalId: z.string().optional(),
  agentBrief: z.string().optional(),
  createdBy: z.enum(["user", "agent"]).optional().default("user"),
  assignee: z.enum(["user", "agent"]).optional().default("user"),
  scheduleId: z.string().optional(),
  minChunkMins: z.number().int().positive().optional(),
  isHardDeadline: z.boolean().optional().default(false),
  autoSchedule: z.boolean().optional().default(true),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "BLOCKED", "DONE", "ARCHIVED"]).optional(),
  priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW", "BACKLOG"]).optional(),
  dueDate: z.string().nullable().optional(),
  estimatedMins: z.number().int().positive().nullable().optional(),
  workspaceId: z.string().optional(),
  goalId: z.string().nullable().optional(),
  agentBrief: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  assignee: z.enum(["user", "agent"]).optional(),
  scheduleId: z.string().nullable().optional(),
  minChunkMins: z.number().int().positive().nullable().optional(),
  isHardDeadline: z.boolean().optional(),
  autoSchedule: z.boolean().optional(),
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  color: z.string().min(1, "Color is required"),
  icon: z.string().min(1, "Icon is required"),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isArchived: z.boolean().optional(),
});

export const createGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  targetDate: z.string().optional(),
  workspaceId: z.string().min(1, "Workspace is required"),
  progressType: z.enum(["TASK_COUNT", "PERCENTAGE", "CUSTOM"]).optional().default("TASK_COUNT"),
  targetValue: z.number().int().positive().optional().default(100),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional().default("MEDIUM"),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  targetDate: z.string().nullable().optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "PAUSED"]).optional(),
  progressType: z.enum(["TASK_COUNT", "PERCENTAGE", "CUSTOM"]).optional(),
  targetValue: z.number().int().positive().optional(),
  currentValue: z.number().int().min(0).optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
});

export const createActivitySchema = z.object({
  type: z.enum(["COMMENT", "STATUS_CHANGE", "NOTE", "SYSTEM"]).optional().default("COMMENT"),
  content: z.string().min(1, "Content is required"),
  author: z.enum(["user", "agent"]).optional().default("user"),
  metadata: z.string().optional(),
});

export const createMilestoneSchema = z.object({
  title: z.string().min(1, "Title is required"),
  targetDate: z.string().optional(),
  description: z.string().optional(),
  targetValue: z.number().int().positive().optional(),
  unit: z.string().optional(),
});

export const updateMilestoneSchema = z.object({
  title: z.string().min(1).optional(),
  targetDate: z.string().nullable().optional(),
  isCompleted: z.boolean().optional(),
  description: z.string().nullable().optional(),
  targetValue: z.number().int().positive().nullable().optional(),
  currentValue: z.number().int().min(0).optional(),
  unit: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const createCheckInSchema = z.object({
  value: z.number().int().min(0, "Value must be 0 or greater"),
  note: z.string().optional(),
});

export const createScheduleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required"),
  isDefault: z.boolean().optional().default(false),
  windows: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  })).optional().default([]),
});

export const updateScheduleSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
  isDefault: z.boolean().optional(),
  windows: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
  })).optional(),
});

export const createTimeBlockSchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  title: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  taskId: z.string().optional(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "SKIPPED"]).optional().default("PLANNED"),
});

export const updateTimeBlockSchema = z.object({
  date: z.string().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  taskId: z.string().nullable().optional(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "SKIPPED"]).optional(),
  sortOrder: z.number().int().optional(),
});

export const createCalendarFeedSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Must be a valid URL"),
  color: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateCalendarFeedSchema = z.object({
  name: z.string().min(1).optional(),
  url: z.string().url().optional(),
  color: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const autoScheduleSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  dryRun: z.boolean().optional().default(false),
});

export type CreateTaskInput = z.input<typeof createTaskSchema>;
export type UpdateTaskInput = z.input<typeof updateTaskSchema>;
export type CreateWorkspaceInput = z.input<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.input<typeof updateWorkspaceSchema>;
export type CreateGoalInput = z.input<typeof createGoalSchema>;
export type UpdateGoalInput = z.input<typeof updateGoalSchema>;
export type CreateActivityInput = z.input<typeof createActivitySchema>;
export type CreateMilestoneInput = z.input<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.input<typeof updateMilestoneSchema>;
export type CreateCheckInInput = z.input<typeof createCheckInSchema>;
export type CreateScheduleInput = z.input<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.input<typeof updateScheduleSchema>;
export type CreateTimeBlockInput = z.input<typeof createTimeBlockSchema>;
export type UpdateTimeBlockInput = z.input<typeof updateTimeBlockSchema>;
export type CreateCalendarFeedInput = z.input<typeof createCalendarFeedSchema>;
export type UpdateCalendarFeedInput = z.input<typeof updateCalendarFeedSchema>;
export type AutoScheduleInput = z.input<typeof autoScheduleSchema>;

export const workflowStepSchema = z.object({
  title: z.string().min(1, "Step title is required"),
  stepType: z.enum(["instruction", "mcp_tool", "bash"]).optional().default("instruction"),
  instruction: z.string().min(1, "Instruction is required"),
  toolName: z.string().optional(),
  toolParams: z.string().optional(),
  sortOrder: z.number().int().min(0),
});

export const createWorkflowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  steps: z.array(workflowStepSchema).optional().default([]),
});

export const updateWorkflowSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  steps: z.array(workflowStepSchema).optional(),
});

export const createContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  notes: z.string().optional(),
  workspaceId: z.string().nullable().optional(),
});

export const updateContactSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  workspaceId: z.string().nullable().optional(),
});

export type WorkflowStepInput = z.input<typeof workflowStepSchema>;
export type CreateWorkflowInput = z.input<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.input<typeof updateWorkflowSchema>;
export type CreateContactInput = z.input<typeof createContactSchema>;
export type UpdateContactInput = z.input<typeof updateContactSchema>;
