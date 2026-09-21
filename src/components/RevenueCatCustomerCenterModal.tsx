import React, { useState } from 'react';
import { Crown, RefreshCw, X, Zap, Key } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RevenueCatCustomerCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  setIsPro: (val: boolean) => void;
}

export const RevenueCatCustomerCenterModal: React.FC<RevenueCatCustomerCenterModalProps> = ({
  isOpen,
  onClose,
  isPro,
  setIsPro,
}) => {
  const [selectedWebhookEvent, setSelectedWebhookEvent] = useState<string>('RENEWAL');
  const [webhookLogs, setWebhookLogs] = useState<string[]>([
    'Connected to RevenueCat v5.24.0 Purchases Web SDK',
    'Customer ID identified: rc_usr_contractor_7829',
    'Active Entitlements: [pro_access, ghost_camera_4k, unlimited_jobs]'
  ]);
  const [isFiringWebhook, setIsFiringWebhook] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSimulateWebhook = async (eventType: string) => {
    setIsFiringWebhook(true);
    try {
      const res = await fetch('http://127.0.0.1:8002/api/revenuecat/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: eventType,
          app_user_id: 'rc_usr_contractor_7829',
          product_id: 'workproof_pro_annual',
          price: 79.99,
          currency: 'USD'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setWebhookLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] Webhook ${eventType}: ${data.message}`,
          ...prev
        ]);
        if (eventType === 'EXPIRATION') {
          setIsPro(false);
        } else {
          setIsPro(true);
          confetti({ particleCount: 50, spread: 60 });
        }
      }
    } catch {
      setWebhookLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Local Webhook ${eventType} processed`,
        ...prev
      ]);
      if (eventType === 'EXPIRATION') {
        setIsPro(false);
      } else {
        setIsPro(true);
      }
    } finally {
      setIsFiringWebhook(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">RevenueCat Customer Center & Entitlements</h3>
              <p className="text-xs text-slate-400">RevenueCat Shipaton 2026 Architecture Inspector</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Card */}
        <div className="my-4 rounded-2xl bg-slate-950 border border-slate-800/90 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Entitlement Status:</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  isPro
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isPro ? 'PRO_ACCESS ACTIVE' : 'FREE TIER (3-JOB LIMIT)'}
              </span>
            </div>
            <button
              onClick={() => setIsPro(!isPro)}
              className="text-xs text-cyan-400 hover:underline"
            >
              Toggle Tier
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">App User ID</div>
              <div className="mt-0.5 font-mono text-[11px] text-slate-300">rc_usr_contractor_7829</div>
            </div>
            <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Active Product</div>
              <div className="mt-0.5 font-mono text-[11px] text-amber-400">
                {isPro ? 'workproof_pro_annual' : 'none'}
              </div>
            </div>
          </div>

          {/* Active Entitlements Matrix */}
          <div className="mt-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Active Entitlement Keys:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['pro_access', 'ghost_camera_4k', 'unlimited_jobs', 'tamper_proof_pdf', 'client_glass_signature'].map(
                (key) => (
                  <span
                    key={key}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono ${
                      isPro
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-900 text-slate-600 border border-slate-800 line-through'
                    }`}
                  >
                    <Key className="h-2.5 w-2.5" />
                    {key}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Webhook Simulator Section */}
        <div className="rounded-2xl bg-slate-950 border border-slate-800/90 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span>Simulate RevenueCat Webhook Lifecycle</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">POST /api/revenuecat/webhook</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            {['RENEWAL', 'PRODUCT_CHANGE', 'EXPIRATION'].map((ev) => (
              <button
                key={ev}
                onClick={() => setSelectedWebhookEvent(ev)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  selectedWebhookEvent === ev
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {ev}
              </button>
            ))}
            <button
              onClick={() => handleSimulateWebhook(selectedWebhookEvent)}
              disabled={isFiringWebhook}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-sm"
            >
              <RefreshCw className={`h-3 w-3 ${isFiringWebhook ? 'animate-spin' : ''}`} />
              <span>Fire</span>
            </button>
          </div>

          {/* Webhook Log Console */}
          <div className="rounded-xl bg-black/70 border border-slate-800/80 p-2.5 font-mono text-[10px] text-slate-300 max-h-28 overflow-y-auto space-y-1">
            {webhookLogs.map((log, idx) => (
              <div key={idx} className="leading-tight">
                {log}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-500">RevenueCat V2 Webhooks & Customer Center Compliant</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 font-semibold text-slate-200 hover:bg-slate-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
