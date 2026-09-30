import React from 'react';
import {
  ShieldCheck,
  Camera,
  Mic,
  Cpu,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Award
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (defaultMode?: 'login' | 'register', presetEmail?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">WorkProof AI</span>
              <span className="hidden sm:inline-block ml-2 rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
                FIELD CO-PILOT
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#comparison" className="hover:text-cyan-400 transition-colors">Why WorkProof</a>
            <a href="#ai-engine" className="hover:text-cyan-400 transition-colors">AI Vision Engine</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth('login')}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 hover:border-slate-500 hover:text-white transition-all shadow-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 px-4 py-2 text-xs font-extrabold text-slate-950 hover:opacity-95 shadow-md shadow-cyan-500/20 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950/0 to-transparent pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-bold text-cyan-300 mb-6 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Zero-Retainage Disputes for Modern Contractors</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-tight">
              Tamper-Proof Construction Proof &amp; <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">AI Field Co-Pilot</span>
            </h1>

            <p className="mt-6 text-base text-slate-300 sm:text-lg leading-relaxed">
              Contractors lose up to <strong>18.5% of gross revenue</strong> on subjective punch-list withholding and uneven finish disputes.
              WorkProof AI pairs <strong>30° Ghost Camera Angle Lock</strong>, <strong>Computer Vision Sheen Analysis</strong>, and <strong>Client Glass Sign-off</strong> with instant Stripe settlement.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onOpenAuth('register')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 px-7 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all"
              >
                <span>Start Free Contractor Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => onOpenAuth('login', 'contractor@apexbuild.com')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-bold text-slate-200 hover:border-slate-500 hover:text-white transition-all"
              >
                <Award className="h-4 w-4 text-cyan-400" />
                <span>Explore Live Contractor Demo</span>
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                No Credit Card Required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                FRCE Rule 901 Court Admissible
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Instant Stripe &amp; UPI Settlements
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* The Reddit Field Grounding Problem Strip */}
      <section className="py-12 bg-slate-900/60 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                  REAL CONTRACTOR CASE STUDY: THE $4,200 RETAINAGE TRAP
                </span>
                <h3 className="text-xl font-bold text-white">
                  &ldquo;Customer withholding $4,200 final draw claiming satin paint sheen looks uneven under afternoon sun&rdquo;
                </h3>
                <p className="text-xs text-slate-300">
                  Source: <em>r/Contractor verified field dispute</em>. The homeowner withheld final draw over subjective lighting variation. The contractor took a $2,100 haircut because their photos were taken at different angles and times of day.
                </p>
              </div>

              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/40 p-4 min-w-[280px]">
                <div className="text-xs font-bold text-cyan-400 mb-1">WORKPROOF MATHEMATICAL RESOLUTION</div>
                <div className="text-sm font-semibold text-white">
                  Ghost Camera 30° alignment lock + CIE D65 specular sheen analysis proves finish is within 1.3 GU variance.
                </div>
                <div className="mt-2 text-[11px] font-mono text-emerald-400 font-bold">
                  ✓ $4,200 Disbursed 100% in Full
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core AI Engines Showcase */}
      <section id="ai-engine" className="py-20 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Why WorkProof AI Outperforms</span>
            <h2 className="text-3xl font-extrabold text-white mt-2 sm:text-4xl">
              Real Artificial Intelligence on the Job Site
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Not just an image gallery. WorkProof uses automated computer vision and natural language processing to defend your margin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-cyan-500/40 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-5">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">30° Ghost Camera Angle Lock</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Overlays semi-transparent before photo contours on the live camera viewport. Prevents angle distortion so sunlight orientation and perspective match 1:1.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-emerald-500/40 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-5">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Visual Defect &amp; Sheen Inspector</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Algorithmic Computer Vision analyzes surface finish uniformity, edge plumbness, and micro-boundaries according to ASTM C1193 building standards.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-indigo-500/40 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-5">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Alexa+ Hands-Free Voice Punch List</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Speak punch items naturally wearing gloves or working on ladders. AI parses spoken notes into structured trade categories and priority severity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix vs Competitors */}
      <section id="comparison" className="py-20 border-b border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Competitive Benchmark</span>
            <h2 className="text-3xl font-extrabold text-white mt-2 sm:text-4xl">
              WorkProof AI vs Legacy Contractor Software
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Why contractors are replacing traditional tools with cryptographic proof verification.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="p-4 sm:p-5 font-bold text-slate-300">Capability</th>
                  <th className="p-4 sm:p-5 font-extrabold text-cyan-400 bg-cyan-950/20">WorkProof AI</th>
                  <th className="p-4 sm:p-5 font-semibold text-slate-400">Procore / Buildertrend</th>
                  <th className="p-4 sm:p-5 font-semibold text-slate-400">Jobber / Spreadsheets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Ghost Camera Angle Lock</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-cyan-950/10 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> 30° Overlap Lock
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-red-500/70" /> Unaligned raw photos
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500">None</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">AI Finish &amp; Sheen Inspector</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-cyan-950/10 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> ASTM &amp; Specular Analysis
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-red-500/70" /> Subjective client eye
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500">None</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Cryptographic Legal Proof</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-cyan-950/10 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> SHA-256 GPS EXIF Lock
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-red-500/70" /> Modifiable JPEG storage
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500">None</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Hands-Free Site Voice Punch</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-cyan-950/10 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Alexa+ NLP Classifier
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-red-500/70" /> Manual touchscreen typing
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500">Pen &amp; Paper</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Instant Milestone Settlement</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-cyan-950/10 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Stripe &amp; UPI on Glass
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-red-500/70" /> 30-90 Day ACH Delay
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500">Paper Check</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Transparent Monetization</span>
            <h2 className="text-3xl font-extrabold text-white mt-2 sm:text-4xl">
              Predictable Plans Built for Contractors
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Scale with unlimited ghost alignment, automated lien waivers, and AI visual verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between">
              <div>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-300">STARTER</span>
                <h3 className="text-xl font-bold text-white mt-3">Free Tier</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">$0</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Perfect for single remodelers and client review portals.</p>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">✓ Up to 2 Active Projects</li>
                  <li className="flex items-center gap-2">✓ Ghost Camera Angle Lock</li>
                  <li className="flex items-center gap-2">✓ Client Finger Glass Signatures</li>
                  <li className="flex items-center gap-2">✓ OneSignal Push Alerts</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth('register')}
                className="mt-8 w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro Tier (Featured) */}
            <div className="relative rounded-2xl border-2 border-cyan-500 bg-slate-900 p-6 flex flex-col justify-between shadow-xl shadow-cyan-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-3 py-0.5 text-[10px] font-extrabold text-slate-950 uppercase tracking-wider">
                MOST POPULAR
              </div>
              <div>
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-xs font-bold text-cyan-300">PRO CONTRACTOR</span>
                <h3 className="text-xl font-bold text-white mt-3">Pro Contractor</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">$49</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Unlimited protection against retainage and finish disputes.</p>
                <ul className="mt-6 space-y-3 text-xs text-slate-200 font-medium">
                  <li className="flex items-center gap-2">✓ Unlimited Active Projects</li>
                  <li className="flex items-center gap-2">✓ AI Computer Vision Sheen &amp; Defect Analysis</li>
                  <li className="flex items-center gap-2">✓ Alexa+ Hands-Free Voice Punch List</li>
                  <li className="flex items-center gap-2">✓ Automated Statutory Lien Waivers</li>
                  <li className="flex items-center gap-2">✓ Instant Stripe &amp; UPI Payout Integration</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth('register')}
                className="mt-8 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 py-2.5 text-xs font-extrabold text-slate-950 hover:opacity-95 shadow-md shadow-cyan-500/20 transition-all"
              >
                Start 14-Day Pro Trial
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between">
              <div>
                <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300">ENTERPRISE</span>
                <h3 className="text-xl font-bold text-white mt-3">Enterprise Fleet</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">$199</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Multi-crew contractors, general builders, and municipal auditors.</p>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">✓ Unlimited Crews &amp; Subcontractors</li>
                  <li className="flex items-center gap-2">✓ B2B ERP &amp; QuickBooks Integration</li>
                  <li className="flex items-center gap-2">✓ Custom ASTM Sheen Spec Profiles</li>
                  <li className="flex items-center gap-2">✓ Dedicated Court Expert Testimony Pack</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth('login', 'inspector@citycode.gov')}
                className="mt-8 w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Inspect Enterprise Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span className="text-slate-400 font-semibold">WorkProof AI Enterprise Systems</span>
          </div>
          <p>© 2026 WorkProof AI Inc. All rights reserved. Cryptographic proofs secured by SHA-256 hashing.</p>
        </div>
      </footer>
    </div>
  );
};
