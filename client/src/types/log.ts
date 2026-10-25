export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

export interface LogEntry {
  id: string;
  timestamp: string; // ISO string
  level: LogLevel;
  service: string;
  message: string;
  traceId: string;
  spanId?: string;
  agentId: string;
  host: string;
  environment: 'production' | 'staging' | 'development';
  metadata?: Record<string, unknown>;
  stackTrace?: string;
}

export type AgentStatus = 'active' | 'degraded' | 'inactive';

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  host: string;
  ip: string;
  version: string;
  lastHeartbeat: string;
  logsShipped: number;
  uptime: string;
  environment: 'production' | 'staging' | 'development';
  os: string;
}

export interface MetricOverview {
  totalLogs: number;
  errorRate: number; // percentage, e.g. 3.4
  activeAgents: number;
  logsPerSec: number;
  volumeTimeline: Array<{
    time: string;
    total: number;
    errors: number;
    warnings: number;
  }>;
  levelCounts: Record<LogLevel, number>;
  serviceCounts: Record<string, number>;
}

export type NavigationTab = 'overview' | 'logs' | 'agents' | 'metrics' | 'settings';

export type TimeRange = '15m' | '1h' | '24h' | '7d';

export interface UserPreferences {
  refreshRate: number; // in seconds
  maxLogsInMemory: number;
  density: 'compact' | 'comfortable';
  autoExpandErrors: boolean;
  theme: 'dark' | 'light';
  backendUrl: string;
}
