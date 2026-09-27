import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  ExternalLink,
  X,
  CheckCircle2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  isHindi?: boolean;
  onOpenGuideModal?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  isHindi = true,
  onOpenGuideModal,
}) => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    isInIframe,
    appUrl,
    install,
    openInNewTab,
  } = usePWAInstall();

  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('pwa_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running inside installed standalone PWA app, or user dismissed for this session
  if (isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('pwa_banner_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => setDismissed(true), 3000);
        return;
      }
    }
    // If native prompt cannot be shown directly (e.g. iOS or iframe), trigger guide modal
    if (onOpenGuideModal) {
      onOpenGuideModal();
    }
  };

  if (installSuccess) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 bg-[#07192f]/95 border border-emerald-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-3 text-emerald-300">
          <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-sm text-white">
              {isHindi ? '🎉 ऐप सफलतापूर्वक इंस्टॉल हो गया!' : '🎉 App Successfully Installed!'}
            </div>
            <div className="text-xs text-emerald-200/80 mt-0.5">
              {isHindi
                ? 'अब आप इसे फोन की होम स्क्रीन या ऐप ड्रॉअर से सीधे खोल सकते हैं।'
                : 'You can now launch it directly from your home screen or app drawer.'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="pwa-floating-install-banner"
      className="fixed bottom-4 left-3 right-3 md:left-6 md:right-auto md:max-w-md z-45 bg-gradient-to-r from-[#09182d]/95 via-[#0d223f]/95 to-[#0b1b33]/95 border border-blue-500/50 rounded-2xl p-3.5 sm:p-4 shadow-2xl shadow-black/60 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-3">
          {/* App Logo */}
          <div className="relative shrink-0 mt-0.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400/40 flex items-center justify-center text-xl shadow-lg shadow-blue-900/40">
              📈
            </div>
            <span className="absolute -bottom-1 -right-1 px-1 rounded bg-emerald-500 text-[9px] font-extrabold text-black font-mono leading-none py-0.5 shadow-xs">
              PWA
            </span>
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <span>{isHindi ? 'NIFTY Live Trading ऐप' : 'NIFTY Live Trading App'}</span>
                <Sparkles size={13} className="text-amber-400 animate-pulse" />
              </h4>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] text-blue-300 font-mono">
                {isAndroid ? 'Android' : isIOS ? 'iOS Safari' : 'PC & Mobile'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-snug">
              {isHindi
                ? 'फोन की होम स्क्रीन पर असली ऐप की तरह इंस्टॉल करें (0 MB, सुपरफास्ट, फुल-स्क्रीन मोड)।'
                : 'Install as a standalone app on your device (Zero install size, fast, standalone mode).'}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer shrink-0"
          title={isHindi ? 'बंद करें' : 'Dismiss'}
        >
          <X size={16} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex items-center gap-2 pt-2 border-t border-blue-900/40">
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-950/80 transition cursor-pointer"
        >
          <Download size={14} className="animate-bounce" />
          <span>{isHindi ? '📲 अभी इंस्टॉल करें' : '📲 Install App Now'}</span>
        </button>

        {/* In iframe or when helpful, offer Open in Tab */}
        {isInIframe ? (
          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#122642] hover:bg-[#1a385f] text-cyan-300 border border-cyan-500/40 text-xs font-semibold py-2 px-2.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
            title={isHindi ? 'अलग ब्राउज़र विंडो में खोलें' : 'Open in new tab to install directly'}
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">{isHindi ? 'फुल टैब' : 'Full Tab'}</span>
          </a>
        ) : null}

        {onOpenGuideModal && (
          <button
            type="button"
            onClick={onOpenGuideModal}
            className="bg-[#10233b] hover:bg-[#163357] text-slate-300 hover:text-white border border-[#224068] text-xs font-semibold py-2 px-2.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
            title={isHindi ? 'इंस्टॉल करने का तरीका देखें' : 'View Install Guide'}
          >
            <HelpCircle size={13} className="text-amber-400" />
            <span>{isHindi ? 'गाइड' : 'Guide'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
