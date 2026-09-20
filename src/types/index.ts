export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP';

export interface Milestone {
  id: string;
  jobId: string;
  title: string;
  description: string;
  amount: number;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  beforeTimestamp?: string;
  afterTimestamp?: string;
  gpsCoordinates?: GPSCoordinates;
  sha256Hash?: string;
  signatureDataUrl?: string;
  signerName?: string;
  signedAt?: string;
  status: 'pending' | 'before_captured' | 'completed' | 'signed' | 'paid';
}

export interface Job {
  id: string;
  title: string;
  category: 'Renovation' | 'Electrical' | 'Plumbing' | 'Interior Design' | 'Solar Rooftop' | 'Detailing' | 'Cleaning';
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  locationAddress: string;
  currency: CurrencyCode;
  totalAmount: number;
  status: 'active' | 'completed' | 'disputed';
  milestones: Milestone[];
  createdAt: string;
}

export interface RevenueCatCustomerInfo {
  entitlements: {
    pro: boolean;
  };
  activeSubscriptions: string[];
  expirationDate: string | null;
}
