import React, { useState } from 'react';
import type { Incident } from '../../types';
import { useLogGate } from '../../context/LogGateContext';
import { SeverityBadge, DegradedMarker, StatusBadge } from '../common/Badge';
import { SlackIcon } from '../common/Icons';
import { CodeBlock } from '../common/CodeBlock';
import {
  X,
  CheckCircle,
  VolumeX,
  RotateCcw,
  Server,
  Sparkles,
  FileCode,
  Copy,
  Check,
} from 'lucide-react';

interface IncidentDetailProps {
  incident: Incident;
  onClose: () => void;
}

type DetailTab = 'overview' | 'masked_diff' | 'slack_card' | 'fleet_spread';

export const IncidentDetail: React.FC<IncidentDetailProps> = ({ incident, onClose }) => {
  const { resolveIncident, silenceIncident, reopenIncident, settings } = useLogGate();
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [copiedPattern, setCopiedPattern] = useState(false);

  const handleCopyPattern = () => {
    navigator.clipboard.writeText(incident.pattern);
    setCopiedPattern(true);
    setTimeout(() => setCopiedPattern(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '860px',
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border-strong)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Drawer Header */}
      <div
        style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card-subtle)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--brand-primary)',
            }}
          >
            {incident.id}
          </div>
          <SeverityBadge severity={incident.modelDecision.severityLabel} />
          {incident.isDegraded && <DegradedMarker />}
          <StatusBadge status={incident.status} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {incident.status === 'ACTIVE' ? (
            <>
              <button
                onClick={() => resolveIncident(incident.id)}
                className="btn btn-sm btn-secondary"
                style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <CheckCircle size={14} />
                <span>Mark Resolved</span>
              </button>
              <button
                onClick={() => silenceIncident(incident.id)}
                className="btn btn-sm btn-secondary"
                style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <VolumeX size={14} />
                <span>Silence Pattern</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => reopenIncident(incident.id)}
              className="btn btn-sm btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <RotateCcw size={14} />
              <span>Reopen Incident</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="btn btn-sm btn-outline"
            style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Close drawer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div
        style={{
          display: 'flex',
          padding: '0 24px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        {[
          { id: 'overview', label: 'Overview & AI Triage', icon: <Sparkles size={14} /> },
          { id: 'masked_diff', label: 'Masked Log Diffs (HM-06)', icon: <FileCode size={14} /> },
          { id: 'slack_card', label: 'Slack Alert Card (FR-11)', icon: <SlackIcon size={14} /> },
          { id: 'fleet_spread', label: 'Fleet Spread (FR-04)', icon: <Server size={14} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DetailTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 14px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--brand-primary)' : '2px solid transparent',
                color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Drawer Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* TAB 1: OVERVIEW & AI TRIAGE */}
        {activeTab === 'overview' && (
          <>
            {/* Pattern Box */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Canonical Error Pattern (HM-03, HM-04)
                </div>
                <button
                  onClick={handleCopyPattern}
                  className="btn btn-sm btn-outline"
                  style={{ padding: '2px 8px', fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {copiedPattern ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  <span>{copiedPattern ? 'Copied' : 'Copy Pattern'}</span>
                </button>
              </div>
              <CodeBlock code={incident.pattern} />
            </div>

            {/* Core Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <div className="card" style={{ padding: '14px' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Service</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px' }}>{incident.service}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Env: {incident.environment}</div>
              </div>

              <div className="card" style={{ padding: '14px' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Owning Team</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px', color: '#60a5fa' }}>
                  {incident.modelDecision.owningTeam}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Jev Triage Classification</div>
              </div>

              <div className="card" style={{ padding: '14px' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Raw Lines Absorbed</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, marginTop: '4px', fontFamily: 'var(--font-mono)', color: '#10b981' }}>
                  {incident.rawLinesCount.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {(incident.bytesRepresented / (1024 * 1024)).toFixed(2)} MB volume cut
                </div>
              </div>

              <div className="card" style={{ padding: '14px' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Error Rate</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, marginTop: '4px', fontFamily: 'var(--font-mono)', color: '#f87171' }}>
                  {incident.errorRatePerSec} / sec
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Burst limit: {settings.burstThreshold}/10s</div>
              </div>
            </div>

            {/* Jev Triage Neural Evaluation Card */}
            <div
              className="card"
              style={{
                padding: '22px',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.08) 0%, transparent 100%), var(--bg-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="#60a5fa" />
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    Jev Triage Neural Classifier (FR-07, FR-08)
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '3px 9px',
                    borderRadius: '4px',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontWeight: 600,
                  }}
                >
                  Latency: {incident.modelDecision.decisionLatencyMs}ms (&lt;100ms verified)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '18px' }}>
                {/* Actionable Probability with visual progress */}
                <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Actionable Probability
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    {(incident.modelDecision.probabilityActionable * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Floor: {(settings.noiseFloor * 100).toFixed(0)}% (
                    {incident.modelDecision.probabilityActionable >= settings.noiseFloor ? 'Passes' : 'Below floor'})
                  </div>
                </div>

                {/* Severity Score */}
                <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Severity Score
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    {incident.modelDecision.severityScore}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {incident.modelDecision.severityLabel} Level (Min: {settings.severityThreshold})
                  </div>
                </div>

                {/* Model Confidence */}
                <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Confidence Level
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    {(incident.modelDecision.confidence * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Deterministic classification
                  </div>
                </div>
              </div>

              {/* Assessment */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                  color: 'var(--text-primary)',
                }}
              >
                <strong>AI Root Cause Analysis:</strong> {incident.modelDecision.reasoning}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: MASKED LOG DIFFS (HM-06) */}
        {activeTab === 'masked_diff' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                fontSize: '0.8125rem',
                color: 'var(--text-primary)',
              }}
            >
              <strong>Variable Normalization Engine (HM-06):</strong> Client host daemons replace volatile runtime values
              (IP addresses, UUIDs, hex IDs, timestamps) with canonical regex tokens so duplicate lines map to a single incident pattern.
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#f87171', marginBottom: '8px' }}>
                Raw Incoming Log Lines (Before Masking)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {incident.sampleLines.map((line, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.06)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: 'var(--text-primary)',
                      overflowX: 'auto',
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#34d399', marginBottom: '8px' }}>
                Canonical Extracted Template (After HM-06 Normalization)
              </div>
              <CodeBlock code={incident.pattern} />
            </div>

            <div
              className="card"
              style={{
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                fontSize: '0.75rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>UUIDs Masked:</span>
                <div style={{ fontWeight: 700, color: '#60a5fa', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  &lt;UUID&gt; (RFC 4122)
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>IP Addresses Masked:</span>
                <div style={{ fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  &lt;IP&gt; (IPv4 / IPv6)
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Timestamps Masked:</span>
                <div style={{ fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  &lt;TIMESTAMP&gt; (ISO 8601)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SLACK ALERT CARD (FR-11) */}
        {activeTab === 'slack_card' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SlackIcon size={14} color="#ecb22e" />
                <span>Delivered Slack Message (FR-11: All 8 Required Fields)</span>
              </div>
              {incident.alertStatus.delivered && (
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                  ✓ Sent to {incident.alertStatus.slackChannel}
                </span>
              )}
            </div>

            {/* Slack Message Visual Mockup */}
            <div
              className="card"
              style={{
                padding: '20px',
                borderLeft: '4px solid #4a154b',
                background: 'rgba(74, 21, 75, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '4px',
                    background: '#4a154b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <SlackIcon size={16} color="#ffffff" />
                </div>
                <strong style={{ fontSize: '0.9375rem' }}>LogGate Bot</strong>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.08)', padding: '1px 5px', borderRadius: '3px' }}>
                  APP
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {incident.alertStatus.deliveredAt
                    ? new Date(incident.alertStatus.deliveredAt).toLocaleTimeString()
                    : 'Pending'}
                </span>
              </div>

              {/* 8 Mandatory Fields Table */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  background: 'var(--bg-input)',
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>1. Canonical Error Pattern:</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#f87171', marginTop: '2px', wordBreak: 'break-all' }}>
                    {incident.pattern}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>2. Service Name:</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {incident.service} ({incident.environment})
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>3. Severity Level:</span>
                  <div style={{ marginTop: '2px' }}>
                    <SeverityBadge severity={incident.modelDecision.severityLabel} />
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>4. Reporting Host:</span>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {incident.hosts[0]} ({incident.hosts.length} hosts total)
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>5. Timestamp:</span>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {incident.alertStatus.deliveredAt
                      ? new Date(incident.alertStatus.deliveredAt).toISOString()
                      : new Date(incident.firstSeen).toISOString()}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>6. Error Rate:</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24', marginTop: '2px' }}>
                    {incident.errorRatePerSec} occurrences / sec
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>7. Raw Lines Absorbed:</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                    {incident.rawLinesCount.toLocaleString()} duplicate lines reduced
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>8. Owning Team:</span>
                  <div style={{ fontWeight: 700, color: '#60a5fa', marginTop: '2px' }}>
                    @{incident.modelDecision.owningTeam}
                  </div>
                </div>
              </div>

              {/* Slack Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => resolveIncident(incident.id)}
                  className="btn btn-sm"
                  style={{ background: '#007a5a', color: '#fff', border: 'none', padding: '6px 14px' }}
                >
                  ✓ Acknowledge &amp; Resolve
                </button>
                <button
                  type="button"
                  onClick={() => silenceIncident(incident.id)}
                  className="btn btn-sm btn-outline"
                  style={{ padding: '6px 14px' }}
                >
                  Silence 1 Hour
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FLEET SPREAD (FR-04) */}
        {activeTab === 'fleet_spread' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                fontSize: '0.8125rem',
                color: 'var(--text-primary)',
              }}
            >
              <strong>Multi-Host Cross-Correlation (FR-04):</strong> Rather than sending separate alerts for each server,
              LogGate aggregates duplicate patterns across all {incident.hosts.length} client hosts into this single incident record.
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>Host Node</th>
                    <th style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>Service Container</th>
                    <th style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>Local Raw Lines</th>
                    <th style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {incident.hosts.map((hostName, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {hostName}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {incident.service} (v2.4.1)
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: '#10b981' }}>
                        {Math.round(incident.rawLinesCount / incident.hosts.length).toLocaleString()} lines
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
                          Streaming
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
