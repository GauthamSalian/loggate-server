import React from 'react';
import type { NavigationTab } from '../../types/log';
import {
  LayoutDashboard,
  ScrollText,
  Server,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  logCount: number;
  agentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  logCount,
  agentCount,
}) => {
  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
  }> = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: 'logs',
      label: 'Live Stream',
      icon: <ScrollText size={18} />,
      badge: logCount > 0 ? (logCount > 999 ? '999+' : logCount) : undefined,
    },
    {
      id: 'agents',
      label: 'Agents',
      icon: <Server size={18} />,
      badge: agentCount,
    },
    {
      id: 'metrics',
      label: 'Analytics',
      icon: <BarChart3 size={18} />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={18} />,
    },
  ];

  return (
    <aside
      style={{
        width: collapsed ? '74px' : '250px',
        minWidth: collapsed ? '74px' : '250px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 40,
        userSelect: 'none',
      }}
    >
      {/* Top Branding */}
      <div>
        <div
          style={{
            height: '68px',
            padding: collapsed ? '0 16px' : '0 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
            }}
            onClick={() => onSelectTab('overview')}
            title="LogGate Server"
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <Zap size={18} fill="#fff" />
            </div>

            {!collapsed && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--text-bright)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    LogGate
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '1px 5px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--chip-bg)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    Server
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Observability
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ padding: '18px 12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'space-between',
                  padding: collapsed ? '11px 0' : '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: isActive ? 'var(--accent-bg)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  position: 'relative',
                  borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                }}
                className={`nav-btn ${isActive ? 'nav-active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ display: 'flex', color: isActive ? 'var(--accent)' : 'inherit' }}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </div>

                {!collapsed && item.badge !== undefined && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor: isActive ? 'var(--accent-bg)' : 'var(--chip-bg)',
                      color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                      border: '1px solid var(--border)',
                      fontFamily: 'var(--mono)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status & Collapse */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        {!collapsed ? (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--surface-card)',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Fleet Status
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  color: '#34d399',
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    animation: 'pulseGlow 2s infinite',
                  }}
                />
                Live Flow
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <ShieldCheck size={14} color="#818cf8" />
              <span>v0.1.0-alpha • Client Mock</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                animation: 'pulseGlow 2s infinite',
              }}
              title="Telemetry Live Flow"
            />
          </div>
        )}

        {/* Toggle Collapse */}
        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            marginTop: '12px',
            width: '100%',
            height: '34px',
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
          className="collapse-btn"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};
