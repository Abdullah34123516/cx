import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language, ServiceDetail, VendorApplication, ServiceArea } from '../types';
import { TEXTS } from '../constants';
import * as api from '../api';
import { PhoneIllustration, OtpIllustration, DetailsIllustration } from './icons/AuthIllustrations';

interface VendorSignUpFlowProps {
  services: ServiceDetail[];
  serviceAreas: ServiceArea[];
  language: Language;
  onClose: () => void;
  onSubmit: (data: Omit<VendorApplication, 'id' | 'status'> & { otp: string }) => void;
}

const OTPInput: React.FC<{ otp: string[]; setOtp: React.Dispatch<React.SetStateAction<string[]>> }> = ({ otp, setOtp }) => {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { value } = e.target;
        if (/^[0-9]$/.test(value) || value === '') {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value !== '' && index < 3 && inputsRef.current[index + 1]) {
                inputsRef.current[index + 1]!.focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0 && inputsRef.current[index - 1]) {
            inputsRef.current[index - 1]!.focus();
        }
    };

    return (
        <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    // FIX: Changed to a block statement to ensure the ref callback returns void and fix the TypeScript error.
                    ref={el => { inputsRef.current[index] = el }}
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

const FileUpload: React.FC<{ label: string; helperText: string; fileType: 'image' | 'document'; onFileSelect: (file: File) => void; previewUrl?: string; isUploading: boolean; }> = ({ label, helperText, fileType, onFileSelect, previewUrl, isUploading }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div>
            <label className="font-semibold text-slate-700">{label}</label>
            <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-slate-300 px-6 py-10 hover:border-primary transition-colors">
                <div className="text-center">
                    {previewUrl && fileType === 'image' && <img src={previewUrl} alt="Preview" className="mx-auto h-24 w-24 object-cover rounded-full border mb-4" />}
                    {previewUrl && fileType === 'document' && <div className="mx-auto h-24 w-24 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>}
                    <div className="mt-4 flex text-sm leading-6 text-slate-600">
                        <label htmlFor={`file-upload-${label}`} className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-sky-700">
                            <span>{isUploading ? 'Uploading...' : 'Upload a file'}</span>
                            <input id={`file-upload-${label}`} name={`file-upload-${label}`} type="file" className="sr-only" onChange={handleFileChange} disabled={isUploading} accept={fileType === 'image' ? 'image/*' : '.pdf,.doc,.docx'} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-slate-500">{helperText}</p>
                </div>
            </div>
        </div>
    );
};

const ChipSelector: React.FC<{ title: string; items: { id: string; name: string }[]; selected: string[]; onToggle: (id: string) => void; }> = ({ title, items, selected, onToggle }) => (
    <div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="flex flex-wrap gap-2">
            {items.map(item => (
                <button key={item.id} type="button" onClick={() => onToggle(item.id)} className={`px-3 py-1.5 text-sm font-semibold rounded-full border-2 transition-colors ${selected.includes(item.id) ? 'bg-primary border-primary text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'}`}>
                    {item.name}
                </button>
            ))}
        </div>
    </div>
);


const VendorSignUpFlow: React.FC<VendorSignUpFlowProps> = ({ services, serviceAreas, language, onClose, onSubmit }) => {
    const [step, setStep] = useState<'credentials' | 'otp' | 'form'>('credentials');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);

    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', address: '', avatar: '',
        skills: [] as string[], coverageArea: [] as string[], cvUrl: '',
        voterIdPhotoUrl: '', voterIdNumber: '', experienceYears: 0,
        hasSmartphone: true, hasBikeOrCycle: false,
    });
    
    const [previews, setPreviews] = useState({ avatar: '', voterIdPhotoUrl: '' });
    const [uploadingField, setUploadingField] = useState<'avatar' | 'voterIdPhotoUrl' | 'cvUrl' | null>(null);

    const texts = TEXTS.vendorSignUp;
    const authTexts = TEXTS.authPage;

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || phone.length < 11) return;
        setIsLoading(true);
        setError('');
        try {
            const { isDuplicate, field, message } = await api.checkVendorDuplicates(phone, email);
            if (isDuplicate) {
                setError(message);
            } else {
                await api.requestOtp(phone); // Fire and forget OTP request
                setStep('otp');
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleOtpVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.join('') === '1234') { // Mock OTP verification
            setFormData(prev => ({ ...prev, phone, email }));
            setStep('form');
            setError('');
        } else {
            setError('Invalid OTP. Please try again.');
        }
    };

    const handleFileChange = async (field: 'avatar' | 'voterIdPhotoUrl' | 'cvUrl', file: File) => {
        if (!phone) {
            alert("An unexpected error occurred. Please restart the signup process.");
            return;
        }
        setUploadingField(field);
        try {
            const fileUrl = await api.uploadFileToS3(file, { phone, otp: 'vendor-signup' });
            setFormData(prev => ({ ...prev, [field]: fileUrl }));
            if (field === 'avatar' || field === 'voterIdPhotoUrl') {
                const previewUrl = URL.createObjectURL(file);
                setPreviews(prev => ({ ...prev, [field]: previewUrl }));
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("File upload failed. Please try again.");
        } finally {
            setUploadingField(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSubmit({
                ...formData,
                otp: otp.join(''),
            });
        } catch (error) {
            // Error is handled in the App component, but we should stop loading
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = formData.name && formData.voterIdNumber && formData.experienceYears > 0 && formData.address && formData.skills.length > 0 && formData.coverageArea.length > 0 && formData.cvUrl && formData.voterIdPhotoUrl && formData.avatar;
    
    const renderContent = () => {
        switch (step) {
            case 'credentials':
                return (
                    <div className="p-8 text-center">
                        <PhoneIllustration className="w-40 h-40 mx-auto text-primary" />
                        <h3 className="text-xl font-bold text-slate-900 mt-4">{texts.title[language]}</h3>
                        <p className="text-slate-500 mt-2 mb-6">{language === 'en' ? 'Enter your phone and email to begin.' : 'שুরু করতে আপনার فون اور ای میل درج کریں'}</p>
                        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={authTexts.phonePlaceholder[language]} className="w-full text-center text-lg p-3 bg-slate-100 border-2 border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition" required />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={texts.gmailAddress[language]} className="w-full text-center text-lg p-3 bg-slate-100 border-2 border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition" required />
                            {error && <p className="text-danger text-sm mt-2">{error}</p>}
                            <button type="submit" disabled={isLoading || phone.length < 11} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-slate-300">{isLoading ? '...' : authTexts.continue[language]}</button>
                        </form>
                    </div>
                );
            case 'otp':
                return (
                    <div className="p-8 text-center">
                        <OtpIllustration className="w-40 h-40 mx-auto" />
                        <h3 className="text-xl font-bold text-slate-900 mt-4">{authTexts.otpTitle[language]}</h3>
                        <p className="text-slate-500 mt-2 mb-6">{authTexts.otpSubtitle[language]} <strong className="text-slate-800">{phone}</strong></p>
                        <form onSubmit={handleOtpVerify}>
                            <OTPInput otp={otp} setOtp={setOtp} />
                            {error && <p className="text-danger text-sm mt-2">{error}</p>}
                            <button type="submit" disabled={isLoading || otp.join('').length < 4} className="mt-6 w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-slate-300">{isLoading ? '...' : authTexts.verify[language]}</button>
                        </form>
                    </div>
                );
            case 'form':
                return (
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
                            {/* Personal Info */}
                            <section>
                                <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">{texts.step1[language]}</h2>
                                <div className="space-y-4">
                                    <FileUpload label={texts.uploadAvatar[language]} helperText="PNG, JPG up to 5MB" fileType="image" onFileSelect={(file) => handleFileChange('avatar', file)} previewUrl={previews.avatar} isUploading={uploadingField === 'avatar'} />
                                    <input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} placeholder={texts.fullName[language]} className="w-full p-3 bg-slate-50 border rounded-md" required />
                                    <input value={formData.address} onChange={e => setFormData(p => ({...p, address: e.target.value}))} placeholder={texts.address[language]} className="w-full p-3 bg-slate-50 border rounded-md" required />
                                    <input value={formData.voterIdNumber} onChange={e => setFormData(p => ({...p, voterIdNumber: e.target.value}))} placeholder={texts.voterIdNumber[language]} className="w-full p-3 bg-slate-50 border rounded-md" required />
                                    <input type="number" value={formData.experienceYears || ''} onChange={e => setFormData(p => ({...p, experienceYears: parseInt(e.target.value) || 0}))} placeholder={texts.experienceYears[language]} className="w-full p-3 bg-slate-50 border rounded-md" required />
                                </div>
                            </section>

                            {/* Skills & Area */}
                            <section>
                                <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">{texts.step2[language]}</h2>
                                <div className="space-y-4">
                                    <ChipSelector title={texts.selectSkills[language]} items={services.map(s => ({ id: s.id, name: s.name[language] }))} selected={formData.skills} onToggle={id => setFormData(p => ({...p, skills: p.skills.includes(id) ? p.skills.filter(s => s !== id) : [...p.skills, id]}))} />
                                    <ChipSelector title={texts.selectCoverage[language]} items={serviceAreas.map(a => ({ id: a.id, name: a.name[language] }))} selected={formData.coverageArea} onToggle={id => setFormData(p => ({...p, coverageArea: p.coverageArea.includes(id) ? p.coverageArea.filter(s => s !== id) : [...p.coverageArea, id]}))} />
                                </div>
                            </section>
                            
                            {/* Documents */}
                             <section>
                                <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Documents</h2>
                                <div className="space-y-4">
                                    <FileUpload label={texts.uploadCV[language]} helperText={texts.cvHelper[language]} fileType="document" onFileSelect={(file) => handleFileChange('cvUrl', file)} previewUrl={formData.cvUrl} isUploading={uploadingField === 'cvUrl'} />
                                    <FileUpload label={texts.uploadNID[language]} helperText={texts.nidHelper[language]} fileType="image" onFileSelect={(file) => handleFileChange('voterIdPhotoUrl', file)} previewUrl={previews.voterIdPhotoUrl} isUploading={uploadingField === 'voterIdPhotoUrl'} />
                                </div>
                            </section>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end">
                            <button type="submit" disabled={!isFormValid || isLoading || !!uploadingField} className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
                                {isLoading ? 'Submitting...' : texts.submitApplication[language]}
                            </button>
                        </div>
                    </form>
                );
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">{texts.title[language]}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default VendorSignUpFlow;