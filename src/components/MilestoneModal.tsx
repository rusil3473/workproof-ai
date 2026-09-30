import React, { useState, useEffect } from 'react';
import { X, Layers, Check } from 'lucide-react';
import type { Milestone, CurrencyCode } from '../types';
import { milestoneFormSchema } from '../schemas/formSchemas';
import { workproofApi } from '../api/workproofApi';

interface MilestoneModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  jobId: string;
  currency: CurrencyCode;
  initialMilestone?: Milestone | null;
  onClose: () => void;
  onSaved: (milestone: Milestone) => void;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  mode,
  jobId,
  currency,
  initialMilestone,
  onClose,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(1000);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialMilestone && mode === 'edit') {
      setTitle(initialMilestone.title);
      setDescription(initialMilestone.description || '');
      setAmount(initialMilestone.amount || 0);
    } else {
      setTitle('');
      setDescription('');
      setAmount(1000);
    }
    setErrors({});
  }, [isOpen, initialMilestone, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = milestoneFormSchema.safeParse({
      title,
      description,
      amount,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          fieldErrors[String(err.path[0])] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'edit' && initialMilestone) {
        const updated = await workproofApi.updateMilestone(initialMilestone.id, {
          title,
          description,
          amount: Number(amount),
        });
        onSaved(updated);
      } else {
        const created = await workproofApi.addMilestone(jobId, {
          title,
          description,
          amount: Number(amount),
        });
        onSaved(created);
      }
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Operation failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {mode === 'create' ? 'Add Milestone Stage' : 'Edit Milestone Stage'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'create'
                  ? 'Attach an authentic milestone draw stage to the contract'
                  : `Milestone: ${initialMilestone?.title}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errors.form && (
          <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300">Stage Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Stage 2: Inverter Wiring & Grid Sync"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
            {errors.title && <p className="mt-1 text-[11px] text-red-400">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">Draw Amount *</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-xs font-mono">
                {currency === 'USD' ? '$' : '₹'}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-7 pr-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            {errors.amount && <p className="mt-1 text-[11px] text-red-400">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">Detailed Scope Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the tangible physical deliverables required to trigger client inspection..."
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Stage' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
