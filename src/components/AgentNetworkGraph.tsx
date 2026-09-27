import React, { useState } from 'react';
import type { AgentId, ProjectState } from '../types/project';
import { ALL_17_AGENTS } from '../engine/AgentRoster';
import { AGENT_ROSTER } from '../engine/AgentRegistry';
import { Bot, X } from 'lucide-react';

interface NetworkGraphProps {
  state: ProjectState;
  activeAgent: AgentId | null;
  onSelectAgent: (agentId: AgentId) => void;
}

export const AgentNetworkGraph: React.FC<NetworkGraphProps> = ({ state, activeAgent, onSelectAgent }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | null>(null);

  const completedAgents = new Set(
    Object.entries(state.agentExecutions)
      .filter(([_, exec]) => exec.state === 'Completed')
      .map(([id]) => id as AgentId)
  );

  const agentKeys = Object.keys(ALL_17_AGENTS) as AgentId[];

  // Graph Layout Coordinates around ProductManagerAgent (Center: 450, 320)
  const centerX = 450;
  const centerY = 320;
  const radius = 240;

  const peripheralAgents = agentKeys.filter((id) => id !== 'ProductManagerAgent');

  const nodePositions: Record<AgentId, { x: number; y: number }> = agentKeys.reduce((acc, id) => {
    if (id === 'ProductManagerAgent') {
      acc[id] = { x: centerX, y: centerY };
    } else {
      const pIdx = peripheralAgents.indexOf(id);
      const angle = (pIdx / peripheralAgents.length) * 2 * Math.PI - Math.PI / 2;
      acc[id] = {
        x: Math.round(centerX + radius * Math.cos(angle)),
        y: Math.round(centerY + radius * Math.sin(angle))
      };
    }
    return acc;
  }, {} as Record<AgentId, { x: number; y: number }>);

  const selectedAgentMeta = selectedAgentId ? (AGENT_ROSTER[selectedAgentId] || ALL_17_AGENTS[selectedAgentId]) : null;
  const selectedAgentExec = selectedAgentId ? state.agentExecutions[selectedAgentId] : null;

  return (
    <div className="relative bg-slate-950 border border-slate-800 rounded-3xl p-6 min-h-[640px] flex flex-col justify-between overflow-hidden shadow-2xl animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 z-10">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-400" />
            Event-Driven Agent Network Topology
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ProductManagerAgent orchestrating 16 specialized skill-based domain agents via structured JSON messaging.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-slate-300 font-medium">Active Dispatch</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-medium">Completed ({completedAgents.size}/17)</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-[540px] flex items-center justify-center">
        <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 900 640">
          {/* Connection Lines from Center to all Agents */}
          {peripheralAgents.map((id) => {
            const pos = nodePositions[id];
            const isDone = completedAgents.has(id);
            const isActive = activeAgent === id;

            return (
              <g key={id}>
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={isActive ? '#F59E0B' : isDone ? '#10B981' : '#334155'}
                  strokeWidth={isActive ? '3' : isDone ? '2' : '1'}
                  strokeDasharray={isActive ? '6 6' : undefined}
                  className={isActive ? 'animate-pulse' : ''}
                />
                {isActive && (
                  <circle r="4" fill="#F59E0B">
                    <animateMotion
                      path={`M${centerX},${centerY} L${pos.x},${pos.y}`}
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Render HTML Nodes over SVG */}
        <div className="relative w-[900px] h-[640px]">
          {agentKeys.map((id) => {
            const pos = nodePositions[id];
            const isCenter = id === 'ProductManagerAgent';
            const isDone = completedAgents.has(id);
            const isActive = activeAgent === id;
            const def = ALL_17_AGENTS[id];

            return (
              <div
                key={id}
                onClick={() => {
                  setSelectedAgentId(id);
                  onSelectAgent(id);
                }}
                style={{
                  left: `${pos.x - (isCenter ? 64 : 52)}px`,
                  top: `${pos.y - (isCenter ? 36 : 28)}px`
                }}
                className={`absolute cursor-pointer transition-all duration-300 transform hover:scale-110 flex flex-col items-center justify-center p-2 rounded-2xl border text-center shadow-xl ${
                  isCenter
                    ? 'w-32 h-18 bg-gradient-to-br from-indigo-900 to-purple-950 border-indigo-500/80 text-white ring-4 ring-indigo-500/20'
                    : isActive
                    ? 'w-26 h-14 bg-amber-950/90 border-amber-400 text-amber-200 ring-4 ring-amber-500/40 animate-pulse'
                    : isDone
                    ? 'w-26 h-14 bg-slate-900/90 border-emerald-500/60 text-slate-100'
                    : 'w-26 h-14 bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Bot className={`w-3.5 h-3.5 ${isCenter ? 'text-indigo-400' : isDone ? 'text-emerald-400' : isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="text-[11px] font-bold tracking-tight truncate max-w-[85px]">
                    {def.name.replace(' Agent', '')}
                  </span>
                </div>
                <div className="text-[9px] font-mono text-slate-400 mt-0.5 truncate max-w-[90px]">
                  {isDone ? 'Payload Sent' : isActive ? 'Processing...' : 'Idle'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Agent Inspector Drawer */}
      {selectedAgentId && selectedAgentMeta && (
        <div className="absolute bottom-4 right-4 w-96 bg-slate-900/95 border border-indigo-500/50 p-5 rounded-3xl shadow-2xl backdrop-blur-xl z-30 transition-all">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">
                {selectedAgentMeta.id}
              </span>
              <h3 className="text-sm font-bold text-white">{selectedAgentMeta.name}</h3>
            </div>
            <button
              onClick={() => setSelectedAgentId(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Role:</span>
              <p className="text-slate-200">{selectedAgentMeta.role}</p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Execution Status:</span>
              {selectedAgentExec?.outputSummary ? (
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 mt-1 font-mono text-[11px]">
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Status: {selectedAgentExec.state}</span>
                    <span>Duration: {selectedAgentExec.durationMs}ms</span>
                  </div>
                  <p className="text-slate-300 font-sans mt-1 text-[11px] line-clamp-3">
                    {selectedAgentExec.outputSummary}
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 italic">No output message published yet in current run.</p>
              )}
            </div>

            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Assigned Tools:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {ALL_17_AGENTS[selectedAgentId].tools.map((t) => (
                  <span key={t} className="font-mono text-[9px] bg-slate-950 px-2 py-0.5 rounded text-amber-300 border border-slate-800">
                    {t}()
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
