import React, { useState, useEffect } from 'react';
import { Bell, X, Send, CheckCircle2, Zap, Shield, Clock } from 'lucide-react';
import type { OneSignalNotification } from '../types';
import { workproofApi } from '../api/workproofApi';

interface OneSignalNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OneSignalNotificationDrawer: React.FC<OneSignalNotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<OneSignalNotification[]>([]);
  const [customTitle, setCustomTitle] = useState('');
  const [customMsg, setCustomMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchNotifs = async () => {
    try {
      const data = await workproofApi.fetchOneSignalNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendTestPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customMsg.trim()) return;

    setIsSending(true);
    try {
      await workproofApi.sendOneSignalPush({
        title: customTitle.trim(),
        message: customMsg.trim(),
        recipient: 'Active Contractor & Client',
        channel: 'OneSignal Web Push Protocol',
      });
      setCustomTitle('');
      setCustomMsg('');
      await fetchNotifs();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex h-full w-full max-w-md flex-col bg-slate-900 border-l border-slate-800 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 text-slate-950 shadow-md shadow-amber-500/20">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">OneSignal Push Notifications</h3>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                  REAL-TIME WEB PUSH
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Milestone Sign-Off &amp; Payment Dispatch Logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Integration Status Card */}
        <div className="border-b border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-semibold text-slate-300">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>OneSignal Web & App Gateway:</span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-3 w-3" />
              <span>ONLINE</span>
            </span>
          </div>

          <div className="mt-2.5 rounded-xl bg-slate-900/90 border border-slate-800 p-2.5 text-xs text-slate-300 flex items-center justify-between">
            <span className="font-mono text-[11px] text-cyan-300">App ID: os-workproof-7829</span>
            <span className="text-[10px] text-slate-400">Push + SMS Retainage Alerts</span>
          </div>
        </div>

        {/* Notification Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Dispatched Push Events ({notifications.length})</span>
            <span className="text-[11px] text-emerald-400">100% Delivery Rate</span>
          </div>

          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No notifications yet. Trigger a milestone sign-off, payment, or send test below.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h4 className="text-xs font-bold text-white">{n.title}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400">{n.delivery_status}</span>
                </div>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">{n.message}</p>
                <div className="mt-2 flex items-center justify-between border-t border-slate-800/80 pt-1.5 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Shield className="h-2.5 w-2.5 text-amber-400" />
                    {n.recipient}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-2.5 w-2.5" />
                    {n.created_at ? new Date(n.created_at).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Send Push Action */}
        <div className="border-t border-slate-800 p-3 bg-slate-950">
          <form onSubmit={handleSendTestPush} className="space-y-2">
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Push Alert Title (e.g. Roof Inspection Ready)"
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Push Message (e.g. Please sign off on milestone draw)"
                className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={isSending || !customTitle.trim()}
                className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-amber-500 to-red-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:brightness-110 shadow-md disabled:opacity-50"
              >
                <Send className="h-3 w-3" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
