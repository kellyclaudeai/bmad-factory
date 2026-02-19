# Hindsight - Product Brief

**Generated:** 2026-02-19T11:03:00-06:00  
**Research Session:** agent:research-lead:main  
**Discovery Strategy:** review-gap-mining + workaround-archaeology  
**Project ID:** car-maintenance-tracker-2026-02-19-1047

---

## Problem

Vehicle owners lose service records, forget maintenance schedules, and can't prove service history when selling. Existing apps require tedious manual odometer entry every time and don't integrate photos/receipts effectively. This leads to lost resale value, warranty claim denials, and anxiety about whether maintenance is up to date.

### Evidence

**Reddit r/ios (April 2024):**
> "Looking for an app that'll keep records of any/all maintenance done to a car if you're not taking it to the dealership"

**Reddit r/Cartalk (Sept 2025):**
> "I used to have a great little app... developer quit updating it, and one day I installed a newer iOS and the app broke. So I've been trying to find a replacement... #1 thing would be 'keep all my data on my own device.'"

**Reddit r/Autos (Jan 2024):**
> "MyRide901... became quite a blessing recently because I sold a vehicle and all I had to do... was email myself a pdf of the records"

**User workarounds:**
- File cabinet of paper receipts
- Excel spreadsheets
- Photos scattered in camera roll with no organization
- "Fumbling thru the file cabinet" when selling car

### Competitive Landscape

**Classification:** Poorly Served

**Existing Solutions:**
- **AUTOsist** - Unlimited car count, reminders, but complex interface
- **MyRide901** - Good PDF export but abandoned by developer, broke on new iOS
- **Vehicle Maintenance Log** - Photo-based but limited features
- **Gap:** No app combines photo capture + automatic mileage tracking (CarPlay/Bluetooth) + dead-simple UI. All require manual odometer entry every time.

### Why This Matters

**Pain Intensity (Quinn: 22/25):**
- High-stakes financial pain: Lost resale value when can't prove maintenance
- Warranty claim denials due to lack of proof
- Anxiety about whether maintenance is current
- Episodic but severe (selling car = $500-2000 lost value without records)

**Willingness to Pay:**
- Users currently pay for tracking apps (AUTOsist $6/vehicle/month)
- Evidence of manual workarounds requiring significant time investment
- Proven market for maintenance tracking utilities

---

## Solution

**Hindsight** - A retroactive maintenance tracker that scans your existing camera roll and documents folder for ANY car-related photos (receipts, odometer shots, work orders) using on-device ML, then builds your maintenance timeline backwards. Users never "start fresh" — the app resurrects their forgotten history first, THEN becomes their forward tracker.

### Key Features

1. **Retroactive Photo Scanning**
   - On-device ML scans camera roll for car-related images
   - Identifies receipts, odometer photos, work orders automatically
   - OCR extraction of dates, amounts, service types, mileage

2. **Timeline Reconstruction**
   - Builds maintenance history from discovered photos
   - Visual timeline showing all past services
   - Fills gaps with estimated maintenance based on mileage patterns

3. **Forward Tracking**
   - Photo capture for new receipts
   - OCR-assisted data entry
   - Maintenance reminders based on manufacturer schedules

4. **Professional Export**
   - PDF service history report for resale
   - Timestamped photo proof included
   - Buyer-ready formatting

5. **Multi-Vehicle Support**
   - Track unlimited vehicles (premium tier)
   - Per-vehicle timelines
   - Cloud sync via Firebase

6. **Smart Categorization**
   - Auto-categorize service types (oil change, tires, brakes)
   - Cost tracking and trends
   - Warranty period tracking

### What Makes This Different

**Novelty (Quinn: 22/25) - Genuinely novel approach:**

**Nobody starts with RETROACTIVE scanning.** All competitors assume users start from zero today. Hindsight flips the emotional journey: instead of "ugh, I have to log everything now," users experience delight when the app surfaces forgotten $800 timing belt service from 2 years ago.

**It treats your camera roll as the primary database, not a secondary attachment system.** Most people HAVE photographed receipts but they're scattered across 5000+ camera roll photos. Hindsight makes that existing behavior valuable.

**On-device ML eliminates privacy concerns** - photos never leave the device during scanning. Processing happens locally using iOS Vision framework.

**Solves the "start from scratch" intimidation factor** that kills adoption of tracking apps. Users get immediate value (recovered history) before committing to forward tracking.

### Target Audience

- **Vehicle owners (18-65)** who maintain cars outside dealerships
- **Resale-conscious drivers** worried about proving service history
- **DIY mechanics** who keep receipts but lose them
- **Multiple-vehicle households** needing centralized tracking
- **Currently use:** Paper receipts in glove box, Excel spreadsheets, scattered camera roll photos, nothing (just forget)

**Frequency:** Episodic but high-stakes (selling car = critical moment for records)

**Proven willingness to pay:** Users pay $0-6/mo for tracking apps, invest time in manual workarounds

---

## Revenue Thesis

People currently have 20-50 car-related photos buried in their camera roll with no organization. When selling a vehicle, they frantically search old photos or lose $500-2000 in resale value by not proving maintenance. We provide immediate value by resurrecting 6-24 months of forgotten history on day 1 (emotional payoff), then become their forward tracker.

**Business Model:** Freemium
- **Free tier:** 1 vehicle, basic timeline, 50 scanned photos
- **Premium ($3.99/mo):** Unlimited vehicles, unlimited photo scanning, cloud sync, professional PDF exports, warranty tracking

**Revenue Projection:**
- Target: 20,000 downloads Year 1 (realistic for niche utility app with clear value prop)
- Freemium conversion: 4% (higher than typical 2-3% due to immediate retroactive value)
- Paid users: 800
- Year 1 ARR: $38,400

**Why they'll pay:** Retroactive scanning delivers immediate emotional payoff ("wow, I actually DID maintain this car well"). Premium tier unlocks when users add second vehicle or need professional export for resale.

---

## Risk Assessment

### Quinn's Strongest Counterargument

**Primary risk:** ML classification accuracy for "car receipts" may only reach 70-80%, requiring user triage. If scanning produces too many false positives (random photos misidentified as receipts), users lose trust in automation.

**Second risk:** Only works if users photographed receipts in the first place. DIY mechanics who keep paper receipts but never photographed them get zero retroactive value. App becomes "just another tracker" for this segment.

**Third risk:** iOS photo library access permissions are sensitive. Users may decline due to privacy concerns, killing core value prop. On-device processing helps but doesn't eliminate concern.

### Feasibility Notes

**Technical Stack:**
- **Platform:** iOS (Swift, SwiftUI)
- **ML/Vision:** iOS Vision framework + Core ML for image classification
- **OCR:** VisionKit for text extraction from receipts
- **Cloud Sync:** Firebase Firestore
- **Storage:** Firebase Storage for photo backups (premium tier)

**Development Scope:**
- Photo scanning engine: 8-10 stories
- ML classification pipeline: 6-8 stories
- OCR extraction: 4-6 stories
- Timeline UI: 6-8 stories
- Forward tracking: 8-10 stories
- Export/PDF generation: 4-6 stories
- **Total:** 40-45 stories (~8-10 epics)

**Value Source:** Self-contained (user's camera roll, on-device processing). Works day 1 with zero external dependencies. No cold start problem.

**Solo Developer Feasibility:** High. Leverages Apple's native frameworks (Vision, Core ML, PhotoKit). No complex backend logic. Incremental development path (start with basic scanning, add intelligence over time).

---

## Next Steps

Ready for Project Lead implementation:

1. **Create project directory:** `projects/hindsight/`
2. **Copy this intake.md**
3. **Run BMAD Phase 1:** PRD generation
4. **Initial sprint focus:** Photo scanning + OCR + basic timeline (prove core value prop)
5. **Beta testing priority:** Users with 6+ months of car photos in camera roll

---

## Constraints Applied

✅ **Platform:** iOS mobile app (Swift, SwiftUI)  
✅ **Business Model:** B2C (freemium: free tier + $3.99/mo premium)  
✅ **Stack:** Swift, SwiftUI, Firebase  
✅ **Scope:** 40-45 stories, solo developer feasible  
✅ **No hardware dependencies:** Uses existing iOS frameworks  
✅ **No proprietary data requirements:** User's own photos

---

**Quinn Score:** 78/100 (Novelty: 22/25, Problem-Solution Fit: 21/25, Feasibility: 20/25, Revenue Thesis: 15/25)

**Research Status:** Complete - Ready for Project Lead intake
