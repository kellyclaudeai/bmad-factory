# Stripe Refund Tool

Bulk refund tool that refunds "full amount - $1" for selected payments.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file with your Stripe secret key:
   ```bash
   STRIPE_SECRET_KEY=sk_...
   ```

3. Edit `skip-list.json` with emails/payment IDs to exclude from refunds:
   ```json
   {
     "emails": ["customer@example.com"],
     "paymentIntents": ["pi_xxxxxxxxxxxxx"]
   }
   ```

## Usage

### Dry Run (recommended first)
See what would be refunded without actually processing:
```bash
npm run dry-run
```

### Execute Refunds
After reviewing dry-run output:
```bash
npm run refund
```

## Refund Logic

- Fetches last 90 days of payments
- Skips payments in `skip-list.json`
- Skips already-refunded payments
- Refunds "original amount - $1" (you keep $1)
- Adds reason: "Your project submission was not selected for development at this time"
- Generates a JSON report of all actions

## Safety Features

- Dry-run mode by default
- Skips already refunded payments
- Detailed logging
- JSON report of all actions
- Won't refund payments under $1
