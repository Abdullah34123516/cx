import React from 'react';
import { Language, ServiceDetail } from '../types';
import { TEXTS } from '../constants';
import { SERVICE_ICONS_MAP } from './icons/ServiceIcons';

interface ServicesProps {
  language: Language;
  services: ServiceDetail[];
  onSelectService: (serviceId: string) => void;
}

const Services: React.FC<ServicesProps> = ({ language, services, onSelectService }) => {
  return (
    <section id="services" className="bg-slate-50 py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {TEXTS.services.title[language]}
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
          {services.map((service) => {
            const IconComponent = SERVICE_ICONS_MAP[service.iconName] || (() => null);
            return (
              <div 
                key={service.id} 
                onClick={() => onSelectService(service.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelectService(service.id)}
                className="group flex flex-col items-center text-center p-4 rounded-xl bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-4 group-hover:bg-primary transition-colors duration-300">
                  <IconComponent className="h-10 w-10 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-slate-800">
                  {service.name[language]}
                </h3>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;