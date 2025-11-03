import React, { useState, useRef } from 'react';
import { Language, Customer, Vendor, VendorApplication } from '../types';
import { TEXTS } from '../constants';
import * as api from '../api';
import { Logo } from './icons/Logo';
import { PhoneIllustration, OtpIllustration, DetailsIllustration } from './icons/AuthIllustrations';

interface AuthPageProps {
  language: Language;
  // FIX: Updated onLoginSuccess to accept the full response object including the token.
  onLoginSuccess: (response: { user: Customer | Vendor | VendorApplication; token: string }) => void;
  // FIX: Updated onSignupSuccess to accept the full response object including the token.
  onSignupSuccess: (response: { user: Customer; token: string }) => void;
  onExit: () => void;
}

type AuthStep = 'phone' | 'otp' | 'details';

const OTPInput: React.FC<{ otp: string[]; setOtp: React.Dispatch<React.SetStateAction<string[]>> }> = ({ otp, setOtp }) => {
    // FIX: Correctly type the ref to hold an array of elements that can be null, which is standard for refs on mapped elements.
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { value } = e.target;
        if (/^[0-9]$/.test(value) || value === '') {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value !== '' && index < 3) {
                inputsRef.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    return (
        <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    // FIX: Ensure the ref callback handles both mount (getting an element) and unmount (getting null) to prevent memory leaks.
                    ref={el => { inputsRef.current[index] = el; }}
                    type="tel"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-14 h-16 text-3xl text-center font-bold bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition"
                />
            ))}
        </div>
    );
};


const AuthPage: React.FC<AuthPageProps> = ({ language, onLoginSuccess, onSignupSuccess, onExit }) => {
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userExists, setUserExists] = useState(false);
  
  const texts = TEXTS.authPage;

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || phone.length < 11) return;
    setIsLoading(true);
    const { userExists } = await api.requestOtp(phone);
    setUserExists(userExists);
    setIsLoading(false);
    setStep('otp');
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (isLoading || otpString.length < 4) return;
    setIsLoading(true);

    try {
      if (userExists) {
        const response = await api.verifyLogin(phone, otpString);
        if (response) onLoginSuccess(response);
      } else {
        setStep('details');
      }
    } catch (error) {
      console.error("OTP verification failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setAvatarFile(file);
        setIsLoading(true);
        try {
            const url = await api.uploadFileToS3(file);
            setAvatarUrl(url);
        } catch (err) {
            console.error(err);
            alert('Image upload failed');
        } finally {
            setIsLoading(false);
        }
    }
  }
  
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (isLoading || !name || !address) return;
    setIsLoading(true);

    try {
      const response = await api.verifySignupAndCreateUser({ phone, name, address, otp: otpString, avatar: avatarUrl });
      if (response) onSignupSuccess(response);
    } catch (error) {
        console.error("Signup failed", error);
    } finally {
        setIsLoading(false);
    }
  }

  const renderContent = () => {
    switch(step) {
      case 'phone':
        return {
          illustration: <PhoneIllustration className="w-48 h-48" />,
          title: texts.title[language],
          subtitle: texts.subtitle[language],
          form: (
            <form onSubmit={handlePhoneSubmit}>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={texts.phonePlaceholder[language]} className="w-full text-center text-lg p-3 bg-slate-100 border-2 border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition" required />
              <button type="submit" disabled={isLoading || phone.length < 11} className="mt-4 w-full bg-primary text-slate-100 font-bold py-3 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-slate-300">{isLoading ? '...' : texts.continue[language]}</button>
            </form>
          )
        };
      case 'otp':
        return {
          illustration: <OtpIllustration className="w-48 h-48" />,
          title: texts.otpTitle[language],
          subtitle: <>{texts.otpSubtitle[language]} <strong className="text-slate-800">{phone}</strong></>,
          form: (
            <form onSubmit={handleOtpSubmit}>
              <OTPInput otp={otp} setOtp={setOtp} />
              <button type="submit" disabled={isLoading || otp.join('').length < 4} className="mt-6 w-full bg-primary text-slate-100 font-bold py-3 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-slate-300">{isLoading ? '...' : texts.verify[language]}</button>
            </form>
          )
        };
      case 'details':
        return {
          illustration: <DetailsIllustration className="w-48 h-48" />,
          title: texts.signupTitle[language],
          subtitle: texts.signupSubtitle[language],
          form: (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="flex justify-center">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                      <img src={avatarUrl || `https://i.pravatar.cc/150?u=${phone}`} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-slate-200 hover:border-primary transition" />
                      <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </label>
              </div>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={texts.namePlaceholder[language]} className="w-full p-3 bg-slate-100 border-2 border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition" required />
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={texts.addressPlaceholder[language]} className="w-full p-3 bg-slate-100 border-2 border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition" required />
              <button type="submit" disabled={isLoading} className="w-full bg-primary text-slate-100 font-bold py-3 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-slate-300">{isLoading ? '...' : texts.createAccount[language]}</button>
            </form>
          )
        };
    }
  };

  const { illustration, title, subtitle, form } = renderContent();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-6 left-6">
        <button onClick={onExit} className="flex items-center gap-2 font-semibold text-slate-600 hover:text-primary transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          Home
        </button>
      </div>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-in-up">
            <div className="flex justify-center mb-6">
                {illustration}
            </div>
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                <p className="text-slate-500 mt-2">{subtitle}</p>
            </div>
            {form}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;