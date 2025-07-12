import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Leaf, Clock, Award, Users, 
  BookOpen, Zap, Target, Sparkles, Calendar, Globe,
  ChevronDown, Filter, Download, Share2, Eye, Heart,
  Activity, PieChart, LineChart, ArrowUp, ArrowDown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';

interface AnalyticsData {
  totalNotebooks: number;
  totalViews: number;
  totalBookmarks: number;
  totalComputeHours: number;
  totalCarbonFootprint: number;
  avgQualityScore: number;
  topCategories: Array<{ name: string; count: number; percentage: number }>;
  topInstitutions: Array<{ name: string; count: number; percentage: number }>;
  monthlyActivity: Array<{ month: string; views: number; bookmarks: number; searches: number }>;
  environmentalImpact: {
    totalSaved: number;
    carbonReduction: number;
    energyEfficiency: number;
    sustainabilityScore: number;
  };
  userEngagement: {
    avgSessionTime: number;
    searchesPerSession: number;
    bookmarkRate: number;
    shareRate: number;
  };
  qualityDistribution: Array<{ range: string; count: number; percentage: number }>;
}

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';
type MetricType = 'views' | 'bookmarks' | 'searches';

export const PlatformAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { isActive } = useSubscription(user?.id);
  
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('views');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const isPremium = isActive() || true; // For demo

  useEffect(() => {
    if (isPremium) {
      loadAnalyticsData();
    }
  }, [timeRange, isPremium]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    // Simulate API call - in real app, this would fetch from backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockData: AnalyticsData = {
      totalNotebooks: 1247,
      totalViews: 23840,
      totalBookmarks: 1823,
      totalComputeHours: 14523.7,
      totalCarbonFootprint: 2840950,
      avgQualityScore: 87.3,
      topCategories: [
        { name: 'Research', count: 423, percentage: 33.9 },
        { name: 'Healthcare', count: 298, percentage: 23.9 },
        { name: 'Education', count: 187, percentage: 15.0 },
        { name: 'Creative', count: 156, percentage: 12.5 },
        { name: 'Business', count: 112, percentage: 9.0 },
        { name: 'Technology', count: 71, percentage: 5.7 }
      ],
      topInstitutions: [
        { name: 'MIT', count: 156, percentage: 12.5 },
        { name: 'Stanford', count: 134, percentage: 10.7 },
        { name: 'Harvard', count: 123, percentage: 9.9 },
        { name: 'Oxford', count: 98, percentage: 7.9 },
        { name: 'Cambridge', count: 87, percentage: 7.0 }
      ],
      monthlyActivity: [
        { month: 'Jan', views: 1850, bookmarks: 145, searches: 890 },
        { month: 'Feb', views: 2100, bookmarks: 167, searches: 1020 },
        { month: 'Mar', views: 2350, bookmarks: 189, searches: 1150 },
        { month: 'Apr', views: 2800, bookmarks: 234, searches: 1340 },
        { month: 'May', views: 3200, bookmarks: 278, searches: 1520 },
        { month: 'Jun', views: 3650, bookmarks: 312, searches: 1740 }
      ],
      environmentalImpact: {
        totalSaved: 8945.2,
        carbonReduction: 1456.8,
        energyEfficiency: 92.4,
        sustainabilityScore: 88.7
      },
      userEngagement: {
        avgSessionTime: 12.4,
        searchesPerSession: 3.2,
        bookmarkRate: 7.6,
        shareRate: 2.3
      },
      qualityDistribution: [
        { range: '90-100%', count: 387, percentage: 31.0 },
        { range: '80-89%', count: 456, percentage: 36.6 },
        { range: '70-79%', count: 289, percentage: 23.2 },
        { range: '60-69%', count: 85, percentage: 6.8 },
        { range: '< 60%', count: 30, percentage: 2.4 }
      ]
    };

    setAnalyticsData(mockData);
    setLoading(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTimeRangeLabel = (range: TimeRange) => {
    const labels = {
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 90 days',
      '1y': 'Last year',
      'all': 'All time'
    };
    return labels[range];
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Premium Analytics</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Unlock detailed insights about your notebook usage, environmental impact, 
              and discovery patterns with our advanced analytics dashboard.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center gap-3 text-sm text-slate-600">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>Usage trends and patterns</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-sm text-slate-600">
                <Leaf className="w-4 h-4 text-green-500" />
                <span>Environmental impact tracking</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-sm text-slate-600">
                <Target className="w-4 h-4 text-green-500" />
                <span>Quality score analysis</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-sm text-slate-600">
                <Users className="w-4 h-4 text-green-500" />
                <span>Community insights</span>
              </div>
            </div>
            <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors font-medium">
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Platform Analytics</h1>
            <p className="text-slate-600 mt-2">
              Advanced insights and metrics for {getTimeRangeLabel(timeRange)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Premium Analytics
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="bg-white border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Notebooks</p>
                <p className="text-2xl font-bold text-slate-900">{formatNumber(analyticsData?.totalNotebooks || 0)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUp className="w-3 h-3" />
                  +12% from last month
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Views</p>
                <p className="text-2xl font-bold text-slate-900">{formatNumber(analyticsData?.totalViews || 0)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUp className="w-3 h-3" />
                  +18% from last month
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Quality Score</p>
                <p className="text-2xl font-bold text-slate-900">{analyticsData?.avgQualityScore || 0}%</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUp className="w-3 h-3" />
                  +3.2% from last month
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Carbon Footprint</p>
                <p className="text-2xl font-bold text-slate-900">{formatNumber(analyticsData?.totalCarbonFootprint || 0)}g</p>
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <ArrowDown className="w-3 h-3" />
                  -8% from last month
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activity Trends */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Activity Trends</h3>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as MetricType)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="views">Views</option>
                <option value="bookmarks">Bookmarks</option>
                <option value="searches">Searches</option>
              </select>
            </div>
            <div className="space-y-4">
              {analyticsData?.monthlyActivity.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="text-sm text-slate-600 w-12">{data.month}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${(data[selectedMetric] / Math.max(...analyticsData.monthlyActivity.map(d => d[selectedMetric]))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-slate-900 w-16 text-right">
                    {formatNumber(data[selectedMetric])}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Top Categories</h3>
            <div className="space-y-4">
              {analyticsData?.topCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="text-sm text-slate-900 font-medium">{category.name}</div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-slate-600 w-12 text-right">
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Environmental Impact Dashboard */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-3 rounded-lg">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Environmental Impact</h3>
              <p className="text-sm text-slate-600">Tracking sustainability metrics and carbon footprint</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(analyticsData?.environmentalImpact.totalSaved || 0)}h
              </div>
              <div className="text-sm text-green-700 mt-1">Compute Hours Saved</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(analyticsData?.environmentalImpact.carbonReduction || 0)}g
              </div>
              <div className="text-sm text-blue-700 mt-1">Carbon Reduction</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData?.environmentalImpact.energyEfficiency || 0}%
              </div>
              <div className="text-sm text-purple-700 mt-1">Energy Efficiency</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {analyticsData?.environmentalImpact.sustainabilityScore || 0}%
              </div>
              <div className="text-sm text-orange-700 mt-1">Sustainability Score</div>
            </div>
          </div>
        </div>

        {/* User Engagement & Quality Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Engagement */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">User Engagement</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Avg Session Time</span>
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {analyticsData?.userEngagement.avgSessionTime || 0} min
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Searches per Session</span>
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {analyticsData?.userEngagement.searchesPerSession || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Bookmark Rate</span>
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {analyticsData?.userEngagement.bookmarkRate || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Share Rate</span>
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {analyticsData?.userEngagement.shareRate || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Quality Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Quality Distribution</h3>
            <div className="space-y-3">
              {analyticsData?.qualityDistribution.map((range, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">{range.range}</div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-green-500 h-2 rounded-full"
                        style={{ width: `${range.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm font-medium text-slate-900 w-8 text-right">
                      {range.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export & Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Export & Share</h3>
              <p className="text-sm text-slate-600">Download reports and share insights</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
                <Share2 className="w-4 h-4" />
                Share Insights
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};