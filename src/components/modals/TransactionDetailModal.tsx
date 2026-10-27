import React from 'react';
import { X, Trash2, Edit3, Calendar, CreditCard, FileText } from 'lucide-react';
import { Transaction } from '../../types';
import { CATEGORIES } from '../../data/mockData';
import { formatRupiah } from '../../utils/format';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onEdit: (transaction: Transaction) => void;
  onRequestDelete: (transaction: Transaction) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onEdit,
  onRequestDelete,
}) => {
  if (!transaction) return null;

  const category = CATEGORIES[transaction.category] || CATEGORIES.other;
  const isExpense = transaction.type === 'expense';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 relative animate-scale-up"
        role="dialog"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Icon & Category */}
        <div className="text-center pt-2">
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-sm ${category.bgColor} mb-3`}
          >
            <span>{category.icon}</span>
          </div>
          <h3 className="text-base font-bold text-[#0b1c30]">
            {transaction.title}
          </h3>
          <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {transaction.categoryName}
          </span>
        </div>

        {/* Big Amount */}
        <div className="text-center my-4 py-3 bg-slate-50 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Total {isExpense ? 'Pengeluaran' : 'Pemasukan'}
          </span>
          <span
            className={`text-2xl font-extrabold tabular-nums ${
              isExpense ? 'text-[#ba1a1a]' : 'text-[#006948]'
            }`}
          >
            {formatRupiah(transaction.amount, { showSign: true, isExpense })}
          </span>
        </div>

        {/* Details List */}
        <div className="space-y-3 text-xs mb-5 border-t border-b border-slate-100 py-3">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Waktu Transaksi
            </span>
            <span className="font-semibold text-slate-900">{transaction.dateStr}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-400" />
              Metode Pembayaran
            </span>
            <span className="font-semibold text-slate-900">{transaction.paymentMethod}</span>
          </div>

          {transaction.note && (
            <div className="flex items-start justify-between text-slate-600 pt-1">
              <span className="flex items-center gap-2 shrink-0">
                <FileText className="w-4 h-4 text-slate-400" />
                Catatan
              </span>
              <span className="font-medium text-slate-900 text-right ml-4">
                {transaction.note}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons: Edit, Delete, Close */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onEdit(transaction);
              onClose();
            }}
            className="h-11 rounded-xl bg-[#006948] hover:bg-[#005236] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Data</span>
          </button>

          <button
            onClick={() => {
              onRequestDelete(transaction);
              onClose();
            }}
            className="h-11 rounded-xl bg-red-50 hover:bg-red-100 text-[#ba1a1a] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>
  );
};
