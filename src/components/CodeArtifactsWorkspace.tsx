import React, { useState, useEffect, useCallback } from 'react';
import type { ProjectState, Artifact } from '../types/project';
import {
  FileCode2,
  Copy,
  Check,
  Download,
  Bot,
  Play,
  Calendar,
  Tag,
  Plus,
  Trash2
} from 'lucide-react';

interface CodeArtifactsWorkspaceProps {
  state: ProjectState;
}

interface DemoTask {
  id: string;
  title: string;
  course: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  deadline: string;
  completed: boolean;
}

export const CodeArtifactsWorkspace: React.FC<CodeArtifactsWorkspaceProps> = ({ state }) => {
  const { artifacts, project } = state;
  const [activeView, setActiveView] = useState<'preview' | 'code'>('preview');
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(
    artifacts[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);

  const isStudent = /student|task|todo|study/i.test(project.name + ' ' + project.domain);
  const isSynapse = /synapse|bci|brain|neuro|telemetry/i.test(project.name + ' ' + project.domain);
  const isHealth = /health|clinic|patient|doctor|medical/i.test(project.name + ' ' + project.domain);
  const isCommerce = /e-?commerce|shop|store|order|cart/i.test(project.name + ' ' + project.domain);

  const getInitialItems = useCallback((): DemoTask[] => {
    if (isSynapse) {
      return [
        { id: '1', title: 'Alpha Wave Synchronizer (8-12 Hz)', course: 'Ch-01 Frontal', priority: 'Urgent', deadline: 'Streaming Live', completed: true },
        { id: '2', title: 'Beta Wave Motor Cortex Calibration', course: 'Ch-04 Parietal', priority: 'High', deadline: 'Calibrated', completed: false },
        { id: '3', title: 'Theta Band Fatigue Classifier Stream', course: 'Ch-07 Occipital', priority: 'Medium', deadline: 'Buffering', completed: false },
        { id: '4', title: 'Subject Cognitive Load Session Record', course: 'Session #1042', priority: 'Low', deadline: 'Archived', completed: true }
      ];
    }
    if (isHealth) {
      return [
        { id: '1', title: 'Emergency Triage: Acute Chest Pain Protocol', course: 'Cardiology', priority: 'Urgent', deadline: 'Immediate', completed: false },
        { id: '2', title: 'Outpatient Follow-up: Diabetic Panel Review', course: 'Endocrinology', priority: 'High', deadline: 'Today, 3:30 PM', completed: false },
        { id: '3', title: 'Telehealth Consult: Post-Op Wound Inspection', course: 'Surgery', priority: 'Medium', deadline: 'Tomorrow, 10:00 AM', completed: true },
        { id: '4', title: 'Digital e-Prescription Renewal: Metformin 500mg', course: 'Pharmacy', priority: 'Low', deadline: 'Pending Pickup', completed: true }
      ];
    }
    if (isCommerce) {
      return [
        { id: '1', title: 'Flash Drop: Nike Air Jordan Retro 4 (Size 10)', course: 'Footwear', priority: 'Urgent', deadline: 'Stock: 4 Units', completed: false },
        { id: '2', title: 'Order #89204: Expedited Courier Dispatch', course: 'Fulfillment', priority: 'High', deadline: 'Ship Today', completed: false },
        { id: '3', title: 'Merchant Onboarding KYC & Stripe Verification', course: 'Vendor Desk', priority: 'Medium', deadline: 'Verified', completed: true },
        { id: '4', title: 'Cart Recovery Automation Trigger', course: 'Marketing', priority: 'Low', deadline: 'Automated', completed: true }
      ];
    }
    if (isStudent) {
      return [
        { id: '1', title: 'Calculus III Problem Set 4', course: 'MATH 301', priority: 'Urgent', deadline: 'Today, 11:59 PM', completed: false },
        { id: '2', title: 'Operating Systems Virtual Memory Lab', course: 'CS 420', priority: 'High', deadline: 'Tomorrow, 5:00 PM', completed: false },
        { id: '3', title: 'Database Normalization Assignment', course: 'CS 340', priority: 'Medium', deadline: 'Thursday, 2:00 PM', completed: false },
        { id: '4', title: 'AI Ethics Literature Review', course: 'PHIL 210', priority: 'Low', deadline: 'Friday, 12:00 PM', completed: true }
      ];
    }
    return [
      { id: '1', title: `${project.name}: Core Service Pipeline`, course: 'Core Engine', priority: 'Urgent', deadline: 'Sprint 1', completed: false },
      { id: '2', title: 'Data Ingestion & Validation Controller', course: 'Backend API', priority: 'High', deadline: 'Sprint 1', completed: false },
      { id: '3', title: 'Interactive Client Workstation Telemetry', course: 'Frontend UI', priority: 'Medium', deadline: 'Sprint 2', completed: true },
      { id: '4', title: 'Automated Security & Audit Scan Verification', course: 'DevOps', priority: 'Low', deadline: 'Release Gate', completed: true }
    ];
  }, [isSynapse, isHealth, isCommerce, isStudent, project.name]);

  const [tasks, setTasks] = useState<DemoTask[]>(() => getInitialItems());

  useEffect(() => {
    setTasks(getInitialItems());
    if (artifacts.length > 0) {
      setSelectedArtifactId(artifacts[0].id);
    }
  }, [project.id, artifacts, getInitialItems]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCourse, setNewTaskCourse] = useState('CS 420');
  const [newTaskPriority, setNewTaskPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Low'>('High');
  const [newTaskDeadline, setNewTaskDeadline] = useState('Tomorrow, 6:00 PM');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');

  const selectedArtifact = artifacts.find(a => a.id === selectedArtifactId) || artifacts[0];

  const handleCopyCode = () => {
    if (!selectedArtifact) return;
    navigator.clipboard.writeText(selectedArtifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = (art: Artifact) => {
    const blob = new Blob([art.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = art.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllBundle = () => {
    let bundleText = `=======================================================\n`;
    bundleText += `PMPilot Autonomous SDLC Deliverable Bundle\n`;
    bundleText += `Project: ${project.name} (${project.id})\n`;
    bundleText += `Domain: ${project.domain}\n`;
    bundleText += `Generated: ${new Date().toLocaleString()}\n`;
    bundleText += `=======================================================\n\n`;

    artifacts.forEach(art => {
      bundleText += `\n#######################################################\n`;
      bundleText += `FILE: ${art.filename} (${art.category})\n`;
      bundleText += `GENERATING AGENT: ${art.generatingAgent} (v${art.version})\n`;
      bundleText += `#######################################################\n\n`;
      bundleText += art.content;
      bundleText += `\n\n`;
    });

    const blob = new Blob([bundleText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.id}_deliverables_bundle.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Live Task Actions
  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: DemoTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      course: newTaskCourse.trim() || 'General',
      priority: newTaskPriority,
      deadline: newTaskDeadline.trim() || 'Upcoming',
      completed: false
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(tasks.filter(t => t.id !== id));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter(t => {
    if (filterMode === 'pending') return !t.completed;
    if (filterMode === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & View Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              Stage 05 • SDLC Implementation
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">● Functional Deliverables</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            Code & Interactive Application Workspace
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Test the live interactive application in real-time or inspect production-ready SQL schemas, APIs, and React components.
          </p>
        </div>

        {/* View Mode Toggle: Interactive Preview vs Source Code */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveView('preview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeView === 'preview'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Live App Preview
            </button>
            <button
              onClick={() => setActiveView('code')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeView === 'code'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" /> Source Code Files ({artifacts.length})
            </button>
          </div>

          <button
            onClick={handleDownloadAllBundle}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Download All (.bundle)
          </button>
        </div>
      </div>

      {/* VIEW 1: Interactive Live App Demo */}
      {activeView === 'preview' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          {/* Header of the Running Demo */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  LIVE RUNTIME ENVIRONMENT
                </span>
              </div>
              <h3 className="text-2xl font-black text-white mt-1">
                {project.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Interact with the live application prototype below. Changes update the completion progress instantly.
              </p>
            </div>

            {/* Progress Meter */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-inner">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Completion Rate</span>
                <span className="text-xl font-black text-white">{completedCount} of {tasks.length} Done</span>
              </div>
              <div className="w-28 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-sm font-mono font-black text-emerald-400">{progressPercent}%</span>
            </div>
          </div>

          {/* Add Task Input Form */}
          <form onSubmit={handleAddTask} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder={
                  isStudent
                    ? 'Add new task (e.g. Data Structures Homework 3)...'
                    : isSynapse
                    ? 'Add new neural channel / telemetry stream...'
                    : isHealth
                    ? 'Add new patient triage / appointment record...'
                    : isCommerce
                    ? 'Add new product drop / fulfillment order...'
                    : 'Add new item / workflow record...'
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="w-32">
              <input
                type="text"
                value={newTaskCourse}
                onChange={(e) => setNewTaskCourse(e.target.value)}
                placeholder="Category / Tag"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div className="w-32">
              <input
                type="text"
                value={newTaskDeadline}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
                placeholder="Deadline / State"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div className="w-28">
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-2 focus:outline-none"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </form>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {(['all', 'pending', 'completed'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterMode(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    filterMode === tab
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab} ({tab === 'all' ? tasks.length : tab === 'pending' ? tasks.length - completedCount : completedCount})
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              Click any card to mark completed / pending
            </span>
          </div>

          {/* Interactive Task Cards List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-slate-800">
                No tasks found in this view.
              </div>
            ) : (
              filteredTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 select-none ${
                    task.completed
                      ? 'bg-slate-950/50 border-slate-800/80 opacity-60'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleTask(task.id);
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'border-2 border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div>
                      <h4 className={`text-xs font-bold ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-1">
                        <span className="flex items-center gap-1 text-indigo-300">
                          <Tag className="w-3 h-3 text-indigo-400" /> {task.course}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-400" /> {task.deadline}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                      task.priority === 'Urgent'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : task.priority === 'High'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {task.priority}
                    </span>

                    <button
                      onClick={(e) => handleDeleteTask(task.id, e)}
                      title="Delete task"
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-all rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Under-the-hood API and Database Callout */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-3 font-mono">
            <span>Verified endpoints: <strong className="text-emerald-400">POST /api/tasks</strong>, <strong className="text-indigo-300">PUT /api/tasks/:id/toggle</strong>, <strong className="text-purple-300">GET /api/dashboard/stats</strong></span>
            <span>Relational Store: <strong className="text-white">PostgreSQL/SQLite</strong></span>
          </div>
        </div>
      ) : (
        /* VIEW 2: Source Code Files Viewer */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Artifact File Tree Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Deliverables Tree ({artifacts.length})
              </span>
            </div>

            <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
              {artifacts.map((art) => {
                const isSelected = selectedArtifact?.id === art.id;
                return (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArtifactId(art.id)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all border text-xs space-y-1 ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] font-bold uppercase text-indigo-400">
                        {art.category}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">v{art.version}.0</span>
                    </div>

                    <h4 className="font-mono font-bold text-xs truncate flex items-center gap-1.5">
                      <FileCode2 className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                      {art.filename}
                    </h4>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-0.5">
                      <Bot className="w-3 h-3 text-purple-400" />
                      <span className="truncate">{art.generatingAgent}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Code Viewer with Line Numbers */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
            {selectedArtifact ? (
              <>
                {/* Code Viewer Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                        {selectedArtifact.filename}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Language: <strong className="text-white uppercase">{selectedArtifact.language}</strong>
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1">
                      {selectedArtifact.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy Code'}
                    </button>

                    <button
                      onClick={() => handleDownloadSingle(selectedArtifact)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl"
                      title="Download this file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Code Box with Line Numbers */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto max-h-[520px] custom-scrollbar flex">
                  {/* Line Numbers Column */}
                  <div className="select-none text-slate-600 text-right pr-4 border-r border-slate-800/80 mr-4 space-y-1">
                    {selectedArtifact.content.split('\n').map((_, idx) => (
                      <div key={idx}>{idx + 1}</div>
                    ))}
                  </div>

                  {/* Actual Code Text */}
                  <pre className="text-slate-200 whitespace-pre leading-5 flex-1 selection:bg-indigo-600 selection:text-white">
                    {selectedArtifact.content}
                  </pre>
                </div>

                {/* Footer Metadata */}
                <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    Synthesized by <strong>{selectedArtifact.generatingAgent}</strong>
                  </span>
                  <span className="font-mono text-slate-500">
                    Updated: {selectedArtifact.lastUpdated}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-500 text-xs">
                No artifact selected.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
