import type { AgentId } from './agent';

export type { AgentId };

export type ExecutionSpeed = 0.5 | 1 | 2 | 5 | 'instant';
export type WorkflowStatus = 'Idle' | 'Running' | 'Paused' | 'Awaiting_Approval' | 'Completed' | 'Failed';
export type AgentLifecycleState = 'Idle' | 'Queued' | 'Running' | 'Completed' | 'Failed' | 'Blocked' | 'AwaitingApproval';
export type LLMMode = 'local' | 'cloud' | 'hybrid' | 'demo_fallback';

export interface Project {
  id: string;
  name: string;
  domain: string;
  description: string;
  targetLaunch: string;
  scaleConstraints: string;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Requirement {
  id: string;
  title: string;
  type: 'Functional' | 'Non-Functional' | 'Security' | 'Compliance';
  priority: 'Must Have' | 'Should Have' | 'Could Have' | 'Won\'t Have';
  description: string;
  metricValue?: string; // e.g. "5,000 RPS" or "sub-500ms"
  acceptance: string[];
  affectedAgents: AgentId[];
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface UserStory {
  id: string;
  epicId: string;
  epic: string;
  title: string;
  description: string;
  points: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'To_Do' | 'In_Progress' | 'Review' | 'Done';
  assignee: AgentId;
  acceptanceCriteria: string[];
  tasks: Task[];
}

export interface Task {
  id: string;
  storyId: string;
  title: string;
  status: 'Pending' | 'Completed';
  assignee: AgentId;
  durationHours: number;
}

export interface AgentDefinition {
  id: AgentId;
  name: string;
  role: string;
  systemPrompt: string;
  inputArtifacts: string[];
  outputArtifacts: string[];
  tools: string[];
  dependencies: AgentId[];
  approvalRequired?: boolean;
  canRunParallel?: boolean;
  phaseOrder: number;
  typicalDurationDays: number;
}

export interface AgentExecution {
  agentId: AgentId;
  state: AgentLifecycleState;
  startTime?: string;
  endTime?: string;
  durationMs?: number;
  assignedTasks: string[];
  generatedArtifactIds: string[];
  toolCalls: Array<{
    tool: string;
    args: Record<string, any>;
    result: Record<string, any>;
    timestamp: string;
  }>;
  outputSummary?: string;
  error?: string;
}

export interface Artifact {
  id: string;
  name: string;
  filename: string;
  category: 'Architecture' | 'Backend' | 'Frontend' | 'DevOps' | 'Security' | 'QA' | 'Documentation' | 'Business';
  language: 'markdown' | 'typescript' | 'sql' | 'dockerfile' | 'yaml' | 'json';
  content: string;
  generatingAgent: AgentId;
  version: number;
  lastUpdated: string;
}

export interface Risk {
  id: string;
  title: string;
  category: 'Technical' | 'Financial' | 'Security' | 'Schedule' | 'Operational';
  probability: number; // 1-5
  impact: number; // 1-5
  score: number; // probability * impact
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  mitigation: string;
  owner: AgentId;
  status: 'Open' | 'Mitigated' | 'Accepted';
}

export interface Decision {
  id: string;
  adrNumber: number;
  title: string;
  status: 'Proposed' | 'Accepted' | 'Deprecated';
  context: string;
  decision: string;
  impact: string;
  proposedBy: AgentId;
  approvedAt?: string;
}

export interface Approval {
  id: string;
  checkpointType: 'Architecture' | 'Security' | 'Milestone';
  agentId: AgentId;
  summary: string;
  recommendations: string[];
  identifiedRisks: string[];
  affectedArtifacts: string[];
  status: 'Pending' | 'Approved' | 'Rejected';
  humanNote?: string;
  decidedAt?: string;
}

export interface Milestone {
  id: string;
  title: string;
  targetDay: number;
  status: 'Pending' | 'Completed';
  dependencies: string[];
}

export interface Dependency {
  fromAgent: AgentId;
  toAgent: AgentId;
  type: 'hard' | 'soft';
}

export interface FinancialParams {
  teamSize: number; // 1 - 12 engineers
  blendedHourlyRate: number; // $50 - $200
  cloudTier: 'Starter' | 'Growth' | 'High-Concurrency';
  contingencyPercent: number; // 5% - 30%
}

export interface Budget {
  params: FinancialParams;
  engineeringCost: number;
  cloudMonthlyCost: number;
  qaTestingCost: number;
  securityComplianceCost: number;
  contingencyCost: number;
  totalMvpBudget: number;
  monthlyRunRate: number;
  annualBenefit: number;
  threeYearRoi: number; // percentage e.g. 480
  breakEvenMonths: number;
  breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export interface EventLogItem {
  id: string;
  timestamp: string;
  type:
    | 'ProjectCreated'
    | 'AgentStarted'
    | 'AgentCompleted'
    | 'ToolExecuted'
    | 'ArtifactGenerated'
    | 'ApprovalRequested'
    | 'HumanApproved'
    | 'HumanRejected'
    | 'RequirementChanged'
    | 'ImpactAnalysisCalculated'
    | 'WorkflowCompleted'
    | 'SystemNotice';
  agentId?: AgentId;
  title: string;
  detail: string;
  payload?: Record<string, any>;
}

export interface ProjectMetrics {
  healthScore: number; // 0 - 100
  scheduleHealth: 'On Track' | 'Minor Delay' | 'At Risk';
  progressPercent: number;
  completedAgentsCount: number;
  totalAgentsCount: number;
  criticalPathDays: number;
  totalEstimatedDays: number;
  securityAuditIndex: number; // 0 - 100
  qualityScore: number; // 0 - 100
  openRisksCount: number;
  pendingApprovalsCount: number;
}

export interface RequirementChangeImpact {
  requirementId: string;
  oldValue: string;
  newValue: string;
  affectedAgents: AgentId[];
  affectedRisks: Risk[];
  affectedArtifactIds: string[];
  estimatedBudgetImpact: number;
  estimatedTimelineImpactDays: number;
  summary: string;
}

export interface DbField {
  name: string;
  type: string;
  key?: boolean;
}

export interface DbEntity {
  name: string;
  desc: string;
  fields: DbField[];
}

export interface TestCase {
  id: string;
  name: string;
  suite: string;
  status: 'Passed' | 'Failed' | 'Running';
  duration: string;
  agent: AgentId;
}

export interface ProjectState {
  project: Project;
  requirements: Requirement[];
  epics: Epic[];
  stories: UserStory[];
  decisions: Decision[];
  risks: Risk[];
  artifacts: Artifact[];
  approvals: Approval[];
  agentExecutions: Record<AgentId, AgentExecution>;
  milestones: Milestone[];
  budget: Budget;
  metrics: ProjectMetrics;
  events: EventLogItem[];
  activeApprovalId: string | null;
  selectedPresetKey: string;
  dbEntities?: DbEntity[];
  testCases?: TestCase[];
}

