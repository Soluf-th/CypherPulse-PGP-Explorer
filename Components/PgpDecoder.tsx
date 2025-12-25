
import React, { useState } from 'react';
import { DecoderResult } from '../types';

interface PgpDecoderProps {
  onDecode: (block: string) => void;
  result: DecoderResult | null;
  isLoading: boolean;
}

const PgpDecoder: React.FC<PgpDecoderProps> = ({ onDecode, result, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onDecode(input);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
           </svg>
        </div>
        <label className="block text-sm font-semibold mb-4 text-white/60 mono uppercase tracking-wider">
          Insert PGP Sequence for Decoding
        </label>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="-----BEGIN PGP MESSAGE-----..."
            className="w-full h-48 bg-black/50 border border-white/10 rounded-lg p-4 mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-white/10"
          ></textarea>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`px-8 py-3 rounded-lg font-bold mono uppercase text-sm tracking-widest transition-all flex items-center space-x-2 ${
                isLoading || !input.trim() 
                  ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]'
              }`}
            >
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{isLoading ? 'Sequencing...' : 'Start Decoding'}</span>
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          {/* Header Card */}
          <div className="bg-[#111] border border-green-500/20 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="text-[10px] font-bold text-green-500 uppercase mono tracking-widest mb-1">Object Classification</div>
              <h2 className="text-2xl font-bold text-white mono">{result.type}</h2>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded px-4 py-2 text-xs mono text-green-400">
              <span className="opacity-50 uppercase mr-2">Status:</span>
              <span className="font-bold">DECODED</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Packet Breakdown */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-white/40 uppercase mono tracking-widest px-2">Packet Sequence Breakdown</h3>
              <div className="space-y-3">
                {result.packets.map((packet, i) => (
                  <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-lg p-4 hover:border-green-500/20 transition-all flex items-start space-x-4">
                    <div className="w-10 h-10 bg-white/5 rounded flex items-center justify-center text-[10px] font-bold mono text-white/30 shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-green-500 mono mb-1 uppercase">{packet.tag}</div>
                      <p className="text-xs text-white/60 leading-relaxed">{packet.description}</p>
                      {packet.length && (
                         <div className="mt-2 text-[10px] mono text-white/20">SIZE: {packet.length} bytes</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Info */}
            <div className="space-y-6">
              <section className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5">
                <h4 className="text-[10px] uppercase font-bold text-white/30 mono mb-4 tracking-widest">Security Advisory</h4>
                <p className="text-xs leading-relaxed text-white/70 italic border-l-2 border-yellow-500/40 pl-4 py-1">
                  {result.securityNote}
                </p>
              </section>

              {result.extractedContent && (
                <section className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5">
                  <h4 className="text-[10px] uppercase font-bold text-white/30 mono mb-4 tracking-widest">Extracted Text Content</h4>
                  <div className="bg-black rounded p-3 border border-white/5 text-xs mono text-green-400 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {result.extractedContent}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 className="text-white/40 font-medium mono uppercase text-xs tracking-widest">Decoder Passive</h3>
          <p className="text-white/20 text-[11px] mt-2 mono">Submit encrypted messages or signatures for binary structural inspection.</p>
        </div>
      )}
    </div>
  );
};

export default PgpDecoder;
