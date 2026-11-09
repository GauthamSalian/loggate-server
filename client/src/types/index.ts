export type SeverityLabel = 'High' | 'Medium' | 'Noise';
export type SeverityScore = 0 | 1 | 2; // 0: Benign, 1: Degraded, 2: Critical
export type IncidentStatus = 'ACTIVE' | 'RESOLVED' | 'SILENCED';

export interface ModelDecision {
  probabilityActionable: number; // 0.00 to 1.00
  severityScore: SeverityScore;
  severityLabel: SeverityLabel;
  owningTeam: string;
  decisionLatencyMs: number;
  confidence: number;
  reasoning: string;
}

export interface SlackPayload {
  incidentNumber: string;
  service: string;
  errorRate: string;
  severity: string;
  probabilityActionable: string;
  owningTeam: string;
  errorPattern: string;
  incidentDetailUrl: string;
}

export interface AlertDeliveryStatus {
  delivered: boolean;
  deliveredAt?: string;
  slackChannel: string;
  retryCount: number;
  isQueued: boolean;
  payload: SlackPayload;
  errorMessage?: string;
}

export interface Incident {
  id: string;
  incidentNumber: number;
  patternId: string;
  pattern: string;
  sampleLines: string[];
  service: string;
  environment: 'production' | 'staging' | 'canary';
  hosts: string[];
  firstSeen: string;
  lastSeen: string;
  rawLinesCount: number;
  bytesRepresented: number;
  errorRatePerSec: number;
  status: IncidentStatus;
  isDegraded: boolean; // FR-16/19: triage model was slow/unreachable
  modelDecision: ModelDecision;
  alertStatus: AlertDeliveryStatus;
}

export interface PatternItem {
  id: string;
  pattern: string;
  service: string;
  owningTeam: string;
  lifetimeOccurrences: number;
  lifetimeRawLines: number;
  lifetimeBytes: number;
  firstSeen: string;
  lastSeen: string;
  lastDecision: {
    probabilityActionable: number;
    severityLabel: SeverityLabel;
    owningTeam: string;
    alertSent: boolean;
    timestamp: string;
  };
}

export interface HostNode {
  id: string;
  hostname: string;
  ip: string;
  service: string;
  environment: string;
  status: 'healthy' | 'warning' | 'offline';
  moduleVersion: string;
  lastHeartbeat: string;
  rawLinesRead: number;
  recordsForwarded: number;
  reductionPercentage: number;
  cpuPercent: number;
  memoryMb: number;
}

export interface SystemSettings {
  noiseFloor: number; // Default 0.85
  severityThreshold: number; // Default 1.0 (Medium and above)
  burstThreshold: number; // Default 200 occurrences in 10s
  slackChannel: string; // Default #alerts-production
  slackWebhookUrl: string;
  slackEnabled: boolean;
  pricePerGb: number; // Default 0.15 USD/GB
  currency: string;
  accessKey: string;
  autoRemindIntervalMin: number; // Default 30 min (FR-15)
  retentionDays: number; // Default 90 days (NFR-07)
}

export interface SystemHealthState {
  modelStatus: 'healthy' | 'degraded' | 'offline';
  modelLatencyMs: number;
  slackStatus: 'connected' | 'unreachable' | 'offline';
  queuedAlertsCount: number;
  overloadStatus: 'normal' | 'dropping';
  acceptedRecordsCount: number;
  droppedRecordsCount: number;
  totalRawLinesCount: number;
  totalBytesReduced: number;
}

export interface SandboxPreset {
  id: string;
  name: string;
  service: string;
  environment: 'production' | 'staging' | 'canary';
  host: string;
  description: string;
  rawLines: string;
}

export interface SandboxEvaluationResult {
  pattern: string;
  sampleLines: string[];
  rawLinesCount: number;
  estimatedBytes: number;
  modelDecision: ModelDecision;
  noiseFloor: number;
  severityThreshold: number;
  wouldAlert: boolean;
  verdictReason: string;
  slackPayload: SlackPayload;
  parsedTokens: { token: string; type: string }[];
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'Platform Admin' | 'On-Call SRE' | 'Service Owner';
  organization: string;
  avatarUrl?: string;
}
