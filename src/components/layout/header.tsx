"use client";

import { format } from "date-fns";
import { getGreeting } from "@/lib/date-utils";
import { QuickAddTask } from "@/components/dashboard/quick-add-task";
import { useUserName } from "@/hooks/use-user-profile";

export function Header() {
  const { data: profile } = useUserName();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-6">
      <div>
        <h1 className="text-sm font-medium text-foreground">
          {getGreeting()}, {profile?.name ?? "User"}.
        </h1>
        <p className="text-xs text-muted-foreground">
          {format(new Date(), "EEEE, MMM d, yyyy")}
        </p>
      </div>
      <QuickAddTask />
    </header>
  );
}
