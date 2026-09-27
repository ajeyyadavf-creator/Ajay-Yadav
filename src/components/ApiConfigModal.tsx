import React, { useState } from 'react';
import { X, Check, Globe, RefreshCcw, Code2, AlertTriangle } from 'lucide-react';
import { fetchExternalMarketData } from '../utils/marketEngine';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
  onSave: (url: string) => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  apiUrl,
  onSave,
}) => {
  const [urlInput, setUrlInput] = useState(apiUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message?: string;
  }>({ status: 'idle' });
  const [showJsonSpec, setShowJsonSpec] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!urlInput.trim()) {
      setTestResult({
        status: 'error',
        message: 'Please enter an API URL before testing.',
      });
      return;
    }
    setTesting(true);
    setTestResult({ status: 'idle' });
    try {
      const data = await fetchExternalMarketData(urlInput.trim());
      if (data) {
        setTestResult({
          status: 'success',
          message: 'Endpoint verified! Received valid market data packet.',
        });
      } else {
        setTestResult({
          status: 'error',
          message: 'Connected, but received empty payload.',
        });
      }
    } catch (err: unknown) {
      setTestResult({
        status: 'error',
        message: `Connection failed: ${err instanceof Error ? err.message : 'Network error / CORS issue'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSave(urlInput.trim());
    onClose();
  };

  const sampleJson = `{
  "nifty": 23450.25,
  "gift": 23515,
  "crude": 74.82,
  "pcr": 1.18,
  "rsi": 62.4,
  "vwap": 23388,
  "signal": "🟢 BUY CE",
  "score": 78,
  "options": [
    {
      "strike": 23450,
      "callOI": 1450000,
      "callOIChange": 120000,
      "callLTP": 142.50,
      "putLTP": 98.20,
      "putOIChange": 230000,
      "putOI": 1780000
    }
  ]
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#0b1729] border border-[#203452] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="px-5 py-4 border-b border-[#1d3554] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="text-emerald-400" size={18} />
            <h3 className="font-bold text-white text-base">Backend & Broker API Connection</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#142943]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-300">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              CONFIG.API_URL (Optional HTTP / REST Endpoint):
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setTestResult({ status: 'idle' });
              }}
              placeholder="https://your-server.example.com/api/market"
              className="w-full bg-[#07111f] border border-[#2c4c72] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <p className="text-[11px] text-[#8fa8c7] mt-1">
              Leave blank to use the high-fidelity real-time simulated market tick generator.
            </p>
          </div>

          {/* Action buttons for testing and presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="px-3 py-1.5 rounded-lg bg-[#142943] hover:bg-[#1b355a] border border-[#28476a] text-slate-200 flex items-center gap-1.5 text-xs transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCcw size={12} className={testing ? 'animate-spin' : ''} />
              <span>{testing ? 'Testing connection...' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUrlInput('/api/market');
                setTestResult({ status: 'idle' });
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <span>⚡ Best Server: Ultra-Fast Live (/api/market)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUrlInput('');
                setTestResult({ status: 'idle' });
              }}
              className="px-3 py-1.5 rounded-lg bg-transparent hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
            >
              Clear / Offline Sim
            </button>
          </div>

          {/* Test Status Feedback */}
          {testResult.status === 'success' && (
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <Check size={14} className="shrink-0" />
              <span>{testResult.message}</span>
            </div>
          )}

          {testResult.status === 'error' && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <div>
                <span>{testResult.message}</span>
                <p className="text-[10px] text-rose-400 mt-0.5">
                  Make sure your backend enables CORS headers (Access-Control-Allow-Origin: *).
                </p>
              </div>
            </div>
          )}

          {/* Payload Schema Viewer */}
          <div className="border-t border-[#1d3554] pt-3">
            <button
              type="button"
              onClick={() => setShowJsonSpec(!showJsonSpec)}
              className="flex items-center gap-1.5 text-xs text-[#8fa8c7] hover:text-white transition font-medium"
            >
              <Code2 size={13} />
              <span>{showJsonSpec ? 'Hide Expected JSON Schema' : 'View Expected API Response JSON'}</span>
            </button>

            {showJsonSpec && (
              <div className="mt-2 p-3 bg-[#07111f] rounded-lg border border-[#1b304b] font-mono text-[11px] text-emerald-400 max-h-48 overflow-y-auto">
                <pre>{sampleJson}</pre>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3.5 bg-[#091322] border-t border-[#1d3554] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-slate-300 hover:bg-[#142943] text-xs transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-md shadow-emerald-950"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
