import { useState, useEffect, useMemo } from 'react';
import type {
  NavigationTab,
  TimeRange,
  LogEntry,
  UserPreferences,
} from './types/log';
import {
  getInitialLogs,
  generateMockLog,
  calculateMetrics,
  MOCK_AGENTS,
  MOCK_SERVICES,
} from './services/mockData';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewPage } from './pages/OverviewPage';
import { LiveLogsPage } from './pages/LiveLogsPage';
import { AgentsPage } from './pages/AgentsPage';
import { MetricsPage } from './pages/MetricsPage';
import { SettingsPage } from './pages/SettingsPage';
import './App.css';

const DEFAULT_PREFERENCES: UserPreferences = {
  refreshRate: 2,
  maxLogsInMemory: 500,
  density: 'comfortable',
  autoExpandErrors: false,
  theme: 'dark',
  backendUrl: 'http://localhost:8000',
};

function loadStoredPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem('loggate_preferences');
    if (raw) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    }
  } catch {
    // ignore parse error and return default
  }
  return DEFAULT_PREFERENCES;
}

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // User Preferences
  const [preferences, setPreferences] = useState<UserPreferences>(loadStoredPreferences);

  // In-memory Logs
  const [logs, setLogs] = useState<LogEntry[]>(() => getInitialLogs(45));

  // Sync theme attribute with document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preferences.theme);
  }, [preferences.theme]);

  // Persist preferences to localStorage
  const updatePreferences = (updated: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updated };
      localStorage.setItem('loggate_preferences', JSON.stringify(next));
      return next;
    });
  };

  const resetPreferences = () => {
    localStorage.removeItem('loggate_preferences');
    setPreferences(DEFAULT_PREFERENCES);
  };

  // Toggle Dark / Light Theme
  const toggleTheme = () => {
    updatePreferences({ theme: preferences.theme === 'dark' ? 'light' : 'dark' });
  };

  // Simulated live ingestion stream
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const newEntry = generateMockLog();
      setLogs((prevLogs) => {
        const next = [newEntry, ...prevLogs];
        // Enforce max buffer limit from preferences
        if (next.length > preferences.maxLogsInMemory) {
          return next.slice(0, preferences.maxLogsInMemory);
        }
        return next;
      });
    }, preferences.refreshRate * 1000);

    return () => clearInterval(interval);
  }, [isStreaming, preferences.refreshRate, preferences.maxLogsInMemory]);

  // Derived metrics
  const metrics = useMemo(() => calculateMetrics(logs), [logs]);

  // Manual inject test log
  const handleInjectMockLog = () => {
    const manualLog = generateMockLog();
    setLogs((prev) => [manualLog, ...prev]);
  };

  // Clear logs buffer
  const handleClearLogs = () => {
    setLogs([]);
  };

  // Responsive page renderer
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewPage
            metrics={metrics}
            logs={logs}
            agents={MOCK_AGENTS}
            onNavigateToLogs={() => setActiveTab('logs')}
            onNavigateToAgents={() => setActiveTab('agents')}
            onNavigateToSettings={() => setActiveTab('settings')}
          />
        );
      case 'logs':
        return (
          <LiveLogsPage
            logs={logs}
            availableServices={MOCK_SERVICES}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isStreaming={isStreaming}
            onToggleStreaming={() => setIsStreaming((prev) => !prev)}
            onClearLogs={handleClearLogs}
            onInjectMockLog={handleInjectMockLog}
            density={preferences.density}
            autoExpandErrors={preferences.autoExpandErrors}
          />
        );
      case 'agents':
        return (
          <AgentsPage
            agents={MOCK_AGENTS}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        );
      case 'metrics':
        return <MetricsPage metrics={metrics} />;
      case 'settings':
        return (
          <SettingsPage
            preferences={preferences}
            onUpdatePreferences={updatePreferences}
            onResetPreferences={resetPreferences}
          />
        );
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        logCount={logs.length}
        agentCount={MOCK_AGENTS.length}
      />

      {/* Main Content Area */}
      <div className="dashboard-main">
        <Header
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isStreaming={isStreaming}
          onToggleStreaming={() => setIsStreaming((prev) => !prev)}
          theme={preferences.theme}
          onToggleTheme={toggleTheme}
          onMobileMenuClick={() => setMobileMenuOpen(true)}
        />

        <main className="dashboard-content">{renderCurrentView()}</main>
      </div>
    </div>
  );
}

export default App;
