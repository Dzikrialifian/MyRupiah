import { Transaction, CategoryId, TransactionType } from '../types';
import { CATEGORIES } from '../data/mockData';

export const SPREADSHEET_NAME = 'Dompet Pintar - My Rupiah Transaksi';
const SPREADSHEET_ID_KEY = 'myrupiah_spreadsheet_id';

export interface SyncStatus {
  isConnected: boolean;
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  error: string | null;
}

export const getSavedSpreadsheetId = (): string | null => {
  try {
    return localStorage.getItem(SPREADSHEET_ID_KEY);
  } catch {
    return null;
  }
};

export const saveSpreadsheetId = (id: string | null) => {
  try {
    if (id) {
      localStorage.setItem(SPREADSHEET_ID_KEY, id);
    } else {
      localStorage.removeItem(SPREADSHEET_ID_KEY);
    }
  } catch {}
};

/**
 * Searches user's Google Drive for existing Dompet Pintar spreadsheet,
 * or creates a beautifully formatted new one.
 */
export async function getOrCreateSpreadsheet(accessToken: string): Promise<string> {
  const existingId = getSavedSpreadsheetId();

  // Validate existing ID if present
  if (existingId) {
    try {
      const checkRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${existingId}?fields=spreadsheetId`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (checkRes.ok) {
        return existingId;
      }
    } catch {
      // If failed, proceed to search or create
    }
  }

  // Search Drive for file by name
  try {
    const q = encodeURIComponent(
      `name = '${SPREADSHEET_NAME}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
    );
    const driveSearchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (driveSearchRes.ok) {
      const data = await driveSearchRes.json();
      if (data.files && data.files.length > 0) {
        const foundId = data.files[0].id;
        saveSpreadsheetId(foundId);
        return foundId;
      }
    }
  } catch (err) {
    console.warn('Drive search error, creating new sheet:', err);
  }

  // Create new Spreadsheet with formatted headers
  const createPayload = {
    properties: {
      title: SPREADSHEET_NAME,
    },
    sheets: [
      {
        properties: {
          title: 'Daftar Transaksi',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
    ],
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Gagal membuat Google Spreadsheet baru.');
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const sheetId = createdData.sheets?.[0]?.properties?.sheetId || 0;

  saveSpreadsheetId(spreadsheetId);

  // Set headers and initial formatting
  const headers = [
    'ID Transaksi',
    'Tanggal',
    'Email Pengguna',
    'Judul / Keterangan',
    'Tipe',
    'Kategori',
    'Nominal (Rp)',
    'Metode Pembayaran',
    'Catatan',
    'Terakhir Diperbarui',
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Daftar Transaksi'!A1:J1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [headers],
      }),
    }
  );

  // Format header row: Emerald background, white bold text
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: headers.length,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.0, green: 0.41, blue: 0.28 }, // #006948
                  textFormat: {
                    bold: true,
                    foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                    fontSize: 10,
                  },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: headers.length,
              },
            },
          },
        ],
      }),
    });
  } catch (err) {
    console.warn('Formatting sheet header failed non-critically:', err);
  }

  return spreadsheetId;
}

/**
 * Converts transaction items to 2D array for Google Sheets
 */
export function transactionsToRows(transactions: Transaction[], userEmail?: string): any[][] {
  const now = new Date().toLocaleString('id-ID');
  return transactions.map((t) => [
    t.id,
    t.dateStr,
    t.userEmail || userEmail || '-',
    t.title,
    t.type === 'expense' ? 'Pengeluaran' : 'Pemasukan',
    t.categoryName,
    t.amount,
    t.paymentMethod,
    t.note || '-',
    now,
  ]);
}

/**
 * Synchronizes the entire transaction array to the Google Spreadsheet
 */
export async function syncAllTransactionsToSheet(
  accessToken: string,
  spreadsheetId: string,
  transactions: Transaction[],
  userEmail?: string
): Promise<void> {
  const rows = transactionsToRows(transactions, userEmail);

  // 1. Clear existing rows from row 2 onwards
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Daftar Transaksi'!A2:J1000:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // 2. Write new rows if there are any
  if (rows.length > 0) {
    const putRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Daftar Transaksi'!A2:J${rows.length + 1}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: rows,
        }),
      }
    );

    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Gagal menyimpan transaksi ke Google Sheets.');
    }
  }
}

/**
 * Imports transactions from Google Sheet into the app
 */
export async function importTransactionsFromSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<Transaction[]> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Daftar Transaksi'!A2:J1000`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal membaca data dari Google Sheets.');
  }

  const data = await res.json();
  const rows: any[][] = data.values || [];

  return rows.map((row, index) => {
    // Check if column 2 is an email (10-column format) or title (9-column format)
    const hasEmailCol = typeof row[2] === 'string' && row[2].includes('@');

    const id = row[0] || `sheet-${Date.now()}-${index}`;
    const dateStr = row[1] || 'Hari ini, 12:00';
    const userEmail = hasEmailCol ? row[2] : undefined;
    const title = (hasEmailCol ? row[3] : row[2]) || 'Transaksi';
    const typeStr = ((hasEmailCol ? row[4] : row[3]) || '').toLowerCase();
    const type: TransactionType = typeStr.includes('pemasukan') ? 'income' : 'expense';
    const categoryName = (hasEmailCol ? row[5] : row[4]) || 'Makanan & Minuman';

    // Reverse lookup categoryId
    const foundCatKey = (Object.keys(CATEGORIES) as CategoryId[]).find(
      (k) => CATEGORIES[k].name.toLowerCase() === categoryName.toLowerCase()
    );
    const category: CategoryId = foundCatKey || (type === 'income' ? 'income' : 'food');

    const rawAmt = hasEmailCol ? row[6] : row[5];
    const amountNum = typeof rawAmt === 'number' ? rawAmt : parseInt(String(rawAmt).replace(/[^\d]/g, ''), 10) || 0;
    const paymentMethod = (hasEmailCol ? row[7] : row[6]) || 'BCA QRIS';
    const rawNote = hasEmailCol ? row[8] : row[7];
    const note = rawNote && rawNote !== '-' ? rawNote : undefined;

    return {
      id,
      title,
      amount: amountNum,
      type,
      category,
      categoryName,
      dateStr,
      dateIso: new Date().toISOString().split('T')[0],
      paymentMethod,
      note,
      userEmail,
    };
  });
}

