import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ScrapingDashboard } from './components/ScrapingDashboard';
import { NotebookScrapingDashboard } from './components/NotebookScrapingDashboard';
import { RecommendationsPanel } from './components/ai/RecommendationsPanel';
import { TeamDashboard } from './components/collaboration/TeamDashboard';
import { PlatformAnalytics } from './components/analytics/PlatformAnalytics';
import { SystemHealthDashboard } from './components/admin/SystemHealthDashboard';
import { TestRunner } from './components/testing/TestRunner';
import { PricingPage } from './components/subscription/PricingPage';
import { SuccessPage } from './components/subscription/SuccessPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ScrapingDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notebooks"
            element={
              <ProtectedRoute>
                <NotebookScrapingDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                  <div className="max-w-4xl mx-auto">
                    <RecommendationsPanel />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <TeamDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <PlatformAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/health"
            element={
              <ProtectedRoute>
                <SystemHealthDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/testing"
            element={
              <ProtectedRoute>
                <TestRunner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/health"
            element={
              <ProtectedRoute>
                <SystemHealthDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/testing"
            element={
              <ProtectedRoute>
                <TestRunner />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;