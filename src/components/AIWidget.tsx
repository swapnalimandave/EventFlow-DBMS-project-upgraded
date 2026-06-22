import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export const AIWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'ai',
      text: "Hi! I'm EventFlow AI. You can issue commands in natural language like:\n\n• *\"Add a new client named John, email john@ex.com\"*\n• *\"Create event Wedding on August 15th for client John\"*\n• *\"Add a section catering and task make menu to Wedding\"*\n• *\"Check venues directory\"*\n\nGive it a try!",
      timestamp: Date.now()
    }
  ]);
  const [isSending, setIsSending] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const scrollToBottom = () => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userText = inputText;
    setInputText('');
    setIsSending(true);

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      text: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      // Build brief chat history to keep context
      const history = messages
        .slice(-6) // Keep last 6 cycles for contextual continuity
        .map(m => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history })
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const aiMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: 'ai',
        text: data.content || 'Action executed successfully.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error: any) {
      console.error('AI assistant error:', error);
      const errMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: 'ai',
        text: `Error processing request: ${error.message || 'Server unresponsive. Check your GEMINI_API_KEY settings.'}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating launcher badge */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-2xl transition-all cursor-pointer relative"
          title="Open AI Assistant"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
        </button>
      )}

      {/* Floating Chat Container Accordion */}
      {isOpen && (
        <div
          id="ai-chat-window"
          className={`w-85 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[500px]'
            }`}
        >
          {/* Header Panel */}

          <div className="h-14 bg-indigo-600 dark:bg-indigo-550 shrink-0 px-4 flex items-center justify-between text-white shadow-lg">
            <div className="text-left">
              <span className="font-sans font-bold text-sm tracking-tight block">
                EventFlow AI Assistant
              </span>
              <p className="text-[10px] text-indigo-200 font-medium">
                Core Gemini Automation
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white"
                title={isMinimized ? "Expand Chat" : "Collapse Chat"}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white"
                title="Log Out Assistant"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Messages Thread box */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-850/30">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl font-sans text-xs leading-relaxed ${m.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-750 rounded-bl-none shadow-sm'
                        }`}
                    >
                      <p className="whitespace-pre-line">{m.text}</p>
                    </div>
                  </div>
                ))}

                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 text-slate-400 border border-slate-150 dark:border-slate-750 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="h-1.5 w-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="h-1.5 w-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
                <div ref={threadEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2 shrink-0 bg-white dark:bg-slate-900">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type event changes or queries here..."
                  className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none text-xs font-sans text-slate-900 dark:text-white"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={isSending || !inputText.trim()}
                  className="h-9 w-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-500 disabled:opacity-50 transition cursor-pointer shrink-0"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default AIWidget;
