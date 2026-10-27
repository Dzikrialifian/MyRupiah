import React from 'react';
import { Calendar } from 'lucide-react';
import { UserProfile } from '../types';

interface GreetingSectionProps {
  user: UserProfile;
  onOpenWeekPicker: () => void;
}

export const GreetingSection: React.FC<GreetingSectionProps> = ({
  user,
  onOpenWeekPicker,
}) => {
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-2">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight text-[#0b1c30] flex items-center gap-1.5 leading-tight">
          Halo, {user.name}! <span className="inline-block animate-wiggle">👋</span>
        </h1>
        <p className="text-sm font-normal text-slate-500 mt-0.5">
          Selamat datang kembali
        </p>
      </div>

      <button
        onClick={onOpenWeekPicker}
        className="flex items-center gap-1.5 bg-[#e5eeff] hover:bg-[#d8e7ff] text-[#006948] px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all active:scale-95"
      >
        <Calendar className="w-3.5 h-3.5 text-[#006948]" />
        <span>{user.currentWeekText}</span>
      </button>
    </div>
  );
};
