import React from 'react';
import type { LogLevel, AgentStatus } from '../../types/log';
import { AlertCircle, AlertTriangle, Info, Bug, CheckCircle2, XCircle } from 'lucide-react';

interface SeverityBadgeProps {
  level: LogLevel;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ level, size = 'sm' }) => {
  const getBadgeConfig = () => {
    switch (level) {
      case 'ERROR':
        return {
          bg: 'var(--error-bg)',
          border: 'var(--error-border)',
          text: 'var(--error-text)',
          dot: 'var(--error)',
          icon: <AlertCircle size={size === 'sm' ? 12 : 14} />,
        };
      case 'WARN':
        return {
          bg: 'var(--warn-bg)',
          border: 'var(--warn-border)',
          text: 'var(--warn-text)',
          dot: 'var(--warn)',
          icon: <AlertTriangle size={size === 'sm' ? 12 : 14} />,
        };
      case 'INFO':
        return {
          bg: 'var(--info-bg)',
          border: 'var(--info-border)',
          text: 'var(--info-text)',
          dot: 'var(--info)',
          icon: <Info size={size === 'sm' ? 12 : 14} />,
        };
      case 'DEBUG':
        return {
          bg: 'var(--debug-bg)',
          border: 'var(--debug-border)',
          text: 'var(--debug-text)',
          dot: 'var(--debug)',
          icon: <Bug size={size === 'sm' ? 12 : 14} />,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: size === 'sm' ? '3px 9px' : '5px 12px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 700,
        fontFamily: 'var(--mono)',
        borderRadius: '9999px',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.text,
        letterSpacing: '0.04em',
        lineHeight: 1.2,
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: config.dot,
          display: 'inline-block',
        }}
      />
      {config.icon}
      {level}
    </span>
  );
};

interface AgentStatusBadgeProps {
  status: AgentStatus;
}

export const AgentStatusBadge: React.FC<AgentStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          text: 'Active',
          color: 'var(--info-text)',
          bg: 'var(--info-bg)',
          border: 'var(--info-border)',
          icon: <CheckCircle2 size={13} />,
        };
      case 'degraded':
        return {
          text: 'Degraded',
          color: 'var(--warn-text)',
          bg: 'var(--warn-bg)',
          border: 'var(--warn-border)',
          icon: <AlertTriangle size={13} />,
        };
      case 'inactive':
        return {
          text: 'Inactive',
          color: 'var(--text-muted)',
          bg: 'var(--chip-bg)',
          border: 'var(--border)',
          icon: <XCircle size={13} />,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        fontSize: '12px',
        fontWeight: 600,
        borderRadius: '8px',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
      }}
    >
      {config.icon}
      {config.text}
    </span>
  );
};
