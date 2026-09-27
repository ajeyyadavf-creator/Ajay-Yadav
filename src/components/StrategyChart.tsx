import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Crosshair,
  Target,
  Zap,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Clock,
  Activity,
  Layers,
} from 'lucide-react';
import { MarketState } from '../types';
import {
  StrategyCandle,
  Timeframe,
  generateInitialCandles,
  updateLatestCandle,
  getTimeframeMinutes,
} from '../utils/chartEngine';

interface StrategyChartProps {
  market: MarketState;
  isHindi?: boolean;
  compact?: boolean;
  onQuickLogTrade?: (strike: number, type: 'CE' | 'PE', ltp: number) => void;
}

export const StrategyChart: React.FC<StrategyChartProps> = ({
  market,
  isHindi = false,
  compact = false,
  onQuickLogTrade,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('5m');
  const [candles, setCandles] = useState<StrategyCandle[]>(() =>
    generateInitialCandles(
      market.nifty,
      '5m',
      undefined,
      market.dayHigh,
      market.dayLow,
      market.prevClose
    )
  );
  const [hoveredCandle, setHoveredCandle] = useState<StrategyCandle | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{
    svgX: number;
    svgY: number;
    price: number;
    index: number;
  } | null>(null);

  // Indicator display toggles
  const [showEMA, setShowEMA] = useState(true);
  const [showVWAP, setShowVWAP] = useState(true);
  const [showSupertrend, setShowSupertrend] = useState(true);
  const [showTargets, setShowTargets] = useState(true);
  const [isCandleLoading, setIsCandleLoading] = useState(false);
  const [timeRemainingStr, setTimeRemainingStr] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Time remaining countdown in current candle
  useEffect(() => {
    const updateCountdown = () => {
      const intervalMins = getTimeframeMinutes(timeframe);
      const now = new Date();
      const currentSecondsInDay = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      const intervalSeconds = intervalMins * 60;
      const secondsIntoCurrent = currentSecondsInDay % intervalSeconds;
      const secondsLeft = intervalSeconds - secondsIntoCurrent;

      const m = Math.floor(secondsLeft / 60);
      const s = secondsLeft % 60;
      setTimeRemainingStr(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [timeframe]);

  // Handle timeframe change: immediately generate accurate client candles, then fetch API
  useEffect(() => {
    let isMounted = true;

    // Immediate accurate local candles for instant response
    setCandles(
      generateInitialCandles(
        market.nifty,
        timeframe,
        undefined,
        market.dayHigh,
        market.dayLow,
        market.prevClose
      )
    );

    const loadRealCandles = async () => {
      try {
        setIsCandleLoading(true);
        const res = await fetch(`/api/market/candles?interval=${timeframe}`);
        if (!res.ok) throw new Error('API candle fetch failed');
        const json = await res.json();
        if (isMounted && json.candles && Array.isArray(json.candles) && json.candles.length > 0) {
          // Synchronize last candle with current live spot price
          const remoteCandles: StrategyCandle[] = json.candles;
          if (remoteCandles.length > 0) {
            const last = remoteCandles[remoteCandles.length - 1];
            last.close = market.nifty;
            last.high = Math.max(last.high, market.nifty);
            last.low = Math.min(last.low, market.nifty);
          }
          setCandles(remoteCandles);
        }
      } catch (err) {
        console.warn('Candle API fallback active:', err);
      } finally {
        if (isMounted) setIsCandleLoading(false);
      }
    };

    loadRealCandles();
    return () => {
      isMounted = false;
    };
  }, [timeframe, market.dayHigh, market.dayLow, market.prevClose]);

  // Update latest candle on live market spot price tick
  useEffect(() => {
    setCandles((prev) => updateLatestCandle(prev, market.nifty, timeframe));
  }, [market.nifty, timeframe]);

  // Find latest active signal for trade setup display
  const latestSignalCandle = useMemo(() => {
    for (let i = candles.length - 1; i >= 0; i--) {
      if (candles[i].signal) return candles[i];
    }
    return null;
  }, [candles]);

  // Dimension & Scaling Math - Spacious and crystal clear
  const chartHeight = compact ? 380 : 460;
  const chartPadding = { top: compact ? 30 : 40, right: 85, bottom: compact ? 34 : 44, left: 16 };
  const svgWidth = 920;
  const plotWidth = svgWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  // Calculate Min / Max for Y Axis scaling
  const { minPrice, maxPrice } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    candles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.vwap && c.vwap < min) min = c.vwap;
      if (c.vwap && c.vwap > max) max = c.vwap;
      if (c.supertrend && c.supertrend < min) min = c.supertrend;
      if (c.supertrend && c.supertrend > max) max = c.supertrend;
      if (c.target2 && c.target2 > max) max = c.target2;
      if (c.stopLoss && c.stopLoss < min) min = c.stopLoss;
    });

    if (market.nifty < min) min = market.nifty;
    if (market.nifty > max) max = market.nifty;

    const buffer = (max - min) * 0.12 || 15;
    return {
      minPrice: +(min - buffer).toFixed(2),
      maxPrice: +(max + buffer).toFixed(2),
    };
  }, [candles, market.nifty]);

  const priceRange = Math.max(1, maxPrice - minPrice);

  const getY = (price: number) => {
    const fraction = (maxPrice - price) / priceRange;
    return chartPadding.top + fraction * plotHeight;
  };

  const getPriceFromY = (y: number) => {
    const fraction = (y - chartPadding.top) / plotHeight;
    return +(maxPrice - fraction * priceRange).toFixed(2);
  };

  const candleSlotWidth = plotWidth / Math.max(1, candles.length);
  const candleBarWidth = Math.max(6, Math.min(22, candleSlotWidth * 0.72));

  // Generate Y-axis grid ticks with clean round numbers
  const yTicks = useMemo(() => {
    const roughStep = priceRange / 7;
    const step = roughStep > 35 ? 50 : roughStep > 18 ? 20 : 10;
    const ticks: number[] = [];
    const start = Math.ceil(minPrice / step) * step;
    for (let p = start; p <= maxPrice; p += step) {
      ticks.push(p);
    }
    return ticks;
  }, [minPrice, maxPrice, priceRange]);

  // Indicator coordinates
  const ema9Points = useMemo(() => {
    return candles
      .map((c, i) => `${chartPadding.left + i * candleSlotWidth + candleSlotWidth / 2},${getY(c.ema9)}`)
      .join(' ');
  }, [candles, maxPrice, minPrice, candleSlotWidth]);

  const ema21Points = useMemo(() => {
    return candles
      .map((c, i) => `${chartPadding.left + i * candleSlotWidth + candleSlotWidth / 2},${getY(c.ema21)}`)
      .join(' ');
  }, [candles, maxPrice, minPrice, candleSlotWidth]);

  const vwapPoints = useMemo(() => {
    return candles
      .map((c, i) => `${chartPadding.left + i * candleSlotWidth + candleSlotWidth / 2},${getY(c.vwap)}`)
      .join(' ');
  }, [candles, maxPrice, minPrice, candleSlotWidth]);

  const supertrendPoints = useMemo(() => {
    return candles
      .map((c, i) => `${chartPadding.left + i * candleSlotWidth + candleSlotWidth / 2},${getY(c.supertrend)}`)
      .join(' ');
  }, [candles, maxPrice, minPrice, candleSlotWidth]);

  // Active displayed candle (hovered or latest)
  const displayCandle = hoveredCandle || candles[candles.length - 1] || {
    time: '--:--',
    open: market.nifty,
    high: market.nifty,
    low: market.nifty,
    close: market.nifty,
    volume: 50000,
    change: 0,
    changePct: 0,
    ema9: market.nifty,
    ema21: market.nifty,
    vwap: market.vwap,
    supertrend: market.nifty - 20,
    supertrendDirection: 'BULLISH',
    signal: null,
  };

  const candleChange = displayCandle.change !== undefined
    ? displayCandle.change
    : +(displayCandle.close - displayCandle.open).toFixed(2);
  const candleChangePct = displayCandle.changePct !== undefined
    ? displayCandle.changePct
    : +(((displayCandle.close - displayCandle.open) / displayCandle.open) * 100).toFixed(2);

  // Strategy Checklist calculations
  const isAboveVwap = market.nifty > market.vwap;
  const isRsiFavorable = market.signal.includes('BUY CE') ? market.rsi >= 55 : market.rsi <= 45;
  const isPcrFavorable = market.signal.includes('BUY CE') ? market.pcr >= 1.05 : market.pcr <= 0.95;

  // 1-Click Log from Strategy Card
  const handleQuickLog = () => {
    if (!onQuickLogTrade) return;
    const atmStrike = Math.round(market.nifty / 50) * 50;
    const isCE = market.signal.includes('BUY CE');
    const opt = market.options?.find((o) => o.strike === atmStrike);
    const price = opt ? (isCE ? opt.callLTP : opt.putLTP) : 125;
    onQuickLogTrade(atmStrike, isCE ? 'CE' : 'PE', price);
  };

  return (
    <div className={`w-full bg-[#0c1a2d] border border-[#1d3554] rounded-xl overflow-hidden shadow-lg ${compact ? 'my-0' : 'my-2'}`}>
      {/* Top Toolbar: Mode, Status, Timeframe & Indicator Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:px-4 bg-[#0e213b] border-b border-[#1b3454]">
        {/* Left: Signal Tag & Live Context */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
              market.signal.includes('BUY CE')
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : market.signal.includes('BUY PE')
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}
          >
            {market.signal.includes('BUY CE') ? (
              <TrendingUp size={16} />
            ) : market.signal.includes('BUY PE') ? (
              <TrendingDown size={16} />
            ) : (
              <Zap size={16} />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{isHindi ? 'निफ्टी सटीक कैंडलस्टिक रणनीति चार्ट' : 'NIFTY Precise Strategy Candlestick Chart'}</span>
                {isCandleLoading && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                )}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  market.signal.includes('BUY CE')
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                    : market.signal.includes('BUY PE')
                    ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                    : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                }`}
              >
                {market.signal} ({market.confidenceScore}%)
              </span>
            </div>
            <p className="text-[11px] text-[#8fa8c7] flex items-center gap-1.5 flex-wrap">
              <span>
                NIFTY: <b className="text-white font-mono">₹{market.nifty.toFixed(2)}</b>
              </span>
              <span>•</span>
              <span>
                VWAP: <b className="text-purple-300 font-mono">₹{market.vwap.toFixed(2)}</b>
              </span>
              <span>•</span>
              <span>
                RSI: <b className="text-blue-300 font-mono">{market.rsi}</b>
              </span>
              <span>•</span>
              <span className="text-emerald-400/90 font-mono flex items-center gap-1">
                <Clock size={11} />
                <span>{isHindi ? 'कैंडल क्लोज:' : 'Next Bar:'} {timeRemainingStr}</span>
              </span>
            </p>
          </div>
        </div>

        {/* Right: Timeframe Switcher & Indicator Display Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe Buttons (1m, 3m, 5m, 15m, 30m) */}
          <div className="flex items-center bg-[#10233d] border border-[#224065] rounded-lg p-0.5 text-xs font-mono">
            {(['1m', '3m', '5m', '15m', '30m'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  timeframe === tf
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-[#8fa8c7] hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Indicator Toggles */}
          <div className="flex items-center gap-1 bg-[#10233d] border border-[#224065] rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setShowEMA(!showEMA)}
              className={`px-2 py-1 rounded-md flex items-center gap-1 transition cursor-pointer ${
                showEMA ? 'bg-[#183a63] text-amber-300 font-semibold' : 'text-[#8fa8c7] opacity-60'
              }`}
              title="Toggle EMA 9 & EMA 21"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              <span>EMA</span>
            </button>
            <button
              type="button"
              onClick={() => setShowVWAP(!showVWAP)}
              className={`px-2 py-1 rounded-md flex items-center gap-1 transition cursor-pointer ${
                showVWAP ? 'bg-[#183a63] text-purple-300 font-semibold' : 'text-[#8fa8c7] opacity-60'
              }`}
              title="Toggle VWAP"
            >
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
              <span>VWAP</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSupertrend(!showSupertrend)}
              className={`px-2 py-1 rounded-md flex items-center gap-1 transition cursor-pointer ${
                showSupertrend ? 'bg-[#183a63] text-emerald-300 font-semibold' : 'text-[#8fa8c7] opacity-60'
              }`}
              title="Toggle Supertrend"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>Supertrend</span>
            </button>
            <button
              type="button"
              onClick={() => setShowTargets(!showTargets)}
              className={`px-2 py-1 rounded-md flex items-center gap-1 transition cursor-pointer ${
                showTargets ? 'bg-[#183a63] text-cyan-300 font-semibold' : 'text-[#8fa8c7] opacity-60'
              }`}
              title="Toggle Target & SL lines"
            >
              <Target size={12} />
              <span>Tgt/SL</span>
            </button>
          </div>
        </div>
      </div>

      {/* Candle Details Ribbon (Hover info & OHLC accuracy) */}
      <div className="px-4 py-2 bg-[#091524] border-b border-[#142842] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[#8fa8c7] flex items-center gap-1 font-semibold">
            <Crosshair size={13} className="text-cyan-400" />
            <span className="text-cyan-300">{displayCandle.time}</span>
            <span className="text-[10px] px-1 rounded bg-[#10233d] text-[#8fa8c7]">({timeframe})</span>
          </span>
          <span>
            O: <b className="text-slate-200">{displayCandle.open.toFixed(2)}</b>
          </span>
          <span>
            H: <b className="text-emerald-400">{displayCandle.high.toFixed(2)}</b>
          </span>
          <span>
            L: <b className="text-rose-400">{displayCandle.low.toFixed(2)}</b>
          </span>
          <span>
            C:{' '}
            <b
              className={
                displayCandle.close >= displayCandle.open
                  ? 'text-emerald-400 font-bold'
                  : 'text-rose-400 font-bold'
              }
            >
              {displayCandle.close.toFixed(2)}
            </b>
          </span>
          <span
            className={`font-semibold ${
              candleChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {candleChange >= 0 ? '+' : ''}
            {candleChange.toFixed(2)} ({candleChangePct >= 0 ? '+' : ''}
            {candleChangePct.toFixed(2)}%)
          </span>
          <span className="text-[#8fa8c7]">
            Vol: <b className="text-slate-300">{(displayCandle.volume / 1000).toFixed(0)}k</b>
          </span>
        </div>

        {/* Legend Indicators & Live values */}
        <div className="flex items-center gap-2.5 text-[11px] flex-wrap">
          {showEMA && (
            <>
              <span className="text-amber-400">EMA9: {displayCandle.ema9.toFixed(1)}</span>
              <span className="text-sky-400">EMA21: {displayCandle.ema21.toFixed(1)}</span>
            </>
          )}
          {showVWAP && <span className="text-purple-400">VWAP: {displayCandle.vwap.toFixed(1)}</span>}
          {showSupertrend && (
            <span
              className={
                displayCandle.supertrendDirection === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'
              }
            >
              ST: {displayCandle.supertrend.toFixed(1)} ({displayCandle.supertrendDirection === 'BULLISH' ? '▲ Bull' : '▼ Bear'})
            </span>
          )}
          {displayCandle.signal && (
            <span
              className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                displayCandle.signal === 'BUY_CE'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-950 text-rose-300 border border-rose-500/40'
              }`}
            >
              {displayCandle.signal === 'BUY_CE' ? '🟢 BUY CE' : '🔴 BUY PE'}
            </span>
          )}
        </div>
      </div>

      {/* SVG Interactive Candlestick Chart Canvas */}
      <div
        ref={containerRef}
        className="w-full relative bg-[#091424] cursor-crosshair overflow-hidden select-none"
        style={{ height: `${chartHeight}px` }}
        onMouseMove={(e) => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          // Convert client coordinates to SVG coordinates
          const svgX = (mouseX / rect.width) * svgWidth;
          const svgY = (mouseY / rect.height) * chartHeight;

          // Determine candle slot index under cursor
          const relX = svgX - chartPadding.left;
          const index = Math.min(candles.length - 1, Math.max(0, Math.floor(relX / candleSlotWidth)));

          if (index >= 0 && index < candles.length) {
            setHoveredCandle(candles[index]);
            setHoverCoords({
              svgX,
              svgY,
              price: getPriceFromY(svgY),
              index,
            });
          }
        }}
        onMouseLeave={() => {
          setHoveredCandle(null);
          setHoverCoords(null);
        }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${chartHeight}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Background Grid Lines (Horizontal Price ticks) */}
          {yTicks.map((price) => {
            const y = getY(price);
            return (
              <g key={price}>
                <line
                  x1={chartPadding.left}
                  y1={y}
                  x2={svgWidth - chartPadding.right}
                  y2={y}
                  stroke="#162942"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={svgWidth - chartPadding.right + 6}
                  y={y + 3.5}
                  fill="#718ba7"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {price}
                </text>
              </g>
            );
          })}

          {/* Hovered Column Highlight */}
          {hoverCoords && (
            <rect
              x={chartPadding.left + hoverCoords.index * candleSlotWidth}
              y={chartPadding.top}
              width={candleSlotWidth}
              height={plotHeight}
              fill="#1e3a5f"
              opacity="0.22"
            />
          )}

          {/* Target & StopLoss Horizontal Projection Lines */}
          {showTargets && latestSignalCandle && latestSignalCandle.signal && (
            <>
              {/* Target 2 Line */}
              {latestSignalCandle.target2 && (
                <g>
                  <line
                    x1={chartPadding.left}
                    y1={getY(latestSignalCandle.target2)}
                    x2={svgWidth - chartPadding.right}
                    y2={getY(latestSignalCandle.target2)}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <rect
                    x={svgWidth - chartPadding.right + 2}
                    y={getY(latestSignalCandle.target2) - 8}
                    width={64}
                    height={16}
                    rx={3}
                    fill="#064e3b"
                    stroke="#10b981"
                    strokeWidth="0.8"
                  />
                  <text
                    x={svgWidth - chartPadding.right + 6}
                    y={getY(latestSignalCandle.target2) + 3.5}
                    fill="#34d399"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    T2: {latestSignalCandle.target2.toFixed(0)}
                  </text>
                </g>
              )}

              {/* Target 1 Line */}
              {latestSignalCandle.target1 && (
                <g>
                  <line
                    x1={chartPadding.left}
                    y1={getY(latestSignalCandle.target1)}
                    x2={svgWidth - chartPadding.right}
                    y2={getY(latestSignalCandle.target1)}
                    stroke="#059669"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <rect
                    x={svgWidth - chartPadding.right + 2}
                    y={getY(latestSignalCandle.target1) - 8}
                    width={64}
                    height={16}
                    rx={3}
                    fill="#064e3b"
                    stroke="#059669"
                    strokeWidth="0.8"
                  />
                  <text
                    x={svgWidth - chartPadding.right + 6}
                    y={getY(latestSignalCandle.target1) + 3.5}
                    fill="#6ee7b7"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    T1: {latestSignalCandle.target1.toFixed(0)}
                  </text>
                </g>
              )}

              {/* Signal Entry Line */}
              {latestSignalCandle.signalPrice && (
                <g>
                  <line
                    x1={chartPadding.left}
                    y1={getY(latestSignalCandle.signalPrice)}
                    x2={svgWidth - chartPadding.right}
                    y2={getY(latestSignalCandle.signalPrice)}
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                  />
                  <rect
                    x={svgWidth - chartPadding.right + 2}
                    y={getY(latestSignalCandle.signalPrice) - 8}
                    width={64}
                    height={16}
                    rx={3}
                    fill="#1e3a8a"
                    stroke="#3b82f6"
                    strokeWidth="0.8"
                  />
                  <text
                    x={svgWidth - chartPadding.right + 6}
                    y={getY(latestSignalCandle.signalPrice) + 3.5}
                    fill="#93c5fd"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    ENTRY: {latestSignalCandle.signalPrice.toFixed(0)}
                  </text>
                </g>
              )}

              {/* Stop Loss Line */}
              {latestSignalCandle.stopLoss && (
                <g>
                  <line
                    x1={chartPadding.left}
                    y1={getY(latestSignalCandle.stopLoss)}
                    x2={svgWidth - chartPadding.right}
                    y2={getY(latestSignalCandle.stopLoss)}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <rect
                    x={svgWidth - chartPadding.right + 2}
                    y={getY(latestSignalCandle.stopLoss) - 8}
                    width={64}
                    height={16}
                    rx={3}
                    fill="#7f1d1d"
                    stroke="#ef4444"
                    strokeWidth="0.8"
                  />
                  <text
                    x={svgWidth - chartPadding.right + 6}
                    y={getY(latestSignalCandle.stopLoss) + 3.5}
                    fill="#fca5a5"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    SL: {latestSignalCandle.stopLoss.toFixed(0)}
                  </text>
                </g>
              )}
            </>
          )}

          {/* Indicator Polylines */}
          {showSupertrend && (
            <polyline
              points={supertrendPoints}
              fill="none"
              stroke="#10b981"
              strokeWidth="1.4"
              strokeDasharray="3 3"
              opacity="0.85"
            />
          )}

          {showVWAP && (
            <polyline
              points={vwapPoints}
              fill="none"
              stroke="#c084fc"
              strokeWidth="1.8"
              opacity="0.9"
            />
          )}

          {showEMA && (
            <>
              <polyline
                points={ema21Points}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.6"
                opacity="0.85"
              />
              <polyline
                points={ema9Points}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.8"
                opacity="0.95"
              />
            </>
          )}

          {/* Candlesticks Rendering */}
          {candles.map((c, i) => {
            const cx = chartPadding.left + i * candleSlotWidth + candleSlotWidth / 2;
            const isBull = c.close >= c.open;
            const color = isBull ? '#10b981' : '#ef4444';
            const bodyTop = getY(Math.max(c.open, c.close));
            const bodyBottom = getY(Math.min(c.open, c.close));
            const bodyH = Math.max(2, bodyBottom - bodyTop);
            const highY = getY(c.high);
            const lowY = getY(c.low);

            return (
              <g key={c.id}>
                {/* Candle Wick (Centered through candle) */}
                <line
                  x1={cx}
                  y1={highY}
                  x2={cx}
                  y2={lowY}
                  stroke={color}
                  strokeWidth="1.8"
                  opacity="0.95"
                />

                {/* Candle Body */}
                <rect
                  x={cx - candleBarWidth / 2}
                  y={bodyTop}
                  width={candleBarWidth}
                  height={bodyH}
                  fill={color}
                  stroke={isBull ? '#34d399' : '#f87171'}
                  strokeWidth="0.8"
                  rx="1.5"
                />

                {/* 🟢 BUY CE Signal Marker directly on chart */}
                {c.signal === 'BUY_CE' && (
                  <g>
                    <polygon
                      points={`${cx},${lowY + 8} ${cx - 6},${lowY + 18} ${cx + 6},${lowY + 18}`}
                      fill="#10b981"
                    />
                    <rect
                      x={cx - 30}
                      y={lowY + 20}
                      width={60}
                      height={17}
                      rx={4}
                      fill="#064e3b"
                      stroke="#10b981"
                      strokeWidth="1.2"
                    />
                    <text
                      x={cx}
                      y={lowY + 32}
                      textAnchor="middle"
                      fill="#34d399"
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      ▲ BUY CE
                    </text>
                  </g>
                )}

                {/* 🔴 BUY PE Signal Marker directly on chart */}
                {c.signal === 'BUY_PE' && (
                  <g>
                    <polygon
                      points={`${cx},${highY - 8} ${cx - 6},${highY - 18} ${cx + 6},${highY - 18}`}
                      fill="#ef4444"
                    />
                    <rect
                      x={cx - 30}
                      y={highY - 37}
                      width={60}
                      height={17}
                      rx={4}
                      fill="#7f1d1d"
                      stroke="#ef4444"
                      strokeWidth="1.2"
                    />
                    <text
                      x={cx}
                      y={highY - 25}
                      textAnchor="middle"
                      fill="#fca5a5"
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      ▼ BUY PE
                    </text>
                  </g>
                )}

                {/* Time label on X-axis */}
                {(i % (timeframe === '1m' ? 6 : timeframe === '3m' ? 5 : 4) === 0 || i === candles.length - 1) && (
                  <text
                    x={cx}
                    y={chartHeight - 14}
                    textAnchor="middle"
                    fill="#627d98"
                    fontSize="9.5"
                    fontFamily="monospace"
                  >
                    {c.time}
                  </text>
                )}
              </g>
            );
          })}

          {/* Current Live Price Horizontal Tracker Line with Pulsing Badge */}
          <line
            x1={chartPadding.left}
            y1={getY(market.nifty)}
            x2={svgWidth - chartPadding.right}
            y2={getY(market.nifty)}
            stroke="#f59e0b"
            strokeWidth="1.6"
            strokeDasharray="3 2"
          />
          <rect
            x={svgWidth - chartPadding.right + 2}
            y={getY(market.nifty) - 11}
            width={78}
            height={22}
            rx={4}
            fill="#78350f"
            stroke="#f59e0b"
            strokeWidth="1.2"
          />
          <text
            x={svgWidth - chartPadding.right + 7}
            y={getY(market.nifty) + 4.5}
            fill="#fef08a"
            fontSize="10.5"
            fontWeight="bold"
            fontFamily="monospace"
          >
            ₹{market.nifty.toFixed(1)}
          </text>

          {/* Interactive Crosshair Lines when cursor hovers */}
          {hoverCoords && (
            <g>
              {/* Vertical Crosshair Line */}
              <line
                x1={chartPadding.left + hoverCoords.index * candleSlotWidth + candleSlotWidth / 2}
                y1={chartPadding.top}
                x2={chartPadding.left + hoverCoords.index * candleSlotWidth + candleSlotWidth / 2}
                y2={chartHeight - chartPadding.bottom}
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.8"
              />

              {/* Horizontal Crosshair Line */}
              <line
                x1={chartPadding.left}
                y1={hoverCoords.svgY}
                x2={svgWidth - chartPadding.right}
                y2={hoverCoords.svgY}
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.8"
              />

              {/* Price Badge on Y-axis */}
              <rect
                x={svgWidth - chartPadding.right}
                y={hoverCoords.svgY - 9}
                width={72}
                height={18}
                rx={2}
                fill="#0369a1"
                stroke="#38bdf8"
                strokeWidth="0.8"
              />
              <text
                x={svgWidth - chartPadding.right + 5}
                y={hoverCoords.svgY + 4}
                fill="#e0f2fe"
                fontSize="9.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ₹{hoverCoords.price.toFixed(1)}
              </text>

              {/* Time Badge on X-axis */}
              <rect
                x={chartPadding.left + hoverCoords.index * candleSlotWidth + candleSlotWidth / 2 - 25}
                y={chartHeight - chartPadding.bottom + 2}
                width={50}
                height={16}
                rx={2}
                fill="#0369a1"
                stroke="#38bdf8"
                strokeWidth="0.8"
              />
              <text
                x={chartPadding.left + hoverCoords.index * candleSlotWidth + candleSlotWidth / 2}
                y={chartHeight - chartPadding.bottom + 14}
                textAnchor="middle"
                fill="#e0f2fe"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {displayCandle.time}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Bottom Strategy Execution & Trade Setup Panel */}
      <div className="p-3.5 bg-[#081220] border-t border-[#142842]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          {/* Strategy Rationale Checklist */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Target size={14} className="text-emerald-400" />
                <span>{isHindi ? 'रणनीति सत्यापन चेकलिस्ट' : 'Strategy Signal Verification'}</span>
              </span>
              <span className="text-[10px] text-[#8fa8c7]">
                {isHindi
                  ? `टाइमफ्रेम ${timeframe} और लाइव संकेतकों के आधार पर`
                  : `Based on ${timeframe} timeframe and real-time indicators`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {/* Condition 1: VWAP */}
              <div
                className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                  isAboveVwap
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                }`}
              >
                {isAboveVwap ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                <div>
                  <div className="text-[10px] opacity-70">Price vs VWAP</div>
                  <div className="font-bold font-mono">
                    {isAboveVwap ? 'Bullish (> VWAP)' : 'Bearish (< VWAP)'}
                  </div>
                </div>
              </div>

              {/* Condition 2: EMA Crossover */}
              <div
                className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                  displayCandle.ema9 >= displayCandle.ema21
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                }`}
              >
                {displayCandle.ema9 >= displayCandle.ema21 ? (
                  <CheckCircle2 size={13} />
                ) : (
                  <XCircle size={13} />
                )}
                <div>
                  <div className="text-[10px] opacity-70">EMA 9 / 21</div>
                  <div className="font-bold font-mono">
                    {displayCandle.ema9 >= displayCandle.ema21 ? 'Golden Cross' : 'Death Cross'}
                  </div>
                </div>
              </div>

              {/* Condition 3: Supertrend */}
              <div
                className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                  displayCandle.supertrendDirection === 'BULLISH'
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                }`}
              >
                {displayCandle.supertrendDirection === 'BULLISH' ? (
                  <CheckCircle2 size={13} />
                ) : (
                  <XCircle size={13} />
                )}
                <div>
                  <div className="text-[10px] opacity-70">Supertrend</div>
                  <div className="font-bold font-mono">
                    {displayCandle.supertrendDirection}
                  </div>
                </div>
              </div>

              {/* Condition 4: RSI Momentum */}
              <div
                className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                  isRsiFavorable
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                }`}
              >
                {isRsiFavorable ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                <div>
                  <div className="text-[10px] opacity-70">RSI Momentum</div>
                  <div className="font-bold font-mono">RSI: {market.rsi}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Trade Action Button */}
          <div className="w-full lg:w-auto flex items-center gap-2 pt-1 lg:pt-0">
            <button
              type="button"
              onClick={handleQuickLog}
              className={`w-full lg:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                market.signal.includes('BUY CE')
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                  : market.signal.includes('BUY PE')
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <PlusCircle size={15} />
              <span>
                {isHindi
                  ? `इस सिग्नल को जर्नल में जोड़ें (${market.signal})`
                  : `Log Strategy Signal to Journal (${market.signal})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
