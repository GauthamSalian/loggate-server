import React, { useState } from 'react';
import { useLogGate } from '../../context/LogGateContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { ActiveTab } from './Sidebar';
import {
  Activity,
  Sun,
  Moon,
  Zap,
  Play,
  Pause,
  AlertTriangle,
  Sparkles,
  Server,
  User,
  LogOut,
  ChevronDown,
  Home,
} from 'lucide-react';

interface NavbarProps {
  activeTab?: ActiveTab;
  onOpenLogin: () => void;
  onGoHome: () => void;
}

const TAB_TITLES: Record<ActiveTab, string> = {
  incidents: 'Live Incident Triage',
  tuning: 'Noise-Floor & Sensitivity',
  patterns: 'Pattern Catalog',
  analytics: 'Cost Avoidance & ROI',
  sandbox: 'Triage Sandbox',
  fleet: 'Host Fleet Nodes',
  settings: 'Slack Alert Routing',
};

export const Navbar: React.FC<NavbarProps> = ({ activeTab = 'incidents', onOpenLogin, onGoHome }) => {
  const {
    health,
    liveStreaming,
    setLiveStreaming,
    simulateIncomingBatch,
    simulateOverloadBurst,
    toggleModelDegraded,
    toggleSlackOutage,
  } = useLogGate();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [showSimMenu, setShowSimMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const activeTitle = TAB_TITLES[activeTab] || 'Observability Console';

  return (
    <header
      className="glass-panel"
      style={{
        position: 'relative',
        zIndex: 50,
        height: '60px',
        flexShrink: 0,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        gap: '12px',
      }}
    >
      {/* Left: Clean Active Title (never truncates) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span
          style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
          }}
        >
          {activeTitle}
        </span>
      </div>

      {/* Center: Compact Telemetry Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--bg-card-subtle)',
          padding: '4px 14px',
          borderRadius: '9999px',
          border: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}
        className="telemetry-bar"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.775rem' }}>
          <span className="pulse-dot pulse-dot-green" />
          <span style={{ color: 'var(--text-muted)' }}>Jev:</span>
          <strong style={{ color: health.modelStatus === 'healthy' ? '#10b981' : '#f59e0b', fontFamily: 'var(--font-mono)' }}>
            {health.modelLatencyMs}ms
          </strong>
        </div>

        <div style={{ width: '1px', height: '12px', background: 'var(--border-subtle)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.775rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Cut:</span>
          <strong style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>98.6%</strong>
        </div>

        <div style={{ width: '1px', height: '12px', background: 'var(--border-subtle)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.775rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Slack:</span>
          <strong style={{ color: health.slackStatus === 'connected' ? '#10b981' : '#ef4444' }}>
            {health.slackStatus === 'connected' ? 'Connected' : `Held (${health.queuedAlertsCount})`}
          </strong>
        </div>
      </div>

      {/* Right: Operational Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Welcome Overview Link */}
        <button
          onClick={onGoHome}
          className="btn btn-sm btn-outline"
          title="Return to Welcome Overview"
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', fontSize: '0.75rem' }}
        >
          <Home size={13} />
          <span>Overview</span>
        </button>

        {/* Live stream toggle */}
        <button
          onClick={() => setLiveStreaming(!liveStreaming)}
          className={`btn btn-sm ${liveStreaming ? 'btn-secondary' : 'btn-outline'}`}
          title={liveStreaming ? 'Pause live stream intake' : 'Resume live stream intake'}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', fontSize: '0.75rem' }}
        >
          {liveStreaming ? (
            <>
              <span className="pulse-dot pulse-dot-green" />
              <Pause size={12} />
              <span>Live</span>
            </>
          ) : (
            <>
              <Play size={12} color="#94a3b8" />
              <span>Paused</span>
            </>
          )}
        </button>

        {/* Test Scenarios dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSimMenu(!showSimMenu)}
            className="btn btn-sm btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', fontSize: '0.75rem' }}
          >
            <Sparkles size={13} color="#f59e0b" />
            <span>Test Scenarios</span>
            <ChevronDown size={11} />
          </button>

          {showSimMenu && (
            <div
              className="card"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                width: '280px',
                padding: '8px',
                zIndex: 100,
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-strong)',
              }}
            >
              <div
                style={{
                  padding: '6px 10px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                URD Requirement Simulations
              </div>

              <button
                onClick={() => {
                  simulateIncomingBatch();
                  setShowSimMenu(false);
                }}
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '7px 10px', fontSize: '0.8125rem' }}
              >
                <Zap size={13} color="#3b82f6" />
                <span>Inject Error Batch (FR-01/04)</span>
              </button>

              <button
                onClick={() => {
                  toggleModelDegraded();
                  setShowSimMenu(false);
                }}
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '7px 10px', fontSize: '0.8125rem' }}
              >
                <Activity size={13} color="#f59e0b" />
                <span>Toggle Model Degraded (FR-16)</span>
              </button>

              <button
                onClick={() => {
                  toggleSlackOutage();
                  setShowSimMenu(false);
                }}
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '7px 10px', fontSize: '0.8125rem' }}
              >
                <AlertTriangle size={13} color="#ef4444" />
                <span>Toggle Slack Outage (FR-14)</span>
              </button>

              <button
                onClick={() => {
                  simulateOverloadBurst();
                  setShowSimMenu(false);
                }}
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '7px 10px', fontSize: '0.8125rem' }}
              >
                <Server size={13} color="#8b5cf6" />
                <span>Simulate 10k/sec Burst (FR-03)</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-sm btn-outline"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          style={{ width: '32px', height: '30px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
        </button>

        {/* User Account / Role */}
        {isAuthenticated && user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="btn btn-sm btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 8px' }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.625rem',
                  color: '#fff',
                  fontWeight: 700,
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
                <div style={{ fontSize: '0.5875rem', color: 'var(--text-muted)' }}>{user.role}</div>
              </div>
              <ChevronDown size={10} />
            </button>

            {showUserMenu && (
              <div
                className="card"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  width: '230px',
                  padding: '10px',
                  zIndex: 100,
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-strong)',
                }}
              >
                <div style={{ padding: '4px 6px 8px 6px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{user.name}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--brand-primary)', marginTop: '2px' }}>
                    {user.organization}
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                    onGoHome();
                  }}
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'flex-start', marginTop: '6px', color: '#f87171', padding: '6px 8px', fontSize: '0.75rem' }}
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={onOpenLogin} className="btn btn-sm btn-primary">
            <User size={13} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
