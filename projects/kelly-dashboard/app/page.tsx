import { ActiveProjectLeads } from "@/components/factory-view/active-project-leads";
import { NowRunning } from "@/components/factory-view/now-running";
import { ShippedProjects, ReadyToStartProjects } from "@/components/factory-view/project-lists";
import { CollapsibleSection } from "@/components/factory-view/collapsible-section";
import { ViewPrefsProvider } from "@/components/factory-view/view-prefs-provider";
import { ActiveProjectsCount, SessionsCount } from "@/components/factory-view/section-counts";

export default function FactoryView() {
  return (
    <ViewPrefsProvider>
    <div className="min-h-screen bg-terminal-bg p-8 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-4xl font-mono font-bold text-terminal-green mb-2">
          Kelly Software Factory
        </h1>
        <p className="text-terminal-dim font-mono text-sm">
          Real-time monitoring • Updates every 10s
        </p>
      </header>

      <main className="space-y-6">
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
          id="shipped-projects"
          title="Shipped Projects"
          defaultCollapsed={true}
        >
          <ShippedProjects />
        </CollapsibleSection>

        <CollapsibleSection
          id="ready-to-start"
          title="Ready to Start Projects"
          defaultCollapsed={true}
        >
          <ReadyToStartProjects />
        </CollapsibleSection>
      </main>
    </div>
    </ViewPrefsProvider>
  );
}
