
import React, { useState } from 'react';
import { KeyAnalysis } from '../types';

interface KeyAnalyzerProps {
  onAnalyze: (key: string) => void;
  result: KeyAnalysis | null;
  isLoading: boolean;
}

const KeyAnalyzer: React.FC<KeyAnalyzerProps> = ({ onAnalyze, result, isLoading }) => {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAnalyze(input);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-2xl">
        <label className="block text-sm font-semibold mb-4 text-white/60 mono uppercase tracking-wider">
          Insert PGP Block for Inspection
        </label>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----..."
            className="w-full h-48 bg-black/50 border border-white/10 rounded-lg p-4 mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-white/10"
          ></textarea>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`px-8 py-3 rounded-lg font-bold mono uppercase text-sm tracking-widest transition-all ${
                isLoading || !input.trim() 
                  ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]'
              }`}
            >
              {isLoading ? 'Decrypting...' : 'Initiate Analysis'}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[#0a0a0a] border border-green-500/20 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.1)]">
            <div className="bg-green-500/10 px-6 py-4 border-b border-green-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-bold mono text-green-500 uppercase tracking-tighter">Analysis Report</span>
                <div className="h-4 w-[1px] bg-green-500/20 hidden md:block"></div>
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] mono text-white/40 uppercase tracking-widest font-bold">KEY ID</span>
                  <button 
                    onClick={() => copyToClipboard(result.keyId)}
                    className="group relative flex items-center space-x-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded text-green-400 hover:bg-green-500/20 transition-all"
                    title="Click to copy Key ID"
                  >
                    <span className="text-sm mono font-bold tracking-wider">{result.keyId}</span>
                    <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    {copied && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-black text-[10px] px-2 py-1 rounded font-bold mono uppercase pointer-events-none">
                        Copied
                      </span>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex space-x-1 self-end md:self-center">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-green-500/40"></div>
                <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {result.owner && (
                  <section>
                    <h4 className="text-[10px] uppercase font-bold text-white/30 mono mb-2 tracking-widest">Primary Identity (UID)</h4>
                    <div className="text-lg font-bold text-white mono bg-white/5 p-3 rounded-lg border border-white/5">
                      {result.owner}
                    </div>
                  </section>
                )}
                <section>
                  <h4 className="text-[10px] uppercase font-bold text-white/30 mono mb-2 tracking-widest">Security Identifier</h4>
                  <div className="text-lg font-bold text-green-500 mono bg-green-500/5 p-3 rounded-lg border border-green-500/10">
                    {result.keyId}
                  </div>
                </section>
              </div>

              <section>
                <h4 className="text-[10px] uppercase font-bold text-white/30 mono mb-2 tracking-widest">Executive Summary</h4>
                <p className="text-sm leading-relaxed text-white/80">{result.summary}</p>
              </section>

              <section>
                <h4 className="text-[10px] uppercase font-bold text-white/30 mono mb-2 tracking-widest">Cryptographic Manifest</h4>
                <div className="bg-black/50 border border-white/5 rounded-lg p-4 mono text-xs text-green-400/80 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {result.technicalProperties}
                </div>
              </section>

              {result.historicalContext && (
                <section>
                  <h4 className="text-[10px] uppercase font-bold text-white/30 mono mb-2 tracking-widest">Forensic Background</h4>
                  <div className="text-sm leading-relaxed text-white/60 italic border-l-2 border-green-500/40 pl-4 py-2 bg-green-500/[0.02] rounded-r-lg">
                    {result.historicalContext}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}

      {!result && !isLoading && (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
            <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-white/40 font-medium mono uppercase text-xs tracking-widest">Analyzer Idle</h3>
          <p className="text-white/20 text-[11px] mt-2 mono">Awaiting cryptographic block input for sequence initiation.</p>
        </div>
      )}
    </div>
  );
};

export default KeyAnalyzer;
