import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Language, ServiceDetail, TimeSlot, Booking, Customer, ServicePackage, ServiceArea, Vendor, VendorRealtimeStatus, BookingStatus } from '../types';
import { TEXTS, TIME_SLOTS } from '../constants';
import { CalendarIcon, ClockIcon, MapPinIcon, PhoneIcon, UserIcon } from './icons/FormIcons';
import * as api from '../api';

interface BookingFlowProps {
  service: ServiceDetail;
  pkg: ServicePackage;
  customer: Customer | null;
  serviceAreas: ServiceArea[];
  initialDetails?: any | null;
  language: Language;
  onClose: () => void;
  onConfirm: (details: Omit<Booking, 'id' | 'service' | 'provider' | 'status' | 'grossAmount' | 'commission' | 'finalPrice' | 'packageName' | 'customerId'>) => void;
  onAuthRequired: (details: any) => void;
}

const StepIndicator: React.FC<{ step: number; title: string; isActive: boolean }> = ({ step, title, isActive }) => (
  <div className="flex items-center">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${isActive ? 'bg-primary text-slate-100' : 'bg-slate-200 text-slate-500'}`}>
      {step}
    </div>
    <span className={`ml-3 font-semibold ${isActive ? 'text-primary' : 'text-slate-500'}`}>{title}</span>
  </div>
);

const BookingFlow: React.FC<BookingFlowProps> = ({ service, pkg, customer, serviceAreas, initialDetails, language, onClose, onConfirm, onAuthRequired }) => {
  const [currentStep, setCurrentStep] = useState(initialDetails ? 2 : 1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDetails?.date ? new Date(initialDetails.date) : null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(initialDetails?.timeSlot || null);
  const [areaId, setAreaId] = useState(initialDetails?.areaId || '');
  const [phone, setPhone] = useState(customer?.phone || initialDetails?.phone || '');
  const [name, setName] = useState(customer?.name || initialDetails?.name || '');
  
  const [availability, setAvailability] = useState<{ loading: boolean; available: boolean | null; message: string }>({ loading: false, available: null, message: '' });
  const debounceTimeoutRef = useRef<number | null>(null);
  
  const texts = TEXTS.bookingFlow;
  
  const isPlusMember = customer?.subscription?.status === 'Active';
  const discountRate = isPlusMember && customer.subscription ? customer.subscription.discountRate : 0;
  const discountedPrice = pkg.base_price * (1 - discountRate);

  const availableAreas = useMemo(() => {
    const serviceAreaIds = (service.availableAreaIds || []).map(id => String(id));
    
    return serviceAreas.filter(a => 
        a.status === 'Active' && 
        serviceAreaIds.includes(a.id)
    );
  }, [service.availableAreaIds, serviceAreas]);


  useEffect(() => {
    if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
    }

    if (areaId && selectedDate && selectedTimeSlot) {
        setAvailability(prev => ({ ...prev, loading: true, message: '' }));
        
        debounceTimeoutRef.current = window.setTimeout(async () => {
            try {
                const result = await api.checkAvailability(service.id, areaId, selectedDate, selectedTimeSlot);
                
                if (result.available) {
                    setAvailability({ loading: false, available: true, message: '' });
                } else {
                    setAvailability({ loading: false, available: false, message: TEXTS.bookingFlow.noVendorForSlot[language] });
                }
            } catch (error) {
                console.error("Availability check failed:", error);
                const errorMessage = (error as Error).message || "An unknown error occurred.";
                setAvailability({ loading: false, available: false, message: `Error: ${errorMessage}` });
            }
        }, 500); // 500ms debounce
    } else {
        setAvailability({ loading: false, available: null, message: '' });
    }

    return () => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
    };
  }, [areaId, selectedDate, selectedTimeSlot, service.id, language]);


  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });
  }, []);

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleConfirm = () => {
    const selectedArea = serviceAreas.find(a => a.id === areaId);
    if (selectedDate && selectedTimeSlot && selectedArea && phone) {
      const bookingAddress = customer ? customer.address : selectedArea.name[language];
      onConfirm({ date: selectedDate, timeSlot: selectedTimeSlot, address: bookingAddress, phone, serviceArea: areaId });
    }
  }
  
  const handleAuthRequired = () => {
      const selectedArea = serviceAreas.find(a => a.id === areaId);
      if(selectedArea) {
        onAuthRequired({
            date: selectedDate,
            timeSlot: selectedTimeSlot,
            address: selectedArea.name[language],
            areaId: areaId,
            phone,
            name
        });
      }
  };

  const isStep1Valid = selectedDate !== null && selectedTimeSlot !== null;
  const isStep2Valid = areaId.trim() !== '' && phone.trim() !== '' && availability.available === true;
  const isStep2ValidForGuest = isStep2Valid && name.trim() !== '' && availability.available === true;

  const formatCurrency = (val: number) => `৳${val.toLocaleString(language === Language.BN ? 'bn-BD' : 'en-US')}`;

  const OrderSummaryContent = () => (
    <div className="space-y-4">
        <div className="flex justify-between items-center text-slate-600">
            <span>{texts.package[language]}:</span>
            <span className="font-semibold text-slate-800 text-right">{pkg.name[language]}</span>
        </div>
            <div className="flex justify-between items-center text-slate-600">
            <span>{texts.date[language]}:</span>
            <span className="font-semibold text-slate-800">{selectedDate?.toLocaleDateString(language === Language.BN ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        <div className="flex justify-between items-center text-slate-600">
            <span>{texts.time[language]}:</span>
            <span className="font-semibold text-slate-800">{TIME_SLOTS.find(s=>s.id === selectedTimeSlot)?.label[language]}</span>
        </div>
        <div className="pt-4 border-t border-slate-200 space-y-2">
            <div className="flex justify-between text-slate-600">
                <span>{texts.service[language]} Fee</span>
                <span>{formatCurrency(pkg.base_price)}</span>
            </div>
            {isPlusMember && (
                <div className="flex justify-between text-primary font-semibold">
                    <span>{texts.plusMember[language]} ({discountRate * 100}%)</span>
                    <span>- {formatCurrency(pkg.base_price * discountRate)}</span>
                </div>
            )}
        </div>
            <div className="flex justify-between font-bold text-xl border-t-2 border-slate-300 pt-3 mt-3">
            <span className="text-slate-900">{texts.total[language]}</span>
            <span className="text-primary">{formatCurrency(discountedPrice)}</span>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl animate-slide-in-up flex flex-col max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{texts.title[language]}</h2>
              <p className="text-slate-500">{service.name[language]}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
            <div className="flex items-center justify-center space-x-4 mb-8">
                <StepIndicator step={1} title={texts.step1[language]} isActive={currentStep >= 1} />
                <div className="flex-1 h-0.5 bg-slate-200">
                    <div className={`h-full bg-primary transition-all duration-300 ${currentStep > 1 ? 'w-full' : 'w-0'}`}></div>
                </div>
                <StepIndicator step={2} title={texts.step2[language]} isActive={currentStep >= 2} />
            </div>

            {currentStep === 1 && (
                <div className="animate-fade-in">
                    <h3 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2"><CalendarIcon className="w-5 h-5" /> {texts.selectDate[language]}</h3>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                        {dates.map((date, i) => (
                        <button key={i} onClick={() => setSelectedDate(date)} className={`p-3 rounded-xl text-center transition-all duration-300 border-2 ${selectedDate?.toDateString() === date.toDateString() ? 'bg-primary border-primary text-slate-100 font-bold shadow-lg scale-105' : 'bg-white border-slate-200 hover:border-primary'}`}>
                            <div className="font-medium text-sm">{language === Language.BN ? date.toLocaleDateString('bn-BD', { weekday: 'short' }) : date.toLocaleDateString('en-US', { weekday: 'short' }) }</div>
                            <div className="font-bold text-2xl mt-1">{date.getDate()}</div>
                        </button>
                        ))}
                    </div>
                    <h3 className="font-semibold text-lg text-slate-800 mt-8 mb-4 flex items-center gap-2"><ClockIcon className="w-5 h-5" /> {texts.selectTime[language]}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {TIME_SLOTS.map((slot) => (
                        <button key={slot.id} onClick={() => setSelectedTimeSlot(slot.id)} className={`p-4 rounded-xl font-semibold text-center transition-all duration-300 border-2 ${selectedTimeSlot === slot.id ? 'bg-primary border-primary text-slate-100 shadow-lg scale-105' : 'bg-white border-slate-200 hover:border-primary'}`}>
                            {slot.label[language]}
                        </button>
                        ))}
                    </div>
                </div>
            )}
            
            {currentStep === 2 && (
                 <div className="animate-fade-in">
                    {customer ? (
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-slate-50/70 p-6 rounded-xl border border-slate-200">
                                <h3 className="font-bold text-lg text-slate-800 mb-4">{texts.orderSummary[language]}</h3>
                                <OrderSummaryContent />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 mb-4">{texts.yourDetails[language]}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="relative">
                                            <MapPinIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-4 -translate-y-1/2 pointer-events-none" />
                                            <select value={areaId} onChange={(e) => setAreaId(e.target.value)} disabled={availableAreas.length === 0} className="w-full pl-11 pr-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition appearance-none disabled:cursor-not-allowed disabled:bg-slate-200">
                                                <option value="" disabled>{texts.selectAddress[language]}</option>
                                                {availableAreas.length > 0 ? (
                                                    availableAreas.map(area => (
                                                        <option key={area.id} value={area.id}>{area.name[language]}</option>
                                                    ))
                                                ) : (
                                                    <option disabled>No areas configured for this service</option>
                                                )}
                                            </select>
                                        </div>
                                        {availability.loading && <p className="text-sm text-slate-500 mt-1 px-1 animate-pulse">Checking availability...</p>}
                                        {!availability.loading && availability.available === false && <p className="text-sm text-danger mt-1 px-1">{availability.message}</p>}
                                    </div>
                                    <div className="relative">
                                        <PhoneIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-4 -translate-y-1/2" />
                                        <input type="tel" placeholder={texts.phonePlaceholder[language]} value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-md mx-auto">
                            <details className="bg-slate-50 border rounded-xl" open>
                                <summary className="p-4 font-bold text-lg text-slate-800 cursor-pointer list-none flex justify-between items-center">
                                    {texts.orderSummary[language]}
                                    <svg className="w-5 h-5 transition-transform duration-300 transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </summary>
                                <div className="p-4 border-t border-slate-200">
                                    <OrderSummaryContent />
                                </div>
                            </details>
                             <div className="mt-8">
                                <h3 className="font-bold text-lg text-slate-800 mb-4">{language === 'en' ? 'Your Details to Continue' : 'চালিয়ে যেতে আপনার বিবরণ'}</h3>
                                <div className="space-y-4">
                                     <div className="relative">
                                        <UserIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-4 -translate-y-1/2" />
                                        <input type="text" placeholder={TEXTS.authPage.namePlaceholder[language]} value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition"/>
                                    </div>
                                    <div>
                                        <div className="relative">
                                            <MapPinIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-4 -translate-y-1/2 pointer-events-none" />
                                            <select value={areaId} onChange={(e) => setAreaId(e.target.value)} disabled={availableAreas.length === 0} className="w-full pl-11 pr-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition appearance-none disabled:cursor-not-allowed disabled:bg-slate-200">
                                                <option value="" disabled>{texts.selectAddress[language]}</option>
                                                {availableAreas.length > 0 ? (
                                                    availableAreas.map(area => (
                                                        <option key={area.id} value={area.id}>{area.name[language]}</option>
                                                    ))
                                                ) : (
                                                    <option disabled>No areas configured for this service</option>
                                                )}
                                            </select>
                                        </div>
                                        {availability.loading && <p className="text-sm text-slate-500 mt-1 px-1 animate-pulse">Checking availability...</p>}
                                        {!availability.loading && availability.available === false && <p className="text-sm text-danger mt-1 px-1">{availability.message}</p>}
                                    </div>
                                    <div className="relative">
                                        <PhoneIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-4 -translate-y-1/2" />
                                        <input type="tel" placeholder={texts.phonePlaceholder[language]} value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition"/>
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="p-6 bg-slate-50 rounded-b-2xl flex justify-between items-center flex-shrink-0">
          <button onClick={handleBack} disabled={currentStep === 1} className="font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed">
            &larr; {texts.back[language]}
          </button>
          {currentStep < 2 ? (
            <button onClick={handleNext} disabled={!isStep1Valid} className="bg-primary text-slate-100 font-semibold py-3 px-8 rounded-full shadow-md hover:bg-sky-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed transform hover:-translate-y-0.5">
              {texts.next[language]} &rarr;
            </button>
          ) : customer ? (
            <button onClick={handleConfirm} disabled={!isStep2Valid} className="bg-primary text-slate-100 font-semibold py-3 px-8 rounded-full shadow-md hover:bg-sky-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed transform hover:-translate-y-0.5">
              {texts.confirmBooking[language]}
            </button>
          ) : (
             <button onClick={handleAuthRequired} disabled={!isStep2ValidForGuest} className="bg-primary text-slate-100 font-semibold py-3 px-8 rounded-full shadow-md hover:bg-sky-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed transform hover:-translate-y-0.5">
              {language === 'en' ? 'Continue to Login/Sign Up' : 'লগইন/সাইন আপ করতে এগিয়ে যান'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;