import React, { useState } from 'react';
import { CONFIG } from '../config';
import PaymentGateway from './PaymentGateway';
import { PricingPlan } from '../types';
import { createPaymentIntent } from '../services/stripeService';

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

interface PlanCardProps {
  plan: PricingPlan;
  onSelect: () => void;
  loading?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, loading }) => (
  <div className="bg-dark-card border border-primary rounded-lg p-6 flex flex-col">
    <h3 className="text-2xl font-bold text-light-text">{plan.name} Plan</h3>
    <p className="mt-2 text-4xl font-extrabold text-light-text">{plan.price}</p>
    <p className="text-medium-text">Billed monthly.</p>

    <ul className="mt-6 space-y-4 flex-grow">
      {plan.features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <div className="flex-shrink-0">
            <CheckIcon />
          </div>
          <p className="ml-3 text-base text-medium-text">{feature}</p>
        </li>
      ))}
    </ul>
    <button
      onClick={onSelect}
      disabled={loading}
      className={`mt-8 w-full font-bold py-3 px-4 rounded-lg transition-colors ${
        loading
          ? 'bg-gray-600 cursor-not-allowed text-gray-400'
          : 'bg-primary hover:bg-blue-600 text-white'
      }`}
    >
      {loading ? 'Loading...' : 'Upgrade to Pro'}
    </button>
  </div>
);

export const PaymentScreen: React.FC = () => {
  const { pro: proPlan } = CONFIG.PRICING.plans;
  const reportPricing = CONFIG.PRICING.reports;

  const [selectedItem, setSelectedItem] = useState<{
    type: 'subscription' | 'report';
    name: string;
    amount: number;
  } | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSelectProPlan = async () => {
    setLoading(true);
    setError(null);

    try {
      // For subscriptions, you would typically create a subscription instead
      // For demo purposes, we'll create a payment intent for the first month
      const amount = 4999; // $49.99 in cents
      const paymentIntent = await createPaymentIntent(amount, 'usd', {
        type: 'subscription',
        plan: 'pro',
      });

      setSelectedItem({
        type: 'subscription',
        name: 'Pro Plan',
        amount,
      });
      setClientSecret(paymentIntent.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReport = async (reportType: string, price: number) => {
    setLoading(true);
    setError(null);

    try {
      const amount = Math.round(price * 100); // Convert to cents
      const paymentIntent = await createPaymentIntent(amount, 'usd', {
        type: 'report',
        reportType,
      });

      setSelectedItem({
        type: 'report',
        name: reportType,
        amount,
      });
      setClientSecret(paymentIntent.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setPaymentSuccess(true);
    console.log('Payment successful:', paymentIntentId);
    // Here you would typically:
    // 1. Update user's plan/credits in your backend
    // 2. Redirect to dashboard or show success message
    // 3. Enable the feature they just paid for
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleBackToPricing = () => {
    setSelectedItem(null);
    setClientSecret(null);
    setError(null);
    setPaymentSuccess(false);
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-500 mb-4">
            <CheckIcon />
          </div>
          <h2 className="text-2xl font-bold text-light-text mb-2">Payment Successful!</h2>
          <p className="text-medium-text mb-6">
            Your payment for <strong>{selectedItem?.name}</strong> has been processed successfully.
          </p>
          <button
            onClick={handleBackToPricing}
            className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  if (clientSecret && selectedItem) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={handleBackToPricing}
          className="text-primary hover:text-blue-400 flex items-center gap-2"
        >
          ← Back to Pricing
        </button>

        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <h2 className="text-2xl font-bold text-light-text mb-2">Selected: {selectedItem.name}</h2>
          <p className="text-3xl font-bold text-primary mb-4">${(selectedItem.amount / 100).toFixed(2)}</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-md p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <PaymentGateway
          amount={selectedItem.amount}
          clientSecret={clientSecret}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />

        <div className="bg-dark-card border border-dark-border rounded-lg p-4">
          <p className="text-sm text-medium-text">
            <strong>Note:</strong> This is a demo integration. In production, you'll need to set up a backend server to
            create payment intents securely using your Stripe secret key.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-light-text">Pricing & Plans</h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-medium-text">
          Choose the plan that's right for your business. From single reports to unlimited access.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-md p-4 max-w-2xl mx-auto">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Pro Plan */}
        <div className="lg:col-span-1">
          <PlanCard plan={proPlan} onSelect={handleSelectProPlan} loading={loading} />
        </div>

        {/* Pay-Per-Report */}
        <div className="lg:col-span-2">
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h3 className="text-2xl font-bold text-light-text">Pay-Per-Report Pricing</h3>
            <p className="text-medium-text mt-2">
              Only need one report? Choose an inspection type below to get started. Prices are a one-time fee.
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(reportPricing).map(([type, details]) => (
                <button
                  key={type}
                  onClick={() => handleSelectReport(type, details.price)}
                  disabled={loading}
                  className={`bg-dark-bg p-4 rounded-md border transition-colors text-left ${
                    loading
                      ? 'border-dark-border cursor-not-allowed opacity-50'
                      : 'border-dark-border hover:border-primary'
                  }`}
                >
                  <p className="font-semibold text-light-text">{type}</p>
                  <p className="text-lg font-bold text-primary">${details.price.toFixed(2)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
