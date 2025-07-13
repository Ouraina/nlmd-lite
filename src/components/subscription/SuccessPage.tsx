import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Star, Loader } from 'lucide-react';

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

  useEffect(() => {
    // Clear any stored checkout data
    localStorage.removeItem('pendingCheckout');
    
    // Show loading briefly, then confirm payment
    const timer = setTimeout(() => {
      setIsPaymentConfirmed(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state first
  if (!isPaymentConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Confirming Payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            🎉 Welcome to NotebookLM Directory!
          </h1>
          <p className="text-xl text-gray-300">
            Your payment was successful! You now have access to all premium features.
          </p>
        </div>

        {/* Features Unlocked */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <Star className="w-6 h-6 text-yellow-400 mr-2" />
            Features Now Active
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-white font-medium">Unlimited Notebook Discovery</h3>
                <p className="text-gray-400 text-sm">Search and explore endless AI-powered notebooks</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-white font-medium">AI-Powered Recommendations</h3>
                <p className="text-gray-400 text-sm">Get personalized notebook suggestions</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-white font-medium">Carbon Impact Dashboard</h3>
                <p className="text-gray-400 text-sm">Track your environmental contribution</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-white font-medium">Priority Support</h3>
                <p className="text-gray-400 text-sm">Get help when you need it most</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-white font-medium">Exclusive Founders Badge</h3>
                <p className="text-gray-400 text-sm">Show your pioneer status</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-white font-medium">Future PRO Features</h3>
                <p className="text-gray-400 text-sm">Access to all upcoming premium tools</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
          >
            Start Exploring
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
          
          <button
            onClick={() => navigate('/pricing')}
            className="flex items-center justify-center px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
          >
            View Plan Details
          </button>
        </div>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Need help? Contact us at{' '}
            <a href="mailto:support@notebooklm.directory" className="text-green-400 hover:text-green-300">
              support@notebooklm.directory
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}