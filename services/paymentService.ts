// paymentService.ts - Stripe payment integration
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { PricingPlan, PaymentMethod, Invoice, Subscription } from '../types';

// In production, use your actual Stripe publishable key from environment variable
const STRIPE_PUBLISHABLE_KEY = 'pk_test_demo'; // Replace with actual key
const STRIPE_KEY = 'stripe_data';

let stripePromise: Promise<Stripe | null>;

// Initialize Stripe
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Simulated pricing plans with Stripe price IDs
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'free',
    displayName: 'Free',
    price: 0,
    priceDisplay: '$0',
    interval: 'month',
    features: [
      '5 inspections per month',
      'Basic AI analysis',
      'PDF reports',
      'Email support',
    ],
    maxInspections: 5,
  },
  {
    id: 'basic',
    name: 'basic',
    displayName: 'Basic',
    price: 29,
    priceDisplay: '$29',
    interval: 'month',
    features: [
      '50 inspections per month',
      'AI-powered analysis',
      'PDF & Excel reports',
      'Priority email support',
      'Mobile app access',
    ],
    stripePriceId: 'price_basic_monthly',
    maxInspections: 50,
  },
  {
    id: 'pro',
    name: 'pro',
    displayName: 'Pro',
    price: 79,
    priceDisplay: '$79',
    interval: 'month',
    features: [
      'Unlimited inspections',
      'Advanced AI analysis',
      'All export formats',
      '24/7 priority support',
      'White label options',
      'Team collaboration',
      'API access',
    ],
    stripePriceId: 'price_pro_monthly',
    maxInspections: -1,
    isPopular: true,
  },
  {
    id: 'enterprise',
    name: 'enterprise',
    displayName: 'Enterprise',
    price: 299,
    priceDisplay: '$299',
    interval: 'month',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Custom integrations',
      'Dedicated support',
      'Custom white labeling',
      'SLA guarantee',
      'Advanced analytics',
      'Custom training',
    ],
    stripePriceId: 'price_enterprise_monthly',
    maxUsers: -1,
    maxInspections: -1,
  },
];

// Get payment methods from localStorage (demo)
const getStoredData = () => {
  const data = localStorage.getItem(STRIPE_KEY);
  return data ? JSON.parse(data) : { paymentMethods: [], invoices: [], subscription: null };
};

// Save data to localStorage
const saveData = (data: any) => {
  localStorage.setItem(STRIPE_KEY, JSON.stringify(data));
};

// Create checkout session
export const createCheckoutSession = async (
  priceId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string }> => {
  // In production, call your backend API to create a Stripe checkout session
  // For demo, we'll simulate it

  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

  return {
    sessionId: `cs_test_${Date.now()}`,
    url: successUrl + '?session_id=demo', // In production, this would be Stripe's checkout URL
  };
};

// Redirect to Stripe Checkout
export const redirectToCheckout = async (
  planId: string,
  userId: string
): Promise<void> => {
  const plan = PRICING_PLANS.find(p => p.id === planId);
  if (!plan || !plan.stripePriceId) {
    throw new Error('Invalid plan selected');
  }

  // For demo purposes, simulate successful subscription
  const data = getStoredData();
  data.subscription = {
    id: `sub_${Date.now()}`,
    plan,
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false,
  };
  saveData(data);

  // In production, redirect to Stripe Checkout
  // const stripe = await getStripe();
  // const { sessionId } = await createCheckoutSession(...);
  // await stripe.redirectToCheckout({ sessionId });
};

// Get payment methods
export const getPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  const data = getStoredData();
  return data.paymentMethods || [];
};

// Add payment method
export const addPaymentMethod = async (
  userId: string,
  paymentMethodId: string
): Promise<PaymentMethod> => {
  // In production, call Stripe API to attach payment method

  const newMethod: PaymentMethod = {
    id: paymentMethodId,
    type: 'card',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
  };

  const data = getStoredData();
  data.paymentMethods.push(newMethod);
  saveData(data);

  return newMethod;
};

// Remove payment method
export const removePaymentMethod = async (
  userId: string,
  paymentMethodId: string
): Promise<void> => {
  const data = getStoredData();
  data.paymentMethods = data.paymentMethods.filter((pm: PaymentMethod) => pm.id !== paymentMethodId);
  saveData(data);
};

// Get invoices
export const getInvoices = async (userId: string): Promise<Invoice[]> => {
  const data = getStoredData();

  // Generate demo invoices if none exist
  if (!data.invoices || data.invoices.length === 0) {
    const demoInvoices: Invoice[] = [
      {
        id: 'inv_001',
        amount: 79,
        currency: 'usd',
        status: 'paid',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Pro Plan - Monthly',
      },
      {
        id: 'inv_002',
        amount: 79,
        currency: 'usd',
        status: 'paid',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Pro Plan - Monthly',
      },
    ];
    data.invoices = demoInvoices;
    saveData(data);
  }

  return data.invoices || [];
};

// Get current subscription
export const getSubscription = async (userId: string): Promise<Subscription | null> => {
  const data = getStoredData();
  return data.subscription || null;
};

// Cancel subscription
export const cancelSubscription = async (userId: string): Promise<void> => {
  const data = getStoredData();
  if (data.subscription) {
    data.subscription.cancelAtPeriodEnd = true;
    saveData(data);
  }
};

// Reactivate subscription
export const reactivateSubscription = async (userId: string): Promise<void> => {
  const data = getStoredData();
  if (data.subscription) {
    data.subscription.cancelAtPeriodEnd = false;
    saveData(data);
  }
};

// Process one-time payment for inspection report
export const processReportPayment = async (
  userId: string,
  reportId: string,
  amount: number
): Promise<{ success: boolean; paymentId: string }> => {
  // In production, create a PaymentIntent with Stripe

  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing

  return {
    success: true,
    paymentId: `pi_${Date.now()}`,
  };
};

// Create customer portal session (for managing subscription and payment methods)
export const createPortalSession = async (
  userId: string,
  returnUrl: string
): Promise<{ url: string }> => {
  // In production, call your backend to create a Stripe Customer Portal session

  return {
    url: returnUrl, // For demo, just return to the same page
  };
};
