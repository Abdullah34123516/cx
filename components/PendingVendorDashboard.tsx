
import React from 'react';
import { Language, VendorApplication } from '../types';
import { Logo } from './icons/Logo';
import { DocumentCheckIcon, ClockIcon, ShieldCheckIcon } from './icons/FeatureIcons';

interface PendingVendorDashboardProps {
    application: VendorApplication;
    language: Language;
    onLogout: () => void;
    setLanguage: (lang: Language) => void;
    isApproved?: boolean;
    onGoToDashboard?: () => void;
}

const ApprovalSuccessScreen: React.FC<{ application: VendorApplication, language: Language, onGoToDashboard: () => void }> = ({ application, language, onGoToDashboard }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl text-center">
                <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-success/10 mb-6 animate-fade-in">
                    <ShieldCheckIcon className="w-12 h-12 text-success" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                    {language === 'en' ? 'Congratulations, ' : 'অভিনন্দন, '} {application.name.split(' ')[0]}!
                </h1>
                <p className="mt-4 text-lg text-slate-600 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                    {language === 'en' ? 'Your application is approved. You can now access your vendor dashboard.' : 'আপনার আবেদন অনুমোদিত হয়েছে। আপনি এখন আপনার ভেন্ডর ড্যাশবোর্ড অ্যাক্সেস করতে পারেন।'}
                </p>
                <div className="mt-8 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
                    <button onClick={onGoToDashboard} className="bg-primary text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-sky-700 transition-all duration-300 transform hover:-translate-y-0.5 text-lg">
                        {language === 'en' ? 'Go to My Dashboard' : 'আমার ড্যাশবোর্ডে যান'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const StatusStep: React.FC<{ title: string; description: string; isActive: boolean; isCompleted: boolean; icon: React.FC<React.SVGProps<SVGSVGElement>> }> = ({ title, description, isActive, isCompleted, icon: Icon }) => {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isActive || isCompleted ? 'bg-primary border-primary text-white' : 'bg-slate-100 border-slate-300 text-slate-400'}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className={`w-0.5 flex-1 ${isCompleted ? 'bg-primary' : 'bg-slate-300'}`}></div>
            </div>
            <div className="pb-8">
                <h3 className={`font-bold text-lg ${isActive || isCompleted ? 'text-slate-800' : 'text-slate-500'}`}>{title}</h3>
                <p className="text-sm text-slate-500">{description}</p>
            </div>
        </div>
    );
};


const PendingVendorDashboard: React.FC<PendingVendorDashboardProps> = ({ application, language, onLogout, setLanguage, isApproved, onGoToDashboard }) => {
    const isBn = language === Language.BN;

    if (isApproved && onGoToDashboard) {
        return <ApprovalSuccessScreen application={application} language={language} onGoToDashboard={onGoToDashboard} />;
    }

    const statusSteps = [
        {
            title: language === 'en' ? 'Application Submitted' : 'আবেদন জমা হয়েছে',
            description: language === 'en' ? 'We have received your application.' : 'আমরা আপনার আবেদন পেয়েছি।',
            icon: DocumentCheckIcon,
        },
        {
            title: language === 'en' ? 'Verification in Progress' : 'যাচাইকরণ চলছে',
            description: language === 'en' ? 'Our team is reviewing your documents and details.' : 'আমাদের দল আপনার নথি এবং বিবরণ পর্যালোচনা করছে।',
            icon: ClockIcon,
        },
        {
            title: language === 'en' ? 'Approved' : 'অনুমোদিত',
            description: language === 'en' ? 'Congratulations! Your application is approved. You will be able to login to your full dashboard shortly.' : 'অভিনন্দন! আপনার আবেদন অনুমোদিত হয়েছে। আপনি শীঘ্রই আপনার সম্পূর্ণ ড্যাশবোর্ডে লগইন করতে পারবেন।',
            icon: ShieldCheckIcon,
        },
    ];
    
    // For now, it's always "In Review" after submission
    const currentStatusIndex = 1;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Logo className="h-8 w-auto text-primary" />
                        <span className="text-2xl font-bold text-slate-800">FixBD</span>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="flex items-center bg-slate-100 rounded-full p-1 text-sm font-semibold">
                            <button onClick={() => setLanguage(Language.EN)} className={`px-3 py-1 rounded-full ${!isBn ? 'bg-slate-50 shadow' : 'text-slate-500'}`}>EN</button>
                            <button onClick={() => setLanguage(Language.BN)} className={`px-3 py-1 rounded-full ${isBn ? 'bg-slate-50 shadow' : 'text-slate-500'}`}>বাং</button>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-slate-700">{application.name}</p>
                            <button onClick={onLogout} className="text-xs text-slate-500 hover:text-danger">
                                {language === 'en' ? 'Logout' : 'লগআউট'}
                            </button>
                        </div>
                        <img src={application.avatar} alt={application.name} className="h-12 w-12 rounded-full object-cover"/>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-3xl font-bold text-slate-800">
                        {language === 'en' ? 'Welcome,' : 'স্বাগতম,'} {application.name.split(' ')[0]}!
                    </h1>
                    <p className="mt-2 text-lg text-slate-600">
                        {language === 'en' ? 'Your application is under review.' : 'আপনার আবেদন পর্যালোচনা করা হচ্ছে।'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        {language === 'en' ? 'This usually takes 3-5 business days. We will notify you via SMS once it\'s approved.' : 'এটি সাধারণত ৩-৫ কার্যদিবস সময় নেয়। অনুমোদিত হলে আমরা আপনাকে SMS এর মাধ্যমে জানাব।'}
                    </p>
                </div>

                <div className="max-w-md mx-auto mt-12">
                    {statusSteps.map((step, index) => (
                        <StatusStep
                            key={index}
                            title={step.title}
                            description={step.description}
                            isActive={index === currentStatusIndex}
                            isCompleted={index < currentStatusIndex}
                            icon={step.icon}
                        />
                    ))}
                </div>

                <div className="max-w-2xl mx-auto mt-12 text-left">
                    <h2 className="text-xl font-bold text-slate-800 text-center mb-4">{language === 'en' ? 'While you wait...' : 'অপেক্ষা করার সময়...'}</h2>
                    <div className="space-y-3">
                        <a href="#" className="p-4 bg-white rounded-lg border border-slate-200 flex justify-between items-center hover:shadow-md transition-shadow">
                            <span className="font-semibold text-primary">{language === 'en' ? 'How to get more jobs on FixBD' : 'FixBD-তে আরও কাজ কীভাবে পাবেন'}</span>
                            <span>&rarr;</span>
                        </a>
                        <a href="#" className="p-4 bg-white rounded-lg border border-slate-200 flex justify-between items-center hover:shadow-md transition-shadow">
                            <span className="font-semibold text-primary">{language === 'en' ? 'Read our community guidelines' : 'আমাদের কমিউনিটি নির্দেশিকা পড়ুন'}</span>
                            <span>&rarr;</span>
                        </a>
                        <a href="#" className="p-4 bg-white rounded-lg border border-slate-200 flex justify-between items-center hover:shadow-md transition-shadow">
                            <span className="font-semibold text-primary">{language === 'en' ? 'Frequently Asked Questions' : 'সাধারণ জিজ্ঞাস্য'}</span>
                            <span>&rarr;</span>
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PendingVendorDashboard;
