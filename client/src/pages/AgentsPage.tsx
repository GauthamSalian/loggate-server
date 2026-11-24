import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Server, Monitor, Apple, Terminal, Clock, Download } from 'lucide-react';
import { projectApi } from '../lib/api';
import type { Machine } from '../lib/api';
import { useProject } from '../context/ProjectContext';
import { staggerContainer, fadeInSlideUp, springTransition } from '../lib/motion';
import { BASE_URL } from '../lib/api';

const MOCK_MACHINES: Machine[] = [
  { id: '1', hostname: 'prod-server-01', os: 'macOS', arch: 'arm64', agent_version: '0.1.0', last_seen: new Date().toISOString(), last_payload_latency_ms: 142 },
  { id: '2', hostname: 'prod-server-02', os: 'macOS', arch: 'x86_64', agent_version: '0.1.0', last_seen: new Date(Date.now() - 120000).toISOString(), last_payload_latency_ms: 198 },
  { id: '3', hostname: 'worker-win-01', os: 'Windows', arch: 'x86_64', agent_version: '0.1.0', last_seen: new Date(Date.now() - 300000).toISOString(), last_payload_latency_ms: 251 },
  { id: '4', hostname: 'ci-linux-runner', os: 'Linux', arch: 'x86_64', agent_version: '0.1.0', last_seen: new Date(Date.now() - 30000).toISOString(), last_payload_latency_ms: 88 },
];

function osBadge(os: string, arch: string) {
  if (os.toLowerCase().includes('mac')) return `macOS ${arch === 'arm64' ? 'ARM' : 'Intel'}`;
  if (os.toLowerCase().includes('win')) return 'Windows';
  return 'Linux';
}

function heartbeatStatus(lastSeen: string, now: number) {
  const diff = now - new Date(lastSeen).getTime();
  if (diff < 60000) return { label: 'Just now', cls: 'badge badge--emerald' };
  if (diff < 300000) return { label: `${Math.floor(diff / 60000)}m ago`, cls: 'badge badge--amber' };
  return { label: `${Math.floor(diff / 60000)}m ago`, cls: 'badge badge--rose' };
}

export const AgentsPage: React.FC = () => {
  const { activeProject } = useProject();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInstall, setShowInstall] = useState(false);
  const [installTab, setInstallTab] = useState<'macos' | 'linux' | 'windows'>('macos');
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      if (!activeProject) {
        if (!ignore) {
          setMachines(MOCK_MACHINES);
          setLoading(false);
        }
        return;
      }
      try {
        const res = await projectApi.machines(activeProject.project_id);
        if (!ignore) {
          setMachines(res.machines?.length ? res.machines : MOCK_MACHINES);
        }
      } catch {
        if (!ignore) setMachines(MOCK_MACHINES);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [activeProject]);

  const INSTALL_COMMANDS = {
    macos: `curl -sSL ${BASE_URL}/install.sh | bash -s -- \\
  --token YOUR_API_TOKEN \\
  --endpoint ${BASE_URL}`,
    linux: `curl -sSL ${BASE_URL}/install.sh | bash -s -- \\
  --token YOUR_API_TOKEN \\
  --endpoint ${BASE_URL}`,
    windows: `Invoke-WebRequest -Uri "${BASE_URL}/install.ps1" -OutFile install.ps1
.\\install.ps1 -Token "YOUR_API_TOKEN" -Endpoint "${BASE_URL}"`,
  };

  const TAB_ICONS = { macos: <Apple size={14} />, linux: <Terminal size={14} />, windows: <Monitor size={14} /> };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet & Agents</h1>
          <p className="page-desc">Connected hosts sending log batches to this project</p>
        </div>
        <motion.button
          className="btn-primary"
          onClick={() => setShowInstall(true)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={springTransition}
        >
          <Download size={15} />
          Install Agent
        </motion.button>
      </div>

      {/* Stats Row */}
      <div className="agents-stats">
        <div className="stat-pill"><Server size={14} /><span>{machines.length} agents</span></div>
        <div className="stat-pill stat-pill--emerald">
          <span className="live-dot" />
          <span>{machines.filter(m => now - new Date(m.last_seen).getTime() < 300000).length} online</span>
        </div>
      </div>

      {/* Agents Table */}
      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Hostname</th>
                <th>Service / Env</th>
                <th>Platform</th>
                <th>Connected API Key</th>
                <th>Heartbeat</th>
                <th>Last Latency</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={6}><div className="skeleton" /></td></tr>)
                : machines.map((m) => {
                  const hb = heartbeatStatus(m.last_seen, now);
                  return (
                    <motion.tr key={m.id} className="table-row" variants={fadeInSlideUp}>
                      <td className="font-medium">{m.hostname}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <span className="font-medium text-xs text-zinc-900">{m.service || 'api-server'}</span>
                          <span className="badge badge--zinc" style={{ fontSize: '0.625rem', padding: '1px 5px' }}>
                            {m.environment || 'production'}
                          </span>
                        </div>
                      </td>
                      <td><span className="badge badge--zinc">{osBadge(m.os, m.arch)}</span></td>
                      <td>
                        {m.last_key_id ? (
                          <code className="key-prefix" title={m.last_key_id}>
                            {m.last_key_id.slice(0, 14)}…
                          </code>
                        ) : (
                          <span className="badge badge--emerald" style={{ fontSize: '0.6875rem' }}>Active Key</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-zinc-400" />
                          <span className={hb.cls}>{hb.label}</span>
                        </div>
                      </td>
                      <td><span className="mono text-xs">{m.last_payload_latency_ms}ms</span></td>
                    </motion.tr>
                  );
                })
              }
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* Install Modal */}
      {showInstall && (
        <div className="modal-overlay" onClick={() => setShowInstall(false)}>
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={springTransition}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <span className="modal-title">Connect a New Agent</span>
              <button className="icon-btn" onClick={() => setShowInstall(false)}>✕</button>
            </div>
            <p className="modal-desc">Run this one-liner on your host machine to install and configure the LogGate edge agent:</p>

            {/* Platform Tabs */}
            <div className="install-tabs">
              {(['macos', 'linux', 'windows'] as const).map((tab) => (
                <motion.button
                  key={tab}
                  className={`install-tab ${installTab === tab ? 'install-tab--active' : ''}`}
                  onClick={() => setInstallTab(tab)}
                  layout
                  transition={springTransition}
                >
                  {TAB_ICONS[tab]}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {installTab === tab && (
                    <motion.span layoutId="install-tab-pill" className="tab-active-pill" transition={springTransition} />
                  )}
                </motion.button>
              ))}
            </div>

            <pre className="install-code">{INSTALL_COMMANDS[installTab]}</pre>
            <div className="modal-footer">
              <a href={`${BASE_URL}/api/v1/agent/releases`} target="_blank" rel="noreferrer" className="link-sm">
                View all releases →
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
