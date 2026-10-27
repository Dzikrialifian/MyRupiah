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
        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-200 transition-all cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Hari Ini</span>
          <span className="bg-[#e5eeff] text-[#006948] text-[11px] font-bold px-2 py-0.5 rounded-full">
            {todayTransactionsCount} trx
          </span>
        </div>

        <div className="my-2">
          <span className="text-[20px] font-extrabold text-[#0b1c30] tracking-tight tabular-nums block">
            {formatRupiah(todaySpent)}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[#006948] font-semibold leading-tight">
          <TrendingDown className="w-3.5 h-3.5 text-[#00855d] shrink-0" />
          <span>{belowAveragePercentage}% di bawah rata-rata</span>
        </div>
      </div>

      {/* Card 2: Rata-rata */}
      <div
        onClick={onAverageClick}
        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-200 transition-all cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Rata-rata</span>
          <span className="bg-[#bbf7d0]/70 text-[#006948] text-[11px] font-bold px-2 py-0.5 rounded-full">
            Sisa {daysRemaining} hari
          </span>
        </div>

        <div className="my-2">
          <span className="text-[20px] font-extrabold text-[#0b1c30] tracking-tight tabular-nums block">
            {formatRupiah(dailyAllowance)}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-normal leading-tight">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>per hari tersisa</span>
        </div>
      </div>
    </div>
  );
};
