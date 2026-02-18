#!/usr/bin/env node
require('dotenv').config();
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkPayment(paymentId) {
  console.log(`Checking payment: ${paymentId}\n`);
  
  const payment = await stripe.paymentIntents.retrieve(paymentId, {
    expand: ['charges']
  });
  
  console.log('Payment Intent Details:');
  console.log(`  Status: ${payment.status}`);
  console.log(`  Amount: $${(payment.amount / 100).toFixed(2)}`);
  console.log(`  Amount Refunded: $${(payment.amount_refunded / 100).toFixed(2)}`);
  console.log(`  Amount Capturable: $${(payment.amount_capturable / 100).toFixed(2)}`);
  
  if (payment.charges && payment.charges.data.length > 0) {
    const charge = payment.charges.data[0];
    console.log(`\nCharge Details:`);
    console.log(`  Charge ID: ${charge.id}`);
    console.log(`  Amount Refunded: $${(charge.amount_refunded / 100).toFixed(2)}`);
    console.log(`  Refunded: ${charge.refunded}`);
  }
  
  // Fetch refunds
  const refunds = await stripe.refunds.list({
    payment_intent: paymentId,
    limit: 10
  });
  
  console.log(`\nRefunds (${refunds.data.length}):`);
  refunds.data.forEach(r => {
    console.log(`  - ${r.id}: $${(r.amount / 100).toFixed(2)} (${r.status})`);
  });
}

checkPayment('pi_3SxnMvEBhsj8mT410EZEiuPy').catch(console.error);
