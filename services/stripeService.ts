// services/stripeService.ts

import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { getStripePublishableKey } from '../config';
import { StripePaymentIntent, PaymentResult } from '../types';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Initialize Stripe with the publishable key from white label config
 * This should be called when the app loads or when white label config changes
 */
export function initializeStripe(): Promise<Stripe | null> {
  const publishableKey = getStripePublishableKey();

  if (!publishableKey) {
    console.warn('No Stripe publishable key configured. Payment processing will not be available.');
    return Promise.resolve(null);
  }

  stripePromise = loadStripe(publishableKey);
  return stripePromise;
}

/**
 * Get the Stripe instance
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    return initializeStripe();
  }
  return stripePromise;
}

/**
 * Create a payment intent on the backend
 * Note: This requires a backend API endpoint
 * For white label, the backend should use the tenant's Stripe secret key
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata?: Record<string, string>
): Promise<StripePaymentIntent> {
  // In production, this should call your backend API
  // The backend should:
  // 1. Identify the tenant from the request (domain, auth token, etc.)
  // 2. Use the tenant's Stripe secret key to create the payment intent
  // 3. Return the client secret

  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency,
      metadata,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }

  return await response.json();
}

/**
 * Process a payment with Stripe Elements
 */
export async function processPayment(
  elements: StripeElements,
  clientSecret: string
): Promise<PaymentResult> {
  const stripe = await getStripe();

  if (!stripe) {
    return {
      success: false,
      error: 'Stripe not configured. Please configure your Stripe API keys in settings.',
    };
  }

  try {
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/payment-success',
      },
      redirect: 'if_required',
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
      };
    }

    return {
      success: false,
      error: 'Payment processing failed',
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Create a subscription
 * Note: Requires backend implementation
 */
export async function createSubscription(
  priceId: string,
  customerId?: string
): Promise<{ subscriptionId: string; clientSecret: string }> {
  // In production, call your backend API
  // The backend should use the tenant's Stripe secret key

  const response = await fetch('/api/create-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId,
      customerId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create subscription');
  }

  return await response.json();
}

/**
 * Cancel a subscription
 * Note: Requires backend implementation
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const response = await fetch('/api/cancel-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscriptionId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to cancel subscription');
  }
}
