import React from 'react';
import { RefreshCw, Settings, Volume2, VolumeX, Radio, Sparkles, BookOpen, Mic, MicOff, LogOut, ShieldCheck, KeyRound } from 'lucide-react';
import { AppConfig } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { triggerAISignalStartupSequence } from '../utils/marketEngine';

interface HeaderProps {
  config: AppConfig;
  onUpdateConfig: (partial: Partial<AppConfig>) => void;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  onOpenSettings: () => void;
  onOpenTradeLogger: () => void;
  loggedTradesCount?: number;
  connectionStatus: 'simulated' | 'connected' | 'error';
  lastUpdated: string;
  isMarketOpen?: boolean;
  serverLatencyMs?: number;
  onLogout?: () => void;
  onOpenOwnerCodeManager?: () => void;
  onOpenInstallModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onUpdateConfig,
  onManualRefresh,
  isRefreshing,
  onOpenSettings,
  onOpenTradeLogger,
  loggedTradesCount = 0,
  connectionStatus,
  lastUpdated,
  isMarketOpen = false,
  serverLatencyMs = 68,
  onLogout,
  onOpenOwnerCodeManager,
  onOpenInstallModal,
}) => {
  const isHindi = config.language === 'hi';

  return (
    <header
      id="dashboard-header"
      className="bg-[#0b1729] border-b border-[#203452] px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-lg shadow-black/20"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30 flex items-center justify-center text-xl shadow-inner">
          📈
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-400 font-extrabold">
                AI Trading Signal
              </span>
              <span className="hidden md:inline text-xs font-normal text-slate-400">| NIFTY Live Option Terminal</span>
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                  : connectionStatus === 'error'
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-400'
                    : connectionStatus === 'error'
                    ? 'bg-rose-400'
                    : 'bg-amber-400'
                }`}
              />
              {connectionStatus === 'connected'
                ? '⚡ NSE Best Server (Live Stream)'
                : connectionStatus === 'error'
                ? 'API Fallback'
                : 'Demo Live'}
            </span>

            {/* High-Performance Server Latency Pill */}
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border bg-[#0e213b] border-[#1d3d66] text-cyan-300"
              title={isHindi ? 'हाई-परफॉरमेंस नोड सर्वर लेटेंसी' : 'High-Performance server response latency'}
            >
              <span>⚡</span>
              <span>~{serverLatencyMs}ms {isHindi ? 'सर्वर' : 'Server'}</span>
            </span>

            {/* Market Session Status Indicator */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                isMarketOpen
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#14263d] border-[#25436b] text-[#8fa8c7]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isMarketOpen ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
              {isMarketOpen ? (isHindi ? 'मार्केट लाइव' : 'LIVE SESSION') : (isHindi ? 'मार्केट क्लोज्ड (ऑफिशियल भाव)' : 'MARKET CLOSED')}
            </span>
          </div>
          <p className="text-xs text-[#8fa8c7] mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>OI + Technical + GIFT NIFTY + Crude Oil + News</span>
            <span className="text-[#2c4c72]">•</span>
            <span className="text-slate-400">Browser version</span>
            <span className="text-[#2c4c72]">•</span>
            <span className="text-slate-400">
              {isHindi ? 'अंतिम अपडेट:' : 'Updated:'} <span className="text-slate-200 font-mono">{lastUpdated || '--'}</span>
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Expiry Selector */}
        <div className="relative">
          <select
            id="expiry-select"
            value={config.selectedExpiry}
            onChange={(e) => onUpdateConfig({ selectedExpiry: e.target.value })}
            className="bg-[#10233d] text-[#eaf2ff] border border-[#2c4c72] hover:border-[#406899] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition cursor-pointer appearance-none pr-8"
          >
            <option value="Current Expiry">Current Expiry (Weekly)</option>
            <option value="Next Expiry">Next Expiry (Weekly)</option>
            <option value="Monthly Expiry">Monthly Expiry (Last Thu)</option>
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8fa8c7]">
            ▼
          </div>
        </div>

        {/* Refresh Interval Selector */}
        <select
          id="refresh-rate-select"
          value={config.autoRefresh ? config.refreshInterval : 0}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val === 0) {
              onUpdateConfig({ autoRefresh: false });
            } else {
              onUpdateConfig({ autoRefresh: true, refreshInterval: val });
            }
          }}
          className="bg-[#10233d] text-[#eaf2ff] border border-[#2c4c72] hover:border-[#406899] rounded-lg px-2.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition cursor-pointer"
          title="Live Data Stream Rate"
        >
          <option value={1}>⚡ Live: 1s (No Gap)</option>
          <option value={2}>Fast: 2s</option>
          <option value={3}>Auto: 3s</option>
          <option value={5}>Auto: 5s</option>
          <option value={15}>Auto: 15s</option>
          <option value={0}>Auto: Off</option>
        </select>

        {/* AI Signal Voice & Beep Sound Replay / Test Button */}
        <button
          id="replay-ai-signal-btn"
          type="button"
          onClick={() => triggerAISignalStartupSequence(config.language)}
          className="bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-500/50 rounded-lg px-2.5 py-2 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          title={isHindi ? 'बीप-बीप और "AI Signal" वॉयस सुनें' : 'Play Beep-Beep & "AI Signal" Voice'}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <Volume2 size={15} className="text-emerald-400" />
          <span className="hidden sm:inline">AI Signal</span>
          <span className="text-[10px] bg-emerald-900/90 px-1 py-0.5 rounded font-mono font-bold text-amber-300">BEEP</span>
        </button>

        {/* Audio Alert Toggle */}
        <button
          id="toggle-audio-btn"
          type="button"
          onClick={() => onUpdateConfig({ soundEnabled: !config.soundEnabled })}
          className={`p-2 rounded-lg border transition text-xs flex items-center justify-center cursor-pointer ${
            config.soundEnabled
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60 shadow-xs'
              : 'bg-[#10233d] border-[#2c4c72] text-[#8fa8c7] hover:text-white hover:bg-[#173253]'
          }`}
          title={config.soundEnabled ? 'Loud Beep-Beep signal alert active' : 'Signal sound muted'}
        >
          {config.soundEnabled ? <Volume2 size={16} className="text-emerald-400" /> : <VolumeX size={16} />}
        </button>

        {/* Voice Alert Toggle */}
        <button
          id="toggle-voice-btn"
          type="button"
          onClick={() => onUpdateConfig({ voiceAlertsEnabled: !config.voiceAlertsEnabled })}
          className={`p-2 rounded-lg border transition text-xs flex items-center justify-center ${
            config.voiceAlertsEnabled
              ? 'bg-blue-950/50 border-blue-500/40 text-blue-400 hover:bg-blue-900/50'
              : 'bg-[#10233d] border-[#2c4c72] text-[#8fa8c7] hover:text-white hover:bg-[#173253]'
          }`}
          title={
            config.voiceAlertsEnabled
              ? isHindi ? 'वॉयस घोषणा चालू है (Voice Announcements ON)' : 'Voice speech announcements ON'
              : isHindi ? 'वॉयस घोषणा बंद है (Voice Announcements OFF)' : 'Voice speech announcements OFF'
          }
        >
          {config.voiceAlertsEnabled ? <Mic size={16} /> : <MicOff size={16} />}
        </button>

        {/* Language Toggle */}
        <button
          id="toggle-language-btn"
          type="button"
          onClick={() => onUpdateConfig({ language: isHindi ? 'en' : 'hi' })}
          className="bg-[#10233d] text-[#8fa8c7] hover:text-white hover:bg-[#173253] border border-[#2c4c72] rounded-lg px-2.5 py-2 text-xs font-medium transition"
          title="Switch Language"
        >
          {isHindi ? 'EN' : 'हिंदी'}
        </button>

        {/* Owner Code Management Button (Exclusive to verified owner) */}
        {onOpenOwnerCodeManager && (
          <button
            id="owner-code-manager-btn"
            type="button"
            onClick={onOpenOwnerCodeManager}
            className="bg-[#122845] hover:bg-[#1b3b66] text-amber-300 hover:text-amber-200 border border-amber-500/40 rounded-lg px-2.5 py-2 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            title={isHindi ? 'ओनर कोड बदलें / जनरेट करें' : 'Change / Generate Owner Code'}
          >
            <KeyRound size={15} className="text-amber-400" />
            <span className="hidden sm:inline">{isHindi ? 'ओनर कोड' : 'Owner Code'}</span>
          </button>
        )}

        {/* API Settings Button */}
        <button
          id="open-settings-btn"
          type="button"
          onClick={onOpenSettings}
          className="bg-[#10233d] text-[#8fa8c7] hover:text-white hover:bg-[#173253] border border-[#2c4c72] rounded-lg p-2 transition flex items-center gap-1.5 text-xs"
          title="Configure API Endpoint"
        >
          <Settings size={16} />
          <span className="hidden md:inline">API</span>
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton isHindi={isHindi} onOpenModal={onOpenInstallModal} />

        {/* Log Trade Button (Exact requested feature) */}
        <button
          id="log-trade-header-btn"
          type="button"
          onClick={onOpenTradeLogger}
          className="bg-[#122a47] hover:bg-[#1a3c63] text-emerald-300 hover:text-white border border-emerald-500/40 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          title="Log Trade to Local Storage"
        >
          <BookOpen size={15} />
          <span>{isHindi ? 'ट्रेड लॉग' : 'Log Trade'}</span>
          {loggedTradesCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/30">
              {loggedTradesCount}
            </span>
          )}
        </button>

        {/* Update Button (Exact requested trigger) */}
        <button
          id="manual-refresh-btn"
          type="button"
          onClick={onManualRefresh}
          disabled={isRefreshing}
          className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-medium border border-emerald-400/40 rounded-lg px-3.5 py-2 text-xs sm:text-sm flex items-center gap-2 transition shadow-sm shadow-emerald-950 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isHindi ? 'अपडेट' : 'Update'}</span>
        </button>

        {/* Owner Logout / Lock Button */}
        {onLogout && (
          <button
            id="owner-lock-btn"
            type="button"
            onClick={onLogout}
            className="p-2 rounded-lg bg-[#142339] hover:bg-rose-950/70 border border-[#233f66] hover:border-rose-500/50 text-[#8fa8c7] hover:text-rose-300 transition cursor-pointer"
            title={isHindi ? 'टर्मिनल लॉक करें (ओनर लॉगआउट)' : 'Lock Terminal (Owner Logout)'}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  );
};
