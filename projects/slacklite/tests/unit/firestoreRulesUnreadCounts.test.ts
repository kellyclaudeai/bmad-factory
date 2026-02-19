import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Firestore unread count rules", () => {
  it("restricts unreadCounts access to the authenticated owner", () => {
    const rulesFilePath = path.resolve(process.cwd(), "firestore.rules");
    const rules = fs.readFileSync(rulesFilePath, "utf8");

    expect(rules).toContain("match /unreadCounts/{countId}");
    expect(rules).toContain("resource.data.userId == request.auth.uid");
    expect(rules).toContain("request.resource.data.userId == request.auth.uid");
    expect(rules).toContain("countId == request.auth.uid + \"_\" + request.resource.data.targetId");
  });
});
