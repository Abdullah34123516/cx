import React, { useState, useEffect, useRef } from 'react';
import { Language, ChatSession, ChatMessage } from '../types';
import { TEXTS } from '../constants';

interface LiveChatProps {
  session: ChatSession;
  currentUser: { id: string; type: 'customer' | 'moderator' };
  onSendMessage: (sessionId: string, text: string) => void;
  onClose: () => void;
  language: Language;
  isModeratorView?: boolean;
}

const LiveChat: React.FC<LiveChatProps> = ({ session, currentUser, onSendMessage, onClose, language, isModeratorView = false }) => {
  const [input, setInput] = useState('');
  const texts = TEXTS.liveChat;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(session.id, input);
      setInput('');
    }
  };

  const wrapperClasses = isModeratorView
    ? "bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col" // Embedded style
    : "fixed bottom-6 right-6 w-80 h-[28rem] bg-white rounded-xl shadow-2xl flex flex-col z-50 animate-slide-in-up"; // Floating style
  
  const outerWrapperClasses = isModeratorView
    ? "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" // Modal wrapper for moderator
    : ""; // No wrapper for customer floating window

  const ChatWindow = (
    <div className={wrapperClasses} onClick={(e) => e.stopPropagation()}>
      <header className="bg-primary p-4 rounded-t-xl text-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-lg">{isModeratorView ? session.customerName : texts.title[language]}</h3>
        <button onClick={onClose} className="text-slate-100/70 hover:text-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </header>
      <main className="flex-1 p-4 overflow-y-auto bg-slate-50">
        <div className="space-y-4">
          {!session.moderatorId && (
            <div className="text-center text-xs text-slate-500 p-2 bg-slate-100 rounded-md">{texts.welcome[language]}</div>
          )}
          {session.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-xl max-w-xs ${msg.senderId === currentUser.id ? 'bg-primary text-slate-100 rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </main>
      <footer className="p-2 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={texts.inputPlaceholder[language]}
            className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-primary text-sm"
          />
          <button type="submit" className="bg-primary text-slate-100 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </form>
      </footer>
    </div>
  );

  if (isModeratorView) {
      return <div className={outerWrapperClasses} onClick={onClose}>{ChatWindow}</div>;
  }

  return ChatWindow;
};

export default LiveChat;
