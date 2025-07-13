import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Star, Mail, Clock } from 'lucide-react';
import { getProductByPriceId } from '../../stripe-config';

export const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const sessionId = searchParams.get('session_id');
  const planId = searchParams.get('plan');
  const selectedPlan = planId ? getProductByPriceId(planId) : null;

  useEffect(() => {
    // Clear any checkout-related data from localStorage if needed
    localStorage.removeItem('checkout-session-id');
  }, []);

  // Security check: Block access without valid Stripe session
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8 w-full max-w-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Invalid Access
          </h1>
          <p className="text-slate-600 mb-6">
            This page can only be accessed after completing a successful payment.
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Pricing
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-lg text-center">
        <div className="mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-slate-600 leading-relaxed mb-4">
            Welcome to <strong className="text-green-600">{selectedPlan?.name || 'Premium Plan'}</strong>! 
            Your subscription is now active and ready to use.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold">
              🎉 You're all set!
            </p>
            <p className="text-green-700 text-sm mt-1">
              Access all premium features, unlimited notebook viewing, and advanced search capabilities.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="w-full bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link
            to="/discover"
            className="w-full bg-slate-100 text-slate-700 py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Explore Notebooks
          </Link>
        </div>
      </div>
    </div>
  );
};