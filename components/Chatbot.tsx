import React, { useState, useEffect, useRef } from 'react';
import { Language, PlatformData, BookingStatus } from '../types';
import { TEXTS } from '../constants';

interface ChatbotProps {
    language: Language;
    platformData: PlatformData;
}

type ChatStep = 'greeting' | 'booking_prompt' | 'booking_result' | 'payment_info' | 'other_info' | 'more_help';

interface Message {
    sender: 'bot' | 'user';
    text: string;
    options?: { text: string; action: () => void; }[];
}

const Chatbot: React.FC<ChatbotProps> = ({ language, platformData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [step, setStep] = useState<ChatStep>('greeting');
    const [userInput, setUserInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const texts = TEXTS.chatbot;
    
    // FIX: Define resetChat and other helper functions to complete the component logic.
    const addMessage = (sender: 'bot' | 'user', text: string, options?: { text: string; action: () => void; }[]) => {
        setMessages(prev => [...prev, { sender, text, options }]);
    };

    const showMoreHelpOptions = () => {
        setStep('more_help');
        addMessage('bot', texts.needMoreHelp[language], [
            { text: texts.yes[language], action: () => resetChat() },
            { text: texts.no[language], action: () => {
                setMessages(prev => prev.map((msg, index) => index === prev.length - 1 ? { ...msg, options: undefined } : msg));
                addMessage('bot', 'Ok!');
            }},
        ]);
    };
    
    const handleOptionSelect = (option: 'booking' | 'payment' | 'other') => {
        setMessages(prev => prev.map((msg, index) => index === prev.length - 1 ? { ...msg, options: undefined } : msg));

        if (option === 'booking') {
            setStep('booking_prompt');
            addMessage('bot', texts.bookingPrompt[language]);
        } else if (option === 'payment') {
            setStep('payment_info');
            addMessage('bot', texts.paymentInfo[language]);
            showMoreHelpOptions();
        } else {
            setStep('other_info');
            addMessage('bot', texts.otherInfo[language]);
            showMoreHelpOptions();
        }
    };
    
    const resetChat = () => {
        setMessages([]);
        setStep('greeting');
        addMessage('bot', texts.greeting[language], [
            { text: texts.options.booking[language], action: () => handleOptionSelect('booking') },
            { text: texts.options.payment[language], action: () => handleOptionSelect('payment') },
            { text: texts.options.other[language], action: () => handleOptionSelect('other') },
        ]);
    };

    useEffect(() => {
        if (isOpen) {
            resetChat();
        }
    }, [isOpen, language]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleUserInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        addMessage('user', userInput);

        if (step === 'booking_prompt') {
            const booking = platformData.bookings.find(b => b.id.toLowerCase() === userInput.trim().toLowerCase());
            if (booking) {
                const statusText = booking.status;
                const message = `${texts.bookingStatus[language]} ${booking.id} ${texts.is[language]} ${statusText}.`;
                addMessage('bot', message);
            } else {
                addMessage('bot', texts.invalidBooking[language]);
            }
            showMoreHelpOptions();
        }
        
        setUserInput('');
    };

    return (
        <>
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-primary text-slate-100 w-16 h-16 rounded-full shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    aria-label="Toggle Chatbot"
                >
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    )}
                </button>
            </div>
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-80 h-[28rem] bg-white rounded-xl shadow-2xl flex flex-col z-40 animate-slide-in-up">
                    <header className="bg-primary p-4 rounded-t-xl text-slate-100">
                        <h3 className="font-bold text-lg">FixBD Helper</h3>
                    </header>
                    <main className="flex-1 p-4 overflow-y-auto bg-slate-50">
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-4 py-2 rounded-xl max-w-xs ${msg.sender === 'user' ? 'bg-primary text-slate-100 rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                                        {msg.text}
                                    </div>
                                    {msg.options && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {msg.options.map((opt, i) => (
                                                <button key={i} onClick={opt.action} className="px-3 py-1 bg-white border border-primary text-primary text-sm font-semibold rounded-full hover:bg-primary/10">
                                                    {opt.text}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div ref={messagesEndRef} />
                    </main>
                    {['booking_prompt'].includes(step) && (
                        <footer className="p-2 border-t">
                            <form onSubmit={handleUserInputSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder="Type here..."
                                    className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <button type="submit" className="bg-primary text-slate-100 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                                </button>
                            </form>
                        </footer>
                    )}
                </div>
            )}
        </>
    );
};

export default Chatbot;