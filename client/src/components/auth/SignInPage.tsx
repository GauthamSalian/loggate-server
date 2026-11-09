import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';
import type { UserProfile } from '../../types';

interface SignInPageProps {
  onBackToWelcome: () => void;
  onSuccess: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onBackToWelcome, onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@loggate.io');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState<UserProfile['role']>('Platform Admin');
  const [org, setOrg] = useState('Production Infrastructure');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role, org);
    onSuccess();
  };

  const handleQuickRole = (targetRole: UserProfile['role'], targetEmail: string, targetOrg: string) => {
    login(targetEmail, targetRole, targetOrg);
    onSuccess();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.12) 0%, transparent 50%), var(--bg-main)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '32px 20px',
      }}
    >
      <div style={{ maxWidth: '460px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Back Link without arrow */}
        <button
          onClick={onBackToWelcome}
          className="btn btn-outline btn-sm"
          style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>Back to Overview</span>
        </button>

        {/* Card */}
        <div
          className="card"
          style={{
            padding: '36px',
            boxShadow: 'var(--shadow-lg)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-strong)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--brand-gradient)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                marginBottom: '12px',
              }}
            >
              <Shield size={26} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Sign In to LogGate
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '6px' }}>
              Self-hosted log triage &amp; alert routing console (NFR-06)
            </p>
          </div>

          {/* Quick 1-Click Role Login */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '10px',
                textAlign: 'center',
              }}
            >
              Instant 1-Click Sign In
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickRole('Platform Admin', 'admin@loggate.io', 'Production Infrastructure')}
                className="btn btn-secondary btn-sm"
                style={{ flexDirection: 'column', padding: '10px 6px', textAlign: 'center' }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#60a5fa' }}>Platform Admin</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Full Access</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('On-Call SRE', 'oncall@loggate.io', 'Site Reliability Engineering')}
                className="btn btn-secondary btn-sm"
                style={{ flexDirection: 'column', padding: '10px 6px', textAlign: 'center' }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#34d399' }}>On-Call SRE</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Incident Pager</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('Service Owner', 'lead@loggate.io', 'Payment & API Services')}
                className="btn btn-secondary btn-sm"
                style={{ flexDirection: 'column', padding: '10px 6px', textAlign: 'center' }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#fbbf24' }}>Service Owner</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Patterns</span>
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: '20px 0',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            <span>OR ENTER CREDENTIALS</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Work Email
              </label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Role
                </label>
                <select
                  className="input-field"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserProfile['role'])}
                >
                  <option value="Platform Admin">Platform Admin</option>
                  <option value="On-Call SRE">On-Call SRE</option>
                  <option value="Service Owner">Service Owner</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Organization
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', padding: '12px', fontWeight: 600 }}>
              <span>Sign In to Console</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
