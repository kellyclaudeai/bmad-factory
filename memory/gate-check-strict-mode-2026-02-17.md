# Gate Check Strict Mode - 2026-02-17

## Decision
**Enforce strict gate check:** Only PASS proceeds to implementation. Anything else (CONCERNS, FAIL, NEEDS WORK, NOT READY) requires remediation loop.

## Reasoning
- Factory automation needs deterministic rules, not human judgment
- If concerns are worth documenting, they're worth fixing before wasting implementation time
- Prevents "ship it and hope" technical debt accumulation
- TakeoutTrap had 12 concerns including 3 HIGH severity - should fix first

## Prior Behavior
- BMAD's `check-implementation-readiness` workflow is **interactive and human-driven**
- Says: *"Address the critical issues before proceeding to implementation. These findings can be used to improve the artifacts **or you may choose to proceed as-is.**"*
- No built-in remediation loop — human decides what to do

## Factory Needs
- **Headless automation** requires clear rules
- Project Lead must autonomously decide:
  - PASS → proceed to Bob
  - NOT PASS → remediation loop (no human intervention)

## Files Updated

### 1. docs/project-lead-flow.md (committed: 074504f)

**Gate check logic (step 5):**

```
5. John: check-implementation-readiness (GATE CHECK)
   → Output: PASS / CONCERNS / FAIL / NEEDS WORK / NOT READY
   
   GATE LOGIC (STRICT):
   
   PASS / READY → Proceed to Bob (step 6)
   
   NOT PASS (CONCERNS / FAIL / NEEDS WORK / NOT READY) → Remediation Loop
   - Do NOT proceed to Bob until gate check returns PASS
   - ANY documented concerns require fixes before implementation
   - Prevents shipping with known issues or technical debt
```

**Remediation Loop:**
1. Project Lead reads `implementation-readiness-check.md`
2. Identify issues by artifact: PRD, UX, Architecture, Epics
3. Route to appropriate persona(s):
   - PRD gaps → John (edit-prd)
   - UX issues → Sally (edit-ux-design)
   - Architecture gaps → Winston (edit-architecture)
   - Epic/story issues → John (edit epics) OR Bob (create stories)
4. Spawn persona(s) with specific fix instructions from report
5. Re-run John: check-implementation-readiness
6. Repeat until PASS (max 3 attempts, escalate to Kelly if stuck)

**Applied to:**
- Normal Mode Greenfield
- Normal Mode Brownfield (BMAD and Non-BMAD)

### 2. /Users/austenallred/.openclaw/workspace-project-lead/AGENTS.md (updated, cannot commit)

**Added Gate Check Remediation Loop section:**
- Placed after step 5 in Phase 1 planning flow
- STRICT GATE RULE: Only PASS/READY proceeds to Bob
- Detailed remediation process (same as docs)
- Track remediation attempts in project-state.json:

```json
{
  "gateCheckAttempts": [
    { "attempt": 1, "result": "CONCERNS", "timestamp": "..." },
    { "attempt": 2, "result": "PASS", "timestamp": "..." }
  ]
}
```

**Updated Available agents section:**
- Added edit workflows: edit-prd, edit-ux-design, edit-architecture
- Clarified edit workflows are used during gate check remediation
- Preserve existing content, only add/modify what's needed

## TakeoutTrap Example

**Current state (20:25 CST):**
- John returned CONCERNS (85% ready, 12 concerns documented)
- Project Lead proceeded to Bob (sprint planning) — **WRONG under new strict rule**

**What should happen:**
1. Project Lead reads implementation-readiness-check.md
2. Identifies IMMEDIATE concerns (#1-5):
   - #1 Verify Epic 4 stories exist → John (check epics.md, add if missing)
   - #2 Clarify MVP scope → John (edit-prd to clarify freemium scope)
   - #3 Reduce recipe content scope → John (edit-prd + edit epics.md to reduce from 100 → 25 recipes)
   - #4 Add FTC disclosure → John (edit epics.md, update Story 3.4 AC)
   - #5 Create infrastructure cost model → Winston (edit-architecture, add cost projections)
3. Spawn John + Winston with fix instructions
4. Re-run gate check
5. If PASS → proceed to Bob

## Implementation Notes

**Project Lead must:**
- Parse implementation-readiness-check.md to extract issues
- Categorize issues by artifact (PRD, UX, Architecture, Epics)
- Map issues to personas (John, Sally, Winston, Bob)
- Pass specific fix instructions to spawned personas
- Track remediation attempts in project-state.json
- Escalate to Kelly if stuck after 3 attempts

**Personas must:**
- Accept edit-{artifact} workflow tasks
- Read gate check report sections relevant to their artifact
- Make targeted fixes (not full rewrites)
- Preserve existing content structure
- Report completion to Project Lead

## Benefits

1. **Quality gate enforcement** — no shipping with known issues
2. **Deterministic behavior** — no human judgment required
3. **Clear ownership** — issues routed to correct personas
4. **Audit trail** — gateCheckAttempts tracked in project-state.json
5. **Prevents technical debt** — fix issues early, not during implementation

## Risks

1. **Longer planning phase** — remediation loops add time
2. **False positive risk** — overly strict gate may flag non-critical issues
3. **Remediation quality** — persona may not fix issues correctly (needs re-check)
4. **Infinite loop risk** — max 3 attempts prevents endless remediation

## Monitoring

- Track gateCheckAttempts in project-state.json
- Alert if 3 attempts reached (escalate to Kelly)
- Log which issues were fixed in each attempt
- Measure planning phase duration impact (before/after strict gate)

## Alternative Considered (rejected)

**Option 2: Flexible Gate (CONCERNS acceptable)**
- Minor concerns → Bob adds them as new stories during planning
- Major concerns → remediate first
- Rejected: Too much human judgment required for "minor vs major"

**Option 3: Permissive (BMAD's intent)**
- PASS → proceed
- CONCERNS → proceed, log for mitigation during implementation
- FAIL → remediate
- Rejected: Allows technical debt accumulation, "ship it and hope" behavior
