import { useState } from 'react';
import {
  ShieldCheck,
  Camera,
  CheckCircle2,
  Download,
  Share2,
  Crown,
  CreditCard,
  MapPin,
  Calendar,
  PenTool,
  Clock,
  Mic,
  Layers,
} from 'lucide-react';
import type { Job, Milestone, GPSCoordinates, RevenueCatCustomerInfo } from './types';
import { GhostCameraModal } from './components/GhostCameraModal';
import { SignaturePadModal } from './components/SignaturePadModal';
import { RevenueCatPaywallModal } from './components/RevenueCatPaywallModal';
import { RevenueCatCustomerCenterModal } from './components/RevenueCatCustomerCenterModal';
import { VoicePunchListDrawer } from './components/VoicePunchListDrawer';
import { RedditContractorBanner } from './components/RedditContractorBanner';
import { PaymentModal } from './components/PaymentModal';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { generateCertificatePdf } from './engine/certificatePdfGenerator';
import confetti from 'canvas-confetti';

const INITIAL_JOBS: Job[] = [
  {
    id: 'job-01',
    title: 'Modern Kitchen Remodel & Island Lighting',
    category: 'Renovation',
    clientName: 'Sarah Jenkins',
    clientPhone: '+1 (512) 555-0194',
    clientEmail: 'sarah.jenkins@example.com',
    locationAddress: '2408 Westover Rd, Austin, TX',
    currency: 'USD',
    totalAmount: 4200,
    status: 'active',
    createdAt: '2026-09-15T09:00:00Z',
    milestones: [
      {
        id: 'm-01',
        jobId: 'job-01',
        title: 'Phase 1: Rough-in Electrical & Recessed Fixtures',
        description: 'Installed 6 recessed LED cans, island pendant wiring, and dedicated 20A GFCI circuit.',
        amount: 1400,
        beforePhotoUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80',
        afterPhotoUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
        beforeTimestamp: '2026-09-16T10:15:00Z',
        afterTimestamp: '2026-09-17T16:30:00Z',
        gpsCoordinates: { latitude: 30.2984, longitude: -97.7601, accuracyMeters: 3.5 },
        sha256Hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><path d="M 10 40 Q 60 10 100 40 T 180 30" fill="none" stroke="black" stroke-width="3"/></svg>',
        signerName: 'Sarah Jenkins',
        signedAt: '2026-09-17T17:05:00Z',
        status: 'signed',
      },
      {
        id: 'm-02',
        jobId: 'job-01',
        title: 'Phase 2: Custom Oak Cabinets & Quartz Surface',
        description: 'Frameless soft-close cabinetry and Calacatta quartz countertops with undermount sink cutout.',
        amount: 1800,
        beforePhotoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
        beforeTimestamp: '2026-09-18T08:30:00Z',
        gpsCoordinates: { latitude: 30.2984, longitude: -97.7601, accuracyMeters: 3.5 },
        status: 'before_captured',
      },
      {
        id: 'm-03',
        jobId: 'job-01',
        title: 'Phase 3: Backsplash, Appliance Trim & Final Punch',
        description: 'Handcrafted zellige tile backsplash, dishwasher trim kit, and plumbing fixture test.',
        amount: 1000,
        status: 'pending',
      },
    ],
  },
  {
    id: 'job-02',
    title: 'PM Surya Ghar 3kW Rooftop Solar Installation',
    category: 'Solar Rooftop',
    clientName: 'Rajesh Sharma',
    clientPhone: '+91 98450 12345',
    clientEmail: 'rajesh.sharma@example.in',
    locationAddress: 'Plot 42, HSR Layout Sector 2, Bengaluru, KA',
    currency: 'INR',
    totalAmount: 145000,
    status: 'active',
    createdAt: '2026-09-14T11:00:00Z',
    milestones: [
      {
        id: 'm-04',
        jobId: 'job-02',
        title: 'Stage 1: Roof Structural Mounting & Earthing Grid',
        description: 'Installed anodized aluminum rails anchored to RCC roof pillars; dual copper earthing rods tested at <5 ohms.',
        amount: 45000,
        beforePhotoUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=800&auto=format&fit=crop&q=80',
        afterPhotoUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
        beforeTimestamp: '2026-09-15T09:30:00Z',
        afterTimestamp: '2026-09-16T14:45:00Z',
        gpsCoordinates: { latitude: 12.9121, longitude: 77.6446, accuracyMeters: 2.8 },
        sha256Hash: '4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e',
        signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><path d="M 10 50 Q 50 20 90 50 T 170 40" fill="none" stroke="black" stroke-width="3"/></svg>',
        signerName: 'Rajesh Sharma',
        signedAt: '2026-09-16T15:15:00Z',
        status: 'signed',
      },
      {
        id: 'm-05',
        jobId: 'job-02',
        title: 'Stage 2: 8x 540W Mono PERC Panels & Inverter Wiring',
        description: 'Mounted solar PV modules with MC4 connectors; connected 3.3kW hybrid inverter.',
        amount: 70000,
        status: 'pending',
      },
      {
        id: 'm-06',
        jobId: 'job-02',
        title: 'Stage 3: DISCOM Net-Meter Commissioning (Subsidy Release)',
        description: 'BESCOM bi-directional net-meter sync and ₹78,000 PM Surya Ghar subsidy portal photo upload.',
        amount: 30000,
        status: 'pending',
      },
    ],
  },
];

export function App() {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [activeJobId, setActiveJobId] = useState<string>('job-01');
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);

  // RevenueCat subscription state
  const [rcCustomer, setRcCustomer] = useState<RevenueCatCustomerInfo>({
    entitlements: { pro: true },
    activeSubscriptions: ['workproof_pro_annual'],
    expirationDate: '2027-09-20T00:00:00Z',
  });

  // Modal controls
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'before' | 'after'>('before');
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isVoicePunchOpen, setIsVoicePunchOpen] = useState(false);
  const [isCustomerCenterOpen, setIsCustomerCenterOpen] = useState(false);

  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0];
  const activeMilestone = activeJob.milestones.find((m) => m.id === activeMilestoneId);

  // Ghost camera handler
  const handleOpenGhostCamera = (milestoneId: string, mode: 'before' | 'after') => {
    setActiveMilestoneId(milestoneId);
    setCameraMode(mode);
    setIsCameraOpen(true);
  };

  const handleCapturePhoto = (photoDataUrl: string, gps?: GPSCoordinates, sha256Hash?: string) => {
    if (!activeMilestoneId) return;

    setJobs((prevJobs) =>
      prevJobs.map((j) => {
        if (j.id !== activeJob.id) return j;
        return {
          ...j,
          milestones: j.milestones.map((m) => {
            if (m.id !== activeMilestoneId) return m;
            if (cameraMode === 'before') {
              return {
                ...m,
                beforePhotoUrl: photoDataUrl,
                beforeTimestamp: new Date().toISOString(),
                gpsCoordinates: gps,
                status: 'before_captured',
              };
            } else {
              return {
                ...m,
                afterPhotoUrl: photoDataUrl,
                afterTimestamp: new Date().toISOString(),
                gpsCoordinates: gps,
                sha256Hash,
                status: 'completed',
              };
            }
          }),
        };
      })
    );

    setIsCameraOpen(false);
  };

  // Signature handler
  const handleOpenSignature = (milestoneId: string) => {
    setActiveMilestoneId(milestoneId);
    setIsSignatureOpen(true);
  };

  const handleSaveSignature = (signatureDataUrl: string, signerName: string) => {
    if (!activeMilestoneId) return;

    setJobs((prevJobs) =>
      prevJobs.map((j) => {
        if (j.id !== activeJob.id) return j;
        return {
          ...j,
          milestones: j.milestones.map((m) => {
            if (m.id !== activeMilestoneId) return m;
            return {
              ...m,
              signatureDataUrl,
              signerName,
              signedAt: new Date().toISOString(),
              status: 'signed',
            };
          }),
        };
      })
    );

    setIsSignatureOpen(false);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
  };

  // Payment handler
  const handleOpenPayment = (milestoneId: string) => {
    setActiveMilestoneId(milestoneId);
    setIsPaymentOpen(true);
  };

  const handleMarkPaid = () => {
    if (!activeMilestoneId) return;
    setJobs((prevJobs) =>
      prevJobs.map((j) => {
        if (j.id !== activeJob.id) return j;
        return {
          ...j,
          milestones: j.milestones.map((m) => {
            if (m.id !== activeMilestoneId) return m;
            return { ...m, status: 'paid' };
          }),
        };
      })
    );
  };

  // PDF Export
  const handleDownloadPdf = (milestone: Milestone) => {
    const doc = generateCertificatePdf(activeJob, milestone);
    doc.save(`WorkProof-${milestone.id.slice(0, 6)}.pdf`);
  };

  // WhatsApp share
  const handleWhatsAppShare = (milestone: Milestone) => {
    const amountStr = `${activeJob.currency === 'USD' ? '$' : 'Rs. '}${milestone.amount.toLocaleString()} ${activeJob.currency}`;
    const text = `*WorkProof AI Milestone Verified!*%0A*Job:* ${activeJob.title}%0A*Milestone:* ${milestone.title}%0A*Amount:* ${amountStr}%0A*Signer:* ${milestone.signerName || activeJob.clientName}%0A*Proof Hash:* ${milestone.sha256Hash ? milestone.sha256Hash.slice(0, 16) + '...' : 'Verified'}`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950 font-sans pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white sm:text-lg">WorkProof AI</span>
                <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
                  REVENUECAT SHIPATON 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Ghost Camera Alignment & Client Milestone Sign-Off on Glass
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVoicePunchOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors shadow-sm"
              title="Open Amazon Alexa+ Hands-Free Punch List"
            >
              <Mic className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Alexa+ Voice Punch</span>
            </button>

            <button
              onClick={() => setIsCustomerCenterOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              title="Inspect RevenueCat Entitlements & Webhooks"
            >
              <Layers className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">RC Entitlements</span>
            </button>

            <button
              onClick={() => setIsPaywallOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 shadow-sm hover:bg-amber-500/20 transition-colors"
            >
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              <span>{rcCustomer.entitlements.pro ? 'PRO CONTRACTOR ACTIVE' : 'UPGRADE TO PRO'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        {/* Reddit Field Grounding Banner */}
        <RedditContractorBanner />
        {/* Job Selector Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Job File:</span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300 font-mono">
                {activeJob.category}
              </span>
            </div>
            <h1 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">{activeJob.title}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                {activeJob.locationAddress}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Client: {activeJob.clientName} ({activeJob.clientPhone})
              </span>
            </div>
          </div>

          {/* Job Switcher Tabs */}
          <div className="flex items-center gap-2">
            {jobs.map((j) => (
              <button
                key={j.id}
                onClick={() => setActiveJobId(j.id)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  activeJob.id === j.id
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {j.currency === 'USD' ? '🇺🇸 US: ' : '🇮🇳 India: '}
                {j.title.split(' ')[0]}...
              </button>
            ))}
          </div>
        </div>

        {/* Executive Stats Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="text-xs text-slate-400">Total Contract Value</div>
            <div className="mt-1 text-xl font-bold text-white">
              {activeJob.currency === 'USD' ? '$' : 'Rs. '}
              {activeJob.totalAmount.toLocaleString()}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="text-xs text-slate-400">Milestones Progress</div>
            <div className="mt-1 text-xl font-bold text-cyan-400">
              {activeJob.milestones.filter((m) => m.status === 'signed' || m.status === 'paid').length} / {activeJob.milestones.length} Signed
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="text-xs text-slate-400">Dispute Shield Ratio</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">100% Tamper-Proof</div>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="text-xs text-slate-400">RevenueCat Monetization</div>
            <div className="mt-1 text-xl font-bold text-amber-400">50x–200x ROI</div>
          </div>
        </div>

        {/* Milestone Cards List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Milestone Verification & Sign-Off Cards</h2>
            <span className="text-xs text-slate-400">Real-time before/after proof & client finger signing</span>
          </div>

          {activeJob.milestones.map((m, idx) => {
            const isSigned = m.status === 'signed' || m.status === 'paid';
            const isCompleted = m.status === 'completed' || isSigned;
            const hasBefore = Boolean(m.beforePhotoUrl);
            const hasBoth = Boolean(m.beforePhotoUrl && m.afterPhotoUrl);

            return (
              <div
                key={m.id}
                className={`rounded-2xl bg-slate-900 border transition-all ${
                  isSigned
                    ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                    : 'border-slate-800 hover:border-slate-700'
                } p-5 sm:p-6`}
              >
                {/* Milestone Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white">{m.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{m.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-extrabold text-white">
                      {activeJob.currency === 'USD' ? '$' : 'Rs. '}
                      {m.amount.toLocaleString()}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isSigned
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : m.status === 'completed'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : hasBefore
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isSigned ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>VERIFIED SIGNED</span>
                        </>
                      ) : m.status === 'completed' ? (
                        <>
                          <Clock className="h-3.5 w-3.5" />
                          <span>AWAITING SIGNATURE</span>
                        </>
                      ) : hasBefore ? (
                        <>
                          <Camera className="h-3.5 w-3.5" />
                          <span>READY FOR GHOST AFTER</span>
                        </>
                      ) : (
                        <span>PENDING CAPTURE</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Evidence Photographic Display or Slider */}
                <div className="my-5">
                  {hasBoth ? (
                    <div>
                      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold text-cyan-400">
                          Interactive Ghost-Aligned Comparison (Drag Slider):
                        </span>
                        <span>Drag handle to verify before vs after work</span>
                      </div>
                      <BeforeAfterSlider
                        beforeUrl={m.beforePhotoUrl!}
                        afterUrl={m.afterPhotoUrl!}
                        height={340}
                      />
                    </div>
                  ) : hasBefore ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                        <div className="p-2 text-xs font-bold text-slate-400 border-b border-slate-800 bg-slate-900/60">
                          STAGE 1: BEFORE PHOTO (LOCKED)
                        </div>
                        <img src={m.beforePhotoUrl} alt="Before" className="h-56 w-full object-cover" />
                      </div>

                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-cyan-500/40 bg-cyan-950/10 p-6 text-center">
                        <Camera className="h-10 w-10 text-cyan-400 mb-2" />
                        <h4 className="text-sm font-bold text-white">Ghost Camera Angle Match Ready</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs">
                          Open the camera to overlay a 30% translucent ghost of the before photo for exact perspective match.
                        </p>
                        <button
                          onClick={() => handleOpenGhostCamera(m.id, 'after')}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
                        >
                          <Camera className="h-4 w-4" />
                          Open Ghost Camera Viewfinder
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/60 p-8 text-center">
                      <Camera className="h-10 w-10 text-slate-600 mb-2" />
                      <h4 className="text-sm font-bold text-white">No Baseline Photos Yet</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        Capture the initial jobsite condition before starting work to establish tamper-proof proof.
                      </p>
                      <button
                        onClick={() => handleOpenGhostCamera(m.id, 'before')}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
                      >
                        <Camera className="h-4 w-4 text-cyan-400" />
                        Capture Before Photo
                      </button>
                    </div>
                  )}
                </div>

                {/* Cryptographic & Forensic Metadata Strip */}
                {m.sha256Hash && (
                  <div className="my-4 rounded-xl bg-slate-950 border border-slate-800/80 p-3 text-xs font-mono flex flex-wrap items-center justify-between gap-3 text-slate-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>SHA-256: {m.sha256Hash.slice(0, 24)}...</span>
                    </div>
                    {m.gpsCoordinates && (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                        <span>
                          {m.gpsCoordinates.latitude.toFixed(5)}N, {m.gpsCoordinates.longitude.toFixed(5)}E
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Milestone Action Bar */}
                <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Capture After button */}
                    {hasBefore && !m.afterPhotoUrl && (
                      <button
                        onClick={() => handleOpenGhostCamera(m.id, 'after')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        Ghost Camera HUD
                      </button>
                    )}

                    {/* Sign on Glass button */}
                    {isCompleted && !isSigned && (
                      <button
                        onClick={() => handleOpenSignature(m.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                      >
                        <PenTool className="h-3.5 w-3.5" />
                        Client Sign-Off on Glass
                      </button>
                    )}

                    {/* Signed details */}
                    {isSigned && (
                      <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Signed by {m.signerName || activeJob.clientName}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Payment Trigger */}
                    <button
                      onClick={() => handleOpenPayment(m.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                      <CreditCard className="h-3.5 w-3.5 text-cyan-400" />
                      Instant Pay
                    </button>

                    {/* Download Certificate */}
                    {isSigned && (
                      <button
                        onClick={() => handleDownloadPdf(m)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5 text-emerald-400" />
                        Certificate PDF
                      </button>
                    )}

                    {/* WhatsApp Share */}
                    {isSigned && (
                      <button
                        onClick={() => handleWhatsAppShare(m)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-600/30 transition-colors"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        WhatsApp
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modals */}
      <GhostCameraModal
        isOpen={isCameraOpen}
        mode={cameraMode}
        referenceBeforeUrl={activeMilestone?.beforePhotoUrl}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapturePhoto}
      />

      <SignaturePadModal
        isOpen={isSignatureOpen}
        clientName={activeJob.clientName}
        onClose={() => setIsSignatureOpen(false)}
        onSave={handleSaveSignature}
      />

      <RevenueCatPaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onUpgradeSuccess={() =>
          setRcCustomer({
            entitlements: { pro: true },
            activeSubscriptions: ['workproof_pro_annual'],
            expirationDate: '2027-09-20T00:00:00Z',
          })
        }
      />

      {activeMilestone && (
        <PaymentModal
          isOpen={isPaymentOpen}
          job={activeJob}
          milestone={activeMilestone}
          onClose={() => setIsPaymentOpen(false)}
          onMarkPaid={handleMarkPaid}
        />
      )}

      <VoicePunchListDrawer
        isOpen={isVoicePunchOpen}
        onClose={() => setIsVoicePunchOpen(false)}
      />

      <RevenueCatCustomerCenterModal
        isOpen={isCustomerCenterOpen}
        onClose={() => setIsCustomerCenterOpen(false)}
        isPro={rcCustomer.entitlements.pro}
        setIsPro={(val) =>
          setRcCustomer((prev) => ({
            ...prev,
            entitlements: { pro: val },
          }))
        }
      />
    </div>
  );
}

export default App;
