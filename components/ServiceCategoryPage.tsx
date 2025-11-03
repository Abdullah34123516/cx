import React from 'react';
import { Language, ServiceDetail, ServicePackage } from '../types';
import { TEXTS } from '../constants';
import { ClockIcon, PriceTagIcon } from './icons/FeatureIcons';

interface ServiceCategoryPageProps {
  service: ServiceDetail;
  language: Language;
  onGoHome: () => void;
  onBookNow: (service: ServiceDetail, pkg: ServicePackage) => void;
}

const ServiceCategoryPage: React.FC<ServiceCategoryPageProps> = ({ service, language, onGoHome, onBookNow }) => {
  const texts = TEXTS.servicePage;
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-64 sm:h-80 lg:h-96">
        <img 
          src={service.heroImage} 
          alt={service.name[language]}
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center text-slate-100">
          <button onClick={onGoHome} className="text-left mb-4 text-sm font-semibold opacity-80 hover:opacity-100 transition-opacity w-fit">
            &larr; {texts.allServices[language]}
          </button>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            {service.name[language]}
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {texts.description[language]}
            </h2>
            <p className="text-slate-600 leading-relaxed mb-12">
              {service.description[language]}
            </p>

            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              {texts.availablePackages[language]}
            </h3>
            <div className="space-y-4">
              {service.packages.map((pkg) => (
                <div key={pkg.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-grow">
                    <h4 className="font-bold text-lg text-slate-800">{pkg.name[language]}</h4>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                      <span className="flex items-center gap-1.5"><PriceTagIcon className="w-4 h-4" /> {pkg.price_range[language]}</span>
                      <span className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4" /> {pkg.duration[language]}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button 
                      onClick={() => onBookNow(service, pkg)}
                      className="w-full sm:w-auto bg-primary hover:bg-sky-700 text-slate-100 font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                      {texts.book[language]}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceCategoryPage;