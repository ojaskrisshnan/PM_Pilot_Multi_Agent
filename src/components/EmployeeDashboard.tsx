import React, { useState, useEffect } from 'react';
import { api, type User, type ProjectDto, type DeliverableDto } from '../api/client';
import { ALL_17_AGENTS } from '../engine/AgentRoster';
import type { AgentId } from '../types/project';
import {
  LogOut,
  FolderGit2,
  FileCode,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  Send,
  MessageSquare,
  BookmarkCheck,
  ShieldCheck,
  Users
} from 'lucide-react';

interface EmployeeDashboardProps {
  currentUser: User;
  onSignOut: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  currentUser,
  onSignOut
}) => {
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [deliverables, setDeliverables] = useState<DeliverableDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [employeeFeedback, setEmployeeFeedback] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Array<{ id: number; text: string; done: boolean }>>([
    { id: 1, text: 'Review upstream project requirements from analyst', done: true },
    { id: 2, text: 'Inspect system constraints & domain boundaries', done: true },
    { id: 3, text: 'Review AI agent synthesized specifications', done: false },
    { id: 4, text: 'Submit domain sign-off to Project Manager', done: false }
  ]);

  // The agent mapped to this employee's role
  const agentId = (currentUser.agent_role || 'UIUXAgent') as AgentId;
  const agentDef = ALL_17_AGENTS[agentId] || ALL_17_AGENTS['UIUXAgent'];

  useEffect(() => {
    fetchEmployeeProjects();
  }, []);

  const fetchEmployeeProjects = async () => {
    setLoading(true);
    try {
      const allProjects = await api.getProjects();
      setProjects(allProjects);

      if (allProjects.length > 0) {
        const initialProjId = allProjects[0].id;
        setSelectedProjectId(initialProjId);
        loadDeliverables(initialProjId);
      }
    } catch (err) {
      console.error('Failed to load employee projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDeliverables = async (projectId: string) => {
    try {
      const allDelivs = await api.getDeliverables(projectId);
      setDeliverables(allDelivs);
    } catch {
      setDeliverables([]);
    }
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    loadDeliverables(projectId);
  };

  const toggleChecklist = (id: number) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmitToManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeFeedback.trim()) return;

    setSubmissionStatus('Deliverables & notes submitted to Project Manager.');
    setEmployeeFeedback('');
    setTimeout(() => setSubmissionStatus(null), 4000);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const myAgentDeliverables = deliverables.filter(d => d.agent_id === agentId);
  const upstreamDeliverables = deliverables.filter(d => d.agent_id !== agentId).slice(0, 3);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-serif selection:bg-white selection:text-black">
      {/* Top Monochromatic Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white text-black rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-widest text-white uppercase">PMPilot</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400">
                EMPLOYEE WORKSPACE
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-mono">Assigned Domain: {currentUser.title || agentDef.name}</p>
          </div>
        </div>

        {/* User Identity & Sign Out */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-white font-semibold">{currentUser.name}</span>
            <span className="text-zinc-500 font-mono">({currentUser.email})</span>
          </div>

          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 text-xs font-mono transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Employee Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Role & Project Assignment Banner */}
        <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">Assigned Domain Work</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white text-black">
                  {currentUser.title || agentDef.role}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mt-1.5">
                Welcome, {currentUser.name}
              </h1>
              <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Your manager has assigned you to manage the <strong>{agentDef.name}</strong> responsibilities for the project.
                Your AI agent partner has synthesized the deliverables and technical specifications below.
              </p>
            </div>

            {/* Project Switcher */}
            <div className="space-y-1.5 shrink-0">
              <label className="text-xs font-mono text-zinc-400 block">Assigned Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-zinc-500 min-w-56"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-zinc-500 uppercase">Loading assigned work...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: AI Agent Partner & Deliverables */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Agent Partner Card */}
              <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
                <div className="flex items-start justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-white">{agentDef.name}</h2>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400">
                          AI PARTNER
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">{agentDef.role}</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                    Phase {agentDef.phaseOrder}
                  </span>
                </div>

                {/* Agent Prompt & System SOP */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                    Agent Standard Operating Procedure (SOP)
                  </div>
                  <p className="text-xs font-mono text-zinc-300 bg-black p-3 rounded-lg border border-zinc-900 leading-relaxed">
                    {agentDef.systemPrompt}
                  </p>
                </div>
              </div>

              {/* My Domain Deliverables */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    My Domain Deliverables ({myAgentDeliverables.length})
                  </h3>
                  <span className="text-xs text-zinc-500 font-mono">Synthesized for {selectedProject?.name}</span>
                </div>

                {myAgentDeliverables.length === 0 ? (
                  <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center space-y-2 bg-zinc-950/40">
                    <FolderGit2 className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-xs text-zinc-400">No deliverables generated yet for {agentDef.name}.</p>
                    <p className="text-[11px] text-zinc-600 font-mono">
                      Your manager can launch the project workflow to synthesize these artifacts.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myAgentDeliverables.map((deliv) => (
                      <div key={deliv.id} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileCode className="w-4 h-4 text-zinc-300" />
                            <span className="text-xs font-bold text-white">{deliv.title}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black text-zinc-400 uppercase">
                              {deliv.type}
                            </span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(deliv.content, deliv.id)}
                            className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedId === deliv.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId === deliv.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="p-4 text-xs font-mono text-zinc-300 bg-black overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-80">
                          {deliv.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upstream Collaboration Card */}
              {upstreamDeliverables.length > 0 && (
                <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Upstream Inputs From Other Team Agents
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Cross-Agent Pipeline</span>
                  </div>
                  <div className="space-y-2">
                    {upstreamDeliverables.map(ud => (
                      <div key={ud.id} className="p-3 bg-black border border-zinc-900 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-zinc-200">{ud.title}</div>
                          <div className="text-[10px] font-mono text-zinc-500">Origin: {ud.agent_id}</div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(ud.content, ud.id)}
                          className="text-[11px] font-mono text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-900 border border-zinc-800 cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Placeholders for Employee Action Items & Manager Submissions */}
            <div className="space-y-6">
              {/* Action Items Checklist */}
              <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <BookmarkCheck className="w-3.5 h-3.5 text-zinc-400" />
                    <span>My Task Checklist</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {checklist.filter(c => c.done).length}/{checklist.length} Done
                  </span>
                </div>

                <div className="space-y-2">
                  {checklist.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklist(item.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center gap-2.5 transition-all ${
                        item.done
                          ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400 line-through'
                          : 'bg-black border-zinc-800 text-zinc-200 hover:border-zinc-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => {}}
                        className="rounded border-zinc-700 bg-black text-white"
                      />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manager Directives & Notes Placeholder */}
              <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Manager Directives & Feedback</span>
                  </span>
                </div>

                <div className="p-3 bg-black border border-zinc-900 rounded-lg space-y-1.5">
                  <div className="text-[10px] font-mono text-zinc-500">From: Senior Project Manager</div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    &ldquo;Ensure that all deliverables for {selectedProject?.name} adhere to enterprise compliance, responsiveness, and dark-mode standards.&rdquo;
                  </p>
                </div>
              </div>

              {/* Submit Review to Manager Form */}
              <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Submit Updates to Manager
                  </span>
                </div>

                {submissionStatus && (
                  <div className="p-2.5 bg-zinc-900 border border-zinc-700 text-xs text-white rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>{submissionStatus}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitToManager} className="space-y-3">
                  <textarea
                    rows={3}
                    value={employeeFeedback}
                    onChange={(e) => setEmployeeFeedback(e.target.value)}
                    placeholder="Enter review notes, refined design specifications, or status updates for your project manager..."
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none font-mono"
                  />

                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Domain Sign-Off</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
