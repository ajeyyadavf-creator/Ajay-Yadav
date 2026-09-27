import React, { useState } from 'react';
import {
  LineChart,
  Maximize2,
  Minimize2,
  ExternalLink,
  RefreshCw,
  Layers,
  Target,
  Compass,
  Columns2,
  Square,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Zap,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Activity,
  Flame,
  Lightbulb,
  Sliders,
  Check,
} from 'lucide-react';
import { MarketState } from '../types';
import { StrategyChart } from './StrategyChart';

interface TradingViewChartProps {
  market: MarketState;
  isHindi?: boolean;
  spotPrice?: number;
  onQuickLogTrade?: (strike: number, type: 'CE' | 'PE', ltp: number) => void;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  market,
  isHindi = false,
  spotPrice,
  onQuickLogTrade,
}) => {
  const [chartMode, setChartMode] = useState<'strategy' | 'tradingview'>('strategy');
  // Default to 'side' layout mode as requested by user ("chart ko ek side chota dekhao")
  const [layoutMode, setLayoutMode] = useState<'side' | 'full'>('side');
  const [selectedSymbol, setSelectedSymbol] = useState<'NSE:NIFTY' | 'NSE:BANKNIFTY' | 'NSE:INDIAVIX'>('NSE:NIFTY');
  const [selectedInterval, setSelectedInterval] = useState<'1' | '3' | '5' | '15' | '30' | '60' | 'D'>('5');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Construct official isolated TradingView embed URL
  const studiesParam = encodeURIComponent(JSON.stringify(['STD;Supertrend', 'STD;RSI', 'STD;EMA@tv-basicstudies']));
  const widgetUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(
    selectedSymbol
  )}&interval=${selectedInterval}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=0c1a2d&studies=${studiesParam}&theme=dark&style=1&timezone=Asia%2FKolkata&locale=in&utm_source=tradingview.com#${reloadKey}`;

  // Current ATM strike and options pricing for side companion terminal
  const currentSpot = spotPrice || market.nifty;
  const atmStrike = Math.round(currentSpot / 50) * 50;
  const atmOption = market.options?.find((o) => o.strike === atmStrike);
  const callLTP = atmOption ? atmOption.callLTP : 124.5;
  const putLTP = atmOption ? atmOption.putLTP : 118.0;
  const callOI = atmOption ? (atmOption.callOI / 1000).toFixed(0) : '480';
  const putOI = atmOption ? (atmOption.putOI / 1000).toFixed(0) : '520';

  const isBullish = market.signal.includes('BUY CE');
  const isBearish = market.signal.includes('BUY PE');

  // Day Range position for gauge bar
  const dayLow = market.dayLow || currentSpot - 40;
  const dayHigh = market.dayHigh || currentSpot + 40;
  const dayRange = Math.max(1, dayHigh - dayLow);
  const spotPosPct = Math.min(100, Math.max(0, ((currentSpot - dayLow) / dayRange) * 100));

  // Quick 1-click orders from side panel
  const handleSideTrade = (type: 'CE' | 'PE', price: number) => {
    if (onQuickLogTrade) {
      onQuickLogTrade(atmStrike, type, price);
    }
  };

  return (
    <div
      id="chart-container-section"
      className={`bg-[#0c1a2d] border border-[#1d3554] rounded-xl overflow-hidden my-4 shadow-lg transition-all duration-300 ${
        isExpanded ? 'fixed inset-2 sm:inset-3 z-50 flex flex-col my-0 overflow-y-auto' : ''
      }`}
    >
      {/* Top Primary View Switcher: Strategy Chart vs TradingView & Layout Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-2.5 sm:px-4 bg-[#0a182b] border-b border-[#183151]">
        {/* Left: Mode Selection (Strategy vs TradingView) */}
        <div className="flex items-center gap-1 bg-[#0e213b] border border-[#213f66] rounded-xl p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setChartMode('strategy')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              chartMode === 'strategy'
                ? 'bg-emerald-600 text-white shadow-md font-bold'
                : 'text-[#8fa8c7] hover:text-white'
            }`}
          >
            <Target size={14} className={chartMode === 'strategy' ? 'text-white' : 'text-emerald-400'} />
            <span>{isHindi ? 'रणनीति बाय/सेल चार्ट' : 'Strategy Buy/Sell Chart'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono">
              {market.signal.includes('BUY CE') ? '🟢 CALL' : market.signal.includes('BUY PE') ? '🔴 PUT' : '🟡 WAIT'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setChartMode('tradingview')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              chartMode === 'tradingview'
                ? 'bg-blue-600 text-white shadow-md font-bold'
                : 'text-[#8fa8c7] hover:text-white'
            }`}
          >
            <Compass size={14} className={chartMode === 'tradingview' ? 'text-white' : 'text-blue-400'} />
            <span>{isHindi ? 'ट्रेडिंगव्यू लाइव' : 'TradingView Live'}</span>
          </button>
        </div>

        {/* Right: Layout Switcher (Side Compact vs Full Width) & Spot Price */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layout Mode Toggle: Side Compact vs Full */}
          <div className="flex items-center bg-[#0e213b] border border-[#213f66] rounded-xl p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLayoutMode('side')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                layoutMode === 'side'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-[#8fa8c7] hover:text-white'
              }`}
              title="Show chart compact on one side with quick trade terminal"
            >
              <Columns2 size={13} />
              <span>{isHindi ? 'एक साइड व्यू' : 'Side View'}</span>
            </button>

            <button
              type="button"
              onClick={() => setLayoutMode('full')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                layoutMode === 'full'
                  ? 'bg-[#183860] text-white shadow-xs font-bold'
                  : 'text-[#8fa8c7] hover:text-white'
              }`}
              title="Show chart in full width"
            >
              <Square size={12} />
              <span>{isHindi ? 'फुल व्यू' : 'Full Width'}</span>
            </button>
          </div>

          {spotPrice && (
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#142842] text-slate-200 border border-[#23436d]">
              NIFTY SPOT: <b className="text-emerald-400">₹{spotPrice.toFixed(2)}</b>
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-[#10233d] hover:bg-[#163359] border border-[#224065] text-[#8fa8c7] hover:text-white transition cursor-pointer"
            title={isExpanded ? 'Minimize' : 'Maximize Chart'}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Main Content: Either Side-by-Side (Split) or Full Width */}
      {layoutMode === 'side' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 p-3 bg-[#081525]">
          {/* Left Column: Clear & Spacious Chart (8/12 ~ 67% width on desktop) */}
          <div className="lg:col-span-8 flex flex-col">
            {chartMode === 'strategy' ? (
              <StrategyChart
                market={market}
                isHindi={isHindi}
                compact={true}
                onQuickLogTrade={onQuickLogTrade}
              />
            ) : (
              <div className="flex flex-col bg-[#0c1a2d] border border-[#1d3554] rounded-xl overflow-hidden shadow-md">
                {/* Compact TradingView Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#0e213b] border-b border-[#1b3454]">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#10233d] border border-[#224065] rounded-lg p-0.5 text-xs font-semibold">
                      {[
                        { id: 'NSE:NIFTY', label: 'NIFTY' },
                        { id: 'NSE:BANKNIFTY', label: 'BANKNIFTY' },
                      ].map((sym) => (
                        <button
                          key={sym.id}
                          type="button"
                          onClick={() => {
                            setIsLoading(true);
                            setSelectedSymbol(sym.id as typeof selectedSymbol);
                          }}
                          className={`px-2 py-1 rounded-md transition cursor-pointer ${
                            selectedSymbol === sym.id ? 'bg-blue-600 text-white' : 'text-[#8fa8c7] hover:text-white'
                          }`}
                        >
                          {sym.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center bg-[#10233d] border border-[#224065] rounded-lg p-0.5 text-xs font-mono">
                      {['1', '3', '5', '15', '30'].map((tf) => (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => {
                            setIsLoading(true);
                            setSelectedInterval(tf as typeof selectedInterval);
                          }}
                          className={`px-2 py-0.5 rounded transition cursor-pointer ${
                            selectedInterval === tf ? 'bg-emerald-600 text-white font-bold' : 'text-[#8fa8c7]'
                          }`}
                        >
                          {tf}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLoading(true);
                      setReloadKey((k) => k + 1);
                    }}
                    className="p-1 rounded bg-[#10233d] hover:bg-[#163359] border border-[#224065] text-[#8fa8c7] hover:text-white"
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>

                <div className="w-full relative" style={{ height: '440px' }}>
                  {isLoading && (
                    <div className="absolute inset-0 bg-[#0c1a2d] flex flex-col items-center justify-center text-xs text-[#8fa8c7] z-10 gap-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span>{isHindi ? 'चार्ट लोड हो रहा है...' : 'Loading Chart...'}</span>
                    </div>
                  )}
                  <iframe
                    key={`${selectedSymbol}-${selectedInterval}-${reloadKey}`}
                    src={widgetUrl}
                    title="TradingView Compact Chart"
                    className="w-full h-full border-0"
                    onLoad={() => setIsLoading(false)}
                    allow="clipboard-write"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

            {/* Right Column: Active Trading Strategies & Execution Panel */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {/* Strategy Hub Header */}
            <div className="p-3 bg-[#0c1c30] border border-[#1d385c] rounded-xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-400" />
                  <span>{isHindi ? 'लाइव ट्रेडिंग स्ट्रेटेजी एवं नियम' : 'Live Trading Strategies & Rules'}</span>
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
                {isBullish ? '🟢 CE BIAS' : isBearish ? '🔴 PE BIAS' : '🟡 NEUTRAL'}
              </span>
            </div>

            {/* Strategy 1: EMA 9/21 + Supertrend Confluence Strategy */}
            <div className="p-3 bg-[#0d1e34] border border-[#1d3c63] rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Zap size={13} className="text-amber-400" />
                  <span>{isHindi ? 'रणनीति 1: सुपरट्रेंड + EMA 9/21 क्रॉसओवर' : 'Strategy 1: Supertrend + EMA 9/21'}</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${isBullish ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40' : isBearish ? 'bg-rose-900/60 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-300'}`}>
                  {isBullish ? 'BUY CE TRIGGERED' : isBearish ? 'BUY PE TRIGGERED' : 'WAITING'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isHindi
                  ? 'जब 9 EMA, 21 EMA को ऊपर क्रॉस करे और कैंडल सुपरट्रेंड ग्रीन लाइन के ऊपर क्लोज हो तो कॉल (CE) बाय करें। जब नीचे क्रॉस करे तो पुट (PE) बाय करें।'
                  : 'Buy CE when EMA 9 crosses above EMA 21 and price closes above Green Supertrend. Buy PE when price drops below Red Supertrend.'}
              </p>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono mt-1 text-center">
                <div className="p-1.5 rounded bg-[#091524] border border-[#162e4c]">
                  <span className="text-[#8fa8c7] block">SUPER TREND</span>
                  <span className={isBullish ? 'text-emerald-400 font-bold' : isBearish ? 'text-rose-400 font-bold' : 'text-amber-300 font-bold'}>
                    {isBullish ? 'BULLISH (GREEN)' : isBearish ? 'BEARISH (RED)' : 'SIDEWAYS'}
                  </span>
                </div>
                <div className="p-1.5 rounded bg-[#091524] border border-[#162e4c]">
                  <span className="text-[#8fa8c7] block">EMA 9 vs 21</span>
                  <span className={isBullish ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {isBullish ? 'EMA 9 > 21' : 'EMA 9 < 21'}
                  </span>
                </div>
                <div className="p-1.5 rounded bg-[#091524] border border-[#162e4c]">
                  <span className="text-[#8fa8c7] block">STOP LOSS</span>
                  <span className="text-rose-300 font-bold">Prev Low (-30 pts)</span>
                </div>
              </div>
            </div>

            {/* Strategy 2: VWAP Pullback & Breakout Strategy */}
            <div className="p-3 bg-[#0d1e34] border border-[#1d3c63] rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Compass size={13} className="text-cyan-400" />
                  <span>{isHindi ? 'रणनीति 2: VWAP सपोर्ट और पुलबैक स्ट्रेटेजी' : 'Strategy 2: VWAP Support & Pullback'}</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-200 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/40">
                  VWAP: ₹{market.vwap.toFixed(1)}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isHindi
                  ? `निफ्टी करंट प्राइस ₹${currentSpot.toFixed(1)} है। जब प्राइस VWAP लेवल पर रीटेस्ट करके बाउंस करे तब स्ट्रॉन्ग एंट्री बनती है (R:R 1:2.5)।`
                  : `NIFTY is trading at ₹${currentSpot.toFixed(1)}. Enter on VWAP bounce for minimal risk and 1:2.5 reward.`}
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono bg-[#091524] p-1.5 rounded border border-[#162e4c]">
                <span className="text-[#8fa8c7]">{isHindi ? 'करंट स्टेटस:' : 'Status:'}</span>
                <span className={currentSpot >= market.vwap ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {currentSpot >= market.vwap ? '🟢 Above VWAP (Dip Buying Active)' : '🔴 Below VWAP (Sell on Rise Active)'}
                </span>
              </div>
            </div>

            {/* Strategy 3: PCR & Open Interest (OI) Confirmation */}
            <div className="p-3 bg-[#0d1e34] border border-[#1d3c63] rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Activity size={13} className="text-amber-400" />
                  <span>{isHindi ? 'रणनीति 3: PCR + ऑप्शन चेन ब्रेकआउट' : 'Strategy 3: PCR & OI Confirmation'}</span>
                </span>
                <span className="text-[10px] font-mono text-amber-200 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40">
                  PCR: {market.pcr.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isHindi
                  ? 'PCR 1.0 से ऊपर होने पर पुट राइटर्स मजबूत होते हैं और अपट्रेंड मिलता है। PCR 0.85 से नीचे डाउनट्रेंड संकेत होता है।'
                  : 'PCR above 1.0 indicates strong Put writing (support). PCR below 0.85 indicates Call writing (resistance).'}
              </p>
            </div>

            {/* 1-Click Fast Execution for ATM Strike */}
            <div className="p-3 bg-[#081323] border border-[#193254] rounded-xl flex flex-col gap-2 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  {isHindi ? 'स्ट्रेटेजी एग्जीक्यूशन (1-क्लिक ट्रेड)' : 'Instant Strike Execution'}
                </span>
                <span className="text-[11px] font-mono text-amber-300">ATM: ₹{atmStrike}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSideTrade('CE', callLTP)}
                  className="py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/60 transition cursor-pointer"
                >
                  <ArrowUpRight size={14} />
                  <span>BUY {atmStrike} CE (₹{callLTP.toFixed(1)})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSideTrade('PE', putLTP)}
                  className="py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1 bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/60 transition cursor-pointer"
                >
                  <ArrowDownRight size={14} />
                  <span>BUY {atmStrike} PE (₹{putLTP.toFixed(1)})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Full Width View Mode */
        <div className="p-2 sm:p-3">
          {chartMode === 'strategy' ? (
            <StrategyChart
              market={market}
              isHindi={isHindi}
              compact={false}
              onQuickLogTrade={onQuickLogTrade}
            />
          ) : (
            <div className="flex flex-col">
              {/* TradingView Control Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-[#0e213b] border-b border-[#1b3454]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <LineChart size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span>TradingView Real-time Candlesticks</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                        FEED
                      </span>
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Symbol Select Buttons */}
                  <div className="flex items-center bg-[#10233d] border border-[#224065] rounded-lg p-0.5 text-xs font-semibold">
                    {[
                      { id: 'NSE:NIFTY', label: 'NIFTY 50' },
                      { id: 'NSE:BANKNIFTY', label: 'BANKNIFTY' },
                      { id: 'NSE:INDIAVIX', label: 'INDIA VIX' },
                    ].map((sym) => (
                      <button
                        key={sym.id}
                        type="button"
                        onClick={() => {
                          setIsLoading(true);
                          setSelectedSymbol(sym.id as typeof selectedSymbol);
                        }}
                        className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                          selectedSymbol === sym.id
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-[#8fa8c7] hover:text-white'
                        }`}
                      >
                        {sym.label}
                      </button>
                    ))}
                  </div>

                  {/* Timeframe Select */}
                  <div className="flex items-center bg-[#10233d] border border-[#224065] rounded-lg p-0.5 text-xs font-mono">
                    {[
                      { tf: '1', label: '1m' },
                      { tf: '3', label: '3m' },
                      { tf: '5', label: '5m' },
                      { tf: '15', label: '15m' },
                      { tf: '30', label: '30m' },
                      { tf: 'D', label: '1D' },
                    ].map((t) => (
                      <button
                        key={t.tf}
                        type="button"
                        onClick={() => {
                          setIsLoading(true);
                          setSelectedInterval(t.tf as typeof selectedInterval);
                        }}
                        className={`px-2 py-1 rounded-md transition cursor-pointer ${
                          selectedInterval === t.tf
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'text-[#8fa8c7] hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Reload Widget */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoading(true);
                      setReloadKey((k) => k + 1);
                    }}
                    className="p-1.5 rounded-lg bg-[#10233d] hover:bg-[#163359] border border-[#224065] text-[#8fa8c7] hover:text-white transition cursor-pointer"
                    title="Reload Chart"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {/* TradingView Widget Frame */}
              <div
                className="w-full relative bg-[#0c1a2d]"
                style={{
                  height: isExpanded ? 'calc(100% - 100px)' : '480px',
                  minHeight: '400px',
                }}
              >
                {isLoading && (
                  <div className="absolute inset-0 bg-[#0c1a2d] flex flex-col items-center justify-center text-xs text-[#8fa8c7] z-10 gap-2">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span>{isHindi ? 'ट्रेडिंगव्यू चार्ट लोड हो रहा है...' : 'Loading TradingView Feed...'}</span>
                  </div>
                )}
                <iframe
                  key={`${selectedSymbol}-${selectedInterval}-${reloadKey}`}
                  src={widgetUrl}
                  title="TradingView Real-time Chart"
                  className="w-full h-full border-0"
                  onLoad={() => setIsLoading(false)}
                  allow="clipboard-write"
                  allowFullScreen
                />
              </div>

              {/* Footer Details */}
              <div className="px-4 py-2 bg-[#0a1728] border-t border-[#162f4e] flex items-center justify-between text-xs text-[#8fa8c7]">
                <div className="flex items-center gap-2">
                  <Layers size={13} className="text-blue-400" />
                  <span>
                    {isHindi
                      ? 'ट्रेडिंगव्यू लाइव डेटा • सुपरट्रेंड, ईएमए व आरएसआई इंडिकेटर्स एक्टिव'
                      : 'TradingView Live Feed • Supertrend, EMA & RSI active'}
                  </span>
                </div>
                <a
                  href={`https://in.tradingview.com/chart/?symbol=${encodeURIComponent(selectedSymbol)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 text-[#8fa8c7] flex items-center gap-1 transition"
                >
                  <span>{isHindi ? 'ट्रेडिंगव्यू पर पूरा चार्ट खोलें' : 'Open on TradingView'}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
