import React from 'react';
import { AlertCircle, Terminal, CheckCircle } from 'lucide-react';

interface InfoNoteProps {
  lastUpdated: string;
  isHindi: boolean;
  onOpenConfig: () => void;
  hasCustomApi: boolean;
}

export const InfoNote: React.FC<InfoNoteProps> = ({
  lastUpdated,
  isHindi,
  onOpenConfig,
  hasCustomApi,
}) => {
  return (
    <div className="mt-4">
      {/* Note Box matching exact styling and message */}
      <div
        id="dashboard-note"
        className="note p-3 sm:p-4 rounded-xl border-l-4 border-[#ffd166] bg-[#101e31] border-y border-r border-[#1d3554] text-[#b8c9df] text-xs sm:text-[13px] leading-relaxed shadow-sm"
      >
        <div className="flex items-start gap-2.5">
          <AlertCircle size={17} className="text-[#ffd166] shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            {isHindi ? (
              <div>
                <b className="text-[#21d19b] font-semibold">Live connection:</b> Backend API
                सफलतापूर्वक कनेक्ट हो चुका है (<span className="font-mono text-emerald-300">/api/market</span>)। NIFTY 50 स्पॉट, GIFT NIFTY, ब्रेंट क्रूड ऑयल और ऑप्शन चेन लाइव अपडेट हो रहे हैं। आप चाहें तो अपना ब्रोकर API (Zerodha Kite, Angel One, Upstox) भी कनेक्ट कर सकते हैं।
              </div>
            ) : (
              <div>
                <b className="text-[#21d19b] font-semibold">Live connection:</b> Backend API is active and connected (<span className="font-mono text-emerald-300">/api/market</span>). Live quotes for NIFTY 50 spot, GIFT NIFTY, Brent Crude, and Option Chain open interest are streaming in real-time. You can also connect your broker API (Zerodha, Angel One, Upstox) at any time.
              </div>
            )}

            <div className="pt-1 flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={onOpenConfig}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#193356] hover:bg-[#204373] text-white text-xs font-medium border border-[#2b5182] transition cursor-pointer"
              >
                <Terminal size={12} />
                <span>{hasCustomApi ? 'API Settings & Endpoint' : 'Configure Custom API'}</span>
              </button>
              {hasCustomApi && (
                <span className="text-[11px] text-[#21d19b] flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                  <CheckCircle size={12} /> Connected: /api/market
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status timestamp */}
      <div
        id="dashboard-status"
        className="status flex items-center justify-between text-xs text-[#9db5d4] mt-2.5 px-1"
      >
        <div className="flex items-center">
          <span className="dot inline-block w-2 h-2 rounded-full bg-[#ffd166] animate-pulse mr-2" />
          <span>Last update:&nbsp;</span>
          <span id="time" className="font-mono text-white">
            {lastUpdated || '--'}
          </span>
        </div>
        <div className="text-[11px] text-[#8fa8c7] hidden sm:block">
          Auto-cycle active • Market Session: Regular (IST)
        </div>
      </div>
    </div>
  );
};
