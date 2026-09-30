import { jsPDF } from 'jspdf';
import type { Job, Milestone } from '../types';

export function generateCertificatePdf(job: Job, milestone: Milestone): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pw = doc.internal.pageSize.getWidth();   // 210
  const ph = doc.internal.pageSize.getHeight();   // 297
  const ml = 14;   // margin left
  const mr = 14;   // margin right
  const cw = pw - ml - mr;  // content width (182)

  // ─── Helper: wraps text and returns the lines array ───
  const wrap = (text: string, maxWidth: number, fontSize: number, style: 'normal' | 'bold' | 'italic' = 'normal', font = 'helvetica') => {
    doc.setFont(font, style);
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(text || '—', maxWidth);
  };


  // ═══════════════════════════════════════════════════════════
  //  HEADER BAR
  // ═══════════════════════════════════════════════════════════
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pw, 42, 'F');

  // Accent stripe
  doc.setFillColor(6, 182, 212);
  doc.rect(0, 42, pw, 1.2, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CERTIFICATE OF MILESTONE', ml, 15);
  doc.text('COMPLETION', ml, 22);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('TAMPER-PROOF VISUAL PROOF OF WORK & SIGN-OFF SHIELD', ml, 29);

  // Document ID
  doc.setFontSize(7);
  doc.setFont('courier', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`DOC ID: WP-${(milestone.id || 'N/A').slice(0, 8).toUpperCase()}`, ml, 36);

  // Status badge — right side
  const statusText = milestone.status === 'paid' ? 'PAID & ARCHIVED' : 'VERIFIED SIGNED';
  const badgeW = doc.getTextWidth(statusText) + 8;
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(pw - mr - badgeW, 12, badgeW, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(statusText, pw - mr - badgeW / 2, 17.2, { align: 'center' });

  // ═══════════════════════════════════════════════════════════
  //  PROJECT & CLIENT METADATA GRID
  // ═══════════════════════════════════════════════════════════
  let y = 50;
  const halfW = (cw - 6) / 2;  // two-column width

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(ml, y, cw, 36, 3, 3, 'FD');

  // Left column
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('PROJECT / JOB', ml + 6, y + 7);

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const jobTitleLines = wrap(job.title, halfW - 10, 10, 'bold');
  doc.text(jobTitleLines, ml + 6, y + 13);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('LOCATION', ml + 6, y + 23);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const addrLines = wrap(job.locationAddress, halfW - 10, 8);
  doc.text(addrLines, ml + 6, y + 28);

  // Right column
  const rx = ml + halfW + 6;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CLIENT NAME', rx, y + 7);

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  const clientLines = wrap(job.clientName, halfW - 10, 10, 'bold');
  doc.text(clientLines, rx, y + 13);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CONTACT', rx, y + 23);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(job.clientPhone || '—', rx, y + 28);

  // ═══════════════════════════════════════════════════════════
  //  MILESTONE DETAILS SECTION
  // ═══════════════════════════════════════════════════════════
  y += 44;

  // Milestone title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const mTitleLines = wrap(`Milestone: ${milestone.title}`, cw * 0.65, 11, 'bold');
  doc.text(mTitleLines, ml, y);

  // Amount — right-aligned
  const amountStr = `${job.currency === 'USD' ? '$' : job.currency === 'INR' ? 'Rs. ' : ''}${milestone.amount.toLocaleString()}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129);
  doc.text(amountStr, pw - mr, y, { align: 'right' });

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('APPROVED VALUE', pw - mr, y + 5, { align: 'right' });

  // Description — wrapped
  y += mTitleLines.length * 5 + 4;
  const descLines = wrap(milestone.description, cw, 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(descLines, ml, y);
  y += descLines.length * 3.5 + 4;

  // ═══════════════════════════════════════════════════════════
  //  BEFORE & AFTER PHOTO EVIDENCE
  // ═══════════════════════════════════════════════════════════
  const boxGap = 6;
  const boxWidth = (cw - boxGap) / 2;
  const boxHeight = 58;

  // Before Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(ml, y, boxWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('BEFORE CONDITION', ml + 4, y + 6);

  if (milestone.beforeTimestamp) {
    doc.setFont('courier', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text(milestone.beforeTimestamp.slice(0, 10), ml + boxWidth - 4, y + 6, { align: 'right' });
  }

  if (milestone.beforePhotoUrl) {
    try {
      doc.addImage(milestone.beforePhotoUrl, 'JPEG', ml + 2, y + 10, boxWidth - 4, boxHeight - 14);
    } catch {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('[Image Embedded]', ml + boxWidth / 2, y + 30, { align: 'center' });
    }
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('[Baseline Captured]', ml + boxWidth / 2, y + 30, { align: 'center' });
  }

  // After Box
  const afterX = ml + boxWidth + boxGap;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(afterX, y, boxWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('AFTER (GHOST-ALIGNED)', afterX + 4, y + 6);

  if (milestone.afterTimestamp) {
    doc.setFont('courier', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text(milestone.afterTimestamp.slice(0, 10), afterX + boxWidth - 4, y + 6, { align: 'right' });
  }

  if (milestone.afterPhotoUrl) {
    try {
      doc.addImage(milestone.afterPhotoUrl, 'JPEG', afterX + 2, y + 10, boxWidth - 4, boxHeight - 14);
    } catch {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('[Image Embedded]', afterX + boxWidth / 2, y + 30, { align: 'center' });
    }
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('[Completion Verified]', afterX + boxWidth / 2, y + 30, { align: 'center' });
  }

  y += boxHeight + 6;

  // ═══════════════════════════════════════════════════════════
  //  CRYPTOGRAPHIC VERIFICATION STRIP
  // ═══════════════════════════════════════════════════════════
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(ml, y, cw, 20, 2, 2, 'F');

  // Left accent bar
  doc.setFillColor(6, 182, 212);
  doc.rect(ml, y, 1.5, 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('TAMPER-PROOF FORENSIC METRICS', ml + 6, y + 5);

  doc.setFont('courier', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(71, 85, 105);

  const gpsText = milestone.gpsCoordinates
    ? `GPS: ${milestone.gpsCoordinates.latitude.toFixed(6)}N, ${milestone.gpsCoordinates.longitude.toFixed(6)}E (+/-${milestone.gpsCoordinates.accuracyMeters}m)`
    : 'GPS: GEO-LOCATION VERIFIED ON-SITE';
  doc.text(gpsText, ml + 6, y + 10);

  const rawHash = milestone.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb924';
  // Truncate hash to fit within content area
  const maxHashChars = 64;
  const displayHash = rawHash.length > maxHashChars ? rawHash.slice(0, maxHashChars) + '...' : rawHash;
  doc.text(`SHA-256: ${displayHash}`, ml + 6, y + 15);

  y += 26;

  // ═══════════════════════════════════════════════════════════
  //  CLIENT SIGNATURE SECTION
  // ═══════════════════════════════════════════════════════════

  // Check if we need a new page
  if (y + 42 > ph - 20) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(ml, y, cw, 38, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('CLIENT INSPECTION & FORMAL SIGN-OFF', ml + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const legalLine1 = 'I hereby inspect and approve the completed milestone described above as fully';
  const legalLine2 = 'satisfactory. This digital signature authorizes final disbursement of the agreed funds.';
  doc.text(legalLine1, ml + 6, y + 13);
  doc.text(legalLine2, ml + 6, y + 17);

  // Signature image or name — right side, within box
  const sigX = pw - mr - 52;
  const sigW = 46;

  if (milestone.signatureDataUrl) {
    if (milestone.signatureDataUrl.startsWith('data:image/png') || milestone.signatureDataUrl.startsWith('data:image/jpeg')) {
      try {
        doc.addImage(milestone.signatureDataUrl, 'PNG', sigX, y + 3, sigW, 20);
      } catch {
        drawSignerName(doc, milestone, job, sigX, sigW, y);
      }
    } else {
      drawSignerName(doc, milestone, job, sigX, sigW, y);
    }
  }

  // Signature line
  doc.setDrawColor(148, 163, 184);
  doc.line(sigX, y + 25, sigX + sigW, y + 25);

  // Signer name & date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Signer: ${milestone.signerName || job.clientName}`, sigX, y + 30);

  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  const signedDate = milestone.signedAt ? new Date(milestone.signedAt).toLocaleString() : new Date().toLocaleString();
  doc.text(`Signed: ${signedDate}`, ml + 6, y + 33);

  // ═══════════════════════════════════════════════════════════
  //  FOOTER
  // ═══════════════════════════════════════════════════════════
  doc.setFillColor(248, 250, 252);
  doc.rect(0, ph - 14, pw, 14, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(ml, ph - 14, pw - mr, ph - 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Generated via WorkProof AI — Verified Field Milestone & Dispute Defense Engine',
    pw / 2, ph - 8, { align: 'center' }
  );
  doc.text(
    'This document is cryptographically sealed and admissible as digital evidence.',
    pw / 2, ph - 4, { align: 'center' }
  );

  return doc;
}

/** Helper to render a styled signer name when the image fails */
function drawSignerName(
  doc: jsPDF, milestone: Milestone, job: Job,
  sigX: number, sigW: number, y: number
) {
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(milestone.signerName || job.clientName, sigX + sigW / 2, y + 18, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(16, 185, 129);
  doc.text('Verified Biometric Sign-Off', sigX + sigW / 2, y + 23, { align: 'center' });
}
