import React from 'react';
import { Language, Booking, TimeSlot } from '../types';
import { TEXTS, TIME_SLOTS } from '../constants';
import { ShieldCheckIcon } from './icons/FeatureIcons';

interface BookingConfirmationProps {
  booking: Booking;
  language: Language;
  onGoHome: () => void;
  onTrackBooking: (bookingId: string) => void;
}

const SuccessIcon: React.FC = () => (
    <svg className="h-16 w-16 text-slate-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const StarIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);


const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ booking, language, onGoHome, onTrackBooking }) => {
  const texts = TEXTS.confirmationPage;
  const bookingTexts = TEXTS.bookingFlow;
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language === Language.BN ? 'bn-BD' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const timeSlotLabel = TIME_SLOTS.find(s => s.id === booking.timeSlot)?.label[language];
  const formatCurrency = (val: number) => `৳${val.toLocaleString(language === Language.BN ? 'bn-BD' : 'en-US')}`;

  return (
    <div className="bg-white animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-primary mb-6">
            <SuccessIcon />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {texts.title[language]}
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            {texts.subtitle[language]}
          </p>
          <div className="mt-8 text-center bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 inline-block">
             <span className="text-sm font-semibold text-slate-500">{texts.bookingId[language]}: </span>
             <span className="font-bold text-primary tracking-wider">{booking.id}</span>
          </div>

          <div className="mt-12 text-left space-y-8">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">{texts.summaryTitle[language]}</h2>
                <div className="space-y-3 text-slate-700">
                    <div className="flex justify-between items-start"><span className="font-medium text-slate-500">{bookingTexts.service[language]}:</span> <span className="font-semibold text-right">{booking.service.name[language]}</span></div>
                    <div className="flex justify-between items-start"><span className="font-medium text-slate-500">{bookingTexts.package[language]}:</span> <span className="font-semibold text-right">{booking.packageName}</span></div>
                    <div className="flex justify-between items-start"><span className="font-medium text-slate-500">{bookingTexts.date[language]}:</span> <span className="font-semibold text-right">{formatDate(booking.date)}</span></div>
                    <div className="flex justify-between items-start"><span className="font-medium text-slate-500">{bookingTexts.time[language]}:</span> <span className="font-semibold text-right">{timeSlotLabel}</span></div>
                    <div className="flex justify-between items-start"><span className="font-medium text-slate-500">{bookingTexts.address[language]}:</span> <span className="font-semibold text-right">{booking.address}</span></div>
                    <div className="flex justify-between items-start pt-3 border-t mt-3 font-bold">
                      <span className="text-slate-600">{texts.totalPaid[language]}:</span> 
                      <span className="text-primary text-lg">{formatCurrency(booking.finalPrice)}</span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">{texts.providerTitle[language]}</h2>
                <div className="flex items-center gap-4">
                    <img src={booking.provider.avatar} alt={booking.provider.name} className="h-16 w-16 rounded-full object-cover" />
                    <div className="flex-grow text-left">
                        <h3 className="font-bold text-lg text-slate-800">{booking.provider.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                            <StarIcon className="w-4 h-4 text-warning" />
                            <span>{booking.provider.rating} {texts.rating[language]}</span>
                            {booking.provider.verificationStatus === 'Verified' && (
                                <div className="flex items-center ml-2">
                                    <ShieldCheckIcon className="w-4 h-4 text-primary"/>
                                    <span className="ml-1 font-semibold text-primary">{language === Language.BN ? 'যাচাইকৃত' : 'Verified'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          </div>
          
          <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button onClick={onGoHome} className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-10 rounded-full transition-colors text-lg">
              {texts.done[language]}
            </button>
            <button onClick={() => onTrackBooking(booking.id)} className="w-full sm:w-auto bg-primary hover:bg-sky-700 text-slate-100 font-bold py-3 px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-lg">
              {texts.trackBooking[language]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;