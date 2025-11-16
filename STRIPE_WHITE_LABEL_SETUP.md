# Stripe White Label Integration Guide

This guide explains how to set up Stripe payment processing for your white label instance of the AI Auto Pro Inspector application.

## Overview

The application supports white label deployment where each customer can:
- Use their own Stripe account for payment processing
- Customize branding (company name, colors, logo)
- Process payments directly to their own Stripe account
- Maintain complete control over their payment data

## Features

### ✅ What's Included

- **Stripe Elements Integration**: Modern, PCI-compliant payment forms
- **White Label Configuration UI**: Admin panel to configure Stripe keys and branding
- **Multi-Tenant Support**: Each white label customer uses their own Stripe account
- **Pay-Per-Report**: One-time payments for individual inspection reports
- **Subscription Support**: Monthly Pro plan subscriptions
- **Custom Branding**: Company name, primary color, logo customization
- **Secure Key Storage**: Publishable keys stored in localStorage (frontend only)

### ⚠️ Backend Integration Required

This implementation provides the **frontend foundation** for Stripe payments. To process actual payments, you need to implement a secure backend with:

1. API endpoint to create payment intents
2. Secure storage of Stripe secret keys
3. Webhook handlers for payment events
4. Database to track transactions and user subscriptions

---

## Quick Start

### 1. Get Your Stripe API Keys

1. Create a Stripe account at [https://stripe.com](https://stripe.com)
2. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
3. Navigate to **Developers → API keys**
4. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
5. Keep your **Secret key** (starts with `sk_test_` or `sk_live_`) secure - never expose it in frontend code!

### 2. Configure White Label Settings

1. Start the application
2. Log in and navigate to the **Admin Panel**
3. Click on the **"White Label & Payments"** tab
4. Fill in the configuration form:
   - **Tenant ID**: A unique identifier for your instance (e.g., `my-auto-shop`)
   - **Company Name**: Your business name (displayed in the app header)
   - **Stripe Publishable Key**: Paste your `pk_test_...` or `pk_live_...` key
   - **Primary Color** (Optional): Brand color for buttons and accents
   - **Logo URL** (Optional): URL to your company logo
   - **Custom Domain** (Optional): Your custom domain
5. Click **Save Configuration**
6. The page will reload with your new branding applied

### 3. Test the Payment Flow

1. Navigate to the **Payment** or **Pricing** screen
2. Select a plan or report type
3. The Stripe payment form should appear
4. Use [Stripe test cards](https://stripe.com/docs/testing) to test:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Authentication Required: `4000 0025 0000 3155`

---

## Backend Implementation

### Required Backend Endpoints

#### 1. Create Payment Intent

**Endpoint**: `POST /api/create-payment-intent`

**Request Body**:
```json
{
  "amount": 1999,
  "currency": "usd",
  "metadata": {
    "type": "report",
    "reportType": "Standard Car/SUV"
  }
}
```

**Backend Logic**:
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body;

    // For multi-tenant: retrieve tenant's Stripe secret key from database
    // const tenantStripeKey = await getTenantStripeKey(req.tenantId);
    // const stripe = require('stripe')(tenantStripeKey);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 2. Create Subscription

**Endpoint**: `POST /api/create-subscription`

**Request Body**:
```json
{
  "priceId": "price_xxxxx",
  "customerId": "cus_xxxxx"
}
```

**Backend Logic**:
```javascript
app.post('/api/create-subscription', async (req, res) => {
  try {
    const { priceId, customerId } = req.body;

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 3. Webhook Handler

**Endpoint**: `POST /api/webhooks/stripe`

```javascript
app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Update database: mark payment as successful
      await handleSuccessfulPayment(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      // Handle failed payment
      await handleFailedPayment(event.data.object);
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      // Handle subscription changes
      await handleSubscriptionChange(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});
```

### Multi-Tenant Architecture

For white label deployment, each customer should have their own Stripe account. Your backend needs to:

1. **Store tenant-specific Stripe keys securely**:
   ```sql
   CREATE TABLE tenants (
     id UUID PRIMARY KEY,
     company_name VARCHAR(255),
     stripe_publishable_key VARCHAR(255),
     stripe_secret_key_encrypted TEXT, -- Encrypt this!
     primary_color VARCHAR(7),
     logo_url TEXT,
     domain VARCHAR(255) UNIQUE
   );
   ```

2. **Identify the tenant from the request**:
   - By domain (e.g., `inspections.yourcompany.com`)
   - By subdomain (e.g., `yourcompany.auto-inspector.com`)
   - By authentication token with tenant ID

3. **Use the correct Stripe instance**:
   ```javascript
   async function getStripeForTenant(tenantId) {
     const tenant = await db.getTenant(tenantId);
     const secretKey = decrypt(tenant.stripe_secret_key_encrypted);
     return require('stripe')(secretKey);
   }
   ```

---

## Security Best Practices

### ✅ DO

- Store Stripe secret keys encrypted in your database
- Use HTTPS for all API requests
- Validate webhook signatures
- Use environment variables for sensitive data
- Implement rate limiting on API endpoints
- Log all payment events for auditing
- Use Stripe's test mode during development

### ❌ DON'T

- **Never** expose secret keys in frontend code
- **Never** commit API keys to version control
- **Never** trust payment amounts from the frontend
- **Never** skip webhook signature verification
- **Never** store credit card data yourself

---

## Environment Variables

Create a `.env` file in your backend:

```bash
# Stripe (for default/testing)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Database
DATABASE_URL=postgresql://...

# Application
NODE_ENV=development
PORT=3000
```

---

## Testing

### Test Cards

Use these test card numbers from Stripe:

| Card Number | Scenario |
|------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |
| `4000 0000 0000 9995` | Insufficient funds |

Use any future expiration date and any 3-digit CVC.

### Webhook Testing

Use the Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-brew/stripe

# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
```

---

## Pricing Configuration

Pricing is configured in `config.ts`:

```typescript
PRICING: {
  plans: {
    pro: {
      name: 'Pro',
      price: '$49.99 / mo',
      features: [...]
    }
  },
  reports: {
    'Standard Car/SUV': { price: 19.99 },
    'Electric Vehicle (EV)': { price: 24.99 },
    // ...
  }
}
```

To add a new report type or change pricing:
1. Edit `config.ts`
2. Update your Stripe product/price IDs in the backend
3. Restart the application

---

## Troubleshooting

### Payment form not appearing

1. Check that you've configured a Stripe publishable key in Admin → White Label & Payments
2. Open browser console and look for errors
3. Verify the key starts with `pk_test_` or `pk_live_`

### "Failed to create payment intent" error

1. Ensure your backend is running
2. Check that `/api/create-payment-intent` endpoint exists
3. Verify CORS headers allow requests from your frontend
4. Check backend logs for Stripe API errors

### Webhook events not received

1. Verify webhook endpoint is publicly accessible (use ngrok for local testing)
2. Check webhook signature verification
3. Ensure webhook URL is configured in Stripe Dashboard
4. Check webhook secret matches your environment variable

---

## Production Deployment

Before going live:

1. **Switch to live mode**:
   - Get live API keys from Stripe (remove `_test_` suffix)
   - Update all white label configurations with live keys

2. **Enable production security**:
   - Use HTTPS everywhere
   - Enable webhook signature verification
   - Set up proper authentication
   - Implement rate limiting

3. **Configure Stripe account**:
   - Add business information
   - Complete identity verification
   - Set up payouts (bank account)
   - Configure tax settings
   - Set up fraud prevention rules

4. **Test the complete flow**:
   - Make a real payment with a small amount
   - Verify webhook delivery
   - Check payment appears in Stripe Dashboard
   - Test refund process

---

## Support

### Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Elements](https://stripe.com/docs/stripe-js)
- [Payment Intents API](https://stripe.com/docs/payments/payment-intents)
- [Testing Guide](https://stripe.com/docs/testing)
- [Webhooks Guide](https://stripe.com/docs/webhooks)

### Need Help?

- Check Stripe's support documentation
- Visit the [Stripe Support Center](https://support.stripe.com)
- Contact your development team

---

## License

This implementation is provided as-is for white label customers of the AI Auto Pro Inspector platform.
