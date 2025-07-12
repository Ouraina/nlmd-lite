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
            <span className="inline-block bg-green-500/10 text-green-500 px-4 py-1 rounded-full font-semibold text-sm mb-2">Founders Forever Launch Special</span><br />
            <span className="font-bold text-green-700">Subscribe & Support — Get PRO features for life, no price increases, ever.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {STRIPE_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-2xl shadow-xl border-2 p-8 relative ${
                product.name === 'Standard Plan'
                  ? 'border-green-500 transform scale-105'
                  : 'border-slate-200'
              }`}
            >
              {product.foundersSpecial && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 animate-pulse border-2 border-green-300 shadow">
                    <Star className="w-4 h-4" />
                    Founders Forever
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
                className={`w-full py-3 px-6 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg ${
                  product.foundersSpecial
                    ? 'bg-green-500 text-black hover:bg-green-400 border-2 border-green-400'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                } disabled:opacity-50 disabled:cursor-not-allowed animate-bounce`}
              >
                {loading === product.priceId ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  product.foundersSpecial ? 'Subscribe & Support — Founders Forever' : `Get ${product.name}`
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-green-700 font-bold text-lg">
            Early supporters get a Founders badge and lifetime PRO access. All plans include a 30-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </div>
  );
};