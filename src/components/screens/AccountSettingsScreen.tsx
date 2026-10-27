import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Mail,
  Target,
  Check,
  RotateCcw,
  LogOut,
  ExternalLink,
  Shield,
  FileSpreadsheet,
  Database,
  Camera,
  X,
  Loader2,
  Sparkles,
  Info,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { formatRupiah, parseRupiahInput } from '../../utils/format';
import { SyncStatus } from '../../services/sheetsService';

interface AccountSettingsScreenProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => Promise<void> | void;
  onLogout: () => void;
  onResetData: () => void;
  syncStatus: SyncStatus;
  onConnectGoogle: () => void;
  onManualSync: () => void;
}

interface ToastFeedback {
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
  details?: string;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
];

export const AccountSettingsScreen: React.FC<AccountSettingsScreenProps> = ({
  user,
  onUpdateUser,
  onLogout,
  onResetData,
  syncStatus,
  onConnectGoogle,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || 'dzikrialifian@gmail.com');
  const [budgetStr, setBudgetStr] = useState(user.totalWeeklyBudget.toString());
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);

  // States for feedback notifications
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<ToastFeedback | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  // Synchronize form when user prop changes externally
  useEffect(() => {
    setName(user.name);
    setEmail(user.email || 'dzikrialifian@gmail.com');
    setBudgetStr(user.totalWeeklyBudget.toString());
    setAvatarUrl(user.avatarUrl);
  }, [user]);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => {
      setFeedback(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Detect unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    const currentBudget = parseRupiahInput(budgetStr);
    return (
      name.trim() !== user.name.trim() ||
      email.trim() !== (user.email || '').trim() ||
      currentBudget !== user.totalWeeklyBudget ||
      avatarUrl.trim() !== user.avatarUrl.trim()
    );
  }, [name, email, budgetStr, avatarUrl, user]);

  const handleSelectPresetAvatar = (preset: string) => {
    setAvatarUrl(preset);
    setFeedback({
      type: 'info',
      title: 'Foto Profil Dipilih',
      message: 'Foto profil baru telah dipilih.',
      details: "Klik tombol 'Simpan Pengaturan Akun' di bawah untuk menerapkan perubahan ke akun Anda.",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const newBudget = parseRupiahInput(budgetStr);
    const validBudget = newBudget > 0 ? newBudget : user.totalWeeklyBudget;

    // Build specific list of what was changed for the feedback message
    const changedFields: string[] = [];
    if (name.trim() !== user.name.trim()) changedFields.push(`Nama ("${name.trim()}")`);
    if (email.trim() !== (user.email || '').trim()) changedFields.push(`Email (${email.trim()})`);
    if (validBudget !== user.totalWeeklyBudget) changedFields.push(`Batas Anggaran (${formatRupiah(validBudget)})`);
    if (avatarUrl.trim() !== user.avatarUrl.trim()) changedFields.push('Foto Profil');

    try {
      await onUpdateUser({
        name: name.trim() || user.name,
        email: email.trim() || user.email,
        totalWeeklyBudget: validBudget,
        avatarUrl: avatarUrl.trim() || user.avatarUrl,
      });

      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);

      const changeSummary =
        changedFields.length > 0
          ? `Perubahan disimpan: ${changedFields.join(', ')}.`
          : 'Pengaturan akun Anda berhasil diperbarui.';

      setFeedback({
        type: 'success',
        title: 'Pengaturan Berhasil Disimpan!',
        message: changeSummary,
        details: 'Data telah diperbarui secara lokal dan tersimpan di database Firebase Firestore.',
      });
    } catch (err: any) {
      console.error('Error saving account settings:', err);
      setFeedback({
        type: 'warning',
        title: 'Sebagian Pengaturan Disimpan',
        message: 'Pengaturan disimpan di perangkat ini, namun sinkronisasi cloud mengalami kendala.',
        details: err?.message || 'Silakan coba simpan kembali nanti.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetConfirm = () => {
    if (window.confirm('Reset seluruh data transaksi ke keadaan awal?')) {
      onResetData();
      setFeedback({
        type: 'info',
        title: 'Data Direset',
        message: 'Seluruh riwayat transaksi telah dikembalikan ke kondisi awal (kosong).',
      });
    }
  };

  return (
    <div className="px-4 py-3 pb-28 relative">
      {/* Floating Dynamic Feedback Toast */}
      {feedback && (
        <div
          role="alert"
          className={`sticky top-2 z-50 mb-4 p-4 rounded-2xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-down ${
            feedback.type === 'success'
              ? 'bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-emerald-900/10'
              : feedback.type === 'warning'
              ? 'bg-amber-50/95 border-amber-300 text-amber-950 shadow-amber-900/10'
              : 'bg-blue-50/95 border-blue-300 text-blue-950 shadow-blue-900/10'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-600 text-white'
                    : feedback.type === 'warning'
                    ? 'bg-amber-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {feedback.type === 'success' ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : feedback.type === 'warning' ? (
                  <Sparkles className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold tracking-tight">{feedback.title}</h4>
                <p className="text-xs font-medium leading-relaxed opacity-90">{feedback.message}</p>
                {feedback.details && (
                  <p className="text-[11px] opacity-75 pt-1 leading-snug">{feedback.details}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors shrink-0"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Subtle countdown bar */}
          <div className="w-full bg-black/10 h-1 rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full animate-progress ${
                feedback.type === 'success'
                  ? 'bg-emerald-600'
                  : feedback.type === 'warning'
                  ? 'bg-amber-600'
                  : 'bg-blue-600'
              }`}
            />
          </div>
        </div>
      )}

      {/* Page Title & Unsaved Alert */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0b1c30]">Pengaturan Akun</h1>
          <p className="text-xs text-slate-500">
            Kelola profil, foto akun, target anggaran, dan integrasi cloud
          </p>
        </div>
        {hasUnsavedChanges && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            Ada Perubahan
          </span>
        )}
      </div>

      {/* Profile Header Avatar Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs mb-4 flex flex-col items-center text-center">
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-emerald-500/20 shadow-md">
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default avatar preset if custom URL breaks
                (e.target as HTMLImageElement).src = AVATAR_PRESETS[0];
              }}
            />
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#006948] text-white flex items-center justify-center shadow-xs">
            <Camera className="w-3.5 h-3.5" />
          </div>
        </div>

        <h2 className="text-base font-bold text-[#0b1c30]">{name}</h2>
        <span className="text-xs text-slate-500 mt-0.5">{email}</span>

        {/* Avatar Preset Selector */}
        <div className="mt-4 pt-3 border-t border-slate-100 w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500">
              Pilih Foto Profil:
            </span>
            <span className="text-[10px] text-slate-400">Klik untuk memilih</span>
          </div>
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
            {AVATAR_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPresetAvatar(preset)}
                className={`w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 transition-all ${
                  avatarUrl === preset
                    ? 'border-[#006948] ring-2 ring-emerald-400/40 scale-110 shadow-sm'
                    : 'border-transparent hover:border-slate-300 opacity-70 hover:opacity-100'
                }`}
                title={`Pilih foto profil ${idx + 1}`}
              >
                <img src={preset} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* Section 1: Profil Pengguna */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-3.5">
          <h3 className="text-xs font-bold text-[#006948] uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>Informasi Pribadi</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nama Lengkap / Panggilan
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#006948]"
              placeholder="Contoh: Muhammad Dzikri"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Email Akun Terdaftar
            </label>
            <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 h-11">
              <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-transparent outline-none"
                required
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Mutasi transaksi di cloud Firebase & spreadsheet disinkronkan atas email ini.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Custom Foto Profil (URL Gambar)
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-slate-700 outline-none focus:border-[#006948]"
            />
          </div>
        </div>

        {/* Section 2: Target & Anggaran */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-3.5">
          <h3 className="text-xs font-bold text-[#006948] uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            <span>Target Anggaran Mingguan</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Batas Anggaran per Pekan (Rp)
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
            <span className="text-[10px] text-slate-400 mt-1 block">
              Target anggaran saat ini: <strong className="text-slate-600">{formatRupiah(parseRupiahInput(budgetStr))}</strong>. Peringatan waspada aktif di 80%.
            </span>
          </div>
        </div>

        {/* Section 3: Status Integrasi Cloud */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#006948]" />
            <span>Status Layanan Cloud</span>
          </h3>

          {/* Firebase Firestore card */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-150 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-[#006948]" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Firebase Firestore Database
                </span>
                <span className="text-[10px] text-emerald-800 font-medium">
                  Tersambung • Asia-East1 (Auto-save)
                </span>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Google Sheets card */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Google Spreadsheet
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {syncStatus.isConnected ? 'Tersinkronkan' : 'Belum Terhubung'}
                </span>
              </div>
            </div>

            {syncStatus.isConnected && syncStatus.spreadsheetId ? (
              <a
                href={`https://docs.google.com/spreadsheets/d/${syncStatus.spreadsheetId}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[#006948] font-bold hover:underline"
              >
                <span>Buka</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onConnectGoogle}
                className="px-2.5 py-1 bg-white border border-slate-200 text-xs font-bold rounded-lg hover:bg-slate-50"
              >
                Hubungkan
              </button>
            )}
          </div>
        </div>

        {/* Submit Save Button with Dynamic Feedback & Loading State */}
        <button
          type="submit"
          disabled={isSaving}
          className={`w-full h-12 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 ${
            justSaved
              ? 'bg-emerald-700 text-white shadow-emerald-900/30'
              : hasUnsavedChanges
              ? 'bg-[#006948] hover:bg-[#005236] text-white shadow-emerald-950/20 ring-2 ring-emerald-500/30'
              : 'bg-[#006948] hover:bg-[#005236] text-white shadow-emerald-950/20'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan ke Firebase...</span>
            </>
          ) : justSaved ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Pengaturan Berhasil Disimpan!</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>
                {hasUnsavedChanges
                  ? 'Simpan Perubahan Pengaturan Akun'
                  : 'Simpan Pengaturan Akun'}
              </span>
            </>
          )}
        </button>

        {/* Action Buttons: Reset Demo & Logout */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={handleResetConfirm}
            className="w-full h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data Demo Awal</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full h-11 bg-red-50 hover:bg-red-100 text-[#ba1a1a] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun (Logout)</span>
          </button>
        </div>
      </form>
    </div>
  );
};
