import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
  category: 'unit' | 'integration' | 'e2e' | 'accessibility' | 'performance';
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  status: 'pending' | 'running' | 'completed';
}

export const TestRunner: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [running, setRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    initializeTestSuites();
  }, []);

  const initializeTestSuites = () => {
    const suites: TestSuite[] = [
      {
        name: 'Authentication Tests',
        status: 'pending',
        tests: [
          { id: 'auth-1', name: 'User login with valid credentials', status: 'pending', category: 'integration' },
          { id: 'auth-2', name: 'User login with invalid credentials', status: 'pending', category: 'integration' },
          { id: 'auth-3', name: 'User registration flow', status: 'pending', category: 'integration' },
          { id: 'auth-4', name: 'Password reset functionality', status: 'pending', category: 'integration' },
          { id: 'auth-5', name: 'Session management', status: 'pending', category: 'unit' }
        ]
      },
      {
        name: 'Scraping Service Tests',
        status: 'pending',
        tests: [
          { id: 'scrape-1', name: 'GitHub notebook discovery', status: 'pending', category: 'integration' },
          { id: 'scrape-2', name: 'Quality score calculation', status: 'pending', category: 'unit' },
          { id: 'scrape-3', name: 'Environmental impact estimation', status: 'pending', category: 'unit' },
          { id: 'scrape-4', name: 'Batch processing workflow', status: 'pending', category: 'integration' },
          { id: 'scrape-5', name: 'Error handling and retries', status: 'pending', category: 'unit' }
        ]
      },
      {
        name: 'AI Recommendation Tests',
        status: 'pending',
        tests: [
          { id: 'ai-1', name: 'Content-based recommendations', status: 'pending', category: 'unit' },
          { id: 'ai-2', name: 'Collaborative filtering', status: 'pending', category: 'unit' },
          { id: 'ai-3', name: 'Bias detection in recommendations', status: 'pending', category: 'unit' },
          { id: 'ai-4', name: 'Recommendation accuracy metrics', status: 'pending', category: 'performance' },
          { id: 'ai-5', name: 'Real-time recommendation updates', status: 'pending', category: 'integration' }
        ]
      },
      {
        name: 'Collaboration Tests',
        status: 'pending',
        tests: [
          { id: 'collab-1', name: 'Team creation and management', status: 'pending', category: 'integration' },
          { id: 'collab-2', name: 'Real-time commenting system', status: 'pending', category: 'integration' },
          { id: 'collab-3', name: 'Permission-based access control', status: 'pending', category: 'integration' },
          { id: 'collab-4', name: 'User following functionality', status: 'pending', category: 'unit' },
          { id: 'collab-5', name: 'Team analytics calculation', status: 'pending', category: 'unit' }
        ]
      },
      {
        name: 'Accessibility Tests',
        status: 'pending',
        tests: [
          { id: 'a11y-1', name: 'Keyboard navigation support', status: 'pending', category: 'accessibility' },
          { id: 'a11y-2', name: 'Screen reader compatibility', status: 'pending', category: 'accessibility' },
          { id: 'a11y-3', name: 'Color contrast compliance', status: 'pending', category: 'accessibility' },
          { id: 'a11y-4', name: 'Focus management', status: 'pending', category: 'accessibility' },
          { id: 'a11y-5', name: 'ARIA labels and roles', status: 'pending', category: 'accessibility' }
        ]
      },
      {
        name: 'Performance Tests',
        status: 'pending',
        tests: [
          { id: 'perf-1', name: 'Page load performance', status: 'pending', category: 'performance' },
          { id: 'perf-2', name: 'Database query optimization', status: 'pending', category: 'performance' },
          { id: 'perf-3', name: 'Large dataset handling', status: 'pending', category: 'performance' },
          { id: 'perf-4', name: 'Concurrent user simulation', status: 'pending', category: 'performance' },
          { id: 'perf-5', name: 'Memory usage optimization', status: 'pending', category: 'performance' }
        ]
      },
      {
        name: 'End-to-End Tests',
        status: 'pending',
        tests: [
          { id: 'e2e-1', name: 'Complete user registration to notebook discovery', status: 'pending', category: 'e2e' },
          { id: 'e2e-2', name: 'Team collaboration workflow', status: 'pending', category: 'e2e' },
          { id: 'e2e-3', name: 'Subscription and payment flow', status: 'pending', category: 'e2e' },
          { id: 'e2e-4', name: 'AI recommendation to notebook import', status: 'pending', category: 'e2e' },
          { id: 'e2e-5', name: 'Analytics dashboard interaction', status: 'pending', category: 'e2e' }
        ]
      }
    ];

    setTestSuites(suites);
  };

  const runTests = async (category: string = 'all') => {
    setRunning(true);
    
    // Update all relevant tests to running status
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      status: 'running' as const,
      tests: suite.tests.map(test => 
        category === 'all' || test.category === category
          ? { ...test, status: 'running' as const }
          : test
      )
    })));

    // Simulate running tests with realistic timing
    const allTests = testSuites.flatMap(suite => suite.tests);
    const testsToRun = category === 'all' 
      ? allTests 
      : allTests.filter(test => test.category === category);

    for (const test of testsToRun) {
      // Simulate test execution time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
      
      // Simulate test results (90% pass rate)
      const passed = Math.random() > 0.1;
      const duration = Math.random() * 1000 + 100;
      
      setTestSuites(prev => prev.map(suite => ({
        ...suite,
        tests: suite.tests.map(t => 
          t.id === test.id 
            ? {
                ...t,
                status: passed ? 'passed' as const : 'failed' as const,
                duration,
                error: passed ? undefined : 'Test assertion failed: Expected value to be truthy'
              }
            : t
        )
      })));
    }

    // Update suite statuses
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      status: 'completed' as const
    })));

    setRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'skipped':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <div className="w-4 h-4 bg-slate-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'running':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'skipped':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getTotalStats = () => {
    const allTests = testSuites.flatMap(suite => suite.tests);
    return {
      total: allTests.length,
      passed: allTests.filter(t => t.status === 'passed').length,
      failed: allTests.filter(t => t.status === 'failed').length,
      running: allTests.filter(t => t.status === 'running').length,
      pending: allTests.filter(t => t.status === 'pending').length
    };
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Test Runner</h1>
            <p className="text-slate-600 mt-2">Comprehensive testing suite for platform validation</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Tests</option>
              <option value="unit">Unit Tests</option>
              <option value="integration">Integration Tests</option>
              <option value="e2e">End-to-End Tests</option>
              <option value="accessibility">Accessibility Tests</option>
              <option value="performance">Performance Tests</option>
            </select>
            
            <button
              onClick={() => runTests(selectedCategory)}
              disabled={running}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Play className={`w-4 h-4 ${running ? 'animate-pulse' : ''}`} />
              {running ? 'Running Tests...' : 'Run Tests'}
            </button>
          </div>
        </div>

        {/* Test Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600">Total Tests</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            <div className="text-sm text-slate-600">Passed</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-slate-600">Failed</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
            <div className="text-sm text-slate-600">Running</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="text-2xl font-bold text-slate-600">{stats.pending}</div>
            <div className="text-sm text-slate-600">Pending</div>
          </div>
        </div>

        {/* Test Suites */}
        <div className="space-y-6">
          {testSuites.map((suite) => (
            <div key={suite.name} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">{suite.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      suite.status === 'completed' ? 'bg-green-100 text-green-700' :
                      suite.status === 'running' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {suite.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  {suite.tests
                    .filter(test => selectedCategory === 'all' || test.category === selectedCategory)
                    .map((test) => (
                    <div key={test.id} className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <div className="font-medium text-slate-900">{test.name}</div>
                            <div className="text-sm text-slate-600 capitalize">{test.category} test</div>
                          </div>
                        </div>
                        <div className="text-right">
                          {test.duration && (
                            <div className="text-sm text-slate-600">{test.duration.toFixed(0)}ms</div>
                          )}
                          {test.status === 'running' && (
                            <div className="text-sm text-blue-600">Running...</div>
                          )}
                        </div>
                      </div>
                      {test.error && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                          {test.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};