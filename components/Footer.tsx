import React from 'react';
import { Language } from '../types';
import { TEXTS } from '../constants';
import { Logo } from './icons/Logo';

interface FooterProps {
  language: Language;
}

const Footer: React.FC<FooterProps> = ({ language }) => {
  return (
    <footer className="bg-slate-800 text-slate-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <Logo className="h-8 w-auto text-slate-100" />
              <span className="text-2xl font-bold text-slate-100">FixBD</span>
            </a>
            <p className="max-w-xs text-slate-400">{TEXTS.footer.about[language]}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 tracking-wider uppercase">{TEXTS.footer.quickLinks[language]}</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="hover:text-slate-100 transition-colors">{TEXTS.header.services[language]}</a></li>
              <li><a href="#" className="hover:text-slate-100 transition-colors">{TEXTS.header.about[language]}</a></li>
              <li><a href="#" className="hover:text-slate-100 transition-colors">{TEXTS.header.contact[language]}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 tracking-wider uppercase">{TEXTS.footer.legal[language]}</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="hover:text-slate-100 transition-colors">{TEXTS.footer.terms[language]}</a></li>
              <li><a href="#" className="hover:text-slate-100 transition-colors">{TEXTS.footer.privacy[language]}</a></li>
              <li><a href="/admin.html" className="hover:text-slate-100 transition-colors">{TEXTS.footer.adminPanel[language]}</a></li>
              <li><a href="/admin.html" className="hover:text-slate-100 transition-colors">{TEXTS.footer.moderatorLogin[language]}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 tracking-wider uppercase">{TEXTS.footer.followUs[language]}</h3>
            <div className="mt-4 flex space-x-4">
              {/* Social Icons */}
              <a href="#" className="text-slate-400 hover:text-slate-100 transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              {/* Add other social icons */}
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-slate-700 text-center text-slate-500 text-sm">
          <p>{TEXTS.footer.copyright[language]}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;