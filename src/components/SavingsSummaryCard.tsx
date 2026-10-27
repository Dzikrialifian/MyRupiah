import React from 'react';
import { Target, ChevronRight, Plus, Award } from 'lucide-react';
import { SavingsGoal } from '../types';
import { formatRupiah } from '../utils/format';

interface SavingsSummaryCardProps {
  savingsGoals: SavingsGoal[];
  onOpenSavingsScreen: () => void;
  onOpenCreateGoal: () => void;
}

export const SavingsSummaryCard: React.FC<SavingsSummaryCardProps> = ({
  savingsGoals,
  onOpenSavingsScreen,
  onOpenCreateGoal,
}) => {
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const percent = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  if (savingsGoals.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 mx-4 mt-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
            🎯
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Rencana Tabungan</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Mulai rencanakan dana darurat & impianmu
            </p>
          </div>
        </div>
        <button
          onClick={onOpenCreateGoal}
          className="px-3 py-1.5 bg-[#006948] hover:bg-[#005236] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Buat</span>
        </button>
      </div>
    );
  }

  // Pick topmost in-progress goal
  const primaryGoal = savingsGoals.find((g) => g.currentAmount < g.targetAmount) || savingsGoals[0];
  const primaryPercent = Math.min(100, Math.round((primaryGoal.currentAmount / primaryGoal.targetAmount) * 100));

  return (
    <div
      onClick={onOpenSavingsScreen}
      className="bg-white dark:bg-slate-900 mx-4 mt-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs hover:border-emerald-200 dark:hover:border-slate-700 cursor-pointer transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 flex items-center justify-center text-sm">
            {primaryGoal.icon || '🎯'}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Target: {primaryGoal.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[#006948] dark:text-emerald-400 font-bold">
          <span>{savingsGoals.length} Rencana</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Progress */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-extrabold text-[#006948] dark:text-emerald-400 tabular-nums">
            {formatRupiah(primaryGoal.currentAmount)}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {primaryPercent}% dari {formatRupiah(primaryGoal.targetAmount)}
          </span>
        </div>

        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00855d] to-[#006948] dark:from-emerald-500 dark:to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${primaryPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
