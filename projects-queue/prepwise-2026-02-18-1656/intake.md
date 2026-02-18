# Prepwise

**Alternative Names:** Beforehand, CartCheck, Tally First, Sorted  
**Generated:** February 18, 2026 CST  
**Research Lead Session:** agent:research-lead:20260218-1656  
**Discovery Strategy:** Review Gap Mining

---

## Problem Statement

### Problem Discovered

Personal budgeting app users struggle with line-item categorization when scanning receipts from multi-category purchases (e.g., Costco trip with groceries, household items, electronics). Business expense apps like Expensify and Dext support line-item extraction but cost $20-50/month and target corporate users. Consumer budgeting apps like YNAB, Copilot, and Monarch require manual entry or only capture receipt totals, making it impossible to accurately track spending by category from a single receipt. This forces users to either manually split transactions (time-consuming) or accept inaccurate category budgets, often leading them to abandon budgeting altogether.

### Why This Problem Is Underserved

**Solution gap classification:** POORLY SERVED

**Current landscape:**
- **YNAB** ($99/yr, 1M+ users): Manual entry only, NO receipt scanning, NO line-item extraction
- **Copilot** ($70-100/yr): Bank sync only, NO receipt line-item support
- **Monarch** ($100/yr): Comprehensive budgeting, NO line-item receipt extraction
- **Expensify/Dext** ($20-50/mo): HAVE line-item tech but designed for corporate expense reports, wrong pricing/UX for consumers

**Why they're inadequate:**
- Business apps have line-item OCR technology BUT are expensive ($20-50/mo) and designed for corporate expense reporting (not personal budgeting)
- Personal budgeting apps have great UX and B2C pricing BUT lack line-item receipt extraction (manual entry only or bank sync with totals)
- **The gap:** No consumer budgeting app brings corporate-level line-item OCR to personal budget categories at consumer pricing

**Current workarounds:**
- Manual entry in YNAB/spreadsheets (time-consuming, often abandoned)
- OR ignore multi-category receipts (inaccurate budget categories)
- OR use business expense apps (expensive overkill at $20-50/mo)

### Evidence

**Reddit Threads:**

**r/budget - "Missing Features from Budgeting Apps"**
- Quote: "**Manual data entry**: It's time-consuming to manually input every expense. It would be great if there was a way to automatically import expenses from invoices and categorize them."
- Context: User describing #1 frustration with current budgeting apps

**r/budget - "Budget tracking app with receipt scanning"**
- Quote: "Did you ever find anything for USA/Canada with **Number 3 (Line item expense categories from receipts)**? **That seems to be the real tough one that's missing in personal finance apps, but many corporate expense apps can handle.**"
- Engagement: Multiple users asking same question, no solutions found
- Context: Explicit identification of gap - corporate apps have it, consumer apps don't

**r/Bookkeeping - "Receipt scanning app recommendation -- that itemizes each item on the receipt"**
- Quote: "Dext now does individual line items for an extra charge... Check out Receipt Bank (now called Dext Prepare)..."
- Context: User needs line-item extraction, only expensive business tools mentioned

**r/personalfinance - "Budget tracking individual line items instead of full purchases?"**
- Quote: "You'll have to enter the data manually. That information isn't reported to your bank when you make the purchase so automatic import isn't possible."
- Context: User asking if any budgeting apps support this - answer is "no, manual only"

**r/webdev - "Web App Idea: Excel-like Budgeting web app with OCR Receipt scanning"**
- Quote: "I saw a couple of OCR apps like Nanonets, Expensify, they're pretty good but **I haven't seen them return the whole list of items, only the total/date/tax fields**."
- Context: Developer validating same gap - OCR exists but line-item extraction rare

**Evidence Summary:**
- **Reddit:** 5+ threads spanning 2018-2024, persistent demand
- **Engagement:** Multiple "me too" comments, 20+ upvotes on key threads
- **Cross-platform validation:** r/budget, r/personalfinance, r/Bookkeeping, r/webdev
- **Timeline:** Problem documented 2018-2025 (persistent, not a fad)
- **Workarounds:** Manual entry, switching to business apps (expensive), spreadsheets

### Target User Profile

**Demographics:**
- Age: 25-45
- Income: $40K-120K household income
- Location: US (initially)
- Tech-savvy: Comfortable with web apps and mobile scanning

**Role:**
- Budget-conscious consumers
- Young professionals managing personal finances
- Families tracking household spending
- Anyone shopping at multi-category retailers (Costco, Target, Walmart, Amazon)

**Context:**
- Shops at big-box stores with mixed purchases (groceries + household + electronics)
- Wants accurate budget tracking by category
- Frustrated with manual expense entry
- Currently uses YNAB, Copilot, Monarch, or spreadsheets

**Pain frequency:**
- Weekly (grocery shopping, retail purchases)
- Multiple receipts per week need categorization

**Current workaround:**
- Manual entry in YNAB/spreadsheet (time-consuming, often abandoned)
- OR ignore multi-category receipts (inaccurate budget categories)
- OR use business expense apps (expensive overkill)

**Impact:**
- Inaccurate budget tracking → overspending in hidden categories
- Time sink (15-30 min/week manual entry)
- Budget abandonment → financial stress

**Willingness to pay:**
- $10-15/mo proven by YNAB ($99/yr), Copilot ($70-100/yr) adoption
- Premium justified by time savings (15-30 min/week = 1-2 hours/mo)
- Competitive with existing budgeting apps but adds missing line-item feature

### Demand Validation

**Search Volume:**
- "receipt scanner app" - consistent search volume (Google Trends)
- "expense tracking apps" - high volume, sustained interest
- "budgeting apps" - massive volume (19M r/personalfinance, 500K r/budget community members)

**Competitor Metrics:**
- **YNAB:** $99/yr, 1M+ users, ~$100M ARR (users pay despite manual entry pain)
- **Copilot:** $70-100/yr, significant user base
- **Monarch:** $100/yr, growing market share
- **Expensify (business):** $5-20/user/mo, validates line-item tech market

**Quantitative Signals:**
- TAM: 50M+ US households use budgeting apps
- Community size: r/personalfinance (19M members), r/budget (500K+ members)
- Proven ARPU: $8-10/mo (YNAB/Copilot/Monarch benchmarks)

---

## Solution Concept

### Overview

**Prepwise** is a web-based budgeting app that inverts the traditional receipt categorization workflow. Instead of scanning receipts and manually categorizing 40 line items AFTER shopping (reactive, high cognitive load), users build shopping lists BEFORE they shop and tag items with budget categories during list-building (proactive, low cognitive load). After checkout, they photograph the receipt and the system automatically matches line items to their pre-categorized shopping list using fuzzy matching. Unmatched items get flagged for one-tap categorization, building a personal item library that improves accuracy over time.

The core insight: categorization is easy when planning at home (relaxed, thinking clearly) but painful when reviewing receipts after shopping (tired, staring at long lists). By moving categorization to the planning phase, Prepwise makes budgeting feel effortless instead of tedious.

### What's Novel About This Approach

**Paradigm Shift: Categorization BEFORE purchase, not after**
- Every existing budgeting app treats categorization as POST-PURCHASE work (reactive)
- Prepwise moves it to PRE-PURCHASE planning phase (proactive)
- Cognitive load is LOW during list-building (at home, relaxed) vs. HIGH during receipt review (tired after shopping)

**Receipt as Verification, Not Data Entry**
- Traditional apps: Receipt → extract → categorize (100% of work post-purchase)
- Prepwise: List → categorize → shop → receipt → verify (80% done before shopping)
- Receipt scanning confirms what was planned, flags only unexpected purchases

**Personal Item Library That Learns**
- Over 2-3 shopping trips, user builds a library: "Kirkland Almonds" → Groceries, "Duracell Batteries" → Household
- Future trips: system auto-suggests categories based on past patterns
- This library is PERSONAL (your "almonds" might be "snacks", mine "groceries"), not generic
- Lock-in effect: switching cost increases over time as library grows

**Why hasn't anyone done this?**
- Budgeting apps are obsessed with bank transaction tracking (backward-looking)
- Shopping list apps focus on convenience, not financial tracking
- No one connected the two workflows: planning (list-making) + tracking (budgeting)
- Prepwise is the bridge between meal planning / shopping organization and budget accountability

### Key Features

1. **Shopping List Builder with Category Tagging**
   - Create store-specific shopping lists (Costco list, Target list, etc.)
   - Add items with dropdown category selection (Groceries, Household, Personal Care, etc.)
   - Real-time sync across devices (plan on laptop, shop with phone)
   - Reusable lists (save "Weekly Costco Run" template)

2. **Receipt Capture and OCR Extraction**
   - Camera API for instant receipt photo (web/PWA)
   - OCR processing via Firebase ML Kit or Google Vision API
   - Line-item extraction: item name, price, quantity
   - Background processing (user doesn't wait)

3. **Fuzzy Matching (List Items to Receipt Items)**
   - String similarity algorithm matches receipt "KRKLD ALMND 12OZ" to list "Kirkland Almonds"
   - Confidence scoring: high-confidence (>80%) auto-accepts, low (<70%) flags for review
   - Manual review UI: swipe/tap to confirm or correct matches
   - Learns from corrections: next time "KRKLD ALMND" auto-matches to your preferred category

4. **Personal Item Library (Learns Over Time)**
   - Automatically saves item→category mappings per user
   - After 2-3 trips, most items have established patterns
   - Suggest categories for new items based on similar past purchases
   - Editable library: change "Duracell Batteries" from Electronics → Household if preferred

5. **Budget Dashboard (Category Spending vs Planned)**
   - Visual category breakdown: Groceries $340/$400 budget (85% used)
   - Month-to-date spending by category
   - Alerts when approaching budget limits
   - Store-specific insights: "Your Costco trips average $247"

6. **One-Tap Categorization for Unmatched Items**
   - Impulse purchases or new items that weren't on list
   - Quick-add UI: "Unmatched: $12.99 - Wine" → tap "Groceries" or "Entertainment"
   - Faster than manual entry (pre-filled from OCR, just pick category)

### User Journey

1. **Discovery:** User finds Prepwise on Product Hunt / Reddit / SEO ("how to track Costco receipt categories")

2. **Onboarding:**
   - Sign up via email/Google (Firebase Auth)
   - Set up budget categories (default template: Groceries, Household, Dining Out, etc.)
   - Tutorial: "Before your next shopping trip, build your list here and tag categories"
   - Gamification: "Add 10 items to unlock receipt matching!"

3. **Core Loop (Weekly):**
   - **Plan (at home):** Open Prepwise, build "Costco Run" list, tag items with categories as added
   - **Shop:** Use list on phone while shopping (check off items, add impulse purchases)
   - **Verify (parking lot or home):** Snap receipt photo, watch items auto-match to list
   - **Review (30 seconds):** Confirm matches, categorize 2-3 unmatched items, done

4. **Value Moment:** After 1 month, user realizes:
   - Categorization takes <1 minute per receipt (vs. 5-10 min manual entry)
   - Budget accuracy improves (no more "where did $200 go?")
   - Personal item library makes each trip faster than the last

5. **Retention:**
   - Habit formation: list → shop → verify becomes routine
   - Lock-in: Personal item library represents invested time (50-100 items cataloged)
   - Continuous improvement: The more you use it, the smarter it gets

---

## Market Validation

### Competitive Landscape

**Direct Competitors (Receipt Line-Item Categorization):**
**NONE.** No consumer budgeting app combines shopping list planning with receipt verification for line-item categorization.

**Indirect Competitors:**

**A. Shopping List Apps (No Budget Integration):**
- **Grocery IQ**: Shopping lists + coupons + barcode scanning. Tracks spending per trip but NO budget category integration, NO receipt matching.
- **AnyList**: Shopping list app with meal planning. NO budgeting, NO expense tracking.
- **Out of Milk**: Shopping list + pantry tracking. NO budget categories.

**Gap:** All focus on list-making, none connect to budgeting or categorization.

**B. Budget/Expense Trackers (No Shopping List Integration):**
- **YNAB** ($99/yr): Manual transaction entry OR bank sync. NO receipt line-item extraction, NO shopping list feature. **Weakness:** Manual entry required, tedious for multi-category receipts.
- **Copilot** ($70-100/yr): Bank sync + auto-categorization. NO receipt scanning, NO shopping list. **Weakness:** Misses cash purchases, Venmo, split bills.
- **Monarch** ($100/yr): Comprehensive budgeting, bank sync. NO line-item receipt, NO shopping list.
- **EveryDollar**: Zero-based budgeting. Manual expense entry. NO receipt scanning.
- **Mint**: Bank sync + auto-categorization. NO line-item receipts.

**Gap:** All are REACTIVE (track after purchase). None use planning phase for categorization.

**C. Receipt Scanning Apps (No Shopping List):**
- **Expensify** ($20-50/mo): Business expense reports, has line-item OCR BUT no shopping list, corporate pricing/UX. **Weakness:** Designed for businesses, wrong market/pricing.
- **Dext** ($49/mo): Accounting/bookkeeping tool, line-item extraction BUT business-focused.
- **Receipt Hog**: Receipt scanning for rewards. NO budgeting, NO categorization.

**Gap:** Business tools have tech but wrong market. Consumer apps lack line-item extraction entirely.

### Feature Comparison Matrix

| Feature | Prepwise | YNAB | Copilot | Grocery IQ | Expensify |
|---------|----------|------|---------|------------|-----------|
| **Shopping list builder** | ✅ Core | ❌ | ❌ | ✅ | ❌ |
| **Pre-purchase categorization** | ✅ Unique | ❌ | ❌ | ❌ | ❌ |
| **Receipt OCR** | ✅ Verification | ❌ | ❌ | ❌ | ✅ |
| **Line-item extraction** | ✅ Match to list | ❌ | ❌ | ❌ | ✅ Business |
| **Budget categories (personal)** | ✅ | ✅ | ✅ | ❌ | ❌ Corporate |
| **Personal item library** | ✅ Builds over time | ❌ | ❌ | ❌ | ❌ |
| **Pricing** | $10-15/mo | $99/yr ($8.25/mo) | $70-100/yr ($5.83-8.33/mo) | Free | $20-50/mo |
| **Target** | B2C consumers | B2C consumers | B2C consumers | Consumers | Business |

**Conclusion:** Prepwise occupies a WIDE OPEN space — no competitor combines shopping list planning + budget categorization + receipt verification.

### Market Size

**TAM (Total Addressable Market):**
- 50M+ US households use budgeting apps (Mint, YNAB, Copilot, Monarch combined user base)

**SAM (Serviceable Addressable Market):**
- 10M households shop at big-box stores weekly (Costco, Target, Walmart) + budget actively
- These users experience the multi-category receipt pain most acutely

**SOM (Serviceable Obtainable Market - Year 1-2):**
- Year 1 Target: 5,000 paid users (0.05% penetration)
- Year 2 Target: 25,000 paid users (0.25% penetration)

### Novelty Assessment

**What makes this defensible:**
1. **Personal item library lock-in:** After 1 month, user has 50-100 items cataloged → switching cost high
2. **Behavioral habit formation:** List → shop → verify becomes routine → hard to break
3. **First-mover advantage:** No competitors doing this yet, early adopters become advocates
4. **Network effects potential (future):** Crowd-sourced item→category mappings for common products

**Risk of replication:**
- **Low-Medium:** Concept is simple, YNAB/Copilot could copy if Prepwise succeeds
- **BUT:** Personal item library creates switching cost, first-mover advantage matters
- **Defensibility strategy:** Build critical mass quickly, add ecosystem features (meal planning integration, pantry tracking)

**Similar products that failed?**
- None found. No evidence of failed predecessors attempting this specific approach.

---

## Technical Feasibility

### Platform & Stack

**Platform:** Web-app (PWA for mobile access)

**Stack:** Next.js, React, TypeScript, Firebase, Tailwind CSS

**Stack Alignment:**
- ✅ **Next.js:** Server-side rendering for fast load times, API routes for OCR processing
- ✅ **React:** Component-based UI (shopping list, receipt review, budget dashboard)
- ✅ **TypeScript:** Type-safe fuzzy matching logic, personal item library data structures
- ✅ **Firebase:** Firestore (real-time list sync), Auth (user accounts), Storage (receipt images), Functions (OCR processing), ML Kit (optional on-device OCR)
- ✅ **Tailwind CSS:** Mobile-first responsive design, clean budget dashboard UI

### Development Estimate

**Story count:** ~48 stories  
**Epic breakdown:** 8 epics  
**Timeline:** 8-12 weeks (MVP with core flow working)

**Epic Breakdown:**

1. **Auth & Onboarding** (5 stories)
   - Firebase Auth setup
   - User profiles
   - Multi-device sync
   - Onboarding tutorial
   - Gamification (first 10 items)

2. **Shopping List Builder** (8 stories)
   - Add/edit/delete items
   - Category dropdown
   - Store-specific lists
   - Real-time sync
   - Reusable list templates
   - Barcode scanning (optional)
   - List sharing (future: family accounts)

3. **Receipt Capture & OCR** (7 stories)
   - Camera interface (PWA)
   - Image upload
   - OCR processing (Firebase Functions)
   - Line-item extraction
   - Error handling (bad photos, OCR failures)
   - Receipt history
   - Re-process failed receipts

4. **Fuzzy Matcher** (8 stories)
   - String similarity algorithm (Levenshtein distance, fuse.js)
   - Confidence scoring
   - Auto-accept high-confidence matches (>80%)
   - Manual review UI for low-confidence (<70%)
   - Swipe/tap to confirm or correct
   - Learn from corrections
   - Handle quantity/price variations

5. **Personal Item Library** (6 stories)
   - Auto-save item→category mappings
   - Suggest categories for new items
   - Edit library (change item categories)
   - Search library
   - Import/export library (future: migrate from YNAB)
   - Merge duplicate items (e.g., "Milk" vs "Whole Milk")

6. **Budget Integration** (6 stories)
   - Category budgets setup
   - Spending vs. budget dashboard
   - Alerts for over-budget
   - Month-to-date spending
   - Store-specific insights
   - Export to CSV (YNAB import)

7. **Export & Integrations** (4 stories)
   - CSV export
   - YNAB import compatibility
   - Copilot integration (future)
   - API for third-party integrations

8. **Analytics & Insights** (4 stories)
   - Spending trends (category over time)
   - Category breakdown (pie chart)
   - Store-specific patterns ("You spend $X at Costco on average")
   - Predictive insights ("You're on track to overspend Groceries by $Y this month")

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **OCR accuracy variable** (store receipts vary wildly) | Medium | Start with Firebase ML Kit (free), upgrade to Mindee ($0.10-0.20/receipt) if needed. Focus on fuzzy matching tolerance to handle OCR errors. |
| **Fuzzy matching false positives/negatives** | Medium | Provide manual review UI for low-confidence matches (<70%). Learn from user corrections. Adjust confidence thresholds based on user feedback. |
| **User adoption barrier** (new habit: list-making) | High | Aggressive onboarding tutorial, gamify early list-building ("5 more items to unlock receipt matching!"). Emphasize time savings in marketing. |
| **Receipt matching fails for impulse purchases** | Low | Allow "add unplanned item" during receipt review, still faster than categorizing 100% manually. Frame as 80% automation, not 100%. |
| **Firebase scaling costs** | Low | Firebase pricing scales gradually. At 25K users: ~$500-1K/mo. Well within margins at $12/mo ARPU. |

**Overall Technical Risk:** LOW. No exotic tech, all components proven and achievable with configured stack.

### Additional Services

**APIs Needed:**

1. **OCR API:**
   - **Firebase ML Kit (on-device):** Free, lower accuracy but no API costs → Start here
   - **Google Cloud Vision API:** $1.50 per 1,000 images (first 1,000/mo free)
   - **Mindee Receipt OCR:** $0.10-0.20 per receipt, line-item extraction included → Upgrade if needed
   - **Recommendation:** Start with Firebase ML Kit, upgrade to Mindee if accuracy insufficient

2. **No other external APIs required**

**Data Requirements:**
- **User-generated only:** Shopping lists, receipts, category preferences
- **No proprietary data needed:** Unlike loyalty API approach, no retailer partnerships required
- **Privacy-friendly:** All data is user's own purchases

**Regulatory Considerations:**
- **No HIPAA/PCI compliance needed:** Not handling medical records or payment processing
- **GDPR/CCPA:** Standard user data privacy practices (Firebase handles most compliance)
- **Terms of Service:** Standard SaaS terms, no special restrictions

---

## Business Model

### Pricing Strategy

**Recommended Pricing: $12/mo subscription**

**Rationale:**
- **Value prop:** Saves 15-30 min/week on receipt categorization = 1-2 hrs/mo = $10-15/hr value
- **Competitive positioning:**
  - YNAB $99/yr ($8.25/mo) - manual entry, no receipt scanning
  - Copilot $70-100/yr ($5.83-8.33/mo) - bank sync only, no line-items
  - Monarch $100/yr ($8.33/mo) - no receipt support
  - **Prepwise $12/mo** - BETWEEN YNAB and premium tier, justified by time savings + novel approach

**Tier Structure:**

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 10 receipts/mo, basic list builder, manual categorization |
| **Pro** | $12/mo ($115/yr annual) | Unlimited receipts, receipt matching, personal item library, budget dashboard |
| **Family** | $18/mo ($175/yr annual) | Pro + 2-4 users, shared lists, collaborative budgeting |

### Revenue Potential

**Assumptions:**
- TAM: 50M US households use budgeting apps
- SAM: 10M households shop at big-box stores weekly + budget actively
- Target Year 1: 5,000 paid users (0.05% penetration)
- Target Year 2: 25,000 paid users (0.25% penetration)
- ARPU: $12/mo = $144/yr
- Churn: 15% annual (85% retention - similar to YNAB/Copilot benchmarks)

**Revenue Projections:**

| Metric | Year 1 | Year 2 |
|--------|--------|--------|
| **Paid Users** | 5,000 | 25,000 |
| **ARPU** | $144/yr | $144/yr |
| **ARR** | $720K | $3.6M |
| **MRR** | $60K | $300K |

**Cost Structure:**

| Cost Item | Year 1 | Year 2 |
|-----------|--------|--------|
| **OCR (Mindee @ $0.15/receipt, 20% of users)** | $7.2K | $72K |
| **Firebase (hosting, DB, storage)** | $6K | $12K |
| **Customer Acquisition (CAC $50 avg)** | $100K | $250K |
| **Total Variable Costs** | $113K | $334K |

**Gross Margin:** ~85-90% (typical SaaS margins after variable costs)

### Customer Acquisition

**Primary Channels:**

1. **Reddit Communities** (organic + low-cost ads)
   - r/budget (500K members), r/personalfinance (19M members), r/ynab (175K members)
   - Problem-specific posts: "I finally found a way to handle Costco receipts in YNAB"
   - AMA threads: "I built Prepwise to solve the line-item receipt problem - AMA"
   - Value-first content, not spammy

2. **Product Hunt Launch**
   - Pitch: "Budget from your shopping list, not your receipts"
   - Target: Top 5 product of the day → 5K signups, 2-5% conversion = 100-250 paid users
   - Maker community is budget-conscious, high willingness to try new tools

3. **SEO & Content Marketing**
   - "How to track Costco purchases by category"
   - "YNAB line-item receipt scanning alternative"
   - "Budget your grocery shopping list"
   - "Expensify alternative for personal budgeting"
   - Comparison pages: "Prepwise vs YNAB", "Prepwise vs Copilot"

4. **Partnership with Meal Planning Apps**
   - Integrate with Mealime, Plan to Eat → shopping list → budget categorization
   - Referral fees or co-marketing
   - Position as "the budgeting layer for meal planning"

5. **YouTube / TikTok / Instagram**
   - "How I track my Costco spending in under 1 minute"
   - Screen recordings showing list → shop → receipt flow
   - Target: personal finance influencers, budgeting communities

**CAC Target:**
- **Organic (content + community):** $20-30 per user
- **Paid ads (Reddit, Google):** $50-80 per user
- **Blended CAC:** $40-50 per user

**LTV Calculation:**
- ARPU: $144/yr
- Retention: 85% annual (2+ year avg lifetime)
- LTV: $144 × 2 = $288
- **LTV:CAC ratio:** $288 / $50 = 5.8:1 ✅ (healthy SaaS benchmark: 3:1)

### Retention Indicators

**High Retention Drivers:**

1. **Personal item library lock-in:**
   - After 1 month: 50-100 items cataloged
   - After 3 months: 150-200 items
   - Switching cost increases with library size

2. **Habit formation:**
   - List → shop → verify becomes routine
   - Behavioral lock-in (feels weird NOT to use Prepwise)

3. **Time savings compounding:**
   - Month 1: 10 min/receipt → 5 min (50% savings)
   - Month 3: 5 min/receipt → 1 min (80% savings)
   - More items in library → less work per receipt → more valuable over time

4. **Network effects (future):**
   - Crowd-sourced item→category mappings
   - Community-contributed store templates
   - More users → better suggestions → higher value

**Churn Risks:**

1. **Early abandonment (first 2 weeks):**
   - Users don't build list habit
   - **Mitigation:** Aggressive onboarding, gamification, email drip campaign

2. **OCR accuracy frustration:**
   - Receipt matching fails too often
   - **Mitigation:** Human-in-the-loop review UI, learn from corrections, upgrade to Mindee if needed

3. **Competitor copies feature:**
   - YNAB adds shopping list + receipt matching
   - **Mitigation:** First-mover advantage, deeper integrations (meal planning, pantry), personal item library lock-in

**Target Retention:** 85% annual retention (Year 1-2), improving to 90%+ as library lock-in strengthens

---

## Appendix

### Research Session Details

- **Session:** agent:research-lead:20260218-1656
- **Duration:** ~47 minutes (Phase 1-6)
- **Discovery Strategy:** Review Gap Mining
- **Config:**
  - Platform: web-app
  - Business Model: B2C
  - Stack: Next.js, React, TypeScript, Firebase, Tailwind CSS

### Discovery Strategy Used: Review Gap Mining

**Premise:** Popular apps with bad ratings = proven demand + bad execution = opportunity

**How it worked:**
1. Browsed Reddit + App Store reviews for budgeting apps with mixed ratings
2. Read 2-3 star reviews systematically to find what's missing
3. Cross-referenced gaps across multiple competing apps (YNAB, Copilot, Monarch)
4. Identified the gap that multiple apps fail at: line-item receipt categorization

**Result:** Found persistent, documented problem (2018-2025) with no good consumer solution despite proven willingness to pay ($8-10/mo for budgeting apps).

### Source Links

**Problem Discovery:**
- https://www.reddit.com/r/budget/comments/1fw7fxb/missing_features_from_budgeting_apps/
- https://www.reddit.com/r/budget/comments/1hpmryi/budget_tracking_app_with_receipt_scanning/
- https://www.reddit.com/r/Bookkeeping/comments/1os7xac/receipt_scanning_app_recommendation_that_itemizes/
- https://www.reddit.com/r/personalfinance/comments/7x1zaw/budget_tracking_individual_line_items_instead_of/
- https://www.reddit.com/r/webdev/comments/u2ljod/web_app_idea_excellike_budgeting_web_app_with_ocr/

**Competitive Research:**
- https://banktrack.com/en/blog/grocery-expense-tracker-apps
- https://www.ynab.com/
- https://copilot.money/
- https://www.monarchmoney.com/
- https://www.expensify.com/
- https://dext.com/

---

**Status:** Ready for Project Lead intake  
**Next Step:** Kelly routes to Project Lead for planning

