import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface SubagentDetailProps {
  params: Promise<{ sessionKey: string }>;
}

export default async function SubagentDetail({ params }: SubagentDetailProps) {
  const { sessionKey } = await params;
  
  // Decode the session key for display
  const decodedKey = decodeURIComponent(sessionKey);
  
  return (
    <div className="min-h-screen bg-terminal-bg p-8">
      <header className="mb-8">
        <nav className="text-terminal-dim font-mono text-sm mb-4">
          <Link href="/" className="hover:text-terminal-green transition-colors">
            Factory View
          </Link>
          <span className="mx-2">/</span>
          <span className="text-terminal-green">Subagent Detail</span>
        </nav>
        <h1 className="text-2xl font-mono font-bold text-terminal-green mb-2 break-all">
          {decodedKey}
        </h1>
      </header>

      <main className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="text-terminal-amber border-terminal-amber">
                Coming Soon
              </Badge>
              Subagent Detail View
            </CardTitle>
          </CardHeader>
          <CardContent className="text-terminal-dim">
            <p className="mb-4">
              This page will show detailed information about this subagent session.
            </p>
            <ul className="space-y-2 text-sm">
              <li>• Session metadata (model, tokens, duration)</li>
              <li>• Status indicator (active/completed/failed)</li>
              <li>• Timestamps (created, last active, completed)</li>
              <li>• Output artifacts (files created/modified)</li>
              <li>• Optional: Transcript excerpt (first 500 lines)</li>
            </ul>
            <p className="mt-4 text-xs">
              Story 9 implementation pending
            </p>
            <div className="mt-6 p-4 bg-terminal-card rounded border border-terminal-border">
              <p className="text-xs font-mono text-terminal-dim">
                Session Key:
              </p>
              <p className="text-xs font-mono text-terminal-text break-all mt-1">
                {decodedKey}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
