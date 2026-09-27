import React, { useState } from 'react';
import type { ProjectState, Risk, AgentId } from '../types/project';
import { ProjectStateStore } from '../engine/ProjectState';
import { ALL_17_AGENTS } from '../engine/AgentRoster';
import { ShieldAlert, ShieldCheck, Plus, Edit2, X } from 'lucide-react';

interface RiskHeatmapProps {
  state: ProjectState;
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ state }) => {
  const { risks, metrics } = state;
  const [selectedCell, setSelectedCell] = useState<{ impact: number; probability: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Risk['category']>('Technical');
  const [probability, setProbability] = useState<number>(3);
  const [impact, setImpact] = useState<number>(3);
  const [mitigation, setMitigation] = useState('');
  const [owner, setOwner] = useState<AgentId>('ArchitectureAgent');

  const impactLevels = [5, 4, 3, 2, 1];
  const probabilityLevels = [1, 2, 3, 4, 5];

  const getCellColor = (imp: number, prob: number) => {
    const score = imp * prob;
    if (score >= 15) return 'bg-rose-950/80 border-rose-500/70 text-rose-300 hover:bg-rose-900/90';
    if (score >= 9) return 'bg-amber-950/80 border-amber-500/70 text-amber-300 hover:bg-amber-900/90';
    return 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80';
  };

  const filteredRisks = selectedCell
    ? risks.filter(r => r.impact === selectedCell.impact && r.probability === selectedCell.probability)
    : risks;

  const handleOpenAddModal = (riskToEdit?: Risk) => {
    if (riskToEdit) {
      setEditingRisk(riskToEdit);
      setTitle(riskToEdit.title);
      setCategory(riskToEdit.category);
      setProbability(riskToEdit.probability);
      setImpact(riskToEdit.impact);
      setMitigation(riskToEdit.mitigation);
      setOwner(riskToEdit.owner);
    } else {
      setEditingRisk(null);
      setTitle('');
      setCategory('Technical');
      setProbability(3);
      setImpact(3);
      setMitigation('');
      setOwner('RiskAgent');
    }
    setIsModalOpen(true);
  };

  const handleSaveRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const score = probability * impact;
    let level: Risk['level'] = 'Low';
    if (score >= 15) level = 'Critical';
    else if (score >= 10) level = 'High';
    else if (score >= 6) level = 'Medium';

    const newRisk: Risk = {
      id: editingRisk ? editingRisk.id : `RISK-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      category,
      probability,
      impact,
      score,
      level,
      mitigation: mitigation.trim() || 'Automated circuit breaker and mitigation protocol',
      owner,
      status: editingRisk ? editingRisk.status : 'Open'
    };

    ProjectStateStore.addOrUpdateRisk(newRisk);
    ProjectStateStore.recordEvent({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'SystemNotice',
      agentId: owner,
      title: editingRisk ? 'Risk Updated' : 'New Risk Registered',
      detail: `${newRisk.id}: "${newRisk.title}" (Score: ${score}, Level: ${level})`
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            5x5 Probability vs. Impact Risk Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Governed by <strong className="text-indigo-400">RiskAgent</strong> & <strong className="text-indigo-400">SecurityAgent</strong>. Deterministic scoring: <code className="text-amber-300">score = probability × impact</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Security Index: <strong className="text-emerald-400">{metrics.securityAuditIndex}/100</strong></span>
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Risk Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5x5 Matrix Canvas */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
              Interactive 5x5 Heatmap Matrix
            </h3>
            {selectedCell && (
              <button
                onClick={() => setSelectedCell(null)}
                className="text-[10px] text-amber-400 hover:underline font-mono"
              >
                Clear Cell Filter ({selectedCell.impact}x{selectedCell.probability})
              </button>
            )}
          </div>

          <div className="flex">
            {/* Impact Y Axis Labels */}
            <div className="flex flex-col justify-around text-[10px] font-mono font-bold text-slate-500 uppercase pr-3 text-right">
              <span>Imp 5</span>
              <span>Imp 4</span>
              <span>Imp 3</span>
              <span>Imp 2</span>
              <span>Imp 1</span>
            </div>

            {/* 5x5 Grid Cells */}
            <div className="flex-1 space-y-2">
              {impactLevels.map((imp) => (
                <div key={imp} className="grid grid-cols-5 gap-2">
                  {probabilityLevels.map((prob) => {
                    const matchedRisks = risks.filter(
                      (r) => r.impact === imp && r.probability === prob
                    );
                    const cellClass = getCellColor(imp, prob);
                    const isSelected = selectedCell?.impact === imp && selectedCell?.probability === prob;

                    return (
                      <div
                        key={prob}
                        onClick={() => setSelectedCell(isSelected ? null : { impact: imp, probability: prob })}
                        className={`h-16 rounded-2xl border p-2 flex flex-col justify-between transition-all cursor-pointer select-none ${cellClass} ${
                          isSelected ? 'ring-2 ring-white scale-105 shadow-xl' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-mono font-black">
                          <span>{imp * prob}</span>
                          {matchedRisks.length > 0 && (
                            <span className="bg-white/20 text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                              {matchedRisks.length}
                            </span>
                          )}
                        </div>
                        <div className="truncate text-[8px] font-mono font-bold opacity-90">
                          {matchedRisks.map(r => r.id).join(', ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Probability X Axis Labels */}
              <div className="grid grid-cols-5 text-center text-[10px] font-mono font-bold text-slate-500 uppercase pt-2">
                <span>Prob 1</span>
                <span>Prob 2</span>
                <span>Prob 3</span>
                <span>Prob 4</span>
                <span>Prob 5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Register Table / Cards */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
              Risk Register ({filteredRisks.length} Displayed)
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              {selectedCell ? `Filtered by ${selectedCell.impact}×${selectedCell.probability}` : 'Showing All'}
            </span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar flex-1">
            {filteredRisks.map((risk) => (
              <div
                key={risk.id}
                className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                      {risk.id}
                    </span>
                    <h4 className="text-xs font-bold text-white">{risk.title}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      risk.level === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      risk.level === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {risk.level} (Score: {risk.score})
                    </span>
                    <button
                      onClick={() => handleOpenAddModal(risk)}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                      title="Edit Risk"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-emerald-400">Mitigation: </strong>{risk.mitigation}
                </p>

                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-t border-slate-800/80 pt-2">
                  <span>Category: {risk.category}</span>
                  <span>Owner: {risk.owner}</span>
                  <span className={risk.status === 'Mitigated' ? 'text-emerald-400' : 'text-amber-400'}>
                    Status: {risk.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add / Edit Risk Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingRisk ? 'Edit Project Risk' : 'Register New Project Risk'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRisk} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Risk Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Database connection pool starvation during spike drops"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Impact (1-5)</label>
                  <select
                    value={impact}
                    onChange={(e) => setImpact(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    {[1, 2, 3, 4, 5].map(v => (
                      <option key={v} value={v}>Level {v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Probability (1-5)</label>
                  <select
                    value={probability}
                    onChange={(e) => setProbability(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    {[1, 2, 3, 4, 5].map(v => (
                      <option key={v} value={v}>Level {v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Mitigation Strategy</label>
                <textarea
                  rows={2}
                  value={mitigation}
                  onChange={(e) => setMitigation(e.target.value)}
                  placeholder="Define preventive architectural safeguard..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Security">Security</option>
                    <option value="Financial">Financial</option>
                    <option value="Operational">Operational</option>
                    <option value="Schedule">Schedule</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Risk Owner</label>
                  <select
                    value={owner}
                    onChange={(e) => setOwner(e.target.value as AgentId)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {Object.keys(ALL_17_AGENTS).map(id => (
                      <option key={id} value={id}>{id}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {editingRisk ? 'Update Risk' : 'Register Risk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
