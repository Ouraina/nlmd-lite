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
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
