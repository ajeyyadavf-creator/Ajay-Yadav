import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Monitor,
  X,
  ExternalLink,
  Sparkles,
  FileDown,
  Info,
  Check,
  Apple,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHindi?: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isHindi = true,
}) => {
  const {
    isInstallable,
    install,
    openInNewTab,
    downloadDesktopShortcut,
    appUrl,
  } = usePWAInstall();

  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop'>('mobile');
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    try {
      navigator.clipboard.writeText(appUrl || window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div
      id="pwa-install-guide-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in"
    >
      <div className="bg-[#0b1729] border border-[#233d61] rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <Download size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{isHindi ? 'NIFTY Trading App इंस्टॉल करें' : 'Install NIFTY Trading App'}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                  PWA
                </span>
              </h3>
              <p className="text-xs text-[#8fa8c7] mt-0.5">
                {isHindi
                  ? 'फोन की होम स्क्रीन या कंप्यूटर डेस्कटॉप पर असली ऐप की तरह डाउनलोड करें'
                  : 'Install directly to your phone home screen or desktop with offline support'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#142943] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Direct 1-Click Action Card if native prompt ready */}
        {isInstallable && (
          <div className="bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/40 rounded-xl p-3.5 text-center space-y-2.5">
            <p className="text-xs text-blue-200 font-medium">
              {isHindi
                ? '🎉 आपका डिवाइस तुरंत 1-क्लिक इंस्टॉलेशन के लिए तैयार है:'
                : '🎉 Your device is ready for direct 1-click installation:'}
            </p>
            <button
              type="button"
              onClick={async () => {
                await install();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-950 cursor-pointer active:scale-98 transition"
            >
              <Download size={16} />
              <span>{isHindi ? 'सीधे डिवाइस में इंस्टॉल करें' : 'Install to Device Now'}</span>
            </button>
          </div>
        )}

        {/* Quick Actions (Open in Tab & Download Shortcut) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Button 1: Open in Native Browser Tab */}
          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onClose()}
            className="p-3 rounded-xl bg-[#0f2440] hover:bg-[#16355d] border border-[#234570] text-left transition flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <ExternalLink size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span>{isHindi ? 'फुल ब्राउज़र में खोलें' : 'Open in Full Tab'}</span>
              </div>
              <div className="text-[11px] text-[#8fa8c7]">
                {isHindi ? '1-क्लिक इंस्टॉल बैनर पाने हेतु' : 'To trigger direct browser install'}
              </div>
            </div>
          </a>

          {/* Button 2: Download Desktop Shortcut */}
          <button
            type="button"
            onClick={downloadDesktopShortcut}
            className="p-3 rounded-xl bg-[#0f2440] hover:bg-[#16355d] border border-[#234570] text-left transition flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <FileDown size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span>{isHindi ? 'डेस्कटॉप शॉर्टकट डाउनलोड' : 'Download Desktop File'}</span>
              </div>
              <div className="text-[11px] text-[#8fa8c7]">
                {isHindi ? '.URL फ़ाइल (PC/लैपटॉप के लिए)' : '.URL desktop launcher file'}
              </div>
            </div>
          </button>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex border-b border-[#1b3457] pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('mobile')}
            className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'mobile'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-[#8fa8c7] hover:text-white'
            }`}
          >
            <Smartphone size={14} />
            <span>{isHindi ? '📱 मोबाइल (Android & iPhone)' : '📱 Mobile (Android & iOS)'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'desktop'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-[#8fa8c7] hover:text-white'
            }`}
          >
            <Monitor size={14} />
            <span>{isHindi ? '💻 कंप्यूटर / लैपटॉप (PC & Mac)' : '💻 Desktop / PC / Mac'}</span>
          </button>
        </div>

        {/* Tab 1: Mobile Guide */}
        {activeTab === 'mobile' && (
          <div className="space-y-2.5 text-xs">
            {/* Android Steps */}
            <div className="bg-[#0c1a2d] border border-[#1b3659] rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <Smartphone size={14} />
                <span>{isHindi ? 'Android Phone (Google Chrome / Samsung Browser):' : 'Android (Chrome / Samsung):'}</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1 leading-relaxed text-[11.5px]">
                <li>
                  {isHindi ? 'ब्राउज़र में ऊपर दाईं तरफ ' : 'Tap the '}
                  <b className="text-white">⋮ (3 Dots)</b>
                  {isHindi ? ' मेन्यू पर क्लिक करें।' : ' menu at top right.'}
                </li>
                <li>
                  <b className="text-emerald-300">
                    {isHindi ? "'ऐप इंस्टॉल करें' या 'होम स्क्रीन पर जोड़ें' (Install app / Add to Home screen)" : "'Install app' or 'Add to Home screen'"}
                  </b>
                  {isHindi ? ' को चुनें।' : '.'}
                </li>
                <li>
                  {isHindi
                    ? 'ऐप आपके फोन की होम स्क्रीन पर असली ऐप की तरह डाउनलोड हो जाएगी (बिना प्ले स्टोर के)।'
                    : 'The app is downloaded as an app icon on your home screen.'}
                </li>
              </ol>
            </div>

            {/* iPhone / iPad Steps */}
            <div className="bg-[#0c1a2d] border border-[#1b3659] rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-cyan-400">
                <Apple size={14} />
                <span>{isHindi ? 'iPhone / iPad (Safari Browser):' : 'iPhone / iPad (Safari):'}</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1 leading-relaxed text-[11.5px]">
                <li>
                  {isHindi ? 'सफारी के नीचे ' : 'Tap the '}
                  <b className="text-white">Share (शेयर आइकन ⎋)</b>
                  {isHindi ? ' बटन पर टैप करें।' : ' button at the bottom.'}
                </li>
                <li>
                  {isHindi ? 'नीचे स्क्रॉल करके ' : 'Scroll down and tap '}
                  <b className="text-cyan-300">
                    {isHindi ? "'होम स्क्रीन में जोड़ें' (Add to Home Screen ⊞)" : "'Add to Home Screen'"}
                  </b>
                  {isHindi ? ' चुनें।' : '.'}
                </li>
                <li>
                  {isHindi ? "ऊपर 'जोड़ें' (Add) दबाएं। आपके iPhone में ऐप सेव हो जाएगी।" : "Tap 'Add' at top right. Done!"}
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: Desktop Guide */}
        {activeTab === 'desktop' && (
          <div className="space-y-2.5 text-xs">
            <div className="bg-[#0c1a2d] border border-[#1b3659] rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-indigo-400">
                <Monitor size={14} />
                <span>{isHindi ? 'Windows PC / लैपटॉप (Chrome या Edge):' : 'Windows PC / Laptop (Chrome / Edge):'}</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1 leading-relaxed text-[11.5px]">
                <li>
                  {isHindi
                    ? 'ब्राउज़र के एड्रेस बार (URL) के बिल्कुल दाईं तरफ देखें, वहाँ '
                    : 'Look at the far right of your address bar (URL) for the '}
                  <b className="text-white">🖥️ {isHindi ? 'इंस्टॉल आइकन' : 'Install Icon'}</b>
                  {isHindi ? ' दिखेगा।' : '.'}
                </li>
                <li>
                  <b className="text-indigo-300">
                    {isHindi ? "'NIFTY Option इंस्टॉल करें' पर क्लिक करें।" : "Click 'Install NIFTY Option'."}
                  </b>
                </li>
                <li>
                  {isHindi
                    ? 'डेस्कटॉप पर शॉर्टकट बन जाएगा और यह फुल-स्क्रीन अलग विंडो में चलेगी।'
                    : 'A standalone desktop window and taskbar shortcut will be created.'}
                </li>
              </ol>
            </div>

            <div className="bg-[#0c1a2d] border border-[#1b3659] rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">
                  {isHindi ? 'त्वरित डेस्कटॉप फ़ाइल डाउनलोड:' : 'Direct desktop launcher download:'}
                </span>
                <button
                  type="button"
                  onClick={downloadDesktopShortcut}
                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition"
                >
                  <FileDown size={13} />
                  <span>{isHindi ? 'डाउनलोड करें' : 'Download .URL'}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#8fa8c7]">
                {isHindi
                  ? 'डाउनलोड की गई फ़ाइल को अपने डेस्कटॉप पर रखें और डबल-क्लिक करके सीधे ऐप खोलें।'
                  : 'Save the .URL file to your desktop to launch the trading dashboard anytime.'}
              </p>
            </div>
          </div>
        )}

        {/* App URL Copy Link & Standalone Benefits */}
        <div className="bg-[#0a1524] border border-[#162a42] rounded-xl p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] text-[#8fa8c7] flex items-center gap-1">
              <Info size={12} className="text-blue-400" />
              <span>{isHindi ? 'ऐप लिंक कॉपी करें:' : 'Direct App URL:'}</span>
            </span>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="px-2.5 py-1 rounded-lg bg-[#142943] hover:bg-[#1b375b] text-slate-200 text-xs font-mono flex items-center gap-1 cursor-pointer transition"
            >
              {copiedUrl ? <Check size={12} className="text-emerald-400" /> : null}
              <span>{copiedUrl ? (isHindi ? 'कॉपी हो गया!' : 'Copied!') : (isHindi ? 'कॉपी लिंक' : 'Copy Link')}</span>
            </button>
          </div>

          <div className="text-[11px] text-[#8fa8c7] flex items-center gap-3 pt-1 border-t border-[#162a42]">
            <span className="flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400" />
              <span>0 MB Storage</span>
            </span>
            <span>•</span>
            <span>Offline Trade Journal</span>
            <span>•</span>
            <span>Auto-Updating Quotes</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-[#1d3554]">
          <span className="text-[11px] text-[#8fa8c7]">
            PWA Standalone Web App
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#142943] hover:bg-[#1b375b] text-slate-200 text-xs font-medium transition cursor-pointer"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
