import React, { useState, useEffect } from 'react';
import { Language, PlatformData, VendorApplication, Vendor, Moderator, ChatSession, ChatMessage, WorkingHours, VendorRealtimeStatus, Withdrawal } from './types';
import AdminDashboard from './components/AdminDashboard';
import ModeratorLogin from './components/ModeratorLogin';
import ModeratorDashboard from './components/ModeratorDashboard';
import { TEXTS } from './constants';
import * as api from './api';
import { HomePageSkeleton, DashboardSkeleton } from './components/SkeletonLoader';

type AdminView = 'moderator_login' | 'moderator_dashboard' | 'admin_dashboard';

const AdminApp: React.FC = () => {
    const [language, setLanguage] = useState<Language>(Language.EN);
    const [view, setView] = useState<AdminView>('moderator_login');
    const [isLoading, setIsLoading] = useState(true);
    const [platformData, setPlatformData] = useState<Partial<PlatformData> | null>(null);
    const [currentModerator, setCurrentModerator] = useState<Moderator | null>(null);
    
    const [activeChatSession, setActiveChatSession] = useState<ChatSession | null>(null);

    const fetchData = async (isBackgroundFetch = false) => {
        if (!isBackgroundFetch) {
            if (!isLoading) setIsLoading(true);
        }
        try {
            const data = await api.fetchPlatformData();
            setPlatformData(data);
            if (activeChatSession && currentModerator && data.chatSessions) {
                const refreshedSession = data.chatSessions.find(s => s.id === activeChatSession.id && s.moderatorId === currentModerator.id);
                setActiveChatSession(refreshedSession || null);
            }
        } catch (error) {
            console.error("Failed to fetch platform data:", error);
            if (error instanceof Error && error.message.includes('Not authorized')) {
                handleModeratorLogout();
            }
        } finally {
            if (!isBackgroundFetch) {
                setIsLoading(false);
            }
        }
    };

    // Effect for initializing the app from session storage, runs once on mount
    useEffect(() => {
        const initializeApp = async () => {
            setIsLoading(true);
            let isAuthenticated = false;
            try {
                const storedModerator = sessionStorage.getItem('fixbd-moderator');
                const storedToken = sessionStorage.getItem('fixbd-moderator-token');
                if (storedModerator && storedToken) {
                    const moderator = JSON.parse(storedModerator);
                    api.setAuthToken(storedToken);
                    isAuthenticated = true;
                    setCurrentModerator(moderator);
                    if (moderator.email === 'admin@fixbd.com') {
                        setView('admin_dashboard');
                    } else {
                        setView('moderator_dashboard');
                    }
                }
            } catch (error) {
                console.error("Failed to parse session storage data for moderator", error);
                sessionStorage.removeItem('fixbd-moderator');
                sessionStorage.removeItem('fixbd-moderator-token');
            }
            
            if (isAuthenticated) {
                await fetchData();
            } else {
                // No data needed for login screen
                setIsLoading(false);
            }
        };

        initializeApp();
    }, []);

    // Effect for managing the data polling interval, runs when moderator logs in/out
    useEffect(() => {
        if (currentModerator) {
            const pollInterval = setInterval(() => {
                fetchData(true); // Background fetch only if logged in
            }, 15000); // Poll every 15 seconds
    
            return () => clearInterval(pollInterval); // Cleanup on unmount or when currentModerator changes
        }
    }, [currentModerator]);
    
    const handleModeratorLoginSuccess = (response: { moderator: Moderator, token: string }) => {
        const { moderator, token } = response;
        sessionStorage.setItem('fixbd-moderator', JSON.stringify(moderator));
        sessionStorage.setItem('fixbd-moderator-token', token);
        api.setAuthToken(token);
        setCurrentModerator(moderator);
        if (moderator.email === 'admin@fixbd.com') {
            setView('admin_dashboard');
        } else {
            setView('moderator_dashboard');
        }
        fetchData();
    };

    const handleModeratorLogout = () => {
        sessionStorage.removeItem('fixbd-moderator');
        sessionStorage.removeItem('fixbd-moderator-token');
        api.setAuthToken(null);
        setCurrentModerator(null);
        setActiveChatSession(null);
        setPlatformData(null);
        setView('moderator_login');
    }

    const handleApiAction = async (action: () => Promise<any>) => {
        setIsLoading(true);
        try {
            await action();
            await fetchData(); // Refetch data on success
        } catch (error) {
            console.error("API action failed:", error);
            alert(`Action failed: ${(error as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveVendor = (application: VendorApplication) => handleApiAction(() => api.approveVendorApplication(application.id));
    const handleRejectVendor = (applicationId: string) => handleApiAction(() => api.rejectVendorApplication(applicationId));
    const handleToggleUserStatus = (userId: string) => handleApiAction(() => api.toggleUserStatus(userId));
    const handleToggleVendorStatus = (vendorId: string) => handleApiAction(() => api.toggleVendorStatus(vendorId));
    const handleCancelBookingByAdmin = (bookingId: string) => handleApiAction(() => api.cancelBookingByAdmin(bookingId));
    const handleServiceAction = (action: () => Promise<any>) => handleApiAction(action);
    const handleServiceAreaAction = (action: () => Promise<any>) => handleApiAction(action);
    const handleUpdateVendorCoverage = (vendorId: string, areaIds: string[]) => handleApiAction(() => api.updateVendorCoverage(vendorId, areaIds));
    const handleApproveWithdrawal = (withdrawalId: string) => handleApiAction(() => api.approveWithdrawal(withdrawalId));
    const handleAddModerator = (moderatorData: Omit<Moderator, 'id'>) => handleApiAction(() => api.addModerator(moderatorData));
    const handleRemoveModerator = (moderatorId: string) => handleApiAction(() => api.removeModerator(moderatorId));
    const handleUpdateVendorDetails = (vendorId: string, data: Partial<Vendor>) => handleApiAction(() => api.updateVendorDetails(vendorId, data));
    const handleUpdateModeratorDetails = (moderatorId: string, data: Partial<Moderator>) => handleApiAction(() => api.updateModeratorDetails(moderatorId, data));

    const handleAssignVendor = async (bookingId: string, vendorId: string, moderatorId: string) => {
        await handleApiAction(() => api.assignVendorToBooking(bookingId, vendorId, moderatorId));
    };

    const handleSendChatMessage = async (sessionId: string, text: string) => {
        if (!currentModerator) return;
        const message: Omit<ChatMessage, 'id' | 'timestamp'> = { sender: 'moderator', senderId: currentModerator.id, text };
        await api.sendChatMessage(sessionId, message);
        await fetchData(true);
    }

    const handleAcceptChat = async (sessionId: string) => {
        if (!currentModerator) return;
        setIsLoading(true);
        await api.assignModeratorToChat(sessionId, currentModerator.id);
        const acceptedSession = platformData?.chatSessions?.find(s => s.id === sessionId);
        if(acceptedSession) {
            setActiveChatSession(acceptedSession);
        }
        await fetchData(true);
        setIsLoading(false);
    };

    const renderView = () => {
        switch(view) {
            case 'moderator_login':
                return <ModeratorLogin language={language} onLoginSuccess={handleModeratorLoginSuccess} />;
            case 'moderator_dashboard':
                if (!currentModerator) {
                    setView('moderator_login');
                    return null;
                }
                if (isLoading && !platformData) {
                    return <DashboardSkeleton />;
                }
                if (!platformData) {
                    return <DashboardSkeleton />;
                }
                return <ModeratorDashboard
                    moderator={currentModerator}
                    platformData={platformData as PlatformData}
                    language={language}
                    onAssignVendor={handleAssignVendor}
                    onAcceptChat={handleAcceptChat}
                    onSendChatMessage={handleSendChatMessage}
                    onLogout={handleModeratorLogout}
                    onSwitchToAdminView={currentModerator.email === 'admin@fixbd.com' ? () => setView('admin_dashboard') : undefined}
                />;
            case 'admin_dashboard':
                if (!currentModerator) {
                    setView('moderator_login');
                    return null;
                }
                if (isLoading && !platformData) {
                    return <DashboardSkeleton />;
                }
                if (!platformData) {
                    return <DashboardSkeleton />;
                }
                return (
                    <AdminDashboard
                        platformData={platformData as PlatformData}
                        language={language}
                        setLanguage={setLanguage}
                        onExit={() => setView('moderator_dashboard')}
                        onApproveVendor={handleApproveVendor}
                        onRejectVendor={handleRejectVendor}
                        onToggleUserStatus={handleToggleUserStatus}
                        onToggleVendorStatus={handleToggleVendorStatus}
                        onCancelBooking={handleCancelBookingByAdmin}
                        onServiceAction={handleServiceAction}
                        onServiceAreaAction={handleServiceAreaAction}
                        onUpdateVendorCoverage={handleUpdateVendorCoverage}
                        onApproveWithdrawal={handleApproveWithdrawal}
                        onAddModerator={handleAddModerator}
                        onRemoveModerator={handleRemoveModerator}
                        onUpdateVendorDetails={handleUpdateVendorDetails}
                        onUpdateModeratorDetails={handleUpdateModeratorDetails}
                    />
                );
            default:
                return <ModeratorLogin language={language} onLoginSuccess={handleModeratorLoginSuccess} />;
        }
    }
    
    return (
        <div className={`${language === Language.BN ? 'font-hind-siluri' : 'font-inter'} bg-slate-100 min-h-screen relative`}>
            {renderView()}
            {view === 'moderator_login' && (
                <footer className="absolute bottom-4 right-4">
                    <button onClick={() => setView('admin_dashboard')} className="text-sm text-slate-500 hover:text-primary">
                        {TEXTS.footer.adminPanel[language]}
                    </button>
                </footer>
            )}
        </div>
    );
};

export default AdminApp;