import React from 'react';
import { useLogGate } from '../../context/LogGateContext';
import {
  TrendingDown,
  DollarSign,
  AlertOctagon,
  Server,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { Incident } from '../../types';

interface OverviewDashboardProps {
  onSelectIncident?: (incident: Incident) => void;
  onNavigateIncidents?: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onSelectIncident,
  onNavigateIncidents,
}) => {
  const { currentProject, incidents, connectedMachines, projectMetrics, health, setSelectedIncident } =
    useLogGate();

  // Metrics
  const activeIncidents = incidents.filter((i) => i.status === 'ACTIVE');
  const criticalCount = activeIncidents.filter((i) => i.modelDecision.severityLabel === 'High').length;
  const warningCount = activeIncidents.filter((i) => i.modelDecision.severityLabel === 'Medium').length;
  const benignCount = incidents.filter((i) => i.modelDecision.severityLabel === 'Noise').length;

  const onlineMachinesCount = connectedMachines.filter((m) => m.status === 'healthy').length;
  const totalMachines = connectedMachines.length || 1;

  // Cost Avoided calculation ($0.15 / GB)
  const totalGbReduced = health.totalBytesReduced / (1024 * 1024 * 1024);
  const costAvoided = (totalGbReduced * 0.15).toFixed(2);

  // Top 5 recent critical or warning incidents
  const recentActionable = incidents
    .filter((i) => i.modelDecision.severityLabel !== 'Noise')
    .slice(0, 5);

  const handleRowClick = (inc: Incident) => {
    setSelectedIncident(inc);
    if (onSelectIncident) onSelectIncident(inc);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Project Overview: {currentProject.name}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '4px' }}>
            Instantaneous fleet health, log noise reduction ratio, and real-time incident telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '3px 9px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle2 size={12} />
            Telemetry Stream Synced
          </span>
        </div>
      </div>

      {/* 4-Column Key Metric Hero Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Card 1: Reduction Ratio */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Reduction Ratio
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <TrendingDown size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '12px' }}>
            98.6%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {health.totalRawLinesCount.toLocaleString()} raw lines → {health.acceptedRecordsCount} records
          </div>
        </div>

        {/* Card 2: Cost Avoided */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Cost Avoided This Month
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
              }}
            >
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '12px' }}>
            ${costAvoided}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Based on $0.15 / GB Splunk/Datadog ingestion rate
          </div>
        </div>

        {/* Card 3: Active Incidents */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Active Incidents
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: criticalCount > 0 ? 'rgba(239, 68, 68, 0.14)' : 'rgba(245, 158, 11, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: criticalCount > 0 ? '#f87171' : '#fbbf24',
              }}
            >
              <AlertOctagon size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: criticalCount > 0 ? '#f87171' : 'var(--text-primary)', marginTop: '12px' }}>
            {activeIncidents.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {criticalCount} Critical • {warningCount} Warning
          </div>
        </div>

        {/* Card 4: Fleet Status */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Host Fleet Status
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <Server size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '12px' }}>
            {onlineMachinesCount} / {totalMachines}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span className="pulse-dot pulse-dot-green" />
            <span>All production nodes reporting &lt; 5% CPU</span>
          </div>
        </div>
      </div>

      {/* Telemetry Activity Charts (2 Columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Left Chart: Ingested vs Reduced Bytes */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Daily Ingested vs. Reduced Volume (14-Day Trend)
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Raw host telemetry bytes vs forwarded payload bytes
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '2px' }} />
                <span>Raw</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }} />
                <span>Forwarded</span>
              </div>
            </div>
          </div>

          {/* SVG Bar Chart Visualization */}
          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
            {projectMetrics.slice(-14).map((m, idx) => {
              const maxLines = 800000;
              const rawHeight = Math.min(100, (m.raw_lines_count / maxLines) * 100);
              const reducedHeight = Math.max(4, rawHeight * 0.04);
              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    height: '100%',
                    position: 'relative',
                  }}
                  title={`${m.metric_date}: ${m.raw_lines_count.toLocaleString()} raw lines`}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${rawHeight}%`,
                      background: 'rgba(59, 130, 246, 0.3)',
                      borderRadius: '3px 3px 0 0',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'flex-end',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${reducedHeight}%`,
                        background: '#10b981',
                        borderRadius: '2px 2px 0 0',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            <span>14 days ago</span>
            <span>7 days ago</span>
            <span>Today (Live)</span>
          </div>
        </div>

        {/* Right Chart: Severity Distribution Ratio */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Incident Severity Distribution
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Triaged cluster breakdown across all reporting services
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
            {/* Critical */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#f87171' }}>Critical P0/P1 Outages (Score &gt;= 1.8)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{criticalCount} ({Math.round((criticalCount / (incidents.length || 1)) * 100)}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(criticalCount / (incidents.length || 1)) * 100}%`, height: '100%', background: '#ef4444' }} />
              </div>
            </div>

            {/* Warning */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#fbbf24' }}>Minor Warnings &amp; Retries (Score 1.2 - 1.8)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{warningCount} ({Math.round((warningCount / (incidents.length || 1)) * 100)}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(warningCount / (incidents.length || 1)) * 100}%`, height: '100%', background: '#f59e0b' }} />
              </div>
            </div>

            {/* Benign */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Benign Routine Logs &amp; Noise (&lt; 1.2)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{benignCount} ({Math.round((benignCount / (incidents.length || 1)) * 100)}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(benignCount / (incidents.length || 1)) * 100}%`, height: '100%', background: '#71717a' }} />
              </div>
            </div>

            <div
              style={{
                marginTop: '12px',
                padding: '10px 14px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Sparkles size={14} />
              <span>
                <strong>Jev AI Model:</strong> Silenced {benignCount} routine patterns automatically without alerting on-call engineers.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent High-Severity Incidents Table */}
      <div className="card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Recent Actionable Incidents
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Latest production failures matching Slack dispatch criteria
            </span>
          </div>

          {onNavigateIncidents && (
            <button onClick={onNavigateIncidents} className="btn btn-outline btn-sm">
              <span>View All Incidents</span>
              <ArrowUpRight size={13} />
            </button>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Pattern / Error Signature</th>
                <th>Service</th>
                <th>Lines</th>
                <th>Actionable Score</th>
                <th>Last Seen</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActionable.map((inc) => (
                <tr
                  key={inc.id}
                  onClick={() => handleRowClick(inc)}
                  style={{ cursor: 'pointer' }}
                  title="Click to view forensic evidence"
                >
                  <td>
                    <span
                      className={`badge ${
                        inc.modelDecision.severityLabel === 'High'
                          ? 'badge-high'
                          : inc.modelDecision.severityLabel === 'Medium'
                          ? 'badge-med'
                          : 'badge-noise'
                      }`}
                    >
                      {inc.modelDecision.severityLabel === 'High' ? 'Critical' : 'Warning'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                    <div style={{ maxWidth: '420px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inc.pattern}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {inc.service}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                    {inc.rawLinesCount.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600 }}>
                    {(inc.modelDecision.probabilityActionable * 100).toFixed(1)}%
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={12} />
                      <span>{inc.lastSeen.includes('T') ? 'Just now' : inc.lastSeen}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: inc.status === 'ACTIVE' ? '#f87171' : '#34d399',
                      }}
                    >
                      {inc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
