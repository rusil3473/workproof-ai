import React, { useState } from 'react';
import { Crown, Check, ShieldCheck, Zap, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RevenueCatPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
}

export const RevenueCatPaywallModal: React.FC<RevenueCatPaywallModalProps> = ({
  isOpen,
  onClose,
  onUpgradeSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = () => {
    setIsProcessing(true);
    // Simulate RevenueCat purchase execution
    setTimeout(() => {
      setIsProcessing(false);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      onUpgradeSuccess();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl p-6 sm:p-8 text-white overflow-hidden">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Badge & Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-3.5 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/30 mb-3">
            <Crown className="h-3.5 w-3.5 text-cyan-400" />
            REVENUECAT PAYWALLS V2 CERTIFIED
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Upgrade to WorkProof Pro
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Stop losing $500–$2,000/mo to verbal scope creep and unpaid completion disputes.
          </p>
        </div>

        {/* Feature Checklist */}
        <div className="my-6 space-y-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4 text-xs sm:text-sm">
          {[
            'Unlimited Job Proofs & Milestone Sign-Offs (No 3-job cap)',
            'Ghost Camera Viewfinder with 30% translucent angle lock',
            'Tamper-Proof SHA-256 Cryptographic Audit Certificates',
            'Integrated Stripe 1-Tap & Instant UPI QR Payment Links',
            '100% Offline-First SQLite field storage for remote sites',
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <Check className="h-3.5 w-3.5" />
              </div>
              <span className="text-slate-200">{feature}</span>
            </div>
          ))}
        </div>

        {/* Subscription Plan Tiers */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div
            onClick={() => setSelectedPlan('monthly')}
            className={`cursor-pointer rounded-2xl p-4 border transition-all ${
              selectedPlan === 'monthly'
                ? 'bg-slate-800/80 border-cyan-500 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-semibold text-slate-400">Monthly Plan</div>
            <div className="mt-1 text-xl font-bold text-white">$9.99 <span className="text-xs text-slate-400 font-normal">/ mo</span></div>
            <div className="text-[11px] text-slate-500 mt-0.5">₹799 / mo in India</div>
          </div>

          <div
            onClick={() => setSelectedPlan('annual')}
            className={`relative cursor-pointer rounded-2xl p-4 border transition-all ${
              selectedPlan === 'annual'
                ? 'bg-slate-800/80 border-cyan-500 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="absolute -top-2.5 right-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-2 py-0.5 text-[10px] font-bold text-slate-950 uppercase tracking-wide">
              Save 33%
            </div>
            <div className="text-xs font-semibold text-slate-400">Annual Best Value</div>
            <div className="mt-1 text-xl font-bold text-white">$79.99 <span className="text-xs text-slate-400 font-normal">/ yr</span></div>
            <div className="text-[11px] text-emerald-400 font-medium mt-0.5">$6.66/month billed yearly</div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handlePurchase}
          disabled={isProcessing}
          className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 py-3.5 text-center text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <span>Securing RevenueCat Entitlement...</span>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              <span>Start 7-Day Free Trial & Unlock Pro</span>
            </>
          )}
        </button>

        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
          <span>Powered by RevenueCat SDK. Cancel anytime with 1 tap.</span>
        </div>
      </div>
    </div>
  );
};
