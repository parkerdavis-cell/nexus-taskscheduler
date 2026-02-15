"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { Layers, Trash2, Plus, Clock, RefreshCw, Calendar, AlertCircle, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useWorkspaces,
  useDeleteWorkspace,
} from "@/hooks/use-workspaces";
import {
  useSchedules,
  useDeleteSchedule,
} from "@/hooks/use-schedules";
import {
  useCalendarFeeds,
  useDeleteCalendarFeed,
  useSyncCalendarFeed,
  useSyncAllCalendarFeeds,
} from "@/hooks/use-calendar-feeds";
import { WorkspaceFormDialog, ICON_MAP, COLOR_OPTIONS } from "@/components/settings/workspace-form-dialog";
import { ScheduleFormDialog } from "@/components/settings/schedule-form-dialog";
import { CalendarFeedDialog } from "@/components/settings/calendar-feed-dialog";
import { useUserName, useUpdateUserName } from "@/hooks/use-user-profile";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const { data: workspaces } = useWorkspaces();
  const deleteWorkspace = useDeleteWorkspace();

  const { data: schedules } = useSchedules();
  const deleteSchedule = useDeleteSchedule();

  const { data: calendarFeeds } = useCalendarFeeds();
  const deleteCalendarFeed = useDeleteCalendarFeed();
  const syncFeed = useSyncCalendarFeed();
  const syncAllFeeds = useSyncAllCalendarFeeds();

  const { data: profile } = useUserName();
  const updateUserName = useUpdateUserName();
  const [nameInput, setNameInput] = useState("");
  const nameInitialized = useRef(false);

  useEffect(() => {
    if (profile?.name && !nameInitialized.current) {
      setNameInput(profile.name);
      nameInitialized.current = true;
    }
  }, [profile?.name]);

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    updateUserName.mutate(nameInput.trim(), {
      onSuccess: () => toast.success("Name updated"),
      onError: () => toast.error("Failed to update name"),
    });
  };

  // Workspace dialog state
  const [wsDialogOpen, setWsDialogOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<
    { id: string; name: string; slug: string; color: string; icon: string } | undefined
  >();

  // Schedule dialog state
  const [schedDialogOpen, setSchedDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<
    { id: string; name: string; color: string; isDefault: boolean; windows: { dayOfWeek: number; startTime: string; endTime: string }[] } | undefined
  >();

  // Calendar feed dialog state
  const [feedDialogOpen, setFeedDialogOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<
    { id: string; name: string; url: string; color: string | null; isActive: boolean } | undefined
  >();
  const [syncingFeedId, setSyncingFeedId] = useState<string | null>(null);

  const handleDeleteWorkspace = (e: React.MouseEvent, id: string, wsName: string) => {
    e.stopPropagation();
    if (!confirm(`Delete "${wsName}"? All tasks and goals in this workspace will be permanently deleted.`)) return;
    deleteWorkspace.mutate(id, {
      onSuccess: () => toast.success("Workspace deleted"),
      onError: () => toast.error("Failed to delete workspace"),
    });
  };

  const handleDeleteFeed = (e: React.MouseEvent, id: string, feedName: string) => {
    e.stopPropagation();
    if (!confirm(`Delete "${feedName}"? Its synced events will also be removed.`)) return;
    deleteCalendarFeed.mutate(id, {
      onSuccess: () => toast.success("Calendar feed deleted"),
      onError: () => toast.error("Failed to delete feed"),
    });
  };

  const handleSyncFeed = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSyncingFeedId(id);
    syncFeed.mutate(id, {
      onSuccess: (data) => {
        toast.success(`Synced ${data.synced} events`);
        setSyncingFeedId(null);
      },
      onError: () => {
        toast.error("Sync failed");
        setSyncingFeedId(null);
      },
    });
  };

  const handleSyncAll = () => {
    syncAllFeeds.mutate(undefined, {
      onSuccess: (results) => {
        const total = results.reduce((sum: number, r: { synced?: number }) => sum + (r.synced || 0), 0);
        const errors = results.filter((r: { error?: string }) => r.error).length;
        if (errors > 0) {
          toast.warning(`Synced ${total} events, ${errors} feed(s) failed`);
        } else {
          toast.success(`Synced ${total} events from ${results.length} feed(s)`);
        }
      },
      onError: () => toast.error("Sync all failed"),
    });
  };

  const handleDeleteSchedule = (e: React.MouseEvent, id: string, schedName: string) => {
    e.stopPropagation();
    if (!confirm(`Delete "${schedName}" schedule?`)) return;
    deleteSchedule.mutate(id, {
      onSuccess: () => toast.success("Schedule deleted"),
      onError: () => toast.error("Failed to delete"),
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Your Name</label>
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name"
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              />
            </div>
            <Button
              size="sm"
              onClick={handleSaveName}
              disabled={updateUserName.isPending || nameInput.trim() === profile?.name}
              className="gap-1"
            >
              <Check className="h-4 w-4" />
              Save
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            This name appears in the header greeting and task assignments.
          </p>
        </CardContent>
      </Card>

      {/* Workspaces */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Workspaces</CardTitle>
          <Button
            size="sm"
            className="gap-1"
            onClick={() => {
              setEditingWorkspace(undefined);
              setWsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {workspaces?.map((ws) => {
            const Icon = ICON_MAP[ws.icon] || Layers;
            return (
              <div
                key={ws.id}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                onClick={() => {
                  setEditingWorkspace(ws);
                  setWsDialogOpen(true);
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: ws.color + "20" }}
                  >
                    <Icon className="h-4 w-4" style={{ color: ws.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{ws.name}</p>
                    <p className="text-xs text-muted-foreground">{ws.slug}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDeleteWorkspace(e, ws.id, ws.name)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Schedules */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Schedules</CardTitle>
          <Button
            size="sm"
            className="gap-1"
            onClick={() => {
              setEditingSchedule(undefined);
              setSchedDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {schedules?.map((sched: { id: string; name: string; color: string; isDefault: boolean; windows: { dayOfWeek: number; startTime: string; endTime: string }[] }) => (
            <div
              key={sched.id}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
              onClick={() => {
                setEditingSchedule(sched);
                setSchedDialogOpen(true);
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: sched.color + "20" }}
                >
                  <Clock className="h-4 w-4" style={{ color: sched.color }} />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {sched.name}
                    {sched.isDefault && (
                      <span className="ml-2 text-[10px] text-muted-foreground">(default)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sched.windows.length > 0
                      ? sched.windows
                          .slice(0, 3)
                          .map((w) => `${DAY_LABELS[w.dayOfWeek]} ${w.startTime}-${w.endTime}`)
                          .join(", ") + (sched.windows.length > 3 ? ` +${sched.windows.length - 3} more` : "")
                      : "No windows"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleDeleteSchedule(e, sched.id, sched.name)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
          {(!schedules || schedules.length === 0) && (
            <p className="py-4 text-center text-sm text-muted-foreground">No schedules yet</p>
          )}
        </CardContent>
      </Card>

      {/* Calendar Feeds */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Calendar Feeds</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={handleSyncAll}
              disabled={syncAllFeeds.isPending}
            >
              <RefreshCw className={`h-4 w-4 ${syncAllFeeds.isPending ? "animate-spin" : ""}`} />
              Sync All
            </Button>
            <Button
              size="sm"
              className="gap-1"
              onClick={() => {
                setEditingFeed(undefined);
                setFeedDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Feed
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {calendarFeeds?.map((feed: { id: string; name: string; url: string; color: string | null; isActive: boolean; lastSynced: string | null; syncError: string | null }) => (
            <div
              key={feed.id}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
              onClick={() => {
                setEditingFeed(feed);
                setFeedDialogOpen(true);
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: (feed.color || "#6b7280") + "20" }}
                >
                  <Calendar className="h-4 w-4" style={{ color: feed.color || "#6b7280" }} />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {feed.name}
                    {!feed.isActive && (
                      <span className="ml-2 text-[10px] text-muted-foreground">(paused)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {feed.lastSynced
                      ? `Synced ${new Date(feed.lastSynced).toLocaleString()}`
                      : "Never synced"}
                  </p>
                  {feed.syncError && (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {feed.syncError}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleSyncFeed(e, feed.id)}
                  disabled={syncingFeedId === feed.id}
                >
                  <RefreshCw className={`h-4 w-4 text-muted-foreground ${syncingFeedId === feed.id ? "animate-spin" : ""}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDeleteFeed(e, feed.id, feed.name)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {(!calendarFeeds || calendarFeeds.length === 0) && (
            <p className="py-4 text-center text-sm text-muted-foreground">No calendar feeds yet</p>
          )}
        </CardContent>
      </Card>

      {/* Database info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Database</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>SQLite database at <code className="text-xs bg-muted px-1 py-0.5 rounded">prisma/nexus.db</code></p>
          <p className="mt-1">
            Claude can read/write directly via <code className="text-xs bg-muted px-1 py-0.5 rounded">sqlite3</code> commands.
          </p>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <WorkspaceFormDialog
        open={wsDialogOpen}
        onOpenChange={setWsDialogOpen}
        workspace={editingWorkspace}
      />
      <ScheduleFormDialog
        open={schedDialogOpen}
        onOpenChange={setSchedDialogOpen}
        schedule={editingSchedule}
      />
      <CalendarFeedDialog
        open={feedDialogOpen}
        onOpenChange={setFeedDialogOpen}
        feed={editingFeed}
      />
    </div>
  );
}
