export type AgentId =
  | 'ProductManagerAgent'
  | 'RequirementAgent'
  | 'BusinessAnalystAgent'
  | 'UIUXAgent'
  | 'ArchitectureAgent'
  | 'FrontendAgent'
  | 'BackendAgent'
  | 'QAAgent'
  | 'DevOpsAgent'
  | 'SecurityAgent'
  | 'DocumentationAgent'
  | 'MarketingAgent'
  | 'FinanceAgent'
  | 'RiskAgent'
  | 'CommunicationAgent'
  | 'StakeholderAgent'
  | 'AnalyticsAgent';

export type AgentStatus = 'Idle' | 'Pending' | 'In_Progress' | 'Completed' | 'Failed' | 'Blocked';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ToolCallLog {
  tool: string;
  args: Record<string, any>;
  result: Record<string, any>;
  timestamp: string;
}

export interface AgentMessage {
  id: string;
  timestamp: string;
  agent: AgentId;
  status: AgentStatus;
  risk: RiskLevel;
  estimated_days: number;
  dependencies: AgentId[];
  summary: string;
  payload: Record<string, any>;
  tool_calls?: ToolCallLog[];
}

export interface AgentMetadata {
  id: AgentId;
  name: string;
  role: string;
  responsibilities: string[];
  inputs: string[];
  outputs: string[];
  constraints: string[];
  metrics: string[];
  protocol: string;
  skillContent?: string;
  promptContent?: string;
  examplesContent?: string;
  toolsContent?: any[];
  schemaContent?: any;
  memoryContent?: any;
  outputContent?: any;
}

export interface UserStory {
  id: string;
  epic: string;
  title: string;
  description: string;
  points: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'To_Do' | 'In_Progress' | 'Review' | 'Done';
  assignee: AgentId;
}

export interface ADR {
  id: string;
  adrNumber: number;
  title: string;
  status: 'Proposed' | 'Accepted' | 'Deprecated';
  context: string;
  decision: string;
  impact: string;
}

export interface RiskItem {
  id: string;
  title: string;
  category: 'Technical' | 'Financial' | 'Security' | 'Schedule' | 'Operational';
  impact: number; // 1-5
  likelihood: number; // 1-5
  score: number; // impact * likelihood
  riskLevel: RiskLevel;
  mitigation: string;
  owner: AgentId;
}

export interface TeamMemberAllocation {
  agent: AgentId;
  role: string;
  capacity: number; // percentage
  workload: number; // percentage
  currentTask: string;
}

export interface SharedMemoryState {
  projectInfo: {
    id: string;
    name: string;
    prompt: string;
    category: string;
    startedAt: string;
    status: 'Draft' | 'Orchestrating' | 'Completed';
  };
  requirements: Array<{
    id: string;
    title: string;
    type: 'Functional' | 'Non-Functional' | 'Security' | 'Business';
    priority: 'Must Have' | 'Should Have' | 'Could Have' | 'Won\'t Have';
    description: string;
    acceptance: string[];
  }>;
  sprintData: {
    currentSprint: string;
    totalSprints: number;
    stories: UserStory[];
  };
  decisions: ADR[];
  risks: RiskItem[];
  architecture: {
    topology: string;
    database: string;
    services: Array<{ name: string; tech: string; description: string; port?: number }>;
    slas: { latency: string; uptime: string; throughput: string };
  };
  teamInfo: TeamMemberAllocation[];
  previousOutputs: Record<string, any>;
  financials: {
    totalBudget: number;
    spentBudget: number;
    infraCostMonthly: number;
    laborCost: number;
    roiProjection: string;
    breakEvenMonths: number;
    breakdown: Array<{ category: string; amount: number; percentage: number }>;
  };
  analytics: {
    healthScore: number;
    securityIndex: number;
    qualityScore: number;
    timelineDaysTotal: number;
    criticalPathDays: number;
    completedSteps: number;
    totalSteps: number;
    northStarMetric: string;
    kpis: Array<{ name: string; target: string; current: string; status: 'Good' | 'Warning' | 'Critical' }>;
  };
  interAgentMessages: AgentMessage[];
}
