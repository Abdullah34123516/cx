
import React from 'react';
import { Language } from '../types';
import { TEXTS, WHY_CHOOSE_US_POINTS } from '../constants';

interface WhyChooseUsProps {
  language: Language;
}

const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ language }) => {
  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {TEXTS.whyChooseUs.title[language]}
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              {TEXTS.whyChooseUs.subtitle[language]}
            </p>
            <div className="mt-10 space-y-8">
              {WHY_CHOOSE_US_POINTS.map(({ Icon, title, description }, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {title[language]}
                    </h3>
                    <p className="mt-1 text-slate-600">
                      {description[language]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <img 
              src="https://images.unsplash.com/photo-1575796243229-588a442881a4?q=80&w=1887&auto=format&fit=crop" 
              alt="Friendly worker" 
              className="rounded-2xl shadow-xl w-full h-auto object-cover aspect-square"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;