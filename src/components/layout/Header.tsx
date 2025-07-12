import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { LogOut, User, Crown, Database, BookOpen, Sparkles, Users, BarChart3, Shield, TestTube } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { getSubscriptionPlan, isActive } = useSubscription(user?.id);
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const subscriptionPlan = getSubscriptionPlan();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-slate-900">
          NLMD Lite
        </Link>

        {user && (
          <nav className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/notebook-discovery"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/notebook-discovery'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Discovery
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {subscriptionPlan && isActive() && (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  <Crown className="w-4 h-4" />
                  {subscriptionPlan.name}
                </div>
              )}
              
              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              
              <Link
                to="/pricing"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Pricing
              </Link>
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-slate-600 hover:text-slate-900 text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};