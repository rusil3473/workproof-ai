import React, { useState, useRef, useCallback } from 'react';
import { Sliders } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  height?: number;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeUrl,
  afterUrl,
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER (ALIGNED)',
  height = 360,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 to 100
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);

    if (window.navigator?.vibrate && Math.abs(percentage - 50) < 1) {
      window.navigator.vibrate(10);
    }
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      handleMove(e.clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative select-none overflow-hidden rounded-xl bg-slate-950 border border-slate-800 shadow-2xl cursor-ew-resize"
      style={{ height: `${height}px`, width: '100%' }}
      onMouseDown={() => { isDraggingRef.current = true; }}
      onMouseUp={() => { isDraggingRef.current = false; }}
      onMouseLeave={() => { isDraggingRef.current = false; }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* After Image (Background full width) */}
      <img
        src={afterUrl}
        alt="After"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute top-3 right-3 z-10 rounded-md bg-emerald-500/80 px-2.5 py-1 text-xs font-bold text-white shadow backdrop-blur-sm">
        {afterLabel}
      </div>

      {/* Before Image (Clipped by slider percentage) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={beforeUrl}
          alt="Before"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%', maxWidth: 'none' }}
        />
        <div className="absolute top-3 left-3 z-10 rounded-md bg-slate-900/80 px-2.5 py-1 text-xs font-bold text-slate-300 shadow backdrop-blur-sm">
          {beforeLabel}
        </div>
      </div>

      {/* Center Divider Line & Handle */}
      <div
        className="absolute top-0 bottom-0 z-20 flex w-1 items-center justify-center bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow-lg border-2 border-white transition-transform active:scale-110">
          <Sliders className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};
