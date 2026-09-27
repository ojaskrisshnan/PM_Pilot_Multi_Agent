import React from 'react';
import type { ProjectState } from '../types/project';
import {
  Database,
  FileCode2,
  CheckCircle2,
  Bot,
  Server,
  Smartphone,
  HardDrive,
  Key
} from 'lucide-react';

interface DecisionsViewProps {
  state: ProjectState;
}

export const DecisionsView: React.FC<DecisionsViewProps> = ({ state }) => {
  const { decisions, project } = state;

  const isStudent = /student|task|todo/i.test(project.name + ' ' + project.description);

  // Database Schema Entities
  const dbEntities = (state.dbEntities && state.dbEntities.length > 0)
    ? state.dbEntities
    : isStudent
    ? [
        {
          name: 'users',
          desc: 'Student accounts & authentication credentials',
          fields: [
            { name: 'id', type: 'UUID (PK)', key: true },
            { name: 'email', type: 'VARCHAR(150) UNIQUE' },
            { name: 'password_hash', type: 'VARCHAR(255) BCRYPT' },
            { name: 'full_name', type: 'VARCHAR(100)' },
            { name: 'institution', type: 'VARCHAR(150)' },
            { name: 'created_at', type: 'TIMESTAMP' }
          ]
        },
        {
          name: 'tasks',
          desc: 'Primary coursework tasks with priority & status',
          fields: [
            { name: 'id', type: 'UUID (PK)', key: true },
            { name: 'user_id', type: 'UUID (FK -> users.id)', key: true },
            { name: 'title', type: 'VARCHAR(200) NOT NULL' },
            { name: 'description', type: 'TEXT' },
            { name: 'priority', type: 'ENUM (Urgent, High, Med, Low)' },
            { name: 'status', type: 'ENUM (Pending, Completed)' },
            { name: 'deadline', type: 'TIMESTAMP (INDEXED)' },
            { name: 'completed_at', type: 'TIMESTAMP NULL' }
          ]
        },
        {
          name: 'reminders',
          desc: 'Automated notification alert triggers',
          fields: [
            { name: 'id', type: 'UUID (PK)', key: true },
            { name: 'task_id', type: 'UUID (FK -> tasks.id)', key: true },
            { name: 'user_id', type: 'UUID (FK -> users.id)', key: true },
            { name: 'remind_at', type: 'TIMESTAMP (INDEXED)' },
            { name: 'is_sent', type: 'BOOLEAN DEFAULT FALSE' }
          ]
        }
      ]
    : [
        {
          name: 'accounts',
          desc: 'Core user and organization entities',
          fields: [
            { name: 'id', type: 'UUID (PK)', key: true },
            { name: 'name', type: 'VARCHAR(150)' },
            { name: 'role', type: 'VARCHAR(50)' },
            { name: 'created_at', type: 'TIMESTAMP' }
          ]
        },
        {
          name: 'domain_records',
          desc: 'Primary business domain records',
          fields: [
            { name: 'id', type: 'UUID (PK)', key: true },
            { name: 'account_id', type: 'UUID (FK)', key: true },
            { name: 'status', type: 'VARCHAR(50) (INDEXED)' },
            { name: 'payload', type: 'JSONB' }
          ]
        }
      ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/30">
              Stage 03 • System Design
            </span>
            <span className="text-[10px] font-mono text-slate-400">Domain: {project.domain}</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            System Architecture & Database Topology
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Relational SQL schema models, system tier topology, and formal Architectural Decision Records (ADRs).
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-2xl text-slate-300">
            {dbEntities.length} SQL Tables
          </div>
          <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-2xl text-indigo-300 font-bold">
            {decisions.length} Active ADRs
          </div>
        </div>
      </div>

      {/* 3-Tier Architecture Topology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2.5">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Client Presentation Tier</h4>
              <span className="text-[10px] text-slate-400 font-mono">React 19 SPA • Tailwind CSS</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Responsive, optimistic UI updates with client-side state caching for zero-latency task toggling and filter transitions.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2.5">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Application API Tier</h4>
              <span className="text-[10px] text-slate-400 font-mono">Express.js • Node.js Engine</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            RESTful API routes with JWT authentication middleware, parameterized SQL query handlers, and background cron reminder workers.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2.5">
          <div className="flex items-center gap-2.5 text-purple-400">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Relational Storage Tier</h4>
              <span className="text-[10px] text-slate-400 font-mono">PostgreSQL / SQLite</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Normalized tables with CASCADE foreign keys, composite indexes on (user_id, status, deadline), and full ACID compliance.
          </p>
        </div>
      </div>

      {/* Relational Database Schema Model */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-black text-sm text-white">
            <Database className="w-4 h-4 text-emerald-400" />
            Relational SQL Schema Entities
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            schema.sql Specification
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dbEntities.map((tbl) => (
            <div key={tbl.name} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="border-b border-slate-800/80 pb-2 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-400">TABLE {tbl.name}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{tbl.desc}</p>
                </div>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                {tbl.fields.map((f, fIdx) => (
                  <div key={fIdx} className="flex items-center justify-between py-0.5">
                    <span className={`flex items-center gap-1.5 ${f.key ? 'text-amber-300 font-bold' : 'text-slate-300'}`}>
                      {f.key && <Key className="w-2.5 h-2.5 text-amber-400" />}
                      {f.name}
                    </span>
                    <span className="text-slate-500 text-[10px]">{f.type}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architectural Decision Records (ADRs) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm text-white flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-indigo-400" />
            Architectural Decision Records (ADRs)
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            Formulated by ArchitectureAgent
          </span>
        </div>

        <div className="space-y-4">
          {decisions.map((adr) => (
            <div
              key={adr.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                    ADR-{adr.adrNumber}
                  </span>
                  <span className="text-xs font-bold uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {adr.status}
                  </span>
                  <h3 className="text-sm font-bold text-white">{adr.title}</h3>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Proposed by: {adr.proposedBy}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    1. Context & Rationale
                  </span>
                  <p className="text-slate-300 leading-relaxed">{adr.context}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/30 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    2. Architectural Decision
                  </span>
                  <p className="text-slate-200 leading-relaxed font-medium">{adr.decision}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    3. Impact & Benefits
                  </span>
                  <p className="text-slate-300 leading-relaxed">{adr.impact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
