import React from 'react';
import { Home, ReceiptText, BarChart3, Lightbulb, Plus } from 'lucide-react';

export type ScreenTab = 'beranda' | 'riwayat' | 'grafik' | 'saran';

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
    { id: 'grafik' as ScreenTab, label: 'Grafik', icon: BarChart3 },
    { id: 'saran' as ScreenTab, label: 'Saran', icon: Lightbulb },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) positioned near bottom right as shown in screenshot */}
      <div className="fixed bottom-20 right-4 sm:right-[max(1rem,calc(50%-220px))] z-40">
        <button
          onClick={onOpenAddModal}
          aria-label="Tambah Transaksi"
          className="w-14 h-14 rounded-full bg-[#006948] hover:bg-[#005236] active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-950/25 border-2 border-white transition-all cursor-pointer group"
        >
          <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300 stroke-[2.5]" />
        </button>
      </div>

      {/* Sticky Bottom Dock */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-sm max-w-md mx-auto">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 transition-all ${
                  isActive ? 'text-[#006948]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.75]'
                    }`}
                  />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#006948]" />
                  )}
                </div>
                <span
                  className={`text-[11px] mt-1 font-semibold tracking-tight transition-colors ${
                    isActive ? 'text-[#006948]' : 'text-slate-500 font-normal'
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
