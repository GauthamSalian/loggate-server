import React from 'react';
import { useLogGate } from '../../context/LogGateContext';
import { SlackIcon } from '../common/Icons';
import {
  Shield,
  Flame,
  Sliders,
  Database,
  TrendingDown,
  Terminal,
  Server,
  CheckCircle2,
  Cpu,
  HardDrive,
} from 'lucide-react';

export type ActiveTab =
  | 'incidents'
  | 'tuning'
  | 'patterns'
  | 'analytics'
  | 'sandbox'
  | 'fleet'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onGoHome?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, onGoHome }) => {
  const { incidents, health, settings } = useLogGate();

  const activeIncidentsCount = incidents.filter((i) => i.status === 'ACTIVE').length;
  const highSeverityCount = incidents.filter(
    (i) => i.status === 'ACTIVE' && i.modelDecision.severityLabel === 'High'
  ).length;

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: React.ReactNode }[] = [
    {
      id: 'incidents',
      label: 'Live Incidents',
      icon: <Flame size={18} />,
      badge: activeIncidentsCount > 0 ? (
        <span
          style={{
            padding: '2px 8px',
            fontSize: '0.6875rem',
            fontWeight: 700,
            borderRadius: '9999px',
            background: highSeverityCount > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
            color: highSeverityCount > 0 ? '#f87171' : '#60a5fa',
            border: highSeverityCount > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          {activeIncidentsCount}
        </span>
      ) : null,
    },
    {
      id: 'tuning',
      label: 'Noise-Floor Tuning',
      icon: <Sliders size={18} />,
      badge: (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--text-muted)',
            background: 'var(--bg-input)',
            padding: '1px 6px',
            borderRadius: '4px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {settings.noiseFloor.toFixed(2)}
        </span>
      ),
    },
    {
      id: 'patterns',
      label: 'Pattern Catalog',
      icon: <Database size={18} />,
    },
    {
      id: 'analytics',
      label: 'Cost & ROI Savings',
      icon: <TrendingDown size={18} />,
      badge: (
        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#10b981' }}>
          98.6%
        </span>
      ),
    },
    {
      id: 'sandbox',
      label: 'Safe Triage Sandbox',
      icon: <Terminal size={18} />,
    },
    {
      id: 'fleet',
      label: 'Host Fleet Nodes',
      icon: <Server size={18} />,
      badge: (
        <span style={{ fontSize: '0.6875rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span className="pulse-dot pulse-dot-green" style={{ width: '6px', height: '6px' }} />
          5
        </span>
      ),
    },
    {
      id: 'settings',
      label: 'Slack Routing',
      icon: <SlackIcon size={18} />,
      badge: health.slackStatus === 'unreachable' ? (
        <span
          style={{
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.6875rem',
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            fontWeight: 700,
          }}
        >
          Held ({health.queuedAlertsCount})
        </span>
      ) : (
        <span style={{ fontSize: '0.6875rem', color: '#10b981' }}>Live</span>
      ),
    },
  ];

  return (
    <aside
      className="glass-panel"
      style={{
        width: '264px',
        minWidth: '264px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid var(--border-subtle)',
        padding: '20px 14px 24px 14px',
        position: 'relative',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 40,
      }}
    >
      <div>
        {/* Brand Header */}
        <div
          onClick={onGoHome}
          style={{
            cursor: onGoHome ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '4px 8px 18px 8px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '16px',
          }}
          title={onGoHome ? 'Return to Welcome Overview' : undefined}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 16px rgba(59, 130, 246, 0.45)',
              flexShrink: 0,
            }}
          >
            <Shield size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              LogGate
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Self-Hosted Log Triage
            </span>
          </div>
        </div>

        {/* Section label */}
        <div
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            padding: '0 10px 8px 10px',
          }}
        >
          Workspace
        </div>

        {/* Navigation buttons */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid transparent',
                  background: isActive ? 'rgba(59, 130, 246, 0.14)' : 'transparent',
                  borderColor: isActive ? 'rgba(59, 130, 246, 0.35)' : 'transparent',
                  color: isActive ? '#60a5fa' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: isActive ? '#3b82f6' : 'inherit' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footprint Card (Compact, fits all screens without truncation) */}
      <div
        className="card"
        style={{
          padding: '12px 14px',
          background: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginTop: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>
            System Health
          </span>
          <span className="badge badge-success" style={{ padding: '2px 7px', fontSize: '0.625rem' }}>
            <CheckCircle2 size={10} /> Operational
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Jev Triage Engine:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: health.modelStatus === 'healthy' ? '#10b981' : '#f59e0b' }}>
              ~{health.modelLatencyMs}ms
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Fleet Reduction:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#10b981' }}>
              98.6% cut
            </span>
          </div>
        </div>

        {/* NFR-11 Resource Footprint meters */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Cpu size={11} color="#60a5fa" /> CPU Footprint:
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              3.4% &lt; 5%
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HardDrive size={11} color="#34d399" /> Memory:
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              38MB &lt; 50MB
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
