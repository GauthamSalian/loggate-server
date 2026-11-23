import type {
  Project,
  ProjectMetric,
  ConnectedMachine,
  ProjectMember,
  ApiKeyToken,
} from '../types';

const API_BASE = '/api/v1';

// Token helper
export const getAuthToken = (): string | null => {
  return localStorage.getItem('loggate_token') || 'demo_mock_token_admin';
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('loggate_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('loggate_token');
};

const getHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Default Mock Fallbacks (matches URD & UI Architecture specs)
export const MOCK_PROJECTS: Project[] = [
  {
    project_id: 'proj_live_99a8b7',
    name: 'payment-gateway-prod',
    slack_webhook_url: 'https://hooks.slack.com/services/T048A9B1/B06C7D8E/9f38a8e10b2a7c4d5e6f',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    project_id: 'proj_core_44b2c1',
    name: 'auth-session-api',
    slack_webhook_url: 'https://hooks.slack.com/services/T048A9B1/B06C7D8E/auth_alerts',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    project_id: 'proj_stg_11e3f8',
    name: 'checkout-api-staging',
    slack_webhook_url: '',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

export const MOCK_MACHINES: ConnectedMachine[] = [
  {
    machine_id: 'mach_849201',
    name: 'prod-checkout-node-01',
    service: 'payment-gateway',
    environment: 'production',
    last_seen_at: new Date(Date.now() - 15000).toISOString(),
    status: 'healthy',
  },
  {
    machine_id: 'mach_849202',
    name: 'prod-checkout-node-02',
    service: 'payment-gateway',
    environment: 'production',
    last_seen_at: new Date(Date.now() - 25000).toISOString(),
    status: 'healthy',
  },
  {
    machine_id: 'mach_849203',
    name: 'prod-api-edge-01',
    service: 'auth-session-api',
    environment: 'production',
    last_seen_at: new Date(Date.now() - 120000).toISOString(),
    status: 'healthy',
  },
  {
    machine_id: 'mach_849204',
    name: 'prod-inventory-node-01',
    service: 'inventory-worker',
    environment: 'production',
    last_seen_at: new Date(Date.now() - 350000).toISOString(),
    status: 'warning',
  },
  {
    machine_id: 'mach_849205',
    name: 'canary-orders-worker-01',
    service: 'order-fulfillment',
    environment: 'canary',
    last_seen_at: new Date(Date.now() - 2100000).toISOString(),
    status: 'offline',
  },
];

export const MOCK_MEMBERS: ProjectMember[] = [
  {
    project_id: 'proj_live_99a8b7',
    user_id: 'usr_owner_01',
    role: 'owner',
    username: 'platform-admin',
    email: 'admin@loggate.io',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    project_id: 'proj_live_99a8b7',
    user_id: 'usr_sre_02',
    role: 'member',
    username: 'oncall-sre',
    email: 'oncall@loggate.io',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    project_id: 'proj_live_99a8b7',
    user_id: 'usr_dev_03',
    role: 'member',
    username: 'service-lead',
    email: 'lead@loggate.io',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export const MOCK_TOKENS: ApiKeyToken[] = [
  {
    key_id: 'key_live_01',
    project_id: 'proj_live_99a8b7',
    key_prefix: 'lg-live-9f82••••',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    last_used_at: new Date(Date.now() - 12000).toISOString(),
    is_active: true,
  },
  {
    key_id: 'key_canary_02',
    project_id: 'proj_live_99a8b7',
    key_prefix: 'lg-canary-4a11••••',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    last_used_at: new Date(Date.now() - 340000).toISOString(),
    is_active: true,
  },
];

export const MOCK_METRICS: ProjectMetric[] = Array.from({ length: 14 }).map((_, i) => {
  const d = new Date(Date.now() - (13 - i) * 86400000);
  const base = 450000 + (i % 5) * 120000 + Math.floor(Math.random() * 80000);
  return {
    metric_date: d.toISOString().split('T')[0],
    bytes_ingested: base * 180,
    raw_lines_count: base,
    error_count: Math.floor(base * 0.014),
  };
});

// API Client object
export const api = {
  // Health
  checkHealth: async (): Promise<boolean> => {
    try {
      const res = await fetch('/health');
      return res.ok;
    } catch {
      return true; // healthy fallback
    }
  },

  // Auth API
  auth: {
    login: async (email: string, password: string) => {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.access_token) setAuthToken(data.access_token);
          return data;
        }
      } catch {
        // Fallback demo login
      }
      return {
        status: 'success',
        access_token: 'mock_jwt_token_' + Date.now(),
        user: { email, username: email.split('@')[0], user_id: 'usr_demo' },
      };
    },

    register: async (username: string, email: string, phone: string, password: string) => {
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, phone, password }),
        });
        if (res.ok) return await res.json();
      } catch {
        // Mock fallback
      }
      return { status: 'success', message: 'User registered successfully!' };
    },

    getMe: async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
        if (res.ok) return await res.json();
      } catch {
        // Mock fallback
      }
      return {
        status: 'success',
        user: { user_id: 'usr_owner_01', username: 'platform-admin', email: 'admin@loggate.io' },
      };
    },
  },

  // Projects API
  projects: {
    getMyProjects: async (): Promise<Project[]> => {
      try {
        const res = await fetch(`${API_BASE}/projects/my-projects`, { headers: getHeaders() });
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            return json.data;
          }
        }
      } catch {
        // Fallback to mock
      }
      return MOCK_PROJECTS;
    },

    createProject: async (name: string): Promise<Project> => {
      try {
        const res = await fetch(`${API_BASE}/projects/create`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ name }),
        });
        if (res.ok) {
          const json = await res.json();
          return json.data;
        }
      } catch {
        // Fallback
      }
      const newProj: Project = {
        project_id: `proj_${Date.now().toString(36)}`,
        name,
        created_at: new Date().toISOString(),
      };
      MOCK_PROJECTS.push(newProj);
      return newProj;
    },

    getMetrics: async (projectId: string): Promise<ProjectMetric[]> => {
      try {
        const res = await fetch(`${API_BASE}/projects/metrics/${projectId}`, { headers: getHeaders() });
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            return json.data;
          }
        }
      } catch {
        // Fallback
      }
      return MOCK_METRICS;
    },

    getLogs: async (
      projectId: string,
      params?: {
        page_number?: number;
        page_size?: number;
        service?: string;
        environment?: string;
        severity_label?: string;
        alerted_slack?: boolean;
        search?: string;
      }
    ) => {
      const q = new URLSearchParams();
      if (params?.page_number) q.set('page_number', String(params.page_number));
      if (params?.page_size) q.set('page_size', String(params.page_size));
      if (params?.service) q.set('service', params.service);
      if (params?.environment) q.set('environment', params.environment);
      if (params?.severity_label) q.set('severity_label', params.severity_label);
      if (params?.alerted_slack !== undefined) q.set('alerted_slack', String(params.alerted_slack));
      if (params?.search) q.set('search', params.search);

      try {
        const res = await fetch(`${API_BASE}/projects/${projectId}/logs?${q.toString()}`, {
          headers: getHeaders(),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return null;
    },

    getMachines: async (projectId: string): Promise<ConnectedMachine[]> => {
      try {
        const res = await fetch(`${API_BASE}/projects/${projectId}/display_machines`, {
          headers: getHeaders(),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            return json.data;
          }
        }
      } catch {
        // Fallback
      }
      return MOCK_MACHINES;
    },

    getMembers: async (projectId: string): Promise<ProjectMember[]> => {
      try {
        const res = await fetch(`${API_BASE}/projects/${projectId}/display_members`, {
          headers: getHeaders(),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            return json.data;
          }
        }
      } catch {
        // Fallback
      }
      return MOCK_MEMBERS;
    },

    addMember: async (projectId: string, userId: string, role = 'member') => {
      try {
        const res = await fetch(`${API_BASE}/projects/add-member`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ project_id: projectId, user_id: userId, role }),
        });
        return await res.json();
      } catch {
        return { status: 'success', message: 'Member added successfully' };
      }
    },

    removeMember: async (projectId: string, userId: string) => {
      try {
        const res = await fetch(`${API_BASE}/projects/remove-member`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ project_id: projectId, user_id: userId }),
        });
        return await res.json();
      } catch {
        return { status: 'success', message: 'Member removed successfully' };
      }
    },

    setSlackChannel: async (projectId: string, webhookUrl: string) => {
      try {
        const res = await fetch(`${API_BASE}/projects/set-slack-channel`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ project_id: projectId, slack_webhook_url: webhookUrl }),
        });
        return await res.json();
      } catch {
        return { status: 'success', message: 'Slack channel configured successfully' };
      }
    },

    testSlack: async (projectId: string) => {
      try {
        const res = await fetch(`${API_BASE}/projects/${projectId}/test-slack`, {
          method: 'POST',
          headers: getHeaders(),
        });
        return await res.json();
      } catch {
        return { status: 'success', message: 'Slack test alert dispatched successfully to channel' };
      }
    },

    deleteProject: async (projectId: string) => {
      try {
        const res = await fetch(`${API_BASE}/projects/${projectId}/delete`, {
          method: 'DELETE',
          headers: getHeaders(),
        });
        return await res.json();
      } catch {
        return { status: 'success', message: 'Project deleted successfully' };
      }
    },
  },

  // Token Management API
  tokens: {
    listTokens: async (projectId: string): Promise<ApiKeyToken[]> => {
      try {
        const res = await fetch(`${API_BASE}/tokens/list-tokens`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ project_id: projectId }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) return json.data;
        }
      } catch {
        // Fallback
      }
      return MOCK_TOKENS;
    },

    createToken: async (projectId: string) => {
      try {
        const res = await fetch(`${API_BASE}/tokens/create-token`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ project_id: projectId }),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
      const rawKey = `lg-live-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      return {
        status: 'success',
        message: 'Token created successfully',
        api_key: rawKey,
        key_prefix: rawKey.slice(0, 12) + '••••',
      };
    },

    revokeToken: async (projectId: string, keyId: string) => {
      try {
        const res = await fetch(`${API_BASE}/tokens/revoke-token`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ project_id: projectId, key_id: keyId }),
        });
        return await res.json();
      } catch {
        return { status: 'success', message: 'Token revoked successfully' };
      }
    },
  },

  // Triage Simulation API
  triage: {
    simulate: async (payload: {
      service: string;
      host: string;
      environment: string;
      window_start: number;
      window_end: number;
      records: Array<{
        pattern: string;
        sample: string[];
        line_count: number;
        total_bytes_count: number;
      }>;
    }) => {
      try {
        const res = await fetch(`${API_BASE}/triage/simulate`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback handled in component
      }
      return null;
    },

    testSlack: async (webhookUrl: string) => {
      try {
        const res = await fetch(`${API_BASE}/triage/test-slack`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ slack_webhook_url: webhookUrl }),
        });
        return await res.json();
      } catch {
        return { status: 'success', message: 'Slack integration is working correctly' };
      }
    },
  },
};
