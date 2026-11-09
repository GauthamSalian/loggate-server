import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Incident,
  PatternItem,
  HostNode,
  SystemSettings,
  SystemHealthState,
  SandboxEvaluationResult,
  SeverityLabel,
  SeverityScore,
} from '../types';
import {
  INITIAL_INCIDENTS,
  INITIAL_PATTERNS,
  INITIAL_HOSTS,
  INITIAL_SETTINGS,
  INITIAL_HEALTH,
} from '../data/mockData';

interface LogGateContextType {
  incidents: Incident[];
  patterns: PatternItem[];
  hosts: HostNode[];
  settings: SystemSettings;
  health: SystemHealthState;
  selectedIncident: Incident | null;
  setSelectedIncident: (incident: Incident | null) => void;
  liveStreaming: boolean;
  setLiveStreaming: (enabled: boolean) => void;
  
  // Incident Actions
  resolveIncident: (id: string) => void;
  silenceIncident: (id: string) => void;
  reopenIncident: (id: string) => void;
  
  // Settings & Tuning (FR-22, FR-23, FR-24)
  updateNoiseFloor: (val: number) => void;
  updateSeverityThreshold: (val: number) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  previewIncidentsAtThreshold: (threshold: number) => {
    wouldAlertCount: number;
    wouldSilenceCount: number;
    percentageReduced: number;
  };

  // Slack Integration (FR-23, FR-14)
  testSlackMessage: (channelOverride?: string) => Promise<{ success: boolean; message: string; payload?: unknown }>;
  flushRetryQueue: () => void;

  // Sandbox (FR-25)
  evaluateSandbox: (
    rawInput: string,
    service: string,
    environment: 'production' | 'staging' | 'canary',
    host: string
  ) => SandboxEvaluationResult;

  // Resilience & Simulations (FR-26, FR-14, FR-03, FR-16)
  toggleModelDegraded: () => void;
  toggleSlackOutage: () => void;
  simulateOverloadBurst: () => void;
  simulateIncomingBatch: () => void;
}

const LogGateContext = createContext<LogGateContextType | undefined>(undefined);

export const LogGateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem('loggate_incidents');
    return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
  });

  const [patterns] = useState<PatternItem[]>(() => {
    const saved = localStorage.getItem('loggate_patterns');
    return saved ? JSON.parse(saved) : INITIAL_PATTERNS;
  });

  const [hosts] = useState<HostNode[]>(() => {
    const saved = localStorage.getItem('loggate_hosts');
    return saved ? JSON.parse(saved) : INITIAL_HOSTS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('loggate_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [health, setHealth] = useState<SystemHealthState>(() => {
    const saved = localStorage.getItem('loggate_health');
    return saved ? JSON.parse(saved) : INITIAL_HEALTH;
  });

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [liveStreaming, setLiveStreaming] = useState<boolean>(true);

  // Persistence
  useEffect(() => {
    localStorage.setItem('loggate_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('loggate_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('loggate_patterns', JSON.stringify(patterns));
  }, [patterns]);

  useEffect(() => {
    localStorage.setItem('loggate_hosts', JSON.stringify(hosts));
  }, [hosts]);

  useEffect(() => {
    localStorage.setItem('loggate_health', JSON.stringify(health));
  }, [health]);

  // Keep selectedIncident synchronized with incidents list
  useEffect(() => {
    if (selectedIncident) {
      const updated = incidents.find((inc) => inc.id === selectedIncident.id);
      if (updated) {
        setSelectedIncident(updated);
      }
    }
  }, [incidents]);

  // Actions
  const resolveIncident = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: 'RESOLVED' as const } : inc))
    );
  };

  const silenceIncident = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: 'SILENCED' as const } : inc))
    );
  };

  const reopenIncident = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: 'ACTIVE' as const } : inc))
    );
  };

  const updateNoiseFloor = (val: number) => {
    const clamped = Math.max(0, Math.min(1, parseFloat(val.toFixed(2))));
    setSettings((prev) => ({ ...prev, noiseFloor: clamped }));
  };

  const updateSeverityThreshold = (val: number) => {
    setSettings((prev) => ({ ...prev, severityThreshold: val }));
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // FR-22 Live impact preview: calculate how past incidents would have reacted
  const previewIncidentsAtThreshold = useCallback(
    (threshold: number) => {
      let wouldAlert = 0;
      let wouldSilence = 0;
      incidents.forEach((inc) => {
        const prob = inc.modelDecision.probabilityActionable;
        const sev = inc.modelDecision.severityScore;
        if (prob >= threshold && sev >= settings.severityThreshold) {
          wouldAlert++;
        } else {
          wouldSilence++;
        }
      });
      const total = incidents.length || 1;
      const percentageReduced = Math.round((wouldSilence / total) * 100);
      return { wouldAlertCount: wouldAlert, wouldSilenceCount: wouldSilence, percentageReduced };
    },
    [incidents, settings.severityThreshold]
  );

  // FR-23 & FR-14 Slack testing and delivery
  const testSlackMessage = async (channelOverride?: string): Promise<{ success: boolean; message: string; payload?: unknown }> => {
    const targetChannel = channelOverride || settings.slackChannel;
    
    // Check if Slack is simulated as unreachable (FR-14)
    if (health.slackStatus === 'unreachable') {
      setHealth((prev) => ({
        ...prev,
        queuedAlertsCount: prev.queuedAlertsCount + 1,
      }));
      return {
        success: false,
        message: `Slack platform is currently unreachable. Alert has been held in memory retry queue (FR-14: most severe first).`,
      };
    }

    // Simulate 300ms network roundtrip to Slack Webhook API
    await new Promise((resolve) => setTimeout(resolve, 350));

    const testPayload = {
      channel: targetChannel,
      text: `*LogGate Test Alert* | Connectivity Verified`,
      attachments: [
        {
          color: '#10b981',
          fields: [
            { title: 'Incident', value: 'TEST-0001', short: true },
            { title: 'Service', value: 'loggate-health-probe', short: true },
            { title: 'Severity', value: 'Info / Test', short: true },
            { title: 'Actionable Prob', value: '1.00 (Self-test)', short: true },
            { title: 'Owning Team', value: 'Platform Admin', short: true },
            { title: 'Status', value: '200 OK — Delivered in 34ms', short: true },
          ],
        },
      ],
    };

    return {
      success: true,
      message: `Test alert successfully delivered to ${targetChannel}!`,
      payload: testPayload,
    };
  };

  // FR-14 Retrying held alerts
  const flushRetryQueue = () => {
    setHealth((prev) => ({
      ...prev,
      slackStatus: 'connected',
      queuedAlertsCount: 0,
    }));
    // Mark any queued incidents as delivered
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.alertStatus.isQueued
          ? {
              ...inc,
              alertStatus: {
                ...inc.alertStatus,
                isQueued: false,
                delivered: true,
                deliveredAt: new Date().toISOString(),
              },
            }
          : inc
      )
    );
  };

  // Resilience simulation toggles (FR-26)
  const toggleModelDegraded = () => {
    setHealth((prev) => {
      const nextStatus = prev.modelStatus === 'healthy' ? 'degraded' : 'healthy';
      const nextLatency = nextStatus === 'degraded' ? 320 : 64;
      return {
        ...prev,
        modelStatus: nextStatus,
        modelLatencyMs: nextLatency,
      };
    });
  };

  const toggleSlackOutage = () => {
    setHealth((prev) => {
      const isCurrentlyDown = prev.slackStatus === 'unreachable';
      if (isCurrentlyDown) {
        // Recovering
        return {
          ...prev,
          slackStatus: 'connected',
        };
      } else {
        // Going down: queue any unsent actionable alerts
        return {
          ...prev,
          slackStatus: 'unreachable',
          queuedAlertsCount: prev.queuedAlertsCount + 2,
        };
      }
    });
  };

  const simulateOverloadBurst = () => {
    setHealth((prev) => ({
      ...prev,
      overloadStatus: 'dropping',
      droppedRecordsCount: prev.droppedRecordsCount + 1420,
      acceptedRecordsCount: prev.acceptedRecordsCount + 9800,
      totalRawLinesCount: prev.totalRawLinesCount + 120000,
    }));

    // Reset overload badge after 6 seconds
    setTimeout(() => {
      setHealth((prev) => ({ ...prev, overloadStatus: 'normal' }));
    }, 6000);
  };

  // FR-25 Sandbox Evaluation
  const evaluateSandbox = (
    rawInput: string,
    service: string,
    _environment: 'production' | 'staging' | 'canary',
    _host: string
  ): SandboxEvaluationResult => {
    const lines = rawInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const lineCount = lines.length || 1;
    const sampleLine = lines[0] || 'Unknown log line';
    const estimatedBytes = rawInput.length;

    // Pattern extraction (HM-03: replace IDs, timestamps, hex, IPs)
    let extractedPattern = sampleLine
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?/gi, '{TIMESTAMP}')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '{IP}')
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '{UUID}')
      .replace(/tok_[a-zA-Z0-9_]+/g, 'tok_***')
      .replace(/usr_[a-zA-Z0-9_]+/g, 'usr_***')
      .replace(/ch_[a-zA-Z0-9_]+/g, '{TXN_ID}')
      .replace(/shard-[a-z0-9-]+/gi, '{SHARD_ID}')
      .replace(/port \d+/gi, 'port {PORT}')
      .replace(/:\d{2,5}\b/g, ':{PORT}');

    extractedPattern = extractedPattern.replace(/^.*?\[(ERROR|CRITICAL|WARN|FATAL|INFO)\].*?(\s+[-:]\s+|\s+)/i, '').trim();
    if (!extractedPattern) {
      extractedPattern = sampleLine;
    }

    // Model judgment simulation (fast Jev model, <100ms)
    const lower = sampleLine.toLowerCase();
    let prob = 0.5;
    let score: SeverityScore = 1;
    let label: SeverityLabel = 'Medium';
    let team = 'Platform Infra';
    let reason = 'General system error detected';

    if (
      lower.includes('fatal') ||
      lower.includes('deadlock') ||
      lower.includes('connection refused') ||
      lower.includes('slots are reserved') ||
      lower.includes('oom') ||
      lower.includes('out of memory')
    ) {
      prob = 0.98;
      score = 2;
      label = 'High';
      team = lower.includes('connection') || lower.includes('pool') ? 'Database & Infra SRE' : 'Platform Infra';
      reason = 'Critical infrastructure exhaustion with potential customer-facing downtime.';
    } else if (lower.includes('504') || lower.includes('502') || lower.includes('stripe') || lower.includes('timeout')) {
      prob = 0.94;
      score = 2;
      label = 'High';
      team = 'Payments & Billing Core';
      reason = 'Upstream gateway failure actively preventing user checkout.';
    } else if (lower.includes('cluster is down') || lower.includes('rebalance') || lower.includes('commit')) {
      prob = 0.88;
      score = 1;
      label = 'Medium';
      team = lower.includes('cluster') ? 'Cache & Storage Platform' : 'Order Pipeline Core';
      reason = 'Degraded state with graceful degradation or fallback in effect.';
    } else if (
      lower.includes('jwt malformed') ||
      lower.includes('401') ||
      lower.includes('404') ||
      lower.includes('not found') ||
      lower.includes('deprecated')
    ) {
      prob = 0.12;
      score = 0;
      label = 'Noise';
      team = lower.includes('jwt') ? 'Security Operations' : 'Frontend Engineering';
      reason = 'Routine client-side probe or non-critical 4xx error. Suppressed to prevent alert fatigue.';
    }

    const wouldAlert = prob >= settings.noiseFloor && score >= settings.severityThreshold;

    const slackPayload = {
      incidentNumber: 'SANDBOX-SIM',
      service,
      errorRate: `${lineCount * 12} errors/sec (Simulated)`,
      severity: `${label} (Score ${score})`,
      probabilityActionable: `${prob.toFixed(2)} (Noise Floor: ${settings.noiseFloor.toFixed(2)})`,
      owningTeam: team,
      errorPattern: extractedPattern,
      incidentDetailUrl: 'https://loggate.corp.internal/incidents/SANDBOX-SIM',
    };

    return {
      pattern: extractedPattern,
      sampleLines: lines.slice(0, 3),
      rawLinesCount: lineCount * 450,
      estimatedBytes,
      modelDecision: {
        probabilityActionable: prob,
        severityScore: score,
        severityLabel: label,
        owningTeam: team,
        decisionLatencyMs: Math.floor(Math.random() * 45) + 35,
        confidence: 0.96,
        reasoning: reason,
      },
      noiseFloor: settings.noiseFloor,
      severityThreshold: settings.severityThreshold,
      wouldAlert,
      verdictReason: wouldAlert
        ? `ALERT DISPATCHED: Probability ${prob.toFixed(2)} >= noise floor (${settings.noiseFloor.toFixed(2)}) and Severity is ${label}.`
        : `SILENCED: ${
            prob < settings.noiseFloor
              ? `Probability ${prob.toFixed(2)} is below noise floor (${settings.noiseFloor.toFixed(2)}).`
              : `Severity is below minimum alert threshold.`
          }`,
      slackPayload,
      parsedTokens: [
        { token: '{TXN_ID}', type: 'Transaction Identifier' },
        { token: '{UUID}', type: 'Session ID' },
        { token: '{IP}', type: 'Host/Client IP' },
      ],
    };
  };

  // FR-19 Live stream background simulation (without page refresh)
  const simulateIncomingBatch = useCallback(() => {
    const addedRaw = Math.floor(Math.random() * 800) + 200;
    const addedBytes = addedRaw * 140;

    setHealth((prev) => ({
      ...prev,
      totalRawLinesCount: prev.totalRawLinesCount + addedRaw,
      totalBytesReduced: prev.totalBytesReduced + addedBytes,
      acceptedRecordsCount: prev.acceptedRecordsCount + 1,
    }));

    setIncidents((prev) => {
      const activeIdx = prev.findIndex((i) => i.status === 'ACTIVE');
      if (activeIdx === -1) return prev;
      const copy = [...prev];
      const target = copy[activeIdx];
      copy[activeIdx] = {
        ...target,
        rawLinesCount: target.rawLinesCount + addedRaw,
        bytesRepresented: target.bytesRepresented + addedBytes,
        errorRatePerSec: Math.floor(Math.random() * 120) + 180,
        lastSeen: new Date().toISOString(),
      };
      return copy;
    });
  }, []);

  useEffect(() => {
    if (!liveStreaming) return;
    const interval = setInterval(() => {
      simulateIncomingBatch();
    }, 4000);
    return () => clearInterval(interval);
  }, [liveStreaming, simulateIncomingBatch]);

  return (
    <LogGateContext.Provider
      value={{
        incidents,
        patterns,
        hosts,
        settings,
        health,
        selectedIncident,
        setSelectedIncident,
        liveStreaming,
        setLiveStreaming,
        resolveIncident,
        silenceIncident,
        reopenIncident,
        updateNoiseFloor,
        updateSeverityThreshold,
        updateSettings,
        previewIncidentsAtThreshold,
        testSlackMessage,
        flushRetryQueue,
        evaluateSandbox,
        toggleModelDegraded,
        toggleSlackOutage,
        simulateOverloadBurst,
        simulateIncomingBatch,
      }}
    >
      {children}
    </LogGateContext.Provider>
  );
};

export const useLogGate = () => {
  const context = useContext(LogGateContext);
  if (!context) {
    throw new Error('useLogGate must be used within a LogGateProvider');
  }
  return context;
};
