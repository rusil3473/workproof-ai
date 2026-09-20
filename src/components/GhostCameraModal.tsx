import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Sliders, MapPin } from 'lucide-react';
import type { GPSCoordinates } from '../types';
import { computeSha256, drawWatermarkBanner } from '../engine/cryptoWatermark';

interface GhostCameraModalProps {
  isOpen: boolean;
  mode: 'before' | 'after';
  referenceBeforeUrl?: string;
  onClose: () => void;
  onCapture: (photoDataUrl: string, gps?: GPSCoordinates, sha256Hash?: string) => void;
}

export const GhostCameraModal: React.FC<GhostCameraModalProps> = ({
  isOpen,
  mode,
  referenceBeforeUrl,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ghostOpacity, setGhostOpacity] = useState<number>(35); // 35% translucent default
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [gps, setGps] = useState<GPSCoordinates | undefined>();
  const [hasCameraError, setHasCameraError] = useState(false);

  // Initialize camera & GPS
  useEffect(() => {
    if (!isOpen) return;

    // Acquire GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGps({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracyMeters: pos.coords.accuracy,
          });
        },
        () => {
          // Fallback location simulation (e.g. Austin / Bengaluru jobsite)
          setGps({
            latitude: 30.2672,
            longitude: -97.7431,
            accuracyMeters: 4.2,
          });
        }
      );
    }

    // Start video stream
    async function startCamera() {
      try {
        setHasCameraError(false);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera access error:', err);
        setHasCameraError(true);
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  const captureFrame = async () => {
    const canvas = document.createElement('canvas');
    let width = 1280;
    let height = 720;

    if (videoRef.current && videoRef.current.videoWidth) {
      width = videoRef.current.videoWidth;
      height = videoRef.current.videoHeight;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (videoRef.current && !hasCameraError) {
      ctx.drawImage(videoRef.current, 0, 0, width, height);
    } else {
      // Synthetic demo frame if camera not accessible
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        mode === 'before' ? 'BEFORE CONDITION CAPTURE' : 'COMPLETED MILESTONE VERIFICATION',
        width / 2,
        height / 2
      );
    }

    const timestamp = new Date().toISOString();
    const rawData = canvas.toDataURL('image/jpeg', 0.85);
    const hash = await computeSha256(rawData + timestamp);

    // Draw tamper-proof forensic banner onto image
    drawWatermarkBanner(ctx, width, height, timestamp, gps, hash);

    const watermarkedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onCapture(watermarkedDataUrl, gps, hash);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md">
      <div className="relative flex flex-col h-full max-h-[90vh] w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800 z-20">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
              mode === 'after' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {mode === 'after' ? 'GHOST CAMERA HUD' : 'STAGE 1: BEFORE PHOTO'}
            </span>
            {gps && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <MapPin className="h-3 w-3 text-emerald-400" />
                {gps.latitude.toFixed(4)}, {gps.longitude.toFixed(4)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
              className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 transition-colors"
              title="Flip Camera"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />

          {/* 30% Translucent Ghost Overlay for "After" angle alignment */}
          {mode === 'after' && referenceBeforeUrl && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity"
              style={{ opacity: ghostOpacity / 100 }}
            >
              <img
                src={referenceBeforeUrl}
                alt="Ghost Reference"
                className="h-full w-full object-cover mix-blend-screen filter contrast-125"
              />
              <div className="absolute top-4 left-4 rounded-md bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-1 text-[11px] font-mono text-cyan-300">
                GHOST OVERLAY ({ghostOpacity}%) — MATCH ANGLE
              </div>
            </div>
          )}

          {/* Center Crosshairs & Horizon Guide */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-24 w-24 border border-white/25 rounded-lg">
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-400/40" />
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-cyan-400/40" />
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex flex-col gap-3 px-6 py-4 bg-slate-950 border-t border-slate-800 z-20">
          {mode === 'after' && referenceBeforeUrl && (
            <div className="flex items-center gap-3">
              <Sliders className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-slate-300 font-medium">Ghost Opacity:</span>
              <input
                type="range"
                min="10"
                max="80"
                value={ghostOpacity}
                onChange={(e) => setGhostOpacity(Number(e.target.value))}
                className="flex-1 accent-cyan-500"
              />
              <span className="text-xs font-mono text-cyan-400 w-8">{ghostOpacity}%</span>
            </div>
          )}

          <div className="flex items-center justify-center">
            <button
              onClick={captureFrame}
              className="group flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 p-1 shadow-lg shadow-cyan-500/30 transition-transform active:scale-95"
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 transition-colors group-hover:bg-transparent">
                <Camera className="h-7 w-7 text-white transition-colors group-hover:text-slate-950" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
