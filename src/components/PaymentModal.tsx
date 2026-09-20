import React from 'react';
import { CreditCard, QrCode, X, ExternalLink, CheckCircle2 } from 'lucide-react';
import type { Milestone, Job } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  job: Job;
  milestone: Milestone;
  onClose: () => void;
  onMarkPaid: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  job,
  milestone,
  onClose,
  onMarkPaid,
}) => {
  if (!isOpen) return null;

  const isIndia = job.currency === 'INR';
  const amountFormatted = `${isIndia ? 'Rs. ' : '$'}${milestone.amount.toLocaleString()} ${job.currency}`;

  // Synthetic UPI Intent URL for Indian merchants
  const upiUrl = `upi://pay?pa=workproof.pay@icici&pn=${encodeURIComponent(job.clientName)}&am=${milestone.amount}&cu=INR&tn=${encodeURIComponent('Milestone-' + milestone.id)}`;

  // Synthetic Stripe Payment Link for US/Global
  const stripeUrl = `https://buy.stripe.com/test_workproof_${milestone.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Instant Milestone Payment</h3>
              <p className="text-xs text-slate-400">Zero-fee direct disbursement to service provider</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="my-5 rounded-xl bg-slate-950 border border-slate-800 p-4 text-center">
          <div className="text-xs text-slate-400">Total Milestone Amount Due</div>
          <div className="mt-1 text-3xl font-extrabold text-emerald-400">{amountFormatted}</div>
          <div className="mt-1 text-xs text-slate-500">Milestone: {milestone.title}</div>
        </div>

        {/* Dual Rails Tab Content */}
        {isIndia ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center rounded-xl bg-white p-4 text-slate-950 shadow-md">
              <QrCode className="h-32 w-32 text-slate-900" />
              <p className="mt-2 text-xs font-bold text-slate-700">Scan with Google Pay, PhonePe, or Paytm</p>
              <span className="text-[10px] text-slate-500 font-mono">UPI ID: workproof.pay@icici</span>
            </div>

            <a
              href={upiUrl}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <span>Pay with Installed UPI App</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <a
              href={stripeUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 py-3 text-xs font-bold text-slate-950 hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20"
            >
              <CreditCard className="h-4 w-4" />
              <span>Pay with Apple Pay, Google Pay or Card</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <p className="text-center text-[11px] text-slate-400">
              Powered by Stripe. Funds deposit directly to contractor account.
            </p>
          </div>
        )}

        {/* Manual Mark Paid Override */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onMarkPaid();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-slate-700 hover:text-emerald-300 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark as Paid (Cash / Bank)
          </button>
        </div>
      </div>
    </div>
  );
};
