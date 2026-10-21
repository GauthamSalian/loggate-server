import React, { useState } from 'react';
import type { Agent } from '../types/log';
import { AgentStatusBadge } from '../components/common/Badge';
import { SampleDataBanner } from '../components/common/SampleDataBanner';
import {
  Server,
  Send,
  Terminal,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface AgentsPageProps {
  agents: Agent[];
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const AgentsPage: React.FC<AgentsPageProps> = ({
  agents,
  searchQuery: externalSearch,
  onSearchChange: externalOnSearchChange,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState<string>('');

  const searchQuery = externalSearch !== undefined ? externalSearch : localSearch;
  const handleSearchChange = (val: string) => {
    if (externalOnSearchChange) externalOnSearchChange(val);
    else setLocalSearch(val);
  };

  const filteredAgents = agents.filter((agent) => {
    if (filterStatus !== 'all' && agent.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        agent.name.toLowerCase().includes(q) ||
        agent.host.toLowerCase().includes(q) ||
        agent.ip.includes(q) ||
        agent.version.includes(q)
      );
    }
    return true;
  });

  const activeCount = agents.filter((a) => a.status === 'active').length;
  const degradedCount = agents.filter((a) => a.status === 'degraded').length;
  const inactiveCount = agents.filter((a) => a.status === 'inactive').length;
  const totalLogsShipped = agents.reduce((sum, a) => sum + a.logsShipped, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SampleDataBanner />

      {/* Fleet Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Server size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Total Registered
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-bright)' }}>
              {agents.length} Nodes
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {inactiveCount} currently offline
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Healthy & Streaming
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#34d399' }}>
              {activeCount} Active
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Degraded / Delayed
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#fbbf24' }}>
              {degradedCount} Nodes
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              color: '#c084fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Total Logs Shipped
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-bright)' }}>
              {totalLogsShipped.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Agents Search & Table Section */}
      <div
        className="glass-panel"
        style={{
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            backgroundColor: 'var(--surface-hover)',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search agent name, IP, or host..."
              style={{
                height: '32px',
                paddingLeft: '32px',
                paddingRight: '12px',
                fontSize: '12px',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-bright)',
                outline: 'none',
              }}
            />
          </div>

          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'active', 'degraded', 'inactive'].map((status) => (
              <button
                type="button"
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: filterStatus === status ? 600 : 500,
                  borderRadius: '6px',
                  border: '1px solid',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  backgroundColor: filterStatus === status ? 'var(--accent-bg)' : 'transparent',
                  borderColor: filterStatus === status ? 'var(--accent-border)' : 'var(--border)',
                  color: filterStatus === status ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--surface)',
                  borderBottom: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                }}
              >
                <th style={{ padding: '12px 16px' }}>Agent Name</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Host / IP</th>
                <th style={{ padding: '12px 16px' }}>Version</th>
                <th style={{ padding: '12px 16px' }}>Last Heartbeat</th>
                <th style={{ padding: '12px 16px' }}>Logs Shipped</th>
                <th style={{ padding: '12px 16px' }}>Uptime</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent) => (
                <tr
                  key={agent.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    transition: 'background-color 0.1s ease',
                  }}
                  className="table-row-hover"
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Server size={15} color="#818cf8" />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-bright)' }}>{agent.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                          Env: {agent.environment}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <AgentStatusBadge status={agent.status} />
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '12px' }}>
                    <div style={{ color: 'var(--text-bright)' }}>{agent.host}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{agent.ip}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {agent.version}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(agent.lastHeartbeat).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-bright)', fontFamily: 'var(--mono)' }}>
                    {agent.logsShipped.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {agent.uptime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backend Integration Helper Box */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={16} color="var(--accent)" />
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-bright)' }}>
            Connecting `loggate-agent` to LogGate Server
          </h4>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Once the Python backend is implemented, agents will automatically register and ship logs via HTTP POST or WebSocket to the ingestion endpoint:
        </p>
        <pre
          style={{
            margin: '4px 0 0',
            padding: '12px 16px',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontFamily: 'var(--mono)',
            fontSize: '12px',
            color: 'var(--accent)',
            overflowX: 'auto',
          }}
        >
{`# Example configuration in loggate-agent:
SERVER_ENDPOINT = "http://localhost:8000/api/v1/ingest"
AGENT_NAME      = "loggate-agent-prod-01"
HEARTBEAT_SEC   = 10`}
        </pre>
      </div>
    </div>
  );
};
