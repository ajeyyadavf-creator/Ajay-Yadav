import React, { useState } from 'react';
import {
  ShieldAlert,
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  X,
  Lock,
  Sparkles,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import {
  getActiveOwnerCode,
  updateActiveOwnerCode,
  generateRandomOwnerCode,
} from '../utils/ownerSecurity';

interface OwnerCodeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCodeChanged: (newCode: string) => void;
  isHindi?: boolean;
}

export const OwnerCodeManagerModal: React.FC<OwnerCodeManagerModalProps> = ({
  isOpen,
  onClose,
  onCodeChanged,
  isHindi = false,
}) => {
  const currentActiveCode = getActiveOwnerCode();
  const [newCode, setNewCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGenerateRandom = () => {
    const generated = generateRandomOwnerCode();
    setNewCode(generated);
    setErrorMsg('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNewCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const formatted = newCode.trim().toUpperCase();
    if (!formatted || formatted.length < 4) {
      setErrorMsg(
        isHindi
          ? 'कोड कम से कम 4 अक्षरों या अंकों का होना चाहिए!'
          : 'New code must be at least 4 characters long!'
      );
      return;
    }

    if (formatted === currentActiveCode) {
      setErrorMsg(
        isHindi
          ? 'नया कोड पुराने कोड से भिन्न होना चाहिए!'
          : 'New code must be different from current code!'
      );
      return;
    }

    const ok = updateActiveOwnerCode(formatted);
    if (ok) {
      setSuccessMsg(
        isHindi
          ? `ओनर कोड सफलतापूर्वक बदल दिया गया: ${formatted}। ऐप तुरंत लॉक हो जाएगा और नए कोड से ही खुलेगा!`
          : `Owner code updated successfully to: ${formatted}. Terminal locked; must enter new code to unlock!`
      );
      setTimeout(() => {
        onCodeChanged(formatted);
      }, 1500);
    } else {
      setErrorMsg('Failed to update owner code. Storage error.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-b from-[#0e1d33] to-[#081220] border border-[#21436e] rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1b3658]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <KeyRound size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>{isHindi ? 'ओनर कोड सुरक्षा पैनल' : 'Owner Code Security Manager'}</span>
              </h2>
              <p className="text-[11px] text-[#8fa8c7]">
                {isHindi ? 'केवल अधिकृत ओनर के लिए कोड जनरेट व बदलने की सुविधा' : 'Generate & Change Owner Access Code'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#142640] hover:bg-[#1d3558] text-[#8fa8c7] hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Active Code Display */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#071322] border border-[#183457] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#8fa8c7] tracking-wider">
              {isHindi ? 'वर्तमान सक्रिय ओनर कोड' : 'CURRENT ACTIVE OWNER CODE'}
            </div>
            <div className="text-xl font-mono font-extrabold text-amber-400 tracking-wider mt-0.5">
              {currentActiveCode}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(currentActiveCode)}
            className="px-2.5 py-1.5 rounded-lg bg-[#112745] hover:bg-[#193a66] border border-[#234875] text-xs font-mono text-cyan-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
            title="Copy current code"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? (isHindi ? 'कॉपी हुआ' : 'Copied') : (isHindi ? 'कॉपी' : 'Copy')}</span>
          </button>
        </div>

        {/* Notice */}
        <div className="mt-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-200">
          <AlertTriangle size={15} className="shrink-0 text-amber-400 mt-0.5" />
          <span>
            {isHindi
              ? 'चेतावनी: कोड बदलने पर पुराना कोड बंद हो जाएगा। नया कोड दर्ज करने पर ही ऐप खुलेगा, नहीं तो ऐप लॉक रहेगा।'
              : 'Notice: Once changed, the old code is revoked. The app will immediately lock and only unlock with the new code.'}
          </span>
        </div>

        {/* Form to set new code or generate */}
        <form onSubmit={handleSaveNewCode} className="mt-4 space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles size={13} className="text-emerald-400" />
                <span>{isHindi ? 'नया ओनर कोड दर्ज करें या जनरेट करें' : 'Enter or Generate New Code'}</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateRandom}
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer underline"
              >
                <RefreshCw size={11} />
                <span>{isHindi ? 'ऑटो जनरेट कोड' : 'Auto Generate'}</span>
              </button>
            </div>
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              placeholder={isHindi ? 'उदा. MASTER888 या AI-789' : 'e.g. MASTER888 or AI-999'}
              className="w-full bg-[#081524] border-2 border-[#1f3f69] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-center tracking-widest text-emerald-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 uppercase transition"
            />
          </div>

          {errorMsg && (
            <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs">
              {successMsg}
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 px-3 rounded-xl bg-[#122339] hover:bg-[#1a3352] text-xs font-semibold text-slate-300 transition cursor-pointer"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-md shadow-emerald-950/60 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound size={15} />
              <span>{isHindi ? 'नया कोड सेव करें एवं लॉक करें' : 'Save New Code & Lock'}</span>
            </button>
          </div>
        </form>

        {/* Permanent Developer Emergency Note */}
        <div className="mt-4 pt-3 border-t border-[#162e4c] text-[10px] text-[#8fa8c7] flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Lock size={11} className="text-teal-400" />
            <span>Developer Master Protection Active</span>
          </div>
          <span className="font-mono text-slate-500">DEV9999AI ALWAYS ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
