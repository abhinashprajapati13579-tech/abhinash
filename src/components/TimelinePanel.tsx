import React from "react";
import { AnimationFrame } from "../types.js";
import { 
  Play, 
  Trash2, 
  Copy, 
  Plus, 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  Unlock, 
  Sparkles,
  Layers,
  FileDown
} from "lucide-react";

interface TimelinePanelProps {
  frames: AnimationFrame[];
  currentFrameIndex: number; // 1-indexed
  setCurrentFrameIndex: (idx: number) => void;
  onDeleteFrame: (index: number) => void;
  onDuplicateFrame: (index: number) => void;
  onInsertFrame: (index: number) => void;
  onMoveFrameLeft: (index: number) => void;
  onMoveFrameRight: (index: number) => void;
  onToggleFrameLock: (index: number) => void;
  onRegenerateFrame: (index: number) => void;
  isGeneratingAny: boolean;
}

export default function TimelinePanel({
  frames,
  currentFrameIndex,
  setCurrentFrameIndex,
  onDeleteFrame,
  onDuplicateFrame,
  onInsertFrame,
  onMoveFrameLeft,
  onMoveFrameRight,
  onToggleFrameLock,
  onRegenerateFrame,
  isGeneratingAny
}: TimelinePanelProps) {
  const currentFrame = frames.find(f => f.index === currentFrameIndex) || frames[0];

  return (
    <div className="bg-black/20 backdrop-blur-md border-t border-white/10 text-slate-100 p-4 flex flex-col h-[200px]" id="timeline-panel">
      
      {/* Upper Timeline Control Ribbon */}
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-3">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h3 className="font-sans font-bold text-xs text-white uppercase tracking-wider">Timeline Composer</h3>
          <span className="font-mono text-[10px] text-slate-300 bg-black/40 border border-white/10 px-2 py-0.5 rounded">
            Frame {currentFrameIndex} / {frames.length} ({(currentFrameIndex * 0.1).toFixed(2)}s)
          </span>
        </div>

        {/* Operational buttons for currently selected frame */}
        <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 p-1 rounded-lg">
          <button
            onClick={() => onMoveFrameLeft(currentFrameIndex)}
            disabled={currentFrameIndex === 1}
            className="p-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-xs text-slate-300 transition cursor-pointer"
            title="Nudge Frame Left"
            id="timeline-nudge-left-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onMoveFrameRight(currentFrameIndex)}
            disabled={currentFrameIndex === frames.length}
            className="p-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-xs text-slate-300 transition cursor-pointer"
            title="Nudge Frame Right"
            id="timeline-nudge-right-btn"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1"></div>

          <button
            onClick={() => onToggleFrameLock(currentFrameIndex)}
            className={`p-1.5 rounded text-xs transition cursor-pointer ${currentFrame?.locked ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200"}`}
            title={currentFrame?.locked ? "Unlock Frame" : "Lock Frame Contents"}
            id="timeline-lock-btn"
          >
            {currentFrame?.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onDuplicateFrame(currentFrameIndex)}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-xs text-slate-300 rounded transition cursor-pointer"
            title="Duplicate Frame"
            id="timeline-dup-btn"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onInsertFrame(currentFrameIndex)}
            className="p-1.5 bg-white/5 hover:bg-indigo-600 hover:text-white text-xs text-slate-300 rounded transition cursor-pointer"
            title="Insert Blank Frame"
            id="timeline-insert-btn"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDeleteFrame(currentFrameIndex)}
            disabled={frames.length <= 1}
            className="p-1.5 bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 disabled:opacity-30 rounded text-xs text-slate-400 transition cursor-pointer"
            title="Delete Frame"
            id="timeline-delete-btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1"></div>

          <button
            onClick={() => onRegenerateFrame(currentFrameIndex)}
            disabled={isGeneratingAny}
            className="px-3 py-1 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 rounded text-[10px] font-sans font-semibold transition cursor-pointer"
            title="Re-render Frame"
            id="timeline-re-render-btn"
          >
            RE-RENDER
          </button>
        </div>
      </div>

      {/* Scroller Track holding thumbnails */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-center gap-2 pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {frames.map((frame) => {
          const isSelected = frame.index === currentFrameIndex;
          
          return (
            <div
              key={frame.id}
              onClick={() => setCurrentFrameIndex(frame.index)}
              className={`flex-shrink-0 w-24 h-16 rounded-lg border-2 relative overflow-hidden transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                isSelected 
                  ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-black/40" 
                  : "border-white/5 bg-black/20 hover:border-white/10"
              }`}
              id={`timeline-thumb-${frame.index}`}
            >
              {/* Image Preview Canvas or empty indicator */}
              <div className="flex-1 w-full bg-black/40 flex items-center justify-center overflow-hidden">
                {frame.imageUrl ? (
                  <img 
                    src={frame.imageUrl} 
                    alt={`Thumb ${frame.index}`} 
                    className="w-full h-full object-cover pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-[10px] text-slate-500 font-mono flex flex-col items-center">
                    <Sparkles className="w-3 h-3 text-indigo-400 mb-0.5" />
                    EMPTY
                  </div>
                )}
              </div>

              {/* Locked badge */}
              {frame.locked && (
                <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 p-0.5 rounded text-[8px] z-10">
                  <Lock className="w-2 h-2" />
                </div>
              )}

              {/* Underlining timeline step marker / timeline tag */}
              <div className={`h-4.5 px-1.5 flex items-center justify-between text-[9px] font-mono leading-none ${isSelected ? "bg-indigo-600 text-white font-semibold" : "bg-black/60 text-slate-300"}`}>
                <span>#{frame.index.toString().padStart(2, '0')}</span>
                <span className="truncate max-w-[50px] text-[8px] opacity-70">
                  {frame.scheduleAction || "idle"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
