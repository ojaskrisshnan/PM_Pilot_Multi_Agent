import React, { useState } from 'react';
import type { ProjectState } from '../types/project';
import { ALL_17_AGENTS, AGENT_ORDER_LIST } from '../engine/AgentRoster';
import { Clock, GitCommit } from 'lucide-react';

interface GanttTimelineProps {
  state: ProjectState;
}

export const GanttTimeline: React.FC<GanttTimelineProps> = ({ state }) => {
  const { metrics, milestones, agentExecutions } = state;
  const [highlightCriticalOnly, setHighlightCriticalOnly] = useState(false);

  // Deterministically compute cumulative day offsets based on dependency topology
  const agentTimeline = AGENT_ORDER_LIST.map((agentId) => {
    const def = ALL_17_AGENTS[agentId];
    const duration = def.typicalDurationDays;

    // Calculate earliest start day based on dependencies
    let startDay = 0;
    def.dependencies.forEach((depId) => {
      const depIdx = AGENT_ORDER_LIST.indexOf(depId);
      // Rough topological estimate
      const estEnd = (depIdx + 1) * 2;
      if (estEnd > startDay) startDay = estEnd;
    });

    const endDay = startDay + duration;
    // Critical path nodes: essential pipeline
    const isCritical = [
      'ProductManagerAgent',
      'RequirementAgent',
      'ArchitectureAgent',
      'BackendAgent',
      'SecurityAgent',
      'QAAgent',
      'DevOpsAgent',
      'StakeholderAgent'
    ].includes(agentId);

    const execState = agentExecutions[agentId]?.state || 'Idle';

    return {
      agentId,
      name: def.name,
      phaseOrder: def.phaseOrder,
      duration,
      startDay,
      endDay,
      dependencies: def.dependencies,
      isCritical,
      canRunParallel: def.canRunParallel,
      state: execState
    };
  });

  const maxTotalDays = Math.max(...agentTimeline.map(t => t.endDay), 30);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Dynamic Gantt Timeline & Critical Path Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Calculated schedule derived deterministically from the 17-agent dependency graph.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-slate-400">Total Effort: </span>
            <strong className="text-white">{metrics.totalEstimatedDays} Days</strong>
          </div>

          <div className="bg-slate-950 border border-rose-500/40 px-3.5 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-rose-300">
              Critical Path: <strong className="text-white">{metrics.criticalPathDays} Days</strong>
            </span>
          </div>

          <button
            onClick={() => setHighlightCriticalOnly(!highlightCriticalOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              highlightCriticalOnly
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {highlightCriticalOnly ? 'Show All Tracks' : 'Highlight Critical Path Only'}
          </button>
        </div>
      </div>

      {/* Milestones Gate Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-purple-400" /> Milestone Phase Gates
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {milestones.map((m, idx) => (
            <div
              key={m.id}
              className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl space-y-1.5"
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                <span className="text-purple-400">Gate {idx + 1}</span>
                <span className="text-slate-500">Day {m.targetDay}</span>
              </div>
              <h4 className="text-xs font-bold text-white leading-snug">{m.title}</h4>
              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded ${
                m.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {m.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Gantt Bars Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {/* Timeline Header Days */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-b border-slate-800 pb-2">
          <span className="w-56 font-bold uppercase">Agent & Domain Phase</span>
          <div className="flex-1 flex justify-between px-2">
            <span>Day 0</span>
            <span>Day 7</span>
            <span>Day 14</span>
            <span>Day 21</span>
            <span>Day 28</span>
            <span>Day {maxTotalDays}</span>
          </div>
        </div>

        {/* Tracks List */}
        <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">
          {agentTimeline.map((item) => {
            if (highlightCriticalOnly && !item.isCritical) return null;

            const leftPercent = (item.startDay / maxTotalDays) * 100;
            const widthPercent = Math.max(4, (item.duration / maxTotalDays) * 100);

            return (
              <div
                key={item.agentId}
                className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 p-3 rounded-2xl flex flex-col md:flex-row md:items-center gap-3 transition-all"
              >
                {/* Left Label */}
                <div className="w-56 flex-shrink-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      item.isCritical
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {item.isCritical ? 'CRITICAL' : 'PARALLEL'}
                    </span>
                    <h5 className="text-xs font-bold text-white truncate">
                      {item.name.replace(' Agent', '')}
                    </h5>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between pr-2">
                    <span>{item.duration} Days effort</span>
                    <span className="font-mono text-slate-500">Days {item.startDay}-{item.endDay}</span>
                  </div>
                </div>

                {/* Right Bar Progress Track */}
                <div className="flex-1 relative h-6 bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                  <div
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`
                    }}
                    className={`absolute h-full rounded-lg transition-all flex items-center justify-center text-[9px] font-mono font-bold text-white shadow-md ${
                      item.state === 'Completed'
                        ? 'bg-emerald-600'
                        : item.isCritical
                        ? 'bg-gradient-to-r from-rose-600 to-amber-500 shadow-rose-600/30'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                    }`}
                  >
                    <span className="truncate px-1">
                      {item.state === 'Completed' ? '✓ Completed' : `${item.duration}d`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
