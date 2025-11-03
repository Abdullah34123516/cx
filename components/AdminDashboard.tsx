import React, { useState, useEffect } from 'react';
import { Language, PlatformData, VendorApplication, Customer, Vendor, Booking, BookingStatus, ServiceDetail, ServicePackage, ServiceArea, VendorRealtimeStatus, Withdrawal, WithdrawalStatus, Moderator, ModeratorActivityLog } from '../types';
import { TEXTS, VENDOR_SUBSCRIPTION_PLANS, CUSTOMER_SUBSCRIPTION_PLANS } from '../constants';
import { Logo } from './icons/Logo';
import { SERVICE_ICONS_MAP } from './icons/ServiceIcons';
import * as api from '../api';

// --- Icon Components ---
const DashboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>);
const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.071M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.684v-.005A9.345 9.345 0 0115 19.128zM12 6a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /></svg>);
const VendorsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>);
const BookingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h2.25" /></svg>);
const FinanceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0H21m-9 12.75h5.25M9 20.25a4.5 4.5 0 01-4.5-4.5v-1.5a4.5 4.5 0 014.5-4.5h7.5a4.5 4.5 0 014.5 4.5v1.5a4.5 4.5 0 01-4.5 4.5h-7.5Z" /></svg>);
const SubscriptionsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM16.5 6.75v3.75m0 0v3.75m0-3.75h-15m15 0V3.75M3.75 6.75v3.75m0 0v3.75m0-3.75h15M3.75 12h15M12 3.75h.008v.008H12V3.75z" /></svg>);
const ServicesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995a6.427 6.427 0 010 .255c0 .382.145.755.438.995l1.003.827c.48.398.668 1.03.26 1.431l-1.296-2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 01-.22.127c-.332.183-.582.495-.645.87l-.213 1.281c-.09.542-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.003-.827c.293-.24.438.613-.438.995a6.427 6.427 0 010-.255c0-.382-.145.755-.438.995l-1.003-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37.49l1.217.456c.355.133.75.072 1.075.124a6.57 6.57 0 01.22-.127c.332.183-.582.495-.645.87l.213-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const LocationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>);
const ModeratorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>);


type AdminView = 'dashboard' | 'users' | 'vendors' | 'bookings' | 'finance' | 'subscriptions' | 'services' | 'locations' | 'moderators';

interface AdminDashboardProps {
  platformData: PlatformData;
  language: Language;
  setLanguage: (lang: Language) => void;
  onExit: () => void;
  onApproveVendor: (application: VendorApplication) => void;
  onRejectVendor: (applicationId: string) => void;
  onToggleUserStatus: (userId: string, currentStatus: 'Active' | 'Suspended') => void;
  onToggleVendorStatus: (vendorId: string, currentStatus: 'Active' | 'Suspended') => void;
  onCancelBooking: (bookingId: string) => void;
  onServiceAction: (action: () => Promise<any>) => void;
  onServiceAreaAction: (action: () => Promise<any>) => void;
  onUpdateVendorCoverage: (vendorId: string, areaIds: string[]) => void;
  onApproveWithdrawal: (withdrawalId: string) => void;
  onAddModerator: (data: Omit<Moderator, 'id'>) => void;
  onRemoveModerator: (id: string) => void;
  onUpdateVendorDetails: (vendorId: string, data: Partial<Vendor>) => void;
  onUpdateModeratorDetails: (moderatorId: string, data: Partial<Moderator>) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ platformData, language, setLanguage, onExit, onApproveVendor, onRejectVendor, onToggleUserStatus, onToggleVendorStatus, onCancelBooking, onServiceAction, onServiceAreaAction, onUpdateVendorCoverage, onApproveWithdrawal, onAddModerator, onRemoveModerator, onUpdateVendorDetails, onUpdateModeratorDetails }) => {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const texts = TEXTS.adminDashboard;
  const isBn = language === Language.BN;

  const navItems = [
    { id: 'dashboard', label: texts.dashboard[language], Icon: DashboardIcon },
    { id: 'bookings', label: texts.bookings[language], Icon: BookingsIcon },
    { id: 'users', label: texts.users[language], Icon: UsersIcon },
    { id: 'vendors', label: texts.vendors[language], Icon: VendorsIcon },
    { id: 'moderators', label: texts.moderators[language], Icon: ModeratorIcon },
    { id: 'services', label: texts.services[language], Icon: ServicesIcon },
    { id: 'locations', label: texts.locations[language], Icon: LocationIcon },
    { id: 'finance', label: texts.finance[language], Icon: FinanceIcon },
    { id: 'subscriptions', label: texts.subscriptions[language], Icon: SubscriptionsIcon },
  ];
  
  const [applicationToReview, setApplicationToReview] = useState<VendorApplication | null>(null);
  const [bookingToViewPhotos, setBookingToViewPhotos] = useState<Booking | null>(null);
  const [vendorToManageAreas, setVendorToManageAreas] = useState<Vendor | null>(null);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);
  const [moderatorToEdit, setModeratorToEdit] = useState<Moderator | null>(null);


  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-800 text-slate-300 flex-col p-4 hidden md:flex">
        <div className="flex items-center gap-2 mb-8 px-2">
            <Logo className="h-8 w-auto text-slate-100" />
            <span className="text-2xl font-bold text-slate-100">FixBD Admin</span>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setActiveView(id as AdminView)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-semibold transition-colors ${activeView === id ? 'bg-slate-900 text-slate-100' : 'hover:bg-slate-700'}`}>
              <Icon className="h-6 w-6" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
         <div className="mt-auto">
            <button onClick={onExit} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-semibold transition-colors hover:bg-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                <span>{texts.logout[language]}</span>
            </button>
        </div>
      </aside>

      <main className="flex-1 bg-slate-100">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
             <h1 className="text-2xl font-bold text-slate-800">{navItems.find(i => i.id === activeView)?.label}</h1>
             <div className="flex items-center gap-4">
                <div className="flex items-center bg-slate-100 rounded-full p-1 text-sm font-semibold">
                    <button onClick={() => setLanguage(Language.EN)} className={`px-3 py-1 rounded-full ${!isBn ? 'bg-slate-50 shadow' : 'text-slate-500'}`}>EN</button>
                    <button onClick={() => setLanguage(Language.BN)} className={`px-3 py-1 rounded-full ${isBn ? 'bg-slate-50 shadow' : 'text-slate-500'}`}>বাং</button>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-slate-700">Admin</p>
                </div>
             </div>
        </header>
        
        <div className="p-6">
            {activeView === 'dashboard' && <DashboardOverview data={platformData} language={language} />}
            {activeView === 'users' && <UsersView users={platformData.users} onToggleStatus={onToggleUserStatus} language={language} />}
            {activeView === 'vendors' && <VendorsView data={platformData} language={language} onReview={setApplicationToReview} onToggleStatus={onToggleVendorStatus} onManageAreas={setVendorToManageAreas} onEditProfile={setVendorToEdit} />}
            {activeView === 'bookings' && <BookingsView bookings={platformData.bookings} onViewPhotos={setBookingToViewPhotos} onCancelBooking={onCancelBooking} language={language} />}
            {activeView === 'services' && <ServiceManagementView services={platformData.services} serviceAreas={platformData.serviceAreas} language={language} onAction={onServiceAction} />}
            {activeView === 'locations' && <LocationsView serviceAreas={platformData.serviceAreas} language={language} onAction={onServiceAreaAction} />}
            {activeView === 'finance' && <FinanceView data={platformData} language={language} onApproveWithdrawal={onApproveWithdrawal} />}
            {activeView === 'subscriptions' && <SubscriptionsView data={platformData} language={language} />}
            {activeView === 'moderators' && <ModeratorsView moderators={platformData.moderators} activityLog={platformData.moderatorActivityLog} bookings={platformData.bookings} vendors={platformData.vendors} language={language} onAddModerator={onAddModerator} onRemoveModerator={onRemoveModerator} onEditProfile={setModeratorToEdit} />}
        </div>
      </main>

      {applicationToReview && (
          <ReviewApplicationModal application={applicationToReview} platformData={platformData} language={language} onClose={() => setApplicationToReview(null)} onApprove={() => { onApproveVendor(applicationToReview); setApplicationToReview(null); }} onReject={() => { onRejectVendor(applicationToReview.id); setApplicationToReview(null); }} />
      )}
      {bookingToViewPhotos && (
          <ViewPhotosModal booking={bookingToViewPhotos} language={language} onClose={() => setBookingToViewPhotos(null)} />
      )}
      {vendorToManageAreas && (
        <ManageVendorAreasModal
            vendor={vendorToManageAreas}
            allAreas={platformData.serviceAreas}
            language={language}
            onClose={() => setVendorToManageAreas(null)}
            onSave={(areaIds) => {
                onUpdateVendorCoverage(vendorToManageAreas.id, areaIds);
                setVendorToManageAreas(null);
            }}
        />
      )}
      {vendorToEdit && (
          <EditVendorModal
            vendor={vendorToEdit}
            language={language}
            onClose={() => setVendorToEdit(null)}
            onSave={(vendorId, data) => {
                onUpdateVendorDetails(vendorId, data);
                setVendorToEdit(null);
            }}
          />
      )}
      {moderatorToEdit && (
          <EditModeratorModal
            moderator={moderatorToEdit}
            language={language}
            onClose={() => setModeratorToEdit(null)}
            onSave={(moderatorId, data) => {
                onUpdateModeratorDetails(moderatorId, data);
                setModeratorToEdit(null);
            }}
          />
      )}
    </div>
  );
};

// --- View Components ---

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
        <div className="h-12 w-12 rounded-full flex items-center justify-center bg-primary/10 text-primary">{icon}</div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const DashboardOverview: React.FC<{ data: PlatformData, language: Language }> = ({ data, language }) => {
    const texts = TEXTS.adminDashboard;
    const formatCurrency = (val: number) => `৳${val.toLocaleString(language === Language.BN ? 'bn-BD' : 'en-US')}`;
    return (
        <div className="space-y-6 animate-fade-in"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><StatCard title={texts.totalUsers[language]} value={data.users.length} icon={<UsersIcon className="w-6 h-6"/>} /><StatCard title={texts.totalVendors[language]} value={data.vendors.length} icon={<VendorsIcon className="w-6 h-6"/>} /><StatCard title={texts.totalRevenue[language]} value={formatCurrency(data.totalRevenue)} icon={<FinanceIcon className="w-6 h-6"/>} /><StatCard title={texts.pendingApplications[language]} value={data.vendorApplications.length} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>} /></div></div>
    );
};

const UsersView: React.FC<{ users: Customer[], onToggleStatus: (id: string, status: 'Active' | 'Suspended') => void, language: Language }> = ({ users, onToggleStatus, language }) => {
    const StatusChip: React.FC<{ status: 'Active' | 'Suspended' }> = ({ status }) => (
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {status}
        </span>
    );
    return(
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto animate-fade-in">
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">User</th>
                        <th scope="col" className="px-6 py-3">Contact</th>
                        <th scope="col" className="px-6 py-3">Subscription</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="bg-white border-b">
                            <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap flex items-center gap-3">
                                <img src={user.avatar} className="w-10 h-10 rounded-full" alt={user.name} />
                                {user.name}
                            </th>
                            <td className="px-6 py-4">{user.phone}</td>
                            <td className="px-6 py-4">{user.subscription ? 'FixBD Plus' : 'None'}</td>
                            <td className="px-6 py-4"><StatusChip status={user.status} /></td>
                            <td className="px-6 py-4">
                                <button onClick={() => onToggleStatus(user.id, user.status)} className={`px-3 py-1 text-sm font-semibold rounded-md ${user.status === 'Active' ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                                    {user.status === 'Active' ? 'Suspend' : 'Reactivate'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const VendorsView: React.FC<{ data: PlatformData, language: Language, onReview: (app: VendorApplication) => void, onToggleStatus: (id: string, status: 'Active' | 'Suspended') => void, onManageAreas: (vendor: Vendor) => void, onEditProfile: (vendor: Vendor) => void }> = ({ data, language, onReview, onToggleStatus, onManageAreas, onEditProfile }) => {
    const [tab, setTab] = useState<'approved' | 'applications'>('approved');
    const texts = TEXTS.adminDashboard;
    const vendorTexts = TEXTS.vendorDashboard;

    const StatusChip: React.FC<{ status: 'Active' | 'Suspended' }> = ({ status }) => (<span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{status}</span>);

    const RealtimeStatusChip: React.FC<{ status: VendorRealtimeStatus }> = ({ status }) => {
        const info = {
            [VendorRealtimeStatus.Available]: { color: 'bg-green-500', text: vendorTexts.statusAvailable },
            [VendorRealtimeStatus.Busy]: { color: 'bg-yellow-500', text: vendorTexts.statusBusy },
            [VendorRealtimeStatus.Offline]: { color: 'bg-slate-500', text: vendorTexts.statusOffline },
        }[status];

        return (
            <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${info.color}`}></span>
                <span className="text-slate-700">{info.text[language]}</span>
            </div>
        );
    };


    const getAreaNames = (areaIds: string[]) => {
        return areaIds.map(id => data.serviceAreas.find(a => a.id === id)?.name[language] || id).join(', ');
    };

    const getSkillNames = (skillIds: string[]) => {
        return skillIds.map(id => data.services.find(s => s.id === id)?.name[language] || id).join(', ');
    };


    return (
        <div className="space-y-6 animate-fade-in"><div className="flex items-center gap-2 p-1 bg-slate-200 rounded-lg w-fit"><button onClick={() => setTab('approved')} className={`px-4 py-1.5 text-sm font-semibold rounded-md ${tab === 'approved' ? 'bg-slate-50 shadow' : ''}`}>{texts.approvedVendors[language]}</button><button onClick={() => setTab('applications')} className={`px-4 py-1.5 text-sm font-semibold rounded-md relative ${tab === 'applications' ? 'bg-slate-50 shadow' : ''}`}>{texts.vendorApplications[language]}{data.vendorApplications.length > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger text-slate-100 text-xs rounded-full flex items-center justify-center">{data.vendorApplications.length}</span>}</button></div><div className="bg-white rounded-lg shadow-sm overflow-hidden">{tab === 'approved' && ( <table className="w-full text-sm text-left text-slate-500"><thead className="text-xs text-slate-700 uppercase bg-slate-50"><tr><th scope="col" className="px-6 py-3">Vendor</th><th scope="col" className="px-6 py-3">Skills</th><th scope="col" className="px-6 py-3">Coverage</th><th scope="col" className="px-6 py-3">Real-time Status</th><th scope="col" className="px-6 py-3">Status</th><th scope="col" className="px-6 py-3">Actions</th></tr></thead><tbody>{data.vendors.map(vendor => ( <tr key={vendor.id} className="bg-white border-b"><th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap flex items-center gap-3"><img src={vendor.avatar} className="w-10 h-10 rounded-full" alt={vendor.name} />{vendor.name}</th><td className="px-6 py-4">{getSkillNames(vendor.skills)}</td><td className="px-6 py-4">{getAreaNames(vendor.coverageArea)}</td><td className="px-6 py-4"><RealtimeStatusChip status={vendor.realtimeStatus} /></td><td className="px-6 py-4"><StatusChip status={vendor.status} /></td><td className="px-6 py-4 flex flex-wrap gap-2"><button onClick={() => onManageAreas(vendor)} className="px-3 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200">{texts.manageAreas[language]}</button><button onClick={() => onEditProfile(vendor)} className="px-3 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200">{texts.editProfile[language]}</button><button onClick={() => onToggleStatus(vendor.id, vendor.status)} className={`px-3 py-1 text-xs font-semibold rounded-md ${vendor.status === 'Active' ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>{vendor.status === 'Active' ? 'Suspend' : 'Reactivate'}</button></td></tr>))}</tbody></table>)}{tab === 'applications' && ( <div className="p-4 space-y-3">{data.vendorApplications.length > 0 ? data.vendorApplications.map(app => ( <div key={app.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><div className="flex items-center gap-3"><img src={app.avatar} className="w-10 h-10 rounded-full" alt={app.name} /><div ><p className="font-semibold text-slate-800">{app.name}</p><p className="text-xs text-slate-500">{getAreaNames(app.coverageArea)}</p></div></div><button onClick={() => onReview(app)} className="px-3 py-1 text-sm font-semibold text-slate-100 bg-primary hover:bg-sky-700 rounded-md">{texts.reviewApplication[language]}</button></div>)) : <p className="text-slate-500 p-4">{language === 'bn' ? 'কোনো নতুন আবেদন নেই।': 'No new applications.'}</p>}</div>)}</div></div>
    );
};

const BookingsView: React.FC<{ bookings: Booking[], onCancelBooking: (id: string) => void, onViewPhotos: (booking: Booking) => void, language: Language }> = ({ bookings, onCancelBooking, onViewPhotos, language }) => {
    const getStatusChip = (status: BookingStatus) => {
        const styles: {[key: string]: string} = { [BookingStatus.Pending]: 'bg-yellow-100 text-yellow-800', [BookingStatus.Accepted]: 'bg-blue-100 text-blue-800', [BookingStatus.InProgress]: 'bg-indigo-100 text-indigo-800', [BookingStatus.Completed]: 'bg-green-100 text-green-800', [BookingStatus.Cancelled]: 'bg-red-100 text-red-800' };
        const pulseClass = status === BookingStatus.InProgress ? ' animate-pulse' : '';
        return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles[status]}${pulseClass}`}>{status}</span>;
    }
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto animate-fade-in">
             <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr><th className="px-6 py-3">Booking ID</th><th className="px-6 py-3">Customer</th><th className="px-6 py-3">Vendor</th><th className="px-6 py-3">Service</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Actions</th></tr>
                </thead>
                <tbody>
                    {bookings.map(b => (
                        <tr key={b.id} className="bg-white border-b">
                            <td className="px-6 py-4 font-mono text-xs">{b.id}</td>
                            <td className="px-6 py-4">{b.phone}</td>
                            <td className="px-6 py-4">{b.provider?.name || 'N/A'}</td>
                            <td className="px-6 py-4">{b.packageName}</td>
                            <td className="px-6 py-4">{getStatusChip(b.status)}</td>
                            <td className="px-6 py-4 flex gap-2">
                                {(b.status === BookingStatus.Pending || b.status === BookingStatus.Accepted || b.status === BookingStatus.InProgress) && (
                                    <button onClick={() => onCancelBooking(b.id)} className="px-3 py-1 text-sm font-semibold rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200">Cancel</button>
                                )}
                                {(b.beforePhotoUrls && b.beforePhotoUrls.length > 0) && (
                                    <button onClick={() => onViewPhotos(b)} className="px-3 py-1 text-sm font-semibold rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200">{TEXTS.adminDashboard.viewPhotos[language]}</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    )
}

const ModeratorsView: React.FC<{ moderators: Moderator[], activityLog: ModeratorActivityLog[], bookings: Booking[], vendors: Vendor[], language: Language, onAddModerator: (data: Omit<Moderator, 'id'>) => void, onRemoveModerator: (id: string) => void, onEditProfile: (moderator: Moderator) => void }> = ({ moderators, activityLog, bookings, vendors, language, onAddModerator, onRemoveModerator, onEditProfile }) => {
    const [tab, setTab] = useState<'accounts' | 'log'>('accounts');
    const [isModalOpen, setModalOpen] = useState(false);
    const texts = TEXTS.adminDashboard;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 p-1 bg-slate-200 rounded-lg w-fit">
                    <button onClick={() => setTab('accounts')} className={`px-4 py-1.5 text-sm font-semibold rounded-md ${tab === 'accounts' ? 'bg-slate-50 shadow' : ''}`}>{texts.moderatorAccounts[language]}</button>
                    <button onClick={() => setTab('log')} className={`px-4 py-1.5 text-sm font-semibold rounded-md ${tab === 'log' ? 'bg-slate-50 shadow' : ''}`}>{texts.activityLog[language]}</button>
                </div>
                {tab === 'accounts' && <button onClick={() => setModalOpen(true)} className="px-4 py-2 font-semibold text-slate-100 bg-primary rounded-lg">{texts.addModerator[language]}</button>}
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                {tab === 'accounts' && (
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {moderators.map(mod => (
                                <tr key={mod.id} className="bg-white border-b">
                                    <td className="px-6 py-4 font-semibold">{mod.name}</td>
                                    <td className="px-6 py-4">{mod.email}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button onClick={() => onEditProfile(mod)} className="px-3 py-1 text-sm font-semibold rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200">{texts.editProfile[language]}</button>
                                        <button onClick={() => { if(window.confirm(texts.removeConfirm[language])) onRemoveModerator(mod.id) }} className="px-3 py-1 text-sm font-semibold rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200">{texts.remove[language]}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {tab === 'log' && (
                     <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">Timestamp</th>
                                <th className="px-6 py-3">Moderator</th>
                                <th className="px-6 py-3">Action</th>
                                <th className="px-6 py-3">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activityLog.map(log => (
                                <tr key={log.id} className="bg-white border-b">
                                    <td className="px-6 py-4 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4 font-semibold">{log.moderatorName}</td>
                                    <td className="px-6 py-4">{log.action}</td>
                                    <td className="px-6 py-4">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                     </table>
                )}
            </div>
            {isModalOpen && <AddModeratorModal language={language} onClose={() => setModalOpen(false)} onSave={(data) => { onAddModerator(data); setModalOpen(false); }} />}
        </div>
    );
};


const ServiceManagementView: React.FC<{ services: ServiceDetail[], serviceAreas: ServiceArea[], language: Language, onAction: (action: () => Promise<any>) => void }> = ({ services, serviceAreas, language, onAction }) => {
    const texts = TEXTS.adminDashboard;
    const [isServiceModalOpen, setServiceModalOpen] = useState(false);
    const [isPackageModalOpen, setPackageModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<ServiceDetail | null>(null);
    const [managingPackagesFor, setManagingPackagesFor] = useState<ServiceDetail | null>(null);
    const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);

    const handleOpenServiceModal = (service: ServiceDetail | null = null) => {
        setEditingService(service);
        setServiceModalOpen(true);
    };

    const handleOpenPackageModal = (service: ServiceDetail, pkg: ServicePackage | null = null) => {
        setManagingPackagesFor(service);
        setEditingPackage(pkg);
        setPackageModalOpen(true);
    };
    
    const handleDeleteService = (serviceId: string) => {
      if (window.confirm(texts.deleteConfirm[language])) {
        onAction(() => api.deleteService(serviceId));
      }
    };
    
    const handleDeletePackage = (serviceId: string, packageId: string) => {
      if (window.confirm(texts.deleteConfirm[language])) {
        onAction(() => api.deletePackage(serviceId, packageId));
      }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">{texts.serviceManagement[language]}</h2>
                <button onClick={() => handleOpenServiceModal()} className="px-4 py-2 font-semibold text-slate-100 bg-primary rounded-lg">{texts.addNewService[language]}</button>
            </div>
            {managingPackagesFor ? (
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setManagingPackagesFor(null)} className="font-semibold text-primary">&larr; Back to Services</button>
                        <h3 className="text-xl font-bold">{managingPackagesFor.name[language]} - {texts.managePackages[language]}</h3>
                        <button onClick={() => handleOpenPackageModal(managingPackagesFor)} className="px-4 py-2 font-semibold text-slate-100 bg-primary rounded-lg">{texts.addNewPackage[language]}</button>
                    </div>
                    <div className="space-y-3">
                        {managingPackagesFor.packages.map(pkg => (
                            <div key={pkg.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                                <div>
                                    <p className="font-semibold">{pkg.name[language]}</p>
                                    <p className="text-sm text-slate-500">{pkg.price_range[language]} | {pkg.duration[language]}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenPackageModal(managingPackagesFor, pkg)} className="text-sm font-semibold text-primary">Edit</button>
                                    <button onClick={() => handleDeletePackage(managingPackagesFor.id, pkg.id)} className="text-sm font-semibold text-danger">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-xl shadow-sm space-y-3">
                    {services.map(service => {
                        const Icon = SERVICE_ICONS_MAP[service.iconName];
                        return (
                            <div key={service.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                                <div className="flex items-center gap-4 w-1/3">
                                    <Icon className="w-8 h-8 text-primary"/>
                                    <p className="font-bold text-lg">{service.name[language]}</p>
                                </div>
                                <div className="text-xs text-slate-500 w-1/3 text-center px-4">
                                    <span className="font-semibold">Locations: </span>
                                    {(service.availableAreaIds && service.availableAreaIds.length > 0)
                                        ? service.availableAreaIds.map(id => serviceAreas.find(a => a.id === id)?.name[language]).join(', ')
                                        : 'Not set'
                                    }
                                </div>
                                <div className="flex items-center gap-4 w-1/3 justify-end">
                                    <button onClick={() => setManagingPackagesFor(service)} className="font-semibold text-primary">{texts.managePackages[language]} ({service.packages.length})</button>
                                    <button onClick={() => handleOpenServiceModal(service)} className="text-sm font-semibold text-primary">Edit</button>
                                    <button onClick={() => handleDeleteService(service.id)} className="text-sm font-semibold text-danger">Delete</button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
            
            {isServiceModalOpen && <ServiceModal service={editingService} serviceAreas={serviceAreas} language={language} onClose={() => setServiceModalOpen(false)} onSave={(data) => { onAction(() => editingService ? api.updateService(editingService.id, data) : api.addService(data)); setServiceModalOpen(false); }} />}
            {isPackageModalOpen && managingPackagesFor && <PackageModal serviceId={managingPackagesFor.id} pkg={editingPackage} language={language} onClose={() => setPackageModalOpen(false)} onSave={(data) => { onAction(() => editingPackage ? api.updatePackage(managingPackagesFor.id, editingPackage.id, data) : api.addPackage(managingPackagesFor.id, data)); setPackageModalOpen(false); }}/>}
        </div>
    )
};

const LocationsView: React.FC<{ serviceAreas: ServiceArea[], language: Language, onAction: (action: () => Promise<any>) => void }> = ({ serviceAreas, language, onAction }) => {
    const texts = TEXTS.adminDashboard;
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);

    const handleOpenModal = (area: ServiceArea | null = null) => {
        setEditingArea(area);
        setModalOpen(true);
    };

    const handleSave = (data: any) => {
        onAction(() => editingArea ? api.updateServiceArea(editingArea.id, data) : api.addServiceArea(data));
        setModalOpen(false);
    };
    
    const handleToggle = (areaId: string) => {
        onAction(() => api.toggleServiceAreaStatus(areaId));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">{texts.locationManagement[language]}</h2>
                <button onClick={() => handleOpenModal()} className="px-4 py-2 font-semibold text-slate-100 bg-primary rounded-lg">{texts.addNewArea[language]}</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                 <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">Area Name</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {serviceAreas.map(area => (
                            <tr key={area.id} className="bg-white border-b">
                                <td className="px-6 py-4 font-semibold">{area.name[language]}</td>
                                <td className="px-6 py-4">
                                     <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${area.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{area.status}</span>
                                </td>
                                <td className="px-6 py-4 flex gap-4">
                                    <button onClick={() => handleToggle(area.id)} className="text-sm font-semibold text-primary">Toggle Status</button>
                                    <button onClick={() => handleOpenModal(area)} className="text-sm font-semibold text-primary">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
            {isModalOpen && <LocationModal area={editingArea} language={language} onClose={() => setModalOpen(false)} onSave={handleSave} />}
        </div>
    );
};

const FinanceView: React.FC<{ data: PlatformData, language: Language, onApproveWithdrawal: (id: string) => void }> = ({ data, language, onApproveWithdrawal }) => {
    const texts = TEXTS.adminDashboard;
    const formatCurrency = (val: number) => `৳${val.toLocaleString(language === Language.BN ? 'bn-BD' : 'en-US')}`;
    const pendingWithdrawals = data.withdrawals.filter(w => w.status === WithdrawalStatus.Pending);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title={texts.totalRevenue[language]} value={formatCurrency(data.totalRevenue)} icon={<FinanceIcon className="w-6 h-6"/>} />
                <StatCard title={texts.totalCommission[language]} value={formatCurrency(data.totalCommission)} icon={<UsersIcon className="w-6 h-6"/>} />
                <StatCard title={texts.subscriptionRevenue[language]} value={formatCurrency(data.totalSubscriptionRevenue)} icon={<SubscriptionsIcon className="w-6 h-6"/>} />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-4">{texts.withdrawalRequests[language]}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">Vendor</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">bKash Number</th>
                                <th className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingWithdrawals.length > 0 ? pendingWithdrawals.map(w => {
                                const vendor = data.vendors.find(v => v.id === w.vendorId);
                                return (
                                    <tr key={w.id} className="bg-white border-b">
                                        <td className="px-6 py-4 font-semibold">{vendor?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 font-semibold text-primary">{formatCurrency(w.amount)}</td>
                                        <td className="px-6 py-4">{w.accountNumber}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => onApproveWithdrawal(w.id)} className="px-3 py-1 text-sm font-semibold rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200">{texts.markAsCompleted[language]}</button>
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr><td colSpan={4} className="text-center py-8 text-slate-500">No pending withdrawal requests.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const SubscriptionsView: React.FC<{ data: PlatformData, language: Language }> = ({ data, language }) => {
    const customerSubscribers = data.users.filter(u => u.subscription);
    const vendorProSubscribers = data.vendors.filter(v => v.subscription.planName === 'Pro');
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-xl mb-4">FixBD Plus Members ({customerSubscribers.length})</h3>
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {customerSubscribers.map(c => <li key={c.id} className="text-sm p-2 bg-slate-50 rounded">{c.name}</li>)}
                </ul>
            </div>
             <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-xl mb-4">Vendor Pro Subscribers ({vendorProSubscribers.length})</h3>
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {vendorProSubscribers.map(v => <li key={v.id} className="text-sm p-2 bg-slate-50 rounded">{v.name}</li>)}
                </ul>
            </div>
        </div>
    )
};


const ReviewApplicationModal: React.FC<{ application: VendorApplication; platformData: PlatformData; language: Language; onClose: () => void; onApprove: () => void; onReject: () => void; }> = ({ application, platformData, language, onClose, onApprove, onReject }) => {
    const texts = TEXTS.adminDashboard;
    const vendorTexts = TEXTS.vendorSignUp;
    const getAreaNames = (areaIds: string[]) => {
        return areaIds.map(id => platformData.serviceAreas.find(a => a.id === id)?.name[language] || id).join(', ');
    };
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b"><h2 className="text-xl font-bold text-slate-800">{texts.reviewApplication[language]}</h2></div>
                <div className="p-6 space-y-2 text-sm max-h-[70vh] overflow-y-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <img src={application.avatar} className="w-20 h-20 rounded-full object-cover" alt={application.name} />
                        <div>
                            <p className="text-lg font-bold">{application.name}</p>
                            <p className="text-slate-600">{application.phone}</p>
                            <p className="text-slate-600">{application.email}</p>
                        </div>
                    </div>
                    <p><span className="font-semibold">{vendorTexts.address[language]}:</span> {application.address}</p>
                    <p><span className="font-semibold">{vendorTexts.voterIdNumber[language]}:</span> {application.voterIdNumber}</p>
                    <p><span className="font-semibold">{vendorTexts.experienceYears[language]}:</span> {application.experienceYears} years</p>
                    <p><span className="font-semibold">{vendorTexts.hasSmartphone[language]}:</span> {application.hasSmartphone ? vendorTexts.yes[language] : vendorTexts.no[language]}</p>
                    <p><span className="font-semibold">{vendorTexts.hasBikeOrCycle[language]}:</span> {application.hasBikeOrCycle ? vendorTexts.yes[language] : vendorTexts.no[language]}</p>
                    <p><span className="font-semibold">{vendorTexts.selectCoverage[language]}:</span> {getAreaNames(application.coverageArea)}</p>
                    <p><span className="font-semibold">{vendorTexts.selectSkills[language]}:</span> {application.skills.map(s => platformData.services.find(sd => sd.id === s)?.name[language]).join(', ')}</p>
                    
                    <div className="pt-2">
                        <p className="font-semibold text-slate-700">Voter ID Card:</p>
                        <img src={application.voterIdPhotoUrl} alt="Voter ID" className="rounded-lg border max-w-full h-auto mt-1 shadow-sm" />
                    </div>
                    <div className="pt-2">
                         <a href={application.cvUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{texts.viewCV[language]}</a>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                    <button onClick={onReject} className="px-4 py-2 font-semibold text-slate-100 bg-danger rounded-lg">{texts.reject[language]}</button>
                    <button onClick={onApprove} className="px-4 py-2 font-semibold text-slate-100 bg-primary rounded-lg">{texts.approve[language]}</button>
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

// --- Service & Package Modals ---
const ServiceModal: React.FC<{ service: ServiceDetail | null, serviceAreas: ServiceArea[], language: Language, onClose: () => void, onSave: (data: any) => void }> = ({ service, serviceAreas, language, onClose, onSave }) => {
    const texts = TEXTS.adminDashboard;
    const [isUploading, setIsUploading] = useState(false);
    const [heroImageFile, setHeroImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        id: service?.id || '',
        name: { en: service?.name.en || '', bn: service?.name.bn || '' },
        description: { en: service?.description.en || '', bn: service?.description.bn || '' },
        heroImage: service?.heroImage || '',
        iconName: service?.iconName || Object.keys(SERVICE_ICONS_MAP)[0],
        availableAreaIds: service?.availableAreaIds || [],
    });

    useEffect(() => {
        // Cleanup blob URL on unmount
        return () => {
            if (formData.heroImage && formData.heroImage.startsWith('blob:')) {
                URL.revokeObjectURL(formData.heroImage);
            }
        };
    }, [formData.heroImage]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, lang?: Language) => {
        const { name, value } = e.target;
        if (lang) {
            setFormData(prev => ({ ...prev, [name]: { ...(prev as any)[name], [lang]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setHeroImageFile(file);
            
            if (formData.heroImage && formData.heroImage.startsWith('blob:')) {
                URL.revokeObjectURL(formData.heroImage);
            }

            const previewUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, heroImage: previewUrl }));
        }
    };
    
    const handleAreaToggle = (areaId: string) => {
        setFormData(prev => {
            const newAreaIds = (prev.availableAreaIds || []).includes(areaId)
                ? (prev.availableAreaIds || []).filter(id => id !== areaId)
                : [...(prev.availableAreaIds || []), areaId];
            return { ...prev, availableAreaIds: newAreaIds };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        let finalData = { ...formData };

        if (heroImageFile) {
            try {
                const imageUrl = await api.uploadFileToS3(heroImageFile);
                finalData.heroImage = imageUrl;
            } catch (error) {
                console.error("Hero image upload failed", error);
                alert("Image upload failed. Please try again.");
                setIsUploading(false);
                return;
            }
        }
        
        if (!finalData.heroImage) {
             alert("Hero Image is required.");
             setIsUploading(false);
             return;
        }

        onSave(finalData);
    };
    const inputClasses = "w-full p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition";

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b"><h2 className="text-xl font-bold text-slate-800">{service ? texts.editService[language] : texts.addNewService[language]}</h2></div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <input name="id" value={formData.id} onChange={handleChange} placeholder="Service ID (e.g., ac-cleaning)" className={inputClasses} required disabled={!!service} />
                    <input name="name" value={formData.name.en} onChange={(e) => handleChange(e, Language.EN)} placeholder={texts.serviceNameEn[language]} className={inputClasses} required />
                    <input name="name" value={formData.name.bn} onChange={(e) => handleChange(e, Language.BN)} placeholder={texts.serviceNameBn[language]} className={inputClasses} required />
                    <textarea name="description" value={formData.description.en} onChange={(e) => handleChange(e, Language.EN)} placeholder={texts.descriptionEn[language]} className={inputClasses} rows={3}></textarea>
                    <textarea name="description" value={formData.description.bn} onChange={(e) => handleChange(e, Language.BN)} placeholder={texts.descriptionBn[language]} className={inputClasses} rows={3}></textarea>
                    
                    <div>
                        <label className="font-semibold text-sm">{texts.heroImageUrl[language]}</label>
                        {formData.heroImage && <img src={formData.heroImage} alt="Hero Preview" className="my-2 rounded-lg border max-w-xs h-auto shadow-sm" />}
                        <input type="file" accept="image/*" onChange={handleHeroImageChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" required={!service?.heroImage} />
                    </div>

                    <select name="iconName" value={formData.iconName} onChange={handleChange} className={inputClasses}>
                        {Object.keys(SERVICE_ICONS_MAP).map(key => <option key={key} value={key}>{key}</option>)}
                    </select>
                    <div className="space-y-2">
                        <label className="font-semibold text-slate-700">Available Locations</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg border">
                            {serviceAreas.filter(a => a.status === 'Active').map(area => (
                                <label key={area.id} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={(formData.availableAreaIds || []).includes(area.id)}
                                        onChange={() => handleAreaToggle(area.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    {area.name[language]}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-slate-600 bg-slate-200 rounded-lg">{texts.cancel[language]}</button>
                    <button type="submit" disabled={isUploading} className="px-4 py-2 font-semibold text-slate-100 bg-primary rounded-lg disabled:bg-slate-400">
                        {isUploading ? "Uploading..." : texts.save[language]}
                    </button>
                </div>
            </form>
        </div>
    )
}

const PackageModal: React.FC<{ serviceId: string, pkg: ServicePackage | null, language: Language, onClose: () => void, onSave: (data: any) => void }> = ({ pkg, language, onClose, onSave }) => {
    const texts = TEXTS.adminDashboard;
    const [formData, setFormData] = useState({
        name: { en: pkg?.name.en || '', bn: pkg?.name.bn || '' },
        price_range: { en: pkg?.price_range.en || '', bn: pkg?.price_range.bn || '' },
        base_price: pkg?.base_price || 0,
        duration: { en: pkg?.duration.en || '', bn: pkg?.duration.bn || '' },
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, lang?: Language) => {
        const { name, value } = e.target;
        if (lang) {
            setFormData(prev => ({ ...prev, [name]: { ...(prev as any)[name], [lang]: value } }));
        } else {
             setFormData(prev => ({ ...prev, [name]: name === 'base_price' ? parseInt(value) || 0 : value }));
        }
    };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    const inputClasses = "w-full p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition";
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b"><h2 className="text-xl font-bold text-slate-800">{pkg ? texts.editPackage[language] : texts.addNewPackage[language]}</h2></div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <input name="name" value={formData.name.en} onChange={(e) => handleChange(e, Language.EN)} placeholder={texts.packageNameEn[language]} className={inputClasses} required />
                    <input name="name" value={formData.name.bn} onChange={(e) => handleChange(e, Language.BN)} placeholder={texts.packageNameBn[language]} className={inputClasses} required />
                    <input name="price_range" value={formData.price_range.en} onChange={(e) => handleChange(e, Language.EN)} placeholder={texts.priceRangeEn[language]} className={inputClasses} />
                    <input name="price_range" value={formData.price_range.bn} onChange={(e) => handleChange(e, Language.BN)} placeholder={texts.priceRangeBn[language]} className={inputClasses} />
                    <input type="number" name="base_price" value={formData.base_price} onChange={handleChange} placeholder={texts.basePrice[language]} className={inputClasses} required/>
                    <input name="duration" value={formData.duration.en} onChange={(e) => handleChange(e, Language.EN)} placeholder={texts.durationEn[language]} className={inputClasses} />
                    <input name="duration" value={formData.duration.bn} onChange={(e) => handleChange(e, Language.BN)} placeholder={texts.durationBn[language]} className={inputClasses} />
                </div>
                 <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-slate-600 bg-slate-200 rounded-lg">{texts.cancel[language]}</button>
                    <button type="submit" className="px-4 py-2 font-semibold text-slate-100 bg-primary rounded-lg">{texts.save[language]}</button>
                </div>
            </form>
        </div>
    )
}

const LocationModal: React.FC<{ area: ServiceArea | null, language: Language, onClose: () => void, onSave: (data: any) => void }> = ({ area, language, onClose, onSave }) => {
    const texts = TEXTS.adminDashboard;
    const [formData, setFormData] = useState({
        name: { en: area?.name.en || '', bn: area?.name.bn || '' },
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, lang: Language) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: { ...(prev as any)[name], [lang]: value } }));
    };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    const inputClasses = "w-full p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition";

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b"><h2 className="text-xl font-bold text-slate-800">{area ? texts.editArea[language] : texts.addNewArea[language]}</h2></div>
                <div className="p-6 space-y-4">
                    <input name="name" value={formData.name.en} onChange={(e) => handleChange(e, Language.EN)} placeholder={texts.areaNameEn[language]} className={inputClasses} required />
                    <input name="name" value={formData.name.bn} onChange={(e) => handleChange(e, Language.BN)} placeholder={texts.areaNameBn[language]} className={inputClasses} required />
                </div>
                <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-slate-600 bg-slate-200 rounded-lg">{texts.cancel[language]}</button>
                    <button type="submit" className="px-4 py-2 font-semibold text-slate-100 bg-primary rounded-lg">{texts.save[language]}</button>
                </div>
            </form>
        </div>
    )
};

const ManageVendorAreasModal: React.FC<{
    vendor: Vendor;
    allAreas: ServiceArea[];
    language: Language;
    onClose: () => void;
    onSave: (areaIds: string[]) => void;
}> = ({ vendor, allAreas, language, onClose, onSave }) => {
    const texts = TEXTS.adminDashboard;
    const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>(vendor.coverageArea);

    const handleToggleArea = (areaId: string) => {
        setSelectedAreaIds(prev =>
            prev.includes(areaId)
                ? prev.filter(id => id !== areaId)
                : [...prev, areaId]
        );
    };

    const activeAreas = allAreas.filter(a => a.status === 'Active');

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-slate-800">{texts.manageVendorAreasTitle[language]} <span className="text-primary">{vendor.name}</span></h2>
                </div>
                <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                        {activeAreas.map(area => (
                            <label key={area.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-md cursor-pointer hover:bg-slate-100">
                                <input
                                    type="checkbox"
                                    checked={selectedAreaIds.includes(area.id)}
                                    onChange={() => handleToggleArea(area.id)}
                                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="font-medium text-slate-700">{area.name[language]}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-slate-600 bg-slate-200 rounded-lg">{texts.cancel[language]}</button>
                    <button type="button" onClick={() => onSave(selectedAreaIds)} className="px-4 py-2 font-semibold text-slate-100 bg-primary rounded-lg">{texts.save[language]}</button>
                </div>
            </div>
        </div>
    );
};

// --- Add Moderator Modal ---
const AddModeratorModal: React.FC<{ language: Language, onClose: () => void, onSave: (data: Omit<Moderator, 'id'>) => void }> = ({ language, onClose, onSave }) => {
    const texts = TEXTS.adminDashboard;
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        voterIdNumber: '',
        voterIdPhotoUrl: '',
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const url = await api.uploadFileToS3(e.target.files[0]);
                setFormData(prev => ({ ...prev, voterIdPhotoUrl: url }));
            } catch (err) {
                console.error("Voter ID upload failed:", err);
                alert("Voter ID photo upload failed. Please try again.");
            } finally {
                setIsUploading(false);
            }
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    const inputClasses = "w-full p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition";

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b"><h2 className="text-xl font-bold text-slate-800">{texts.addModerator[language]}</h2></div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder={texts.moderatorName[language]} className={inputClasses} required />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder={texts.email[language]} className={inputClasses} required />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={texts.password[language]} className={inputClasses} required />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder={texts.phone[language]} className={inputClasses} required />
                    <input name="address" value={formData.address} onChange={handleChange} placeholder={texts.address[language]} className={inputClasses} required />
                    <input name="voterIdNumber" value={formData.voterIdNumber} onChange={handleChange} placeholder={texts.voterIdNumber[language]} className={inputClasses} required />
                    <div>
                        <label className="font-semibold text-sm">{texts.voterIdPhoto[language]}</label>
                        {formData.voterIdPhotoUrl && <img src={formData.voterIdPhotoUrl} alt="Voter ID Preview" className="my-2 rounded-lg border max-w-xs h-auto shadow-sm" />}
                        <label className="text-sm font-semibold">{texts.uploadNewPhoto[language]}</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" required={!formData.voterIdPhotoUrl} />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-slate-600 bg-slate-200 rounded-lg">{texts.cancel[language]}</button>
                    <button type="submit" disabled={isUploading} className="px-4 py-2 font-semibold text-slate-100 bg-primary rounded-lg disabled:bg-slate-400">
                        {isUploading ? 'Uploading...' : texts.save[language]}
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- Edit Profile Modals ---
const EditVendorModal: React.FC<{ vendor: Vendor, language: Language, onClose: () => void, onSave: (id: string, data: Partial<Vendor>) => void }> = ({ vendor, language, onClose, onSave }) => {
    const texts = TEXTS.adminDashboard;
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState<Partial<Vendor>>({ ...vendor });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const url = await api.uploadFileToS3(e.target.files[0]);
                setFormData(prev => ({ ...prev, voterIdPhotoUrl: url }));
            } catch(err) {
                 console.error("Voter ID upload failed:", err);
                 alert("Voter ID photo upload failed. Please try again.");
            } finally {
                setIsUploading(false);
            }
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(vendor.id, formData);
    };
    const inputClasses = "w-full p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition";

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b"><h2 className="text-xl font-bold text-slate-800">{texts.editVendorProfile[language]}</h2></div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder={texts.moderatorName[language]} className={inputClasses} required />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder={texts.email[language]} className={inputClasses} required />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder={texts.phone[language]} className={inputClasses} required />
                    <input name="address" value={formData.address} onChange={handleChange} placeholder={texts.address[language]} className={inputClasses} required />
                    <input name="voterIdNumber" value={formData.voterIdNumber} onChange={handleChange} placeholder={texts.voterIdNumber[language]} className={inputClasses} required />
                    <div>
                        <label className="font-semibold text-sm">{texts.voterIdPhoto[language]}</label>
                        <img src={formData.voterIdPhotoUrl} alt="Voter ID" className="my-2 rounded-lg border max-w-xs h-auto shadow-sm" />
                        <label className="text-sm font-semibold">{texts.uploadNewPhoto[language]}</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-slate-600 bg-slate-200 rounded-lg">{texts.cancel[language]}</button>
                    <button type="submit" disabled={isUploading} className="px-4 py-2 font-semibold text-slate-100 bg-primary rounded-lg disabled:bg-slate-400">{isUploading ? "Uploading..." : texts.save[language]}</button>
                </div>
            </form>
        </div>
    );
};

const EditModeratorModal: React.FC<{ moderator: Moderator, language: Language, onClose: () => void, onSave: (id: string, data: Partial<Moderator>) => void }> = ({ moderator, language, onClose, onSave }) => {
    const texts = TEXTS.adminDashboard;
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState<Partial<Moderator> & { password?: string }>({ ...moderator, password: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const url = await api.uploadFileToS3(e.target.files[0]);
                setFormData(prev => ({ ...prev, voterIdPhotoUrl: url }));
            } catch (err) {
                 console.error("Voter ID upload failed:", err);
                 alert("Voter ID photo upload failed. Please try again.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = { ...formData };
        if (!dataToSave.password) {
            delete dataToSave.password;
        }
        onSave(moderator.id, dataToSave);
    };

    const inputClasses = "w-full p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition";

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b"><h2 className="text-xl font-bold text-slate-800">{texts.editModeratorProfile[language]}</h2></div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder={texts.moderatorName[language]} className={inputClasses} required />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder={texts.email[language]} className={inputClasses} required />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন না করতে খালি রাখুন' : 'Leave blank to keep current password'} className={inputClasses} />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder={texts.phone[language]} className={inputClasses} required />
                    <input name="address" value={formData.address} onChange={handleChange} placeholder={texts.address[language]} className={inputClasses} required />
                    <input name="voterIdNumber" value={formData.voterIdNumber} onChange={handleChange} placeholder={texts.voterIdNumber[language]} className={inputClasses} required />
                     <div>
                        <label className="font-semibold text-sm">{texts.voterIdPhoto[language]}</label>
                        <img src={formData.voterIdPhotoUrl} alt="Voter ID" className="my-2 rounded-lg border max-w-xs h-auto shadow-sm" />
                        <label className="text-sm font-semibold">{texts.uploadNewPhoto[language]}</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-slate-600 bg-slate-200 rounded-lg">{texts.cancel[language]}</button>
                    <button type="submit" disabled={isUploading} className="px-4 py-2 font-semibold text-slate-100 bg-primary rounded-lg disabled:bg-slate-400">{isUploading ? 'Uploading...' : texts.save[language]}</button>
                </div>
            </form>
        </div>
    );
};


export default AdminDashboard;