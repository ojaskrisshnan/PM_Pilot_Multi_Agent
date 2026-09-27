import React from 'react';
import {
  Compass,
  FileCheck2,
  Database,
  Kanban,
  Code2,
  ShieldAlert,
  FileText,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { OrchestrationEngine } from '../engine/OrchestrationEngine';

export type NavTab =
  | 'overview'
  | 'requirements'
  | 'architecture'
  | 'kanban'
  | 'artifacts'
  | 'quality'
  | 'report'
  | 'stories'
  | 'decisions'
  | 'agents'
  | 'events'
  | 'approvals'
  | 'gantt'
  | 'risks'
  | 'financials'
  | 'inspector'
  | 'benchmark';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  pendingApprovalsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount
}) => {
  const status = OrchestrationEngine.getStatus();
  const currentAgentIdx = OrchestrationEngine.getCurrentAgentIndex();
  const isRunning = status === 'Running';

  // 7 Clear, Realistic SDLC Workflow Stages
  const workflowStages: Array<{
    id: NavTab;
    step: string;
    title: string;
    subtitle: string;
    icon: React.ComponentType<any>;
    agentThreshold: number; // completed threshold index
    badge?: string | number;
    badgeColor?: string;
  }> = [
    {
      id: 'overview',
      step: '01',
      title: 'Project Scope',
      subtitle: 'Goal & AI Team Setup',
      icon: Compass,
      agentThreshold: 0
    },
    {
      id: 'requirements',
      step: '02',
      title: 'Requirements',
      subtitle: 'User Specs & Acceptance',
      icon: FileCheck2,
      agentThreshold: 2
    },
    {
      id: 'architecture',
      step: '03',
      title: 'Architecture & DB',
      subtitle: 'System & Schema Design',
      icon: Database,
      agentThreshold: 4
    },
    {
      id: 'kanban',
      step: '04',
      title: 'Sprint Tasks',
      subtitle: 'Agile Task Board',
      icon: Kanban,
      agentThreshold: 6
    },
    {
      id: 'artifacts',
      step: '05',
      title: 'Code & Live Demo',
      subtitle: 'Interactive App & Files',
      icon: Code2,
      badge: 'Interactive',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      agentThreshold: 10
    },
    {
      id: 'quality',
      step: '06',
      title: 'Testing & Security',
      subtitle: 'QA Tests & Vulnerabilities',
      icon: ShieldAlert,
      agentThreshold: 13
    },
    {
      id: 'report',
      step: '07',
      title: 'Sign-off & Report',
      subtitle: 'PM Approvals & Executive Summary',
      icon: FileText,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Action` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-black animate-pulse',
      agentThreshold: 17
    }
  ];

  // Calculate overall SDLC percentage based on agents completed
  const totalSteps = 17;
  const progressPercent = currentAgentIdx >= 0 ? Math.min(100, Math.round(((currentAgentIdx + 1) / totalSteps) * 100)) : 0;

  const handleToggleRun = () => {
    if (isRunning) {
      OrchestrationEngine.pause();
    } else {
      OrchestrationEngine.start();
    }
  };

  const handleReset = () => {
    OrchestrationEngine.reset();
  };

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between h-[calc(100vh-61px)] sticky top-[61px] overflow-y-auto custom-scrollbar select-none">
      <div className="p-4 space-y-5">
        {/* Header: SDLC Workflow Pipeline Progress */}
        <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-2.5 shadow-inner">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> SDLC Pipeline
            </span>
            <span className="font-mono text-emerald-400 font-extrabold text-[11px]">
              {progressPercent}% Done
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Status: <strong className={isRunning ? 'text-amber-400 animate-pulse' : status === 'Completed' ? 'text-emerald-400' : 'text-slate-300'}>{status}</strong></span>
            <span>Agent: {Math.max(0, currentAgentIdx + 1)}/17</span>
          </div>
        </div>

        {/* Workflow Stages Stepper */}
        <div className="space-y-1.5">
          <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between">
            <span>Workflow Stages</span>
            <span className="text-slate-400 font-normal">7 Steps</span>
          </div>

          <nav className="space-y-1">
            {workflowStages.map((stage) => {
              const Icon = stage.icon;
              const isActive = activeTab === stage.id ||
                (stage.id === 'architecture' && (activeTab === 'decisions' || activeTab === 'agents')) ||
                (stage.id === 'kanban' && (activeTab === 'stories' || activeTab === 'gantt')) ||
                (stage.id === 'quality' && activeTab === 'risks') ||
                (stage.id === 'report' && activeTab === 'approvals');

              const isPassed = currentAgentIdx >= stage.agentThreshold && currentAgentIdx > 0;
              const isCurrent = isRunning && currentAgentIdx < stage.agentThreshold && currentAgentIdx >= (stage.agentThreshold - 3);

              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveTab(stage.id)}
                  className={`w-full text-left p-2.5 rounded-2xl transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/30 via-indigo-600/20 to-purple-600/20 text-white border border-indigo-500/40 shadow-lg'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    {/* Step badge / Icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all flex-shrink-0 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : isPassed
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}>
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                      ) : (
                        stage.step
                      )}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-indigo-300' : 'text-slate-400 group-hover:text-slate-200'}`} />
                        <span className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                          {stage.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {stage.subtitle}
                      </p>
                    </div>
                  </div>

                  {stage.badge && (
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold flex-shrink-0 ${stage.badgeColor}`}>
                      {stage.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Quick Controls */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleRun}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pause SDLC
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Run Workflow
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            title="Reset Workflow"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-[10px] text-slate-400 text-center font-mono">
          <span>PMPilot • AI Software Project Manager</span>
        </div>
      </div>
    </aside>
  );
};
