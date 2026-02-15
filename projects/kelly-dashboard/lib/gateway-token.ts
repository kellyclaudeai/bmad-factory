import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

/**
 * Read the OpenClaw Gateway token from ~/.openclaw/gateway-token.txt
 * @returns The gateway token string, or null if the file doesn't exist
 */
export function getGatewayToken(): string | null {
  try {
    const tokenPath = path.join(homedir(), ".openclaw", "gateway-token.txt");
    const token = readFileSync(tokenPath, "utf-8").trim();
    return token || null;
  } catch (error) {
    // File doesn't exist or can't be read
    return null;
  }
}
