import React, { useState, useEffect } from 'react';
import { Language, Customer, Booking, BookingStatus, ServiceDetail } from '../types';
import { TEXTS } from '../constants';
import { Logo } from './icons/Logo';
import { SERVICE_ICONS_MAP } from './icons/ServiceIcons';
import { UserIcon, PhoneIcon, MapPinIcon } from './icons/FormIcons';
import { HomeIcon, PlusCircleIcon, UserCircleIcon, ChatBubbleIcon } from './icons/NavIcons';
import * as api from '../api';

const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
);

interface CustomerDashboardProps {
  customer: Customer;
  services: ServiceDetail[];
  language: Language;
  setLanguage: (lang: Language) => void;
  onBookNewService: () => void;
  onRateService: (bookingId: string, rating: number, review: string) => void;
  onTrackBooking: (bookingId: string) => void;
  onBookAgain: (booking: Booking) => void;
  onLogout: () => void;
  onLiveChat: () => void;
  onUpdateDetails: (customerId: string, data: { name: string; address: string; avatar?: string; }) => void;
}

const BottomNavBar: React.FC<{
    activeView: 'dashboard' | 'profile';
    setActiveView: (view: 'dashboard' | 'profile') => void;
    onBookNewService: () => void;
    onLiveChat: () => void;
    language: Language;
}> = ({ activeView, setActiveView, onBookNewService, onLiveChat, language }) => {
    const navItems = [
        { name: {en: 'Home', bn: 'হোম'}, icon: HomeIcon, view: 'dashboard', action: () => setActiveView('dashboard') },
        { name: {en: 'Book', bn: 'বুক করুন'}, icon: PlusCircleIcon, action: onBookNewService },
        { name: {en: 'Profile', bn: 'প্রোফাইল'}, icon: UserCircleIcon, view: 'profile', action: () => setActiveView('profile') },
        { name: {en: 'Support', bn: 'সাপোর্ট'}, icon: ChatBubbleIcon, action: onLiveChat }
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-t-lg z-20">
            <div className="flex justify-around items-center h-16">
                {navItems.map(item => {
                    const isActive = item.view && activeView === item.view;
                    return (
                        <button key={item.name.en} onClick={item.action} className={`flex flex-col items-center justify-center gap-1 text-xs font-medium w-full transition-colors ${isActive ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}>
                            <item.icon className="w-6 h-6" />
                            <span>{item.name[language]}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

const DesktopSideNav: React.FC<{
    activeView: 'dashboard' | 'profile';
    setActiveView: (view: 'dashboard' | 'profile') => void;
    onBookNewService: () => void;
    onLiveChat: () => void;
    language: Language;
}> = ({ activeView, setActiveView, onBookNewService, onLiveChat, language }) => {
    const navItems = [
        { name: {en: 'Dashboard', bn: 'ড্যাশবোর্ড'}, icon: HomeIcon, view: 'dashboard', action: () => setActiveView('dashboard') },
        { name: {en: 'My Profile', bn: 'আমার প্রোফাইল'}, icon: UserCircleIcon, view: 'profile', action: () => setActiveView('profile') },
        { name: {en: 'Book New Service', bn: 'নতুন সার্ভিস বুক'}, icon: PlusCircleIcon, action: onBookNewService },
        { name: {en: 'Live Support', bn: 'লাইভ সাপোর্ট'}, icon: ChatBubbleIcon, action: onLiveChat }
    ];

    return (
        <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 p-4">
            <nav className="flex-1 space-y-2">
                {navItems.map(item => {
                    const isActive = item.view && activeView === item.view;
                    return (
                        <button 
                            key={item.name.en} 
                            onClick={item.action} 
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-semibold transition-colors ${
                                isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <item.icon className="w-6 h-6" />
                            <span>{item.name[language]}</span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
};


const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ customer, services, language, setLanguage, onBookNewService, onRateService, onTrackBooking, onBookAgain, onLogout, onLiveChat, onUpdateDetails }) => {
  const [bookingToRate, setBookingToRate] = useState<Booking | null>(null);
  const [bookingToViewPhotos, setBookingToViewPhotos] = useState<Booking | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'profile'>('dashboard');
  
  const texts = TEXTS.customerDashboard;
  const isBn = language === Language.BN;

  const upcomingBookings = customer.bookingHistory
    .filter(b => [BookingStatus.Accepted, BookingStatus.InProgress, BookingStatus.Pending].includes(b.status))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastBookings = customer.bookingHistory
    .filter(b => [BookingStatus.Completed, BookingStatus.Cancelled].includes(b.status))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  const handleRatingSubmit = (rating: number, review: string) => {
    if(bookingToRate) {
        onRateService(bookingToRate.id, rating, review);
        setBookingToRate(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-auto text-primary" />
            <span className="text-2xl font-bold text-slate-800">FixBD</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="font-semibold text-slate-800">{customer.name}</p>
                <button onClick={onLogout} className="text-sm text-slate-500 hover:text-danger">{texts.logout[language]}</button>
            </div>
            <img src={customer.avatar} alt={customer.name} className="h-12 w-12 rounded-full object-cover"/>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <DesktopSideNav
            activeView={activeView}
            setActiveView={setActiveView}
            onBookNewService={onBookNewService}
            onLiveChat={onLiveChat}
            language={language}
        />
        <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:pb-8 pb-24">
                <div className="max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
                    <h1 className="text-2xl font-bold text-slate-800">{texts.welcome[language]}, {customer.name.split(' ')[0]}!</h1>
                    <p className="text-slate-600 mt-1">{language === 'en' ? 'What do you need help with today?' : 'আজ আপনার কী সাহায্য প্রয়োজন?'}</p>
                    <div className="mt-4 hidden sm:flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={onBookNewService}
                        className="bg-primary text-slate-100 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-sky-700 transition-all duration-300 transform hover:-translate-y-0.5 text-lg"
                    >
                        + {texts.bookNewService[language]}
                    </button>
                    <button 
                        onClick={onLiveChat}
                        className="bg-white border-2 border-primary text-primary font-bold py-3 px-8 rounded-full shadow-md hover:bg-primary/5 transition-all duration-300 transform hover:-translate-y-0.5 text-lg"
                    >
                        {texts.liveChat[language]}
                    </button>
                    </div>
                </div>

                {activeView === 'dashboard' && (
                    <>
                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">{texts.myUpcomingVisits[language]}</h2>
                        {upcomingBookings.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingBookings.map(booking => (
                                    <NextVisitCard key={booking.id} booking={booking} language={language} onTrackBooking={onTrackBooking} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                                <p className="text-slate-500">{texts.noUpcomingBookings[language]}</p>
                                <button 
                                    onClick={onBookNewService}
                                    className="mt-4 bg-primary text-slate-100 font-bold py-2 px-6 rounded-full shadow-md hover:bg-sky-700 transition-colors"
                                >
                                    {texts.bookNewService[language]}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">{texts.recentServices[language]}</h2>
                        {pastBookings.length > 0 ? (
                        <div className="space-y-4">
                            {pastBookings.map(booking => (
                            <PastServiceCard key={booking.id} booking={booking} language={language} onBookAgain={onBookAgain} onRate={() => setBookingToRate(booking)} onViewPhotos={() => setBookingToViewPhotos(booking)} />
                            ))}
                        </div>
                        ) : (
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                            <p className="text-slate-500">{texts.noRecentServices[language]}</p>
                        </div>
                        )}
                    </div>
                    </>
                )}

                {activeView === 'profile' && (
                    <div className="mt-8 animate-fade-in">
                    <MyInfoCard customer={customer} onUpdateDetails={onUpdateDetails} language={language} />
                    </div>
                )}

                </div>
            </div>
        </main>
      </div>

      <BottomNavBar
        activeView={activeView}
        setActiveView={setActiveView}
        onBookNewService={onBookNewService}
        onLiveChat={onLiveChat}
        language={language}
      />

      {bookingToRate && <RatingModal booking={bookingToRate} language={language} onClose={() => setBookingToRate(null)} onSubmit={handleRatingSubmit} />}
      {bookingToViewPhotos && <ViewPhotosModal booking={bookingToViewPhotos} language={language} onClose={() => setBookingToViewPhotos(null)} />}
    </div>
  );
};

const MyInfoCard: React.FC<{ customer: Customer; onUpdateDetails: (id: string, data: {name: string, address: string, avatar?: string}) => void; language: Language}> = ({ customer, onUpdateDetails, language }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(customer.name);
    const [address, setAddress] = useState(customer.address);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const texts = TEXTS.customerDashboard;

    useEffect(() => {
        // Cleanup function to revoke the object URL
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);


    const handleSave = async () => {
        let finalAvatarUrl = customer.avatar;
        if (avatarFile) {
            setIsUploading(true);
            try {
                finalAvatarUrl = await api.uploadFileToS3(avatarFile);
            } catch (err) {
                console.error("Avatar upload failed:", err);
                alert("Avatar upload failed. Profile details saved without new picture.");
            } finally {
                setIsUploading(false);
            }
        }
        onUpdateDetails(customer.id, { name, address, avatar: finalAvatarUrl });
        setIsEditing(false);
        setAvatarFile(null);
        setAvatarPreview(null);
    };

    const handleCancel = () => {
        setName(customer.name);
        setAddress(customer.address);
        setAvatarFile(null);
        setAvatarPreview(null);
        setIsEditing(false);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const inputClasses = "w-full p-3 bg-slate-100 border-2 border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition";

    return (
        <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">{texts.myInfo[language]}</h2>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                {!isEditing ? (
                    <div className="flex justify-between items-start">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <img src={customer.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover"/>
                                <div>
                                    <p className="text-sm text-slate-500">{TEXTS.vendorSignUp.fullName[language]}</p>
                                    <p className="font-semibold text-slate-800 text-lg">{customer.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <PhoneIcon className="w-6 h-6 text-slate-400" />
                                <div>
                                    <p className="text-sm text-slate-500">{TEXTS.vendorSignUp.phone[language]}</p>
                                    <p className="font-semibold text-slate-800">{customer.phone}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4">
                                <MapPinIcon className="w-6 h-6 text-slate-400" />
                                <div>
                                    <p className="text-sm text-slate-500">{TEXTS.vendorSignUp.address[language]}</p>
                                    <p className="font-semibold text-slate-800">{customer.address}</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsEditing(true)} className="bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-full text-sm hover:bg-slate-200 transition-colors">
                            {texts.editInfo[language]}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center gap-4">
                             <div className="relative">
                                <img src={avatarPreview || customer.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover"/>
                                <label htmlFor="avatar-edit" className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                                    <input id="avatar-edit" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                </label>
                             </div>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
                        </div>
                        <div className="flex items-center gap-4">
                            <PhoneIcon className="w-6 h-6 text-slate-400" />
                            <p className="font-semibold text-slate-800 p-3">{customer.phone} <span className="text-xs text-slate-500">({language === 'en' ? 'cannot be changed' : 'পরিবর্তন করা যাবে না'})</span></p>
                        </div>
                        <div className="flex items-center gap-4">
                            <MapPinIcon className="w-6 h-6 text-slate-400" />
                            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClasses} />
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={handleCancel} className="bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-full text-sm hover:bg-slate-200 transition-colors">
                                {texts.cancelEdit[language]}
                            </button>
                            <button onClick={handleSave} disabled={isUploading} className="bg-primary text-slate-100 font-semibold py-2 px-4 rounded-full text-sm hover:bg-sky-700 transition-colors disabled:bg-slate-400">
                                {isUploading ? 'Uploading...' : texts.saveInfo[language]}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


const NextVisitCard: React.FC<{ booking: Booking, language: Language, onTrackBooking: (id: string) => void }> = ({ booking, language, onTrackBooking }) => {
  const texts = TEXTS.customerDashboard;
  const formatDate = (date: Date) => new Date(date).toLocaleDateString(language === Language.BN ? 'bn-BD' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const Icon = SERVICE_ICONS_MAP[booking.service.iconName];
  
  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg border border-primary/20 flex flex-col sm:flex-row gap-5 items-center">
      <div className="flex-shrink-0">
        {Icon && <Icon className="w-12 h-12 text-primary" />}
      </div>
      <div className="flex-grow text-center sm:text-left">
        <p className="font-bold text-lg text-slate-800">{booking.packageName}</p>
        <p className="text-slate-600">{formatDate(booking.date)}</p>
        {booking.status === BookingStatus.InProgress && (
            <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                {language === 'en' ? 'In Progress' : 'চলমান'}
            </span>
        )}
        {booking.delayReason && (
            <p className="text-sm font-semibold text-amber-600 mt-1">{texts.delayAlert[language]} {booking.delayReason} (~{booking.estimatedDelayMinutes} min)</p>
        )}
      </div>
      <div className="flex-shrink-0 flex sm:flex-col items-center gap-4">
        {booking.provider ? (
            <div className="flex items-center gap-2">
            <img src={booking.provider.avatar} alt={booking.provider.name} className="h-10 w-10 rounded-full object-cover" />
            <span className="font-semibold text-slate-700">{booking.provider.name}</span>
            </div>
        ) : (
            <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Finding a pro...</span>
        )}
        <button onClick={() => onTrackBooking(booking.id)} className="bg-primary/10 text-primary font-bold py-2 px-5 rounded-full hover:bg-primary/20 transition-colors">
          {texts.trackService[language]}
        </button>
      </div>
    </div>
  );
}

const PastServiceCard: React.FC<{ booking: Booking, language: Language, onBookAgain: (b: Booking) => void, onRate: () => void, onViewPhotos: () => void }> = ({ booking, language, onBookAgain, onRate, onViewPhotos }) => {
  const texts = TEXTS.customerDashboard;
  const formatDate = (date: Date) => new Date(date).toLocaleDateString(language === Language.BN ? 'bn-BD' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const Icon = SERVICE_ICONS_MAP[booking.service.iconName];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center">
      {Icon && <Icon className="w-8 h-8 text-slate-500 flex-shrink-0" />}
      <div className="flex-grow text-center sm:text-left">
        <p className="font-semibold text-slate-800">{booking.packageName}</p>
        <p className="text-sm text-slate-500">{formatDate(booking.date)}</p>
      </div>
      <div className="flex-shrink-0 flex items-center flex-wrap justify-center sm:justify-end gap-2">
        {booking.status === BookingStatus.Completed && booking.beforePhotoUrls && booking.beforePhotoUrls.length > 0 && (
          <button onClick={onViewPhotos} className="bg-sky-100 text-sky-700 font-semibold py-2 px-4 rounded-full text-sm hover:bg-sky-200 transition-colors">
            {texts.viewPhotos[language]}
          </button>
        )}
        {booking.status === BookingStatus.Completed && !booking.rating && (
          <button onClick={onRate} className="bg-warning text-white font-semibold py-2 px-4 rounded-full text-sm hover:bg-amber-500 transition-colors">
            {texts.rateExperience[language]}
          </button>
        )}
         {booking.rating && (
            <div className="flex items-center gap-1">
                {[...Array(booking.rating)].map((_, i) => <StarIcon key={i} className="w-5 h-5 text-warning" />)}
            </div>
        )}
        <button onClick={() => onBookAgain(booking)} className="bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-full text-sm hover:bg-slate-200 transition-colors">
          {texts.bookAgain[language]}
        </button>
      </div>
    </div>
  );
}

const RatingModal: React.FC<{
    booking: Booking;
    language: Language;
    onClose: () => void;
    onSubmit: (rating: number, review: string) => void;
}> = ({ booking, language, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const texts = TEXTS.customerDashboard;
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <h2 className="text-xl font-bold text-slate-800">{texts.ratingTitle[language]} {booking.provider?.name}</h2>
                    <p className="text-sm text-slate-500">{booking.packageName}</p>
                    <p className="font-semibold text-slate-700 mt-6 mb-2">{texts.howWasService[language]}</p>
                    <div className="flex justify-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}>
                                <StarIcon className={`w-10 h-10 transition-colors ${(hoverRating || rating) >= star ? 'text-warning' : 'text-slate-300'}`} />
                            </button>
                        ))}
                    </div>
                    <textarea value={review} onChange={e => setReview(e.target.value)} placeholder={texts.leaveReviewPlaceholder[language]} rows={3} className="w-full p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary transition"></textarea>
                </div>
                <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end">
                    <button onClick={() => onSubmit(rating, review)} disabled={rating === 0} className="bg-primary text-slate-100 font-bold py-2 px-6 rounded-full shadow-md hover:bg-sky-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed">
                        {texts.submitRating[language]}
                    </button>
                </div>
            </div>
        </div>
    );
};

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

export default CustomerDashboard;