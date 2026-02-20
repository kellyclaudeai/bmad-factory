/**
 * Canonical phase/status → badge color mapping.
 * Single source of truth — import this everywhere instead of defining locally.
 *
 * Phase values:   planning | implementation | qa | shipped | paused
 * Status values:  active | waiting | awaiting-qa (from sessions API)
 * Research vals:  complete | completed | failed
 *
 * Semantic intent:
 *   🟡 planning    — early, not building yet
 *   🟢 implementation / active — actively shipping
 *   🔵 qa          — testing / review
 *   🟡 waiting     — idle between turns
 *   🔴 paused / failed — stopped, needs attention
 *   dim shipped / complete — done, no action needed
 */
export function phaseColor(val: string): string {
  switch ((val || "").toLowerCase()) {
    // 🟢 actively shipping
    case "implementation":
    case "active":
      return "bg-terminal-green/10 text-terminal-green border-terminal-green";

    // 🟡 early / not yet building
    case "planning":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500";

    // 🔵 testing / review
    case "qa":
    case "awaiting-qa":
    case "awaiting_qa":
      return "bg-blue-500/10 text-blue-400 border-blue-500";

    // 🟡 idle between turns
    case "waiting":
    case "idle":
      return "bg-terminal-amber/10 text-terminal-amber border-terminal-amber";

    // 🔴 stopped, needs attention
    case "paused":
    case "failed":
      return "bg-red-500/10 text-red-400 border-red-500";

    // dim — done, no action needed
    case "shipped":
    case "complete":
    case "completed":
      return "bg-terminal-dim/10 text-terminal-dim border-terminal-dim";

    default:
      return "bg-terminal-text/10 text-terminal-text border-terminal-text";
  }
}
