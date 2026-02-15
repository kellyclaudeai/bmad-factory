import { StatsCards } from "@/components/factory-view/stats-cards";
import { HealthDashboard } from "@/components/factory-view/health-dashboard";
import { AgentList } from "@/components/factory-view/agent-list";
import { HistoricalProjects } from "@/components/factory-view/historical-projects";
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

export default function FactoryView() {
  return (
    <div className="min-h-screen bg-terminal-bg p-8 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-4xl font-mono font-bold text-terminal-green mb-2">
          Kelly Software Factory
        </h1>
        <p className="text-terminal-dim font-mono text-sm">
          Dashboard v1.0 • Real-time monitoring • Updated every 10s
        </p>
      </header>

      <main className="space-y-8">
        {/* Stats Cards Section */}
        <section className="animate-fade-in">
          <h2 className="text-lg font-mono font-semibold text-terminal-text mb-4 flex items-center gap-2">
            <span className="text-terminal-green">▸</span>
            Project Statistics
          </h2>
          <Suspense fallback={<StatsCardsSkeleton />}>
            <StatsCards />
          </Suspense>
        </section>

        {/* Health Dashboard Section */}
        <section className="animate-fade-in">
          <h2 className="text-lg font-mono font-semibold text-terminal-text mb-4 flex items-center gap-2">
            <span className="text-terminal-green">▸</span>
            Factory Health
          </h2>
          <HealthDashboard />
        </section>

        {/* Active Agents Section */}
        <section className="animate-fade-in">
          <h2 className="text-lg font-mono font-semibold text-terminal-text mb-4 flex items-center gap-2">
            <span className="text-terminal-green">▸</span>
            Active Agents
          </h2>
          <AgentList />
        </section>

        {/* Historical Projects Section */}
        <section className="animate-fade-in">
          <h2 className="text-lg font-mono font-semibold text-terminal-text mb-4 flex items-center gap-2">
            <span className="text-terminal-green">▸</span>
            Historical Projects
          </h2>
          <HistoricalProjects />
        </section>
      </main>
    </div>
  );
}
