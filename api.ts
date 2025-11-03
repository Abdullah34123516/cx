import { PlatformData, ServiceDetail, Booking, BookingStatus, Vendor, Customer, VendorApplication, WorkingHours, TimeSlot, ServicePackage, ServiceArea, LocalizedString, VendorRealtimeStatus, Withdrawal, WithdrawalStatus, Moderator, ChatSession, ChatMessage, ModeratorActivityLog } from './types';
import { compressImage, blobToBase64 } from './utils';

const BASE_URL = `http://${window.location.hostname}:5001/api`; // Your backend server URL

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
    authToken = token;
};

const apiRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const isGet = !options.method || options.method.toUpperCase() === 'GET';

        if (isGet) {
            headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
            headers['Pragma'] = 'no-cache';
            headers['Expires'] = '0';
        }
        
        const finalOptions: RequestInit = {
            ...options,
            headers,
        };

        if (isGet) {
            finalOptions.cache = 'no-store';
        }

        const response = await fetch(url, finalOptions);

        if (!response.ok) {
            const errorText = await response.text();
            try {
                // It might be a JSON error, so try to parse it.
                const errorData = JSON.parse(errorText);
                throw new Error(errorData.message || 'An API error occurred');
            } catch (e) {
                // If it's not JSON, it's likely a raw text/HTML error from the server.
                throw new Error(errorText || 'An API error occurred');
            }
        }
        if (response.status === 204) { // Handle No Content response
            return {} as T;
        }
        return response.json();
    } catch (error) {
        console.error('API Request Failed:', url, error);
        throw error;
    }
};


// --- S3 Upload Functions ---
export const uploadFileToS3 = async (file: File, auth?: { phone: string; otp: string }): Promise<string> => {
    const isImage = file.type.startsWith('image/');
    const fileToUpload = isImage ? await compressImage(file) : file;
    const contentType = isImage ? 'image/jpeg' : file.type;

    const base64Data = await blobToBase64(fileToUpload as Blob);

    const body: {
        file: string;
        contentType: string;
        fileName: string;
        phone?: string;
        otp?: string;
    } = {
        file: base64Data,
        contentType: contentType,
        fileName: file.name,
    };
    
    if (auth) {
        body.phone = auth.phone;
        body.otp = auth.otp;
    }

    const { imageUrl } = await apiRequest<{ imageUrl: string }>(`${BASE_URL}/uploads`, {
        method: 'POST',
        body: JSON.stringify(body),
    });
    
    if (!imageUrl) {
        throw new Error('Failed to upload file');
    }

    return imageUrl;
};


// --- API Functions ---

export const fetchLandingPageData = async (): Promise<{ services: ServiceDetail[], serviceAreas: ServiceArea[] }> => {
    return apiRequest<{ services: ServiceDetail[], serviceAreas: ServiceArea[] }>(`${BASE_URL}/platform/landing-data`);
};

export const fetchPlatformData = async (): Promise<PlatformData> => {
    return apiRequest<PlatformData>(`${BASE_URL}/platform/data`);
};

export const fetchBookingById = async (bookingId: string): Promise<Booking | null> => {
    return apiRequest<Booking | null>(`${BASE_URL}/bookings/${bookingId}`);
};

export const searchServices = async (query: string, services: ServiceDetail[]): Promise<ServiceDetail[]> => {
    // This is better handled on the frontend for simple filtering
    if (!query) return services;
    const lowerCaseQuery = query.toLowerCase();
    return services.filter(service => 
        service.name.en.toLowerCase().includes(lowerCaseQuery) ||
        service.name.bn.toLowerCase().includes(lowerCaseQuery)
    );
};

export const checkAvailability = async (serviceId: string, areaId: string, date: Date, timeSlot: TimeSlot): Promise<{ available: boolean }> => {
    return apiRequest<{ available: boolean }>(`${BASE_URL}/bookings/check-availability`, {
        method: 'POST',
        body: JSON.stringify({ serviceId, areaId, date, timeSlot }),
    });
};

export const submitBooking = async (
    service: ServiceDetail,
    pkg: ServicePackage,
    details: Omit<Booking, 'id' | 'service' | 'provider' | 'status' | 'grossAmount' | 'commission' | 'finalPrice' | 'packageName' | 'customerId' | 'assignedBySystem'>,
    customerId: string
): Promise<Booking> => {
    return apiRequest<Booking>(`${BASE_URL}/bookings`, {
        method: 'POST',
        body: JSON.stringify({
            serviceId: service.id, // The string ID like 'ac'
            packageId: pkg.id,
            details,
            customerId,
        }),
    });
};


export const submitRating = async (bookingId: string, rating: number, review: string): Promise<void> => {
    return apiRequest<void>(`${BASE_URL}/bookings/${bookingId}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating, review }),
    });
};

export const submitVendorApplication = async (applicationData: Omit<VendorApplication, 'id' | 'status'> & { otp: string }): Promise<void> => {
    return apiRequest<void>(`${BASE_URL}/platform/vendor-applications`, {
        method: 'POST',
        body: JSON.stringify(applicationData),
    });
};

// --- Auth API Functions ---
export const requestOtp = async (phone: string): Promise<{ userExists: boolean }> => {
    return apiRequest<{ userExists: boolean }>(`${BASE_URL}/auth/request-otp`, {
        method: 'POST',
        body: JSON.stringify({ phone }),
    });
};

export const checkVendorDuplicates = async (phone: string, email: string): Promise<{ isDuplicate: boolean, field?: 'phone' | 'email', message: string }> => {
    return apiRequest<{ isDuplicate: boolean, field?: 'phone' | 'email', message: string }>(`${BASE_URL}/auth/check-vendor-duplicates`, {
        method: 'POST',
        body: JSON.stringify({ phone, email }),
    });
};

type LoginResponse = { user: Customer | Vendor; token: string };
export const verifyLogin = async (phone: string, otp: string): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>(`${BASE_URL}/auth/verify-login`, {
        method: 'POST',
        body: JSON.stringify({ phone, otp }),
    });
};

type SignupResponse = { user: Customer, token: string };
export const verifySignupAndCreateUser = async (details: { phone: string; name: string; address: string; otp: string; avatar?: string; }): Promise<SignupResponse> => {
     return apiRequest<SignupResponse>(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        body: JSON.stringify(details),
    });
};

type ModeratorLoginResponse = { moderator: Moderator; token: string };
export const loginModerator = async (email: string, password: string): Promise<ModeratorLoginResponse> => {
    return apiRequest<ModeratorLoginResponse>(`${BASE_URL}/auth/moderator/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

// --- Implemented API Functions ---

export const updateVendorWorkingHours = async (workingHours: WorkingHours): Promise<Vendor> => {
    return apiRequest<Vendor>(`${BASE_URL}/vendors/working-hours`, {
        method: 'PUT',
        body: JSON.stringify({ workingHours }),
    });
};
export const updateVendorRealtimeStatus = async (status: VendorRealtimeStatus): Promise<void> => {
    return apiRequest<void>(`${BASE_URL}/vendors/realtime-status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
};
export const toggleVendorAutoAccept = async (): Promise<void> => {
    return apiRequest<void>(`${BASE_URL}/vendors/auto-accept`, {
        method: 'PUT',
    });
};
export const approveVendorApplication = async (applicationId: string): Promise<void> => {
    return apiRequest<void>(`${BASE_URL}/platform/vendor-applications/${applicationId}/approve`, {
        method: 'PUT',
    });
};
export const rejectVendorApplication = async (applicationId: string): Promise<void> => {
    return apiRequest<void>(`${BASE_URL}/platform/vendor-applications/${applicationId}/reject`, {
        method: 'PUT',
    });
};
export const completeJob = async (bookingId: string, afterPhotoUrls: string[]): Promise<void> => {
    return apiRequest<void>(`${BASE_URL}/bookings/${bookingId}/complete`, {
        method: 'PUT',
        body: JSON.stringify({ afterPhotoUrls }),
    });
};
export const startJob = async (bookingId: string, beforePhotoUrls: string[]): Promise<void> => {
    return apiRequest<void>(`${BASE_URL}/bookings/${bookingId}/start`, {
        method: 'PUT',
        body: JSON.stringify({ beforePhotoUrls }),
    });
};
export const reportDelay = async (bookingId: string, reason: string, minutes: number): Promise<void> => {
    return apiRequest<void>(`${BASE_URL}/bookings/${bookingId}/delay`, {
        method: 'POST',
        body: JSON.stringify({ reason, minutes }),
    });
};
export const toggleUserStatus = async (userId: string): Promise<void> => {
    return apiRequest<void>(`${BASE_URL}/users/${userId}/status`, {
        method: 'PUT',
    });
};
export const toggleVendorStatus = async (vendorId: string): Promise<void> => {
    return apiRequest<void>(`${BASE_URL}/vendors/${vendorId}/status`, {
        method: 'PUT',
    });
};
export const updateVendorCoverage = async (vendorId: string, areaIds: string[]): Promise<void> => {
    return apiRequest<void>(`${BASE_URL}/vendors/${vendorId}/coverage`, {
        method: 'PUT',
        body: JSON.stringify({ areaIds }),
    });
};
export const cancelBookingByAdmin = async (bookingId: string): Promise<void> => {
    return apiRequest<void>(`${BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
    });
};
export const addService = async (serviceData: any): Promise<ServiceDetail> => {
    return apiRequest<ServiceDetail>(`${BASE_URL}/services`, {
        method: 'POST',
        body: JSON.stringify(serviceData),
    });
};
export const updateService = async (serviceId: string, serviceData: any): Promise<ServiceDetail> => {
     return apiRequest<ServiceDetail>(`${BASE_URL}/services/${serviceId}`, {
        method: 'PUT',
        body: JSON.stringify(serviceData),
    });
};
export const deleteService = async (serviceId: string): Promise<void> => {
    return apiRequest<void>(`${BASE_URL}/services/${serviceId}`, {
        method: 'DELETE',
    });
};
export const addPackage = async (serviceId: string, packageData: any): Promise<ServicePackage> => {
    return apiRequest<ServicePackage>(`${BASE_URL}/services/${serviceId}/packages`, {
        method: 'POST',
        body: JSON.stringify(packageData),
    });
};
export const updatePackage = async (serviceId: string, packageId: string, packageData: any): Promise<ServicePackage> => {
    return apiRequest<ServicePackage>(`${BASE_URL}/services/${serviceId}/packages/${packageId}`, {
        method: 'PUT',
        body: JSON.stringify(packageData),
    });
};
export const deletePackage = async (serviceId: string, packageId: string): Promise<void> => {
    return apiRequest<void>(`${BASE_URL}/services/${serviceId}/packages/${packageId}`, {
        method: 'DELETE',
    });
};
export const addServiceArea = async (areaData: any): Promise<ServiceArea> => {
    return apiRequest<ServiceArea>(`${BASE_URL}/service-areas`, {
        method: 'POST',
        body: JSON.stringify(areaData),
    });
};
export const updateServiceArea = async (areaId: string, areaData: any): Promise<ServiceArea> => {
    return apiRequest<ServiceArea>(`${BASE_URL}/service-areas/${areaId}`, {
        method: 'PUT',
        body: JSON.stringify(areaData),
    });
};
export const toggleServiceAreaStatus = async (areaId: string): Promise<ServiceArea> => {
    return apiRequest<ServiceArea>(`${BASE_URL}/service-areas/${areaId}/toggle-status`, {
        method: 'PUT',
    });
};
export const requestWithdrawal = async (vendorId: string, amount: number, bKashNumber: string): Promise<Withdrawal> => {
    return apiRequest<Withdrawal>(`${BASE_URL}/withdrawals`, {
        method: 'POST',
        body: JSON.stringify({ vendorId, amount, bKashNumber }),
    });
};
export const approveWithdrawal = async (withdrawalId: string): Promise<void> => {
     return apiRequest<void>(`${BASE_URL}/withdrawals/${withdrawalId}/approve`, {
        method: 'PUT',
    });
};
export const assignVendorToBooking = async (bookingId: string, vendorId: string, moderatorId: string): Promise<void> => {
    return apiRequest<void>(`${BASE_URL}/bookings/${bookingId}/assign`, {
        method: 'PUT',
        body: JSON.stringify({ vendorId, moderatorId }),
    });
};
export const createChatSession = async (customerId: string, customerName: string): Promise<ChatSession> => {
    return apiRequest<ChatSession>(`${BASE_URL}/chats`, {
        method: 'POST',
        body: JSON.stringify({ customerId, customerName }),
    });
};
export const sendChatMessage = async (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> => {
    return apiRequest<ChatMessage>(`${BASE_URL}/chats/${sessionId}/messages`, {
        method: 'POST',
        body: JSON.stringify(message),
    });
};
export const assignModeratorToChat = async (sessionId: string, moderatorId: string): Promise<void> => {
    return apiRequest<void>(`${BASE_URL}/chats/${sessionId}/assign`, {
        method: 'PUT',
        body: JSON.stringify({ moderatorId }),
    });
};
export const addModerator = async (moderatorData: Omit<Moderator, 'id'>): Promise<Moderator> => {
    return apiRequest<Moderator>(`${BASE_URL}/moderators`, {
        method: 'POST',
        body: JSON.stringify(moderatorData),
    });
};
export const removeModerator = async (moderatorId: string): Promise<void> => {
    return apiRequest<void>(`${BASE_URL}/moderators/${moderatorId}`, {
        method: 'DELETE',
    });
};
export const updateVendorDetails = async (vendorId: string, data: Partial<Vendor>): Promise<Vendor> => {
    return apiRequest<Vendor>(`${BASE_URL}/vendors/${vendorId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};
export const updateVendorDetailsSelf = async (data: Partial<Vendor>): Promise<Vendor> => {
    return apiRequest<Vendor>(`${BASE_URL}/vendors/profile`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};
export const updateModeratorDetails = async (moderatorId: string, data: Partial<Moderator>): Promise<Moderator> => {
    return apiRequest<Moderator>(`${BASE_URL}/moderators/${moderatorId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};
export const updateCustomerDetails = async (customerId: string, data: { name: string; address: string; avatar?: string; }): Promise<Customer> => {
    return apiRequest<Customer>(`${BASE_URL}/users/${customerId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};