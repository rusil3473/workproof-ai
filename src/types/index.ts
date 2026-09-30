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
  stripeCustomerId?: string;
  gateway?: string;
  funnelPartner?: string;
  pushPartner?: string;
}

export interface OneSignalNotification {
  id: string;
  recipient: string;
  title: string;
  message: string;
  channel: string;
  delivery_status: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  org_id?: string;
  email: string;
  full_name: string;
  role: 'general_contractor' | 'subcontractor' | 'project_owner' | 'inspector';
  tier: 'free' | 'pro' | 'enterprise';
  is_active: boolean;
  created_at?: string;
}

export interface AuthSession {
  token: string;
  user: UserProfile;
}

export interface AIInspectionReport {
  inspectionId: string;
  milestoneId: string;
  timestamp: string;
  completionPercentage: number;
  sheenUniformityPercentage: number;
  edgeAlignmentPercentage: number;
  disputeShieldScore: number;
  tradeStandard: string;
  sheenDisputeAnalysis: {
    verdict: string;
    glossUnitVariance: string;
    illuminationModel: string;
    summary: string;
  };
  defects: Array<{
    id: string;
    type: string;
    severity: string;
    description: string;
    boundingBox: { x: number; y: number; width: number; height: number };
    status: string;
  }>;
  tamperProofCertHash: string;
}
