import type { SharedMemoryState, AgentMessage } from '../types/agent';

const INITIAL_MEMORY_STATE: SharedMemoryState = {
  projectInfo: {
    id: 'PROJ-EVT-001',
    name: 'Event Management Platform',
    prompt: 'I want to build an Event Management Platform.',
    category: 'Enterprise SaaS / Ticketing',
    startedAt: new Date().toISOString(),
    status: 'Draft'
  },
  requirements: [
    {
      id: 'REQ-101',
      title: 'High-Concurrency Ticket Reservation Engine',
      type: 'Functional',
      priority: 'Must Have',
      description: 'System must handle 5,000 concurrent ticket booking requests per second during flash drops.',
      acceptance: [
        'Atomic ticket allocation using Redis Lua scripts',
        'Sub-300ms reservation lock expiration window',
        'Zero duplicate booking race conditions under load'
      ]
    },
    {
      id: 'REQ-102',
      title: 'Offline Dynamic QR Code Pass Verification',
      type: 'Functional',
      priority: 'Must Have',
      description: 'Gate scanning mobile app must verify QR ticket validity offline without requiring live internet.',
      acceptance: [
        'Dynamic TOTP cryptographic signature within QR code',
        'Local PWA cache of event public verification keys',
        'Sub-400ms scan-to-gate entry validation speed'
      ]
    },
    {
      id: 'REQ-103',
      title: 'PCI-DSS Compliance Payment Processing',
      type: 'Security',
      priority: 'Must Have',
      description: 'Integrate Stripe API for secure multi-currency ticket checkout and refund processing.',
      acceptance: [
        'PCI-DSS Level 1 compliant tokenization',
        'Support Apple Pay, Google Pay, and major Credit Cards',
        'Automated receipt PDF generation via email'
      ]
    }
  ],
  sprintData: {
    currentSprint: 'Sprint 1 - Foundation & Elicitation',
    totalSprints: 4,
    stories: [
      { id: 'STORY-101', epic: 'Ticketing Engine', title: 'Redis Lua Reservation Lock Endpoint', description: 'Build high-speed ticket reservation service in Go', points: 8, priority: 'Critical', status: 'In_Progress', assignee: 'BackendAgent' },
      { id: 'STORY-102', epic: 'UI & Design', title: 'Interactive Seat Map UI Component', description: 'Design SVG venue seating layout selector', points: 5, priority: 'High', status: 'In_Progress', assignee: 'UIUXAgent' },
      { id: 'STORY-103', epic: 'Infrastructure', title: 'AWS EKS & Aurora Provisioning', description: 'Script Terraform modules for Kubernetes cluster', points: 8, priority: 'High', status: 'To_Do', assignee: 'DevOpsAgent' },
      { id: 'STORY-104', epic: 'Quality & Testing', title: 'Locust 5,000 RPS Load Test Script', description: 'Simulate flash drop ticketing traffic spikes', points: 5, priority: 'Medium', status: 'To_Do', assignee: 'QAAgent' }
    ]
  },
  decisions: [
    {
      id: 'ADR-1',
      adrNumber: 1,
      title: 'Redis Lua Scripting for Atomic Ticket Reservation',
      status: 'Accepted',
      context: 'Flash sales cause massive database lock contention when thousands of users click Buy concurrently.',
      decision: 'Perform atomic inventory decrement inside Redis Lua scripts before committing to PostgreSQL database transactions.',
      impact: 'Eliminates database deadlocks and delivers P99 latency under 45ms.'
    },
    {
      id: 'ADR-2',
      adrNumber: 2,
      title: 'NATS JetStream for Asynchronous Ticket Event Distribution',
      status: 'Accepted',
      context: 'Payment webhooks and email/SMS receipt generation should not block the checkout HTTP request.',
      decision: 'Adopt NATS JetStream event streaming to decouple ticket purchase confirmation from downstream notifications.',
      impact: 'Reduces checkout request duration by 60%.'
    }
  ],
  risks: [
    {
      id: 'RISK-1',
      title: 'Flash Ticket Drop Traffic Spike (5,000+ RPS)',
      category: 'Technical',
      impact: 5,
      likelihood: 3,
      score: 15,
      riskLevel: 'High',
      mitigation: 'Pre-warmed Redis cluster + Kubernetes Horizontal Pod Autoscaler scaling from 3 to 15 nodes.',
      owner: 'ArchitectureAgent'
    },
    {
      id: 'RISK-2',
      title: 'Venue Gate Connectivity Outage',
      category: 'Operational',
      impact: 4,
      likelihood: 3,
      score: 12,
      riskLevel: 'Medium',
      mitigation: 'Local PWA SQLite offline pass verification database.',
      owner: 'FrontendAgent'
    },
    {
      id: 'RISK-3',
      title: 'Stripe Gateway Webhook Delivery Delays',
      category: 'Financial',
      impact: 3,
      likelihood: 3,
      score: 9,
      riskLevel: 'Medium',
      mitigation: 'NATS queue retry mechanism with exponential backoff.',
      owner: 'BackendAgent'
    }
  ],
  architecture: {
    topology: 'Event-Driven Microservices on AWS EKS',
    database: 'PostgreSQL 16 Aurora Serverless + Redis Cluster',
    services: [
      { name: 'Auth Service', tech: 'Node.js', description: 'JWT & OAuth2 Identity Provider', port: 4001 },
      { name: 'Ticketing Service', tech: 'Go / Fiber', description: 'Atomic Ticket Reservation Engine', port: 4002 },
      { name: 'Payment Service', tech: 'Node.js', description: 'Stripe Payment Webhook Processor', port: 4003 },
      { name: 'Gate Verification', tech: 'Elixir', description: 'WebSocket Door Scanning Service', port: 4004 }
    ],
    slas: {
      latency: '< 85ms P99',
      uptime: '99.99%',
      throughput: '10,000 RPS'
    }
  },
  teamInfo: [
    { agent: 'ProductManagerAgent', role: 'Lead Orchestrator', capacity: 100, workload: 90, currentTask: 'SDLC Synthesis' },
    { agent: 'RequirementAgent', role: 'Requirements Specialist', capacity: 100, workload: 40, currentTask: 'User Stories' },
    { agent: 'ArchitectureAgent', role: 'System Architect', capacity: 100, workload: 85, currentTask: 'Microservices Diagram' },
    { agent: 'BackendAgent', role: 'Backend Lead', capacity: 100, workload: 95, currentTask: 'Go Redis Lua Engine' },
    { agent: 'FrontendAgent', role: 'Frontend Lead', capacity: 100, workload: 80, currentTask: 'React Seat Map' },
    { agent: 'DevOpsAgent', role: 'DevOps Engineer', capacity: 100, workload: 75, currentTask: 'Terraform IaC' }
  ],
  previousOutputs: {},
  financials: {
    totalBudget: 45000,
    spentBudget: 12500,
    infraCostMonthly: 1850,
    laborCost: 28000,
    roiProjection: '480% over 3 years',
    breakEvenMonths: 9,
    breakdown: [
      { category: 'Engineering Labor', amount: 28000, percentage: 62 },
      { category: 'Cloud & DevOps Infra', amount: 6500, percentage: 14 },
      { category: 'UI/UX Design', amount: 5000, percentage: 11 },
      { category: 'Contingency Reserve', amount: 5500, percentage: 13 }
    ]
  },
  analytics: {
    healthScore: 92,
    securityIndex: 96,
    qualityScore: 94,
    timelineDaysTotal: 32,
    criticalPathDays: 28,
    completedSteps: 0,
    totalSteps: 17,
    northStarMetric: 'Successful Ticket Purchases per Minute',
    kpis: [
      { name: 'Checkout Funnel Conversion', target: '> 65%', current: '72%', status: 'Good' },
      { name: 'Gate Scan Verification Speed', target: '< 500ms', current: '380ms', status: 'Good' },
      { name: 'System P99 API Latency', target: '< 100ms', current: '62ms', status: 'Good' }
    ]
  },
  interAgentMessages: []
};

class SharedMemoryStoreManager {
  private memoryState: SharedMemoryState;
  private listeners: Array<(state: SharedMemoryState) => void> = [];

  constructor() {
    this.memoryState = JSON.parse(JSON.stringify(INITIAL_MEMORY_STATE));
  }

  public getState(): SharedMemoryState {
    return this.memoryState;
  }

  public subscribe(listener: (state: SharedMemoryState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const copy = JSON.parse(JSON.stringify(this.memoryState));
    this.listeners.forEach(listener => listener(copy));
  }

  public resetMemory(newPrompt?: string): SharedMemoryState {
    this.memoryState = JSON.parse(JSON.stringify(INITIAL_MEMORY_STATE));
    if (newPrompt) {
      this.memoryState.projectInfo.prompt = newPrompt;
      this.memoryState.projectInfo.name = newPrompt.replace(/^I want to build (an|a)?\s*/i, '').trim() || 'New AI Project';
    }
    this.notify();
    return this.memoryState;
  }

  public addMessage(message: AgentMessage): void {
    this.memoryState.interAgentMessages.push(message);
    this.memoryState.previousOutputs[message.agent] = message;
    this.notify();
  }

  public applyStepUpdates(updates: any): void {
    if (!updates) return;

    if (updates.requirements) {
      this.memoryState.requirements = [...this.memoryState.requirements, ...updates.requirements];
    }
    if (updates.stories) {
      this.memoryState.sprintData.stories = [...this.memoryState.sprintData.stories, ...updates.stories];
    }
    if (updates.decisions) {
      this.memoryState.decisions = [...this.memoryState.decisions, ...updates.decisions];
    }
    if (updates.risks) {
      this.memoryState.risks = [...this.memoryState.risks, ...updates.risks];
    }
    if (updates.architecture) {
      this.memoryState.architecture = { ...this.memoryState.architecture, ...updates.architecture };
    }
    if (updates.financials) {
      this.memoryState.financials = { ...this.memoryState.financials, ...updates.financials };
    }
    if (updates.analytics) {
      this.memoryState.analytics = { ...this.memoryState.analytics, ...updates.analytics };
    }
    this.notify();
  }

  public updateProjectStatus(status: 'Draft' | 'Orchestrating' | 'Completed'): void {
    this.memoryState.projectInfo.status = status;
    this.notify();
  }
}

export const SharedMemoryStore = new SharedMemoryStoreManager();
