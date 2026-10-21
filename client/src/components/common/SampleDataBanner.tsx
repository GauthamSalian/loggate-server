import React from 'react';
import { Info, Terminal } from 'lucide-react';

interface SampleDataBannerProps {
  onGoToSettings?: () => void;
}

export const SampleDataBanner: React.FC<SampleDataBannerProps> = ({ onGoToSettings }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '13px',
        color: 'var(--text)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Info size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
        <span>
          <strong style={{ color: 'var(--text-bright)' }}>Development Simulation:</strong> Streaming
          synthetic logs until the Python server ingestion API is connected.
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span
          style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'var(--chip-bg)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--mono)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <Terminal size={11} />
          mock-stream: active
        </span>
        {onGoToSettings && (
          <button
            type="button"
            onClick={onGoToSettings}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '0 4px',
            }}
          >
            Configure
          </button>
        )}
      </div>
    </div>
  );
};
