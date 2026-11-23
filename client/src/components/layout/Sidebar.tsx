import React from 'react';
import { useLogGate } from '../../context/LogGateContext';
import {
  LayoutDashboard,
  Flame,
  Layers,
  Terminal,
  Server,
  TrendingDown,
  Settings,
  Sliders,
  HardDrive,
  Cpu,
} from 'lucide-react';

export type ActiveTab =
  | 'overview'
  | 'incidents'
  | 'patterns'
  | 'sandbox'
  | 'fleet'
  | 'analytics'
  | 'tuning'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onGoHome?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { incidents, settings, connectedMachines } = useLogGate();

  const activeIncidentsCount = incidents.filter((i) => i.status === 'ACTIVE').length;
  const criticalCount = incidents.filter(
    (i) => i.status === 'ACTIVE' && i.modelDecision.severityLabel === 'High'
  ).length;

  const onlineMachinesCount = connectedMachines.filter((m) => m.status === 'healthy').length;

  const navGroups = [
    {
      title: 'PLATFORM',
      items: [
        {
          id: 'overview' as ActiveTab,
          label: 'Overview',
          icon: <LayoutDashboard size={16} />,
        },
        {
          id: 'incidents' as ActiveTab,
          label: 'Live Incidents',
          icon: <Flame size={16} />,
          badge: activeIncidentsCount > 0 ? (
            <span
              style={{
                padding: '1px 6px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                borderRadius: '9999px',
                background: criticalCount > 0 ? 'rgba(239, 68, 68, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                color: criticalCount > 0 ? '#f87171' : '#34d399',
                border: criticalCount > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              {activeIncidentsCount}
            </span>
          ) : null,
        },
        {
          id: 'patterns' as ActiveTab,
          label: 'Pattern Catalog',
          icon: <Layers size={16} />,
        },
      ],
    },
    {
      title: 'INTELLIGENCE & LABS',
      items: [
        {
          id: 'sandbox' as ActiveTab,
          label: 'Triage Sandbox',
          icon: <Terminal size={16} />,
        },
        {
          id: 'tuning' as ActiveTab,
          label: 'Sensitivity Tuner',
          icon: <Sliders size={16} />,
          badge: (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-input)',
                padding: '1px 5px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {settings.noiseFloor.toFixed(2)}
            </span>
          ),
        },
        {
          id: 'analytics' as ActiveTab,
          label: 'Cost & ROI Analytics',
          icon: <TrendingDown size={16} />,
          badge: (
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#10b981' }}>
              98.6%
            </span>
          ),
        },
      ],
    },
    {
      title: 'FLEET & CONFIG',
      items: [
        {
          id: 'fleet' as ActiveTab,
          label: 'Fleet & Host Nodes',
          icon: <Server size={16} />,
          badge: (
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              {onlineMachinesCount}/{connectedMachines.length}
            </span>
          ),
        },
        {
          id: 'settings' as ActiveTab,
          label: 'Project Settings',
          icon: <Settings size={16} />,
        },
      ],
    },
  ];

  return (
    <aside
      style={{
        width: '240px',
        flexShrink: 0,
        height: '100vh',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 30,
        userSelect: 'none',
      }}
    >
      {/* Navigation Groups */}
      <div style={{ padding: '16px 10px', overflowY: 'auto' }}>
        {navGroups.map((group) => (
          <div key={group.title} style={{ marginBottom: '20px' }}>
            <div
              style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                padding: '4px 12px 8px 12px',
              }}
            >
              {group.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: isActive ? 'var(--bg-card-hover)' : 'transparent',
                      color: isActive ? '#ededed' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 600 : 500,
                      position: 'relative',
                      textAlign: 'left',
                      transition: 'all 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {/* Active Emerald Left Border Indicator */}
                    {isActive && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '6px',
                          bottom: '6px',
                          width: '3px',
                          borderRadius: '2px',
                          background: '#10b981',
                        }}
                      />
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: isActive ? '#10b981' : 'var(--text-muted)' }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Supabase-Style Sidebar Footer: Node Health & Resource Footprint */}
      <div
        style={{
          padding: '14px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-card-subtle)',
          fontSize: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot pulse-dot-green" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Daemon Fleet</span>
          </div>
          <span style={{ color: '#10b981', fontWeight: 600 }}>Healthy</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Cpu size={11} />
            <span>Avg 3.4% CPU</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <HardDrive size={11} />
            <span>38 MB RAM</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
