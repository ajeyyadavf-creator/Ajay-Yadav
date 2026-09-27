export type Timeframe = '1m' | '3m' | '5m' | '15m' | '30m';

export interface StrategyCandle {
  id: string;
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePct: number;
  ema9: number;
  ema21: number;
  vwap: number;
  supertrend: number;
  supertrendDirection: 'BULLISH' | 'BEARISH';
  signal?: 'BUY_CE' | 'BUY_PE' | null;
  signalPrice?: number;
  target1?: number;
  target2?: number;
  stopLoss?: number;
}

export function getTimeframeMinutes(tf: Timeframe): number {
  switch (tf) {
    case '1m': return 1;
    case '3m': return 3;
    case '5m': return 5;
    case '15m': return 15;
    case '30m': return 30;
    default: return 5;
  }
}

export function getRecommendedCandleCount(tf: Timeframe): number {
  switch (tf) {
    case '1m': return 32;
    case '3m': return 28;
    case '5m': return 24;
    case '15m': return 20;
    case '30m': return 16;
    default: return 24;
  }
}

/**
 * Generate accurate and realistic NIFTY 50 intraday candlestick data
 * conforming to chosen timeframe, respecting dayHigh, dayLow, and spot price.
 */
export function generateInitialCandles(
  spotPrice: number,
  timeframe: Timeframe = '5m',
  count?: number,
  dayHigh?: number,
  dayLow?: number,
  prevClose?: number
): StrategyCandle[] {
  const intervalMins = getTimeframeMinutes(timeframe);
  const candleCount = count || getRecommendedCandleCount(timeframe);
  const candles: StrategyCandle[] = [];

  const now = new Date();
  // Round to latest timeframe boundary in minutes
  const currentMinutes = now.getMinutes();
  const roundedMinutes = Math.floor(currentMinutes / intervalMins) * intervalMins;
  const currentIntervalEnd = new Date(now);
  currentIntervalEnd.setMinutes(roundedMinutes, 0, 0);

  const basePrice = prevClose && prevClose > 10000 ? prevClose : spotPrice - 45;
  const highLimit = dayHigh && dayHigh >= spotPrice ? dayHigh : spotPrice + 35;
  const lowLimit = dayLow && dayLow <= spotPrice ? dayLow : spotPrice - 65;

  // Typical candle volatility based on interval
  const volFactor = Math.sqrt(intervalMins);
  const avgBody = 4.5 * volFactor;
  const avgWick = 2.5 * volFactor;

  // Generate intermediate pathway from basePrice to spotPrice
  const path: number[] = [];
  path.push(basePrice);

  for (let i = 1; i < candleCount - 1; i++) {
    const progress = i / (candleCount - 1);
    // Smooth trend towards spotPrice with multi-frequency intraday market swings
    const trendTarget = basePrice + (spotPrice - basePrice) * progress;
    const wave1 = Math.sin(progress * Math.PI * 2.5) * (14 * volFactor);
    const wave2 = Math.cos(progress * Math.PI * 4) * (8 * volFactor);
    const noise = (Math.sin(i * 1.8) * 0.5 + (Math.random() - 0.49) * 0.5) * (6 * volFactor);

    let price = trendTarget + wave1 + wave2 + noise;
    // Bound within dayHigh and dayLow
    price = Math.max(lowLimit + 2, Math.min(highLimit - 2, price));
    path.push(price);
  }
  path.push(spotPrice);

  let runningVolume = 0;
  let runningVolumePrice = 0;

  for (let i = 0; i < candleCount; i++) {
    const candleTime = new Date(currentIntervalEnd.getTime() - (candleCount - 1 - i) * intervalMins * 60 * 1000);
    const timeStr = candleTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const isLast = i === candleCount - 1;
    const prevC = i > 0 ? candles[i - 1].close : basePrice;
    const open = +prevC.toFixed(2);
    let close = isLast ? spotPrice : +path[i].toFixed(2);

    // Prevent completely flat candles
    if (Math.abs(close - open) < 0.25) {
      close = +(open + (i % 2 === 0 ? 1.2 : -1.2)).toFixed(2);
    }

    const minBody = Math.min(open, close);
    const maxBody = Math.max(open, close);

    const upperWick = +(Math.random() * avgWick + 1.2).toFixed(2);
    const lowerWick = +(Math.random() * avgWick + 1.2).toFixed(2);

    let high = +(maxBody + upperWick).toFixed(2);
    let low = +(minBody - lowerWick).toFixed(2);

    // Ensure high and low strictly bound open and close
    high = Math.max(high, maxBody);
    low = Math.min(low, minBody);

    // Volume scales with candle size and timeframe
    const bodySpread = Math.abs(close - open);
    const baseVol = 35000 * intervalMins;
    const volume = Math.round(baseVol + bodySpread * 1800 * intervalMins + Math.random() * (12000 * intervalMins));

    const typicalPrice = (high + low + close) / 3;
    runningVolume += volume;
    runningVolumePrice += typicalPrice * volume;
    const vwap = +(runningVolumePrice / runningVolume).toFixed(2);

    const change = +(close - open).toFixed(2);
    const changePct = +((change / open) * 100).toFixed(2);

    candles.push({
      id: `c-${timeframe}-${i}-${candleTime.getTime()}`,
      time: timeStr,
      timestamp: candleTime.getTime(),
      open,
      high,
      low,
      close,
      volume,
      change,
      changePct,
      ema9: close,
      ema21: close,
      vwap,
      supertrend: close - 25,
      supertrendDirection: 'BULLISH',
      signal: null,
    });
  }

  // Calculate technical indicators
  computeIndicators(candles, intervalMins);

  // Inject actionable strategy signals
  injectStrategySignals(candles, spotPrice);

  return candles;
}

export function computeIndicators(candles: StrategyCandle[], intervalMinutes: number = 5): void {
  if (candles.length === 0) return;

  const k9 = 2 / (9 + 1);
  const k21 = 2 / (21 + 1);

  let ema9 = candles[0].close;
  let ema21 = candles[0].close;

  // Running VWAP
  let cumulativeVol = 0;
  let cumulativeTypVol = 0;

  // Supertrend ATR tracking
  const period = 10;
  const multiplier = 2.2;
  const trValues: number[] = [];
  let supertrend = candles[0].close;
  let supertrendDirection: 'BULLISH' | 'BEARISH' = 'BULLISH';

  candles.forEach((c, idx) => {
    // EMA calculations
    ema9 = +(c.close * k9 + ema9 * (1 - k9)).toFixed(2);
    ema21 = +(c.close * k21 + ema21 * (1 - k21)).toFixed(2);
    c.ema9 = ema9;
    c.ema21 = ema21;

    // VWAP calculation
    const typical = (c.high + c.low + c.close) / 3;
    cumulativeVol += c.volume;
    cumulativeTypVol += typical * c.volume;
    c.vwap = cumulativeVol > 0 ? +(cumulativeTypVol / cumulativeVol).toFixed(2) : c.close;

    // True Range for Supertrend
    const prevClose = idx > 0 ? candles[idx - 1].close : c.open;
    const tr = Math.max(
      c.high - c.low,
      Math.abs(c.high - prevClose),
      Math.abs(c.low - prevClose)
    );
    trValues.push(tr);

    let atr = tr;
    if (trValues.length >= period) {
      const slice = trValues.slice(-period);
      atr = slice.reduce((acc, v) => acc + v, 0) / period;
    } else {
      atr = trValues.reduce((acc, v) => acc + v, 0) / trValues.length;
    }

    const hl2 = (c.high + c.low) / 2;
    const upperBand = hl2 + multiplier * atr;
    const lowerBand = hl2 - multiplier * atr;

    if (idx === 0) {
      supertrendDirection = c.close >= hl2 ? 'BULLISH' : 'BEARISH';
      supertrend = supertrendDirection === 'BULLISH' ? lowerBand : upperBand;
    } else {
      if (supertrendDirection === 'BULLISH') {
        if (c.close < supertrend) {
          supertrendDirection = 'BEARISH';
          supertrend = upperBand;
        } else {
          supertrend = Math.max(supertrend, lowerBand);
        }
      } else {
        if (c.close > supertrend) {
          supertrendDirection = 'BULLISH';
          supertrend = lowerBand;
        } else {
          supertrend = Math.min(supertrend, upperBand);
        }
      }
    }

    c.supertrend = +supertrend.toFixed(2);
    c.supertrendDirection = supertrendDirection;
  });
}

export function injectStrategySignals(candles: StrategyCandle[], spotPrice: number): void {
  if (candles.length < 6) return;

  // Scan for EMA crossovers with VWAP and Supertrend confluence
  for (let i = 3; i < candles.length; i++) {
    const prev = candles[i - 1];
    const curr = candles[i];

    const bullCross = prev.ema9 <= prev.ema21 && curr.ema9 > curr.ema21;
    const bearCross = prev.ema9 >= prev.ema21 && curr.ema9 < curr.ema21;

    if (bullCross && curr.close >= curr.vwap) {
      curr.signal = 'BUY_CE';
      curr.signalPrice = curr.close;
      curr.target1 = +(curr.close + 48).toFixed(2);
      curr.target2 = +(curr.close + 95).toFixed(2);
      curr.stopLoss = +(Math.min(curr.low, curr.supertrend) - 6).toFixed(2);
    } else if (bearCross && curr.close <= curr.vwap) {
      curr.signal = 'BUY_PE';
      curr.signalPrice = curr.close;
      curr.target1 = +(curr.close - 48).toFixed(2);
      curr.target2 = +(curr.close - 95).toFixed(2);
      curr.stopLoss = +(Math.max(curr.high, curr.supertrend) + 6).toFixed(2);
    }
  }

  // If no signal is in the recent candles, ensure an active setup exists
  const lastSignalIdx = candles.map((c) => c.signal).lastIndexOf('BUY_CE');
  const lastBearIdx = candles.map((c) => c.signal).lastIndexOf('BUY_PE');
  const maxIdx = Math.max(lastSignalIdx, lastBearIdx);

  if (maxIdx < candles.length - 7) {
    const activeCandle = candles[Math.max(0, candles.length - 4)];
    const isBull = spotPrice >= activeCandle.vwap;
    if (isBull) {
      activeCandle.signal = 'BUY_CE';
      activeCandle.signalPrice = activeCandle.close;
      activeCandle.target1 = +(activeCandle.close + 50).toFixed(2);
      activeCandle.target2 = +(activeCandle.close + 105).toFixed(2);
      activeCandle.stopLoss = +(Math.min(activeCandle.low, activeCandle.supertrend) - 8).toFixed(2);
    } else {
      activeCandle.signal = 'BUY_PE';
      activeCandle.signalPrice = activeCandle.close;
      activeCandle.target1 = +(activeCandle.close - 50).toFixed(2);
      activeCandle.target2 = +(activeCandle.close - 105).toFixed(2);
      activeCandle.stopLoss = +(Math.max(activeCandle.high, activeCandle.supertrend) + 8).toFixed(2);
    }
  }
}

/**
 * Updates the candlestick sequence with live tick data.
 * Rollover to a new candle automatically when the timeframe interval expires.
 */
export function updateLatestCandle(
  candles: StrategyCandle[],
  spotPrice: number,
  timeframe: Timeframe = '5m'
): StrategyCandle[] {
  if (!candles || candles.length === 0) {
    return generateInitialCandles(spotPrice, timeframe);
  }

  const intervalMins = getTimeframeMinutes(timeframe);
  const intervalMs = intervalMins * 60 * 1000;
  const now = Date.now();
  const updated = [...candles];
  const lastCandle = { ...updated[updated.length - 1] };

  // Check if current time has crossed into the next candle interval
  const lastTimestamp = lastCandle.timestamp;
  const isIntervalExpired = now - lastTimestamp >= intervalMs;

  if (isIntervalExpired) {
    // Start a brand new candle
    const candleTime = new Date(now);
    const timeStr = candleTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const newOpen = lastCandle.close;
    const newCandle: StrategyCandle = {
      id: `c-${timeframe}-${updated.length}-${candleTime.getTime()}`,
      time: timeStr,
      timestamp: candleTime.getTime(),
      open: newOpen,
      high: Math.max(newOpen, spotPrice),
      low: Math.min(newOpen, spotPrice),
      close: spotPrice,
      volume: 4500 * intervalMins,
      change: +(spotPrice - newOpen).toFixed(2),
      changePct: +(((spotPrice - newOpen) / newOpen) * 100).toFixed(2),
      ema9: spotPrice,
      ema21: spotPrice,
      vwap: spotPrice,
      supertrend: spotPrice - 20,
      supertrendDirection: 'BULLISH',
      signal: null,
    };

    updated.push(newCandle);
    // Keep max 45 candles to ensure chart stays uncluttered
    if (updated.length > 45) {
      updated.shift();
    }
  } else {
    // Update the existing latest candle
    lastCandle.close = spotPrice;
    lastCandle.high = Math.max(lastCandle.high, spotPrice);
    lastCandle.low = Math.min(lastCandle.low, spotPrice);
    lastCandle.change = +(lastCandle.close - lastCandle.open).toFixed(2);
    lastCandle.changePct = +(((lastCandle.close - lastCandle.open) / lastCandle.open) * 100).toFixed(2);
    lastCandle.volume += 350;
    updated[updated.length - 1] = lastCandle;
  }

  computeIndicators(updated, intervalMins);
  return updated;
}
