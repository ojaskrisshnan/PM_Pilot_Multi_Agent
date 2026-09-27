import React, { useState } from 'react';
import type { AgentId, SharedMemoryState } from '../types/agent';
import { AGENT_ROSTER } from '../engine/AgentRegistry';
import { 
  Bot, 
  Terminal, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  CheckCircle2, 
  Clock, 
  Code2,
  Wrench
} from 'lucide-react';

interface ChatStreamProps {
  memory: SharedMemoryState;
  activeAgent: AgentId | null;
}

export const InterAgentChatStream: React.FC<ChatStreamProps> = ({ memory, activeAgent }) => {
  const [filterAgent, setFilterAgent] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const messages = memory.interAgentMessages;

  const filteredMessages = messages.filter((msg) => {
    const matchesAgent = filterAgent === 'ALL' || msg.agent === filterAgent;
    const matchesQuery =
      searchQuery === '' ||
      msg.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.agent.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAgent && matchesQuery;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
      {/* Top Filter & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            Inter-Agent Communication & Tool Call Stream
          </h2>
          <p className="text-xs text-slate-400">
            Real-time event stream showing structured JSON payload exchanges and tool calls between ProductManagerAgent and specialized domain agents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Agent Filter Selector */}
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-semibold"
          >
            <option value="ALL">All Agents (17)</option>
            {Object.keys(AGENT_ROSTER).map((id) => (
              <option key={id} value={id}>
                {AGENT_ROSTER[id as AgentId].name}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stream..."
              className="bg-slate-950 border border-slate-700/80 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Active Running Agent Indicator */}
      {activeAgent && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                ACTIVE DISPATCH: {activeAgent}
              </span>
              <p className="text-xs text-amber-200 font-medium">
                ProductManagerAgent is executing {AGENT_ROSTER[activeAgent]?.name}...
              </p>
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
        </div>
      )}

      {/* Messages List */}
      <div className="space-y-4 max-h-[680px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-2xl">
            <Terminal className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 font-semibold text-sm">No agent messages recorded yet.</p>
            <p className="text-slate-500 text-xs mt-1">
              Click <span className="text-indigo-400 font-bold">"Dispatch SDLC"</span> in the top navbar to trigger orchestration.
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isExpanded = expandedId === msg.id;
            const meta = AGENT_ROSTER[msg.agent];

            return (
              <div
                key={msg.id}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 transition-all hover:border-slate-700"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${
                      msg.agent === 'ProductManagerAgent'
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                        : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                    }`}>
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-white">{meta?.name || msg.agent}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">{meta?.role}</p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3 h-3" /> {msg.status}
                    </span>
                    <span className={`font-mono text-[11px] px-2.5 py-1 rounded-lg font-bold ${
                      msg.risk === 'High' || msg.risk === 'Critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : msg.risk === 'Medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      Risk: {msg.risk}
                    </span>
                    <span className="font-mono text-[11px] bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-purple-300">
                      <Clock className="w-3 h-3 inline mr-1" /> {msg.estimated_days}d
                    </span>
                  </div>
                </div>

                {/* Summary & Structured JSON Preview */}
                <div className="mt-3 space-y-3">
                  <p className="text-sm font-medium text-slate-200">{msg.summary}</p>

                  {/* Tool Call Log Badges if present */}
                  {msg.tool_calls && msg.tool_calls.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-indigo-400" /> Tools Executed ({msg.tool_calls.length})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {msg.tool_calls.map((tc, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-900 border border-indigo-500/20 text-indigo-300 text-[11px] px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5"
                          >
                            <Code2 className="w-3 h-3 text-indigo-400" />
                            <span>{tc.tool}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Toggle JSON Payload Details */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    {isExpanded ? 'Hide Raw JSON Payload' : 'View Full Structured JSON Payload'}
                  </button>

                  {/* Expanded JSON Box */}
                  {isExpanded && (
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto">
                      <pre>
                        {JSON.stringify(
                          {
                            agent: msg.agent,
                            status: msg.status,
                            risk: msg.risk,
                            estimated_days: msg.estimated_days,
                            dependencies: msg.dependencies,
                            summary: msg.summary,
                            payload: msg.payload
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
