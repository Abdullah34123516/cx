import React from 'react';
import { Language } from '../types';
import { ClockIcon } from './icons/FeatureIcons';
import { BriefcaseIcon, BanknotesIcon } from './icons/NavIcons';
import { PhoneIcon, CalendarIcon } from './icons/FormIcons';

const PowerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
  </svg>
);


interface VendorSignupSuccessProps {
    language: Language;
    onClose: () => void;
}

const SuccessIcon: React.FC = () => (
    <svg className="h-16 w-16 text-slate-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const GuideStep: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-slate-800">{title}</h4>
            <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>
    </div>
);


const VendorSignupSuccess: React.FC<VendorSignupSuccessProps> = ({ language, onClose }) => {
    
    const TEXTS = {
        title: { en: "Application Submitted!", bn: "আবেদন জমা হয়েছে!" },
        subtitle: { en: "Welcome to FixBD! Here's what happens next and how to get started.", bn: "FixBD-তে স্বাগতম! এরপর কী হবে এবং কীভাবে শুরু করবেন তা এখানে দেখুন।" },
        nextStepsTitle: { en: "What's Next?", bn: "এরপর কী?" },
        step1Title: { en: "1. We're Reviewing Your Application", bn: "১. আমরা আপনার আবেদন পর্যালোচনা করছি" },
        step1Desc: { en: "Our team is carefully reviewing your documents and experience. This usually takes 3-5 business days.", bn: "আমাদের দল আপনার নথি এবং অভিজ্ঞতা সাবধানে পর্যালোচনা করছে। এটি সাধারণত ৩-৫ কার্যদিবস সময় নেয়।" },
        step2Title: { en: "2. Check Your Status", bn: "২. আপনার স্ট্যাটাস চেক করুন" },
        step2Desc: { en: "You can check if you're approved by logging in with your phone number from the 'For Professionals' page. If it's pending, you'll see a message.", bn: "'পেশাদারদের জন্য' পৃষ্ঠা থেকে আপনার ফোন নম্বর দিয়ে লগইন করে আপনি অনুমোদিত হয়েছেন কিনা তা পরীক্ষা করতে পারেন। যদি এটি মুলতুবি থাকে, আপনি একটি বার্তা দেখতে পাবেন।" },
        guideTitle: { en: "Once You're Approved: A Quick Guide", bn: "অনুমোদিত হওয়ার পর: একটি দ্রুত গাইড" },
        guide1Title: { en: "Go Online to Get Jobs", bn: "কাজ পেতে অনলাইন হোন" },
        guide1Desc: { en: "From your dashboard, set your status to 'Available'. Only available vendors receive new job alerts.", bn: "আপনার ড্যাশবোর্ড থেকে, আপনার স্ট্যাটাস 'উপলব্ধ' (Available) সেট করুন। শুধুমাত্র উপলব্ধ ভেন্ডররা নতুন কাজের সতর্কতা পান।" },
        guide2Title: { en: "Accept New Jobs", bn: "নতুন কাজ গ্রহণ করুন" },
        guide2Desc: { en: "New job requests will appear on your dashboard. Review the details and accept the ones you want.", bn: "নতুন কাজের অনুরোধ আপনার ড্যাশবোর্ডে প্রদর্শিত হবে। বিবরণ পর্যালোচনা করুন এবং আপনার পছন্দের কাজগুলো গ্রহণ করুন।" },
        guide3Title: { en: "Manage Your Schedule", bn: "আপনার সময়সূচী পরিচালনা করুন" },
        guide3Desc: { en: "Update your 'Working Hours' in your profile to ensure you only get jobs that fit your schedule.", bn: "আপনার প্রোফাইলে 'কাজের সময়' (Working Hours) আপডেট করুন যাতে আপনি শুধুমাত্র আপনার সময়সূচীর সাথে মানানসই কাজ পান।" },
        guide4Title: { en: "Withdraw Your Earnings", bn: "আপনার আয় উত্তোলন করুন" },
        guide4Desc: { en: "Easily request a withdrawal of your earnings to your bKash account directly from the dashboard.", bn: "সরাসরি ড্যাশবোর্ড থেকে আপনার বিকাশ অ্যাকাউন্টে আপনার আয় উত্তোলনের জন্য সহজেই অনুরোধ করুন।" },
        buttonText: { en: "Got It, Thanks!", bn: "বুঝেছি, ধন্যবাদ!" },
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-slide-in-up flex flex-col max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
                <div className="p-8 text-center bg-slate-50 rounded-t-2xl">
                    <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-primary mb-6">
                        <SuccessIcon />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900">{TEXTS.title[language]}</h1>
                    <p className="mt-2 text-lg text-slate-600 max-w-lg mx-auto">{TEXTS.subtitle[language]}</p>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-8">
                    <section>
                        <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">{TEXTS.nextStepsTitle[language]}</h3>
                        <div className="space-y-4">
                            <GuideStep icon={<ClockIcon className="w-6 h-6" />} title={TEXTS.step1Title[language]} description={TEXTS.step1Desc[language]} />
                            <GuideStep icon={<PhoneIcon className="w-6 h-6" />} title={TEXTS.step2Title[language]} description={TEXTS.step2Desc[language]} />
                        </div>
                    </section>
                    <section>
                         <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">{TEXTS.guideTitle[language]}</h3>
                         <div className="grid md:grid-cols-2 gap-4">
                            <GuideStep icon={<PowerIcon className="w-6 h-6" />} title={TEXTS.guide1Title[language]} description={TEXTS.guide1Desc[language]} />
                            <GuideStep icon={<BriefcaseIcon className="w-6 h-6" />} title={TEXTS.guide2Title[language]} description={TEXTS.guide2Desc[language]} />
                            <GuideStep icon={<CalendarIcon className="w-6 h-6" />} title={TEXTS.guide3Title[language]} description={TEXTS.guide3Desc[language]} />
                            <GuideStep icon={<BanknotesIcon className="w-6 h-6" />} title={TEXTS.guide4Title[language]} description={TEXTS.guide4Desc[language]} />
                         </div>
                    </section>
                </div>

                <div className="p-6 bg-slate-100 rounded-b-2xl flex justify-center flex-shrink-0">
                    <button onClick={onClose} className="w-full sm:w-auto bg-primary hover:bg-sky-700 text-slate-100 font-bold py-3 px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-lg">
                        {TEXTS.buttonText[language]}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorSignupSuccess;