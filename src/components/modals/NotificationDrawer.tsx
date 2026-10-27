import React from 'react';
import { X, CheckCircle2, AlertTriangle, Info, BellRing } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif-1',
      title: 'Pengeluaran Hari Ini Terkendali!',
      description: 'Total belanja Jumatmu 56% lebih rendah dari rata-rata batas harian. Kerja bagus!',
      time: '15 menit yang lalu',
      type: 'success',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'notif-2',
      title: 'Peringatan Pos Tagihan (100%)',
      description: 'Pos Tagihan & Utilitas telah mencapai kuota maksimal Rp 450.000.',
      time: '3 jam yang lalu',
      type: 'warning',
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 'notif-3',
      title: 'Sisa Anggaran Pekan Ini: Rp 650.000',
      description: 'Tersedia kuota Rp 192.850 per hari untuk Sabtu & Minggu.',
      time: 'Kemarin, 21:00',
      type: 'info',
      icon: Info,
      color: 'text-blue-600 bg-blue-50',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-5 mt-12 relative animate-scale-up"
        role="dialog"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-[#006948]" />
            <h2 className="text-sm font-bold text-[#0b1c30]">Notifikasi Finansial</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 mt-2 max-h-[60vh] overflow-y-auto no-scrollbar">
          {notifications.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="py-3 flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                    {item.description}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {item.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
        >
          Tandai Sudah Dibaca
        </button>
      </div>
    </div>
  );
};
