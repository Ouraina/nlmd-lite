import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import { Loader, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (resetMode) {
        // Handle password reset
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) {
          setError(error.message);
        } else {
          setResetSent(true);
        }
      } else {
        // Handle login
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brandGray flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          {resetMode ? (
            <>
              <h1 className="text-3xl font-bold text-white">Reset Password</h1>
              <p className="text-brandSlate">Enter your email to receive a reset link</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
              <p className="text-brandSlate">Sign in to your account to continue</p>
            </>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {resetSent && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-lg flex items-center gap-3">
            <Mail className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-300 text-sm">
              Password reset email sent! Check your inbox and follow the link to reset your password.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {resetMode && (
            <button
              type="button"
              onClick={() => {
                setResetMode(false);
                setResetSent(false);
                setError(null);
              }}
              className="mb-4 flex items-center gap-2 text-brandSlate hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brandSlate" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-brandGreen focus:border-transparent transition-colors placeholder-gray-400"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {!resetMode && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brandSlate" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-brandGreen focus:border-transparent transition-colors placeholder-gray-400"
                  placeholder="Enter your password"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || resetSent}
            className="w-full bg-brandGreen text-black py-3 px-4 rounded-xl hover:bg-brandGreenDark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                {resetMode ? 'Sending Reset Email...' : 'Signing In...'}
              </>
            ) : (
              resetMode ? 'Send Reset Email' : 'Sign In'
            )}
          </button>

          {!resetMode && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setResetMode(true);
                  setError(null);
                }}
                className="text-brandGreen hover:text-brandGreenDark text-sm font-medium transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-brandSlate">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brandGreen hover:text-brandGreenDark font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};