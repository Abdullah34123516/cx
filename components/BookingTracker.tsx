import React, { useState } from 'react';
import { Language, Booking, BookingStatus, TimeSlot } from '../types';
import { TEXTS, TIME_SLOTS } from '../constants';
import { ShieldCheckIcon } from './icons/FeatureIcons';

interface BookingTrackerProps {
  booking: Booking;
  language: Language;
  onGoBack: () => void;
}

const CheckIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const StarIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ViewPhotosModal: React.FC<{ booking: Booking; language: Language; onClose: () => void }> = ({ booking, language, onClose }) => {
  const texts = TEXTS.customerDashboard;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">{texts.jobPhotos[language]}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">&times;</button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
            <div>
                <h3 className="font-bold text-lg mb-2 text-slate-700">{TEXTS.vendorDashboard.before[language]}</h3>
                <div className="grid grid-cols-2 gap-2">
                    {booking.beforePhotoUrls && booking.beforePhotoUrls.length > 0 ? (
                        booking.beforePhotoUrls.map((url, index) => <img key={index} src={url} alt={`Before the job ${index + 1}`} className="w-full h-auto rounded-lg object-cover aspect-square"/>)
                    ) : <p className="text-sm text-slate-500 col-span-2">No photos uploaded.</p>}
                </div>
            </div>
            <div>
                <h3 className="font-bold text-lg mb-2 text-slate-700">{TEXTS.vendorDashboard.after[language]}</h3>
                 <div className="grid grid-cols-2 gap-2">
                    {booking.afterPhotoUrls && booking.afterPhotoUrls.length > 0 ? (
                        booking.afterPhotoUrls.map((url, index) => <img key={index} src={url} alt={`After the job ${index + 1}`} className="w-full h-auto rounded-lg object-cover aspect-square"/>)
                    ) : <p className="text-sm text-slate-500 col-span-2">No photos uploaded.</p>}
                </div>
            </div>
        </div>
        <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end">
            <button onClick={onClose} className="px-4 py-2 font-semibold text-slate-100 bg-primary rounded-lg">{TEXTS.vendorSignUp.close[language]}</button>
        </div>
      </div>
    </div>
  )
}

const BookingTracker: React.FC<BookingTrackerProps> = ({ booking, language, onGoBack }) => {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const texts = TEXTS.bookingTracker;
  const bookingTexts = TEXTS.bookingFlow;
  const confirmationTexts = TEXTS.confirmationPage;

  const statusSteps = [
    { status: BookingStatus.Pending, title: texts.statusPlaced, description: texts.statusPlacedDesc },
    { status: BookingStatus.Accepted, title: texts.statusAssigned, description: texts.statusAssignedDesc },
    { status: BookingStatus.InProgress, title: texts.statusInProgress, description: texts.statusInProgressDesc }, 
    { status: BookingStatus.Completed, title: texts.statusCompleted, description: texts.statusCompletedDesc },
  ];

  const getStatusIndex = (status: BookingStatus) => {
    switch(status) {
        case BookingStatus.Pending: return 0;
        case BookingStatus.Accepted: return 1;
        case BookingStatus.InProgress: return 2;
        case BookingStatus.Completed: return 3;
        case BookingStatus.Cancelled: return -1;
        default: return 0;
    }
  }

  const currentStatusIndex = getStatusIndex(booking.status);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language === Language.BN ? 'bn-BD' : 'en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };
  const timeSlotLabel = TIME_SLOTS.find(s => s.id === booking.timeSlot)?.label[language];

  return (
    <div className="bg-white animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
            <button onClick={onGoBack} className="font-semibold text-primary mb-6">&larr; {texts.backToBookings[language]}</button>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{texts.title[language]}</h1>
                    <p className="text-slate-500 mt-1">{confirmationTexts.bookingId[language]}: <span className="font-bold text-primary">{booking.id}</span></p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Status Timeline */}
                <div>
                    {statusSteps.map((step, index) => (
                         <div key={index} className="flex gap-4 relative">
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${index <= currentStatusIndex ? 'bg-primary border-primary text-slate-100' : 'bg-slate-50 border-slate-300'}`}>
                                    {index < currentStatusIndex ? <CheckIcon className="w-4 h-4"/> : <span className="text-sm font-bold text-slate-500">{index + 1}</span>}
                                </div>
                                {index < statusSteps.length - 1 && <div className={`w-0.5 flex-1 ${index < currentStatusIndex ? 'bg-primary' : 'bg-slate-300'}`}></div>}
                            </div>
                            <div className="pb-8 flex-1">
                                <h3 className={`font-bold text-lg ${index <= currentStatusIndex ? 'text-slate-800' : 'text-slate-400'}`}>{step.title[language]}</h3>
                                <p className="text-sm text-slate-500">{step.description[language]}</p>
                                {booking.delayReason && index === 1 && currentStatusIndex >=1 && (
                                  <p className="text-sm font-semibold text-amber-600 mt-1">{texts.delayInfo[language]}: {booking.delayReason} (~{booking.estimatedDelayMinutes} min)</p>
                                )}
                                {step.status === BookingStatus.Accepted && booking.provider && currentStatusIndex >= index && (
                                    <div className="mt-4 bg-slate-100 p-4 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-4">
                                            <img src={booking.provider.avatar} alt={booking.provider.name} className="h-12 w-12 rounded-full object-cover" />
                                            <div className="flex-grow text-left">
                                                <h3 className="font-bold text-md text-slate-800">{booking.provider.name}</h3>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <StarIcon className="w-4 h-4 text-warning" />
                                                    <span>{booking.provider.rating} {confirmationTexts.rating[language]}</span>
                                                    {booking.provider.verificationStatus === 'Verified' && (
                                                        <div className="flex items-center ml-2">
                                                            <ShieldCheckIcon className="w-4 h-4 text-primary"/>
                                                            <span className="ml-1 font-semibold text-primary text-xs">{language === Language.BN ? 'যাচাইকৃত' : 'Verified'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {step.status === BookingStatus.Completed && booking.beforePhotoUrls && currentStatusIndex >= index && (
                                    <button
                                        onClick={() => setIsPhotoModalOpen(true)}
                                        className="mt-2 bg-sky-100 text-sky-700 font-semibold py-1 px-3 rounded-full text-sm hover:bg-sky-200 transition-colors"
                                    >
                                        {TEXTS.customerDashboard.viewPhotos[language]}
                                    </button>
                                )}
                            </div>
                         </div>
                    ))}
                </div>

                {/* Booking Details */}
                <div className="space-y-6">
                     <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">{confirmationTexts.summaryTitle[language]}</h2>
                        <div className="space-y-3 text-slate-700">
                            <div className="flex justify-between items-start"><span className="font-medium text-slate-500">{bookingTexts.package[language]}:</span> <span className="font-semibold text-right">{booking.packageName}</span></div>
                            <div className="flex justify-between items-start"><span className="font-medium text-slate-500">{bookingTexts.date[language]}:</span> <span className="font-semibold text-right">{formatDate(booking.date)}</span></div>
                            <div className="flex justify-between items-start"><span className="font-medium text-slate-500">{bookingTexts.time[language]}:</span> <span className="font-semibold text-right">{timeSlotLabel}</span></div>
                            <div className="flex justify-between items-start"><span className="font-medium text-slate-500">{bookingTexts.address[language]}:</span> <span className="font-semibold text-right">{booking.address}</span></div>
                        </div>
                    </div>
                     {booking.provider && <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">{confirmationTexts.providerTitle[language]}</h2>
                        <div className="flex items-center gap-4">
                            <img src={booking.provider.avatar} alt={booking.provider.name} className="h-16 w-16 rounded-full object-cover" />
                            <div className="flex-grow text-left">
                                <h3 className="font-bold text-lg text-slate-800">{booking.provider.name}</h3>
                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                    <StarIcon className="w-4 h-4 text-warning" />
                                    <span>{booking.provider.rating} {confirmationTexts.rating[language]}</span>
                                    {booking.provider.verificationStatus === 'Verified' && (
                                        <div className="flex items-center ml-2">
                                            <ShieldCheckIcon className="w-4 h-4 text-primary"/>
                                            <span className="ml-1 font-semibold text-primary">{language === Language.BN ? 'যাচাইকৃত' : 'Verified'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>}
                </div>
            </div>
        </div>
      </div>
      {isPhotoModalOpen && <ViewPhotosModal booking={booking} language={language} onClose={() => setIsPhotoModalOpen(false)} />}
    </div>
  );
};

export default BookingTracker;