import React from 'react';
import type { Incident } from '../../types';
import { SeverityBadge, DegradedMarker } from '../common/Badge';
import { SlackIcon } from '../common/Icons';
import { useLogGate } from '../../context/LogGateContext';
import { ExternalLink, Check, Clock } from 'lucide-react';

interface IncidentRowProps {
  incident: Incident;
}

export const IncidentRow: React.FC<IncidentRowProps> = ({ incident }) => {
  const { setSelectedIncident } = useLogGate();

  return (
    <tr
      onClick={() => setSelectedIncident(incident)}
      style={{
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
      }}
    >
      {/* Incident ID & Status */}
      <td style={{ whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)', fontSize: '0.875rem' }}>
            {incident.id}
          </strong>
          {incident.isDegraded && <DegradedMarker />}
        </div>
      </td>

      {/* Severity */}
      <td style={{ whiteSpace: 'nowrap' }}>
        <SeverityBadge severity={incident.modelDecision.severityLabel} />
      </td>

      {/* Service & Environment */}
      <td style={{ whiteSpace: 'nowrap' }}>
        <div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{incident.service}</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {incident.environment} • {incident.hosts.length} {incident.hosts.length === 1 ? 'host' : 'hosts'}
          </div>
        </div>
      </td>

      {/* Error Pattern */}
      <td style={{ maxWidth: '420px' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={incident.pattern}
        >
          {incident.pattern}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Last seen: {new Date(incident.lastSeen).toLocaleTimeString()}
        </div>
      </td>

      {/* Raw Lines Represented (FR-19) */}
      <td style={{ whiteSpace: 'nowrap' }}>
        <div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {incident.rawLinesCount.toLocaleString()}
          </span>
          <div style={{ fontSize: '0.75rem', color: '#10b981' }}>
            ~{(incident.bytesRepresented / (1024 * 1024)).toFixed(1)} MB reduced
          </div>
        </div>
      </td>

      {/* Owning Team */}
      <td style={{ whiteSpace: 'nowrap' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 500,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          {incident.modelDecision.owningTeam}
        </span>
      </td>

      {/* Error Rate */}
      <td style={{ whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
        <span style={{ fontWeight: 600, color: incident.errorRatePerSec > 200 ? '#f87171' : 'var(--text-primary)' }}>
          {incident.errorRatePerSec}/s
        </span>
      </td>

      {/* Alert Status (FR-11, FR-14) */}
      <td style={{ whiteSpace: 'nowrap' }}>
        {incident.alertStatus.delivered ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: '#10b981',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
            title="One Slack alert delivered per incident (FR-13)"
          >
            <SlackIcon size={13} color="#10b981" />
            <Check size={12} />
            Delivered
          </span>
        ) : incident.alertStatus.isQueued ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: '#f59e0b',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
            title="Slack offline: Alert held in memory retry queue (FR-14)"
          >
            <Clock size={13} />
            Held in Queue
          </span>
        ) : (
          <span
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
            }}
            title="Probability below noise floor (FR-09)"
          >
            Silent (Noise)
          </span>
        )}
      </td>

      {/* View Detail Action */}
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedIncident(incident);
          }}
          className="btn btn-sm btn-outline"
        >
          <span>View</span>
          <ExternalLink size={12} />
        </button>
      </td>
    </tr>
  );
};
