import React, { useState } from 'react';
import type { ProjectState, Requirement, RequirementChangeImpact } from '../types/project';
import { ProjectStateStore } from '../engine/ProjectState';
import { ImpactAnalysisModal } from './ImpactAnalysisModal';
import { Layers, Edit3, GitBranch, Zap, CheckCircle2 } from 'lucide-react';

interface RequirementsViewProps {
  state: ProjectState;
}

export const RequirementsView: React.FC<RequirementsViewProps> = ({ state }) => {
  const { requirements } = state;
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [metricInput, setMetricInput] = useState<string>('');
  const [activeImpact, setActiveImpact] = useState<RequirementChangeImpact | null>(null);

  const handleStartEdit = (req: Requirement) => {
    setEditingReqId(req.id);
    setMetricInput(req.metricValue || '');
  };

  const handleAnalyzeImpact = (reqId: string) => {
    if (!metricInput.trim()) return;
    const impact = ProjectStateStore.analyzeRequirementImpact(reqId, metricInput.trim());
    setActiveImpact(impact);
    setEditingReqId(null);
  };

  const handleApplyImpact = (impact: RequirementChangeImpact) => {
    ProjectStateStore.applyRequirementChange(impact);
    setActiveImpact(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Functional & Non-Functional Requirements Specification
            </h2>
            <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              SRS Standard Spec
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Elicited by <strong className="text-indigo-400">RequirementAgent</strong>. Modifying constraints triggers automated impact propagation across affected agents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono text-slate-300">
            Total Requirements: <strong className="text-white">{requirements.length}</strong>
          </div>
        </div>
      </div>

      {/* Requirement Cards */}
      <div className="space-y-4">
        {requirements.map((req) => {
          const isEditing = editingReqId === req.id;

          return (
            <div
              key={req.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl space-y-4 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                    {req.id}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    req.priority === 'Must Have' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {req.priority}
                  </span>
                  <span className="text-[10px] font-bold uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    {req.type}
                  </span>
                  <h3 className="text-sm font-bold text-white">{req.title}</h3>
                </div>

                {/* Scale Metric Badge / Edit Trigger */}
                <div className="flex items-center gap-2">
                  {req.metricValue && (
                    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 px-3 py-1 rounded-xl text-xs font-mono">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-slate-400">Constraint:</span>
                      <strong className="text-emerald-400 font-black">{req.metricValue}</strong>
                    </div>
                  )}

                  <button
                    onClick={() => handleStartEdit(req)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all text-xs font-semibold flex items-center gap-1"
                    title="Change Scale / Metric (Simulate PM Change)"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden sm:inline">Modify Scale</span>
                  </button>
                </div>
              </div>

              {/* Requirement Description */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {req.description}
              </p>

              {/* Inline Edit Form for Metric */}
              {isEditing && (
                <div className="bg-slate-950 border border-indigo-500/50 p-4 rounded-2xl space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <GitBranch className="w-4 h-4 text-indigo-400" />
                      Simulate PM Requirement Change (e.g. 5,000 RPS ➔ 50,000 RPS)
                    </span>
                    <button
                      onClick={() => setEditingReqId(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={metricInput}
                      onChange={(e) => setMetricInput(e.target.value)}
                      placeholder="Enter new constraint (e.g. 50,000 RPS or sub-100ms)..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      onClick={() => handleAnalyzeImpact(req.id)}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                    >
                      <GitBranch className="w-3.5 h-3.5" /> Analyze Impact
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    PMPilot will calculate downstream impact across Architecture, Backend, DevOps, Security, Budget, and critical path.
                  </p>
                </div>
              )}

              {/* Acceptance Criteria */}
              <div className="space-y-1.5 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Verification & Acceptance Criteria
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {req.acceptance.map((crit, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Affected Domain Agents */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Assigned Agents:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {req.affectedAgents.map((agentId) => (
                      <span
                        key={agentId}
                        className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                      >
                        {agentId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Impact Analysis Modal */}
      <ImpactAnalysisModal
        impact={activeImpact}
        onApply={handleApplyImpact}
        onClose={() => setActiveImpact(null)}
      />
    </div>
  );
};
