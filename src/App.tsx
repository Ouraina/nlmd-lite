import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { UserDashboard } from './components/UserDashboard';
import { ScrapingDashboard } from './components/ScrapingDashboard';
import { NotebookScrapingDashboard } from './components/NotebookScrapingDashboard';
import { RecommendationsPanel } from './components/ai/RecommendationsPanel';
import { TeamDashboard } from './components/collaboration/TeamDashboard';
import { PlatformAnalytics } from './components/analytics/PlatformAnalytics';
import { SystemHealthDashboard } from './components/admin/SystemHealthDashboard';
import { TestRunner } from './components/testing/TestRunner';
import { PricingPage } from './components/subscription/PricingPage';
import { SuccessPage } from './components/subscription/SuccessPage';
import { QuickSubmissionPortal } from './components/QuickSubmissionPortal';
import { NotebookValidationGame } from './components/NotebookValidationGame';
import { PublicNotebookDiscovery } from './components/PublicNotebookDiscovery';
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
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/submit" element={<QuickSubmissionPortal />} />
          <Route path="/validate" element={<NotebookValidationGame />} />
          <Route path="/discover" element={<PublicNotebookDiscovery />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
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
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <SystemHealthDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/scraping" element={
            <ProtectedRoute>
              <ScrapingDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/testing" element={
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
