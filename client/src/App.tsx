import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogGateProvider, useLogGate } from './context/LogGateContext';
import { WelcomePage } from './components/welcome/WelcomePage';
import { SignInPage } from './components/auth/SignInPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import type { ActiveTab } from './components/layout/Sidebar';
import { SystemAlertBar } from './components/layout/SystemAlertBar';
import { OverviewDashboard } from './components/overview/OverviewDashboard';
import { IncidentList } from './components/incidents/IncidentList';
import { SensitivityTuner } from './components/tuning/SensitivityTuner';
import { PatternBrowser } from './components/patterns/PatternBrowser';
import { CostSavings } from './components/analytics/CostSavings';
import { TriageSandbox } from './components/sandbox/TriageSandbox';
import { FleetConnect } from './components/fleet/FleetConnect';
import { ProjectSettings } from './components/settings/ProjectSettings';

type ViewMode = 'welcome' | 'signin' | 'dashboard';

function AppContent() {
  const { login } = useAuth();
  const { setSelectedIncident } = useLogGate();
  const [viewMode, setViewMode] = useState<ViewMode>('welcome');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Step 1: Welcome / Landing Page
  if (viewMode === 'welcome') {
    return (
      <WelcomePage
        onGetStarted={() => setViewMode('signin')}
        onExploreDemo={() => {
          login('admin@loggate.io', 'Platform Admin', 'Production Infrastructure');
          setViewMode('dashboard');
        }}
      />
    );
  }

  // Step 2: Dedicated Sign In Page
  if (viewMode === 'signin') {
    return (
      <SignInPage
        onBackToWelcome={() => setViewMode('welcome')}
        onSuccess={() => setViewMode('dashboard')}
      />
    );
  }

  // Step 3: Full Dashboard Console (Supabase-Style Information Architecture)
  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onGoHome={() => setViewMode('welcome')}
      />

      {/* Main Workspace */}
      <div className="main-content">
        <Navbar
          activeTab={activeTab}
          onOpenLogin={() => setViewMode('signin')}
          onGoHome={() => setViewMode('welcome')}
        />

        {/* Scrollable Content Container (Navbar and Sidebar stay 100% fixed) */}
        <div className="content-scroll-area">
          {/* System Resilience Alert Bar */}
          <SystemAlertBar />

          {/* Dynamic Routed Page Views */}
          <main className="page-body">
            {activeTab === 'overview' && (
              <OverviewDashboard
                onNavigateIncidents={() => setActiveTab('incidents')}
                onSelectIncident={(inc) => {
                  setSelectedIncident(inc);
                  setActiveTab('incidents');
                }}
              />
            )}
            {activeTab === 'incidents' && <IncidentList />}
            {activeTab === 'patterns' && <PatternBrowser />}
            {activeTab === 'sandbox' && <TriageSandbox />}
            {activeTab === 'tuning' && <SensitivityTuner />}
            {activeTab === 'fleet' && <FleetConnect />}
            {activeTab === 'analytics' && <CostSavings />}
            {activeTab === 'settings' && <ProjectSettings />}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LogGateProvider>
          <AppContent />
        </LogGateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
