import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { LogOut, User, Crown, Database, BookOpen } from 'lucide-react';

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
    <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white">
          notebooklm.directory
        </Link>

        {user && (
          <nav className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/dashboard'
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/notebook-discovery"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/notebook-discovery'
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
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
                <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                  <Crown className="w-4 h-4" />
                  {subscriptionPlan.name}
                </div>
              )}
              
              <div className="flex items-center gap-2 text-slate-300">
                <User className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              
              <Link
                to="/pricing"
                className="text-green-400 hover:text-green-300 text-sm font-medium"
              >
                Pricing
              </Link>
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-slate-300 hover:text-white text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-green-500 text-black px-4 py-2 rounded-lg hover:bg-green-400 text-sm font-medium"
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