import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader, Star } from 'lucide-react';
import { STRIPE_PRODUCTS } from '../../stripe-config';
import { createCheckoutSession } from '../../services/stripeService';
import { useAuth } from '../../hooks/useAuth';

export const PricingPage: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async (priceId: string, mode: 'subscription' | 'payment') => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(priceId);
    try {
      const { url } = await createCheckoutSession({
        priceId,
        mode,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/pricing`,
      });

      window.location.href = url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      setLoading(null);
    }
  };

  const getFeatures = (productName: string) => {
    switch (productName) {
      case 'Explorer':
        return [
          'Basic access to notebook library',
          'Limited notebook viewing',
          'Community support',
          'Basic environmental tracking'
        ];
      case 'Standard Plan':
        return [
          'Full access to notebook library',
          'Unlimited notebook viewing',
          'Upload your own notebooks',
          'Advanced environmental tracking',
          'Priority support',
          'Export capabilities'
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Select the perfect plan for your needs and start your journey with our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {STRIPE_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-2xl shadow-xl border-2 p-8 relative ${
                product.name === 'Standard Plan'
                  ? 'border-blue-500 transform scale-105'
                  : 'border-slate-200'
              }`}
            >
              {product.name === 'Standard Plan' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {product.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-slate-900">
                    ${product.price}
                  </span>
                  {product.mode === 'subscription' && (
                    <span className="text-slate-600">/month</span>
                  )}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {getFeatures(product.name).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(product.priceId, product.mode)}
                disabled={loading === product.priceId}
                className={`w-full py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                  product.name === 'Standard Plan'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === product.priceId ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Get ${product.name}`
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-600">
            All plans include a 30-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </div>
  );
};