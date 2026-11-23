import React, { useState } from 'react';
import { SANDBOX_PRESETS } from '../../data/mockData';
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
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SANDBOX_PRESETS[1].id); // Default to Stripe 504 preset
  const [rawInput, setRawInput] = useState<string>(SANDBOX_PRESETS[1].rawLines);
  const [service, setService] = useState<string>(SANDBOX_PRESETS[1].service);
  const [environment, setEnvironment] = useState<'production' | 'staging' | 'dev'>('staging');

  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [copiedPattern, setCopiedPattern] = useState(false);

  // Result state
  const computeDecision = (input: string, env: string) => {
    const isCritical =
      input.toLowerCase().includes('pool') ||
      input.toLowerCase().includes('oom') ||
      input.toLowerCase().includes('heap') ||
      input.toLowerCase().includes('fatal') ||
      input.toLowerCase().includes('deadlock');

    const isWarning =
      input.toLowerCase().includes('504') ||
      input.toLowerCase().includes('timeout') ||
      input.toLowerCase().includes('500') ||
      input.toLowerCase().includes('gateway');

    let score = 2.45;
    let label: 'Critical' | 'Warning' | 'Benign' = 'Critical';
    let prob = 0.96;
    let reason = 'Severe infrastructure failure impacting transaction completion.';

    if (isCritical) {
      score = env === 'production' ? 2.85 : 2.45;
      label = 'Critical';
      prob = 0.98;
      reason = 'Severe DB connection exhaustion or JVM fatal memory crash.';
    } else if (isWarning) {
      score = env === 'production' ? 2.10 : 1.85;
      label = env === 'production' ? 'Critical' : 'Warning';
      prob = 0.88;
      reason = 'Upstream payment gateway timeout exceeding 5000ms SLA.';
    } else {
      score = 0.65;
      label = 'Benign';
      prob = 0.24;
      reason = 'Routine client-side authentication probe or benign noise.';
    }

    const wouldAlert = score >= 1.8;
    const cleanPattern = input.split('\n')[0].slice(0, 140);

    return {
      severityLabel: label,
      numericalScore: score,
      probability: prob,
      wouldAlert,
      reason,
      pattern: cleanPattern,
    };
  };

  const [result, setResult] = useState(() => computeDecision(SANDBOX_PRESETS[1].rawLines, 'staging'));

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = SANDBOX_PRESETS.find((preset) => preset.id === presetId);
    if (p) {
      setRawInput(p.rawLines);
      setService(p.service);
      const mappedEnv = p.environment === 'canary' ? 'staging' : (p.environment as 'production' | 'staging' | 'dev');
      setEnvironment(mappedEnv);
      setResult(computeDecision(p.rawLines, mappedEnv));
    }
  };

  const handleRunEvaluation = () => {
    if (!rawInput.trim()) return;
    setEvaluating(true);
    setTimeout(() => {
      setResult(computeDecision(rawInput, environment));
      setEvaluating(false);
    }, 200);
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
                Interactive Triage Sandbox (URD FR-25, US-08)
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '2px' }}>
                Safe testing ground for pasting sample logs and testing AI severity scoring without emitting Slack alerts.
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
            <span>Zero Slack Alert Dispatch (Guaranteed Safe)</span>
          </div>
        </div>
      </div>

      {/* Supabase 2-Column Split Layout (50% Input / 50% Output) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '20px',
          alignItems: 'flex-start',
        }}
      >
        {/* ===================== 1. INPUT PANEL (LEFT HALF) ===================== */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Preset Selector Chips */}
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>
              Incident Presets
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {SANDBOX_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
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

          {/* Service Name */}
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

          {/* Environment Selector: Radio Group (production vs staging vs dev per UI Architecture Doc) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Environment (Radio Group)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {(['production', 'staging', 'dev'] as const).map((env) => {
                const isChecked = environment === env;
                return (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setEnvironment(env)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: isChecked ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                      background: isChecked ? 'rgba(16, 185, 129, 0.14)' : 'var(--bg-input)',
                      color: isChecked ? '#34d399' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: isChecked ? 700 : 500,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                    }}
                  >
                    {env}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Raw Log Textarea */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Raw Log Lines or Stacktrace
              </label>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Shortcut: <kbd style={{ background: 'var(--bg-input)', padding: '1px 4px', borderRadius: '3px', border: '1px solid var(--border-subtle)' }}>Ctrl+Enter</kbd>
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
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  handleRunEvaluation();
                }
              }}
              placeholder="Paste raw log lines with timestamps or stack traces..."
            />
          </div>

          {/* Simulate Button: Primary CTA with keyboard shortcut */}
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
                  <span>Evaluating Jev Model Scoring...</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>Simulate Triage Decision</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ===================== 2. DECISION OUTPUT PANEL (RIGHT HALF) ===================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Slack Routing Simulation Verdict Callout */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-lg)',
              background: result.wouldAlert ? 'rgba(16, 185, 129, 0.12)' : 'rgba(113, 113, 122, 0.14)',
              border: result.wouldAlert ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(113, 113, 122, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {result.wouldAlert ? (
                <CheckCircle2 size={22} color="#34d399" style={{ flexShrink: 0 }} />
              ) : (
                <AlertCircle size={22} color="#a1a1aa" style={{ flexShrink: 0 }} />
              )}
              <div>
                <strong style={{ fontSize: '0.875rem', color: result.wouldAlert ? '#34d399' : '#a1a1aa', display: 'block' }}>
                  {result.wouldAlert
                    ? 'At current threshold (1.8), an alert WOULD be posted to #alerts-prod.'
                    : 'Below threshold. This incident would be logged silently without paging on-call.'}
                </strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {result.reason}
                </div>
              </div>
            </div>

            {/* Computed Severity Badge */}
            <SeverityBadge severity={result.severityLabel === 'Critical' ? 'High' : result.severityLabel === 'Warning' ? 'Medium' : 'Noise'} />
          </div>

          {/* Numerical Score & Probability Gauge */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
                Computed Scoring &amp; Confidence
              </h3>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Target threshold: 1.80 / 3.00
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '14px' }}>
              {/* Numerical Score (e.g. 2.10 / 3.00) */}
              <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>NUMERICAL SCORE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: result.numericalScore >= 1.8 ? '#f87171' : '#34d399', marginTop: '2px' }}>
                  {result.numericalScore.toFixed(2)} / 3.00
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {result.numericalScore >= 1.8 ? '>= 1.8 (Actionable)' : '< 1.8 (Muted)'}
                </div>
              </div>

              {/* Actionable Probability Gauge */}
              <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIONABLE PROBABILITY</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                  {(result.probability * 100).toFixed(0)}%
                </div>
                {/* Visual Progress Bar Gauge */}
                <div style={{ width: '100%', height: '5px', background: 'var(--border-subtle)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${result.probability * 100}%`, height: '100%', background: '#38bdf8' }} />
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '10px 12px', background: 'var(--bg-card-subtle)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <strong>AI Triage Judgment:</strong> {result.reason}
            </div>
          </div>

          {/* Masked Pattern Signature */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, margin: 0 }}>
                Masked Pattern Signature
              </h3>
              <button onClick={handleCopyPattern} className="btn btn-outline btn-sm" style={{ padding: '2px 8px', fontSize: '0.6875rem' }}>
                {copiedPattern ? <Check size={11} color="#10b981" /> : <Copy size={11} />}
                <span>{copiedPattern ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <CodeBlock code={result.pattern} />
          </div>

          {/* Slack Block Kit Replica */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <SlackIcon size={15} color="#ecb22e" />
              <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, margin: 0 }}>
                Slack Notification Preview (#alerts-prod)
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
                [{result.severityLabel.toUpperCase()}] {service} ({environment}) — 24x occurrences
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem', marginBottom: '6px' }}>
                *Project:* {service} • *Score:* {result.numericalScore.toFixed(2)}/3.00 • *Probability:* {(result.probability * 100).toFixed(0)}%
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', background: 'rgba(0,0,0,0.35)', padding: '6px 8px', borderRadius: '4px', wordBreak: 'break-all' }}>
                {result.pattern.slice(0, 160)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
