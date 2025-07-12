import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Star, Mail, Clock } from 'lucide-react';
import { getProductByPriceId } from '../../stripe-config';

export const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  
  const isTempSignup = searchParams.get('temp_signup') === 'true';
  const planId = searchParams.get('plan');
  const selectedPlan = planId ? getProductByPriceId(planId) : null;

  useEffect(() => {
    // Clear any checkout-related data from localStorage if needed
    localStorage.removeItem('checkout-session-id');
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // TODO: Send email to your backend/database for early access list
      console.log('Early access signup:', { email, plan: selectedPlan?.name });
      setEmailSubmitted(true);
    }
  };

  if (isTempSignup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-lg text-center">
          <div className="mb-8">
            <div className="relative">
              <Star className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <Clock className="w-8 h-8 text-amber-500 absolute top-0 right-1/2 transform translate-x-8 -translate-y-2" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Thanks for Your Interest!
            </h1>
            <p className="text-slate-600 leading-relaxed mb-4">
              You've selected the <strong className="text-green-600">{selectedPlan?.name || 'Premium Plan'}</strong>! 
              We're putting the finishing touches on our payment system.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-semibold">
                🚀 Early Access Available Now!
              </p>
              <p className="text-green-700 text-sm mt-1">
                Join our early access list and get notified the moment payments go live. 
                Plus, early supporters get exclusive perks!
              </p>
            </div>
          </div>

          {!emailSubmitted ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4 mb-6">
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="email"
                    placeholder="Enter your email for early access"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Join List
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-semibold">You're on the list!</p>
              <p className="text-green-700 text-sm">
                We'll email you the moment payments go live. Thanks for being an early supporter!
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Link
              to="/dashboard"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Explore the Directory
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link
              to="/"
              className="w-full bg-slate-100 text-slate-700 py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Back to Home
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Building the "Ecosystem for Human Thought" 🧠✨<br />
              Payment processing will be ready very soon!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Original success page for when payments are working
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-md text-center">
        <div className="mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-slate-600 leading-relaxed">
            Thank you for your purchase. Your subscription has been activated and you now have access to all the features included in your plan.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link
            to="/pricing"
            className="w-full bg-slate-100 text-slate-700 py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
          >
            View All Plans
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-700">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};