import React from 'react';
import type { SharedMemoryState } from '../types/agent';
import { ShieldCheck, Zap, DollarSign, Clock, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

interface OverviewProps {
  memory: SharedMemoryState;
  onNavigateTab: (tab: any) => void;
}

export const ExecutiveDashboard: React.FC<OverviewProps> = ({ memory, onNavigateTab }) => {
  const { analytics, financials, sprintData, risks, projectInfo } = memory;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-800/40 p-6 rounded-2xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
              <span>Project ID: {projectInfo.id}</span>
              <span>•</span>
              <span className="text-emerald-400">{projectInfo.category}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {projectInfo.name}
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl font-medium">
              "{projectInfo.prompt}"
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('graph')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              View Live Graph
            </button>
            <button
              onClick={() => onNavigateTab('report')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              Full PM Report
            </button>
          </div>
        </div>
      </div>

      {/* Health Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Product Health Score */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Health Index</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{analytics.healthScore}</span>
            <span className="text-slate-500 text-xs font-semibold">/ 100</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md ml-auto">
              +4.2% velocity
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Synthesized across security, test coverage, and milestone compliance.
          </p>
        </div>

        {/* Card 2: Timeline Prediction */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Timeline</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{analytics.criticalPathDays}</span>
            <span className="text-slate-400 text-xs font-semibold">Days Critical Path</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Effort: {analytics.timelineDaysTotal} Days</span>
            <span className="text-purple-400 font-mono">On Schedule</span>
          </div>
        </div>

        {/* Card 3: Budget Utilization */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget Allocation</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">${financials.totalBudget.toLocaleString()}</span>
            <span className="text-xs text-slate-400">Total Cap</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-400 h-full"
              style={{ width: `${Math.round((financials.spentBudget / financials.totalBudget) * 100)}%` }}
            />
          </div>
        </div>

        {/* Card 4: Security & Quality Gate */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security & Quality</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-white">{analytics.securityIndex}%</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Security Index</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div>
              <div className="text-xl font-bold text-white">{analytics.qualityScore}%</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Test Gate Pass</div>
            </div>
          </div>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> PCI-DSS & OWASP Compliant
          </p>
        </div>
      </div>

      {/* Middle Grid: Sprint Progress & North Star Metric */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sprint Backlog Summary */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Sprint Backlog Overview</h3>
              <p className="text-xs text-slate-400">{sprintData.currentSprint}</p>
            </div>
            <button
              onClick={() => onNavigateTab('kanban')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Manage Kanban →
            </button>
          </div>

          <div className="space-y-2.5">
            {sprintData.stories.map((story) => (
              <div
                key={story.id}
                className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                    story.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    story.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {story.priority}
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{story.title}</h4>
                    <p className="text-[11px] text-slate-400">{story.epic} • Assigned: {story.assignee}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-md">
                    {story.points} pts
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                    story.status === 'Done' ? 'bg-emerald-500/20 text-emerald-300' :
                    story.status === 'In_Progress' ? 'bg-indigo-500/20 text-indigo-300 animate-pulse' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {story.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* North Star Metric & Top Risks */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">North Star Metric</h3>
            <div className="text-lg font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
              {analytics.northStarMetric}
            </div>
            <div className="space-y-2">
              {analytics.kpis.map((kpi, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{kpi.name}</span>
                  <span className="font-mono font-bold text-white">{kpi.current} (Target: {kpi.target})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">High Project Risks</h3>
              <button onClick={() => onNavigateTab('risk')} className="text-xs text-rose-400 font-semibold">
                Risk Heatmap →
              </button>
            </div>
            <div className="space-y-2">
              {risks.slice(0, 2).map((r) => (
                <div key={r.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-rose-400 font-bold mb-1">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {r.title}
                    </span>
                    <span className="font-mono">Score: {r.score}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{r.mitigation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
