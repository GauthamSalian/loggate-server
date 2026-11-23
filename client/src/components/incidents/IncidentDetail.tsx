import React, { useState } from 'react';
import type { Incident } from '../../types';
import { useLogGate } from '../../context/LogGateContext';
import { SeverityBadge, DegradedMarker, StatusBadge } from '../common/Badge';
import { SlackIcon } from '../common/Icons';
import { CodeBlock } from '../common/CodeBlock';
import {
  ArrowLeft,
  CheckCircle,
  VolumeX,
  RotateCcw,
  Server,
  Sparkles,
  Copy,
  Check,
  Send,
  Calendar,
  Layers,
} from 'lucide-react';

interface IncidentDetailProps {
  incident: Incident;
  onClose: () => void;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({ incident, onClose }) => {
  const { currentProject, resolveIncident, silenceIncident, reopenIncident } = useLogGate();
  const [copiedPattern, setCopiedPattern] = useState(false);
  const [sentTestSlack, setSentTestSlack] = useState(false);

  const handleCopyPattern = () => {
    navigator.clipboard.writeText(incident.pattern);
    setCopiedPattern(true);
    setTimeout(() => setCopiedPattern(false), 2000);
  };

  const handleTriggerTest = () => {
    setSentTestSlack(true);
    setTimeout(() => setSentTestSlack(false), 2500);
  };

  const projectName = currentProject.name || 'payment-gateway-prod';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Supabase-Style Breadcrumb Header & Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={14} />
            <span>Back to Incidents</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <span>Projects</span>
            <span>/</span>
            <span style={{ color: 'var(--text-secondary)' }}>{projectName}</span>
            <span>/</span>
            <span style={{ color: 'var(--text-secondary)' }}>Incidents</span>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {incident.id}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {incident.status === 'ACTIVE' ? (
            <>
              <button
                onClick={() => resolveIncident(incident.id)}
                className="btn btn-sm btn-secondary"
                style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle size={14} />
                <span>Mark Resolved</span>
              </button>
              <button
                onClick={() => silenceIncident(incident.id)}
                className="btn btn-sm btn-secondary"
                style={{ color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <VolumeX size={14} />
                <span>Silence Pattern</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => reopenIncident(incident.id)}
              className="btn btn-sm btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCcw size={14} />
              <span>Reopen Incident</span>
            </button>
          )}

          <button
            onClick={handleTriggerTest}
            className="btn btn-sm btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Send size={13} />
            <span>{sentTestSlack ? 'Dispatched to Slack!' : 'Test Slack Alert'}</span>
          </button>
        </div>
      </div>

      {/* Incident Title Card */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <SeverityBadge severity={incident.modelDecision.severityLabel} />
          {incident.isDegraded && <DegradedMarker />}
          <StatusBadge status={incident.status} />
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'var(--bg-input)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {incident.service}
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              background: incident.environment === 'production' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              color: incident.environment === 'production' ? '#34d399' : '#fbbf24',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {incident.environment}
          </span>
        </div>

        <h2
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-primary)',
            margin: '0 0 10px 0',
            lineHeight: 1.4,
          }}
        >
          {incident.pattern}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Calendar size={13} />
            <span>First Seen: {incident.firstSeen}</span>
          </div>
          <div>•</div>
          <div>Last Seen: {incident.lastSeen}</div>
          <div>•</div>
          <div>{incident.rawLinesCount.toLocaleString()} raw lines represented</div>
        </div>
      </div>

      {/* 2. Split Pane Layout (65% Forensic Evidence / 35% AI Decision & Slack) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
          gap: '20px',
          alignItems: 'flex-start',
        }}
      >
        {/* ===================== LEFT COLUMN (FORENSIC EVIDENCE - 65%) ===================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Canonical Pattern Box */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={15} color="#10b981" />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
                  Canonical Pattern (Token Masked)
                </h3>
              </div>
              <button onClick={handleCopyPattern} className="btn btn-outline btn-sm">
                {copiedPattern ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copiedPattern ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <CodeBlock code={incident.pattern} />

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', fontSize: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="token-highlight">&lt;UUID&gt;</span>
                <span style={{ color: 'var(--text-muted)' }}>Transaction ID</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="token-masked">&lt;IP&gt;</span>
                <span style={{ color: 'var(--text-muted)' }}>Client / Host IP</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="token-highlight">&lt;TIMESTAMP&gt;</span>
                <span style={{ color: 'var(--text-muted)' }}>ISO-8601</span>
              </div>
            </div>
          </div>

          {/* Sample Log Lines (Max 3 lines captured from host) */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0 0 4px 0' }}>
              Raw Captured Sample Lines (Max 3)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '12px' }}>
              Unredacted forensic context captured directly by the host tail module on the application server.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {incident.sampleLines.slice(0, 3).map((line, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#090a0b',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: '#e4e4e7',
                    lineHeight: '1.5',
                    wordBreak: 'break-all',
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Fleet Distribution & Time Window */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Server size={15} color="#3b82f6" />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
                Fleet Distribution &amp; Reporting Nodes
              </h3>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Host Node</th>
                  <th>Service</th>
                  <th>Occurrences</th>
                  <th>Reduction Ratio</th>
                </tr>
              </thead>
              <tbody>
                {incident.hosts.map((hostName, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{hostName}</td>
                    <td>{incident.service}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {Math.floor(incident.rawLinesCount / (incident.hosts.length || 1)).toLocaleString()} lines
                    </td>
                    <td>
                      <span style={{ color: '#10b981', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        98.5%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================== RIGHT COLUMN (AI DECISION & SLACK - 35%) ===================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* AI Decision Card */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Sparkles size={16} color="#10b981" />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
                Jev AI Triage Decision
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>SEVERITY SCORE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171', marginTop: '2px' }}>
                  2.45 / 3.00
                </div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIONABLE PROBABILITY</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                  {(incident.modelDecision.probabilityActionable * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', padding: '12px', background: 'var(--bg-card-subtle)', borderRadius: '6px', border: '1px solid var(--border-subtle)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Decision Reasoning:
              </strong>
              {incident.modelDecision.reasoning}
            </div>

            <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Owning Team: <strong style={{ color: '#60a5fa' }}>{incident.modelDecision.owningTeam}</strong>
            </div>
          </div>

          {/* Slack Notification Preview Card (Visual Replica of Block Kit) */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlackIcon size={16} color="#ecb22e" />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
                  Slack Block Kit Preview
                </h3>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
                Delivered 200 OK
              </span>
            </div>

            <div
              style={{
                background: 'rgba(74, 21, 75, 0.08)',
                borderLeft: '4px solid #4a154b',
                padding: '14px 16px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <div style={{ color: '#f87171', fontWeight: 700, marginBottom: '6px', fontSize: '0.8125rem' }}>
                [CRITICAL] {incident.service} ({incident.environment}) — {incident.rawLinesCount}x occurrences
              </div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                *Project:* {projectName} • *Owning Team:* {incident.modelDecision.owningTeam} • *Score:* 2.45/3.0
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '8px',
                  borderRadius: '4px',
                  wordBreak: 'break-all',
                  color: '#e4e4e7',
                }}
              >
                {incident.pattern}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
