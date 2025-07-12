import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Brain, Target, TrendingUp, BookOpen, Clock, 
  Award, Leaf, Zap, User, Calendar, Globe, Heart, 
  ChevronRight, RefreshCw, Settings, Filter, Star,
  Bookmark, Share2, Eye, ArrowRight, Lightbulb
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { NotebookMetadata } from '../../services/notebookScraperService';

interface AIRecommendation {
  id: string;
  notebook: NotebookMetadata;
  type: 'personalized' | 'trending' | 'similar' | 'sustainable' | 'quality' | 'collaborative';
  confidenceScore: number;
  reasoning: string;
  tags: string[];
  matchScore: number;
  urgency: 'low' | 'medium' | 'high';
  category: string;
  estimatedRelevance: number;
  learningContext?: string;
}

interface UserPreferences {
  interests: string[];
  preferredCategories: string[];
  qualityThreshold: number;
  sustainabilityFocus: boolean;
  institutionPreferences: string[];
  collaborativeFiltering: boolean;
  experimentalFeatures: boolean;
}

type RecommendationType = 'all' | 'personalized' | 'trending' | 'sustainable' | 'quality';

export const RecommendationsPanel: React.FC = () => {
  const { user } = useAuth();
  const { isActive } = useSubscription(user?.id);
  
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<RecommendationType>('all');
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    interests: [],
    preferredCategories: [],
    qualityThreshold: 80,
    sustainabilityFocus: false,
    institutionPreferences: [],
    collaborativeFiltering: true,
    experimentalFeatures: false
  });
  const [bookmarkedNotebooks, setBookmarkedNotebooks] = useState<string[]>([]);
  const [viewedNotebooks, setViewedNotebooks] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const isPremium = isActive() || true; // For demo

  useEffect(() => {
    if (isPremium) {
      loadRecommendations();
    }
  }, [selectedType, userPreferences, isPremium]);

  const loadRecommendations = async () => {
    if (!loading) setRefreshing(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockRecommendations: AIRecommendation[] = [
      {
        id: '1',
        notebook: {
          title: 'Advanced Climate Modeling with Graph Neural Networks',
          description: 'Cutting-edge approach to climate prediction using graph neural networks and satellite data fusion for improved accuracy in long-term forecasting.',
          author: 'Dr. Elena Rodriguez',
          institution: 'MIT Climate Laboratory',
          tags: ['Climate Science', 'Graph Neural Networks', 'Satellite Data', 'Deep Learning'],
          category: 'Research',
          sourceUrl: 'https://example.com/climate-gnn',
          sourcePlatform: 'academic',
          publishedDate: '2024-12-01T00:00:00.000Z',
          qualityScore: 0.95,
          relevanceScore: 0.92,
          estimatedComputeHours: 18.5,
          carbonFootprintGrams: 340,
          energyEfficiencyRating: 'A+'
        },
        type: 'personalized',
        confidenceScore: 0.94,
        reasoning: 'Based on your interest in climate science and machine learning, this notebook combines both areas with cutting-edge techniques.',
        tags: ['High Quality', 'Trending', 'Sustainable'],
        matchScore: 0.92,
        urgency: 'high',
        category: 'Research',
        estimatedRelevance: 0.94,
        learningContext: 'Your recent searches suggest interest in environmental AI applications'
      },
      {
        id: '2',
        notebook: {
          title: 'Sustainable AI for Medical Diagnostics',
          description: 'Energy-efficient deep learning models for medical image analysis with focus on reducing computational costs while maintaining diagnostic accuracy.',
          author: 'Prof. Sarah Kim',
          institution: 'Stanford Medical AI Lab',
          tags: ['Medical AI', 'Sustainable Computing', 'Image Analysis', 'Healthcare'],
          category: 'Healthcare',
          sourceUrl: 'https://example.com/sustainable-medical-ai',
          sourcePlatform: 'medical',
          publishedDate: '2024-11-28T00:00:00.000Z',
          qualityScore: 0.91,
          relevanceScore: 0.88,
          estimatedComputeHours: 12.3,
          carbonFootprintGrams: 220,
          energyEfficiencyRating: 'A+'
        },
        type: 'sustainable',
        confidenceScore: 0.88,
        reasoning: 'Perfect match for your sustainability focus and interest in healthcare applications.',
        tags: ['Sustainable', 'Healthcare', 'Efficient'],
        matchScore: 0.88,
        urgency: 'medium',
        category: 'Healthcare',
        estimatedRelevance: 0.89
      },
      {
        id: '3',
        notebook: {
          title: 'Collaborative Learning in Educational AI Systems',
          description: 'Novel approach to personalized education through collaborative filtering and adaptive learning algorithms.',
          author: 'Dr. Michael Chen',
          institution: 'Carnegie Mellon Education Tech',
          tags: ['Education', 'Collaborative Filtering', 'Adaptive Learning', 'AI'],
          category: 'Education',
          sourceUrl: 'https://example.com/collaborative-education',
          sourcePlatform: 'educational',
          publishedDate: '2024-11-25T00:00:00.000Z',
          qualityScore: 0.87,
          relevanceScore: 0.85,
          estimatedComputeHours: 15.7,
          carbonFootprintGrams: 290,
          energyEfficiencyRating: 'A'
        },
        type: 'collaborative',
        confidenceScore: 0.86,
        reasoning: 'Recommended by users with similar research interests and browsing patterns.',
        tags: ['Collaborative', 'Education', 'Trending'],
        matchScore: 0.85,
        urgency: 'medium',
        category: 'Education',
        estimatedRelevance: 0.86
      },
      {
        id: '4',
        notebook: {
          title: 'Quantum-Enhanced Natural Language Processing',
          description: 'Exploring quantum computing applications in NLP for improved semantic understanding and processing efficiency.',
          author: 'Dr. Lisa Zhang',
          institution: 'IBM Quantum Research',
          tags: ['Quantum Computing', 'NLP', 'Semantic Analysis', 'Advanced AI'],
          category: 'Technology',
          sourceUrl: 'https://example.com/quantum-nlp',
          sourcePlatform: 'research',
          publishedDate: '2024-12-08T00:00:00.000Z',
          qualityScore: 0.93,
          relevanceScore: 0.87,
          estimatedComputeHours: 35.2,
          carbonFootprintGrams: 650,
          energyEfficiencyRating: 'B+'
        },
        type: 'trending',
        confidenceScore: 0.91,
        reasoning: 'Trending in your network and represents cutting-edge intersection of quantum computing and AI.',
        tags: ['Cutting Edge', 'Quantum', 'Trending'],
        matchScore: 0.87,
        urgency: 'high',
        category: 'Technology',
        estimatedRelevance: 0.91
      },
      {
        id: '5',
        notebook: {
          title: 'Ethical AI Framework for Decision Support Systems',
          description: 'Comprehensive framework for implementing ethical considerations in AI-driven decision support systems across industries.',
          author: 'Prof. Amanda Johnson',
          institution: 'Oxford AI Ethics Institute',
          tags: ['AI Ethics', 'Decision Support', 'Governance', 'Responsible AI'],
          category: 'Research',
          sourceUrl: 'https://example.com/ethical-ai-framework',
          sourcePlatform: 'academic',
          publishedDate: '2024-11-20T00:00:00.000Z',
          qualityScore: 0.90,
          relevanceScore: 0.83,
          estimatedComputeHours: 8.9,
          carbonFootprintGrams: 160,
          energyEfficiencyRating: 'A+'
        },
        type: 'quality',
        confidenceScore: 0.89,
        reasoning: 'High-quality research that aligns with current industry focus on responsible AI development.',
        tags: ['Ethics', 'High Quality', 'Governance'],
        matchScore: 0.83,
        urgency: 'medium',
        category: 'Research',
        estimatedRelevance: 0.89
      }
    ];

    // Filter based on selected type
    const filteredRecommendations = selectedType === 'all' 
      ? mockRecommendations 
      : mockRecommendations.filter(rec => rec.type === selectedType);

    setRecommendations(filteredRecommendations);
    setLoading(false);
    setRefreshing(false);
  };

  const toggleBookmark = (notebookTitle: string) => {
    setBookmarkedNotebooks(prev =>
      prev.includes(notebookTitle)
        ? prev.filter(id => id !== notebookTitle)
        : [...prev, notebookTitle]
    );
  };

  const markAsViewed = (notebookTitle: string) => {
    setViewedNotebooks(prev =>
      prev.includes(notebookTitle) ? prev : [...prev, notebookTitle]
    );
  };

  const getRecommendationTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'personalized': 'bg-purple-100 text-purple-800',
      'trending': 'bg-orange-100 text-orange-800',
      'sustainable': 'bg-green-100 text-green-800',
      'quality': 'bg-blue-100 text-blue-800',
      'collaborative': 'bg-pink-100 text-pink-800',
      'similar': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: { [key: string]: string } = {
      'high': 'text-red-600',
      'medium': 'text-yellow-600',
      'low': 'text-green-600'
    };
    return colors[urgency] || 'text-gray-600';
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.8) return 'text-blue-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (!isPremium) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">AI-Powered Recommendations</h3>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          Get personalized notebook recommendations powered by advanced AI algorithms that learn from your preferences and research patterns.
        </p>
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-center gap-3 text-sm text-slate-600">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Personalized recommendations</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-sm text-slate-600">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <span>Trending and collaborative filtering</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-sm text-slate-600">
            <Target className="w-4 h-4 text-purple-500" />
            <span>Quality and sustainability focus</span>
          </div>
        </div>
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium">
          Upgrade to Premium
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-2">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">AI Recommendations</h3>
            <p className="text-sm text-slate-600">Personalized notebook discoveries</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={loadRecommendations}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg">
        {[
          { key: 'all', label: 'All', icon: Sparkles },
          { key: 'personalized', label: 'For You', icon: Target },
          { key: 'trending', label: 'Trending', icon: TrendingUp },
          { key: 'sustainable', label: 'Sustainable', icon: Leaf },
          { key: 'quality', label: 'Quality', icon: Award }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedType(key as RecommendationType)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="text-sm font-medium text-slate-900 mb-3">Recommendation Settings</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Quality Threshold</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={userPreferences.qualityThreshold}
                  onChange={(e) => setUserPreferences(prev => ({
                    ...prev,
                    qualityThreshold: parseInt(e.target.value)
                  }))}
                  className="w-24"
                />
                <span className="text-sm text-slate-900 w-8">{userPreferences.qualityThreshold}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Sustainability Focus</span>
              <input
                type="checkbox"
                checked={userPreferences.sustainabilityFocus}
                onChange={(e) => setUserPreferences(prev => ({
                  ...prev,
                  sustainabilityFocus: e.target.checked
                }))}
                className="rounded border-slate-300 text-green-600 focus:ring-green-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Collaborative Filtering</span>
              <input
                type="checkbox"
                checked={userPreferences.collaborativeFiltering}
                onChange={(e) => setUserPreferences(prev => ({
                  ...prev,
                  collaborativeFiltering: e.target.checked
                }))}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Recommendations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-100 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                    </div>
                    <div className="w-16 h-16 bg-slate-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          recommendations.map((rec) => (
            <div key={rec.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRecommendationTypeColor(rec.type)}`}>
                    {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500">Confidence:</span>
                    <span className={`text-xs font-medium ${getConfidenceColor(rec.confidenceScore)}`}>
                      {Math.round(rec.confidenceScore * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500">Urgency:</span>
                    <span className={`text-xs font-medium ${getUrgencyColor(rec.urgency)}`}>
                      {rec.urgency}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleBookmark(rec.notebook.title)}
                    className={`p-1 rounded transition-colors ${
                      bookmarkedNotebooks.includes(rec.notebook.title)
                        ? 'text-red-500 hover:text-red-600'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${bookmarkedNotebooks.includes(rec.notebook.title) ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <h4 className="font-semibold text-slate-900 mb-1 hover:text-purple-600 cursor-pointer transition-colors">
                  {rec.notebook.title}
                </h4>
                <p className="text-sm text-slate-600 line-clamp-2">
                  {rec.notebook.description}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {rec.notebook.author}
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {rec.notebook.institution}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(rec.notebook.publishedDate || '').toLocaleDateString()}
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                  <Lightbulb className="w-3 h-3" />
                  <span className="font-medium">Why this recommendation:</span>
                </div>
                <p className="text-xs text-slate-600 italic">{rec.reasoning}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Quality: {Math.round(rec.notebook.qualityScore * 100)}%
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {rec.notebook.estimatedComputeHours.toFixed(1)}h
                  </div>
                  <div className="flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    {rec.notebook.carbonFootprintGrams}g CO₂
                  </div>
                </div>
                <button
                  onClick={() => markAsViewed(rec.notebook.title)}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium"
                >
                  <Eye className="w-3 h-3" />
                  View Notebook
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Learning Insights */}
             <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
         <div className="flex items-center gap-2 mb-2">
           <Sparkles className="w-4 h-4 text-purple-600" />
           <span className="text-sm font-medium text-purple-800">AI Learning Insights</span>
         </div>
        <p className="text-xs text-purple-700">
          Your recommendations are continuously improving based on your interactions. We've noticed you prefer 
          high-quality research papers with sustainability focus. Keep exploring to get even better suggestions!
        </p>
      </div>
    </div>
  );
};