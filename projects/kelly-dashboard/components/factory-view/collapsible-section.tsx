"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useViewPrefs } from "@/components/factory-view/view-prefs-provider";

export type CollapsibleSectionProps = {
  /** Stable section id used for persistence */
  id: string;
  title: string;
  /** Optional count badge (can be dynamic) */
  count?: React.ReactNode;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function CollapsibleSection({
  id,
  title,
  count,
  defaultCollapsed = false,
  children,
  className,
}: CollapsibleSectionProps) {
  const contentId = `collapsible-section-${id}`;

  const { collapsedSections, setSectionCollapsed } = useViewPrefs();
  const collapsed = collapsedSections[id] ?? defaultCollapsed;

  const toggle = React.useCallback(() => {
    setSectionCollapsed(id, !collapsed);
  }, [collapsed, id, setSectionCollapsed]);

  return (
    <Card
      className={cn(
        "border-terminal-dim/30 bg-terminal-card",
        "transition-colors duration-200",
        collapsed ? "hover:border-terminal-dim/40" : "hover:border-terminal-amber/40",
        className,
      )}
    >
      <CardContent className="pt-4 pb-6">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-controls={contentId}
          className={cn(
            // Make the entire header row (including surrounding whitespace) clickable,
            // not just the title text.
            "w-full text-left cursor-pointer",
            "px-2 py-2 -mx-2 -mt-2",
            "rounded-md focus:outline-none focus:ring-2 focus:ring-terminal-amber/70",
            "transition-colors duration-200",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-terminal-text font-mono font-semibold truncate text-lg">
                  {title}
                </h2>
                {typeof count !== "undefined" && count !== null && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "bg-terminal-amber/10 text-terminal-amber border-terminal-amber",
                      "font-mono text-xs",
                    )}
                  >
                    {count}
                  </Badge>
                )}
              </div>
            </div>

            <span
              className={cn(
                "mt-0.5 inline-flex items-center justify-center",
                "transition-all duration-200",
              )}
              aria-hidden="true"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-terminal-dim",
                  "transition-transform duration-200",
                  !collapsed && "rotate-180 text-terminal-amber",
                )}
              />
            </span>
          </div>
        </button>

        <div
          id={contentId}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
            collapsed ? "grid-rows-[0fr] opacity-80" : "grid-rows-[1fr] opacity-100",
          )}
        >
          <div className="overflow-hidden">
            <div className={cn("pt-4", collapsed && "pointer-events-none")}>{children}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
