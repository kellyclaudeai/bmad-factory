"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useViewPrefs } from "@/components/factory-view/view-prefs-provider";

export function ViewControls({
  sectionIds,
  className,
}: {
  sectionIds: string[];
  className?: string;
}) {
  const {
    compactMode,
    showDescriptions,
    setCompactMode,
    setShowDescriptions,
    collapseAll,
    expandAll,
  } = useViewPrefs();

  return (
    <div
      className={cn(
        "rounded-lg border border-terminal-border bg-terminal-card/80",
        "backdrop-blur supports-[backdrop-filter]:bg-terminal-card/60",
        "px-4 py-3",
        className,
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={compactMode}
              onCheckedChange={(v) => setCompactMode(Boolean(v))}
              id="compact-mode"
            />
            <label
              htmlFor="compact-mode"
              className="text-terminal-text font-mono text-xs select-none"
            >
              Compact
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={showDescriptions}
              onCheckedChange={(v) => setShowDescriptions(Boolean(v))}
              id="show-descriptions"
            />
            <label
              htmlFor="show-descriptions"
              className="text-terminal-text font-mono text-xs select-none"
            >
              Descriptions
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
    </div>
  );
}
