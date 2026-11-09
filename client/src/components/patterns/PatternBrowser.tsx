import React, { useState, useMemo } from 'react';
import { useLogGate } from '../../context/LogGateContext';
import type { PatternItem } from '../../types';
import { SeverityBadge } from '../common/Badge';
import { CodeBlock } from '../common/CodeBlock';
import {
  Database,
  Search,
  Eye,
} from 'lucide-react';

export const PatternBrowser: React.FC = () => {
  const { patterns } = useLogGate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPattern, setSelectedPattern] = useState<PatternItem | null>(null);

  const filteredPatterns = useMemo(() => {
    if (!searchQuery.trim()) return patterns;
    const q = searchQuery.toLowerCase();
    return patterns.filter(
      (p) =>
        p.pattern.toLowerCase().includes(q) ||
        p.service.toLowerCase().includes(q) ||
        p.owningTeam.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [patterns, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
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
              <Database size={20} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Known Error Patterns (FR-21, US-10)
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.875rem' }}>
            Persistent pattern registry across all hosts (FR-18). Track lifetime occurrences, deduplication savings,
            and triage judgments.
          </p>
        </div>

        <div style={{ position: 'relative', width: '320px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '38px' }}
            placeholder="Search pattern text, service, team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Canonical Error Pattern</th>
                <th>Service &amp; Owner</th>
                <th>Lifetime Occurrences</th>
                <th>Lifetime Savings</th>
                <th>First &amp; Last Seen</th>
                <th>Last Decision</th>
                <th style={{ textAlign: 'right' }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatterns.length > 0 ? (
                filteredPatterns.map((pat) => (
                  <tr
                    key={pat.id}
                    onClick={() => setSelectedPattern(pat)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Pattern ID */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: 'var(--brand-primary)',
                        }}
                      >
                        {pat.id}
                      </span>
                    </td>

                    {/* Pattern text */}
                    <td style={{ maxWidth: '440px' }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8125rem',
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={pat.pattern}
                      >
                        {pat.pattern}
                      </div>
                    </td>

                    {/* Service & Owner */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600 }}>{pat.service}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pat.owningTeam}</div>
                    </td>

                    {/* Occurrences */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                        {pat.lifetimeOccurrences.toLocaleString()}
                      </strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {pat.lifetimeRawLines.toLocaleString()} raw lines
                      </div>
                    </td>

                    {/* Lifetime Volume Reduced */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.8125rem' }}>
                        {(pat.lifetimeBytes / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </td>

                    {/* First / Last Seen */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <div>First: {new Date(pat.firstSeen).toLocaleDateString()}</div>
                      <div>Last: {new Date(pat.lastSeen).toLocaleDateString()}</div>
                    </td>

                    {/* Last Decision */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <SeverityBadge severity={pat.lastDecision.severityLabel} showIcon={false} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {(pat.lastDecision.probabilityActionable * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: pat.lastDecision.alertSent ? '#f87171' : '#10b981', marginTop: '2px' }}>
                        {pat.lastDecision.alertSent ? '• Alerted Slack' : '• Silenced'}
                      </div>
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPattern(pat);
                        }}
                        className="btn btn-sm btn-outline"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No error patterns found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pattern Detail Modal */}
      {selectedPattern && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedPattern(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '680px',
              width: '100%',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-strong)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-primary)', fontSize: '1.125rem' }}>
                  {selectedPattern.id}
                </span>
                <span className="badge badge-med">{selectedPattern.service}</span>
              </div>
              <button onClick={() => setSelectedPattern(null)} className="btn btn-sm btn-outline">
                Close
              </button>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Pattern Template (Variable Tokens Masked)
              </div>
              <CodeBlock code={selectedPattern.pattern} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div className="card" style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>LIFETIME OCCURRENCES</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  {selectedPattern.lifetimeOccurrences.toLocaleString()}
                </div>
              </div>

              <div className="card" style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>DATA VOLUME SAVED</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                  {(selectedPattern.lifetimeBytes / (1024 * 1024)).toFixed(1)} MB
                </div>
              </div>

              <div className="card" style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>OWNING TEAM</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#60a5fa', marginTop: '4px' }}>
                  {selectedPattern.owningTeam}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <strong>Last Triage Decision:</strong> Evaluated on{' '}
              {new Date(selectedPattern.lastDecision.timestamp).toLocaleString()} with{' '}
              {(selectedPattern.lastDecision.probabilityActionable * 100).toFixed(0)}% actionable probability (
              {selectedPattern.lastDecision.alertSent ? 'Alert Dispatched to Slack' : 'Silenced as Noise'}).
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
