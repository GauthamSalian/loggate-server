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
} from 'lucide-react';

export const TriageSandbox: React.FC = () => {
  const { evaluateSandbox } = useLogGate();

  const [selectedPresetId, setSelectedPresetId] = useState<string>(SANDBOX_PRESETS[0].id);
  const [rawInput, setRawInput] = useState<string>(SANDBOX_PRESETS[0].rawLines);
  const [service, setService] = useState<string>(SANDBOX_PRESETS[0].service);
  const [environment, setEnvironment] = useState<'production' | 'staging' | 'canary'>('production');
  const [host, setHost] = useState<string>(SANDBOX_PRESETS[0].host);

  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [result, setResult] = useState<SandboxEvaluationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = SANDBOX_PRESETS.find((preset) => preset.id === presetId);
    if (p) {
      setRawInput(p.rawLines);
      setService(p.service);
      setEnvironment(p.environment);
      setHost(p.host);
      setValidationError(null);
    }
  };

  const handleRunEvaluation = () => {
    if (!rawInput.trim()) {
      setValidationError('Please enter at least one log line or choose a realistic preset (Key flow 4.4).');
      setResult(null);
      return;
    }

    setValidationError(null);
    setEvaluating(true);

    // Simulate fast 70ms Jev model inference
    setTimeout(() => {
      const evalResult = evaluateSandbox(rawInput, service, environment, host);
      setResult(evalResult);
      setEvaluating(false);
    }, 120);
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
            <Terminal size={20} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Interactive Triage Sandbox (FR-25, Key flow 4.4)
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.875rem' }}>
          Test and preview how raw logs are parsed, masked, and judged by the Jev model with{' '}
          <strong>guaranteed zero alert dispatch</strong> to the production messaging platform.
        </p>
      </div>

      {/* Safety Guarantee Banner */}
      <div
        style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '10px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.875rem',
          color: '#34d399',
        }}
      >
        <ShieldCheck size={20} style={{ flexShrink: 0 }} />
        <div>
          <strong>Safe Testing Isolation Active (FR-25):</strong> All evaluations execute the authentic pattern
          extraction and Jev scoring pipelines, but output is contained entirely on this screen. Real engineers will
          never be paged or alerted.
        </div>
      </div>

      {/* Presets and Input Form */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Preset Selector */}
        <div>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            Production Incident Presets
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {SANDBOX_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: selectedPresetId === preset.id ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                  background: selectedPresetId === preset.id ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-input)',
                  color: selectedPresetId === preset.id ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: selectedPresetId === preset.id ? '#60a5fa' : 'var(--text-primary)' }}>
                  {preset.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Service Name
            </label>
            <input
              type="text"
              className="input-field"
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="e.g. payment-service"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Host Name
            </label>
            <input
              type="text"
              className="input-field"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="e.g. prod-node-01"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Environment
            </label>
            <select
              className="input-field"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as 'production' | 'staging' | 'canary')}
            >
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="canary">Canary</option>
            </select>
          </div>
        </div>

        {/* Textarea for log lines */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Raw Log Lines or Reduced Records (HM-03, FR-25)
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Paste one or multiple lines
            </span>
          </div>
          <textarea
            className="input-field"
            rows={6}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', resize: 'vertical' }}
            value={rawInput}
            onChange={(e) => {
              setRawInput(e.target.value);
              setSelectedPresetId('');
            }}
            placeholder="Paste raw log lines with timestamps, stacktraces, or error messages..."
          />
        </div>

        {validationError && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              background: 'var(--severity-high-bg)',
              border: '1px solid var(--severity-high-border)',
              color: 'var(--severity-high-text)',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{validationError}</span>
          </div>
        )}

        {/* Action Button */}
        <div>
          <button
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className="btn btn-primary"
            style={{ minWidth: '220px' }}
          >
            {evaluating ? (
              <>
                <Sparkles size={16} className="animate-spin" />
                <span>Running Jev Model Triage...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Run Triage Evaluation (FR-25)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Evaluation Results (FR-25) */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderRadius: '10px',
              background: result.wouldAlert ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              border: result.wouldAlert ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {result.wouldAlert ? (
                <AlertCircle size={22} color="#f87171" />
              ) : (
                <CheckCircle2 size={22} color="#34d399" />
              )}
              <div>
                <strong style={{ fontSize: '1rem', color: result.wouldAlert ? '#f87171' : '#34d399' }}>
                  {result.wouldAlert ? 'SIMULATION VERDICT: WOULD ALERT TO SLACK' : 'SIMULATION VERDICT: SUPPRESSED (NOISE)'}
                </strong>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {result.verdictReason}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SeverityBadge severity={result.modelDecision.severityLabel} />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}
              >
                Inference: {result.modelDecision.decisionLatencyMs}ms
              </span>
            </div>
          </div>

          {/* Pipeline stages */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Step 1: Extracted Pattern */}
            <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Stage 1: Extracted Pattern (HM-03, HM-04)
              </div>
              <CodeBlock code={result.pattern} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Dynamic identifiers, timestamps, ports, and tokens replaced with canonical placeholders.
              </div>
            </div>

            {/* Step 2: Jev Model Judgment */}
            <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Stage 2: Model Judgment (FR-07, FR-08)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>ACTIONABLE PROBABILITY</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>
                    {(result.modelDecision.probabilityActionable * 100).toFixed(0)}%
                  </div>
                </div>
                <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>OWNING TEAM</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#60a5fa', marginTop: '4px' }}>
                    {result.modelDecision.owningTeam}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <strong>Triage Reasoning:</strong> {result.modelDecision.reasoning}
              </div>
            </div>
          </div>

          {/* Slack Alert Payload Preview (FR-11) */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <SlackIcon size={18} color="#ecb22e" />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Slack Alert Preview (All 8 items per FR-11)
              </h3>
            </div>

            <div
              style={{
                background: 'rgba(74, 21, 75, 0.1)',
                borderLeft: '4px solid #4a154b',
                padding: '16px',
                borderRadius: '6px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                fontSize: '0.8125rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Incident:</span>{' '}
                <strong>{result.slackPayload.incidentNumber}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Service:</span>{' '}
                <strong>{result.slackPayload.service}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Rate:</span> {result.slackPayload.errorRate}
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Severity:</span>{' '}
                <span style={{ color: '#f87171', fontWeight: 600 }}>{result.slackPayload.severity}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Prob Actionable:</span>{' '}
                {result.slackPayload.probabilityActionable}
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Owning Team:</span>{' '}
                <strong style={{ color: '#60a5fa' }}>{result.slackPayload.owningTeam}</strong>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pattern:</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginTop: '2px' }}>
                  {result.slackPayload.errorPattern}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--text-muted)' }}>Incident URL:</span>{' '}
                <span style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                  {result.slackPayload.incidentDetailUrl}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
