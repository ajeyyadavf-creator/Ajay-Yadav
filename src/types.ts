export interface OptionStrike {
  strike: number;
  callOI: number;
  callOIChange: number;
  callLTP: number;
  callChange?: number;
  callIV?: number;
  callVolume?: number;
  putLTP: number;
  putChange?: number;
  putOIChange: number;
  putOI: number;
  putIV?: number;
  putVolume?: number;
  isATM: boolean;
  isITMCall: boolean;
  isITMPut: boolean;
}

export type TradeSignalType = '🟢 BUY CE' | '🔴 BUY PE' | '🟡 NEUTRAL / WAIT';

export interface GlobalMarketItem {
  id: string;
  name: string;
  nameHi: string;
  category: 'Futures' | 'US' | 'Asia' | 'Europe' | 'Commodity' | 'Macro';
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  status: 'Bullish' | 'Bearish' | 'Neutral';
  impactOnIndia: string;
  impactOnIndiaHi: string;
  lastUpdated?: string;
}

export interface GlobalMarketSummary {
  overallSentiment: 'Bullish' | 'Bearish' | 'Neutral' | 'Mixed';
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  usSentiment: 'Bullish' | 'Bearish' | 'Mixed';
  asianSentiment: 'Bullish' | 'Bearish' | 'Mixed';
  fiiFlowImpact: 'Positive' | 'Negative' | 'Neutral';
  giftSpread: number;
  gapPrediction: string;
  gapPredictionHi: string;
  items: GlobalMarketItem[];
  lastSynced?: string;
}

export interface MarketState {
  nifty: number;
  niftyChange: number;
  niftyChangePct: number;
  gift: number;
  giftChangePct: number;
  crude: number;
  crudeChangePct: number;
  pcr: number;
  pcrBias: string;
  signal: TradeSignalType;
  confidenceScore: number;
  rsi: number;
  vwap: number;
  volume: string;
  indiaVix: number;
  maxPain: number;
  dayHigh?: number;
  dayLow?: number;
  prevClose?: number;
  isMarketOpen?: boolean;
  serverLatencyMs?: number;
  upstreamEngine?: string;
  options: OptionStrike[];
  lastUpdated: string;
  source?: 'live_market_api' | 'synthetic_feed';
  globalMarkets?: GlobalMarketSummary;
}

export interface MarketFactorItem {
  id: string;
  name: string;
  status: 'Bullish' | 'Bearish' | 'Positive' | 'Risk' | 'Neutral' | 'Mixed';
  sentiment: 'green' | 'red' | 'yellow';
  description: string;
}

export interface AppConfig {
  apiUrl: string;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  soundEnabled: boolean;
  voiceAlertsEnabled: boolean;
  language: 'hi' | 'en';
  selectedExpiry: string;
  strikeRange: number; // e.g. 5, 10, 15 strikes around ATM
  showGreeks: boolean;
}

export interface TradeLog {
  id: string;
  timestamp: string;
  date: string;
  instrument: string; // e.g., 'NIFTY 23450 CE'
  tradeType: 'CE' | 'PE' | 'FUT';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  notes: string;
  pnl?: number;
  pnlPoints?: number;
  status: 'OPEN' | 'CLOSED';
}
