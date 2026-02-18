#!/usr/bin/env node
/**
 * Stripe Refund Tool
 * Refunds payments with "full amount - $1" logic
 * Skips payments in the exclusion list
 */

require('dotenv').config();
const Stripe = require('stripe');

const REFUND_REASON = 'Your project submission was not selected for development at this time. Thank you for your interest.';

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const skipListPath = args.find(arg => arg.startsWith('--skip='))?.split('=')[1];

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ Error: STRIPE_SECRET_KEY not found in environment');
    console.error('Please set it in .env file or export it');
    process.exit(1);
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Load skip list
  let skipList = { emails: [], paymentIntents: [] };
  if (skipListPath) {
    const fs = require('fs');
    skipList = JSON.parse(fs.readFileSync(skipListPath, 'utf8'));
  }

  console.log('🔍 Fetching recent payments...\n');

  // Fetch payment intents from last 90 days
  const payments = await stripe.paymentIntents.list({
    limit: 100,
    created: {
      gte: Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60)
    },
    expand: ['data.charges']
  });

  const toRefund = [];
  const skipped = [];

  for (const payment of payments.data) {
    // Only process succeeded payments
    if (payment.status !== 'succeeded') continue;

    // Check if already refunded by fetching refunds list
    const refunds = await stripe.refunds.list({
      payment_intent: payment.id,
      limit: 1
    });
    
    if (refunds.data.length > 0) {
      console.log(`⏭️  Already refunded: ${payment.id}`);
      continue;
    }

    // Get customer email - try multiple sources
    let customerEmail = null;
    let emailSource = null;
    
    // Try 1: Customer object
    if (payment.customer) {
      try {
        const customer = await stripe.customers.retrieve(payment.customer);
        if (customer.email) {
          customerEmail = customer.email;
          emailSource = 'customer';
        }
      } catch (err) {
        console.log(`⚠️  Could not retrieve customer ${payment.customer}: ${err.message}`);
      }
    }
    
    // Try 2: Receipt email on payment intent
    if (!customerEmail && payment.receipt_email) {
      customerEmail = payment.receipt_email;
      emailSource = 'receipt_email';
    }
    
    // Try 3: Charge billing details
    if (!customerEmail && payment.charges && payment.charges.data.length > 0) {
      const charge = payment.charges.data[0];
      if (charge.billing_details && charge.billing_details.email) {
        customerEmail = charge.billing_details.email;
        emailSource = 'billing_details';
      }
    }
    
    // Try 4: If we still don't have email, fetch the charge separately
    if (!customerEmail && payment.latest_charge) {
      try {
        const charge = await stripe.charges.retrieve(payment.latest_charge);
        if (charge.billing_details && charge.billing_details.email) {
          customerEmail = charge.billing_details.email;
          emailSource = 'charge_billing_details';
        }
      } catch (err) {
        console.log(`⚠️  Could not retrieve charge ${payment.latest_charge}: ${err.message}`);
      }
    }

    // Check skip list
    const shouldSkip = 
      skipList.paymentIntents.includes(payment.id) ||
      (customerEmail && skipList.emails.includes(customerEmail.toLowerCase()));

    if (shouldSkip) {
      skipped.push({
        id: payment.id,
        email: customerEmail,
        amount: `$${(payment.amount / 100).toFixed(2)}`,
        reason: 'In skip list'
      });
      continue;
    }

    // Calculate refund amount (full - $1)
    const refundAmount = payment.amount - 100; // Subtract $1 (100 cents)
    
    if (refundAmount <= 0) {
      console.log(`⏭️  Too small to refund: ${payment.id} ($${(payment.amount / 100).toFixed(2)})`);
      continue;
    }

    toRefund.push({
      paymentIntentId: payment.id,
      customerEmail: customerEmail || 'N/A',
      emailSource: emailSource || 'none',
      originalAmount: payment.amount,
      refundAmount: refundAmount,
      keepAmount: 100,
      currency: payment.currency.toUpperCase()
    });
  }

  // Display results
  console.log('\n' + '='.repeat(80));
  console.log(`📋 REFUND SUMMARY ${dryRun ? '(DRY RUN)' : '(LIVE)'}`);
  console.log('='.repeat(80) + '\n');

  if (toRefund.length > 0) {
    console.log(`✅ Payments to refund: ${toRefund.length}\n`);
    toRefund.forEach((p, i) => {
      console.log(`${i + 1}. ${p.paymentIntentId}`);
      console.log(`   Email: ${p.customerEmail}${p.emailSource !== 'none' ? ` (${p.emailSource})` : ''}`);
      console.log(`   Original: $${(p.originalAmount / 100).toFixed(2)} ${p.currency}`);
      console.log(`   Refund: $${(p.refundAmount / 100).toFixed(2)} (keep $1.00)`);
      console.log('');
    });
  }

  if (skipped.length > 0) {
    console.log(`⏭️  Skipped payments: ${skipped.length}\n`);
    skipped.forEach((p, i) => {
      console.log(`${i + 1}. ${p.id} - ${p.email} (${p.amount}) - ${p.reason}`);
    });
    console.log('');
  }

  // Calculate totals
  const totalRefundAmount = toRefund.reduce((sum, p) => sum + p.refundAmount, 0);
  const totalKeptAmount = toRefund.length * 100;

  console.log('='.repeat(80));
  console.log(`💰 Total to refund: $${(totalRefundAmount / 100).toFixed(2)}`);
  console.log(`💵 Total to keep: $${(totalKeptAmount / 100).toFixed(2)}`);
  console.log('='.repeat(80) + '\n');

  if (dryRun) {
    console.log('🧪 DRY RUN - No refunds were actually processed');
    console.log('   Remove --dry-run flag to execute refunds\n');
    return;
  }

  // Execute refunds
  if (toRefund.length === 0) {
    console.log('✨ No refunds to process!');
    return;
  }

  console.log('⚙️  Processing refunds...\n');
  const results = [];

  for (const payment of toRefund) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: payment.paymentIntentId,
        amount: payment.refundAmount,
        reason: 'requested_by_customer',
        metadata: {
          reason: REFUND_REASON
        }
      });

      results.push({
        success: true,
        id: payment.paymentIntentId,
        refundId: refund.id,
        amount: `$${(payment.refundAmount / 100).toFixed(2)}`
      });

      console.log(`✅ ${payment.paymentIntentId} - Refunded $${(payment.refundAmount / 100).toFixed(2)}`);
    } catch (error) {
      results.push({
        success: false,
        id: payment.paymentIntentId,
        error: error.message
      });

      console.error(`❌ ${payment.paymentIntentId} - Failed: ${error.message}`);
    }
  }

  // Save results
  const fs = require('fs');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = `./refund-report-${timestamp}.json`;
  
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: toRefund.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalRefunded: `$${(totalRefundAmount / 100).toFixed(2)}`,
      totalKept: `$${(totalKeptAmount / 100).toFixed(2)}`
    },
    results,
    skipped
  }, null, 2));

  console.log(`\n📄 Report saved to: ${reportPath}`);
  console.log('\n✨ Refund process complete!');
}

main().catch(console.error);
