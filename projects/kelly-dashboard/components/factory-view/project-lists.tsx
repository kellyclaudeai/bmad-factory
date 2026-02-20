"use client";

import { useAutoRefresh } from "@/components/shared/auto-refresh";
import { Card, CardContent } from "@/components/ui/card";

type ProjectEntry = {
  id: string;
  name: string;
  phase: string;
  createdAt?: string;
};

type FactoryProjects = {
  shipped: ProjectEntry[];
  readyToStart: ProjectEntry[];
};

function humanize(id: string) {
  return id
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\d{4}-\d{2}-\d{2}-\d{4}$/, "")
    .trim();
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="border-terminal-border/30">
      <CardContent className="pt-6 text-center">
        <p className="text-terminal-dim font-mono text-sm">{message}</p>
      </CardContent>
    </Card>
  );
}

function ProjectRow({ project, href }: { project: ProjectEntry; href?: string }) {
  const name = project.name !== project.id ? project.name : humanize(project.id);
  const content = (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-terminal-border bg-terminal-card hover:border-terminal-green/50 transition-colors">
      <span className="font-mono text-terminal-text text-sm truncate">{name}</span>
      {project.createdAt && (
        <span className="font-mono text-terminal-dim text-xs ml-4 flex-shrink-0">
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
      )}
    </div>
  );

  if (href) {
    return <a href={href} className="block">{content}</a>;
  }
  return content;
}

export function ShippedProjects() {
  const { data, isLoading } = useAutoRefresh<FactoryProjects>("/api/factory-projects", 30000);
  const shipped = data?.shipped ?? [];

  if (isLoading && !data) {
    return <p className="text-terminal-dim font-mono text-sm">Loading...</p>;
  }
  if (shipped.length === 0) {
    return <EmptyState message="No shipped projects yet" />;
  }
  return (
    <div className="space-y-2">
      {shipped.map((p) => (
        <ProjectRow key={p.id} project={p} href={`/project/${p.id}`} />
      ))}
    </div>
  );
}

export function ReadyToStartProjects() {
  const { data, isLoading } = useAutoRefresh<FactoryProjects>("/api/factory-projects", 30000);
  const queue = data?.readyToStart ?? [];

  if (isLoading && !data) {
    return <p className="text-terminal-dim font-mono text-sm">Loading...</p>;
  }
  if (queue.length === 0) {
    return <EmptyState message="No ideas in the queue" />;
  }
  return (
    <div className="space-y-2">
      {queue.map((p) => (
        <ProjectRow key={p.id} project={p} />
      ))}
    </div>
  );
}
