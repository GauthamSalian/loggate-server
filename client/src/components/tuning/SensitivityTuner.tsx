import React, { useState, useMemo } from 'react';
import { useLogGate } from '../../context/LogGateContext';
import { SeverityBadge } from '../common/Badge';
import {
  Sliders,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Save,
} from 'lucide-react';

export const SensitivityTuner: React.FC = () => {
  const { settings, updateNoiseFloor, updateSeverityThreshold, updateSettings, incidents } = useLogGate();

  // Local draft state before saving (per Key Flow 4.3: leaving without saving changes nothing)
  const [draftNoiseFloor, setDraftNoiseFloor] = useState<number>(settings.noiseFloor);
  const [draftSeverityThreshold, setDraftSeverityThreshold] = useState<number>(settings.severityThreshold);
  const [draftBurstThreshold, setDraftBurstThreshold] = useState<number>(settings.burstThreshold);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync draft if settings update from elsewhere
  React.useEffect(() => {
    setDraftNoiseFloor(settings.noiseFloor);
    setDraftSeverityThreshold(settings.severityThreshold);
    setDraftBurstThreshold(settings.burstThreshold);
  }, [settings]);

  // Live simulation preview calculation (FR-22)
  const preview = useMemo(() => {
    let wouldAlert = 0;
    let wouldSilence = 0;

    const incidentDecisions = incidents.map((inc) => {
      const prob = inc.modelDecision.probabilityActionable;
      const score = inc.modelDecision.severityScore;
      const alerts = prob >= draftNoiseFloor && score >= draftSeverityThreshold;
      if (alerts) {
        wouldAlert++;
      } else {
        wouldSilence++;
      }
      return {
        ...inc,
        wouldAlert: alerts,
        reason: alerts
          ? `Prob ${prob.toFixed(2)} ≥ ${draftNoiseFloor.toFixed(2)} & Score ${score} ≥ ${draftSeverityThreshold}`
          : prob < draftNoiseFloor
          ? `Prob ${prob.toFixed(2)} < ${draftNoiseFloor.toFixed(2)} (Below noise floor)`
          : `Severity score ${score} < ${draftSeverityThreshold}`,
      };
    });

    const total = incidents.length || 1;
    const noiseReductionPercent = Math.round((wouldSilence / total) * 100);

    return {
      wouldAlert,
      wouldSilence,
      total,
      noiseReductionPercent,
      incidentDecisions,
    };
  }, [incidents, draftNoiseFloor, draftSeverityThreshold]);

  // Histogram Bins for Probability Distribution (0.00 to 1.00 in 10 buckets)
  const histogramBins = useMemo(() => {
    const buckets = [
      { range: '0.0-0.1', min: 0.0, max: 0.1, count: 0 },
      { range: '0.1-0.2', min: 0.1, max: 0.2, count: 1 },
      { range: '0.2-0.3', min: 0.2, max: 0.3, count: 2 },
      { range: '0.3-0.4', min: 0.3, max: 0.4, count: 1 },
      { range: '0.4-0.5', min: 0.4, max: 0.5, count: 0 },
      { range: '0.5-0.6', min: 0.5, max: 0.6, count: 2 },
      { range: '0.6-0.7', min: 0.6, max: 0.7, count: 3 },
      { range: '0.7-0.8', min: 0.7, max: 0.8, count: 4 },
      { range: '0.8-0.9', min: 0.8, max: 0.9, count: 6 },
      { range: '0.9-1.0', min: 0.9, max: 1.0, count: 8 },
    ];

    // Add incidents to buckets
    incidents.forEach((inc) => {
      const p = inc.modelDecision.probabilityActionable;
      const b = buckets.find((b) => p >= b.min && p <= b.max);
      if (b) b.count += 2;
    });

    return buckets;
  }, [incidents]);

  const handleSave = () => {
    updateNoiseFloor(draftNoiseFloor);
    updateSeverityThreshold(draftSeverityThreshold);
    updateSettings({ burstThreshold: draftBurstThreshold });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setDraftNoiseFloor(0.85); // URD Default
    setDraftSeverityThreshold(1.0); // URD Default
    setDraftBurstThreshold(200); // URD Default
  };

  const hasUnsavedChanges =
    draftNoiseFloor !== settings.noiseFloor ||
    draftSeverityThreshold !== settings.severityThreshold ||
    draftBurstThreshold !== settings.burstThreshold;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--brand-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Sliders size={20} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Noise-Floor &amp; Alert Sensitivity (FR-22)
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.875rem' }}>
            Tune the neural triage decision boundary without restarting services (US-04). Preview how past incidents react before committing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handleResetDefaults} className="btn btn-outline btn-sm">
            <RotateCcw size={13} />
            <span>Reset to URD Defaults (0.85)</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="btn btn-primary"
            style={{
              opacity: hasUnsavedChanges ? 1 : 0.6,
              cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
            }}
          >
            <Save size={16} />
            <span>Save Settings (Live Apply)</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '8px',
            background: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            color: 'var(--success-text)',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle size={18} />
          <span>
            <strong>Settings Applied!</strong> Future incoming incident batches will be judged against noise floor{' '}
            <strong>{settings.noiseFloor.toFixed(2)}</strong> without restarting the server (FR-22, Key flow 4.3).
          </span>
        </div>
      )}

      {/* Main Grid: Control Panel on Left, Live Retrospective Preview on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Controls Card */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Tuning Controls
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Config: <code style={{ color: '#60a5fa' }}>config/settings.yaml</code>
            </span>
          </div>

          {/* Slider: Noise Floor Threshold */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Actionable Probability Floor:
              </label>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  background: 'var(--brand-primary)',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  boxShadow: '0 2px 6px rgba(59, 130, 246, 0.4)',
                }}
              >
                {draftNoiseFloor.toFixed(2)}
              </span>
            </div>

            <input
              type="range"
              min="0.00"
              max="1.00"
              step="0.01"
              className="slider-range"
              value={draftNoiseFloor}
              onChange={(e) => setDraftNoiseFloor(parseFloat(e.target.value))}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              <span>0.00 (Alert on everything)</span>
              <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>URD Default: 0.85</span>
              <span>1.00 (Strict only)</span>
            </div>

            {/* Quick Preset Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              {[
                { label: 'Aggressive (0.70)', val: 0.70 },
                { label: 'Balanced (0.85)', val: 0.85 },
                { label: 'Strict Guard (0.95)', val: 0.95 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setDraftNoiseFloor(preset.val)}
                  className="btn btn-sm btn-outline"
                  style={{
                    flex: 1,
                    fontSize: '0.75rem',
                    borderColor: draftNoiseFloor === preset.val ? 'var(--brand-primary)' : 'var(--border-subtle)',
                    background: draftNoiseFloor === preset.val ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: draftNoiseFloor === preset.val ? '#60a5fa' : 'var(--text-secondary)',
                    fontWeight: draftNoiseFloor === preset.val ? 700 : 500,
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '12px', lineHeight: 1.45 }}>
              Incidents with model probability &lt; {draftNoiseFloor.toFixed(2)} are recorded silently on the dashboard
              without dispatching messages to Slack (FR-09).
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Probability Distribution Spectrum Visualization */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Incident Probability Distribution Spectrum
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Threshold Marker at {draftNoiseFloor.toFixed(2)}
              </span>
            </div>

            <div
              style={{
                position: 'relative',
                height: '70px',
                background: 'var(--bg-input)',
                borderRadius: '8px',
                padding: '8px 12px 20px 12px',
                display: 'flex',
                alignItems: 'flex-end',
                gap: '4px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {histogramBins.map((bin, idx) => {
                const isAboveThreshold = bin.min >= draftNoiseFloor;
                const maxCount = 10;
                const heightPct = Math.max((bin.count / maxCount) * 100, 15);
                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      height: `${heightPct}%`,
                      borderRadius: '3px 3px 0 0',
                      background: isAboveThreshold
                        ? 'linear-gradient(180deg, #ef4444 0%, #f59e0b 100%)'
                        : 'rgba(100, 116, 139, 0.4)',
                      transition: 'all 0.2s ease',
                    }}
                    title={`${bin.range}: ${bin.count} incidents (${isAboveThreshold ? 'Would Alert' : 'Suppressed'})`}
                  />
                );
              })}

              {/* Threshold Line overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${draftNoiseFloor * 100}%`,
                  width: '2px',
                  background: '#60a5fa',
                  boxShadow: '0 0 8px rgba(96, 165, 250, 0.8)',
                  pointerEvents: 'none',
                  transition: 'left 0.1s ease',
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#3b82f6',
                    color: '#fff',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    padding: '1px 4px',
                    borderRadius: '3px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {draftNoiseFloor.toFixed(2)}
                </div>
              </div>

              {/* Bottom spectrum labels */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '3px',
                  left: '12px',
                  right: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.625rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>0.0 (Suppressed Noise)</span>
                <span>1.0 (Critical Outages)</span>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Severity Threshold */}
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
              Minimum Alert Severity:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { val: 0.0, label: 'All (Score 0+)', desc: 'Benign, Degraded, Critical' },
                { val: 1.0, label: 'Medium+ (Score 1+)', desc: 'Degraded & Critical (Default)' },
                { val: 2.0, label: 'High only (Score 2)', desc: 'Critical Outages only' },
              ].map((opt) => {
                const isSelected = draftSeverityThreshold === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setDraftSeverityThreshold(opt.val)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-input)',
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: isSelected ? '#60a5fa' : 'inherit' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Burst Threshold (FR-06) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Burst Judgment Threshold (FR-06):
              </label>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {draftBurstThreshold} occ / 10s
              </span>
            </div>
            <input
              type="number"
              className="input-field"
              value={draftBurstThreshold}
              onChange={(e) => setDraftBurstThreshold(parseInt(e.target.value) || 200)}
              style={{ width: '120px' }}
              min={10}
              max={5000}
            />
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Triggers an immediate Jev model re-judgment when an error pattern spikes faster than this rate.
            </div>
          </div>
        </div>

        {/* Retrospective Impact Simulation Card */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Retrospective Impact Simulation
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '4px' }}>
              Simulates how the {preview.total} past recorded incidents would behave under this exact configuration.
            </p>
          </div>

          {/* Impact Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <div
              style={{
                padding: '16px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase' }}>
                <Volume2 size={14} /> Alerts Dispatched
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f87171', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {preview.wouldAlert} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {preview.total}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Delivered to Slack channel
              </div>
            </div>

            <div
              style={{
                padding: '16px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                <VolumeX size={14} /> Noise Suppressed
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {preview.wouldSilence} <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>({preview.noiseReductionPercent}%)</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Recorded silently without alert fatigue
              </div>
            </div>
          </div>

          {/* Ratio Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
              <span style={{ color: '#f87171', fontWeight: 700 }}>
                {preview.wouldAlert} Alerts ({Math.round((preview.wouldAlert / preview.total) * 100)}%)
              </span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>
                {preview.wouldSilence} Suppressed ({preview.noiseReductionPercent}%)
              </span>
            </div>
            <div style={{ display: 'flex', height: '10px', borderRadius: '9999px', overflow: 'hidden', background: 'var(--border-strong)' }}>
              <div
                style={{
                  width: `${(preview.wouldAlert / preview.total) * 100}%`,
                  background: '#ef4444',
                  transition: 'width 0.3s ease',
                }}
              />
              <div
                style={{
                  width: `${(preview.wouldSilence / preview.total) * 100}%`,
                  background: '#10b981',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Per-incident preview list */}
          <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Incident Impact Breakdown
            </div>
            {preview.incidentDecisions.map((inc) => (
              <div
                key={inc.id}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)', fontSize: '0.8125rem' }}>
                      {inc.id}
                    </strong>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{inc.service}</span>
                    <SeverityBadge severity={inc.modelDecision.severityLabel} showIcon={false} />
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '3px' }}>
                    Prob: {inc.modelDecision.probabilityActionable.toFixed(2)} • {inc.reason}
                  </div>
                </div>

                <div>
                  {inc.wouldAlert ? (
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        fontWeight: 700,
                        fontSize: '0.6875rem',
                      }}
                    >
                      ALERTS
                    </span>
                  ) : (
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        background: 'rgba(100, 116, 139, 0.15)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        color: '#94a3b8',
                        fontWeight: 700,
                        fontSize: '0.6875rem',
                      }}
                    >
                      SILENCED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
