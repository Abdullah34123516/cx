import React, { useState } from 'react';
import { Language } from '../types';
import { TEXTS } from '../constants';

interface HeroProps {
  language: Language;
  onSearch: (query: string) => void;
}

const Hero: React.FC<HeroProps> = ({ language, onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <section className="relative bg-white pt-16 pb-24 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40">
      <div className="absolute inset-0">
        <img 
            className="w-full h-full object-cover opacity-10" 
            src="https://images.unsplash.com/photo-1528740561666-dc2479703592?q=80&w=2000&auto=format&fit=crop" 
            alt="Clean home background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
      </div>
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
          {TEXTS.hero.title[language]}
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600">
          {TEXTS.hero.subtitle[language]}
        </p>
        <div className="mt-10 max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="sm:flex sm:gap-3 p-2 bg-white rounded-full shadow-2xl shadow-slate-200">
            <div className="relative flex-grow">
               <svg aria-hidden="true" className="absolute inset-y-0 left-4 h-full w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={TEXTS.hero.searchPlaceholder[language]}
                className="w-full pl-11 pr-4 py-3 text-base placeholder-slate-400 border-none focus:ring-0 rounded-full"
              />
            </div>
            <button 
              type="submit"
              className="mt-3 sm:mt-0 w-full sm:w-auto flex-shrink-0 bg-primary hover:bg-sky-700 text-slate-100 font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {TEXTS.hero.searchButton[language]}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;