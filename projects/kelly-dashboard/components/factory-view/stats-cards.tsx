import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FactoryState = {
  active: string[];
  queued: string[];
  completed: string[];
  shipped: string[];
};

async function getFactoryState(): Promise<FactoryState> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3005';
    const res = await fetch(`${baseUrl}/api/factory-state`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!res.ok) {
      console.error('Failed to fetch factory state:', res.status);
      return { active: [], queued: [], completed: [], shipped: [] };
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching factory state:', error);
    return { active: [], queued: [], completed: [], shipped: [] };
  }
}

export async function StatsCards() {
  const factoryState = await getFactoryState();

  const stats = [
    {
      label: "Active",
      count: factoryState.active.length,
      description: "Projects in progress",
      color: "text-terminal-green"
    },
    {
      label: "Queued",
      count: factoryState.queued.length,
      description: "Waiting to start",
      color: "text-terminal-amber"
    },
    {
      label: "Completed",
      count: factoryState.completed.length,
      description: "Finished projects",
      color: "text-terminal-green"
    },
    {
      label: "Shipped",
      count: factoryState.shipped.length,
      description: "Delivered to production",
      color: "text-terminal-green"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card 
          key={stat.label}
          className="transition-all duration-200 hover:border-terminal-green hover:shadow-[0_0_10px_rgba(0,255,136,0.1)]"
          role="article"
          aria-label={`${stat.label} projects: ${stat.count}`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono font-medium text-terminal-dim">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-mono font-bold ${stat.color}`}>
              {stat.count}
            </div>
            <p className="mt-2 text-xs text-terminal-dim">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
