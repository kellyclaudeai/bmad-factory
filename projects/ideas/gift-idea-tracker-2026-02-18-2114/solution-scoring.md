# Solution Scoring - Phase 4

**Research Lead Session:** agent:research-lead:5
**Date:** 2026-02-18
**Problem:** Gift idea capture and tracking

## Scoring Framework

5 dimensions, 1-10 each (Total: 5-50 per solution):

1. **Novelty** - How genuinely unique is this approach?
2. **Problem-Solution Fit** - Does this solve the ROOT CAUSE?
3. **Feasibility** - Can we build this with Swift/SwiftUI/Firebase? Value on day 1?
4. **Differentiation** - How clearly does this stand apart?
5. **Monetizability** - Clear revenue path?

---

## Top Scoring Solutions (43 points - TIE)

### 🏆 SIFT - Lock Screen Widget Voice Assistant (SELECTED)
- **Novelty:** 9/10 - Lock screen widget for this use case is highly novel
- **Problem-Fit:** 9/10 - Zero friction, voice-first, captures in-moment
- **Feasibility:** 8/10 - iOS 16+ widgets, Firebase AI, value day 1
- **Differentiation:** 9/10 - Completely different interaction model
- **Monetizability:** 8/10 - Clear subscription value for AI features
- **TOTAL: 43/50**

**Why it won:** Lock screen positioning more strategically novel than Control Center. Always-visible reminder (50-100x/day vs intentional access). Newer API (iOS 16) less saturated. AI structuring of messy voice thoughts solves organization problem competitors miss.

### Whisper (Maya) - Control Center Widget
- **Novelty:** 9/10 - Control Center voice widget novel placement
- **Problem-Fit:** 9/10 - 5-second capture, preserves emotional WHY
- **Feasibility:** 8/10 - iOS 18+ Control Center widgets
- **Differentiation:** 9/10 - Audio playback preservation unique
- **Monetizability:** 8/10 - Subscription for unlimited whispers
- **TOTAL: 43/50**

**Why it lost tiebreaker:** Control Center requires intentional access (swipe down), less visible than lock screen. Lock screen = passive reminder, Control Center = active retrieval.

---

## High Scoring Solutions (39-41 points)

### Breadcrumbs - Stories-Style Visual Timeline (39/50)
- Novelty: 7, Problem-Fit: 8, Feasibility: 9, Differentiation: 8, Monetizability: 7
- **Gap:** Visual timeline nice but doesn't solve core capture friction

### Memento - Siri-First (39/50)
- Novelty: 8, Problem-Fit: 9, Feasibility: 7, Differentiation: 9, Monetizability: 6
- **Gap:** Siri can be finicky, harder to monetize voice-only interface

### Lore - Passive AI Scanning Messages/Photos (41/50)
- Novelty: 10, Problem-Fit: 10, Feasibility: 2 (**DISQUALIFIED**), Differentiation: 10, Monetizability: 9
- **Disqualified:** Messages API severely restricted on iOS, privacy minefield

### Whisper (Quinn) - Voice-Memory (41/50)
- Novelty: 8, Problem-Fit: 9, Feasibility: 9, Differentiation: 8, Monetizability: 7
- **Gap:** Less strategic placement than lock screen widget

### Echo (Maya) - Auto-Scan Messages/Photos (41/50)
- Novelty: 10, Problem-Fit: 10, Feasibility: 2 (**DISQUALIFIED**), Differentiation: 10, Monetizability: 9
- **Disqualified:** Same Messages API restrictions as Lore

### Echoes - Passive Conversation Mining (41/50)
- Novelty: 10, Problem-Fit: 10, Feasibility: 2 (**DISQUALIFIED**), Differentiation: 10, Monetizability: 9
- **Disqualified:** Messages API restrictions

---

## Mid-Tier Solutions (31-36 points)

### Kindred - Social Gift Network (36/50)
- Novelty: 9, Problem-Fit: 7, Feasibility: 3 (**network effects**), Differentiation: 10, Monetizability: 7
- **Gap:** Requires multiple users for value (no day 1 value solo)

### Spark - Passion Profiles (36/50)
- Novelty: 7, Problem-Fit: 7, Feasibility: 8, Differentiation: 7, Monetizability: 7
- **Gap:** Profile building doesn't solve capture friction

### Clue - Gamified Detective Scrapbook (36/50)
- Novelty: 7, Problem-Fit: 6, Feasibility: 9, Differentiation: 7, Monetizability: 7
- **Gap:** Gamification doesn't eliminate capture friction

### Hindsight - Post-Hoc AI Conversation (35/50)
- Novelty: 8, Problem-Fit: 6, Feasibility: 7, Differentiation: 8, Monetizability: 6
- **Gap:** Still requires remembering to log, just delayed

### Momento - Contextual Memory Snapshots (35/50)
- Novelty: 6, Problem-Fit: 7, Feasibility: 9, Differentiation: 6, Monetizability: 7
- **Gap:** Photo-first doesn't solve voice capture need

### Echo - Forward-to-Self Inbox (34/50)
- Novelty: 6, Problem-Fit: 7, Feasibility: 8, Differentiation: 6, Monetizability: 7
- **Gap:** Email forwarding familiar, not innovative enough

### Ember - Frustration Journal (33/50)
- Novelty: 7, Problem-Fit: 5, Feasibility: 8, Differentiation: 7, Monetizability: 6
- **Gap:** Misses joyful gift moments, only captures complaints

### Rewind - Future-Prompted Memory (33/50)
- Novelty: 8, Problem-Fit: 4, Feasibility: 8, Differentiation: 7, Monetizability: 6
- **Gap:** Doesn't help in-moment capture

### Constellation - Social Intelligence Network (32/50)
- Novelty: 8, Problem-Fit: 6, Feasibility: 3 (network effects), Differentiation: 8, Monetizability: 7
- **Gap:** Requires network for value

### Nudge - Proactive Memory Prompts (31/50)
- Novelty: 6, Problem-Fit: 5, Feasibility: 9, Differentiation: 5, Monetizability: 6
- **Gap:** Doesn't solve in-moment capture

---

## Low-Tier Solutions (25-29 points)

### Cue - Scene-Based Organization (29/50)
- Novelty: 6, Problem-Fit: 4, Feasibility: 8, Differentiation: 6, Monetizability: 5
- **Gap:** Organizational pivot doesn't solve capture problem

### Tangle - Family Collaboration (25/50)
- Novelty: 5, Problem-Fit: 4, Feasibility: 4 (network effects), Differentiation: 5, Monetizability: 7
- **Gap:** Coordination doesn't solve individual capture friction

---

## Key Insights

1. **Capture friction is the ROOT CAUSE** - High scorers all prioritize instant, low-friction capture
2. **Voice-first wins** - Voice is 3x faster than typing for quick thoughts
3. **Lock screen positioning is strategic** - Passive visibility > active retrieval
4. **Day 1 value matters** - Network effects solutions scored low on Feasibility
5. **Messages API is a dead end** - iOS privacy restrictions make passive scanning infeasible

---

## Final Selection Rationale

**Sift wins because:**
- Lock screen widget = highest visibility, lowest friction capture point
- Voice-first = natural for capturing fleeting ideas
- AI structuring = solves "don't know how to organize" problem
- iOS 16+ lock screen widgets = recently unlocked capability (timing advantage)
- Clear differentiation from list-centric competitors
- Value on day 1 with 0 users (personal tracking tool)
- Strong monetization path ($3.99/mo for AI features)

**Tiebreaker vs Whisper (Maya):** Lock screen seen 50-100x/day (passive reminder) vs Control Center (intentional access). Strategic positioning advantage.
