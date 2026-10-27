import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Tag, CreditCard } from 'lucide-react';
import { CategoryId, Transaction, TransactionType } from '../../types';
import { CATEGORIES, PAYMENT_METHODS } from '../../data/mockData';
import { parseRupiahInput, formatRupiah } from '../../utils/format';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id'>, editId?: string) => void;
  initialTransaction?: Transaction | null;
  isGoogleConnected?: boolean;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTransaction,
  isGoogleConnected,
}) => {
  const isEditMode = Boolean(initialTransaction);

  const [type, setType] = useState<TransactionType>('expense');
  const [rawAmount, setRawAmount] = useState<string>('45000');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<CategoryId>('food');
  const [paymentMethod, setPaymentMethod] = useState<string>('BCA QRIS');
  const [dateStr, setDateStr] = useState<string>('Hari ini, 12:45');
  const [note, setNote] = useState<string>('');

  // Populate fields when initialTransaction changes
  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setRawAmount(initialTransaction.amount.toString());
      setTitle(initialTransaction.title);
      setCategory(initialTransaction.category);
      setPaymentMethod(initialTransaction.paymentMethod);
      setDateStr(initialTransaction.dateStr);
      setNote(initialTransaction.note || '');
    } else {
      setType('expense');
      setRawAmount('');
      setTitle('');
      setCategory('food');
      setPaymentMethod('BCA QRIS');

      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setDateStr(`Hari ini, ${hours}:${minutes}`);
      setNote('');
    }
  }, [initialTransaction, isOpen]);

  if (!isOpen) return null;

  const numericAmount = parseRupiahInput(rawAmount);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d]/g, '');
    setRawAmount(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numericAmount || numericAmount <= 0) return;

    const defaultTitle =
      title.trim() ||
      (type === 'income' ? 'Pemasukan Kas' : CATEGORIES[category]?.name || 'Transaksi');

    const now = new Date();
    const dateIso = initialTransaction ? initialTransaction.dateIso : now.toISOString().split('T')[0];

    onSubmit(
      {
        title: defaultTitle,
        amount: numericAmount,
        type,
        category,
        categoryName: CATEGORIES[category]?.name || 'Lain-lain',
        dateStr: dateStr.trim() || `Hari ini, ${now.getHours()}:${now.getMinutes()}`,
        dateIso,
        paymentMethod,
        note: note.trim() || undefined,
      },
      initialTransaction ? initialTransaction.id : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col animate-slide-up"
        role="dialog"
      >
        {/* Handle bar on mobile */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-[#0b1c30]">
              {isEditMode ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
            </h2>
            {isGoogleConnected && (
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Data akan otomatis disinkronkan ke Google Sheets
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Segmented Type Toggle */}
          <div className="bg-[#F1F5F9] p-1 rounded-xl flex gap-1">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (category === 'income') setCategory('food');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-white text-[#ba1a1a] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('income');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-white text-[#006948] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pemasukan
            </button>
          </div>

          {/* Dedicated Currency Input Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Nominal Transaksi
            </label>
            <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 focus-within:border-[#006948] focus-within:ring-3 focus-within:ring-[#10B981]/20 transition-all">
              <span className="text-lg font-bold text-[#0b1c30] mr-2">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={numericAmount ? new Intl.NumberFormat('id-ID').format(numericAmount) : ''}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full text-2xl font-extrabold text-[#0b1c30] bg-transparent outline-none tabular-nums placeholder-slate-300"
                autoFocus={!isEditMode}
                required
              />
            </div>
          </div>

          {/* Title / Merchant Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Keterangan / Merchant
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="cth. Kopi Kenangan, Bensin, Gaji Bulanan..."
              className="w-full h-11 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#10B981]/20 transition-all"
            />
          </div>

          {/* Date preset & custom string */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Waktu Transaksi
            </label>
            <div className="flex gap-1.5 mb-1.5">
              {['Hari ini', 'Kemarin', '25 Mar', '24 Mar'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    setDateStr(`${d}, ${time}`);
                  }}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  {d}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              placeholder="cth. Hari ini, 12:45"
              className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#006948]"
              required
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Kategori Pos
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(CATEGORIES)
                .filter((cat) => (type === 'income' ? cat.id === 'income' || cat.id === 'other' : cat.id !== 'income'))
                .map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2 rounded-xl text-left border transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'border-[#006948] bg-[#eef8f3] text-[#006948] font-bold shadow-2xs'
                          : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-[11px] truncate leading-tight">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Metode Pembayaran
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = paymentMethod === pm;
                return (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentMethod(pm)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                      isSelected
                        ? 'bg-[#006948] text-white border-[#006948] shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {pm}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="cth. Bersama teman kantor, dapat diskon 20%"
              className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#006948]"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!numericAmount || numericAmount <= 0}
              className="w-full h-12 bg-[#006948] hover:bg-[#005236] disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>{isEditMode ? 'Simpan Perubahan' : 'Simpan Transaksi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
