

import React, { useState, useEffect, useRef } from 'react';
import { Language, ServiceDetail, Booking, Vendor, Customer, VendorApplication, PlatformData, ServicePackage, ChatSession, ChatMessage, WorkingHours, VendorRealtimeStatus } from './types';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import HowItWorks from './components/HowItWorks';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import ServiceCategoryPage from './components/ServiceCategoryPage';
import BookingFlow from './components/BookingFlow';
import BookingConfirmation from './components/BookingConfirmation';
import VendorDashboard from './components/VendorDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import PlusBanner from './components/PlusBanner';
import VendorLandingPage from './components/VendorLandingPage';
import VendorSignUpFlow from './components/VendorSignUpFlow';
import Chatbot from './components/Chatbot';
import BookingTracker from './components/BookingTracker';
import AuthPage from './components/AuthPage';
import LiveChat from './components/LiveChat';
import { HomeIcon, UserCircleIcon, WrenchScrewdriverIcon, UserPlusIcon } from './components/icons/NavIcons';
import { TEXTS } from './constants';
import * as api from './api';
import { HomePageSkeleton, DashboardSkeleton } from './components/SkeletonLoader';
import VendorSignupSuccess from './components/VendorSignupSuccess';

type View = 'customer_home' | 'service_page' | 'booking_confirmation' | 'vendor_landing' | 'vendor_dashboard' | 'customer_dashboard' | 'booking_tracker' | 'auth';

type AuthRedirectAction = {
  type: 'book';
  service: ServiceDetail;
  pkg: ServicePackage;
} | {
  type: 'view_dashboard';
} | null;


interface LandingBottomNavProps {
    language: Language;
    onGoHome: () => void;
    onScrollToServices: () => void;
    onVendorClick: () => void;
    onAccountClick: () => void;
    currentUser: Customer | null;
}

const LandingBottomNav: React.FC<LandingBottomNavProps> = ({ language, onGoHome, onScrollToServices, onVendorClick, onAccountClick, currentUser }) => {
    let navItems = [
        { name: TEXTS.bottomNav.home, icon: HomeIcon, action: onGoHome },
        { name: TEXTS.bottomNav.services, icon: WrenchScrewdriverIcon, action: onScrollToServices },
        { name: TEXTS.bottomNav.joinUs, icon: UserPlusIcon, action: onVendorClick },
        { name: TEXTS.bottomNav.account, icon: UserCircleIcon, action: onAccountClick },
    ];

    if (currentUser) {
        navItems = navItems.filter(item => item.name !== TEXTS.bottomNav.joinUs);
    }

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-t-lg z-20">
            <div className="flex justify-around items-center h-16">
                {navItems.map(item => (
                    <button key={item.name.en} onClick={item.action} className="flex flex-col items-center justify-center gap-1 text-xs font-medium w-full transition-colors text-slate-500 hover:text-primary">
                        <item.icon className="w-6 h-6" />
                        <span>{item.name[language]}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};


const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.EN);
  const [view, setView] = useState<View>('customer_home');
  
  // App State
  const [isLoading, setIsLoading] = useState(true);
  const [platformData, setPlatformData] = useState<Partial<PlatformData> | null>(null);
  const [filteredServices, setFilteredServices] = useState<ServiceDetail[]>([]);
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState<Customer | null>(null);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [authRedirectAction, setAuthRedirectAction] = useState<AuthRedirectAction>(null);

  // Flow State
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [serviceToBook, setServiceToBook] = useState<{ service: ServiceDetail, pkg: ServicePackage } | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [bookingToTrack, setBookingToTrack] = useState<Booking | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showVendorSignupSuccess, setShowVendorSignupSuccess] = useState(false);
  const [tempBookingDetails, setTempBookingDetails] = useState<any>(null);
  const [activeChatSession, setActiveChatSession] = useState<ChatSession | null>(null);

  const fetchData = async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) setIsLoading(true);
    try {
        const data = await api.fetchPlatformData();
        
        setPlatformData(prevData => ({ ...prevData, ...data })); // Merge with existing data
        if (data.services) {
          setFilteredServices(data.services);
        }
        
        // Refresh current user/vendor data after fetch
        if (currentUser && data.users) {
            const refreshedUser = data.users.find(u => u.id === currentUser.id);
            if (refreshedUser) {
                setCurrentUser(refreshedUser);
                sessionStorage.setItem('fixbd-user', JSON.stringify(refreshedUser));
            } else {
                handleLogout(); // User might have been deleted
            }
        }
        if (currentVendor && data.vendors) {
            const refreshedVendor = data.vendors.find(v => v.id === currentVendor.id);
            if (refreshedVendor) {
                setCurrentVendor(refreshedVendor);
                sessionStorage.setItem('fixbd-user', JSON.stringify(refreshedVendor));
            } else {
                handleLogout();
            }
        }

        // Refresh active chat session if it exists
        if (activeChatSession && data.chatSessions) {
            const refreshedSession = data.chatSessions.find(s => s.id === activeChatSession.id);
            setActiveChatSession(refreshedSession || null);
        }
    } catch (error) {
        console.error("Failed to fetch platform data", error);
        if (error instanceof Error && error.message.includes('Not authorized')) {
            handleLogout();
        }
    } finally {
        if (!isBackgroundRefresh) setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      let isAuthenticated = false;
      try {
        const storedUser = sessionStorage.getItem('fixbd-user');
        const storedToken = sessionStorage.getItem('fixbd-token');

        if (storedUser && storedToken) {
          const user = JSON.parse(storedUser);
          api.setAuthToken(storedToken);
          isAuthenticated = true;

          if ('earnings' in user) { // Vendor
              setCurrentVendor(user);
          } else { // Customer
              setCurrentUser(user);
          }
        }
      } catch (error) {
        console.error("Failed to parse session storage data", error);
        sessionStorage.clear();
      }
      
      try {
        if (isAuthenticated) {
            await fetchData();
        } else {
            const landingData = await api.fetchLandingPageData();
            setPlatformData(landingData);
            if (landingData.services) setFilteredServices(landingData.services);
        }
      } catch (error) {
        console.error("Failed to initialize app data", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };
  
  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setView('service_page');
    window.scrollTo(0, 0);
  };

  const resetToHome = () => {
    setView('customer_home');
    setSelectedServiceId(null);
    setServiceToBook(null);
    setConfirmedBooking(null);
    setBookingToTrack(null);
    if(platformData?.services) {
      setFilteredServices(platformData.services);
    }
    window.scrollTo(0, 0);
  };
  
  const handleAccountClick = () => {
    if (currentUser) {
      setView('customer_dashboard');
    } else if (currentVendor) {
      setView('vendor_dashboard');
    } else {
      setAuthRedirectAction({ type: 'view_dashboard' });
      setView('auth');
    }
  };
  
  const handleScrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartBooking = (service: ServiceDetail, pkg: ServicePackage) => {
    setServiceToBook({ service, pkg });
  };

  const handleCloseBooking = () => {
    setServiceToBook(null);
    setTempBookingDetails(null);
  };

  const handleConfirmBooking = async (details: Omit<Booking, 'id' | 'service' | 'provider' | 'status' | 'grossAmount' | 'commission' | 'finalPrice' | 'packageName' | 'customerId'>) => {
    if (!serviceToBook || !platformData || !currentUser) return;
    const { service, pkg } = serviceToBook;
    
    setIsLoading(true);
    
    try {
        await api.submitBooking(service, pkg, details, currentUser.id);
        await fetchData(); // Refetch all data
        
        setServiceToBook(null);
        setTempBookingDetails(null);
        setSelectedServiceId(null); 
        setView('customer_dashboard');
    } catch (error) {
        console.error("Booking failed:", error);
        const errorMessage = (error as Error).message || "An unknown error occurred during booking.";
        alert(`Booking Failed: ${errorMessage}`);
    } finally {
        setIsLoading(false);
        window.scrollTo(0, 0);
    }
  };
  
  const handleAuthRequestFromBooking = (details: any) => {
    if (!serviceToBook) return;
    setTempBookingDetails(details);
    setAuthRedirectAction({ type: 'book', service: serviceToBook.service, pkg: serviceToBook.pkg });
    setServiceToBook(null); // Close booking modal
    setView('auth');
  };
  
  const handleLoginSuccess = async (response: { user: Customer | Vendor; token: string }) => {
      const { user, token } = response;
      
      sessionStorage.setItem('fixbd-user', JSON.stringify(user));
      sessionStorage.setItem('fixbd-token', token);
      api.setAuthToken(token);

      await fetchData(); // Fetch full data after login

      if ('earnings' in user) { // Vendor
        setCurrentVendor(user as Vendor);
        setView('vendor_dashboard');
      } else { // Customer
        setCurrentUser(user as Customer);
        
        if (authRedirectAction) {
            if (authRedirectAction.type === 'book') {
                setServiceToBook({ service: authRedirectAction.service, pkg: authRedirectAction.pkg });
                setView('customer_home');
            } else if (authRedirectAction.type === 'view_dashboard') {
                setView('customer_dashboard');
            }
        } else {
            setView('customer_dashboard');
        }
      }
      setAuthRedirectAction(null);
  };
  
  const handleSignupSuccess = (response: { user: Customer, token: string }) => {
    handleLoginSuccess(response);
  };

  const handleLogout = () => {
      sessionStorage.removeItem('fixbd-user');
      sessionStorage.removeItem('fixbd-token');
      api.setAuthToken(null);
      setCurrentUser(null);
      setCurrentVendor(null);
      setActiveChatSession(null);
      if (platformData) {
          setPlatformData({ services: platformData.services || [], serviceAreas: platformData.serviceAreas || [] });
      }
      resetToHome();
  };

  const handleVendorSignUp = async (applicationData: Omit<VendorApplication, 'id' | 'status'> & { otp: string }) => {
    setIsLoading(true);
    try {
        await api.submitVendorApplication(applicationData);
        setIsSigningUp(false);
        setShowVendorSignupSuccess(true);
    } catch (error) {
        console.error("Vendor signup failed:", error);
        alert(`Signup failed: ${(error as Error).message}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
      if (!platformData?.services) return;
      setIsLoading(true);
      const results = await api.searchServices(query, platformData.services);
      setFilteredServices(results);
      setIsLoading(false);
  };
  
  const handleRateService = async (bookingId: string, rating: number, review: string) => {
    setIsLoading(true);
    await api.submitRating(bookingId, rating, review);
    await fetchData(true); // Background refresh
    setIsLoading(false);
  };

  const handleUpdateVendorWorkingHours = async (workingHours: WorkingHours) => {
    setIsLoading(true);
    await api.updateVendorWorkingHours(workingHours);
    await fetchData(true);
    setIsLoading(false);
  }

  const handleUpdateVendorRealtimeStatus = async (status: VendorRealtimeStatus) => {
    setIsLoading(true);
    await api.updateVendorRealtimeStatus(status);
    await fetchData(true);
    setIsLoading(false);
  };

  const handleToggleAutoAccept = async () => {
    setIsLoading(true);
    await api.toggleVendorAutoAccept();
    await fetchData(true);
    setIsLoading(false);
  };

  const handleStartJobWithPhoto = async (bookingId: string, beforePhotoUrls: string[]) => {
    setIsLoading(true);
    await api.startJob(bookingId, beforePhotoUrls);
    await fetchData();
    setIsLoading(false);
  };

  const handleCompleteJobWithPhoto = async (bookingId: string, afterPhotoUrls: string[]) => {
    setIsLoading(true);
    await api.completeJob(bookingId, afterPhotoUrls);
    await fetchData();
    setIsLoading(false);
  };
  
  const handleReportDelay = async (bookingId: string, reason: string, minutes: number) => {
    setIsLoading(true);
    await api.reportDelay(bookingId, reason, minutes);
    await fetchData(true);
    setIsLoading(false);
  }
  
  const handleTrackBooking = async (bookingId: string) => {
    setIsLoading(true);
    const booking = await api.fetchBookingById(bookingId);
    if (booking) {
      setBookingToTrack(booking);
      setView('booking_tracker');
      window.scrollTo(0, 0);
    }
    setIsLoading(false);
  };

  const handleBookAgain = (booking: Booking) => {
    if (!platformData?.services) return;
    const service = platformData.services.find(s => s.id === booking.service.id);
    if (!service) return;
    
    const pkg = service.packages.find(p => p.name.en === booking.packageName || p.name.bn === booking.packageName);
    if (pkg) {
      handleStartBooking(service, pkg);
    } else if (service.packages.length > 0) {
      handleStartBooking(service, service.packages[0]);
    }
  };
  
  const handleRequestWithdrawal = async (vendorId: string, amount: number, bKashNumber: string) => {
    setIsLoading(true);
    await api.requestWithdrawal(vendorId, amount, bKashNumber);
    await fetchData();
    setIsLoading(false);
  };

  const handleCreateChatSession = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    const session = await api.createChatSession(currentUser.id, currentUser.name);
    setActiveChatSession(session);
    await fetchData(true);
    setIsLoading(false);
  };

  const handleSendChatMessage = async (sessionId: string, text: string) => {
    if (!currentUser) return;
    const sender = 'customer';
    const senderId = currentUser.id;
    const message: Omit<ChatMessage, 'id' | 'timestamp'> = { sender, senderId, text };

    await api.sendChatMessage(sessionId, message);
    await fetchData(true);
  }

  const handleUpdateCustomerDetails = async (customerId: string, data: { name: string; address: string; avatar?: string; }) => {
    setIsLoading(true);
    await api.updateCustomerDetails(customerId, data);
    await fetchData(true);
    setIsLoading(false);
  };

  const handleUpdateVendorDetails = async (data: Partial<Vendor>) => {
    setIsLoading(true);
    await api.updateVendorDetailsSelf(data);
    await fetchData(true);
    setIsLoading(false);
  };

  const handleGoToVendorDashboard = () => {
    setView('vendor_dashboard');
  };

  const selectedService = selectedServiceId && platformData?.services
    ? platformData.services.find(s => s.id === selectedServiceId) 
    : null;
    
  const customerData = currentUser && platformData?.users ? platformData.users.find(u => u.id === currentUser.id) : null;
  
  if (isLoading && !platformData) {
    return <HomePageSkeleton />;
  }
  
  if (!platformData?.services) {
    return <div className="min-h-screen flex items-center justify-center">Failed to load essential service data.</div>;
  }
  
  const isCustomerView = ['customer_home', 'service_page', 'booking_confirmation', 'booking_tracker'].includes(view);

  const renderView = () => {
    switch(view) {
      case 'auth':
        return <AuthPage 
          language={language} 
          onLoginSuccess={handleLoginSuccess} 
          onSignupSuccess={handleSignupSuccess} 
          onExit={resetToHome} 
          initialDetails={authRedirectAction?.type === 'book' ? tempBookingDetails : null}
        />;
      
      case 'vendor_dashboard':
        if (!currentVendor) { setView('auth'); return null; }
        if (isLoading && (!platformData?.vendors || !platformData.withdrawals)) return <DashboardSkeleton />;
        return (
          <VendorDashboard 
            vendor={currentVendor}
            services={platformData.services || []}
            withdrawals={platformData.withdrawals?.filter(w => w.vendorId === currentVendor.id) || []}
            onUpdateWorkingHours={handleUpdateVendorWorkingHours}
            onUpdateRealtimeStatus={handleUpdateVendorRealtimeStatus}
            onToggleAutoAccept={handleToggleAutoAccept}
            onCompleteJobWithPhoto={handleCompleteJobWithPhoto}
            onStartJobWithPhoto={handleStartJobWithPhoto}
            onReportDelay={handleReportDelay}
            onRequestWithdrawal={handleRequestWithdrawal}
            onUpdateDetails={handleUpdateVendorDetails}
            language={language} 
            onExit={handleLogout} 
            setLanguage={handleLanguageChange}
          />
        );
      case 'customer_dashboard':
        if (!customerData) { setView('auth'); setAuthRedirectAction({ type: 'view_dashboard' }); return null; }
        if (isLoading && !platformData.users) return <DashboardSkeleton />;
        return (
           <CustomerDashboard
              customer={customerData}
              services={platformData.services || []}
              language={language}
              setLanguage={handleLanguageChange}
              onBookNewService={resetToHome}
              onRateService={handleRateService}
              onTrackBooking={handleTrackBooking}
              onBookAgain={handleBookAgain}
              onLogout={handleLogout}
              onLiveChat={handleCreateChatSession}
              onUpdateDetails={handleUpdateCustomerDetails}
           />
        );
      case 'vendor_landing':
        return (
            <VendorLandingPage 
                language={language}
                onSignUp={() => setIsSigningUp(true)}
                onLogin={() => setView('auth')}
                onExit={resetToHome}
                setLanguage={handleLanguageChange}
                currentUser={currentUser}
                currentVendor={currentVendor}
                onLogout={handleLogout}
                onAccountClick={handleAccountClick}
            />
        );
      case 'service_page':
        if (selectedService) {
           return (
            <div className={`${language === Language.BN ? 'font-hind-siluri' : 'font-inter'} bg-gray-50 text-slate-800`}>
              <Header language={language} setLanguage={handleLanguageChange} onGoHome={resetToHome} onVendorClick={() => setView('vendor_landing')} onAccountClick={handleAccountClick} currentUser={currentUser} currentVendor={currentVendor} onLogout={handleLogout}/>
              <ServiceCategoryPage service={selectedService} language={language} onGoHome={resetToHome} onBookNow={handleStartBooking} />
              <Footer language={language} />
            </div>
           );
        }
        resetToHome();
        return null;

      case 'booking_confirmation':
        if (confirmedBooking) {
           return (
            <div className={`${language === Language.BN ? 'font-hind-siluri' : 'font-inter'} bg-gray-50 text-slate-800`}>
                <Header language={language} setLanguage={handleLanguageChange} onGoHome={resetToHome} onVendorClick={() => setView('vendor_landing')} onAccountClick={handleAccountClick} currentUser={currentUser} currentVendor={currentVendor} onLogout={handleLogout}/>
                <BookingConfirmation booking={confirmedBooking} language={language} onGoHome={resetToHome} onTrackBooking={handleTrackBooking}/>
                <Footer language={language} />
            </div>
           );
        }
        resetToHome();
        return null;

      case 'booking_tracker':
        if (bookingToTrack) {
          if (!currentUser) { setView('auth'); return null; }
          return (
            <div className={`${language === Language.BN ? 'font-hind-siluri' : 'font-inter'} bg-gray-50 text-slate-800`}>
                <Header language={language} setLanguage={handleLanguageChange} onGoHome={resetToHome} onVendorClick={() => setView('vendor_landing')} onAccountClick={handleAccountClick} currentUser={currentUser} currentVendor={currentVendor} onLogout={handleLogout}/>
                <BookingTracker booking={bookingToTrack} language={language} onGoBack={() => setView('customer_dashboard')} />
                <Footer language={language} />
            </div>
          );
        }
        resetToHome();
        return null;

      case 'customer_home':
      default:
        return (
          <div className={`${language === Language.BN ? 'font-hind-siluri' : 'font-inter'} bg-gray-50 text-slate-800`}>
            <Header 
              language={language} 
              setLanguage={setLanguage} 
              onGoHome={resetToHome} 
              onVendorClick={() => setView('vendor_landing')}
              onAccountClick={handleAccountClick}
              currentUser={currentUser}
              currentVendor={currentVendor}
              onLogout={handleLogout}
            />
            <main className="pb-20 md:pb-0">
              <Hero language={language} onSearch={handleSearch} />
              <Services services={filteredServices} language={language} onSelectService={handleSelectService} />
              <PlusBanner language={language} />
              <HowItWorks language={language} />
              <WhyChooseUs language={language} />
              <Testimonials language={language} />
            </main>
            <Footer language={language} />
            <LandingBottomNav
                language={language}
                onGoHome={resetToHome}
                onScrollToServices={handleScrollToServices}
                onVendorClick={() => setView('vendor_landing')}
                onAccountClick={handleAccountClick}
                currentUser={currentUser}
            />
          </div>
        );
    }
  }

  return (
    <div className={`${language === Language.BN ? 'font-hind-siluri' : 'font-inter'} bg-slate-100 min-h-screen relative`}>
      {renderView()}

      {isCustomerView && currentUser && platformData && <Chatbot language={language} platformData={platformData as PlatformData} />}
      
      {activeChatSession && currentUser && (
        <LiveChat 
          session={activeChatSession}
          currentUser={{id: currentUser.id, type: 'customer'}}
          onSendMessage={handleSendChatMessage}
          onClose={() => setActiveChatSession(null)}
          language={language}
        />
      )}

      {serviceToBook && platformData.serviceAreas && (
        <BookingFlow
          service={serviceToBook.service}
          pkg={serviceToBook.pkg}
          serviceAreas={platformData.serviceAreas}
          customer={currentUser}
          initialDetails={tempBookingDetails}
          language={language}
          onClose={handleCloseBooking}
          onConfirm={handleConfirmBooking}
          onAuthRequired={handleAuthRequestFromBooking}
        />
      )}
      
      {isSigningUp && platformData.services && platformData.serviceAreas && (
          <VendorSignUpFlow
            services={platformData.services}
            serviceAreas={platformData.serviceAreas}
            language={language}
            onClose={() => setIsSigningUp(false)}
            onSubmit={handleVendorSignUp}
          />
      )}

      {showVendorSignupSuccess && (
        <VendorSignupSuccess 
            language={language}
            onClose={() => {
                setShowVendorSignupSuccess(false);
                setView('vendor_landing');
            }}
        />
      )}
    </div>
  );
};

export default App;