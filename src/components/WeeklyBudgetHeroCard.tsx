import React from 'react';
import { Wallet } from 'lucide-react';
import { formatRupiah, calculateBudgetStatus } from '../utils/format';

interface WeeklyBudgetHeroCardProps {
  totalBudget: number;
  spent: number;
  onCardClick?: () => void;
}

export const WeeklyBudgetHeroCard: React.FC<WeeklyBudgetHeroCardProps> = ({
  totalBudget,
  spent,
  onCardClick,
}) => {
  const remaining = Math.max(0, totalBudget - spent);
  const status = calculateBudgetStatus(spent, totalBudget);
  const percentClamped = Math.min(100, Math.max(0, status.percentage));

  return (
    <div
      onClick={onCardClick}
      className="mx-4 mt-2 p-5 rounded-3xl bg-gradient-to-br from-[#eafaf2] via-[#e5f8f0] to-[#f0fbf6] dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 border border-[#bbf0dc] dark:border-emerald-800/40 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
    >
      {/* Background ambient decorative glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top row: Icon, Title, and Health Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#bbf7d0]/70 dark:bg-emerald-900/60 flex items-center justify-center text-[#006948] dark:text-emerald-300 shadow-xs">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-[#0b1c30] dark:text-white">
            Sisa Anggaran Minggu Ini
          </span>
        </div>

        {/* Dynamic status pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.badgeBg} dark:bg-emerald-950/80 dark:border-emerald-700/60`}>
          <span className={`w-2 h-2 rounded-full ${status.dotColor}`} />
          <span className="dark:text-emerald-300">{status.badgeText}</span>
        </div>
      </div>

      {/* Main Display Balance */}
      <div className="mt-3">
        <div className="text-[32px] sm:text-[36px] font-extrabold text-[#006948] dark:text-emerald-400 tracking-tight leading-tight tabular-nums flex items-baseline">
          <span>{formatRupiah(remaining)}</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
          dari total anggaran <span className="font-semibold text-slate-700 dark:text-slate-300">{formatRupiah(totalBudget)}</span>
          <span className="mx-1 text-slate-400">•</span>
          Terpakai: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatRupiah(spent)}</span>
        </p>
      </div>

      {/* Progress Track with Pin and Markers */}
      <div className="mt-4 pt-1">
        <div className="relative h-2 w-full bg-[#d7e9f7]/70 dark:bg-slate-800 rounded-full">
          {/* 80% Waspada vertical tick marker */}
          <div
            className="absolute top-[-3px] bottom-[-3px] w-[2px] bg-slate-300 dark:bg-slate-600 z-10"
            style={{ left: '80%' }}
            title="Batas Waspada 80%"
          />
          {/* 100% Batas vertical tick marker */}
          <div
            className="absolute top-[-3px] bottom-[-3px] w-[2px] bg-slate-300 dark:bg-slate-600 z-10"
            style={{ right: '0%' }}
            title="Batas Maksimal 100%"
          />

          {/* Filled progress bar */}
          <div
            className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-[#00855d] to-[#006948] dark:from-emerald-500 dark:to-teal-400"
            style={{ width: `${percentClamped}%` }}
          />

          {/* Floating thumb indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-[3px] border-[#006948] dark:border-emerald-400 shadow-sm z-20 transition-all duration-500"
            style={{ left: `${percentClamped}%` }}
          />
        </div>

        {/* Labels under progress bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-2">
          <span>0%</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              80% Waspada
            </span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              100% Batas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
