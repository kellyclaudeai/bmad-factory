---
name: manus-api
description: Trigger Manus AI agent tasks via REST API for product idea discovery and workflow automation. Create tasks with prompts, poll for completion, retrieve results.
---

# Manus API - REST Integration

**Purpose:** Trigger Manus AI agent tasks for high-volume product idea discovery without complex MCP server setup.

**Status:** Active (REST API implementation)  
**Future:** Can migrate to MCP when stable server available

---

## Prerequisites

1. **Manus API Key** stored in environment:
   ```bash
   export MANUS_API_KEY="sk-..."
   ```
   (Already set in ~/.zshrc)

2. **Manus Account** with credits available

---

## Available Commands

### Create Task

Trigger a new Manus task with a prompt:

```bash
/Users/austenallred/clawd/skills/manus-api/bin/create-task \
  --prompt "Generate 10 iOS B2C simple app ideas..." \
  --profile manus-1.6
```

**Parameters:**
- `--prompt` (required) - Task instruction/prompt
- `--profile` (optional) - Agent profile: `manus-1.6` (default), `manus-1.6-lite`, `manus-1.6-max`
- `--project` (optional) - Project ID to associate task with

**Output:**
```
✅ Task created:
Task ID: task_abc123
Task URL: https://manus.im/tasks/abc123

Check status: /Users/austenallred/clawd/skills/manus-api/bin/get-task --id task_abc123
```

---

### Get Task Status & Results

Check task completion and retrieve output:

```bash
/Users/austenallred/clawd/skills/manus-api/bin/get-task --id task_abc123
```

**Parameters:**
- `--id` (required) - Task ID from create-task

**Output (Pending):**
```
Task ID: task_abc123
Title: Product Discovery
Status: pending
Credits Used: 0

Task is still running. Check again in 30-60 seconds.
```

**Output (Completed):**
```
Task ID: task_abc123
Title: Product Discovery
Status: completed
Credits Used: 150
URL: https://manus.im/tasks/abc123

=== Output ===
[Full task output text here]

Output saved to: manus-task-task_abc123-output.txt
```

---

## Kelly Integration

### Usage Pattern

**1. User requests idea generation:**
```
User (Matrix): "Kelly, generate 10 iOS B2C simple app ideas"
```

**2. Kelly triggers Manus:**
```javascript
// Kelly constructs prompt from config
const prompt = buildDiscoveryPrompt({
  platform: "iOS",
  businessModel: "B2C",
  scope: "simple",
  count: 10
});

// Kelly runs create-task
exec(`/Users/austenallred/clawd/skills/manus-api/bin/create-task --prompt "${prompt}"`);

// Kelly announces
"Manus discovery task started (task_abc123). ETA: 5-10 min"
```

**3. Kelly polls for completion:**
```javascript
// Poll every 30 seconds
setInterval(() => {
  exec(`/Users/austenallred/clawd/skills/manus-api/bin/get-task --id task_abc123`);
  
  if (status === "completed") {
    // Process results
    writeResultsToFilesystem();
    announceCompletion();
  }
}, 30000);
```

**4. Kelly processes results:**
```javascript
// Write to ideas-queue
const outputDir = `projects/ideas-queue/${timestamp}/`;
fs.writeFileSync(`${outputDir}/manus-discovery-ios-b2c-simple.md`, output);

// Announce
"✅ Manus discovery complete: 12 ideas found in ideas-queue/2026-02-19-1258/"
```

---

## Prompt Template for Discovery

**Manus has a custom `idea-factory` skill. Invoke it with natural language:**

### Skill Invocation Format

```
Run idea-factory skill with platform={platform}, complexity={complexity}, pricing_model={pricing_model}, avoid=[{avoid_list}]
```

**Config Options:**
- `platform`: `"iOS"` | `"web"` | `"Android"`
- `complexity`: `"very_simple"` | `"simple"` | `"moderate"` | `"complex"`
- `pricing_model`: `"freemium"` | `"paid"` | `"subscription"`
- `avoid`: Array of pain points to avoid (previously researched domains)

**Example:**
```bash
/Users/austenallred/clawd/skills/manus-api/bin/create-task \
  --prompt "Run idea-factory skill with platform=iOS, complexity=simple, pricing_model=freemium, avoid=[fasting tracking, water intake tracking, caffeine intake tracking]" \
  --profile manus-1.6
```

**Timeline:** ~2-3 hours per idea (deep research workflow)  
**Output:** One Product Brief with full competitive analysis, user research, and PRD outline

---

### Legacy: Manual Discovery Prompt (For Reference)

**If NOT using idea-factory skill, use this manual template:**

```markdown
# Product Idea Discovery Task

Generate 10-15 viable product ideas matching these constraints:

**Platform:** iOS mobile app
**Business Model:** B2C
**Stack:** Swift, SwiftUI, Firebase
**Scope:** Simple (20-30 stories max)
**Avoid:** [previously researched domains]

## Discovery Strategy

Use these approaches:
1. Review gap mining (apps with bad ratings despite high downloads)
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
- YouTube comments (tutorial videos - "I wish...")
- Discord servers
- LinkedIn (professional frustrations)
- Quora (repeated questions without answers)

**Tier 2 (Validation):**
- Google Trends
- Stack Overflow (for dev tools)
- Domain-specific forums
- Customer support threads (public Zendesk, Intercom)

## Output Format

For each of 10 problems:

### Problem #N: [Brief Title]

**Classification:** Wide Open | Poorly Served | Underserved

**Problem Statement:** [2-3 sentences]

**Evidence:**
- [Platform] [Date] ([Engagement]): "[Quote]" [URL]
- [Platform] [Date] ([Engagement]): "[Quote]" [URL]
- [Platform] [Date] ([Engagement]): "[Quote]" [URL]

**Competitive Landscape:**
- **Product Name** - Rating, users, what it does, why it fails
- **Product Name** - Rating, users, what it does, why it fails
- **The Gap:** [What's missing from all solutions]

**User Workarounds:**
- [Workaround 1 with investment evidence]
- [Workaround 2 with investment evidence]

**Willingness to Pay:**
- [Existing paid products + pricing]
- [User discussions about acceptable pricing]
- [DIY solution costs]

**Scope Fit (Simple):**
- Core features: [3-5 features]
- Estimated: 20-30 stories
- Technical complexity: Low | Medium | High
- Value source: User data | External API | Self-contained
- Cold start: Yes/No

## Filtering Rules

**ELIMINATE:**
- 3+ good products (4+ stars, significant users)
- 5+ well-funded competitors
- Proprietary data not accessible
- Heavily regulated (medical, financial)
- Requires other users' data to work day 1
- No evidence of spending
- Doesn't fit scope constraint

**KEEP:**
- Wide Open (no solutions exist)
- Poorly Served (solutions exist but all bad <3.5★)
- Underserved (1-2 decent products with gaps)
- Evidence of spending or DIY investment
- Fits constraints
- Works day 1 with zero users
```

---

## API Reference

### Endpoints

**Base URL:** `https://api.manus.ai`

**Create Task:**
```
POST /v1/tasks
Headers:
  API_KEY: sk-...
  Content-Type: application/json
Body:
  {
    "prompt": "string",
    "agentProfile": "manus-1.6" | "manus-1.6-lite" | "manus-1.6-max",
    "taskMode": "agent",
    "projectId": "string (optional)"
  }
Response:
  {
    "task_id": "string",
    "task_title": "string",
    "task_url": "string"
  }
```

**Get Tasks:**
```
GET /v1/tasks?task_id=<id>
Headers:
  API_KEY: sk-...
Response:
  {
    "data": [{
      "id": "string",
      "status": "pending" | "in_progress" | "completed" | "failed",
      "output": [
        {
          "role": "assistant",
          "content": [{"type": "output_text", "text": "..."}]
        }
      ],
      "credit_usage": number
    }]
  }
```

---

## Error Handling

**API Key Missing:**
```
Error: MANUS_API_KEY environment variable not set
```
**Fix:** Ensure `export MANUS_API_KEY="sk-..."` in ~/.zshrc

**Task Creation Failed:**
```
Error creating task:
{
  "error": "Insufficient credits"
}
```
**Fix:** Add credits to Manus account

**Task Not Found:**
```
Error: Task not found
```
**Fix:** Verify task ID is correct

---

## Related Documentation

- `docs/core/manus-research-integration.md` - Full architecture + workflow
- `docs/core/research-lead-flow.md` - Research Lead v3.3 (deep validation)
- `docs/core/kelly-router-flow.md` - Kelly orchestration patterns

---

**Status:** Active (REST API)  
**Future Enhancement:** Migrate to MCP when stable server available  
**Owner:** Kelly
