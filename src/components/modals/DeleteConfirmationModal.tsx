import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Transaction } from '../../types';
import { formatRupiah } from '../../utils/format';

interface DeleteConfirmationModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
  isGoogleConnected?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onConfirmDelete,
  isGoogleConnected,
}) => {
  if (!isOpen || !transaction) return null;

  const isExpense = transaction.type === 'expense';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 relative animate-scale-up"
        role="dialog"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-center text-[#0b1c30]">
          Konfirmasi Hapus Transaksi
        </h3>

        <p className="text-xs text-slate-500 text-center mt-1 leading-relaxed">
          Apakah kamu yakin ingin menghapus data transaksi ini secara permanen?
        </p>

        {/* Transaction Summary Card */}
        <div className="my-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 truncate mr-2">
              {transaction.title}
            </span>
            <span
              className={`text-xs font-extrabold tabular-nums shrink-0 ${
                isExpense ? 'text-[#ba1a1a]' : 'text-[#006948]'
              }`}
            >
              {formatRupiah(transaction.amount, { showSign: true, isExpense })}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>{transaction.categoryName}</span>
            <span>{transaction.dateStr}</span>
          </div>
        </div>

        {isGoogleConnected && (
          <p className="text-[11px] text-slate-500 bg-amber-50/80 border border-amber-200/80 p-2.5 rounded-xl mb-4 text-center">
            Perubahan ini juga akan disinkronkan ke Google Spreadsheet terkait.
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(transaction.id);
              onClose();
            }}
            className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>
  );
};
