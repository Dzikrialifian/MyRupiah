import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { SavingsGoal } from '../../types';
import { formatRupiah, parseRupiahInput } from '../../utils/format';

interface SavingsDepositModalProps {
  isOpen: boolean;
  goal: SavingsGoal | null;
  onClose: () => void;
  onConfirm: (
    goalId: string,
    deltaAmount: number,
    isDeposit: boolean,
    alsoRecordTransaction: boolean
  ) => void;
}

const QUICK_AMOUNTS = [50000, 100000, 250000, 500000, 1000000];

export const SavingsDepositModal: React.FC<SavingsDepositModalProps> = ({
  isOpen,
  goal,
  onClose,
  onConfirm,
}) => {
  const [isDeposit, setIsDeposit] = useState(true);
  const [amountStr, setAmountStr] = useState('100000');
  const [alsoRecordTransaction, setAlsoRecordTransaction] = useState(true);

  if (!isOpen || !goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseRupiahInput(amountStr);
    if (amount <= 0) return;

    onConfirm(goal.id, amount, isDeposit, alsoRecordTransaction);
    onClose();
  };

  const parsedAmount = parseRupiahInput(amountStr);
  const projectedBalance = isDeposit
    ? goal.currentAmount + parsedAmount
    : Math.max(0, goal.currentAmount - parsedAmount);

  const projectedPercent = Math.min(100, Math.round((projectedBalance / goal.targetAmount) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-5 animate-slide-down transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{goal.icon || '🛡️'}</span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{goal.title}</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Saldo saat ini: {formatRupiah(goal.currentAmount)} / {formatRupiah(goal.targetAmount)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deposit / Withdraw Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mt-4">
          <button
            type="button"
            onClick={() => setIsDeposit(true)}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              isDeposit
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Setor Tabungan (+)</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDeposit(false)}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              !isDeposit
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Tarik Tabungan (-)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nominal {isDeposit ? 'Setoran' : 'Penarikan'} (Rp)
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 h-12 focus-within:border-[#006948] dark:focus-within:border-emerald-500">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 mr-2">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={new Intl.NumberFormat('id-ID').format(parsedAmount)}
                onChange={(e) => setAmountStr(e.target.value.replace(/[^\d]/g, ''))}
                className="w-full text-base font-extrabold text-slate-900 dark:text-white bg-transparent outline-none tabular-nums"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Quick chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmountStr(amt.toString())}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 shrink-0"
              >
                +{amt >= 1000000 ? `${amt / 1000000} jt` : `${amt / 1000} rb`}
              </button>
            ))}
          </div>

          {/* Projected Balance Preview Card */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-150 dark:border-emerald-900/40">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Estimasi Saldo Setelah Transaksi:</span>
              <span className="font-extrabold text-[#006948] dark:text-emerald-400 tabular-nums">
                {formatRupiah(projectedBalance)}
              </span>
            </div>
            <div className="w-full h-2 bg-emerald-200/50 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#006948] dark:bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${projectedPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              <span>{projectedPercent}% dari target</span>
              <span>Target: {formatRupiah(goal.targetAmount)}</span>
            </div>
          </div>

          {/* Auto record in transaction history checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={alsoRecordTransaction}
              onChange={(e) => setAlsoRecordTransaction(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 accent-[#006948] cursor-pointer"
            />
            <span>
              Catat otomatis ke riwayat transaksi mutasi ({isDeposit ? 'Pengeluaran Tabungan' : 'Pemasukan Tabungan'})
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            className={`w-full h-12 text-white font-bold text-xs rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 ${
              isDeposit
                ? 'bg-[#006948] hover:bg-[#005236] dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-emerald-950/20'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-950/20'
            }`}
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isDeposit ? 'Konfirmasi Setor Tabungan' : 'Konfirmasi Tarik Saldo'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
