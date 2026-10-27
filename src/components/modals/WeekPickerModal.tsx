import React from 'react';
import { X, Calendar, Check } from 'lucide-react';

interface WeekPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeekText: string;
  onSelectWeek: (weekText: string) => void;
}

export const WeekPickerModal: React.FC<WeekPickerModalProps> = ({
  isOpen,
  onClose,
  currentWeekText,
  onSelectWeek,
}) => {
  if (!isOpen) return null;

  const weeks = [
    { id: 'w4', text: 'Mgg 4 • 24–30 Mar', isCurrent: true, label: 'Pekan Ini (Aktif)' },
    { id: 'w3', text: 'Mgg 3 • 17–23 Mar', isCurrent: false, label: 'Pekan Lalu' },
    { id: 'w2', text: 'Mgg 2 • 10–16 Mar', isCurrent: false, label: '2 Pekan Lalu' },
    { id: 'w1', text: 'Mgg 1 • 3–9 Mar', isCurrent: false, label: 'Awal Bulan' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-5 relative animate-scale-up"
        role="dialog"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#006948]" />
            <h2 className="text-sm font-bold text-[#0b1c30]">Pilih Periode Pekan</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {weeks.map((week) => {
            const isSelected = currentWeekText === week.text;
            return (
              <button
                key={week.id}
                onClick={() => {
                  onSelectWeek(week.text);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-[#006948] bg-[#eef8f3] text-[#006948] font-bold shadow-2xs'
                    : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">{week.text}</span>
                  <span className="text-[11px] text-slate-500 font-normal">{week.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#006948]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
