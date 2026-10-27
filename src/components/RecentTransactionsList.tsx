import React from 'react';
import { Transaction } from '../types';
import { CATEGORIES } from '../data/mockData';
import { formatRupiah } from '../utils/format';

interface RecentTransactionsListProps {
  transactions: Transaction[];
  onViewAll: () => void;
  onSelectTransaction: (trx: Transaction) => void;
}

export const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({
  transactions,
  onViewAll,
  onSelectTransaction,
}) => {
  // Show first 4-5 recent transactions
  const displayList = transactions.slice(0, 4);

  return (
    <div className="mx-4 mt-4 pb-24">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-base font-bold text-[#0b1c30]">
          Transaksi Terakhir
        </h2>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-[#006948] hover:text-[#005137] active:scale-95 transition-all"
        >
          Lihat Semua
        </button>
      </div>

      {/* Transaction Items */}
      <div className="space-y-2.5">
        {displayList.map((trx) => {
          const category = CATEGORIES[trx.category] || CATEGORIES.other;
          const isExpense = trx.type === 'expense';

          return (
            <div
              key={trx.id}
              onClick={() => onSelectTransaction(trx)}
              className="bg-white p-3.5 rounded-2xl border border-slate-100/90 shadow-2xs hover:shadow-xs hover:border-emerald-200/60 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between gap-3"
            >
              {/* Left: Icon & Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${category.bgColor} text-xl shadow-2xs`}
                >
                  <span>{category.icon}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#0b1c30] truncate">
                    {trx.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal truncate mt-0.5">
                    {category.name} <span className="text-slate-300">•</span> {trx.dateStr}
                  </p>
                </div>
              </div>

              {/* Right: Amount & Payment Method */}
              <div className="text-right shrink-0">
                <span
                  className={`text-sm sm:text-base font-extrabold tabular-nums block ${
                    isExpense ? 'text-[#ba1a1a]' : 'text-[#006948]'
                  }`}
                >
                  {formatRupiah(trx.amount, { showSign: true, isExpense })}
                </span>
                <span className="text-xs text-slate-500 font-medium block mt-0.5">
                  {trx.paymentMethod}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
