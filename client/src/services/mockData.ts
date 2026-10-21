import type { Agent, LogEntry, LogLevel, MetricOverview } from '../types/log';

export const MOCK_SERVICES = [
  'api-gateway',
  'auth-service',
  'payment-processor',
  'order-service',
  'notification-worker',
  'user-db-cluster',
];

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'agent-us-east-01',
    name: 'loggate-agent-prod-useast1a',
    status: 'active',
    host: 'node-k8s-worker-42.us-east-1',
    ip: '10.0.12.84',
    version: 'v0.4.2',
    lastHeartbeat: new Date(Date.now() - 4000).toISOString(),
    logsShipped: 142830,
    uptime: '18d 6h 22m',
    environment: 'production',
    os: 'Linux 6.1.0-amd64 (Ubuntu 24.04)',
  },
  {
    id: 'agent-us-west-02',
    name: 'loggate-agent-prod-uswest2b',
    status: 'active',
    host: 'node-k8s-worker-19.us-west-2',
    ip: '10.2.45.112',
    version: 'v0.4.2',
    lastHeartbeat: new Date(Date.now() - 9000).toISOString(),
    logsShipped: 98450,
    uptime: '12d 14h 05m',
    environment: 'production',
    os: 'Linux 6.1.0-amd64 (Ubuntu 24.04)',
  },
  {
    id: 'agent-eu-central-01',
    name: 'loggate-agent-prod-eucentral1',
    status: 'active',
    host: 'node-edge-fra-03.eu-central-1',
    ip: '10.5.88.201',
    version: 'v0.4.1',
    lastHeartbeat: new Date(Date.now() - 15000).toISOString(),
    logsShipped: 76200,
    uptime: '9d 02h 45m',
    environment: 'production',
    os: 'Linux 5.15.0-x86_64 (Debian 12)',
  },
  {
    id: 'agent-staging-01',
    name: 'loggate-agent-staging-uswest',
    status: 'degraded',
    host: 'stg-vm-gateway-01',
    ip: '192.168.10.45',
    version: 'v0.4.0',
    lastHeartbeat: new Date(Date.now() - 145000).toISOString(),
    logsShipped: 21400,
    uptime: '2d 11h 10m',
    environment: 'staging',
    os: 'Linux 6.1.0-amd64',
  },
  {
    id: 'agent-dev-local-01',
    name: 'loggate-agent-dev-local',
    status: 'inactive',
    host: 'devbox-varalaxmi.local',
    ip: '127.0.0.1',
    version: 'v0.3.9',
    lastHeartbeat: new Date(Date.now() - 86400000).toISOString(),
    logsShipped: 4320,
    uptime: '0h 0m',
    environment: 'development',
    os: 'Windows 11 Pro 64-bit',
  },
];

const SAMPLE_LOG_TEMPLATES: Array<{
  level: LogLevel;
  service: string;
  message: string;
  meta: Record<string, unknown>;
  stackTrace?: string;
}> = [
  {
    level: 'INFO',
    service: 'api-gateway',
    message: 'HTTP GET /api/v1/health status=200 duration=2.1ms client_ip=10.0.0.15',
    meta: { method: 'GET', endpoint: '/api/v1/health', status: 200, latency_ms: 2.1 },
  },
  {
    level: 'INFO',
    service: 'auth-service',
    message: 'OAuth token issued successfully for user_id="usr_88921a" scope=["read", "write"]',
    meta: { user_id: 'usr_88921a', client_id: 'mobile-app-v2', token_type: 'Bearer' },
  },
  {
    level: 'WARN',
    service: 'auth-service',
    message: 'Rate limit threshold exceeded (85/100 requests) for ip=198.51.100.42',
    meta: { ip: '198.51.100.42', current_count: 85, threshold: 100, window_sec: 60 },
  },
  {
    level: 'INFO',
    service: 'order-service',
    message: 'Order created order_id="ord_990142" total_cents=4599 currency="USD"',
    meta: { order_id: 'ord_990142', total_cents: 4599, customer_id: 'cust_7721' },
  },
  {
    level: 'INFO',
    service: 'payment-processor',
    message: 'Payment intent created id="pi_3N9k28a" amount=4599 gateway="stripe"',
    meta: { payment_intent_id: 'pi_3N9k28a', provider: 'stripe', status: 'requires_confirmation' },
  },
  {
    level: 'ERROR',
    service: 'payment-processor',
    message: 'Payment capture failed: CardDeclined (code: insufficient_funds) for pi_3N9k28a',
    meta: { error_code: 'card_declined', decline_reason: 'insufficient_funds', attempt: 1 },
    stackTrace: `PaymentGatewayError: Card declined by issuing bank (insufficient_funds)
    at StripeAdapter.capture (/app/services/stripe.js:142:19)
    at async PaymentProcessor.processPayment (/app/handlers/payment.js:88:12)
    at async ExpressRouter.handle (/app/routes/v1/checkout.js:34:5)`,
  },
  {
    level: 'WARN',
    service: 'user-db-cluster',
    message: 'Postgres connection pool nearing saturation: 44/50 active connections',
    meta: { active: 44, max: 50, idle: 6, waiting_queries: 2 },
  },
  {
    level: 'ERROR',
    service: 'user-db-cluster',
    message: 'ConnectionTimeout: Failed to acquire DB connection within 5000ms',
    meta: { timeout_ms: 5000, database: 'loggate_production', pool_size: 50 },
    stackTrace: `TimeoutError: Connection acquisition timed out after 5000ms
    at Pool.acquire (/app/node_modules/pg-pool/index.js:312:14)
    at async DatabaseClient.query (/app/db/client.js:45:18)
    at async UserService.getUserById (/app/services/user.js:19:9)`,
  },
  {
    level: 'INFO',
    service: 'notification-worker',
    message: 'Dispatching notification email template="welcome_email" recipient_hash="8f2a...19b"',
    meta: { channel: 'email', provider: 'resend', attempts: 1 },
  },
  {
    level: 'DEBUG',
    service: 'api-gateway',
    message: 'Proxying request headers: Authorization=Bearer [REDACTED], X-Request-ID=req_110294',
    meta: { path: '/api/v1/users/me', route_match: 'user_service_proxy' },
  },
  {
    level: 'WARN',
    service: 'notification-worker',
    message: 'Webhook delivery returned HTTP 429 Too Many Requests, scheduling backoff retry',
    meta: { retry_attempt: 2, backoff_seconds: 15, webhook_target: 'slack' },
  },
  {
    level: 'INFO',
    service: 'api-gateway',
    message: 'TLS handshake completed in 1.4ms with TLS 1.3 (cipher: TLS_AES_256_GCM_SHA384)',
    meta: { tls_version: 'TLSv1.3', cipher: 'TLS_AES_256_GCM_SHA384' },
  },
  {
    level: 'DEBUG',
    service: 'auth-service',
    message: 'Redis cache hit for session_key="sess_99b01"',
    meta: { cache_backend: 'redis_cluster', latency_us: 420 },
  },
  {
    level: 'ERROR',
    service: 'order-service',
    message: 'Deadlock detected while locking row in table "inventory_items" for SKU="SKU-8821"',
    meta: { sku: 'SKU-8821', lock_type: 'exclusive', transaction_id: 'tx_881920' },
    stackTrace: `DBDeadlockError: deadlock detected
    DETAIL: Process 18402 waits for ExclusiveLock on tuple (42, 8) of relation 16421; blocked by process 18408.
    at Query.handleError (/app/node_modules/pg/lib/query.js:141:17)
    at Connection.emit (node:events:517:28)`,
  },
];

function generateRandomHex(length: number): string {
  const characters = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function generateMockLog(timestampOverride?: Date): LogEntry {
  const template = SAMPLE_LOG_TEMPLATES[Math.floor(Math.random() * SAMPLE_LOG_TEMPLATES.length)];
  const agent = MOCK_AGENTS[Math.floor(Math.random() * 3)]; // pick active agent
  const timestamp = (timestampOverride || new Date()).toISOString();
  const id = `log_${Date.now()}_${generateRandomHex(6)}`;
  const traceId = `trc_${generateRandomHex(16)}`;
  const spanId = `spn_${generateRandomHex(8)}`;

  return {
    id,
    timestamp,
    level: template.level,
    service: template.service,
    message: template.message,
    traceId,
    spanId,
    agentId: agent.id,
    host: agent.host,
    environment: agent.environment,
    metadata: {
      ...template.meta,
      agent_version: agent.version,
    },
    stackTrace: template.stackTrace,
  };
}

export function getInitialLogs(count = 45): LogEntry[] {
  const logs: LogEntry[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    // Generate logs spread across the last 15 minutes
    const offsetMs = (count - i) * 20000 + Math.floor(Math.random() * 8000);
    const logTime = new Date(now - offsetMs);
    logs.push(generateMockLog(logTime));
  }

  // Sort descending by timestamp (newest first)
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function calculateMetrics(logs: LogEntry[]): MetricOverview {
  const total = logs.length;
  let errors = 0;
  let warnings = 0;
  let info = 0;
  let debug = 0;
  const serviceCounts: Record<string, number> = {};

  for (const log of logs) {
    if (log.level === 'ERROR') errors++;
    else if (log.level === 'WARN') warnings++;
    else if (log.level === 'INFO') info++;
    else if (log.level === 'DEBUG') debug++;

    serviceCounts[log.service] = (serviceCounts[log.service] || 0) + 1;
  }

  const errorRate = total > 0 ? Number(((errors / total) * 100).toFixed(1)) : 0;
  const activeAgents = MOCK_AGENTS.filter((a) => a.status === 'active').length;

  // Build a 12-slot volume timeline for charts (e.g. past 60 minutes)
  const volumeTimeline: Array<{ time: string; total: number; errors: number; warnings: number }> = [];
  const now = Date.now();
  for (let i = 11; i >= 0; i--) {
    const slotTime = new Date(now - i * 5 * 60000);
    const timeLabel = slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Count logs falling around this interval
    const slotTotal = Math.floor(18 + Math.random() * 32);
    const slotErrors = Math.floor(Math.random() * 4);
    const slotWarnings = Math.floor(Math.random() * 7);

    volumeTimeline.push({
      time: timeLabel,
      total: slotTotal,
      errors: slotErrors,
      warnings: slotWarnings,
    });
  }

  return {
    totalLogs: total * 85 + 1420, // display aggregate total for a realistic fleet
    errorRate,
    activeAgents,
    logsPerSec: Number((14.5 + Math.random() * 6).toFixed(1)),
    volumeTimeline,
    levelCounts: {
      ERROR: errors,
      WARN: warnings,
      INFO: info,
      DEBUG: debug,
    },
    serviceCounts,
  };
}
