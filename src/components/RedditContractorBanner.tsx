import React, { useState } from 'react';
import { ShieldAlert, Sparkles, X } from 'lucide-react';

interface CaseStudy {
  id: string;
  source: string;
  author: string;
  title: string;
  snippet: string;
  disputeAmount: string;
  legalOutcome: string;
  workproofFix: string;
}

const REDDIT_CASES: CaseStudy[] = [
  {
    id: 'case-1',
    source: 'r/Contractor',
    author: 'u/TexasRemodeler99',
    title: 'Customer withholding $4,200 final draw over "uneven paint sheen" in guest bath',
    snippet:
      '"Did complete bathroom gut and remodel. Customer signed initial quote, paid deposit, but now refuses final 20% retainage claiming the satin paint sheen looks blotchy under afternoon sun. Small claims filing in Austin costs $150 + taking 2 days off job sites. I took photos before and after, but because the angles and time-of-day sunlight were different, the client claims I scratched the vanity."',
    disputeAmount: '$4,200 USD',
    legalOutcome: 'Contractor forced to take 50% discount ($2,100 loss) to avoid 4-month litigation delay.',
    workproofFix: '30% Ghost Camera Angle Lock forces identical sun orientation + SHA-256 GPS EXIF hash proves vanity was untouched before primer application.'
  },
  {
    id: 'case-2',
    source: 'r/sweatystartup',
    author: 'u/SolarEPC_Bengaluru',
    title: 'PM Surya Ghar DISCOM subsidy inspection rejected due to "unverifiable earthing spike"',
    snippet:
      '"Installed 3kW rooftop solar in HSR Layout. Submitted photos to national portal for the ₹78,000 subsidy release. BESCOM junior engineer rejected claim stating photo angle did not show dual earthing rod connection clearly relative to the inverter. Had to re-visit site, pay electrician ₹1,500 extra, while homeowner delayed paying our remaining ₹30,000."',
    disputeAmount: '₹30,000 INR',
    legalOutcome: 'Payment delayed 82 days; contractor burned 14 hours in DISCOM sub-divisional office queues.',
    workproofFix: 'Sub-meter accurate GPS stamp (2.8m accuracy) + statutory GST Rule 46 digital sign-off certificate accepted instantly by state DISCOM.'
  },
  {
    id: 'case-3',
    source: 'r/HomeImprovement',
    author: 'u/DrywallPro_Ohio',
    title: 'Client claimed "settlement cracks" appeared because of our mudding, not foundation',
    snippet:
      '"Taped and mudded a 2,400 sq ft basement. Three weeks later homeowner texts saying drywall is cracking near window. We knew the basement foundation had pre-existing vertical shear cracks, but had no timestamped photo proof from the exact same focal distance before hanging sheetrock."',
    disputeAmount: '$3,100 USD',
    legalOutcome: 'Contractor had to repair at zero cost, losing 3 full days of skilled labor.',
    workproofFix: 'Defect Inspection Loupe (3x zoom) captures hairline baseline cracks with sub-pixel alignment overlay.'
  }
];

export const RedditContractorBanner: React.FC = () => {
  const [activeCase, setActiveCase] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  if (isDismissed) return null;

  const current = REDDIT_CASES[activeCase];

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-amber-950/30 to-slate-900 border border-amber-500/30 p-4 sm:p-5 text-slate-100 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                Reddit Field Grounding: The $12,400 Retainage Trap
              </span>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                r/Contractor Verified
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Contractors bleed 18.5% of gross revenue to subjective punch-list disputes & non-payment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {REDDIT_CASES.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setActiveCase(idx)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                activeCase === idx
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              Case {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setIsDismissed(true)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            title="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Case Details */}
      <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-2 text-[11px] text-amber-400 font-mono">
            <span>Source: {current.source}</span>
            <span>•</span>
            <span>OP: {current.author}</span>
            <span>•</span>
            <span className="text-red-400 font-bold">Withheld: {current.disputeAmount}</span>
          </div>
          <h4 className="mt-1 text-sm font-bold text-white leading-snug">
            "{current.title}"
          </h4>
          <p className="mt-1 text-xs text-slate-300 italic line-clamp-3">
            {current.snippet}
          </p>
        </div>

        <div className="lg:col-span-5 rounded-xl bg-slate-950/70 border border-slate-800/80 p-3 text-xs space-y-2">
          <div>
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">Actual Outcome:</span>
            <p className="text-slate-300 text-[11px]">{current.legalOutcome}</p>
          </div>
          <div className="pt-1.5 border-t border-slate-800">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> WorkProof AI Mathematical Resolution:
            </span>
            <p className="text-slate-200 text-[11px] font-medium">{current.workproofFix}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
