
import React, { useState, useRef, useEffect } from 'react';
import { chatWithAssistant } from '../services/geminiService';
import { Message, GroundingSource } from '../types';

interface ChatInterfaceProps {
  history: Message[];
  setHistory: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ history, setHistory }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', text: input };
    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setSources([]);

    try {
      const result = await chatWithAssistant(history, input);
      setHistory(prev => [...prev, { role: 'model', text: result.text }]);
      
      if (result.sources) {
        const extractedSources: GroundingSource[] = result.sources
          .filter(chunk => chunk.web)
          .map(chunk => ({
            title: chunk.web.title || 'Source',
            uri: chunk.web.uri
          }));
        setSources(extractedSources);
      }
    } catch (error) {
      console.error(error);
      setHistory(prev => [...prev, { role: 'model', text: "Apologies, the secure link to the core logic was interrupted." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pb-4 scroll-smooth pr-2"
      >
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-40">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold mono mb-2 uppercase tracking-tighter">Cryptographic Consultant Online</h2>
              <p className="max-w-xs mx-auto text-sm leading-relaxed">Ask about elliptic curves, PGP history, or the origins of Satoshi's key.</p>
            </div>
          </div>
        )}

        {history.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
          >
            <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${
              msg.role === 'user' 
                ? 'bg-green-600 text-black font-medium' 
                : 'bg-[#111] border border-white/10 text-white/90'
            }`}>
              <div className="text-xs uppercase font-bold mono mb-2 opacity-50 tracking-widest">
                {msg.role === 'user' ? 'Initiator' : 'Assistant'}
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#111] border border-white/10 rounded-2xl px-5 py-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-green-500/40 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-500/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-green-500/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          </div>
        )}

        {sources.length > 0 && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mt-4 animate-in fade-in">
            <h4 className="text-[10px] uppercase font-bold text-blue-400 mono mb-3 tracking-widest">Information Nodes</h4>
            <div className="flex flex-wrap gap-2">
              {sources.map((source, i) => (
                <a 
                  key={i} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-black/40 border border-blue-500/20 rounded-lg text-[10px] text-blue-300 hover:bg-blue-500/10 transition-all flex items-center space-x-2"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="truncate max-w-[150px]">{source.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="mt-4 relative group">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Query the secure assistant..."
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all shadow-2xl placeholder:text-white/20"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            input.trim() && !isTyping ? 'text-green-500 hover:bg-green-500/10' : 'text-white/10'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
