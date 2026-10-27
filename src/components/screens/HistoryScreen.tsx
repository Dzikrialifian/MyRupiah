import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Plus, Edit2, Trash2, ArrowUpDown } from 'lucide-react';
import { Transaction, TransactionType } from '../../types';
import { CATEGORIES } from '../../data/mockData';
import { formatRupiah } from '../../utils/format';
import { GoogleSyncBanner } from '../GoogleSyncBanner';
import { SyncStatus } from '../../services/sheetsService';

interface HistoryScreenProps {
  transactions: Transaction[];
  onSelectTransaction: (trx: Transaction) => void;
  onOpenAddModal: () => void;
  onEditTransaction: (trx: Transaction) => void;
  onRequestDeleteTransaction: (trx: Transaction) => void;
  // Google Sheets Sync
  userEmail: string | null;
  syncStatus: SyncStatus;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  onManualSync: () => void;
  onImportFromSheets: () => void;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  transactions,
  onSelectTransaction,
  onOpenAddModal,
  onEditTransaction,
  onRequestDeleteTransaction,
  userEmail,
  syncStatus,
  onConnectGoogle,
  onDisconnectGoogle,
  onManualSync,
  onImportFromSheets,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let result = transactions.filter((trx) => {
      const matchesSearch =
        trx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trx.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trx.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trx.note && trx.note.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = typeFilter === 'all' || trx.type === typeFilter;
      const matchesCategory =
        selectedCategory === 'all' || trx.category === selectedCategory;

      return matchesSearch && matchesType && matchesCategory;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'highest') {
        return b.amount - a.amount;
      }
      if (sortBy === 'lowest') {
        return a.amount - b.amount;
      }
      if (sortBy === 'oldest') {
        return a.id.localeCompare(b.id);
      }
      // default: newest
      return b.id.localeCompare(a.id);
    });

    return result;
  }, [transactions, searchQuery, typeFilter, selectedCategory, sortBy]);

  // Aggregate sums
  const totalExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="px-4 py-3 pb-24">
      {/* Top Title & Quick Add */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-[#0b1c30]">Riwayat Transaksi</h1>
          <p className="text-xs text-slate-500">
            Kelola, perbarui, dan sinkronkan mutasi kas
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 bg-[#006948] hover:bg-[#005236] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Google Sheets Sync Banner */}
      <GoogleSyncBanner
        userEmail={userEmail}
        syncStatus={syncStatus}
        onConnectGoogle={onConnectGoogle}
        onDisconnectGoogle={onDisconnectGoogle}
        onManualSync={onManualSync}
        onImportFromSheets={onImportFromSheets}
      />

      {/* Summary Mini Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-500 block">Pengeluaran</span>
          <span className="text-xs sm:text-sm font-extrabold text-[#ba1a1a] mt-1 block tabular-nums truncate">
            {formatRupiah(totalExpense)}
          </span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-500 block">Pemasukan</span>
          <span className="text-xs sm:text-sm font-extrabold text-[#006948] mt-1 block tabular-nums truncate">
            {formatRupiah(totalIncome)}
          </span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-500 block">Arus Bersih</span>
          <span className={`text-xs sm:text-sm font-extrabold mt-1 block tabular-nums truncate ${netBalance >= 0 ? 'text-[#006948]' : 'text-[#ba1a1a]'}`}>
            {formatRupiah(netBalance, { showSign: true, isExpense: netBalance < 0 })}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari transaksi, merchant, metode..."
          className="w-full h-11 pl-10 pr-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#006948] transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter and Sort Controls */}
      <div className="space-y-2 mb-4">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setTypeFilter('all')}
            className={`h-7 px-3 rounded-full text-xs font-semibold shrink-0 transition-all ${
              typeFilter === 'all'
                ? 'bg-[#006948] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua ({transactions.length})
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`h-7 px-3 rounded-full text-xs font-semibold shrink-0 transition-all ${
              typeFilter === 'expense'
                ? 'bg-[#006948] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Pengeluaran
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`h-7 px-3 rounded-full text-xs font-semibold shrink-0 transition-all ${
              typeFilter === 'income'
                ? 'bg-[#006948] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Pemasukan
          </button>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-7 px-2.5 rounded-full text-xs font-semibold bg-white text-slate-600 border border-slate-200 shrink-0 focus:outline-none focus:border-[#006948]"
          >
            <option value="all">Semua Kategori</option>
            <option value="food">🍔 Makanan & Minuman</option>
            <option value="transport">🛵 Transportasi</option>
            <option value="groceries">🛒 Kebutuhan Rumah</option>
            <option value="bills">⚡ Tagihan & Utilitas</option>
            <option value="entertainment">🎬 Hiburan</option>
            <option value="shopping">🛍️ Belanja</option>
            <option value="income">💼 Pendapatan</option>
          </select>
        </div>

        {/* Sort selector */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>Menampilkan {filteredAndSortedTransactions.length} transaksi</span>
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="highest">Nominal Terbesar</option>
              <option value="lowest">Nominal Terkecil</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List with Edit & Delete quick triggers */}
      <div className="space-y-2.5">
        {filteredAndSortedTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs">
            <p className="text-sm font-semibold text-slate-700">Tidak ada transaksi ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci atau filter pencarian</p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 bg-[#006948] text-white text-xs font-bold rounded-xl"
            >
              + Tambah Transaksi Sekarang
            </button>
          </div>
        ) : (
          filteredAndSortedTransactions.map((trx) => {
            const category = CATEGORIES[trx.category] || CATEGORIES.other;
            const isExpense = trx.type === 'expense';

            return (
              <div
                key={trx.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs hover:border-emerald-200 transition-all flex items-center justify-between gap-3 group"
              >
                {/* Clickable Info Area */}
                <div
                  onClick={() => onSelectTransaction(trx)}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${category.bgColor} text-xl shadow-2xs`}
                  >
                    <span>{category.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#0b1c30] truncate group-hover:text-[#006948] transition-colors">
                      {trx.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal truncate mt-0.5">
                      {category.name} <span className="text-slate-300">•</span> {trx.dateStr}
                    </p>
                    {trx.note && (
                      <p className="text-[11px] text-slate-400 italic truncate mt-0.5">
                        "{trx.note}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Amount, Method and Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    onClick={() => onSelectTransaction(trx)}
                    className="text-right cursor-pointer"
                  >
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

                  {/* Quick Action Icons: Edit & Delete */}
                  <div className="flex items-center pl-2 border-l border-slate-100 gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTransaction(trx);
                      }}
                      title="Edit Transaksi"
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-[#006948] hover:bg-emerald-50 flex items-center justify-center transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestDeleteTransaction(trx);
                      }}
                      title="Hapus Transaksi"
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
