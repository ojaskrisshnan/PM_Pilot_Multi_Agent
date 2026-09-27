import React, { useState } from 'react';
import type { AgentId } from '../types/project';
import { ALL_17_AGENTS } from '../engine/AgentRoster';
import { AGENT_ROSTER } from '../engine/AgentRegistry';
import { HybridRouter } from '../engine/LLMProvider';
import { ProjectStateStore } from '../engine/ProjectState';
import {
  Bot,
  FileText,
  Code2,
  Wrench,
  ChevronRight,
  Terminal,
  Send,
  Sparkles,
  Clock
} from 'lucide-react';

export const AgentSkillInspector: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>('ProductManagerAgent');
  const [activeFileTab, setActiveFileTab] = useState<
    'SANDBOX' | 'EXECUTION' | 'SKILL.md' | 'prompt.md' | 'tools.json' | 'schemas'
  >('EXECUTION');

  // Sandbox State
  const [userQuery, setUserQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [sandboxHistory, setSandboxHistory] = useState<
    Array<{
      query: string;
      response: string;
      provider: string;
      latencyMs: number;
      toolCall?: any;
    }>
  >([]);

  const agentIds = Object.keys(ALL_17_AGENTS) as AgentId[];
  const agentDef = ALL_17_AGENTS[selectedAgentId];
  const legacyMeta = AGENT_ROSTER[selectedAgentId];
  const currentState = ProjectStateStore.getState();
  const execState = currentState.agentExecutions[selectedAgentId];

  const handleRunSandboxQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || isQuerying) return;

    setIsQuerying(true);
    const query = userQuery.trim();

    try {
      const response = await HybridRouter.query({
        agentId: selectedAgentId,
        systemPrompt: agentDef.systemPrompt,
        userPrompt: `Project Context: ${currentState.project.name} (${currentState.project.domain})\nUser Directive: ${query}`
      });

      setSandboxHistory(prev => [
        {
          query,
          response: response.content,
          provider: response.provider.toUpperCase(),
          latencyMs: response.latencyMs,
          toolCall: response.toolCalls?.[0]
        },
        ...prev
      ]);
      setUserQuery('');
    } catch (err: any) {
      setSandboxHistory(prev => [
        {
          query,
          response: `Execution error: ${err.message}`,
          provider: 'ERROR',
          latencyMs: 0
        },
        ...prev
      ]);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-400" />
            17 Domain Agents Skill & Interactive Playground
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect formal SKILL.md specs, tools, and run interactive ad-hoc prompts directly against any of the 17 domain agents.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Agent Lifecycle:</span>
          <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${
            execState?.state === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
            execState?.state === 'Running' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
            'bg-slate-800 text-slate-400'
          }`}>
            {execState?.state || 'Idle'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Agent Selector Roster */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl space-y-1 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Agent Roster ({agentIds.length})
          </div>
          {agentIds.map((id) => {
            const item = ALL_17_AGENTS[id];
            const isSelected = selectedAgentId === id;
            const currentExec = currentState.agentExecutions[id];

            return (
              <button
                key={id}
                onClick={() => {
                  setSelectedAgentId(id);
                  setSandboxHistory([]);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                    : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 font-medium'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Bot className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span className="truncate">{item.name.replace(' Agent', '')}</span>
                </div>
                <div className="flex items-center gap-1">
                  {currentExec?.state === 'Completed' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Inspector & Sandbox */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-5">
          {/* Header Banner */}
          <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-indigo-400 font-bold uppercase">{agentDef.id}</span>
              <h3 className="text-xl font-extrabold text-white">{agentDef.name}</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{agentDef.role}</p>
            </div>
            <div className="text-right text-xs">
              <span className="text-slate-500 block">Phase Order:</span>
              <span className="font-mono text-emerald-400 font-bold">Phase {agentDef.phaseOrder} ({agentDef.typicalDurationDays}d)</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-2">
            <button
              onClick={() => setActiveFileTab('EXECUTION')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFileTab === 'EXECUTION'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-emerald-300" /> Execution & Deliverables
            </button>
            <button
              onClick={() => setActiveFileTab('SANDBOX')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFileTab === 'SANDBOX'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-amber-300" /> Prompt Agent Sandbox
            </button>
            <button
              onClick={() => setActiveFileTab('SKILL.md')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFileTab === 'SKILL.md' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> SKILL.md
            </button>
            <button
              onClick={() => setActiveFileTab('prompt.md')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFileTab === 'prompt.md' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> System Prompt
            </button>
            <button
              onClick={() => setActiveFileTab('tools.json')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFileTab === 'tools.json' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" /> Tools ({agentDef.tools.length})
            </button>
          </div>

          {/* TAB 0: Execution & Deliverables Status (Phase 10 Specification) */}
          {activeFileTab === 'EXECUTION' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Agent Status</div>
                  <div className="text-xs font-bold text-white mt-1 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      execState?.state === 'Completed' ? 'bg-emerald-400' :
                      execState?.state === 'Running' ? 'bg-amber-400 animate-ping' :
                      execState?.state === 'Failed' ? 'bg-rose-400' : 'bg-slate-500'
                    }`} />
                    {execState?.state || 'Idle / Pending'}
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Execution Time</div>
                  <div className="text-xs font-bold text-emerald-400 font-mono mt-1">
                    {execState?.durationMs ? `${execState.durationMs} ms` : 'Not run yet'}
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Approval Gate</div>
                  <div className="text-xs font-bold font-mono mt-1">
                    {agentDef.approvalRequired ? (
                      <span className="text-amber-400">HITL Required</span>
                    ) : (
                      <span className="text-slate-400">Automated</span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Timing</div>
                  <div className="text-[11px] text-slate-300 font-mono mt-1">
                    {execState?.startTime ? `${execState.startTime} - ${execState.endTime || '...'}` : 'Pending'}
                  </div>
                </div>
              </div>

              {/* Dependencies & Upstream Outputs Used */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Upstream Dependencies ({agentDef.dependencies.length})</span>
                  <span className="text-[10px] text-slate-500 font-mono">Acyclic DAG Propagation</span>
                </div>
                {agentDef.dependencies.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No upstream dependencies. Operates as initial SDLC entry point.</p>
                ) : (
                  <div className="space-y-2">
                    {agentDef.dependencies.map((depId) => {
                      const depExec = currentState.agentExecutions[depId];
                      return (
                        <div key={depId} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-400">{depId}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              depExec?.state === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {depExec?.state || 'Pending'}
                            </span>
                          </div>
                          {depExec?.outputSummary && (
                            <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">
                              {depExec.outputSummary}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Structured Output & Generated Deliverables */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Structured Output & Synthesis</span>
                  <span className="text-[10px] text-emerald-400 font-mono">IEEE Deliverable Compliant</span>
                </div>
                {execState?.outputSummary ? (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                    {execState.outputSummary}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Deliverables will appear here once {agentDef.name} executes in the workflow run.
                  </p>
                )}

                {/* Target Output Artifacts */}
                <div className="pt-2">
                  <div className="text-[10px] text-slate-500 uppercase font-mono mb-1.5">Target Output Artifacts:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {agentDef.outputArtifacts.map((art, idx) => (
                      <span key={idx} className="bg-slate-950 border border-slate-800 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-mono">
                        {art}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {execState?.error && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-2xl text-xs text-rose-300 font-mono">
                  <strong>Execution Error:</strong> {execState.error}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: Prompt Agent Sandbox Terminal (Section 18 Specification) */}
          {activeFileTab === 'SANDBOX' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Interactive Single-Agent Terminal: Prompt {agentDef.name}
                </span>

                <form onSubmit={handleRunSandboxQuery} className="flex gap-2">
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder={`e.g. Ask ${agentDef.name.replace(' Agent', '')}: Evaluate Redis Lua vs Kafka transactions...`}
                    disabled={isQuerying}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={isQuerying || !userQuery.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md"
                  >
                    {isQuerying ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{isQuerying ? 'Querying...' : 'Run Agent'}</span>
                  </button>
                </form>
              </div>

              {/* Sandbox Responses Stream */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                {sandboxHistory.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                    Type an ad-hoc query above to test {agentDef.name} in isolation. Responses utilize active LLM Provider or Demo Fallback.
                  </div>
                ) : (
                  sandboxHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2.5 animate-in fade-in"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-indigo-400 font-bold">User Query</span>
                        <span className="text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {item.provider} • {item.latencyMs}ms
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white">"{item.query}"</p>

                      <div className="border-t border-slate-800 pt-2 space-y-1">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                          Agent Synthesis:
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                          {item.response}
                        </p>
                      </div>

                      {item.toolCall && (
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 font-mono text-[10px] text-amber-300">
                          <span className="text-slate-500 block">Tool Executed:</span>
                          <code>{item.toolCall.tool}({JSON.stringify(item.toolCall.args)})</code>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SKILL.md */}
          {activeFileTab === 'SKILL.md' && (
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto max-h-[440px] custom-scrollbar text-slate-300 space-y-2">
              <div className="text-indigo-400 font-bold">--- SKILL.md Definition ---</div>
              <pre className="whitespace-pre-wrap leading-5">
                {legacyMeta?.skillContent || `# ${agentDef.name} Skill\nRole: ${agentDef.role}\nResponsibilities:\n- ${agentDef.inputArtifacts.join('\n- ')}\nTools: ${agentDef.tools.join(', ')}`}
              </pre>
            </div>
          )}

          {/* TAB 3: System Prompt */}
          {activeFileTab === 'prompt.md' && (
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto max-h-[440px] custom-scrollbar text-slate-300 space-y-2">
              <div className="text-purple-400 font-bold">--- System Prompt Configuration ---</div>
              <pre className="whitespace-pre-wrap leading-5">{agentDef.systemPrompt}</pre>
            </div>
          )}

          {/* TAB 4: Tools */}
          {activeFileTab === 'tools.json' && (
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1 custom-scrollbar">
              {agentDef.tools.map((t, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-1">
                  <span className="text-xs font-mono font-bold text-amber-400">{t}()</span>
                  <p className="text-[11px] text-slate-400">
                    Standard operating procedure utility bound to {agentDef.id} tool calling registry.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
