import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  Sparkles,
  Pencil,
  Trash2,
  CheckCircle2,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { SavingsGoal } from '../../types';
import { formatRupiah } from '../../utils/format';

interface SavingsScreenProps {
  savingsGoals: SavingsGoal[];
  onOpenCreateModal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (goalId: string) => void;
  onOpenDepositModal: (goal: SavingsGoal) => void;
  onQuickPresetCreate?: (title: string, target: number, category: any) => void;
}

type FilterType = 'all' | 'in_progress' | 'completed';

export const SavingsScreen: React.FC<SavingsScreenProps> = ({
  savingsGoals,
  onOpenCreateModal,
  onEditGoal,
  onDeleteGoal,
  onOpenDepositModal,
  onQuickPresetCreate,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');

  // Overall totals
  const totalSaved = useMemo(
    () => savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0),
    [savingsGoals]
  );

  const totalTarget = useMemo(
    () => savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0),
    [savingsGoals]
  );

  const overallPercent = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;
  const totalRemaining = Math.max(0, totalTarget - totalSaved);

  const completedGoalsCount = useMemo(
    () => savingsGoals.filter((g) => g.currentAmount >= g.targetAmount).length,
    [savingsGoals]
  );

  // Filtered goals
  const filteredGoals = useMemo(() => {
    if (filter === 'completed') {
      return savingsGoals.filter((g) => g.currentAmount >= g.targetAmount);
    }
    if (filter === 'in_progress') {
      return savingsGoals.filter((g) => g.currentAmount < g.targetAmount);
    }
    return savingsGoals;
  }, [savingsGoals, filter]);

  const calculateDaysRemaining = (targetDateStr?: string) => {
    if (!targetDateStr) return null;
    const target = new Date(targetDateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="px-4 py-3 pb-28 animate-fade-in">
      {/* Header Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Rencana Tabungan
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Target finansial & impian masa depan
          </p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="px-3 py-1.5 bg-[#006948] hover:bg-[#005236] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Buat Target</span>
        </button>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-gradient-to-br from-[#eafaf2] via-[#e5f8f0] to-[#f0fbf6] dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 p-5 rounded-3xl border border-[#bbf0dc] dark:border-emerald-800/40 shadow-sm relative overflow-hidden mb-4">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-200/80 dark:bg-emerald-900/60 text-[#006948] dark:text-emerald-300 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Total Tabungan Terkumpul
            </span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#bbf7d0]/80 dark:bg-emerald-900/80 text-[#006948] dark:text-emerald-300 border border-emerald-300/50">
            {overallPercent}% Tercapai
          </span>
        </div>

        {/* Big Balance */}
        <div className="mt-3">
          <div className="text-[28px] sm:text-[32px] font-extrabold text-[#006948] dark:text-emerald-400 tracking-tight tabular-nums leading-tight">
            {formatRupiah(totalSaved)}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            dari total target <span className="font-bold text-slate-800 dark:text-slate-200">{formatRupiah(totalTarget)}</span>
            <span className="mx-1 text-slate-400">•</span>
            Sisa: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatRupiah(totalRemaining)}</span>
          </p>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-4 pt-1">
          <div className="w-full h-2.5 bg-emerald-100/80 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00855d] to-[#006948] dark:from-emerald-500 dark:to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            <span>{savingsGoals.length} Rencana Terdaftar</span>
            <span>{completedGoalsCount} Target Sudah Tercapai 🎉</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 mb-4 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-white dark:bg-slate-700 text-[#006948] dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Semua ({savingsGoals.length})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'in_progress'
              ? 'bg-white dark:bg-slate-700 text-[#006948] dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Berjalan ({savingsGoals.length - completedGoalsCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'completed'
              ? 'bg-white dark:bg-slate-700 text-[#006948] dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Tercapai ({completedGoalsCount})
        </button>
      </div>

      {/* Empty State */}
      {filteredGoals.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#006948] dark:text-emerald-400 mx-auto flex items-center justify-center text-3xl mb-3 shadow-xs">
            🎯
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            {filter === 'completed'
              ? 'Belum Ada Target yang Tercapai'
              : 'Belum Ada Rencana Tabungan'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4 leading-relaxed">
            {filter === 'completed'
              ? 'Terus menabung secara konsisten untuk mencapai target impianmu!'
              : 'Mulai buat target tabungan seperti dana darurat, liburan, beli gadget, atau kendaraan.'}
          </p>

          {/* Quick presets */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Inspirasi Rencana Cepat:
            </span>
            <div className="grid grid-cols-1 gap-2 text-left">
              <button
                onClick={() => onQuickPresetCreate?.('Dana Darurat', 10000000, 'emergency')}
                className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/50 flex items-center justify-between text-xs transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛡️</span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Dana Darurat
                    </span>
                    <span className="text-[10px] text-slate-500">Target: Rp 10.000.000</span>
                  </div>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">+ Gunakan</span>
              </button>

              <button
                onClick={() => onQuickPresetCreate?.('Beli Laptop / Gadget', 8000000, 'gadget')}
                className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/50 flex items-center justify-between text-xs transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">💻</span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Beli Laptop / Gadget
                    </span>
                    <span className="text-[10px] text-slate-500">Target: Rp 8.000.000</span>
                  </div>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">+ Gunakan</span>
              </button>

              <button
                onClick={() => onQuickPresetCreate?.('Liburan Akhir Tahun', 5000000, 'holiday')}
                className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/50 flex items-center justify-between text-xs transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">✈️</span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Liburan Akhir Tahun
                    </span>
                    <span className="text-[10px] text-slate-500">Target: Rp 5.000.000</span>
                  </div>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">+ Gunakan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List of Goals */}
      <div className="space-y-3">
        {filteredGoals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isCompleted = goal.currentAmount >= goal.targetAmount;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const daysLeft = calculateDaysRemaining(goal.targetDate);

          return (
            <div
              key={goal.id}
              className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-xs ${
                isCompleted
                  ? 'border-emerald-300 dark:border-emerald-700/60 ring-1 ring-emerald-400/20'
                  : 'border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-slate-700'
              }`}
            >
              {/* Top row: Icon, Title, Actions */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                    {goal.icon || '🎯'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {goal.title}
                      </h3>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                          <Award className="w-3 h-3" />
                          Tercapai!
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      {goal.categoryName || 'Tabungan'}
                      {goal.note ? ` • ${goal.note}` : ''}
                    </span>
                  </div>
                </div>

                {/* Edit & Delete actions */}
                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onClick={() => onEditGoal(goal)}
                    title="Ubah Target"
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus rencana tabungan "${goal.title}"?`)) {
                        onDeleteGoal(goal.id);
                      }
                    }}
                    title="Hapus Target"
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress and Amount */}
              <div className="mt-3.5">
                <div className="flex items-baseline justify-between text-xs mb-1">
                  <span className="font-extrabold text-[#006948] dark:text-emerald-400 text-base tabular-nums">
                    {formatRupiah(goal.currentAmount)}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    dari target <strong className="text-slate-800 dark:text-slate-200">{formatRupiah(goal.targetAmount)}</strong>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-[#00855d] to-[#006948] dark:from-emerald-500 dark:to-teal-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Status caption & deadline */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                  <span>{percent}% tercapai {!isCompleted && `(Sisa ${formatRupiah(remaining)})`}</span>

                  {goal.targetDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {daysLeft !== null && daysLeft > 0 ? (
                        <span>{daysLeft} hari lagi</span>
                      ) : daysLeft !== null && daysLeft <= 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">Waktu habis</span>
                      ) : (
                        <span>{goal.targetDate}</span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Deposit / Withdraw Buttons */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => onOpenDepositModal(goal)}
                  className="flex-1 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[#006948] dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <ArrowDownRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>+ Setor Tabungan</span>
                </button>

                <button
                  onClick={() => onOpenDepositModal(goal)}
                  className="px-3 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1 transition-all"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tarik</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
