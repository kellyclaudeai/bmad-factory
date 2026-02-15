"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useViewPrefs } from "@/components/factory-view/view-prefs-provider";

export function ViewControls({
  sectionIds,
  className,
}: {
  sectionIds: string[];
  className?: string;
}) {
  const { collapseAll, expandAll } = useViewPrefs();

  return (
    <div
      className={cn(
        "rounded-lg border border-terminal-border bg-terminal-card/80",
        "backdrop-blur supports-[backdrop-filter]:bg-terminal-card/60",
        "px-4 py-3",
        className,
      )}
    >
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          className="font-mono text-xs"
          onClick={() => collapseAll(sectionIds)}
        >
          Collapse all
        </Button>
        <Button
          type="button"
          variant="outline"
          className="font-mono text-xs"
          onClick={() => expandAll(sectionIds)}
        >
          Expand all
        </Button>
      </div>
    </div>
  );
}
