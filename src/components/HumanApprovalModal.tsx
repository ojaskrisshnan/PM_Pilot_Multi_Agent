import React, { useState } from 'react';
import type { Approval } from '../types/project';
import { ALL_17_AGENTS } from '../engine/AgentRoster';
import { ShieldAlert, CheckCircle2, AlertTriangle, FileCode2, MessageSquare, X } from 'lucide-react';

interface HumanApprovalModalProps {
  approval: Approval | null;
  onApprove: (approvalId: string, note?: string) => void;
  onReject: (approvalId: string, note?: string) => void;
  onClose: () => void;
}

export const HumanApprovalModal: React.FC<HumanApprovalModalProps> = ({
  approval,
  onApprove,
  onReject,
  onClose
}) => {
  const [note, setNote] = useState('');

  if (!approval) return null;

  const agentDef = ALL_17_AGENTS[approval.agentId];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl shadow-amber-500/10 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-300 rounded-2xl border border-amber-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Human-in-the-Loop Governance Gate
              </span>
              <h3 className="text-xl font-extrabold text-white mt-1">
                {approval.checkpointType} Checkpoint Review
              </h3>
              <p className="text-xs text-slate-400">
                Submitted by <strong className="text-indigo-400">{agentDef.name}</strong> ({approval.agentId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Summary */}
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Agent Synthesis Summary
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {approval.summary}
          </p>
        </div>

        {/* Recommendations & Risks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-xl space-y-2">
            <h5 className="font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Recommendations
            </h5>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
              {approval.recommendations.map((rec, idx) => (
                <li key={idx} className="leading-tight">{rec}</li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-xl space-y-2">
            <h5 className="font-bold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Flagged Risks
            </h5>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
              {approval.identifiedRisks.map((risk, idx) => (
                <li key={idx} className="leading-tight">{risk}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Affected Artifacts */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <FileCode2 className="w-3.5 h-3.5 text-indigo-400" /> Affected Artifacts:
          </span>
          {approval.affectedArtifacts.map((art, idx) => (
            <span key={idx} className="font-mono bg-slate-950 px-2 py-0.5 rounded text-indigo-300 border border-slate-800">
              {art}
            </span>
          ))}
        </div>

        {/* Human Note Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
            Project Manager Note / Decision Rationale (Stored in ProjectState)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Reviewed and accepted. Latency constraints adhere to Q4 target."
            className="w-full bg-slate-950 border border-slate-700 text-xs rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Decision Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={() => onReject(approval.id, note)}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all"
          >
            Request Re-evaluation
          </button>
          <button
            onClick={() => onApprove(approval.id, note)}
            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve & Dispatch Next Phase
          </button>
        </div>
      </div>
    </div>
  );
};
