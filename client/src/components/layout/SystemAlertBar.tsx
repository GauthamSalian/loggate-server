import React from 'react';
import { useLogGate } from '../../context/LogGateContext';
import { AlertTriangle, Clock, RotateCcw, ShieldAlert } from 'lucide-react';

export const SystemAlertBar: React.FC = () => {
  const {
    health,
    flushRetryQueue,
    toggleModelDegraded,
    toggleSlackOutage,
  } = useLogGate();

  const isModelDegraded = health.modelStatus === 'degraded';
  const hasQueuedAlerts = health.queuedAlertsCount > 0 || health.slackStatus === 'unreachable';
  const isOverloaded = health.overloadStatus === 'dropping' || health.droppedRecordsCount > 0;

  if (!isModelDegraded && !hasQueuedAlerts && !isOverloaded) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 24px 0 24px' }}>
      {/* FR-26 & FR-16: Model Degraded Banner */}
      {isModelDegraded && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.08) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.45)',
            borderRadius: '8px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            color: '#fbbf24',
            fontSize: '0.8125rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <div>
              <strong>Triage Model Latency Degraded (FR-16):</strong> Running at {health.modelLatencyMs}ms (target &lt;100ms).
              Incidents queued for re-judgment upon recovery.
            </div>
          </div>
          <button
            onClick={toggleModelDegraded}
            className="btn btn-sm"
            style={{
              background: 'rgba(245, 158, 11, 0.25)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              color: '#fef3c7',
              flexShrink: 0,
              padding: '4px 12px',
              fontSize: '0.75rem',
            }}
          >
            Recover Model
          </button>
        </div>
      )}

      {/* FR-26 & FR-14: Alerts waiting in retry queue */}
      {hasQueuedAlerts && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.08) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.45)',
            borderRadius: '8px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            color: '#f87171',
            fontSize: '0.8125rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <Clock size={16} style={{ flexShrink: 0 }} />
            <div>
              <strong>Alert Delivery Held (FR-14):</strong> {health.queuedAlertsCount} actionable alerts held in retry queue (Slack outage resilience).
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={flushRetryQueue}
              className="btn btn-sm btn-primary"
              style={{ background: '#10b981', borderColor: '#10b981', padding: '4px 10px', fontSize: '0.75rem' }}
            >
              <RotateCcw size={11} /> Flush All
            </button>
            <button
              onClick={toggleSlackOutage}
              className="btn btn-sm btn-outline"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              Restore Slack
            </button>
          </div>
        </div>
      )}

      {/* FR-26 & FR-03: Overload Protection Banner */}
      {isOverloaded && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.18) 0%, rgba(59, 130, 246, 0.06) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '8px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            color: '#93c5fd',
            fontSize: '0.8125rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <div>
              <strong>Overload Protection Active (FR-03):</strong> Intake burst detected. Senders never blocked; {health.droppedRecordsCount.toLocaleString()} excess records counted, server memory bounded.
            </div>
          </div>
          <button
            onClick={() => {
              // Click to acknowledge and clear
              window.location.reload();
            }}
            className="btn btn-sm btn-outline"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            Clear Burst
          </button>
        </div>
      )}
    </div>
  );
};
