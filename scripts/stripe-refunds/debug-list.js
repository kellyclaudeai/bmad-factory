#!/usr/bin/env node
require('dotenv').config();
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function debugList() {
  const payments = await stripe.paymentIntents.list({
    limit: 5,
    expand: ['data.charges']
  });
  
  console.log('Checking first 5 payments for refund data:\n');
  
  for (const p of payments.data) {
    console.log(`Payment: ${p.id}`);
    console.log(`  amount_refunded field: ${p.amount_refunded} (type: ${typeof p.amount_refunded})`);
    console.log(`  charges count: ${p.charges?.data?.length || 0}`);
    
    if (p.charges && p.charges.data.length > 0) {
      const charge = p.charges.data[0];
      console.log(`  charge.amount_refunded: ${charge.amount_refunded}`);
      console.log(`  charge.refunded: ${charge.refunded}`);
    }
    
    // Now fetch it individually
    const fullPayment = await stripe.paymentIntents.retrieve(p.id);
    console.log(`  Retrieved amount_refunded: ${fullPayment.amount_refunded}`);
    console.log('');
  }
}

debugList().catch(console.error);
