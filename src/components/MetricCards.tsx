import React, { useEffect, useState } from 'react';
import { MarketState } from '../types';
import { TrendingUp, TrendingDown, Activity, Zap, Compass, BarChart2, ShieldAlert, Volume2 } from 'lucide-react';
import { playLoudBeepBeep, speakVoiceAlert } from '../utils/marketEngine';

interface MetricCardsProps {
  market: MarketState;
  isHindi?: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ market, isHindi = false }) => {
  const [niftyFlash, setNiftyFlash] = useState<'up' | 'down' | null>(null);
  const [prevNifty, setPrevNifty] = useState(market.nifty);

  useEffect(() => {
    if (market.nifty > prevNifty) {
      setNiftyFlash('up');
    } else if (market.nifty < prevNifty) {
      setNiftyFlash('down');
    }
    setPrevNifty(market.nifty);

    const timer = setTimeout(() => {
      setNiftyFlash(null);
    }, 900);
    return () => clearTimeout(timer);
  }, [market.nifty]);

  const isBuyCE = market.signal.includes('BUY CE');
  const isBuyPE = market.signal.includes('BUY PE');

  const signalColorClass = isBuyCE
    ? 'text-[#21d19b]'
    : isBuyPE
    ? 'text-[#ff6578]'
    : 'text-[#ffd166]';

  const signalBadgeBg = isBuyCE
    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
    : isBuyPE
    ? 'bg-rose-950/50 border-rose-500/40 text-rose-300'
    : 'bg-amber-950/50 border-amber-500/40 text-amber-300';

  const barColor = isBuyCE
    ? 'bg-[#21d19b] shadow-[0_0_12px_rgba(33,209,155,0.6)]'
    : isBuyPE
    ? 'bg-[#ff6578] shadow-[0_0_12px_rgba(255,101,120,0.6)]'
    : 'bg-[#ffd166] shadow-[0_0_12px_rgba(255,209,102,0.6)]';

  const isAboveVwap = market.nifty >= market.vwap;
  const isRsiBullish = market.rsi >= 55;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. NIFTY */}
      <div
        id="card-nifty"
        className={`bg-[#0c1a2d] border border-[#1d3554] rounded-xl p-4 transition-all duration-300 relative overflow-hidden ${
          niftyFlash === 'up'
            ? 'ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-950/50'
            : niftyFlash === 'down'
            ? 'ring-2 ring-rose-500/50 shadow-lg shadow-rose-950/50'
            : 'hover:border-[#2a4d7a]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8fa8c7]">
            NIFTY 50
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#10233d] border border-[#234066] text-slate-300 font-mono">
            SPOT
          </span>
        </div>
        <div
          id="nifty"
          className="text-2xl sm:text-[28px] font-bold font-mono tracking-tight text-white mt-1.5 flex items-baseline gap-2"
        >
          {market.nifty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          {niftyFlash === 'up' && (
            <span className="text-xs text-[#21d19b] animate-bounce">▲</span>
          )}
          {niftyFlash === 'down' && (
            <span className="text-xs text-[#ff6578] animate-bounce">▼</span>
          )}
        </div>
        <div
          id="nchg"
          className={`text-xs font-medium mt-1 flex items-center gap-1 ${
            market.niftyChange >= 0 ? 'text-[#21d19b]' : 'text-[#ff6578]'
          }`}
        >
          {market.niftyChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>
            {market.niftyChange >= 0 ? '+' : ''}
            {market.niftyChange.toFixed(2)} ({market.niftyChange >= 0 ? '+' : ''}
            {market.niftyChangePct.toFixed(2)}%)
          </span>
        </div>

        {/* Real Day High / Low & Prev Close metrics */}
        <div className="mt-2.5 pt-2 border-t border-[#182e4b] flex items-center justify-between text-[10.5px] font-mono text-[#8fa8c7]">
          <span>H: <b className="text-emerald-400">₹{(market.dayHigh || 23389.15).toFixed(1)}</b></span>
          <span>L: <b className="text-rose-400">₹{(market.dayLow || 23286.60).toFixed(1)}</b></span>
          <span>P.Close: <b className="text-slate-300">₹{(market.prevClose || 23270.60).toFixed(1)}</b></span>
        </div>
      </div>

      {/* 2. GIFT NIFTY */}
      <div
        id="card-gift-nifty"
        className="bg-[#0c1a2d] border border-[#1d3554] rounded-xl p-4 hover:border-[#2a4d7a] transition relative overflow-hidden flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8fa8c7] flex items-center gap-1.5">
              <span>GIFT NIFTY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#10233d] border border-[#234066] text-amber-300 font-mono font-semibold">
              {market.gift - Math.round(market.nifty) >= 0 ? '+' : ''}
              {market.gift - Math.round(market.nifty)} PTS
            </span>
          </div>
          <div id="gift" className="text-2xl sm:text-[28px] font-bold font-mono tracking-tight text-white mt-1.5">
            ₹{market.gift.toLocaleString()}
          </div>
          <div
            className={`text-xs font-medium mt-1 flex items-center gap-1 ${
              market.giftChangePct >= 0 ? 'text-[#21d19b]' : 'text-[#ff6578]'
            }`}
          >
            {market.giftChangePct >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            <span>
              {market.giftChangePct >= 0 ? '+' : ''}
              {market.giftChangePct.toFixed(2)}%
            </span>
            <span className="text-slate-400 font-mono text-[11px] ml-1">
              ({market.gift - Math.round(market.nifty) >= 25 ? 'Strong Gap-Up' : market.gift - Math.round(market.nifty) <= -25 ? 'Gap-Down Risk' : 'Flat/Neutral'})
            </span>
          </div>
        </div>

        {/* Global Cues Micro Row */}
        <div className="mt-2.5 pt-2 border-t border-[#182e4b] flex items-center justify-between text-[10.5px] font-mono text-[#8fa8c7]">
          <span>US Cues: <b className={market.globalMarkets?.usSentiment === 'Bullish' ? 'text-emerald-400' : market.globalMarkets?.usSentiment === 'Bearish' ? 'text-rose-400' : 'text-amber-400'}>{market.globalMarkets?.usSentiment || 'Mixed'}</b></span>
          <span>Asia: <b className={market.globalMarkets?.asianSentiment === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}>{market.globalMarkets?.asianSentiment || 'Bullish'}</b></span>
        </div>
      </div>

      {/* 3. CRUDE OIL */}
      <div
        id="card-crude-oil"
        className="bg-[#0c1a2d] border border-[#1d3554] rounded-xl p-4 hover:border-[#2a4d7a] transition relative overflow-hidden flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8fa8c7]">
              CRUDE OIL & DXY
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#10233d] border border-[#234066] text-amber-300 font-mono">
              BRENT
            </span>
          </div>
          <div id="crude" className="text-2xl sm:text-[28px] font-bold font-mono tracking-tight text-white mt-1.5">
            ${market.crude.toFixed(2)}
          </div>
          <div
            className={`text-xs font-medium mt-1 flex items-center gap-1 ${
              market.crudeChangePct > 0 ? 'text-[#ff6578]' : 'text-[#21d19b]'
            }`}
          >
            {market.crudeChangePct >= 0 ? '+' : ''}
            {market.crudeChangePct.toFixed(2)}%
            <span className="text-[#8fa8c7] text-[11px] ml-1">
              {market.crudeChangePct > 0.8 ? '(Cost Pressure)' : '(Stable Inflation)'}
            </span>
          </div>
        </div>

        {/* Macro Dollar Index Micro Row */}
        <div className="mt-2.5 pt-2 border-t border-[#182e4b] flex items-center justify-between text-[10.5px] font-mono text-[#8fa8c7]">
          <span>DXY: <b className="text-slate-200">{market.globalMarkets?.items.find(i => i.id === 'dxy')?.price.toFixed(1) || '100.9'}</b></span>
          <span>US 10Y: <b className="text-slate-200">{market.globalMarkets?.items.find(i => i.id === 'us10y')?.price.toFixed(2) || '4.99'}%</b></span>
          <span>FII: <b className={market.globalMarkets?.fiiFlowImpact === 'Positive' ? 'text-emerald-400' : 'text-amber-400'}>{market.globalMarkets?.fiiFlowImpact || 'Inflow'}</b></span>
        </div>
      </div>

      {/* 4. PCR */}
      <div
        id="card-pcr"
        className="bg-[#0c1a2d] border border-[#1d3554] rounded-xl p-4 hover:border-[#2a4d7a] transition relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8fa8c7]">
            PUT-CALL RATIO (PCR)
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#10233d] border border-[#234066] text-slate-300 font-mono">
            OI RATIO
          </span>
        </div>
        <div id="pcr" className="text-2xl sm:text-[28px] font-bold font-mono tracking-tight text-white mt-1.5">
          {market.pcr.toFixed(2)}
        </div>
        <div
          className={`text-xs font-medium mt-1 flex items-center gap-1 ${
            market.pcr >= 1.0 ? 'text-[#21d19b]' : market.pcr <= 0.85 ? 'text-[#ff6578]' : 'text-[#ffd166]'
          }`}
        >
          {market.pcrBias}
        </div>
      </div>

      {/* 5. COMBINED TRADE SIGNAL (grid-column: span 2) */}
      <div
        id="card-combined-signal"
        className="bg-[#0c1a2d] border border-[#1d3554] rounded-xl p-4 sm:col-span-2 flex flex-col justify-between relative overflow-hidden shadow-md hover:border-[#2a4d7a] transition"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8fa8c7] flex items-center gap-1.5">
            <Zap size={14} className="text-amber-400" />
            <span>COMBINED TRADE SIGNAL</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const isBuy = market.signal.includes('BUY CE');
                const isSell = market.signal.includes('BUY PE');
                const soundType = isBuy ? 'buy_ce' : isSell ? 'buy_pe' : 'neutral';
                playLoudBeepBeep(soundType, () => {
                  speakVoiceAlert(market.signal, market.confidenceScore, isHindi ? 'hi' : 'en');
                });
              }}
              className="px-2 py-0.5 rounded-md bg-[#132845] hover:bg-[#1b3860] border border-[#2a4d79] text-[11px] font-mono font-bold text-amber-300 hover:text-white flex items-center gap-1 transition cursor-pointer shadow-xs"
              title={isHindi ? 'लाउड बीप-बीप और वॉयस टेस्ट करें' : 'Play Loud Beep-Beep Signal Alert'}
            >
              <Volume2 size={12} className="text-amber-400" />
              <span>{isHindi ? 'बीप-बीप टेस्ट' : 'Test Beep'}</span>
            </button>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${signalBadgeBg}`}>
              {market.confidenceScore}% {isHindi ? 'विश्वास' : 'Confidence'}
            </span>
          </div>
        </div>

        <div className="py-2 text-center">
          <div
            id="signal"
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${signalColorClass} flex items-center justify-center gap-2 drop-shadow-sm`}
          >
            {market.signal}
          </div>
          <div id="score" className="text-xs sm:text-sm text-[#8fa8c7] mt-1 font-medium">
            {isHindi ? 'कॉन्फिडेंस स्कोर:' : 'Confidence Score:'}{' '}
            <b className="text-white font-mono">{market.confidenceScore}</b> / 100
          </div>
        </div>

        {/* Live Target, Stop Loss & Suggested Strike for Traders */}
        <div className="my-2 py-2 px-3 rounded-lg bg-[#081324] border border-[#1d3554] grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] uppercase font-mono font-semibold text-[#8fa8c7]">
              {isHindi ? 'सुझाया स्ट्राइक' : 'SUGGESTED STRIKE'}
            </div>
            <div className="text-xs sm:text-sm font-bold font-mono text-cyan-300 mt-0.5">
              {isBuyCE
                ? `NIFTY ${Math.round(market.nifty / 50) * 50} CE`
                : isBuyPE
                ? `NIFTY ${Math.round(market.nifty / 50) * 50} PE`
                : 'WAIT & WATCH'}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono font-semibold text-rose-400">
              {isHindi ? 'स्टॉप लॉस (SL)' : 'STOP LOSS (SL)'}
            </div>
            <div className="text-xs sm:text-sm font-bold font-mono text-rose-300 mt-0.5">
              {isBuyCE
                ? `₹${(market.nifty - 35).toFixed(0)} (-35 pts)`
                : isBuyPE
                ? `₹${(market.nifty + 35).toFixed(0)} (+35 pts)`
                : 'Range Bound'}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono font-semibold text-emerald-400">
              {isHindi ? 'टारगेट (T1 / T2)' : 'TARGET (T1 / T2)'}
            </div>
            <div className="text-xs sm:text-sm font-bold font-mono text-emerald-300 mt-0.5">
              {isBuyCE
                ? `₹${(market.nifty + 45).toFixed(0)} / ${(market.nifty + 80).toFixed(0)}`
                : isBuyPE
                ? `₹${(market.nifty - 45).toFixed(0)} / ${(market.nifty - 80).toFixed(0)}`
                : 'No Trade Zone'}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2">
          <div className="flex justify-between text-[11px] text-[#8fa8c7] mb-1 font-mono">
            <span>0 (Extreme Bearish)</span>
            <span>50 (Range)</span>
            <span>100 (Strong Bullish)</span>
          </div>
          <div className="h-2.5 bg-[#182b45] rounded-full overflow-hidden p-0.5 border border-[#203957]">
            <div
              id="bar"
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${Math.max(5, market.confidenceScore)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 6. RSI (14) */}
      <div
        id="card-rsi"
        className="bg-[#0c1a2d] border border-[#1d3554] rounded-xl p-4 hover:border-[#2a4d7a] transition"
      >
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8fa8c7]">
            RSI (14)
          </div>
          <Activity size={14} className="text-[#8fa8c7]" />
        </div>
        <div id="rsi" className="text-2xl sm:text-[28px] font-bold font-mono tracking-tight text-white mt-1.5">
          {market.rsi.toFixed(1)}
        </div>
        <div
          className={`text-xs font-medium mt-1 ${
            market.rsi > 60 ? 'text-[#21d19b]' : market.rsi < 40 ? 'text-[#ff6578]' : 'text-[#ffd166]'
          }`}
        >
          {market.rsi > 60 ? 'Bullish momentum zone' : market.rsi < 40 ? 'Oversold / Bearish zone' : 'Neutral zone (40-60)'}
        </div>
      </div>

      {/* 7. VWAP */}
      <div
        id="card-vwap"
        className="bg-[#0c1a2d] border border-[#1d3554] rounded-xl p-4 hover:border-[#2a4d7a] transition"
      >
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8fa8c7]">
            INTRADAY VWAP
          </div>
          <Compass size={14} className="text-[#8fa8c7]" />
        </div>
        <div id="vwap" className="text-2xl sm:text-[28px] font-bold font-mono tracking-tight text-white mt-1.5">
          {market.vwap.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
        <div className={`text-xs font-medium mt-1 ${isAboveVwap ? 'text-[#21d19b]' : 'text-[#ff6578]'}`}>
          {isAboveVwap ? '🟢 Price above VWAP (Bullish)' : '🔴 Price below VWAP (Bearish)'}
        </div>
      </div>

      {/* 8. VOLUME & VOLATILITY */}
      <div
        id="card-volume"
        className="bg-[#0c1a2d] border border-[#1d3554] rounded-xl p-4 hover:border-[#2a4d7a] transition sm:col-span-2 lg:col-span-2"
      >
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8fa8c7] flex items-center gap-1.5">
            <BarChart2 size={14} className="text-[#21d19b]" />
            <span>VOLUME & LIQUIDITY MATRIX</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono">
            ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <div>
            <div className="text-[11px] text-[#8fa8c7]">NSE VOLUME</div>
            <div id="vol" className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5">
              {market.volume}
            </div>
            <div className="text-[11px] text-[#21d19b] font-medium">Above 10-D Avg</div>
          </div>
          <div>
            <div className="text-[11px] text-[#8fa8c7]">INDIA VIX</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5">
              {market.indiaVix.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#ffd166] font-medium">Low Premium Decay</div>
          </div>
          <div>
            <div className="text-[11px] text-[#8fa8c7]">EXPIRY MAX PAIN</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5">
              {market.maxPain.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#8fa8c7] font-mono">
              Spread: {market.maxPain - Math.round(market.nifty)}
            </div>
          </div>
        </div>
      </div>

      {/* 9. MARKET STATUS SUMMARY */}
      <div
        id="card-market-sentiment"
        className="bg-[#0c1a2d] border border-[#1d3554] rounded-xl p-4 hover:border-[#2a4d7a] transition sm:col-span-2 lg:col-span-2 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8fa8c7]">
            INTRADAY TRADE SETUP BIAS
          </div>
          <span className="text-[11px] font-mono text-slate-400">R:R 1:2.4</span>
        </div>
        <div className="mt-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
          {isBuyCE ? (
            <span className="text-slate-200">
              <b className="text-[#21d19b]">Call Buyers Active:</b> NIFTY trading above VWAP ({market.vwap.toFixed(0)}) with PCR at{' '}
              <b className="font-mono text-white">{market.pcr}</b> and strong Put writing at strikes below ATM. Look for dip-buying near VWAP support.
            </span>
          ) : isBuyPE ? (
            <span className="text-slate-200">
              <b className="text-[#ff6578]">Put Buyers Active:</b> Heavy Call writing above ATM strikes with PCR at{' '}
              <b className="font-mono text-white">{market.pcr}</b>. Weak global cues and spot below VWAP favor sell-on-rise strategy.
            </span>
          ) : (
            <span className="text-slate-200">
              <b className="text-[#ffd166]">Range-bound Consolidation:</b> Spot hovering near ATM. Option sellers collecting theta decay between strikes. Wait for breakout above VWAP or below support before taking directional trades.
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-[#8fa8c7] border-t border-[#1a2f4d] pt-2">
          <span>ATM Volatility: <b>13.2%</b></span>
          <span>Bias: <b className={signalColorClass}>{market.signal}</b></span>
        </div>
      </div>
    </div>
  );
};
