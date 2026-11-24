import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Plus,
  Copy,
  CheckCheck,
  Trash2,
  Server,
  BarChart3,
  Calendar,
  Database,
  AlertTriangle,
  Code2,
  RefreshCw,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { tokenApi, projectApi, type ApiToken, type Machine, type TokenMetric } from '../lib/api';
import { useProject } from '../context/ProjectContext';
import { BASE_URL } from '../lib/api';
import { staggerContainer, fadeInSlideUp, springTransition } from '../lib/motion';

const MOCK_TOKENS: ApiToken[] = [
  { key_id: 'key-1', key_prefix: 'loggate_live_abc12', created_at: new Date(Date.now() - 86400000 * 10).toISOString(), revoked: false, last_used: new Date(Date.now() - 3600000).toISOString() },
  { key_id: 'key-2', key_prefix: 'loggate_live_xyz99', created_at: new Date(Date.now() - 86400000 * 2).toISOString(), revoked: false },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export const TokensPage: React.FC = () => {
  const { activeProject } = useProject();
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showNewKey, setShowNewKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [installTab, setInstallTab] = useState<'bash' | 'ps1'>('bash');

  // Token Metrics State
  const [selectedToken, setSelectedToken] = useState<ApiToken | null>(null);
  const [metrics, setMetrics] = useState<TokenMetric[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [metricsTab, setMetricsTab] = useState<'overview' | 'json'>('overview');
  const [copiedJson, setCopiedJson] = useState(false);

  const fetchTokens = useCallback(async () => {
    if (!activeProject) {
      setTokens(MOCK_TOKENS);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [tokenRes, machineRes] = await Promise.all([
        tokenApi.list(activeProject.project_id),
        projectApi.machines(activeProject.project_id).catch(() => ({ status: 'success', machines: [] })),
      ]);
      setTokens(tokenRes.keys?.length ? tokenRes.keys : MOCK_TOKENS);
      setMachines(machineRes.machines || []);
    } catch {
      setTokens(MOCK_TOKENS);
    } finally {
      setLoading(false);
    }
  }, [activeProject]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!ignore) {
        await fetchTokens();
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [fetchTokens]);

  const handleCreate = async () => {
    if (!activeProject) return;
    setCreating(true);
    try {
      const res = await tokenApi.create(activeProject.project_id);
      setNewKey(res.api_key);
      setShowNewKey(true);
      await fetchTokens();
    } catch {
      // show error
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (key_id: string) => {
    if (!activeProject) return;
    if (!confirm('Revoke this API key? Any agents using it will stop sending data.')) return;
    try {
      await tokenApi.revoke(activeProject.project_id, key_id);
      await fetchTokens();
      if (selectedToken?.key_id === key_id) {
        setSelectedToken((prev) => prev ? { ...prev, revoked: true } : null);
      }
    } catch { /* ignore */ }
  };

  // Open Token Metrics Modal
  const handleOpenMetrics = async (token: ApiToken) => {
    setSelectedToken(token);
    setLoadingMetrics(true);
    setMetricsTab('overview');
    try {
      if (activeProject) {
        const data = await tokenApi.metrics(activeProject.project_id, token.key_id);
        setMetrics(data);
      }
    } catch {
      setMetrics([]);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleRefreshMetrics = async () => {
    if (!selectedToken || !activeProject) return;
    setLoadingMetrics(true);
    try {
      const data = await tokenApi.metrics(activeProject.project_id, selectedToken.key_id);
      setMetrics(data);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(metrics, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Metrics KPI calculations
  const totalBytes = metrics.reduce((acc, m) => acc + m.bytes_ingested, 0);
  const totalLines = metrics.reduce((acc, m) => acc + m.raw_lines_count, 0);
  const totalErrors = metrics.reduce((acc, m) => acc + m.error_count, 0);
  const maxBytes = Math.max(1, ...metrics.map((m) => m.bytes_ingested));

  const INSTALL = {
    bash: `curl -sSL ${BASE_URL}/install.sh | bash -s -- \\
  --token ${newKey ?? 'YOUR_API_KEY'} \\
  --endpoint ${BASE_URL}`,
    ps1: `Invoke-WebRequest -Uri "${BASE_URL}/install.ps1" -OutFile install.ps1
.\\install.ps1 -Token "${newKey ?? 'YOUR_API_KEY'}" -Endpoint "${BASE_URL}"`,
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">API Keys & Fleet Telemetry</h1>
          <p className="page-desc">Generate tokens for your edge agents, view per-token ingestion metrics, and configure log routing</p>
        </div>
        <motion.button
          className="btn-primary"
          onClick={handleCreate}
          disabled={creating || !activeProject}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={springTransition}
        >
          <Plus size={15} />
          {creating ? 'Generating…' : 'Generate Key'}
        </motion.button>
      </div>

      {/* New key reveal banner */}
      <AnimatePresence>
        {newKey && showNewKey && (
          <motion.div
            className="key-reveal-banner"
            variants={fadeInSlideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="key-reveal-header">
              <span className="key-reveal-title">🔑 Your new API key — copy it now, it won't be shown again</span>
              <button className="icon-btn" onClick={() => setShowNewKey(false)}>✕</button>
            </div>
            <div className="key-reveal-row">
              <code className="key-reveal-code">{newKey}</code>
              <button className="icon-btn" onClick={() => copy(newKey, 'newkey')}>
                {copied === 'newkey' ? <CheckCheck size={15} className="text-emerald-600" /> : <Copy size={15} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tokens Table */}
      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Key Prefix</th>
                <th>Connected Machine(s)</th>
                <th>Created</th>
                <th>Last Used</th>
                <th>Status</th>
                <th>Telemetry & Actions</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <tr key={i}><td colSpan={6}><div className="skeleton" /></td></tr>)
                : tokens.map((t) => {
                  const linked = machines.filter(m => m.last_key_id === t.key_id);
                  const displayMachines = linked.length > 0
                    ? linked
                    : (tokens.length === 1 && machines.length > 0 ? machines : []);

                  return (
                    <motion.tr key={t.key_id} className="table-row" variants={fadeInSlideUp}>
                      <td>
                        <div className="key-cell">
                          <Key size={13} className="text-zinc-400" />
                          <code className="key-prefix">{t.key_prefix}…</code>
                        </div>
                      </td>
                      <td>
                        {displayMachines.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {displayMachines.map(m => (
                              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Server size={12} className="text-emerald-600" />
                                <span className="font-medium text-xs text-zinc-900">{m.hostname}</span>
                                <span className="badge badge--zinc" style={{ padding: '1px 5px', fontSize: '0.625rem' }}>
                                  {m.service || m.environment}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-xs">No host connected</span>
                        )}
                      </td>
                      <td className="mono text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
                      <td className="mono text-xs">{t.last_used ? new Date(t.last_used).toLocaleDateString() : '—'}</td>
                      <td>{t.revoked ? <span className="badge badge--rose">Revoked</span> : <span className="badge badge--emerald">Active</span>}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => handleOpenMetrics(t)}
                            style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '5px' }}
                            title="View ingestion metrics for this token"
                          >
                            <BarChart3 size={13} className="text-blue-600" />
                            <span>Token Metrics</span>
                          </button>

                          {!t.revoked && (
                            <button
                              className="revoke-btn"
                              onClick={() => handleRevoke(t.key_id)}
                              title="Revoke key"
                            >
                              <Trash2 size={13} />
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              }
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* Quick-Start Install Block */}
      <div className="quickstart-card">
        <div className="quickstart-header">
          <span className="quickstart-title">Quick Start Agent Installation</span>
          <span className="quickstart-sub">Run on your host to install and connect the LogGate agent with your API key</span>
        </div>

        <div className="install-tabs">
          {(['bash', 'ps1'] as const).map((tab) => (
            <motion.button
              key={tab}
              className={`install-tab ${installTab === tab ? 'install-tab--active' : ''}`}
              onClick={() => setInstallTab(tab)}
              layout
              transition={springTransition}
            >
              {tab === 'bash' ? 'macOS / Linux' : 'Windows PowerShell'}
              {installTab === tab && (
                <motion.span layoutId="qs-tab-pill" className="tab-active-pill" transition={springTransition} />
              )}
            </motion.button>
          ))}
        </div>

        <div className="install-code-wrapper">
          <pre className="install-code">{INSTALL[installTab]}</pre>
          <button
            className="install-copy-btn"
            onClick={() => copy(INSTALL[installTab], 'install')}
          >
            {copied === 'install'
              ? <><CheckCheck size={13} /> Copied!</>
              : <><Copy size={13} /> Copy</>
            }
          </button>
        </div>
      </div>

      {/* Token Metrics Modal */}
      <AnimatePresence>
        {selectedToken && (
          <div className="modal-overlay" onClick={() => setSelectedToken(null)}>
            <motion.div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              variants={fadeInSlideUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ maxWidth: '680px' }}
            >
              {/* Header */}
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563eb'
                    }}
                  >
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <h3 className="modal-title" style={{ margin: 0, fontSize: '1rem' }}>
                      Token Ingestion Metrics
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <code className="key-prefix" style={{ fontSize: '0.75rem' }}>{selectedToken.key_prefix}…</code>
                      <span className={selectedToken.revoked ? 'badge badge--rose' : 'badge badge--emerald'} style={{ fontSize: '0.6875rem' }}>
                        {selectedToken.revoked ? 'Revoked' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="icon-btn" onClick={() => setSelectedToken(null)}>✕</button>
              </div>

              {/* Sub-nav tabs */}
              <div style={{ display: 'flex', gap: '6px', margin: '14px 0', borderBottom: '1px solid #e4e4e7', paddingBottom: '8px' }}>
                <button
                  onClick={() => setMetricsTab('overview')}
                  className={`install-tab ${metricsTab === 'overview' ? 'install-tab--active' : ''}`}
                  style={{ border: 'none', padding: '6px 12px', fontSize: '0.8125rem' }}
                >
                  <Activity size={13} />
                  <span>Telemetry & Daily Metrics</span>
                </button>

                <button
                  onClick={() => setMetricsTab('json')}
                  className={`install-tab ${metricsTab === 'json' ? 'install-tab--active' : ''}`}
                  style={{ border: 'none', padding: '6px 12px', fontSize: '0.8125rem' }}
                >
                  <Code2 size={13} />
                  <span>Raw API Response (/token-metrics)</span>
                </button>

                <button
                  className="icon-btn"
                  onClick={handleRefreshMetrics}
                  title="Refresh Token Metrics"
                  style={{ marginLeft: 'auto' }}
                  disabled={loadingMetrics}
                >
                  <RefreshCw size={13} className={loadingMetrics ? 'animate-spin' : ''} />
                </button>
              </div>

              {metricsTab === 'overview' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* KPI Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                        <Database size={13} className="text-blue-600" />
                        <span>Data Ingested</span>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                        {formatBytes(totalBytes)}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '2px' }}>
                        Tracked across edge payloads
                      </div>
                    </div>

                    <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                        <ShieldCheck size={13} className="text-emerald-600" />
                        <span>Raw Log Lines</span>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                        {totalLines.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '2px' }}>
                        Clustered & deduplicated
                      </div>
                    </div>

                    <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                        <AlertTriangle size={13} className={totalErrors > 0 ? 'text-amber-500' : 'text-zinc-400'} />
                        <span>Error Events</span>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                        {totalErrors}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '2px' }}>
                        Flagged in ingestion window
                      </div>
                    </div>
                  </div>

                  {/* Volume Visual Bars */}
                  {metrics.length > 0 && (
                    <div style={{ padding: '14px', border: '1px solid #e4e4e7', borderRadius: '10px', background: '#fff' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', marginBottom: '12px' }}>
                        Daily Ingestion Volume Trend
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '90px' }}>
                        {metrics.map((m, idx) => {
                          const pct = Math.max(12, (m.bytes_ingested / maxBytes) * 100);
                          return (
                            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#09090b' }}>
                                {formatBytes(m.bytes_ingested)}
                              </span>
                              <div
                                style={{
                                  width: '100%',
                                  height: `${pct}%`,
                                  background: 'linear-gradient(180deg, #3b82f6, #2563eb)',
                                  borderRadius: '4px 4px 0 0',
                                  transition: 'height 0.3s ease'
                                }}
                              />
                              <span style={{ fontSize: '0.625rem', color: '#71717a', whiteSpace: 'nowrap' }}>
                                {m.metric_date.slice(5)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Daily Metrics Breakdown Table */}
                  <div className="table-card" style={{ border: '1px solid #e4e4e7', maxHeight: '180px', overflowY: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Raw Lines</th>
                          <th>Bytes Ingested</th>
                          <th>Errors</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingMetrics ? (
                          <tr><td colSpan={4}><div className="skeleton" /></td></tr>
                        ) : metrics.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'center', color: '#a1a1aa', padding: '18px' }}>
                              No ingestion metrics recorded yet for this key
                            </td>
                          </tr>
                        ) : (
                          metrics.map((m, i) => (
                            <tr key={i} className="table-row">
                              <td className="mono text-xs" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={12} className="text-zinc-400" />
                                {m.metric_date}
                              </td>
                              <td className="mono text-xs">{m.raw_lines_count.toLocaleString()}</td>
                              <td className="mono text-xs font-semibold">{formatBytes(m.bytes_ingested)}</td>
                              <td>
                                {m.error_count > 0 ? (
                                  <span className="badge badge--amber">{m.error_count}</span>
                                ) : (
                                  <span className="badge badge--zinc">0</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Raw JSON Tab */
                <div style={{ background: '#0f172a', borderRadius: '8px', padding: '14px', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.6875rem', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
                      POST /api/v1/tokens/token-metrics
                    </span>
                    <button
                      className="icon-btn"
                      onClick={handleCopyJson}
                      style={{ color: '#cbd5e1' }}
                      title="Copy JSON"
                    >
                      {copiedJson ? <CheckCheck size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <pre style={{ margin: 0, fontSize: '0.75rem', color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', maxHeight: '220px', overflowY: 'auto' }}>
                    {JSON.stringify({ status: 'success', key_id: selectedToken.key_id, data: metrics }, null, 2)}
                  </pre>
                </div>
              )}

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedToken(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
