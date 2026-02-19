'use client'

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function QueuedProjectCard({ project, position }: { project: string; position: number }) {
  return (
    <Link
      href={`/project/${project}`}
      className="block"
      aria-label={`View ${project} project (position ${position} in queue)`}
    >
      <Card
        className="cursor-pointer transition-all duration-200 hover:border-terminal-amber hover:shadow-[0_0_10px_rgba(255,170,0,0.1)] focus:ring-2 focus:ring-terminal-amber"
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            window.location.href = `/project/${project}`;
          }
        }}
      >
        <CardContent className="pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="bg-terminal-amber/10 text-terminal-amber border-terminal-amber font-mono text-sm"
            >
              #{position}
            </Badge>
            <span className="text-terminal-text font-mono font-semibold">
              {project}
            </span>
          </div>
          <Badge
            variant="outline"
            className="bg-terminal-dim/10 text-terminal-dim border-terminal-dim font-mono text-xs"
          >
            QUEUED
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
