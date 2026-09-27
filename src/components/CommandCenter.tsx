import React, { useState } from 'react';
import type { ProjectState, AgentId } from '../types/project';
import { ALL_17_AGENTS } from '../engine/AgentRoster';
import { ProjectStateStore } from '../engine/ProjectState';
import { OrchestrationEngine } from '../engine/OrchestrationEngine';
import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  Coins,
  ShieldAlert,
  ShieldCheck,
  Zap,
  ArrowRight,
  Bot,
  Sparkles,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface CommandCenterProps {
  state: ProjectState;
  onNavigateTab: (tab: any) => void;
  onOpenApprovalModal: (approvalId: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  state,
  onNavigateTab,
  onOpenApprovalModal
}) => {
  const { project, metrics, budget, risks, approvals, events, agentExecutions } = state;

  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [justGenerated, setJustGenerated] = useState(false);

  const pendingApprovals = approvals.filter(a => a.status === 'Pending');
  const criticalRisks = risks.filter(r => r.level === 'Critical' && r.status === 'Open');
  const requiresAttention = pendingApprovals.length > 0 || criticalRisks.length > 0;

  const handleCreateProject = (customPromptText?: string) => {
    const text = (customPromptText || promptInput).trim();
    if (!text) return;
    setIsGenerating(true);
    ProjectStateStore.switchPreset('custom', text);
    OrchestrationEngine.reset();
    setTimeout(() => {
      OrchestrationEngine.start();
      setIsGenerating(false);
      setJustGenerated(true);
      setTimeout(() => setJustGenerated(false), 5000);
    }, 250);
  };

  const samplePrompts = [
    {
      label: '🎓 Student Task Management App',
      prompt: 'Build a student task management web application where students can create, edit, delete, and prioritize tasks, set deadlines, mark tasks as completed, and receive reminders. Include user login, a dashboard showing pending and completed tasks, and a simple backend database.'
    },
    {
      label: '🛒 E-Commerce Marketplace',
      prompt: 'Build an e-commerce multi-vendor platform with product listings, cart checkout via Stripe, vendor sales analytics, inventory tracking, and customer reviews.'
    },
    {
      label: '🏥 Telehealth Consultation Portal',
      prompt: 'Build a HIPAA-compliant telehealth patient portal with doctor appointment scheduling, secure WebRTC video consultations, electronic prescriptions, and medical history vault.'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Autonomous AI Project Generator Console */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/60 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Generate Any New Multi-Agent Project Workflow
              </h3>
              <p className="text-xs text-slate-300">
                Type any software application idea. PMPilot's 17 specialized agents will decompose it into functional requirements, user stories, ADRs, database schemas, and Kanban tasks.
              </p>
            </div>
          </div>

          {justGenerated && (
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 animate-bounce">
              <CheckCircle2 className="w-3.5 h-3.5" /> Project Generated & 17 Agents Dispatched!
            </span>
          )}
        </div>

        {/* Prompt Input Form */}
        <div className="relative z-10 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <textarea
              rows={2}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="e.g. Build a student task management web application where students can create, edit, delete, and prioritize tasks, set deadlines, mark tasks as completed, and receive reminders..."
              className="flex-1 bg-slate-950/90 border border-slate-700/80 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed shadow-inner"
            />
            <button
              onClick={() => handleCreateProject()}
              disabled={isGenerating || !promptInput.trim()}
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 self-stretch sm:self-auto min-w-[200px]"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 animate-spin text-amber-300" />
                  Decomposing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Decompose & Launch
                </span>
              )}
            </button>
          </div>

          {/* Quick Pre-filled Sample Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Quick Test:</span>
            {samplePrompts.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPromptInput(sample.prompt);
                  handleCreateProject(sample.prompt);
                }}
                className="text-[11px] bg-slate-950/80 hover:bg-slate-800 border border-slate-700/70 hover:border-indigo-500 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl font-medium transition-all"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Project Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {project.domain}
            </span>
            <span className="text-[10px] font-mono text-slate-400">ID: {project.id}</span>
            <span className="text-[10px] font-mono text-slate-400">• Version {project.version}.0</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {project.name}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {project.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 font-medium">
            <span className="flex items-center gap-1.5 text-indigo-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Scale: {project.scaleConstraints}
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-purple-400" /> Launch Target: {project.targetLaunch}
            </span>
          </div>
        </div>

        {/* Health Score Dial */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.8"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400"
                strokeDasharray={`${metrics.healthScore}, 100`}
                strokeWidth="3.8"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xl font-black text-white">{metrics.healthScore}</span>
              <span className="block text-[8px] text-slate-400 uppercase font-mono">Index</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Product Health
            </span>
            <span className="text-sm font-extrabold text-emerald-400">
              {metrics.healthScore >= 95 ? 'Exceptional' : 'Optimal'}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
              Target: ≥ 95/100 Quality Standard
            </p>
          </div>
        </div>
      </div>

      {/* Prominent ATTENTION REQUIRED Section (Mandatory Section 11) */}
      {requiresAttention && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-rose-950/30 border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-amber-500/20 rounded-xl text-amber-300">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </span>
              <div>
                <h3 className="text-sm font-black text-white tracking-wide uppercase flex items-center gap-2">
                  ATTENTION REQUIRED — Project Manager Action Needed
                </h3>
                <p className="text-xs text-amber-300/80">
                  Critical governance checkpoints and unmitigated risk items require human supervision.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingApprovals.map((app) => (
              <div
                key={app.id}
                className="bg-slate-950/90 border border-amber-500/40 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                      {app.checkpointType} Checkpoint
                    </span>
                    <span className="text-xs font-bold text-white">{app.agentId}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">{app.summary}</p>
                </div>
                <button
                  onClick={() => onOpenApprovalModal(app.id)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1 flex-shrink-0"
                >
                  Review Gate <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {criticalRisks.map((r) => (
              <div
                key={r.id}
                className="bg-slate-950/90 border border-rose-500/40 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">
                      Critical Risk Score {r.score}
                    </span>
                    <span className="text-xs font-bold text-white">{r.id}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">{r.title}</p>
                </div>
                <button
                  onClick={() => onNavigateTab('risks')}
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold rounded-xl transition-all flex items-center gap-1 flex-shrink-0"
                >
                  Mitigate <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6 High-Level Health Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Progress */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Progress</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.progressPercent}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${metrics.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Schedule</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400">{metrics.scheduleHealth}</div>
          <p className="text-[10px] text-slate-400 font-mono">
            {metrics.criticalPathDays}d Critical Path
          </p>
        </div>

        {/* Budget */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Budget Spend</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-white truncate">
            ${budget.totalMvpBudget.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 font-mono truncate">
            ${budget.monthlyRunRate.toLocaleString()}/mo Run-Rate
          </p>
        </div>

        {/* Risk Level */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Risk Register</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-black text-rose-400">
            {metrics.openRisksCount} Open
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            {criticalRisks.length} Critical
          </p>
        </div>

        {/* Quality Score */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Quality / QA</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-black text-teal-400">{metrics.qualityScore}%</div>
          <p className="text-[10px] text-slate-400 font-mono">
            {metrics.securityAuditIndex}% Security
          </p>
        </div>

        {/* Agents Completed */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Agents Active</span>
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-black text-white">
            {metrics.completedAgentsCount} / {metrics.totalAgentsCount}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            {metrics.completedAgentsCount === 17 ? 'All Completed' : 'In Progress'}
          </p>
        </div>
      </div>

      {/* Two Column Layout: Active Agent Grid & Recent Audit Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 17 Specialized Domain Agents Status */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                17 Specialized Domain Agents Execution Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Click any agent to inspect its SKILL.md, tools, and interactive playground.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('agents')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
            >
              Topology Graph <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {(Object.keys(ALL_17_AGENTS) as AgentId[]).map((agentId) => {
              const def = ALL_17_AGENTS[agentId];
              const exec = agentExecutions[agentId];
              const isDone = exec?.state === 'Completed';
              const isRunning = exec?.state === 'Running';
              const isQueued = exec?.state === 'Queued';

              return (
                <div
                  key={agentId}
                  onClick={() => onNavigateTab('inspector')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                    isRunning
                      ? 'bg-amber-500/10 border-amber-500/50 ring-2 ring-amber-500/20 shadow-lg'
                      : isDone
                      ? 'bg-slate-950/70 border-emerald-500/30 hover:border-emerald-500/60'
                      : isQueued
                      ? 'bg-indigo-950/30 border-indigo-500/30'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">
                      P{def.phaseOrder} • {def.typicalDurationDays}d
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isRunning ? 'bg-amber-500 text-slate-950 animate-pulse' :
                      isDone ? 'bg-emerald-500/20 text-emerald-300' :
                      isQueued ? 'bg-indigo-500/20 text-indigo-300' :
                      'bg-slate-800 text-slate-500'
                    }`}>
                      {exec?.state || 'Idle'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Bot className={`w-4 h-4 flex-shrink-0 ${
                      isRunning ? 'text-amber-400 animate-bounce' :
                      isDone ? 'text-emerald-400' : 'text-slate-500'
                    }`} />
                    <h4 className="text-xs font-bold text-white truncate">{def.name.replace(' Agent', '')}</h4>
                  </div>

                  <p className="text-[10px] text-slate-400 truncate">{def.role}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Event Audit Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Event Stream
            </h3>
            <button
              onClick={() => onNavigateTab('events')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
            >
              Full Log
            </button>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar flex-1">
            {events.slice(0, 8).map((evt) => (
              <div
                key={evt.id}
                className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl space-y-1 text-xs"
              >
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span className="font-bold text-indigo-400">{evt.type}</span>
                  <span>{evt.timestamp}</span>
                </div>
                <h5 className="font-bold text-slate-200">{evt.title}</h5>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{evt.detail}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 text-center">
            <button
              onClick={() => onNavigateTab('kanban')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
            >
              Go to Sprint Kanban Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
