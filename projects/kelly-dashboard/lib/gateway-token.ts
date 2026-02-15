import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

type OpenClawConfig = {
  gateway?: {
    auth?: {
      mode?: string;
      token?: string;
      password?: string;
    };
    port?: number;
  };
};

/**
 * Read the OpenClaw Gateway token.
 *
 * Current source of truth is ~/.openclaw/openclaw.json → gateway.auth.token.
 */
export function getGatewayToken(): string | null {
  // Prefer explicit env var for production services (launchd often has a minimal sandbox).
  const envToken = process.env.OPENCLAW_GATEWAY_TOKEN;
  if (envToken && envToken.trim()) return envToken.trim();

  try {
    const home = process.env.HOME || homedir() || "/Users/austenallred";
    const configPath = path.join(home, ".openclaw", "openclaw.json");
    const raw = readFileSync(configPath, "utf-8");
    const cfg = JSON.parse(raw) as OpenClawConfig;
    const token = cfg?.gateway?.auth?.token;
    return token?.trim() || null;
  } catch {
    return null;
  }
}

export function getGatewayPort(defaultPort = 18789): number {
  const envPort = process.env.OPENCLAW_GATEWAY_PORT;
  if (envPort && !Number.isNaN(Number(envPort))) return Number(envPort);

  try {
    const home = process.env.HOME || homedir() || "/Users/austenallred";
    const configPath = path.join(home, ".openclaw", "openclaw.json");
    const raw = readFileSync(configPath, "utf-8");
    const cfg = JSON.parse(raw) as OpenClawConfig;
    return cfg?.gateway?.port || defaultPort;
  } catch {
    return defaultPort;
  }
}
