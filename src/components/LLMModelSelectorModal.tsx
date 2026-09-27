import React, { useState, useEffect } from 'react';
import { HybridRouter, type LLMProviderConfig } from '../engine/LLMProvider';
import { Cpu, Server, Key, CheckCircle2, AlertCircle, RefreshCw, X, Zap, Shield } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LLMModelSelectorModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<LLMProviderConfig>(HybridRouter.getConfig());
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  useEffect(() => {
    const unsub = HybridRouter.subscribe((cfg: LLMProviderConfig) => setConfig(cfg));
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleModeChange = (mode: LLMProviderConfig['mode']) => {
    HybridRouter.updateConfig({ mode });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await HybridRouter.ping();
    setTestResult(result);
    setIsTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl p-6 space-y-6 relative text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">LLM Provider & Router Settings</h3>
              <p className="text-xs text-slate-400">Configure on-device Ollama inference or Cloud AI APIs for the 17 agents.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Execution Inference Target (Real LLM vs Offline Demo)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 'cloud', label: 'Gemini / Cloud API', icon: Key, desc: 'Real LLM Mode', badge: 'REAL' },
              { id: 'local', label: 'Local Ollama', icon: Server, desc: 'On-Device LLM', badge: 'REAL' },
              { id: 'hybrid', label: 'Adaptive Hybrid', icon: Zap, desc: 'Local + Cloud', badge: 'ADAPTIVE' },
              { id: 'demo_fallback', label: 'Deterministic Mock', icon: Shield, desc: 'Offline Demo Mode', badge: 'OFFLINE' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id as any)}
                className={`p-3 rounded-2xl border text-left transition-all relative ${
                  config.mode === m.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <m.icon className={`w-4 h-4 ${config.mode === m.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${
                    m.badge === 'REAL' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    m.badge === 'OFFLINE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  }`}>
                    {m.badge}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-200">{m.label}</div>
                <div className="text-[10px] text-slate-500 truncate">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Ollama Local Endpoint Settings */}
        {(config.mode === 'local' || config.mode === 'hybrid') && (
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-400" /> Local Ollama Server (Zero Data Leakage)
              </span>
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono font-bold flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                {isTesting ? 'Probing...' : 'Test Connection'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Ollama API URL</label>
                <input
                  type="text"
                  value={config.ollamaEndpoint}
                  onChange={(e) => HybridRouter.updateConfig({ ollamaEndpoint: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Local Model Tag</label>
                <select
                  value={config.ollamaModel}
                  onChange={(e) => HybridRouter.updateConfig({ ollamaModel: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="llama3.2">llama3.2 (Default)</option>
                  <option value="qwen2.5-coder">qwen2.5-coder:7b</option>
                  <option value="deepseek-r1:1.5b">deepseek-r1:1.5b</option>
                  <option value="mistral">mistral:7b</option>
                </select>
              </div>
            </div>

            {testResult && (
              <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{testResult.message} ({testResult.latencyMs}ms)</span>
              </div>
            )}
          </div>
        )}

        {/* Cloud API Key Settings */}
        {(config.mode === 'cloud' || config.mode === 'hybrid') && (
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Key className="w-4 h-4 text-purple-400" /> Cloud LLM Provider API Gateway
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Provider Vendor</label>
                <select
                  value={config.cloudVendor}
                  onChange={(e) => HybridRouter.updateConfig({ cloudVendor: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="groq">Groq High-Speed LPUs</option>
                  <option value="openrouter">OpenRouter</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">API Key (Stored locally)</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => HybridRouter.updateConfig({ apiKey: e.target.value })}
                  placeholder="Bearer sk-..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
