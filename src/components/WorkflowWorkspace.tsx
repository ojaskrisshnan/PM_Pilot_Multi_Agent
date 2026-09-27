import React, { useState, useEffect } from 'react';
import { api, type ProjectDto, type DeliverableDto, type RunDto } from '../api/client';
import { OrchestrationEngine } from '../engine/OrchestrationEngine';
import { ProjectStateStore } from '../engine/ProjectState';
import { AGENT_ORDER_LIST, ALL_17_AGENTS } from '../engine/AgentRoster';
import type { AgentId, WorkflowStatus } from '../types/project';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  StepForward,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Copy,
  Check,
  Layers,
  ShieldCheck,
  FileDown,
  Printer,
  Eye,
  X,
  FileText
} from 'lucide-react';

interface WorkflowWorkspaceProps {
  project: ProjectDto;
  onBackToProjects: () => void;
}

export const WorkflowWorkspace: React.FC<WorkflowWorkspaceProps> = ({
  project,
  onBackToProjects
}) => {
  const [status, setStatus] = useState<WorkflowStatus>(OrchestrationEngine.getStatus());
  const [activeAgentIndex, setActiveAgentIndex] = useState<number>(OrchestrationEngine.getCurrentAgentIndex());
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>(AGENT_ORDER_LIST[0]);
  const [deliverables, setDeliverables] = useState<DeliverableDto[]>([]);
  const [runs, setRuns] = useState<RunDto[]>([]);
  const [activeApproval, setActiveApproval] = useState<any | null>(null);
  const [autoApprove, setAutoApprove] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [storeState, setStoreState] = useState(ProjectStateStore.getState());

  // Subscribe to engine state & load project
  useEffect(() => {
    let isCancelled = false;

    const refreshDeliverables = () => {
      api.getDeliverables(project.id).then(d => {
        if (!isCancelled) setDeliverables(d);
      }).catch(() => {});
      api.getProjectRuns(project.id).then(r => {
        if (!isCancelled) setRuns(r);
      }).catch(() => {});
    };

    const initProject = async () => {
      // Load and reset project in state store and engine
      await ProjectStateStore.loadProject(project);
      await OrchestrationEngine.loadProject(project);

      if (!isCancelled) {
        setStoreState({ ...ProjectStateStore.getState() });
        setStatus(OrchestrationEngine.getStatus());
        setActiveAgentIndex(OrchestrationEngine.getCurrentAgentIndex());
        refreshDeliverables();
      }
    };

    initProject();

    const unsubscribe = OrchestrationEngine.subscribe(({ currentAgentIndex, activeAgentId }) => {
      setStatus(OrchestrationEngine.getStatus());
      setActiveAgentIndex(currentAgentIndex);
      if (activeAgentId) {
        setSelectedAgentId(activeAgentId);
      }
      refreshDeliverables();
    });

    const unsubscribeStore = ProjectStateStore.subscribe((state) => {
      setStoreState({ ...state });
      setStatus(state.project.status);
      if (state.activeApprovalId) {
        const app = state.approvals.find(a => a.id === state.activeApprovalId);
        setActiveApproval(app || null);
      } else {
        setActiveApproval(null);
      }
      refreshDeliverables();
    });

    return () => {
      isCancelled = true;
      unsubscribe();
      unsubscribeStore();
    };
  }, [project]);

  const handleStartResume = () => {
    if (status === 'Paused') {
      OrchestrationEngine.resume();
    } else if (status === 'Awaiting_Approval' && activeApproval) {
      handleApprove();
    } else {
      OrchestrationEngine.start({ autoApprove });
    }
  };

  const handlePause = () => {
    OrchestrationEngine.pause();
  };

  const handleStep = () => {
    OrchestrationEngine.stepForward();
  };

  const handleReset = () => {
    OrchestrationEngine.reset();
    setStatus('Idle');
    setActiveAgentIndex(-1);
  };

  const handleApprove = async () => {
    if (!activeApproval) return;
    await OrchestrationEngine.approveCheckpoint(activeApproval.id, 'Approved by Human Project Manager');
    setActiveApproval(null);
  };

  const handleReject = async () => {
    if (!activeApproval) return;
    await OrchestrationEngine.rejectCheckpoint(activeApproval.id, 'Rejected by Human Project Manager');
    setActiveApproval(null);
  };

  const handleExport = async (format: 'docx' | 'markdown' | 'html' | 'json' | 'csv') => {
    const runId = OrchestrationEngine.getActiveBackendRunId() || (runs[0] ? runs[0].id : null);
    if (!runId) {
      alert('No active or previous run available to export. Please start a workflow execution first.');
      return;
    }

    setExporting(true);
    try {
      const blob = await api.exportRunBlob(runId, format);
      const ext = format === 'markdown' ? 'md' : format;
      const url = URL.createObjectURL(blob);
      const safeTitle = project.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const a = document.createElement('a');
      a.href = url;
      a.download = `PMPilot_${safeTitle}_Stage_Report.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const handleOpenPreview = async () => {
    const runId = OrchestrationEngine.getActiveBackendRunId() || (runs[0] ? runs[0].id : null);
    if (!runId) {
      alert('No execution run available to preview yet. Run the workflow first.');
      return;
    }
    setLoadingPreview(true);
    setIsPreviewModalOpen(true);
    try {
      const md = await api.exportRun(runId, 'markdown');
      setReportContent(md);
    } catch (err: any) {
      setReportContent(`Failed to load report preview: ${err.message}`);
    } finally {
      setLoadingPreview(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const state = storeState;
  const selectedAgentDef = ALL_17_AGENTS[selectedAgentId];
  const selectedAgentExec = state.agentExecutions[selectedAgentId];
  const agentDeliverables = deliverables.filter(d => d.agent_id === selectedAgentId);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-serif selection:bg-white selection:text-black">
      {/* Top Monochromatic Control Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToProjects}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600 bg-black hover:bg-zinc-900 text-zinc-300 text-xs font-mono transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Projects</span>
          </button>

          <div className="h-4 w-px bg-zinc-800" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide">{project.name}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-300 uppercase">
                {project.domain}
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right Execution Controls */}
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-black text-xs font-mono">
            {status === 'Running' ? (
              <span className="flex items-center gap-1.5 text-white">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>RUNNING</span>
              </span>
            ) : status === 'Paused' ? (
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                <span>PAUSED</span>
              </span>
            ) : status === 'Awaiting_Approval' ? (
              <span className="flex items-center gap-1.5 text-white font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>AWAITING APPROVAL</span>
              </span>
            ) : status === 'Completed' ? (
              <span className="flex items-center gap-1.5 text-white font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>COMPLETED</span>
              </span>
            ) : (
              <span className="text-zinc-500">IDLE</span>
            )}
          </div>

          {/* Autonomous vs HITL Toggle */}
          <button
            onClick={() => setAutoApprove(prev => !prev)}
            title={autoApprove ? "Autonomous Mode: All 17 agents run without pausing" : "Human-in-the-Loop Mode: Pauses at Architecture & Security for sign-off"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              autoApprove 
                ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40' 
                : 'border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{autoApprove ? 'Autonomous Mode' : 'HITL Review Mode'}</span>
          </button>

          {/* Primary Action Button (Start / Resume / Pause / Approve) */}
          {status === 'Running' ? (
            <button
              onClick={handlePause}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={handleStartResume}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                status === 'Awaiting_Approval'
                  ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-900/20'
                  : 'bg-white hover:bg-zinc-200 text-black'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {status === 'Paused'
                  ? 'Resume SDLC'
                  : status === 'Awaiting_Approval'
                  ? 'Approve & Continue'
                  : status === 'Completed' || status === 'Failed'
                  ? 'Restart Run'
                  : 'Start Workflow'}
              </span>
            </button>
          )}

          {/* Step Button */}
          <button
            onClick={handleStep}
            disabled={status === 'Running' || status === 'Awaiting_Approval'}
            title="Advance exactly one agent step"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 text-xs font-mono transition-all disabled:opacity-40 cursor-pointer"
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>Step</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            title="Reset workflow to initial state"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 text-xs font-mono transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-mono">
            <button
              onClick={() => handleExport('docx')}
              disabled={exporting}
              className="px-3 py-1.5 hover:text-white text-zinc-100 bg-zinc-900 border-r border-zinc-800 cursor-pointer flex items-center gap-1.5 font-bold"
              title="Download Full SDLC Stage Report as Microsoft Word Document (.docx)"
            >
              <FileText className="w-3.5 h-3.5 text-white" />
              <span>Word (.docx)</span>
            </button>
            <button
              onClick={() => handleExport('markdown')}
              disabled={exporting}
              className="px-2.5 py-1.5 hover:text-white text-zinc-400 border-r border-zinc-800 cursor-pointer flex items-center gap-1"
              title="Download Markdown Report (.md)"
            >
              <FileDown className="w-3 h-3" />
              <span>MD</span>
            </button>
            <button
              onClick={() => handleExport('html')}
              disabled={exporting}
              className="px-2.5 py-1.5 hover:text-white text-zinc-400 border-r border-zinc-800 cursor-pointer flex items-center gap-1"
              title="Print / Executive View (.html)"
            >
              <Printer className="w-3 h-3" />
              <span>HTML</span>
            </button>
            <button
              onClick={handleOpenPreview}
              disabled={exporting}
              className="px-2.5 py-1.5 hover:text-white text-zinc-400 border-r border-zinc-800 cursor-pointer flex items-center gap-1"
              title="Preview Stage Report on Screen"
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={exporting}
              className="px-2 py-1.5 hover:text-white text-zinc-500 border-r border-zinc-800 cursor-pointer"
              title="Export Run as JSON"
            >
              JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="px-2 py-1.5 hover:text-white text-zinc-500 cursor-pointer"
              title="Export Run as CSV"
            >
              CSV
            </button>
          </div>
        </div>
      </header>

      {/* Prominent Workflow Completed Stage Suggestions & Instructions Report Banner */}
      {(status === 'Completed' || (runs[0] && runs[0].status === 'COMPLETED')) && (
        <div className="bg-zinc-950 border-b border-zinc-700 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-white text-black rounded-lg shrink-0 mt-0.5">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                  SDLC WORKFLOW COMPLETED
                </span>
                <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700">
                  17 Stages Executed
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                Download Stage Suggestions, Instructions & Deliverables Report
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 max-w-2xl">
                All 17 autonomous agents have finalized their execution. Download the complete consolidated report containing every stage&apos;s system instructions, analytical findings, actionable suggestions, and synthesized code deliverables.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => handleExport('docx')}
              disabled={exporting}
              className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <FileText className="w-4 h-4 text-black" />
              <span>Download Word (.docx)</span>
            </button>
            <button
              onClick={() => handleExport('markdown')}
              disabled={exporting}
              className="px-3.5 py-2 border border-zinc-700 hover:border-zinc-500 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Markdown (.md)</span>
            </button>
            <button
              onClick={() => handleExport('html')}
              disabled={exporting}
              className="px-3.5 py-2 border border-zinc-700 hover:border-zinc-500 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF (.html)</span>
            </button>
            <button
              onClick={handleOpenPreview}
              className="px-3 py-2 border border-zinc-800 hover:border-zinc-600 bg-black hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      )}

      {/* Human-In-The-Loop Approval Banner */}
      {status === 'Awaiting_Approval' && activeApproval && (
        <div className="bg-zinc-950 border-b border-zinc-700 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white text-black rounded-lg shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                  HUMAN-IN-THE-LOOP CHECKPOINT GATE
                </span>
                <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700">
                  {activeApproval.checkpointType} Sign-Off Required
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">{activeApproval.title}</h3>
              <p className="text-xs text-zinc-300 mt-0.5 max-w-2xl">{activeApproval.summary}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleReject}
              className="px-4 py-2 border border-zinc-700 hover:border-zinc-500 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Reject Run
            </button>
            <button
              onClick={handleApprove}
              className="px-5 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Approve & Resume SDLC</span>
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Clean Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: 17-Agent Linear Timeline */}
        <aside className="w-80 border-r border-zinc-800 bg-zinc-950 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Agent Pipeline</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">17 Agents Total</span>
          </div>

          <div className="p-2 space-y-1">
            {AGENT_ORDER_LIST.map((agentId: AgentId, index: number) => {
              const def = ALL_17_AGENTS[agentId];
              const exec = state.agentExecutions[agentId];
              const isSelected = selectedAgentId === agentId;
              const isCurrentlyExecuting = activeAgentIndex === index && status === 'Running';
              const isCompleted = exec?.state === 'Completed';
              const isAwaiting = exec?.state === 'AwaitingApproval' || (def.approvalRequired && status === 'Awaiting_Approval' && activeAgentIndex === index);

              return (
                <button
                  key={agentId}
                  onClick={() => setSelectedAgentId(agentId)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 border-zinc-600'
                      : 'bg-black/40 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Status Indicator Icon */}
                    <div className="shrink-0">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : isCurrentlyExecuting ? (
                        <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : isAwaiting ? (
                        <div className="w-5 h-5 rounded-full bg-zinc-800 border border-white text-white flex items-center justify-center">
                          <AlertTriangle className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-zinc-700 bg-zinc-950 flex items-center justify-center text-[10px] font-mono text-zinc-500">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                          {def.name}
                        </span>
                        {def.approvalRequired && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded border border-zinc-700 bg-zinc-800 text-zinc-400">
                            HITL
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate">{def.role}</p>
                    </div>
                  </div>

                  {exec?.durationMs ? (
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0 ml-2">
                      {Math.round(exec.durationMs)}ms
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Column: Selected Agent Output & Deliverables Inspector */}
        <main className="flex-1 flex flex-col bg-black overflow-y-auto">
          {/* Agent Overview Header */}
          <div className="p-6 border-b border-zinc-800 bg-zinc-950 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 uppercase">
                    Phase {selectedAgentDef.phaseOrder}: {selectedAgentDef.role}
                  </span>
                  {selectedAgentDef.approvalRequired && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/20 bg-white text-black font-bold uppercase">
                      HITL Checkpoint Guard
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white mt-1.5">{selectedAgentDef.name}</h2>
                <p className="text-xs text-zinc-400 mt-0.5">{selectedAgentDef.role}</p>
              </div>

              {/* Execution Telemetry Cards */}
              <div className="flex items-center gap-3">
                <div className="px-3 py-2 rounded-lg border border-zinc-800 bg-black text-center">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Status</div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {selectedAgentExec?.state || 'Pending'}
                  </div>
                </div>

                <div className="px-3 py-2 rounded-lg border border-zinc-800 bg-black text-center">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Execution Time</div>
                  <div className="text-xs font-mono text-white mt-0.5">
                    {selectedAgentExec?.durationMs ? `${Math.round(selectedAgentExec.durationMs)} ms` : '--'}
                  </div>
                </div>

                <div className="px-3 py-2 rounded-lg border border-zinc-800 bg-black text-center">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Dependencies</div>
                  <div className="text-xs font-mono text-white mt-0.5">
                    {selectedAgentDef.dependencies.length === 0 ? 'None (Root)' : selectedAgentDef.dependencies.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Responsibilities & Tools */}
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg space-y-2">
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                System Prompt & Objective
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                {selectedAgentDef.systemPrompt}
              </p>
            </div>
          </div>

          {/* Agent Output & Deliverables Section */}
          <div className="p-6 space-y-6">
            {/* Output Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">
                Agent Synthesized Summary
              </h3>
              {selectedAgentExec?.outputSummary ? (
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-line">
                  {selectedAgentExec.outputSummary}
                </div>
              ) : (
                <div className="p-6 border border-dashed border-zinc-800 rounded-xl text-center text-xs font-mono text-zinc-600">
                  Agent has not executed yet. Click &quot;Start Workflow&quot; or &quot;Step&quot; to synthesize deliverables.
                </div>
              )}
            </div>

            {/* Generated Deliverables Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">
                  Deliverables & Artifacts ({agentDeliverables.length})
                </h3>
              </div>

              {agentDeliverables.length === 0 ? (
                <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center text-xs font-mono text-zinc-600">
                  No deliverables generated for this agent yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {agentDeliverables.map((deliv) => (
                    <div key={deliv.id} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-zinc-300" />
                          <span className="text-xs font-bold text-white">{deliv.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black text-zinc-400 uppercase">
                            {deliv.type}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(deliv.content, deliv.id)}
                          className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
                        >
                          {copiedId === deliv.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === deliv.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="p-4 text-xs font-mono text-zinc-300 bg-black overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-96">
                        {deliv.content}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Report Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-serif">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white text-black rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    SDLC Stage Suggestions & Instructions Report
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Project: {project.name} &bull; 17 Autonomous Stages Consolidated
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExport('docx')}
                  disabled={exporting}
                  className="px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download Word (.docx)</span>
                </button>
                <button
                  onClick={() => handleExport('markdown')}
                  disabled={exporting}
                  className="px-3 py-1.5 border border-zinc-700 hover:border-zinc-500 bg-zinc-800 text-zinc-200 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Markdown (.md)</span>
                </button>
                <button
                  onClick={() => handleExport('html')}
                  disabled={exporting}
                  className="px-3 py-1.5 border border-zinc-700 hover:border-zinc-500 bg-zinc-800 text-zinc-200 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print (.html)</span>
                </button>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 bg-black space-y-4">
              {loadingPreview ? (
                <div className="py-20 flex flex-col items-center justify-center text-zinc-400">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                    Compiling Stage Suggestions & Instructions...
                  </span>
                </div>
              ) : (
                <pre className="text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed bg-zinc-950 p-6 rounded-lg border border-zinc-800">
                  {reportContent}
                </pre>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>Format: Standard GitHub Markdown with complete deliverables</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(reportContent);
                  alert('Report copied to clipboard!');
                }}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Full Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
