import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Copy,
  CheckCheck,
  Code2,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../lib/api';
import type { ActiveTab } from './Sidebar';
import { springTransition, fadeInSlideUp } from '../../lib/motion';

const TAB_LABELS: Record<ActiveTab, string> = {
  dashboard: 'Overview',
  triage: 'Triage & Pattern Explorer',
  'triage-sandbox': 'Triage Sandbox & Testing',
  agents: 'Fleet & Agents',
  tokens: 'API Keys & Setup',
  settings: 'Project Settings',
};

interface NavbarProps {
  activeTab: ActiveTab;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab }) => {
  const { user, logout } = useAuth();
  const [showUser, setShowUser] = useState(false);

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileTab, setProfileTab] = useState<'details' | 'json'>('details');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '??';

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await authApi.me();
      setProfileData(res.user || null);
    } catch {
      // Fallback to local decoded token user
      setProfileData({
        user_id: user?.user_id || '1',
        username: user?.username || 'User',
        email: user?.email || 'user@loggate.io',
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleOpenProfile = async () => {
    setShowUser(false);
    setShowProfileModal(true);
    await fetchProfile();
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <header className="navbar">
      {/* Breadcrumb */}
      <div className="navbar-breadcrumb">
        <span className="breadcrumb-root">LogGate</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-active">{TAB_LABELS[activeTab]}</span>
      </div>

      {/* Right controls */}
      <div className="navbar-actions">
        <button className="icon-btn" title="Notifications">
          <Bell size={16} />
        </button>

        <div className="user-menu-wrapper">
          <motion.button
            className="user-trigger"
            onClick={() => setShowUser(!showUser)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={springTransition}
          >
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <span className="user-name">{user?.username ?? 'User'}</span>
              <span className="user-email">{user?.email ?? ''}</span>
            </div>
            <ChevronDown size={13} />
          </motion.button>

          <AnimatePresence>
            {showUser && (
              <motion.div
                className="user-dropdown"
                variants={fadeInSlideUp}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="dropdown-header">
                  <div className="user-avatar user-avatar--lg">{initials}</div>
                  <div>
                    <div className="dropdown-name">{user?.username}</div>
                    <div className="dropdown-email">{user?.email}</div>
                  </div>
                </div>
                <div className="dropdown-divider" />

                {/* Profile Tab Item */}
                <button
                  className="dropdown-item"
                  onClick={handleOpenProfile}
                  style={{ gap: '9px', color: '#18181b', fontWeight: 500 }}
                >
                  <UserIcon size={14} className="text-zinc-500" />
                  <span>User Profile (/me)</span>
                </button>

                <div className="dropdown-divider" />
                <button className="dropdown-item dropdown-item--danger" onClick={logout}>
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* User Profile (/me) Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
            <motion.div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              variants={fadeInSlideUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ maxWidth: '560px' }}
            >
              {/* Modal Header */}
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="user-avatar" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                    {initials}
                  </div>
                  <div>
                    <h3 className="modal-title" style={{ margin: 0, fontSize: '1rem' }}>User Profile Details</h3>
                    <span style={{ fontSize: '0.6875rem', color: '#71717a', fontFamily: 'JetBrains Mono, monospace' }}>
                      GET /api/v1/auth/me
                    </span>
                  </div>
                </div>
                <button className="icon-btn" onClick={() => setShowProfileModal(false)}>✕</button>
              </div>

              {/* Tabs inside Profile Modal */}
              <div style={{ display: 'flex', gap: '6px', margin: '14px 0', borderBottom: '1px solid #e4e4e7', paddingBottom: '8px' }}>
                <button
                  onClick={() => setProfileTab('details')}
                  className={`install-tab ${profileTab === 'details' ? 'install-tab--active' : ''}`}
                  style={{ border: 'none', padding: '6px 12px', fontSize: '0.8125rem' }}
                >
                  <UserIcon size={13} />
                  <span>Profile Overview</span>
                </button>
                <button
                  onClick={() => setProfileTab('json')}
                  className={`install-tab ${profileTab === 'json' ? 'install-tab--active' : ''}`}
                  style={{ border: 'none', padding: '6px 12px', fontSize: '0.8125rem' }}
                >
                  <Code2 size={13} />
                  <span>Raw API Response (/me)</span>
                </button>

                <button
                  className="icon-btn"
                  onClick={fetchProfile}
                  title="Refresh /me profile"
                  style={{ marginLeft: 'auto' }}
                  disabled={loadingProfile}
                >
                  <RefreshCw size={13} className={loadingProfile ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Tab 1: Profile Overview */}
              {profileTab === 'details' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Account Badge Card */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="user-avatar user-avatar--lg" style={{ fontSize: '0.875rem' }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#09090b' }}>
                          {String(profileData?.username || user?.username || 'Authenticated User')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {String(profileData?.email || user?.email || 'user@loggate.io')}
                        </div>
                      </div>
                    </div>
                    <span className="badge badge--emerald" style={{ gap: '5px' }}>
                      <ShieldCheck size={12} />
                      Active Session
                    </span>
                  </div>

                  {/* Field Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {/* User ID */}
                    <div style={{ padding: '12px 14px', border: '1px solid #e4e4e7', borderRadius: '8px', background: '#fff' }}>
                      <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
                        User ID / UUID
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                        <code className="mono text-xs">{String(profileData?.user_id || user?.user_id || '1')}</code>
                        <button
                          className="icon-btn"
                          onClick={() => handleCopy(String(profileData?.user_id || user?.user_id || '1'), 'id')}
                          title="Copy User ID"
                        >
                          {copiedKey === 'id' ? <CheckCheck size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>

                    {/* Username */}
                    <div style={{ padding: '12px 14px', border: '1px solid #e4e4e7', borderRadius: '8px', background: '#fff' }}>
                      <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
                        Username
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#09090b' }}>
                          {String(profileData?.username || user?.username || 'User')}
                        </span>
                        <button
                          className="icon-btn"
                          onClick={() => handleCopy(String(profileData?.username || user?.username || 'User'), 'username')}
                          title="Copy Username"
                        >
                          {copiedKey === 'username' ? <CheckCheck size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>

                    {/* Email */}
                    <div style={{ padding: '12px 14px', border: '1px solid #e4e4e7', borderRadius: '8px', background: '#fff' }}>
                      <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
                        Email Address
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.8125rem', color: '#3f3f46', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {String(profileData?.email || user?.email || 'user@loggate.io')}
                        </span>
                        <button
                          className="icon-btn"
                          onClick={() => handleCopy(String(profileData?.email || user?.email || 'user@loggate.io'), 'email')}
                          title="Copy Email"
                        >
                          {copiedKey === 'email' ? <CheckCheck size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>

                    {/* Auth Strategy */}
                    <div style={{ padding: '12px 14px', border: '1px solid #e4e4e7', borderRadius: '8px', background: '#fff' }}>
                      <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
                        Authentication Method
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <KeyRound size={13} style={{ color: '#89F336' }} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#09090b' }}>Bearer JWT (HS256)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Raw /me JSON */}
              {profileTab === 'json' && (
                <div style={{ background: '#0f172a', borderRadius: '8px', padding: '14px', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.6875rem', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
                      Response Body
                    </span>
                    <button
                      className="icon-btn"
                      onClick={() => handleCopy(JSON.stringify({ status: 'success', user: profileData }, null, 2), 'raw')}
                      style={{ color: '#cbd5e1' }}
                      title="Copy JSON"
                    >
                      {copiedKey === 'raw' ? <CheckCheck size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <pre style={{ margin: 0, fontSize: '0.75rem', color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', maxHeight: '200px', overflowY: 'auto' }}>
                    {JSON.stringify({ status: 'success', user: profileData }, null, 2)}
                  </pre>
                </div>
              )}

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowProfileModal(false)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

// Alias for backward compat
export { UserIcon as User };
