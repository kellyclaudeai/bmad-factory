import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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
    
    if (!response.ok) {
      throw new Error("Failed to fetch factory state");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching factory state:", error);
    return { active: [], queued: [], completed: [], shipped: [] };
  }
}

function QueuedProjectCard({ project, position }: { project: string; position: number }) {
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

export async function NextUp() {
  const factoryState = await getFactoryState();
  const queuedProjects = factoryState.queued;

  if (queuedProjects.length === 0) {
    return (
      <Card className="border-terminal-dim/30 bg-terminal-card">
        <CardContent className="pt-6 text-center">
          <p className="text-terminal-dim font-mono text-sm">
            No projects in queue
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {queuedProjects.slice(0, 5).map((project, index) => (
        <QueuedProjectCard
          key={project}
          project={project}
          position={index + 1}
        />
      ))}
      {queuedProjects.length > 5 && (
        <Card className="border-terminal-dim/20">
          <CardContent className="pt-4 text-center">
            <p className="text-terminal-dim font-mono text-xs">
              + {queuedProjects.length - 5} more in queue
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
