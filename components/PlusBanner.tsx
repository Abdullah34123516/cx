import React from 'react';
import { Language } from '../types';
import { TEXTS } from '../constants';

interface PlusBannerProps {
  language: Language;
}

const PlusBanner: React.FC<PlusBannerProps> = ({ language }) => {
  const texts = TEXTS.plusBanner;
  return (
    <section className="bg-gradient-to-r from-primary to-sky-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-slate-100">
          <div className="md:w-2/3 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {texts.title[language]}
            </h2>
            <p className="mt-4 text-lg text-sky-100">
              {texts.subtitle[language]}
            </p>
          </div>
          <div className="flex-shrink-0">
            <button className="bg-slate-100 text-primary font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-lg">
              {texts.learnMore[language]}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlusBanner;