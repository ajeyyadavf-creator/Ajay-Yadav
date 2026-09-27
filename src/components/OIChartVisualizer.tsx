import React, { useState } from 'react';
import { OptionStrike } from '../types';
import { BarChart3, Shield, Flame, Target, ArrowUp, ArrowDown, Info } from 'lucide-react';

interface OIChartVisualizerProps {
  options: OptionStrike[];
  spotPrice: number;
  maxPain: number;
  pcr: number;
  isHindi?: boolean;
}

export const OIChartVisualizer: React.FC<OIChartVisualizerProps> = ({
  options,
  spotPrice,
  maxPain,
  pcr,
  isHindi = false,
}) => {
  const [viewMode, setViewMode] = useState<'totalOI' | 'oiChange'>('totalOI');

  // Max value to scale bars
  const maxCallOI = Math.max(...options.map((o) => (viewMode === 'totalOI' ? o.callOI : Math.abs(o.callOIChange))), 1);
  const maxPutOI = Math.max(...options.map((o) => (viewMode === 'totalOI' ? o.putOI : Math.abs(o.putOIChange))), 1);
  const maxScale = Math.max(maxCallOI, maxPutOI);

  // Highest Call OI (Major Resistance) and Highest Put OI (Major Support)
  const maxCallItem = options.reduce((prev, curr) => (curr.callOI > prev.callOI ? curr : prev), options[0]);
  const maxPutItem = options.reduce((prev, curr) => (curr.putOI > prev.putOI ? curr : prev), options[0]);

  // Totals
  const totalCallOI = options.reduce((acc, curr) => acc + curr.callOI, 0);
  const totalPutOI = options.reduce((acc, curr) => acc + curr.putOI, 0);
  const totalCallChange = options.reduce((acc, curr) => acc + curr.callOIChange, 0);
  const totalPutChange = options.reduce((acc, curr) => acc + curr.putOIChange, 0);

  const formatLakhs = (val: number) => {
    const inLakhs = Math.abs(val) / 100000;
    return `${val < 0 ? '-' : ''}${inLakhs.toFixed(1)}L`;
  };

  return (
    <div id="oi-chart-visualizer" className="bg-[#0c1a2d] border border-[#1d3554] rounded-xl p-4 my-4 shadow-md">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1b3454]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <BarChart3 size={17} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{isHindi ? 'ओपन इंटरेस्ट (OI) विजुअलाइज़र व लेवल्स' : 'Open Interest (OI) & Support-Resistance Spectrum'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#13263e] text-slate-300 border border-[#213d62]">
                SPOT: {spotPrice.toFixed(0)}
              </span>
            </h3>
            <p className="text-xs text-[#8fa8c7]">
              {isHindi
                ? 'कॉल राइटर्स (प्रतिरोध) बनाम पुट राइटर्स (सपोर्ट) की स्थिति'
                : 'Live institutional positioning: Call Writers (Resistance) vs Put Writers (Support)'}
            </p>
          </div>
        </div>

        {/* View Toggle Mode */}
        <div className="flex items-center gap-1.5 bg-[#10233d] border border-[#224065] rounded-lg p-1 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('totalOI')}
            className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
              viewMode === 'totalOI'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-[#8fa8c7] hover:text-white'
            }`}
          >
            {isHindi ? 'कुल OI' : 'Total OI'}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('oiChange')}
            className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
              viewMode === 'oiChange'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-[#8fa8c7] hover:text-white'
            }`}
          >
            {isHindi ? 'आज का OI बदलाव' : 'Today OI Change'}
          </button>
        </div>
      </div>

      {/* Institutional Key Levels Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5">
        {/* Support */}
        <div className="bg-[#0b172a] border border-[#163354] rounded-lg p-2.5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Shield size={14} />
          </div>
          <div>
            <div className="text-[10px] uppercase text-[#8fa8c7] font-medium">
              {isHindi ? 'मुख्य सपोर्ट (Put OI)' : 'Major Support'}
            </div>
            <div className="text-sm font-bold font-mono text-emerald-400">
              {maxPutItem?.strike || '-'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {formatLakhs(maxPutItem?.putOI || 0)} OI
            </div>
          </div>
        </div>

        {/* Resistance */}
        <div className="bg-[#0b172a] border border-[#163354] rounded-lg p-2.5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <Flame size={14} />
          </div>
          <div>
            <div className="text-[10px] uppercase text-[#8fa8c7] font-medium">
              {isHindi ? 'मुख्य रेजिस्टेंस (Call OI)' : 'Major Resistance'}
            </div>
            <div className="text-sm font-bold font-mono text-rose-400">
              {maxCallItem?.strike || '-'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {formatLakhs(maxCallItem?.callOI || 0)} OI
            </div>
          </div>
        </div>

        {/* Max Pain */}
        <div className="bg-[#0b172a] border border-[#163354] rounded-lg p-2.5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Target size={14} />
          </div>
          <div>
            <div className="text-[10px] uppercase text-[#8fa8c7] font-medium">
              {isHindi ? 'मैक्स पेन स्ट्राइक' : 'Max Pain Level'}
            </div>
            <div className="text-sm font-bold font-mono text-amber-400">
              {maxPain}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {maxPain - Math.round(spotPrice) >= 0 ? '+' : ''}{maxPain - Math.round(spotPrice)} pts vs Spot
            </div>
          </div>
        </div>

        {/* PCR */}
        <div className="bg-[#0b172a] border border-[#163354] rounded-lg p-2.5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Info size={14} />
          </div>
          <div>
            <div className="text-[10px] uppercase text-[#8fa8c7] font-medium">
              {isHindi ? 'कुल PCR (OI Ratio)' : 'Option PCR'}
            </div>
            <div className={`text-sm font-bold font-mono ${pcr >= 1.05 ? 'text-emerald-400' : pcr <= 0.85 ? 'text-rose-400' : 'text-amber-400'}`}>
              {pcr.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400">
              {pcr >= 1.05 ? 'Bullish Support' : pcr <= 0.85 ? 'Bearish Heavy' : 'Neutral Range'}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-[#091526] rounded-lg text-slate-300 font-medium mb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
          <span>{isHindi ? 'PUT OI (सपोर्ट / तेजी वाले)' : 'Put OI (Support / Bullish Writers)'}</span>
        </div>
        <div className="text-[11px] text-[#8fa8c7] font-mono">
          STRIKE (NIFTY)
        </div>
        <div className="flex items-center gap-2">
          <span>{isHindi ? 'CALL OI (प्रतिरोध / मंदी वाले)' : 'Call OI (Resistance / Bearish Writers)'}</span>
          <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
        </div>
      </div>

      {/* Spectrum Bars List */}
      <div className="space-y-1.5 font-mono text-xs">
        {options.map((item) => {
          const isATM = item.isATM;
          const isSpotNear = Math.abs(item.strike - spotPrice) < 25;

          const putVal = viewMode === 'totalOI' ? item.putOI : item.putOIChange;
          const callVal = viewMode === 'totalOI' ? item.callOI : item.callOIChange;

          const putWidth = Math.min(100, Math.max(3, (Math.abs(putVal) / maxScale) * 100));
          const callWidth = Math.min(100, Math.max(3, (Math.abs(callVal) / maxScale) * 100));

          const isMaxCall = item.strike === maxCallItem?.strike;
          const isMaxPut = item.strike === maxPutItem?.strike;

          return (
            <div
              key={item.strike}
              className={`flex items-center gap-2 py-1 px-1.5 rounded transition ${
                isATM
                  ? 'bg-amber-500/10 border border-amber-500/40'
                  : 'hover:bg-[#132742]'
              }`}
            >
              {/* Left Bar: Put OI */}
              <div className="flex-1 flex items-center justify-end gap-1.5 overflow-hidden">
                <span className="text-[11px] text-[#8fa8c7] shrink-0 font-mono">
                  {formatLakhs(putVal)}
                </span>
                <div className="w-full max-w-[200px] h-4 bg-[#142844] rounded-sm overflow-hidden flex justify-end">
                  <div
                    className={`h-full rounded-sm transition-all duration-500 ${
                      isMaxPut
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                        : putVal >= 0
                        ? 'bg-emerald-500/90'
                        : 'bg-emerald-700/50'
                    }`}
                    style={{ width: `${putWidth}%` }}
                    title={`Put OI: ${item.putOI.toLocaleString()}`}
                  />
                </div>
              </div>

              {/* Center Strike Badge */}
              <div
                className={`w-20 text-center py-0.5 rounded text-xs font-bold shrink-0 transition ${
                  isATM
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : isMaxCall
                    ? 'bg-rose-950 border border-rose-500/60 text-rose-300'
                    : isMaxPut
                    ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-300'
                    : 'bg-[#10233d] text-slate-200 border border-[#1e3b61]'
                }`}
              >
                <span>{item.strike}</span>
                {isATM && <span className="text-[9px] block leading-none font-bold uppercase">ATM</span>}
                {isMaxCall && !isATM && <span className="text-[8px] block leading-none text-rose-400 font-semibold">MAX RES</span>}
                {isMaxPut && !isATM && <span className="text-[8px] block leading-none text-emerald-400 font-semibold">MAX SUP</span>}
              </div>

              {/* Right Bar: Call OI */}
              <div className="flex-1 flex items-center justify-start gap-1.5 overflow-hidden">
                <div className="w-full max-w-[200px] h-4 bg-[#142844] rounded-sm overflow-hidden flex justify-start">
                  <div
                    className={`h-full rounded-sm transition-all duration-500 ${
                      isMaxCall
                        ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                        : callVal >= 0
                        ? 'bg-rose-500/90'
                        : 'bg-rose-700/50'
                    }`}
                    style={{ width: `${callWidth}%` }}
                    title={`Call OI: ${item.callOI.toLocaleString()}`}
                  />
                </div>
                <span className="text-[11px] text-[#8fa8c7] shrink-0 font-mono">
                  {formatLakhs(callVal)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* OI Distribution Bottom Summary */}
      <div className="mt-4 pt-3 border-t border-[#1a3352] flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
        <div>
          <span>{isHindi ? 'कुल पुट OI:' : 'Total Put OI:'} </span>
          <b className="font-mono text-emerald-400">{formatLakhs(totalPutOI)}</b>
          <span className="text-[#8fa8c7] ml-1">
            ({totalPutChange >= 0 ? '+' : ''}{formatLakhs(totalPutChange)} {isHindi ? 'आज' : 'today'})
          </span>
        </div>
        <div className="text-[#8fa8c7]">
          <span>{isHindi ? 'OI अंतर (Put - Call):' : 'Net Difference (Put - Call):'} </span>
          <b className={`font-mono ${totalPutOI >= totalCallOI ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalPutOI >= totalCallOI ? '+' : ''}{formatLakhs(totalPutOI - totalCallOI)}
          </b>
        </div>
        <div>
          <span>{isHindi ? 'कुल कॉल OI:' : 'Total Call OI:'} </span>
          <b className="font-mono text-rose-400">{formatLakhs(totalCallOI)}</b>
          <span className="text-[#8fa8c7] ml-1">
            ({totalCallChange >= 0 ? '+' : ''}{formatLakhs(totalCallChange)} {isHindi ? 'आज' : 'today'})
          </span>
        </div>
      </div>
    </div>
  );
};
