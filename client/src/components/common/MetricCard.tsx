import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  icon: React.ReactNode;
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  accentColor = 'var(--accent)',
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '18px 20px',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '120px',
        transition: 'border-color 0.15s ease, transform 0.15s ease',
      }}
      className="metric-card"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {title}
        </span>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: 'var(--chip-bg)',
            border: '1px solid var(--border)',
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ margin: '10px 0 6px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--text-bright)',
            fontFamily: 'var(--sans)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          {value}
        </span>

        {trend && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: '4px',
              backgroundColor: trend.isNeutral
                ? 'var(--chip-bg)'
                : trend.isPositive
                ? 'var(--info-bg)'
                : 'var(--error-bg)',
              color: trend.isNeutral
                ? 'var(--text-muted)'
                : trend.isPositive
                ? 'var(--info-text)'
                : 'var(--error-text)',
              border: `1px solid ${
                trend.isNeutral
                  ? 'var(--border)'
                  : trend.isPositive
                  ? 'var(--info-border)'
                  : 'var(--error-border)'
              }`,
            }}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};
