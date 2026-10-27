/**
 * Indonesian Rupiah and Date formatting utilities
 * adhering to Dompet Pintar Design System:
 * - Format: Rp 250.000 (standard thousands period delimiter)
 * - Space between prefix 'Rp' and the digits
 */

export function formatRupiah(amount: number, options?: { showSign?: boolean; isExpense?: boolean }): string {
  const isNegative = amount < 0 || options?.isExpense;
  const absVal = Math.abs(amount);
  const formattedNumber = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(absVal);

  if (options?.showSign) {
    const sign = isNegative ? '-Rp\u00A0' : '+Rp\u00A0';
    return `${sign}${formattedNumber}`;
  }

  return `Rp\u00A0${formattedNumber}`;
}

export function formatCompactRupiah(amount: number): string {
  if (amount >= 1000000) {
    const jt = (amount / 1000000).toFixed(1).replace('.0', '');
    return `${jt}jt`;
  }
  if (amount >= 1000) {
    const rb = Math.round(amount / 1000);
    return `${rb}k`;
  }
  return `${amount}`;
}

export function parseRupiahInput(value: string): number {
  // Strip non-digit characters
  const cleaned = value.replace(/[^\d]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

export interface BudgetStatus {
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
  label: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
  barColor: string;
}

export function calculateBudgetStatus(spent: number, total: number): BudgetStatus {
  if (total <= 0) {
    return {
      percentage: 100,
      status: 'danger',
      label: 'Batas',
      badgeBg: 'bg-red-50 text-red-700 border-red-200',
      badgeText: 'Melebihi Batas (100%)',
      dotColor: 'bg-red-500',
      barColor: 'bg-[#EF4444]',
    };
  }

  const percentage = Math.round((spent / total) * 100);

  if (percentage < 80) {
    return {
      percentage,
      status: 'safe',
      label: 'Aman',
      badgeBg: 'bg-[#bbf7d0]/60 text-[#006948] border-[#86efac]',
      badgeText: `Aman (${percentage}%)`,
      dotColor: 'bg-[#00855d]',
      barColor: 'bg-[#00855d]',
    };
  } else if (percentage < 100) {
    return {
      percentage,
      status: 'warning',
      label: 'Waspada',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      badgeText: `Waspada (${percentage}%)`,
      dotColor: 'bg-[#F59E0B]',
      barColor: 'bg-[#F59E0B]',
    };
  } else {
    return {
      percentage,
      status: 'danger',
      label: 'Batas',
      badgeBg: 'bg-red-50 text-red-700 border-red-200',
      badgeText: `Penuh (${percentage}%)`,
      dotColor: 'bg-[#EF4444]',
      barColor: 'bg-[#EF4444]',
    };
  }
}
