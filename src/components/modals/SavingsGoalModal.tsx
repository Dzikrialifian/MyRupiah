import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, FileText, Check } from 'lucide-react';
import { SavingsGoal, SavingsCategory } from '../../types';
import { SAVINGS_CATEGORIES } from '../../data/mockData';
import { formatRupiah, parseRupiahInput } from '../../utils/format';

interface SavingsGoalModalProps {
  isOpen: boolean;
  initialGoal: SavingsGoal | null;
  onClose: () => void;
  onSubmit: (goalData: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
}

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  initialGoal,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [currentAmountStr, setCurrentAmountStr] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<SavingsCategory>('emergency');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      setTargetAmountStr(initialGoal.targetAmount.toString());
      setCurrentAmountStr(initialGoal.currentAmount.toString());
      setTargetDate(initialGoal.targetDate || '');
      setCategory(initialGoal.category);
      setNote(initialGoal.note || '');
    } else {
      setTitle('');
      setTargetAmountStr('5000000');
      setCurrentAmountStr('0');
      // Default to 6 months from now
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setTargetDate(d.toISOString().slice(0, 10));
      setCategory('emergency');
      setNote('');
    }
  }, [initialGoal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmt = parseRupiahInput(targetAmountStr);
    const currentAmt = parseRupiahInput(currentAmountStr);

    if (!title.trim() || targetAmt <= 0) return;

    const catInfo = SAVINGS_CATEGORIES[category];

    onSubmit(
      {
        title: title.trim(),
        targetAmount: targetAmt,
        currentAmount: Math.max(0, currentAmt),
        targetDate: targetDate || '',
        category,
        categoryName: catInfo.name,
        icon: catInfo.icon,
        color: catInfo.color,
        note: note.trim() || undefined,
      },
      initialGoal ? initialGoal.id : undefined
    );

    onClose();
  };

  const parsedTarget = parseRupiahInput(targetAmountStr);
  const parsedCurrent = parseRupiahInput(currentAmountStr);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-5 max-h-[92vh] overflow-y-auto no-scrollbar animate-slide-down transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {initialGoal ? 'Ubah Rencana Tabungan' : 'Buat Rencana Tabungan'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Atur target impian dan pantau progres tabunganmu
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Impian / Rencana
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Dana Darurat, Beli Laptop, Liburan Jepang"
              className="w-full h-11 px-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#006948] dark:focus:border-emerald-500"
              required
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Kategori Impian
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(SAVINGS_CATEGORIES) as SavingsCategory[]).map((catKey) => {
                const item = SAVINGS_CATEGORIES[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-[#006948] dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-xs'
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xl mb-1">{item.icon}</span>
                    <span
                      className={`text-[10px] leading-tight line-clamp-1 font-medium ${
                        isSelected
                          ? 'text-[#006948] dark:text-emerald-400 font-bold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Tabungan (Rp)
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 h-11 focus-within:border-[#006948] dark:focus-within:border-emerald-500">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={new Intl.NumberFormat('id-ID').format(parsedTarget)}
                onChange={(e) => setTargetAmountStr(e.target.value.replace(/[^\d]/g, ''))}
                className="w-full text-sm font-bold text-slate-900 dark:text-white bg-transparent outline-none tabular-nums"
                required
              />
            </div>
          </div>

          {/* Current Saved Amount (Only editable when creating or manual adjust) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Saldo Tabungan Saat Ini (Rp)
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 h-11 focus-within:border-[#006948] dark:focus-within:border-emerald-500">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={new Intl.NumberFormat('id-ID').format(parsedCurrent)}
                onChange={(e) => setCurrentAmountStr(e.target.value.replace(/[^\d]/g, ''))}
                className="w-full text-sm font-bold text-slate-900 dark:text-white bg-transparent outline-none tabular-nums"
              />
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
              Bisa diisi 0 jika baru akan mulai menabung.
            </span>
          </div>

          {/* Target Deadline Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Tanggal Tercapai
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 h-11">
              <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 dark:text-white bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Note / Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Motivasi (Opsional)
            </label>
            <div className="flex items-start bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5">
              <FileText className="w-4 h-4 text-slate-400 mr-2 mt-0.5 shrink-0" />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Sisihkan Rp 200rb setiap akhir pekan"
                rows={2}
                className="w-full text-xs text-slate-800 dark:text-white bg-transparent outline-none resize-none"
              />
            </div>
          </div>

          {/* Summary Preview Pill */}
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-150 dark:border-emerald-800/40 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Sisa Target Dibutuhkan:</span>
            <span className="font-extrabold text-[#006948] dark:text-emerald-400 tabular-nums">
              {formatRupiah(Math.max(0, parsedTarget - parsedCurrent))}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full h-12 bg-[#006948] hover:bg-[#005236] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-950/20 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{initialGoal ? 'Perbarui Rencana' : 'Simpan Rencana Tabungan'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
