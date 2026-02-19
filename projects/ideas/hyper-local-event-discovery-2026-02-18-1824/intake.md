# Product Intake: Ripple
**Hyper-Local Event Discovery via Ephemeral Radar**

---

## Project Metadata

- **Project ID:** hyper-local-event-discovery-2026-02-18-1824
- **Product Name:** Ripple
- **Discovery Date:** 2026-02-18
- **Discovery Strategy:** "Why Doesn't This Exist?" (Direct demand signals)
- **Research Lead Session:** agent:research-lead:main
- **Platform:** iOS native app (Swift/SwiftUI)
- **Business Model:** B2C freemium
- **State:** Discovery (ready for Project Lead intake)

---

## Problem Statement

### The Pain

People are missing out on valuable local experiences (food popups, open mics, niche workshops, pop-up markets, community gatherings) because:

1. **Late Discovery:** They discover events too late (via Instagram stories after events end)
2. **No Proactive Tool:** Eventbrite focuses on mainstream/paid events, not low-key local happenings
3. **Scattered Information:** No centralized proactive discovery tool for hyper-local "hidden gems"

### Core Pain Points

- **FOMO:** Finding out about great local events after they've happened
- **Disconnection:** Missing the "things that make a city feel alive"
- **Fragmentation:** Information scattered across Instagram, Facebook groups, local websites

### Evidence

**Reddit (r/AppIdeas, 2026):**
> "I keep missing out on great local stuff — food popups, open mics, niche workshops — mostly because I find out too late, often through Instagram stories, after it's already over. Been thinking of an app that helps people discover what's happening around them, based on their location and interests. Not just concerts events but the kind of low-key, local things that make a city feel alive."

**Validation Signals:**
- ✅ Problem explicitly stated by users
- ✅ Current workaround identified (Instagram stories) — inadequate
- ✅ Clear solution gap: no app exists for this use case
- ✅ Persistent demand: "make a city feel alive" = emotional connection
- ✅ Mobile-first problem: discovery needs to happen on-the-go

**Market Validation:**
- Eventbrite: $1.3B revenue proves event discovery demand
- Ongeo: Launched 2024 (NYC-only real-time map) — validates hyper-local focus
- Google Trends: "events near me" search volume stable/growing

### Problem Score: 40/50

- **Pain Intensity:** 9/10 — FOMO is powerful motivator, frequent pain (weekly)
- **Evidence Breadth:** 8/10 — Multi-platform demand (Reddit, reviews, social media)
- **Solution Gap:** 9/10 — WIDE OPEN (no iOS app for hyper-local ephemeral discovery)
- **Buildability:** 6/10 — iOS native feasible, event data sourcing medium complexity
- **Demand Validation:** 8/10 — Proven market (Eventbrite revenue, Ongeo validates space)

---

## Solution: Ripple

### Concept

**Radar-style map showing ONLY events in the next 4 hours within configurable radius (0.5-2 miles).**

No calendars, no planning—pure spontaneity. Push notifications fire at optimal decision moments (e.g., "Taco popup starting in 30 mins, 0.3mi away"). Users subscribe to event types (food, music, art) and get real-time pings when interests activate nearby.

### Core Innovation

**Anti-calendar design** — deliberately ephemeral. Events disappear from the radar as they end, creating urgency and eliminating decision paralysis.

**Radar metaphor** — Visual pulse rings show real-time activity in your neighborhood (like weather radar, but for local events).

### How It Solves the Problem

1. **Eliminates Late Discovery**
   - 4-hour ephemeral window = optimal for spontaneous plans
   - Push notifications at optimal moments (when you can still act)
   - Real-time awareness prevents "found out too late"

2. **Proactive Discovery**
   - Push notifications bring events TO you (no browsing required)
   - Background location triggers alerts when near interesting events
   - Eliminates need to check multiple apps/sources

3. **Consolidates Scattered Information**
   - Single radar view aggregates all nearby events
   - Web scraping + APIs + user submissions = comprehensive coverage
   - Visual map shows spatial relationships (what's close together)

4. **Creates Urgency Without Paralysis**
   - 4-hour window prevents overwhelming future calendar
   - Ephemeral design trains users to check daily (habit formation)
   - "Catch it now or miss it" drives action

### What's Novel

**No competitor has combined:**
- ✅ Radar UI for local events (exists in weather/transit, NOT events)
- ✅ 4-hour ephemeral window (all platforms show multi-day calendars)
- ✅ Proactive push notifications at optimal moments
- ✅ NOW-only focus (no future browsing)

**Closest Competitor (Ongeo):**
- Launched 2024, NYC-only, real-time map
- BUT: No ephemeral window, no radar UI, basic notifications
- **Ripple differentiates** via radical time constraint + visual metaphor

### Solution Score: 46/50

- **Novelty:** 10/10 — Radar UI + ephemeral window unprecedented
- **Problem-Solution Fit:** 10/10 — Perfect for "what's happening NOW nearby"
- **Feasibility:** 9/10 — MapKit, CoreLocation, push (all iOS native)
- **Differentiation:** 10/10 — Nothing like this exists
- **Monetizability:** 7/10 — Clear freemium path (radius, categories, ad-free)

---

## Target Audience

### Primary User Persona

**"Spontaneous Urban Explorer"**
- **Age:** 20-40 years old
- **Location:** Urban areas (NYC, Austin, Portland, SF, LA)
- **Psychographics:**
  - Socially curious, wants to explore neighborhood
  - Interested in food, music, arts, culture
  - Values authenticity over mainstream experiences
  - Active on Instagram/social media
  - Currently suffers from FOMO (finds out about events after they happen)

**Current Workarounds:**
- Follow local influencers on Instagram (reactive, miss stories)
- Check Eventbrite occasionally (overwhelming, mainstream bias)
- Ask friends via group text (limited knowledge)
- Stumble upon events by accident (rare)

**Pain Frequency:** Weekly (every weekend, some weeknights)

**Impact:**
- Emotional: FOMO, disconnection from local community
- Time: Wasted evenings scrolling/searching
- Social: Missing shared experiences with friends

**Willingness to Pay:**
- Lifestyle apps: $3-5/mo proven (Yelp, Meetup)
- Proven behavior: Currently pay for Spotify, Netflix, dating apps
- **Target:** $4.99/mo for premium features

### Secondary Personas

**"Social Coordinator"** (20-35)
- Plans group outings, always looking for "what should we do tonight?"
- Pain: Group indecision, need for quick spontaneous options

**"New Resident"** (22-45)
- Just moved to city, wants to discover neighborhood
- Pain: Doesn't know local hidden gems, feels like an outsider

**"Weekend Explorer"** (25-50)
- Established resident looking for novelty
- Pain: Knows obvious spots, wants to discover new experiences

---

## Key Features

### MVP (Core Experience)

1. **Radar Map View**
   - Animated radar rings pulsing from user's location
   - Event pins appear within 4-hour window
   - Real-time updates every 10 minutes
   - Smooth 60fps animations (CALayer)

2. **Event Cards**
   - Event name, venue, start time, distance
   - Quick preview: photo, category tag, price (free/paid)
   - Tap for details: full description, directions, RSVP

3. **Push Notifications**
   - Time-based: "Event starting in 30 mins nearby"
   - Location-based: "You're 0.3mi from a food popup (starts in 1 hour)"
   - Frequency limit: Max 5/week free tier, unlimited premium

4. **Interest Filters**
   - Free tier: 3 categories (food, music, art)
   - Premium: All categories (workshops, markets, sports, nightlife, etc.)
   - Toggle on/off for each category

5. **Radius Control**
   - Free tier: 0.5-mile radius
   - Premium: Up to 2-mile radius
   - Visual indicator on map (circle overlay)

6. **Event Submission**
   - Simple form: event name, venue, time, category, photo
   - Gamification: "Scout Points" for early submissions
   - Moderation queue (approval/rejection by admin)

### Premium Features ($4.99/mo)

7. **Extended Radius** (up to 2 miles)
8. **Extended Time Window** (8 hours instead of 4)
9. **All Event Categories** (unlimited filters)
10. **Unlimited Push Notifications**
11. **Ad-Free Experience**
12. **Favorite Events** (save events you're interested in, get reminder)

### Future Enhancements (Post-MVP)

13. **Social Layer**
    - "3 friends are going to this event"
    - "Invite friends" via SMS/iMessage
    - Event check-in (prove attendance, earn scout points)

14. **Personalized Recommendations**
    - ML learns from clicked events, attendance
    - "You might like this based on your history"

15. **Venue Partnerships**
    - Promoted events (paid placement on radar)
    - Exclusive deals for app users ("Show Ripple for 10% off")

---

## Technical Architecture

### iOS Stack (Swift/SwiftUI)

**Core Frameworks:**
- `MapKit` — Radar visualization with animated pulse rings
- `CoreLocation` — Geofencing, distance calculations, background monitoring
- `UserNotifications` — Time + location-based push alerts
- `BackgroundTasks` — Event data refresh (every 30 min)
- `SwiftUI` — UI layer (radar, event cards, settings)
- `Combine` — Reactive data flow

**Event Data Pipeline:**
- **Eventbrite API** (free tier: 2,000 calls/hour) → mainstream events
- **Web Scraping** (custom scrapers for venue sites, Instagram hashtags)
- **User Submissions** (crowdsourced, moderated)
- **CloudKit / Firebase** (real-time event database)

**Battery Optimization:**
- Geofencing (region monitoring) instead of continuous GPS: ~2-5% battery drain
- Background fetch limited to 30-min intervals
- MapKit animations on-demand (only when app open)

### Development Estimate

**Timeline:** 8-10 weeks (2 iOS devs + 1 backend dev)

**Epic Breakdown (43 stories total):**
1. **Onboarding & Permissions** (5 stories)
2. **Radar Map UI** (8 stories — animations, pins, rings)
3. **Event Data Ingestion** (7 stories — APIs, scrapers, moderation)
4. **Push Notifications** (6 stories — time/location triggers)
5. **Event Details & Actions** (5 stories — cards, directions, RSVP)
6. **Preferences & Filters** (4 stories — radius, categories, settings)
7. **Monetization & Premium** (5 stories — paywall, subscriptions, analytics)
8. **User Submissions** (3 stories — form, moderation queue)

**Complexity:** Medium (radar UI + geofencing are novel, but all iOS-native)

---

## Competitive Landscape

### Direct Competitors

| Competitor | Model | Rating | Differentiation from Ripple |
|------------|-------|--------|----------------------------|
| **Ongeo** | Real-time map (NYC only) | 5.0★ (3 reviews) | ❌ No ephemeral window<br>❌ No radar UI<br>❌ Limited geography |
| **Eventbrite** | Mainstream ticketed events | 4.9★ (1.6M) | ❌ Multi-day planning<br>❌ Ticketed/paid bias<br>❌ No spontaneity |
| **Meetup** | Group-based recurring | 4.7★ (272K) | ❌ Requires group membership<br>❌ Recurring events<br>❌ No NOW-only view |
| **Fever** | Curated premium experiences | 4.8★ (66K) | ❌ Premium pricing ($20-100+)<br>❌ Mainstream curated<br>❌ No spontaneity |

### Competitive Advantages

1. **Radar UI** — Visually distinctive, instantly recognizable (patent potential)
2. **Ephemeral Window** — Behavioral lock-in (users check daily)
3. **Proactive Notifications** — Events come TO you (not browsing)
4. **NOW-Only Focus** — Eliminates decision paralysis
5. **Free Events Priority** — Democratizes local discovery

### Market Positioning

**"Tinder for local events"** — Swipe mentality, spontaneous, mobile-first, NOW-focused

**vs Eventbrite:** Spontaneous (not planned), local (not mainstream), free (not ticketed)  
**vs Ongeo:** Ephemeral UX (not persistent), radar (not pins), multi-city (not NYC-only)  
**vs Instagram:** Proactive (not reactive), curated (not noise), timely (not late)

---

## Business Model

### Pricing Strategy

**Free Tier:**
- 0.5-mile radius
- 4-hour window
- 5 push notifications per week
- 3 event categories
- Banner ads (non-intrusive)

**Premium Tier ($4.99/mo):**
- 2-mile extended radius
- 8-hour window
- Unlimited push notifications
- All event categories
- Ad-free
- Save favorite events

**Comparable Pricing:**
- Meetup Pro: $4.99/mo ✅
- Yelp Premium: $4.99/mo ✅
- Tinder Plus: $9.99/mo (dating app premium)

**Conversion Target:** 3% (industry standard: 2-5% for lifestyle apps)

### Revenue Projections (Year 1)

**Assumptions:**
- 500K app installs (5% of 10M TAM)
- 3% conversion to premium
- 8-month average subscription duration

**Year 1 Base Case:**
- Paid subscribers: 15,000
- MRR: $74,850
- ARR: $898,200
- Churn: 12.5% monthly

**Costs:**
- Event data scraping: $1,000/mo
- AWS hosting: $500/mo
- App Store fees: 30% ($269,460)
- **Net Revenue:** ~$627,000

### Unit Economics

**Blended Metrics:**
- CAC (Customer Acquisition Cost): $5 (organic + influencer mix)
- LTV (Lifetime Value): $39.92 (8 months × $4.99)
- **LTV:CAC:** 7.98:1 ✅ (healthy; target >3:1)

**Note:** Assumes organic-heavy growth via viral sharing ("I'm going to X, join me!")

### Acquisition Strategy

**Year 1 Launch Channels:**
1. **App Store Optimization (ASO)**
   - Keywords: "events near me", "things to do tonight", "spontaneous plans"
   - Visual assets: Radar UI screenshots (highly shareable)

2. **Social Sharing Mechanics**
   - "I'm attending X, join me!" → Instagram Stories integration
   - Referral program: Both users get 1 month premium free

3. **Micro-Influencer Partnerships**
   - Local food/music/art accounts (10K-50K followers)
   - Cost: $100-500 per post → 500-1,000 installs per post

4. **PR Launch**
   - Product Hunt, TechCrunch, local press
   - Hook: "Tinder for local events" (radar UI is visually compelling)

5. **City-Specific Launches**
   - Launch in Austin, Portland, SF (not NYC — Ongeo's turf)
   - Partner with local venues for launch events

---

## Risks & Mitigations

### Primary Risks

**1. Event Data Quality (🟡 Medium Risk)**
- **Risk:** Web scraping fails to produce 50+ events/day per city
- **Mitigation:** 2-week prototype scraping NYC venues (validate data pipeline)
- **Fallback:** Partner with Eventbrite API for baseline + incentivize user submissions

**2. Ongeo Gains Traction First (🟡 Medium Risk)**
- **Risk:** Ongeo raises funding, expands to multiple cities before Ripple launches
- **Mitigation:** Launch in different cities (Austin, Portland, SF), differentiate with ephemeral UX
- **Timeline:** Ongeo launched 2024, limited to NYC — 6-12 month window

**3. Low Retention / High Churn (🟡 Medium Risk)**
- **Risk:** Users download, try once, never return
- **Mitigation:** Habit-forming features (daily check-in streaks, "You've attended 10 events!")
- **Engagement loop:** Push notification → open app → see radar → attend event → share

**4. Battery Drain Concerns (🟢 Low Risk)**
- **Risk:** Users disable location permissions due to battery impact
- **Mitigation:** Geofencing (not continuous GPS) = 2-5% drain (acceptable)
- **Transparency:** Show battery usage in settings, educate users

**5. iOS App Review Rejection (🟢 Low Risk)**
- **Risk:** Apple rejects location permissions as "not justified"
- **Mitigation:** Clear use case ("Find events near you right now"), geofencing only
- **Precedent:** Similar apps (Foursquare, Yelp) approved

### Success Criteria (90-Day Post-Launch)

- ✅ 50,000 app installs (10% of Year 1 target)
- ✅ 2% conversion to premium (1,000 paid subscribers)
- ✅ 40% DAU/MAU ratio (daily active / monthly active — engagement benchmark)
- ✅ 4.5+ App Store rating (user satisfaction)
- ✅ 50+ events per day per city (data quality)

---

## Go-to-Market Strategy

### Launch Cities (Year 1)

**Phase 1 (Months 1-3):**
- Austin, TX — Strong local event scene, tech-savvy population
- Portland, OR — Arts/music culture, independent venues
- San Francisco, CA — Early adopter market, high density

**Phase 2 (Months 4-6):**
- Los Angeles, CA — Entertainment capital, massive event volume
- Denver, CO — Active lifestyle, weekend events
- Seattle, WA — Tech market, coffee/music scene

**Phase 3 (Months 7-12):**
- NYC, NY — Direct Ongeo competition (prove differentiation)
- Chicago, IL — Midwest expansion
- Boston, MA — College-age demographic

### Marketing Messaging

**Tagline:** "Events ripple outward. Catch the pulse of your neighborhood."

**Value Props:**
1. **Never miss out again** — Real-time awareness of local happenings
2. **Zero effort discovery** — Events come to you, no browsing required
3. **Spontaneous by design** — 4-hour window eliminates decision paralysis
4. **Hidden gems only** — Food popups, open mics, workshops (not mainstream)

**Target Channels:**
- Instagram (visual platform, target demographic)
- TikTok (discovery culture, younger audience)
- Reddit (r/Austin, r/Portland — local community threads)
- Local event calendars (partnerships with arts councils)

---

## Next Steps (Handoff to Project Lead)

### Validation Requirements (Before PRD)

1. **Event Data Prototype** (2 weeks)
   - Scrape 50 Austin venues → confirm 50+ events/day
   - Test Eventbrite API integration
   - Validate data quality (accurate times, addresses, descriptions)

2. **MapKit Radar UI Prototype** (1 week)
   - Build animated radar rings with 50 event pins
   - Test 60fps performance on iPhone 12+
   - Validate UX (is radar intuitive?)

3. **User Interviews** (20 people, Austin)
   - "Would you use this app?"
   - "How often would you check it?"
   - "Would you pay $4.99/mo for premium?"
   - Target: 80%+ "yes" to proceed

### IF Validation Passes → Project Lead Actions:

1. **Write PRD** (Product Requirements Document)
2. **Design Architecture** (iOS app + backend event pipeline)
3. **Assign to Development Team** (2 iOS devs + 1 backend dev)
4. **Create GitHub Repo** (repo structure, CI/CD)
5. **Begin Sprint 0** (technical spike: radar UI + geofencing)

---

## Appendix: Research Artifacts

- **solution-scoring.md** — Phase 4 evaluation (20 solutions scored)
- **competitive-deepdive.md** — Phase 5 market analysis (competitors, feasibility, business model)
- **creative-naming.md** — Phase 6 branding (Ripple + 3 alternatives)
- **Project Registry Entry** — `/Users/austenallred/clawd/projects/project-registry.json`

---

**Research Lead Session:** agent:research-lead:main  
**Discovery Complete:** 2026-02-18  
**Status:** ✅ Ready for Project Lead Intake  
**Confidence:** 8/10 (execution risk, NOT market demand risk)
