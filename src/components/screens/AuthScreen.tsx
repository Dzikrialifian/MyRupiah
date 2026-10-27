import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, AlertCircle, ShieldCheck, Eye, EyeOff, Globe } from 'lucide-react';

interface AuthScreenProps {
  onEmailLogin: (email: string, pass: string) => Promise<void>;
  onEmailRegister: (email: string, pass: string, name: string) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  clearError: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onEmailLogin,
  onEmailRegister,
  onGoogleSignIn,
  isLoading,
  errorMessage,
  clearError,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    if (isRegister) {
      await onEmailRegister(email.trim(), password, name.trim() || 'Pengguna');
    } else {
      await onEmailLogin(email.trim(), password);
    }
  };

  const isDomainError = errorMessage && errorMessage.includes('unauthorized-domain');
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'domain ini';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eafaf2] via-[#f0fbf6] to-[#f8f9ff] dark:from-[#06090e] dark:via-[#0b101b] dark:to-[#06090e] flex flex-col justify-center items-center px-4 py-8 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-150/80 dark:border-slate-800 p-6 sm:p-8 relative overflow-hidden animate-scale-up transition-colors">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-200/30 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00855d] to-[#006948] mx-auto flex items-center justify-center text-white shadow-md shadow-emerald-950/20 mb-3">
            <svg
              className="w-7 h-7 text-white"
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
          <span className="text-[11px] font-extrabold tracking-widest text-[#006948] dark:text-emerald-400 uppercase">
            MY RUPIAH • DOMPET PINTAR
          </span>
          <h1 className="text-2xl font-extrabold text-[#0b1c30] dark:text-white mt-1 tracking-tight">
            {isRegister ? 'Daftar Akun Baru' : 'Masuk ke Akun'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isRegister
              ? 'Daftar dengan email Anda untuk mulai mengelola keuangan'
              : 'Gunakan email terdaftar Anda untuk mengakses catatan transaksi'}
          </p>
        </div>

        {/* Segmented Auth Toggle */}
        <div className="bg-[#F1F5F9] p-1 rounded-xl flex gap-1 mb-5">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              clearError();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              !isRegister
                ? 'bg-white text-[#006948] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              clearError();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              isRegister
                ? 'bg-white text-[#006948] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Error message card */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 space-y-1.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span className="font-semibold leading-snug">{errorMessage}</span>
            </div>

            {/* Special Vercel / Domain guidance */}
            {isDomainError && (
              <div className="mt-2 pt-2 border-t border-red-200/80 text-[11px] text-slate-700 bg-white/70 p-2.5 rounded-xl">
                <span className="font-bold flex items-center gap-1 text-slate-900 mb-1">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  Solusi untuk domain Vercel ({currentHost}):
                </span>
                <p className="leading-relaxed text-slate-600">
                  Untuk login dengan Google di Vercel: Buka <strong>Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</strong>, lalu klik <strong>Add domain</strong> dan masukkan <code className="bg-slate-150 px-1 py-0.5 rounded font-mono text-[10px] text-slate-900">{currentHost}</code>.
                </p>
                <p className="mt-1 font-semibold text-emerald-800">
                  💡 Tips: Anda dapat langsung mendaftar atau masuk menggunakan <strong>Email &amp; Kata Sandi</strong> di formulir atas tanpa kendala domain.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nama Lengkap / Panggilan
              </label>
              <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 h-11 focus-within:border-[#006948] focus-within:ring-2 focus-within:ring-[#10B981]/20">
                <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="cth. Rian Alifian"
                  className="w-full text-xs font-medium text-slate-900 bg-transparent outline-none placeholder-slate-400"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Alamat Email
            </label>
            <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 h-11 focus-within:border-[#006948] focus-within:ring-2 focus-within:ring-[#10B981]/20">
              <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full text-xs font-medium text-slate-900 bg-transparent outline-none placeholder-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Kata Sandi
            </label>
            <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 h-11 focus-within:border-[#006948] focus-within:ring-2 focus-within:ring-[#10B981]/20">
              <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                minLength={6}
                className="w-full text-xs font-medium text-slate-900 bg-transparent outline-none placeholder-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#006948] hover:bg-[#005236] disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-950/20 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{isLoading ? 'Memproses...' : isRegister ? 'Daftar & Masuk' : 'Masuk Sekarang'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-slate-200" />
          <span className="px-3 text-[11px] text-slate-400 font-medium">
            atau lanjutkan dengan
          </span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* Google Workspace Sign-In Button */}
        <button
          type="button"
          onClick={onGoogleSignIn}
          disabled={isLoading}
          className="w-full h-11 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs active:scale-98 transition-all flex items-center justify-center gap-2.5"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 10.02 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Masuk dengan Google (Sheets & Drive)</span>
        </button>

        {/* Security badge */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Data tersimpan privat berdasarkan akun email Anda</span>
        </div>
      </div>
    </div>
  );
};
