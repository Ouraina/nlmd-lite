import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Sparkles, Users, TrendingUp, Leaf, Star, Search, Filter, 
  Eye, Heart, Share2, Grid3X3, Table, BarChart3, Clock, Award, 
  Bookmark, Download, Settings, ChevronDown, SlidersHorizontal,
  Zap, Globe, Atom, Brain, Target, Layers, Calendar, User, ExternalLink
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { Link } from 'react-router-dom';
import { NotebookScraperService, NotebookMetadata } from '../services/notebookScraperService';

interface FilterState {
  categories: string[];
  tags: string[];
  qualityRange: [number, number];
  computeRange: [number, number];
  carbonRange: [number, number];
  efficiencyRatings: string[];
  dateRange: string;
  institutions: string[];
  authors: string[];
}

interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

type ViewMode = 'grid' | 'table' | 'detailed';

const sortOptions: SortOption[] = [
  { field: 'relevance', direction: 'desc', label: 'Most Relevant' },
  { field: 'qualityScore', direction: 'desc', label: 'Highest Quality' },
  { field: 'publishedDate', direction: 'desc', label: 'Most Recent' },
  { field: 'carbonFootprintGrams', direction: 'asc', label: 'Most Sustainable' },
  { field: 'estimatedComputeHours', direction: 'asc', label: 'Least Compute' },
  { field: 'popularity', direction: 'desc', label: 'Most Popular' },
  { field: 'title', direction: 'asc', label: 'Alphabetical' }
];

const categories = [
  'Academic', 'Business', 'Creative', 'Research', 'Education', 
  'Personal', 'Healthcare', 'Finance', 'Technology', 'Science'
];

const efficiencyRatings = ['A+', 'A', 'B', 'C', 'D'];

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getSubscriptionPlan, isActive } = useSubscription(user?.id);
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [notebooks, setNotebooks] = useState<NotebookMetadata[]>([]);
  const [filteredNotebooks, setFilteredNotebooks] = useState<NotebookMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table'); // Changed default to table
  const [showFilters, setShowFilters] = useState(false);
  const [currentSort, setCurrentSort] = useState(sortOptions[0]);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const [bookmarkedNotebooks, setBookmarkedNotebooks] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    tags: [],
    qualityRange: [0, 100],
    computeRange: [0, 50],
    carbonRange: [0, 1000],
    efficiencyRatings: [],
    dateRange: 'all',
    institutions: [],
    authors: []
  });

  const subscriptionPlan = getSubscriptionPlan();
  const isSubscribed = isActive();
  const isPremium = isSubscribed || true; // For demo, always enable premium features

  // Load notebooks from database
  useEffect(() => {
    loadNotebooks();
    if (user?.id) {
      loadUserBookmarks();
      loadUserPreferences();
    }
  }, [user]);

  // Apply filters and sorting
  useEffect(() => {
    applyFiltersAndSorting();
  }, [notebooks, searchQuery, filters, currentSort]);

  const loadNotebooks = async () => {
    try {
      setLoading(true);
      
      // Try to load from database first
      try {
        const realNotebooks = await NotebookScraperService.getScrapedItems();
        if (realNotebooks.length > 0) {
          setNotebooks(realNotebooks);
          return;
        }
      } catch (error) {
        console.warn('Failed to load from database, using mock data:', error);
      }
      
      // Fallback to enhanced mock data if database is empty or fails
      const mockNotebooks = await generateMockNotebooks();
      setNotebooks(mockNotebooks);
      
    } catch (error) {
      console.error('Error loading notebooks:', error);
      // Use mock data as final fallback
      const mockNotebooks = await generateMockNotebooks();
      setNotebooks(mockNotebooks);
    } finally {
      setLoading(false);
    }
  };

  const loadUserBookmarks = async () => {
    if (!user?.id) return;
    try {
      const bookmarks = await NotebookScraperService.getUserBookmarks(user.id);
      setBookmarkedNotebooks(bookmarks);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const loadUserPreferences = async () => {
    if (!user?.id) return;
    try {
      const prefs = await NotebookScraperService.getUserPreferences(user.id);
      if (prefs) {
        setFilters(prev => ({
          ...prev,
          categories: prefs.preferred_categories || [],
          qualityRange: [prefs.quality_threshold || 0, 100],
          // Map other preferences as needed
        }));
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const generateMockNotebooks = async (): Promise<NotebookMetadata[]> => {
    // Enhanced mock data that follows the NotebookMetadata interface
    const mockData: NotebookMetadata[] = [
      {
        title: 'Climate Change Prediction Models with LLMs',
        description: 'Advanced machine learning models for predicting climate patterns using large language models and satellite data.',
        author: 'Dr. Sarah Chen',
        institution: 'MIT Climate Lab',
        tags: ['Climate', 'AI', 'Machine Learning', 'Sustainability'],
        category: 'Research',
        sourceUrl: 'https://example.com/climate-llm',
        sourcePlatform: 'academic',
        publishedDate: '2024-12-15T00:00:00.000Z',
        qualityScore: 0.94,
        relevanceScore: 0.88,
        estimatedComputeHours: 24.5,
        carbonFootprintGrams: 450,
        energyEfficiencyRating: 'A+'
      },
      {
        title: 'Creative Writing Assistant for Authors',
        description: 'AI-powered writing companion that helps authors develop characters, plot, and maintain consistent narrative voice.',
        author: 'Alex Rivera',
        institution: 'Stanford Creative AI Lab',
        tags: ['Creative Writing', 'AI', 'Literature', 'NLP'],
        category: 'Creative',
        sourceUrl: 'https://example.com/writing-assistant',
        sourcePlatform: 'github',
        publishedDate: '2024-12-10T00:00:00.000Z',
        qualityScore: 0.87,
        relevanceScore: 0.82,
        estimatedComputeHours: 12.3,
        carbonFootprintGrams: 220,
        energyEfficiencyRating: 'A'
      },
      {
        title: 'Financial Market Analysis with Quantum ML',
        description: 'Quantum-enhanced machine learning algorithms for real-time financial market prediction and risk assessment.',
        author: 'Dr. Michael Thompson',
        institution: 'Harvard Quantum Finance Lab',
        tags: ['Finance', 'Quantum Computing', 'Machine Learning', 'Risk Assessment'],
        category: 'Business',
        sourceUrl: 'https://example.com/quantum-finance',
        sourcePlatform: 'research',
        publishedDate: '2024-12-05T00:00:00.000Z',
        qualityScore: 0.96,
        relevanceScore: 0.91,
        estimatedComputeHours: 45.2,
        carbonFootprintGrams: 820,
        energyEfficiencyRating: 'B'
      },
      {
        title: 'Medical Diagnosis Assistant for Rural Healthcare',
        description: 'AI diagnostic tool designed for resource-constrained healthcare environments with offline capabilities.',
        author: 'Dr. Priya Patel',
        institution: 'Oxford Global Health Institute',
        tags: ['Healthcare', 'AI', 'Diagnostics', 'Global Health'],
        category: 'Healthcare',
        sourceUrl: 'https://example.com/medical-diagnosis',
        sourcePlatform: 'medical',
        publishedDate: '2024-11-28T00:00:00.000Z',
        qualityScore: 0.93,
        relevanceScore: 0.89,
        estimatedComputeHours: 8.7,
        carbonFootprintGrams: 160,
        energyEfficiencyRating: 'A+'
      },
      {
        title: 'Educational Curriculum Optimizer',
        description: 'Personalized learning path generator using AI to optimize educational outcomes for diverse learner profiles.',
        author: 'Prof. James Wilson',
        institution: 'Carnegie Mellon Education Tech',
        tags: ['Education', 'Personalization', 'AI', 'Learning Analytics'],
        category: 'Education',
        sourceUrl: 'https://example.com/curriculum-optimizer',
        sourcePlatform: 'educational',
        publishedDate: '2024-11-20T00:00:00.000Z',
        qualityScore: 0.91,
        relevanceScore: 0.85,
        estimatedComputeHours: 15.8,
        carbonFootprintGrams: 290,
        energyEfficiencyRating: 'A'
      },
      {
        title: 'Scientific Literature Discovery Engine',
        description: 'Advanced search and recommendation system for scientific papers using semantic analysis and citation networks.',
        author: 'Dr. Lisa Zhang',
        institution: 'Berkeley Information Sciences',
        tags: ['Research', 'Information Retrieval', 'Scientific Computing', 'NLP'],
        category: 'Research',
        sourceUrl: 'https://example.com/literature-engine',
        sourcePlatform: 'academic',
        publishedDate: '2024-11-15T00:00:00.000Z',
        qualityScore: 0.89,
        relevanceScore: 0.87,
        estimatedComputeHours: 32.1,
        carbonFootprintGrams: 580,
        energyEfficiencyRating: 'B+'
      }
    ];

    return mockData;
  };

  const applyFiltersAndSorting = () => {
    let filtered = [...notebooks];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notebook =>
        notebook.title.toLowerCase().includes(query) ||
        notebook.description.toLowerCase().includes(query) ||
        notebook.tags.some(tag => tag.toLowerCase().includes(query)) ||
        notebook.author.toLowerCase().includes(query) ||
        notebook.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(notebook =>
        filters.categories.includes(notebook.category)
      );
    }

    // Apply quality score filter
    filtered = filtered.filter(notebook =>
      notebook.qualityScore * 100 >= filters.qualityRange[0] &&
      notebook.qualityScore * 100 <= filters.qualityRange[1]
    );

    // Apply compute hours filter
    filtered = filtered.filter(notebook =>
      notebook.estimatedComputeHours >= filters.computeRange[0] &&
      notebook.estimatedComputeHours <= filters.computeRange[1]
    );

    // Apply carbon footprint filter
    filtered = filtered.filter(notebook =>
      notebook.carbonFootprintGrams >= filters.carbonRange[0] &&
      notebook.carbonFootprintGrams <= filters.carbonRange[1]
    );

    // Apply efficiency rating filter
    if (filters.efficiencyRatings.length > 0) {
      filtered = filtered.filter(notebook =>
        filters.efficiencyRatings.includes(notebook.energyEfficiencyRating)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { field, direction } = currentSort;
      let aVal: any, bVal: any;

      switch (field) {
        case 'qualityScore':
          aVal = a.qualityScore;
          bVal = b.qualityScore;
          break;
        case 'publishedDate':
          aVal = new Date(a.publishedDate || 0);
          bVal = new Date(b.publishedDate || 0);
          break;
        case 'carbonFootprintGrams':
          aVal = a.carbonFootprintGrams;
          bVal = b.carbonFootprintGrams;
          break;
        case 'estimatedComputeHours':
          aVal = a.estimatedComputeHours;
          bVal = b.estimatedComputeHours;
          break;
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        default:
          aVal = a.relevanceScore;
          bVal = b.relevanceScore;
      }

      if (direction === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    setFilteredNotebooks(filtered);
  };

  const toggleBookmark = async (notebookTitle: string) => {
    if (!isPremium) {
      alert('Bookmarking is a premium feature. Please upgrade to access this feature.');
      return;
    }
    
    if (!user?.id) {
      alert('Please log in to bookmark notebooks.');
      return;
    }

    try {
      // Use title as ID for now - in a real app, you'd use actual notebook IDs
      const isBookmarked = await NotebookScraperService.toggleBookmark(user.id, notebookTitle);
      
      // Update local state
      setBookmarkedNotebooks(prev =>
        isBookmarked
          ? [...prev, notebookTitle]
          : prev.filter(id => id !== notebookTitle)
      );

      // Also track as an interaction
      await NotebookScraperService.saveUserInteraction(user.id, notebookTitle, 'bookmark', isBookmarked ? 1 : 0);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Fallback to local state update
      setBookmarkedNotebooks(prev =>
        prev.includes(notebookTitle)
          ? prev.filter(id => id !== notebookTitle)
          : [...prev, notebookTitle]
      );
    }
  };

  const saveCurrentSearch = () => {
    if (!isPremium) {
      alert('Saved searches are a premium feature. Please upgrade to access this feature.');
      return;
    }
    
    const searchKey = `${searchQuery} | ${filters.categories.join(',')}`;
    setSavedSearches(prev => [...prev, searchKey]);
  };

  const getQualityBadgeColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 0.8) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEfficiencyColor = (rating: string) => {
    const colors: { [key: string]: string } = {
      'A+': 'text-green-600',
      'A': 'text-green-500',
      'B': 'text-yellow-500',
      'C': 'text-orange-500',
      'D': 'text-red-500'
    };
    return colors[rating] || 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] to-[#181f2e] text-white">
      {/* Header Section */}
      <div className="bg-slate-900/80 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Discover <span className="text-green-400">Notebooks</span>
              </h1>
              <p className="text-slate-300">
                {filteredNotebooks.length} notebooks found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
            
            {/* Premium Badge */}
            {isPremium && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-black px-4 py-2 rounded-full text-sm font-medium">
                <Star className="w-4 h-4" />
                Premium Features Active
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="🔍 Search notebooks, authors, institutions, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>
            
            {isPremium && (
              <button
                onClick={saveCurrentSearch}
                className="px-4 py-3 bg-green-400 text-black rounded-xl hover:bg-green-300 transition-colors flex items-center gap-2 font-medium"
              >
                <Bookmark className="w-4 h-4" />
                Save Search
              </button>
            )}
          </div>

          {/* Horizontal Filters Bar */}
          <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-4 mb-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Categories Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-300">Categories:</span>
                <div className="flex flex-wrap gap-1">
                  {categories.slice(0, 5).map(category => (
                    <button
                      key={category}
                      onClick={() => {
                        if (filters.categories.includes(category)) {
                          setFilters(prev => ({
                            ...prev,
                            categories: prev.categories.filter(c => c !== category)
                          }));
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            categories: [...prev.categories, category]
                          }));
                        }
                      }}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        filters.categories.includes(category)
                          ? 'bg-green-400/20 text-green-300 border-green-400'
                          : 'bg-slate-700 text-slate-300 border-slate-600 hover:border-green-400'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Efficiency Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-300">Efficiency:</span>
                <div className="flex gap-1">
                  {efficiencyRatings.map(rating => (
                    <button
                      key={rating}
                      onClick={() => {
                        if (filters.efficiencyRatings.includes(rating)) {
                          setFilters(prev => ({
                            ...prev,
                            efficiencyRatings: prev.efficiencyRatings.filter(r => r !== rating)
                          }));
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            efficiencyRatings: [...prev.efficiencyRatings, rating]
                          }));
                        }
                      }}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        filters.efficiencyRatings.includes(rating)
                          ? 'bg-green-400/20 text-green-300 border-green-400'
                          : 'bg-slate-700 text-slate-300 border-slate-600 hover:border-green-400'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Range */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-300">Quality:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{filters.qualityRange[0]}%</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.qualityRange[1]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      qualityRange: [prev.qualityRange[0], parseInt(e.target.value)]
                    }))}
                    className="w-20 accent-green-400"
                  />
                  <span className="text-xs text-slate-400">{filters.qualityRange[1]}%</span>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => setFilters({
                  categories: [],
                  tags: [],
                  qualityRange: [0, 100],
                  computeRange: [0, 50],
                  carbonRange: [0, 1000],
                  efficiencyRatings: [],
                  dateRange: 'all',
                  institutions: [],
                  authors: []
                })}
                className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={`${currentSort.field}-${currentSort.direction}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    const option = sortOptions.find(opt => opt.field === field && opt.direction === direction);
                    if (option) setCurrentSort(option);
                  }}
                  className="appearance-none bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 pr-8 text-white focus:ring-2 focus:ring-green-400 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={`${option.field}-${option.direction}`} value={`${option.field}-${option.direction}`}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800 border border-slate-600 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded flex items-center gap-1 ${viewMode === 'table' ? 'bg-green-400/20 text-green-300' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Table className="w-4 h-4" />
                <span className="text-xs">Table</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded flex items-center gap-1 ${viewMode === 'grid' ? 'bg-green-400/20 text-green-300' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="text-xs">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`p-2 rounded flex items-center gap-1 ${viewMode === 'detailed' ? 'bg-green-400/20 text-green-300' : 'text-slate-400 hover:text-slate-200'}`}
                disabled={!isPremium}
                title={!isPremium ? 'Premium feature' : ''}
              >
                <Layers className="w-4 h-4" />
                <span className="text-xs">Detailed</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          </div>
        ) : (
          <>
            {/* Premium Saved Searches */}
            {isPremium && savedSearches.length > 0 && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-medium text-green-300 mb-2">Saved Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {savedSearches.map((search, index) => (
                    <button
                      key={index}
                      className="text-xs bg-green-400/20 text-green-300 px-3 py-1 rounded-full hover:bg-green-400/30 transition-colors"
                      onClick={() => {
                        const [query, categories] = search.split(' | ');
                        setSearchQuery(query);
                        setFilters(prev => ({
                          ...prev,
                          categories: categories ? categories.split(',') : []
                        }));
                      }}
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notebooks Display */}
            {viewMode === 'table' && (
              <NotebookTableView
                notebooks={filteredNotebooks}
                bookmarkedNotebooks={bookmarkedNotebooks}
                onToggleBookmark={toggleBookmark}
                isPremium={isPremium}
              />
            )}

            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotebooks.map((notebook, index) => (
                  <NotebookCard
                    key={index}
                    notebook={notebook}
                    isBookmarked={bookmarkedNotebooks.includes(notebook.title)}
                    onToggleBookmark={() => toggleBookmark(notebook.title)}
                    isPremium={isPremium}
                  />
                ))}
              </div>
            )}

            {viewMode === 'detailed' && isPremium && (
              <div className="space-y-6">
                {filteredNotebooks.map((notebook, index) => (
                  <NotebookDetailedView
                    key={index}
                    notebook={notebook}
                    isBookmarked={bookmarkedNotebooks.includes(notebook.title)}
                    onToggleBookmark={() => toggleBookmark(notebook.title)}
                  />
                ))}
              </div>
            )}

            {filteredNotebooks.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No notebooks found</h3>
                <p className="text-slate-400">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Notebook Card Component for Grid View
const NotebookCard: React.FC<{
  notebook: NotebookMetadata;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  isPremium: boolean;
}> = ({ notebook, isBookmarked, onToggleBookmark, isPremium }) => {
  const getQualityBadgeColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 0.8) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEfficiencyColor = (rating: string) => {
    const colors: { [key: string]: string } = {
      'A+': 'text-green-600',
      'A': 'text-green-500',
      'B': 'text-yellow-500',
      'C': 'text-orange-500',
      'D': 'text-red-500'
    };
    return colors[rating] || 'text-gray-500';
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:shadow-lg transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`px-2 py-1 rounded-lg text-xs font-medium border ${getQualityBadgeColor(notebook.qualityScore)}`}>
          {notebook.category}
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-xs font-bold ${getEfficiencyColor(notebook.energyEfficiencyRating)}`}>
            {notebook.energyEfficiencyRating}
          </div>
          {isPremium && (
            <button
              onClick={onToggleBookmark}
              className={`p-1 rounded transition-colors ${
                isBookmarked ? 'text-red-500 hover:text-red-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
        {notebook.title}
      </h3>
      
      <p className="text-sm text-slate-300 mb-4 line-clamp-3">
        {notebook.description}
      </p>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <User className="w-3 h-3" />
          {notebook.author}
        </div>
        {notebook.institution && (
          <>
            <span className="text-slate-600">•</span>
            <div className="text-xs text-slate-400">{notebook.institution}</div>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {notebook.tags.slice(0, 3).map((tag, i) => (
          <span
            key={i}
            className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
          >
            {tag}
          </span>
        ))}
        {notebook.tags.length > 3 && (
          <span className="text-xs text-slate-400">+{notebook.tags.length - 3}</span>
        )}
      </div>

      {isPremium && (
        <div className="border-t border-slate-700 pt-4 space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Award className="w-3 h-3" />
              Quality: {Math.round(notebook.qualityScore * 100)}%
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {notebook.estimatedComputeHours.toFixed(1)}h
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Leaf className="w-3 h-3" />
              {notebook.carbonFootprintGrams}g CO₂
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(notebook.publishedDate || '').toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-700">
        <button className="w-full bg-green-400 text-black py-2 px-4 rounded-lg hover:bg-green-300 transition-colors text-sm font-medium">
          View Notebook
        </button>
      </div>
    </div>
  );
};

// New Sleek Data Table Component
const NotebookTableView: React.FC<{
  notebooks: NotebookMetadata[];
  bookmarkedNotebooks: string[];
  onToggleBookmark: (title: string) => void;
  isPremium: boolean;
}> = ({ notebooks, bookmarkedNotebooks, onToggleBookmark, isPremium }) => {
  const getQualityBadgeColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800';
    if (score >= 0.8) return 'bg-blue-100 text-blue-800';
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getEfficiencyColor = (rating: string) => {
    const colors: { [key: string]: string } = {
      'A+': 'text-green-600',
      'A': 'text-green-500',
      'B': 'text-yellow-500',
      'C': 'text-orange-500',
      'D': 'text-red-500'
    };
    return colors[rating] || 'text-gray-500';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatComputeHours = (hours: number) => {
    if (hours < 1) return `${(hours * 60).toFixed(0)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700 border-b border-slate-600">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Notebook
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Author & Institution
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Quality
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Efficiency
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Compute
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Carbon
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {notebooks.map((notebook, index) => (
              <tr key={index} className="hover:bg-slate-700 transition-colors">
                <td className="px-4 py-4">
                  <div className="max-w-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white text-sm truncate">
                        {notebook.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getQualityBadgeColor(notebook.qualityScore)}`}>
                        {notebook.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {notebook.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {notebook.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span key={tagIndex} className="inline-flex items-center px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {notebook.tags.length > 3 && (
                        <span className="text-xs text-slate-400">+{notebook.tags.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-white">{notebook.author}</div>
                    <div className="text-slate-400 text-xs">{notebook.institution}</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-green-400 h-2 rounded-full" 
                        style={{ width: `${notebook.qualityScore * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {Math.round(notebook.qualityScore * 100)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-sm font-bold ${getEfficiencyColor(notebook.energyEfficiencyRating)}`}>
                    {notebook.energyEfficiencyRating}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-slate-300">
                    {formatComputeHours(notebook.estimatedComputeHours)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <Leaf className="w-3 h-3 text-green-500" />
                    <span className="text-sm text-slate-300">
                      {notebook.carbonFootprintGrams}g
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-slate-300">
                    {formatDate(notebook.publishedDate || '')}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleBookmark(notebook.title)}
                      className={`p-1 rounded-full transition-colors ${
                        bookmarkedNotebooks.includes(notebook.title)
                          ? 'text-red-500 hover:text-red-700'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${bookmarkedNotebooks.includes(notebook.title) ? 'fill-current' : ''}`} />
                    </button>
                    <a
                      href={notebook.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};



// Detailed View Component (Premium Only)
const NotebookDetailedView: React.FC<{
  notebook: NotebookMetadata;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}> = ({ notebook, isBookmarked, onToggleBookmark }) => {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-green-400/20 text-green-300 px-4 py-2 rounded-lg text-sm font-medium">
            {notebook.category}
          </div>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-medium">
            Quality: {Math.round(notebook.qualityScore * 100)}%
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
            Efficiency: {notebook.energyEfficiencyRating}
          </div>
        </div>
        <button
          onClick={onToggleBookmark}
          className={`p-2 rounded-lg transition-colors ${
            isBookmarked ? 'text-red-500 bg-red-500/10' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-700'
          }`}
        >
          <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      <h3 className="text-2xl font-bold text-white mb-4 hover:text-green-400 transition-colors cursor-pointer">
        {notebook.title}
      </h3>

      <div className="flex items-center gap-4 mb-4 text-slate-300">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="font-medium">{notebook.author}</span>
        </div>
        {notebook.institution && (
          <>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>{notebook.institution}</span>
            </div>
          </>
        )}
        <span className="text-slate-600">•</span>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{new Date(notebook.publishedDate || '').toLocaleDateString()}</span>
        </div>
      </div>

      <p className="text-lg text-slate-300 mb-6 leading-relaxed">
        {notebook.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {notebook.tags.map((tag, i) => (
          <span
            key={i}
            className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <div className="text-sm text-slate-300">Compute Hours</div>
          <div className="text-lg font-bold text-white">{notebook.estimatedComputeHours.toFixed(1)}</div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <Leaf className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-sm text-slate-300">Carbon Footprint</div>
          <div className="text-lg font-bold text-white">{notebook.carbonFootprintGrams}g</div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <Award className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-sm text-slate-300">Quality Score</div>
          <div className="text-lg font-bold text-white">{Math.round(notebook.qualityScore * 100)}%</div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <Target className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <div className="text-sm text-slate-300">Relevance</div>
          <div className="text-lg font-bold text-white">{Math.round(notebook.relevanceScore * 100)}%</div>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="flex-1 bg-green-400 text-black py-3 px-6 rounded-lg hover:bg-green-300 transition-colors font-medium flex items-center justify-center gap-2">
          <BookOpen className="w-4 h-4" />
          View Notebook
        </button>
        <button className="bg-slate-700 text-slate-300 py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors font-medium flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
        <button className="bg-slate-700 text-slate-300 py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors font-medium flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
}; 