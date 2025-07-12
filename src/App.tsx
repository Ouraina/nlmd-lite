import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import HomePage from './components/HomePage';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/success" element={<SuccessPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <ScrapingDashboard />
            </ProtectedRoute>
          } />
          <Route path="/notebook-discovery" element={
            <ProtectedRoute>
              <NotebookScrapingDashboard />
            </ProtectedRoute>
          } />
          <Route path="/recommendations" element={
            <ProtectedRoute>
              <RecommendationsPanel />
            </ProtectedRoute>
          } />
          <Route path="/teams" element={
            <ProtectedRoute>
              <TeamDashboard />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <PlatformAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <SystemHealthDashboard />
            </ProtectedRoute>
          } />
          <Route path="/testing" element={
            <ProtectedRoute>
              <TestRunner />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
