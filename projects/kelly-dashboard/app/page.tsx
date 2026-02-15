import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <header className="mb-12">
        <h1 className="text-4xl font-mono font-bold text-terminal-green mb-2">
          Kelly Dashboard
        </h1>
        <p className="text-terminal-dim">
          Kelly Software Factory - Project and agent monitoring
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="default" className="bg-terminal-green text-terminal-bg">
                ✓ Online
              </Badge>
              Next.js 15
            </CardTitle>
            <CardDescription>App Router + TypeScript</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-terminal-dim">
              Server running on port 3000
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="default" className="bg-terminal-green text-terminal-bg">
                ✓ Loaded
              </Badge>
              Tailwind CSS v4
            </CardTitle>
            <CardDescription>Terminal theme configured</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-terminal-dim">
              Dark mode with matrix-inspired colors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="default" className="bg-terminal-green text-terminal-bg">
                ✓ Ready
              </Badge>
              shadcn/ui
            </CardTitle>
            <CardDescription>Components installed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-terminal-dim">
              Card, Badge, Button, Table, Skeleton
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="font-mono">Story 1: Project Scaffold ✓</CardTitle>
            <CardDescription>Implementation complete</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-terminal-dim">
              <li>✓ Next.js 15 with App Router</li>
              <li>✓ TypeScript configured</li>
              <li>✓ Tailwind CSS v4 installed</li>
              <li>✓ shadcn/ui initialized</li>
              <li>✓ Terminal theme applied</li>
              <li>✓ Geist fonts loaded (Mono + Sans)</li>
              <li>✓ Dev server running on :3000</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
