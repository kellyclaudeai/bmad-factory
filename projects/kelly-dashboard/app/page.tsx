import { StatsCards } from "@/components/factory-view/stats-cards";
import { HealthDashboard } from "@/components/factory-view/health-dashboard";
import { ActiveProjectLeads } from "@/components/factory-view/active-project-leads";
import { ResearchCards } from "@/components/research-view/research-cards";
import { NowRunning } from "@/components/factory-view/now-running";
import { NextUp } from "@/components/factory-view/next-up";
import { HistoricalProjects } from "@/components/factory-view/historical-projects";
import { CollapsibleSection } from "@/components/factory-view/collapsible-section";
import { ViewControls } from "@/components/factory-view/view-controls";
import { ViewPrefsProvider } from "@/components/factory-view/view-prefs-provider";
import { ActiveProjectsCount, SessionsCount, ResearchCount } from "@/components/factory-view/section-counts";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-lg border border-terminal-border bg-terminal-card p-6">
          <Skeleton className="h-4 w-20 mb-4" />
          <Skeleton className="h-9 w-12 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

function NextUpSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-lg border border-terminal-border bg-terminal-card p-4">
          <Skeleton className="h-6 w-full" />
        </div>
      ))}
    </div>
  );
}

type FactoryState = {
  active: string[];
  queued: string[];
  completed: string[];
  shipped: string[];
};

async function getFactoryState(): Promise<FactoryState> {
  try {
    const response = await fetch("http://localhost:3000/api/factory-state", {
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Failed to fetch factory state");
    return await response.json();
  } catch {
    return { active: [], queued: [], completed: [], shipped: [] };
  }
}

export default async function FactoryView() {
  const factoryState = await getFactoryState();
  const queuedCount = factoryState.queued.length;

  const sectionIds = [
    "active-research",
    "active-projects",
    "openclaw-sessions",
    "queued-projects",
    "project-statistics",
    "factory-health",
    "completed-shipped",
  ];

  return (
    <ViewPrefsProvider>
      <div className="min-h-screen bg-terminal-bg p-8 animate-fade-in">
        <header className="mb-4">
          <h1 className="text-4xl font-mono font-bold text-terminal-green mb-2">
            Kelly Software Factory
          </h1>
          <p className="text-terminal-dim font-mono text-sm">
            Dashboard v1.1 • Real-time monitoring • Updated every 10s
          </p>
        </header>

        <div className="sticky top-0 z-20 -mx-8 px-8 py-3 bg-terminal-bg/80 backdrop-blur supports-[backdrop-filter]:bg-terminal-bg/60 border-b border-terminal-border">
          <ViewControls sectionIds={sectionIds} />
        </div>

        <main className="mt-6 space-y-6">
          <CollapsibleSection
            id="active-research"
            title="Active Research"
            count={<ResearchCount />}
            defaultCollapsed={false}
          >
            <ResearchCards />
          </CollapsibleSection>

          <CollapsibleSection
            id="active-projects"
            title="Active Projects"
            count={<ActiveProjectsCount />}
            defaultCollapsed={false}
          >
            <ActiveProjectLeads />
          </CollapsibleSection>

          <CollapsibleSection
            id="openclaw-sessions"
            title="OpenClaw Sessions"
            count={<SessionsCount />}
            defaultCollapsed={false}
          >
            <NowRunning />
          </CollapsibleSection>

          <CollapsibleSection
            id="queued-projects"
            title="Queued Projects"
            count={queuedCount}
            // Expanded only if queue length > 0.
            defaultCollapsed={queuedCount === 0}
          >
            <Suspense fallback={<NextUpSkeleton />}>
              <NextUp />
            </Suspense>
          </CollapsibleSection>

          <CollapsibleSection
            id="project-statistics"
            title="Project Statistics"
            defaultCollapsed={true}
          >
            <Suspense fallback={<StatsCardsSkeleton />}>
              <StatsCards />
            </Suspense>
          </CollapsibleSection>

          <CollapsibleSection
            id="factory-health"
            title="Factory Health"
            defaultCollapsed={true}
          >
            <HealthDashboard />
          </CollapsibleSection>

          <CollapsibleSection
            id="completed-shipped"
            title="Completed / Shipped Projects"
            defaultCollapsed={true}
          >
            <HistoricalProjects />
          </CollapsibleSection>
        </main>
      </div>
    </ViewPrefsProvider>
  );
}
