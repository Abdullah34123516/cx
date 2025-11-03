
import React from 'react';
import { Language } from '../types';
import { TEXTS } from '../constants';

interface HowItWorksProps {
  language: Language;
}

const steps = [
  {
    number: '1',
    title: TEXTS.howItWorks.step1Title,
    description: TEXTS.howItWorks.step1Desc,
  },
  {
    number: '2',
    title: TEXTS.howItWorks.step2Title,
    description: TEXTS.howItWorks.step2Desc,
  },
  {
    number: '3',
    title: TEXTS.howItWorks.step3Title,
    description: TEXTS.howItWorks.step3Desc,
  },
];

const HowItWorks: React.FC<HowItWorksProps> = ({ language }) => {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {TEXTS.howItWorks.title[language]}
          </h2>
        </div>
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 hidden md:block" aria-hidden="true"></div>
          <div className="relative grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center p-6 bg-slate-50/50 rounded-lg">
                <div className="flex items-center justify-center mx-auto h-16 w-16 rounded-full bg-primary text-slate-100 font-bold text-2xl border-4 border-slate-50 shadow-md mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {step.title[language]}
                </h3>
                <p className="text-slate-600">
                  {step.description[language]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;