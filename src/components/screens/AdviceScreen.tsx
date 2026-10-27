import React, { useState } from 'react';
import { Sparkles, ShieldCheck, AlertCircle, Edit3, Check } from 'lucide-react';
import { CategoryBudget } from '../../types';
import { formatRupiah } from '../../utils/format';

interface AdviceScreenProps {
  categoryBudgets: CategoryBudget[];
  onUpdateBudget: (id: string, newLimit: number) => void;
  onOpenTipsModal: () => void;
}

export const AdviceScreen: React.FC<AdviceScreenProps> = ({
  categoryBudgets,
  onUpdateBudget,
  onOpenTipsModal,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<string>('');

  const handleStartEdit = (budget: CategoryBudget) => {
    setEditingId(budget.id);
    setEditLimitValue(budget.limit.toString());
  };

  const handleSaveEdit = (id: string) => {
    const num = parseInt(editLimitValue.replace(/[^\d]/g, ''), 10);
    if (!isNaN(num) && num > 0) {
      onUpdateBudget(id, num);
    }
    setEditingId(null);
  };

  return (
    <div className="px-4 py-3 pb-24">
      {/* Screen Title */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-[#0b1c30] dark:text-white">Saran & Anggaran</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Pantau batas per kategori dan rekomendasi penghematan cerdas
        </p>
      </div>

      {/* Featured AI Insight Banner */}
      <div
        onClick={onOpenTipsModal}
        className="bg-gradient-to-r from-[#006948] to-[#00855d] text-white p-4 rounded-2xl shadow-sm mb-4 cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-200" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">
              Wawasan Cerdas Minggu Ini
            </span>
            <p className="text-xs font-medium leading-relaxed mt-1 text-white">
              Kamu berhasil menekan 42% pengeluaran jajan kopi pekan ini! Potensi tabungan tambahan: <span className="font-bold underline">Rp 168.000/bulan</span>.
            </p>
            <span className="inline-block mt-2 text-[11px] font-bold text-emerald-100 underline">
              Pelajari Tips Selengkapnya →
            </span>
          </div>
        </div>
      </div>

      {/* Section: Category Budgets */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-[#0b1c30] dark:text-white">
            Batas Anggaran Kategori
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Klik ikon pensil untuk ubah batas
          </span>
        </div>

        <div className="space-y-3">
          {categoryBudgets.map((cat) => {
            const percentage = Math.round((cat.spent / cat.limit) * 100);
            const clampedPercent = Math.min(100, percentage);

            let statusColor = 'bg-[#10B981]'; // 0-79% Normal / Sehat
            let badgeBg = 'bg-[#dcfce7] dark:bg-emerald-950/60 text-[#15803d] dark:text-emerald-300 border-[#bbf7d0] dark:border-emerald-800';
            let statusText = 'Sehat';

            if (percentage >= 100) {
              statusColor = 'bg-[#EF4444]'; // 100%+ Penuh / Melebihi
              badgeBg = 'bg-[#fee2e2] dark:bg-rose-950/60 text-[#b91c1c] dark:text-rose-300 border-[#fecaca] dark:border-rose-800';
              statusText = 'Melebihi Batas';
            } else if (percentage >= 80) {
              statusColor = 'bg-[#F59E0B]'; // 80-99% Mendekati Batas
              badgeBg = 'bg-[#fef3c7] dark:bg-amber-950/60 text-[#b45309] dark:text-amber-300 border-[#fde68a] dark:border-amber-800';
              statusText = 'Mendekati Batas';
            }

            const isEditing = editingId === cat.id;

            return (
              <div
                key={cat.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs hover:border-slate-200 dark:hover:border-slate-700 transition-all"
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {cat.name}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}
                    >
                      {percentage}% {statusText}
                    </span>

                    <button
                      onClick={() => (isEditing ? handleSaveEdit(cat.id) : handleStartEdit(cat))}
                      className="p-1 text-slate-400 hover:text-[#006948] dark:hover:text-emerald-400 transition-colors"
                      title={isEditing ? 'Simpan' : 'Ubah Batas'}
                    >
                      {isEditing ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 font-bold" />
                      ) : (
                        <Edit3 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Amounts Ratio */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Terpakai / Batas:</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 dark:text-slate-400">{formatRupiah(cat.spent)} / Rp</span>
                      <input
                        type="number"
                        value={editLimitValue}
                        onChange={(e) => setEditLimitValue(e.target.value)}
                        className="w-24 px-1.5 py-0.5 border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-800 rounded text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                      {formatRupiah(cat.spent)}{' '}
                      <span className="text-slate-400 dark:text-slate-600 font-normal">/</span>{' '}
                      {formatRupiah(cat.limit)}
                    </span>
                  )}
                </div>

                {/* Progress track */}
                <div className="h-2 w-full bg-[#f1f5f9] dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${clampedPercent}%` }}
                    className={`h-full ${statusColor} rounded-full transition-all duration-500`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations Cards */}
      <div>
        <h2 className="text-sm font-bold text-[#0b1c30] dark:text-white mb-3">
          Rekomendasi Cerdas Pekan Ini
        </h2>

        <div className="space-y-2.5">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-3 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Jaga Pos Transportasi Tetap Aman</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                Manfaatkan promo voucher ojek online pada jam sibuk pulang kerja untuk menghemat Rp 15.000–20.000 per perjalanan.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-3 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tagihan & Utilitas Mencapai 100%</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                Seluruh pos tagihan bulan ini sudah terlunasi. Hindari penambahan langganan baru sebelum siklus gajian berikutnya.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
