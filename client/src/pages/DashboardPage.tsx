import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Activity, Layers, Zap, ArrowUpRight } from 'lucide-react';
import { projectApi } from '../lib/api';
import type { MetricDay } from '../lib/api';
import { useProject } from '../context/ProjectContext';
import { staggerContainer, fadeInSlideUp, springTransition } from '../lib/motion';

// Mock fallback for when backend is offline
const MOCK_METRICS: MetricDay[] = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
  raw_lines: Math.floor(80000 + Math.random() * 60000),
  unique_patterns: Math.floor(200 + Math.random() * 300),
  bytes_saved: Math.floor(1_200_000 + Math.random() * 800_000),
  reduction_ratio: 88 + Math.random() * 10,
}));

const KPI = ({
  icon, label, value, sub, accent,
}: { icon: React.ReactNode; label: string; value: string; sub: string; accent: string }) => (
  <motion.div className="kpi-card" variants={fadeInSlideUp} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={springTransition}>
    <div className={`kpi-icon ${accent}`}>{icon}</div>
    <div className="kpi-body">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  </motion.div>
);

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export const DashboardPage: React.FC = () => {
  const { activeProject } = useProject();
  const [metrics, setMetrics] = useState<MetricDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      if (!activeProject) {
        if (!ignore) {
          setMetrics(MOCK_METRICS);
          setLoading(false);
        }
        return;
      }
      try {
        const res = await projectApi.metrics(activeProject.project_id);
        if (!ignore) {
          setMetrics(res.metrics?.length ? res.metrics : MOCK_METRICS);
        }
      } catch {
        if (!ignore) setMetrics(MOCK_METRICS);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [activeProject]);

  const latest = metrics && metrics.length > 0 ? metrics[metrics.length - 1] : MOCK_METRICS[MOCK_METRICS.length - 1];
  const totalRaw = metrics.reduce((s, m) => s + (Number(m.raw_lines) || 0), 0);
  const totalPatterns = metrics.reduce((s, m) => s + (Number(m.unique_patterns) || 0), 0);
  const totalBytesSaved = metrics.reduce((s, m) => s + (Number(m.bytes_saved) || 0), 0);
  const avgReduction = metrics.length > 0
    ? (metrics.reduce((s, m) => s + (Number(m.reduction_ratio) || 0), 0) / metrics.length).toFixed(1)
    : '92.4';

  const maxRaw = Math.max(...metrics.map((m) => Number(m.raw_lines) || 0), 1);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-desc">Log reduction metrics for <strong>{activeProject?.name ?? 'Demo Project'}</strong></p>
        </div>
        {!activeProject && (
          <div className="offline-badge">
            <span className="offline-dot" />
            Demo Mode — Backend Offline
          </div>
        )}
      </div>

      {/* KPI Row */}
      <motion.div
        className="kpi-grid"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <KPI
          icon={<TrendingDown size={18} />}
          label="Avg Reduction Ratio"
          value={loading ? '—' : `${avgReduction}%`}
          sub="Raw → Deduplicated"
          accent="kpi-icon--emerald"
        />
        <KPI
          icon={<Activity size={18} />}
          label="Total Lines Ingested"
          value={loading ? '—' : fmt(totalRaw)}
          sub={`Last ${metrics.length} days`}
          accent="kpi-icon--blue"
        />
        <KPI
          icon={<Layers size={18} />}
          label="Unique Patterns"
          value={loading ? '—' : fmt(totalPatterns)}
          sub="Stored after deduplication"
          accent="kpi-icon--violet"
        />
        <KPI
          icon={<Zap size={18} />}
          label="Bandwidth Saved"
          value={loading ? '—' : `${(totalBytesSaved / 1_073_741_824).toFixed(2)} GB`}
          sub="~${((totalBytesSaved / 1_073_741_824) * 0.15).toFixed(2)} ingest cost avoided"
          accent="kpi-icon--amber"
        />
      </motion.div>

      {/* Volume Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <span className="chart-title">Log Volume — Raw vs. Transmitted</span>
          <div className="chart-legend">
            <span className="legend-item"><span className="legend-dot legend-dot--blue" />Raw</span>
            <span className="legend-item"><span className="legend-dot legend-dot--emerald" />Unique Patterns</span>
          </div>
        </div>
        <div className="bar-chart">
          {metrics.map((m, i) => (
            <div key={i} className="bar-col" title={`${m.date}: ${fmt(m.raw_lines)} raw, ${fmt(m.unique_patterns)} patterns`}>
              <div className="bar-stack">
                <div
                  className="bar bar--blue"
                  style={{ height: `${(m.raw_lines / maxRaw) * 100}%` }}
                />
                <div
                  className="bar bar--emerald"
                  style={{ height: `${(m.unique_patterns / maxRaw) * 100}%` }}
                />
              </div>
              <div className="bar-label">{m.date.slice(5)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {latest && (
        <div className="recent-card">
          <div className="recent-header">
            <span className="recent-title">Latest Batch · {latest.date}</span>
            <button className="view-all-btn">View Triage <ArrowUpRight size={13} /></button>
          </div>
          <div className="recent-row">
            <span className="recent-label">Raw Lines</span>
            <span className="recent-val">{fmt(latest.raw_lines)}</span>
          </div>
          <div className="recent-row">
            <span className="recent-label">Unique Patterns</span>
            <span className="recent-val">{fmt(latest.unique_patterns)}</span>
          </div>
          <div className="recent-row">
            <span className="recent-label">Reduction</span>
            <span className="recent-val reduction-val">{(Number(latest?.reduction_ratio) || 92.4).toFixed(1)}%</span>
          </div>
          <div className="recent-row">
            <span className="recent-label">Bandwidth Saved</span>
            <span className="recent-val">{((Number(latest?.bytes_saved) || 0) / 1_048_576).toFixed(1)} MB</span>
          </div>
        </div>
      )}
    </div>
  );
};
