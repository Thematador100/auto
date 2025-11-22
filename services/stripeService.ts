import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabaseService } from './supabaseService';

// Initialize Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
let stripePromise: Promise<Stripe | null> | null = null;

if (stripePublishableKey) {
  stripePromise = loadStripe(stripePublishableKey);
} else {
  console.warn('Stripe publishable key not configured. Set VITE_STRIPE_PUBLISHABLE_KEY in .env.local');
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}

// Subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'pro-monthly',
    name: 'Pro Plan (Monthly)',
    price: 49.99,
    interval: 'month',
    features: [
      'Unlimited vehicle inspections',
      'AI-powered inspection reports',
      'Vehicle history reports',
      'OBD-II diagnostics tool',
      'AI chat assistant',
      'Cloud storage for all reports',
      'Export reports to PDF',
      'Email support'
    ],
    stripePriceId: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly'
  },
  {
    id: 'pro-yearly',
    name: 'Pro Plan (Yearly)',
    price: 499.99,
    interval: 'year',
    features: [
      'Unlimited vehicle inspections',
      'AI-powered inspection reports',
      'Vehicle history reports',
      'OBD-II diagnostics tool',
      'AI chat assistant',
      'Cloud storage for all reports',
      'Export reports to PDF',
      'Priority email support',
      'Save $100 per year'
    ],
    stripePriceId: import.meta.env.VITE_STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly'
  }
];

// Per-report pricing
export const REPORT_PRICES: Record<string, { price: number; stripePriceId: string }> = {
  'standard': {
    price: 19.99,
    stripePriceId: import.meta.env.VITE_STRIPE_REPORT_STANDARD_PRICE_ID || 'price_report_standard'
  },
  'ev': {
    price: 24.99,
    stripePriceId: import.meta.env.VITE_STRIPE_REPORT_EV_PRICE_ID || 'price_report_ev'
  },
  'commercial': {
    price: 39.99,
    stripePriceId: import.meta.env.VITE_STRIPE_REPORT_COMMERCIAL_PRICE_ID || 'price_report_commercial'
  },
  'rv': {
    price: 34.99,
    stripePriceId: import.meta.env.VITE_STRIPE_REPORT_RV_PRICE_ID || 'price_report_rv'
  },
  'classic': {
    price: 29.99,
    stripePriceId: import.meta.env.VITE_STRIPE_REPORT_CLASSIC_PRICE_ID || 'price_report_classic'
  },
  'motorcycle': {
    price: 14.99,
    stripePriceId: import.meta.env.VITE_STRIPE_REPORT_MOTORCYCLE_PRICE_ID || 'price_report_motorcycle'
  }
};

export const stripeService = {
  // Create checkout session for subscription
  async createSubscriptionCheckout(userId: string, planId: string): Promise<{ url?: string; error?: string }> {
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        return { error: 'Invalid plan selected' };
      }

      // In production, this would call your backend API to create a Stripe Checkout session
      // For now, we'll simulate this with a mock implementation
      const response = await fetch('/api/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          priceId: plan.stripePriceId,
          successUrl: `${window.location.origin}/subscription-success`,
          cancelUrl: `${window.location.origin}/pricing`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      return { url };
    } catch (err) {
      console.error('Subscription checkout error:', err);
      return { error: 'Failed to start checkout process' };
    }
  },

  // Create checkout session for single report purchase
  async createReportCheckout(userId: string, reportType: string): Promise<{ url?: string; error?: string }> {
    try {
      const reportPrice = REPORT_PRICES[reportType];
      if (!reportPrice) {
        return { error: 'Invalid report type' };
      }

      const response = await fetch('/api/create-report-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          priceId: reportPrice.stripePriceId,
          reportType,
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/dashboard`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      return { url };
    } catch (err) {
      console.error('Report checkout error:', err);
      return { error: 'Failed to start checkout process' };
    }
  },

  // Handle successful subscription
  async handleSubscriptionSuccess(sessionId: string, userId: string): Promise<boolean> {
    try {
      // Verify the session with your backend
      const response = await fetch(`/api/verify-subscription/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to verify subscription');
      }

      const { subscriptionId } = await response.json();

      // Update user plan in Supabase
      await supabaseService.auth.updateUserPlan(userId, 'pro', subscriptionId);

      return true;
    } catch (err) {
      console.error('Subscription verification error:', err);
      return false;
    }
  },

  // Cancel subscription
  async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      // Update user plan in Supabase
      await supabaseService.auth.updateUserPlan(userId, 'basic');

      return { success: true };
    } catch (err) {
      console.error('Subscription cancellation error:', err);
      return { success: false, error: 'Failed to cancel subscription' };
    }
  },

  // Get customer portal URL for managing subscription
  async getCustomerPortalUrl(userId: string): Promise<{ url?: string; error?: string }> {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          returnUrl: `${window.location.origin}/dashboard`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      return { url };
    } catch (err) {
      console.error('Customer portal error:', err);
      return { error: 'Failed to access customer portal' };
    }
  },

  // Mock payment for development (remove in production)
  async mockPayment(userId: string, type: 'subscription' | 'report', planOrReportType: string): Promise<boolean> {
    console.warn('Using mock payment - this should be removed in production!');

    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (type === 'subscription') {
      // Update to pro plan
      await supabaseService.auth.updateUserPlan(userId, 'pro', 'mock_subscription_' + Date.now());

      // Record transaction
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planOrReportType);
      if (plan) {
        await supabaseService.payments.recordTransaction(
          userId,
          'subscription',
          plan.price,
          undefined,
          { planId: planOrReportType, mock: true }
        );
      }
    } else {
      // Record report purchase
      const reportPrice = REPORT_PRICES[planOrReportType];
      if (reportPrice) {
        await supabaseService.payments.recordTransaction(
          userId,
          'report_purchase',
          reportPrice.price,
          undefined,
          { reportType: planOrReportType, mock: true }
        );
      }
    }

    return true;
  }
};
