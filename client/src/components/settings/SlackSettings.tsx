import React, { useState } from 'react';
import { useLogGate } from '../../context/LogGateContext';
import { SlackIcon } from '../common/Icons';
import {
  Send,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Eye,
  EyeOff,
  Clock,
  Save,
} from 'lucide-react';

export const SlackSettings: React.FC = () => {
  const {
    settings,
    updateSettings,
    testSlackMessage,
    health,
    flushRetryQueue,
    toggleSlackOutage,
  } = useLogGate();

  const [channel, setChannel] = useState(settings.slackChannel);
  const [webhookUrl, setWebhookUrl] = useState(settings.slackWebhookUrl);
  const [showWebhook, setShowWebhook] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    updateSettings({
      slackChannel: channel,
      slackWebhookUrl: webhookUrl,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestAlert = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSlackMessage(channel);
      setTestResult(res);
    } catch {
      setTestResult({ success: false, message: 'Failed to send test alert.' });
    } finally {
      setTesting(false);
    }
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
              background: 'rgba(74, 21, 75, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ecb22e',
            }}
          >
            <SlackIcon size={20} color="#ecb22e" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Slack Channel &amp; Alert Routing (FR-10, FR-23)
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.875rem' }}>
          Configure the single dedicated Slack channel for the entire organization (FR-10). Test delivery and monitor
          the offline resilience queue (FR-14).
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Channel Configuration (US-05, FR-23)
        </h3>

        {/* Channel Name */}
        <div>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
            Designated Organization Slack Channel (FR-10)
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              className="input-field"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="#alerts-production"
              style={{ maxWidth: '400px', fontFamily: 'var(--font-mono)' }}
            />
            <button onClick={handleSave} className="btn btn-secondary">
              <Save size={15} />
              <span>Save Channel</span>
            </button>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            All high-priority actionable incidents will route to this single channel, tagged with the owning team.
          </div>
        </div>

        {/* Webhook URL (NFR-06 masked) */}
        <div>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
            Slack Incoming Webhook URL (NFR-06: Masked for Security)
          </label>
          <div style={{ display: 'flex', gap: '8px', maxWidth: '640px' }}>
            <input
              type={showWebhook ? 'text' : 'password'}
              className="input-field"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <button
              onClick={() => setShowWebhook(!showWebhook)}
              className="btn btn-outline"
              title={showWebhook ? 'Hide URL' : 'Reveal URL'}
            >
              {showWebhook ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Test Button & Feedback (FR-23) */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={handleTestAlert}
            disabled={testing}
            className="btn btn-primary"
            style={{ background: '#4a154b', borderColor: '#4a154b' }}
          >
            <Send size={15} />
            <span>{testing ? 'Sending Test Alert...' : `Send Test Message to ${channel} (FR-23)`}</span>
          </button>

          {testResult && (
            <div
              style={{
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: testResult.success ? '#10b981' : '#f87171',
              }}
            >
              {testResult.success ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              <span>{testResult.message}</span>
            </div>
          )}

          {saveSuccess && (
            <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 500 }}>
              ✓ Channel configuration saved!
            </span>
          )}
        </div>
      </div>

      {/* Offline Alert Retry Queue & Resilience (FR-14, NFR-05) */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Offline Resilience &amp; Retry Queue (FR-14, NFR-05)
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              "If the messaging platform is unreachable, the system shall hold alerts and retry until delivered, most
              severe first, and never discard an actionable alert" (survives 1h outage).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={toggleSlackOutage} className="btn btn-sm btn-outline">
              <AlertTriangle size={13} color="#f59e0b" />
              <span>
                {health.slackStatus === 'unreachable' ? 'Simulate Slack Restored' : 'Simulate Slack Outage (FR-14)'}
              </span>
            </button>

            {health.queuedAlertsCount > 0 && (
              <button onClick={flushRetryQueue} className="btn btn-sm btn-primary">
                <RotateCcw size={13} />
                <span>Flush &amp; Deliver Queue Now</span>
              </button>
            )}
          </div>
        </div>

        {/* Status badge bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>SLACK CONNECTION STATUS</div>
            <div
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: health.slackStatus === 'connected' ? '#10b981' : '#f87171',
                marginTop: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span className={`pulse-dot ${health.slackStatus === 'connected' ? 'pulse-dot-green' : 'pulse-dot-red'}`} />
              {health.slackStatus === 'connected' ? 'Connected & Verified' : 'Unreachable (Outage)'}
            </div>
          </div>

          <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>HELD IN RETRY QUEUE</div>
            <div
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: health.queuedAlertsCount > 0 ? '#f59e0b' : 'var(--text-primary)',
                marginTop: '2px',
              }}
            >
              {health.queuedAlertsCount} alerts held
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Delivered most severe first on recovery
            </div>
          </div>
        </div>
      </div>

      {/* Live Slack Message Format Reference (FR-11, FR-12) */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Exact Slack Message Format Specification (FR-11, FR-12)
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Alert content strictly originates from typed incident fields and model classifications (FR-12: never free-form LLM text).
        </p>

        <div
          style={{
            background: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            lineHeight: 1.6,
          }}
        >
          <div style={{ color: '#ecb22e', fontWeight: 700 }}>[LogGate Alert] INC-1042: High (Critical)</div>
          <div style={{ color: 'var(--text-secondary)' }}>• Service: payment-gateway (production)</div>
          <div style={{ color: 'var(--text-secondary)' }}>• Error Rate: 312 errors/sec (Burst +180%)</div>
          <div style={{ color: 'var(--text-secondary)' }}>• Actionable Probability: 0.97 (Floor: 0.85)</div>
          <div style={{ color: 'var(--text-secondary)' }}>• Owning Team: Payments &amp; Billing Core</div>
          <div style={{ color: 'var(--text-secondary)' }}>• Pattern: HTTP 504 Gateway Timeout while dispatching webhook...</div>
          <div style={{ color: '#60a5fa' }}>• Detail: https://loggate.corp.internal/incidents/INC-1042</div>
        </div>
      </div>
    </div>
  );
};
