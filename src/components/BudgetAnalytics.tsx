import React from 'react';
import type { ProjectState } from '../types/project';
import { ProjectStateStore } from '../engine/ProjectState';
import { Coins, TrendingUp, Sliders, DollarSign, Cloud, Users, ShieldAlert } from 'lucide-react';

interface BudgetAnalyticsProps {
  state: ProjectState;
}

export const BudgetAnalytics: React.FC<BudgetAnalyticsProps> = ({ state }) => {
  const { budget } = state;
  const { params } = budget;

  const handleUpdateTeamSize = (val: number) => {
    ProjectStateStore.updateFinancialParams({ teamSize: val });
  };

  const handleUpdateRate = (val: number) => {
    ProjectStateStore.updateFinancialParams({ blendedHourlyRate: val });
  };

  const handleUpdateTier = (tier: 'Starter' | 'Growth' | 'High-Concurrency') => {
    ProjectStateStore.updateFinancialParams({ cloudTier: tier });
  };

  const handleUpdateContingency = (val: number) => {
    ProjectStateStore.updateFinancialParams({ contingencyPercent: val });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            Total Cost of Ownership (TCO) & Dynamic ROI Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Engineered by <strong className="text-indigo-400">FinanceAgent</strong>. Formula-driven economic model evaluating capital expenditure, cloud run-rates, and multi-year return.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-emerald-500/40 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-mono">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">3-Year Projected ROI:</span>
            <strong className="text-emerald-400 font-bold text-sm">+{budget.threeYearRoi}%</strong>
          </div>
        </div>
      </div>

      {/* 4 Interactive Simulator Sliders (Section 15 Specification) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Financial Scenario Modeling Sliders
          </h3>
          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-bold">
            Live Formula Recalculation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Team Size Slider */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" /> Team Size
              </span>
              <span className="font-mono text-indigo-300 font-black text-sm">{params.teamSize} Engineers</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              value={params.teamSize}
              onChange={(e) => handleUpdateTeamSize(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>1 Dev</span>
              <span>12 Devs</span>
            </div>
          </div>

          {/* Hourly Rate Slider */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Blended Rate
              </span>
              <span className="font-mono text-amber-300 font-black text-sm">${params.blendedHourlyRate}/hr</span>
            </div>
            <input
              type="range"
              min={50}
              max={200}
              step={5}
              value={params.blendedHourlyRate}
              onChange={(e) => handleUpdateRate(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>$50/hr</span>
              <span>$200/hr</span>
            </div>
          </div>

          {/* Cloud Tier Buttons */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-purple-400" /> Cloud Infra Tier
              </span>
              <span className="font-mono text-purple-300 font-bold text-xs">${budget.cloudMonthlyCost}/mo</span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1">
              {(['Starter', 'Growth', 'High-Concurrency'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => handleUpdateTier(tier)}
                  className={`py-1.5 rounded-lg text-[9px] font-mono font-bold transition-all truncate px-1 ${
                    params.cloudTier === tier
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {tier === 'High-Concurrency' ? 'High-Conc' : tier}
                </button>
              ))}
            </div>
          </div>

          {/* Contingency Slider */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-teal-400" /> Contingency Buffer
              </span>
              <span className="font-mono text-teal-300 font-black text-sm">{params.contingencyPercent}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={5}
              value={params.contingencyPercent}
              onChange={(e) => handleUpdateContingency(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>5%</span>
              <span>30%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Computed Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total MVP Budget Ceiling
          </span>
          <div className="text-2xl font-black text-white">
            ${budget.totalMvpBudget.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Fixed development envelope</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Monthly Cloud Run-Rate
          </span>
          <div className="text-2xl font-black text-purple-400">
            ${budget.cloudMonthlyCost.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ mo</span>
          </div>
          <p className="text-[11px] text-slate-400">{params.cloudTier} cluster capacity</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Break-Even Horizon
          </span>
          <div className="text-2xl font-black text-emerald-400">
            {budget.breakEvenMonths} Months
          </div>
          <p className="text-[11px] text-slate-400">Based on gross revenue trajectory</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Annual Operational Benefit
          </span>
          <div className="text-2xl font-black text-teal-400">
            ${budget.annualBenefit.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Automated SDLC cost savings</p>
        </div>
      </div>

      {/* Allocation Breakdown Bars */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
          Capital Allocation Breakdown
        </h3>

        <div className="space-y-3.5">
          {budget.breakdown.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-200">
                <span>{item.category}</span>
                <span className="font-mono text-slate-300">
                  ${item.amount.toLocaleString()} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
