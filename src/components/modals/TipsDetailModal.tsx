import React from 'react';
import { X, Coffee, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';

interface TipsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TipsDetailModal: React.FC<TipsDetailModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

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

        {/* Hero image of cafe table */}
        <div className="w-full h-36 rounded-2xl overflow-hidden mb-4 shadow-xs relative">
          <img
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80"
            alt="Tips Berhemat Jajan Kopi"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex items-end p-3">
            <span className="text-white text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Wawasan Cerdas Pengeluaran
            </span>
          </div>
        </div>

        <h3 className="text-base font-bold text-[#0b1c30]">
          Tips Hemat: Pos Kopi & Kudapan
        </h3>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          Kamu berhasil menghemat <span className="font-bold text-[#006948]">Rp 42.000</span> pada pos jajan kopi minggu ini dibanding minggu lalu!
        </p>

        {/* Actionable recommendations */}
        <div className="my-4 space-y-2 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-150">
          <div className="flex items-start gap-2 text-xs text-slate-800">
            <CheckCircle className="w-4 h-4 text-[#006948] shrink-0 mt-0.5" />
            <span>
              <strong>Bawa tumbler pribadi:</strong> Mendapat potongan harga hingga 10-15% di sebagian besar kedai kopi favoritmu.
            </span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-800">
            <CheckCircle className="w-4 h-4 text-[#006948] shrink-0 mt-0.5" />
            <span>
              <strong>Pilih paket combo sarapan:</strong> Hemat Rp 8.000–12.000 dibanding membeli minuman dan pastry secara terpisah.
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full h-11 bg-[#006948] hover:bg-[#005236] text-white font-bold text-xs rounded-xl shadow-md active:scale-98 transition-all"
        >
          Mengerti, Lanjutkan Hemat!
        </button>
      </div>
    </div>
  );
};
