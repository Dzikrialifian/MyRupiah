import React from 'react';
import { Home, ReceiptText, Target, BarChart3, Lightbulb, User, Plus } from 'lucide-react';

export type ScreenTab = 'beranda' | 'riwayat' | 'tabungan' | 'grafik' | 'saran' | 'akun';

interface BottomNavBarProps {
  currentTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
  onOpenAddModal: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
  onOpenAddModal,
}) => {
  const tabs = [
    { id: 'beranda' as ScreenTab, label: 'Beranda', icon: Home },
    { id: 'riwayat' as ScreenTab, label: 'Riwayat', icon: ReceiptText },
    { id: 'tabungan' as ScreenTab, label: 'Tabungan', icon: Target },
    { id: 'grafik' as ScreenTab, label: 'Grafik', icon: BarChart3 },
    { id: 'saran' as ScreenTab, label: 'Saran', icon: Lightbulb },
    { id: 'akun' as ScreenTab, label: 'Akun', icon: User },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) positioned near bottom right */}
      <div className="fixed bottom-20 right-4 sm:right-[max(1rem,calc(50%-220px))] z-40">
        <button
          onClick={onOpenAddModal}
          aria-label="Tambah Transaksi"
          className="w-14 h-14 rounded-full bg-[#006948] hover:bg-[#005236] dark:bg-emerald-600 dark:hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-950/25 border-2 border-white dark:border-slate-800 transition-all cursor-pointer group"
        >
          <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300 stroke-[2.5]" />
        </button>
      </div>

      {/* Sticky Bottom Dock */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 shadow-sm max-w-md mx-auto transition-colors">
        <div className="flex items-center justify-around px-1 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
                  isActive
                    ? 'text-[#006948] dark:text-emerald-400'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.75]'
                    }`}
                  />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#006948] dark:bg-emerald-400" />
                  )}
                </div>
                <span
                  className={`text-[10px] mt-0.5 font-semibold tracking-tight transition-colors ${
                    isActive
                      ? 'text-[#006948] dark:text-emerald-400 font-bold'
                      : 'text-slate-500 dark:text-slate-400 font-normal'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
