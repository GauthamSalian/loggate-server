import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { SignInPage } from './components/auth/SignInPage';
import { Sidebar } from './components/layout/Sidebar';
import type { ActiveTab } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { TriagePage } from './pages/TriagePage';
import { TriageTestPage } from './pages/TriageTestPage';
import { AgentsPage } from './pages/AgentsPage';
import { TokensPage } from './pages/TokensPage';
import { SettingsPage } from './pages/SettingsPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { fadeInSlideUp } from './lib/motion';

function AppShell() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  if (!isAuthenticated) {
    return <SignInPage onSuccess={() => {}} />;
  }

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />
      <div className="main-area">
        <Navbar activeTab={activeTab} />
        <main className="page-scroll">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={fadeInSlideUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="page-wrapper"
            >
              {activeTab === 'dashboard' && <DashboardPage />}
              {activeTab === 'triage' && <TriagePage />}
              {activeTab === 'triage-sandbox' && <TriageTestPage />}
              {activeTab === 'agents' && <AgentsPage />}
              {activeTab === 'tokens' && <TokensPage />}
              {activeTab === 'settings' && <SettingsPage />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProjectProvider>
          <AppShell />
        </ProjectProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
