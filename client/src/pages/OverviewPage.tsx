import React from 'react';
import type { LogEntry, MetricOverview, Agent } from '../types/log';
import { MetricCard } from '../components/common/MetricCard';
import { LogVolumeChart } from '../components/common/LogVolumeChart';
import { SeverityBadge, AgentStatusBadge } from '../components/common/Badge';
import { SampleDataBanner } from '../components/common/SampleDataBanner';
import {
  FileText,
  AlertOctagon,
  Server,
  Zap,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

interface OverviewPageProps {
  metrics: MetricOverview;
  logs: LogEntry[];
  agents: Agent[];
  onNavigateToLogs: () => void;
  onNavigateToAgents: () => void;
  onNavigateToSettings: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  metrics,
  logs,
  agents,
  onNavigateToLogs,
  onNavigateToAgents,
  onNavigateToSettings,
}) => {
  const criticalLogs = logs.filter((l) => l.level === 'ERROR' || l.level === 'WARN').slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Sample Data Banner */}
      <SampleDataBanner onGoToSettings={onNavigateToSettings} />

      {/* 4 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <MetricCard
          title="Total Logs Ingested"
          value={metrics.totalLogs.toLocaleString()}
          subtitle="Across all registered clusters"
          trend={{ value: '+14.2%', isPositive: true }}
          icon={<FileText size={18} />}
          accentColor="#6366f1"
        />

        <MetricCard
          title="Fleet Error Rate"
          value={`${metrics.errorRate}%`}
          subtitle="Errors & exceptions percentage"
          trend={{ value: metrics.errorRate > 5 ? '+1.2%' : '-0.4%', isPositive: metrics.errorRate <= 5 }}
          icon={<AlertOctagon size={18} />}
          accentColor="#ef4444"
        />

        <MetricCard
          title="Active Agents"
          value={`${metrics.activeAgents} / ${agents.length}`}
          subtitle="Live log forwarders streaming"
          trend={{ value: 'Fleet Healthy', isPositive: true }}
          icon={<Server size={18} />}
          accentColor="#10b981"
        />

        <MetricCard
          title="Throughput"
          value={`${metrics.logsPerSec} /s`}
          subtitle="Current ingestion velocity"
          trend={{ value: 'Real-time', isNeutral: true }}
          icon={<Zap size={18} />}
          accentColor="#a855f7"
        />
      </div>

      {/* Log Volume Chart */}
      <LogVolumeChart data={metrics.volumeTimeline} />

      {/* Two-Column Lower Section: Critical Events & Fleet Status */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Left: Recent Critical / Warn Logs */}
        <div
          className="glass-panel"
          style={{
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-bright)' }}>
                Recent Critical Warnings & Errors
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                High-priority incidents requiring inspection
              </span>
            </div>
            <button
              type="button"
              onClick={onNavigateToLogs}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: 'var(--accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Live Stream <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {criticalLogs.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                <TrendingDown size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                No critical errors detected recently!
              </div>
            ) : (
              criticalLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={onNavigateToLogs}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: log.level === 'ERROR' ? 'var(--error-bg)' : 'var(--warn-bg)',
                    border: log.level === 'ERROR' ? '1px solid var(--error-border)' : '1px solid var(--warn-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                  className="card-hover-fx"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <SeverityBadge level={log.level} />
                      <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {log.service}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--mono)',
                      color: 'var(--text-bright)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Fleet Summary & Agent Status */}
        <div
          className="glass-panel"
          style={{
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-bright)' }}>
                Ingestion Agents
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Status of registered `loggate-agent` forwarders
              </span>
            </div>
            <button
              type="button"
              onClick={onNavigateToAgents}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: 'var(--accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              All Agents <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {agents.slice(0, 4).map((agent) => (
              <div
                key={agent.id}
                onClick={onNavigateToAgents}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
                className="card-hover-fx"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      color: '#818cf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Server size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-bright)' }}>
                      {agent.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                      {agent.host} • {agent.ip}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <AgentStatusBadge status={agent.status} />
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {agent.logsShipped.toLocaleString()} logs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
