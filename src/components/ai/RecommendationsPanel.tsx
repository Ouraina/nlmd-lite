import React, { useState, useEffect } from 'react';
import { Sparkles, X, ThumbsUp, Eye, Import, Leaf, Star } from 'lucide-react';
import { AIRecommendationService, Recommendation } from '../../services/aiRecommendationService';
import { useAuth } from '../../hooks/useAuth';

export const RecommendationsPanel: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Try to get existing recommendations first
      let recs = await AIRecommendationService.getRecommendations(user.id, 8);
      
      // If no recent recommendations, generate new ones
      if (recs.length === 0) {
        recs = await AIRecommendationService.generateRecommendations(user.id, 8);
      }
      
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationClick = async (rec: Recommendation) => {
    await AIRecommendationService.markRecommendationClicked(rec.id);
    await AIRecommendationService.trackInteraction(user!.id, {
      notebookId: rec.notebookId,
      interactionType: 'view'
    });
    
    // Open notebook in new tab
    if (rec.notebook?.notebook_url) {
      window.open(rec.notebook.notebook_url, '_blank');
    }
  };

  const handleDismiss = async (rec: Recommendation) => {
    await AIRecommendationService.dismissRecommendation(rec.id);
    setRecommendations(prev => prev.filter(r => r.id !== rec.id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'similar_content':
        return <Star className="w-4 h-4 text-blue-500" />;
      case 'sustainable_alternative':
        return <Leaf className="w-4 h-4 text-green-500" />;
      case 'trending':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'personalized':
        return <ThumbsUp className="w-4 h-4 text-orange-500" />;
      default:
        return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'similar_content':
        return 'Similar Content';
      case 'sustainable_alternative':
        return 'Eco-Friendly';
      case 'trending':
        return 'Trending';
      case 'personalized':
        return 'For You';
      default:
        return 'Recommended';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">AI Recommendations</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">AI Recommendations</h3>
        </div>
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No recommendations available yet.</p>
          <p className="text-sm text-slate-500 mt-1">
            Interact with some notebooks to get personalized suggestions!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">AI Recommendations</h3>
        </div>
        <button
          onClick={loadRecommendations}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getTypeIcon(rec.type)}
                <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                  {getTypeLabel(rec.type)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(rec.confidenceScore)}`}>
                  {Math.round(rec.confidenceScore * 100)}% match
                </span>
                <button
                  onClick={() => handleDismiss(rec)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h4 className="font-medium text-slate-900 mb-2 line-clamp-2">
              {rec.notebook?.title || 'Recommended Notebook'}
            </h4>

            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
              {rec.reasoning}
            </p>

            {rec.notebook && (
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span>by {rec.notebook.author}</span>
                <div className="flex items-center gap-3">
                  {rec.notebook.quality_score && (
                    <span>Quality: {Math.round(rec.notebook.quality_score * 100)}%</span>
                  )}
                  {rec.notebook.carbon_footprint_grams && (
                    <span>CO₂: {Math.round(rec.notebook.carbon_footprint_grams)}g</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRecommendationClick(rec)}
                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Eye className="w-3 h-3" />
                View
              </button>
              
              {rec.notebook && (
                <button
                  onClick={() => {
                    // Handle import logic here
                    console.log('Import notebook:', rec.notebook);
                  }}
                  className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Import className="w-3 h-3" />
                  Import
                </button>
              )}

              <button
                onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                className="text-slate-600 hover:text-slate-800 text-sm"
              >
                {expandedRec === rec.id ? 'Less' : 'More'}
              </button>
            </div>

            {expandedRec === rec.id && rec.notebook && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-700 mb-3">
                  {rec.notebook.description}
                </p>
                
                {rec.notebook.tags && rec.notebook.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rec.notebook.tags.slice(0, 5).map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          Recommendations are personalized based on your activity and preferences
        </p>
      </div>
    </div>
  );
};