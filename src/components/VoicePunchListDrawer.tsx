import React, { useState, useEffect } from 'react';
import { Mic, CheckCircle2, Volume2, X, Send, Trash2 } from 'lucide-react';
import { punchItemSchema } from '../schemas/formSchemas';
import { workproofApi } from '../api/workproofApi';

interface PunchItem {
  id: string;
  task: string;
  trade: string;
  priority: string;
  status: 'pending' | 'completed';
  logged_via: string;
  timestamp: string;
}

interface VoicePunchListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoicePunchListDrawer: React.FC<VoicePunchListDrawerProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<PunchItem[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [customVoiceInput, setCustomVoiceInput] = useState<string>('');
  const [lastAlexaResponse, setLastAlexaResponse] = useState<string>('Ready for voice commands. Say "Alexa, add punch item..."');
  const [tradeFilter, setTradeFilter] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchItems = async () => {
    try {
      const data = await workproofApi.fetchPunchItems();
      if (Array.isArray(data)) {
        setItems(
          data.map((d: any) => ({
            id: d.id || d.punch_id,
            task: d.task || d.title,
            trade: d.trade || 'General Construction',
            priority: d.priority || 'Medium',
            status: d.status?.toLowerCase() === 'completed' || d.status?.toLowerCase() === 'resolved' ? 'completed' : 'pending',
            logged_via: d.logged_via || 'Alexa+ Voice',
            timestamp: d.timestamp || d.created_at || new Date().toISOString()
          }))
        );
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchItems();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulateAlexaVoice = async (task: string, trade: string, priority: string) => {
    setLoading(true);
    setIsListening(true);
    setLastAlexaResponse(`Processing voice input: "${task}"...`);

    try {
      const apiBase = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8003';
      const res = await fetch(`${apiBase}/api/alexa/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: 'AddPunchListItemIntent',
          slots: { task, trade, priority }
        })
      });

      if (res.ok) {
        const result = await res.json();
        setLastAlexaResponse(result.speech_output || `Added "${task}" via Alexa+ Co-Pilot.`);
        await fetchItems();
      } else {
        // Direct API create
        await workproofApi.addPunchItem({ task, trade, priority });
        setLastAlexaResponse(`Added punch item: "${task}". Logged to SQLite ledger.`);
        await fetchItems();
      }
    } catch {
      try {
        await workproofApi.addPunchItem({ task, trade, priority });
        await fetchItems();
        setLastAlexaResponse(`Added punch item: "${task}". Logged to SQLite ledger.`);
      } catch {
        const newItem: PunchItem = {
          id: `pl-${Date.now().toString().slice(-4)}`,
          task,
          trade,
          priority,
          status: 'pending',
          logged_via: 'Alexa+ Voice',
          timestamp: new Date().toISOString()
        };
        setItems((prev) => [newItem, ...prev]);
        setLastAlexaResponse(`Added punch item: '${task}' (Offline Buffer).`);
      }
    } finally {
      setIsListening(false);
      setLoading(false);
    }
  };

  const handleToggleItemStatus = async (item: PunchItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = item.status === 'pending' ? 'completed' : 'pending';
    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
    );
    try {
      await workproofApi.updatePunchItem(item.id, { status: newStatus });
    } catch {
      // Revert if error
      await fetchItems();
    }
  };

  const handleDeleteItem = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    try {
      await workproofApi.deletePunchItem(itemId);
    } catch {
      await fetchItems();
    }
  };

  const filteredItems = items.filter((i) => (tradeFilter === 'All' ? true : i.trade.includes(tradeFilter)));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex h-full w-full max-w-md flex-col bg-slate-900 border-l border-slate-800 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Amazon Alexa+ Voice Punch-List</h3>
                <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-400">
                  SQLITE WAL PERSISTED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Contractor field dictation without glove removal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alexa Status & Live Audio HUD */}
        <div className="border-b border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Volume2 className="h-4 w-4 text-cyan-400" />
              <span>Alexa Co-Pilot Speech State:</span>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isListening
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isListening ? 'VOICE LISTENING...' : 'ALEXA STANDBY'}
            </span>
          </div>

          <div className="mt-2.5 rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs text-slate-200">
            <p className="italic font-mono text-[11px] text-cyan-300">"{lastAlexaResponse}"</p>
          </div>

          {/* Preset Voice Command Prompts */}
          <div className="mt-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Simulate Hands-Free Voice Commands:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { task: 'Touch up baseboard trim on south wall', trade: 'Carpentry', priority: 'Medium' },
                { task: 'Seal water supply line behind dishwasher', trade: 'Plumbing', priority: 'High' },
                { task: 'Verify RCC anchor bolt torque on solar rack', trade: 'Solar EPC', priority: 'High' },
                { task: 'Polish quartz counter seam with diamond pad', trade: 'Masonry', priority: 'Low' },
              ].map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSimulateAlexaVoice(cmd.task, cmd.trade, cmd.priority)}
                  disabled={loading}
                  className="rounded-lg bg-slate-800/90 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/40 px-2 py-1 text-[11px] text-slate-300 hover:text-cyan-300 transition-all text-left"
                >
                  🗣️ "{cmd.task.slice(0, 28)}..."
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trade Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto px-4 py-2 border-b border-slate-800 text-xs">
          {['All', 'Carpentry', 'Plumbing', 'Electrical', 'Solar', 'Masonry'].map((t) => (
            <button
              key={t}
              onClick={() => setTradeFilter(t)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                tradeFilter === t
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Punch Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Recorded Items ({filteredItems.length})</span>
            <span className="text-[11px] text-amber-400">
              {filteredItems.filter((i) => i.status === 'pending').length} Blocking Retainage
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No punch items recorded yet. Use voice command or type below to add.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border p-3 transition-all ${
                  item.status === 'completed'
                    ? 'bg-slate-950/60 border-emerald-500/30 opacity-75'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 flex-1">
                    <button
                      onClick={(e) => handleToggleItemStatus(item, e)}
                      className="mt-0.5 shrink-0 focus:outline-none"
                      title={item.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                    >
                      {item.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-slate-600 hover:border-cyan-400" />
                      )}
                    </button>
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          item.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {item.task}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-cyan-300 font-medium">
                          {item.trade}
                        </span>
                        <span>Logged via {item.logged_via}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        item.priority === 'High' || item.priority === 'Critical'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.priority}
                    </span>
                    <button
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      className="rounded p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Custom Voice Input */}
        <div className="border-t border-slate-800 p-3 bg-slate-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const validation = punchItemSchema.safeParse({
                task: customVoiceInput.trim(),
                trade: tradeFilter !== 'All' ? tradeFilter : 'General Construction',
                priority: 'Medium'
              });
              if (!validation.success) {
                const issue = validation.error.issues[0];
                setLastAlexaResponse(issue ? `Validation error: ${issue.message}` : 'Please enter valid task');
                return;
              }
              handleSimulateAlexaVoice(validation.data.task, validation.data.trade, validation.data.priority);
              setCustomVoiceInput('');
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={customVoiceInput}
              onChange={(e) => setCustomVoiceInput(e.target.value)}
              placeholder="Or type voice transcription..."
              className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-md disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
