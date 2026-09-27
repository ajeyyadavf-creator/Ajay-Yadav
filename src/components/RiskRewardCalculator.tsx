import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, ShieldAlert, TrendingUp, ArrowRight, CheckCircle, Percent } from 'lucide-react';
import { MarketState, OptionStrike } from '../types';

interface RiskRewardCalculatorProps {
  market: MarketState;
  onOpenTradeLoggerWithData: (data: {
    instrument: string;
    tradeType: 'CE' | 'PE';
    strike: number;
    entryPrice: number;
    quantity: number;
  }) => void;
  isHindi?: boolean;
}

export const RiskRewardCalculator: React.FC<RiskRewardCalculatorProps> = ({
  market,
  onOpenTradeLoggerWithData,
  isHindi = false,
}) => {
  const atm = Math.round(market.nifty / 50) * 50;

  const [tradeType, setTradeType] = useState<'CE' | 'PE'>('CE');
  const [selectedStrike, setSelectedStrike] = useState<number>(atm);
  const [entryLtp, setEntryLtp] = useState<number>(120);
  const [numLots, setNumLots] = useState<number>(2);
  const [lotSize, setLotSize] = useState<number>(25); // NIFTY standard
  const [targetPoints, setTargetPoints] = useState<number>(30);
  const [slPoints, setSlPoints] = useState<number>(15);

  // Sync entry LTP when strike or type changes
  useEffect(() => {
    const item = market.options?.find((o) => o.strike === selectedStrike);
    if (item) {
      setEntryLtp(tradeType === 'CE' ? item.callLTP : item.putLTP);
    }
  }, [selectedStrike, tradeType, market.options]);

  const totalQty = numLots * lotSize;
  const capitalRequired = +(entryLtp * totalQty).toFixed(2);
  const maxRisk = +(slPoints * totalQty).toFixed(2);
  const potentialReward = +(targetPoints * totalQty).toFixed(2);
  const riskRewardRatio = slPoints > 0 ? (targetPoints / slPoints).toFixed(1) : '0';
  const targetExitPrice = +(entryLtp + targetPoints).toFixed(2);
  const slExitPrice = +Math.max(0.05, entryLtp - slPoints).toFixed(2);
  const roiPct = capitalRequired > 0 ? ((potentialReward / capitalRequired) * 100).toFixed(1) : '0';

  const handleSendToJournal = () => {
    onOpenTradeLoggerWithData({
      instrument: `NIFTY ${selectedStrike} ${tradeType}`,
      tradeType,
      strike: selectedStrike,
      entryPrice: entryLtp,
      quantity: totalQty,
    });
  };

  return (
    <div id="risk-reward-calculator" className="bg-[#0c1a2d] border border-[#1d3554] rounded-xl p-4 my-4 shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#1b3454]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Calculator size={18} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{isHindi ? 'NIFTY ऑप्शंस ट्रेड & रिस्क-रिवार्ड कैलकुलेटर' : 'NIFTY Option Trade & Risk-Reward Calculator'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#13263e] text-indigo-300 border border-indigo-500/30">
                1 Lot = {lotSize} Qty
              </span>
            </h3>
            <p className="text-xs text-[#8fa8c7]">
              {isHindi
                ? 'ट्रेड लेने से पहले आवश्यक पूंजी, अधिकतम जोखिम और संभावित मुनाफे की गणना करें'
                : 'Calculate required margin, max risk and potential gain before executing'}
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 text-xs text-[#8fa8c7]">
          <span>{isHindi ? 'अनुपात सेट:' : 'Quick R:R:'}</span>
          <button
            type="button"
            onClick={() => {
              setSlPoints(15);
              setTargetPoints(30);
            }}
            className="px-2 py-1 rounded bg-[#10233d] hover:bg-[#1a3355] text-slate-200 font-mono transition cursor-pointer"
          >
            1:2
          </button>
          <button
            type="button"
            onClick={() => {
              setSlPoints(15);
              setTargetPoints(45);
            }}
            className="px-2 py-1 rounded bg-[#10233d] hover:bg-[#1a3355] text-slate-200 font-mono transition cursor-pointer"
          >
            1:3
          </button>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-4">
        {/* Type (CE / PE) */}
        <div>
          <label className="block text-[11px] font-medium text-[#8fa8c7] mb-1">
            {isHindi ? 'ऑप्शन प्रकार' : 'Option Type'}
          </label>
          <div className="grid grid-cols-2 gap-1 bg-[#091526] p-1 rounded-lg border border-[#1b3454]">
            <button
              type="button"
              onClick={() => setTradeType('CE')}
              className={`py-1 rounded text-xs font-bold transition cursor-pointer ${
                tradeType === 'CE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-[#8fa8c7] hover:text-white'
              }`}
            >
              CE
            </button>
            <button
              type="button"
              onClick={() => setTradeType('PE')}
              className={`py-1 rounded text-xs font-bold transition cursor-pointer ${
                tradeType === 'PE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-[#8fa8c7] hover:text-white'
              }`}
            >
              PE
            </button>
          </div>
        </div>

        {/* Strike */}
        <div>
          <label className="block text-[11px] font-medium text-[#8fa8c7] mb-1">
            {isHindi ? 'स्ट्राइक प्राइस' : 'Strike Price'}
          </label>
          <select
            value={selectedStrike}
            onChange={(e) => setSelectedStrike(Number(e.target.value))}
            className="w-full bg-[#091526] border border-[#1b3454] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-hidden"
          >
            {market.options?.map((opt) => (
              <option key={opt.strike} value={opt.strike}>
                {opt.strike} {opt.strike === atm ? '(ATM)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Entry Premium (LTP) */}
        <div>
          <label className="block text-[11px] font-medium text-[#8fa8c7] mb-1">
            {isHindi ? 'एंट्री प्रीमियम (₹)' : 'Entry Premium (₹)'}
          </label>
          <input
            type="number"
            step="0.05"
            value={entryLtp}
            onChange={(e) => setEntryLtp(Number(e.target.value))}
            className="w-full bg-[#091526] border border-[#1b3454] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        {/* Lots Count */}
        <div>
          <label className="block text-[11px] font-medium text-[#8fa8c7] mb-1">
            {isHindi ? 'लॉट्स संख्या (Lots)' : 'Number of Lots'}
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max="50"
              value={numLots}
              onChange={(e) => setNumLots(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#091526] border border-[#1b3454] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-hidden"
            />
            <span className="text-[11px] text-[#8fa8c7] shrink-0 font-mono">
              = {totalQty} qty
            </span>
          </div>
        </div>

        {/* Target Points */}
        <div>
          <label className="block text-[11px] font-medium text-[#8fa8c7] mb-1">
            {isHindi ? 'टारगेट पॉइंट्स (Pts)' : 'Target Points (Pts)'}
          </label>
          <input
            type="number"
            min="1"
            value={targetPoints}
            onChange={(e) => setTargetPoints(Math.max(1, Number(e.target.value)))}
            className="w-full bg-[#091526] border border-[#1b3454] rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 font-mono focus:border-emerald-500 focus:outline-hidden font-bold"
          />
        </div>

        {/* Stop Loss Points */}
        <div>
          <label className="block text-[11px] font-medium text-[#8fa8c7] mb-1">
            {isHindi ? 'स्टॉप लॉस (Pts)' : 'Stop Loss (Pts)'}
          </label>
          <input
            type="number"
            min="1"
            value={slPoints}
            onChange={(e) => setSlPoints(Math.max(1, Number(e.target.value)))}
            className="w-full bg-[#091526] border border-[#1b3454] rounded-lg px-2.5 py-1.5 text-xs text-rose-300 font-mono focus:border-rose-500 focus:outline-hidden font-bold"
          />
        </div>
      </div>

      {/* Calculated Outcomes Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#091526] border border-[#182f4d] rounded-xl p-3.5">
        {/* Required Margin */}
        <div>
          <div className="text-[10px] uppercase text-[#8fa8c7] font-medium">
            {isHindi ? 'आवश्यक पूंजी (Margin)' : 'Capital Required'}
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">
            ₹{capitalRequired.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {totalQty} Qty × ₹{entryLtp}
          </div>
        </div>

        {/* Max Risk */}
        <div>
          <div className="text-[10px] uppercase text-rose-400 font-medium">
            {isHindi ? 'अधिकतम नुकसान (Max Risk)' : 'Max Risk (SL Loss)'}
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-rose-400 mt-0.5">
            -₹{maxRisk.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            SL Exit @ ₹{slExitPrice}
          </div>
        </div>

        {/* Potential Reward */}
        <div>
          <div className="text-[10px] uppercase text-emerald-400 font-medium">
            {isHindi ? 'संभावित लाभ (Target Gain)' : 'Potential Profit'}
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-0.5">
            +₹{potentialReward.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Target Exit @ ₹{targetExitPrice} (+{roiPct}%)
          </div>
        </div>

        {/* Risk : Reward Ratio */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="text-[10px] uppercase text-indigo-300 font-medium">
              {isHindi ? 'रिस्क : रिवार्ड अनुपात' : 'Risk : Reward'}
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-indigo-300 mt-0.5">
              1 : {riskRewardRatio}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {Number(riskRewardRatio) >= 2 ? '✅ High Probability Setup' : '⚠️ Moderate Setup'}
          </div>
        </div>
      </div>

      {/* Direct Action Button */}
      <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs text-[#8fa8c7]">
          {isHindi ? 'सेटअप तैयार है:' : 'Configured Setup:'}{' '}
          <b className="text-white font-mono">
            NIFTY {selectedStrike} {tradeType} ({numLots} Lots / {totalQty} Qty)
          </b>
        </span>

        <button
          type="button"
          onClick={handleSendToJournal}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
        >
          <span>{isHindi ? 'सीधे ट्रेड जर्नल में दर्ज करें' : 'Send Setup to Trade Journal'}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
