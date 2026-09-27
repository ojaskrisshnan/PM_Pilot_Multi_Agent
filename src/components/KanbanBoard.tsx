import React, { useState } from 'react';
import type { ProjectState, UserStory, AgentId } from '../types/project';
import { ProjectStateStore } from '../engine/ProjectState';
import { ALL_17_AGENTS } from '../engine/AgentRoster';
import { Kanban, Plus, Bot, ChevronRight, ChevronLeft, X } from 'lucide-react';

interface KanbanBoardProps {
  state: ProjectState;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ state }) => {
  const { stories } = state;
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPoints, setNewPoints] = useState(5);
  const [newAssignee, setNewAssignee] = useState<AgentId>('BackendAgent');

  const columns: Array<{ id: UserStory['status']; label: string; color: string; border: string }> = [
    { id: 'To_Do', label: 'To Do', color: 'text-slate-400', border: 'border-slate-700' },
    { id: 'In_Progress', label: 'In Progress', color: 'text-indigo-400', border: 'border-indigo-500' },
    { id: 'Review', label: 'In Review', color: 'text-amber-400', border: 'border-amber-500' },
    { id: 'Done', label: 'Completed', color: 'text-emerald-400', border: 'border-emerald-500' }
  ];

  const filteredStories = stories.filter((s) => {
    const matchesAssignee = assigneeFilter === 'ALL' || s.assignee === assigneeFilter;
    const matchesPriority = priorityFilter === 'ALL' || s.priority === priorityFilter;
    return matchesAssignee && matchesPriority;
  });

  const handleMoveStatus = (storyId: string, direction: 'prev' | 'next', currentStatus: UserStory['status']) => {
    const order: UserStory['status'][] = ['To_Do', 'In_Progress', 'Review', 'Done'];
    const idx = order.indexOf(currentStatus);
    const nextIdx = direction === 'next' ? Math.min(order.length - 1, idx + 1) : Math.max(0, idx - 1);
    if (idx !== nextIdx) {
      ProjectStateStore.updateUserStoryStatus(storyId, order[nextIdx]);
    }
  };

  const handleAddCustomStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newStory: UserStory = {
      id: `STORY-${Date.now().toString().slice(-4)}`,
      epicId: 'EPIC-1',
      epic: 'Core Implementation',
      title: newTitle.trim(),
      description: 'Added via PM Kanban Command Bar',
      points: Number(newPoints),
      priority: 'Medium',
      status: 'To_Do',
      assignee: newAssignee,
      acceptanceCriteria: ['Adheres to specification guidelines', 'Unit tests passing'],
      tasks: []
    };

    state.stories.push(newStory);
    ProjectStateStore.recordEvent({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'SystemNotice',
      agentId: newAssignee,
      title: 'New Story Added to Backlog',
      detail: `Story "${newStory.title}" assigned to ${newAssignee}.`
    });

    setNewTitle('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Kanban className="w-5 h-5 text-indigo-400" />
            Interactive Agile Sprint Kanban
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time UserStory states bound directly to <strong className="text-indigo-400">ProjectState</strong>.
          </p>
        </div>

        {/* Filters and Add Story */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="ALL">All Assignees</option>
            {Object.keys(ALL_17_AGENTS).map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Story
          </button>
        </div>
      </div>

      {/* 4 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col, colIdx) => {
          const colStories = filteredStories.filter((s) => s.status === col.id);

          return (
            <div
              key={col.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 flex flex-col"
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between border-b-2 pb-2.5 ${col.border}`}>
                <span className={`text-xs font-black uppercase tracking-wider ${col.color}`}>
                  {col.label}
                </span>
                <span className="text-xs font-mono font-bold bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800 text-white">
                  {colStories.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 min-h-[460px] flex-1">
                {colStories.map((story) => (
                  <div
                    key={story.id}
                    onClick={() => setSelectedStory(story)}
                    className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-2xl space-y-2.5 transition-all shadow-md cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">
                        {story.id}
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        story.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        story.priority === 'High' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {story.priority}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {story.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{story.description}</p>

                    <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-300">
                        <Bot className="w-3.5 h-3.5 text-indigo-400" /> {story.assignee.replace('Agent', '')}
                      </span>
                      <span className="font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-slate-200">
                        {story.points} pts
                      </span>
                    </div>

                    {/* Interactive Click-to-Move Controls */}
                    <div
                      className="flex items-center justify-between pt-1 text-[10px] text-slate-500 border-t border-slate-800/40"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        disabled={colIdx === 0}
                        onClick={() => handleMoveStatus(story.id, 'prev', story.status)}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-20 flex items-center gap-0.5"
                        title="Move Left"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </button>
                      <span className="font-mono text-[9px]">Shift Status</span>
                      <button
                        disabled={colIdx === columns.length - 1}
                        onClick={() => handleMoveStatus(story.id, 'next', story.status)}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-20 flex items-center gap-0.5"
                        title="Move Right"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Story Detail Inspection Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">
                  {selectedStory.id} • {selectedStory.epic}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedStory.title}</h3>
              </div>
              <button onClick={() => setSelectedStory(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedStory.description}</p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Assignee</span>
                <strong className="text-white flex items-center gap-1 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" /> {selectedStory.assignee}
                </strong>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Story Points</span>
                <strong className="text-emerald-400 font-mono text-sm">{selectedStory.points} Fibonacci Points</strong>
              </div>
            </div>

            <div className="space-y-1 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Acceptance Criteria
              </span>
              <ul className="text-xs text-slate-300 list-disc list-inside space-y-0.5">
                {selectedStory.acceptanceCriteria.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedStory(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Story Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Create New Sprint User Story</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomStory} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Story Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement WebSocket gateway for live notifications"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Points</label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    min={1}
                    max={21}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Assignee</label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value as AgentId)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {Object.keys(ALL_17_AGENTS).map((id) => (
                      <option key={id} value={id}>{id}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
                >
                  Add Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
