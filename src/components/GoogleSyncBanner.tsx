import React from 'react';
import { ExternalLink, RefreshCw, CheckCircle2, AlertCircle, FileSpreadsheet, LogOut } from 'lucide-react';
import { SyncStatus } from '../services/sheetsService';

interface GoogleSyncBannerProps {
  userEmail: string | null;
  syncStatus: SyncStatus;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  onManualSync: () => void;
  onImportFromSheets: () => void;
}

export const GoogleSyncBanner: React.FC<GoogleSyncBannerProps> = ({
  userEmail,
  syncStatus,
  onConnectGoogle,
  onDisconnectGoogle,
  onManualSync,
  onImportFromSheets,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-150 dark:border-slate-800 p-4 shadow-xs mb-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-[#0b1c30] dark:text-white">
                Google Sheets & Firebase Cloud
              </h3>
              {syncStatus.isConnected && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {syncStatus.isConnected && userEmail
                ? `Terhubung: ${userEmail} (Firestore & Sheets Aktif)`
                : 'Sinkronkan mutasi ke cloud Firestore & spreadsheet'}
            </p>
          </div>
        </div>

        {/* Action Button: Connect or Refresh */}
        <div>
          {!syncStatus.isConnected ? (
            <button
              onClick={onConnectGoogle}
              disabled={syncStatus.isSyncing}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              {/* Google G logo */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
              <span>Hubungkan</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onManualSync}
                disabled={syncStatus.isSyncing}
                title="Sinkronkan Sekarang"
                className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 flex items-center justify-center transition-all active:scale-95"
              >
                <RefreshCw
                  className={`w-4 h-4 ${syncStatus.isSyncing ? 'animate-spin' : ''}`}
                />
              </button>
              <button
                onClick={onDisconnectGoogle}
                title="Putuskan Akun"
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center justify-center transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sync Status Info Bar */}
      {syncStatus.isConnected && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#006948] dark:text-emerald-400" />
            <span>
              {syncStatus.lastSyncedAt
                ? `Tersinkron: ${syncStatus.lastSyncedAt}`
                : 'Siap melakukan sinkronisasi otomatis'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onImportFromSheets}
              disabled={syncStatus.isSyncing}
              className="text-[#006948] dark:text-emerald-400 hover:underline font-semibold"
            >
              Impor dari Sheet
            </button>

            {syncStatus.spreadsheetId && (
              <a
                href={`https://docs.google.com/spreadsheets/d/${syncStatus.spreadsheetId}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#006948] dark:text-emerald-400 hover:underline font-bold"
              >
                <span>Buka Sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Error display if any */}
      {syncStatus.error && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 p-2 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{syncStatus.error}</span>
        </div>
      )}
    </div>
  );
};
