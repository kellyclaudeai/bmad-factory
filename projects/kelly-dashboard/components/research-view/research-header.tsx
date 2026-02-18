import { Badge } from "@/components/ui/badge";

interface ResearchHeaderProps {
  topic: string;
  status: "active" | "complete" | "failed";
  startedAt?: string;
  duration?: number;
  model?: string;
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-terminal-green/10 text-terminal-green border-terminal-green";
    case "complete":
    case "completed":
      return "bg-terminal-dim/10 text-terminal-dim border-terminal-dim";
    case "failed":
      return "bg-terminal-red/10 text-terminal-red border-terminal-red";
    default:
      return "bg-terminal-text/10 text-terminal-text border-terminal-text";
  }
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0s";
  const s = Math.floor(seconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return rem ? `${m}m ${rem}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return remM ? `${h}h ${remM}m` : `${h}h`;
}

export function ResearchHeader({ topic, status, startedAt, duration, model }: ResearchHeaderProps) {
  const startTimeDisplay = startedAt
    ? new Date(startedAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Chicago",
      }) + " CST"
    : null;

  const durationDisplay = duration ? formatDuration(duration) : null;

  return (
    <header className="mb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-mono font-bold text-terminal-green mb-2">
            {topic}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              variant="outline"
              className={`font-mono ${getStatusColor(status)}`}
            >
              {status.toUpperCase()}
            </Badge>
            {startTimeDisplay && (
              <span className="text-sm font-mono text-terminal-dim">
                Started: {startTimeDisplay}
              </span>
            )}
            {durationDisplay && (
              <span className="text-sm font-mono text-terminal-dim">
                Duration: {durationDisplay}
              </span>
            )}
            {model && (
              <span className="text-sm font-mono text-terminal-dim">
                Model: {model}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
