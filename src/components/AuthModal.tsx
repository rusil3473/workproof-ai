import React, { useState } from 'react';
import { X, Lock, Mail, User, Building2, ShieldCheck, ArrowRight, AlertCircle, HardHat, Home, Search } from 'lucide-react';
import { workproofApi } from '../api/workproofApi';
import type { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  defaultMode?: 'login' | 'register';
  presetEmail?: string;
  onClose: () => void;
  onAuthenticated: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  defaultMode = 'login',
  presetEmail = '',
  onClose,
  onAuthenticated,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState(presetEmail || (defaultMode === 'login' ? 'contractor@apexbuild.com' : ''));
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState(defaultMode === 'register' ? 'John Carter' : '');
  const [company, setCompany] = useState(defaultMode === 'register' ? 'Carter Custom Renovations' : '');
  const [role, setRole] = useState<'general_contractor' | 'project_owner' | 'inspector'>('general_contractor');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (mode === 'login') {
        const session = await workproofApi.login({ email, password });
        onAuthenticated(session.user);
        onClose();
      } else {
        const session = await workproofApi.register({
          email,
          password,
          full_name: fullName,
          role,
          company,
        });
        onAuthenticated(session.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, _demoRole?: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setErrorMessage('');
    setIsLoading(true);
    workproofApi.login({ email: demoEmail, password: 'password123' })
      .then((session) => {
        onAuthenticated(session.user);
        onClose();
      })
      .catch((err) => {
        setErrorMessage(err.message || 'Demo login failed');
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              {mode === 'login' ? 'Sign In to Workspace' : 'Create Contractor Account'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'login'
                ? 'Access your tamper-proof milestone files'
                : 'Zero-leakage, isolated commercial workspace'}
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex rounded-xl bg-slate-950 p-1 mb-5 border border-slate-800">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(''); }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMessage(''); }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              mode === 'register'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. David Vance"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Business Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Apex Builders LLC"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Role</label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="general_contractor">General Contractor / Trade Builder</option>
                  <option value="project_owner">Client / Property Homeowner</option>
                  <option value="inspector">Municipal Building Inspector</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 py-2.5 text-xs font-extrabold text-slate-950 hover:opacity-95 shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create Isolated Account'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Profiles */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
            Instant Demo Access
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('contractor@apexbuild.com', 'general_contractor')}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-800 bg-slate-950 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all text-center"
            >
              <HardHat className="h-4 w-4 text-cyan-400 mb-1" />
              <span className="text-[11px] font-bold text-white">Contractor</span>
              <span className="text-[9px] text-slate-400">Kitchen &amp; Solar</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('client@homeowner.com', 'project_owner')}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/40 hover:bg-slate-800/60 transition-all text-center"
            >
              <Home className="h-4 w-4 text-emerald-400 mb-1" />
              <span className="text-[11px] font-bold text-white">Homeowner</span>
              <span className="text-[9px] text-slate-400">Sarah Jenkins</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('inspector@citycode.gov', 'inspector')}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-800 bg-slate-950 hover:border-indigo-500/40 hover:bg-slate-800/60 transition-all text-center"
            >
              <Search className="h-4 w-4 text-indigo-400 mb-1" />
              <span className="text-[11px] font-bold text-white">Inspector</span>
              <span className="text-[9px] text-slate-400">Code Audit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
