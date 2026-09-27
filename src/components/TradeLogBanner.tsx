import React from 'react';
import { BookOpen, PlusCircle, ArrowUpRight, ArrowDownRight, Clock, ChevronRight } from 'lucide-react';
import { TradeLog } from '../types';

interface TradeLogBannerProps {
  trades: TradeLog[];
  onOpenLogger: () => void;
  isHindi?: boolean;
}

export const TradeLogBanner: React.FC<TradeLogBannerProps> = ({
  trades,
  onOpenLogger,
  isHindi = false,
}) => {
  const closedTrades = trades.filter((t) => t.status === 'CLOSED');
  const netPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const latestTrade = trades[0];

  return (
    <section
      id="trade-log-banner"
      className="my-4 bg-[#0b1729] border border-[#1e3452] hover:border-[#2b4c75] rounded-xl p-3.5 sm:p-4 transition shadow-md"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left Side: Title & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-white">
                {isHindi ? 'दैनिक ट्रेड लॉग और जर्नल' : "Today's Trade Log & Journal"}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#13263e] text-[#8fa8c7] border border-[#213d62]">
                Local Storage
              </span>
              {trades.length > 0 && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                  {trades.length} {trades.length === 1 ? 'Trade' : 'Trades'} Logged
                </span>
              )}
            </div>
            <p className="text-xs text-[#8fa8c7] mt-0.5">
              {trades.length === 0
                ? isHindi
                  ? 'अपनी दैनिक एंट्री प्राइस, एग्जिट प्राइस और नोट्स स्थानीय रूप से सेव करें।'
                  : 'Log your entry, exit prices, and strategy notes for the day.'
                : latestTrade ? (
                    <span className="flex items-center gap-1.5 flex-wrap">
                      <Clock size={11} />
                      <span>Latest: <b>{latestTrade.instrument}</b> (Entry: ₹{latestTrade.entryPrice})</span>
                      {latestTrade.exitPrice && (
                        <span className={latestTrade.pnl && latestTrade.pnl >= 0 ? 'text-[#21d19b]' : 'text-[#ff6578]'}>
                          → Exit: ₹{latestTrade.exitPrice} ({latestTrade.pnl && latestTrade.pnl >= 0 ? '+' : ''}₹{latestTrade.pnl})
                        </span>
                      )}
                    </span>
                  ) : null}
            </p>
          </div>
        </div>

        {/* Right Side: Stats & 'Log Trade' CTA Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {trades.length > 0 && (
            <div className="bg-[#0e213b] border border-[#224065] rounded-lg px-3 py-1.5 text-right font-mono">
              <div className="text-[10px] text-[#8fa8c7] uppercase">Net P&L</div>
              <div
                className={`text-xs sm:text-sm font-bold flex items-center justify-end gap-0.5 ${
                  netPnl >= 0 ? 'text-[#21d19b]' : 'text-[#ff6578]'
                }`}
              >
                {netPnl >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                <span>
                  {netPnl >= 0 ? '+' : ''}₹{netPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          <button
            id="log-trade-banner-btn"
            type="button"
            onClick={onOpenLogger}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm shadow-emerald-950 cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>{isHindi ? 'ट्रेड लॉग करें' : 'Log Trade'}</span>
            <ChevronRight size={14} className="opacity-70" />
          </button>
        </div>
      </div>
    </section>
  );
};
