import { Card, CardContent } from "@/components/ui/card";
import { QueuedProjectCard } from "./queued-project-card";

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
