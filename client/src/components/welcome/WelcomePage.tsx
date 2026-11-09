import React from 'react';
import {
  Shield,
  Server,
  CheckCircle2,
  Activity,
} from 'lucide-react';

interface WelcomePageProps {
  onGetStarted: () => void;
  onExploreDemo: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onGetStarted, onExploreDemo }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 10%, rgba(59, 130, 246, 0.15) 0%, transparent 60%), var(--bg-main)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Welcome Nav (Fixed Sticky) */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: '70px',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(15, 21, 35, 0.85)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 16px rgba(59, 130, 246, 0.5)',
              flexShrink: 0,
            }}
          >
            <Shield size={22} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              LogGate
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onExploreDemo} className="btn btn-outline">
            <span>Live Demo</span>
          </button>
          <button onClick={onGetStarted} className="btn btn-primary">
            <span>Sign In to Console</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '72px 24px 48px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            maxWidth: '960px',
            margin: '0 0 20px 0',
            color: 'var(--text-primary)',
          }}
        >
          Stop Log Ingestion Bills &amp; Alert Fatigue{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Before It Hits Your Slack
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '780px',
            lineHeight: 1.6,
            margin: '0 0 36px 0',
          }}
        >
          Production outages flood tens of thousands of duplicate log lines. LogGate runs lightweight on-host
          deduplication and sub-100ms intelligent triage to route exactly <strong>one actionable alert</strong> per
          real incident.
        </p>

        {/* CTA Buttons - clean without arrow */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={onGetStarted}
            className="btn btn-primary"
            style={{ padding: '14px 28px', fontSize: '1rem', fontWeight: 600, borderRadius: '10px' }}
          >
            <span>Launch Dashboard Console</span>
          </button>
          <button
            onClick={onExploreDemo}
            className="btn btn-secondary"
            style={{ padding: '14px 24px', fontSize: '1rem', fontWeight: 600, borderRadius: '10px' }}
          >
            <span>Instant Demo Access</span>
          </button>
        </div>

        {/* Quick Highlights Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            width: '100%',
            marginTop: '64px',
          }}
        >
          <div className="card" style={{ padding: '20px', textAlign: 'left' }}>
            <div style={{ color: '#10b981', fontSize: '1.75rem', fontWeight: 800 }}>98%+</div>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>Raw Log Reduction</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Duplicate loops reduced on-host before network transmission (HM-03).
            </div>
          </div>

          <div className="card" style={{ padding: '20px', textAlign: 'left' }}>
            <div style={{ color: '#3b82f6', fontSize: '1.75rem', fontWeight: 800 }}>&lt;100 ms</div>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>Jev Triage Decision</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Target &lt;100ms for 95% of decisions per incident (NFR-01).
            </div>
          </div>

          <div className="card" style={{ padding: '20px', textAlign: 'left' }}>
            <div style={{ color: '#ecb22e', fontSize: '1.75rem', fontWeight: 800 }}>1 Alert</div>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>Per Real Problem</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Multi-host deduplication delivers 1 clean notification to Slack (FR-13).
            </div>
          </div>

          <div className="card" style={{ padding: '20px', textAlign: 'left' }}>
            <div style={{ color: '#a855f7', fontSize: '1.75rem', fontWeight: 800 }}>$0 Pager Loss</div>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>Offline Resilience</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Holds alerts in memory during messaging outages (FR-14).
            </div>
          </div>
        </div>
      </div>

      {/* System Architecture Section */}
      <div style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', padding: '64px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              How LogGate Solves Ingestion Bills &amp; Noise
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9375rem' }}>
              A two-part architecture designed to keep raw log spam from ever entering your paid platforms.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Part 1 */}
            <div className="card" style={{ padding: '28px', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Server size={22} color="#3b82f6" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Part 1: Plug-and-Play Host Module</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Installs on each server with zero application code changes (HM-01). Turns repetitive error bursts into
                canonical templates, keeps counts and byte counts, masks sensitive emails &amp; tokens on-host (HM-06),
                and operates under 5% CPU footprint (NFR-11).
              </p>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="#10b981" />
                  <span>Deduplicates repeated errors into single pattern records</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="#10b981" />
                  <span>Masks tokens, passwords, and PII before transmission</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="#10b981" />
                  <span>Authenticates with organization access key (HM-02)</span>
                </div>
              </div>
            </div>

            {/* Part 2 */}
            <div className="card" style={{ padding: '28px', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Activity size={22} color="#8b5cf6" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Part 2: Self-Hosted Server &amp; Jev Triage</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Aggregates batches across your entire host fleet into unified incidents (FR-04). The fast Jev model
                judges each distinct incident in ~64ms, scores actionable probability &amp; severity, assigns the owning
                team, and sends exactly one Slack alert if above the tunable noise floor (FR-09).
              </p>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="#10b981" />
                  <span>Interactive Noise-Floor sensitivity tuning (FR-22)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="#10b981" />
                  <span>Live estimated ingestion cost avoided calculator (FR-24)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="#10b981" />
                  <span>Interactive Sandbox for safe log testing (FR-25)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Launch Banner */}
          <div
            style={{
              marginTop: '48px',
              padding: '32px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>
                Ready to explore the LogGate Dashboard?
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.875rem' }}>
                View live incidents, test the noise-floor slider, and simulate failure scenarios.
              </p>
            </div>

            <button
              onClick={onGetStarted}
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.9375rem', fontWeight: 600 }}
            >
              <span>Enter Workspace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          padding: '24px 40px',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        LogGate — Self-Hosted Log Triage &amp; Alert Routing System • Production Architecture v0.1
      </footer>
    </div>
  );
};
