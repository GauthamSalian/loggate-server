import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronLeft, ChevronRight, Copy, CheckCheck, ExternalLink } from 'lucide-react';
import { projectApi } from '../lib/api';
import type { LogRecord, LogQueryParams } from '../lib/api';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { staggerContainer, fadeInSlideUp, springTransition } from '../lib/motion';

const SEVERITY_CLASSES: Record<string, string> = {
  critical: 'badge badge--rose',
  warning: 'badge badge--amber',
  benign: 'badge badge--zinc',
  Critical: 'badge badge--rose',
  Warning: 'badge badge--amber',
  Benign: 'badge badge--zinc',
  ERROR: 'badge badge--rose',
  WARN: 'badge badge--amber',
  INFO: 'badge badge--blue',
  DEBUG: 'badge badge--zinc',
};

function formatSeverity(label?: string) {
  if (!label) return 'Unknown';
  const lower = label.toLowerCase();
  if (lower === 'critical' || lower === 'error') return 'Critical';
  if (lower === 'warning' || lower === 'warn') return 'Warning';
  if (lower === 'benign') return 'Benign';
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const MOCK_LOGS: LogRecord[] = Array.from({ length: 15 }, (_, i) => ({
  id: `log-${i}`,
  pattern: `[TIMESTAMP] [ID] ERROR Failed to connect to [IP_ADDRESS]: Connection refused (attempt [ID])`,
  sample: [`2024-11-24 10:${String(i).padStart(2, '0')}:00 blk_${Math.random().toString(36).slice(2)} ERROR Failed to connect to 10.0.0.${i + 1}: Connection refused (attempt ${i + 1})`],
  line_count: Math.floor(100 + Math.random() * 900),
  total_bytes_count: Math.floor(10000 + Math.random() * 90000),
  severity_label: ['critical', 'warning', 'benign'][i % 3] as LogRecord['severity_label'],
  service: ['api-server', 'worker', 'scheduler'][i % 3],
  environment: ['production', 'staging', 'development'][i % 3],
  alerted_slack: i % 3 === 0,
  first_seen: new Date(Date.now() - i * 3600000).toISOString(),
  last_seen: new Date(Date.now() - i * 1800000).toISOString(),
  hash: `sha256:${Math.random().toString(16).slice(2).padStart(64, '0')}`,
}));

const MASK_TOKENS = ['[IP_ADDRESS]', '[SECRET]', '[ID]', '[TIMESTAMP]', '[UUID]', '[EMAIL_ADDRESS]', '[HEX]'];

function highlightMasks(text: string) {
  const parts = text.split(/((?:\[IP_ADDRESS\]|\[SECRET\]|\[ID\]|\[TIMESTAMP\]|\[UUID\]|\[EMAIL_ADDRESS\]|\[HEX\]))/g);
  return parts.map((part, i) =>
    MASK_TOKENS.includes(part)
      ? <span key={i} className="mask-token">{part}</span>
      : <span key={i}>{part}</span>
  );
}

const PatternDrawer: React.FC<{ record: LogRecord; onClose: () => void }> = ({ record, onClose }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(record.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="drawer-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        className="drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={springTransition}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <span className="drawer-title">Pattern Inspector</span>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Hash */}
        <div className="drawer-section">
          <div className="drawer-label">SHA-256 Hash</div>
          <div className="hash-row">
            <code className="hash-code">{record.hash}</code>
            <button className="icon-btn" onClick={copy}>
              {copied ? <CheckCheck size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="drawer-section drawer-meta-grid">
          <div><span className="drawer-label">Occurrences</span><span className="drawer-val">{record.line_count.toLocaleString()}</span></div>
          <div><span className="drawer-label">Severity</span><span className={SEVERITY_CLASSES[record.severity_label] || 'badge badge--zinc'}>{formatSeverity(record.severity_label)}</span></div>
          <div><span className="drawer-label">Service</span><span className="drawer-val">{record.service}</span></div>
          <div><span className="drawer-label">Environment</span><span className="drawer-val">{record.environment}</span></div>
          <div><span className="drawer-label">First Seen</span><span className="drawer-val">{new Date(record.first_seen).toLocaleString()}</span></div>
          <div><span className="drawer-label">Last Seen</span><span className="drawer-val">{new Date(record.last_seen).toLocaleString()}</span></div>
        </div>

        {/* Raw sample */}
        <div className="drawer-section">
          <div className="drawer-label">Raw Sample Line</div>
          <div className="log-box log-box--raw">{record.sample[0]}</div>
        </div>

        {/* Masked pattern */}
        <div className="drawer-section">
          <div className="drawer-label">Masked Pattern Template</div>
          <div className="log-box log-box--masked">{highlightMasks(record.pattern)}</div>
        </div>

        {/* Slack alerted */}
        {record.alerted_slack && (
          <div className="drawer-section">
            <span className="badge badge--emerald"><ExternalLink size={11} /> Slack Alert Sent</span>
          </div>
        )}
      </motion.aside>
    </motion.div>
  );
};

export const TriagePage: React.FC = () => {
  const { activeProject } = useProject();
  const { isDemo } = useAuth();
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<LogRecord | null>(null);
  const [params, setParams] = useState<LogQueryParams>({ page_number: 1, page_size: 20 });
  const [search, setSearch] = useState('');

  const fetchLogs = useCallback(async () => {
    if (isDemo || !activeProject) { setLogs(MOCK_LOGS); setTotal(MOCK_LOGS.length); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await projectApi.logs(activeProject.project_id, { ...params, search: search || undefined });
      setLogs(res.logs || []);
      setTotal(res.total ?? res.logs?.length ?? 0);
    } catch {
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [activeProject, isDemo, params, search]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!ignore) {
        await fetchLogs();
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / (params.page_size ?? 20));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Triage & Pattern Explorer</h1>
          <p className="page-desc">Deduplicated log patterns with masking and severity routing</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search patterns, services, hashes…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setParams((p) => ({ ...p, page_number: 1 })); }}
          />
        </div>
        <select
          className="filter-select"
          value={params.severity_label || ''}
          onChange={(e) => setParams((p) => ({ ...p, severity_label: e.target.value || undefined, page_number: 1 }))}
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
        </select>
        <select className="filter-select" onChange={(e) => setParams((p) => ({ ...p, environment: e.target.value || undefined, page_number: 1 }))}>
          <option value="">All Environments</option>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="development">Development</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Pattern</th>
                <th>Hash</th>
                <th>Occurrences</th>
                <th>Slack</th>
                <th>Last Seen</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={6}><div className="skeleton" /></td></tr>
                ))
                : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px', color: '#6b7280', fontSize: '0.8125rem' }}>
                      No triaged log patterns recorded for this project yet.
                    </td>
                  </tr>
                ) : logs.map((log) => (
                  <motion.tr
                    key={log.id}
                    className="table-row"
                    variants={fadeInSlideUp}
                    onClick={() => setSelected(log)}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                  >
                    <td><span className={SEVERITY_CLASSES[log.severity_label] || 'badge badge--zinc'}>{formatSeverity(log.severity_label)}</span></td>
                    <td className="pattern-cell">{log.pattern.slice(0, 90)}{log.pattern.length > 90 ? '…' : ''}</td>
                    <td><code className="hash-pill">{log.hash.slice(0, 16)}…</code></td>
                    <td className="mono">{log.line_count.toLocaleString()}</td>
                    <td>{log.alerted_slack ? <span className="badge badge--emerald">Sent</span> : <span className="badge badge--zinc">—</span>}</td>
                    <td className="mono text-xs">{new Date(log.last_seen).toLocaleDateString()}</td>
                  </motion.tr>
                ))
              }
            </motion.tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span className="pagination-info">{total} records</span>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={(params.page_number ?? 1) <= 1}
              onClick={() => setParams((p) => ({ ...p, page_number: (p.page_number ?? 1) - 1 }))}
            >
              <ChevronLeft size={15} />
            </button>
            <span className="page-indicator">Page {params.page_number} of {totalPages || 1}</span>
            <button
              className="page-btn"
              disabled={(params.page_number ?? 1) >= totalPages}
              onClick={() => setParams((p) => ({ ...p, page_number: (p.page_number ?? 1) + 1 }))}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer */}
      <AnimatePresence>
        {selected && <PatternDrawer record={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
};
