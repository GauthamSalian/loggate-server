import React, { useState } from 'react';
import type { UserPreferences } from '../types/log';
import {
  Settings,
  Sliders,
  RotateCcw,
  Check,
  Server,
  AlertCircle,
} from 'lucide-react';

interface SettingsPageProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  onResetPreferences: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  preferences,
  onUpdatePreferences,
  onResetPreferences,
}) => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdate = (updated: Partial<UserPreferences>) => {
    onUpdatePreferences(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      {/* Notice Card */}
      <div
        style={{
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '10px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '13px',
          color: 'var(--text)',
        }}
      >
        <Settings size={18} color="var(--accent)" />
        <div>
          <strong>Local Preferences:</strong> Dashboard settings are stored in your browser's local
          storage. No mock backend mutation or false persistence is used.
        </div>
      </div>

      {/* Interface Settings Card */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
          <Sliders size={18} color="var(--accent)" />
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-bright)' }}>
              Display & Ingestion Preferences
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Customize log row density, streaming speed, and buffer limits
            </span>
          </div>
        </div>

        {/* Setting: Log Row Density */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-bright)' }}>
              Log Table Density
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Control row padding and vertical spacing in the live logs stream
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['comfortable', 'compact'] as const).map((density) => (
              <button
                type="button"
                key={density}
                onClick={() => handleUpdate({ density })}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: preferences.density === density ? 600 : 500,
                  borderRadius: '6px',
                  border: '1px solid',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  backgroundColor: preferences.density === density ? 'var(--accent-bg)' : 'transparent',
                  borderColor: preferences.density === density ? 'var(--accent-border)' : 'var(--border)',
                  color: preferences.density === density ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {density}
              </button>
            ))}
          </div>
        </div>

        {/* Setting: Streaming Interval */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-bright)' }}>
              Simulated Ingestion Cadence
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Frequency at which mock log generator emits new incoming events
            </div>
          </div>
          <select
            value={preferences.refreshRate}
            onChange={(e) => handleUpdate({ refreshRate: Number(e.target.value) })}
            style={{
              height: '34px',
              padding: '0 10px',
              fontSize: '13px',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-bright)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value={1}>Every 1 second (High velocity)</option>
            <option value={2}>Every 2 seconds (Standard)</option>
            <option value={5}>Every 5 seconds (Relaxed)</option>
            <option value={10}>Every 10 seconds (Slow)</option>
          </select>
        </div>

        {/* Setting: Max Buffer Size */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-bright)' }}>
              Max In-Memory Logs Buffer
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Oldest logs are discarded when this threshold is reached
            </div>
          </div>
          <select
            value={preferences.maxLogsInMemory}
            onChange={(e) => handleUpdate({ maxLogsInMemory: Number(e.target.value) })}
            style={{
              height: '34px',
              padding: '0 10px',
              fontSize: '13px',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-bright)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value={100}>100 logs</option>
            <option value={250}>250 logs</option>
            <option value={500}>500 logs (Recommended)</option>
            <option value={1000}>1,000 logs</option>
          </select>
        </div>

        {/* Setting: Auto-expand error stack traces */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-bright)' }}>
              Auto-Expand Critical Errors
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Automatically open details for incoming logs with severity ERROR
            </div>
          </div>
          <input
            type="checkbox"
            checked={preferences.autoExpandErrors}
            onChange={(e) => handleUpdate({ autoExpandErrors: e.target.checked })}
            style={{
              width: '18px',
              height: '18px',
              accentColor: 'var(--accent)',
              cursor: 'pointer',
            }}
          />
        </div>
      </div>

      {/* Backend API Target Card */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
          <Server size={18} color="var(--accent)" />
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-bright)' }}>
              Future Backend Integration Target
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Prepared for connecting to the Python backend when ready
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
            LogGate Server Base URL:
          </label>
          <input
            type="text"
            value={preferences.backendUrl}
            onChange={(e) => handleUpdate({ backendUrl: e.target.value })}
            placeholder="http://localhost:8000"
            style={{
              height: '36px',
              padding: '0 12px',
              fontSize: '13px',
              fontFamily: 'var(--mono)',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-bright)',
              outline: 'none',
              maxWidth: '380px',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <AlertCircle size={13} color="#f59e0b" />
            <span>Currently in Mock Mode. When backend is running, the app can query endpoints via this URL.</span>
          </div>
        </div>
      </div>

      {/* Save feedback & Reset Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={onResetPreferences}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            fontSize: '13px',
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={14} />
          Reset to Defaults
        </button>

        {savedSuccess && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#34d399',
              fontWeight: 600,
            }}
          >
            <Check size={16} /> Preferences updated!
          </span>
        )}
      </div>
    </div>
  );
};
