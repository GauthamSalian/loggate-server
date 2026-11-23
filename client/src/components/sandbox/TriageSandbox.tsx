import React, { useState } from 'react';
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
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

export const TriageSandbox: React.FC = () => {
  const { evaluateSandbox } = useLogGate();

  const [selectedPresetId, setSelectedPresetId] = useState<string>(SANDBOX_PRESETS[0].id);
  const [rawInput, setRawInput] = useState<string>(SANDBOX_PRESETS[0].rawLines);
  const [service, setService] = useState<string>(SANDBOX_PRESETS[0].service);
  const [environment, setEnvironment] = useState<'production' | 'staging' | 'canary'>('production');
  const [host, setHost] = useState<string>(SANDBOX_PRESETS[0].host);

  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [result, setResult] = useState<SandboxEvaluationResult | null>(() => {
    // Pre-evaluate first preset so right pane isn't blank on initial load
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
    }
  };

  const handleRunEvaluation = () => {
    if (!rawInput.trim()) {
      setValidationError('Please enter at least one log line or choose a preset.');
      return;
    }

    setValidationError(null);
    setEvaluating(true);

    setTimeout(() => {
      const evalResult = evaluateSandbox(rawInput, service, environment, host);
      setResult(evalResult);
      setEvaluating(false);
    }, 100);
  };

  const handleCopyPattern = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.pattern);
    setCopiedPattern(true);
    setTimeout(() => setCopiedPattern(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
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
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Interactive Triage Sandbox
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '4px' }}>
          Safe testing ground to simulate token masking and Jev model inference with guaranteed zero Slack alert dispatch.
        </p>
      </div>

      {/* Supabase-Style 2-Column Split Pane */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '24px',
          alignItems: 'flex-start',
        }}
      >
        {/* ===================== LEFT COLUMN: INPUT PANEL ===================== */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Quick Presets */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Incident Presets
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {SANDBOX_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: isSelected ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-input)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: isSelected ? '#10b981' : 'var(--text-primary)' }}>
                      {preset.name}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {preset.service}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Config: Service & Env */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                Service Name
              </label>
              <input
                type="text"
                className="input-field"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="e.g. auth-service"
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
                Paste lines with timestamps, IPs, UUIDs
              </span>
            </div>
            <textarea
              className="input-field"
              rows={8}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: '1.5', resize: 'vertical' }}
              value={rawInput}
              onChange={(e) => {
                setRawInput(e.target.value);
                setSelectedPresetId('');
              }}
              placeholder="Paste raw log lines..."
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
              style={{ width: '100%', padding: '10px' }}
            >
              {evaluating ? (
                <>
                  <Sparkles size={15} />
                  <span>Evaluating with Jev Model...</span>
                </>
              ) : (
                <>
                  <Play size={15} />
                  <span>Simulate Triage Decision</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ===================== RIGHT COLUMN: DECISION OUTPUT PANEL ===================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {result ? (
            <>
              {/* Verdict Banner */}
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-lg)',
                  background: result.wouldAlert ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                  border: result.wouldAlert ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {result.wouldAlert ? (
                    <AlertCircle size={22} color="#f87171" />
                  ) : (
                    <CheckCircle2 size={22} color="#34d399" />
                  )}
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: result.wouldAlert ? '#f87171' : '#34d399' }}>
                      {result.wouldAlert ? 'VERDICT: WOULD ALERT SLACK' : 'VERDICT: SUPPRESSED AS NOISE'}
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {result.verdictReason}
                    </div>
                  </div>
                </div>

                <SeverityBadge severity={result.modelDecision.severityLabel} />
              </div>

              {/* AI Scoring Breakdown Card */}
              <div className="card" style={{ padding: '22px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, marginBottom: '14px' }}>
                  Jev AI Judgment &amp; Confidence
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>SEVERITY SCORE</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: result.wouldAlert ? '#f87171' : '#34d399', marginTop: '2px' }}>
                      {result.modelDecision.severityScore === 2 ? '2.40 / 3.0' : result.modelDecision.severityScore === 1 ? '1.45 / 3.0' : '0.40 / 3.0'}
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>ACTIONABLE PROBABILITY</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                      {(result.modelDecision.probabilityActionable * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>INFERENCE LATENCY</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                      {result.modelDecision.decisionLatencyMs} ms
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', padding: '12px', background: 'var(--bg-card-subtle)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <strong>Decision Reasoning:</strong> {result.modelDecision.reasoning}
                </div>
              </div>

              {/* Extracted Pattern Code Block */}
              <div className="card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
                    Extracted Canonical Signature
                  </h3>
                  <button onClick={handleCopyPattern} className="btn btn-outline btn-sm">
                    {copiedPattern ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    <span>{copiedPattern ? 'Copied' : 'Copy Pattern'}</span>
                  </button>
                </div>
                <CodeBlock code={result.pattern} />
              </div>

              {/* Slack Alert Replica */}
              <div className="card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <SlackIcon size={16} color="#ecb22e" />
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Slack Block Kit Preview</h3>
                </div>

                <div
                  style={{
                    background: 'rgba(74, 21, 75, 0.08)',
                    borderLeft: '4px solid #4a154b',
                    padding: '14px 16px',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <div style={{ color: result.wouldAlert ? '#f87171' : '#fbbf24', fontWeight: 700, marginBottom: '6px' }}>
                    [{result.wouldAlert ? 'CRITICAL' : 'BUG'}] {service} ({environment}) — 24x
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '8px' }}>
                    *Project:* LogGate Demo • *Score:* {result.modelDecision.severityScore === 2 ? '2.40/3.0' : '1.45/3.0'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '4px' }}>
                    {result.pattern.slice(0, 160)}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              <ShieldCheck size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Ready to Simulate</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '4px' }}>
                Pick an incident preset on the left or paste your own raw log lines, then click &quot;Simulate Triage Decision&quot;.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
