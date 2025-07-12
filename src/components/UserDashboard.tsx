import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Users, TrendingUp, Leaf, Star, Search, Filter, Eye, Heart, Share2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { Link } from 'react-router-dom';

// Mock data for demonstration
const featuredNotebooks = [
  {
    id: '1',
    title: 'Climate Change Research Assistant',
    description: 'AI-powered analysis of climate data and research papers',
    category: 'Research',
    tags: ['Climate', 'AI', 'Research'],
    views: 2400,
    likes: 156,
    author: 'Dr. Sarah Chen',
    environmentalImpact: 'Low',
    qualityScore: 92
  },
  {
    id: '2',
    title: 'Creative Writing Workshop',
    description: 'Interactive AI assistant for creative writing and storytelling',
    category: 'Creative',
    tags: ['Writing', 'Creative', 'AI'],
    views: 1800,
    likes: 203,
    author: 'Alex Rivera',
    environmentalImpact: 'Very Low',
    qualityScore: 88
  },
  {
    id: '3',
    title: 'Financial Planning Optimizer',
    description: 'Personal finance management with AI-driven insights',
    category: 'Finance',
    tags: ['Finance', 'Personal', 'Planning'],
    views: 3200,
    likes: 287,
    author: 'Michael Thompson',
    environmentalImpact: 'Low',
    qualityScore: 95
  }
];

const recentActivity = [
  {
    id: '1',
    action: 'viewed',
    notebook: 'Machine Learning Basics',
    time: '2 hours ago',
    icon: Eye
  },
  {
    id: '2',
    action: 'liked',
    notebook: 'Data Science Workflow',
    time: '1 day ago',
    icon: Heart
  },
  {
    id: '3',
    action: 'shared',
    notebook: 'Python for Beginners',
    time: '2 days ago',
    icon: Share2
  }
];

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getSubscriptionPlan, isActive } = useSubscription(user?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const subscriptionPlan = getSubscriptionPlan();
  const isSubscribed = isActive();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {user?.email?.split('@')[0] || 'Explorer'}! 👋
              </h1>
              <p className="text-slate-600 mt-2">
                Discover amazing notebooks and accelerate your projects
              </p>
              {isSubscribed && (
                <div className="flex items-center gap-2 mt-4">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Founders Forever
                  </div>
                  <span className="text-slate-500 text-sm">Thank you for supporting our mission!</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-slate-600">Notebooks Discovered</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Notebooks Viewed</p>
                <p className="text-2xl font-bold text-slate-900">24</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Favorites</p>
                <p className="text-2xl font-bold text-red-600">8</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Recommendations</p>
                <p className="text-2xl font-bold text-purple-600">6</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Impact Score</p>
                <p className="text-2xl font-bold text-green-600">92</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Discover */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Discover Notebooks</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notebooks, topics, or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="research">Research</option>
              <option value="creative">Creative</option>
              <option value="business">Business</option>
              <option value="education">Education</option>
              <option value="personal">Personal</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredNotebooks.map((notebook) => (
              <div key={notebook.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    {notebook.category}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Eye className="w-4 h-4" />
                    {notebook.views.toLocaleString()}
                  </div>
                </div>
                
                <h3 className="font-bold text-slate-900 mb-2">{notebook.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{notebook.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {notebook.tags.map((tag) => (
                    <span key={tag} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-slate-600">{notebook.likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">{notebook.environmentalImpact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <activity.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      You <span className="font-medium">{activity.action}</span> {activity.notebook}
                    </p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link
                to="/notebook-discovery"
                className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <BookOpen className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-slate-900">Explore Notebooks</p>
                  <p className="text-sm text-slate-600">Discover new and trending notebooks</p>
                </div>
              </Link>

              <Link
                to="/recommendations"
                className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Sparkles className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-medium text-slate-900">AI Recommendations</p>
                  <p className="text-sm text-slate-600">Get personalized notebook suggestions</p>
                </div>
              </Link>

              <Link
                to="/teams"
                className="flex items-center gap-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Users className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-slate-900">Team Collaboration</p>
                  <p className="text-sm text-slate-600">Work together on projects</p>
                </div>
              </Link>

              <Link
                to="/analytics"
                className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <TrendingUp className="w-6 h-6 text-orange-600" />
                <div>
                  <p className="font-medium text-slate-900">Analytics</p>
                  <p className="text-sm text-slate-600">Track your usage and impact</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 