# Solution Scoring & Selection Analysis
**Project:** Hyper-Local Event Discovery  
**Date:** 2026-02-18  
**Phase:** 4 - Solution Selection

---

## Evaluation Criteria

Solutions scored 1-10 across 5 dimensions:
1. **Novelty** — How genuinely unique vs Eventbrite/Instagram/Meetup?
2. **Problem-Solution Fit** — Does it solve late/reactive discovery, FOMO, scattered information?
3. **Feasibility** — Buildable with Swift/SwiftUI, solo dev scope (40-60 stories), iOS capabilities?
4. **Differentiation** — Clearly stands apart from existing solutions? Defensible?
5. **Monetizability** — Clear B2C revenue path (subscription/freemium)?

---

## Top 5 Candidates

### 1. 🏆 PULSE - 46/50
- **Novelty:** 10/10 — Radar UI + 4-hour ephemeral window (never been done)
- **Problem-Solution Fit:** 10/10 — Perfect for "what's happening NOW nearby"
- **Feasibility:** 9/10 — MapKit, CoreLocation, time filtering (all iOS native)
- **Differentiation:** 10/10 — NOTHING like this exists
- **Monetizability:** 7/10 — Premium for larger radius, more categories

**Description:** Radar-style map showing ONLY events in next 4 hours within 0.5-2 mile radius. Push notifications at optimal moments ("Taco popup in 30 mins, 0.3mi away"). Anti-calendar design—deliberately ephemeral. Events disappear as they end.

### 2. INTENT - 44/50
- **Novelty:** 9/10 — Reverse discovery (app works FOR you)
- **Problem-Solution Fit:** 10/10 — Proactive alerts when matches appear
- **Feasibility:** 8/10 — Intent matching, background monitoring
- **Differentiation:** 9/10 — Query-based discovery unique
- **Monetizability:** 8/10 — Premium for more intents, priority matching

**Description:** Users declare intentions ("tonight: live music under $10"), app monitors and alerts when matching events appear. Standing intents for recurring interests.

### 3. Breadcrumb - 43/50
- **Novelty:** 9/10 — Background-first (no feed)
- **Problem-Solution Fit:** 10/10 — Just-in-time when physically near
- **Feasibility:** 8/10 — Background location + calendar check
- **Differentiation:** 9/10 — Invisible app unique
- **Monetizability:** 7/10 — Nudge frequency, radius premium

**Description:** Location-aware background notifications when physically near events happening in 2-4 hours. Checks calendar for availability.

### 4. Happening - 42/50
- **Novelty:** 9/10 — Ephemeral NOW-only
- **Problem-Solution Fit:** 9/10 — Perfect for spontaneous "right now"
- **Feasibility:** 9/10 — Simple map + real-time filtering
- **Differentiation:** 9/10 — NOW-only constraint unique
- **Monetizability:** 6/10 — Simple filtering hard to monetize

**Description:** Live map of events RIGHT NOW within 1-mile radius. Refreshes every 10 mins, no future/past events.

### 5. Drift - 41/50
- **Novelty:** 9/10 — Anti-algorithm + location spontaneity
- **Problem-Solution Fit:** 8/10 — Forces serendipity
- **Feasibility:** 9/10 — Location services, random selection
- **Differentiation:** 9/10 — Radical simplicity
- **Monetizability:** 6/10 — One free event hard to monetize

**Description:** ONE random event daily based on current location + next 6 hours. Optional "Drift Mode" sends surprise notifications.

---

## Selection Rationale: PULSE

**PULSE wins with highest total score (46/50) AND highest Novelty rating (10/10).**

### Why PULSE is Superior:

1. **Maximum Novelty (10/10)**
   - Radar UI for local events never done (exists in weather/transit, NOT events)
   - 4-hour ephemeral window unprecedented
   - Visual metaphor (radar pulse) perfectly matches use case

2. **Perfect Problem-Solution Fit (10/10)**
   - Late discovery: 4-hour window = optimal for spontaneous plans
   - Scattered information: Single radar view consolidates
   - Proactive discovery: Push notifications at optimal moments
   - FOMO: Real-time awareness of immediate surroundings

3. **High Feasibility (9/10)**
   - 100% iOS native: MapKit, CoreLocation, UserNotifications
   - Minimal complexity: Time + location filtering + map rendering
   - Solo-developer friendly: 40-50 story estimate
   - No fragile APIs or marketplace complexity

4. **Maximum Differentiation (10/10)**
   - Eventbrite: Multi-day calendar, no location focus
   - Instagram: Passive stories, reactive
   - Meetup: Group-focused, not ephemeral
   - **PULSE: Ephemeral radar for immediate happenings = unoccupied space**

5. **Clear Monetization (7/10)**
   - Free: 0.5-mile radius, 4-hour window, 3 categories
   - Premium ($4.99/mo): 2-mile radius, custom windows, all categories

### Competitive Moat

1. UI/UX patent potential (radar metaphor for ephemeral events)
2. First-mover advantage (no one doing NOW-only event radar)
3. Network effects (more events → more users)
4. Behavioral lock-in (habitual checking: "what's pulsing near me?")

---

## All 20 Solutions Evaluated

| Rank | Solution | Total | Novelty | Fit | Feasibility | Diff | Monetize |
|------|----------|-------|---------|-----|-------------|------|----------|
| 1 | **PULSE** | 46 | 10 | 10 | 9 | 10 | 7 |
| 2 | INTENT | 44 | 9 | 10 | 8 | 9 | 8 |
| 3 | Breadcrumb | 43 | 9 | 10 | 8 | 9 | 7 |
| 4 | Happening | 42 | 9 | 9 | 9 | 9 | 6 |
| 5 | Drift | 41 | 9 | 8 | 9 | 9 | 6 |
| 6-8 | Echo, Soon, Orbit, Ember, Wavelength, Neighbors | 40 | 8-9 | 8-9 | 7-9 | 8-9 | 6-8 |
| 9-12 | ORBIT (Sally), Ripple, Streetwise | 36-39 | 7-10 | 6-9 | 4-8 | 7-10 | 6-8 |
| 13-20 | Whisper, ICYMI, Undertow, Going | 30-35 | 6-10 | 6-7 | 4-7 | 5-10 | 6-8 |

---

**Decision: Proceed with PULSE to Phase 5 (Competitive Deep-Dive)**
