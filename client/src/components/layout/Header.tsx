import React from 'react';
import type { NavigationTab, TimeRange } from '../../types/log';
import {
  Search,
  Clock,
  Play,
  Pause,
  Sun,
  Moon,
  Activity,
  Menu,
  X,
} from 'lucide-react';

interface HeaderProps {
  activeTab: NavigationTab;
  onSelectTab?: (tab: NavigationTab) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onMobileMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  timeRange,
  onTimeRangeChange,
  searchQuery,
  onSearchChange,
  isStreaming,
  onToggleStreaming,
  theme,
  onToggleTheme,
  onMobileMenuClick,
}) => {
  const getTabTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'overview':
        return { title: 'System Overview', subtitle: 'Real-time telemetry, anomaly detection, and fleet performance' };
      case 'logs':
        return { title: 'Live Ingestion Stream', subtitle: 'Live log stream with multi-level filtering and trace tracing' };
      case 'agents':
        return { title: 'Agent Fleet Network', subtitle: 'Status, heartbeats, and throughput of connected loggate-agent nodes' };
      case 'metrics':
        return { title: 'Observability Analytics', subtitle: 'Throughput volume trends, latency distributions, and severity tiers' };
      case 'settings':
        return { title: 'Platform Preferences', subtitle: 'Streaming velocity, table density, and target API endpoints' };
    }
  };

  const { title, subtitle } = getTabTitle(activeTab);

  return (
    <header
      style={{
        height: '68px',
        padding: '0 28px',
        backgroundColor: 'var(--surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        gap: '16px',
      }}
    >
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
        {onMobileMenuClick && (
          <button
            type="button"
            onClick={onMobileMenuClick}
            className="mobile-menu-btn"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--text)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <Menu size={20} />
          </button>
        )}

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--text-bright)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}
            className="header-subtitle"
          >
            {subtitle}
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div
        style={{
          flex: '1 1 340px',
          maxWidth: '480px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Search
          size={15}
          style={{
            position: 'absolute',
            left: '12px',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            const val = e.target.value;
            onSearchChange(val);
            if (val.trim() && activeTab !== 'logs' && onSelectTab) {
              onSelectTab('logs');
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onSelectTab && activeTab !== 'logs') {
              onSelectTab('logs');
            }
          }}
          placeholder="Search logs, traces, or services... (e.g. timeout, 500, db)"
          style={{
            width: '100%',
            height: '38px',
            paddingLeft: '38px',
            paddingRight: searchQuery ? '36px' : '60px',
            fontSize: '13px',
            backgroundColor: 'var(--surface-input)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            color: 'var(--text-bright)',
            outline: 'none',
            fontFamily: 'var(--sans)',
          }}
          className="search-input"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            title="Clear search"
            style={{
              position: 'absolute',
              right: '10px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        ) : (
          <span
            style={{
              position: 'absolute',
              right: '10px',
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: 'var(--mono)',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'var(--chip-bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          >
            Ctrl K
          </span>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Stream Toggle Pill */}
        <button
          type="button"
          onClick={onToggleStreaming}
          title={isStreaming ? 'Pause simulated streaming' : 'Resume simulated streaming'}
          style={{
            height: '36px',
            padding: '0 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 700,
            borderRadius: '8px',
            border: isStreaming ? '1px solid var(--info-border)' : '1px solid var(--border)',
            backgroundColor: isStreaming ? 'var(--info-bg)' : 'var(--chip-bg)',
            color: isStreaming ? 'var(--info-text)' : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: isStreaming ? '0 0 16px var(--info-bg)' : 'none',
          }}
        >
          {isStreaming ? (
            <>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  animation: 'pulseGlow 2s infinite',
                }}
              />
              <Pause size={13} />
              <span>Streaming</span>
            </>
          ) : (
            <>
              <Play size={13} />
              <span>Paused</span>
            </>
          )}
        </button>

        {/* Time Range Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '36px',
            backgroundColor: 'var(--surface-input)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '0 4px',
            gap: '2px',
          }}
          className="time-range-group"
        >
          <Clock size={13} style={{ color: 'var(--text-muted)', margin: '0 4px' }} />
          {(['15m', '1h', '24h', '7d'] as TimeRange[]).map((range) => (
            <button
              type="button"
              key={range}
              onClick={() => onTimeRangeChange(range)}
              style={{
                height: '28px',
                padding: '0 10px',
                fontSize: '11px',
                fontWeight: timeRange === range ? 700 : 500,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: timeRange === range ? 'var(--accent)' : 'transparent',
                color: timeRange === range ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                boxShadow: timeRange === range ? '0 2px 8px rgba(99, 102, 241, 0.35)' : 'none',
              }}
            >
              {range}
            </button>
          ))}
        </div>

        {/* System Mode Chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            backgroundColor: 'var(--surface-input)',
            border: '1px solid var(--border)',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
          className="system-status-chip"
        >
          <Activity size={14} color="#818cf8" />
          <span style={{ fontWeight: 600 }}>Mock Telemetry</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface-input)',
            color: 'var(--text)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          className="theme-toggle-btn"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};
