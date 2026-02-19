# SELECTED PROBLEM

## Initial Concept Name
Warranty & Receipt Tracker

## Discovery Strategy Used
Workaround Archaeology

## Score: 42/50
- **Pain Intensity:** 9/10 - People lose money from missed warranties, can't find receipts when needed for repairs/returns, forget about extended warranties/AMC services they paid for. Real financial impact documented.
- **Evidence Breadth:** 8/10 - Multiple Reddit threads across different communities (r/digitalminimalism, r/BuyItForLife, r/homeowners), consistent problem mentioned over years (2021-2025).
- **Solution Gap:** 8/10 - Apps exist (Warranty Keeper 4.4★ with only 306 reviews, SlipCrate requires subscription, other manual apps) but have significant gaps: tedious manual entry (2-5 min per item), limited fields, can't track multiple warranties per product, can't edit categories, low adoption indicates poor fit.
- **Buildability:** 9/10 - Perfect fit for web app with Firebase (document storage, reminders via cloud functions), standard CRUD + image upload + OCR (Cloud Vision API), no proprietary data needed, straightforward tech stack alignment.
- **Demand Validation:** 8/10 - Problem mentioned across multiple subreddits with consistent engagement, people actively seeking alternatives to existing apps, documented financial losses, niche but persistent demand for better solution.

## Problem Description
Consumers have no effective way to organize and track warranties, receipts, and service documents across their household purchases. Critical purchase documents arrive scattered across multiple channels (email receipts, WhatsApp photos from family members, physical receipts, warranty PDFs) and never consolidate into one searchable place. This leads to missed warranty claims, lost money on expired extended warranties/service contracts, and inability to provide proof of purchase when needed for repairs or returns.

## Why This Problem Is Underserved

**Current landscape:**
- **Manual apps** (Warranty Keeper, similar): Require 2-5 minutes of tedious data entry per item, can't track multiple warranties per product, limited field customization, low adoption (306 reviews on WK)
- **AI-powered apps** (SlipCrate): Require paid subscriptions, large native app downloads (50-200MB), learning curves
- **DIY workarounds**: People use scattered systems (photos in cloud storage, spreadsheets, physical folders, email search) that don't provide warranty expiry tracking or reminders
- **No good solution**: Reddit threads from 2021-2025 show people still actively asking "how do you track warranties?" - consensus is "there's no good way"

**What people do instead:**
- Take photos of receipts → store in Dropbox/Google Photos (no warranty date tracking)
- Physical file cabinets (grows forever, never pruned, can't search when away from home)
- Manual spreadsheets (tedious data entry, no reminders, no receipt images linked)
- Email search when needed (only works for email receipts, misses physical/WhatsApp receipts)
- Building custom automations (one person mentioned building WhatsApp → Drive → Google Sheets workflow)

**Solution gap classification:** **Underserved** - 1-2 apps exist but with major gaps (tedious manual entry, limited features, low adoption), and people continue using makeshift workarounds.

## Evidence

**Reddit r/digitalminimalism** (2025, thread asking for solutions):
> "I'm trying to declutter the way I store receipts, warranty PDFs, appliance service bills, etc. Right now mine are scattered across email, Drive, WhatsApp screenshots, and a physical folder. How do you keep everything in one clean, searchable place?"
>
> UPDATE: "A lot of people mentioned they forget to upload things regularly, so I'm experimenting with a small automation for myself: basically a WhatsApp workflow that lets me send a receipt photo/PDF and automatically saves it to Drive + logs the details in a Google Sheet."

**Reddit r/BuyItForLife** (2021, 43+ comments discussing the problem):
> "Simple question, what is your process for keeping track of your receipts and warranties? A few friends and I have been talking about this. The general consensus is there is no best process. So far the 3 most common answers:
> - Take photos of receipts to store in Photos/Dropbox/some other service. *This doesn't keep track of the warranty - so you have to track that down*
> - File cabinet/ organized paper system. *Have to keep it organized, and always grows, never gets pruned.*
> - Spreadsheets - manually type in the details into a spreadsheet that contains purchase info & warranty dates.
> There are a few apps that let you store a receipt photo and type in the warranty info. However, those are really no better than the photos & spreadsheets. **My guess is why none of the ones I've found have taken off.**"

**Reddit r/homeowners** (2024, describing specific pain and losses):
> "I realized recently that I have no idea how many devices I actually own, or which ones are still under warranty. A few examples:
> - My Sony headphones stopped working, service center asked for the invoice and I couldn't find it anywhere.
> - Same with my Water purifier, there was a complete free service left valid for a year but now that is also expired.
> - Also I've bought extended warranty/AMC for some appliances, but I keep forgetting about them until it's too late.
> - Family members also buy devices, so invoices are scattered between WhatsApp, emails, and random folders.
> **Pretty sure, I've lost money just because of missing invoices or forgetting warranty/service expiry dates.**"

**Quantitative Demand:**
- **Google Trends:** Steady search interest for "warranty tracker" and related queries over time
- **Related app evidence:** Warranty Keeper (Google Play) has 4.4★ rating but only 306 reviews despite being updated Feb 2026 - indicates demand exists but current solution isn't sticky
- **Community size:** r/BuyItForLife (3.4M members), r/homeowners (500K+ members) frequently discuss this problem
- **App reviews cite gaps**: "Missing some key functionality. Category names cannot be edited once created, nor can they be reorganized. Also, some items come with multiple warranties, e.g. 1 year on one part, 3 years on another. This only allows one warranty to be tracked." (Warranty Keeper review, 2022, 7 helpful votes)

## Target User Profile
- **Who:** Homeowners and consumers (25-55 years old) who make significant purchases with warranties - appliances, electronics, furniture, tools. Includes both single-person households and families where multiple people make purchases.
- **Pain frequency:** Episodic but high-stakes - pain surfaces when warranty is needed (repair/return), when warranty expires unused (lost money), or during tax time/insurance claims when receipts needed. Setup pain is continuous (every purchase should be logged but isn't).
- **Current workaround:** Scattered multi-tool approach: photos in cloud storage (no warranty tracking), physical folders (can't access remotely), spreadsheets (tedious manual entry, no reminders), email search (misses non-email receipts), or simply not tracking at all and hoping receipts are findable when needed.
- **Impact:** Direct financial loss from missed warranty claims ($100s per incident), wasted money on expired extended warranties/AMCs that were forgotten ($50-200/year), inability to provide proof of purchase blocks repairs/returns, time wasted searching for receipts across multiple systems (hours during crisis moments).
- **Willingness to pay:** Evidence of paid solutions (SlipCrate subscription model exists), people buy extended warranties showing concern for warranty management, B2C consumers typically willing to pay $5-15/month for tools that prevent financial losses. "I've lost money just because of missing invoices" quote shows awareness of financial impact.

## Selection Rationale
This problem scored highest (42/50) because it combines high pain intensity (real money lost), clear evidence breadth (consistent problem across years and communities), and a significant solution gap (existing apps haven't achieved product-market fit despite obvious demand - low adoption, manual entry friction, feature gaps). The workaround archaeology strategy perfectly captured this: people are building DIY WhatsApp→Drive→Sheets workflows, using multiple disconnected tools, and losing money when systems fail. It's a classic "duct tape and spreadsheets" problem waiting for a proper solution.

The buildability is excellent for the configured web-app + Firebase stack (receipt images in Storage, structured data in Firestore, OCR via Cloud Vision API, reminders via Cloud Functions), and it's clearly B2C consumer-facing. The problem is underserved (not crowded) - a few apps exist but haven't nailed it, leaving room for a better execution.
