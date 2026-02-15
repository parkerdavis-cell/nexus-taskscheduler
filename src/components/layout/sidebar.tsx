"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CheckSquare,
  Calendar,
  CalendarDays,
  Target,
  Users,
  Zap,
  Bot,
  Settings,
  Ship,
  Building,
  User,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const ICON_MAP: Record<string, React.ElementType> = {
  ship: Ship,
  building: Building,
  user: User,
};

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/planner", label: "Planner", icon: Calendar },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/week", label: "Calendar", icon: CalendarDays },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/workflows", label: "Workflows", icon: Zap },
  { href: "/agent", label: "Agent", icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: workspaces } = useWorkspaces();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-56 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Layers className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground tracking-tight">
          NEXUS
        </span>
      </div>

      <ScrollArea className="flex-1 px-2">
        <nav className="space-y-1 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Separator className="my-2 bg-sidebar-border" />

        <div className="py-2">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Spaces
          </p>
          <Link
            href="/tasks"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/tasks" && !new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("workspace")
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Layers className="h-4 w-4" />
            All
          </Link>
          {workspaces?.map((ws) => {
            const Icon = ICON_MAP[ws.icon] || Layers;
            return (
              <Link
                key={ws.id}
                href={`/tasks?workspace=${ws.slug}`}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <div
                  className="flex h-4 w-4 items-center justify-center rounded"
                  style={{ backgroundColor: ws.color + "20" }}
                >
                  <Icon className="h-3 w-3" style={{ color: ws.color }} />
                </div>
                {ws.name}
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-2">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
