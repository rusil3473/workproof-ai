import type { Job, Milestone, GPSCoordinates, UserProfile, AuthSession, AIInspectionReport } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'https://workproof-ai.onrender.com';
const TOKEN_KEY = 'workproof_auth_token';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

function getAuthHeaders(extraHeaders: Record<string, string> = {}): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response, fallbackError: string): Promise<T> {
  if (!res.ok) {
    let errorDetail = fallbackError;
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.error || fallbackError;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const workproofApi = {
  // ----------------- Authentication API -----------------
  async login(payload: { email: string; password: string }): Promise<AuthSession> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<any>(res, 'Failed to authenticate');
    const token = data.access_token || data.token;
    setAuthToken(token);
    return {
      token,
      user: data.user || {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        tier: data.tier || 'pro',
        is_active: true,
      },
    };
  },

  async register(payload: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
    company?: string;
  }): Promise<AuthSession> {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<any>(res, 'Failed to register account');
    const token = data.access_token || data.token;
    setAuthToken(token);
    return {
      token,
      user: data.user || {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        tier: 'pro',
        is_active: true,
      },
    };
  },

  async getMe(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<any>(res, 'Failed to retrieve current user session');
    return data.user || data;
  },

  logout(): void {
    clearAuthToken();
  },

  // ----------------- Jobs API -----------------
  async fetchJobs(): Promise<Job[]> {
    const res = await fetch(`${API_BASE}/api/jobs`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Job[]>(res, 'Failed to fetch jobs from server');
  },

  async createJob(payload: Partial<Job>): Promise<Job> {
    const res = await fetch(`${API_BASE}/api/jobs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Job>(res, 'Failed to create job');
  },

  async updateJob(jobId: string, payload: Partial<Job>): Promise<Job> {
    const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Job>(res, 'Failed to update job');
  },

  async deleteJob(jobId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<{ deleted: boolean }>(res, 'Failed to delete job');
    return data.deleted;
  },

  // ----------------- Milestones API -----------------
  async addMilestone(jobId: string, payload: { title: string; description?: string; amount: number }): Promise<Milestone> {
    const res = await fetch(`${API_BASE}/api/jobs/${jobId}/milestones`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Milestone>(res, 'Failed to add milestone');
  },

  async updateMilestone(milestoneId: string, payload: Partial<Milestone>): Promise<Milestone> {
    const res = await fetch(`${API_BASE}/api/milestones/${milestoneId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Milestone>(res, 'Failed to update milestone');
  },

  async deleteMilestone(milestoneId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api/milestones/${milestoneId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<{ deleted: boolean }>(res, 'Failed to delete milestone');
    return data.deleted;
  },

  async uploadPhotoProof(
    milestoneId: string,
    mode: 'before' | 'after',
    photoDataUrl: string,
    gps?: GPSCoordinates,
    sha256Hash?: string
  ): Promise<Milestone> {
    const res = await fetch(`${API_BASE}/api/milestones/${milestoneId}/photos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        mode,
        photo_data_url: photoDataUrl,
        latitude: gps?.latitude,
        longitude: gps?.longitude,
        accuracy_meters: gps?.accuracyMeters,
        sha256_hash: sha256Hash,
      }),
    });
    return handleResponse<Milestone>(res, 'Failed to save photo proof');
  },

  async signMilestone(
    milestoneId: string,
    signatureDataUrl: string,
    signerName: string
  ): Promise<Milestone> {
    const res = await fetch(`${API_BASE}/api/milestones/${milestoneId}/sign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        signature_data_url: signatureDataUrl,
        signer_name: signerName,
      }),
    });
    return handleResponse<Milestone>(res, 'Failed to submit milestone signature');
  },

  async payMilestone(
    milestoneId: string,
    paymentMethod: string,
    amount: number,
    currency: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/api/milestones/${milestoneId}/pay`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        payment_method: paymentMethod,
        amount,
        currency,
      }),
    });
    return handleResponse<any>(res, 'Failed to settle milestone payout');
  },

  // ----------------- Real AI Computer Vision & Defect Inspector -----------------
  async inspectMilestoneAI(payload: {
    milestone_id: string;
    category?: string;
  }): Promise<AIInspectionReport> {
    const res = await fetch(`${API_BASE}/api/ai/inspect-milestone`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<AIInspectionReport>(res, 'Failed to run AI visual inspection');
  },

  async getDisputeRisk(payload: {
    milestoneCount: number;
    signedCount: number;
    hasGps?: boolean;
    hasHash?: boolean;
  }): Promise<{
    disputeShieldScore: number;
    retainageProtectionRate: string;
    litigationDefenseConfidence: string;
    recommendedAction: string;
  }> {
    const res = await fetch(`${API_BASE}/api/ai/dispute-risk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res, 'Failed to calculate AI dispute risk');
  },

  // ----------------- RevenueCat API -----------------
  async fetchCustomerEntitlements(customerId = 'rc_usr_contractor_7829'): Promise<any> {
    const res = await fetch(`${API_BASE}/api/revenuecat/customer/${customerId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res, 'Failed to fetch customer entitlements');
  },

  async upgradeSubscription(payload: {
    customer_id?: string;
    app_user_id?: string;
    plan: string;
    price?: number;
    currency?: string;
    stripe_customer_id?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/api/revenuecat/subscribe`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        customer_id: payload.customer_id || payload.app_user_id || 'rc_usr_contractor_7829',
        plan: payload.plan,
        price: payload.price,
        currency: payload.currency || 'USD',
        stripe_customer_id: payload.stripe_customer_id || 'cus_contractor_7829',
      }),
    });
    return handleResponse<any>(res, 'Failed to process subscription upgrade');
  },

  // ----------------- OneSignal Partner Push API -----------------
  async fetchOneSignalNotifications(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/api/onesignal/notifications`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(res, 'Failed to fetch OneSignal notifications');
  },

  async sendOneSignalPush(payload: {
    title: string;
    message: string;
    recipient?: string;
    channel?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/api/onesignal/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res, 'Failed to send OneSignal push notification');
  },

  // ----------------- Alexa+ Punch List API -----------------
  async fetchPunchItems(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/api/alexa/punchlist`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(res, 'Failed to fetch punch items');
  },

  async addPunchItem(payload: { task: string; trade?: string; priority?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/api/alexa/punchlist`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res, 'Failed to add punch item');
  },

  async updatePunchItem(itemId: string, payload: Partial<any>): Promise<any> {
    const res = await fetch(`${API_BASE}/api/alexa/punchlist/${itemId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res, 'Failed to update punch item');
  },

  async deletePunchItem(itemId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api/alexa/punchlist/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<{ deleted: boolean }>(res, 'Failed to delete punch item');
    return data.deleted;
  },
};
