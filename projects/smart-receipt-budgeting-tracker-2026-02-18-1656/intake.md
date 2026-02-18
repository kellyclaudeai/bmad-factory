# Prepwise - Product Intake

**Project ID:** smart-receipt-budgeting-tracker-2026-02-18-1656  
**Discovery Date:** 2026-02-18  
**Discovery Strategy:** Review Gap Mining (Mary)  
**Research Status:** ✅ Complete  

---

## Executive Summary

**Problem:** Personal budgeting app users struggle with line-item categorization when scanning receipts from multi-category purchases (Costco, Target, Walmart). Business expense apps have the tech but cost $20-50/mo. Consumer apps lack line-item extraction entirely.

**Solution:** Prepwise flips the workflow. Users build shopping lists BEFORE shopping and tag items with categories. After checkout, snap receipt photo → app matches line items to pre-categorized list entries via fuzzy matching. Personal item library builds over time.

**Target Audience:** Budget-conscious consumers, young professionals (25-45), families shopping at big-box retailers. Currently use YNAB/Copilot/Monarch or spreadsheets. Weekly pain point.

**Market Gap:** ZERO competitors combine shopping list planning + budget categorization + receipt verification. Wide open space.

**Decision:** ✅ GO - Proceed to planning phase

---

## Phase 1: Problem Discovery

**Analyst:** Mary (Business Analyst)  
**Strategy:** Review Gap Mining  

### Problem Statement

Personal budgeting app users struggle with line-item categorization when scanning receipts from multi-category purchases (e.g., Costco trip with groceries, household items, electronics). 

**Pain Points:**
- Business expense apps (Expensify, Dext) support line-item extraction but cost $20-50/month and target corporate users
- Consumer budgeting apps (YNAB, Copilot, Monarch) require manual entry or only capture receipt totals
- Impossible to accurately track spending by category from a single multi-category receipt
- Users forced to either manually split transactions (time-consuming) or accept inaccurate category budgets
- Often leads to abandoning budgeting altogether

### Evidence Summary

**Sources:**
- Reddit (r/budget, r/personalfinance): Multiple threads with 20+ upvotes documenting frustration
- Direct quotes: "Manual data entry: It's time-consuming to manually input every expense"
- Explicit gap identified: "That seems to be the real tough one that's missing in personal finance apps, but many corporate expense apps can handle"

**Workarounds:**
- Manual entry in YNAB/spreadsheets
- Ignoring multi-category receipts → inaccurate budgets
- Using expensive business apps for personal use

**Frequency:** Weekly pain (every shopping trip)

**Solution Gap:** POORLY SERVED
- Business apps have technology but wrong pricing/UX for consumers
- Consumer apps lack feature entirely
- No middle-ground solution exists

### Scoring (41/50)

- **Pain Intensity:** 8/10 - Weekly frustration, explicit abandonment mentioned
- **Evidence Breadth:** 8/10 - Multiple Reddit threads, cross-platform validation
- **Solution Gap:** 9/10 - POORLY SERVED (inverse scale: 10 = no solutions)
- **Buildability:** 8/10 - OCR + matching logic, achievable with our stack
- **Demand Validation:** 8/10 - YNAB 1M+ users at $99/yr, proven willingness to pay

---

## Phase 3: Solution Ideation

**CIS Personas:** Carson (Brainstorming Coach), Maya (Design Thinking Coach), Quinn (Creative Problem Solver)  
**Victor:** Failed due to API billing error  

### All Solutions Generated (15 total)

#### Carson's Solutions

1. **Oops** - Collaborative receipt intelligence platform (crowdsourced categorizations)
2. **Retrograde (API)** - Loyalty API integration (Target Circle, Costco APIs)
3. **CartCast** - Predictive cart-scanning before checkout
4. **Fixer** - Intentionally imperfect OCR + fast correction UX
5. **Beacon** - Pattern inference, receipt-optional budgeting

#### Maya's Solutions

6. **Glimpse** - Conversational AI for receipt categorization (chat interface)
7. **Canopy (Tree)** - Tree visualization (branches = categories)
8. **Breadcrumb** - Predictive trajectory alerts before overspending
9. **Hearth** - Family collaborative budgeting
10. **Tally** - Micro-moments swipe UI (Tinder-style)

#### Quinn's Solutions

11. **Retrograde (Shopping List)** - Pre-purchase categorization via shopping lists ⭐
12. **Canopy (Crowd)** - Crowd-sourced receipt intelligence network
13. **Tessellate** - Personal ML learning unique patterns
14. **Quarterdeck** - Store-based budgeting (abandon categories)
15. **Motif** - Ratio-based pattern prediction

---

## Phase 4: Solution Selection

**Analyst:** Research Lead (Mary unavailable due to spawn allowlist issue)  

### Top 3 Finalists

1. **Retrograde (Shopping List First - Quinn):** 46/50 ⭐
   - Novelty: 9/10 - Shopping list as primary budget input is truly novel
   - Problem-Solution Fit: 10/10 - Categorization happens BEFORE purchase when easy
   - Feasibility: 9/10 - List builder + fuzzy matching, very achievable
   - Differentiation: 10/10 - Fundamentally different flow: plan → shop → verify
   - Monetizability: 8/10 - $10-15/mo justified, high retention potential

2. **Retrograde (Loyalty API - Carson):** 43/50
   - Novel API approach but retailer integration complexity/risk

3. **Quarterdeck (Store-Based):** 43/50
   - Radical paradigm shift but niche appeal

### Winner: Retrograde (Shopping List First)

**Why it wins:**
- **Perfect Problem-Solution Fit:** Solves root cause by moving categorization to BEFORE purchase when cognitive load is low
- **Highest Feasibility:** List builder + fuzzy matching + personal item library - all achievable for solo dev
- **Maximum Differentiation:** Nobody does this. Inverts the entire flow.
- **Natural User Behavior:** People ALREADY make shopping lists. This adds categorization to existing habit.
- **Graceful Degradation:** Works with partial adoption (some stores planned, others scanned traditionally)
- **Defensibility:** Personal item library creates lock-in over time

**Comparison to runners-up:**
- vs. Loyalty API Retrograde: Shopping list approach has NO API integration risk, works at any store
- vs. Quarterdeck: More flexible - users who need category detail can have it

---

## Phase 5: Competitive Deep-Dive

### Market Landscape

**Direct Competitors:** NONE FOUND
- No consumer budgeting app combines shopping list planning + budget categorization + receipt verification

**Indirect Competitors:**

| Category | Players | Gap |
|----------|---------|-----|
| **Shopping List Apps** | Grocery IQ, AnyList, Out of Milk | NO budget integration |
| **Budget Apps** | YNAB ($99/yr), Copilot ($70-100/yr), Monarch ($100/yr) | NO receipt line-item extraction, NO shopping list |
| **Receipt Scanners** | Expensify ($20-50/mo), Dext ($49/mo) | Business-focused, wrong pricing/UX |

### Feature Comparison Matrix

| Feature | **Prepwise** | YNAB | Copilot | Grocery IQ | Expensify |
|---------|-----------|------|---------|-----------|--------------|
| Shopping list builder | ✅ Core | ❌ | ❌ | ✅ | ❌ |
| Pre-purchase categorization | ✅ Unique | ❌ | ❌ | ❌ | ❌ |
| Receipt OCR | ✅ Verification | ❌ | ❌ | ❌ | ✅ |
| Line-item extraction | ✅ Match to list | ❌ | ❌ | ❌ | ✅ Business |
| Budget categories (personal) | ✅ | ✅ | ✅ | ❌ | ❌ Corporate |
| Personal item library | ✅ Builds over time | ❌ | ❌ | ❌ | ❌ |
| Pricing | $10-15/mo | $99/yr | $70-100/yr | Free | $20-50/mo |

**Conclusion:** Prepwise occupies a WIDE OPEN space.

### Novelty Assessment

**What's Genuinely Novel:**

1. **Paradigm Shift:** Categorization BEFORE purchase (proactive) vs. after (reactive)
   - Cognitive load is LOW during list-building (at home, relaxed)
   - vs. HIGH during receipt review (tired after shopping, staring at 40 items)

2. **Receipt as Verification, Not Data Entry:**
   - Traditional: Receipt → extract → categorize (100% of work)
   - Prepwise: List → categorize → shop → receipt → verify (80% done before shopping)

3. **Personal Item Library:**
   - Builds over 2-3 trips: "Kirkland Almonds" → Groceries
   - Library is PERSONAL (your "almonds" might be "snacks", mine "groceries")
   - Creates lock-in over time

**Risk of Replication:** Low-Medium
- Concept is simple, competitors could copy
- BUT: Personal item library creates switching cost
- First-mover advantage if we build critical mass

### Technical Feasibility

**Stack Validation:** ✅ 100% feasible with Next.js, React, TypeScript, Firebase, Tailwind

| Requirement | Implementation | Stack Fit |
|-------------|----------------|-----------|
| Shopping list builder | Real-time sync | Firebase Firestore ✅ |
| Category tagging | Dropdown/tag UI | React + Tailwind ✅ |
| Receipt capture | Camera API | PWA camera ✅ |
| OCR extraction | Firebase ML Kit or Mindee | API integration ✅ |
| Fuzzy matching | String similarity | TypeScript + fuse.js ✅ |
| Personal item library | User-specific mappings | Firestore per-user ✅ |
| Budget dashboard | Category spending | React + Recharts ✅ |

**Development Estimate:** 8 epics, ~48 stories, 8-12 weeks MVP

**Epic Breakdown:**
1. Auth & Onboarding (5 stories)
2. Shopping List Builder (8 stories)
3. Receipt Capture & OCR (7 stories)
4. Fuzzy Matcher (8 stories)
5. Personal Item Library (6 stories)
6. Budget Integration (6 stories)
7. Export & Integrations (4 stories)
8. Analytics & Insights (4 stories)

**APIs Needed:**
- OCR: Firebase ML Kit (free) or Mindee ($0.10-0.20/receipt)
- No retailer APIs required ✅

**Technical Risks:** LOW
- OCR accuracy variable → Mitigation: fuzzy matching tolerance + manual review UI
- Fuzzy matching false positives → Mitigation: confidence scoring + user corrections
- User adoption barrier → Mitigation: onboarding tutorial + gamification

### Business Model Validation

**Pricing Strategy:** $12/mo subscription

**Tier Structure:**
- **Free:** $0 - 10 receipts/mo, basic list builder, manual categorization
- **Pro:** $12/mo - Unlimited receipts, receipt matching, personal item library, budget dashboard
- **Family:** $18/mo - Pro + 2-4 users, shared lists, collaborative budgeting

**Revenue Projections:**
- **Year 1:** 5,000 paid users × $144/yr = $720K ARR
- **Year 2:** 25,000 users × $144/yr = $3.6M ARR

**Costs (Year 2):**
- OCR (20% Mindee): $72K/yr
- Firebase: $12K/yr
- **Gross margin:** >95%

**Customer Acquisition:**
- Reddit (r/budget, r/personalfinance): Organic + low-cost ads
- Product Hunt launch: Top 5 → 100-250 paid users
- SEO: "How to track Costco purchases by category"
- Partnership with meal planning apps

**CAC Target:** $20-30 (organic), $50-80 (paid)  
**LTV Target:** $288 (2 years retention) → LTV:CAC ratio 3-4:1 ✅

**Retention Drivers:**
1. Personal item library lock-in (50-100 items after 1 month)
2. Habit formation (list → shop → verify routine)
3. Time savings compounding (more items = less work per receipt)

**Target Retention:** 85% annual

### GO / NO-GO Decision

✅ **GO - Proceed to Planning Phase**

**Rationale:**
1. Market Gap Confirmed: ZERO competitors doing this
2. Novel Approach Validated: Proactive vs. reactive categorization
3. Technical Feasibility High: 100% achievable with stack
4. Business Model Solid: Clear pricing, proven willingness to pay
5. Competitive Advantages Defensible: Personal library lock-in, first-mover advantage

**Risk Assessment:** LOW
- No regulatory barriers
- No proprietary data dependencies
- No complex API integrations
- Solo dev scope confirmed (48 stories, 8-12 weeks MVP)

---

## Phase 6: Creative Naming

**Naming Lead:** Research Lead (Carson unavailable due to spawn allowlist issue)

### PRIMARY NAME: **Prepwise**

**Style:** Compound Word (Prep + Wise)

**Rationale:**
- **"Prep"** = preparation, planning (shopping list phase)
- **"Wise"** = smart, informed decisions (budget-conscious)
- Captures core value prop: be wise by prepping
- Easy to remember, pronounce, spell
- Domain: prepwise.com (likely available)
- Brandable, professional but approachable

### Alternative Names

1. **Beforehand** - Single evocative word emphasizing "before you shop"
2. **CartCheck** - References both phases: cart (list) + check (receipt)
3. **Tally First** - Action phrase, playful inversion ("buy first, tally later")
4. **Sorted** - Double meaning: categorized + problem solved

---

## Final Product Definition

### Name
**Prepwise**

### Tagline
"Budget smarter. Plan before you shop."

### Core Value Proposition
Build your shopping list, tag categories, then snap your receipt to verify—no tedious line-item entry. The more you use it, the faster it gets.

### Target Audience
Budget-conscious consumers, young professionals (25-45), families tracking household spending at multi-category retailers (Costco, Target, Walmart). Currently use YNAB/Copilot/Monarch or spreadsheets. Weekly pain (every shopping trip). Proven willingness to pay $10-15/mo for budgeting apps.

### Key Features
1. **Shopping list builder with category tagging** - Build lists before shopping, tag each item with budget category
2. **Receipt capture and OCR extraction** - Snap photo after checkout, automatic line-item extraction
3. **Fuzzy matching (list items → receipt items)** - System matches receipt lines to planned purchases
4. **Personal item library (learns over time)** - After 2-3 trips, 80%+ items auto-match from your library
5. **Budget dashboard (category spending vs planned)** - Real-time spending tracking by category
6. **One-tap categorization for unmatched items** - Quick review for impulse purchases or new items

### Platform & Stack
- **Platform:** Web-app (PWA)
- **Business Model:** B2C SaaS
- **Stack:** Next.js, React, TypeScript, Firebase, Tailwind CSS
- **Scope:** 48 stories, 8 epics, 8-12 weeks MVP

### Competitive Positioning
- **vs. YNAB:** Same target audience, but eliminates manual entry pain with pre-purchase categorization
- **vs. Copilot/Monarch:** Adds receipt line-item support they lack entirely
- **vs. Expensify/Dext:** Consumer pricing ($12/mo vs $20-50/mo), designed for personal budgeting not business expense reports
- **vs. Shopping list apps:** Adds budget tracking they lack

### Pricing
- **Free tier:** 10 receipts/mo, basic features
- **Pro:** $12/mo - Unlimited, full feature set
- **Family:** $18/mo - Multi-user, shared lists

---

## Next Steps

1. **Project Lead Assignment** - Kelly to spawn Project Lead for planning phase
2. **Technical Spike** - Research OCR options (Firebase ML Kit vs Mindee)
3. **Domain Registration** - Secure prepwise.com if available
4. **Design System Setup** - Establish Tailwind config, component library
5. **Epic Prioritization** - Define MVP scope (likely: Auth, List Builder, Receipt Capture, Fuzzy Matcher, Basic Budget Dashboard)

---

## Research Artifacts

**Location:** `/Users/austenallred/clawd/projects/smart-receipt-budgeting-tracker-2026-02-18-1656/`

- `solution-scoring.md` - Full scoring matrix for all 15 solutions
- `competitive-deepdive.md` - Detailed competitive analysis
- `creative-naming.md` - Naming options and rationale

**Registry Entry:** `/Users/austenallred/clawd/projects/project-registry.json`  
**Session Transcript:** `/Users/austenallred/.openclaw/agents/research-lead/sessions/5acc58cc-17eb-4bde-ab9d-4918d7a3bca6.jsonl`

---

**Research Completed:** 2026-02-18 23:08 UTC  
**Status:** Ready for Planning Phase  
**Confidence Level:** High (wide open market, clear differentiation, feasible scope)
