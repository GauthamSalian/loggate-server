import React from 'react';
import type { LogEntry } from '../types/log';
import { LogTable } from '../components/logs/LogTable';
import { SampleDataBanner } from '../components/common/SampleDataBanner';
import {
  Play,
  Pause,
  Trash2,
  PlusCircle,
  Download,
} from 'lucide-react';

interface LiveLogsPageProps {
  logs: LogEntry[];
  availableServices: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onClearLogs: () => void;
  onInjectMockLog: () => void;
  density?: 'compact' | 'comfortable';
  autoExpandErrors?: boolean;
}

export const LiveLogsPage: React.FC<LiveLogsPageProps> = ({
  logs,
  availableServices,
  searchQuery,
  onSearchChange,
  isStreaming,
  onToggleStreaming,
  onClearLogs,
  onInjectMockLog,
  density = 'comfortable',
  autoExpandErrors = false,
}) => {
  // Export logs to JSON
  const exportLogsAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `loggate-export-${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sample Banner */}
      <SampleDataBanner />

      {/* Control Bar: Stream state, buffer actions */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={onToggleStreaming}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '6px',
              border: isStreaming ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border)',
              backgroundColor: isStreaming ? 'rgba(16, 185, 129, 0.15)' : 'var(--surface-hover)',
              color: isStreaming ? '#34d399' : 'var(--text)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isStreaming ? (
              <>
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#34d399',
                    boxShadow: '0 0 8px #34d399',
                  }}
                />
                <Pause size={13} />
                Pause Stream
              </>
            ) : (
              <>
                <Play size={13} />
                Resume Stream
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onInjectMockLog}
            title="Inject a random new log event into the buffer"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface-hover)',
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <PlusCircle size={13} color="#818cf8" />
            Emit Test Log
          </button>

          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Buffer: <strong>{logs.length}</strong> events loaded
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={exportLogsAsJson}
            title="Export current buffer to JSON"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface-hover)',
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Download size={13} />
            Export JSON
          </button>

          <button
            type="button"
            onClick={onClearLogs}
            title="Clear the current log buffer"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '6px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              color: '#f87171',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Trash2 size={13} />
            Clear Buffer
          </button>
        </div>
      </div>

      {/* Main Table with Filtering & Expanding */}
      <LogTable
        logs={logs}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        availableServices={availableServices}
        density={density}
        autoExpandErrors={autoExpandErrors}
      />
    </div>
  );
};
