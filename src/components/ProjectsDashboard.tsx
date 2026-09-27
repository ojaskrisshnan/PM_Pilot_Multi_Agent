import React, { useState, useEffect } from 'react';
import { api, type ProjectDto, type RunDto, type User } from '../api/client';
import { ALL_17_AGENTS } from '../engine/AgentRoster';
import type { AgentId } from '../types/project';
import {
  Plus,
  FolderGit2,
  Play,
  Trash2,
  Search,
  LogOut,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Users,
  Check,
  DollarSign,
  Activity,
  Calendar,
  FileDown
} from 'lucide-react';

interface ProjectsDashboardProps {
  currentUser: User;
  onSelectProject: (project: ProjectDto) => void;
  onSignOut: () => void;
}

const PRESET_TEMPLATES = [
  {
    name: 'Campus Event Management Platform',
    domain: 'Education',
    description: 'Build a campus event management platform for organizing college events, registrations, participants, venues, schedules, and notifications.'
  },
  {
    name: 'Autonomous High-Frequency Trading Desk',
    domain: 'Fintech',
    description: 'Sub-millisecond order matching engine with algorithmic execution, risk guardrails, real-time telemetry, and regulatory compliance.'
  },
  {
    name: 'Clinical Patient Triage & Diagnostics',
    domain: 'Healthcare',
    description: 'HIPAA-compliant distributed healthcare coordination system with FHIR integration, triage prioritization, and audit logging.'
  },
  {
    name: 'Global Supply Chain Logistics Tracker',
    domain: 'Logistics',
    description: 'Real-time multi-modal shipment tracking engine with predictive ETAs, IoT sensor telemetry ingestion, and customs clearance.'
  }
];

export const ProjectsDashboard: React.FC<ProjectsDashboardProps> = ({
  currentUser,
  onSelectProject,
  onSignOut
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'team' | 'placeholders'>('projects');
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [projectRuns, setProjectRuns] = useState<Record<string, RunDto[]>>({});
  const [team, setTeam] = useState<User[]>([]);
  const [selectedAssignProjectId, setSelectedAssignProjectId] = useState<string>('');
  const [projectAssignments, setProjectAssignments] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assignSuccessMsg, setAssignSuccessMsg] = useState<string | null>(null);

  // New Project Form State
  const [newName, setNewName] = useState('');
  const [newDomain, setNewDomain] = useState('Education');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [allProjects, teamMembers] = await Promise.all([
        api.getProjects(),
        api.getTeam()
      ]);
      setProjects(allProjects);
      setTeam(teamMembers);

      if (allProjects.length > 0) {
        setSelectedAssignProjectId(allProjects[0].id);
        loadProjectAssignments(allProjects[0].id);
      }

      // Fetch runs for each project
      const runsMap: Record<string, RunDto[]> = {};
      for (const p of allProjects) {
        try {
          const runs = await api.getProjectRuns(p.id);
          runsMap[p.id] = runs;
        } catch {
          runsMap[p.id] = [];
        }
      }
      setProjectRuns(runsMap);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectAssignments = async (projId: string) => {
    try {
      const asg = await api.getProjectAssignments(projId);
      setProjectAssignments(asg);
    } catch {
      setProjectAssignments({});
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    setCreateError(null);
    try {
      const created = await api.createProject({
        name: newName.trim(),
        domain: newDomain,
        description: newDescription.trim(),
        config: { domain: newDomain }
      });

      setIsCreateModalOpen(false);
      setNewName('');
      setNewDescription('');
      onSelectProject(created);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project and all its runs?')) return;

    try {
      await api.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err: any) {
      alert(`Could not delete project: ${err.message}`);
    }
  };

  const handleAssignChange = async (agentId: string, userId: string) => {
    if (!selectedAssignProjectId) return;
    try {
      await api.assignEmployee(selectedAssignProjectId, agentId, userId);
      await loadProjectAssignments(selectedAssignProjectId);
      setAssignSuccessMsg(`Assigned employee to ${agentId}`);
      setTimeout(() => setAssignSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
    }
  };

  const handleDownloadReport = async (runId: string, projectName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const blob = await api.exportRunBlob(runId, 'docx');
      const url = URL.createObjectURL(blob);
      const safe = projectName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const a = document.createElement('a');
      a.href = url;
      a.download = `PMPilot_${safe}_Report.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Could not download Word document: ${err.message}`);
    }
  };

  const applyTemplate = (tpl: typeof PRESET_TEMPLATES[0]) => {
    setNewName(tpl.name);
    setNewDomain(tpl.domain);
    setNewDescription(tpl.description);
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-serif selection:bg-white selection:text-black">
      {/* Top Monochromatic Navigation Bar */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white text-black rounded-lg">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-widest text-white uppercase">PMPilot</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400">
                MANAGER DASHBOARD
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-mono">Autonomous Multi-Agent SDLC Platform</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="hidden md:flex items-center p-1 rounded-lg border border-zinc-800 bg-black text-xs font-mono">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'projects' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'team' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Team &amp; Role Assignments
          </button>
          <button
            onClick={() => setActiveTab('placeholders')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'placeholders' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Resource Placeholders
          </button>
        </div>

        {/* User Account & Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-200 font-medium">{currentUser.name}</span>
            <span className="text-zinc-500 font-mono">({currentUser.role || 'manager'})</span>
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        {/* TAB 1: PROJECTS LIST */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">My Projects</h1>
                <p className="text-sm text-zinc-400 mt-1">
                  Manage software projects, assign domain leads, and execute the 17-agent workflow.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects..."
                    className="pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 w-64"
                  />
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Project</span>
                </button>
              </div>
            </div>

            {/* Project List / Grid */}
            {loading ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Loading project registry...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="py-20 border border-dashed border-zinc-800 rounded-2xl text-center space-y-4 bg-zinc-950/50">
                <FolderGit2 className="w-10 h-10 text-zinc-600 mx-auto" />
                <div>
                  <h3 className="text-sm font-semibold text-white">No projects found</h3>
                  <p className="text-xs text-zinc-500 mt-1">Create your first software project to begin assigning roles.</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Project</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => {
                  const runs = projectRuns[project.id] || [];
                  const latestRun = runs[0];

                  return (
                    <div
                      key={project.id}
                      onClick={() => onSelectProject(project)}
                      className="group p-5 bg-zinc-950 border border-zinc-800 hover:border-zinc-500 rounded-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-xl"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-300 uppercase tracking-wider">
                            {project.domain}
                          </span>
                          <button
                            title="Delete project"
                            onClick={(e) => handleDeleteProject(project.id, e)}
                            className="text-zinc-600 hover:text-zinc-300 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors">
                          {project.name}
                        </h3>

                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {project.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-zinc-900 space-y-3">
                        {/* Run status info */}
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-zinc-500">
                            {runs.length === 0 ? 'No runs executed' : `${runs.length} workflow run${runs.length > 1 ? 's' : ''}`}
                          </span>

                          {latestRun && (
                            <div className="flex items-center gap-1.5">
                              {latestRun.status === 'COMPLETED' ? (
                                <span className="flex items-center gap-1 text-zinc-300 font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                  <span>17/17 Done</span>
                                </span>
                              ) : latestRun.status === 'RUNNING' ? (
                                <span className="flex items-center gap-1 text-white animate-pulse">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Running</span>
                                </span>
                              ) : latestRun.status === 'PAUSED' ? (
                                <span className="flex items-center gap-1 text-zinc-400">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Paused</span>
                                </span>
                              ) : latestRun.status === 'AWAITING_APPROVAL' ? (
                                <span className="flex items-center gap-1 text-white underline">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Awaiting PM</span>
                                </span>
                              ) : (
                                <span className="text-zinc-500">{latestRun.status}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Open Workflow & Download Report button */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 py-2 px-3 bg-zinc-900 group-hover:bg-white group-hover:text-black text-zinc-200 text-xs font-semibold rounded-lg transition-all flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Play className="w-3 h-3 fill-current" />
                              <span>Open Workflow</span>
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>

                          {latestRun && (
                            <button
                              type="button"
                              title="Download Full SDLC Stage Report as Word Document (.docx)"
                              onClick={(e) => handleDownloadReport(latestRun.id, project.name, e)}
                              className="py-2 px-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 shrink-0"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                              <span>Word (.docx)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TEAM & ROLE ASSIGNMENTS */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Team &amp; Role Assignments</h1>
                <p className="text-sm text-zinc-400 mt-1">
                  Assign your employees to specific AI agent roles for each project.
                </p>
              </div>

              {/* Select Project to assign */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-zinc-400">Project:</span>
                <select
                  value={selectedAssignProjectId}
                  onChange={(e) => {
                    setSelectedAssignProjectId(e.target.value);
                    loadProjectAssignments(e.target.value);
                  }}
                  className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-zinc-500"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {assignSuccessMsg && (
              <div className="p-3 bg-zinc-900 border border-zinc-700 text-xs text-white rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-white" />
                <span>{assignSuccessMsg}</span>
              </div>
            )}

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(ALL_17_AGENTS).map((agentKey) => {
                const agent = ALL_17_AGENTS[agentKey as AgentId];
                const currentAssigned = projectAssignments[agent.id];

                return (
                  <div key={agent.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{agent.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                            Phase {agent.phaseOrder}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{agent.role}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-900 flex items-center justify-between gap-3">
                      <div className="text-xs font-mono text-zinc-400">
                        {currentAssigned ? (
                          <div className="flex items-center gap-1.5 text-white">
                            <Users className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{currentAssigned.name} ({currentAssigned.title || 'Specialist'})</span>
                          </div>
                        ) : (
                          <span className="text-zinc-600">Unassigned</span>
                        )}
                      </div>

                      <select
                        value={currentAssigned?.id || ''}
                        onChange={(e) => handleAssignChange(agent.id, e.target.value)}
                        className="px-2.5 py-1.5 bg-black border border-zinc-800 rounded text-xs font-mono text-white focus:outline-none focus:border-zinc-500 cursor-pointer"
                      >
                        <option value="">Assign Employee...</option>
                        {team.filter(t => t.role === 'employee').map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.title || emp.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: WORKPLACE PLACEHOLDERS */}
        {activeTab === 'placeholders' && (
          <div className="space-y-6">
            <div className="pb-6 border-b border-zinc-800">
              <h1 className="text-2xl font-bold tracking-tight text-white">Workplace Placeholders &amp; Analytics</h1>
              <p className="text-sm text-zinc-400 mt-1">
                Structured placeholders for team capacity, cloud billing, sprint milestones, and compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sprint Schedule Placeholder */}
              <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-white" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sprint Milestone Schedule</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400">SPRINT 01</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-black border border-zinc-900 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-zinc-200">Phase 1-3: Requirements &amp; Architecture Sign-Off</div>
                      <div className="text-[10px] font-mono text-zinc-500">Days 1 - 4 • Led by Marcus Chen &amp; Rachel Adams</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-white">COMPLETED</span>
                  </div>
                  <div className="p-3 bg-black border border-zinc-900 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-zinc-200">Phase 4-7: UI/UX Wireframes &amp; API Implementation</div>
                      <div className="text-[10px] font-mono text-zinc-500">Days 5 - 12 • Led by Alice Vance &amp; David Miller</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400">IN PROGRESS</span>
                  </div>
                  <div className="p-3 bg-black border border-zinc-900 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-zinc-200">Phase 8-14: Security Audit &amp; Automated Testing</div>
                      <div className="text-[10px] font-mono text-zinc-500">Days 13 - 18 • Led by Vikram Patel &amp; Sarah Jenkins</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-600">UPCOMING</span>
                  </div>
                </div>
              </div>

              {/* Resource Capacity Placeholder */}
              <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-white" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Resource Utilization Matrix</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400">CAPACITY: 85%</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-300">
                      <span>Engineering Team Bandwidth</span>
                      <span className="font-mono">8 / 10 Active</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-white h-2 rounded-full w-4/5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-300">
                      <span>AI Multi-Agent Execution Pipeline</span>
                      <span className="font-mono">17 Agents Configured</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-white h-2 rounded-full w-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cloud Budget Forecast Placeholder */}
              <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-white" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cloud Infrastructure Budget</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400">FORECAST</span>
                </div>
                <div className="p-4 bg-black border border-zinc-900 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>LLM Synthesis &amp; Agent Tokens</span>
                    <span className="font-mono text-white">$42.80 / run</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Kubernetes Cluster &amp; DB Storage</span>
                    <span className="font-mono text-white">$240.00 / mo</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 pt-2 border-t border-zinc-900 font-bold">
                    <span className="text-white">Total Projected Monthly Run Rate</span>
                    <span className="font-mono text-white">$325.60</span>
                  </div>
                </div>
              </div>

              {/* Compliance & Audit Placeholder */}
              <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Compliance &amp; Readiness</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400">STATUS: PASS</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-black border border-zinc-900 rounded-lg flex items-center justify-between">
                    <span className="text-zinc-300">SOC2 Type II Audit Artifacts</span>
                    <span className="text-white font-mono">VERIFIED</span>
                  </div>
                  <div className="p-3 bg-black border border-zinc-900 rounded-lg flex items-center justify-between">
                    <span className="text-zinc-300">STRIDE Threat Model Sign-Off</span>
                    <span className="text-white font-mono">APPROVED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create New Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">Create New Project</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Define your software project to generate its multi-agent SDLC workflow.</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-500 hover:text-white text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Templates */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Quick Presets</span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="p-2.5 text-left bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-600 rounded-lg transition-all cursor-pointer"
                  >
                    <div className="text-xs font-semibold text-white truncate">{tpl.name}</div>
                    <div className="text-[10px] font-mono text-zinc-500">{tpl.domain}</div>
                  </button>
                ))}
              </div>
            </div>

            {createError && (
              <div className="p-3 bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded-lg">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400">Project Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Campus Event Management Platform"
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400">Domain / Industry</label>
                <select
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="Education">Education</option>
                  <option value="Fintech">Fintech</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Logistics">Logistics</option>
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="DevTools">DevTools</option>
                  <option value="General">General Software</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400">Project Description &amp; Goal Prompt</label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe the system architecture, target users, and key deliverables for the agents to build..."
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-zinc-800 hover:border-zinc-600 rounded-lg text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {creating ? (
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create &amp; Open Workflow</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
