import React, { useState, useEffect, Suspense } from 'react';
import {
  ShieldCheck,
  Camera,
  CheckCircle2,
  Download,
  Crown,
  CreditCard,
  MapPin,
  Calendar,
  PenTool,
  Clock,
  Mic,
  Layers,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Bell,
  Menu,
  LogOut,
  Cpu,
  HardHat,
} from 'lucide-react';
import type { Job, Milestone, GPSCoordinates, RevenueCatCustomerInfo, UserProfile } from './types';
import { RedditContractorBanner } from './components/RedditContractorBanner';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { LeftSidebarNavigation, type NavTab } from './components/LeftSidebarNavigation';
import { AIInspectionModal } from './components/AIInspectionModal';
import { workproofApi, getAuthToken } from './api/workproofApi';
import confetti from 'canvas-confetti';

// High-Scale Code-Splitting: Lazy load heavy modals and signature canvas
const GhostCameraModal = React.lazy(() => import('./components/GhostCameraModal').then(m => ({ default: m.GhostCameraModal })));
const SignaturePadModal = React.lazy(() => import('./components/SignaturePadModal').then(m => ({ default: m.SignaturePadModal })));
const RevenueCatPaywallModal = React.lazy(() => import('./components/RevenueCatPaywallModal').then(m => ({ default: m.RevenueCatPaywallModal })));
const RevenueCatCustomerCenterModal = React.lazy(() => import('./components/RevenueCatCustomerCenterModal').then(m => ({ default: m.RevenueCatCustomerCenterModal })));
const VoicePunchListDrawer = React.lazy(() => import('./components/VoicePunchListDrawer').then(m => ({ default: m.VoicePunchListDrawer })));
const PaymentModal = React.lazy(() => import('./components/PaymentModal').then(m => ({ default: m.PaymentModal })));
const JobModal = React.lazy(() => import('./components/JobModal').then(m => ({ default: m.JobModal })));
const MilestoneModal = React.lazy(() => import('./components/MilestoneModal').then(m => ({ default: m.MilestoneModal })));
const OneSignalNotificationDrawer = React.lazy(() => import('./components/OneSignalNotificationDrawer').then(m => ({ default: m.OneSignalNotificationDrawer })));

export function App() {
  // Authentication & Multi-Tenant State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalEmail, setAuthModalEmail] = useState('');

  // Navigation Drawer State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('projects');

  // Job & Milestone Data State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJobId, setActiveJobId] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal Visibility States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'before' | 'after'>('before');
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCustomerCenterOpen, setIsCustomerCenterOpen] = useState(false);
  const [isVoicePunchOpen, setIsVoicePunchOpen] = useState(false);
  const [isOneSignalOpen, setIsOneSignalOpen] = useState(false);
  const [oneSignalCount, setOneSignalCount] = useState<number>(2);

  // Real AI Inspection Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedMilestoneForAI, setSelectedMilestoneForAI] = useState<Milestone | null>(null);

  // Job & Milestone Edit Modals
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobModalMode, setJobModalMode] = useState<'create' | 'edit'>('create');
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [milestoneModalMode, setMilestoneModalMode] = useState<'create' | 'edit'>('create');
  const [selectedMilestoneForEdit, setSelectedMilestoneForEdit] = useState<Milestone | null>(null);

  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);

  // RevenueCat Customer State
  const [rcCustomer, setRcCustomer] = useState<RevenueCatCustomerInfo>({
    entitlements: { pro: true },
    activeSubscriptions: ['workproof_pro_annual'],
    expirationDate: '2027-09-29T00:00:00Z',
    stripeCustomerId: 'cus_contractor_7829',
    gateway: 'RevenueCat + Stripe Web Billing',
  });

  // Verify Auth on Initial Mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      workproofApi.getMe()
        .then((user) => {
          setCurrentUser(user);
        })
        .catch(() => {
          workproofApi.logout();
          setCurrentUser(null);
        });
    }
  }, []);

  // Fetch Jobs when User is Authenticated
  const loadJobsFromBackend = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      const data = await workproofApi.fetchJobs();
      if (Array.isArray(data)) {
        setJobs(data);
        if (data.length > 0) {
          if (!activeJobId || !data.some((j) => j.id === activeJobId)) {
            setActiveJobId(data[0].id);
          }
        } else {
          setActiveJobId('');
        }
      }

      // Sync live RevenueCat customer entitlements
      try {
        const rcData = await workproofApi.fetchCustomerEntitlements('rc_usr_contractor_7829');
        if (rcData && typeof rcData.is_active === 'boolean') {
          setRcCustomer({
            entitlements: { pro: rcData.is_active },
            activeSubscriptions: rcData.is_active ? [rcData.plan_name || 'workproof_pro_annual'] : [],
            expirationDate: rcData.expires_at || '2027-09-29T00:00:00Z',
            stripeCustomerId: rcData.stripe_customer_id || 'cus_contractor_7829',
            gateway: rcData.gateway || 'RevenueCat + Stripe Web Billing',
          });
        }
      } catch {
        // Fallback
      }

      // Sync OneSignal push notification count
      try {
        const notifs = await workproofApi.fetchOneSignalNotifications();
        if (Array.isArray(notifs)) {
          setOneSignalCount(notifs.length);
        }
      } catch {
        // Fallback
      }
    } catch {
      // ignore
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadJobsFromBackend();
    }
  }, [currentUser]);

  const handleLogout = () => {
    workproofApi.logout();
    setCurrentUser(null);
    setJobs([]);
    setActiveJobId('');
  };

  // Active Job resolution
  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0];
  const activeMilestone = activeJob?.milestones?.find((m) => m.id === activeMilestoneId);

  // Ghost camera handler
  const handleOpenGhostCamera = (milestoneId: string, mode: 'before' | 'after') => {
    setActiveMilestoneId(milestoneId);
    setCameraMode(mode);
    setIsCameraOpen(true);
  };

  const handleCapturePhoto = async (photoDataUrl: string, gps?: GPSCoordinates, sha256Hash?: string) => {
    if (!activeMilestoneId || !activeJob) return;

    // Optimistic UI state update
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

    try {
      await workproofApi.uploadPhotoProof(activeMilestoneId, cameraMode, photoDataUrl, gps, sha256Hash);
    } catch (err) {
      console.error('Failed to sync photo to backend:', err);
    }
  };

  // Signature modal handlers
  const handleOpenSignModal = (milestoneId: string) => {
    setActiveMilestoneId(milestoneId);
    setIsSignModalOpen(true);
  };

  const handleSaveSignature = async (signatureDataUrl: string, signerName: string) => {
    if (!activeMilestoneId || !activeJob) return;

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

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    try {
      await workproofApi.signMilestone(activeMilestoneId, signatureDataUrl, signerName);
    } catch (err) {
      console.error('Failed to save signature to backend:', err);
    }
  };

  // Payment Settlement handler
  const handleOpenPayment = (milestoneId: string) => {
    setActiveMilestoneId(milestoneId);
    setIsPaymentOpen(true);
  };

  const handleMarkPaid = () => {
    if (!activeMilestoneId || !activeJob) return;

    setJobs((prevJobs) =>
      prevJobs.map((j) => {
        if (j.id !== activeJob.id) return j;
        return {
          ...j,
          milestones: j.milestones.map((m) => {
            if (m.id !== activeMilestoneId) return m;
            return {
              ...m,
              status: 'paid',
            };
          }),
        };
      })
    );
  };

  // Job Modal Handlers
  const handleOpenAddJob = () => {
    setJobModalMode('create');
    setIsJobModalOpen(true);
  };

  const handleOpenEditJob = () => {
    if (!activeJob) return;
    setJobModalMode('edit');
    setIsJobModalOpen(true);
  };

  const handleJobSaved = (savedJob: Job) => {
    setJobs((prev) => {
      const idx = prev.findIndex((j) => j.id === savedJob.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedJob;
        return copy;
      } else {
        return [savedJob, ...prev];
      }
    });
    setActiveJobId(savedJob.id);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to permanently delete this project?')) return;
    try {
      await workproofApi.deleteJob(jobId);
      setJobs((prev) => {
        const remaining = prev.filter((j) => j.id !== jobId);
        if (remaining.length > 0) {
          setActiveJobId(remaining[0].id);
        } else {
          setActiveJobId('');
        }
        return remaining;
      });
    } catch (err: any) {
      alert(err.message || 'Failed to delete job');
    }
  };

  // Milestone Modal Handlers
  const handleOpenAddMilestone = () => {
    setMilestoneModalMode('create');
    setSelectedMilestoneForEdit(null);
    setIsMilestoneModalOpen(true);
  };

  const handleOpenEditMilestone = (milestone: Milestone) => {
    setMilestoneModalMode('edit');
    setSelectedMilestoneForEdit(milestone);
    setIsMilestoneModalOpen(true);
  };

  const handleMilestoneSaved = (savedMilestone: Milestone) => {
    if (!activeJob) return;
    setJobs((prevJobs) =>
      prevJobs.map((j) => {
        if (j.id !== activeJob.id) return j;
        const exists = j.milestones.some((m) => m.id === savedMilestone.id);
        let updatedMilestones: Milestone[];
        if (exists) {
          updatedMilestones = j.milestones.map((m) => (m.id === savedMilestone.id ? savedMilestone : m));
        } else {
          updatedMilestones = [...j.milestones, savedMilestone];
        }
        return {
          ...j,
          milestones: updatedMilestones,
        };
      })
    );
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;
    if (!activeJob) return;
    try {
      await workproofApi.deleteMilestone(milestoneId);
      setJobs((prevJobs) =>
        prevJobs.map((j) => {
          if (j.id !== activeJob.id) return j;
          return {
            ...j,
            milestones: j.milestones.filter((m) => m.id !== milestoneId),
          };
        })
      );
    } catch (err: any) {
      alert(err.message || 'Failed to delete milestone');
    }
  };

  // PDF Certificate Generator
  const handleDownloadCertificate = async (milestone: Milestone) => {
    if (!activeJob) return;
    try {
      const { generateCertificatePdf } = await import('./engine/certificatePdfGenerator');
      const doc = generateCertificatePdf(activeJob, milestone);
      doc.save(`WorkProof-${activeJob.title.replace(/\s+/g, '_')}-${milestone.title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF proof certificate:', err);
      alert('Generating PDF certificate... (Please verify browser canvas permissions)');
    }
  };

  // Open AI inspection modal
  const handleOpenAIInspection = (milestone: Milestone) => {
    setSelectedMilestoneForAI(milestone);
    setIsAIModalOpen(true);
  };

  // -------------------------------------------------------------
  // Render Unauthenticated Landing Page if not logged in
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <>
        <LandingPage
          onOpenAuth={(mode = 'login', email = '') => {
            setAuthModalMode(mode);
            setAuthModalEmail(email);
            setIsAuthModalOpen(true);
          }}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          defaultMode={authModalMode}
          presetEmail={authModalEmail}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthenticated={(user) => {
            setCurrentUser(user);
          }}
        />
      </>
    );
  }

  // Calculate project statistics
  const totalMilestones = activeJob?.milestones?.length || 0;
  const signedMilestones = activeJob?.milestones?.filter((m) => m.status === 'signed' || m.status === 'paid').length || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 pb-20">
      {/* Left Sidebar Navigation Drawer */}
      <LeftSidebarNavigation
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'ai_inspector' && activeJob?.milestones?.[0]) {
            handleOpenAIInspection(activeJob.milestones[0]);
          } else if (tab === 'voice_punch') {
            setIsVoicePunchOpen(true);
          } else if (tab === 'billing') {
            setIsCustomerCenterOpen(true);
          } else if (tab === 'notifications') {
            setIsOneSignalOpen(true);
          }
        }}
        jobs={jobs}
        activeJobId={activeJobId}
        onSelectJob={(id) => setActiveJobId(id)}
        onOpenCreateJob={handleOpenAddJob}
        currentUser={currentUser}
        onLogout={handleLogout}
        unreadPushCount={oneSignalCount}
        isPro={rcCustomer.entitlements.pro}
      />

      {/* Enterprise Commercial Header (Zero Developer Leaks) */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {/* 3-bar Hamburger Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-colors shadow-sm"
              title="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 shadow-md shadow-cyan-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold tracking-tight text-white">WorkProof AI</span>
                  <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/20 uppercase">
                    {currentUser.role === 'general_contractor'
                      ? 'Contractor Portal'
                      : currentUser.role === 'project_owner'
                      ? 'Client Portal'
                      : 'Auditor Portal'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Cryptographic Milestone Verification &amp; AI Field Co-Pilot
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadJobsFromBackend}
              className={`p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors ${
                isSyncing ? 'animate-spin' : ''
              }`}
              title="Refresh Workspace Data"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>

            {/* AI Vision Quick Inspect */}
            {activeJob?.milestones?.[0] && (
              <button
                onClick={() => handleOpenAIInspection(activeJob.milestones[0])}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors shadow-sm"
                title="Launch AI Finish & Sheen Inspector"
              >
                <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                <span>AI Vision Inspect</span>
              </button>
            )}

            {/* Alexa+ Voice Punch */}
            <button
              onClick={() => setIsVoicePunchOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors shadow-sm"
              title="Open Hands-Free Voice Punch List"
            >
              <Mic className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Voice Punch</span>
            </button>

            {/* Push Notifications Bell */}
            <button
              onClick={() => setIsOneSignalOpen(true)}
              className="relative inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:text-white transition-colors shadow-sm"
              title="Push Notifications"
            >
              <Bell className="h-3.5 w-3.5 text-rose-400" />
              {oneSignalCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-black text-white">
                  {oneSignalCount}
                </span>
              )}
            </button>

            {/* Pro Contractor Button */}
            <button
              onClick={() => setIsPaywallOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 shadow-sm hover:bg-amber-500/20 transition-colors"
            >
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">
                {rcCustomer.entitlements.pro ? 'PRO CONTRACTOR' : 'UPGRADE TO PRO'}
              </span>
            </button>

            {/* User Profile Pill */}
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                {currentUser?.full_name ? currentUser.full_name[0].toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-semibold text-slate-200">{currentUser?.full_name}</span>
            </div>

            {/* User Logout */}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        {/* Reddit Field Grounding Banner */}
        <RedditContractorBanner />

        {/* Empty Workspace State (e.g. for newly registered users with 0 jobs) */}
        {!activeJob ? (
          <div className="my-12 rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center max-w-xl mx-auto">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
              <HardHat className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Welcome, {currentUser.full_name}!</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Your private workspace is clean and isolated. No other contractor or client can view your projects or milestones.
            </p>
            <button
              onClick={handleOpenAddJob}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 px-6 py-3 text-xs font-extrabold text-slate-950 hover:opacity-95 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Project File</span>
            </button>
          </div>
        ) : (
          <>
            {/* Job Header Strip (Zero horizontal scroll tabs; navigation is via Hamburger Drawer) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Job File:</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300 font-mono">
                    {activeJob.category}
                  </span>
                  <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-300 font-mono">
                    ID: {activeJob.id}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h1 className="text-xl font-extrabold text-white sm:text-2xl">{activeJob.title}</h1>
                  {currentUser.role !== 'project_owner' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleOpenEditJob}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                        title="Edit Project Details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(activeJob.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                    {activeJob.locationAddress}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Client: {activeJob.clientName} ({activeJob.clientPhone || 'No Phone'})
                  </span>
                </div>
              </div>

              {/* Actions Right */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <Menu className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Switch Projects ({jobs.length})</span>
                </button>

                {currentUser.role !== 'project_owner' && (
                  <button
                    onClick={handleOpenAddJob}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Project</span>
                  </button>
                )}
              </div>
            </div>

            {/* KPI Metrics Dashboard Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-6">
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
                <div className="text-xs font-semibold text-slate-400">Total Contract Value</div>
                <div className="mt-1 text-2xl font-extrabold text-white">
                  {activeJob.currency === 'USD' ? '$' : '₹'}
                  {activeJob.totalAmount.toLocaleString()}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
                <div className="text-xs font-semibold text-slate-400">Milestones Progress</div>
                <div className="mt-1 text-2xl font-extrabold text-cyan-400">
                  {signedMilestones} / {totalMilestones} Signed
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
                <div className="text-xs font-semibold text-slate-400">Dispute Shield Ratio</div>
                <div className="mt-1 text-2xl font-extrabold text-emerald-400">100% Tamper-Proof</div>
              </div>

              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
                <div className="text-xs font-semibold text-slate-400">Payment Security</div>
                <div className="mt-1 text-2xl font-extrabold text-amber-400">Instant Draw</div>
              </div>
            </div>

            {/* Milestone Cards List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Milestone Verification &amp; Sign-Off Cards</h2>
                  <span className="text-xs text-slate-400">Real-time before/after proof &amp; client finger signing</span>
                </div>

                {currentUser.role !== 'project_owner' && (
                  <button
                    onClick={handleOpenAddMilestone}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/20"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Stage</span>
                  </button>
                )}
              </div>

              {activeJob.milestones?.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400">
                  <Layers className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                  <p className="text-sm font-semibold text-white">No milestone stages attached to this project yet.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Click &ldquo;+ Add Stage&rdquo; above to define milestone deliverables and draw amounts.
                  </p>
                </div>
              ) : (
                activeJob.milestones?.map((m, idx) => {
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
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-white">{m.title}</h3>
                              {currentUser.role !== 'project_owner' && (
                                <>
                                  <button
                                    onClick={() => handleOpenEditMilestone(m)}
                                    className="p-1 text-slate-500 hover:text-cyan-400 transition-colors"
                                    title="Edit Stage"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMilestone(m.id)}
                                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                    title="Delete Stage"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{m.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-lg font-extrabold text-white">
                            {activeJob.currency === 'USD' ? '$' : '₹'}
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
                                <span>{m.status === 'paid' ? 'PAID & ARCHIVED' : 'VERIFIED SIGNED'}</span>
                              </>
                            ) : m.status === 'completed' ? (
                              <>
                                <Clock className="h-3.5 w-3.5" />
                                <span>AWAITING SIGNATURE</span>
                              </>
                            ) : hasBefore ? (
                              <>
                                <Camera className="h-3.5 w-3.5" />
                                <span>BEFORE CAPTURED</span>
                              </>
                            ) : (
                              <span>PENDING WORK</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Middle Photo & Comparison Slider Viewport */}
                      <div className="py-4">
                        {hasBoth ? (
                          <div className="rounded-xl overflow-hidden border border-slate-800">
                            <BeforeAfterSlider
                              beforeUrl={m.beforePhotoUrl!}
                              afterUrl={m.afterPhotoUrl!}
                              beforeLabel={m.beforeTimestamp ? `BEFORE (${m.beforeTimestamp.slice(0, 10)})` : 'BEFORE'}
                              afterLabel={m.afterTimestamp ? `AFTER (${m.afterTimestamp.slice(0, 10)})` : 'AFTER (ALIGNED)'}
                            />
                          </div>
                        ) : hasBefore ? (
                          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-3">
                            <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
                              <span>Before Condition Photo</span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {m.beforeTimestamp ? m.beforeTimestamp.slice(0, 10) : ''}
                              </span>
                            </div>
                            <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-800">
                              <img
                                src={m.beforePhotoUrl}
                                alt="Before condition"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/60 p-6 text-center text-xs text-slate-500">
                            No photo proof captured yet. Use the Ghost Camera below to lock the before angle.
                          </div>
                        )}
                      </div>

                      {/* Bottom Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                        {/* Left Proof Details & AI Inspection Trigger */}
                        <div className="flex items-center gap-2">
                          {m.sha256Hash && (
                            <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/20">
                              SHA-256: {m.sha256Hash.slice(0, 16)}...
                            </span>
                          )}

                          {/* AI Inspection Button */}
                          <button
                            onClick={() => handleOpenAIInspection(m)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors shadow-sm"
                            title="Inspect Surface Sheen and Defect Alignment with AI"
                          >
                            <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                            <span>AI Vision Inspect</span>
                          </button>
                        </div>

                        {/* Right Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Ghost Camera capture triggers */}
                          {currentUser.role !== 'project_owner' && (
                            <>
                              {!hasBefore && (
                                <button
                                  onClick={() => handleOpenGhostCamera(m.id, 'before')}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                                >
                                  <Camera className="h-3.5 w-3.5 text-cyan-400" />
                                  <span>Snap Before Condition</span>
                                </button>
                              )}

                              {hasBefore && !m.afterPhotoUrl && (
                                <button
                                  onClick={() => handleOpenGhostCamera(m.id, 'after')}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors shadow-sm"
                                >
                                  <Camera className="h-3.5 w-3.5" />
                                  <span>Ghost-Aligned After Shot</span>
                                </button>
                              )}
                            </>
                          )}

                          {/* Sign on glass button */}
                          {isCompleted && !isSigned && (
                            <button
                              onClick={() => handleOpenSignModal(m.id)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-3.5 py-1.5 text-xs font-extrabold text-slate-950 shadow-md shadow-emerald-500/20 hover:brightness-110 transition-all"
                            >
                              <PenTool className="h-3.5 w-3.5" />
                              <span>Client Sign On Glass</span>
                            </button>
                          )}

                          {/* Instant payout settlement */}
                          {isSigned && m.status !== 'paid' && currentUser.role !== 'project_owner' && (
                            <button
                              onClick={() => handleOpenPayment(m.id)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-sm shadow-amber-500/20"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              <span>Instant Payout Settlement</span>
                            </button>
                          )}

                          {/* Download PDF Proof Certificate */}
                          {isSigned && (
                            <button
                              onClick={() => handleDownloadCertificate(m)}
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                              title="Download Court-Admissible Proof Certificate"
                            >
                              <Download className="h-3.5 w-3.5 text-cyan-400" />
                              <span className="hidden sm:inline">Court Proof PDF</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </main>

      {/* Lazy Modals Render with Suspense */}
      <Suspense fallback={null}>
        {isCameraOpen && (
          <GhostCameraModal
            isOpen={isCameraOpen}
            mode={cameraMode}
            referenceBeforeUrl={cameraMode === 'after' ? activeMilestone?.beforePhotoUrl : undefined}
            onClose={() => setIsCameraOpen(false)}
            onCapture={handleCapturePhoto}
          />
        )}

        {isSignModalOpen && activeMilestone && (
          <SignaturePadModal
            isOpen={isSignModalOpen}
            clientName={activeJob?.clientName || 'Client'}
            onClose={() => setIsSignModalOpen(false)}
            onSave={handleSaveSignature}
          />
        )}

        {isAIModalOpen && selectedMilestoneForAI && (
          <AIInspectionModal
            isOpen={isAIModalOpen}
            milestone={selectedMilestoneForAI}
            jobCategory={activeJob?.category}
            onClose={() => setIsAIModalOpen(false)}
          />
        )}

        {isPaywallOpen && (
          <RevenueCatPaywallModal
            isOpen={isPaywallOpen}
            onClose={() => setIsPaywallOpen(false)}
            onUpgradeSuccess={() => {
              setRcCustomer((prev) => ({
                ...prev,
                entitlements: { pro: true },
              }));
              setIsPaywallOpen(false);
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }}
          />
        )}

        {isPaymentOpen && activeMilestone && (
          <PaymentModal
            isOpen={isPaymentOpen}
            job={activeJob}
            milestone={activeMilestone}
            onClose={() => setIsPaymentOpen(false)}
            onMarkPaid={handleMarkPaid}
          />
        )}

        {isVoicePunchOpen && (
          <VoicePunchListDrawer
            isOpen={isVoicePunchOpen}
            onClose={() => setIsVoicePunchOpen(false)}
          />
        )}

        {isOneSignalOpen && (
          <OneSignalNotificationDrawer
            isOpen={isOneSignalOpen}
            onClose={() => {
              setIsOneSignalOpen(false);
              loadJobsFromBackend();
            }}
          />
        )}

        {isCustomerCenterOpen && (
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
        )}

        {isJobModalOpen && (
          <JobModal
            isOpen={isJobModalOpen}
            mode={jobModalMode}
            initialJob={jobModalMode === 'edit' ? activeJob : null}
            onClose={() => setIsJobModalOpen(false)}
            onSaved={handleJobSaved}
          />
        )}

        {isMilestoneModalOpen && (
          <MilestoneModal
            isOpen={isMilestoneModalOpen}
            mode={milestoneModalMode}
            jobId={activeJob.id}
            currency={activeJob.currency}
            initialMilestone={selectedMilestoneForEdit}
            onClose={() => setIsMilestoneModalOpen(false)}
            onSaved={handleMilestoneSaved}
          />
        )}
      </Suspense>
    </div>
  );
}

export default App;
