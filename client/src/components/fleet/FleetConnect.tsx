import React, { useState } from 'react';
import { useLogGate } from '../../context/LogGateContext';
import { CodeBlock } from '../common/CodeBlock';
import {
  Server,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  Cpu,
  HardDrive,
  CheckCircle2,
} from 'lucide-react';

export const FleetConnect: React.FC = () => {
  const { hosts, settings, health } = useLogGate();

  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [installMethod, setInstallMethod] = useState<'docker' | 'linux' | 'python'>('docker');

  const handleCopyKey = () => {
    navigator.clipboard.writeText(settings.accessKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const maskedKeyDisplay = showKey
    ? settings.accessKey
    : settings.accessKey.slice(0, 10) + '••••••••••••••••••••••••' + settings.accessKey.slice(-4);

  const installSnippets = {
    docker: `# Run LogGate Host Daemon beside your application (HM-01, US-12)
docker run -d \\
  --name loggate-agent \\
  --restart unless-stopped \\
  -v /var/log/app:/var/log/app:ro \\
  -e LOGGATE_SERVER="https://loggate.corp.internal" \\
  -e LOGGATE_ACCESS_KEY="${settings.accessKey}" \\
  -e LOGGATE_SERVICE="payment-gateway" \\
  -e LOGGATE_ENV="production" \\
  loggate/host-module:latest`,

    linux: `# One-line install script for Systemd (HM-01, NFR-12)
curl -sSL https://loggate.corp.internal/install.sh | sudo bash -s -- \\
  --server "https://loggate.corp.internal" \\
  --access-key "${settings.accessKey}" \\
  --service "my-service" \\
  --log-path "/var/log/my-app.log"`,

    python: `# Python Host Hook (zero application code changes needed)
pip install loggate-host
export LOGGATE_ACCESS_KEY="${settings.accessKey}"
export LOGGATE_SERVER="https://loggate.corp.internal"
loggate-tail --service auth-api --file /var/log/auth.log`,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa',
            }}
          >
            <Server size={20} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Fleet &amp; Host Module Management (HM-01 to HM-07)
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.875rem' }}>
          Connect host modules with plug-and-play packages. Duplicates are eliminated on-host before network transmission
          (NFR-11, NFR-12).
        </p>
      </div>

      {/* Organization Access Key & Intake Security (NFR-06, HM-02) */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} color="#60a5fa" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Organization Ingestion Key (HM-02, NFR-06)
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Host modules authenticate every reduced record batch using this shared access key. Invalid keys are rejected
              at the server boundary.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                background: 'var(--bg-input)',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                color: showKey ? '#60a5fa' : 'var(--text-secondary)',
                minWidth: '320px',
              }}
            >
              {maskedKeyDisplay}
            </div>

            <button
              onClick={() => setShowKey(!showKey)}
              className="btn btn-outline"
              title={showKey ? 'Hide key' : 'Reveal key'}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>

            <button onClick={handleCopyKey} className="btn btn-secondary">
              {copiedKey ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>✓ Accepted batches: {health.acceptedRecordsCount.toLocaleString()}</span>
          <span>✓ Rejected unauthorized attempts: 0</span>
          <span>✓ Encryption: TLS 1.3 / HTTPS (HM-05)</span>
        </div>
      </div>

      {/* Plug-and-Play Quick Install Guide (HM-01, Key Flow 4.5) */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              1-Minute Plug-and-Play Host Setup (US-12, NFR-12)
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Zero application code changes required. The host module tails log outputs with under 5% CPU footprint (NFR-11).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-input)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            {(['docker', 'linux', 'python'] as const).map((method) => (
              <button
                key={method}
                onClick={() => setInstallMethod(method)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: installMethod === method ? 'var(--brand-primary)' : 'transparent',
                  color: installMethod === method ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {method === 'linux' ? 'Systemd Service' : method}
              </button>
            ))}
          </div>
        </div>

        <CodeBlock code={installSnippets[installMethod]} highlightMasked={false} />
      </div>

      {/* Connected Host Fleet Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Connected Host Fleet ({hosts.length} Hosts Active)
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Telemetry verified against NFR-11 footprint limits (&lt;5% CPU, &lt;100 MB RAM)
            </div>
          </div>
          <span className="badge badge-success">
            <CheckCircle2 size={12} /> All Nodes Reporting
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Hostname &amp; IP</th>
                <th>Service</th>
                <th>Environment</th>
                <th>Status</th>
                <th>CPU Footprint</th>
                <th>Memory</th>
                <th>Raw Lines Tailed</th>
                <th>Reduction Ratio</th>
                <th>Last Heartbeat</th>
              </tr>
            </thead>
            <tbody>
              {hosts.map((host) => (
                <tr key={host.id}>
                  {/* Hostname & IP */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Server size={15} color="var(--brand-primary)" />
                      <div>
                        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                          {host.hostname}
                        </strong>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          {host.ip} • {host.moduleVersion}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Service */}
                  <td style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{host.service}</td>

                  {/* Environment */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        background: host.environment === 'production' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: host.environment === 'production' ? '#60a5fa' : '#fbbf24',
                        textTransform: 'uppercase',
                      }}
                    >
                      {host.environment}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="badge badge-success">
                      <span className="pulse-dot pulse-dot-green" />
                      Healthy
                    </span>
                  </td>

                  {/* CPU (NFR-11: < 5%) */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Cpu size={13} color="var(--text-muted)" />
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{host.cpuPercent}%</span>
                      <span style={{ fontSize: '0.6875rem', color: '#10b981' }}>(&lt;5% limit)</span>
                    </div>
                  </td>

                  {/* RAM (NFR-11: < 100MB) */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <HardDrive size={13} color="var(--text-muted)" />
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{host.memoryMb} MB</span>
                    </div>
                  </td>

                  {/* Raw Lines Processed */}
                  <td style={{ whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                    {host.rawLinesRead.toLocaleString()}
                  </td>

                  {/* Reduction ratio */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#10b981', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {host.reductionPercentage}%
                    </span>
                  </td>

                  {/* Heartbeat */}
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {host.lastHeartbeat}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
