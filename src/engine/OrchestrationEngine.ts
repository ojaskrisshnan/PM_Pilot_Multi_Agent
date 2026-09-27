import type { AgentId, ExecutionSpeed, WorkflowStatus } from '../types/project';
import { ALL_17_AGENTS, AGENT_ORDER_LIST } from './AgentRoster';
import { ProjectStateStore } from './ProjectState';
import { HybridRouter } from './LLMProvider';

import { api } from '../api/client';

export class OrchestrationEngineService {
  private status: WorkflowStatus = 'Idle';
  private currentAgentIndex: number = -1;
  private speed: ExecutionSpeed = 1;
  private timer: any = null;
  private isProcessingStep: boolean = false;
  private isPolling: boolean = false;
  private activeBackendRunId: string | null = null;
  private listeners: Array<(event: { status: WorkflowStatus; currentAgentIndex: number; activeAgentId: AgentId | null; speed: ExecutionSpeed }) => void> = [];

  public getActiveRunId(): string | null {
    return this.activeBackendRunId;
  }

  public getStatus(): WorkflowStatus {
    return this.status;
  }

  public getCurrentAgentIndex(): number {
    return this.currentAgentIndex;
  }

  public getSpeed(): ExecutionSpeed {
    return this.speed;
  }

  public getActiveBackendRunId(): string | null {
    return this.activeBackendRunId;
  }

  public async loadProject(project: { id: string }): Promise<void> {
    if (this.timer) clearTimeout(this.timer);
    this.isProcessingStep = false;
    this.activeBackendRunId = null;

    try {
      const runs = await api.getProjectRuns(project.id);
      if (runs && runs.length > 0) {
        const latestRun = await api.getRun(runs[0].id);
        this.activeBackendRunId = latestRun.id;
        this.status = latestRun.status === 'COMPLETED' ? 'Completed' :
                      latestRun.status === 'RUNNING' ? 'Running' :
                      latestRun.status === 'PAUSED' ? 'Paused' :
                      latestRun.status === 'AWAITING_APPROVAL' ? 'Awaiting_Approval' :
                      latestRun.status === 'FAILED' ? 'Failed' : 'Idle';
        const completedCount = latestRun.executions?.filter(e => e.status === 'COMPLETED').length || 0;
        this.currentAgentIndex = completedCount;

        if (latestRun.status === 'AWAITING_APPROVAL') {
          const awaitingEx = latestRun.executions?.find(e => e.status === 'AWAITING_APPROVAL');
          if (awaitingEx) {
            const approvalId = `APP-${awaitingEx.agent_id}-${Date.now()}`;
            const currentState = ProjectStateStore.getState();
            const approvalRecord = {
              id: approvalId,
              agentId: awaitingEx.agent_id as AgentId,
              checkpointType: (awaitingEx.agent_id === 'ArchitectureAgent' ? 'Architecture' : 'Security') as any,
              title: `${awaitingEx.agent_name} Human-in-the-Loop Review`,
              status: 'Pending' as const,
              timestamp: new Date().toLocaleTimeString(),
              summary: awaitingEx.output?.summary || 'Deliverables generated and awaiting architectural approval.',
              recommendations: awaitingEx.output?.recommendations || ['Review architectural decision record (ADR)'],
              identifiedRisks: awaitingEx.output?.findings || ['System boundary compliance'],
              affectedArtifacts: awaitingEx.output?.deliverables?.map((d: any) => d.title) || ['Specification']
            };
            currentState.approvals = [approvalRecord, ...currentState.approvals.filter(a => a.id !== approvalId)];
            currentState.activeApprovalId = approvalId;
            ProjectStateStore.updateWorkflowStatus('Awaiting_Approval');
          }
        }

        if (latestRun.status === 'RUNNING' || latestRun.status === 'AWAITING_APPROVAL') {
          this.pollBackendRun(latestRun.id, project.id);
        }
      } else {
        this.status = 'Idle';
        this.currentAgentIndex = -1;
      }
    } catch {
      this.status = 'Idle';
      this.currentAgentIndex = -1;
    }
    this.notify();
  }

  public subscribe(listener: (event: { status: WorkflowStatus; currentAgentIndex: number; activeAgentId: AgentId | null; speed: ExecutionSpeed }) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const activeAgentId = this.currentAgentIndex >= 0 && this.currentAgentIndex < AGENT_ORDER_LIST.length
      ? AGENT_ORDER_LIST[this.currentAgentIndex]
      : null;

    this.listeners.forEach(l =>
      l({
        status: this.status,
        currentAgentIndex: this.currentAgentIndex,
        activeAgentId,
        speed: this.speed
      })
    );
  }

  public setSpeed(multiplier: ExecutionSpeed): void {
    this.speed = multiplier;
    this.notify();
  }

  private getDelayMs(): number {
    if (this.speed === 'instant') return 0;
    const base = 1200;
    return Math.round(base / (this.speed as number));
  }

  /**
   * Start or resume orchestration
   */
  public async start(options?: { autoApprove?: boolean }): Promise<void> {
    if (this.status === 'Paused') {
      return await this.resume();
    }
    if (this.status === 'Running') return;

    this.currentAgentIndex = 0;
    this.activeBackendRunId = null;
    this.status = 'Running';
    ProjectStateStore.updateWorkflowStatus('Running');
    this.notify();

    // Try executing through real FastAPI backend
    try {
      const health = await api.getHealth();
      if (health && health.status === 'healthy') {
        const backendOk = await this.runBackendWorkflow(options?.autoApprove ?? false);
        if (backendOk) return;
      }
    } catch {
      // Backend not running, use deterministic client engine
    }

    await this.runLoop();
  }

  private async pollBackendRun(runId: string, backendProjectId: string): Promise<boolean> {
    if (this.isPolling) return true;
    this.isPolling = true;
    const currentState = ProjectStateStore.getState();

    try {
      while (this.status === 'Running' || this.status === 'Awaiting_Approval') {
        try {
          const runDetail = await api.getRun(runId);

          if (runDetail.status === 'PAUSED') {
            this.status = 'Paused';
            ProjectStateStore.updateWorkflowStatus('Paused');
            this.notify();
            return true;
          }

          if (runDetail.executions && runDetail.executions.length > 0) {
            let runningIdx = -1;
            let completedCount = 0;

            for (let i = 0; i < runDetail.executions.length; i++) {
              const ex = runDetail.executions[i];
              const mappedState = ex.status === 'COMPLETED' ? 'Completed' :
                                 ex.status === 'RUNNING' ? 'Running' :
                                 ex.status === 'AWAITING_APPROVAL' ? 'AwaitingApproval' :
                                 ex.status === 'FAILED' ? 'Failed' : 'Idle';

              ProjectStateStore.updateAgentExecution(ex.agent_id as AgentId, {
                agentId: ex.agent_id as AgentId,
                state: mappedState as any,
                startTime: ex.started_at ? new Date(ex.started_at).toLocaleTimeString() : undefined,
                endTime: ex.completed_at ? new Date(ex.completed_at).toLocaleTimeString() : undefined,
                durationMs: ex.execution_time_ms,
                outputSummary: ex.output?.summary || ''
              });

              if (ex.status === 'RUNNING') runningIdx = i;
              if (ex.status === 'COMPLETED') completedCount++;
            }

            if (runningIdx !== -1) {
              this.currentAgentIndex = runningIdx;
            } else if (completedCount < 17) {
              this.currentAgentIndex = completedCount;
            }
            this.notify();
          }

          // Fetch deliverables in real-time as agents complete stages
          try {
            const deliverables = await api.getDeliverables(backendProjectId);
            if (deliverables.length > 0) {
              currentState.artifacts = deliverables.map(d => ({
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
            // ignore
          }

          // Handle HITL Checkpoint gate
          if (runDetail.status === 'AWAITING_APPROVAL') {
            this.status = 'Awaiting_Approval';
            ProjectStateStore.updateWorkflowStatus('Awaiting_Approval');

            const awaitingEx = runDetail.executions?.find(e => e.status === 'AWAITING_APPROVAL');
            if (awaitingEx) {
              const approvalId = `APP-${awaitingEx.agent_id}-${Date.now()}`;
              const approvalRecord = {
                id: approvalId,
                agentId: awaitingEx.agent_id as AgentId,
                checkpointType: (awaitingEx.agent_id === 'ArchitectureAgent' ? 'Architecture' : 'Security') as any,
                title: `${awaitingEx.agent_name} Human-in-the-Loop Review`,
                status: 'Pending' as const,
                timestamp: new Date().toLocaleTimeString(),
                summary: awaitingEx.output?.summary || 'Deliverables generated and awaiting architectural approval.',
                recommendations: awaitingEx.output?.recommendations || ['Review architectural decision record (ADR)'],
                identifiedRisks: awaitingEx.output?.findings || ['System boundary compliance'],
                affectedArtifacts: awaitingEx.output?.deliverables?.map((d: any) => d.title) || ['Specification']
              };
              currentState.approvals = [approvalRecord, ...currentState.approvals.filter(a => a.id !== approvalId)];
              currentState.activeApprovalId = approvalId;
              ProjectStateStore.updateWorkflowStatus('Awaiting_Approval');
            }
            this.notify();

            while (this.status === 'Awaiting_Approval') {
              await new Promise(r => setTimeout(r, 600));
            }
            if (this.status !== 'Running') return true;
          }

          if (runDetail.status === 'COMPLETED' || runDetail.status === 'FAILED' || runDetail.status === 'CANCELLED') {
            this.status = runDetail.status === 'COMPLETED' ? 'Completed' : 'Failed';
            this.currentAgentIndex = AGENT_ORDER_LIST.length;
            ProjectStateStore.updateWorkflowStatus(this.status);

            ProjectStateStore.recordEvent({
              id: `EVT-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              type: runDetail.status === 'COMPLETED' ? 'WorkflowCompleted' : 'SystemNotice',
              title: runDetail.status === 'COMPLETED' ? '17-Agent Execution Completed' : 'Run Failed',
              detail: runDetail.error_message || `Run ${runId} finished with ${runDetail.successful_agents}/${runDetail.total_agents} agents successful.`
            });

            this.notify();
            return true;
          }

          const delay = this.getDelayMs();
          await new Promise(r => setTimeout(r, Math.max(350, delay)));
        } catch (err) {
          console.error('Error polling backend run:', err);
          break;
        }
      }
    } finally {
      this.isPolling = false;
    }
    return true;
  }

  private async runBackendWorkflow(autoApprove: boolean = false): Promise<boolean> {
    try {
      const currentState = ProjectStateStore.getState();
      let backendProjectId = currentState.project.id;

      try {
        const projects = await api.getProjects();
        const exists = projects.find(p => p.id === backendProjectId);
        if (!exists) {
          const matchByName = projects.find(p => p.name.trim().toLowerCase() === currentState.project.name.trim().toLowerCase());
          if (matchByName) {
            backendProjectId = matchByName.id;
            currentState.project.id = matchByName.id;
          } else {
            const created = await api.createProject({
              name: currentState.project.name,
              description: currentState.project.description,
              domain: currentState.project.domain,
              config: { domain: currentState.project.domain }
            });
            backendProjectId = created.id;
            currentState.project.id = created.id;
          }
        }
      } catch {
        // fallback
      }

      // Dynamically resolve provider: prioritize backend's verified active provider (e.g. Gemini)
      let chosenProvider = 'gemini';
      let chosenModel = 'gemini-3.1-flash-lite';
      try {
        const settingsRes = await fetch('/api/settings/llm').then(r => r.json());
        if (settingsRes?.active_default) {
          const act = settingsRes.active_default;
          const provInfo = settingsRes.providers?.[act];
          if (provInfo?.success) {
            chosenProvider = act;
            chosenModel = act === 'gemini' ? 'gemini-3.1-flash-lite' : 'deterministic-mock';
          } else if (settingsRes.providers?.gemini?.success) {
            chosenProvider = 'gemini';
            chosenModel = 'gemini-3.1-flash-lite';
          } else {
            chosenProvider = 'mock';
            chosenModel = 'deterministic-mock';
          }
        }
      } catch {
        chosenProvider = 'gemini';
        chosenModel = 'gemini-3.1-flash-lite';
      }

      const run = await api.createRun(backendProjectId, {
        provider: chosenProvider,
        model: chosenModel,
        input_prompt_override: currentState.project.description,
        auto_approve: autoApprove
      });
      this.activeBackendRunId = run.id;

      return await this.pollBackendRun(run.id, backendProjectId);
    } catch {
      return false;
    }
  }

  public async pause(): Promise<void> {
    if (this.status !== 'Running') return;
    this.status = 'Paused';
    if (this.timer) clearTimeout(this.timer);

    if (this.activeBackendRunId) {
      try {
        await api.pauseRun(this.activeBackendRunId);
      } catch (e) {
        console.warn('Backend pause failed:', e);
      }
    }

    ProjectStateStore.updateWorkflowStatus('Paused');
    this.notify();
  }

  public async resume(): Promise<void> {
    if (this.status !== 'Paused' && this.status !== 'Failed') return;
    this.status = 'Running';
    ProjectStateStore.updateWorkflowStatus('Running');
    this.notify();

    if (this.activeBackendRunId) {
      try {
        await api.resumeRun(this.activeBackendRunId);
        const currentState = ProjectStateStore.getState();
        const backendProjectId = currentState.project.id;
        await this.pollBackendRun(this.activeBackendRunId, backendProjectId);
        return;
      } catch (e) {
        console.warn('Backend resume error:', e);
      }
    }

    await this.runLoop();
  }

  public reset(): void {
    this.status = 'Idle';
    if (this.timer) clearTimeout(this.timer);
    this.currentAgentIndex = -1;
    this.isProcessingStep = false;
    this.activeBackendRunId = null;

    const currentState = ProjectStateStore.getState();
    AGENT_ORDER_LIST.forEach(id => {
      currentState.agentExecutions[id] = {
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
    currentState.approvals = [];
    currentState.activeApprovalId = null;
    ProjectStateStore.updateWorkflowStatus('Idle');
    this.notify();
  }

  /**
   * Advance one single agent step (ideal for step-by-step presentation demo)
   */
  public async stepForward(): Promise<void> {
    if (this.isProcessingStep || this.status === 'Awaiting_Approval') return;

    if (this.currentAgentIndex === -1) {
      this.currentAgentIndex = 0;
    }

    if (this.currentAgentIndex >= AGENT_ORDER_LIST.length) {
      this.status = 'Completed';
      ProjectStateStore.updateWorkflowStatus('Completed');
      this.notify();
      return;
    }

    await this.executeAgentStep(this.currentAgentIndex);

    if ((this.status as WorkflowStatus) !== 'Awaiting_Approval') {
      this.currentAgentIndex++;
      if (this.currentAgentIndex >= AGENT_ORDER_LIST.length) {
        this.status = 'Completed';
        ProjectStateStore.updateWorkflowStatus('Completed');
      }
    }
    this.notify();
  }

  /**
   * Continuous execution loop respecting speed, checkpoints, and dependencies
   */
  private async runLoop(): Promise<void> {
    while (this.status === 'Running' && this.currentAgentIndex < AGENT_ORDER_LIST.length) {
      const success = await this.executeAgentStep(this.currentAgentIndex);
      if (!success) {
        // Paused or awaiting approval
        break;
      }

      this.currentAgentIndex++;

      if (this.currentAgentIndex >= AGENT_ORDER_LIST.length) {
        this.status = 'Completed';
        ProjectStateStore.updateWorkflowStatus('Completed');
        ProjectStateStore.recordEvent({
          id: `EVT-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'WorkflowCompleted',
          title: 'All 17 Agents Completed Execution',
          detail: 'Master SDLC orchestration completed. All technical deliverables, tests, and security audits synthesized.'
        });
        this.notify();
        break;
      }

      const delay = this.getDelayMs();
      if (delay > 0) {
        await new Promise(resolve => {
          this.timer = setTimeout(resolve, delay);
        });
      }
    }
  }

  /**
   * Executes a specific agent step with LLM query or fallback
   */
  private async executeAgentStep(stepIndex: number): Promise<boolean> {
    if (stepIndex < 0 || stepIndex >= AGENT_ORDER_LIST.length) return false;

    this.isProcessingStep = true;
    const agentId = AGENT_ORDER_LIST[stepIndex];
    const def = ALL_17_AGENTS[agentId];
    const currentState = ProjectStateStore.getState();

    // Mark agent as running
    ProjectStateStore.updateAgentExecution(agentId, {
      state: 'Running',
      startTime: new Date().toLocaleTimeString()
    });

    ProjectStateStore.recordEvent({
      id: `EVT-${Date.now()}-${stepIndex}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'AgentStarted',
      agentId,
      title: `${def.name} Dispatched`,
      detail: `Started phase ${def.phaseOrder}: ${def.role}`
    });

    this.notify();

    // Query LLM Provider or Mock fallback
    try {
      const prompt = `Project: ${currentState.project.name}\nDomain: ${currentState.project.domain}\nTask: Formulate deliverables for ${def.role}`;
      const llmResult = await HybridRouter.query({
        agentId,
        systemPrompt: def.systemPrompt,
        userPrompt: prompt
      });

      // Record tool call
      const toolCall = llmResult.toolCalls?.[0] || {
        tool: def.tools[0] || 'execute_domain_sop',
        args: { agent: agentId, status: 'VERIFIED' },
        result: { status: 'SUCCESS', verifiedAt: new Date().toISOString() }
      };

      ProjectStateStore.updateAgentExecution(agentId, {
        state: 'Completed',
        endTime: new Date().toLocaleTimeString(),
        durationMs: llmResult.latencyMs,
        outputSummary: llmResult.content,
        toolCalls: [
          {
            tool: toolCall.tool,
            args: toolCall.args,
            result: toolCall.result,
            timestamp: new Date().toLocaleTimeString()
          }
        ]
      });

      ProjectStateStore.recordEvent({
        id: `EVT-${Date.now()}-${stepIndex}-done`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'AgentCompleted',
        agentId,
        title: `${def.name} Completed Phase`,
        detail: `Synthesized outputs via ${llmResult.provider.toUpperCase()} (${llmResult.latencyMs}ms, ${llmResult.tokensUsed} tokens)`
      });

      // Check for human-in-the-loop checkpoint!
      if (def.approvalRequired) {
        const approval = currentState.approvals.find(a => a.agentId === agentId && a.status === 'Pending');
        if (approval) {
          this.status = 'Awaiting_Approval';
          ProjectStateStore.updateWorkflowStatus('Awaiting_Approval');
          ProjectStateStore.setActiveApproval(approval.id);
          ProjectStateStore.recordEvent({
            id: `EVT-${Date.now()}-app-req`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'ApprovalRequested',
            agentId,
            title: `Human Approval Required: ${approval.checkpointType}`,
            detail: `Workflow paused for Project Manager sign-off on ${def.name} deliverables.`
          });
          this.isProcessingStep = false;
          this.notify();
          return false; // Stop loop until approved
        }
      }

      this.isProcessingStep = false;
      return true;
    } catch (err: any) {
      ProjectStateStore.updateAgentExecution(agentId, {
        state: 'Failed',
        error: err.message
      });
      this.isProcessingStep = false;
      return false;
    }
  }

  /**
   * Approves active checkpoint and resumes workflow
   */
  public async approveCheckpoint(approvalId: string, humanNote?: string): Promise<void> {
    ProjectStateStore.recordApprovalDecision(approvalId, 'Approved', humanNote);
    if (this.activeBackendRunId) {
      try {
        await api.approveCheckpoint(this.activeBackendRunId, humanNote);
      } catch (e) {
        console.error("Backend approval failed:", e);
      }
    }
    if (this.status === 'Awaiting_Approval') {
      this.status = 'Running';
      ProjectStateStore.updateWorkflowStatus('Running');
      this.notify();
      if (!this.activeBackendRunId) {
        this.runLoop();
      } else {
        const currentState = ProjectStateStore.getState();
        this.pollBackendRun(this.activeBackendRunId, currentState.project.id);
      }
    }
  }

  /**
   * Rejects checkpoint or requests re-evaluation
   */
  public async rejectCheckpoint(approvalId: string, humanNote?: string): Promise<void> {
    ProjectStateStore.recordApprovalDecision(approvalId, 'Rejected', humanNote);
    if (this.activeBackendRunId) {
      try {
        await api.rejectCheckpoint(this.activeBackendRunId, humanNote);
      } catch (e) {
        console.error("Backend rejection failed:", e);
      }
    }
    this.status = 'Paused';
    ProjectStateStore.updateWorkflowStatus('Paused');
    this.notify();
  }
}

export const OrchestrationEngine = new OrchestrationEngineService();
