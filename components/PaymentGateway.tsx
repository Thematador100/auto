import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '../services/stripeService';
import { getStripePublishableKey } from '../config';

interface PaymentGatewayProps {
  amount: number;
  clientSecret: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

const CheckoutForm: React.FC<PaymentGatewayProps> = ({ amount, clientSecret, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment-success',
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        onError?.(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess?.(paymentIntent.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setErrorMessage(message);
      onError?.(message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-dark-bg p-4 rounded-md">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="bg-red-900/20 border border-red-500 rounded-md p-3">
          <p className="text-red-400 text-sm">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-3 px-4 rounded-md font-semibold transition-colors ${
          !stripe || processing
            ? 'bg-gray-600 cursor-not-allowed text-gray-400'
            : 'bg-primary hover:bg-blue-600 text-white'
        }`}
      >
        {processing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
      </button>
    </form>
  );
};

const PaymentGateway: React.FC<PaymentGatewayProps> = (props) => {
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof getStripe> | null>(null);
  const hasStripeKey = !!getStripePublishableKey();

  useEffect(() => {
    if (hasStripeKey) {
      setStripePromise(getStripe());
    }
  }, [hasStripeKey]);

  if (!hasStripeKey) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h3 className="text-2xl font-bold text-light-text">Payment Configuration Required</h3>
        <div className="mt-4 bg-yellow-900/20 border border-yellow-500 rounded-md p-4">
          <p className="text-yellow-400">
            Stripe payment processing is not configured. Please configure your Stripe API keys in the admin settings to
            enable payments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <h3 className="text-2xl font-bold text-light-text mb-4">Complete Your Purchase</h3>
      {stripePromise && props.clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: props.clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#357ABD',
                colorBackground: '#1E1E1E',
                colorText: '#EAEAEA',
                colorDanger: '#df1b41',
                fontFamily: 'system-ui, sans-serif',
                borderRadius: '8px',
              },
            },
          }}
        >
          <CheckoutForm {...props} />
        </Elements>
      )}
    </div>
  );
};

export default PaymentGateway;
