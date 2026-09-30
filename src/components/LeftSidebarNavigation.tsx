import React from 'react';
import {
  X,
  FolderGit2,
  Cpu,
  Mic,
  Crown,
  ShieldCheck,
  Bell,
  LogOut,
  Plus,
} from 'lucide-react';
import type { Job, UserProfile } from '../types';

export type NavTab = 'projects' | 'ai_inspector' | 'voice_punch' | 'billing' | 'dispute_vault' | 'notifications';

interface LeftSidebarNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  jobs: Job[];
  activeJobId: string;
  onSelectJob: (jobId: string) => void;
  onOpenCreateJob: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  unreadPushCount?: number;
  isPro?: boolean;
}

export const LeftSidebarNavigation: React.FC<LeftSidebarNavigationProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  jobs,
  activeJobId,
  onSelectJob,
  onOpenCreateJob,
  currentUser,
  onLogout,
  unreadPushCount = 0,
  isPro = true,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Left Drawer */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-72 sm:w-80 flex-col border-r border-slate-800 bg-slate-950 shadow-2xl transition-transform animate-slideInLeft">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 shadow-md shadow-cyan-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-white">WorkProof AI</span>
              <div className="text-[10px] font-semibold text-cyan-400">ENTERPRISE FIELD CO-PILOT</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Project Selector Section */}
        <div className="border-b border-slate-800/80 p-4 bg-slate-900/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Job File</span>
            {currentUser?.role !== 'project_owner' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCreateJob();
                }}
                className="inline-flex items-center gap-1 rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>New Project</span>
              </button>
            )}
          </div>

          {jobs.length > 0 ? (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {jobs.map((job) => {
                const isSelected = job.id === activeJobId;
                return (
                  <button
                    key={job.id}
                    onClick={() => {
                      onSelectJob(job.id);
                      onSelectTab('projects');
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-all ${
                      isSelected
                        ? 'border border-cyan-500/40 bg-cyan-500/10 font-bold text-cyan-300 shadow-sm'
                        : 'border border-slate-800/60 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="truncate pr-2">{job.title}</span>
                    <span className="shrink-0 text-[10px] font-mono text-slate-400">
                      {job.currency} {job.totalAmount.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-800 p-3 text-center">
              <p className="text-xs text-slate-400 mb-2">No projects created yet.</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenCreateJob();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create First Project</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
            Field Modules
          </div>

          <button
            onClick={() => {
              onSelectTab('projects');
              onClose();
            }}
            className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'projects'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <FolderGit2 className="h-4 w-4 shrink-0 text-cyan-400" />
            <span>Milestones &amp; Sign-Off</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('ai_inspector');
              onClose();
            }}
            className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'ai_inspector'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Cpu className="h-4 w-4 shrink-0 text-emerald-400" />
            <div className="flex-1 flex items-center justify-between">
              <span>AI Vision &amp; Sheen Inspector</span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black text-emerald-300">
                ACTIVE
              </span>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectTab('voice_punch');
              onClose();
            }}
            className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'voice_punch'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Mic className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>Alexa+ Voice Punch List</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('dispute_vault');
              onClose();
            }}
            className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'dispute_vault'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <ShieldCheck className="h-4 w-4 shrink-0 text-cyan-400" />
            <span>Tamper-Proof Legal Vault</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('notifications');
              onClose();
            }}
            className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'notifications'
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 shrink-0 text-rose-400" />
              <span>OneSignal Push Alerts</span>
            </div>
            {unreadPushCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-black text-white">
                {unreadPushCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onSelectTab('billing');
              onClose();
            }}
            className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'billing'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Crown className="h-4 w-4 shrink-0 text-amber-400" />
              <span>RevenueCat &amp; Stripe Billing</span>
            </div>
            {isPro && (
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                PRO
              </span>
            )}
          </button>
        </nav>

        {/* User Account & Sign Out Footer */}
        <div className="border-t border-slate-800/80 p-3 bg-slate-900/40">
          <div className="flex items-center justify-between rounded-xl bg-slate-950 p-2.5 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-cyan-400 font-bold text-xs border border-slate-700">
                {currentUser?.full_name ? currentUser.full_name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser?.full_name || 'Authenticated User'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentUser?.email || 'user@company.com'}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              title="Sign Out of Workspace"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
