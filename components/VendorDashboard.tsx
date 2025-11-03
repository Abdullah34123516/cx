import React, { useState, useEffect } from 'react';
import { Language, Vendor, Booking, BookingStatus, TimeSlot, WorkingHours, VendorSubscription, ServiceDetail, VendorRealtimeStatus, Withdrawal, WithdrawalStatus } from '../types';
import { TEXTS, TIME_SLOTS } from '../constants';
import { Logo } from './icons/Logo';
import { SERVICE_ICONS_MAP } from './icons/ServiceIcons';
import { BriefcaseIcon, ClockHistoryIcon, UserCircleIcon, BanknotesIcon } from './icons/NavIcons';
import * as api from '../api';

interface VendorDashboardProps {
  vendor: Vendor;
  services: ServiceDetail[];
  withdrawals: Withdrawal[];
  language: Language;
  onExit: () => void;
  setLanguage: (lang: Language) => void;
  onUpdateWorkingHours: (workingHours: WorkingHours) => void;
  onUpdateRealtimeStatus: (status: VendorRealtimeStatus) => void;
  onToggleAutoAccept: () => void;
  onCompleteJobWithPhoto: (bookingId: string, afterPhotoUrls: string[]) => void;
  onStartJobWithPhoto: (bookingId: string, beforePhotoUrls: string[]) => void;
  onReportDelay: (bookingId: string, reason: string, minutes: number) => void;
  onRequestWithdrawal: (vendorId: string, amount: number, bKashNumber: string) => void;
  onUpdateDetails: (data: Partial<Vendor>) => void;
}

const VendorBottomNavBar: React.FC<{
    activeView: 'jobs' | 'history' | 'profile';
    setActiveView: (view: 'jobs' | 'history' | 'profile') => void;
    onWithdrawClick: () => void;
    language: Language;
}> = ({ activeView, setActiveView, onWithdrawClick, language }) => {
    const texts = TEXTS.vendorBottomNav;
    const navItems = [
        { name: texts.jobs, icon: BriefcaseIcon, view: 'jobs', action: () => setActiveView('jobs') },
        { name: texts.history, icon: ClockHistoryIcon, view: 'history', action: () => setActiveView('history') },
        { name: texts.profile, icon: UserCircleIcon, view: 'profile', action: () => setActiveView('profile') },
        { name: texts.withdraw, icon: BanknotesIcon, action: onWithdrawClick }
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


const VendorDashboard: React.FC<VendorDashboardProps> = ({ vendor, services, withdrawals, language, onExit, setLanguage, onUpdateWorkingHours, onUpdateRealtimeStatus, onToggleAutoAccept, onStartJobWithPhoto, onCompleteJobWithPhoto, onReportDelay, onRequestWithdrawal, onUpdateDetails }) => {
  const [activeView, setActiveView] = useState<'jobs' | 'history' | 'profile'>('jobs');
  const [jobAction, setJobAction] = useState<{booking: Booking, mode: 'start' | 'complete'} | null>(null);
  const [delayModalForBooking, setDelayModalForBooking] = useState<Booking | null>(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWorkingHoursEditing, setIsWorkingHoursEditing] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);

  const texts = TEXTS.vendorDashboard;
  
  const newJobs = vendor.serviceHistory.filter(b => b.status === BookingStatus.Accepted);
  const ongoingJobs = vendor.serviceHistory.filter(b => b.status === BookingStatus.InProgress);
  const pastJobs = vendor.serviceHistory.filter(b => [BookingStatus.Completed, BookingStatus.Cancelled].includes(b.status));

  const isOffline = vendor.realtimeStatus === VendorRealtimeStatus.Offline;

  return (
    <div className="min-h-screen bg-slate-50">
        <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Logo className="h-8 w-auto text-primary" />
                    <span className="text-2xl font-bold text-slate-800">FixBD</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="font-semibold text-slate-700">{vendor.name}</p>
                        <button onClick={onExit} className="text-xs text-slate-500 hover:text-danger">{texts.logout[language]}</button>
                    </div>
                    <img src={vendor.avatar} alt={vendor.name} className="h-12 w-12 rounded-full object-cover"/>
                </div>
            </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                     <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">{texts.welcome[language]}, {vendor.name.split(' ')[0]}!</h1>
                            <p className="text-slate-600 mt-1">{language === 'en' ? 'You are currently' : 'আপনি বর্তমানে'}{' '}
                                <span className={`font-bold ${isOffline ? 'text-slate-500' : 'text-green-600'}`}>
                                    {isOffline ? texts.statusOffline[language] : texts.statusAvailable[language]}
                                </span>.
                            </p>
                        </div>
                        <div>
                            {isOffline ? (
                                <button onClick={() => onUpdateRealtimeStatus(VendorRealtimeStatus.Available)} className="bg-success text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-emerald-600 transition-colors">
                                    {texts.goOnline[language]}
                                </button>
                            ) : (
                                <button onClick={() => onUpdateRealtimeStatus(VendorRealtimeStatus.Offline)} className="bg-danger text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-rose-600 transition-colors">
                                    {texts.goOffline[language]}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {activeView === 'jobs' && (
                    <div className="animate-fade-in space-y-8">
                        <DashboardSection title={texts.newJobs[language]} emptyMessage={texts.noNewJobs[language]} bookings={newJobs} onStartRequest={(b) => setJobAction({booking: b, mode: 'start'})} onCompleteRequest={(b) => setJobAction({booking: b, mode: 'complete'})} onReportDelay={setDelayModalForBooking} language={language} />
                        <DashboardSection title={texts.ongoingJobs[language]} emptyMessage={texts.noOngoingJobs[language]} bookings={ongoingJobs} onStartRequest={(b) => setJobAction({booking: b, mode: 'start'})} onCompleteRequest={(b) => setJobAction({booking: b, mode: 'complete'})} onReportDelay={setDelayModalForBooking} language={language} />
                    </div>
                )}
                
                {activeView === 'history' && (
                    <div className="animate-fade-in space-y-8">
                        <DashboardSection title={texts.serviceHistory[language]} emptyMessage={texts.noPastJobs[language]} bookings={pastJobs} onStartRequest={(b) => setJobAction({booking: b, mode: 'start'})} onCompleteRequest={(b) => setJobAction({booking: b, mode: 'complete'})} onReportDelay={setDelayModalForBooking} language={language} />
                    </div>
                )}
                
                {activeView === 'profile' && (
                    <div className="animate-fade-in space-y-8">
                        <ProfileAndEarnings 
                          vendor={vendor} 
                          language={language} 
                          onToggleAutoAccept={onToggleAutoAccept} 
                          onEditClick={() => setIsProfileEditing(true)}
                          onUpdateRealtimeStatus={onUpdateRealtimeStatus}
                        />
                        {isWorkingHoursEditing ? (
                            <WorkingHoursEditor vendor={vendor} language={language} onSaveChanges={(hours) => { onUpdateWorkingHours(hours); setIsWorkingHoursEditing(false); }} onCancel={() => setIsWorkingHoursEditing(false)} />
                        ) : (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
                                <button onClick={() => setIsWorkingHoursEditing(true)} className="font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 text-lg bg-primary text-slate-100">
                                    {texts.manageWorkingHours[language]}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
        
        {jobAction && <JobActionPhotoModal booking={jobAction.booking} mode={jobAction.mode} language={language} onClose={() => setJobAction(null)} onSubmit={jobAction.mode === 'start' ? onStartJobWithPhoto : onCompleteJobWithPhoto} />}
        {delayModalForBooking && <ReportDelayModal booking={delayModalForBooking} language={language} onClose={() => setDelayModalForBooking(null)} onSubmit={onReportDelay} />}
        {isWithdrawModalOpen && <WithdrawModal vendor={vendor} language={language} onClose={() => setIsWithdrawModalOpen(false)} onSubmit={onRequestWithdrawal} />}
        {isProfileEditing && <EditProfileModal vendor={vendor} language={language} onClose={() => setIsProfileEditing(false)} onSave={onUpdateDetails} />}

        <VendorBottomNavBar
            activeView={activeView}
            setActiveView={setActiveView}
            onWithdrawClick={() => setIsWithdrawModalOpen(true)}
            language={language}
        />
    </div>
  );
};

const DashboardSection: React.FC<{title: string, emptyMessage: string, bookings: Booking[], language: Language, onStartRequest: (b: Booking) => void, onCompleteRequest: (b: Booking) => void, onReportDelay: (b: Booking) => void }> = ({title, emptyMessage, bookings, ...props}) => (
    <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
        {bookings.length > 0 ? (
            <div className="space-y-4">
                {bookings.map(booking => <BookingCard key={booking.id} booking={booking} {...props} />)}
            </div>
        ) : (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
                <p className="text-slate-500">{emptyMessage}</p>
            </div>
        )}
    </div>
);

const BookingCard: React.FC<{ booking: Booking; language: Language; onStartRequest: (booking: Booking) => void; onCompleteRequest: (booking: Booking) => void; onReportDelay: (booking: Booking) => void; }> = ({ booking, language, onStartRequest, onCompleteRequest, onReportDelay }) => {
    const texts = TEXTS.vendorDashboard;
    const formatDate = (date: Date) => new Date(date).toLocaleDateString(language === Language.BN ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeSlotLabel = TIME_SLOTS.find(s => s.id === booking.timeSlot)?.label[language];
    const Icon = SERVICE_ICONS_MAP[booking.service.iconName];
    
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
                {Icon && <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"><Icon className="w-7 h-7 text-primary" /></div>}
                <div className="flex-grow">
                    <p className="font-semibold text-slate-800">{booking.packageName}</p>
                    <p className="text-sm text-slate-500">📅 {formatDate(booking.date)} 🕒 {timeSlotLabel}</p>
                    <div className="mt-2 p-3 bg-slate-50 rounded-md border text-sm">
                        <p className="font-semibold text-xs text-slate-600 uppercase">{texts.customerInfo[language]}</p>
                        <p className="text-slate-700">{booking.address}</p>
                        <p className="text-slate-700">{booking.phone}</p>
                    </div>
                </div>
                <div className="flex-shrink-0 flex sm:flex-col items-stretch gap-2 w-full sm:w-auto">
                    {booking.status === BookingStatus.Accepted && <>
                        <button onClick={() => onStartRequest(booking)} className="w-full text-center px-3 py-2 text-sm font-semibold text-slate-100 bg-primary hover:bg-sky-700 rounded-md transition-colors">{texts.startJob[language]}</button>
                        <button onClick={() => onReportDelay(booking)} className="w-full text-center px-3 py-2 text-sm font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors">{texts.reportDelay[language]}</button>
                    </>}
                    {booking.status === BookingStatus.InProgress && (
                        <button onClick={() => onCompleteRequest(booking)} className="w-full text-center px-3 py-2 text-sm font-semibold text-slate-100 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">{texts.markComplete[language]}</button>
                    )}
                </div>
            </div>
        </div>
    );
};

const WorkingHoursEditor: React.FC<{ vendor: Vendor, language: Language, onSaveChanges: (workingHours: WorkingHours) => void, onCancel: () => void }> = ({ vendor, language, onSaveChanges, onCancel }) => {
    const [currentHours, setCurrentHours] = useState(vendor.workingHours);
    const texts = TEXTS.vendorDashboard;
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const handleActiveToggle = (day: string) => {
        setCurrentHours(prev => ({
            ...prev,
            [day]: { ...prev[day], active: !prev[day].active }
        }));
    };

    const handleTimeChange = (day: string, type: 'start' | 'end', value: string) => {
        setCurrentHours(prev => ({
            ...prev,
            [day]: { ...prev[day], [type]: value }
        }));
    };
    
    const handleSave = () => {
        onSaveChanges(currentHours);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm animate-fade-in border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">{texts.manageWorkingHours[language]}</h3>
            <p className="text-slate-500 mt-1 mb-6 text-sm">{texts.workingHoursDesc[language]}</p>
            <div className="space-y-4">
                {daysOfWeek.map(day => {
                    const dayHours = currentHours[day];
                    return (
                        <div key={day} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b pb-4 last:border-b-0">
                            <div className="col-span-1 flex items-center gap-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={dayHours.active} onChange={() => handleActiveToggle(day)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                                <p className={`font-semibold ${dayHours.active ? 'text-slate-700' : 'text-slate-400'}`}>{new Date(2024, 0, daysOfWeek.indexOf(day)).toLocaleDateString(language === Language.BN ? 'bn-BD' : 'en-US', { weekday: 'long' })}</p>
                            </div>
                            <div className={`col-span-3 flex items-center gap-2 transition-opacity ${dayHours.active ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                <input type="time" value={dayHours.start} onChange={(e) => handleTimeChange(day, 'start', e.target.value)} className="p-2 bg-slate-100 border border-slate-300 rounded-md w-full" />
                                <span className="text-slate-500">-</span>
                                <input type="time" value={dayHours.end} onChange={(e) => handleTimeChange(day, 'end', e.target.value)} className="p-2 bg-slate-100 border border-slate-300 rounded-md w-full" />
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <button onClick={onCancel} className="px-6 py-2 font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg">{texts.cancel[language]}</button>
                <button onClick={handleSave} className="px-6 py-2 font-semibold text-slate-100 bg-primary hover:bg-sky-700 rounded-lg">{texts.saveChanges[language]}</button>
            </div>
        </div>
    );
};


const ProfileAndEarnings: React.FC<{
    vendor: Vendor, 
    language: Language, 
    onToggleAutoAccept: () => void, 
    onEditClick: () => void,
    onUpdateRealtimeStatus: (status: VendorRealtimeStatus) => void
}> = ({vendor, language, onToggleAutoAccept, onEditClick, onUpdateRealtimeStatus}) => {
    const texts = TEXTS.vendorDashboard;
    const formatCurrency = (val: number) => `৳${val.toLocaleString(language === Language.BN ? 'bn-BD' : 'en-US')}`;
    const isOffline = vendor.realtimeStatus === VendorRealtimeStatus.Offline;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">{texts.myProfile[language]}</h2>
                <button onClick={onEditClick} className="bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-full text-sm hover:bg-slate-200 transition-colors">
                    {TEXTS.customerDashboard.editInfo[language]}
                </button>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                 <div>
                    <h3 className="text-lg font-bold text-slate-800">{texts.earningsSummary[language]}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2 text-center">
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500">{texts.totalEarnings[language]}</p>
                            <p className="font-bold text-slate-800 text-lg">{formatCurrency(vendor.earnings.total)}</p>
                        </div>
                         <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500">{texts.lastMonth[language]}</p>
                            <p className="font-bold text-slate-800 text-lg">{formatCurrency(vendor.earnings.lastMonth)}</p>
                        </div>
                         <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                            <p className="text-xs text-emerald-700">{texts.availableForWithdrawal[language]}</p>
                            <p className="font-bold text-emerald-800 text-lg">{formatCurrency(vendor.earnings.pending)}</p>
                        </div>
                    </div>
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-slate-800">{texts.currentPlan[language]}</h3>
                    <div className="p-3 bg-slate-50 rounded-lg mt-2 flex justify-between items-center">
                        <p className="font-semibold text-slate-700">{vendor.subscription.planName} ({texts.commission[language]}: {vendor.subscription.commissionRate * 100}%)</p>
                        {vendor.subscription.planName === 'Basic' && <button className="text-xs font-bold text-primary">{texts.upgradeToPro[language]}</button>}
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between items-center">
                        <label className="font-semibold text-slate-700">{TEXTS.moderatorDashboard.realtimeStatus[language]}</label>
                        <button
                            onClick={() => onUpdateRealtimeStatus(isOffline ? VendorRealtimeStatus.Available : VendorRealtimeStatus.Offline)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!isOffline ? 'bg-primary' : 'bg-slate-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!isOffline ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                     <p className="text-xs text-slate-500 mt-1">
                        {language === 'en' ? 'Set your status to receive new job notifications.' : 'নতুন কাজের বিজ্ঞপ্তি পেতে আপনার স্ট্যাটাস সেট করুন।'}
                    </p>
                 </div>
                 <div>
                    <div className="flex justify-between items-center">
                        <label htmlFor="auto-accept-toggle" className="font-semibold text-slate-700">{texts.autoAcceptLabel[language]}</label>
                        <button
                            id="auto-accept-toggle"
                            onClick={onToggleAutoAccept}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${vendor.autoAcceptJobs ? 'bg-primary' : 'bg-slate-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${vendor.autoAcceptJobs ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        {language === 'en' ? 'Automatically accept jobs that match your skills and schedule.' : 'আপনার দক্ষতা এবং সময়সূচীর সাথে মেলে এমন কাজগুলি স্বয়ংক্রিয়ভাবে গ্রহণ করুন।'}
                    </p>
                 </div>
            </div>
        </div>
    );
}

const JobActionPhotoModal: React.FC<{
    booking: Booking;
    mode: 'start' | 'complete';
    language: Language;
    onClose: () => void;
    onSubmit: (bookingId: string, photoUrls: string[]) => void;
}> = ({ booking, mode, language, onClose, onSubmit }) => {
    const isStartMode = mode === 'start';
    const texts = TEXTS.vendorDashboard;
    const [photos, setPhotos] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const title = isStartMode ? texts.startJob[language] : texts.markComplete[language];
    const description = isStartMode
        ? (language === 'en' ? 'Please upload photos of the work area before you begin.' : 'কাজ শুরু করার আগে অনুগ্রহ করে কর্মক্ষেত্রের ছবি আপলোড করুন।')
        : (language === 'en' ? 'Upload photos of the completed work.' : 'সম্পন্ন কাজের ছবি আপলোড করুন।');
    const buttonText = isStartMode ? texts.startJob[language] : texts.submitAndComplete[language];
    const photoLabel = isStartMode ? texts.before[language] : texts.after[language];

    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // FIX: Explicitly type `files` as an array of `File` objects.
            // This resolves the 'unknown' type error when passing a file to `URL.createObjectURL`.
            const files: File[] = Array.from(e.target.files);
            setPhotos(files);
            
            // Cleanup old previews
            previewUrls.forEach(url => URL.revokeObjectURL(url));

            const newPreviewUrls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(newPreviewUrls);
        }
    };

    const handleSubmit = async () => {
        if (photos.length === 0) return;
        setIsUploading(true);
        try {
            const uploadPromises = photos.map(photo => api.uploadFileToS3(photo));
            const photoUrls = await Promise.all(uploadPromises);
            onSubmit(booking.id, photoUrls);
            onClose();
        } catch (error) {
            console.error("Upload failed", error);
            alert("Image upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b"><h2 className="text-xl font-bold text-slate-800">{title}</h2><p className="text-sm text-slate-500">{description}</p></div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="font-semibold">{photoLabel}</label>
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                        {previewUrls.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {previewUrls.map((url, index) => (
                                    <img key={index} src={url} alt="Preview" className="w-full h-auto rounded-lg border aspect-square object-cover" />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end">
                    <button onClick={handleSubmit} disabled={photos.length === 0 || isUploading} className="px-4 py-2 font-semibold text-slate-100 bg-primary rounded-lg disabled:bg-slate-300">
                        {isUploading ? 'Uploading...' : buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReportDelayModal: React.FC<{ booking: Booking, language: Language, onClose: () => void, onSubmit: (bookingId: string, reason: string, minutes: number) => void }> = ({ booking, language, onClose, onSubmit }) => {
    const texts = TEXTS.vendorDashboard;
    const [reason, setReason] = useState(texts.heavyTraffic[language]);
    const [minutes, setMinutes] = useState(30);

    const handleSubmit = () => {
        onSubmit(booking.id, reason, minutes);
        onClose();
    };

    const delayReasons = [texts.heavyTraffic[language], texts.previousJobDelayed[language], texts.other[language]];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-in-up" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b"><h2 className="text-xl font-bold text-slate-800">{texts.reportDelay[language]}</h2></div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="font-semibold text-sm">{texts.delayReason[language]}</label>
                        <select value={reason} onChange={e => setReason(e.target.value)} className="w-full p-2 mt-1 bg-slate-100 border border-slate-300 rounded-md">
                            {delayReasons.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="font-semibold text-sm">{texts.estimatedDelay[language]}</label>
                        <input type="number" value={minutes} onChange={e => setMinutes(parseInt(e.target.value))} className="w-full p-2 mt-1 bg-slate-100 border border-slate-300 rounded-md" step="5" />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end"><button onClick={handleSubmit} className="px-4 py-2 font-semibold text-slate-100 bg-primary rounded-lg">{texts.submitDelay[language]}</button></div>
            </div>
        </div>
    );
};

const WithdrawModal: React.FC<{ vendor: Vendor, language: Language, onClose: () => void, onSubmit: (vendorId: string, amount: number, bKashNumber: string) => void }> = ({ vendor, language, onClose, onSubmit }) => {
    const texts = TEXTS.vendorDashboard;
    const [amount, setAmount] = useState(vendor.earnings.pending);
    const [bKashNumber, setBKashNumber] = useState(vendor.bKashNumber || '');
    
    const handleSubmit = () => {
        if(amount > 0 && amount <= vendor.earnings.pending && bKashNumber.length >= 11) {
            onSubmit(vendor.id, amount, bKashNumber);
            onClose();
        }
    }
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-in-up" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b"><h2 className="text-xl font-bold text-slate-800">{texts.withdrawToBkash[language]}</h2></div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="font-semibold text-sm">{texts.amount[language]}</label>
                        <input type="number" max={vendor.earnings.pending} value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full p-2 mt-1 bg-slate-100 border border-slate-300 rounded-md" />
                        <p className="text-xs text-slate-500 mt-1">Max: ৳{vendor.earnings.pending}</p>
                    </div>
                    <div>
                        <label className="font-semibold text-sm">{texts.bKashNumber[language]}</label>
                        <input type="tel" value={bKashNumber} onChange={e => setBKashNumber(e.target.value)} placeholder="01XXXXXXXXX" className="w-full p-2 mt-1 bg-slate-100 border border-slate-300 rounded-md" />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end">
                    <button onClick={handleSubmit} disabled={amount <= 0 || amount > vendor.earnings.pending || bKashNumber.length < 11} className="px-4 py-2 font-semibold text-slate-100 bg-primary rounded-lg disabled:bg-slate-300">{texts.confirmWithdrawal[language]}</button>
                </div>
            </div>
        </div>
    );
};

const EditProfileModal: React.FC<{ vendor: Vendor, language: Language, onClose: () => void, onSave: (data: Partial<Vendor>) => void; }> = ({ vendor, language, onClose, onSave }) => {
    const texts = TEXTS.customerDashboard;
    const [formData, setFormData] = useState({
        name: vendor.name,
        address: vendor.address,
        phone: vendor.phone,
        bKashNumber: vendor.bKashNumber || '',
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
    
    const handleSave = async () => {
        setIsUploading(true);
        let dataToSave: Partial<Vendor> = { ...formData };
        if (avatarFile) {
            try {
                const newAvatarUrl = await api.uploadFileToS3(avatarFile);
                dataToSave.avatar = newAvatarUrl;
            } catch (err) {
                console.error("Avatar upload failed", err);
                alert("Avatar upload failed, profile saved without new picture.");
            }
        }
        
        onSave(dataToSave);
        setIsUploading(false);
        onClose();
    };
    
    const inputClasses = "w-full p-3 bg-slate-100 border-2 border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition";

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-in-up" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-slate-800">{TEXTS.adminDashboard.editProfile[language]}</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img src={avatarPreview || vendor.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover"/>
                            <label htmlFor="avatar-edit-vendor" className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                                <input id="avatar-edit-vendor" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                            </label>
                        </div>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder={TEXTS.vendorSignUp.fullName[language]} className={inputClasses} />
                    </div>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder={TEXTS.vendorSignUp.phone[language]} className={inputClasses} />
                    <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder={TEXTS.vendorSignUp.address[language]} className={inputClasses} />
                    <input type="tel" name="bKashNumber" value={formData.bKashNumber} onChange={handleChange} placeholder={TEXTS.vendorDashboard.bKashNumber[language]} className={inputClasses} />
                </div>
                <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                    <button onClick={onClose} className="bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300">
                        {texts.cancelEdit[language]}
                    </button>
                    <button onClick={handleSave} disabled={isUploading} className="bg-primary text-slate-100 font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 disabled:bg-slate-400">
                        {isUploading ? 'Uploading...' : texts.saveInfo[language]}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;