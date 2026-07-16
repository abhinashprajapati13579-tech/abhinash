import React, { useState, useEffect, useRef } from "react";
import { AnimationFrame } from "../types.js";
import { 
  Play, 
  Pause, 
  Maximize, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Columns, 
  Smartphone, 
  Monitor, 
  Tv, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Sliders,
  Sparkles
} from "lucide-react";

interface CinemaCanvasProps {
  frames: AnimationFrame[];
  currentFrameIndex: number; // 1-indexed
  setCurrentFrameIndex: React.Dispatch<React.SetStateAction<number>>;
  fps: number;
  setFps: (fps: number) => void;
  onGenerateSingleFrame: (index: number) => void;
  isGeneratingFrame: boolean;
}

export default function CinemaCanvas({
  frames,
  currentFrameIndex,
  setCurrentFrameIndex,
  fps,
  setFps,
  onGenerateSingleFrame,
  isGeneratingFrame
}: CinemaCanvasProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [compareMode, setCompareMode] = useState<"single" | "side" | "slider">("single");
  const [sliderPosition, setSliderPosition] = useState(50);
  const [viewDevice, setViewDevice] = useState<"desktop" | "mobile">("desktop");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentFrame = frames.find(f => f.index === currentFrameIndex) || frames[0];
  const prevFrame = currentFrameIndex > 1 ? frames.find(f => f.index === currentFrameIndex - 1) : null;

  // Handle Play/Pause timer loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 1000 / fps;
      timerRef.current = setInterval(() => {
        setCurrentFrameIndex((prevIndex) => {
          if (prevIndex >= frames.length) {
            return 1; // loop
          }
          return prevIndex + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, fps, frames.length, setCurrentFrameIndex]);

  const handleStepPrev = () => {
    setIsPlaying(false);
    if (currentFrameIndex > 1) {
      setCurrentFrameIndex(currentFrameIndex - 1);
    } else {
      setCurrentFrameIndex(frames.length);
    }
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    if (currentFrameIndex < frames.length) {
      setCurrentFrameIndex(currentFrameIndex + 1);
    } else {
      setCurrentFrameIndex(1);
    }
  };

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (compareMode !== "slider" || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const percentage = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <div className="flex flex-col h-full bg-black/10 border-b border-white/10" id="cinema-canvas">
      {/* Upper Control Bar */}
      <div className="h-12 bg-black/20 px-4 flex items-center justify-between border-b border-white/10">
        {/* Playback Controls Group */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStepPrev}
            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
            title="Step Back"
            id="step-prev-btn"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-1.5 rounded-lg font-sans font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer ${isPlaying ? "bg-amber-500 hover:bg-amber-400 text-slate-950" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}
            id="play-pause-btn"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-slate-950 text-slate-950" /> PAUSE
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white text-white" /> PLAY
              </>
            )}
          </button>

          <button
            onClick={handleStepNext}
            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
            title="Step Forward"
            id="step-next-btn"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1"></div>

          {/* FPS Speed Switcher */}
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-0.5 rounded-md">
            {[5, 10, 15, 24, 30].map(speed => (
              <button
                key={speed}
                onClick={() => setFps(speed)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer ${fps === speed ? "bg-white/10 text-indigo-400 font-bold border border-white/5" : "text-slate-400 hover:text-white"}`}
                id={`fps-${speed}-btn`}
              >
                {speed}F
              </button>
            ))}
          </div>
        </div>

        {/* Compare / Viewing Modes */}
        <div className="flex items-center gap-2">
          <div className="flex bg-black/40 border border-white/10 p-0.5 rounded-md">
            <button
              onClick={() => setCompareMode("single")}
              className={`p-1.5 rounded text-xs transition cursor-pointer ${compareMode === "single" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 font-bold" : "text-slate-400 hover:text-slate-200"}`}
              title="Single Frame Focus"
              id="compare-single-btn"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCompareMode("side")}
              className={`p-1.5 rounded text-xs transition cursor-pointer ${compareMode === "side" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 font-bold" : "text-slate-400 hover:text-slate-200"}`}
              title="Side-by-Side Consistency"
              id="compare-side-btn"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCompareMode("slider")}
              className={`p-1.5 rounded text-xs transition cursor-pointer ${compareMode === "slider" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 font-bold" : "text-slate-400 hover:text-slate-200"}`}
              title="Before/After Motion Slider"
              id="compare-slider-btn"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-white/10 mx-1"></div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-2 py-1 rounded-md text-xs font-mono text-slate-300">
            <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="hover:text-white cursor-pointer" id="zoom-out-btn">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-[10px]">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(400, zoom + 25))} className="hover:text-white cursor-pointer" id="zoom-in-btn">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setZoom(100)} className="hover:text-slate-100 text-[9px] bg-white/10 px-1 rounded cursor-pointer" id="zoom-reset-btn">
              FIT
            </button>
          </div>

          <div className="h-4 w-px bg-white/10 mx-1"></div>

          {/* Device Previews */}
          <div className="flex bg-black/40 border border-white/10 p-0.5 rounded-md">
            <button
              onClick={() => setViewDevice("desktop")}
              className={`p-1.5 rounded text-xs transition cursor-pointer ${viewDevice === "desktop" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 font-bold" : "text-slate-400 hover:text-slate-200"}`}
              title="Desktop Landscape 16:9"
              id="device-desktop-btn"
            >
              <Tv className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewDevice("mobile")}
              className={`p-1.5 rounded text-xs transition cursor-pointer ${viewDevice === "mobile" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 font-bold" : "text-slate-400 hover:text-slate-200"}`}
              title="Mobile Portrait 9:16"
              id="device-mobile-btn"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div className="flex-1 overflow-hidden flex items-center justify-center p-6 relative bg-transparent" id="canvas-viewport">
        {/* Glassmorphic overlay loading state */}
        {isGeneratingFrame && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-3 animate-fade-in">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="font-mono text-xs text-indigo-400 tracking-wider">AI CONSTRUCTING FRAME {currentFrameIndex}...</p>
          </div>
        )}

        {/* Dynamic Aspect Ratio Wrapper */}
        <div 
          ref={containerRef}
          onMouseMove={handleSliderMove}
          onTouchMove={handleSliderMove}
          className={`relative max-w-full max-h-full overflow-hidden transition-all duration-300 rounded-xl border border-white/10 bg-black/40 shadow-2xl ${
            viewDevice === "mobile" ? "aspect-[9/16] h-[480px]" : "aspect-[16/9] w-full max-w-4xl"
          }`}
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
        >
          {/* 1. SINGLE VIEW MODE */}
          {compareMode === "single" && (
            <div className="w-full h-full relative bg-transparent flex items-center justify-center">
              {currentFrame.imageUrl ? (
                <img 
                  src={currentFrame.imageUrl} 
                  alt={`Frame ${currentFrameIndex}`}
                  className="w-full h-full object-contain pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-sans font-semibold text-slate-200">Frame Not Yet Rendered</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1.5 mb-4 leading-relaxed">This timeline segment has not been generated by the Frame Consistency Engine yet.</p>
                  <button
                    onClick={() => onGenerateSingleFrame(currentFrameIndex)}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-semibold text-xs rounded-lg transition shadow-lg shadow-indigo-600/15 cursor-pointer"
                    id="canvas-gen-frame-btn"
                  >
                    RENDER FRAME {currentFrameIndex}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. SIDE BY SIDE MODE */}
          {compareMode === "side" && (
            <div className="w-full h-full grid grid-cols-2 gap-px bg-white/10">
              {/* Previous frame (Temporal Check) */}
              <div className="relative bg-black/20 flex items-center justify-center border-r border-white/5">
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 rounded text-[9px] font-mono text-indigo-400 border border-indigo-500/20 z-10 font-semibold">PREVIOUS (FRAME {currentFrameIndex - 1 || frames.length})</span>
                {prevFrame?.imageUrl ? (
                  <img 
                    src={prevFrame.imageUrl} 
                    alt="Previous Frame" 
                    className="w-full h-full object-contain pointer-events-none" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-xs text-slate-500 font-mono">Empty frame</span>
                )}
              </div>

              {/* Current frame */}
              <div className="relative bg-black/20 flex items-center justify-center">
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 rounded text-[9px] font-mono text-indigo-400 border border-indigo-500/20 z-10 font-semibold">CURRENT (FRAME {currentFrameIndex})</span>
                {currentFrame.imageUrl ? (
                  <img 
                    src={currentFrame.imageUrl} 
                    alt="Current Frame" 
                    className="w-full h-full object-contain pointer-events-none" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-xs text-slate-500 font-mono">Empty frame</span>
                )}
              </div>
            </div>
          )}

          {/* 3. BEFORE / AFTER EDIT SLIDER */}
          {compareMode === "slider" && (
            <div className="w-full h-full relative bg-transparent flex items-center justify-center select-none">
              {/* After State (Main Frame) */}
              {currentFrame.imageUrl ? (
                <img 
                  src={currentFrame.imageUrl} 
                  alt="Current state"
                  className="w-full h-full object-contain absolute"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-xs text-slate-500">Render frame to view comparison</div>
              )}

              {/* Before State (Previous or unedited state) */}
              <div 
                className="absolute left-0 top-0 bottom-0 overflow-hidden bg-black/40 z-10 border-r-2 border-indigo-500"
                style={{ width: `${sliderPosition}%` }}
              >
                {/* We use prev frame as before reference, or if available, the static frame */}
                {prevFrame?.imageUrl ? (
                  <img 
                    src={prevFrame.imageUrl} 
                    alt="Previous state"
                    className="h-full object-contain absolute"
                    style={{ 
                      width: containerRef.current?.getBoundingClientRect().width,
                      maxWidth: "none"
                    }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 bg-black/40 font-mono">Preceding reference empty</div>
                )}
              </div>

              {/* Slider Grab Handle */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg cursor-ew-resize hover:bg-indigo-500"
                style={{ left: `calc(${sliderPosition}% - 16px)` }}
              >
                <Sliders className="w-4 h-4 text-white stroke-[2.5]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Frame Details Footbar */}
      <div className="h-10 bg-black/20 border-t border-white/10 px-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase text-slate-500">Viewport Metrics</span>
          <span className="font-mono text-slate-300">Res: 800 x 450 px</span>
          <span className="text-white/10">|</span>
          <span className="font-mono text-slate-300">Format: {viewDevice === "mobile" ? "9:16 Portrait" : "16:9 Landscape"}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {currentFrame.isGenerated ? "LOCKED & CONSTRUCTED" : "UNRENDERED IN-MEMORY PATH"}
          </span>
          <span className="font-mono text-slate-500">Seed: {currentFrame.seed}</span>
        </div>
      </div>
    </div>
  );
}
