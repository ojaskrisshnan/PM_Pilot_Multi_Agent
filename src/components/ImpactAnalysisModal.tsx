import React from 'react';
import type { RequirementChangeImpact } from '../types/project';
import { GitBranch, Check, X, Bot } from 'lucide-react';

interface ImpactAnalysisModalProps {
  impact: RequirementChangeImpact | null;
  onApply: (impact: RequirementChangeImpact) => void;
  onClose: () => void;
}

export const ImpactAnalysisModal: React.FC<ImpactAnalysisModalProps> = ({ impact, onApply, onClose }) => {
  if (!impact) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 text-indigo-300 rounded-2xl border border-indigo-500/30">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                PMPilot SDLC Impact Analysis
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                Requirement Change Impact Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Automated regression & dependency propagation across 17 domain agents.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Change Diff Banner */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="text-xs">
            <span className="text-slate-400 block font-medium">Requirement Target Value:</span>
            <span className="font-mono text-rose-400 line-through text-sm font-bold mr-2">{impact.oldValue}</span>
            <span className="text-slate-500">➔</span>
            <span className="font-mono text-emerald-400 text-sm font-black ml-2 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
              {impact.newValue}
            </span>
          </div>
          <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 font-bold">
            Requirement ID: {impact.requirementId}
          </span>
        </div>

        {/* 4 Impact Metric Cards (Section 16 Specification) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Agents Affected</span>
            <div className="text-xl font-black text-indigo-400">{impact.affectedAgents.length} Agents</div>
            <p className="text-[10px] text-slate-500">Re-evaluation queued</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Budget Delta</span>
            <div className="text-xl font-black text-amber-400">+${impact.estimatedBudgetImpact.toLocaleString()}</div>
            <p className="text-[10px] text-slate-500">Infrastructure & sizing</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Timeline Impact</span>
            <div className="text-xl font-black text-purple-400">+{impact.estimatedTimelineImpactDays} Days</div>
            <p className="text-[10px] text-slate-500">Critical path shift</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Artifacts Regen</span>
            <div className="text-xl font-black text-teal-400">{impact.affectedArtifactIds.length} Files</div>
            <p className="text-[10px] text-slate-500">ADR, Backend, DevOps</p>
          </div>
        </div>

        {/* Affected Agents Tags */}
        <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            Domain Agents Slated for Targeted Re-evaluation:
          </h4>
          <div className="flex flex-wrap gap-2">
            {impact.affectedAgents.map((agentId) => (
              <span
                key={agentId}
                className="text-xs font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-lg"
              >
                {agentId}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(impact)}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Apply Changes & Re-run Affected Agents
          </button>
        </div>
      </div>
    </div>
  );
};
