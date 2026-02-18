# Research Lead v1 - Q&A Session

**Date:** 2026-02-16 21:11 CST  
**Status:** Clarifying architecture based on operator feedback

---

## Operator Questions & Answers

### **Q1: CIS Persona Adaptation - Workflows to Carry Over?**

**User's note:** "For BMM stuff we keep the menu system but don't use it since they're non-interactive. I am not as familiar with CIS, what are the workflows we'd be carrying over?"

**Answer:**

**CIS workflows are INTERACTIVE** - they're designed for guided facilitation (AI asks questions, user responds). They're not autonomous ideation engines.

**The 5 CIS workflows:**
1. **Brainstorming** - 36 techniques across 7 categories (collaborative, structured, creative, deep, theatrical, wild, introspective)
2. **Design Thinking** - 5 phases: Empathize → Define → Ideate → Prototype → Test
3. **Innovation Strategy** - JTBD, Blue Ocean Strategy, Value Chain Analysis
4. **Problem Solving** - TRIZ, Theory of Constraints, Systems Thinking, Root Cause Analysis
5. **Storytelling** - 25 narrative frameworks (Hero's Journey, Three-Act, Story Brand, etc.)

**What we're NOT carrying over:**
- The interactive menu system
- The Q&A facilitation flow
- The workflow.yaml execution

**What we ARE adapting:**
- The **persona** (identity, communication style, principles)
- The **methodologies** (each persona's core frameworks)
- The **ideation approach** (divergent thinking, strategic positioning, empathy, systematic analysis)

**How we'll use them:**
We spawn each CIS persona as a non-interactive subagent with a specific task:

```
Task for Carson (Brainstorming Coach):
"Given this problem brief, generate 5 creative approaches using divergent 
thinking. Use 'YES AND' building. Explore wild ideas without self-censorship. 
Output: 5 distinct approaches with brief descriptions."
```

**Key difference:**
- **Original CIS:** Interactive facilitation (user participates)
- **Research Lead CIS:** Autonomous generation (persona generates ideas alone)

We're extracting the **persona's creative lens** but not the interactive workflow scaffolding.

---

### **Q2: All CIS Personas We COULD Pull?**

**User question:** "All ideation personas I think. There are only 4? What are all the CIS personas we COULD pull?"

**Answer:**

**Total CIS personas: 6**

**Ideation-focused (generate ideas):**

1. **Carson - Brainstorming Coach** 📣
   - File: `brainstorming-coach.md`
   - Methodology: 36 brainstorming techniques, divergent thinking
   - Style: Enthusiastic improv coach
   - Output: High-volume wild ideas
   - Use in Research Lead: ✅ Phase 2 ideation

2. **Victor - Innovation Strategist** ♟️
   - File: `innovation-strategist.md`
   - Methodology: Blue Ocean Strategy, JTBD, Value Chain Analysis
   - Style: Chess grandmaster - bold declarations
   - Principle: **"Incremental thinking means obsolete"**
   - Output: Disruptive business model angles
   - Use in Research Lead: ✅ Phase 2 ideation

3. **Maya - Design Thinking Coach** 🎭
   - File: `design-thinking-coach.md`
   - Methodology: Design Thinking (Empathize → Define → Ideate → Prototype → Test)
   - Style: Jazz musician - improvises, sensory metaphors
   - Principle: "Design WITH users not FOR them"
   - Output: Human-centered, empathy-driven approaches
   - Use in Research Lead: ✅ Phase 2 ideation

4. **Dr. Quinn - Creative Problem Solver** 🔬
   - File: `creative-problem-solver.md`
   - Methodology: TRIZ, Theory of Constraints, Systems Thinking, Root Cause Analysis
   - Style: Sherlock Holmes + playful scientist
   - Output: Systematic solutions addressing root causes
   - Use in Research Lead: ✅ Phase 2 ideation

**Post-ideation tools (enhance chosen ideas):**

5. **Caravaggio - Presentation Master** 🎨
   - File: `presentation-master.md`
   - Specialty: Visual communication, presentation design, pitch decks
   - Style: Energetic creative director with sarcastic wit
   - Output: Multi-slide presentations, infographics, visual metaphors
   - Use in Research Lead: ❌ Not for ideation (Phase 5+ enhancement only)

6. **Sophia - Storyteller** 📖
   - File: `storyteller/storyteller.md`
   - Specialty: Narrative frameworks (25 storytelling structures)
   - Style: Bard weaving epic tales - flowery, whimsical
   - Output: Compelling narratives, brand stories
   - Use in Research Lead: ❌ Not for ideation (Phase 5+ enhancement only)

**Summary:**
- **4 ideation personas** (Carson, Victor, Maya, Quinn)
- **2 post-ideation enhancement personas** (Caravaggio, Sophia)

**Recommendation:** Use all 4 ideation personas for Research Lead Phase 2.

---

### **Q3: Is Quinn Redundant with Mary?**

**User question:** "4 personas every time I feel like? Is Quinn redundant with Mary? You tell me."

**Answer:**

**Quinn and Mary are NOT redundant** - they serve different phases with different goals:

#### **Dr. Quinn (Creative Problem Solver)** - Phase 2: IDEATION
- **Role:** Generate creative solutions
- **Methodology:** TRIZ, Systems Thinking, Root Cause Analysis
- **Question he answers:** "What are innovative ways to solve this problem?"
- **Output:** 5 systematic solution approaches (creative generation)
- **Mindset:** Divergent, exploratory, "what if we tried..."
- **Example output:**
  - "Apply TRIZ contradiction matrix: eliminate the problem by inverting constraints"
  - "Use Theory of Constraints: identify the bottleneck and design around it"
  - "Systems thinking: solve the upstream cause, not the downstream symptom"

#### **Mary (Business Analyst)** - Phase 3: VALIDATION
- **Role:** Validate and analyze existing ideas
- **Methodology:** Market research, competitive analysis, feasibility assessment
- **Question she answers:** "Which of these ideas are viable?"
- **Output:** Scored validation (novelty/market/feasibility/monetization)
- **Mindset:** Convergent, analytical, "does this actually work?"
- **Example output:**
  - "Competitor X already does this; market is saturated"
  - "Technical feasibility: requires 3 external APIs, 8/10 complexity"
  - "Monetization: strong SaaS potential, comps charge $10-50/mo"

#### **Key Difference:**

**Quinn = Creative Input** (generates solutions)  
**Mary = Analytical Filter** (validates solutions)

**Quinn creates.** Mary evaluates.

**Example:**
- **Quinn's output:** "Use TRIZ inversion: instead of users uploading screenshots, auto-capture from clipboard with hotkey"
- **Mary's validation:** "Clipboard auto-capture requires OS permissions. Technically feasible but adds friction. Competitor 'CleanShot X' does this. Novelty: 3/10."

**Recommendation:** Include Quinn! He brings systematic creativity that Carson/Victor/Maya don't. Total: 4 ideation personas.

---

### **Q4: Two Pipeline Architecture**

**User clarification:**

> "Full pipeline autonomy. We are building 2 main pipelines:
> 1. I give either 0 direction or some direction, and the system generates a batch # of product briefs to be put into a `projects/ideas-queue/`, I will determine when to pass from ideas-queue and into a project-lead (for now).
> 2. I give an idea on what to build, and the system outputs 1 product brief which is put into `ideas-queue/`, then I also decide when to pass to a project-lead."

**Answer:**

**This is a MAJOR architecture insight!** You want Research Lead to generate **MULTIPLE COMPLETE product briefs**, not present options for you to choose.

**Original plan (WRONG):**
```
Research Lead generates 15-20 raw approaches
→ Mary validates 3-5 approaches
→ Present to operator: "Pick one"
→ Operator picks #2
→ Research Lead compiles intake.md for #2 only
```

**Correct architecture (based on your feedback):**

#### **Pipeline 1: Batch Mode (Multiple Briefs)**

**Trigger:** 
- "Research productivity tools" (no specific direction)
- "Explore wellness app opportunities" (some direction)

**Flow:**
```
1. Problem Framing (minimal or auto-generated from trigger)
2. CIS Ideation (4 personas × 5 approaches = 20 raw ideas)
3. Consolidation (dedupe → 12-15 unique approaches)
4. Mary Validation (scores all, selects top 3-5)
5. **Batch Compilation:** Research Lead compiles FULL product brief for EACH validated approach
   - Approach #1 → product-brief-1.md
   - Approach #2 → product-brief-2.md
   - Approach #3 → product-brief-3.md
   - Approach #4 → product-brief-4.md
   - Approach #5 → product-brief-5.md
6. Save all briefs to: `projects/ideas-queue/batch-YYYY-MM-DD-HH-MM/`
7. Research Lead signals Kelly: "Batch complete: 5 briefs ready in ideas-queue"
8. (Later) Operator reviews ideas-queue/, picks 1-N briefs to build
9. (Later) Operator: "Move idea-X to projects/", Kelly spawns Project Lead
```

**Output:** 3-5 complete product briefs, all ready for Project Lead

---

#### **Pipeline 2: Single Mode (One Brief)**

**Trigger:**
- "Research screenshot beautifier" (specific idea)
- "Validate this idea: meeting cost calculator" (specific validation request)

**Flow:**
```
1. Problem Framing (extract from trigger + quick operator clarification)
2. CIS Ideation (4 personas × 5 approaches = 20 variations of the core idea)
3. Consolidation (merge variations → 8-10 refined versions)
4. Mary Validation (scores all, selects BEST version)
5. **Single Compilation:** Research Lead compiles FULL product brief for the top approach
   - output: product-brief.md
6. Save to: `projects/ideas-queue/screenshot-beautifier-YYYY-MM-DD/`
7. Research Lead signals Kelly: "Product brief ready: screenshot-beautifier"
8. (Later) Operator reviews brief in ideas-queue/
9. (Later) Operator: "Move to projects/", Kelly spawns Project Lead
```

**Output:** 1 complete product brief, ready for Project Lead

---

#### **Key Changes to Original Plan:**

**OLD:**
- Operator picks which approach to develop (Phase 4)
- Research Lead compiles intake.md for chosen approach only
- Immediate handoff to Project Lead

**NEW:**
- Research Lead compiles product briefs for ALL validated approaches (Batch) or BEST approach (Single)
- All briefs saved to **ideas-queue/** (new holding area)
- **No operator interaction during research** (full autonomy)
- Operator reviews **ideas-queue/ separately** (decoupled from research)
- Operator decides **when** to promote brief from queue to active project

**Benefits:**
1. **Decouples research from implementation decision** - research runs fully autonomous
2. **Builds backlog** - ideas-queue accumulates validated briefs over time
3. **Operator flexibility** - review queue when convenient, pick multiple, batch decisions
4. **No blocking** - Research Lead doesn't wait for operator during process

---

### **Q5: Does Mary Exist?**

**User question:** "Mary is part of BMM, not sure if she exists. Maybe?"

**Answer:**

**YES! Mary exists** ✅

**File:** `_bmad/bmm/agents/analyst.md`  
**Agent name:** Mary  
**Title:** Business Analyst  
**Icon:** 📊

**Her workflows:**
- **Market Research (MR):** Market analysis, competitive landscape, customer needs, trends
- **Domain Research (DR):** Industry domain deep dive, subject matter expertise, terminology
- **Technical Research (TR):** Technical feasibility, architecture options, implementation approaches
- **Create Product Brief (CB):** Guided experience to nail down product idea into executive brief

**Her persona:**
- Role: Strategic Business Analyst + Requirements Expert
- Identity: Senior analyst with market research, competitive analysis, requirements elicitation expertise
- Communication style: "Speaks with the excitement of a treasure hunter - thrilled by every clue, energized when patterns emerge"
- Principles: Porter's Five Forces, SWOT analysis, root cause analysis, competitive intelligence

**Perfect fit for Research Lead Phase 3 (Validation)!**

We can adapt Mary's Market Research and Technical Research workflows for validation.

**Adaptation strategy:**
- Keep Mary's persona and analytical frameworks
- Strip interactive menu system
- Spawn Mary with task: "Validate these 12 approaches. For each: competitive check, feasibility study, market evidence, business model viability, novelty score. Output: mary-validation.md with top 3-5 ranked approaches."

---

## Architecture Changes Summary

### **Original Plan:**
```
Research Lead
├─ Phase 1: Problem framing
├─ Phase 2: CIS ideation (3-4 personas)
├─ Phase 2.5: Consolidation
├─ Phase 3: Mary validation (top 3-5)
├─ Phase 4: OPERATOR PICKS ONE ← blocking step
├─ Phase 5: Compile intake.md for chosen approach
└─ Handoff: Kelly spawns Project Lead immediately
```

### **New Plan (Batch & Single Pipelines):**

#### **Batch Mode:**
```
Research Lead (Batch)
├─ Phase 1: Problem framing (minimal/auto)
├─ Phase 2: CIS ideation (4 personas × 5 = 20)
├─ Phase 2.5: Consolidation (→ 12-15 unique)
├─ Phase 3: Mary validation (→ top 3-5 scored)
├─ Phase 4: Batch compilation (3-5 FULL product briefs)
└─ Output: ideas-queue/batch-YYYY-MM-DD-HH-MM/
            ├─ product-brief-1.md
            ├─ product-brief-2.md
            ├─ product-brief-3.md
            ├─ product-brief-4.md
            └─ product-brief-5.md

(Later, separate from research)
Operator reviews ideas-queue/
Operator: "Move brief-2 to projects/"
Kelly: Spawn Project Lead with brief-2
```

#### **Single Mode:**
```
Research Lead (Single)
├─ Phase 1: Problem framing (specific idea)
├─ Phase 2: CIS ideation (4 personas × 5 variations = 20)
├─ Phase 2.5: Consolidation (→ 8-10 refined versions)
├─ Phase 3: Mary validation (→ BEST version)
├─ Phase 4: Single compilation (1 FULL product brief)
└─ Output: ideas-queue/screenshot-beautifier-YYYY-MM-DD/
            └─ product-brief.md

(Later, separate from research)
Operator reviews ideas-queue/
Operator: "Move to projects/"
Kelly: Spawn Project Lead with brief
```

---

## Open Questions Resolved

**Q1: CIS adaptation strategy?**
✅ **Answer:** Option A (simplified AGENTS.md). We extract persona + methodologies, not interactive workflows. Spawn as autonomous ideation subagents.

**Q2: How many CIS personas?**
✅ **Answer:** All 4 ideation personas (Carson, Victor, Maya, Quinn). Total: 20 raw approaches (4 × 5).

**Q3: Quinn redundancy?**
✅ **Answer:** NOT redundant. Quinn generates (creative), Mary validates (analytical). Include Quinn.

**Q4: Autonomy level?**
✅ **Answer:** Full pipeline autonomy. No operator interaction during research. Batch/Single modes output to ideas-queue/.

**Q5: Mary existence?**
✅ **Answer:** Mary exists in BMM as analyst.md. Adapt her Market Research + Technical Research workflows.

---

## Next Steps

1. **Update implementation plan** with new Batch/Single pipeline architecture
2. **Define ideas-queue/ structure** (how briefs are organized)
3. **Clarify batch size** (default 3-5 briefs, or configurable?)
4. **Define product-brief.md format** (comprehensive intake.md ready for Project Lead)
5. **Kelly integration:** How does operator signal "move this brief to projects/"?

**Awaiting operator confirmation:**
- Is this architecture correct now?
- Any other clarifications needed before updating implementation plan?
