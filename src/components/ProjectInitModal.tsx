import React, { useState } from 'react';
import { DOMAIN_PRESETS } from '../engine/DomainPresets';
import { ProjectStateStore } from '../engine/ProjectState';
import { OrchestrationEngine } from '../engine/OrchestrationEngine';
import { HybridRouter } from '../engine/LLMProvider';
import type { LLMMode } from '../types/project';
import { Sparkles, Layers, Check, X, Shield, ArrowRight } from 'lucide-react';

interface ProjectInitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

export const ProjectInitModal: React.FC<ProjectInitModalProps> = ({ isOpen, onClose, onProjectCreated }) => {
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('event_management');
  const [showPresets, setShowPresets] = useState<boolean>(false);
  const [llmMode, setLlmMode] = useState<LLMMode>(HybridRouter.getConfig().mode);

  if (!isOpen) return null;

  const handleGenerate = () => {
    HybridRouter.updateConfig({ mode: llmMode });

    if (customPrompt.trim()) {
      ProjectStateStore.switchPreset('custom', customPrompt.trim());
    } else {
      ProjectStateStore.switchPreset(selectedPreset);
    }

    OrchestrationEngine.reset();
    setTimeout(() => {
      OrchestrationEngine.start();
    }, 200);

    onProjectCreated();
    onClose();
  };

  const presetList = Object.values(DOMAIN_PRESETS);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full p-7 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Generate Any Software Project SDLC
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  Autonomous Multi-Agent
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Give any project of your interest. 17 specialized AI agents will autonomously generate the entire scope, requirements, database architecture, sprint tasks, code deliverables, and executive report.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Prompt Form */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3.5 shadow-inner">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              What project would you like to build?
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              Accepts any project idea or full proposal
            </span>
          </div>

          <textarea
            rows={4}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g. Build a student task management web application where students can create, edit, delete, and prioritize tasks, set deadlines, mark tasks as completed, and receive reminders. Include user login, a dashboard showing pending and completed tasks, and a simple backend database."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans shadow-inner"
          />

          {/* Quick Inspiration Chips */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-400">
              Quick Test Ideas:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCustomPrompt('Build a student task management web application where students can create, edit, delete, and prioritize tasks, set deadlines, mark tasks as completed, and receive reminders. Include user login, a dashboard showing pending and completed tasks, and a simple backend database.')}
                className="text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl transition-all font-medium"
              >
                🎓 Student Task Manager
              </button>
              <button
                type="button"
                onClick={() => setCustomPrompt('Synapse: Cognitive AI & Brain-Computer Interface (BCI) telemetry platform capturing real-time neural EEG signals, calculating alpha/beta focus ratios, and streaming attention heatmaps.')}
                className="text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl transition-all font-medium"
              >
                🧠 Synapse BCI Telemetry
              </button>
              <button
                type="button"
                onClick={() => setCustomPrompt('Build a telehealth clinical portal where patients can register, book appointments with specialized doctors, receive triage urgency scores, and access digital prescriptions.')}
                className="text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl transition-all font-medium"
              >
                🏥 Telehealth Clinic Portal
              </button>
              <button
                type="button"
                onClick={() => setCustomPrompt('Build an e-commerce multi-vendor marketplace with product catalog, shopping cart, checkout, inventory management, and merchant sales dashboards.')}
                className="text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl transition-all font-medium"
              >
                🛒 E-Commerce Marketplace
              </button>
            </div>
          </div>
        </div>

        {/* Optional Collapsible Benchmark Presets */}
        <div>
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 font-medium transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            {showPresets ? 'Hide sample benchmark presets' : 'Or choose from sample benchmark presets (Optional)'}
          </button>

          {showPresets && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 animate-in fade-in duration-200">
              {presetList.map((preset) => {
                const isSelected = selectedPreset === preset.key && !customPrompt.trim();
                return (
                  <div
                    key={preset.key}
                    onClick={() => {
                      setSelectedPreset(preset.key);
                      setCustomPrompt('');
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[9px] font-mono font-bold uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                        {preset.domain}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white leading-snug">{preset.name}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{preset.tagline}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* LLM Engine Selection */}
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Active LLM Provider Engine
            </span>
            <p className="text-[11px] text-slate-400">
              Select inference target. Demo Fallback operates 100% offline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(['hybrid', 'local', 'cloud', 'demo_fallback'] as LLMMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setLlmMode(mode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all uppercase ${
                  llmMode === mode
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {mode === 'demo_fallback' ? 'Demo Fallback' : mode}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 hover:opacity-95 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            Generate & Dispatch SDLC Project <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
