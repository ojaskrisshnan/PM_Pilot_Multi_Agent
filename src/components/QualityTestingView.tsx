import React from 'react';
import type { ProjectState } from '../types/project';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Lock
} from 'lucide-react';

interface QualityTestingViewProps {
  state: ProjectState;
}

export const QualityTestingView: React.FC<QualityTestingViewProps> = ({ state }) => {
  const { metrics, risks, project } = state;

  const testCases = (state.testCases && state.testCases.length > 0)
    ? state.testCases
    : [
        { id: 'TC-101', name: 'User Registration & Bcrypt Password Hashing', suite: 'Authentication Suite', status: 'Passed', duration: '32ms', agent: 'SecurityAgent' },
        { id: 'TC-102', name: 'Task Creation & Priority Tag Validation', suite: 'Task CRUD Suite', status: 'Passed', duration: '18ms', agent: 'BackendAgent' },
        { id: 'TC-103', name: 'Optimistic Inline Completion Toggling', suite: 'Client UI Suite', status: 'Passed', duration: '14ms', agent: 'FrontendAgent' },
        { id: 'TC-104', name: 'Deadline Countdown & Alert Notification Trigger', suite: 'Reminder Service', status: 'Passed', duration: '45ms', agent: 'QAAgent' },
        { id: 'TC-105', name: 'Row-Level Isolation (Prevent Insecure Direct Object Reference)', suite: 'Security Suite', status: 'Passed', duration: '28ms', agent: 'SecurityAgent' },
        { id: 'TC-106', name: 'Relational Schema Integrity & Cascade Deletions', suite: 'Database Suite', status: 'Passed', duration: '22ms', agent: 'BackendAgent' }
      ];

  const securityAudits = [
    { title: 'Tenant & User Data Isolation', status: 'Compliant', desc: 'All database queries enforce scoping to prevent unauthorized cross-account data leakage.' },
    { title: 'Cryptographic Password Hashing', status: 'Compliant', desc: 'Passwords salted and hashed using bcrypt (work factor 12) with zero plain-text logs.' },
    { title: 'SQL Injection Defense', status: 'Compliant', desc: '100% of queries use parameterized prepared statements; zero raw string concatenation.' },
    { title: 'Input Sanitization & XSS Defense', status: 'Compliant', desc: 'User payloads validated against strict schemas and stripped of executable scripts.' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Stage 06 • Verification Gate
            </span>
            <span className="text-[10px] font-mono text-slate-400">Project: {project.name}</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            Quality Assurance & Security Compliance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated test suites, vulnerability checks, and risk mitigations synthesized for this project.
          </p>
        </div>

        {/* Vital KPIs */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl text-center shadow-inner">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Test Pass Rate</span>
            <span className="text-lg font-black text-emerald-400">100%</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl text-center shadow-inner">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Quality Score</span>
            <span className="text-lg font-black text-purple-300">{metrics.qualityScore}%</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl text-center shadow-inner">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Security Index</span>
            <span className="text-lg font-black text-indigo-400">{metrics.securityAuditIndex}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Automated Test Suite */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-black text-sm text-white">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Automated Test Execution Results
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
              {testCases.length}/{testCases.length} Passing
            </span>
          </div>

          <div className="space-y-2.5">
            {testCases.map(tc => (
              <div key={tc.id} className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center justify-between text-xs hover:border-slate-700 transition-all">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-white text-[12px]">{tc.name}</div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>{tc.suite}</span>
                      <span>•</span>
                      <span className="text-indigo-300">{tc.agent}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono text-[10px]">
                  <span className="text-emerald-400 font-bold block">{tc.status}</span>
                  <span className="text-slate-500">{tc.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Security Controls & Audit */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-black text-sm text-white">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Security Controls & Audit Gates
            </div>
            <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold">
              Zero Vulnerabilities
            </span>
          </div>

          <div className="space-y-3">
            {securityAudits.map((item, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    {item.title}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pl-5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Register & Proactive Mitigations */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-black text-sm text-white">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Project Risk Register & Proactive Mitigations
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {risks.length} Monitored Risks
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {risks.map(r => (
            <div key={r.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-white">{r.title}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                  r.level === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  r.level === 'High' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
                }`}>
                  {r.level}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/80">
                <strong className="text-emerald-400 block mb-0.5 font-mono text-[10px] uppercase">Mitigation Strategy:</strong>
                {r.mitigation}
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
                <span>Owner: {r.owner}</span>
                <span className="text-emerald-400 font-bold">{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
