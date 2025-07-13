import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Sparkles, Users, TrendingUp, Leaf, Star, Search, Filter, 
  Eye, Heart, Share2, Grid3X3, Table, BarChart3, Clock, Award, 
  Bookmark, Download, Settings, ChevronDown, SlidersHorizontal,
  Zap, Globe, Atom, Brain, Target, Layers, Calendar, User, ExternalLink
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [notebooks, setNotebooks] = useState<NotebookMetadata[]>([]);
  const [filteredNotebooks, setFilteredNotebooks] = useState<NotebookMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentSort, setCurrentSort] = useState(sortOptions[0]);
  const [bookmarkedNotebooks, setBookmarkedNotebooks] = useState<string[]>([]);
  
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
      }
    ];
    
    return mockData;
  };

  const applyFiltersAndSorting = () => {
    let filtered = [...notebooks];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notebook =>
        notebook.title.toLowerCase().includes(query) ||
        notebook.description.toLowerCase().includes(query) ||
        notebook.author.toLowerCase().includes(query) ||
        notebook.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (notebook.institution && notebook.institution.toLowerCase().includes(query))
      );
    }

    // Apply category filters
    if (filters.categories.length > 0) {
      filtered = filtered.filter(notebook =>
        filters.categories.includes(notebook.category)
      );
    }

    // Apply quality range filter
    filtered = filtered.filter(notebook =>
      notebook.qualityScore * 100 >= filters.qualityRange[0] &&
      notebook.qualityScore * 100 <= filters.qualityRange[1]
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
        case 'title':
          aVal = a.title;
          bVal = b.title;
          break;
        case 'qualityScore':
          aVal = a.qualityScore;
          bVal = b.qualityScore;
          break;
        case 'publishedDate':
          aVal = new Date(a.publishedDate || 0).getTime();
          bVal = new Date(b.publishedDate || 0).getTime();
          break;
        case 'carbonFootprintGrams':
          aVal = a.carbonFootprintGrams;
          bVal = b.carbonFootprintGrams;
          break;
        case 'estimatedComputeHours':
          aVal = a.estimatedComputeHours;
          bVal = b.estimatedComputeHours;
          break;
        default:
          aVal = a.relevanceScore;
          bVal = b.relevanceScore;
      }

      if (typeof aVal === 'string') {
        return direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });

    setFilteredNotebooks(filtered);
  };

  const toggleBookmark = async (notebookTitle: string) => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    try {
      const isBookmarked = await NotebookScraperService.toggleBookmark(user.id, notebookTitle);
      
      if (isBookmarked) {
        setBookmarkedNotebooks(prev => [...prev, notebookTitle]);
      } else {
        setBookmarkedNotebooks(prev => prev.filter(title => title !== notebookTitle));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          </div>
        ) : (
          <>
            {/* Notebooks Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotebooks.map((notebook, index) => (
                <div key={index} className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:shadow-lg transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="px-2 py-1 rounded-lg text-xs font-medium border bg-green-100 text-green-800 border-green-200">
                      {notebook.category}
                    </div>
                    {isPremium && (
                      <button
                        onClick={() => toggleBookmark(notebook.title)}
                        className={`p-1 rounded transition-colors ${
                          bookmarkedNotebooks.includes(notebook.title) ? 'text-red-500 hover:text-red-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${bookmarkedNotebooks.includes(notebook.title) ? 'fill-current' : ''}`} />
                      </button>
                    )}
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

                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <button className="w-full bg-green-400 text-black py-2 px-4 rounded-lg hover:bg-green-300 transition-colors text-sm font-medium">
                      View Notebook
                    </button>
                  </div>
                </div>
              ))}
            </div>

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