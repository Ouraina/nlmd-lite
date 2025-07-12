import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Play, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Loader,
  Database,
  Globe,
  BookOpen,
  Leaf,
  Star,
  Filter,
  Import,
  Eye
} from 'lucide-react';
import { NotebookScraperService, ScrapingOperation, NotebookMetadata } from '../services/notebookScraperService';
import { format } from 'date-fns';

export const NotebookScrapingDashboard: React.FC = () => {
  const [operations, setOperations] = useState<ScrapingOperation[]>([]);
  const [scrapedItems, setScrapedItems] = useState<NotebookMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'operations' | 'results'>('operations');
  
  // Form state
  const [operationName, setOperationName] = useState('');
  const [sourcePlatform, setSourcePlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxResults, setMaxResults] = useState(50);
  
  // Filter state
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [minQualityScore, setMinQualityScore] = useState(0);
  const [importingItems, setImportingItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [operationsData, itemsData] = await Promise.all([
        NotebookScraperService.getScrapingOperations(),
        NotebookScraperService.getScrapedItems()
      ]);
      setOperations(operationsData);
      setScrapedItems(itemsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleStartScraping = async () => {
    if (!operationName.trim() || !searchQuery.trim()) return;

    setLoading(true);
    try {
      await NotebookScraperService.startScrapingOperation(
        operationName,
        sourcePlatform,
        searchQuery,
        maxResults
      );
      
      setOperationName('');
      setSearchQuery('');
      await loadData();
    } catch (error) {
      console.error('Failed to start scraping operation:', error);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return <Database className="w-4 h-4" />;
      case 'kaggle':
        return <BookOpen className="w-4 h-4" />;
      case 'papers_with_code':
        return <Star className="w-4 h-4" />;
      case 'academic':
        return <Globe className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getEfficiencyColor = (rating: string) => {
    switch (rating) {
      case 'A+':
      case 'A':
        return 'text-green-600 bg-green-100';
      case 'B':
        return 'text-yellow-600 bg-yellow-100';
      case 'C':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-red-600 bg-red-100';
    }
  };

  const filteredItems = scrapedItems.filter(item => {
    if (filterPlatform !== 'all' && item.sourcePlatform !== filterPlatform) return false;
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (item.qualityScore < minQualityScore) return false;
    return true;
  });

  const exportResults = () => {
    const data = filteredItems.map(item => ({
      title: item.title,
      description: item.description,
      author: item.author,
      institution: item.institution,
      category: item.category,
      platform: item.sourcePlatform,
      url: item.sourceUrl,
      qualityScore: item.qualityScore,
      relevanceScore: item.relevanceScore,
      estimatedComputeHours: item.estimatedComputeHours,
      carbonFootprintGrams: item.carbonFootprintGrams,
      energyEfficiencyRating: item.energyEfficiencyRating,
      tags: item.tags.join(', ')
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notebook-discovery-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportNotebook = async (item: NotebookMetadata, index: number) => {
    setImportingItems(prev => new Set(prev).add(index));
    
    try {
      // Find the scraped item ID (you'd need to track this in the component state)
      // For now, we'll simulate the import process
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // In a real implementation, you'd call:
      // await NotebookScraperService.importNotebookToDirectory(scrapedItemId);
      
      console.log('Imported notebook:', item.title);
      
      // Optionally refresh the data or show a success message
      await loadData();
    } catch (error) {
      console.error('Failed to import notebook:', error);
    } finally {
      setImportingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Notebook Discovery Engine</h1>
              <p className="text-slate-600 mt-2">Discover and analyze public notebooks across multiple platforms</p>
            </div>
            <button
              onClick={exportResults}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Results
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Operations</p>
                <p className="text-2xl font-bold text-slate-900">{operations.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Notebooks Found</p>
                <p className="text-2xl font-bold text-green-600">{scrapedItems.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">High Quality</p>
                <p className="text-2xl font-bold text-purple-600">
                  {scrapedItems.filter(item => item.qualityScore > 0.8).length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Carbon Impact</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {scrapedItems.length > 0 
                    ? Math.round(scrapedItems.reduce((sum, item) => sum + item.carbonFootprintGrams, 0) / scrapedItems.length)
                    : 0}g
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* New Operation Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Start New Discovery Operation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="operationName" className="block text-sm font-medium text-slate-700 mb-2">
                Operation Name
              </label>
              <input
                type="text"
                id="operationName"
                value={operationName}
                onChange={(e) => setOperationName(e.target.value)}
                placeholder="e.g., Machine Learning Notebooks Discovery"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="sourcePlatform" className="block text-sm font-medium text-slate-700 mb-2">
                Source Platform
              </label>
              <select
                id="sourcePlatform"
                value={sourcePlatform}
                onChange={(e) => setSourcePlatform(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Platforms</option>
                <option value="github">GitHub</option>
                <option value="kaggle">Kaggle</option>
                <option value="papers_with_code">Papers with Code</option>
                <option value="academic">Academic Papers</option>
              </select>
            </div>

            <div>
              <label htmlFor="searchQuery" className="block text-sm font-medium text-slate-700 mb-2">
                Search Query
              </label>
              <input
                type="text"
                id="searchQuery"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., machine learning, data analysis, neural networks"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="maxResults" className="block text-sm font-medium text-slate-700 mb-2">
                Max Results
              </label>
              <input
                type="number"
                id="maxResults"
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value))}
                min="1"
                max="200"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={handleStartScraping}
            disabled={loading || !operationName.trim() || !searchQuery.trim()}
            className="mt-6 flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Start Discovery Operation
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('operations')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'operations'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Operations ({operations.length})
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'results'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Discovered Notebooks ({scrapedItems.length})
          </button>
        </div>

        {activeTab === 'operations' ? (
          /* Operations Table */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Discovery Operations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Operation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Query
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Started
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {operations.map((operation) => (
                    <tr key={operation.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(operation.status)}
                          <span className="text-sm font-medium capitalize text-slate-900">
                            {operation.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 font-medium">{operation.operationName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(operation.sourcePlatform)}
                          <span className="text-sm text-slate-900 capitalize">
                            {operation.sourcePlatform.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 max-w-xs truncate" title={operation.searchQuery}>
                          {operation.searchQuery}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {operation.itemsProcessed} / {operation.itemsDiscovered}
                          {operation.maxResults && ` (max ${operation.maxResults})`}
                        </div>
                        {operation.status === 'in_progress' && operation.itemsDiscovered > 0 && (
                          <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(operation.itemsProcessed / operation.itemsDiscovered) * 100}%` }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-500">
                          {format(new Date(operation.startTime), 'MMM d, HH:mm')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-4 mb-4">
                <Filter className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
                  <select
                    value={filterPlatform}
                    onChange={(e) => setFilterPlatform(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Platforms</option>
                    <option value="github">GitHub</option>
                    <option value="kaggle">Kaggle</option>
                    <option value="papers_with_code">Papers with Code</option>
                    <option value="academic">Academic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="Academic">Academic</option>
                    <option value="Business">Business</option>
                    <option value="Creative">Creative</option>
                    <option value="Research">Research</option>
                    <option value="Education">Education</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Min Quality Score: {minQualityScore.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={minQualityScore}
                    onChange={(e) => setMinQualityScore(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-end">
                  <div className="text-sm text-slate-600">
                    Showing {filteredItems.length} of {scrapedItems.length} notebooks
                  </div>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(item.sourcePlatform)}
                      <span className="text-xs font-medium text-slate-500 uppercase">
                        {item.sourcePlatform.replace('_', ' ')}
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getEfficiencyColor(item.energyEfficiencyRating)}`}>
                      {item.energyEfficiencyRating}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Quality Score</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${item.qualityScore * 100}%` }}
                          />
                        </div>
                        <span className="text-slate-900 font-medium">{(item.qualityScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Carbon Impact</span>
                      <span className="text-slate-900 font-medium">{Math.round(item.carbonFootprintGrams)}g CO₂</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Compute Hours</span>
                      <span className="text-slate-900 font-medium">{item.estimatedComputeHours.toFixed(1)}h</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                      by {item.author}
                      {item.institution && (
                        <span className="block text-xs">{item.institution}</span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Original"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleImportNotebook(item, index)}
                        disabled={importingItems.has(index)}
                        className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Import to Library"
                      >
                        {importingItems.has(index) ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Import className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};