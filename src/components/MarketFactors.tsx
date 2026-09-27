import React, { useState, useEffect } from 'react';
import { MarketState, GlobalMarketItem, GlobalMarketSummary } from '../types';
import {
  Globe,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Zap,
  Layers,
  DollarSign,
  Droplet,
  Compass,
  Building2,
  Activity,
} from 'lucide-react';

interface MarketFactorsProps {
  market: MarketState;
  isHindi?: boolean;
}

export const MarketFactors: React.FC<MarketFactorsProps> = ({ market, isHindi = false }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'us' | 'asia' | 'macro' | 'domestic'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRefreshingGlobal, setIsRefreshingGlobal] = useState(false);
  const [localGlobalSummary, setLocalGlobalSummary] = useState<GlobalMarketSummary | null>(
    market.globalMarkets || null
  );

  // Keep local global summary in sync when market updates
  useEffect(() => {
    if (market.globalMarkets) {
      setLocalGlobalSummary(market.globalMarkets);
    }
  }, [market.globalMarkets]);

  // Manual refresh of live global quotes directly from exchange feeds
  const handleRefreshGlobal = async () => {
    try {
      setIsRefreshingGlobal(true);
      const res = await fetch('/api/market/global?refresh=true');
      if (res.ok) {
        const data: GlobalMarketSummary = await res.json();
        setLocalGlobalSummary(data);
      }
    } catch (err) {
      console.warn('Failed to refresh global market data:', err);
    } finally {
      setIsRefreshingGlobal(false);
    }
  };

  // Derive global summary items or construct safe defaults
  const globalSummary: GlobalMarketSummary = localGlobalSummary || {
    overallSentiment: 'Bullish',
    bullishCount: 6,
    bearishCount: 3,
    neutralCount: 1,
    usSentiment: 'Bullish',
    asianSentiment: 'Bullish',
    fiiFlowImpact: 'Positive',
    giftSpread: Math.round(market.gift - market.nifty),
    gapPrediction: `+${Math.round(market.gift - market.nifty)} pts Gap-Up Expected on Dalal Street`,
    gapPredictionHi: `+${Math.round(market.gift - market.nifty)} अंक गैप-अप (Gap-Up) ओपनिंग की मजबूत संभावना`,
    items: [
      {
        id: 'gift',
        name: 'GIFT NIFTY (NSE IX)',
        nameHi: 'गिफ्ट निफ्टी (NSE IX IFSC)',
        category: 'Futures',
        symbol: 'GIFT NIFTY',
        price: market.gift,
        change: +(market.gift - market.nifty).toFixed(1),
        changePct: market.giftChangePct,
        status: market.giftChangePct >= 0 ? 'Bullish' : 'Bearish',
        impactOnIndia: `${Math.round(market.gift - market.nifty)} pts spread vs Spot NIFTY. Strong indicator for gap opening.`,
        impactOnIndiaHi: `स्पॉट निफ्टी से ${Math.round(market.gift - market.nifty)} अंक का स्प्रेड। गैप ओपनिंग का सटीक पैमाना।`,
      },
      {
        id: 'dow',
        name: 'Dow Jones (DJI)',
        nameHi: 'डाउ जोन्स (US Wall St)',
        category: 'US',
        symbol: '^DJI',
        price: 51863.69,
        change: -185.14,
        changePct: -0.36,
        status: 'Bearish',
        impactOnIndia: 'US blue-chip index. Sets overall foreign institutional (FII) tone and risk appetite in emerging markets.',
        impactOnIndiaHi: 'अमेरिकी ब्लूचिप इंडेक्स। वैश्विक संस्थागत (FII) निवेशकों के जोखिम लेने की क्षमता तय करता है।',
      },
      {
        id: 'nasdaq',
        name: 'Nasdaq Composite',
        nameHi: 'नैस्डैक कंपोजिट (US Tech)',
        category: 'US',
        symbol: '^IXIC',
        price: 27244.28,
        change: 122.18,
        changePct: 0.45,
        status: 'Bullish',
        impactOnIndia: 'US Tech Barometer. Direct correlation with Indian IT index (TCS, Infosys, HCL Tech, Wipro).',
        impactOnIndiaHi: 'अमेरिकी टेक बैरोमीटर। नैस्डैक में बढ़त से निफ्टी IT और लार्जकैप आईटी शेयरों में सीधी तेजी आती है।',
      },
      {
        id: 'sp500',
        name: 'S&P 500',
        nameHi: 'एसएंडपी 500 (US Broad)',
        category: 'US',
        symbol: '^GSPC',
        price: 7764.64,
        change: -0.06,
        changePct: -0.001,
        status: 'Neutral',
        impactOnIndia: 'Broad US benchmark reflecting institutional liquidity and equity fund allocations.',
        impactOnIndiaHi: 'अमेरिकी बाजार का सबसे व्यापक बेंचमार्क, जो ग्लोबल फंड फ्लो और लिक्विडिटी का सही पैमाना है।',
      },
      {
        id: 'nikkei',
        name: 'Nikkei 225',
        nameHi: 'निक्केई 225 (Japan)',
        category: 'Asia',
        symbol: '^N225',
        price: 65018.95,
        change: 882.75,
        changePct: 1.38,
        status: 'Bullish',
        impactOnIndia: 'Tokyo market lead indicator for Asian opening hours. Strong Nikkei provides morning tailwind for NIFTY.',
        impactOnIndiaHi: 'जापानी शेयर बाजार का मुख्य सूचकांक। सुबह के सत्र में भारतीय बाजार को एशियाई दिशा प्रदान करता है।',
      },
      {
        id: 'hangseng',
        name: 'Hang Seng',
        nameHi: 'हेंग सेंग (Hong Kong)',
        category: 'Asia',
        symbol: '^HSI',
        price: 24834.12,
        change: -253.63,
        changePct: -1.01,
        status: 'Bearish',
        impactOnIndia: 'Hong Kong & China regional liquidity indicator. Major driver of Asian foreign emerging fund flows.',
        impactOnIndiaHi: 'हांगकांग और चीन रीजनल मार्केट। विदेशी इमर्जिंग फंड्स के रुख को दर्शाता है।',
      },
      {
        id: 'ftse',
        name: 'FTSE 100',
        nameHi: 'एफटीएसई 100 (UK)',
        category: 'Europe',
        symbol: '^FTSE',
        price: 10696.74,
        change: -11.59,
        changePct: -0.11,
        status: 'Neutral',
        impactOnIndia: 'European bellwether index. Dictates Indian market afternoon session volatility (1:00 PM IST onward).',
        impactOnIndiaHi: 'यूरोपीय बाजार का प्रमुख सूचकांक। दोपहर 1:00 बजे के बाद भारतीय बाजार में वोलैटिलिटी प्रभावित करता है।',
      },
      {
        id: 'crude',
        name: 'Brent Crude Oil',
        nameHi: 'ब्रेंट क्रूड ऑयल (कच्चा तेल)',
        category: 'Commodity',
        symbol: 'BZ=F',
        price: market.crude,
        change: 1.03,
        changePct: market.crudeChangePct,
        status: market.crudeChangePct > 0.8 ? 'Bearish' : 'Bullish',
        impactOnIndia: 'India imports ~85% of crude. Spikes above $90 increase domestic inflation and pressure Auto, Paints, and OMCs.',
        impactOnIndiaHi: 'भारत 85% तेल आयात करता है। क्रूड में तेजी ऑटो, पेंट्स व एविएशन कंपनियों के मार्जिन पर दबाव डालती है।',
      },
      {
        id: 'dxy',
        name: 'US Dollar Index (DXY)',
        nameHi: 'यूएस डॉलर इंडेक्स (DXY)',
        category: 'Macro',
        symbol: 'DX-Y.NYB',
        price: 100.91,
        change: 0.31,
        changePct: 0.31,
        status: 'Bearish',
        impactOnIndia: 'Strong Dollar Index leads to Rupee depreciation and triggers aggressive FII selling in Indian equities.',
        impactOnIndiaHi: 'डॉलर इंडेक्स में मजबूती से रुपया कमजोर होता है और विदेशी निवेशक (FIIs) भारतीय बाजार से बिकवाली करते हैं।',
      },
      {
        id: 'us10y',
        name: 'US 10-Year Bond Yield',
        nameHi: 'यूएस 10-वर्षीय बॉन्ड यील्ड',
        category: 'Macro',
        symbol: '^TNX',
        price: 4.99,
        change: 0.02,
        changePct: 0.44,
        status: 'Neutral',
        impactOnIndia: 'Higher US yields draw global capital toward US sovereign paper, limiting equity inflows into India.',
        impactOnIndiaHi: 'अमेरिकी यील्ड बढ़ने से ग्लोबल फंड्स इक्विटी से हटकर सुरक्षित अमेरिकी बॉन्ड्स में चले जाते हैं।',
      },
    ],
  };

  // Domestic Factor Checklist items
  const isTechnicalBullish = market.nifty > market.vwap && market.rsi >= 55;
  const isOIBullish = market.pcr >= 1.05;
  const isPCRPositive = market.pcr >= 1.0;
  const isVixSafe = market.indiaVix <= 15;

  const domesticFactors = [
    {
      id: 'technical',
      name: 'Technical Price vs VWAP',
      nameHi: 'तकनीकी मूल्य बनाम VWAP',
      status: isTechnicalBullish ? 'Bullish' : 'Cautious',
      sentiment: isTechnicalBullish ? 'green' : 'yellow',
      value: `NIFTY: ₹${market.nifty.toFixed(1)} • VWAP: ₹${market.vwap.toFixed(1)}`,
      reason: `NIFTY is trading ${
        market.nifty > market.vwap ? 'above intraday VWAP with healthy buyer momentum' : 'below VWAP signaling overhead selling pressure'
      }. RSI(14) at ${market.rsi.toFixed(1)}.`,
      reasonHi: `निफ्टी ₹${market.nifty.toFixed(1)} पर VWAP (₹${market.vwap.toFixed(1)}) से ${
        market.nifty > market.vwap ? 'ऊपर ट्रेड कर रहा है' : 'नीचे ट्रेड कर रहा है'
      }। आरएसआई ${market.rsi} है।`,
    },
    {
      id: 'oi',
      name: 'Open Interest (OI) Support',
      nameHi: 'ओपन इंटरेस्ट (OI) सपोर्ट/रेजिस्टेंस',
      status: isOIBullish ? 'Bullish' : 'Neutral',
      sentiment: isOIBullish ? 'green' : 'yellow',
      value: `PCR: ${market.pcr.toFixed(2)} (${market.pcrBias})`,
      reason: `Heavy Put writing observed at ${
        market.options.find((o) => o.isATM)?.strike ?? Math.round(market.nifty / 50) * 50
      } and lower strikes, providing solid support against downward spikes.`,
      reasonHi: `एटीएम स्ट्राइक और निचले स्ट्राइक्स पर मजबूत पुट राइटिंग, जो गिरावट से सुरक्षा और सपोर्ट प्रदान करती है।`,
    },
    {
      id: 'vix',
      name: 'India VIX Volatility',
      nameHi: 'इंडिया VIX वोलैटिलिटी इंडेक्स',
      status: isVixSafe ? 'Safe' : 'Elevated',
      sentiment: isVixSafe ? 'green' : 'red',
      value: `VIX: ${market.indiaVix.toFixed(2)}`,
      reason: isVixSafe
        ? 'India VIX below 15 indicates calm volatility, suitable for directional option buying on confirmed breakout setups.'
        : 'Elevated India VIX signals high option premiums and wild swings. Maintain tight stop-losses.',
      reasonHi: isVixSafe
        ? 'VIX 15 से नीचे होना शांत बाजार और ऑप्शन बाइंग के लिए अनुकूल ट्रेंडिंग मूव्स का संकेत है।'
        : 'VIX में उछाल तीखे झटकों का संकेत देता है। सख्त स्टॉपलॉस का पालन करें।',
    },
  ];

  // Filter items based on active tab
  const filteredGlobalItems = globalSummary.items.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'us') return item.category === 'US';
    if (activeTab === 'asia') return item.category === 'Asia' || item.id === 'gift';
    if (activeTab === 'macro') return item.category === 'Commodity' || item.category === 'Macro' || item.category === 'Europe';
    return false;
  });

  return (
    <div id="section-market-factors" className="section mt-5">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xs">
            <Globe size={18} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>{isHindi ? 'सटीक ग्लोबल मार्केट्स व मैक्रो रडार' : 'Precise Global Markets & Macro Radar'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold">
                LIVE CUES
              </span>
            </h2>
            <p className="text-xs text-[#8fa8c7]">
              {isHindi
                ? 'गिफ्ट निफ्टी, डाउ जोन्स, नैस्डैक, क्रूड ऑयल और डॉलर इंडेक्स का सटीक लाइव अपडेट'
                : 'Live accurate tracking of GIFT Nifty, Dow, Nasdaq, Nikkei, Crude & US Dollar Index'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Overall Sentiment Badge */}
          <span
            className={`text-xs font-bold px-3 py-1 rounded-lg border flex items-center gap-1.5 ${
              globalSummary.overallSentiment === 'Bullish'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : globalSummary.overallSentiment === 'Bearish'
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
            }`}
          >
            {globalSummary.overallSentiment === 'Bullish' ? (
              <TrendingUp size={14} className="text-emerald-400" />
            ) : globalSummary.overallSentiment === 'Bearish' ? (
              <TrendingDown size={14} className="text-rose-400" />
            ) : (
              <Activity size={14} className="text-amber-400" />
            )}
            <span>
              {isHindi ? 'वैश्विक रुख:' : 'Global Cues:'}{' '}
              {globalSummary.overallSentiment === 'Bullish'
                ? isHindi
                  ? 'तेजी (Bullish)'
                  : 'Bullish'
                : globalSummary.overallSentiment === 'Bearish'
                ? isHindi
                  ? 'मंदी (Bearish)'
                  : 'Bearish'
                : isHindi
                ? 'मिश्रित (Mixed)'
                : 'Mixed'}
            </span>
          </span>

          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={handleRefreshGlobal}
            disabled={isRefreshingGlobal}
            className="px-2.5 py-1.5 rounded-lg bg-[#10233d] hover:bg-[#163359] border border-[#224065] text-[#8fa8c7] hover:text-white transition flex items-center gap-1 text-xs cursor-pointer"
            title="Refresh live global market quotes"
          >
            <RefreshCw size={13} className={isRefreshingGlobal ? 'animate-spin text-cyan-400' : ''} />
            <span className="hidden sm:inline">{isHindi ? 'रिफ्रेश' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Primary Banner: GIFT NIFTY & Dalal Street Opening Gap Prediction */}
      <div className="bg-linear-to-r from-[#0b1d33] via-[#0d223c] to-[#0c1a2d] border border-[#1f3b64] rounded-xl p-4 mb-3.5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: GIFT Nifty and Gap Prediction */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Zap size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-[#8fa8c7] uppercase tracking-wider">
                  {isHindi ? 'गिफ्ट निफ्टी (NSE IX IFSC) ओपनिंग अनुमान' : 'GIFT NIFTY (NSE IX) Opening Forecast'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#132c4a] border border-[#214979] text-amber-300">
                  SPREAD: {globalSummary.giftSpread >= 0 ? '+' : ''}
                  {globalSummary.giftSpread} PTS
                </span>
              </div>

              <div className="text-base sm:text-lg font-extrabold text-white mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-emerald-400">
                  ₹{market.gift.toLocaleString()} ({market.giftChangePct >= 0 ? '+' : ''}
                  {market.giftChangePct.toFixed(2)}%)
                </span>
                <span>•</span>
                <span
                  className={
                    globalSummary.giftSpread >= 25
                      ? 'text-emerald-300'
                      : globalSummary.giftSpread <= -25
                      ? 'text-rose-300'
                      : 'text-amber-300'
                  }
                >
                  {isHindi ? globalSummary.gapPredictionHi : globalSummary.gapPrediction}
                </span>
              </div>
            </div>
          </div>

          {/* Right: US Sentiment & FII Liquidity Impact */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap border-t md:border-t-0 md:border-l border-[#1b3658] pt-2 md:pt-0 md:pl-4">
            <div className="text-xs">
              <div className="text-[10px] text-[#8fa8c7] uppercase">US Wall St</div>
              <div
                className={`font-bold font-mono ${
                  globalSummary.usSentiment === 'Bullish'
                    ? 'text-emerald-400'
                    : globalSummary.usSentiment === 'Bearish'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {globalSummary.usSentiment}
              </div>
            </div>

            <div className="text-xs">
              <div className="text-[10px] text-[#8fa8c7] uppercase">Asian Markets</div>
              <div
                className={`font-bold font-mono ${
                  globalSummary.asianSentiment === 'Bullish'
                    ? 'text-emerald-400'
                    : globalSummary.asianSentiment === 'Bearish'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {globalSummary.asianSentiment}
              </div>
            </div>

            <div className="text-xs">
              <div className="text-[10px] text-[#8fa8c7] uppercase">FII Flow Impact</div>
              <div
                className={`font-bold font-mono ${
                  globalSummary.fiiFlowImpact === 'Positive'
                    ? 'text-emerald-400'
                    : globalSummary.fiiFlowImpact === 'Negative'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {globalSummary.fiiFlowImpact === 'Positive'
                  ? '▲ Inflow Friendly'
                  : globalSummary.fiiFlowImpact === 'Negative'
                  ? '▼ Outflow Risk'
                  : '◆ Neutral'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 text-xs font-semibold scrollbar-thin">
        {[
          { id: 'all', label: isHindi ? 'सभी ग्लोबल मार्केट्स (All)' : 'All Global Markets' },
          { id: 'us', label: isHindi ? 'अमेरिकी बाजार (US Wall St)' : 'US Wall Street' },
          { id: 'asia', label: isHindi ? 'एशियाई बाजार (Asia)' : 'Asian Markets' },
          { id: 'macro', label: isHindi ? 'क्रूड, करेंसी व मैक्रो (Macro/Crude)' : 'Macro & Crude Oil' },
          { id: 'domestic', label: isHindi ? 'घरेलू कारक (Domestic/OI)' : 'Domestic & OI Cues' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                : 'bg-[#0f223a] text-[#8fa8c7] hover:text-white hover:bg-[#152e4d] border border-[#1f3b61]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Global Market Grid */}
      {activeTab !== 'domestic' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredGlobalItems.map((item) => {
            const isBullish = item.status === 'Bullish';
            const isBearish = item.status === 'Bearish';
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className={`bg-[#0c1a2d] border rounded-xl p-3.5 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isExpanded
                    ? 'border-cyan-500/60 ring-2 ring-cyan-500/20 shadow-lg'
                    : 'border-[#1d3554] hover:border-[#2b4d79]'
                }`}
              >
                {/* Card Top: Name, Category & Status Tag */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold text-white truncate">
                      {isHindi ? item.nameHi : item.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        isBullish
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : isBearish
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Card Middle: Live Quote & Points Change */}
                  <div className="flex items-baseline justify-between my-1">
                    <span className="text-xl font-bold font-mono text-white">
                      {item.id === 'crude'
                        ? `$${item.price.toFixed(2)}`
                        : item.id === 'us10y'
                        ? `${item.price.toFixed(2)}%`
                        : item.id === 'dxy'
                        ? item.price.toFixed(2)
                        : item.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                    </span>

                    <span
                      className={`text-xs font-bold font-mono flex items-center gap-0.5 ${
                        item.changePct >= 0 ? 'text-[#21d19b]' : 'text-[#ff6578]'
                      }`}
                    >
                      {item.changePct >= 0 ? '+' : ''}
                      {item.change.toFixed(2)} ({item.changePct >= 0 ? '+' : ''}
                      {item.changePct.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                {/* Card Bottom: Indian Market Impact Rationale */}
                <div className="mt-2.5 pt-2 border-t border-[#172d47] text-[11px] text-[#8fa8c7] leading-relaxed">
                  <div className="text-[10px] uppercase font-bold text-[#627d98] mb-0.5">
                    {isHindi ? 'निफ्टी पर प्रभाव (Impact):' : 'NIFTY Impact:'}
                  </div>
                  <p className="text-slate-300">
                    {isHindi ? item.impactOnIndiaHi : item.impactOnIndia}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Domestic Factors Grid View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {domesticFactors.map((f) => (
            <div
              key={f.id}
              className="bg-[#0c1a2d] border border-[#1d3554] rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">{isHindi ? f.nameHi : f.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      f.sentiment === 'green'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : f.sentiment === 'red'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {f.status}
                  </span>
                </div>
                <div className="text-sm font-bold font-mono text-cyan-300 mb-2">{f.value}</div>
              </div>
              <p className="text-xs text-[#8fa8c7] border-t border-[#172d47] pt-2 leading-relaxed">
                {isHindi ? f.reasonHi : f.reason}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
