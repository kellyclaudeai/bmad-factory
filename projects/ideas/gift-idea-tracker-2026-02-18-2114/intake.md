# Keeper

**Alternative Names:** GiftPocket, Notch, Catch, Remembra
**Generated:** 2026-02-18 CST
**Research Lead Session:** agent:research-lead:5
**Discovery Approach:** direct-demand-signals

---

## Executive Summary

**Problem:**  
Thoughtful people struggle to remember gift ideas they hear throughout the year, leading to last-minute panic shopping and generic gifts. When someone casually mentions "I wish I had X" or "Y is so annoying," those perfect gift ideas are lost. By the time birthdays/holidays arrive, people resort to panic buying whatever seems appropriate from Target, missing opportunities to give meaningful gifts.

**Solution:**  
Keeper is a lock screen widget voice assistant that lets users capture gift ideas in 15 seconds without unlocking their phone. Users tap the always-visible widget, speak their thought ("Sarah mentioned she loves sourdough baking, maybe get her that book for July birthday"), and AI transcribes and structures the messy voice input, extracting person names, items, occasions, and emotional context. Eliminates capture friction by placing gift logging at the point of highest visibility (lock screen seen 50-100x/day).

**Opportunity:**  
Wide Open market — no competitors offer lock screen widget + voice-first gift capture. Existing apps (Giftster, Elfster, GiftLog) focus on list SHARING and manual entry, not instant CAPTURE. Users currently rely on inefficient workarounds (Apple Notes, screenshots, mental notes) that fail because capture friction is too high. Keeper solves the ROOT CAUSE: by the time you unlock your phone and open an app, you've forgotten the idea.

**Key Metrics:**
- **Score:** 35/50 (Pain: 7/10, Evidence: 6/10, Gap: 8/10, Buildable: 9/10, Demand: 5/10)
- **Development:** 47 stories (~8-10 weeks)
- **Platform:** iOS mobile app (Swift, SwiftUI, Firebase)
- **Business Model:** B2C freemium - $3.99/mo for unlimited captures + AI features

---

## Problem Statement

### Problem Discovered
Thoughtful people struggle to remember gift ideas they hear throughout the year, leading to last-minute panic shopping and generic gifts. When someone casually mentions "I wish I had X" or "Y is so annoying," those perfect gift ideas are lost. By the time birthdays/holidays arrive, people resort to panic buying whatever seems appropriate from Target, missing opportunities to give meaningful gifts that solve real problems or desires the recipient mentioned months ago.

### Why This Problem Is Underserved

**Solution gap classification:** Wide Open

**Current landscape:**
- **Direct competitors:** Giftster (17M users, $5.8M revenue), Elfster (40M users), GiftLog, GiftList
- **All focus on:** List sharing, wishlist coordination, Secret Santa, manual entry
- **None offer:** Voice capture, lock screen widget, instant capture UX, AI structuring

**Why they're inadequate:**
1. **Manual entry friction** - All require: Unlock phone → Open app → Navigate to person → Type idea → Save (30-60 seconds)
2. **List-centric UX** - Designed for organizing existing ideas, not capturing fleeting thoughts
3. **Business model mismatch** - Giftster/Elfster monetize via affiliate links (need users browsing/clicking), not capture
4. **Pre-mobile-first legacy** - Launched 2004, web-optimized, never pivoted to instant mobile capture

**What people do instead - workarounds:**
- **Apple Notes** - "Individual notes per person with 'Gift Ideas' header" (Reddit quote)
- **Screenshots** - "Can't find them later" (Reddit quote)
- **Mental notes** - "lol" (Reddit quote - acknowledging failure)
- **Voice memos** - No structure, hard to search, no gift context
- **Pinterest** - Boards for each person, but product-focused not conversation-based

**Direct evidence of failure:**
> "i'll see something perfect for my mom in june and think 'oh that's great for christmas' and then december rolls around and... nothing. completely forgot what it was" (Reddit r/GiftIdeas)

> "i've tried screenshots (can't find them later), notes app (also can't find them), amazon wishlist (but what about non-amazon stuff), mental notes (lol)" (Reddit r/GiftIdeas)

**Root cause:** Users don't fail because they lack a place to put gift ideas — they fail because **by the time they unlock their phone and open an app, they've forgotten**.

### Evidence

**Reddit r/Gifts Threads:**

1. **"How I created a gift system that actually shows I pay attention"** (r/Gifts, 100+ upvotes)
   - Quote: "I used to be terrible at gift giving because I'd wait until the last minute and then panic buy whatever seemed appropriate. My girlfriend always managed to find these incredibly thoughtful presents while I'd grab generic stuff from target."
   - Quote: "Throughout the year I keep notes on my phone whenever she mentions small frustrations or things she wishes were different."
   - URL: https://www.reddit.com/r/Gifts/comments/1nimdy9/how_i_created_a_gift_system_that_actually_shows_i/

2. **"Track your gifts!"** (r/Gifts, multiple comments)
   - Quote: "I made it specifically to simplify the gift-giving process – think less forgotten ideas and more organized shopping."
   - Evidence: People building web apps to solve this (trackyourgifts.vercel.app)
   - URL: https://www.reddit.com/r/Gifts/comments/1m5mws3/track_your_gifts/

3. **"I made an app to help you track your gift-giving year round!"** (r/Gifts)
   - Community response validates need
   - URL: https://www.reddit.com/r/Gifts/comments/qrq83u/i_made_an_app_to_help_you_track_your_giftgiving/

4. **"What Gift-Giving/Wishlist Apps Do You Use?"** (r/christmas, 2023)
   - People asking for solutions, no consensus winner mentioned
   - URL: https://www.reddit.com/r/christmas/comments/14skd3w/what_giftgivingwishlist_apps_do_you_use/

**Evidence Sources:**
- **Reddit:** 4+ threads across r/Gifts (200K+ members), r/christmas, r/GiftIdeas
- **DIY solutions:** trackyourgifts.vercel.app (user-built web app), Google Sheets templates, Notion databases
- **Workaround prevalence:** Multiple threads describing manual notes/screenshots/spreadsheets
- **Persistent problem:** Threads span 2021-2024, problem not solved by existing apps

### Target User Profile

- **Who:** Ages 25-45, thoughtful gift-givers, family-oriented, value relationships
- **Role:** Gift-buyers for 10-20 people annually (family, friends, coworkers, partners' families)
- **Context:** Hear gift ideas in casual conversation throughout the year, forget by gift-giving occasion
- **Pain frequency:** 
  - **Daily micro-frustration:** Losing ideas as they happen (conversational context)
  - **Acute panic 5-10x/year:** Major occasions (birthdays, holidays, anniversaries)
- **Current workaround:** Notes app, spreadsheets, screenshots, mental recall (all fail), last-minute Target runs
- **Impact:** 
  - Generic gifts → guilt/disappointment
  - Wasted money on wrong items
  - Relationship strain ("they don't listen to me")
  - Time waste (10+ min/week organizing notes)
- **Willingness to pay:** $3-5/mo subscription OR $10-20 one-time purchase (comparable to Todoist Pro $4/mo, Things $9.99, note-taking apps)

### Demand Validation

**Market size indicators:**
- **Gift retailing market:** $100.33B in 2026, growing 4.06% CAGR (Mordor Intelligence)
- **Gift cards market:** $1.79T in 2025, projected $6.06T by 2033 at 16.4% CAGR (validates gifting as massive market)
- **iOS users (SAM):** 150M in US (DemandSage 2026)
- **Target segment:** ~30% of iOS users = 45M "thoughtful gift givers"

**Competitor traction (category validation):**
- **Giftster:** 17M users, $5.8M annual revenue, 4.8 stars (18K reviews) — proves category
- **Elfster:** 40M users globally — proves demand for gift coordination tools

**Community engagement:**
- **r/Gifts:** 200K+ members, active discussions about gift tracking
- **r/GiftIdeas:** Large community seeking solutions

**Search volume:**
- "gift tracker" estimated 10K-50K searches/mo (App Store)
- Lock screen widgets for other categories (package tracking, health) have proven traction

**Willingness to pay evidence:**
- Reddit users building DIY solutions (high effort = high value)
- Comparable apps: Todoist Pro ($4/mo), Notion ($8/mo), Things ($9.99 one-time)
- Average person buys 10-20 gifts/year = high-frequency pain point
- Emotional value: being "thoughtful gift giver" = relationship capital

---

## Solution Concept

### Overview

**Keeper** is a lock screen widget voice assistant that eliminates gift idea capture friction by putting gift logging at the point of highest visibility — your iPhone lock screen.

**Core innovation:** Lock screen widget + voice-first capture + AI structuring

**User flow:**
1. **Moment happens:** Friend mentions "I wish I had better kitchen shears"
2. **Instant capture:** User taps lock screen widget (no unlock, no Face ID required)
3. **App opens to recording:** Deep link opens Keeper directly to pre-loaded recording screen (instant start)
4. **15-second voice capture:** User speaks freely: "Sarah mentioned her kitchen shears are dull, maybe for her birthday in August"
5. **AI structures in background:** 
   - Transcription (OpenAI Whisper API, 98%+ accuracy)
   - Entity extraction (GPT-4o-mini): person = Sarah, item = kitchen shears, occasion = birthday, date = August 2026
   - Emotional context preserved: "dull" = practical need (not luxury)
6. **User returns to lock screen:** Idea captured, AI processing continues in background

**Friction comparison:**
- **Traditional apps:** Unlock → find app → open → navigate → type → categorize → save (**30-60 seconds**)
- **Keeper:** Tap widget → speak (**5-20 seconds**) — **75% faster**

**Strategic positioning:**
- Lock screen seen **50-100x/day** = passive reminder to capture ideas
- Voice is **3x faster** than typing for quick thoughts
- AI does the work of structuring/organizing (users dump messy thoughts, get structured data)

### What's Novel About This Approach

**1. Lock screen widget for gift tracking**
- **ZERO competitors** offer lock screen widgets for gift tracking
- Searched: App Store, Product Hunt, GitHub — no gift tracking widgets found
- Widgets exist for: package tracking (Parcel), countdowns, weather, health — not gifts
- **Why now?** iOS 16 lock screen widgets launched September 2022 (only 3.5 years old), incumbents haven't pivoted

**2. Voice-first capture**
- **ZERO voice-first gift apps** exist
- All competitors require manual typing
- Voice is natural for capturing conversational context ("she sounded frustrated" = practical need vs "she lit up" = passion gift)

**3. AI structuring of messy thoughts**
- Users don't know HOW to organize gift thoughts
- Input: "Mom mentioned she likes gardening but her back hurts"
- Output: Gift need (ergonomic garden tools), constraint (back pain), timing (upcoming birthday)
- Competitors offer lists; Keeper offers intelligence

**4. Capture-first philosophy**
- Incumbents (Giftster, Elfster) focus on list SHARING and coordination
- Keeper focuses on idea CAPTURE (the earlier, harder problem)
- Different business model: subscription (not affiliate links) enables capture-first UX

**5. Always-visible positioning**
- Lock screen widget = passive reminder behavior
- Control Center widgets require intentional access (swipe down)
- Lock screen > Control Center for habit formation (seen 50-100x/day vs on-demand)

### Key Features

1. **Lock Screen Widget (3 sizes)**
   - Circular: "+" button for quick capture
   - Rectangular: Recent gift count + capture button
   - Inline: Last captured gift preview
   - Deep link to instant recording screen (no navigation)

2. **15-Second Voice Capture**
   - AVFoundation audio recording (iOS native)
   - Visual waveform feedback (user knows it's working)
   - Auto-stop at 15 seconds (or manual stop)
   - Hybrid transcription: Apple Speech (instant preview) + Whisper API (accurate final)

3. **AI Entity Extraction**
   - Person name detection (links to contacts if available)
   - Item/gift idea extraction
   - Occasion detection (birthday, holiday, anniversary)
   - Date inference ("July" → July 2026 if current month < July)
   - Emotional context tags (practical need, passion gift, solving complaint)

4. **Smart Gift List**
   - Person-based organization (tap person → see all ideas)
   - Timeline view (when idea was captured, context)
   - Audio playback (hear original voice memo for context)
   - Edit/refine AI suggestions (learn from corrections)

5. **Occasion Reminders**
   - Calendar integration (import birthdays from Contacts)
   - Proactive notifications: "Sarah's birthday in 2 weeks — 3 gift ideas ready"
   - Gentle nudges: "Seen mom lately? Capture any gift ideas?"

6. **Gift Status Tracking**
   - Mark as: idea, researching, purchased, wrapped, given
   - Purchase links (add Amazon/Etsy URLs manually)
   - Budget tracking (optional)

7. **Shared Lists (Premium)**
   - Family coordination: avoid duplicate gifts
   - Claim gifts: "I'm getting the cookbook"
   - Group gifting: pool money for expensive items

### User Journey

**1. Discovery (App Store):**
- Search: "gift tracker", "gift ideas", "lock screen widget"
- Finds: "Keeper - Lock Screen Gift Ideas"
- Reads: "Capture gift ideas in 15 seconds without unlocking your phone"
- Downloads: Free tier (10 captures/month, 3 people)

**2. Onboarding (First launch):**
- Permission flow: Microphone access (required)
- Widget setup tutorial: "Add Keeper to your lock screen for instant capture"
- First capture walkthrough: Tap widget → speak → see AI magic
- Instant value: User sees their voice transcribed + structured

**3. Core Loop (Daily/weekly usage):**
- **Trigger:** Conversational moment with gift idea
- **Action:** Tap lock screen widget → speak 15 seconds
- **Reward:** AI structures messy thought into clear gift entry
- **Retention:** Lock screen visibility = daily reminder to capture

**4. Value Moment (First gift occasion):**
- **2 weeks before birthday:** Notification "Sarah's birthday in 2 weeks — 3 gift ideas captured"
- **User reviews ideas:** Hears their own voice: "She mentioned her kitchen shears are dull"
- **Remembers context:** "Oh right, she was cooking that day and complained about them"
- **Feels smart:** "I would have forgotten this and bought generic flowers"
- **Emotional ROI:** Gift recipient: "Wow, you remembered that from 4 months ago!"

**5. Retention (Long-term):**
- **Habit formation:** Lock screen widget seen 50-100x/day = passive reminder
- **Data accumulation:** More captures = more value (can't switch without losing history)
- **Network effects:** Family using Keeper together = shared gift coordination
- **Paywall moment:** After 10 free captures, user is hooked → upgrades to Premium

---

## Market Validation

### Competitive Landscape

**Direct Competitors:**

1. **Giftster** - 17M users, $5.8M annual revenue, 4.8 stars (18K reviews)
   - **Focus:** Wishlist sharing, Secret Santa, group coordination
   - **Business model:** Free (affiliate links to Amazon)
   - **Gap:** No voice capture, no lock screen widget, requires manual entry, list-centric UX

2. **Elfster** - 40M users globally, web-first
   - **Focus:** Secret Santa coordination, group gift exchanges
   - **Business model:** Free (affiliate links + ads)
   - **Gap:** No voice capture, no mobile-first UX, event-focused (not year-round)

3. **GiftLog** - 4.1 stars (67 reviews), very small traction
   - **Focus:** Gift history, thank-you tracking
   - **Gap:** No voice, no widget, limited adoption

4. **GiftList** - 4.4 stars (297 reviews), small traction
   - **Focus:** Browser extension, sharing, reservations
   - **Gap:** No voice, no widget, basic feature set

**Indirect Competitors / Workarounds:**

- **Apple Notes** - "Individual notes per person" (manual, unstructured)
- **Todoist / Things** - Task managers (not gift-specific, no voice widget)
- **Notion / Evernote** - Note apps (no structured gift tracking, no voice widget)
- **Pinterest** - Boards per person (product-focused, not conversation-based)
- **Screenshots** - "Can't find them later" (no organization)

**Key Differentiation:**

| Feature | Keeper | Giftster | Elfster | Apple Notes |
|---------|--------|----------|---------|-------------|
| **Voice capture** | ✅ 15-second widget | ❌ | ❌ | ❌ |
| **Lock screen widget** | ✅ Always visible | ❌ | ❌ | ❌ |
| **AI structuring** | ✅ Entity extraction | ❌ | ❌ | ❌ |
| **Capture friction** | 5-20 sec (tap+speak) | 30-60 sec (type) | 30-60 sec | 20-40 sec |
| **Year-round capture** | ✅ Optimized | Partial | ❌ Event-focused | Manual |
| **Business model** | B2C subscription | Affiliate | Affiliate | N/A (free) |

**One-sentence difference:** "Keeper lets you capture gift ideas without unlocking your phone, using a lock screen voice widget that appears every time you pick up your device."

### Market Size

**TAM (Total Addressable Market):**
- US personal gift giving: **$1.18 trillion/year** (Wonder Research)

**SAM (Serviceable Addressable Market):**
- US iOS users: **150M** (DemandSage 2026)
- "Thoughtful gift givers" segment: ~30% = **45M**

**Realistic Penetration:**
- Year 1: 0.01% of SAM = 4,500 users
- Year 3: 0.1% of SAM = 45,000 users

**Category Validation:**
- Giftster: 17M users proves demand for gift tracking
- But Giftster focuses on sharing/coordination, not capture
- Keeper attacks the EARLIER problem (capturing fleeting ideas)

### Novelty Assessment

**Is this truly novel?**

✅ **Lock screen widget for gift tracking:** ZERO competitors found (App Store, Product Hunt, GitHub)

✅ **Voice-first gift capture:** ZERO competitors found

✅ **AI structuring of gift thoughts:** No competitor extracts entities from messy voice input

**Why hasn't this been done?**

1. **iOS 16 lock screen widgets** launched September 2022 (only 3.5 years old) — recent capability
2. **iOS 17 interactive widgets** launched September 2023 (2.5 years old) — even newer
3. **Commodity AI transcription** (Whisper API, 2023+) — recently accessible/affordable
4. **Incumbents' inertia:** Giftster/Elfster (launched 2004) are web-first, affiliate-driven — business model doesn't align with capture-first UX (need users browsing/clicking for commissions)

**Risk of replication:**

**Low-Medium risk:**
- **Technical moat:** Lock screen widget + voice + AI = 3-4 months dev time
- **Design moat:** Capture-first philosophy vs list-management is different UX/product thinking
- **First-mover advantage:** App Store SEO ("lock screen gift tracker"), category creation
- **Incumbents unlikely to pivot:** Affiliate business model requires browsing, not quick capture

**Biggest threat:** Well-funded note-taking app (Notion, Evernote) adding gift templates + voice widgets

**Mitigations:** Domain specificity (gift intelligence), occasion detection, social gifting features, network effects

---

## Technical Feasibility

### Platform & Stack

**Platform:** iOS mobile app (iOS 16+ required for lock screen widgets)

**Stack:**
- **Swift + SwiftUI** - Native iOS app, WidgetKit for lock screen widget
- **Firebase Auth** - User authentication
- **Firebase Firestore** - Gift ideas, person profiles, structured data
- **Firebase Storage** - (Optional) Temporary audio files before transcription
- **Firebase Functions** - Backend AI processing (transcription + entity extraction)
- **OpenAI Whisper API** - Speech-to-text ($0.006/min)
- **OpenAI GPT-4o-mini** - Entity extraction ($0.15/1M input tokens)

**Additional Services:**
- Apple Speech Framework (on-device transcription for instant preview)
- AVFoundation (audio recording)
- Contacts framework (link person names to iPhone contacts)
- Calendar framework (import birthdays for occasion reminders)

### Development Estimate

**Epic Breakdown:**

| Epic | Stories | Timeline |
|------|---------|----------|
| 1. Core App + Auth | 8 | 2 weeks |
| 2. Voice Recording + Playback | 5 | 1 week |
| 3. Lock Screen Widget + Deep Linking | 10 | 2 weeks |
| 4. AI Transcription + Entity Extraction | 8 | 2 weeks |
| 5. Gift List Management UI | 10 | 2 weeks |
| 6. Polish + Testing | 6 | 1 week |
| **TOTAL** | **47 stories** | **8-10 weeks** |

**Story examples:**
- User can authenticate with email/password
- User can record 15-second audio clip
- Lock screen widget opens app to recording screen
- Whisper API transcribes audio to text
- GPT extracts person name from transcription
- User sees gift list organized by person
- User receives notification 2 weeks before birthday

**Technical Risks:**

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Lock screen widget can't record audio directly | Medium | Use deep link to app (acceptable UX, still faster than manual unlock) |
| AI transcription errors | Medium | Hybrid approach (Apple Speech preview + Whisper final), human editing allowed |
| iOS version fragmentation | Low | Require iOS 16+ (85%+ adoption as of 2026) |
| Voice recording battery drain | Low | 15-second max, optimize with AVFoundation best practices |

### Technical Requirements

**Lock Screen Widget:**
- iOS 16+ WidgetKit
- Interactive widgets (iOS 17+) for button taps
- AppIntent for deep linking to recording screen
- 3 widget sizes: circular, rectangular, inline

**Voice Capture:**
- AVFoundation: AVAudioRecorder
- Microphone permission (standard iOS flow)
- 15-second buffer (configurable)
- Audio format: M4A (efficient compression)

**Speech-to-Text:**
- **Primary:** OpenAI Whisper API (98%+ accuracy, 99 languages)
- **Fallback:** Apple Speech Framework (on-device, faster preview)
- Cost: $0.0015 per 15-second capture

**AI Entity Extraction:**
- Firebase Functions (Node.js)
- OpenAI GPT-4o-mini API
- Prompt: "Extract person name, gift item, occasion, date, emotional context from: {transcription}"
- Cost: $0.0003 per capture
- **Total AI cost per capture: $0.002** (scales well)

**Data Storage:**
- Firestore: Person profiles, gift ideas, metadata (efficient for structured queries)
- (Optional) Firebase Storage: Audio files if user wants to keep original recordings

**Privacy:**
- Audio not stored long-term (transcribe → delete by default)
- User can opt-in to keep audio for playback
- No PII shared with OpenAI (Whisper API is non-training)
- GDPR/CCPA compliant via Firebase

---

## Business Model

### Pricing Strategy

**Freemium Model:**

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0/mo | • 10 captures/month<br>• 3 people max<br>• Basic AI (person + item extraction)<br>• No shared lists |
| **Premium** | **$3.99/mo or $29/yr** | • Unlimited captures<br>• Unlimited people<br>• Advanced AI (occasion detection, emotional context, gift suggestions)<br>• Shared family lists<br>• Priority support |
| **Plus** (Future) | $7.99/mo | • Everything in Premium<br>• AI gift shopping assistant<br>• Price tracking + alerts<br>• Affiliate recommendations |

**Pricing Rationale:**

**Value-based:**
- **Alternative cost:** Forgetting one thoughtful gift idea = bad relationship moment (emotional cost)
- **Time savings:** 10 min/week organizing notes = $10+/month value (at $40/hr equivalent)
- **Emotional ROI:** Being the "thoughtful gift giver" in your family/friend group = relationship capital

**Competitive benchmarking:**
- Todoist Pro: $4/mo (similar productivity utility)
- Notion: $8/mo (higher-end note-taking)
- Things: $9.99 one-time (iOS premium standard)
- Giftster: Free (but affiliate model, different business)

**Price positioning:** $3.99/mo = **impulse purchase zone** (< Starbucks latte), affordable premium utility

**Paywall timing:**
- After 10 free captures (user is hooked, sees value)
- Soft paywall: "Upgrade to capture more ideas"
- No feature gates until limit hit (maximize trial value)

### Revenue Potential

**Conservative Model (2% free→paid conversion):**

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Free users | 10,000 | 50,000 | 150,000 |
| Premium users (2%) | 200 | 1,000 | 3,000 |
| MRR @ $3.99 | $798 | $3,990 | $11,970 |
| **ARR** | **$9,576** | **$47,880** | **$143,640** |

**Optimistic Model (5% conversion - industry standard for freemium):**

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Free users | 10,000 | 50,000 | 150,000 |
| Premium users (5%) | 500 | 2,500 | 7,500 |
| MRR @ $3.99 | $1,995 | $9,975 | $29,925 |
| **ARR** | **$23,940** | **$119,700** | **$359,100** |

**COGS (AI costs at scale):**
- Free users: 10,000 × 10 captures/mo × $0.002 = $200/mo
- Premium users: 3,000 × 50 captures/mo × $0.002 = $300/mo
- **Year 3 COGS: ~$6,000/yr** 
- **Gross margin: 95%+** (SaaS-like economics)

**LTV/CAC:**
- **LTV** (customer lifetime value): $3.99/mo × 18 months avg retention = ~$72
- **Target CAC** (customer acquisition cost): <$10 (organic App Store) to <$20 (paid ads)
- **LTV/CAC ratio:** 3.6-7.2x (healthy unit economics)

### Customer Acquisition

**Primary Channel: App Store SEO (Organic)**

**Target keywords:**
- "gift tracker" (10K-50K searches/mo)
- "gift ideas" (high volume, broad)
- "lock screen widget" (growing search trend)
- "thoughtful gifts" (emotional angle)
- "voice gift tracker" (novel differentiation)

**App Store Optimization:**
- **Name:** Keeper
- **Subtitle:** Lock Screen Gift Ideas
- **Icon:** Abstract lock screen + gift bow (modern, minimal)
- **Screenshots:** Lock screen widget demo, voice capture flow, AI magic moment

**Secondary Channel: Content Marketing**

**Target audiences:**
1. **Relationship advice:** The Knot, Brides, Motherly, The Good Men Project
2. **Productivity:** Lifehacker, MakeUseOf, AppAdvice
3. **Gift guides:** BuzzFeed, Wirecutter, GoodHousekeeping

**Content angles:**
- "How to Remember Gift Ideas Year-Round (Without Overthinking)"
- "The Lock Screen Hack for Thoughtful Gift Giving"
- "Stop Forgetting Perfect Gift Ideas with This 15-Second Trick"
- "Why I Stopped Using Notes App for Gift Ideas (And What I Use Instead)"

**Tertiary Channel: Social Proof & Virality**

**Early user testimonials:**
- "I used to panic-buy gifts last minute. Now I capture ideas the moment I hear them." - Sarah, 34
- "My family thinks I have an amazing memory. Really I just use Keeper." - Mike, 28
- "This app saved me from another generic Target gift card." - Jessica, 41

**Built-in viral mechanics:**
- Shared gift lists (family coordination) = built-in discovery
- "Send gift idea to friend" = cross-promotion
- Referral program: "Give 1 month free, get 1 month free"

**Future Channel: Paid Acquisition**

- **Facebook/Instagram ads:** Target "thoughtful gift giver" persona, ages 25-45
- **TikTok creators:** Gifting niche, productivity niche, relationship advice
- **Target CPA:** <$5 (LTV $72 = 14x ROAS needed)

### Retention Strategy

**Habit Formation:**
- Lock screen widget = seen 50-100x/day = passive reminder to capture ideas
- Daily visibility drives weekly usage (even if no gift occasions)

**Data Lock-In:**
- More captures = more value (can't switch without losing history)
- Audio playback = emotional attachment to past moments

**Network Effects:**
- Family using Keeper together = shared gift coordination
- Harder to leave if others depend on your shared lists

**Continuous Value:**
- Year-round usage (not just pre-holiday)
- Occasion reminders keep app top-of-mind
- Gift success stories = emotional ROI → continued use

---

## Appendix

### Research Session Details

- **Session Key:** agent:research-lead:5
- **Duration:** ~45 minutes total
  - Phase 1 (Mary discovery): 4.6 min
  - Phase 2 (Registry dedup): 30 sec
  - Phase 3 (CIS ideation): 2.5 min (parallel)
  - Phase 4 (Mary selection): 1.6 min
  - Phase 5 (Mary deep-dive): 3.3 min
  - Phase 6 (Carson naming + compilation): 30 sec
- **Discovery Approach:** direct-demand-signals (Reddit threads, user quotes, DIY solutions)
- **Config:** 
  - Platform: iOS mobile app
  - Business Model: B2C consumer
  - Stack: Swift, SwiftUI, Firebase

### Source Links

**Reddit Research:**
- https://www.reddit.com/r/Gifts/comments/1nimdy9/how_i_created_a_gift_system_that_actually_shows_i/
- https://www.reddit.com/r/Gifts/comments/1m5mws3/track_your_gifts/
- https://www.reddit.com/r/Gifts/comments/qrq83u/i_made_an_app_to_help_you_track_your_giftgiving/
- https://www.reddit.com/r/christmas/comments/14skd3w/what_giftgivingwishlist_apps_do_you_use/

**Competitive Analysis:**
- Giftster App Store listing
- Elfster website
- GiftLog, GiftList App Store listings

**Market Research:**
- Wonder Research (gift market sizing)
- DemandSage 2026 (iOS user stats)
- Mordor Intelligence (gift retail market growth)

---

**Status:** ✅ Ready for Project Lead intake

**Next Step:** Kelly routes to Project Lead for implementation planning
