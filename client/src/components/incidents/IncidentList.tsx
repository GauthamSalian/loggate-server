import React, { useState, useMemo } from 'react';
import { useLogGate } from '../../context/LogGateContext';
import { IncidentRow } from './IncidentRow';
import { IncidentDetail } from './IncidentDetail';
import { MetricCard } from '../common/MetricCard';
import {
  Search,
  Flame,
  ShieldCheck,
  TrendingDown,
  CheckCircle2,
  Server,
} from 'lucide-react';

export const IncidentList: React.FC = () => {
  const { incidents, selectedIncident, setSelectedIncident, health } = useLogGate();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [alertedOnly, setAlertedOnly] = useState<boolean>(false);

  // If an incident is selected, render the dedicated Full-Page Incident Detail View (Page 3)
  if (selectedIncident) {
    return (
      <IncidentDetail
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />
    );
  }

  // Extract unique services
  const uniqueServices = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach((i) => set.add(i.service));
    return Array.from(set);
  }, [incidents]);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      // Severity filter
      if (severityFilter !== 'ALL') {
        const sevMap: Record<string, string> = {
          CRITICAL: 'High',
          WARNING: 'Medium',
          BENIGN: 'Noise',
        };
        if (incident.modelDecision.severityLabel !== sevMap[severityFilter]) {
          return false;
        }
      }

      // Environment filter
      if (environmentFilter !== 'ALL' && incident.environment !== environmentFilter) {
        return false;
      }

      // Service filter
      if (serviceFilter !== 'ALL' && incident.service !== serviceFilter) {
        return false;
      }

      // Alerted only toggle
      if (alertedOnly && !incident.alertStatus.delivered) {
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
  }, [incidents, severityFilter, environmentFilter, serviceFilter, alertedOnly, searchQuery]);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Title & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Live Incidents Feed (URD FR-19)
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '2px' }}>
            Active production errors clustered and prioritized by the Jev triage model in real time.
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
            Live Ingestion Active
          </span>
        </div>
      </div>

      {/* Top Highlights Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
        }}
      >
        <MetricCard
          title="Active Incidents"
          value={activeIncidents.length}
          subtitle="Merged across 5 fleet hosts"
          icon={<Flame size={18} />}
          highlightColor="#f87171"
        />

        <MetricCard
          title="Raw Lines Absorbed"
          value={totalActiveLines.toLocaleString()}
          subtitle="98.6% deduplication ratio"
          icon={<TrendingDown size={18} />}
          highlightColor="#10b981"
        />

        <MetricCard
          title="Triage Latency"
          value={`${health.modelLatencyMs} ms`}
          subtitle="SLA: < 100ms per record"
          icon={<Server size={18} />}
          highlightColor="#3b82f6"
        />
      </div>

      {/* Supabase Table View */}
      <div className="card" style={{ padding: '20px' }}>
        {/* Supabase Filter & Search Toolbar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search
                size={15}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search error patterns, services, teams..."
                className="input-field"
                style={{ paddingLeft: '36px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Service Dropdown */}
            <select
              className="input-field"
              style={{ width: '180px' }}
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <option value="ALL">All Services</option>
              {uniqueServices.map((svc) => (
                <option key={svc} value={svc}>
                  {svc}
                </option>
              ))}
            </select>

            {/* Alerted Only Checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={alertedOnly}
                onChange={(e) => setAlertedOnly(e.target.checked)}
                style={{ accentColor: '#10b981' }}
              />
              <span>Alerted Only (Slack)</span>
            </label>
          </div>

          {/* Quick Filter Chips: Severity & Environment */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            {/* Severity Toggles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '4px' }}>
                Severity:
              </span>
              {(['ALL', 'CRITICAL', 'WARNING', 'BENIGN'] as const).map((sev) => {
                const isSelected = severityFilter === sev;
                return (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className="btn btn-sm"
                    style={{
                      background: isSelected ? 'var(--bg-card-hover)' : 'transparent',
                      border: isSelected ? '1px solid var(--border-strong)' : '1px solid var(--border-subtle)',
                      color: isSelected ? '#ededed' : 'var(--text-muted)',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {sev === 'CRITICAL' ? '🔴 Critical' : sev === 'WARNING' ? '🟡 Warning' : sev === 'BENIGN' ? '⚪ Benign' : 'All'}
                  </button>
                );
              })}
            </div>

            {/* Environment Multi-Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '4px' }}>
                Environment:
              </span>
              {(['ALL', 'production', 'staging', 'canary'] as const).map((env) => {
                const isSelected = environmentFilter === env;
                return (
                  <button
                    key={env}
                    onClick={() => setEnvironmentFilter(env)}
                    className="btn btn-sm"
                    style={{
                      background: isSelected ? 'var(--bg-card-hover)' : 'transparent',
                      border: isSelected ? '1px solid var(--border-strong)' : '1px solid var(--border-subtle)',
                      color: isSelected ? '#10b981' : 'var(--text-muted)',
                      fontWeight: isSelected ? 600 : 400,
                      textTransform: 'uppercase',
                      fontSize: '0.6875rem',
                    }}
                  >
                    {env}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Incidents Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Incident</th>
                <th>Severity</th>
                <th>Service &amp; Env</th>
                <th>Pattern Snippet</th>
                <th>Occurrences</th>
                <th>Owning Team</th>
                <th>Rate</th>
                <th>Slack</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident) => (
                  <IncidentRow key={incident.id} incident={incident} />
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={32} color="#10b981" style={{ opacity: 0.6 }} />
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        No incidents match current filter
                      </div>
                      <div style={{ fontSize: '0.75rem' }}>
                        Try clearing search or adjusting the severity filters
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Supabase Pagination Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            marginTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>Showing {filteredIncidents.length} of {incidents.length} incidents</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Page 1 of 1</span>
            <button className="btn btn-outline btn-sm" disabled>
              Previous
            </button>
            <button className="btn btn-outline btn-sm" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
