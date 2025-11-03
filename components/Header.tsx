import React from 'react';
import { Language, Customer, Vendor, VendorApplication } from '../types';
import { TEXTS } from '../constants';
import { Logo } from './icons/Logo';

interface HeaderProps {
  language: Language;
  currentUser: Customer | null;
  currentVendor: Vendor | VendorApplication | null;
  setLanguage: (lang: Language) => void;
  onGoHome: () => void;
  onVendorClick: () => void;
  onAccountClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ language, currentUser, currentVendor, setLanguage, onGoHome, onVendorClick, onAccountClick, onLogout }) => {
  const isBn = language === Language.BN;
  const loggedInUser = currentUser || currentVendor;

  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <button onClick={onGoHome} className="flex items-center gap-2 focus:outline-none">
              <Logo className="h-8 w-auto text-primary" />
              <span className="text-2xl font-bold text-slate-800">FixBD</span>
            </button>
          </div>
          <nav className="hidden md:flex md:items-center md:space-x-8">
            <a href="#" onClick={(e) => { e.preventDefault(); onGoHome(); }} className="font-medium text-slate-600 hover:text-primary transition-colors">{TEXTS.header.services[language]}</a>
            <a href="#" className="font-medium text-slate-600 hover:text-primary transition-colors">{TEXTS.header.about[language]}</a>
            <a href="#" className="font-medium text-slate-600 hover:text-primary transition-colors">{TEXTS.header.contact[language]}</a>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-slate-100 rounded-full p-1 text-sm font-semibold">
              <button 
                onClick={() => setLanguage(Language.EN)}
                className={`px-3 py-1 rounded-full ${!isBn ? 'bg-slate-50 shadow' : 'text-slate-500'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage(Language.BN)}
                className={`px-3 py-1 rounded-full ${isBn ? 'bg-slate-50 shadow' : 'text-slate-500'}`}
              >
                বাং
              </button>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {loggedInUser ? (
                <>
                  <button onClick={onAccountClick} className="font-semibold text-slate-700 hover:text-primary transition-colors">
                    {loggedInUser.name}
                  </button>
                  <span className="text-slate-300">|</span>
                  <button onClick={onLogout} className="font-medium text-slate-600 hover:text-danger transition-colors">
                    {TEXTS.header.logout[language]}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={onAccountClick}
                    className="font-semibold text-primary hover:text-sky-700 transition-colors"
                  >
                    {TEXTS.header.loginSignUp[language]}
                  </button>
                  <span className="text-slate-300">|</span>
                  {!currentUser && (
                    <button 
                      onClick={onVendorClick}
                      className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
                    >
                      {TEXTS.header.forProfessionals[language]}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;