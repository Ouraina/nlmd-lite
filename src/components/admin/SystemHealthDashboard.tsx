import React, { useState, useEffect } from 'react';
import { Shield, Zap, Database, Brain, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { ValidationService, ValidationResult, AIModelAudit } from '../../services/validationService';

interface SystemHealth {
  overall: ValidationResult;
  components: {
    security: ValidationResult;
    performance: ValidationResult;
    dataIntegrity: ValidationResult;
    aiModel: AIModelAudit;
  };
}

export const SystemHealthDashboard: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    performHealthCheck();
    // Set up periodic health checks every 5 minutes
    const interval = setInterval(performHealthCheck, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const performHealthCheck = async () => {
    try {
      setLoading(true);
      const health = await ValidationService.performSystemHealthCheck();
      setSystemHealth(health);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to perform health check:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusIcon = (isValid: boolean, score: number) => {
    if (isValid && score >= 90) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (score >= 70) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <AlertTriangle className="w-5 h-5 text-red-500" />;
  };

  if (loading && !systemHealth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
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
            <h1 className="text-3xl font-bold text-slate-900">System Health Dashboard</h1>
            <p className="text-slate-600 mt-2">
              Comprehensive monitoring of platform security, performance, and integrity
            </p>
            {lastChecked && (
              <p className="text-sm text-slate-500 mt-1">
                Last checked: {lastChecked.toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={performHealthCheck}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Check
          </button>
        </div>

        {systemHealth && (
          <>
            {/* Overall Health */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(systemHealth.overall.isValid, systemHealth.overall.score)}
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Overall System Health</h2>
                    <p className="text-slate-600">
                      {systemHealth.overall.isValid ? 'All systems operational' : 'Issues detected'}
                    </p>
                  </div>
                </div>
                <div className={`px-6 py-3 rounded-xl text-2xl font-bold ${getScoreColor(systemHealth.overall.score)}`}>
                  {Math.round(systemHealth.overall.score)}%
                </div>
              </div>

              {systemHealth.overall.errors.length > 0 && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-medium text-red-900 mb-2">Critical Issues</h3>
                  <ul className="space-y-1">
                    {systemHealth.overall.errors.map((error, index) => (
                      <li key={index} className="text-red-700 text-sm">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {systemHealth.overall.warnings.length > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium text-yellow-900 mb-2">Warnings</h3>
                  <ul className="space-y-1">
                    {systemHealth.overall.warnings.map((warning, index) => (
                      <li key={index} className="text-yellow-700 text-sm">• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Component Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Security */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Security</h3>
                      <p className="text-sm text-slate-600">Access & Protection</p>
                    </div>
                  </div>
                  {getStatusIcon(systemHealth.components.security.isValid, systemHealth.components.security.score)}
                </div>
                <div className={`text-2xl font-bold mb-2 ${getScoreColor(systemHealth.components.security.score).split(' ')[0]}`}>
                  {Math.round(systemHealth.components.security.score)}%
                </div>
                <div className="space-y-1">
                  {systemHealth.components.security.errors.slice(0, 2).map((error, index) => (
                    <p key={index} className="text-xs text-red-600">• {error}</p>
                  ))}
                  {systemHealth.components.security.warnings.slice(0, 2).map((warning, index) => (
                    <p key={index} className="text-xs text-yellow-600">• {warning}</p>
                  ))}
                </div>
              </div>

              {/* Performance */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Zap className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Performance</h3>
                      <p className="text-sm text-slate-600">Speed & Efficiency</p>
                    </div>
                  </div>
                  {getStatusIcon(systemHealth.components.performance.isValid, systemHealth.components.performance.score)}
                </div>
                <div className={`text-2xl font-bold mb-2 ${getScoreColor(systemHealth.components.performance.score).split(' ')[0]}`}>
                  {Math.round(systemHealth.components.performance.score)}%
                </div>
                <div className="space-y-1">
                  {systemHealth.components.performance.errors.slice(0, 2).map((error, index) => (
                    <p key={index} className="text-xs text-red-600">• {error}</p>
                  ))}
                  {systemHealth.components.performance.warnings.slice(0, 2).map((warning, index) => (
                    <p key={index} className="text-xs text-yellow-600">• {warning}</p>
                  ))}
                </div>
              </div>

              {/* Data Integrity */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Database className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Data Integrity</h3>
                      <p className="text-sm text-slate-600">Consistency & Quality</p>
                    </div>
                  </div>
                  {getStatusIcon(systemHealth.components.dataIntegrity.isValid, systemHealth.components.dataIntegrity.score)}
                </div>
                <div className={`text-2xl font-bold mb-2 ${getScoreColor(systemHealth.components.dataIntegrity.score).split(' ')[0]}`}>
                  {Math.round(systemHealth.components.dataIntegrity.score)}%
                </div>
                <div className="space-y-1">
                  {systemHealth.components.dataIntegrity.errors.slice(0, 2).map((error, index) => (
                    <p key={index} className="text-xs text-red-600">• {error}</p>
                  ))}
                  {systemHealth.components.dataIntegrity.warnings.slice(0, 2).map((warning, index) => (
                    <p key={index} className="text-xs text-yellow-600">• {warning}</p>
                  ))}
                </div>
              </div>

              {/* AI Model Health */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Brain className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">AI Model</h3>
                      <p className="text-sm text-slate-600">ML Performance</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold mb-2 text-green-600">
                  {Math.round(systemHealth.components.aiModel.performanceMetrics.accuracy * 100)}%
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <p>• Accuracy: {(systemHealth.components.aiModel.performanceMetrics.accuracy * 100).toFixed(1)}%</p>
                  <p>• F1 Score: {(systemHealth.components.aiModel.performanceMetrics.f1Score * 100).toFixed(1)}%</p>
                  <p>• Bias Score: {(systemHealth.components.aiModel.biasMetrics.demographicParity * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Detailed AI Model Audit */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">AI Model Audit Report</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Performance Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Accuracy</span>
                      <span className="text-sm font-medium">{(systemHealth.components.aiModel.performanceMetrics.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Precision</span>
                      <span className="text-sm font-medium">{(systemHealth.components.aiModel.performanceMetrics.precision * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Recall</span>
                      <span className="text-sm font-medium">{(systemHealth.components.aiModel.performanceMetrics.recall * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">F1 Score</span>
                      <span className="text-sm font-medium">{(systemHealth.components.aiModel.performanceMetrics.f1Score * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Bias & Fairness</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Demographic Parity</span>
                      <span className="text-sm font-medium">{(systemHealth.components.aiModel.biasMetrics.demographicParity * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Equalized Odds</span>
                      <span className="text-sm font-medium">{(systemHealth.components.aiModel.biasMetrics.equalizedOdds * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Calibration</span>
                      <span className="text-sm font-medium">{(systemHealth.components.aiModel.biasMetrics.calibration * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Ethical Compliance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Data Privacy</span>
                      <span className={`text-sm font-medium ${systemHealth.components.aiModel.ethicalCompliance.dataPrivacy ? 'text-green-600' : 'text-red-600'}`}>
                        {systemHealth.components.aiModel.ethicalCompliance.dataPrivacy ? 'Compliant' : 'Issues'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Transparency</span>
                      <span className="text-sm font-medium">{(systemHealth.components.aiModel.ethicalCompliance.transparencyScore * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Explainability</span>
                      <span className="text-sm font-medium">{(systemHealth.components.aiModel.ethicalCompliance.explainabilityScore * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Model Version: {systemHealth.components.aiModel.modelVersion}</p>
                    <p className="text-sm text-slate-600">Training Data Size: {systemHealth.components.aiModel.trainingData.size.toLocaleString()} records</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Last Updated:</p>
                    <p className="text-sm font-medium">{new Date(systemHealth.components.aiModel.trainingData.lastUpdated).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};