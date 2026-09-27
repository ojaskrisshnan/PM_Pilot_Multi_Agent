import React from 'react';
import type { ProjectState, AgentId } from '../types/project';
import { ALL_17_AGENTS } from '../engine/AgentRoster';
import { Download, FileText, CheckCircle2, ShieldCheck, Layers, Bot, AlertTriangle, Coins, Calendar, Sparkles } from 'lucide-react';

interface ReportProps {
  state: ProjectState;
}

export const ExecutiveReportView: React.FC<ReportProps> = ({ state }) => {
  const { project, metrics, budget, decisions, risks, approvals, agentExecutions } = state;

  const handleDownloadMarkdown = () => {
    const executedAgents = (Object.values(ALL_17_AGENTS) as Array<typeof ALL_17_AGENTS[AgentId]>).map(agentDef => {
      const exec = agentExecutions[agentDef.id];
      return {
        id: agentDef.id,
        name: agentDef.name,
        role: agentDef.role,
        state: exec?.state || 'Idle',
        summary: exec?.outputSummary || 'Awaiting dispatch'
      };
    });

    const markdownContent = `# PMPilot Executive Project Synthesis Report

**Project Name:** ${project.name}  
**Project ID:** ${project.id}  
**Domain:** ${project.domain}  
**Version:** ${project.version}.0  
**Generated At:** ${new Date().toLocaleString()}  
**Target Launch:** ${project.targetLaunch}  
**Product Health Index:** ${metrics.healthScore} / 100  

---

## 1. Executive Summary & Vision
${project.description}

- **Scale / Concurrency Target:** ${project.scaleConstraints}
- **Critical Path Duration:** ${metrics.criticalPathDays} Days (Derived via Topological Sort)
- **Total Estimated Effort:** ${metrics.totalEstimatedDays} Days
- **Total MVP Budget Ceiling:** $${budget.totalMvpBudget.toLocaleString()}
- **Monthly Run-Rate:** $${budget.monthlyRunRate.toLocaleString()} / mo
- **Engineering Baseline Cost:** $${budget.engineeringCost.toLocaleString()}
- **Quality Score:** ${metrics.qualityScore}% | **Security Audit Index:** ${metrics.securityAuditIndex}%

---

## 2. Multi-Agent Governance & Synthesis
PMPilot orchestrated a synchronized 17-agent collective under the ProductManagerAgent supervisory authority:

${executedAgents.map(a => `### ${a.name} (${a.id})
- **Role:** ${a.role}
- **Lifecycle Status:** ${a.state}
- **Artifact Synthesis:** ${a.summary}
`).join('\n')}

---

## 3. Key Architectural Decision Records (ADRs)
${decisions.map(d => `### ADR-${d.adrNumber}: ${d.title}
- **ID:** ${d.id}
- **Status:** ${d.status}
- **Context:** ${d.context}
- **Decision Taken:** ${d.decision}
- **Architectural Impact:** ${d.impact}
`).join('\n')}

---

## 4. Governance & Human-in-the-Loop Checkpoints
${approvals.map(app => `- **[${app.status.toUpperCase()}] ${app.checkpointType} Checkpoint:** ${app.summary} (Lead Agent: ${app.agentId})`).join('\n')}

---

## 5. Risk Assessment & Mitigations
${risks.map(r => `- **[${r.level.toUpperCase()} - ${r.status}] ${r.title}:** Mitigation Strategy: ${r.mitigation}`).join('\n')}

---
*Report generated autonomously by PMPilot Autonomous Multi-Agent SDLC Orchestrator.*
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PMPilot_Executive_Report_${project.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const agentList = Object.values(ALL_17_AGENTS) as Array<typeof ALL_17_AGENTS[AgentId]>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {project.domain}
            </span>
            <span className="text-[10px] font-mono text-slate-400">ID: {project.id}</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Synthesized
            </span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            Executive Synthesis & PM Governance Report
          </h2>
          <p className="text-xs text-slate-400">
            Comprehensive multi-agent dossier synthesizing requirements, ADRs, risk register, Gantt timeline, and financial runway.
          </p>
        </div>

        <button
          onClick={handleDownloadMarkdown}
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all font-mono"
        >
          <Download className="w-4 h-4" /> Export Report (.md)
        </button>
      </div>

      {/* Report Document Paper Canvas */}
      <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-8 text-slate-200 shadow-inner">
        {/* Document Header */}
        <div className="border-b border-slate-800/80 pb-6 flex flex-wrap justify-between items-start gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-4 h-4" /> ProductManagerAgent Executive Briefing
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight">{project.name}</h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              {project.description}
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-right text-xs space-y-1.5 font-mono shadow-md">
            <div>Status: <span className="text-emerald-400 font-bold">{project.status}</span></div>
            <div>Health Index: <span className="text-indigo-400 font-bold">{metrics.healthScore}/100</span></div>
            <div>Target Launch: <span className="text-slate-300 font-semibold">{project.targetLaunch}</span></div>
            <div className="text-[10px] text-slate-500">Generated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Section 1: Executive Vital Signs */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-2">
            <Layers className="w-4 h-4" /> 1. Operational & Financial Vital Signs
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-400" /> Critical Path
              </span>
              <div className="text-xl font-black text-white mt-1">{metrics.criticalPathDays} Days</div>
              <span className="text-[10px] text-slate-500">Total effort: {metrics.totalEstimatedDays}d</span>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <Coins className="w-3 h-3 text-emerald-400" /> MVP Budget Ceiling
              </span>
              <div className="text-xl font-black text-emerald-400 mt-1">${budget.totalMvpBudget.toLocaleString()}</div>
              <span className="text-[10px] text-slate-500">Run-rate: ${budget.monthlyRunRate.toLocaleString()}/mo</span>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-400" /> Security Audit
              </span>
              <div className="text-xl font-black text-purple-300 mt-1">{metrics.securityAuditIndex}%</div>
              <span className="text-[10px] text-slate-500">Quality score: {metrics.qualityScore}%</span>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" /> Risk Exposure
              </span>
              <div className="text-xl font-black text-amber-300 mt-1">{risks.length} Items</div>
              <span className="text-[10px] text-slate-500">Open: {metrics.openRisksCount}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Architectural Decision Records */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> 2. Architectural Decision Records (ADRs)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {decisions.map((adr) => (
              <div key={adr.id} className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between items-center font-bold text-slate-200">
                  <span className="text-indigo-300 font-semibold">ADR-{adr.adrNumber}: {adr.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    adr.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {adr.status}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]"><strong className="text-slate-300">Context:</strong> {adr.context}</p>
                <p className="text-slate-300 text-[11px] bg-slate-950/60 p-2 rounded-lg border border-slate-800/80"><strong className="text-indigo-300">Decision:</strong> {adr.decision}</p>
                <p className="text-slate-400 text-[10px] font-mono"><strong className="text-slate-400">Impact:</strong> {adr.impact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: 17-Agent Collective Execution Matrix */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> 3. Multi-Agent Collective Delivery Matrix
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {agentList.map((agentDef) => {
              const exec = agentExecutions[agentDef.id];
              const isDone = exec?.state === 'Completed';
              return (
                <div
                  key={agentDef.id}
                  className="bg-slate-900/70 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs gap-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${isDone ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono">{agentDef.name}</span>
                        <span className="text-[10px] text-slate-400 font-sans">• {agentDef.role}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {exec?.outputSummary || `Configured with ${agentDef.tools.length} domain tools`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[10px]">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      isDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {exec?.state || 'Idle'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Governance Approvals Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
            <FileText className="w-4 h-4" /> 4. Human Governance & Quality Gates
          </h3>
          <div className="space-y-2">
            {approvals.map((app) => (
              <div key={app.id} className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span>{app.checkpointType} Checkpoint</span>
                    <span className="text-[10px] text-slate-400 font-mono">({app.agentId})</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{app.summary}</p>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                  app.status === 'Approved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                }`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
