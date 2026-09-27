import { TradeLog } from '../types';

const STORAGE_KEY = 'nifty_trade_logs_v1';

export function getSavedTrades(): TradeLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Error loading trades from localStorage:', e);
    return [];
  }
}

export function saveTradeToStorage(
  tradeData: Omit<TradeLog, 'id' | 'timestamp' | 'date' | 'pnl' | 'pnlPoints' | 'status'> & {
    id?: string;
    exitPrice?: number;
    action?: 'BUY' | 'SELL';
  }
): TradeLog {
  const existing = getSavedTrades();
  const now = new Date();

  const isExitProvided = tradeData.exitPrice !== undefined && tradeData.exitPrice !== null && !isNaN(tradeData.exitPrice);
  const action = tradeData.action || 'BUY';

  let pnlPoints: number | undefined = undefined;
  let pnl: number | undefined = undefined;

  if (isExitProvided && tradeData.exitPrice !== undefined) {
    const diff = action === 'BUY'
      ? tradeData.exitPrice - tradeData.entryPrice
      : tradeData.entryPrice - tradeData.exitPrice;

    pnlPoints = Number(diff.toFixed(2));
    pnl = Number((diff * (tradeData.quantity || 1)).toFixed(2));
  }

  const trade: TradeLog = {
    id: tradeData.id || `trade_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.toLocaleTimeString('en-IN', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
    }),
    date: now.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    instrument: tradeData.instrument || 'NIFTY 50 Option',
    tradeType: tradeData.tradeType || 'CE',
    entryPrice: Number(tradeData.entryPrice),
    exitPrice: isExitProvided ? Number(tradeData.exitPrice) : undefined,
    quantity: Number(tradeData.quantity) || 50,
    notes: tradeData.notes || '',
    pnl,
    pnlPoints,
    status: isExitProvided ? 'CLOSED' : 'OPEN',
  };

  const updated = [trade, ...existing.filter((t) => t.id !== trade.id)];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving trade to localStorage:', e);
  }

  return trade;
}

export function deleteTradeFromStorage(id: string): TradeLog[] {
  const existing = getSavedTrades();
  const filtered = existing.filter((t) => t.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error deleting trade from localStorage:', e);
  }
  return filtered;
}

export function clearAllTradesFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing trades:', e);
  }
}
