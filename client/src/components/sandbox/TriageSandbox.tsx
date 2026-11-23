import React, { useState, useRef } from 'react';
import { useLogGate } from '../../context/LogGateContext';
import { SANDBOX_PRESETS } from '../../data/mockData';
import type { SandboxEvaluationResult } from '../../types';
import { CodeBlock } from '../common/CodeBlock';
import { SeverityBadge } from '../common/Badge';
import { SlackIcon } from '../common/Icons';
import {
  Terminal,
  Play,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

export const TriageSandbox: React.FC = () => {
  const { evaluateSandbox } = useLogGate();
  const resultsRef = useRef<HTMLDivElement>(null);

  const [selectedPresetId, setSelectedPresetId] = useState<string>(SANDBOX_PRESETS[0].id);
  const [rawInput, setRawInput] = useState<string>(SANDBOX_PRESETS[0].rawLines);
  const [service, setService] = useState<string>(SANDBOX_PRESETS[0].service);
  const [environment, setEnvironment] = useState<'production' | 'staging' | 'canary'>('production');
  const [host, setHost] = useState<string>(SANDBOX_PRESETS[0].host);

  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [justEvaluated, setJustEvaluated] = useState<boolean>(false);
  const [result, setResult] = useState<SandboxEvaluationResult | null>(() => {
    return evaluateSandbox(
      SANDBOX_PRESETS[0].rawLines,
      SANDBOX_PRESETS[0].service,
      SANDBOX_PRESETS[0].environment,
      SANDBOX_PRESETS[0].host
    );
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copiedPattern, setCopiedPattern] = useState(false);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = SANDBOX_PRESETS.find((preset) => preset.id === presetId);
    if (p) {
      setRawInput(p.rawLines);
      setService(p.service);
      setEnvironment(p.environment);
      setHost(p.host);
      setValidationError(null);
      // Auto-evaluate preset
      const evalRes = evaluateSandbox(p.rawLines, p.service, p.environment, p.host);
      setResult(evalRes);
      setJustEvaluated(true);
      setTimeout(() => setJustEvaluated(false), 2000);
    }
  };

  const handleRunEvaluation = () => {
    if (!rawInput.trim()) {
      setValidationError('Please enter at least one log line or choose an incident preset.');
      return;
    }

    setValidationError(null);
    setEvaluating(true);

    // Realistic evaluation delay with smooth feedback
    setTimeout(() => {
      const evalResult = evaluateSandbox(rawInput, service, environment, host);
      setResult(evalResult);
      setEvaluating(false);
      setJustEvaluated(true);
      setTimeout(() => setJustEvaluated(false), 2500);

      // Smooth scroll to results on smaller screens
      if (window.innerWidth < 1024 && resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 350);
  };

  const handleCopyPattern = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.pattern);
    setCopiedPattern(true);
    setTimeout(() => setCopiedPattern(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <Terminal size={18} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Interactive Triage Sandbox
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '2px' }}>
                Simulate real-time token masking &amp; Jev model scoring. <strong>Backend is optional</strong> — runs instant client-side inference if server is offline.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Zap size={13} />
            <span>Zero Slack Alert Dispatch (Safe Isolation)</span>
          </div>
        </div>
      </div>

      {/* Supabase-Style 2-Column Split Pane (Guaranteed Side-by-Side on Desktop) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.15fr)',
          gap: '20px',
          alignItems: 'flex-start',
        }}
        className="sandbox-grid"
      >
        {/* ===================== LEFT COLUMN: INPUT PANEL ===================== */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Presets */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Incident Presets
              </label>
              <span style={{ fontSize: '0.6875rem', color: '#10b981' }}>Click any to test</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {SANDBOX_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: isSelected ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-input)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isSelected ? '#10b981' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {preset.name}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {preset.service}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Config: Service & Env */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                Service Name
              </label>
              <input
                type="text"
                className="input-field"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="e.g. payment-gateway"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                Environment
              </label>
              <select
                className="input-field"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as 'production' | 'staging' | 'canary')}
              >
                <option value="production">production</option>
                <option value="staging">staging</option>
                <option value="canary">canary</option>
              </select>
            </div>
          </div>

          {/* Raw Log Textarea */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Raw Log Lines or Stacktrace
              </label>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Auto-masks IPs, tokens, UUIDs
              </span>
            </div>
            <textarea
              className="input-field"
              rows={7}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: '1.5', resize: 'vertical' }}
              value={rawInput}
              onChange={(e) => {
                setRawInput(e.target.value);
                setSelectedPresetId('');
              }}
              placeholder="Paste raw log lines with timestamps or stack traces..."
            />
          </div>

          {validationError && (
            <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '0.75rem' }}>
              {validationError}
            </div>
          )}

          {/* Primary CTA Button */}
          <div>
            <button
              onClick={handleRunEvaluation}
              disabled={evaluating}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '0.875rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {evaluating ? (
                <>
                  <Sparkles size={16} />
                  <span>Evaluating Jev Model Triage...</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>Simulate Triage Decision</span>
                </>
              )}
            </button>
          </div>

          {justEvaluated && (
            <div
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                fontSize: '0.75rem',
                textAlign: 'center',
                fontWeight: 600,
                animation: 'pulse-ring 1s ease',
              }}
            >
              Decision calculated &amp; output updated on the right!
            </div>
          )}
        </div>

        {/* ===================== RIGHT COLUMN: DECISION OUTPUT PANEL ===================== */}
        <div ref={resultsRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {result && (
            <>
              {/* Verdict Banner */}
              <div
                style={{
                  padding: '16px 18px',
                  borderRadius: 'var(--radius-lg)',
                  background: result.wouldAlert ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                  border: result.wouldAlert ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {result.wouldAlert ? (
                    <AlertCircle size={22} color="#f87171" style={{ flexShrink: 0 }} />
                  ) : (
                    <CheckCircle2 size={22} color="#34d399" style={{ flexShrink: 0 }} />
                  )}
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: result.wouldAlert ? '#f87171' : '#34d399', display: 'block' }}>
                      {result.wouldAlert ? 'SIMULATION VERDICT: WOULD ALERT SLACK' : 'SIMULATION VERDICT: SUPPRESSED (BENIGN NOISE)'}
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {result.verdictReason}
                    </div>
                  </div>
                </div>

                <SeverityBadge severity={result.modelDecision.severityLabel} />
              </div>

              {/* AI Scoring Breakdown Card */}
              <div className="card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Jev AI Judgment &amp; Scoring
                  </h3>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: '#10b981',
                      background: 'rgba(16, 185, 129, 0.12)',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    Inference: {result.modelDecision.decisionLatencyMs} ms
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>SEVERITY SCORE</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: result.wouldAlert ? '#f87171' : '#34d399', marginTop: '2px' }}>
                      {result.modelDecision.severityScore === 2 ? '2.40 / 3.0' : result.modelDecision.severityScore === 1 ? '1.45 / 3.0' : '0.40 / 3.0'}
                    </div>
                  </div>

                  <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>ACTIONABLE PROBABILITY</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                      {(result.modelDecision.probabilityActionable * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>OWNING TEAM</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#60a5fa', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {result.modelDecision.owningTeam}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '10px 12px', background: 'var(--bg-card-subtle)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <strong>Decision Reasoning:</strong> {result.modelDecision.reasoning}
                </div>
              </div>

              {/* Extracted Pattern Code Block */}
              <div className="card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, margin: 0 }}>
                    Extracted Universal Signature
                  </h3>
                  <button onClick={handleCopyPattern} className="btn btn-outline btn-sm" style={{ padding: '2px 8px', fontSize: '0.6875rem' }}>
                    {copiedPattern ? <Check size={11} color="#10b981" /> : <Copy size={11} />}
                    <span>{copiedPattern ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <CodeBlock code={result.pattern} />
              </div>

              {/* Slack Alert Replica */}
              <div className="card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <SlackIcon size={15} color="#ecb22e" />
                  <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, margin: 0 }}>
                    Simulated Slack Block Kit Payload
                  </h3>
                </div>

                <div
                  style={{
                    background: 'rgba(74, 21, 75, 0.08)',
                    borderLeft: '4px solid #4a154b',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ color: result.wouldAlert ? '#f87171' : '#fbbf24', fontWeight: 700, marginBottom: '4px' }}>
                    [{result.wouldAlert ? 'CRITICAL' : 'WARNING'}] {service} ({environment}) — 24x
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem', marginBottom: '6px' }}>
                    *Project:* {service} • *Score:* {result.modelDecision.severityScore === 2 ? '2.40/3.0' : '1.45/3.0'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', background: 'rgba(0,0,0,0.35)', padding: '6px 8px', borderRadius: '4px', wordBreak: 'break-all' }}>
                    {result.pattern.slice(0, 160)}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
