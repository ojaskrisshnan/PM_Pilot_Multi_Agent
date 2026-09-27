import React from 'react';
import type { ProjectState } from '../types/project';
import { ShieldCheck, CheckCircle2, Clock, MessageSquare, Bot } from 'lucide-react';

interface ApprovalsViewProps {
  state: ProjectState;
  onOpenApprovalModal: (approvalId: string) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({ state, onOpenApprovalModal }) => {
  const { approvals } = state;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Human-in-the-Loop Governance & Decision Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mandatory architectural and cybersecurity approval checkpoints enforcing stakeholder sign-offs.
          </p>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {approvals.map((app) => {
          const isPending = app.status === 'Pending';
          const isApproved = app.status === 'Approved';

          return (
            <div
              key={app.id}
              className={`border rounded-3xl p-6 shadow-xl space-y-4 transition-all ${
                isPending
                  ? 'bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/20'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {app.checkpointType} Gate
                  </span>
                  <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    isApproved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    isPending ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                    'bg-rose-500/20 text-rose-300'
                  }`}>
                    {isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {app.status}
                  </span>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-indigo-400" /> {app.agentId}
                  </h3>
                </div>

                {isPending && (
                  <button
                    onClick={() => onOpenApprovalModal(app.id)}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all"
                  >
                    Review & Sign-Off Checkpoint
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-300">{app.summary}</p>

              {/* Recommendations & Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-400">Recommendations</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {app.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-rose-400">Identified Vulnerabilities / Risks</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {app.identifiedRisks.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Human Note if present */}
              {app.humanNote && (
                <div className="bg-slate-950/80 border border-indigo-500/30 p-3 rounded-xl flex items-center gap-2 text-xs text-indigo-200">
                  <MessageSquare className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span>
                    <strong className="text-white">PM Review Note:</strong> "{app.humanNote}"
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
