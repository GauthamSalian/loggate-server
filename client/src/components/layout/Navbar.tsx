import React, { useState, useRef, useEffect } from 'react';
import { useLogGate } from '../../context/LogGateContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { ActiveTab } from './Sidebar';
import {
  Shield,
  ChevronDown,
  Check,
  Plus,
  Zap,
  Activity,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  AlertTriangle,
  Play,
  Pause,
  Server,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  activeTab?: ActiveTab;
  onOpenLogin: () => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onGoHome }) => {
  const {
    projects,
    currentProject,
    setCurrentProject,
    createNewProject,
    health,
    liveStreaming,
    setLiveStreaming,
    simulateIncomingBatch,
    simulateOverloadBurst,
    toggleModelDegraded,
    toggleSlackOutage,
  } = useLogGate();

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedEnv, setSelectedEnv] = useState<'prod' | 'staging'>('prod');
  const [showSimMenu, setShowSimMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const projDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const simDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (projDropdownRef.current && !projDropdownRef.current.contains(e.target as Node)) {
        setProjectDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (simDropdownRef.current && !simDropdownRef.current.contains(e.target as Node)) {
        setShowSimMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    await createNewProject(newProjectName.trim());
    setNewProjectName('');
    setShowNewProjectModal(false);
  };

  return (
    <>
      <header
        style={{
          height: '58px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 40,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Left: Supabase-Style Project Switcher Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Logo */}
          <div
            onClick={onGoHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <Shield size={17} />
            </div>
            <span
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              LogGate
            </span>
          </div>

          {/* Breadcrumb Separator */}
          <span style={{ color: 'var(--border-strong)', fontSize: '1.1rem', fontWeight: 300 }}>/</span>

          {/* Project Switcher Dropdown */}
          <div ref={projDropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 10px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.8125rem',
              }}
            >
              <Layers size={14} color="#10b981" />
              <span>{currentProject.name}</span>
              <ChevronDown size={13} color="var(--text-muted)" />
            </button>

            {projectDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '6px',
                  width: '260px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  padding: '6px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-muted)',
                    padding: '6px 10px 4px 10px',
                  }}
                >
                  Your Projects
                </div>

                {projects.map((proj) => {
                  const isCurrent =
                    (proj.project_id || proj.id) === (currentProject.project_id || currentProject.id);
                  return (
                    <div
                      key={proj.project_id || proj.id}
                      onClick={() => {
                        setCurrentProject(proj);
                        setProjectDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        background: isCurrent ? 'var(--bg-card-hover)' : 'transparent',
                        color: isCurrent ? '#10b981' : 'var(--text-primary)',
                      }}
                      className="dropdown-item"
                    >
                      <span style={{ fontWeight: isCurrent ? 600 : 400 }}>{proj.name}</span>
                      {isCurrent && <Check size={14} color="#10b981" />}
                    </div>
                  );
                })}

                <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '6px 0' }} />

                <button
                  onClick={() => {
                    setProjectDropdownOpen(false);
                    setShowNewProjectModal(true);
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start', gap: '6px' }}
                >
                  <Plus size={13} color="#10b981" />
                  <span>Create New Project</span>
                </button>
              </div>
            )}
          </div>

          {/* Environment Tag */}
          <div
            onClick={() => setSelectedEnv(selectedEnv === 'prod' ? 'staging' : 'prod')}
            title="Click to toggle environment"
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              userSelect: 'none',
              background: selectedEnv === 'prod' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.14)',
              color: selectedEnv === 'prod' ? '#34d399' : '#fbbf24',
              border: `1px solid ${selectedEnv === 'prod' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            }}
          >
            {selectedEnv}
          </div>
        </div>

        {/* Right: Telemetry, Sandbox & User Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Uptime Health Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <span className="pulse-dot pulse-dot-green" />
            <span style={{ color: 'var(--text-secondary)' }}>99.9% Uptime</span>
          </div>

          {/* Live Feed Toggle */}
          <button
            onClick={() => setLiveStreaming(!liveStreaming)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 9px' }}
            title={liveStreaming ? 'Pause live stream' : 'Resume live stream'}
          >
            {liveStreaming ? (
              <>
                <Pause size={12} color="#10b981" />
                <span style={{ fontSize: '0.75rem' }}>Live</span>
              </>
            ) : (
              <>
                <Play size={12} color="var(--text-muted)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Paused</span>
              </>
            )}
          </button>

          {/* Resilience / Test Scenarios */}
          <div ref={simDropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSimMenu(!showSimMenu)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={13} color="#3b82f6" />
              <span>Scenarios</span>
              <ChevronDown size={12} />
            </button>

            {showSimMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  width: '240px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  padding: '6px',
                }}
              >
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', padding: '6px 10px' }}>
                  Chaos Testing (NFR Resilience)
                </div>
                <button
                  onClick={() => {
                    toggleModelDegraded();
                    setShowSimMenu(false);
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }}
                >
                  <AlertTriangle size={13} color="#f59e0b" />
                  <span>Toggle Jev Latency ({health.modelStatus === 'degraded' ? 'Recover' : 'Degrade'})</span>
                </button>
                <button
                  onClick={() => {
                    simulateOverloadBurst();
                    setShowSimMenu(false);
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }}
                >
                  <Server size={13} color="#ef4444" />
                  <span>Simulate Overload Drop (FR-03)</span>
                </button>
                <button
                  onClick={() => {
                    toggleSlackOutage();
                    setShowSimMenu(false);
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }}
                >
                  <Activity size={13} color="#60a5fa" />
                  <span>Simulate Slack Webhook Outage</span>
                </button>
                <button
                  onClick={() => {
                    simulateIncomingBatch();
                    setShowSimMenu(false);
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }}
                >
                  <Zap size={13} color="#10b981" />
                  <span>Inject Log Batch Now</span>
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            style={{ width: '32px', height: '32px', padding: 0 }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* User Menu */}
          <div ref={userDropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#10b981',
                  color: '#0c0d0e',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{user?.name || 'Admin'}</span>
              <ChevronDown size={12} color="var(--text-muted)" />
            </button>

            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  width: '220px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  padding: '8px',
                }}
              >
                <div style={{ padding: '6px 8px 10px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{user?.name || 'Platform Admin'}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{user?.email || 'admin@loggate.io'}</div>
                  <div
                    style={{
                      display: 'inline-block',
                      marginTop: '4px',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                    }}
                  >
                    {user?.role || 'Owner'}
                  </div>
                </div>

                <div style={{ paddingTop: '6px' }}>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', color: '#f87171', border: 'none' }}
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="modal-overlay" onClick={() => setShowNewProjectModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
              Create New Project
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '18px' }}>
              A project isolates your machines, API keys, error patterns, and alerting configurations.
            </p>

            <form onSubmit={handleCreateProjectSubmit}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  Project Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. auth-service-prod"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
