import React, { useState } from 'react';
import { DaySpend } from '../types';
import { formatCompactRupiah, formatRupiah } from '../utils/format';

interface DailySpendingChartProps {
  dailySpends: DaySpend[];
  averageAmount?: number;
  onSelectDay?: (day: DaySpend) => void;
}

export const DailySpendingChart: React.FC<DailySpendingChartProps> = ({
  dailySpends,
  averageAmount = 192000,
  onSelectDay,
}) => {
  const [hoveredDay, setHoveredDay] = useState<DaySpend | null>(null);

  // Find max spend for bar scaling
  const maxSpend = Math.max(...dailySpends.map((d) => d.amount), 500000);
  const chartHeightPx = 110;

  return (
    <div className="bg-white mx-4 mt-3 p-5 rounded-2xl border border-slate-100 shadow-xs relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-[#0b1c30]">
            Pengeluaran per Hari
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Senin - Minggu (Pekan ini)
          </p>
        </div>

        {/* Average Pill */}
        <div className="flex items-center gap-1.5 bg-[#eff6ff] text-[#1e40af] px-2.5 py-1 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#00855d]" />
          <span>Rata-rata: {formatCompactRupiah(averageAmount)}</span>
        </div>
      </div>

      {/* Chart visualization */}
      <div className="relative pt-6 pb-2">
        {/* Dotted Average Reference Line */}
        <div
          className="absolute left-0 right-0 border-b border-dashed border-slate-300 pointer-events-none z-0"
          style={{
            bottom: `${Math.min(chartHeightPx, (averageAmount / maxSpend) * chartHeightPx) + 32}px`,
          }}
        />

        {/* 7 Columns */}
        <div className="grid grid-cols-7 gap-2 items-end h-[140px] z-10 relative">
          {dailySpends.map((day) => {
            const hasSpend = day.amount > 0;
            const barHeight = hasSpend
              ? Math.max(16, (day.amount / maxSpend) * chartHeightPx)
              : 0;

            const isCurrentDay = day.isToday;

            return (
              <div
                key={day.dayKey}
                onClick={() => onSelectDay?.(day)}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                className="flex flex-col items-center justify-end h-full cursor-pointer group"
              >
                {/* Floating amount / status chip */}
                <div className="h-5 flex items-center justify-center mb-1">
                  {day.isMax && (
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded shadow-2xs">
                      Max
                    </span>
                  )}
                  {isCurrentDay && !day.isMax && (
                    <span className="text-[10px] font-bold text-[#006948] bg-emerald-50 px-1.5 py-0.5 rounded">
                      {formatCompactRupiah(day.amount)}
                    </span>
                  )}
                </div>

                {/* Bar or Dash */}
                <div className="w-full flex items-end justify-center h-[100px]">
                  {hasSpend ? (
                    <div
                      style={{ height: `${barHeight}px` }}
                      className={`w-7 sm:w-8 rounded-lg transition-all duration-300 group-hover:scale-105 ${
                        isCurrentDay
                          ? 'bg-[#006948] shadow-sm shadow-emerald-900/20'
                          : 'bg-[#d8e7ff] group-hover:bg-[#cbdbf5]'
                      }`}
                    />
                  ) : (
                    <div className="h-10 flex items-center justify-center text-slate-300 font-bold text-base">
                      -
                    </div>
                  )}
                </div>

                {/* Day label */}
                <div className="mt-2.5">
                  {isCurrentDay ? (
                    <span className="text-xs font-bold text-white bg-[#006948] px-2 py-0.5 rounded-md inline-block">
                      {day.dayKey}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500 group-hover:text-slate-900">
                      {day.dayKey}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip on hover/active */}
      {hoveredDay && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs animate-fade-in">
          <span className="text-slate-500 font-medium">
            Pengeluaran {hoveredDay.fullName}:
          </span>
          <span className="font-bold text-[#006948]">
            {hoveredDay.amount > 0 ? formatRupiah(hoveredDay.amount) : 'Belum ada transaksi'}
          </span>
        </div>
      )}
    </div>
  );
};
