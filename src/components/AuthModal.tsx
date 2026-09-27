import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, UserCheck, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { triggerAISignalStartupSequence } from '../utils/marketEngine';
import {
  verifyOwnerCode,
  saveOwnerSession,
  getActiveOwnerCode,
} from '../utils/ownerSecurity';

interface AuthModalProps {
  onSuccess: (ownerCode: string, isDeveloper: boolean) => void;
  language?: 'hi' | 'en';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onSuccess,
  language = 'hi',
}) => {
  const [ownerCode, setOwnerCode] = useState('');
  const [traderName, setTraderName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const isHindi = language === 'hi';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCode = ownerCode.trim().toUpperCase();
    const cleanName = traderName.trim();

    if (!cleanCode) {
      setErrorMsg(isHindi ? 'कृपया ओनर कोड दर्ज करें।' : 'Please enter the Owner Code.');
      return;
    }

    // Verify against developer permanent code and active owner code
    const verification = verifyOwnerCode(cleanCode);

    if (!verification.isValid) {
      setErrorMsg(
        isHindi
          ? 'गलत ओनर कोड! केवल अधिकृत ओनर कोड ही मान्य है। यदि कोड बदला गया है, तो नया कोड ही दर्ज करें।'
          : 'Invalid Code! Only authorized owner code works. If changed recently, enter the new code.'
      );
      return;
    }

    setIsAuthorizing(true);

    // Play Beep-Beep & Voice on verified login
    triggerAISignalStartupSequence(language);

    if (rememberMe) {
      saveOwnerSession(cleanCode, verification.isDeveloper, cleanName);
    }

    setTimeout(() => {
      setIsAuthorizing(false);
      onSuccess(cleanCode, verification.isDeveloper);
    }, 750);
  };

  return (
    <div
      id="owner-login-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#040914]/95 backdrop-blur-md p-4 transition-all duration-300"
    >
      <div className="w-full max-w-md bg-gradient-to-b from-[#0c1b30] to-[#07111e] border border-[#1e3c63] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 relative overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Security Badge Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/70 mb-4">
          <ShieldCheck size={32} className="text-white drop-shadow-sm" />
        </div>

        {/* App Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-300 tracking-wider uppercase">
            AI TRADING SIGNAL
          </h1>
          <p className="text-xs text-[#8fa8c7] mt-1">
            {isHindi
              ? 'टर्मिनल एक्सेस केवल अधिकृत ओनर कोड द्वारा ही संभव है'
              : 'Security Verification & Owner Access Code'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Trader Name / ID (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <UserCheck size={14} className="text-teal-400" />
              <span>{isHindi ? 'ट्रेडर नाम / आईडी (वैकल्पिक)' : 'Trader Name / ID (Optional)'}</span>
            </label>
            <input
              type="text"
              value={traderName}
              onChange={(e) => setTraderName(e.target.value)}
              placeholder="e.g. Master Trader"
              className="w-full bg-[#081524] border border-[#1b3658] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition font-mono"
            />
          </div>

          {/* Owner Code Input (Mandatory) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <KeyRound size={14} className="text-amber-400" />
                <span>{isHindi ? 'ओनर कोड (OWNER CODE) *' : 'OWNER CODE *'}</span>
              </label>
              <span className="text-[10px] font-mono text-amber-300/80 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-500/30">
                Authorized Only
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={ownerCode}
                onChange={(e) => {
                  setOwnerCode(e.target.value.toUpperCase());
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter Owner Code"
                className="w-full bg-[#081524] border-2 border-emerald-500/40 focus:border-emerald-400 rounded-xl px-3.5 py-3 text-base text-center font-mono font-bold tracking-widest text-emerald-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 uppercase transition shadow-inner"
              />
              <div className="absolute right-3 top-3.5 text-slate-500">
                <Lock size={16} />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-center gap-2 text-rose-300 text-xs animate-shake">
              <AlertCircle size={15} className="shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Device Remember */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#26446c] text-emerald-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-[11px] text-slate-300">
                {isHindi ? 'यह डिवाइस याद रखें' : 'Remember Device'}
              </span>
            </label>
            <span className="text-[10px] font-mono text-slate-400">
              {isHindi ? 'कोड बदलने पर नया कोड अनिवार्य' : 'New code required if changed'}
            </span>
          </div>

          {/* Login / Start Button */}
          <button
            type="submit"
            disabled={isAuthorizing}
            className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-950/70 transition-all transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isAuthorizing ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>{isHindi ? 'ओनर कोड वेरिफाई हो रहा है...' : 'Verifying Owner Access...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>{isHindi ? 'वेरिफाई करें एवं स्टार्ट करें' : 'VERIFY & START TERMINAL'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Security Note */}
        <div className="mt-5 pt-3 border-t border-[#162d49] text-center text-[11px] text-[#8fa8c7] flex items-center justify-center gap-1.5">
          <Lock size={12} className="text-emerald-400" />
          <span>
            {isHindi
              ? 'सुरक्षित टर्मिनल • डेवलपर व ओनर कोड द्वारा ही अनलॉक होगा'
              : 'Secured Terminal • Only Developer & Owner Codes Authorize Access'}
          </span>
        </div>
      </div>
    </div>
  );
};
