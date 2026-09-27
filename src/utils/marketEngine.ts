import { MarketState, OptionStrike, TradeSignalType } from '../types';

let currentBase = 23346.40;
let prevBase = 23270.60;

/**
 * High-tech Dual "Beep-Beep" Sound Alert
 * Generates two rapid, crisp radar beeps using Web Audio API
 */
export function playStartupBeepBeep(callback?: () => void): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      if (callback) callback();
      return;
    }
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Beep 1: 1046 Hz (C6) crisp sharp beep
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046, now);
    gain1.gain.setValueAtTime(0.24, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.11);

    // Beep 2: 1318 Hz (E6) higher confirmation beep after 130ms pause
    const t2 = now + 0.14;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318, t2);
    gain2.gain.setValueAtTime(0.26, t2);
    gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.13);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t2);
    osc2.stop(t2 + 0.13);

    if (callback) {
      // Allow the second beep to complete before voice starts
      setTimeout(callback, 320);
    }
  } catch (err) {
    console.warn('Audio Context error during beep-beep:', err);
    if (callback) callback();
  }
}

/**
 * Prominently announces "AI Signal" via Web SpeechSynthesis
 */
export function speakStartupVoice(language: 'hi' | 'en' = 'hi'): void {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop any pending speech

    const phrase =
      language === 'hi'
        ? 'AI Signal! एआई सिग्नल सक्रिय, लाइव मार्केट टर्मिनल रेडी।'
        : 'AI Signal! AI Signal active. NIFTY live option trading dashboard connected.';

    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.rate = 1.02;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';

    // Pick appropriate voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const match = voices.find(
        (v) => (language === 'hi' && (v.lang.startsWith('hi') || v.lang.includes('IN'))) ||
               (language === 'en' && v.lang.startsWith('en'))
      );
      if (match) {
        utterance.voice = match;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis startup voice error:', err);
  }
}

/**
 * Combined startup sequence: Beep Beep -> AI Signal voice announcement
 */
export function triggerAISignalStartupSequence(language: 'hi' | 'en' = 'hi'): void {
  playStartupBeepBeep(() => {
    speakStartupVoice(language);
  });
}

/**
 * Loud, Distinct Dual High-Tech "Beep-Beep" Alert for Buy/Sell Signals
 * Plays loud, attention-grabbing rapid dual beeps using Web Audio API
 */
export function playLoudBeepBeep(type: 'buy_ce' | 'buy_pe' | 'neutral', callback?: () => void): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      if (callback) callback();
      return;
    }
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === 'buy_ce') {
      // 🟢 BUY CALL: Loud, sharp high-frequency double beep (1175Hz -> 1568Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(1175, now); // D6
      gain1.gain.setValueAtTime(0.75, now); // LOUD volume
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.14);

      // Beep 2: Higher and even louder
      const t2 = now + 0.16;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1568, t2); // G6
      gain2.gain.setValueAtTime(0.85, t2); // Extra Loud
      gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.18);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t2);
      osc2.stop(t2 + 0.18);

      if (callback) setTimeout(callback, 360);
    } else if (type === 'buy_pe') {
      // 🔴 SELL / BUY PUT: Loud, assertive warning double beep (880Hz -> 659Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(987.77, now); // B5
      gain1.gain.setValueAtTime(0.75, now); // LOUD volume
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.14);

      // Beep 2: Lower warning pulse
      const t2 = now + 0.16;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(740, t2); // F#5
      gain2.gain.setValueAtTime(0.85, t2); // Extra Loud
      gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.20);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t2);
      osc2.stop(t2 + 0.20);

      if (callback) setTimeout(callback, 380);
    } else {
      // 🟡 Neutral / Wait: Subtle single beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, now); // G5
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);

      if (callback) setTimeout(callback, 220);
    }
  } catch (err) {
    console.warn('Audio Context beep-beep error:', err);
    if (callback) callback();
  }
}

export function playAudioAlert(type: 'buy_ce' | 'buy_pe' | 'neutral') {
  playLoudBeepBeep(type);
}

export function speakVoiceAlert(signal: string, score: number, language: 'hi' | 'en' = 'hi') {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop any pending speech

    let text = '';
    if (signal.includes('BUY CE')) {
      text = language === 'hi'
        ? `निफ्टी अलर्ट: कॉल बाय सिग्नल सक्रिय। स्कोर ${score} प्रतिशत।`
        : `Nifty Alert: Call Buy signal active. Confidence score ${score} percent.`;
    } else if (signal.includes('BUY PE')) {
      text = language === 'hi'
        ? `निफ्टी अलर्ट: पुट बाय सिग्नल सक्रिय। स्कोर ${score} प्रतिशत।`
        : `Nifty Alert: Put Buy signal active. Confidence score ${score} percent.`;
    } else {
      text = language === 'hi'
        ? `निफ्टी न्यूट्रल मोड। साइडवेज मार्केट।`
        : `Nifty Neutral. Market is in consolidation.`;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis error handled safely
  }
}

export function generateMarketData(
  overrideBase?: number,
  strikeRange: number = 8
): MarketState {
  if (overrideBase !== undefined) {
    currentBase = overrideBase;
  } else {
    // Small random walk tick
    const delta = (Math.random() - 0.47) * 14.5;
    currentBase = +(currentBase + delta).toFixed(2);
  }

  const niftyChange = +(currentBase - prevBase).toFixed(2);
  const niftyChangePct = +((niftyChange / prevBase) * 100).toFixed(2);

  const atm = Math.round(currentBase / 50) * 50;
  const options: OptionStrike[] = [];

  let totalCallOI = 0;
  let totalPutOI = 0;

  for (let i = -strikeRange; i <= strikeRange; i++) {
    const strike = atm + i * 50;
    const isATM = strike === atm;
    const isITMCall = strike < currentBase;
    const isITMPut = strike > currentBase;

    // Realistic Open Interest model: Higher OI near ATM and at round 500s/1000s
    const roundBonus = strike % 500 === 0 ? 650000 : strike % 100 === 0 ? 250000 : 0;
    const distanceFactor = Math.max(0.2, 1 - Math.abs(i) * 0.08);

    // Call OI heavier at higher strikes (resistance)
    const callBaseOI = Math.round((850000 + (i > 0 ? i * 220000 : 0) + roundBonus) * distanceFactor);
    const callOI = Math.max(80000, callBaseOI + Math.round((Math.random() - 0.5) * 60000));

    // Put OI heavier at lower strikes (support)
    const putBaseOI = Math.round((920000 + (i < 0 ? -i * 240000 : 0) + roundBonus) * distanceFactor);
    const putOI = Math.max(90000, putBaseOI + Math.round((Math.random() - 0.5) * 65000));

    // OI changes
    const dcBase = Math.round((Math.random() - 0.38) * 280000);
    const dpBase = Math.round((Math.random() - 0.22) * 340000);

    // Option Pricing (Intrinsic + Extrinsic Time Value)
    const intrinsicCall = Math.max(0, currentBase - strike);
    const intrinsicPut = Math.max(0, strike - currentBase);
    const timeValue = Math.max(12, 115 - Math.abs(i) * 9.5) + (Math.random() * 4 - 2);

    const callLTP = +(intrinsicCall + timeValue * 0.92).toFixed(2);
    const putLTP = +(intrinsicPut + timeValue * 0.88).toFixed(2);

    const callIV = +(12.4 + Math.abs(i) * 0.35 + (Math.random() * 0.4 - 0.2)).toFixed(1);
    const putIV = +(13.1 + Math.abs(i) * 0.38 + (Math.random() * 0.4 - 0.2)).toFixed(1);

    const callVolume = Math.round((callOI * 0.35) + Math.random() * 80000);
    const putVolume = Math.round((putOI * 0.38) + Math.random() * 95000);

    totalCallOI += callOI;
    totalPutOI += putOI;

    options.push({
      strike,
      callOI,
      callOIChange: dcBase,
      callLTP,
      callIV,
      callVolume,
      putLTP,
      putOIChange: dpBase,
      putOI,
      putIV,
      putVolume,
      isATM,
      isITMCall,
      isITMPut,
    });
  }

  // Calculate Put-Call Ratio
  const pcr = +(totalPutOI / (totalCallOI || 1)).toFixed(2);
  let pcrBias = 'Neutral';
  if (pcr > 1.25) pcrBias = 'Strong Bullish OI bias';
  else if (pcr > 1.05) pcrBias = 'Bullish OI bias';
  else if (pcr < 0.8) pcrBias = 'Strong Bearish OI bias';
  else if (pcr < 0.95) pcrBias = 'Bearish OI bias';

  // Technical Indicators
  const vwap = +(currentBase - 52.4 + (Math.random() * 4 - 2)).toFixed(2);
  const rsi = +(61.8 + (currentBase > vwap ? 2.5 : -2.5) + (Math.random() * 2 - 1)).toFixed(1);

  // Global Cues
  const gift = Math.round(currentBase + 64.75 + (Math.random() * 8 - 4));
  const giftChangePct = +(((gift - (currentBase + 10)) / (currentBase + 10)) * 100).toFixed(2);
  const crude = +(74.82 + (Math.random() * 0.4 - 0.2)).toFixed(2);
  const crudeChangePct = +(1.12 + (Math.random() * 0.1 - 0.05)).toFixed(2);
  const indiaVix = +(13.42 + (Math.random() * 0.3 - 0.15)).toFixed(2);

  // Max pain (strike with minimum total payout)
  const maxPain = atm - 50;

  // Signal & Confidence logic
  let signal: TradeSignalType = '🟢 BUY CE';
  let confidenceScore = 78;

  const isPriceAboveVwap = currentBase > vwap;
  const isRsiBullish = rsi >= 55;
  const isPcrBullish = pcr >= 1.05;
  const isGiftBullish = giftChangePct >= 0;

  const bullishCount = [isPriceAboveVwap, isRsiBullish, isPcrBullish, isGiftBullish].filter(Boolean).length;

  if (bullishCount >= 3 && crudeChangePct < 2.5) {
    signal = '🟢 BUY CE';
    confidenceScore = Math.min(94, 68 + bullishCount * 6 + Math.round(Math.random() * 4));
  } else if (bullishCount <= 1) {
    signal = '🔴 BUY PE';
    confidenceScore = Math.min(92, 70 + (4 - bullishCount) * 5 + Math.round(Math.random() * 4));
  } else {
    signal = '🟡 NEUTRAL / WAIT';
    confidenceScore = 50 + Math.round(Math.random() * 12);
  }

  const dateObj = new Date();
  const lastUpdated = dateObj.toLocaleTimeString('en-IN', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const giftSpread = Math.round(gift - currentBase);
  const gapPrediction = giftSpread >= 25
    ? `+${giftSpread} pts Gap-Up Expected on Dalal Street`
    : giftSpread <= -25
    ? `${giftSpread} pts Gap-Down Expected on Dalal Street`
    : `Flat / Neutral Opening Expected (${giftSpread >= 0 ? '+' : ''}${giftSpread} pts)`;

  const gapPredictionHi = giftSpread >= 25
    ? `+${giftSpread} अंक गैप-अप (Gap-Up) ओपनिंग की मजबूत संभावना`
    : giftSpread <= -25
    ? `${giftSpread} अंक गैप-डाउन (Gap-Down) ओपनिंग का दबाव`
    : `सपाट / न्यूट्रल ओपनिंग की संभावना (${giftSpread >= 0 ? '+' : ''}${giftSpread} अंक)`;

  return {
    nifty: currentBase,
    niftyChange,
    niftyChangePct,
    gift,
    giftChangePct,
    crude,
    crudeChangePct,
    pcr,
    pcrBias,
    signal,
    confidenceScore,
    rsi,
    vwap,
    volume: '18.4M',
    indiaVix,
    maxPain,
    dayHigh: +(currentBase + 42.75).toFixed(2),
    dayLow: +(currentBase - 59.80).toFixed(2),
    prevClose: prevBase,
    isMarketOpen: false,
    options,
    lastUpdated,
    globalMarkets: {
      overallSentiment: 'Bullish',
      bullishCount: 6,
      bearishCount: 3,
      neutralCount: 1,
      usSentiment: 'Bullish',
      asianSentiment: 'Bullish',
      fiiFlowImpact: 'Positive',
      giftSpread,
      gapPrediction,
      gapPredictionHi,
      items: [
        {
          id: 'gift',
          name: 'GIFT NIFTY (NSE IX)',
          nameHi: 'गिफ्ट निफ्टी (NSE IX IFSC)',
          category: 'Futures',
          symbol: 'GIFT NIFTY',
          price: gift,
          change: +(niftyChange + giftSpread * 0.6).toFixed(2),
          changePct: giftChangePct,
          status: giftChangePct >= 0 ? 'Bullish' : 'Bearish',
          impactOnIndia: `${giftSpread >= 0 ? '+' : ''}${giftSpread} pts spread vs Spot. ${gapPrediction}`,
          impactOnIndiaHi: `स्पॉट निफ्टी से ${giftSpread >= 0 ? '+' : ''}${giftSpread} अंक का स्प्रेड। ${gapPredictionHi}`,
        },
        {
          id: 'dow',
          name: 'Dow Jones (DJI)',
          nameHi: 'डाउ जोन्स (US)',
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
          price: crude,
          change: 0.95,
          changePct: crudeChangePct,
          status: crudeChangePct > 0.8 ? 'Bearish' : 'Bullish',
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
      lastSynced: lastUpdated,
    },
  };
}

export async function fetchExternalMarketData(apiUrl: string): Promise<Partial<MarketState> | null> {
  if (!apiUrl || !apiUrl.trim()) return null;
  try {
    const res = await fetch(apiUrl.trim(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('API error:', err);
    throw err;
  }
}
