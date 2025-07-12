import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, BookOpen, Leaf, Download, Calendar } from 'lucide-react';
import { AnalyticsService, PlatformMetrics } from '../../services/analyticsService';

export const PlatformAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadMetrics();
  }, [dateRange]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      const platformMetrics = await AnalyticsService.getPlatformMetrics({ start: startDate, end: endDate });
      setMetrics(platformMetrics);
    } catch (error) {
      console.error('Failed to load platform metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const blob = await AnalyticsService.exportAnalytics('platform');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `platform-analytics-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-64 bg-slate-200 rounded-xl"></div>
              <div className="h-64 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Analytics Data</h2>
            <p className="text-slate-600">Analytics data is not available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Platform Analytics</h1>
            <p className="text-slate-600 mt-2">Comprehensive insights into platform usage and sustainability impact</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
            
            <button
              onClick={exportData}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">{metrics.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">
                  {metrics.activeUsers} active
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Notebooks Discovered</p>
                <p className="text-2xl font-bold text-slate-900">{metrics.notebooksDiscovered.toLocaleString()}</p>
                <p className="text-sm text-blue-600 mt-1">
                  {metrics.notebooksImported} imported
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Carbon Saved</p>
                <p className="text-2xl font-bold text-slate-900">
                  {(metrics.totalCarbonSaved / 1000).toFixed(1)}kg
                </p>
                <p className="text-sm text-green-600 mt-1">
                  CO₂ reduction
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Quality Score</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round(metrics.avgQualityScore * 100)}%
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  Platform average
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Popular Categories</h3>
            
            <div className="space-y-4">
              {Object.entries(metrics.topCategories)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([category, count]) => {
                  const maxCount = Math.max(...Object.values(metrics.topCategories));
                  const percentage = (count / maxCount) * 100;
                  
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-medium text-slate-900 min-w-0 flex-1">{category}</span>
                        <span className="text-sm text-slate-600">{count}</span>
                      </div>
                      <div className="w-24 bg-slate-200 rounded-full h-2 ml-4">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Sustainability Metrics */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Sustainability Impact</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">Total Carbon Footprint</p>
                  <p className="text-2xl font-bold text-green-700">
                    {(metrics.sustainabilityMetrics.totalCarbonFootprint / 1000).toFixed(2)}kg CO₂
                  </p>
                </div>
                <Leaf className="w-8 h-8 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Energy Saved</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {metrics.sustainabilityMetrics.energySaved.toFixed(1)} kWh
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-purple-900">Avg Efficiency Rating</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {metrics.sustainabilityMetrics.averageEfficiencyRating}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600 text-center">
                  Platform-wide sustainability metrics help track our collective environmental impact
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">Key Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">
                {Math.round((metrics.notebooksImported / metrics.notebooksDiscovered) * 100)}%
              </p>
              <p className="text-sm text-slate-600 mt-1">Import Rate</p>
              <p className="text-xs text-slate-500 mt-2">
                Percentage of discovered notebooks that get imported
              </p>
            </div>

            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">
                {(metrics.totalCarbonSaved / metrics.notebooksImported || 0).toFixed(0)}g
              </p>
              <p className="text-sm text-slate-600 mt-1">Avg Carbon per Notebook</p>
              <p className="text-xs text-slate-500 mt-2">
                Average carbon footprint per imported notebook
              </p>
            </div>

            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">
                {Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}%
              </p>
              <p className="text-sm text-slate-600 mt-1">User Engagement</p>
              <p className="text-xs text-slate-500 mt-2">
                Percentage of users active in the selected period
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};