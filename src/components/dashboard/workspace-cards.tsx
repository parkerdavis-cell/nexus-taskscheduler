"use client";

import Link from "next/link";
import { Ship, Building, User, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ICON_MAP: Record<string, React.ElementType> = {
  ship: Ship,
  building: Building,
  user: User,
};

interface WorkspaceWithCount {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  _count: { tasks: number };
}

export function WorkspaceCards({ workspaces }: { workspaces: WorkspaceWithCount[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {workspaces.map((ws) => {
        const Icon = ICON_MAP[ws.icon] || Layers;
        return (
          <Link key={ws.id} href={`/tasks?workspace=${ws.slug}`}>
            <Card className="transition-colors hover:bg-card/80 cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: ws.color + "20" }}
                >
                  <Icon className="h-5 w-5" style={{ color: ws.color }} />
                </div>
                <div>
                  <p className="text-sm font-medium">{ws.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ws._count.tasks} active {ws._count.tasks === 1 ? "task" : "tasks"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
