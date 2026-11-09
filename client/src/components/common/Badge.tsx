import React from 'react';
import type { SeverityLabel } from '../../types';
import { AlertCircle, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export const SeverityBadge: React.FC<{ severity: SeverityLabel; showIcon?: boolean }> = ({
  severity,
  showIcon = true,
}) => {
  if (severity === 'High') {
    return (
      <span className="badge badge-high">
        {showIcon && <AlertCircle size={12} />}
        High
      </span>
    );
  }
  if (severity === 'Medium') {
    return (
      <span className="badge badge-med">
        {showIcon && <AlertTriangle size={12} />}
        Medium
      </span>
    );
  }
  return (
    <span className="badge badge-noise">
      {showIcon && <ShieldCheck size={12} />}
      Noise
    </span>
  );
};

export const DegradedMarker: React.FC = () => {
  return (
    <span
      className="badge badge-warning"
      title="Incident marked degraded due to model delay/unavailability (FR-16)"
    >
      <Activity size={12} />
      Degraded
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'ACTIVE') {
    return (
      <span className="badge badge-high" style={{ textTransform: 'capitalize' }}>
        <span className="pulse-dot pulse-dot-red" />
        Active
      </span>
    );
  }
  if (status === 'RESOLVED') {
    return (
      <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>
        <span className="pulse-dot pulse-dot-green" />
        Resolved
      </span>
    );
  }
  return (
    <span className="badge badge-noise" style={{ textTransform: 'capitalize' }}>
      Silenced
    </span>
  );
};
