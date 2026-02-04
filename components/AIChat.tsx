
import React, { useState, useRef, useEffect } from 'react';
import { ProjectUpdate } from '../types';
import { Send, Bot, User, Sparkles, Loader2, Info } from 'lucide-react';
import { analyzeTeamData } from '../services/geminiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  updates: ProjectUpdate[];
}

const AIChat: React.FC<AIChatProps> = ({ updates }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hello! I'm PPA. I've analyzed your team's ${updates.length} current projects. I can tell you who's at risk, summarize progress by goal, or help you brainstorm blockers. What would you like to know?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await analyzeTeamData(updates, userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error analyzing the data. Please ensure the data format is correct." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">PPA AI Analyst</h3>
            <p className="text-xs text-indigo-600 font-medium italic">Scanning {updates.length} updates...</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start items-center gap-2 px-4">
            <Loader2 size={16} className="animate-spin text-indigo-600" />
            <span className="text-xs text-gray-400 font-medium">Analyzing team performance...</span>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-100">
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Which team members are at risk?"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-6 pr-14 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-2 top-2 bottom-2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
