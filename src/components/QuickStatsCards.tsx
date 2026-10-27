import React from 'react';
import { TrendingDown, Info } from 'lucide-react';
import { formatRupiah } from '../utils/format';

interface QuickStatsCardsProps {
  todaySpent: number;
  todayTransactionsCount: number;
  dailyAllowance: number;
  daysRemaining: number;
  belowAveragePercentage?: number;
  onTodayClick?: () => void;
  onAverageClick?: () => void;
}

export const QuickStatsCards: React.FC<QuickStatsCardsProps> = ({
  todaySpent,
  todayTransactionsCount,
  dailyAllowance,
  daysRemaining,
  belowAveragePercentage = 56,
  onTodayClick,
  onAverageClick,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 mx-4 mt-3">
      {/* Card 1: Hari Ini */}
      <div
        onClick={onTodayClick}
        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs hover:border-emerald-200 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Hari Ini</span>
          <span className="bg-[#e5eeff] dark:bg-slate-800 text-[#006948] dark:text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-full">
            {todayTransactionsCount} trx
          </span>
        </div>

        <div className="my-2">
          <span className="text-[20px] font-extrabold text-[#0b1c30] dark:text-white tracking-tight tabular-nums block">
            {formatRupiah(todaySpent)}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[#006948] dark:text-emerald-400 font-semibold leading-tight">
          <TrendingDown className="w-3.5 h-3.5 text-[#00855d] dark:text-emerald-400 shrink-0" />
          <span>
            {todayTransactionsCount === 0
              ? 'Belum ada pengeluaran hari ini'
              : `${belowAveragePercentage}% di bawah rata-rata`}
          </span>
        </div>
      </div>

      {/* Card 2: Rata-rata */}
      <div
        onClick={onAverageClick}
        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs hover:border-emerald-200 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Rata-rata</span>
          <span className="bg-[#bbf7d0]/70 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
            Sisa {daysRemaining} hari
          </span>
        </div>

        <div className="my-2">
          <span className="text-[20px] font-extrabold text-[#0b1c30] dark:text-white tracking-tight tabular-nums block">
            {formatRupiah(dailyAllowance)}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-tight">
          <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <span>per hari tersisa</span>
        </div>
      </div>
    </div>
  );
};
