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
  Project,
  ConnectedMachine,
  ProjectMetric,
} from '../types';
import {
  INITIAL_INCIDENTS,
  INITIAL_PATTERNS,
  INITIAL_HOSTS,
  INITIAL_SETTINGS,
  INITIAL_HEALTH,
} from '../data/mockData';
import { api, MOCK_PROJECTS, MOCK_MACHINES, MOCK_METRICS } from '../services/api';

interface LogGateContextType {
  // Projects (Supabase-Style Multi-Project Architecture)
  projects: Project[];
  currentProject: Project;
  setCurrentProject: (proj: Project) => void;
  createNewProject: (name: string) => Promise<Project>;
  deleteCurrentProject: () => Promise<void>;
  connectedMachines: ConnectedMachine[];
  projectMetrics: ProjectMetric[];

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
  testProjectSlack: () => Promise<{ success: boolean; message: string }>;
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
  // Multi-Project State
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('loggate_projects');
    return saved ? JSON.parse(saved) : MOCK_PROJECTS;
  });

  const [currentProject, setCurrentProjectState] = useState<Project>(() => {
    const savedId = localStorage.getItem('loggate_active_project_id');
    const found = projects.find((p) => (p.project_id || p.id) === savedId);
    return found || projects[0] || MOCK_PROJECTS[0];
  });

  const [connectedMachines, setConnectedMachines] = useState<ConnectedMachine[]>(MOCK_MACHINES);
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetric[]>(MOCK_METRICS);

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

  // Sync projects from backend API on mount
  useEffect(() => {
    api.projects.getMyProjects().then((projs) => {
      if (projs && projs.length > 0) {
        setProjects(projs);
        localStorage.setItem('loggate_projects', JSON.stringify(projs));
      }
    });
  }, []);

  // Fetch machines and metrics when active project changes
  useEffect(() => {
    const pId = currentProject.project_id || currentProject.id || 'proj_live_99a8b7';
    api.projects.getMachines(pId).then((m) => {
      if (m && m.length > 0) setConnectedMachines(m);
    });
    api.projects.getMetrics(pId).then((met) => {
      if (met && met.length > 0) setProjectMetrics(met);
    });
  }, [currentProject]);

  const setCurrentProject = (proj: Project) => {
    setCurrentProjectState(proj);
    localStorage.setItem('loggate_active_project_id', proj.project_id || proj.id || '');
  };

  const createNewProject = async (name: string): Promise<Project> => {
    const created = await api.projects.createProject(name);
    setProjects((prev) => {
      const updated = [created, ...prev];
      localStorage.setItem('loggate_projects', JSON.stringify(updated));
      return updated;
    });
    setCurrentProject(created);
    return created;
  };

  const deleteCurrentProject = async () => {
    const pId = currentProject.project_id || currentProject.id || '';
    await api.projects.deleteProject(pId);
    setProjects((prev) => {
      const filtered = prev.filter((p) => (p.project_id || p.id) !== pId);
      const nextProj = filtered[0] || MOCK_PROJECTS[0];
      setCurrentProject(nextProj);
      localStorage.setItem('loggate_projects', JSON.stringify(filtered));
      return filtered;
    });
  };

  // Persistence
  useEffect(() => {
    localStorage.setItem('loggate_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('loggate_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('loggate_health', JSON.stringify(health));
  }, [health]);

  // Incident Actions
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

  // Settings & Sensitivity Tuning
  const updateNoiseFloor = (val: number) => {
    setSettings((prev) => ({ ...prev, noiseFloor: Math.round(val * 100) / 100 }));
  };

  const updateSeverityThreshold = (val: number) => {
    setSettings((prev) => ({ ...prev, severityThreshold: Math.round(val * 10) / 10 }));
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const previewIncidentsAtThreshold = (threshold: number) => {
    const wouldAlertCount = incidents.filter(
      (inc) => inc.modelDecision.probabilityActionable >= threshold
    ).length;
    const wouldSilenceCount = incidents.length - wouldAlertCount;
    const percentageReduced = Math.round((wouldSilenceCount / (incidents.length || 1)) * 100);

    return {
      wouldAlertCount,
      wouldSilenceCount,
      percentageReduced,
    };
  };

  // Slack Operations
  const testSlackMessage = async (channelOverride?: string) => {
    const targetChannel = channelOverride || settings.slackChannel;
    if (health.slackStatus !== 'connected') {
      setHealth((prev) => ({ ...prev, queuedAlertsCount: prev.queuedAlertsCount + 1 }));
      return {
        success: false,
        message: 'Slack API is currently unreachable. Alert safely queued in memory.',
      };
    }

    const testPayload = {
      text: `[LogGate] Test Alert dispatched from ${currentProject.name}`,
      channel: targetChannel,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*LogGate Integration Ping*\nStatus: Connected\nTarget Channel: \`${targetChannel}\``,
          },
        },
      ],
    };

    return {
      success: true,
      message: `Alert delivered to ${targetChannel} (HTTP 200 OK)`,
      payload: testPayload,
    };
  };

  const testProjectSlack = async () => {
    const pId = currentProject.project_id || currentProject.id || '';
    const res = await api.projects.testSlack(pId);
    if (res.status === 'success') {
      return { success: true, message: res.message || 'Slack test alert sent successfully' };
    }
    return { success: false, message: res.message || 'Failed to send Slack test alert' };
  };

  const flushRetryQueue = () => {
    setHealth((prev) => ({
      ...prev,
      queuedAlertsCount: 0,
      slackStatus: 'connected',
    }));
  };

  // Chaos & Resilience simulations
  const toggleModelDegraded = () => {
    setHealth((prev) => {
      const isDegraded = prev.modelStatus === 'degraded';
      return {
        ...prev,
        modelStatus: isDegraded ? 'healthy' : 'degraded',
        modelLatencyMs: isDegraded ? 64 : 320,
      };
    });
  };

  const toggleSlackOutage = () => {
    setHealth((prev) => {
      const isOutage = prev.slackStatus === 'unreachable';
      return {
        ...prev,
        slackStatus: isOutage ? 'connected' : 'unreachable',
      };
    });
  };

  const simulateOverloadBurst = () => {
    setHealth((prev) => ({
      ...prev,
      overloadStatus: 'dropping',
      droppedRecordsCount: prev.droppedRecordsCount + 1420,
    }));
    setTimeout(() => {
      setHealth((prev) => ({ ...prev, overloadStatus: 'normal' }));
    }, 6000);
  };

  // Sandbox Real-Time Evaluation
  const evaluateSandbox = (
    rawInput: string,
    service: string,
    _environment: 'production' | 'staging' | 'canary',
    _host: string
  ): SandboxEvaluationResult => {
    const isCritical =
      rawInput.toLowerCase().includes('pool') ||
      rawInput.toLowerCase().includes('oom') ||
      rawInput.toLowerCase().includes('deadlock') ||
      rawInput.toLowerCase().includes('exhausted') ||
      rawInput.toLowerCase().includes('fatal');

    const isWarning =
      rawInput.toLowerCase().includes('504') ||
      rawInput.toLowerCase().includes('timeout') ||
      rawInput.toLowerCase().includes('slow query');

    let prob = 0.94;
    let score: SeverityScore = 2;
    let label: SeverityLabel = 'High';
    let reason = 'DB/Redis connection exhaustion or fatal process crash.';

    if (isCritical) {
      prob = 0.96;
      score = 2;
      label = 'High';
      reason = 'Severe infrastructure failure impacting transaction completion.';
    } else if (isWarning) {
      prob = 0.88;
      score = 1;
      label = 'Medium';
      reason = 'Upstream gateway latency or timeout exceeding SLA.';
    } else {
      prob = 0.22;
      score = 0;
      label = 'Noise';
      reason = 'Client-side 4xx probe or routine debug log. Safe to silence.';
    }

    const wouldAlert = prob >= settings.noiseFloor && score >= settings.severityThreshold;

    const slackPayload = {
      incidentNumber: `SIM-${Math.floor(Math.random() * 9000 + 1000)}`,
      service,
      errorRate: '185/sec',
      severity: label,
      probabilityActionable: `${(prob * 100).toFixed(1)}%`,
      owningTeam: service === 'payment-gateway' ? 'Payments Core' : 'Platform Reliability',
      errorPattern: rawInput.split('\n')[0].slice(0, 120),
      incidentDetailUrl: `https://loggate.corp.internal/incidents/SIM`,
    };

    return {
      pattern: rawInput.split('\n')[0].slice(0, 140),
      sampleLines: rawInput.split('\n').filter((l) => l.trim()).slice(0, 3),
      rawLinesCount: 24,
      estimatedBytes: 3840,
      modelDecision: {
        probabilityActionable: prob,
        severityScore: score,
        severityLabel: label,
        owningTeam: service === 'payment-gateway' ? 'Payments Core' : 'Core Infra',
        decisionLatencyMs: Math.floor(Math.random() * 30) + 25,
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

  // Background stream simulation
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
        projects,
        currentProject,
        setCurrentProject,
        createNewProject,
        deleteCurrentProject,
        connectedMachines,
        projectMetrics,
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
        testProjectSlack,
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
