# 🛡️ WorkProof AI: Cryptographic Before/After Contractor Milestone Verification

[![RevenueCat Shipaton 2026](https://img.shields.io/badge/RevenueCat-Shipaton%202026-blueviolet?style=for-the-badge&logo=revenuecat)](https://revenuecat-shipaton-2026.devpost.com/)
[![Built for US & India](https://img.shields.io/badge/Markets-US%20%26%20India%20Dual--Rail-blue?style=for-the-badge)](https://github.com/rusil3473/workproof-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-cyan?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

> **The tamper-proof milestone proof-of-work platform with Ghost Overlay photo matching, on-glass client vector signatures, cryptographic SHA-256 PDF audit certificates, and dual-rail US (Stripe) & India (UPI QR) payment payouts.**

---

## 💡 The Problem
In the residential renovation and construction industries worldwide:
- **Disputed Milestones:** 38% of contractor payment disputes stem from subjective visual disagreements ("this doesn't look straight", "is that the same tile?").
- **Angle Distortion:** Technicians struggle to reproduce the exact lighting, framing, and vantage point of the "Before" photo when documenting completion.
- **Payment Delays:** Contractors wait an average of 19 days to receive milestone draws while owners physically inspect the premises.
- **Fragmented Global Invoicing:** US contractors rely on Stripe/credit card invoices, while Indian contractors and solar installation teams demand instant zero-fee UPI QR codes.

---

## ⚡ The Solution: WorkProof AI

WorkProof AI eliminates payment friction by transforming contractor smartphones into cryptographic inspection tools:

1. **Ghost Camera Overlay Viewfinder:** Real-time HUD that renders a translucent ghost overlay (adjustable opacity) of the original "Before" photo directly over the live camera feed, ensuring 100% angle and perspective parity.
2. **Cryptographic Proof Watermarking:** Every frame is embedded with hardware-level GPS coordinates (latitude, longitude, altitude, accuracy radius), ISO-8601 UTC timestamp, and a SHA-256 cryptographic digest.
3. **Interactive Before/After Split Slider:** Seamless dual-layer comparison canvas with smooth touch-drag handle.
4. **Vector Touch Signature Pad:** On-glass vector signature capture for homeowners and general contractors with audit trails.
5. **Instant PDF Audit Certificate:** Single-click client-side compilation of a tamper-proof A4 certificate ready for banks, insurance adjusters, and government subsidy audits (e.g., US Inflation Reduction Act heat pump rebates, India PM Surya Ghar Muft Bijli Yojana rooftop solar verification).
6. **Dual-Rail Instant Settlement:** 
   - **United States:** One-tap Stripe Checkout links.
   - **India:** Dynamic UPI QR generation (`upi://pay?pa=...&am=...`) supporting PhonePe, Google Pay, and Paytm.
7. **RevenueCat Paywalls v2 Monetization:** Native Pro Contractor subscription tier ($9.99/mo / ₹799/mo) and team fleet tiers unlocked via RevenueCat web/app SDK hooks.

---

## 📱 RevenueCat Shipaton 2026 Integration Architecture

WorkProof AI implements RevenueCat Paywalls v2 architecture to power recurring SaaS revenue:
- **Entitlements:** `pro_features` (unlimited certificates, custom branding, high-res PDF exports, multi-crew dispatch).
- **Offerings:** `default` containing monthly and annual subscription packages with localized micro-pricing:
  - **US Market:** `$9.99/month` or `$89.99/year` ($7.50/mo effective).
  - **India Market:** `₹799/month` or `₹6,999/year` with regional payment methods.
- **Customer Info Sync:** Reactive subscriber state management with instant paywall unlock and restored purchase reconciliation.

---

## 🛠️ Technology Stack

- **Frontend & UI:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Computer Vision & Graphics:** HTML5 Canvas 2D Context, WebRTC MediaStream API, Image Processing Filters.
- **Cryptographic Security:** Web Crypto API (`crypto.subtle.digest('SHA-256')`).
- **Document Engine:** jsPDF vector PDF generation.
- **Monetization Engine:** RevenueCat Paywall Integration Engine, Stripe SDK simulation, UPI URI generator.
- **Testing:** Vitest test suite.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/rusil3473/workproof-ai.git
cd workproof-ai
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Navigate to `http://localhost:5173`.

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 👥 Authors & Team
- **Rusil Varu** (`rusilvaru555@gmail.com` / [@rusil3473](https://github.com/rusil3473))

## 📄 License
This project is open-source under the [MIT License](LICENSE).
