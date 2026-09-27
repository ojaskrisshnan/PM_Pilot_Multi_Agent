import type {
  ProjectState,
  Project,
  UserStory,
  Risk,
  Approval,
  AgentId,
  AgentExecution,
  EventLogItem,
  FinancialParams,
  Budget,
  ProjectMetrics,
  RequirementChangeImpact,
  WorkflowStatus
} from '../types/project';
import { ALL_17_AGENTS, AGENT_ORDER_LIST } from './AgentRoster';
import { DOMAIN_PRESETS, generateCustomProjectFromPrompt, type DomainPresetData } from './DomainPresets';
import { api } from '../api/client';

export class ProjectStateManager {
  private state: ProjectState;
  private listeners: Array<(state: ProjectState) => void> = [];
  private lastCustomPrompt: string = '';

  constructor() {
    this.state = this.createInitialState('event_management');
  }

  public getState(): ProjectState {
    return this.state;
  }

  public updateProjectDetails(details: { id: string; name: string; domain: string; description?: string }): void {
    this.state.project.id = details.id;
    this.state.project.name = details.name;
    this.state.project.domain = details.domain;
    if (details.description !== undefined) {
      this.state.project.description = details.description;
    }
    this.notify();
  }

  public async loadProject(project: { id: string; name: string; domain: string; description?: string }): Promise<void> {
    this.state.project.id = project.id;
    this.state.project.name = project.name;
    this.state.project.domain = project.domain;
    this.state.project.description = project.description || '';
    this.state.project.status = 'Idle';
    this.state.activeApprovalId = null;

    // Reset all 17 agent executions to Idle
    AGENT_ORDER_LIST.forEach(id => {
      this.state.agentExecutions[id] = {
        agentId: id,
        state: 'Idle',
        assignedTasks: [],
        generatedArtifactIds: [],
        toolCalls: [],
        outputSummary: '',
        durationMs: undefined,
        startTime: undefined,
        endTime: undefined
      };
    });

    // Reset artifacts
    this.state.artifacts = [];

    // Reset events
    this.state.events = [
      {
        id: `EVT-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'ProjectCreated',
        title: 'Project Opened',
        detail: `Opened project "${project.name}" (${project.domain}).`
      }
    ];

    try {
      // 1. Fetch deliverables for this specific project
      const deliverables = await api.getDeliverables(project.id);
      if (deliverables && deliverables.length > 0) {
        this.state.artifacts = deliverables.map(d => ({
          id: d.id,
          name: d.title,
          filename: d.title,
          category: 'Architecture',
          language: d.type === 'code' ? 'typescript' : 'markdown',
          content: d.content,
          generatingAgent: d.agent_id as any,
          version: 1,
          lastUpdated: new Date(d.created_at).toLocaleDateString()
        }));
      }

      // 2. Fetch runs for this specific project
      const runs = await api.getProjectRuns(project.id);
      if (runs && runs.length > 0) {
        const latestRun = await api.getRun(runs[0].id);
        const mappedStatus = latestRun.status === 'COMPLETED' ? 'Completed' :
                             latestRun.status === 'RUNNING' ? 'Running' :
                             latestRun.status === 'PAUSED' ? 'Paused' :
                             latestRun.status === 'AWAITING_APPROVAL' ? 'Awaiting_Approval' :
                             latestRun.status === 'FAILED' ? 'Failed' : 'Idle';
        this.state.project.status = mappedStatus;

        if (latestRun.executions && latestRun.executions.length > 0) {
          latestRun.executions.forEach(e => {
            const exState = e.status === 'COMPLETED' ? 'Completed' :
                            e.status === 'RUNNING' ? 'Running' :
                            e.status === 'AWAITING_APPROVAL' ? 'AwaitingApproval' :
                            e.status === 'FAILED' ? 'Failed' : 'Idle';
            this.state.agentExecutions[e.agent_id as AgentId] = {
              agentId: e.agent_id as AgentId,
              state: exState as any,
              startTime: e.started_at ? new Date(e.started_at).toLocaleTimeString() : undefined,
              endTime: e.completed_at ? new Date(e.completed_at).toLocaleTimeString() : undefined,
              durationMs: e.execution_time_ms,
              assignedTasks: [],
              generatedArtifactIds: [],
              toolCalls: [],
              outputSummary: e.output?.summary || ''
            };
          });
        }
      }
    } catch (e) {
      console.warn('Error loading project details from backend:', e);
    }

    this.state.metrics = this.computeMetrics(this.state);
    this.notify();
  }

  public subscribe(listener: (state: ProjectState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.state));
  }

  /**
   * Deterministically calculates budget metrics from financial parameters
   */
  public calculateBudget(params: FinancialParams, criticalPathDays: number = 28): Budget {
    const months = Math.max(1.5, Math.round((criticalPathDays / 20) * 10) / 10);
    const engineeringCost = Math.round(params.teamSize * params.blendedHourlyRate * 160 * months);

    let cloudMonthlyCost = 1850;
    if (params.cloudTier === 'Starter') cloudMonthlyCost = 450;
    if (params.cloudTier === 'Growth') cloudMonthlyCost = 1850;
    if (params.cloudTier === 'High-Concurrency') cloudMonthlyCost = 4200;

    const cloudTotalCost = Math.round(cloudMonthlyCost * Math.max(3, months));
    const qaTestingCost = Math.round(engineeringCost * 0.18);
    const securityComplianceCost = Math.round(engineeringCost * 0.14);

    const subtotal = engineeringCost + cloudTotalCost + qaTestingCost + securityComplianceCost;
    const contingencyCost = Math.round(subtotal * (params.contingencyPercent / 100));
    const totalMvpBudget = subtotal + contingencyCost;

    const monthlyRunRate = cloudMonthlyCost + Math.round(engineeringCost / (months * 3));
    // Deterministic benefit model derived from software automation ROI
    const annualBenefit = Math.round(totalMvpBudget * 2.1);
    const threeYearGross = annualBenefit * 3;
    const threeYearRoi = Math.round(((threeYearGross - totalMvpBudget) / totalMvpBudget) * 100);
    const breakEvenMonths = Math.max(3, Math.round((totalMvpBudget / (annualBenefit / 12))));

    const breakdown = [
      { category: 'Core Engineering', amount: engineeringCost, percentage: Math.round((engineeringCost / totalMvpBudget) * 100) },
      { category: 'Cloud Infrastructure', amount: cloudTotalCost, percentage: Math.round((cloudTotalCost / totalMvpBudget) * 100) },
      { category: 'QA Automation', amount: qaTestingCost, percentage: Math.round((qaTestingCost / totalMvpBudget) * 100) },
      { category: 'Security & Compliance', amount: securityComplianceCost, percentage: Math.round((securityComplianceCost / totalMvpBudget) * 100) },
      { category: 'Contingency Buffer', amount: contingencyCost, percentage: Math.round((contingencyCost / totalMvpBudget) * 100) }
    ];

    return {
      params,
      engineeringCost,
      cloudMonthlyCost,
      qaTestingCost,
      securityComplianceCost,
      contingencyCost,
      totalMvpBudget,
      monthlyRunRate,
      annualBenefit,
      threeYearRoi,
      breakEvenMonths,
      breakdown
    };
  }

  /**
   * Deterministically calculates critical path from agent dependency graph
   */
  public calculateCriticalPath(): { criticalPathDays: number; totalEstimatedDays: number } {
    let totalEstimatedDays = 0;
    // Walk dependency graph to find the longest chain
    const durationMap: Record<AgentId, number> = {} as any;
    AGENT_ORDER_LIST.forEach(id => {
      const def = ALL_17_AGENTS[id];
      const days = def.typicalDurationDays;
      totalEstimatedDays += days;

      let maxParent = 0;
      def.dependencies.forEach(pId => {
        if (durationMap[pId] && durationMap[pId] > maxParent) {
          maxParent = durationMap[pId];
        }
      });
      durationMap[id] = maxParent + days;
    });

    const criticalPathDays = Math.max(...Object.values(durationMap));
    return { criticalPathDays, totalEstimatedDays };
  }

  /**
   * Deterministically computes health metrics
   */
  public computeMetrics(state: ProjectState): ProjectMetrics {
    const totalAgentsCount = AGENT_ORDER_LIST.length;
    const completedAgentsCount = Object.values(state.agentExecutions).filter(
      e => e.state === 'Completed'
    ).length;

    const progressPercent = Math.round((completedAgentsCount / totalAgentsCount) * 100);

    const openRisks = state.risks.filter(r => r.status === 'Open');
    const pendingApprovals = state.approvals.filter(a => a.status === 'Pending');

    const { criticalPathDays, totalEstimatedDays } = this.calculateCriticalPath();

    // Deterministic formula for health score:
    // Base 100 - open risk penalties - unaddressed approvals + completed agent points
    let healthScore = 85 + Math.round((completedAgentsCount / totalAgentsCount) * 15);
    const criticalRisks = state.risks.filter(r => r.level === 'Critical' && r.status === 'Open');
    healthScore -= criticalRisks.length * 4;
    healthScore = Math.max(60, Math.min(100, healthScore));

    const securityAuditIndex = state.agentExecutions.SecurityAgent?.state === 'Completed' ? 96 : 88;
    const qualityScore = state.agentExecutions.QAAgent?.state === 'Completed' ? 98 : 90;

    let scheduleHealth: 'On Track' | 'Minor Delay' | 'At Risk' = 'On Track';
    if (criticalRisks.length > 1) scheduleHealth = 'At Risk';
    else if (pendingApprovals.length > 0) scheduleHealth = 'Minor Delay';

    return {
      healthScore,
      scheduleHealth,
      progressPercent,
      completedAgentsCount,
      totalAgentsCount,
      criticalPathDays,
      totalEstimatedDays,
      securityAuditIndex,
      qualityScore,
      openRisksCount: openRisks.length,
      pendingApprovalsCount: pendingApprovals.length
    };
  }

  /**
   * Create initial project state from a preset or custom prompt
   */
  public createInitialState(presetKey: string, customPromptText?: string): ProjectState {
    let preset: DomainPresetData;

    const effectivePrompt = customPromptText || (presetKey === 'custom' || presetKey.startsWith('custom_') ? this.lastCustomPrompt : undefined);

    if (effectivePrompt && effectivePrompt.trim()) {
      preset = generateCustomProjectFromPrompt(effectivePrompt);
    } else {
      preset = DOMAIN_PRESETS[presetKey] || DOMAIN_PRESETS.event_management;
    }

    const { criticalPathDays } = this.calculateCriticalPath();
    const budget = this.calculateBudget(preset.financialParams, criticalPathDays);

    const agentExecutions: Record<AgentId, AgentExecution> = {} as any;
    AGENT_ORDER_LIST.forEach(id => {
      agentExecutions[id] = {
        agentId: id,
        state: 'Idle',
        assignedTasks: [],
        generatedArtifactIds: [],
        toolCalls: []
      };
    });

    const project: Project = {
      id: `PROJ-${preset.key.toUpperCase().slice(0, 8)}`,
      name: preset.name,
      domain: preset.domain,
      description: preset.description,
      targetLaunch: preset.targetLaunch,
      scaleConstraints: preset.scaleConstraints,
      status: 'Idle',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    const approvals: Approval[] = [
      {
        id: 'APP-ARCH-01',
        checkpointType: 'Architecture',
        agentId: 'ArchitectureAgent',
        summary: 'Review and authorize distributed system architecture blueprint (ADR-001) before code synthesis.',
        recommendations: [
          'Validate atomic in-memory locking protocol against expected peak concurrency',
          'Confirm database partitioning schema accommodates projected annual growth'
        ],
        identifiedRisks: [
          'Contention during flash drops if in-memory keys are not partitioned evenly'
        ],
        affectedArtifacts: ['ADR-001-architecture.md'],
        status: 'Pending'
      },
      {
        id: 'APP-SEC-01',
        checkpointType: 'Security',
        agentId: 'SecurityAgent',
        summary: 'Verify STRIDE threat mitigations and regulatory audit compliance prior to deployment.',
        recommendations: [
          'Verify zero raw sensitive data (PII/PAN) touches application server logs',
          'Enforce dynamic cryptographic token rotation for entry tickets and sessions'
        ],
        identifiedRisks: [
          'Potential replay attack on gate scanner QR codes without dynamic TOTP'
        ],
        affectedArtifacts: ['stride_threat_model.json'],
        status: 'Pending'
      }
    ];

    const initialEvents: EventLogItem[] = [
      {
        id: `EVT-${Date.now()}-1`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'ProjectCreated',
        title: 'Project Initialized',
        detail: `Initialized project "${preset.name}" under domain: ${preset.domain}.`
      }
    ];

    const tempState: ProjectState = {
      project,
      requirements: preset.requirements,
      epics: preset.epics,
      stories: preset.stories,
      decisions: preset.decisions,
      risks: preset.risks,
      artifacts: preset.artifacts,
      approvals: preset.approvals && preset.approvals.length > 0 ? preset.approvals : approvals,
      agentExecutions,
      milestones: preset.milestones,
      budget,
      metrics: {
        healthScore: 97,
        scheduleHealth: 'On Track',
        progressPercent: 0,
        completedAgentsCount: 0,
        totalAgentsCount: 17,
        criticalPathDays,
        totalEstimatedDays: 42,
        securityAuditIndex: 96,
        qualityScore: 98,
        openRisksCount: preset.risks.filter(r => r.status === 'Open').length,
        pendingApprovalsCount: (preset.approvals || approvals).filter(a => a.status === 'Pending').length
      },
      events: initialEvents,
      activeApprovalId: null,
      selectedPresetKey: preset.key,
      dbEntities: preset.dbEntities,
      testCases: preset.testCases
    };

    tempState.metrics = this.computeMetrics(tempState);
    return tempState;
  }

  public switchPreset(presetKey: string, customPrompt?: string): void {
    if (customPrompt && customPrompt.trim()) {
      this.lastCustomPrompt = customPrompt.trim();
    }
    this.state = this.createInitialState(presetKey, customPrompt);
    this.recordEvent({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'ProjectCreated',
      title: 'Project Initialized',
      detail: `Synthesized new multi-agent project architecture: "${this.state.project.name}".`
    });
    this.notify();
  }

  public createCustomProject(promptText: string): void {
    this.switchPreset('custom', promptText);
  }

  public updateWorkflowStatus(status: WorkflowStatus): void {
    this.state.project.status = status;
    this.state.project.updatedAt = new Date().toISOString();
    this.state.metrics = this.computeMetrics(this.state);
    this.notify();
  }

  public updateAgentExecution(agentId: AgentId, partial: Partial<AgentExecution>): void {
    const current = this.state.agentExecutions[agentId] || {
      agentId,
      state: 'Idle',
      assignedTasks: [],
      generatedArtifactIds: [],
      toolCalls: []
    };
    this.state.agentExecutions[agentId] = { ...current, ...partial };
    this.state.metrics = this.computeMetrics(this.state);
    this.notify();
  }

  public recordEvent(event: EventLogItem): void {
    this.state.events = [event, ...this.state.events.slice(0, 99)];
    this.notify();
  }

  public recordApprovalDecision(approvalId: string, status: 'Approved' | 'Rejected', humanNote?: string): void {
    const approval = this.state.approvals.find(a => a.id === approvalId);
    if (!approval) return;

    approval.status = status;
    approval.humanNote = humanNote || '';
    approval.decidedAt = new Date().toISOString();

    if (this.state.activeApprovalId === approvalId) {
      this.state.activeApprovalId = null;
    }

    this.recordEvent({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: status === 'Approved' ? 'HumanApproved' : 'HumanRejected',
      agentId: approval.agentId,
      title: `${approval.checkpointType} Checkpoint ${status}`,
      detail: humanNote ? `PM Note: "${humanNote}"` : `Human supervisor signed off on ${approval.checkpointType} deliverables.`
    });

    this.state.metrics = this.computeMetrics(this.state);
    this.notify();
  }

  public setActiveApproval(approvalId: string | null): void {
    this.state.activeApprovalId = approvalId;
    this.notify();
  }

  public updateUserStoryStatus(storyId: string, newStatus: UserStory['status']): void {
    const story = this.state.stories.find(s => s.id === storyId);
    if (story) {
      story.status = newStatus;
      this.recordEvent({
        id: `EVT-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'SystemNotice',
        agentId: story.assignee,
        title: 'Story Status Updated',
        detail: `Moved "${story.title}" to ${newStatus.replace('_', ' ')}.`
      });
      this.notify();
    }
  }

  public addOrUpdateRisk(risk: Risk): void {
    const existingIdx = this.state.risks.findIndex(r => r.id === risk.id);
    risk.score = risk.probability * risk.impact;
    if (risk.score >= 15) risk.level = 'Critical';
    else if (risk.score >= 10) risk.level = 'High';
    else if (risk.score >= 6) risk.level = 'Medium';
    else risk.level = 'Low';

    if (existingIdx >= 0) {
      this.state.risks[existingIdx] = risk;
    } else {
      this.state.risks.push(risk);
    }

    this.state.metrics = this.computeMetrics(this.state);
    this.notify();
  }

  public updateFinancialParams(newParams: Partial<FinancialParams>): void {
    const updated = { ...this.state.budget.params, ...newParams };
    this.state.budget = this.calculateBudget(updated, this.state.metrics.criticalPathDays);
    this.notify();
  }

  /**
   * REQUIREMENT CHANGE & IMPACT ANALYSIS
   * Formulates affected agents, risks, budget delta, and timeline delta
   */
  public analyzeRequirementImpact(requirementId: string, newMetricValue: string): RequirementChangeImpact {
    const req = this.state.requirements.find(r => r.id === requirementId);
    const oldValue = req?.metricValue || 'Default';

    // Parse scale jump
    const isHigherScale = /50,000|100,000|10x|ultra/i.test(newMetricValue) ||
      (parseInt(newMetricValue) > parseInt(oldValue));

    const affectedAgents: AgentId[] = [
      'ArchitectureAgent',
      'BackendAgent',
      'QAAgent',
      'DevOpsAgent',
      'FinanceAgent',
      'RiskAgent'
    ];

    const affectedArtifactIds = [
      'ART-EVT-ADR',
      'ART-EVT-BACKEND',
      'ART-EVT-DEVOPS',
      'ART-EVT-QA'
    ];

    const affectedRisks = this.state.risks.filter(r => r.category === 'Technical' || r.category === 'Financial');

    const estimatedBudgetImpact = isHigherScale ? 12400 : 3500;
    const estimatedTimelineImpactDays = isHigherScale ? 6 : 2;

    return {
      requirementId,
      oldValue,
      newValue: newMetricValue,
      affectedAgents,
      affectedRisks,
      affectedArtifactIds,
      estimatedBudgetImpact,
      estimatedTimelineImpactDays,
      summary: `Changing requirement to "${newMetricValue}" impacts ${affectedAgents.length} domain agents, increases infrastructure requirements by +$${estimatedBudgetImpact.toLocaleString()}, and shifts critical path by +${estimatedTimelineImpactDays} days.`
    };
  }

  public applyRequirementChange(impact: RequirementChangeImpact): void {
    const req = this.state.requirements.find(r => r.id === impact.requirementId);
    if (req) {
      req.metricValue = impact.newValue;
      req.description += ` [Updated: Scale adjusted to ${impact.newValue}]`;
    }

    // Adjust budget and critical path
    this.state.budget.totalMvpBudget += impact.estimatedBudgetImpact;
    this.state.budget.engineeringCost += Math.round(impact.estimatedBudgetImpact * 0.7);
    this.state.budget.cloudMonthlyCost += Math.round(impact.estimatedBudgetImpact * 0.05);

    // Reset affected agents to 'Queued' so they can be re-evaluated
    impact.affectedAgents.forEach(agentId => {
      this.updateAgentExecution(agentId, {
        state: 'Queued',
        outputSummary: `Re-evaluation queued due to requirement scale change: ${impact.newValue}`
      });
    });

    this.recordEvent({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'RequirementChanged',
      title: 'Requirement Updated & Impact Applied',
      detail: impact.summary
    });

    this.state.metrics = this.computeMetrics(this.state);
    this.notify();
  }

  public async initFromBackend(): Promise<void> {
    try {
      const projects = await api.getProjects();
      if (projects && projects.length > 0) {
        const p = projects[0];
        this.state.project.id = p.id;
        this.state.project.name = p.name;
        if (p.description) this.state.project.description = p.description;
        if (p.domain) this.state.project.domain = p.domain;

        // Load persisted deliverables
        try {
          const deliverables = await api.getDeliverables(p.id);
          if (deliverables && deliverables.length > 0) {
            this.state.artifacts = deliverables.map(d => ({
              id: d.id,
              name: d.title,
              filename: d.title,
              category: 'Architecture',
              language: d.type === 'code' ? 'typescript' : 'markdown',
              content: d.content,
              generatingAgent: d.agent_id as any,
              version: 1,
              lastUpdated: new Date(d.created_at).toLocaleDateString()
            }));
          }
        } catch {
          // ignore deliverable fetch error
        }

        // Load latest run if exists
        try {
          const runs = await api.getProjectRuns(p.id);
          if (runs && runs.length > 0) {
            const latestRun = await api.getRun(runs[0].id);
            if (latestRun.executions && latestRun.executions.length > 0) {
              latestRun.executions.forEach(e => {
                const mappedState = e.status === 'COMPLETED' ? 'Completed' :
                                   e.status === 'RUNNING' ? 'Running' :
                                   e.status === 'FAILED' ? 'Failed' : 'Idle';
                this.state.agentExecutions[e.agent_id as AgentId] = {
                  agentId: e.agent_id as AgentId,
                  state: mappedState as any,
                  startTime: e.started_at ? new Date(e.started_at).toLocaleTimeString() : undefined,
                  endTime: e.completed_at ? new Date(e.completed_at).toLocaleTimeString() : undefined,
                  durationMs: e.execution_time_ms,
                  assignedTasks: [],
                  generatedArtifactIds: [],
                  toolCalls: [],
                  outputSummary: e.output?.summary || ''
                };
              });
            }
          }
        } catch {
          // ignore run fetch error
        }

        this.notify();
      }
    } catch {
      // Backend not running yet or guest offline mode, keep initial state
    }
  }
}

export const ProjectStateStore = new ProjectStateManager();
