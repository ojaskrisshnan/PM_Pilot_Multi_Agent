export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'manager' | 'employee';
  agent_role?: string;
  title?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ProjectDto {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  domain: string;
  status: string;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RunDto {
  id: string;
  project_id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'AWAITING_APPROVAL' | 'PAUSED';
  started_at: string;
  completed_at?: string;
  total_agents: number;
  successful_agents: number;
  failed_agents: number;
  provider: string;
  requested_provider?: string;
  actual_provider?: string;
  fallback_reason?: string;
  error_message?: string;
  model: string;
  auto_approve?: boolean;
}

export interface AgentExecutionDto {
  id: string;
  run_id: string;
  agent_id: string;
  agent_name: string;
  phase_order: number;
  status: 'PENDING' | 'READY' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'BLOCKED' | 'CANCELLED' | 'AWAITING_APPROVAL';
  input: Record<string, any>;
  output: Record<string, any>;
  started_at?: string;
  completed_at?: string;
  execution_time_ms: number;
  tokens_used: number;
  retry_count: number;
  actual_provider?: string;
  fallback_reason?: string;
  error?: string;
}

export interface DeliverableDto {
  id: string;
  project_id: string;
  run_id?: string;
  agent_id: string;
  type: string;
  title: string;
  content: string;
  created_at: string;
}

export interface RunMetricsDto {
  run_id: string;
  total_agents: number;
  successful_agents: number;
  failed_agents: number;
  completion_rate: number;
  failure_rate: number;
  average_execution_time_ms: number;
  total_execution_time_ms: number;
  total_retries: number;
  total_tokens_used: number;
  output_completeness: number;
  agent_latencies: Record<string, number>;
}

export interface ProjectMetricsDto {
  project_id: string;
  total_runs: number;
  successful_runs: number;
  overall_completion_rate: number;
  average_run_duration_ms: number;
  average_agent_latency_ms: number;
  total_deliverables_count: number;
  runs_summary: RunMetricsDto[];
}

const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('pmpilot_jwt_token') : null;
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('pmpilot_jwt_token', token);
    } else {
      localStorage.removeItem('pmpilot_jwt_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) errorMsg = errorJson.detail;
      } catch {
        // ignore fallback
      }
      throw new Error(errorMsg);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  }

  // --- Auth Endpoints ---
  public async register(payload: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.access_token);
    return res;
  }

  public async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.access_token);
    return res;
  }

  public async getMe(): Promise<User> {
    return await this.request<User>('/auth/me');
  }

  public async getTeam(): Promise<User[]> {
    return await this.request<User[]>('/auth/team');
  }

  public logout() {
    this.setToken(null);
  }

  // --- Projects Endpoints ---
  public async getProjects(): Promise<ProjectDto[]> {
    return await this.request<ProjectDto[]>('/projects');
  }

  public async getProjectAssignments(projectId: string): Promise<Record<string, User>> {
    const res = await this.request<{ assignments: Record<string, User> }>(`/projects/${projectId}/assignments`);
    return res.assignments || {};
  }

  public async assignEmployee(projectId: string, agentId: string, userId: string): Promise<any> {
    return await this.request(`/projects/${projectId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ agent_id: agentId, user_id: userId }),
    });
  }

  public async getProject(projectId: string): Promise<ProjectDto> {
    return await this.request<ProjectDto>(`/projects/${projectId}`);
  }

  public async createProject(payload: { name: string; description?: string; domain?: string; config?: any }): Promise<ProjectDto> {
    return await this.request<ProjectDto>('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateProject(projectId: string, payload: Partial<ProjectDto>): Promise<ProjectDto> {
    return await this.request<ProjectDto>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async deleteProject(projectId: string): Promise<void> {
    await this.request<void>(`/projects/${projectId}`, { method: 'DELETE' });
  }

  // --- Runs Endpoints ---
  public async createRun(projectId: string, payload?: { provider?: string; model?: string; input_prompt_override?: string; domain_override?: string; auto_approve?: boolean }): Promise<RunDto> {
    return await this.request<RunDto>(`/projects/${projectId}/runs`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  }

  public async getProjectRuns(projectId: string): Promise<RunDto[]> {
    return await this.request<RunDto[]>(`/projects/${projectId}/runs`);
  }

  public async getRun(runId: string): Promise<RunDto & { executions: AgentExecutionDto[]; metrics?: RunMetricsDto }> {
    return await this.request<RunDto & { executions: AgentExecutionDto[]; metrics?: RunMetricsDto }>(`/runs/${runId}`);
  }

  public async cancelRun(runId: string): Promise<RunDto> {
    return await this.request<RunDto>(`/runs/${runId}/cancel`, { method: 'POST' });
  }

  public async pauseRun(runId: string): Promise<RunDto> {
    return await this.request<RunDto>(`/runs/${runId}/pause`, { method: 'POST' });
  }

  public async resumeRun(runId: string): Promise<RunDto> {
    return await this.request<RunDto>(`/runs/${runId}/resume`, { method: 'POST' });
  }

  public async approveCheckpoint(runId: string, feedback?: string): Promise<RunDto> {
    return await this.request<RunDto>(`/runs/${runId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action: 'approve', feedback }),
    });
  }

  public async rejectCheckpoint(runId: string, feedback?: string): Promise<RunDto> {
    return await this.request<RunDto>(`/runs/${runId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ action: 'reject', feedback }),
    });
  }

  public async exportRunBlob(runId: string, format: 'docx' | 'markdown' | 'html' | 'json' | 'csv' = 'docx'): Promise<Blob> {
    const res = await fetch(`${API_BASE}/runs/${runId}/export?format=${format}`, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    });
    if (!res.ok) throw new Error(`Export failed with HTTP ${res.status}`);
    return await res.blob();
  }

  public async exportRun(runId: string, format: 'docx' | 'markdown' | 'html' | 'json' | 'csv' = 'markdown'): Promise<string> {
    const res = await fetch(`${API_BASE}/runs/${runId}/export?format=${format}`, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    });
    if (!res.ok) throw new Error(`Export failed with HTTP ${res.status}`);
    return await res.text();
  }

  // --- Agents Endpoints ---
  public async getRunAgents(runId: string): Promise<AgentExecutionDto[]> {
    return await this.request<AgentExecutionDto[]>(`/runs/${runId}/agents`);
  }

  public async getAgentRegistry(): Promise<any[]> {
    return await this.request<any[]>('/agent-registry');
  }

  // --- Deliverables Endpoints ---
  public async getDeliverables(projectId: string): Promise<DeliverableDto[]> {
    return await this.request<DeliverableDto[]>(`/projects/${projectId}/deliverables`);
  }

  // --- Metrics Endpoints ---
  public async getRunMetrics(runId: string): Promise<RunMetricsDto> {
    return await this.request<RunMetricsDto>(`/runs/${runId}/metrics`);
  }

  public async getProjectMetrics(projectId: string): Promise<ProjectMetricsDto> {
    return await this.request<ProjectMetricsDto>(`/projects/${projectId}/metrics`);
  }

  // --- Settings / Health Endpoints ---
  public async getHealth(): Promise<{ status: string; service: string; version: string; llm_provider: string }> {
    return await this.request<{ status: string; service: string; version: string; llm_provider: string }>('/health');
  }

  public async getLLMSettings(): Promise<any> {
    return await this.request<any>('/settings/llm');
  }

  public async pingLLM(provider: string): Promise<any> {
    return await this.request<any>(`/settings/llm/ping?provider=${encodeURIComponent(provider)}`, { method: 'POST' });
  }
}

export const api = new ApiClient();
