import React from 'react';

export enum Language {
  EN = 'en',
  BN = 'bn',
}

export enum TimeSlot {
  Morning = 'morning',
  Afternoon = 'afternoon',
  Evening = 'evening',
}

export enum BookingStatus {
  Pending = 'Pending',
  Accepted = 'Accepted',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export enum VendorRealtimeStatus {
  Available = 'Available',
  Busy = 'Busy',
  Offline = 'Offline',
}

export enum WithdrawalStatus {
  Pending = 'Pending',
  Completed = 'Completed',
}

export interface LocalizedString {
  en: string;
  bn: string;
}

export interface ServicePackage {
  id: string;
  name: LocalizedString;
  price_range: LocalizedString;
  base_price: number;
  duration: LocalizedString;
}

export interface ServiceDetail {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  heroImage: string;
  iconName: string;
  packages: ServicePackage[];
  availableAreaIds?: string[];
}

export interface Provider {
  // FIX: Add 'id' to Provider interface
  id: string;
  name: string;
  rating: number;
  avatar: string;
  verificationStatus: 'Verified' | 'Unverified';
}

export interface DayWorkingHours {
    active: boolean;
    start: string; // e.g., "09:00"
    end: string;   // e.g., "17:00"
}

export interface WorkingHours {
    [day: string]: DayWorkingHours;
}

export interface Earnings {
  total: number;
  pending: number;
  lastMonth: number;
}

export interface VendorSubscription {
    planName: 'Basic' | 'Pro';
    commissionRate: number; // e.g., 0.15 for 15%
    monthlyFee: number;
}

export interface Vendor extends Provider {
  id: string;
  phone: string;
  email: string;
  address: string;
  skills: string[];
  coverageArea: string[]; // Array of ServiceArea IDs
  workingHours: WorkingHours;
  serviceHistory: Booking[];
  earnings: Earnings;
  applicationStatus: 'Approved' | 'Pending';
  subscription: VendorSubscription;
  status: 'Active' | 'Suspended';
  voterIdPhotoUrl: string;
  realtimeStatus: VendorRealtimeStatus;
  bKashNumber?: string;
  voterIdNumber: string;
  experienceYears: number;
  hasSmartphone: boolean;
  hasBikeOrCycle: boolean;
  autoAcceptJobs?: boolean;
}

export interface Booking {
  id: string;
  service: ServiceDetail;
  packageName: string;
  date: Date;
  timeSlot: TimeSlot;
  address: string;
  phone: string;
  provider?: Provider;
  status: BookingStatus;
  rating?: number;
  review?: string;
  beforePhotoUrls?: string[];
  afterPhotoUrls?: string[];
  grossAmount: number;
  commission: number;
  finalPrice: number;
  customerId: string;
  serviceArea: string;
  jobStartTime?: number;
  delayReason?: string;
  estimatedDelayMinutes?: number;
  assignedBySystem?: boolean;
  // FIX: Add createdAt from backend timestamps
  createdAt?: Date;
}

export interface CustomerSubscription {
    planName: 'FixBD Plus Basic' | 'FixBD Plus Premium';
    status: 'Active' | 'Cancelled';
    nextBillingDate: Date;
    discountRate: number; // e.g., 0.1 for 10%
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    address: string;
    avatar: string;
    bookingHistory: Booking[];
    subscription?: CustomerSubscription;
    status: 'Active' | 'Suspended';
}

export interface Notification {
    id: string;
    message: LocalizedString;
    timestamp: Date;
    isRead: boolean;
}

export interface VendorApplication {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    avatar: string;
    skills: string[];
    coverageArea: string[]; // Array of ServiceArea IDs
    status: 'Pending';
    cvUrl: string;
    voterIdPhotoUrl: string;
    voterIdNumber: string;
    experienceYears: number;
    hasSmartphone: boolean;
    hasBikeOrCycle: boolean;
}

export interface ServiceArea {
    id: string;
    name: LocalizedString;
    status: 'Active' | 'Inactive';
}

export interface Withdrawal {
  id: string;
  vendorId: string;
  amount: number;
  method: 'bKash';
  accountNumber: string;
  status: WithdrawalStatus;
  timestamp: Date;
}

export interface Moderator {
    id: string;
    name: string;
    email: string;
    password?: string;
    phone: string;
    address: string;
    voterIdNumber: string;
    voterIdPhotoUrl: string;
}

export interface ChatMessage {
    id: string;
    sender: 'customer' | 'moderator';
    senderId: string;
    text: string;
    timestamp: number;
}

export interface ChatSession {
    id: string;
    customerId: string;
    customerName: string;
    moderatorId?: string;
    status: 'pending' | 'active' | 'closed';
    messages: ChatMessage[];
    createdAt: number;
}

export interface ModeratorActivityLog {
    id: string;
    moderatorId: string;
    moderatorName: string;
    action: string;
    bookingId: string;
    details: string;
    timestamp: number;
}


export interface PlatformData {
    services: ServiceDetail[];
    serviceAreas: ServiceArea[];
    users?: Customer[];
    vendors?: Vendor[];
    bookings?: Booking[];
    vendorApplications?: VendorApplication[];
    totalRevenue?: number;
    totalCommission?: number;
    totalSubscriptionRevenue?: number;
    withdrawals?: Withdrawal[];
    moderators?: Moderator[];
    chatSessions?: ChatSession[];
    moderatorActivityLog?: ModeratorActivityLog[];
}

export type View = 'customer_home' | 'service_page' | 'booking_confirmation' | 'vendor_landing' | 'vendor_dashboard' | 'customer_dashboard' | 'admin_dashboard' | 'booking_tracker' | 'auth' | 'moderator_login' | 'moderator_dashboard';