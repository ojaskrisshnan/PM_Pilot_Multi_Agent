import React, { useState, useEffect } from 'react';
import type { ProjectState, ExecutionSpeed } from '../types/project';
import { OrchestrationEngine } from '../engine/OrchestrationEngine';
import { ProjectStateStore } from '../engine/ProjectState';
import { HybridRouter } from '../engine/LLMProvider';
import { LLMModelSelectorModal } from './LLMModelSelectorModal';
import { ProjectInitModal } from './ProjectInitModal';
import { AuthModal } from './AuthModal';
import { api, type User } from '../api/client';
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  SlidersHorizontal,
  Cpu,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Plus,
  Gauge,
  User as UserIcon,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  state: ProjectState;
  onOpenApprovalModal: (approvalId: string) => void;
  onNavigateTab: (tab: any) => void;
  currentUser?: User | null;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ state, onOpenApprovalModal, onNavigateTab, currentUser: propUser, onSignOut }) => {
  const [isLLMModalOpen, setIsLLMModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [localUser, setLocalUser] = useState<User | null>(null);

  const currentUser = propUser !== undefined ? propUser : localUser;

  useEffect(() => {
    if (propUser === undefined && api.getToken()) {
      api.getMe().then(user => setLocalUser(user)).catch(() => setLocalUser(null));
    }
  }, [propUser]);

  const status = OrchestrationEngine.getStatus();
  const speed = OrchestrationEngine.getSpeed();
  const activeAgentIndex = OrchestrationEngine.getCurrentAgentIndex();
  const llmConfig = HybridRouter.getConfig();
  const { activeApprovalId } = state;

  const isRunning = status === 'Running';
  const isAwaitingApproval = status === 'Awaiting_Approval';

  const handleTogglePlay = () => {
    if (isRunning) {
      OrchestrationEngine.pause();
    } else {
      OrchestrationEngine.start();
    }
  };

  const handleStepForward = () => {
    OrchestrationEngine.stepForward();
  };

  const handleReset = () => {
    OrchestrationEngine.reset();
  };

  const handleSpeedChange = (val: string) => {
    if (val === 'instant') {
      OrchestrationEngine.setSpeed('instant');
    } else {
      OrchestrationEngine.setSpeed(Number(val) as ExecutionSpeed);
    }
  };

  const totalSteps = 17;
  const progressPercent = activeAgentIndex >= 0 ? Math.min(100, Math.round(((activeAgentIndex + 1) / totalSteps) * 100)) : 0;

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-slate-100 px-6 py-3.5 sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        {/* Brand & Project Switcher */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-400 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20 text-slate-950 font-black">
            <Cpu className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
                PMPilot
              </h1>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-bold">
                AI Project Manager
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="truncate max-w-[220px] text-slate-200 font-bold">{state.project.name}</span>
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2 py-0.5 rounded-lg border border-slate-700 transition-all flex items-center gap-1 font-bold shadow-sm"
              >
                <Plus className="w-3 h-3" /> Switch / New Project
              </button>
            </div>
          </div>
        </div>

        {/* Center: Interactive Playback Controls (Section 5 Specification) */}
        <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 p-1.5 rounded-2xl shadow-inner">
          {/* Main Play / Pause Button */}
          <button
            onClick={handleTogglePlay}
            disabled={isAwaitingApproval}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                : 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-black'
            } disabled:opacity-40`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Run Full SDLC
              </>
            )}
          </button>

          {/* Step-by-Step Execution Button */}
          <button
            onClick={handleStepForward}
            disabled={isRunning || isAwaitingApproval || status === 'Completed'}
            title="Execute Next Agent Step (Demo Stepper)"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <StepForward className="w-3.5 h-3.5 text-indigo-400" />
            <span>Step Forward</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            title="Reset Project Execution"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed Multiplier Selector (0.5x, 1x, 2x, 5x, Instant Demo) */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
            <Gauge className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={speed}
              onChange={(e) => handleSpeedChange(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 text-[11px] font-mono font-bold text-slate-300 rounded-xl px-2 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="0.5">0.5x Speed</option>
              <option value="1">1.0x Speed</option>
              <option value="2">2.0x Speed</option>
              <option value="5">5.0x Speed</option>
              <option value="instant">Instant Demo</option>
            </select>
          </div>
        </div>

        {/* Right: LLM Provider Badge & Status */}
        <div className="flex items-center gap-3">
          {/* Prominent Awaiting Approval Indicator */}
          {isAwaitingApproval && activeApprovalId && (
            <button
              onClick={() => onOpenApprovalModal(activeApprovalId)}
              className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 animate-bounce shadow-lg shadow-amber-500/30"
            >
              <ShieldAlert className="w-4 h-4" /> Checkpoint Awaiting Review
            </button>
          )}

          {/* LLM Mode Badge */}
          <button
            onClick={() => setIsLLMModalOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-md"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-emerald-400 font-bold uppercase">
              {llmConfig.mode === 'demo_fallback' ? 'Demo Fallback' : llmConfig.mode}
            </span>
          </button>

          {/* User Authentication Badge */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs">
              <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold text-slate-200 truncate max-w-[120px]">{currentUser.name}</span>
              <button
                onClick={() => {
                  api.logout();
                  if (onSignOut) {
                    onSignOut();
                  } else {
                    setLocalUser(null);
                  }
                }}
                title="Sign Out"
                className="text-slate-400 hover:text-red-400 ml-1 p-0.5"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-xl border border-indigo-500/40 transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Status Capsule */}
          <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs">
            {isRunning ? (
              <span className="flex items-center gap-1.5 text-amber-400 font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Step {Math.max(1, activeAgentIndex + 1)} / {totalSteps}
              </span>
            ) : status === 'Completed' ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completed
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-slate-500" /> Ready
              </span>
            )}

            {/* Mini Progress Bar */}
            <div className="w-14 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Project Switcher Modal */}
      <ProjectInitModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={() => {
          OrchestrationEngine.reset();
          onNavigateTab('overview');
        }}
      />

      {/* LLM Model Config Modal */}
      <LLMModelSelectorModal isOpen={isLLMModalOpen} onClose={() => setIsLLMModalOpen(false)} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setLocalUser(user);
          ProjectStateStore.initFromBackend();
        }}
      />
    </>
  );
};
