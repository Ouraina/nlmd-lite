import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';

export default function Header() {
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-2xl font-bold text-white hover:text-green-400 transition-colors"
            >
              NotebookLM Directory
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/discover" 
              className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              Browse
            </Link>
            <Link 
              to="/submit" 
              className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              Submit
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                className="text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Subscription Status */}
                {subscription && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-600 text-white">
                    {subscription.status === 'active' ? 'Pro' : 'Free'}
                  </span>
                )}
                
                {/* User Avatar */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-300">
                    {user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-300 hover:text-red-400 text-sm font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login"
                  className="text-gray-300 hover:text-green-400 text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/signup"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-300 hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}