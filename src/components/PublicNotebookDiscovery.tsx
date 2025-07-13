import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Star, 
  Eye, 
  BookOpen, 
  TrendingUp, 
  Award,
  Heart,
  Share2,
  Bookmark,
  Play,
  MessageCircle,
  FileText,
  Users,
  Globe,
  Zap,
  Target,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { PublicNotebookDiscoveryService, PublicNotebook } from '../services/publicNotebookDiscoveryService';
import { NotebookViewer } from './NotebookViewer';

export const PublicNotebookDiscovery: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [notebooks, setNotebooks] = useState<PublicNotebook[]>([]);
  const [featuredNotebooks, setFeaturedNotebooks] = useState<PublicNotebook[]>([]);
  const [trendingNotebooks, setTrendingNotebooks] = useState<PublicNotebook[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedNotebook, setSelectedNotebook] = useState<PublicNotebook | null>(null);
  const [showNotebookViewer, setShowNotebookViewer] = useState(false);
  const [analytics, setAnalytics] = useState({
    total_notebooks: 0,
    verified_notebooks: 0,
    featured_notebooks: 0,
    total_views: 0,
    categories: {}
  });

  const categories = [
    'Academic Research',
    'Business Analysis', 
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Sports',
    'Environmental',
    'Legal',
    'Creative'
  ];

  // Initialize search from URL parameters
  useEffect(() => {
    const urlSearchQuery = searchParams.get('search');
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [searchParams]);

  // Auto-search when URL has search parameter
  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      loadInitialData();
    }
  }, [searchQuery]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [discovered, featured, trending, stats] = await Promise.all([
        PublicNotebookDiscoveryService.discoverPublicNotebooks(),
        PublicNotebookDiscoveryService.getFeaturedNotebooks(),
        PublicNotebookDiscoveryService.getTrendingNotebooks(),
        PublicNotebookDiscoveryService.getDiscoveryAnalytics()
      ]);
      
      console.log('🚀 Initial data loaded:', {
        discovered: discovered.length,
        featured: featured.length,
        trending: trending.length,
        discoveredTitles: discovered.map(n => n.title)
      });
      
      setNotebooks(discovered);
      setFeaturedNotebooks(featured);
      setTrendingNotebooks(trending);
      setAnalytics(stats);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      // If no search query and no category, load all notebooks
      if (!searchQuery.trim() && !selectedCategory) {
        const allNotebooks = await PublicNotebookDiscoveryService.discoverPublicNotebooks();
        console.log('Loading all notebooks:', allNotebooks.length);
        setNotebooks(allNotebooks);
      } else {
        const results = await PublicNotebookDiscoveryService.searchPublicNotebooks(
          searchQuery,
          { category: selectedCategory || undefined }
        );
        console.log('Search results for:', searchQuery, 'Category:', selectedCategory, 'Results:', results.length, results.map(r => r.title));
        setNotebooks(results);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setSearchQuery('');
    setSelectedCategory('');
    try {
      await loadInitialData();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num > 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const handleNotebookClick = (notebook: PublicNotebook) => {
    // For demo content, show the modal with warning
    if (notebook.title.includes('[DEMO]') || notebook.tags.includes('DEMO')) {
      setSelectedNotebook(notebook);
      setShowNotebookViewer(true);
      return;
    }
    
    // For real content (like NFL Draft), go directly to NotebookLM - NO BARRIERS!
    console.log('🚀 Opening real NotebookLM link directly:', notebook.public_url);
    window.open(notebook.public_url, '_blank');
  };

  const handleCloseViewer = () => {
    setShowNotebookViewer(false);
    setSelectedNotebook(null);
  };

  const getInteractionBadges = (features: PublicNotebook['interaction_features']) => {
    const badges = [];
    if (features.has_audio_overview) badges.push({ icon: Play, label: 'Audio Overview', color: 'bg-blue-500/20 text-blue-400' });
    if (features.has_faq) badges.push({ icon: MessageCircle, label: 'FAQ', color: 'bg-green-500/20 text-green-400' });
    if (features.has_briefing_docs) badges.push({ icon: FileText, label: 'Briefing Docs', color: 'bg-purple-500/20 text-purple-400' });
    if (features.allows_questions) badges.push({ icon: Users, label: 'Q&A', color: 'bg-orange-500/20 text-orange-400' });
    return badges;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] to-[#181f2e] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            <span>World's First Public NLM Discovery Engine</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Discover <span className="text-green-400">Public NLMs</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Explore publicly shared NLM research with interactive features like audio overviews, 
            FAQs, briefing documents, and Q&A capabilities. Find, share, and collaborate on cutting-edge research.
          </p>
          
          {/* Key Stats - ACCURATE NUMBERS ONLY */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{analytics.total_notebooks}</div>
              <div className="text-sm text-slate-400">Public NLMs</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{formatNumber(analytics.total_views)}</div>
              <div className="text-sm text-slate-400">Unique Views</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">{analytics.verified_notebooks}</div>
              <div className="text-sm text-slate-400">Verified</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{analytics.featured_notebooks}</div>
              <div className="text-sm text-slate-400">Featured</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-3 flex-1">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-green-500 text-black px-4 py-3 rounded-lg hover:bg-green-400 disabled:bg-green-600 font-medium flex items-center gap-2 shrink-0"
                title="Refresh notebooks"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                                  onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="Search public NLMs by topic, author, or keywords..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                />
              </div>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-green-500 text-black px-6 py-3 rounded-lg hover:bg-green-400 disabled:bg-green-600 font-medium flex items-center gap-2"
            >
              <Target className="w-5 h-5" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Featured Notebooks */}
        {featuredNotebooks.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold">Featured Research</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredNotebooks.map((notebook) => (
                <div key={notebook.id} className="bg-slate-800/50 rounded-xl border border-yellow-500/30 p-6 hover:border-yellow-500/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-medium">FEATURED</span>
                      <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">{notebook.category}</span>
                      {(notebook.title.includes('[DEMO]') || notebook.tags.includes('DEMO')) && (
                        <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-medium">DEMO</span>
                      )}
                    </div>
                    <div className="text-right text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{notebook.discovery_metadata.quality_score.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2 text-white">{notebook.title}</h3>
                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">{notebook.description}</p>
                  
                  {notebook.author_name && (
                    <div className="text-sm text-slate-400 mb-4">
                      by {notebook.author_name}
                      {notebook.author_institution && (
                        <span className="text-slate-500"> • {notebook.author_institution}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {getInteractionBadges(notebook.interaction_features).map((badge, index) => {
                      const BadgeIcon = badge.icon;
                      return (
                        <div key={index} className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${badge.color}`}>
                          <BadgeIcon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{formatNumber(notebook.community_metrics.view_count)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{formatNumber(notebook.community_metrics.like_count)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bookmark className="w-4 h-4" />
                        <span>{formatNumber(notebook.community_metrics.bookmark_count)}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleNotebookClick(notebook)}
                      className="bg-green-500 text-black px-4 py-2 rounded-lg hover:bg-green-400 font-medium flex items-center gap-2 text-sm"
                    >
                      <span>Explore</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Notebook Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold">
                {searchQuery || selectedCategory ? 'Search Results' : 'Discover Public NLMs'}
              </h2>
            </div>
            {notebooks.length > 0 && (
              <div className="text-sm text-slate-400">
                {notebooks.length} NLM{notebooks.length !== 1 ? 's' : ''} found
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <div className="text-slate-400">Discovering public NLMs...</div>
            </div>
          ) : notebooks.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/30 rounded-lg">
              <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No NLMs found</h3>
              <p className="text-slate-500">Try adjusting your search terms or browse different categories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notebooks.map((notebook) => (
                <div key={notebook.id} className="bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs font-medium">
                          {notebook.category}
                        </span>
                        {(notebook.title.includes('[DEMO]') || notebook.tags.includes('DEMO')) && (
                          <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-medium">DEMO</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{notebook.discovery_metadata.quality_score.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 text-white line-clamp-2">
                      {notebook.title}
                    </h3>
                    
                    <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                      {notebook.description}
                    </p>
                    
                    {notebook.author_name && (
                      <div className="text-xs text-slate-400 mb-3">
                        by {notebook.author_name}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {notebook.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                      {notebook.tags.length > 3 && (
                        <span className="text-slate-400 text-xs px-2 py-1">
                          +{notebook.tags.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {getInteractionBadges(notebook.interaction_features).slice(0, 2).map((badge, index) => {
                        const BadgeIcon = badge.icon;
                        return (
                          <div key={index} className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${badge.color}`}>
                            <BadgeIcon className="w-3 h-3" />
                            <span>{badge.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 bg-slate-700/30 border-t border-slate-600 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatNumber(notebook.community_metrics.view_count)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{formatNumber(notebook.community_metrics.like_count)}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleNotebookClick(notebook)}
                      className="bg-green-500 text-black px-3 py-1 rounded text-sm font-medium hover:bg-green-400 flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-8 text-center border border-green-500/30">
          <Zap className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Share Your Public Research</h3>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Have a public NLM notebook? Add it to our directory and help build the world's largest 
            collection of discoverable research. Get visibility and connect with fellow researchers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/submit"
              className="bg-green-500 text-black px-6 py-3 rounded-lg hover:bg-green-400 font-medium flex items-center gap-2"
            >
              <span>Submit Your NLM</span>
              <ExternalLink className="w-5 h-5" />
            </a>
            <a
              href="/validate"
              className="bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-600 font-medium flex items-center gap-2"
            >
              <Target className="w-5 h-5" />
              <span>Help Validate & Earn Points</span>
            </a>
          </div>
        </div>

        {/* Notebook Viewer Modal */}
        {selectedNotebook && (
          <NotebookViewer
            notebook={selectedNotebook}
            isOpen={showNotebookViewer}
            onClose={handleCloseViewer}
          />
        )}
      </div>
    </div>
  );
}; 