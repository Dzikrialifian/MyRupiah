import React, { useState } from 'react';
import { X, Check, RotateCcw, User, Target } from 'lucide-react';
import { UserProfile } from '../../types';
import { formatRupiah, parseRupiahInput } from '../../utils/format';

interface BudgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onResetData: () => void;
}

export const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onResetData,
}) => {
  const [name, setName] = useState(user.name);
  const [budgetStr, setBudgetStr] = useState(user.totalWeeklyBudget.toString());

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget = parseRupiahInput(budgetStr);
    onUpdateUser({
      name: name.trim() || user.name,
      totalWeeklyBudget: newBudget > 0 ? newBudget : user.totalWeeklyBudget,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 relative animate-scale-up"
        role="dialog"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-base font-bold text-[#0b1c30] mb-1">
          Pengaturan Dompet & Profil
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Sesuaikan target batas anggaran mingguan kamu
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Nama Panggilan
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#006948]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-slate-400" />
              Batas Anggaran Mingguan (Rp)
            </label>
            <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 h-11 focus-within:border-[#006948]">
              <span className="text-xs font-bold text-slate-500 mr-2">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={new Intl.NumberFormat('id-ID').format(parseRupiahInput(budgetStr))}
                onChange={(e) => setBudgetStr(e.target.value.replace(/[^\d]/g, ''))}
                className="w-full text-sm font-bold text-slate-900 bg-transparent outline-none tabular-nums"
                required
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Default: Rp 2.000.000 per pekan
            </span>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full h-11 bg-[#006948] hover:bg-[#005236] text-white font-bold text-xs rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset data transaksi ke contoh awal?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Demo Awal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
