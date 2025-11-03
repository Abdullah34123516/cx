



import React from 'react';
import { Language, Customer, Vendor, VendorApplication } from '../types';
import { TEXTS } from '../constants';
import Header from './Header';
import Footer from './Footer';

interface VendorLandingPageProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    onSignUp: () => void;
    onLogin: () => void;
    onExit: () => void;
    currentUser: Customer | null;
    currentVendor: Vendor | VendorApplication | null;
    onLogout: () => void;
    onAccountClick: () => void;
}

const VendorLandingPage: React.FC<VendorLandingPageProps> = ({ language, setLanguage, onSignUp, onLogin, onExit, currentUser, currentVendor, onLogout, onAccountClick }) => {
    const texts = TEXTS.vendorLanding;
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header 
                language={language}
                setLanguage={setLanguage}
                onGoHome={onExit}
                onVendorClick={() => {}}
                onAccountClick={onAccountClick}
                currentUser={currentUser}
                currentVendor={currentVendor}
                onLogout={onLogout}
            />
            <main className="flex-1">
                <section className="relative bg-slate-50 pt-16 pb-24 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40">
                    <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
                        {texts.title[language]}
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600">
                        {texts.subtitle[language]}
                        </p>
                        <div className="mt-10 max-w-md mx-auto flex flex-col sm:flex-row sm:justify-center gap-4">
                            <button 
                                onClick={onSignUp}
                                className="w-full sm:w-auto flex-shrink-0 bg-primary hover:bg-sky-700 text-slate-100 font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                {texts.signUp[language]}
                            </button>
                            {!currentUser && !currentVendor && (
                                <button
                                    onClick={onLogin} 
                                    className="w-full sm:w-auto flex-shrink-0 bg-slate-100 hover:bg-slate-200 text-primary font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200"
                                >
                                    {texts.login[language]}
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            </main>
            <Footer language={language} />
        </div>
    );
};

export default VendorLandingPage;