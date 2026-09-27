import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { OptionChainTable } from './components/OptionChainTable';
import { MarketFactors } from './components/MarketFactors';
import { InfoNote } from './components/InfoNote';
import { ApiConfigModal } from './components/ApiConfigModal';
import { TradeLoggerModal } from './components/TradeLoggerModal';
import { TradeLogBanner } from './components/TradeLogBanner';
import { TradingViewChart } from './components/TradingViewChart';
import { OfflineIndicator } from './components/OfflineIndicator';
import { StartupSoundOverlay } from './components/StartupSoundOverlay';
import { AuthModal } from './components/AuthModal';
import { OwnerCodeManagerModal } from './components/OwnerCodeManagerModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { PWAInstallModal } from './components/PWAInstallModal';
import { getStoredOwnerSession, clearOwnerSession } from './utils/ownerSecurity';
import { AppConfig, MarketState, OptionStrike, TradeLog } from './types';
import { getSavedTrades } from './utils/tradeStorage';
import {
  generateMarketData,
  fetchExternalMarketData,
  playAudioAlert,
  playLoudBeepBeep,
  speakVoiceAlert,
} from './utils/marketEngine';

export default function App() {
  const [config, setConfig] = useState<AppConfig>({
    apiUrl: '/api/market',
    autoRefresh: true,
    refreshInterval: 15, // Default 15s from user prompt
    soundEnabled: true,
    voiceAlertsEnabled: true,
    language: 'hi', // Matches user's Hindi prompt default
    selectedExpiry: 'Current Expiry',
    strikeRange: 8,
    showGreeks: false,
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(getStoredOwnerSession());
  });
  const [showStartupOverlay, setShowStartupOverlay] = useState<boolean>(false);
  const [isOwnerCodeModalOpen, setIsOwnerCodeModalOpen] = useState<boolean>(false);
  const [isPWAInstallModalOpen, setIsPWAInstallModalOpen] = useState<boolean>(false);

  const [market, setMarket] = useState<MarketState>(() => generateMarketData(23346.40, 8));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'simulated' | 'connected' | 'error'>('connected');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTradeLoggerOpen, setIsTradeLoggerOpen] = useState(false);
  const [initialTradeData, setInitialTradeData] = useState<{
    instrument?: string;
    tradeType?: 'CE' | 'PE';
    strike?: number;
    entryPrice?: number;
    quantity?: number;
  } | null>(null);
  const [trades, setTrades] = useState<TradeLog[]>(() => getSavedTrades());

  const prevSignalRef = useRef<string>(market.signal);

  // Quick 1-click Log Trade from Option Chain or Calculator
  const handleQuickLogTrade = (strike: number, type: 'CE' | 'PE', ltp: number) => {
    setInitialTradeData({
      instrument: `NIFTY ${strike} ${type}`,
      tradeType: type,
      strike,
      entryPrice: ltp,
      quantity: 50,
    });
    setIsTradeLoggerOpen(true);
  };

  const handleOpenTradeLoggerWithData = (data: {
    instrument: string;
    tradeType: 'CE' | 'PE';
    strike: number;
    entryPrice: number;
    quantity: number;
  }) => {
    setInitialTradeData(data);
    setIsTradeLoggerOpen(true);
  };

  // Core refresh logic
  const handleRefresh = useCallback(async (force = false) => {
    setIsRefreshing(true);
    try {
      if (config.apiUrl && config.apiUrl.trim()) {
        try {
          const sep = config.apiUrl.includes('?') ? '&' : '?';
          const targetUrl = force
            ? `${config.apiUrl}${sep}refresh=true&t=${Date.now()}`
            : config.apiUrl;
          const remoteData = (await fetchExternalMarketData(targetUrl)) as (Partial<MarketState> & { score?: number }) | null;
          if (remoteData) {
            setMarket((prev) => {
              const updatedNifty = remoteData.nifty !== undefined ? Number(remoteData.nifty) : prev.nifty;
              const optionsData: OptionStrike[] = Array.isArray(remoteData.options) && remoteData.options.length > 0
                ? (remoteData.options as OptionStrike[])
                : generateMarketData(updatedNifty, config.strikeRange).options;

              const updated: MarketState = {
                ...prev,
                nifty: updatedNifty,
                niftyChange: remoteData.niftyChange !== undefined ? Number(remoteData.niftyChange) : prev.niftyChange,
                niftyChangePct: remoteData.niftyChangePct !== undefined ? Number(remoteData.niftyChangePct) : prev.niftyChangePct,
                gift: remoteData.gift !== undefined ? Number(remoteData.gift) : prev.gift,
                giftChangePct: remoteData.giftChangePct !== undefined ? Number(remoteData.giftChangePct) : prev.giftChangePct,
                crude: remoteData.crude !== undefined ? Number(remoteData.crude) : prev.crude,
                crudeChangePct: remoteData.crudeChangePct !== undefined ? Number(remoteData.crudeChangePct) : prev.crudeChangePct,
                pcr: remoteData.pcr !== undefined ? Number(remoteData.pcr) : prev.pcr,
                pcrBias: remoteData.pcrBias || prev.pcrBias,
                rsi: remoteData.rsi !== undefined ? Number(remoteData.rsi) : prev.rsi,
                vwap: remoteData.vwap !== undefined ? Number(remoteData.vwap) : prev.vwap,
                volume: remoteData.volume || prev.volume,
                indiaVix: remoteData.indiaVix !== undefined ? Number(remoteData.indiaVix) : prev.indiaVix,
                maxPain: remoteData.maxPain !== undefined ? Number(remoteData.maxPain) : prev.maxPain,
                dayHigh: remoteData.dayHigh !== undefined ? Number(remoteData.dayHigh) : prev.dayHigh,
                dayLow: remoteData.dayLow !== undefined ? Number(remoteData.dayLow) : prev.dayLow,
                prevClose: remoteData.prevClose !== undefined ? Number(remoteData.prevClose) : prev.prevClose,
                isMarketOpen: remoteData.isMarketOpen !== undefined ? Boolean(remoteData.isMarketOpen) : prev.isMarketOpen,
                serverLatencyMs: remoteData.serverLatencyMs !== undefined ? Number(remoteData.serverLatencyMs) : prev.serverLatencyMs,
                upstreamEngine: remoteData.upstreamEngine || prev.upstreamEngine,
                signal: remoteData.signal ? (remoteData.signal as MarketState['signal']) : prev.signal,
                confidenceScore: remoteData.confidenceScore ?? remoteData.score ?? prev.confidenceScore,
                options: optionsData,
                source: remoteData.source || 'live_market_api',
                lastUpdated: remoteData.lastUpdated || new Date().toLocaleTimeString('en-IN', {
                  hour12: true,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }),
              };
              return updated;
            });
            setConnectionStatus('connected');
          }
        } catch {
          setConnectionStatus('error');
          // Fallback to simulation smoothly
          setMarket(generateMarketData(undefined, config.strikeRange));
        }
      } else {
        // High fidelity simulation
        setConnectionStatus('simulated');
        setMarket(generateMarketData(undefined, config.strikeRange));
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [config.apiUrl, config.strikeRange]);

  // Dual-Engine Live Stream: Real-Time Server-Sent Events (SSE) with HTTP polling backup
  useEffect(() => {
    if (!config.apiUrl || !config.apiUrl.includes('/api/market')) return;

    let eventSource: EventSource | null = null;
    let isSubscribed = true;

    try {
      eventSource = new EventSource('/api/market/stream');

      eventSource.onopen = () => {
        if (isSubscribed) setConnectionStatus('connected');
      };

      eventSource.onmessage = (event) => {
        if (!isSubscribed || !event.data) return;
        try {
          const remoteData = JSON.parse(event.data) as Partial<MarketState> & { score?: number };
          if (remoteData) {
            setMarket((prev) => {
              const updatedNifty = remoteData.nifty !== undefined ? Number(remoteData.nifty) : prev.nifty;
              const optionsData: OptionStrike[] = Array.isArray(remoteData.options) && remoteData.options.length > 0
                ? (remoteData.options as OptionStrike[])
                : generateMarketData(updatedNifty, config.strikeRange).options;

              return {
                ...prev,
                nifty: updatedNifty,
                niftyChange: remoteData.niftyChange !== undefined ? Number(remoteData.niftyChange) : prev.niftyChange,
                niftyChangePct: remoteData.niftyChangePct !== undefined ? Number(remoteData.niftyChangePct) : prev.niftyChangePct,
                gift: remoteData.gift !== undefined ? Number(remoteData.gift) : prev.gift,
                giftChangePct: remoteData.giftChangePct !== undefined ? Number(remoteData.giftChangePct) : prev.giftChangePct,
                crude: remoteData.crude !== undefined ? Number(remoteData.crude) : prev.crude,
                crudeChangePct: remoteData.crudeChangePct !== undefined ? Number(remoteData.crudeChangePct) : prev.crudeChangePct,
                pcr: remoteData.pcr !== undefined ? Number(remoteData.pcr) : prev.pcr,
                pcrBias: remoteData.pcrBias || prev.pcrBias,
                rsi: remoteData.rsi !== undefined ? Number(remoteData.rsi) : prev.rsi,
                vwap: remoteData.vwap !== undefined ? Number(remoteData.vwap) : prev.vwap,
                volume: remoteData.volume || prev.volume,
                indiaVix: remoteData.indiaVix !== undefined ? Number(remoteData.indiaVix) : prev.indiaVix,
                maxPain: remoteData.maxPain !== undefined ? Number(remoteData.maxPain) : prev.maxPain,
                dayHigh: remoteData.dayHigh !== undefined ? Number(remoteData.dayHigh) : prev.dayHigh,
                dayLow: remoteData.dayLow !== undefined ? Number(remoteData.dayLow) : prev.dayLow,
                prevClose: remoteData.prevClose !== undefined ? Number(remoteData.prevClose) : prev.prevClose,
                isMarketOpen: remoteData.isMarketOpen !== undefined ? Boolean(remoteData.isMarketOpen) : prev.isMarketOpen,
                serverLatencyMs: remoteData.serverLatencyMs !== undefined ? Number(remoteData.serverLatencyMs) : prev.serverLatencyMs,
                upstreamEngine: remoteData.upstreamEngine || prev.upstreamEngine,
                signal: remoteData.signal ? (remoteData.signal as MarketState['signal']) : prev.signal,
                confidenceScore: remoteData.confidenceScore ?? remoteData.score ?? prev.confidenceScore,
                options: optionsData,
                source: remoteData.source || 'live_market_api',
                lastUpdated: remoteData.lastUpdated || new Date().toLocaleTimeString('en-IN', {
                  hour12: true,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }),
              };
            });
            setConnectionStatus('connected');
          }
        } catch {
          // Keep running
        }
      };

      eventSource.onerror = () => {
        // SSE temporary disconnect: close and let polling maintain live stream seamlessly
        if (eventSource) {
          eventSource.close();
        }
      };
    } catch {
      // Fallback seamlessly to polling
    }

    return () => {
      isSubscribed = false;
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [config.apiUrl, config.strikeRange]);

  // Initial load fetch
  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  // Handle Signal changes & sound / voice alerts
  useEffect(() => {
    if (prevSignalRef.current !== market.signal) {
      const isBuy = market.signal.includes('BUY CE');
      const isSell = market.signal.includes('BUY PE');

      if (config.soundEnabled) {
        const soundType = isBuy ? 'buy_ce' : isSell ? 'buy_pe' : 'neutral';
        playLoudBeepBeep(soundType, () => {
          if (config.voiceAlertsEnabled) {
            speakVoiceAlert(market.signal, market.confidenceScore, config.language);
          }
        });
      } else if (config.voiceAlertsEnabled) {
        speakVoiceAlert(market.signal, market.confidenceScore, config.language);
      }

      prevSignalRef.current = market.signal;
    }
  }, [market.signal, market.confidenceScore, config.soundEnabled, config.voiceAlertsEnabled, config.language]);

  // Auto-refresh timer
  useEffect(() => {
    if (!config.autoRefresh || config.refreshInterval <= 0) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, config.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [config.autoRefresh, config.refreshInterval, handleRefresh]);

  const updateConfig = (partial: Partial<AppConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="min-h-screen bg-[#07111f] text-[#eaf2ff] font-sans pb-12 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* App Header */}
      <Header
        config={config}
        onUpdateConfig={updateConfig}
        onManualRefresh={() => handleRefresh(true)}
        isRefreshing={isRefreshing}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTradeLogger={() => setIsTradeLoggerOpen(true)}
        loggedTradesCount={trades.length}
        connectionStatus={connectionStatus}
        lastUpdated={market.lastUpdated}
        isMarketOpen={market.isMarketOpen}
        serverLatencyMs={market.serverLatencyMs}
        onLogout={() => {
          clearOwnerSession();
          setIsAuthenticated(false);
        }}
        onOpenOwnerCodeManager={() => setIsOwnerCodeModalOpen(true)}
        onOpenInstallModal={() => setIsPWAInstallModalOpen(true)}
      />

      {/* Main Wrap Container (matching user's .wrap max-w-[1500px]) */}
      <main className="wrap max-w-[1500px] mx-auto p-3 sm:p-5">
        {/* Metric Cards Grid + Signal Box */}
        <MetricCards market={market} isHindi={config.language === 'hi'} />

        {/* Live Interactive Strategy & TradingView Chart */}
        <TradingViewChart
          market={market}
          isHindi={config.language === 'hi'}
          spotPrice={market.nifty}
          onQuickLogTrade={handleQuickLogTrade}
        />

        {/* Trade Journal & Day Logging System (Local Storage) */}
        <TradeLogBanner
          trades={trades}
          onOpenLogger={() => setIsTradeLoggerOpen(true)}
          isHindi={config.language === 'hi'}
        />

        {/* Option Chain Table & OI Visualizer & Risk Calculator */}
        <OptionChainTable
          options={market.options}
          spotPrice={market.nifty}
          market={market}
          showGreeks={config.showGreeks}
          onToggleGreeks={() => updateConfig({ showGreeks: !config.showGreeks })}
          strikeRange={config.strikeRange}
          onChangeStrikeRange={(range) => updateConfig({ strikeRange: range })}
          onQuickLogTrade={handleQuickLogTrade}
          onOpenTradeLoggerWithData={handleOpenTradeLoggerWithData}
          isHindi={config.language === 'hi'}
        />

        {/* Market Factors Section */}
        <MarketFactors market={market} isHindi={config.language === 'hi'} />

        {/* Informational Note & Status */}
        <InfoNote
          lastUpdated={market.lastUpdated}
          isHindi={config.language === 'hi'}
          onOpenConfig={() => setIsSettingsOpen(true)}
          hasCustomApi={Boolean(config.apiUrl && config.apiUrl.trim())}
        />
      </main>

      {/* Backend API Configuration Modal */}
      <ApiConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiUrl={config.apiUrl}
        onSave={(url) => {
          updateConfig({ apiUrl: url });
          setTimeout(handleRefresh, 100);
        }}
      />

      {/* Trade Logger Modal */}
      <TradeLoggerModal
        isOpen={isTradeLoggerOpen}
        onClose={() => {
          setIsTradeLoggerOpen(false);
          setInitialTradeData(null);
          setTrades(getSavedTrades());
        }}
        market={market}
        initialTradeData={initialTradeData}
        isHindi={config.language === 'hi'}
      />

      {/* Offline Connectivity Status Toast */}
      <OfflineIndicator isHindi={config.language === 'hi'} />

      {/* Mandatory Owner Login & Code Verification Overlay */}
      {!isAuthenticated && (
        <AuthModal
          language={config.language}
          onSuccess={(ownerCode) => {
            setIsAuthenticated(true);
            setConfig((prev) => ({ ...prev, soundEnabled: true, voiceAlertsEnabled: true }));
          }}
        />
      )}

      {/* Owner Code Security Manager Modal (Change/Generate Owner Code) */}
      <OwnerCodeManagerModal
        isOpen={isOwnerCodeModalOpen}
        onClose={() => setIsOwnerCodeModalOpen(false)}
        isHindi={config.language === 'hi'}
        onCodeChanged={(newCode) => {
          setIsOwnerCodeModalOpen(false);
          // Lock terminal so user/client MUST enter new code to re-open
          setIsAuthenticated(false);
        }}
      />

      {/* App Startup Audio & AI Signal Voice Overlay (if needed) */}
      {isAuthenticated && showStartupOverlay && (
        <StartupSoundOverlay
          onComplete={() => {
            setShowStartupOverlay(false);
            setConfig((prev) => ({ ...prev, soundEnabled: true, voiceAlertsEnabled: true }));
          }}
          language={config.language}
          spotPrice={market.nifty}
        />
      )}

      {/* PWA Floating Install Banner (Mobile & Desktop) */}
      <PWAInstallBanner
        isHindi={config.language === 'hi'}
        onOpenGuideModal={() => setIsPWAInstallModalOpen(true)}
      />

      {/* PWA Full Installation & Download Guide Modal */}
      <PWAInstallModal
        isOpen={isPWAInstallModalOpen}
        onClose={() => setIsPWAInstallModalOpen(false)}
        isHindi={config.language === 'hi'}
      />
    </div>
  );
}
