import React, { useState, useRef, useCallback } from 'react';
import { Sliders, Search } from 'lucide-react';

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
  const [isLoupeActive, setIsLoupeActive] = useState<boolean>(false);
  const [loupePos, setLoupePos] = useState<{ x: number; y: number } | null>(null);
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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      handleMove(e.clientX);
    }
    if (containerRef.current && isLoupeActive) {
      const rect = containerRef.current.getBoundingClientRect();
      setLoupePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const isMouseInBefore = loupePos && containerRef.current
    ? (loupePos.x / containerRef.current.clientWidth) * 100 < sliderPos
    : false;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLoupeActive(!isLoupeActive)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              isLoupeActive
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>{isLoupeActive ? '3x Defect Loupe: ON' : 'Enable 3x Defect Loupe'}</span>
          </button>
          <span className="text-slate-400 hidden sm:inline">
            {isLoupeActive ? 'Hover over surface to inspect hairline cracks & grout' : 'Drag center divider to compare'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-cyan-400">Split: {Math.round(sliderPos)}%</span>
      </div>

      <div
        ref={containerRef}
        className="relative select-none overflow-hidden rounded-xl bg-slate-950 border border-slate-800 shadow-2xl cursor-ew-resize"
        style={{ height: `${height}px`, width: '100%' }}
        onMouseDown={(e) => {
          // If clicking near slider bar, drag it
          isDraggingRef.current = true;
          handleMove(e.clientX);
        }}
        onMouseUp={() => { isDraggingRef.current = false; }}
        onMouseLeave={() => {
          isDraggingRef.current = false;
          setLoupePos(null);
        }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* After Image (Background full width) */}
        <img
          src={afterUrl}
          alt="After"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute top-3 right-3 z-10 rounded-md bg-emerald-500/90 px-2.5 py-1 text-xs font-bold text-white shadow backdrop-blur-sm">
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
          <div className="absolute top-3 left-3 z-10 rounded-md bg-slate-900/90 px-2.5 py-1 text-xs font-bold text-slate-300 shadow backdrop-blur-sm">
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

        {/* 3x Optical Defect Loupe Overlay */}
        {isLoupeActive && loupePos && containerRef.current && (
          <div
            className="pointer-events-none absolute z-30 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-400 shadow-2xl overflow-hidden bg-slate-950"
            style={{
              left: `${loupePos.x}px`,
              top: `${loupePos.y}px`,
            }}
          >
            {/* Magnified Image */}
            <div
              className="absolute inset-0 bg-no-repeat"
              style={{
                backgroundImage: `url(${isMouseInBefore ? beforeUrl : afterUrl})`,
                backgroundSize: `${containerRef.current.clientWidth * 3}px ${containerRef.current.clientHeight * 3}px`,
                backgroundPosition: `-${loupePos.x * 3 - 64}px -${loupePos.y * 3 - 64}px`,
              }}
            />
            {/* Loupe Crosshairs Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-full w-px bg-amber-400/40" />
              <div className="h-px w-full bg-amber-400/40 absolute" />
              <div className="h-4 w-4 rounded-full border border-amber-400/80" />
            </div>
            {/* Loupe Tag */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-slate-900/90 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
              3x {isMouseInBefore ? 'BEFORE' : 'AFTER'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
