# Research Lead Diversity Fixes

**Problem:** Mary keeps selecting "Forgotten Subscription Tracker" (99% of the time) due to search query determinism and scoring bias toward proven markets.

**Root causes:**
1. Similar search queries each run → same Reddit/HN threads
2. Market validation heavily rewards existing proof (Truebill $1.275B acquisition beats everything)
3. Evergreen pain signals (subscription complaints constant on Reddit)
4. Web-app feasibility filter advantage (most big markets are mobile-first)

---

## Proposed Solutions (Priority Order)

### 1. Domain Rotation in Phase 1 Market Scanning (HIGH IMPACT)

**Change:** Force Mary to start from DIFFERENT domains each run

**Implementation:**
- Research Lead picks a random starting domain before spawning Mary
- Domains: `finance`, `productivity`, `health`, `education`, `communication`, `entertainment`, `shopping`, `travel`, `food`, `social`, `career`, `hobbies`
- Mary's prompt includes: "Start with [DOMAIN] - scan for market momentum in THIS domain first"

**Effect:** 
- Finance domain → subscription tracking likely
- Productivity domain → meeting/focus tools likely
- Health domain → wellness/fitness tools likely
- Etc.

This FORCES diversity at the source (search queries), not just at scoring.

**Effort:** Low (add domain picker to Research Lead Phase 1 spawn)

---

### 2. Recency Penalty for Similar Pain Points (MEDIUM IMPACT)

**Change:** Add 6th scoring dimension: **Novelty Bonus/Penalty**

**Implementation:**
- Before scoring, Mary reads registry `historical[]` entries from last 30 days
- For each candidate pain point, check semantic similarity to recent entries
- If similar pain point researched in last 30 days → apply -5 point penalty
- If NO similar entries → apply +2 point bonus (rewards exploration)

**Similarity check (LLM-based):**
```
Question: Is [Candidate Pain Point] fundamentally the same underlying problem as [Recent Entry Pain Point]?
Answer: YES (penalty) or NO (no penalty)
```

**Effect:** Even if Mary discovers subscription tracking again, it scores LOWER due to recency penalty, allowing other pain points to win.

**Effort:** Medium (add similarity check + scoring adjustment)

---

### 3. Time Horizon Rotation (LOW IMPACT, EASY WIN)

**Change:** Alternate between "trending" and "persistent" search strategies

**Implementation:**
- Odd-numbered runs: Focus on "last 7 days" (fresh, trending, emerging opportunities)
- Even-numbered runs: Focus on "last 6 months" (persistent, validated, evergreen)

**Effect:** 
- "Last 7 days" favors NEW pain points (less likely to hit evergreen subscription complaints)
- "Last 6 months" favors PERSISTENT pain (more likely to hit subscription tracking)

This introduces SOME diversity, but not as strong as domain rotation.

**Effort:** Very Low (add time horizon param to Mary's spawn)

---

### 4. Move Dedup Check Earlier (EFFICIENCY GAIN, NOT DIVERSITY)

**Change:** Run pain point dedup AFTER Step 2 (pain dive), BEFORE Step 3 (scoring)

**Current flow:**
1. Mary completes ALL of Phase 1 (12-17 min)
2. Research Lead dedup check (Phase 2)
3. If duplicate → abort (wasted 12-17 min)

**Proposed flow:**
1. Mary completes Step 1-2 (5-7 min)
2. **Research Lead dedup check (EARLY)**
3. If duplicate → abort (saved 7-10 min)
4. If unique → Mary continues to Step 3-4 (scoring + selection)

**Effect:** Saves time when dupes ARE discovered, but doesn't prevent them.

**Effort:** Low (move dedup check to interim checkpoint)

---

### 5. Explicit "Avoid Domains" Config (FUTURE, BATCH MODE)

**Change:** Add `avoidDomains` to research config for batch runs

**Use case:** 
- Operator generates 5 ideas in parallel
- First session picks "finance" domain → discovers subscription tracker
- Remaining 4 sessions receive `avoidDomains: ["finance"]` to force diversity

**Implementation:**
```json
{
  "platform": "web-app",
  "businessModel": "B2C",
  "stack": "...",
  "avoidDomains": ["finance", "budgeting"]
}
```

Mary's Phase 1 prompt: "Do NOT scan finance or budgeting markets. Focus on other domains."

**Effect:** Perfect for batch mode (5 parallel Research Leads). Less useful for single runs.

**Effort:** Low (add config field + prompt injection)

---

## Recommended Implementation Order

**Phase 1 (Immediate):**
1. **Domain Rotation** (highest impact, low effort)
2. **Time Horizon Rotation** (easy win, low effort)
3. **Move Dedup Check Earlier** (efficiency, not diversity)

**Phase 2 (After testing):**
4. **Recency Penalty** (medium impact, medium effort)

**Phase 3 (Batch mode):**
5. **Avoid Domains Config** (batch-specific feature)

---

## Testing Plan

**Test with domain rotation only:**
- Run 3 Research Lead sessions with forced domains: `productivity`, `health`, `communication`
- Verify Mary discovers DIFFERENT pain points (not subscription tracking)
- Measure if scoring still produces viable ideas (not just random/bad ideas)

**Success criteria:**
- 0/3 sessions select subscription tracking
- All 3 pain points score 35+/50 (viable quality)
- Pain points span different domains

---

**Next Steps:**
1. Get operator approval on approach
2. Implement domain rotation first (highest ROI)
3. Test with 3 sessions
4. Iterate based on results

**Author:** Kelly  
**Date:** 2026-02-18 14:25 CST
