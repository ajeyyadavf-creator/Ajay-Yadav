import React, { useState } from 'react';
import { OptionStrike, MarketState } from '../types';
import { Filter, Layers, Eye, EyeOff, BarChart3, HelpCircle, Table, Calculator, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { OIChartVisualizer } from './OIChartVisualizer';
import { RiskRewardCalculator } from './RiskRewardCalculator';

interface OptionChainTableProps {
  options: OptionStrike[];
  spotPrice: number;
  market: MarketState;
  showGreeks: boolean;
  onToggleGreeks: () => void;
  strikeRange: number;
  onChangeStrikeRange: (range: number) => void;
  onQuickLogTrade: (strike: number, type: 'CE' | 'PE', ltp: number) => void;
  onOpenTradeLoggerWithData: (data: {
    instrument: string;
    tradeType: 'CE' | 'PE';
    strike: number;
    entryPrice: number;
    quantity: number;
  }) => void;
  isHindi?: boolean;
}

export const OptionChainTable: React.FC<OptionChainTableProps> = ({
  options,
  spotPrice,
  market,
  showGreeks,
  onToggleGreeks,
  strikeRange,
  onChangeStrikeRange,
  onQuickLogTrade,
  onOpenTradeLoggerWithData,
  isHindi = false,
}) => {
  const [activeView, setActiveView] = useState<'table' | 'oiChart' | 'calculator'>('table');
  const [showOIBars, setShowOIBars] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'atm' | 'itm' | 'otm'>('all');

  // Filter options based on filterType
  const filteredOptions = options.filter((row) => {
    if (filterType === 'atm') return Math.abs(row.strike - spotPrice) <= 100;
    if (filterType === 'itm') return row.isITMCall || row.isITMPut;
    if (filterType === 'otm') return !row.isITMCall && !row.isITMPut;
    return true;
  });

  // Find maximum OI to compute percentage for visual meters
  const maxCallOI = Math.max(...options.map((o) => o.callOI), 1);
  const maxPutOI = Math.max(...options.map((o) => o.putOI), 1);

  // Totals
  const totalCallOI = options.reduce((acc, curr) => acc + curr.callOI, 0);
  const totalPutOI = options.reduce((acc, curr) => acc + curr.putOI, 0);
  const totalCallChange = options.reduce((acc, curr) => acc + curr.callOIChange, 0);
  const totalPutChange = options.reduce((acc, curr) => acc + curr.putOIChange, 0);
  const calculatedPCR = +(totalPutOI / (totalCallOI || 1)).toFixed(2);

  // Identify highest OI strikes for support & resistance
  const maxCallItem = options.reduce((prev, curr) => (curr.callOI > prev.callOI ? curr : prev), options[0]);
  const maxPutItem = options.reduce((prev, curr) => (curr.putOI > prev.putOI ? curr : prev), options[0]);

  return (
    <div className="section mt-6">
      {/* Top Header & Main Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>{isHindi ? 'NIFTY ऑप्शंस विश्लेषण' : 'NIFTY Options Analytics'}</span>
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-[#10233d] border border-[#203452] text-[#8fa8c7] font-mono">
            SPOT: ₹{spotPrice.toFixed(2)}
          </span>

          {/* S/R Quick Badges */}
          <div className="hidden xl:flex items-center gap-2 ml-2">
            <span className="px-2 py-0.5 rounded bg-rose-950/50 border border-rose-500/40 text-rose-300 font-mono text-[11px]">
              Res: <b>{maxCallItem?.strike}</b> ({(maxCallItem?.callOI / 100000).toFixed(1)}L)
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 font-mono text-[11px]">
              Sup: <b>{maxPutItem?.strike}</b> ({(maxPutItem?.putOI / 100000).toFixed(1)}L)
            </span>
          </div>
        </div>

        {/* View Switcher Tabs (Table vs OI Chart vs Calculator) */}
        <div className="flex items-center gap-1 bg-[#091526] border border-[#1b3454] rounded-xl p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveView('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeView === 'table'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-[#8fa8c7] hover:text-white'
            }`}
          >
            <Table size={14} />
            <span>{isHindi ? 'ऑप्शन चेन' : 'Option Chain'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('oiChart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeView === 'oiChart'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-[#8fa8c7] hover:text-white'
            }`}
          >
            <BarChart3 size={14} />
            <span>{isHindi ? 'OI चार्ट विजुअलाइज़र' : 'OI Spectrum Chart'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('calculator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeView === 'calculator'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-[#8fa8c7] hover:text-white'
            }`}
          >
            <Calculator size={14} />
            <span>{isHindi ? 'रिस्क कैलकुलेटर' : 'Risk & Lot Calculator'}</span>
          </button>
        </div>
      </div>

      {/* Render Component based on Active View */}
      {activeView === 'oiChart' && (
        <OIChartVisualizer
          options={options}
          spotPrice={spotPrice}
          maxPain={market.maxPain}
          pcr={market.pcr}
          isHindi={isHindi}
        />
      )}

      {activeView === 'calculator' && (
        <RiskRewardCalculator
          market={market}
          onOpenTradeLoggerWithData={onOpenTradeLoggerWithData}
          isHindi={isHindi}
        />
      )}

      {/* Table Controls (Only visible when Table view is active) */}
      {activeView === 'table' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5 text-xs">
            {/* Quick Filter: All / ATM / ITM / OTM */}
            <div className="flex items-center gap-1 bg-[#10233d] border border-[#234166] rounded-lg p-0.5">
              <span className="text-[11px] text-[#8fa8c7] px-2">
                {isHindi ? 'फ़िल्टर:' : 'Filter:'}
              </span>
              {[
                { key: 'all', label: isHindi ? 'सभी' : 'All' },
                { key: 'atm', label: 'ATM ± 2' },
                { key: 'itm', label: 'ITM' },
                { key: 'otm', label: 'OTM' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilterType(f.key as typeof filterType)}
                  className={`px-2 py-1 rounded text-xs transition cursor-pointer ${
                    filterType === f.key
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-[#8fa8c7] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Right Controls: Strike range, Bars toggle, Greeks toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Strike count range */}
              <div className="flex items-center bg-[#10233d] border border-[#234166] rounded-lg p-0.5">
                <span className="text-[11px] text-[#8fa8c7] px-2 flex items-center gap-1">
                  <Filter size={12} />
                  <span>{isHindi ? 'स्ट्राइक्स:' : 'Range:'}</span>
                </span>
                {[5, 8, 12].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => onChangeStrikeRange(count)}
                    className={`px-2 py-1 rounded text-xs font-mono transition cursor-pointer ${
                      strikeRange === count
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-[#8fa8c7] hover:text-white'
                    }`}
                  >
                    ±{count}
                  </button>
                ))}
              </div>

              {/* Toggle OI Bars */}
              <button
                type="button"
                onClick={() => setShowOIBars(!showOIBars)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                  showOIBars
                    ? 'bg-[#142943] border-emerald-500/40 text-emerald-400'
                    : 'bg-[#10233d] border-[#2c4c72] text-[#8fa8c7]'
                }`}
                title="Toggle visual OI distribution bars in table"
              >
                <BarChart3 size={13} />
                <span>{isHindi ? 'बार्स' : 'OI Bars'}</span>
              </button>

              {/* Toggle IV / Greeks */}
              <button
                type="button"
                onClick={onToggleGreeks}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                  showGreeks
                    ? 'bg-[#142943] border-cyan-500/40 text-cyan-300'
                    : 'bg-[#10233d] border-[#2c4c72] text-[#8fa8c7]'
                }`}
                title="Toggle Implied Volatility (IV)"
              >
                {showGreeks ? <Eye size={13} /> : <EyeOff size={13} />}
                <span>IV</span>
              </button>
            </div>
          </div>

          {/* Main Table Container */}
          <div className="tablebox overflow-x-auto bg-[#0c1a2d] border border-[#1d3554] rounded-xl shadow-md">
            <table className="w-full border-collapse min-w-[960px] text-xs">
              <thead>
                {/* Top Super-header grouping Calls and Puts */}
                <tr className="border-b border-[#1b304b] text-[11px] uppercase tracking-wider font-semibold">
                  <th colSpan={showGreeks ? 5 : 4} className="bg-[#0e2038] text-emerald-400 py-2 border-r border-[#1b304b]">
                    CALLS (CE) - Bullish Bets & Resistance
                  </th>
                  <th className="bg-[#142943] text-white py-2 px-4 border-r border-[#1b304b]">
                    STRIKE
                  </th>
                  <th colSpan={showGreeks ? 5 : 4} className="bg-[#0e2038] text-rose-400 py-2">
                    PUTS (PE) - Bearish Bets & Support
                  </th>
                </tr>
                {/* Column headers */}
                <tr className="bg-[#10223a] text-[#9db5d4] border-b border-[#1b304b]">
                  <th className="py-2.5 px-3 text-right font-medium">CALL OI</th>
                  <th className="py-2.5 px-3 text-right font-medium">Δ CALL OI</th>
                  {showGreeks && <th className="py-2.5 px-2 text-right font-medium text-cyan-300">IV (%)</th>}
                  <th className="py-2.5 px-3 text-right font-medium">CALL LTP</th>
                  <th className="py-2.5 px-2 text-center font-medium border-r border-[#1b304b] text-[10px] text-emerald-400">
                    TRADE
                  </th>

                  <th className="py-2.5 px-4 text-center font-bold text-white border-r border-[#1b304b] bg-[#12253f]">
                    STRIKE PRICE
                  </th>

                  <th className="py-2.5 px-2 text-center font-medium text-[10px] text-rose-400">
                    TRADE
                  </th>
                  <th className="py-2.5 px-3 text-left font-medium">PUT LTP</th>
                  {showGreeks && <th className="py-2.5 px-2 text-left font-medium text-cyan-300">IV (%)</th>}
                  <th className="py-2.5 px-3 text-left font-medium">Δ PUT OI</th>
                  <th className="py-2.5 px-3 text-left font-medium">PUT OI</th>
                </tr>
              </thead>
              <tbody id="chain" className="divide-y divide-[#1b304b]/80 font-mono">
                {filteredOptions.map((row) => {
                  const callOIPct = Math.round((row.callOI / maxCallOI) * 100);
                  const putOIPct = Math.round((row.putOI / maxPutOI) * 100);
                  const isATM = row.isATM;
                  const isITMCall = row.isITMCall;
                  const isITMPut = row.isITMPut;

                  return (
                    <tr
                      key={row.strike}
                      className={`transition-colors duration-150 group ${
                        isATM
                          ? 'bg-[#173254] font-bold text-white shadow-inner'
                          : 'hover:bg-[#11233b]'
                      }`}
                    >
                      {/* CALL OI with background visual meter */}
                      <td
                        className={`py-2 px-3 text-right relative ${
                          isITMCall && !isATM ? 'bg-emerald-950/20 text-slate-200' : 'text-slate-300'
                        }`}
                      >
                        {showOIBars && (
                          <div
                            className="absolute inset-y-1 right-0 bg-emerald-500/15 pointer-events-none rounded-l transition-all duration-300"
                            style={{ width: `${callOIPct}%` }}
                          />
                        )}
                        <span className="relative z-10 font-semibold">{row.callOI.toLocaleString()}</span>
                      </td>

                      {/* Δ CALL OI */}
                      <td
                        className={`py-2 px-3 text-right font-medium ${
                          row.callOIChange >= 0 ? 'text-[#21d19b]' : 'text-[#ff6578]'
                        } ${isITMCall && !isATM ? 'bg-emerald-950/20' : ''}`}
                      >
                        {row.callOIChange >= 0 ? '+' : ''}
                        {row.callOIChange.toLocaleString()}
                      </td>

                      {/* Optional CALL IV */}
                      {showGreeks && (
                        <td
                          className={`py-2 px-2 text-right text-cyan-300 text-[11px] ${
                            isITMCall && !isATM ? 'bg-emerald-950/20' : ''
                          }`}
                        >
                          {row.callIV}%
                        </td>
                      )}

                      {/* CALL LTP */}
                      <td
                        className={`py-2 px-3 text-right font-semibold text-white ${
                          isITMCall && !isATM ? 'bg-emerald-950/30' : ''
                        }`}
                      >
                        ₹{row.callLTP.toFixed(2)}
                      </td>

                      {/* Quick Log CE Button */}
                      <td className="py-2 px-1.5 text-center border-r border-[#1b304b]">
                        <button
                          type="button"
                          onClick={() => onQuickLogTrade(row.strike, 'CE', row.callLTP)}
                          className="px-1.5 py-0.5 rounded bg-emerald-950/70 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[10px] font-semibold transition cursor-pointer"
                          title={`Log NIFTY ${row.strike} CE Trade`}
                        >
                          +CE
                        </button>
                      </td>

                      {/* STRIKE PRICE */}
                      <td
                        className={`py-2 px-4 text-center font-bold border-r border-[#1b304b] relative ${
                          isATM
                            ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-400/80 shadow-md scale-105 rounded-sm z-20'
                            : 'bg-[#10223a] text-white group-hover:text-amber-300'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span>{row.strike.toLocaleString()}</span>
                          {isATM && (
                            <span className="bg-slate-950 text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider">
                              ATM
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Quick Log PE Button */}
                      <td className="py-2 px-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => onQuickLogTrade(row.strike, 'PE', row.putLTP)}
                          className="px-1.5 py-0.5 rounded bg-rose-950/70 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-[10px] font-semibold transition cursor-pointer"
                          title={`Log NIFTY ${row.strike} PE Trade`}
                        >
                          +PE
                        </button>
                      </td>

                      {/* PUT LTP */}
                      <td
                        className={`py-2 px-3 text-left font-semibold text-white ${
                          isITMPut && !isATM ? 'bg-rose-950/30' : ''
                        }`}
                      >
                        ₹{row.putLTP.toFixed(2)}
                      </td>

                      {/* Optional PUT IV */}
                      {showGreeks && (
                        <td
                          className={`py-2 px-2 text-left text-cyan-300 text-[11px] ${
                            isITMPut && !isATM ? 'bg-rose-950/20' : ''
                          }`}
                        >
                          {row.putIV}%
                        </td>
                      )}

                      {/* Δ PUT OI */}
                      <td
                        className={`py-2 px-3 text-left font-medium ${
                          row.putOIChange >= 0 ? 'text-[#21d19b]' : 'text-[#ff6578]'
                        } ${isITMPut && !isATM ? 'bg-rose-950/20' : ''}`}
                      >
                        {row.putOIChange >= 0 ? '+' : ''}
                        {row.putOIChange.toLocaleString()}
                      </td>

                      {/* PUT OI with background visual meter */}
                      <td
                        className={`py-2 px-3 text-left relative ${
                          isITMPut && !isATM ? 'bg-rose-950/20 text-slate-200' : 'text-slate-300'
                        }`}
                      >
                        {showOIBars && (
                          <div
                            className="absolute inset-y-1 left-0 bg-rose-500/15 pointer-events-none rounded-r transition-all duration-300"
                            style={{ width: `${putOIPct}%` }}
                          />
                        )}
                        <span className="relative z-10 font-semibold">{row.putOI.toLocaleString()}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Table Footer with Summary Totals */}
              <tfoot>
                <tr className="bg-[#10223a] text-slate-200 font-bold border-t-2 border-[#203452] font-mono">
                  <td className="py-3 px-3 text-right text-emerald-400">
                    {totalCallOI.toLocaleString()}
                  </td>
                  <td
                    className={`py-3 px-3 text-right ${
                      totalCallChange >= 0 ? 'text-[#21d19b]' : 'text-[#ff6578]'
                    }`}
                  >
                    {totalCallChange >= 0 ? '+' : ''}
                    {totalCallChange.toLocaleString()}
                  </td>
                  {showGreeks && <td></td>}
                  <td className="py-3 px-3 text-right text-[#8fa8c7] text-[11px]">
                    Total Calls
                  </td>
                  <td className="border-r border-[#1b304b]"></td>

                  <td className="py-3 px-4 text-center border-r border-[#1b304b] text-amber-300 bg-[#142943] text-xs">
                    PCR: {calculatedPCR}
                  </td>

                  <td></td>
                  <td className="py-3 px-3 text-left text-[#8fa8c7] text-[11px]">
                    Total Puts
                  </td>
                  {showGreeks && <td></td>}
                  <td
                    className={`py-3 px-3 text-left ${
                      totalPutChange >= 0 ? 'text-[#21d19b]' : 'text-[#ff6578]'
                    }`}
                  >
                    {totalPutChange >= 0 ? '+' : ''}
                    {totalPutChange.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-left text-rose-400">
                    {totalPutOI.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legend and explanation */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 px-1 text-[11px] text-[#8fa8c7]">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-950/60 border border-emerald-500/40 inline-block" />
                <span>In-The-Money (ITM) Calls</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-950/60 border border-rose-500/40 inline-block" />
                <span>In-The-Money (ITM) Puts</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
                <span>At-The-Money (ATM) Strike</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="px-1 rounded bg-emerald-950 border border-emerald-500/40 font-mono text-[10px]">+CE / +PE</span>
                <span>{isHindi ? '1-क्लिक ट्रेड लॉग' : '1-Click Trade Quick Log'}</span>
              </span>
            </div>
            <div className="text-slate-400 italic">
              *Values tick dynamically • Spot: ₹{spotPrice.toFixed(2)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
