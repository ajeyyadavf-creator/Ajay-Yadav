import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Trash2,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  AlertCircle,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from 'lucide-react';
import { TradeLog, MarketState } from '../types';
import {
  getSavedTrades,
  saveTradeToStorage,
  deleteTradeFromStorage,
  clearAllTradesFromStorage,
} from '../utils/tradeStorage';

interface TradeLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: MarketState;
  initialTradeData?: {
    instrument?: string;
    tradeType?: 'CE' | 'PE';
    strike?: number;
    entryPrice?: number;
    quantity?: number;
  } | null;
  isHindi?: boolean;
}

export const TradeLoggerModal: React.FC<TradeLoggerModalProps> = ({
  isOpen,
  onClose,
  market,
  initialTradeData = null,
  isHindi = false,
}) => {
  const [trades, setTrades] = useState<TradeLog[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');

  // Form state
  const atmStrike = Math.round(market.nifty / 50) * 50;
  const [tradeType, setTradeType] = useState<'CE' | 'PE' | 'FUT'>('CE');
  const [strike, setStrike] = useState<number>(atmStrike);
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [entryPrice, setEntryPrice] = useState<string>('120.50');
  const [exitPrice, setExitPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('50');
  const [notes, setNotes] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editing state
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);

  // Load saved trades on mount and when modal opens
  useEffect(() => {
    if (isOpen) {
      setTrades(getSavedTrades());
      setSaveSuccess(false);

      if (initialTradeData) {
        if (initialTradeData.tradeType) setTradeType(initialTradeData.tradeType);
        if (initialTradeData.strike) setStrike(initialTradeData.strike);
        if (initialTradeData.entryPrice !== undefined) setEntryPrice(initialTradeData.entryPrice.toFixed(2));
        if (initialTradeData.quantity) setQuantity(initialTradeData.quantity.toString());
        setActiveTab('new');
      } else {
        // If no active editing, pre-fill intelligent defaults based on current market ATM
        const currentAtm = Math.round(market.nifty / 50) * 50;
        setStrike(currentAtm);
        const atmOption = market.options?.find((o) => o.strike === currentAtm);
        if (atmOption) {
          setEntryPrice((tradeType === 'CE' ? atmOption.callLTP : atmOption.putLTP).toFixed(2));
        }
      }
    }
  }, [isOpen, market.nifty, initialTradeData]);

  const handleDownloadCSV = () => {
    if (trades.length === 0) return;
    const headers = [
      'Date',
      'Time',
      'Instrument',
      'Type',
      'Entry Price',
      'Exit Price',
      'Quantity',
      'PnL Points',
      'PnL (INR)',
      'Status',
      'Notes',
    ];
    const rows = trades.map((t) => [
      `"${t.date}"`,
      `"${t.timestamp}"`,
      `"${t.instrument}"`,
      `"${t.tradeType}"`,
      t.entryPrice,
      t.exitPrice !== undefined ? t.exitPrice : '',
      t.quantity,
      t.pnlPoints !== undefined ? t.pnlPoints : '',
      t.pnl !== undefined ? t.pnl : '',
      `"${t.status}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nifty_trade_journal_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update default price when tradeType changes if editing hasn't changed manually
  const handleTypeChange = (type: 'CE' | 'PE' | 'FUT') => {
    setTradeType(type);
    const atmOption = market.options?.find((o) => o.strike === strike);
    if (atmOption) {
      if (type === 'CE') setEntryPrice(atmOption.callLTP.toFixed(2));
      else if (type === 'PE') setEntryPrice(atmOption.putLTP.toFixed(2));
      else setEntryPrice(market.nifty.toFixed(2));
    }
  };

  const handleSaveTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const entryNum = parseFloat(entryPrice);
    if (isNaN(entryNum) || entryNum <= 0) {
      alert(isHindi ? 'कृपया मान्य एंट्री प्राइस दर्ज करें।' : 'Please enter a valid entry price.');
      return;
    }

    const exitNum = exitPrice.trim() !== '' ? parseFloat(exitPrice) : undefined;
    const qtyNum = parseInt(quantity, 10) || 50;
    const instrumentName = tradeType === 'FUT' ? `NIFTY FUT` : `NIFTY ${strike} ${tradeType}`;

    const saved = saveTradeToStorage({
      id: editingTradeId || undefined,
      instrument: instrumentName,
      tradeType,
      entryPrice: entryNum,
      exitPrice: exitNum,
      quantity: qtyNum,
      notes: notes.trim(),
      action,
    });

    const updatedList = getSavedTrades();
    setTrades(updatedList);
    setSaveSuccess(true);

    // Reset form after saving
    setTimeout(() => {
      setSaveSuccess(false);
      setEditingTradeId(null);
      setExitPrice('');
      setNotes('');
      setActiveTab('history');
    }, 800);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(isHindi ? 'क्या आप इस ट्रेड को हटाना चाहते हैं?' : 'Are you sure you want to delete this trade log?')) {
      const remaining = deleteTradeFromStorage(id);
      setTrades(remaining);
    }
  };

  const handleClearAll = () => {
    if (window.confirm(isHindi ? 'सभी ट्रेड लॉग्स को साफ़ करें?' : 'Clear all trade history from local storage?')) {
      clearAllTradesFromStorage();
      setTrades([]);
    }
  };

  const handleEdit = (trade: TradeLog) => {
    setEditingTradeId(trade.id);
    setTradeType(trade.tradeType);
    setEntryPrice(trade.entryPrice.toString());
    setExitPrice(trade.exitPrice !== undefined ? trade.exitPrice.toString() : '');
    setQuantity(trade.quantity.toString());
    setNotes(trade.notes);
    setActiveTab('new');
  };

  // Metrics computation
  const totalTrades = trades.length;
  const closedTrades = trades.filter((t) => t.status === 'CLOSED');
  const netPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0).length;
  const winRate = closedTrades.length > 0 ? Math.round((winningTrades / closedTrades.length) * 100) : 0;

  // Real-time P&L preview in form
  const entryVal = parseFloat(entryPrice) || 0;
  const exitVal = parseFloat(exitPrice) || 0;
  const qtyVal = parseInt(quantity, 10) || 50;
  const hasPreviewPnl = entryVal > 0 && exitVal > 0;
  const previewPoints = action === 'BUY' ? exitVal - entryVal : entryVal - exitVal;
  const previewTotal = previewPoints * qtyVal;

  if (!isOpen) return null;

  return (
    <div
      id="trade-logger-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs"
    >
      <div
        id="trade-logger-modal"
        className="bg-[#0b1729] border border-[#203452] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1d3554] flex items-center justify-between bg-[#0e1f36]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{isHindi ? 'ट्रेड लॉग बुक' : 'Daily Trade Log'}</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-[#142943] text-emerald-400 border border-emerald-500/30">
                  Local Storage
                </span>
              </h2>
              <p className="text-xs text-[#8fa8c7]">
                {isHindi
                  ? 'अपनी दैनिक एंट्री, एग्जिट और नोट्स सुरक्षित रूप से सहेजें'
                  : 'Record entry, exit prices and trading journal notes'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#142943] transition cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-5 pt-3 border-b border-[#1d3554] bg-[#091526]">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('new');
                if (!editingTradeId) {
                  setNotes('');
                  setExitPrice('');
                }
              }}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 border-b-2 ${
                activeTab === 'new'
                  ? 'border-emerald-400 text-emerald-400 bg-[#0c1a2d]'
                  : 'border-transparent text-[#8fa8c7] hover:text-white'
              }`}
            >
              <PlusCircle size={14} />
              <span>{editingTradeId ? (isHindi ? 'ट्रेड संपादित करें' : 'Edit Trade') : (isHindi ? 'नया ट्रेड लॉग करें' : 'Log New Trade')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 border-b-2 ${
                activeTab === 'history'
                  ? 'border-emerald-400 text-emerald-400 bg-[#0c1a2d]'
                  : 'border-transparent text-[#8fa8c7] hover:text-white'
              }`}
            >
              <FileText size={14} />
              <span>{isHindi ? 'ट्रेड इतिहास' : 'Trade History'}</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#173254] text-[10px] font-mono text-slate-200">
                {trades.length}
              </span>
            </button>
          </div>

          {/* Quick Summary Badges */}
          <div className="hidden sm:flex items-center gap-3 text-xs pb-1.5 font-mono">
            <div>
              <span className="text-[#8fa8c7]">Trades: </span>
              <b className="text-white">{totalTrades}</b>
            </div>
            <div>
              <span className="text-[#8fa8c7]">Net P&L: </span>
              <b className={netPnl >= 0 ? 'text-[#21d19b]' : 'text-[#ff6578]'}>
                {netPnl >= 0 ? '+' : ''}₹{netPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </b>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#07111f] space-y-4">
          {activeTab === 'new' ? (
            /* Log Trade Form */
            <form onSubmit={handleSaveTrade} className="space-y-4 max-w-xl mx-auto">
              {editingTradeId && (
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>Editing trade record: {editingTradeId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTradeId(null);
                      setExitPrice('');
                      setNotes('');
                    }}
                    className="underline hover:text-white text-xs cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                </div>
              )}

              {/* Action and Type Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8fa8c7] mb-1">
                    {isHindi ? 'एक्शन' : 'Action'}
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-[#10233d] p-1 rounded-lg border border-[#2c4c72]">
                    <button
                      type="button"
                      onClick={() => setAction('BUY')}
                      className={`py-1 text-xs font-bold rounded transition ${
                        action === 'BUY' ? 'bg-emerald-600 text-white' : 'text-[#8fa8c7] hover:text-white'
                      }`}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => setAction('SELL')}
                      className={`py-1 text-xs font-bold rounded transition ${
                        action === 'SELL' ? 'bg-rose-600 text-white' : 'text-[#8fa8c7] hover:text-white'
                      }`}
                    >
                      SELL
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8fa8c7] mb-1">
                    {isHindi ? 'प्रकार' : 'Type'}
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-[#10233d] p-1 rounded-lg border border-[#2c4c72]">
                    {(['CE', 'PE', 'FUT'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleTypeChange(t)}
                        className={`py-1 text-xs font-bold rounded transition ${
                          tradeType === t
                            ? t === 'CE'
                              ? 'bg-emerald-600 text-white'
                              : t === 'PE'
                              ? 'bg-rose-600 text-white'
                              : 'bg-cyan-600 text-white'
                            : 'text-[#8fa8c7] hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Strike Price Selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#8fa8c7] mb-1">
                    {isHindi ? 'स्ट्राइक प्राइस' : 'Strike'}
                  </label>
                  <select
                    value={strike}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setStrike(val);
                      const opt = market.options?.find((o) => o.strike === val);
                      if (opt) {
                        setEntryPrice((tradeType === 'CE' ? opt.callLTP : opt.putLTP).toFixed(2));
                      }
                    }}
                    disabled={tradeType === 'FUT'}
                    className="w-full bg-[#10233d] text-white border border-[#2c4c72] rounded-lg px-2.5 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-40"
                  >
                    {market.options?.map((opt) => (
                      <option key={opt.strike} value={opt.strike}>
                        {opt.strike} {opt.isATM ? '(ATM)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#8fa8c7] mb-1">
                    {isHindi ? 'क्वांटिटी / लॉट' : 'Qty (Lots)'}
                  </label>
                  <input
                    type="number"
                    step="25"
                    min="25"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="50"
                    className="w-full bg-[#10233d] text-white border border-[#2c4c72] rounded-lg px-2.5 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              </div>

              {/* Entry & Exit Price Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#0c1a2d] border border-[#1d3554] rounded-xl p-3">
                  <label className="block text-xs font-semibold text-white mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{isHindi ? 'एंट्री प्राइस (₹)' : 'Current Entry Price (₹)'}</span>
                    </span>
                    <span className="text-[10px] text-[#8fa8c7]">Required</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">₹</span>
                    <input
                      type="number"
                      step="0.05"
                      required
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      placeholder="e.g. 120.50"
                      className="w-full bg-[#10233d] text-white border border-[#2c4c72] rounded-lg pl-7 pr-3 py-2 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#8fa8c7]">
                    <span>Current spot:</span>
                    <b className="text-white font-mono">{market.nifty.toFixed(2)}</b>
                  </div>
                </div>

                <div className="bg-[#0c1a2d] border border-[#1d3554] rounded-xl p-3">
                  <label className="block text-xs font-semibold text-white mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>{isHindi ? 'एग्जिट प्राइस (₹)' : 'Exit Price (₹)'}</span>
                    </span>
                    <span className="text-[10px] text-[#8fa8c7]">{isHindi ? 'वैकल्पिक / यदि बंद' : 'Optional (if closed)'}</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">₹</span>
                    <input
                      type="number"
                      step="0.05"
                      value={exitPrice}
                      onChange={(e) => setExitPrice(e.target.value)}
                      placeholder="e.g. 145.00"
                      className="w-full bg-[#10233d] text-white border border-[#2c4c72] rounded-lg pl-7 pr-3 py-2 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                  <div className="mt-1.5 text-[11px] text-[#8fa8c7]">
                    {exitPrice ? 'Trade marked as CLOSED' : 'Leave empty if position is still OPEN'}
                  </div>
                </div>
              </div>

              {/* Calculated P&L Preview if Exit is provided */}
              {hasPreviewPnl && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between font-mono text-xs ${
                    previewPoints >= 0
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {previewPoints >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>{isHindi ? 'अनुमानित लाभ/हानि:' : 'P&L Preview:'}</span>
                    <b className="font-bold">
                      {previewPoints >= 0 ? '+' : ''}{previewPoints.toFixed(2)} pts
                    </b>
                  </div>
                  <div className="text-sm font-bold">
                    {previewTotal >= 0 ? '+' : ''}₹{previewTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              )}

              {/* Notes for the Day */}
              <div>
                <label className="block text-xs font-semibold text-white mb-1.5 flex items-center justify-between">
                  <span>{isHindi ? 'ट्रेडिंग नोट्स (आज का विश्लेषण / SL / कारण)' : 'Notes for the Day'}</span>
                  <span className="text-[10px] text-[#8fa8c7]">{notes.length}/300</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    isHindi
                      ? 'उदा. VWAP के ऊपर ब्रेकआउट पर ट्रेड लिया, SL: 105, टारगेट: 150, PCR 1.18 बुलिश था।'
                      : 'e.g. Bought on VWAP bounce + RSI > 60 bullish momentum, Target: 150, SL: 100.'
                  }
                  className="w-full bg-[#10233d] text-white border border-[#2c4c72] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#142943] text-xs font-medium transition cursor-pointer"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saveSuccess}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-lg cursor-pointer ${
                    saveSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950 active:scale-95'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check size={16} />
                      <span>{isHindi ? 'सहेजा गया!' : 'Trade Logged!'}</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle size={16} />
                      <span>{editingTradeId ? (isHindi ? 'अपडेट करें' : 'Update Trade') : (isHindi ? 'ट्रेड लॉग करें' : 'Save Trade to Log')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* History & Journal View */
            <div className="space-y-4">
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-[#0c1a2d] border border-[#1d3554] rounded-xl p-3">
                  <div className="text-[11px] text-[#8fa8c7] uppercase tracking-wider">Total Trades</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">{totalTrades}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{closedTrades.length} Closed • {totalTrades - closedTrades.length} Open</div>
                </div>

                <div className="bg-[#0c1a2d] border border-[#1d3554] rounded-xl p-3">
                  <div className="text-[11px] text-[#8fa8c7] uppercase tracking-wider">Net P&L</div>
                  <div className={`text-xl font-bold font-mono mt-1 ${netPnl >= 0 ? 'text-[#21d19b]' : 'text-[#ff6578]'}`}>
                    {netPnl >= 0 ? '+' : ''}₹{netPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-[#8fa8c7] mt-0.5">Realized outcome</div>
                </div>

                <div className="bg-[#0c1a2d] border border-[#1d3554] rounded-xl p-3">
                  <div className="text-[11px] text-[#8fa8c7] uppercase tracking-wider">Win Rate</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">{winRate}%</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">{winningTrades} Wins / {closedTrades.length} Closed</div>
                </div>

                <div className="bg-[#0c1a2d] border border-[#1d3554] rounded-xl p-3 flex flex-col justify-between">
                  <div className="text-[11px] text-[#8fa8c7] uppercase tracking-wider">Storage</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-mono text-emerald-400">LocalStorage</span>
                    {trades.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-[10px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* History Actions & Filters Bar */}
              {trades.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  {/* Status Filter Tabs */}
                  <div className="flex items-center gap-1 bg-[#0c1a2d] border border-[#1d3554] rounded-lg p-0.5 text-xs">
                    {(['ALL', 'CLOSED', 'OPEN'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFilterStatus(status)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                          filterStatus === status
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-[#8fa8c7] hover:text-white'
                        }`}
                      >
                        {status === 'ALL'
                          ? isHindi ? 'सभी ट्रेड्स' : 'All Trades'
                          : status === 'CLOSED'
                          ? isHindi ? 'क्लोज्ड' : 'Closed'
                          : isHindi ? 'ओपन' : 'Open'}
                      </button>
                    ))}
                  </div>

                  {/* Export to CSV Button */}
                  <button
                    type="button"
                    onClick={handleDownloadCSV}
                    className="px-3 py-1.5 rounded-lg bg-[#142943] hover:bg-[#1a385e] border border-[#264b77] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title="Download Trade Journal as CSV / Excel"
                  >
                    <Download size={13} className="text-emerald-400" />
                    <span>{isHindi ? 'डाउनलोड CSV' : 'Export CSV'}</span>
                  </button>
                </div>
              )}

              {/* Trade Items List */}
              {trades.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-[#1d3554] rounded-2xl bg-[#0c1a2d]/50">
                  <BookOpen size={36} className="mx-auto text-slate-500 mb-2 opacity-60" />
                  <p className="text-sm font-semibold text-slate-300">
                    {isHindi ? 'अभी कोई ट्रेड लॉग नहीं है' : 'No trades logged yet'}
                  </p>
                  <p className="text-xs text-[#8fa8c7] max-w-sm mx-auto mt-1 mb-4">
                    {isHindi
                      ? "आज के ट्रेड का एंट्री प्राइस, एग्जिट प्राइस और नोट्स सहेजने के लिए 'नया ट्रेड लॉग करें' पर क्लिक करें।"
                      : "Record your entry price, exit price, and trading reasoning notes for today's session."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('new')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950"
                  >
                    <PlusCircle size={14} />
                    <span>{isHindi ? 'पहला ट्रेड लॉग करें' : 'Log First Trade'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {trades
                    .filter((t) => {
                      if (filterStatus === 'CLOSED') return t.status === 'CLOSED';
                      if (filterStatus === 'OPEN') return t.status === 'OPEN';
                      return true;
                    })
                    .map((t) => {
                    const isWin = (t.pnl || 0) > 0;
                    const isLoss = (t.pnl || 0) < 0;
                    const isClosed = t.status === 'CLOSED';

                    return (
                      <div
                        key={t.id}
                        className="bg-[#0c1a2d] border border-[#1d3554] hover:border-[#2b4c75] rounded-xl p-3.5 transition flex flex-col gap-2 relative overflow-hidden"
                      >
                        {/* Status bar on left edge */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${
                            !isClosed
                              ? 'bg-amber-400'
                              : isWin
                              ? 'bg-[#21d19b]'
                              : isLoss
                              ? 'bg-[#ff6578]'
                              : 'bg-slate-500'
                          }`}
                        />

                        {/* Top row */}
                        <div className="flex items-center justify-between pl-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono ${
                                t.tradeType === 'CE'
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                  : t.tradeType === 'PE'
                                  ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                                  : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                              }`}
                            >
                              {t.instrument}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                isClosed
                                  ? 'bg-slate-900 border-slate-700 text-slate-300'
                                  : 'bg-amber-950/70 border-amber-500/40 text-amber-300 animate-pulse'
                              }`}
                            >
                              {t.status}
                            </span>
                            <span className="text-[11px] text-[#8fa8c7] font-mono">
                              Qty: {t.quantity}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* PnL Display */}
                            {isClosed ? (
                              <div className="text-right">
                                <div
                                  className={`text-sm font-bold font-mono flex items-center justify-end gap-1 ${
                                    isWin ? 'text-[#21d19b]' : isLoss ? 'text-[#ff6578]' : 'text-slate-300'
                                  }`}
                                >
                                  {isWin ? <ArrowUpRight size={14} /> : isLoss ? <ArrowDownRight size={14} /> : null}
                                  <span>{isWin ? '+' : ''}₹{t.pnl?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="text-[10px] text-[#8fa8c7] font-mono">
                                  {t.pnlPoints && t.pnlPoints > 0 ? '+' : ''}{t.pnlPoints} pts
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                                Open Position
                              </span>
                            )}

                            {/* Edit / Delete actions */}
                            <button
                              type="button"
                              onClick={() => handleEdit(t)}
                              className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#10233d] transition cursor-pointer text-xs"
                              title="Edit / Close Trade"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(t.id)}
                              className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-[#10233d] transition cursor-pointer"
                              title="Delete log"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#081423] p-2 rounded-lg font-mono text-xs pl-3 border border-[#14263f]">
                          <div>
                            <span className="text-[10px] text-[#8fa8c7] block">ENTRY</span>
                            <span className="font-bold text-white">₹{t.entryPrice.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#8fa8c7] block">EXIT</span>
                            <span className="font-bold text-white">
                              {t.exitPrice !== undefined ? `₹${t.exitPrice.toFixed(2)}` : '— (Open)'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#8fa8c7] block">POINTS</span>
                            <span className={`font-bold ${isWin ? 'text-[#21d19b]' : isLoss ? 'text-[#ff6578]' : 'text-slate-300'}`}>
                              {t.pnlPoints !== undefined ? `${t.pnlPoints > 0 ? '+' : ''}${t.pnlPoints}` : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#8fa8c7] block">DATE & TIME</span>
                            <span className="text-[11px] text-slate-300">{t.date} {t.timestamp}</span>
                          </div>
                        </div>

                        {/* User Notes */}
                        {t.notes && (
                          <div className="pl-3 text-xs text-slate-300 bg-[#091526]/70 p-2 rounded-lg border border-[#172c48] flex items-start gap-1.5">
                            <span className="text-amber-400 shrink-0 mt-0.5">📝</span>
                            <span className="italic leading-relaxed text-slate-200">{t.notes}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-[#091322] border-t border-[#1d3554] text-[11px] text-[#8fa8c7] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Persisted locally in browser localStorage</span>
          </div>
          <div>
            NIFTY Spot: <b className="text-white font-mono">{market.nifty.toFixed(2)}</b>
          </div>
        </div>
      </div>
    </div>
  );
};
