import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Language, PlatformData, Moderator, Booking, BookingStatus, Vendor, VendorRealtimeStatus, ChatSession, ServiceArea, ServiceDetail, TimeSlot, WorkingHours, Customer, ChatMessage, DayWorkingHours } from '../types';
import { TEXTS, TIME_SLOTS } from '../constants';
import { Logo } from './icons/Logo';
import LiveChat from './LiveChat';
// FIX: UserGroupIcon was not exported from NavIcons. It has been added in navIcons.tsx. BriefcaseIcon and ChatBubbleIcon are imported for nav items.
import { ChatBubbleIcon, BriefcaseIcon, UserGroupIcon } from './icons/NavIcons';

interface ModeratorDashboardProps {
  moderator: Moderator;
  platformData: PlatformData;
  language: Language;
  onLogout: () => void;
  onAssignVendor: (bookingId: string, vendorId: string, moderatorId: string) => void;
  onAcceptChat: (sessionId: string) => void;
  onSendChatMessage: (sessionId: string, text: string) => void;
  onSwitchToAdminView?: () => void;
}

type ModeratorView = 'operations' | 'vendors' | 'chat';

// Helper function to check vendor availability based on working hours and booking time slot
const isVendorAvailableAtTimeSlot = (vendor: Vendor, bookingDate: Date, timeSlot: TimeSlot): boolean => {
    // 1. Get the day of the week from the booking date.
    const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday"
    
    // 2. Get the vendor's working hours for that day.
    const dayHours = vendor.workingHours[dayOfWeek];
    if (!dayHours || !dayHours.active) {
        return false; // Not working on this day.
    }
    
    // 3. Define time slot boundaries (in 24-hour format).
    const timeSlotBoundaries = {
        [TimeSlot.Morning]: { start: 9, end: 12 },
        [TimeSlot.Afternoon]: { start: 13, end: 17 },
        [TimeSlot.Evening]: { start: 18, end: 21 },
    };
    
    // 4. Parse vendor's start and end times.
    const [vendorStartHour] = dayHours.start.split(':').map(Number);
    const [vendorEndHour] = dayHours.end.split(':').map(Number);
    
    // 5. Get the booking time slot boundaries.
    const slot = timeSlotBoundaries[timeSlot];
    if (!slot) {
        return false; // Should not happen with valid data
    }
    const slotStartHour = slot.start;
    const slotEndHour = slot.end;
    
    // 6. Check for overlap: vendor's schedule must overlap with the booking slot.
    // (VendorStart < SlotEnd) AND (VendorEnd > SlotStart)
    const overlaps = vendorStartHour < slotEndHour && vendorEndHour > slotStartHour;
    
    return overlaps;
}

const RealtimeStatusChip: React.FC<{ status: VendorRealtimeStatus; language: Language }> = ({ status, language }) => {
    const vendorTexts = TEXTS.vendorDashboard;
    const info = {
        [VendorRealtimeStatus.Available]: { color: 'bg-green-500', text: vendorTexts.statusAvailable },
        [VendorRealtimeStatus.Busy]: { color: 'bg-yellow-500', text: vendorTexts.statusBusy },
        [VendorRealtimeStatus.Offline]: { color: 'bg-slate-500', text: vendorTexts.statusOffline },
    }[status];

    return (
        <div className="flex items-center gap-1.5 text-xs">
            <span className={`w-2 h-2 rounded-full ${info.color}`}></span>
            <span className="text-slate-600 font-medium">{info.text[language]}</span>
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

const ModeratorDashboard: React.FC<ModeratorDashboardProps> = ({ moderator, platformData, language, onLogout, onAssignVendor, onAcceptChat, onSendChatMessage, onSwitchToAdminView }) => {
  const [activeView, setActiveView] = useState<ModeratorView>('operations');
  const [bookingToAssign, setBookingToAssign] = useState<Booking | null>(null);
  const [bookingToViewPhotos, setBookingToViewPhotos] = useState<Booking | null>(null);
  const [vendorToView, setVendorToView] = useState<Vendor | null>(null);
  const [activeChatSession, setActiveChatSession] = useState<ChatSession | null>(null);
  const texts = TEXTS.moderatorDashboard;
  
  const handleAcceptAndOpenChat = (session: ChatSession) => {
    onAcceptChat(session.id);
    setActiveChatSession(session);
  };

  useEffect(() => {
    if (activeChatSession) {
        const freshSession = platformData.chatSessions.find(s => s.id === activeChatSession.id);
        if (freshSession) {
            setActiveChatSession(freshSession);
        } else {
            setActiveChatSession(null);
        }
    }
  }, [platformData.chatSessions, activeChatSession]);
  
  const navItems = [
      { id: 'operations', label: texts.operations[language], icon: BriefcaseIcon },
      { id: 'vendors', label: texts.vendors[language], icon: UserGroupIcon },
      { id: 'chat', label: texts.liveChatsTitle[language], icon: ChatBubbleIcon }
  ];

  return (
      <div className="min-h-screen bg-slate-100 flex">
          <aside className="w-64 bg-slate-800 text-slate-300 flex-col p-4 hidden md:flex">
              <div className="flex items-center gap-2 mb-8 px-2">
                  <Logo className="h-8 w-auto text-slate-100" />
                  <span className="text-2xl font-bold text-slate-100">FixBD Ops</span>
              </div>
              <nav className="flex-1 space-y-2">
                  {navItems.map(({ id, label, icon: Icon }) => (
                      <button key={id} onClick={() => setActiveView(id as ModeratorView)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-semibold transition-colors ${activeView === id ? 'bg-slate-900 text-slate-100' : 'hover:bg-slate-700'}`}>
                          <Icon className="w-6 h-6" />
                          <span>{label}</span>
                      </button>
                  ))}
              </nav>
              <div className="mt-auto">
                  <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-semibold transition-colors hover:bg-slate-700">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                      <span>{texts.logout[language]}</span>
                  </button>
              </div>
          </aside>
          <main className="flex-1">
              <header className="bg-white shadow-sm p-4 flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-slate-800">{navItems.find(i => i.id === activeView)?.label}</h1>
                  <div className="flex items-center gap-4">
                        {onSwitchToAdminView && (
                            <button
                                onClick={onSwitchToAdminView}
                                className="text-sm font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-200 transition-colors"
                            >
                                {language === 'en' ? 'Admin View' : 'অ্যাডমিন ভিউ'}
                            </button>
                        )}
                      <div className="text-right">
                          <p className="font-semibold text-slate-700">{moderator.name}</p>
                      </div>
                  </div>
              </header>
              <div className="p-6">
                  {activeView === 'operations' && <OperationsView platformData={platformData} language={language} onAssignVendorClick={setBookingToAssign} onViewPhotosClick={setBookingToViewPhotos} />}
                  {activeView === 'vendors' && <VendorsView platformData={platformData} language={language} onViewDetailsClick={setVendorToView} />}
                  {activeView === 'chat' && <ChatQueueView chatSessions={platformData.chatSessions} language={language} onAcceptChat={handleAcceptAndOpenChat} />}
              </div>
          </main>

          {bookingToAssign && <AssignVendorModal booking={bookingToAssign} platformData={platformData} language={language} onClose={() => setBookingToAssign(null)} onAssign={(vendorId) => { onAssignVendor(bookingToAssign.id, vendorId, moderator.id); setBookingToAssign(null); }} onViewDetails={setVendorToView} />}
          {vendorToView && <VendorDetailsModal vendor={vendorToView} platformData={platformData} language={language} onClose={() => setVendorToView(null)} />}
          {bookingToViewPhotos && <ViewPhotosModal booking={bookingToViewPhotos} language={language} onClose={() => setBookingToViewPhotos(null)} />}
          {activeChatSession && <LiveChat session={activeChatSession} currentUser={{ id: moderator.id, type: 'moderator' }} onSendMessage={onSendChatMessage} onClose={() => setActiveChatSession(null)} language={language} isModeratorView={true} />}
      </div>
  );
};

const OperationsView: React.FC<{ platformData: PlatformData; language: Language; onAssignVendorClick: (booking: Booking) => void; onViewPhotosClick: (booking: Booking) => void; }> = ({ platformData, language, onAssignVendorClick, onViewPhotosClick }) => {
    const texts = TEXTS.moderatorDashboard;
    const allStatuses = Object.values(BookingStatus);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchId, setSearchId] = useState('');

    const filteredBookings = useMemo(() => {
        return platformData.bookings.filter(b => {
            const matchesStatus = !statusFilter || b.status === statusFilter;
            const matchesId = !searchId || b.id.toLowerCase().includes(searchId.toLowerCase());
            return matchesStatus && matchesId;
        }).sort((a, b) => new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime());
    }, [platformData.bookings, statusFilter, searchId]);

    const getStatusChip = (status: BookingStatus) => {
        const styles: {[key: string]: string} = { [BookingStatus.Pending]: 'bg-yellow-100 text-yellow-800', [BookingStatus.Accepted]: 'bg-blue-100 text-blue-800', [BookingStatus.InProgress]: 'bg-indigo-100 text-indigo-800', [BookingStatus.Completed]: 'bg-green-100 text-green-800', [BookingStatus.Cancelled]: 'bg-red-100 text-red-800' };
        return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} placeholder={texts.searchByBookingId[language]} className="w-full p-2 bg-slate-100 border border-slate-300 rounded-md" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full p-2 bg-slate-100 border border-slate-300 rounded-md">
                    <option value="">{texts.allStatuses[language]}</option>
                    {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">{texts.bookingId[language]}</th>
                            <th className="px-6 py-3">{texts.customer[language]}</th>
                            <th className="px-6 py-3">{texts.service[language]}</th>
                            <th className="px-6 py-3">{texts.assignedVendor[language]}</th>
                            <th className="px-6 py-3">{texts.status[language]}</th>
                            <th className="px-6 py-3">{texts.actions[language]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map(b => (
                            <tr key={b.id} className="bg-white border-b">
                                <td className="px-6 py-4 font-mono text-xs">{b.id}</td>
                                <td className="px-6 py-4">{b.phone}</td>
                                <td className="px-6 py-4">{b.packageName}</td>
                                <td className="px-6 py-4">
                                    {b.provider ? (
                                        <div className="flex items-center gap-2">
                                            <img src={b.provider.avatar} alt={b.provider.name} className="w-8 h-8 rounded-full object-cover" />
                                            <span className="font-semibold text-slate-700 text-xs">{b.provider.name}</span>
                                        </div>
                                    ) : 'N/A'}
                                </td>
                                <td className="px-6 py-4">{getStatusChip(b.status)}</td>
                                <td className="px-6 py-4 flex gap-2">
                                    {b.status === BookingStatus.Pending && <button onClick={() => onAssignVendorClick(b)} className="text-xs font-semibold bg-primary text-white px-2 py-1 rounded">{texts.assignVendor[language]}</button>}
                                    {b.beforePhotoUrls && b.beforePhotoUrls.length > 0 && <button onClick={() => onViewPhotosClick(b)} className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">{texts.viewDetails[language]}</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const VendorsView: React.FC<{ platformData: PlatformData; language: Language; onViewDetailsClick: (vendor: Vendor) => void }> = ({ platformData, language, onViewDetailsClick }) => {
    const texts = TEXTS.moderatorDashboard;
    const [searchTerm, setSearchTerm] = useState('');

    const filteredVendors = useMemo(() => {
        return platformData.vendors.filter(v => 
            v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.phone.includes(searchTerm)
        );
    }, [platformData.vendors, searchTerm]);

    const getSkillNames = (skillIds: string[]) => skillIds.map(id => platformData.services.find(s => s.id === id)?.name[language] || id).join(', ');

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 animate-fade-in">
             <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={language === 'en' ? 'Search by name or phone...' : 'নাম বা ফোন দিয়ে খুঁজুন...'} className="w-full md:w-1/3 p-2 bg-slate-100 border border-slate-300 rounded-md" />
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">{texts.vendors[language]}</th>
                            <th className="px-6 py-3">{texts.skills[language]}</th>
                            <th className="px-6 py-3">{texts.realtimeStatus[language]}</th>
                            <th className="px-6 py-3">{texts.actions[language]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVendors.map(v => (
                             <tr key={v.id} className="bg-white border-b">
                                <td className="px-6 py-4 font-semibold text-slate-800 flex items-center gap-3">
                                    <img src={v.avatar} alt={v.name} className="w-10 h-10 rounded-full" />
                                    <div>{v.name}<div className="text-xs font-normal text-slate-500">{v.phone}</div></div>
                                </td>
                                <td className="px-6 py-4 max-w-xs truncate">{getSkillNames(v.skills)}</td>
                                <td className="px-6 py-4">{v.realtimeStatus}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => onViewDetailsClick(v)} className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded">{texts.viewDetails[language]}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const ChatQueueView: React.FC<{ chatSessions: ChatSession[], language: Language, onAcceptChat: (session: ChatSession) => void }> = ({ chatSessions, language, onAcceptChat }) => {
    const texts = TEXTS.moderatorDashboard;
    const pendingChats = chatSessions.filter(s => s.status === 'pending');
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm animate-fade-in">
            <h3 className="text-xl font-bold text-slate-800 mb-4">{texts.liveChatsTitle[language]}</h3>
            {pendingChats.length > 0 ? (
                <div className="space-y-3">
                    {pendingChats.map(session => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                                <p className="font-semibold">{session.customerName}</p>
                                <p className="text-xs text-slate-500">{new Date(session.createdAt).toLocaleTimeString()}</p>
                            </div>
                            <button onClick={() => onAcceptChat(session)} className="px-3 py-1 text-sm font-semibold text-slate-100 bg-primary hover:bg-sky-700 rounded-md">{texts.acceptChat[language]}</button>
                        </div>
                    ))}
                </div>
            ) : <p className="text-slate-500">{texts.noLiveChats[language]}</p>}
        </div>
    )
}

const AssignVendorModal: React.FC<{ booking: Booking, platformData: PlatformData, language: Language, onClose: () => void, onAssign: (vendorId: string) => void, onViewDetails: (vendor: Vendor) => void }> = ({ booking, platformData, language, onClose, onAssign, onViewDetails }) => {
    const texts = TEXTS.moderatorDashboard;
    
    const potentialVendors = useMemo(() => {
        if (!booking.service || !booking.serviceArea) {
            return [];
        }

        const qualifiedVendors = platformData.vendors.filter(v => 
            v.status === 'Active' &&
            v.skills.includes(booking.service.id) &&
            v.coverageArea.includes(booking.serviceArea)
        );

        return qualifiedVendors.map(vendor => ({
            vendor,
            scheduleMatch: isVendorAvailableAtTimeSlot(vendor, new Date(booking.date), booking.timeSlot),
            ongoingJobsCount: platformData.bookings.filter(b => b.provider?.id === vendor.id && b.status === BookingStatus.InProgress).length,
            realtimeStatus: vendor.realtimeStatus,
        }));
    }, [booking, platformData]);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b"><h2 className="text-xl font-bold text-slate-800">{texts.assignVendorTitle[language]} #{booking.id.slice(-6)}</h2></div>
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
                    <h3 className="font-semibold">{texts.availableProfessionals[language]}</h3>
                    {potentialVendors.length > 0 ? potentialVendors.map(({ vendor, scheduleMatch, ongoingJobsCount, realtimeStatus }) => (
                        <div key={vendor.id} className="grid grid-cols-3 gap-4 items-center p-3 bg-slate-50 rounded-lg">
                             <div className="col-span-1 flex items-center gap-3">
                                <img src={vendor.avatar} alt={vendor.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-semibold text-sm">{vendor.name}</p>
                                    <div className="mt-1 flex flex-col items-start gap-0.5 text-xs text-slate-500">
                                        <RealtimeStatusChip status={realtimeStatus} language={language} />
                                        <span className={`font-medium ${scheduleMatch ? 'text-green-600' : 'text-amber-600'}`}>
                                            Schedule: {scheduleMatch ? 'Match' : 'No Match'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                             <div className="col-span-1 text-center">
                                <p className="text-xs text-slate-500">Ongoing Jobs</p>
                                <p className="font-bold">{ongoingJobsCount}</p>
                            </div>
                            <div className="col-span-1 flex justify-end gap-2">
                                <button onClick={() => onViewDetails(vendor)} className="px-3 py-1 text-xs font-semibold rounded-md bg-slate-200 text-slate-700 hover:bg-slate-300">{texts.viewDetails[language]}</button>
                                <button onClick={() => onAssign(vendor.id)} className="px-3 py-1 text-xs font-semibold text-slate-100 bg-primary hover:bg-sky-700 rounded-md">{texts.assignVendor[language]}</button>
                            </div>
                        </div>
                    )) : <p className="text-slate-500 p-4 text-center">{texts.noAvailableVendors[language]}</p>}
                </div>
                 <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 font-semibold text-slate-600 bg-slate-200 rounded-lg">{TEXTS.adminDashboard.cancel[language]}</button>
                </div>
            </div>
        </div>
    )
}

const VendorDetailsModal: React.FC<{ vendor: Vendor, platformData: PlatformData, language: Language, onClose: () => void }> = ({ vendor, platformData, language, onClose }) => {
    const texts = TEXTS.moderatorDashboard;
    const vendorTexts = TEXTS.vendorDashboard;
    
    const getSkillNames = (skillIds: string[]) => skillIds.map(id => platformData.services.find(s => s.id === id)?.name[language] || 'Unknown Skill').join(', ');
    const getAreaNames = (areaIds: string[]) => areaIds.map(id => platformData.serviceAreas.find(a => String(a.id) === String(id))?.name[language] || 'Unknown Area').join(', ');

    const ongoingJobs = platformData.bookings.filter(b => String(b.provider?.id) === String(vendor.id) && b.status === BookingStatus.InProgress);

    const RealtimeStatusChip: React.FC<{ status: VendorRealtimeStatus }> = ({ status }) => {
        const info = {
            [VendorRealtimeStatus.Available]: { color: 'bg-green-500', text: vendorTexts.statusAvailable },
            [VendorRealtimeStatus.Busy]: { color: 'bg-yellow-500', text: vendorTexts.statusBusy },
            [VendorRealtimeStatus.Offline]: { color: 'bg-slate-500', text: vendorTexts.statusOffline },
        }[status];
        return <div className="flex items-center gap-2 text-sm"><span className={`w-2.5 h-2.5 rounded-full ${info.color}`}></span><span className="font-semibold">{info.text[language]}</span></div>;
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <div className="flex items-center gap-4">
                        <img src={vendor.avatar} alt={vendor.name} className="w-16 h-16 rounded-full"/>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{vendor.name}</h2>
                            <p className="text-slate-500">Rating: {vendor.rating} ★</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">{texts.contactInfo[language]}</h3>
                        <p><span className="font-semibold">Phone:</span> {vendor.phone}</p>
                        <p><span className="font-semibold">Email:</span> {vendor.email}</p>
                        <div>
                            <h3 className="font-bold text-lg mt-4">{texts.realtimeStatus[language]}</h3>
                            <RealtimeStatusChip status={vendor.realtimeStatus} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mt-4">Current Jobs ({ongoingJobs.length})</h3>
                            {ongoingJobs.length > 0 ? (
                                <ul className="list-disc pl-5 text-xs space-y-1 mt-2">
                                    {ongoingJobs.map(job => <li key={job.id}>{job.packageName} at {job.address}</li>)}
                                </ul>
                            ) : <p className="text-xs text-slate-500 mt-1">No ongoing jobs.</p>}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">{texts.skills[language]}</h3>
                        <p>{getSkillNames(vendor.skills)}</p>
                        <h3 className="font-bold text-lg mt-4">{texts.coverageArea[language]}</h3>
                        <p>{getAreaNames(vendor.coverageArea.map(String))}</p>
                        <h3 className="font-bold text-lg mt-4">{texts.weeklyAvailability[language]}</h3>
                        <div className="text-xs space-y-1">
                            {Object.entries(vendor.workingHours).map(([day, hours]) => {
                                // FIX: Cast `hours` to the `DayWorkingHours` type.
                                // `Object.entries` on an indexed signature type infers the value as `unknown`.
                                // This assertion tells TypeScript the correct shape of the object.
                                const dayHours = hours as DayWorkingHours;
                                return (
                                    <p key={day} className={`${!dayHours.active && 'text-slate-400'}`}>
                                        <span className="font-semibold w-24 inline-block">{day}:</span> 
                                        {dayHours.active ? `${dayHours.start} - ${dayHours.end}` : 'Unavailable'}
                                    </p>
                                )
                            })}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 font-semibold text-slate-100 bg-primary rounded-lg">{TEXTS.vendorSignUp.close[language]}</button>
                </div>
            </div>
        </div>
    );
}

export default ModeratorDashboard;