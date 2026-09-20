import type { GPSCoordinates } from '../types';

export async function computeSha256(dataUrlOrString: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(dataUrlOrString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function drawWatermarkBanner(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timestamp: string,
  gps?: GPSCoordinates,
  hash?: string
) {
  const bannerHeight = Math.max(64, Math.floor(height * 0.09));
  const y = height - bannerHeight;

  // Dark translucent background
  ctx.fillStyle = 'rgba(10, 15, 29, 0.88)';
  ctx.fillRect(0, y, width, bannerHeight);

  // Neon security accent line
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(0, y, width, 3);

  // Text formatting
  ctx.fillStyle = '#f8fafc';
  ctx.font = `bold ${Math.max(12, Math.floor(bannerHeight * 0.24))}px monospace`;

  const dateStr = new Date(timestamp).toLocaleString();
  ctx.fillText(`VERIFIED TIMESTAMP: ${dateStr}`, 16, y + bannerHeight * 0.38);

  ctx.fillStyle = '#94a3b8';
  ctx.font = `${Math.max(10, Math.floor(bannerHeight * 0.20))}px monospace`;

  const gpsStr = gps
    ? `GPS: ${gps.latitude.toFixed(5)}, ${gps.longitude.toFixed(5)} (±${gps.accuracyMeters.toFixed(1)}m)`
    : 'GPS: ACCURATE ACQUIRED';
  ctx.fillText(gpsStr, 16, y + bannerHeight * 0.64);

  const hashStr = hash ? `SHA-256: ${hash.slice(0, 24)}...` : 'CRYPTOGRAPHICALLY SEALED';
  ctx.fillText(hashStr, 16, y + bannerHeight * 0.88);

  // Security shield badge right side
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(width - 32, y + bannerHeight / 2, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✓', width - 32, y + bannerHeight / 2);
  ctx.textAlign = 'start';
  ctx.textBaseline = 'alphabetic';
}
