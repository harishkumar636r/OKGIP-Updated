import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, User, Loader2 } from 'lucide-react';
import api from '../services/api';

export const AiChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Hello! I am OKGIP AI Assistant. Ask me anything about employee skills, knowledge gaps, training courses, or leave policies!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: timeStr }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userMsg });
      if (res.data.success && res.data.reply) {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: res.data.reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'I can help analyze knowledge gaps, suggest training courses, check leave policies, track tasks, or generate reports for your department.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs cursor-pointer transition-all hover:scale-105 active:scale-95 group border border-emerald-400/30"
          title="Open AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white animate-pulse" />
            <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-1 -right-1" />
          </div>
          <span className="pr-1 hidden sm:inline">AI Assistant</span>
        </button>
      )}

      {/* Floating Chat Modal Box */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col h-[500px] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-4 text-white flex items-center justify-between border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs flex items-center gap-1.5 text-white">
                  OKGIP AI Intelligence
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                    Live
                  </span>
                </h3>
                <p className="text-[10px] text-slate-300 font-medium">Enterprise Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60 custom-scrollbar text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 mt-0.5 border border-emerald-200">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-br-none shadow-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                  <p
                    className={`text-[9px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </p>
                </div>
                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold shrink-0 mt-0.5 border border-slate-300">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs italic p-2 bg-white rounded-xl border border-slate-200/80 w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>AI analyzing query...</span>
              </div>
            )}
          </div>

          {/* Form Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about skills, gaps, training..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
