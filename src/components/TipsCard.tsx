import React from 'react';
import { ChevronRight } from 'lucide-react';

interface TipsCardProps {
  onOpenTipsModal: () => void;
}

export const TipsCard: React.FC<TipsCardProps> = ({ onOpenTipsModal }) => {
  return (
    <div
      onClick={onOpenTipsModal}
      className="bg-white mx-4 mt-3 p-4 rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer flex items-center gap-3.5 group"
    >
      {/* Thumbnail image */}
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-2xs bg-slate-100">
        <img
          src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=300&q=80"
          alt="Tips Kopi & Berhemat"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#006948]">
            Tips Cerdas My Rupiah
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#006948] transition-colors" />
        </div>
        <p className="text-xs text-slate-700 leading-relaxed line-clamp-2 mt-1">
          Kamu berhemat <span className="font-bold text-slate-900">Rp 42.000</span> pada pos jajan kopi minggu ini dibanding minggu lalu....
        </p>
      </div>
    </div>
  );
};
