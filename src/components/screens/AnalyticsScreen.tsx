import React, { useState } from 'react';
import { PieChart, TrendingUp, Calendar, Zap } from 'lucide-react';
import { Transaction, DaySpend } from '../../types';
import { CATEGORIES } from '../../data/mockData';
import { formatRupiah, formatCompactRupiah } from '../../utils/format';

interface AnalyticsScreenProps {
  transactions: Transaction[];
  dailySpends: DaySpend[];
  totalWeeklyBudget: number;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  transactions,
  dailySpends,
  totalWeeklyBudget,
}) => {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Group by category
  const categoryTotals = expenseTransactions.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([catId, amount]) => {
      const categoryInfo = CATEGORIES[catId as keyof typeof CATEGORIES] || CATEGORIES.other;
      const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
      return {
        id: catId,
        name: categoryInfo.name,
        icon: categoryInfo.icon,
        amount,
        percentage,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Highest day
  const maxDay = [...dailySpends].sort((a, b) => b.amount - a.amount)[0];

  return (
    <div className="px-4 py-3 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#0b1c30]">Grafik & Analisis</h1>
          <p className="text-xs text-slate-500">Visualisasi komposisi pengeluaran kamu</p>
        </div>

        {/* Period toggle segmented control */}
        <div className="bg-slate-200/70 p-0.5 rounded-full flex items-center">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              period === 'weekly' ? 'bg-white text-[#006948] shadow-xs' : 'text-slate-600'
            }`}
          >
            Pekan Ini
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              period === 'monthly' ? 'bg-white text-[#006948] shadow-xs' : 'text-slate-600'
            }`}
          >
            Bulan Ini
          </button>
        </div>
      </div>

      {/* Summary Total Card */}
      <div className="bg-gradient-to-br from-[#006948] to-[#004e35] text-white p-5 rounded-3xl shadow-md mb-4 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
          <PieChart className="w-36 h-36" />
        </div>

        <span className="text-xs font-semibold text-emerald-200 block uppercase tracking-wider">
          Total Pengeluaran Pekan Ini
        </span>
        <div className="text-[30px] font-extrabold tracking-tight mt-1 mb-2 tabular-nums">
          {formatRupiah(totalExpense)}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-emerald-600/40 text-xs text-emerald-100">
          <TrendingUp className="w-4 h-4 text-emerald-300" />
          <span>Rata-rata: {formatCompactRupiah(Math.round(totalExpense / 5))} per hari aktif</span>
        </div>
      </div>

      {/* Insight Highlight Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs mb-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-800">Hari Pengeluaran Tertinggi</h3>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            <span className="font-bold text-slate-900">{maxDay?.fullName || 'Rabu'}</span> adalah hari dengan pengeluaran terbesar pekan ini sebesar <span className="font-bold text-[#ba1a1a]">{formatRupiah(maxDay?.amount || 480000)}</span>.
          </p>
        </div>
      </div>

      {/* Category Breakdown Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <h2 className="text-sm font-bold text-[#0b1c30] mb-3">
          Distribusi per Kategori
        </h2>

        {/* Multi-segment Color Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex mb-4">
          {categoryBreakdown.map((item, idx) => {
            const colors = [
              'bg-[#006948]',
              'bg-[#10B981]',
              'bg-[#34D399]',
              'bg-[#6ee7b7]',
              'bg-[#a7f3d0]',
              'bg-[#cbd5e1]',
            ];
            return (
              <div
                key={item.id}
                style={{ width: `${item.percentage}%` }}
                className={`${colors[idx % colors.length]} h-full transition-all`}
                title={`${item.name}: ${item.percentage}%`}
              />
            );
          })}
        </div>

        {/* Detailed List */}
        <div className="space-y-3.5">
          {categoryBreakdown.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg">{item.icon}</span>
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 block truncate">
                    {item.name}
                  </span>
                  <span className="text-slate-400 font-medium text-[11px]">
                    {item.percentage}% dari total
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-extrabold text-slate-900 tabular-nums block">
                  {formatRupiah(item.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
