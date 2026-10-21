import React from 'react';
import type { MetricOverview } from '../types/log';
import { LogVolumeChart } from '../components/common/LogVolumeChart';
import { SampleDataBanner } from '../components/common/SampleDataBanner';
import {
  PieChart,
  Layers,
  AlertTriangle,
  Info,
  Bug,
  AlertOctagon,
} from 'lucide-react';

interface MetricsPageProps {
  metrics: MetricOverview;
}

export const MetricsPage: React.FC<MetricsPageProps> = ({ metrics }) => {
  const totalSeverityCount =
    metrics.levelCounts.ERROR +
    metrics.levelCounts.WARN +
    metrics.levelCounts.INFO +
    metrics.levelCounts.DEBUG;

  const getPercentage = (count: number) => {
    if (totalSeverityCount === 0) return 0;
    return ((count / totalSeverityCount) * 100).toFixed(1);
  };

  const services = Object.entries(metrics.serviceCounts).sort((a, b) => b[1] - a[1]);
  const maxServiceCount = Math.max(...services.map((s) => s[1]), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SampleDataBanner />

      {/* Main Volume Chart */}
      <LogVolumeChart
        data={metrics.volumeTimeline}
        title="Hourly Ingestion & Anomaly Trends"
        height={220}
      />

      {/* Two Column Layout: Severity Distribution & Service Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Severity Distribution */}
        <div
          className="glass-panel"
          style={{
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} color="var(--accent)" />
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-bright)' }}>
                Severity Distribution
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Log volume categorized by priority tier
              </span>
            </div>
          </div>

          {/* Multi-segment distribution bar */}
          <div
            style={{
              height: '14px',
              borderRadius: '9999px',
              overflow: 'hidden',
              display: 'flex',
              backgroundColor: 'var(--border)',
            }}
          >
            <div
              style={{
                width: `${getPercentage(metrics.levelCounts.INFO)}%`,
                backgroundColor: '#10b981',
                transition: 'width 0.3s ease',
              }}
              title={`INFO: ${getPercentage(metrics.levelCounts.INFO)}%`}
            />
            <div
              style={{
                width: `${getPercentage(metrics.levelCounts.DEBUG)}%`,
                backgroundColor: '#0ea5e9',
                transition: 'width 0.3s ease',
              }}
              title={`DEBUG: ${getPercentage(metrics.levelCounts.DEBUG)}%`}
            />
            <div
              style={{
                width: `${getPercentage(metrics.levelCounts.WARN)}%`,
                backgroundColor: '#f59e0b',
                transition: 'width 0.3s ease',
              }}
              title={`WARN: ${getPercentage(metrics.levelCounts.WARN)}%`}
            />
            <div
              style={{
                width: `${getPercentage(metrics.levelCounts.ERROR)}%`,
                backgroundColor: '#ef4444',
                transition: 'width 0.3s ease',
              }}
              title={`ERROR: ${getPercentage(metrics.levelCounts.ERROR)}%`}
            />
          </div>

          {/* 4 Severity Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--info-bg)',
                border: '1px solid var(--info-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--info-text)', fontWeight: 700 }}>
                <Info size={14} />
                INFO
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-bright)', marginTop: '4px' }}>
                {metrics.levelCounts.INFO}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {getPercentage(metrics.levelCounts.INFO)}% of total
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--debug-bg)',
                border: '1px solid var(--debug-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--debug-text)', fontWeight: 700 }}>
                <Bug size={14} />
                DEBUG
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-bright)', marginTop: '4px' }}>
                {metrics.levelCounts.DEBUG}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {getPercentage(metrics.levelCounts.DEBUG)}% of total
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--warn-bg)',
                border: '1px solid var(--warn-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--warn-text)', fontWeight: 700 }}>
                <AlertTriangle size={14} />
                WARN
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-bright)', marginTop: '4px' }}>
                {metrics.levelCounts.WARN}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {getPercentage(metrics.levelCounts.WARN)}% of total
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--error-bg)',
                border: '1px solid var(--error-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--error-text)', fontWeight: 700 }}>
                <AlertOctagon size={14} />
                ERROR
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-bright)', marginTop: '4px' }}>
                {metrics.levelCounts.ERROR}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {getPercentage(metrics.levelCounts.ERROR)}% of total
              </div>
            </div>
          </div>
        </div>

        {/* Service Breakdown */}
        <div
          className="glass-panel"
          style={{
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--accent)" />
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-bright)' }}>
                Service Telemetry Volume
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Log throughput per microservice
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {services.map(([serviceName, count]) => {
              const barPercent = Math.round((count / maxServiceCount) * 100);
              return (
                <div key={serviceName} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-bright)', fontWeight: 500 }}>
                      {serviceName}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                      {count} logs
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--surface-hover)',
                      overflow: 'hidden',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${barPercent}%`,
                        backgroundColor: '#6366f1',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
