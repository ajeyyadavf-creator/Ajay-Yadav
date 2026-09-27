import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { triggerAISignalStartupSequence } from '../utils/marketEngine';

interface StartupSoundOverlayProps {
  onComplete: () => void;
  language: 'hi' | 'en';
  spotPrice?: number;
}

export const StartupSoundOverlay: React.FC<StartupSoundOverlayProps> = ({
  onComplete,
  language = 'hi',
}) => {
  const [hasStarted, setHasStarted] = useState(false);

  const handleStart = () => {
    if (hasStarted) return;
    setHasStarted(true);

    // Play dual high-tech beep-beep and announce "AI Signal"
    triggerAISignalStartupSequence(language);

    setTimeout(() => {
      onComplete();
    }, 700);
  };

  // Allow pressing Enter or Space to enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      id="startup-sound-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050b14]/95 backdrop-blur-md p-4 transition-all duration-300"
      onClick={handleStart}
    >
      <div
        className="w-full max-w-sm bg-gradient-to-b from-[#0c1a2e] to-[#07111f] border border-[#1e3a61] rounded-3xl p-8 shadow-2xl shadow-cyan-950/50 text-center relative overflow-hidden cursor-pointer group"
        onClick={handleStart}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Minimal Glowing Icon */}
        <div className="relative mx-auto w-16 h-16 mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-ping opacity-60" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60 z-10 group-hover:scale-105 transition-transform">
            <Zap size={30} className="text-amber-300 fill-amber-300" />
          </div>
        </div>

        {/* Clean, Prominent AI Trading Signal Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-400 tracking-wider uppercase drop-shadow-sm">
          AI TRADING SIGNAL
        </h1>

        {/* Minimal Start Button */}
        <button
          type="button"
          onClick={handleStart}
          className="mt-6 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-base shadow-lg shadow-emerald-950/60 transition-all transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>START</span>
        </button>
      </div>
    </div>
  );
};
