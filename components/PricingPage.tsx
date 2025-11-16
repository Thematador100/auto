// PricingPage.tsx - Subscription pricing and management
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PRICING_PLANS, redirectToCheckout, getSubscription, cancelSubscription, reactivateSubscription, getInvoices } from '../services/paymentService';
import { Subscription, Invoice } from '../types';
import toast from 'react-hot-toast';

export const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscription();
      loadInvoices();
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;
    const sub = await getSubscription(user.id);
    setSubscription(sub);
  };

  const loadInvoices = async () => {
    if (!user) return;
    const inv = await getInvoices(user.id);
    setInvoices(inv);
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error('Please login to subscribe');
      return;
    }

    setLoading(true);
    try {
      await redirectToCheckout(planId, user.id);
      await loadSubscription();
      toast.success('Subscription activated successfully!');
    } catch (error) {
      toast.error('Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || !subscription) return;

    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      await cancelSubscription(user.id);
      await loadSubscription();
      toast.success('Subscription will be canceled at the end of the billing period');
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const handleReactivateSubscription = async () => {
    if (!user) return;

    try {
      await reactivateSubscription(user.id);
      await loadSubscription();
      toast.success('Subscription reactivated!');
    } catch (error) {
      toast.error('Failed to reactivate subscription');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Select the perfect plan for your vehicle inspection needs. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>
      </div>

      {/* Current Subscription */}
      {subscription && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Current Plan: {subscription.plan.displayName}</h3>
                <p className="text-gray-400 text-sm">
                  Status: <span className={`font-medium ${
                    subscription.status === 'active' ? 'text-green-400' :
                    subscription.status === 'trialing' ? 'text-blue-400' :
                    'text-red-400'
                  }`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </p>
                <p className="text-gray-400 text-sm">
                  {subscription.cancelAtPeriodEnd
                    ? `Cancels on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                  }
                </p>
              </div>
              <div className="flex space-x-3">
                {subscription.cancelAtPeriodEnd ? (
                  <button
                    onClick={handleReactivateSubscription}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                  >
                    Reactivate
                  </button>
                ) : (
                  <button
                    onClick={handleCancelSubscription}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                  >
                    Cancel Subscription
                  </button>
                )}
                <button
                  onClick={() => setShowInvoices(!showInvoices)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition"
                >
                  {showInvoices ? 'Hide' : 'View'} Invoices
                </button>
              </div>
            </div>

            {/* Invoices */}
            {showInvoices && (
              <div className="mt-6 border-t border-slate-700 pt-6">
                <h4 className="font-semibold text-white mb-4">Billing History</h4>
                <div className="space-y-3">
                  {invoices.map(invoice => (
                    <div key={invoice.id} className="flex items-center justify-between bg-slate-900 p-4 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{invoice.description}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(invoice.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          invoice.status === 'paid' ? 'bg-green-900 text-green-200' :
                          invoice.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                          'bg-red-900 text-red-200'
                        }`}>
                          {invoice.status.toUpperCase()}
                        </span>
                        <span className="text-white font-semibold">
                          ${invoice.amount.toFixed(2)}
                        </span>
                        {invoice.invoiceUrl && (
                          <a
                            href={invoice.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-slate-800 rounded-2xl border ${
                plan.isPopular
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105'
                  : 'border-slate-700'
              } p-8 flex flex-col`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.displayName}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-white">{plan.priceDisplay}</span>
                  <span className="text-gray-400 ml-2">/{plan.interval}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading || (subscription?.plan.id === plan.id && subscription.status === 'active')}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  plan.isPopular
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg'
                    : subscription?.plan.id === plan.id && subscription.status === 'active'
                    ? 'bg-slate-700 text-gray-400 cursor-not-allowed'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {subscription?.plan.id === plan.id && subscription.status === 'active'
                  ? 'Current Plan'
                  : plan.price === 0
                  ? 'Get Started Free'
                  : 'Subscribe Now'
                }
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                q: 'Can I change my plan later?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, MasterCard, American Express) and ACH transfers.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes, all paid plans include a 14-day free trial. No credit card required to start.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Absolutely! You can cancel your subscription at any time. Your access continues until the end of your billing period.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
