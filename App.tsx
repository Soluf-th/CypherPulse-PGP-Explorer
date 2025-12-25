
import React, { useState } from 'react';
import { analyzeKey, decodePgpBlock } from './services/geminiService';
import { Message, KeyAnalysis, DecoderResult } from './types';
import Sidebar from './components/Sidebar';
import KeyAnalyzer from './components/KeyAnalyzer';
import ChatInterface from './components/ChatInterface';
import PgpDecoder from './components/PgpDecoder';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'decoder' | 'chat'>('analyzer');
  const [analysisResult, setAnalysisResult] = useState<KeyAnalysis | null>(null);
  const [decoderResult, setDecoderResult] = useState<DecoderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);

  const handleAnalyze = async (key: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeKey(key);
      setAnalysisResult(result);
      setActiveTab('analyzer');
    } catch (err) {
      console.error(err);
      setError("Error analyzing key. Please ensure it is a valid PGP block.");
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecode = async (block: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await decodePgpBlock(block);
      setDecoderResult(result);
      setActiveTab('decoder');
    } catch (err) {
      console.error(err);
      setError("Sequence failure. PGP packet stream could not be parsed.");
      setDecoderResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-white">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onQuickAnalyze={handleAnalyze}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]/50 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isLoading ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}></div>
            <h1 className="text-xl font-bold tracking-tight mono uppercase">
              {activeTab === 'analyzer' ? 'Vault Analyzer' : 
               activeTab === 'decoder' ? 'Sequence Decoder' : 'Assistant'}
            </h1>
          </div>
          <div className="text-xs text-white/40 uppercase tracking-widest mono">
            Node: Genesis-001 | Status: Online
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto h-full">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg mono text-xs uppercase flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            {activeTab === 'analyzer' && (
              <KeyAnalyzer onAnalyze={handleAnalyze} result={analysisResult} isLoading={isLoading} />
            )}
            {activeTab === 'decoder' && (
              <PgpDecoder onDecode={handleDecode} result={decoderResult} isLoading={isLoading} />
            )}
            {activeTab === 'chat' && (
              <ChatInterface history={history} setHistory={setHistory} />
            )}
          </div>
        </div>
      </main>

      <div className="fixed top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500/20 to-transparent"></div>
      <div className="fixed bottom-0 right-0 p-4 text-[10px] text-green-500/20 mono pointer-events-none">
        0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f
      </div>
    </div>
  );
};

export default App;
