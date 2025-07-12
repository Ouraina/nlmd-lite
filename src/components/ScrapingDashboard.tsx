import React, { useState, useEffect } from 'react';
import { Plus, Play, Pause, Download, AlertCircle, CheckCircle, Clock, Loader } from 'lucide-react';
import { ScraperService } from '../services/scraperService';
import { ScrapingJob, BatchJob } from '../types/scraper';
import { format } from 'date-fns';

export const ScrapingDashboard: React.FC = () => {
  const [scrapingJobs, setScrapingJobs] = useState<ScrapingJob[]>([]);
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [batchUrls, setBatchUrls] = useState('');
  const [batchName, setBatchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const [jobs, batches] = await Promise.all([
        ScraperService.getScrapingJobs(),
        ScraperService.getBatchJobs()
      ]);
      setScrapingJobs(jobs);
      setBatchJobs(batches);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const handleSingleScrape = async () => {
    if (!newUrl.trim()) return;

    setLoading(true);
    try {
      // Create job record
      const jobId = await ScraperService.saveScrapingJob({
        url: newUrl,
        status: 'running'
      });

      // Update UI
      await loadJobs();

      // Perform scraping
      try {
        const result = await ScraperService.scrapeUrl(newUrl);
        await ScraperService.updateScrapingJob(jobId, {
          status: 'completed',
          title: result.title,
          content: result.content,
          word_count: result.wordCount,
          completed_at: new Date().toISOString()
        });
      } catch (error) {
        await ScraperService.updateScrapingJob(jobId, {
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString()
        });
      }

      setNewUrl('');
      await loadJobs();
    } catch (error) {
      console.error('Failed to start scraping job:', error);
    }
    setLoading(false);
  };

  const handleBatchScrape = async () => {
    if (!batchName.trim() || !batchUrls.trim()) return;

    const urls = batchUrls.split('\n').map(url => url.trim()).filter(url => url);
    if (urls.length === 0) return;

    setLoading(true);
    try {
      const batchId = await ScraperService.createBatchJob(batchName, urls);
      
      // Process URLs one by one
      for (const url of urls) {
        const jobId = await ScraperService.saveScrapingJob({
          url,
          status: 'running'
        });

        try {
          const result = await ScraperService.scrapeUrl(url);
          await ScraperService.updateScrapingJob(jobId, {
            status: 'completed',
            title: result.title,
            content: result.content,
            word_count: result.wordCount,
            completed_at: new Date().toISOString()
          });
        } catch (error) {
          await ScraperService.updateScrapingJob(jobId, {
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            completed_at: new Date().toISOString()
          });
        }
      }

      setBatchName('');
      setBatchUrls('');
      await loadJobs();
    } catch (error) {
      console.error('Failed to start batch job:', error);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const exportData = () => {
    const completedJobs = scrapingJobs.filter(job => job.status === 'completed');
    const data = completedJobs.map(job => ({
      url: job.url,
      title: job.title,
      content: job.content,
      wordCount: job.word_count,
      scrapedAt: job.completed_at
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraped-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Web Scraping Dashboard</h1>
              <p className="text-slate-600 mt-2">Extract and manage content from websites efficiently</p>
            </div>
            <button
              onClick={exportData}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Jobs</p>
                <p className="text-2xl font-bold text-slate-900">{scrapingJobs.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Play className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {scrapingJobs.filter(job => job.status === 'completed').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Running</p>
                <p className="text-2xl font-bold text-blue-600">
                  {scrapingJobs.filter(job => job.status === 'running').length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Loader className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {scrapingJobs.filter(job => job.status === 'failed').length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Add New Job */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'single'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Single URL
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'batch'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Batch URLs
            </button>
          </div>

          {activeTab === 'single' ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSingleScrape}
                disabled={loading || !newUrl.trim()}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Start Scraping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="batchName" className="block text-sm font-medium text-slate-700 mb-2">
                  Batch Name
                </label>
                <input
                  type="text"
                  id="batchName"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="My Batch Job"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="batchUrls" className="block text-sm font-medium text-slate-700 mb-2">
                  URLs (one per line)
                </label>
                <textarea
                  id="batchUrls"
                  value={batchUrls}
                  onChange={(e) => setBatchUrls(e.target.value)}
                  placeholder="https://example1.com&#10;https://example2.com&#10;https://example3.com"
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleBatchScrape}
                disabled={loading || !batchName.trim() || !batchUrls.trim()}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Start Batch Job
              </button>
            </div>
          )}
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Recent Jobs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Words
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {scrapingJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <span className="text-sm font-medium capitalize text-slate-900">
                          {job.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 max-w-xs truncate" title={job.url}>
                        {job.url}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 max-w-xs truncate" title={job.title || ''}>
                        {job.title || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900">
                        {job.word_count?.toLocaleString() || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-500">
                        {format(new Date(job.created_at), 'MMM d, HH:mm')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};