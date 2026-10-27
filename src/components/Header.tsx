import React from 'react';
import { Bell } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  activeScreenTitle: string;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeScreenTitle,
  onOpenNotifications,
  onOpenProfile,
  unreadCount = 2,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#f8f9ff]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between transition-all">
      {/* Brand logo & screen title */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00855d] to-[#006948] flex items-center justify-center shadow-sm shadow-emerald-900/10 text-white">
          {/* Custom My Rupiah Wallet / Rounded G glyph */}
          <svg
            className="w-5 h-5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-8 8H6" />
            <circle cx="18" cy="14" r="1" fill="currentColor" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-wider text-[#006948] uppercase leading-tight">
            MY RUPIAH
          </span>
          <span className="text-base font-bold text-[#0b1c30] leading-none">
            {activeScreenTitle}
          </span>
        </div>
      </div>

      {/* Right actions: Notification Bell & Profile Avatar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenNotifications}
          aria-label="Notifikasi"
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </button>

        <button
          onClick={onOpenProfile}
          aria-label="Profil Pengguna"
          className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-emerald-500/30 hover:ring-emerald-500 active:scale-95 transition-all"
        >
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  );
};
