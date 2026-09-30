import React, { useState, useEffect } from 'react';
import { X, Briefcase, MapPin, User, Phone, Mail, Check } from 'lucide-react';
import type { Job, CurrencyCode } from '../types';
import { jobContractorSchema } from '../schemas/formSchemas';
import { workproofApi } from '../api/workproofApi';

interface JobModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialJob?: Job | null;
  onClose: () => void;
  onSaved: (job: Job) => void;
}

const CATEGORIES = [
  'Renovation',
  'Solar Rooftop',
  'Electrical',
  'HVAC',
  'Plumbing',
  'Carpentry',
  'Interior Design',
  'Detailing',
  'Cleaning',
];

export const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  mode,
  initialJob,
  onClose,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('Renovation');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [totalAmount, setTotalAmount] = useState<number>(5000);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialJob && mode === 'edit') {
      setTitle(initialJob.title);
      setCategory(initialJob.category);
      setClientName(initialJob.clientName);
      setClientPhone(initialJob.clientPhone || '');
      setClientEmail(initialJob.clientEmail || '');
      setLocationAddress(initialJob.locationAddress || '');
      setCurrency(initialJob.currency || 'USD');
      setTotalAmount(initialJob.totalAmount || 0);
    } else {
      setTitle('');
      setCategory('Renovation');
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setLocationAddress('');
      setCurrency('USD');
      setTotalAmount(4000);
    }
    setErrors({});
  }, [isOpen, initialJob, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = jobContractorSchema.safeParse({
      title,
      category,
      clientName,
      clientPhone,
      clientEmail,
      locationAddress,
      currency,
      totalAmount,
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
      if (mode === 'edit' && initialJob) {
        const updated = await workproofApi.updateJob(initialJob.id, {
          title,
          category: category as any,
          clientName,
          clientPhone,
          clientEmail,
          locationAddress,
          currency,
          totalAmount: Number(totalAmount),
        });
        onSaved(updated);
      } else {
        const created = await workproofApi.createJob({
          title,
          category: category as any,
          clientName,
          clientPhone,
          clientEmail,
          locationAddress,
          currency,
          totalAmount: Number(totalAmount),
          status: 'active',
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
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {mode === 'create' ? 'Create New Job File' : 'Edit Project Details'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'create'
                  ? 'Initialize verified contractor project with SQLite persistence'
                  : `Editing Job ID: ${initialJob?.id}`}
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
            <label className="block text-xs font-semibold text-slate-300">Project Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Commercial HVAC Heat Pump Replacement"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
            {errors.title && <p className="mt-1 text-[11px] text-red-400">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Currency *</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="USD">🇺🇸 USD ($)</option>
                <option value="INR">🇮🇳 INR (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Total Contract Value *</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-xs">
                  {currency === 'USD' ? '$' : '₹'}
                </span>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-7 pr-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              {errors.totalAmount && <p className="mt-1 text-[11px] text-red-400">{errors.totalAmount}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Client Full Name *</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. David Ross"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              {errors.clientName && <p className="mt-1 text-[11px] text-red-400">{errors.clientName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Client Phone *</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Phone className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+1 (512) 555-0100"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              {errors.clientPhone && <p className="mt-1 text-[11px] text-red-400">{errors.clientPhone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Client Email *</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              {errors.clientEmail && <p className="mt-1 text-[11px] text-red-400">{errors.clientEmail}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">Jobsite Physical Address *</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="e.g. 104 Industrial Way, Austin, TX"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            {errors.locationAddress && (
              <p className="mt-1 text-[11px] text-red-400">{errors.locationAddress}</p>
            )}
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 hover:brightness-110 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Project' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
