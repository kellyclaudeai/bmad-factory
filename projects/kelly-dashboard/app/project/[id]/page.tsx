import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ProjectDetailProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetail({ params }: ProjectDetailProps) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-terminal-bg p-8">
      <header className="mb-8">
        <nav className="text-terminal-dim font-mono text-sm mb-4">
          <Link href="/" className="hover:text-terminal-green transition-colors">
            Factory View
          </Link>
          <span className="mx-2">/</span>
          <span className="text-terminal-green">{id}</span>
        </nav>
        <h1 className="text-4xl font-mono font-bold text-terminal-green mb-2">
          Project: {id}
        </h1>
      </header>

      <main className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="text-terminal-amber border-terminal-amber">
                Coming Soon
              </Badge>
              Project Detail View
            </CardTitle>
          </CardHeader>
          <CardContent className="text-terminal-dim">
            <p className="mb-4">
              This page will show detailed information about project: <span className="font-mono text-terminal-green">{id}</span>
            </p>
            <ul className="space-y-2 text-sm">
              <li>• Project metadata (stage, status, timestamps)</li>
              <li>• Live subagents (active sessions)</li>
              <li>• Past subagents (completed stories)</li>
              <li>• Queued subagents (pending work)</li>
              <li>• Token usage and cost tracking</li>
            </ul>
            <p className="mt-4 text-xs">
              Story 7 & 8 implementation pending
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
