import React from 'react';
import type { ProjectState } from '../types/project';
import { Kanban, Bot } from 'lucide-react';

interface UserStoriesViewProps {
  state: ProjectState;
}

export const UserStoriesView: React.FC<UserStoriesViewProps> = ({ state }) => {
  const { epics, stories } = state;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Kanban className="w-5 h-5 text-indigo-400" />
            Agile Backlog & User Story Decomposition
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Synthesized by <strong className="text-indigo-400">BusinessAnalystAgent</strong> into Epics, Fibonacci story points, and acceptance criteria.
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs text-slate-300">
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            {epics.length} Epics
          </div>
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            {stories.length} User Stories
          </div>
        </div>
      </div>

      {/* Epics Accordion / List */}
      <div className="space-y-4">
        {epics.map((epic) => {
          const epicStories = stories.filter((s) => s.epicId === epic.id || s.epic === epic.title);

          return (
            <div
              key={epic.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                    {epic.id}
                  </span>
                  <h3 className="text-sm font-bold text-white">{epic.title}</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {epicStories.length} stories
                </span>
              </div>
              <p className="text-xs text-slate-400">{epic.description}</p>

              {/* Stories in this Epic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {epicStories.map((story) => (
                  <div
                    key={story.id}
                    className="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl space-y-2 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[10px] font-bold text-indigo-400">
                        {story.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                          {story.points} pts
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {story.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white">{story.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{story.description}</p>

                    <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Bot className="w-3 h-3 text-indigo-400" /> {story.assignee}
                      </span>
                      <span className="text-slate-500">{story.priority} Priority</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
