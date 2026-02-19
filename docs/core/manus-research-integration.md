# Manus Research Integration - Idea Factory via MCP

**Version:** 1.0  
**Last Updated:** 2026-02-19  
**Status:** Design / Implementation Pending

---

## Overview

**Purpose:** Integrate Manus as a high-volume product idea discovery engine for the software factory. Kelly triggers research tasks via MCP, Manus returns 10-15 viable product opportunities, and Kelly routes selected ideas to Research Lead for full PRD generation.

**Key Differences from Research Lead v3.3:**
- **Volume:** Generates 10-15 ideas per run (vs. Research Lead's 1 idea per 35-50 min)
- **Scope:** Crowded markets OK if execution advantage exists (vs. Research Lead's novelty-first approach)
- **Purpose:** Backlog generation for manual review (vs. Research Lead's autonomous PRD creation)
- **Speed:** ~5-10 min per batch (vs. Research Lead's 35-50 min per idea)

---

## Architecture

### Communication Flow

```
User (Matrix) 
  ↓
Kelly (main agent)
  ↓
MCP Tool: manus.create_task({...})
  ↓
MCP Server (mcp-manus-server)
  ↓
Manus API (open.manus.im)
  ↓
Manus AI Agent (cloud execution)
  ↓
[Webhook notification OR polling]
  ↓
Kelly receives results
  ↓
Kelly writes to ideas-queue/
  ↓
Kelly announces to user
```

### Components

**1. Kelly (Orchestrator)**
- Receives user request: "Generate 10 iOS B2C simple app ideas"
- Formats config + prompt for Manus
- Triggers MCP tool
- Monitors task completion (webhook or polling)
- Writes results to filesystem
- Announces completion to user

**2. MCP Server (mcp-manus-server)**
- Runs as local service (Docker or Node)
- Exposes MCP tools to OpenClaw
- Wraps Manus REST API with type-safe interface
- Handles authentication (Manus API key)
- Manages task lifecycle

**3. Manus API (open.manus.im)**
- Cloud-hosted AI agent platform
- Executes research tasks asynchronously
- Returns structured discovery reports
- Supports webhooks for completion notifications

**4. Filesystem Integration**
- Results stored in: `projects/ideas-queue/{timestamp}/`
- Format: `manus-discovery-{config}.md`
- Contains: 10-15 problems with evidence, competitive landscape, scope assessment

---

## User Workflow

### Basic Flow

```
User: "Kelly, generate 10 iOS B2C simple app ideas"
  ↓
Kelly: "Starting Manus discovery task (iOS, B2C, Simple)..."
  ↓
[Manus runs for 5-10 minutes]
  ↓
Kelly: "✅ Manus discovery complete: 12 ideas found in ideas-queue/2026-02-19-1238/"
  ↓
User reviews ideas, picks one
  ↓
User: "Kelly, run full Research Lead on idea #3"
  ↓
Kelly spawns Research Lead with selected problem → generates full PRD
```

### Advanced Flow (Validation Gate)

```
User: "Kelly, generate 10 iOS B2C simple app ideas"
  ↓
Kelly: Triggers Manus
  ↓
Kelly: "✅ 12 ideas found. Validating with Quinn..."
  ↓
Kelly spawns Quinn to adversarially score all 12 ideas
  ↓
Kelly: "Quinn approved 7/12. Top 3: #1 (84/100), #3 (78/100), #5 (72/100)"
  ↓
User: "Run full Research Lead on #1"
  ↓
Kelly spawns Research Lead → generates PRD
```

---

## MCP Integration

### MCP Server Setup

**Prerequisites:**
1. Manus API key (from open.manus.im)
2. Docker or Node.js 20+
3. mcp-manus-server deployed locally

**Installation:**

```bash
# Clone MCP server
git clone https://github.com/gianlucamazza/mcp-manus-server.git
cd mcp-manus-server

# Configure environment
cp .env.example .env
# Edit .env:
# MANUS_API_KEY=your_api_key
# OAUTH_CLIENT_ID=your_client_id
# OAUTH_CLIENT_SECRET=your_secret

# Deploy with Docker
docker-compose -f docker/docker-compose.yml up -d

# Verify health
curl http://localhost:8080/health
```

**OpenClaw Configuration:**

Add Manus MCP server to OpenClaw config:

```json
{
  "mcpServers": {
    "manus": {
      "command": "node",
      "args": ["path/to/mcp-manus-server/dist/index.js"],
      "env": {
        "MANUS_API_KEY": "${MANUS_API_KEY}",
        "OAUTH_CLIENT_ID": "${OAUTH_CLIENT_ID}",
        "OAUTH_CLIENT_SECRET": "${OAUTH_CLIENT_SECRET}"
      }
    }
  }
}
```

### Available MCP Tools

**From mcp-manus-server:**

1. **manus.execute_text_task(description, parameters)**
   - Creates research task in Manus
   - Returns task ID for status tracking
   
2. **manus.get_task_status(task_id)**
   - Polls task completion
   - Returns status + results when complete

3. **manus.check_credits()**
   - Verifies Manus account has sufficient credits
   - Returns available balance

4. **manus.register_webhook(url, events)**
   - Registers webhook for task completion (optional)
   - Enables push-based notifications instead of polling

---

## Configuration Schema

### Config Object (Passed to Manus)

```javascript
{
  platform: "mobile-app" | "web-app" | "browser-extension" | "desktop-app",
  businessModel: "B2C" | "B2B" | "prosumer",
  stack: "Swift/SwiftUI/Firebase" | "Next.js/React/TypeScript/Firebase" | "...",
  scope: "simple" | "standard" | "complex",
  count: 10-15, // Number of ideas to generate
  previouslyResearched: ["domain-1", "domain-2", ...], // Avoid duplicates
  constraints: {
    maxStories: number, // e.g., 30 for simple
    minStories: number, // e.g., 20 for simple
    avoidIndustries: ["medical", "financial-regulated"], // Optional
    preferIndustries: ["productivity", "lifestyle"], // Optional
  }
}
```

### Prompt Template (Kelly → Manus)

```markdown
# Product Idea Discovery Task

Generate {count} viable product ideas matching the following constraints:

**Platform:** {platform}
**Business Model:** {businessModel}
**Stack:** {stack}
**Scope:** {scope} ({minStories}-{maxStories} stories)
**Avoid These Domains:** {previouslyResearched}

## Discovery Strategy

Use multiple approaches:
1. Review gap mining (apps with high downloads but bad ratings)
2. Workaround archaeology (people combining multiple tools)
3. Direct demand signals ("Why doesn't this exist?" posts)
4. Enshittification/price revolt (users fleeing products)
5. Support ticket mining (recurring complaints)
6. Community frustration (repeated pain points)

## Sources to Search

**Tier 1:**
- Reddit (all relevant subreddits - not just tech)
- Twitter/X (complaints, feature requests)
- App Store/Play Store reviews (2-3 star frustrated users)
- Product Hunt comments
- Hacker News ("Ask HN", "Show HN")
- YouTube comments (tutorial videos)
- Discord servers
- LinkedIn (professional frustrations)
- Quora (repeated questions without answers)

**Tier 2:**
- Google Trends (validation)
- Stack Overflow (for dev tools)
- Domain-specific forums
- Customer support threads (public Zendesk, Intercom)

## Output Format

For each of {count} problems, provide:

### Problem #N: [Brief Title]

**Classification:** Wide Open | Poorly Served | Underserved | Adequately Served | Crowded

**Problem Statement:** [2-3 sentences describing the pain point]

**Evidence:**
- [Platform] [Date] ([Engagement]): "[Direct quote]" [URL]
- [Platform] [Date] ([Engagement]): "[Direct quote]" [URL]
- [Platform] [Date] ([Engagement]): "[Direct quote]" [URL]

**Competitive Landscape:**
- **Product Name** - Rating, users, what it does, why it fails
- **Product Name** - Rating, users, what it does, why it fails
- **The Gap:** [What's missing from all existing solutions]

**User Workarounds:**
- [Workaround 1 with investment evidence]
- [Workaround 2 with investment evidence]

**Willingness to Pay:**
- [Existing paid products + pricing]
- [User discussions about acceptable pricing]
- [DIY solution costs]

**Scope Fit ({scope}):**
- Core features: [3-5 features]
- Estimated: {minStories}-{maxStories} stories
- Technical complexity: Low | Medium | High
- Value source: User data | External API | Self-contained
- Cold start: Yes/No

## Filtering Rules

**ELIMINATE problems:**
- 3+ good products (4+ stars, significant users) - Adequately Served
- 5+ well-funded competitors - Crowded
- Proprietary data not accessible to solo devs
- Heavily regulated (medical, financial without licenses)
- Requires other users' data to work on day 1
- No evidence of spending (free-only market)
- Doesn't fit {scope} constraint

**KEEP problems:**
- Wide Open (no solutions exist)
- Poorly Served (solutions exist but all bad <3.5★)
- Underserved (1-2 decent products with notable gaps)
- Evidence of spending or DIY investment
- Fits platform/stack/scope constraints
- Can work on day 1 with zero users
```

---

## Output Format (Manus → Kelly)

### Filesystem Structure

```
projects/ideas-queue/
  2026-02-19-1238/
    manus-discovery-ios-b2c-simple.md
    config.json
    metadata.json
```

### Discovery Report Format

```markdown
# Manus Discovery Report

**Generated:** 2026-02-19T12:38:00-06:00
**Task ID:** manus-task-abc123
**Config:** iOS | B2C | Simple (20-30 stories) | Swift/SwiftUI/Firebase
**Strategy:** Review gap mining, workaround archaeology, demand signals
**Sources:** 15 sources across Reddit, Twitter, App Store, Product Hunt
**Problems Found:** 12 viable (eliminated 8 as Adequately Served/Crowded)

---

## Problem #1: [Brief Title]

**Classification:** Poorly Served
**Scope Fit:** Simple - 22-28 stories estimated

### Problem Statement
[2-3 sentences]

### Evidence
- Reddit r/productivity (Feb 2026, 456 upvotes): "[quote]"
  https://reddit.com/...
- App Store Review - Product X (2.8★, Jan 2026): "[quote]"
- Twitter @user (230 likes): "[quote]"
  https://x.com/...

### Competitive Landscape
**Classification:** Poorly Served

**Existing Solutions:**
- **Product X** - 2.8★, 100K users - Good at A, fails at B
- **Product Y** - 3.2★, 25K users - Solves C but not D

**The Gap:** [What all existing solutions fail to provide]

### User Workarounds
- Workaround 1 (evidence: hours/money invested)
- Workaround 2 (evidence: tools combined)
- Workaround 3

### Willingness to Pay
- Product X charges $12/mo, 50K paid users
- User discussions mention $8-15/mo acceptable
- DIY solutions cost ~$20/mo in tools

### Scope Fit (Simple)
- ✅ Core features: Feature 1, Feature 2, Feature 3
- ✅ Estimated: 24 stories
- ✅ Technical complexity: Low (Firebase CRUD + push notifications)
- ✅ Value source: User's own data (self-contained)
- ✅ Cold start: No (works day 1)

---

## Problem #2: [Brief Title]
[... same format ...]

---

## Summary

**Total Viable:** 12 problems
**Classifications:**
- Wide Open: 3
- Poorly Served: 6
- Underserved: 3

**Top 3 by Signals:**
1. Problem #1 (strong evidence, clear gap, proven spending)
2. Problem #5 (multiple workarounds, high engagement)
3. Problem #3 (wide open market, clear demand)

**Recommended Next Steps:**
- Run Quinn adversarial validation on top 5
- Select 1-2 for full Research Lead PRD generation
- Archive remainder for future consideration
```

---

## Kelly Integration

### Kelly's Role

**Phase 1: Request Handling**

User says: "Kelly, generate 10 iOS B2C simple app ideas"

Kelly:
1. Parses config from message (platform, business model, scope)
2. Loads previously researched domains from project-registry.json
3. Constructs prompt for Manus
4. Checks Manus credits via MCP
5. Triggers manus.execute_text_task(prompt, config)

**Phase 2: Monitoring**

Kelly:
1. Receives task ID from Manus
2. Announces: "Manus discovery task started (task-abc123). ETA: 5-10 min"
3. Polls manus.get_task_status(task_id) every 30 seconds
   - OR: Uses webhook (if configured) for push notification

**Phase 3: Processing Results**

When task completes:
1. Kelly creates directory: `projects/ideas-queue/{timestamp}/`
2. Writes `manus-discovery-{config}.md` with results
3. Writes `config.json` with task parameters
4. Writes `metadata.json` with task ID, duration, credits used
5. Announces: "✅ Manus discovery complete: 12 ideas found in ideas-queue/2026-02-19-1238/"

**Phase 4: Next Steps (User Decision)**

Kelly offers options:
- "Review ideas manually, then: 'Kelly, run full Research Lead on idea #3'"
- "Validate all with Quinn first: 'Kelly, validate these with Quinn'"
- "Archive for later: 'Kelly, archive these ideas'"

### Kelly Commands

**Trigger Discovery:**
```
User: "Generate 10 iOS B2C simple app ideas"
User: "Manus: find web app ideas for B2B"
User: "Idea factory: 15 browser extension concepts"
```

**Check Status:**
```
User: "Status on Manus task?"
User: "How many ideas found?"
```

**Validate Results:**
```
User: "Validate Manus ideas with Quinn"
User: "Quinn gate on ideas-queue/2026-02-19-1238"
```

**Select for Full PRD:**
```
User: "Run Research Lead on idea #3"
User: "Generate full PRD for 'Plant Watering Tracker'"
```

---

## Integration with Research Lead v3.3

### Hybrid Workflow

**Manus = High-volume discovery** (10-15 ideas in 5-10 min)  
**Research Lead = Deep validation + PRD** (1 idea in 35-50 min)

**Combined flow:**
1. Manus generates 10-15 problem candidates
2. User reviews or Quinn validates
3. User selects 1-2 best candidates
4. Research Lead runs full workflow on selected idea:
   - Phase 2: Quinn problem gate (re-validation)
   - Phase 3: CIS solution generation
   - Phase 4: Quinn solution gate
   - Phase 5: Create PRD with Executive Summary
5. Output: Full {ProductName}-PRD.md ready for Project Lead

**Advantage:** Manus does breadth, Research Lead does depth.

---

## Error Handling

### Manus Task Failures

**Scenario 1: Manus returns <10 viable ideas**
- Kelly: "⚠️ Manus found only 7 viable ideas (needed 10). Retry with broader constraints?"
- User can adjust config (remove industry filters, expand scope)

**Scenario 2: All ideas in crowded markets**
- Kelly: "⚠️ All 12 ideas are in crowded markets. Retry with 'underserved' preference?"

**Scenario 3: API timeout or credit exhaustion**
- Kelly: "❌ Manus task failed: Insufficient credits. Current balance: X"
- Kelly: "❌ Manus task timeout after 15 min. Retry?"

### MCP Server Failures

**Scenario 4: MCP server unreachable**
- Kelly: "❌ Cannot reach mcp-manus-server. Check if service is running: `docker ps | grep manus`"

**Scenario 5: Authentication failure**
- Kelly: "❌ Manus API authentication failed. Check MANUS_API_KEY in .env"

---

## Future Enhancements

### Phase 2 (After Initial Implementation)

1. **Webhook Integration**
   - Replace polling with push notifications
   - Faster completion detection
   - Lower API usage

2. **Batch Processing**
   - Queue multiple discovery runs
   - "Generate 5 sets of 10 iOS ideas"
   - Process overnight, review in morning

3. **Automated Quinn Validation**
   - Auto-spawn Quinn on Manus results
   - Filter to top 3-5 before showing user
   - Save manual review time

4. **Backlog Management**
   - Track ideas in project-registry.json
   - "Show me all archived ideas from last month"
   - Expire stale ideas after 90 days

5. **Config Presets**
   - Save common configs: "iOS Simple B2C", "Web Standard B2B"
   - "Kelly, use preset 'mobile-mvp' for discovery"

6. **Cost Tracking**
   - Log Manus credits per discovery run
   - Budget alerts: "Remaining credits: 500 (5 more runs)"

---

## Security Considerations

1. **API Key Management**
   - Store MANUS_API_KEY in environment (never in code)
   - Rotate keys quarterly
   - Use separate keys for dev/prod

2. **Result Validation**
   - Sanitize Manus output before writing to filesystem
   - Validate JSON structure
   - Check for injection attempts in evidence URLs

3. **Rate Limiting**
   - Respect Manus API rate limits
   - Implement backoff on 429 responses
   - Queue requests if needed

4. **Data Privacy**
   - Manus processes research queries in cloud
   - Ensure no PII or sensitive data in prompts
   - Review Manus privacy policy

---

## Cost Estimates

**Manus Pricing (as of Feb 2026):**
- TBD (API in private beta)
- Estimated: $X per task OR credit-based system

**Per Discovery Run:**
- 1 Manus task (10-15 ideas) = ~Y credits
- Expected budget: $Z per idea
- Volume pricing available for factory use

**Compare to Research Lead:**
- Research Lead: 35-50 min @ Sonnet 4.5 = ~$0.50-1.00 per PRD
- Manus discovery: 5-10 min = ~$TBD per batch
- Combined (Manus + Research Lead): ~$TBD per validated PRD

---

## Related Documentation

- `docs/core/research-lead-flow.md` - Research Lead v3.3 workflow
- `docs/core/kelly-router-flow.md` - Kelly orchestration patterns
- `docs/core/project-registry-workflow.md` - Registry schema
- `skills/web-browser/SKILL.md` - Browser automation (if needed for Manus UI fallback)

---

**Document Status:** Design  
**Implementation:** Pending MCP server deployment + OpenClaw config  
**Owner:** Kelly (with Manus integration specialist support)
