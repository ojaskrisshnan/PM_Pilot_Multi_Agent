import React, { useState } from 'react';
import type { ProjectState } from '../types/project';
import { Activity, Search, Bot, Clock } from 'lucide-react';

interface EventStreamViewProps {
  state: ProjectState;
}

export const EventStreamView: React.FC<EventStreamViewProps> = ({ state }) => {
  const { events } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.agentId && evt.agentId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'ALL' || evt.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Event-Driven Audit Log & Inter-Agent Event Stream
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Asynchronous structured JSON events logged by <strong className="text-indigo-400">CommunicationAgent</strong>.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search event logs..."
              className="bg-slate-950 border border-slate-700 text-xs rounded-xl pl-9 pr-3 py-1.5 text-white focus:outline-none focus:border-indigo-500 w-48"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="ALL">All Event Types</option>
            <option value="AgentStarted">AgentStarted</option>
            <option value="AgentCompleted">AgentCompleted</option>
            <option value="ApprovalRequested">ApprovalRequested</option>
            <option value="HumanApproved">HumanApproved</option>
            <option value="RequirementChanged">RequirementChanged</option>
            <option value="WorkflowCompleted">WorkflowCompleted</option>
          </select>
        </div>
      </div>

      {/* Events Stream Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No events match the current filter.
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 p-4 rounded-2xl flex items-start gap-4 transition-all"
            >
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex-shrink-0 text-slate-400">
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded">
                      {evt.type}
                    </span>
                    {evt.agentId && (
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5 text-purple-400" /> {evt.agentId}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{evt.timestamp}</span>
                </div>

                <h4 className="text-xs font-bold text-slate-200">{evt.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{evt.detail}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
