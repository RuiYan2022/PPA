
import React, { useState, useRef, useEffect } from 'react';
import { ProjectUpdate } from '../types';
import { Send, Bot, Sparkles, Loader2, AlertCircle, Key } from 'lucide-react';
import { analyzeTeamData, isAIReady } from '../services/geminiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  updates: ProjectUpdate[];
}

const AIChat: React.FC<AIChatProps> = ({ updates }) => {
  const aiConfigured = isAIReady();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hello! I'm PPA. I've analyzed your team's ${updates.length} updates. I can identify risks, summarize progress, or help you prepare for your next sync. What's on your mind?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await analyzeTeamData(updates, userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err: any) {
      console.error(err);
      if (err.message === "API_KEY_MISSING") {
        setError("API Key not found in environment variables.");
      } else {
        setError("I encountered an error processing that request.");
      }
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to my brain right now. Please check the system status." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!aiConfigured) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-12 bg-white rounded-3xl border border-dashed border-gray-300 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
          <Key size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">AI Features Locked</h2>
        <p className="text-gray-500 leading-relaxed">
          The Personal Project Assistant requires a Gemini API Key to provide insights. 
          Please add <code className="bg-gray-100 px-2 py-1 rounded text-pink-600 font-bold">API_KEY</code> to your Vercel Environment Variables.
        </p>
        <div className="pt-4">
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Get an API Key <Sparkles size={18} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Bot size={22} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">PPA Analyst</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Connected • {updates.length} Datapoints</p>
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
              }`}>
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start items-center gap-3 px-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">PPA is thinking...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center gap-2 text-red-500 text-xs font-medium bg-red-50 p-3 rounded-xl border border-red-100">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="relative group">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask PPA: 'Which projects are at risk?'"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-6 pr-14 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-400"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading} 
            className="absolute right-2 top-2 bottom-2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center disabled:opacity-30 disabled:grayscale transition-all hover:bg-indigo-700 shadow-md active:scale-95"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-[9px] text-center text-gray-400 mt-3 font-medium uppercase tracking-widest">
          AI insights are based on provided team data
        </p>
      </div>
    </div>
  );
};

export default AIChat;
