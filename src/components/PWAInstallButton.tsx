import React, { useState } from 'react';
import { Download, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  isHindi?: boolean;
  onOpenModal?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ isHindi = false, onOpenModal }) => {
  const {
    isInstallable,
    isInstalled,
    install,
  } = usePWAInstall();

  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already installed and running in standalone native mode
  if (isInstalled) {
    return (
      <span
        id="pwa-installed-badge"
        className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium shadow-xs"
        title={isHindi ? 'ऐप सफलतापूर्वक इंस्टॉल है (Standalone Mode)' : 'App running as installed standalone PWA'}
      >
        <CheckCircle size={14} className="text-emerald-400" />
        <span>{isHindi ? 'ऐप इंस्टॉल्ड है' : 'App Installed'}</span>
      </span>
    );
  }

  const handleClick = async () => {
    if (onOpenModal) {
      onOpenModal();
      return;
    }
    // If browser already prepared the native install prompt
    if (isInstallable) {
      const outcome = await install();
      if (outcome) return;
    }
    // Otherwise open the interactive 1-click install & download modal
    setShowGuideModal(true);
  };

  return (
    <>
      {/* Header Install Button */}
      <button
        id="pwa-install-header-btn"
        type="button"
        onClick={handleClick}
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-lg px-3 py-2 text-xs sm:text-sm flex items-center gap-1.5 transition shadow-sm shadow-indigo-950/60 cursor-pointer active:scale-95 animate-in fade-in ring-1 ring-blue-400/30"
        title={isHindi ? 'फोन या कंप्यूटर पर ऐप डाउनलोड / इंस्टॉल करें' : 'Download / Install app on Phone or Desktop'}
      >
        <Download size={14} className="text-blue-200 animate-pulse" />
        <span>{isHindi ? 'ऐप डाउनलोड करें' : 'Download App'}</span>
      </button>

      {/* Comprehensive Install & Download Dialog */}
      <PWAInstallModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        isHindi={isHindi}
      />
    </>
  );
};
