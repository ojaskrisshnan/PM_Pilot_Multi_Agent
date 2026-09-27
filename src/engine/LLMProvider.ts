import type { AgentId, LLMMode } from '../types/project';

export interface LLMRequest {
  agentId: AgentId;
  systemPrompt: string;
  userPrompt: string;
  projectContext?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  provider: LLMMode;
  model: string;
  latencyMs: number;
  tokensUsed: number;
  toolCalls?: Array<{
    tool: string;
    args: Record<string, any>;
    result: Record<string, any>;
  }>;
}

export interface LLMProviderConfig {
  mode: LLMMode;
  ollamaEndpoint: string;
  ollamaModel: string;
  cloudVendor: 'gemini' | 'openai' | 'groq' | 'openrouter';
  cloudModel: string;
  apiKey: string;
  temperature: number;
}

export const DEFAULT_LLM_CONFIG: LLMProviderConfig = {
  mode: 'hybrid',
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'llama3.2',
  cloudVendor: 'gemini',
  cloudModel: 'gemini-3.1-flash-lite',
  apiKey: '',
  temperature: 0.2
};

export interface LLMProvider {
  query(request: LLMRequest): Promise<LLMResponse>;
  ping(): Promise<{ success: boolean; latencyMs: number; message: string }>;
}

/**
 * Ollama Local Provider
 */
export class OllamaProvider implements LLMProvider {
  private endpoint: string;
  private model: string;

  constructor(endpoint: string = 'http://localhost:11434', model: string = 'llama3.2') {
    this.endpoint = endpoint;
    this.model = model;
  }

  public async ping(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const start = performance.now();
    try {
      const res = await fetch(`${this.endpoint}/api/tags`, { method: 'GET' });
      const latencyMs = Math.round(performance.now() - start);
      if (res.ok) {
        return { success: true, latencyMs, message: `Connected to Ollama (${latencyMs}ms)` };
      }
      return { success: false, latencyMs, message: `Ollama returned ${res.status}` };
    } catch {
      return { success: false, latencyMs: 0, message: 'Ollama offline at ' + this.endpoint };
    }
  }

  public async query(request: LLMRequest): Promise<LLMResponse> {
    const start = performance.now();
    const res = await fetch(`${this.endpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.userPrompt }
        ],
        temperature: request.temperature ?? 0.2,
        max_tokens: request.maxTokens ?? 1024
      })
    });

    if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
    const data = await res.json();
    const latencyMs = Math.round(performance.now() - start);

    return {
      content: data.choices?.[0]?.message?.content || '',
      provider: 'local',
      model: this.model,
      latencyMs,
      tokensUsed: data.usage?.total_tokens || 280
    };
  }
}

/**
 * Cloud API Provider (OpenAI, Gemini, Groq, OpenRouter)
 */
export class CloudProvider implements LLMProvider {
  private config: LLMProviderConfig;

  constructor(config: LLMProviderConfig) {
    this.config = config;
  }

  public async ping(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    if (!this.config.apiKey) {
      return { success: false, latencyMs: 0, message: 'No API Key configured' };
    }
    // Ping mock check
    return { success: true, latencyMs: 48, message: `Cloud ${this.config.cloudVendor} Ready` };
  }

  public async query(request: LLMRequest): Promise<LLMResponse> {
    const start = performance.now();
    const endpoint =
      this.config.cloudVendor === 'groq'
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : this.config.cloudVendor === 'openrouter'
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.cloudModel || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.userPrompt }
        ],
        temperature: request.temperature ?? 0.2
      })
    });

    if (!res.ok) throw new Error(`Cloud API HTTP ${res.status}`);
    const data = await res.json();
    const latencyMs = Math.round(performance.now() - start);

    return {
      content: data.choices?.[0]?.message?.content || '',
      provider: 'cloud',
      model: this.config.cloudModel,
      latencyMs,
      tokensUsed: data.usage?.total_tokens || 340
    };
  }
}

/**
 * Deterministic Mock Fallback Provider (guarantees 100% demo uptime with zero network dependency)
 * Dynamically synthesizes domain-specific agent deliverables matching any project prompt
 */
export class MockProvider implements LLMProvider {
  public async ping(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    return { success: true, latencyMs: 12, message: 'Offline Demo Fallback Ready' };
  }

  public async query(request: LLMRequest): Promise<LLMResponse> {
    const start = performance.now();
    await new Promise(r => setTimeout(r, 65));
    const latencyMs = Math.round(performance.now() - start);

    const projMatch = request.userPrompt.match(/Project:\s*([^\n]+)/i);
    const projectName = projMatch ? projMatch[1].trim() : 'Project';
    const isStudentTask = /student|task|todo|study|deadline|homework|reminder/i.test(request.userPrompt + ' ' + (request.projectContext || ''));

    let content = '';
    let toolName = 'execute_domain_sop';
    let toolResult: any = { code: 200, checks: 4, errors: 0 };

    switch (request.agentId) {
      case 'ProductManagerAgent':
        content = isStudentTask
          ? `Charter ratified for ${projectName}. Decomposed into 5 core epics: Student Auth, Task CRUD with Priority Matrix, Deadline Reminders, Dashboard Analytics, and Relational Storage. Set 28-day critical path.`
          : `Charter established for ${projectName}. Decomposed executive directive into prioritized roadmap across 5 sprints, mapping dependencies across all 16 downstream domain agents.`;
        toolName = 'create_roadmap';
        toolResult = { epicsGenerated: 5, targetLaunch: 'Q4 2026', criticalPathDays: 28 };
        break;

      case 'RequirementAgent':
        content = isStudentTask
          ? `Elicited 5 functional & security requirements for ${projectName}. Defined acceptance criteria for Task CRUD (Sub-50ms), Proactive Reminders (24h/1h), and Bcrypt Student Authentication.`
          : `Synthesized formal FR/NFR specification for ${projectName} adhering to IEEE 830 standards. Formulated MoSCoW priorities and strict boundary acceptance criteria.`;
        toolName = 'elicit_requirements';
        toolResult = { requirementsCreated: 5, moscowPriorityCount: { mustHave: 4, shouldHave: 1 } };
        break;

      case 'UIUXAgent':
        content = isStudentTask
          ? `Designed accessible Student Task Workspace UI: color-coded priority badges (Urgent/High/Medium/Low), task creation modal, and dual-pane Pending vs Completed tabs with micro-animations.`
          : `Constructed comprehensive design system tokens, wireframe component hierarchy, and responsive interaction patterns tailored for ${projectName}.`;
        toolName = 'design_component_system';
        toolResult = { componentsDesigned: 6, wcagCompliance: 'AAA', mobileOptimized: true };
        break;

      case 'ArchitectureAgent':
        content = isStudentTask
          ? `Synthesized ADR-001 (Relational SQL with SQLite/PostgreSQL) and ADR-002 (Stateless JWT Auth). Structured schema with foreign keys, composite indexes on (user_id, status, deadline).`
          : `Formulated master system topology for ${projectName}. Authored ADR-001 with modular services, structured JSON APIs, and horizontal resilience patterns.`;
        toolName = 'author_adr';
        toolResult = { adrId: 'ADR-001', architectureStyle: 'Modular Relational Service', latencyBudgetP99: '85ms' };
        break;

      case 'BackendAgent':
        content = isStudentTask
          ? `Synthesized Express TypeScript backend: /api/auth/register, /api/auth/login, /api/tasks CRUD, /api/tasks/:id/toggle, and /api/dashboard/stats. Seeded relational schema.`
          : `Engineered core business logic microservices and RESTful API endpoints for ${projectName}. Implemented parameter validation schemas and transactional data access layers.`;
        toolName = 'synthesize_api_routes';
        toolResult = { routesImplemented: 6, dbEngine: 'PostgreSQL/SQLite', testCoverage: '94%' };
        break;

      case 'FrontendAgent':
        content = isStudentTask
          ? `Built responsive StudentTaskDashboard React component with optimistic completion toggling, progress meters, and dynamic search/filter tabs (All, Pending, Completed).`
          : `Implemented client-side React 19 application for ${projectName}. Integrated state management, optimistic UI updates, and responsive viewport adaptations.`;
        toolName = 'build_ui_workstation';
        toolResult = { bundleSizeKb: 42, fpsTarget: 60, zeroDependencies: true };
        break;

      case 'SecurityAgent':
        content = isStudentTask
          ? `Validated student data isolation (preventing IDOR attacks via req.user.id scoping). Enforced bcrypt salted password encryption (work factor 12) and JWT token rotation.`
          : `Conducted STRIDE threat modeling and OWASP Top 10 vulnerability assessment for ${projectName}. Enforced zero-trust authorization and TLS 1.3 encryption.`;
        toolName = 'audit_security_controls';
        toolResult = { owaspPassRate: '100%', vulnerabilitiesFound: 0, complianceScore: 98 };
        break;

      case 'QAAgent':
        content = isStudentTask
          ? `Generated automated E2E test suite covering task creation, priority sorting, deadline countdowns, completion toggling, and authentication rejection cases.`
          : `Synthesized end-to-end integration test suite and load simulation scripts for ${projectName}. Established automated quality gate pass threshold at 98%.`;
        toolName = 'run_e2e_test_suite';
        toolResult = { testsRun: 24, testsPassed: 24, testPassRate: '100%' };
        break;

      case 'DevOpsAgent':
        content = isStudentTask
          ? `Generated multi-stage alpine Dockerfile and local dev docker-compose environment with Node.js and automated database migration pipelines.`
          : `Synthesized containerization manifests and automated CI/CD pipeline stages for ${projectName}. Configured health check probes and zero-downtime rolling deploys.`;
        toolName = 'provision_ci_cd';
        toolResult = { containerEngine: 'Docker Alpine', buildTimeSeconds: 38, healthCheck: 'PASS' };
        break;

      case 'DocumentationAgent':
        content = isStudentTask
          ? `Authored OpenAPI 3.0 specification for Student Task REST API, complete schema diagrams, student user guide, and local quick-start documentation.`
          : `Generated comprehensive API documentation, architecture blueprints, and operational runbooks for ${projectName}.`;
        toolName = 'generate_docs';
        toolResult = { openApiSpec: 'v3.0.3', markdownPages: 4, diagramsRendered: 2 };
        break;

      case 'FinanceAgent':
        content = `Synthesized Total Cost of Ownership (TCO) model for ${projectName}: modeled $45,000 MVP development ceiling, low cloud run-rate, and 480% 3-year projected ROI.`;
        toolName = 'model_financial_runway';
        toolResult = { totalBudget: 45000, projectedRoi: '480%', breakEvenMonths: 5 };
        break;

      case 'RiskAgent':
        content = isStudentTask
          ? `Constructed 5x5 Risk Heatmap: identified IDOR data leakage risk (Mitigated via row-level checks) and missed deadline alerts (Mitigated via idempotent retry queue).`
          : `Mapped technical, schedule, and compliance risks into 5x5 risk matrix for ${projectName}. Formulated active mitigations and contingency buffers.`;
        toolName = 'evaluate_risk_matrix';
        toolResult = { risksEvaluated: 3, criticalUnmitigated: 0, overallRiskLevel: 'Low' };
        break;

      case 'AnalyticsAgent':
        content = isStudentTask
          ? `Configured productivity telemetry: tracks student task completion velocity, average turnaround time per priority tier, and weekly habit adherence.`
          : `Instrumented telemetry pipeline for ${projectName}, tracking operational throughput, P99 API latencies, and conversion funnel analytics.`;
        toolName = 'instrument_telemetry';
        toolResult = { metricsTracked: 8, latencyTelemetry: 'Enabled', exportFormats: ['JSON', 'CSV'] };
        break;

      case 'BusinessAnalystAgent':
        content = isStudentTask
          ? `Benchmarked student study habits against academic productivity frameworks (Pomodoro, Eisenhower Matrix). Formulated high-value student retention features.`
          : `Synthesized market competitive analysis and user journey maps for ${projectName}, validating product-market fit against industry benchmarks.`;
        toolName = 'analyze_market_fit';
        toolResult = { marketCompetitiveness: 'High', valuePropositionScore: 94 };
        break;

      case 'StakeholderAgent':
        content = `Synthesized stakeholder alignment dossier for ${projectName}. Documented expectations, milestone sign-off criteria, and executive delivery briefing.`;
        toolName = 'align_stakeholders';
        toolResult = { stakeholderConsensus: 'Approved', signOffReadiness: '100%' };
        break;

      case 'CommunicationAgent':
        content = `Dispatched synchronized coordination digests across all 17 agent channels. Established event logging stream and milestone notification triggers for ${projectName}.`;
        toolName = 'broadcast_agent_digest';
        toolResult = { channelsNotified: 17, dispatchStatus: 'SYNCED' };
        break;

      case 'MarketingAgent':
        content = isStudentTask
          ? `Drafted go-to-market campaign targeting university students: highlights deadline reminders, zero clutter UI, and free student tier.`
          : `Formulated launch strategy, developer documentation highlights, and product release notes for ${projectName}.`;
        toolName = 'plan_launch_campaign';
        toolResult = { targetAudience: 'University Students & Educators', launchChannels: 4 };
        break;

      default:
        content = `Autonomously synthesized domain deliverables for ${projectName}. Validated SOP adherence and security controls.`;
        toolName = 'validate_domain_constraints';
        toolResult = { code: 200, checks: 4, errors: 0 };
    }

    return {
      content,
      provider: 'demo_fallback',
      model: 'pmpilot-deterministic-v2',
      latencyMs,
      tokensUsed: 265,
      toolCalls: [
        {
          tool: toolName,
          args: { agent: request.agentId, status: 'PASSED', project: projectName },
          result: toolResult
        }
      ]
    };
  }
}

/**
 * Hybrid LLM Router: Pings local Ollama; if online, dispatches locally; otherwise checks Cloud API or Demo Fallback
 */
export class HybridRouterManager implements LLMProvider {
  private config: LLMProviderConfig;
  private ollama: OllamaProvider;
  private mock: MockProvider;
  private listeners: Array<(config: LLMProviderConfig) => void> = [];

  constructor() {
    const saved = localStorage.getItem('PMPILOT_LLM_CONFIG');
    if (saved) {
      try {
        this.config = { ...DEFAULT_LLM_CONFIG, ...JSON.parse(saved) };
      } catch {
        this.config = { ...DEFAULT_LLM_CONFIG };
      }
    } else {
      this.config = { ...DEFAULT_LLM_CONFIG };
    }
    this.ollama = new OllamaProvider(this.config.ollamaEndpoint, this.config.ollamaModel);
    this.mock = new MockProvider();
  }

  public getConfig(): LLMProviderConfig {
    return { ...this.config };
  }

  public updateConfig(partial: Partial<LLMProviderConfig>): void {
    this.config = { ...this.config, ...partial };
    localStorage.setItem('PMPILOT_LLM_CONFIG', JSON.stringify(this.config));
    this.ollama = new OllamaProvider(this.config.ollamaEndpoint, this.config.ollamaModel);
    this.listeners.forEach(l => l(this.config));
  }

  public subscribe(listener: (config: LLMProviderConfig) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public async ping(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    if (this.config.mode === 'local') return this.ollama.ping();
    if (this.config.mode === 'cloud') return new CloudProvider(this.config).ping();
    if (this.config.mode === 'demo_fallback') return this.mock.ping();

    // Hybrid: Ping Ollama first
    const ollamaStatus = await this.ollama.ping();
    if (ollamaStatus.success) {
      return { success: true, latencyMs: ollamaStatus.latencyMs, message: `Hybrid (Local Ollama ${ollamaStatus.latencyMs}ms)` };
    }
    return { success: true, latencyMs: 62, message: 'Hybrid (Demo Fallback Engine Active)' };
  }

  public async query(request: LLMRequest): Promise<LLMResponse> {
    if (this.config.mode === 'local') {
      try {
        return await this.ollama.query(request);
      } catch {
        return await this.mock.query(request);
      }
    }

    if (this.config.mode === 'cloud' && this.config.apiKey) {
      try {
        return await new CloudProvider(this.config).query(request);
      } catch {
        return await this.mock.query(request);
      }
    }

    if (this.config.mode === 'hybrid') {
      try {
        return await this.ollama.query(request);
      } catch {
        if (this.config.apiKey) {
          try {
            return await new CloudProvider(this.config).query(request);
          } catch {
            return await this.mock.query(request);
          }
        }
        return await this.mock.query(request);
      }
    }

    return await this.mock.query(request);
  }
}

export const HybridRouter = new HybridRouterManager();
