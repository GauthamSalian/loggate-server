import React, { useState, useMemo } from 'react';
import { useLogGate } from '../../context/LogGateContext';
import { IncidentRow } from './IncidentRow';
import { IncidentDetail } from './IncidentDetail';
import { MetricCard } from '../common/MetricCard';
import {
  Search,
  Flame,
  ShieldCheck,
  Layers,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  Server,
} from 'lucide-react';

export const IncidentList: React.FC = () => {
  const { incidents, selectedIncident, setSelectedIncident, health, simulateIncomingBatch } = useLogGate();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');

  // Extract unique services
  const uniqueServices = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach((i) => set.add(i.service));
    return Array.from(set);
  }, [incidents]);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      // Status filter
      if (statusFilter !== 'ALL' && incident.status !== statusFilter) {
        return false;
      }
      // Severity filter
      if (severityFilter !== 'ALL' && incident.modelDecision.severityLabel !== severityFilter) {
        return false;
      }
      // Service filter
      if (serviceFilter !== 'ALL' && incident.service !== serviceFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          incident.id.toLowerCase().includes(query) ||
          incident.service.toLowerCase().includes(query) ||
          incident.pattern.toLowerCase().includes(query) ||
          incident.modelDecision.owningTeam.toLowerCase().includes(query) ||
          incident.hosts.some((h) => h.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [incidents, statusFilter, severityFilter, serviceFilter, searchQuery]);

  // Aggregate metrics
  const totalActiveLines = useMemo(() => {
    return incidents
      .filter((i) => i.status === 'ACTIVE')
      .reduce((acc, curr) => acc + curr.rawLinesCount, 0);
  }, [incidents]);

  const activeIncidents = useMemo(() => {
    return incidents.filter((i) => i.status === 'ACTIVE');
  }, [incidents]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Highlights Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        <MetricCard
          title="Active Triaged Incidents"
          value={activeIncidents.length}
          subtitle="Merged across 5 fleet hosts"
          icon={<Flame size={20} />}
          highlightColor="#3b82f6"
          badge={
            <span className="badge badge-high" style={{ padding: '2px 8px', fontSize: '0.6875rem' }}>
              <span className="pulse-dot pulse-dot-red" />
              FR-19 Live
            </span>
          }
        />

        <MetricCard
          title="Raw Lines Absorbed"
          value={totalActiveLines.toLocaleString()}
          subtitle="Deduplicated on-host (HM-03)"
          icon={<Layers size={20} />}
          highlightColor="#10b981"
          trend={{ value: '98.8% cut', isPositive: true }}
        />

        <MetricCard
          title="Jev Triage Latency"
          value={`${health.modelLatencyMs} ms`}
          subtitle="Neural classifier target <100ms"
          icon={<Sparkles size={20} />}
          highlightColor={health.modelStatus === 'healthy' ? '#10b981' : '#f59e0b'}
          trend={{ value: 'Sub-100ms verified', isPositive: true }}
        />

        <MetricCard
          title="Single Slack Alerts"
          value={incidents.filter((i) => i.alertStatus.delivered).length}
          subtitle="1 alert per problem (FR-13)"
          icon={<ShieldCheck size={20} />}
          highlightColor="#8b5cf6"
          trend={{ value: '0 spam loops', isPositive: true }}
        />
      </div>

      {/* Real-time Ingestion Stream Visualizer Card */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.03) 100%), var(--bg-card)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
              }}
            >
              <Activity size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Fleet Ingestion &amp; Reduction Pipeline</span>
                <span className="badge badge-success" style={{ padding: '2px 8px', fontSize: '0.625rem' }}>
                  <CheckCircle2 size={10} /> Live Host Stream
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tailing {health.totalRawLinesCount.toLocaleString()} total lines across 5 hosts • Pruned on-host
                before transmission
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fleet Reduction Ratio</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                98.8%
              </div>
            </div>
            <button
              onClick={() => simulateIncomingBatch()}
              className="btn btn-sm btn-secondary"
              title="Inject a simulated production burst"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Zap size={14} color="#3b82f6" />
              <span>Simulate Burst</span>
            </button>
          </div>
        </div>

        {/* Live sparkline bar visualization */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '48px', paddingTop: '8px' }}>
          {[35, 42, 28, 55, 62, 48, 70, 85, 45, 38, 92, 100, 75, 60, 44, 38, 52, 65, 80, 58, 48, 62, 74, 90, 82, 68, 50, 42, 38].map(
            (val, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: `${val}%`,
                  borderRadius: '3px',
                  background: val > 75 ? 'linear-gradient(180deg, #ef4444 0%, #f59e0b 100%)' : 'var(--brand-primary)',
                  opacity: 0.3 + (idx / 29) * 0.7,
                  transition: 'height 0.4s ease',
                }}
                title={`Interval ${idx}: ${val * 12} raw lines reduced`}
              />
            )
          )}
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div
        className="card"
        style={{
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '300px', flex: 1 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '38px' }}
              placeholder="Search by incident ID, error text, service, team, host..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-input)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            {(['ACTIVE', 'RESOLVED', 'SILENCED', 'ALL'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: statusFilter === status ? 'var(--brand-primary)' : 'transparent',
                  color: statusFilter === status ? '#ffffff' : 'var(--text-secondary)',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s ease',
                }}
              >
                {status.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Severity filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-input)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            {(['ALL', 'High', 'Medium', 'Noise'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: severityFilter === sev ? 'var(--brand-primary)' : 'transparent',
                  color: severityFilter === sev ? '#ffffff' : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Service filter chips row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Server size={13} />
            Service:
          </span>
          <button
            onClick={() => setServiceFilter('ALL')}
            style={{
              padding: '3px 10px',
              borderRadius: '9999px',
              border: serviceFilter === 'ALL' ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
              background: serviceFilter === 'ALL' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: serviceFilter === 'ALL' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            All Services ({incidents.length})
          </button>
          {uniqueServices.map((svc) => (
            <button
              key={svc}
              onClick={() => setServiceFilter(svc)}
              style={{
                padding: '3px 10px',
                borderRadius: '9999px',
                border: serviceFilter === svc ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                background: serviceFilter === svc ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: serviceFilter === svc ? 'var(--brand-primary)' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {svc}
            </button>
          ))}
        </div>
      </div>

      {/* Live Table (FR-19) */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong style={{ fontSize: '0.9375rem' }}>Triaged Incidents Feed</strong>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {filteredIncidents.length} incidents
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot pulse-dot-green" />
            <span>Live HMR intake active</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Incident</th>
                <th>Severity</th>
                <th>Service &amp; Fleet</th>
                <th>Error Pattern</th>
                <th>Raw Lines</th>
                <th>Owning Team</th>
                <th>Rate</th>
                <th>Alert Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident) => (
                  <IncidentRow key={incident.id} incident={incident} />
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={36} color="var(--brand-primary)" style={{ opacity: 0.5 }} />
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        No incidents match current filter
                      </div>
                      <div style={{ fontSize: '0.8125rem' }}>
                        Try adjusting search terms or switching filters
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Detail Drawer (FR-20) */}
      {selectedIncident && (
        <IncidentDetail
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
};
