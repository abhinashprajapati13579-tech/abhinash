import React, { useState } from "react";
import { 
  LocksState, 
  SceneMemory, 
  MovementSettings 
} from "../types.js";
import { 
  Lock, 
  Unlock, 
  Layers, 
  Sparkles, 
  Sliders, 
  User, 
  Image, 
  Camera, 
  Tv, 
  Compass, 
  Eye,
  Cpu
} from "lucide-react";

interface LeftPanelProps {
  locks: LocksState;
  setLocks: (locks: LocksState) => void;
  sceneMemory: SceneMemory;
  setSceneMemory: (memory: SceneMemory) => void;
  movement: MovementSettings;
  setMovement: (movement: MovementSettings) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  basePrompt: string;
  setBasePrompt: (prompt: string) => void;
  negativePrompt: string;
  setNegativePrompt: (prompt: string) => void;
  mode: "procedural" | "live-gemini";
  setMode: (mode: "procedural" | "live-gemini") => void;
  onGenerateAll: () => void;
  isGeneratingAny: boolean;
}

export default function LeftPanel({
  locks,
  setLocks,
  sceneMemory,
  setSceneMemory,
  movement,
  setMovement,
  selectedModel,
  setSelectedModel,
  basePrompt,
  setBasePrompt,
  negativePrompt,
  setNegativePrompt,
  mode,
  setMode,
  onGenerateAll,
  isGeneratingAny
}: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<"scene" | "locks" | "movement">("scene");

  const stylesList = [
    "Realistic", "Anime", "Disney", "Pixar", "3D", 
    "Cartoon", "Fantasy", "Cyberpunk", "Pixel Art", 
    "Watercolor", "Oil Painting"
  ];

  const aspectRatios = ["16:9", "9:16", "1:1", "4:3", "3:4"];

  const modelsList = [
    { id: "google-imagen", name: "Google Imagen 3 (Coherent)" },
    { id: "gemini-image", name: "Gemini Image 3.1" },
    { id: "sdxl", name: "Stable Diffusion XL" },
    { id: "flux", name: "Flux Pro" },
    { id: "veo-video", name: "Veo 3.1 (Future Video Model)" }
  ];

  const handleLockToggle = (key: keyof LocksState) => {
    if (typeof locks[key] === "boolean") {
      setLocks({
        ...locks,
        [key]: !locks[key]
      });
    }
  };

  const handleCharacterDetailChange = (key: string, value: string) => {
    setLocks({
      ...locks,
      characterDetails: {
        ...locks.characterDetails,
        [key]: value
      }
    });
  };

  const handleBackgroundDetailChange = (key: string, value: string) => {
    setLocks({
      ...locks,
      backgroundDetails: {
        ...locks.backgroundDetails,
        [key]: value
      }
    });
  };

  const handleCameraDetailChange = (key: string, value: string) => {
    setLocks({
      ...locks,
      cameraDetails: {
        ...locks.cameraDetails,
        [key]: value
      }
    });
  };

  const handleMovementChange = (key: keyof MovementSettings, value: any) => {
    setMovement({
      ...movement,
      [key]: value
    });
  };

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-md border-r border-white/10 text-slate-100 overflow-hidden" id="left-panel">
      {/* Platform Title */}
      <div className="p-4 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Layers className="w-5 h-5 text-white stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-sans font-bold tracking-tight text-lg text-white">FrameFlow AI</h1>
          <p className="font-mono text-[10px] text-indigo-400">TEMPORAL CONTINUITY ENGINE</p>
        </div>
      </div>

      {/* Primary Generation Prompts */}
      <div className="p-4 border-b border-white/10 space-y-3 bg-white/5">
        <div>
          <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Base Action Prompt
          </label>
          <textarea
            value={basePrompt}
            onChange={(e) => setBasePrompt(e.target.value)}
            className="w-full h-20 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 resize-none font-sans"
            placeholder="Describe the overall animation action... e.g. A girl walking slowly in a misty forest."
            id="base-prompt-input"
          />
        </div>

        <div>
          <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1">Negative Prompt</label>
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500/80"
            placeholder="Deformed, low quality, shifting background elements..."
            id="negative-prompt-input"
          />
        </div>
      </div>

      {/* Render Mode & Controls */}
      <div className="p-4 border-b border-white/10 bg-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase text-slate-400">Rendering Pipeline</span>
          <div className="flex bg-black/40 border border-white/10 rounded-md p-0.5">
            <button
              onClick={() => setMode("procedural")}
              className={`px-2.5 py-1 text-xs rounded-sm transition font-sans cursor-pointer ${mode === "procedural" ? "bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/10" : "text-slate-400 hover:text-white"}`}
              id="mode-procedural-btn"
            >
              Vector Engine
            </button>
            <button
              onClick={() => setMode("live-gemini")}
              className={`px-2.5 py-1 text-xs rounded-sm transition font-sans flex items-center gap-1 cursor-pointer ${mode === "live-gemini" ? "bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/10" : "text-slate-400 hover:text-white"}`}
              id="mode-live-gemini-btn"
            >
              <Cpu className="w-3 h-3" /> Live AI API
            </button>
          </div>
        </div>

        <button
          onClick={onGenerateAll}
          disabled={isGeneratingAny}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-500 text-white font-sans font-semibold rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/15 cursor-pointer disabled:cursor-not-allowed"
          id="generate-timeline-btn"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          {isGeneratingAny ? "RENDERING TIMELINE..." : "RENDER ALL FRAMES"}
        </button>
      </div>

      {/* Tab Switchers */}
      <div className="flex border-b border-white/10 bg-black/20">
        <button
          onClick={() => setActiveTab("scene")}
          className={`flex-1 py-2.5 text-xs font-mono border-b-2 transition cursor-pointer ${activeTab === "scene" ? "border-indigo-500 text-white bg-white/5" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          id="tab-scene-btn"
        >
          <Sliders className="w-3.5 h-3.5 inline mr-1.5" /> SCENE MEMORY
        </button>
        <button
          onClick={() => setActiveTab("locks")}
          className={`flex-1 py-2.5 text-xs font-mono border-b-2 transition cursor-pointer ${activeTab === "locks" ? "border-indigo-500 text-white bg-white/5" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          id="tab-locks-btn"
        >
          <Lock className="w-3.5 h-3.5 inline mr-1.5" /> SYSTEM LOCKS
        </button>
        <button
          onClick={() => setActiveTab("movement")}
          className={`flex-1 py-2.5 text-xs font-mono border-b-2 transition cursor-pointer ${activeTab === "movement" ? "border-indigo-500 text-white bg-white/5" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          id="tab-movement-btn"
        >
          <Compass className="w-3.5 h-3.5 inline mr-1.5" /> MOVEMENT ENGINE
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {/* 1. SCENE MEMORY CONTROLS */}
        {activeTab === "scene" && (
          <div className="space-y-4">
            {/* AI Model Switcher */}
            <div>
              <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1.5">Simulation Model Target</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                id="model-select"
              >
                {modelsList.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1.5">Art Style Reference</label>
                <select
                  value={sceneMemory.style}
                  onChange={(e) => setSceneMemory({ ...sceneMemory, style: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  id="style-select"
                >
                  {stylesList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1.5">Aspect Ratio</label>
                <select
                  value={sceneMemory.aspectRatio}
                  onChange={(e) => setSceneMemory({ ...sceneMemory, aspectRatio: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  id="aspect-ratio-select"
                >
                  {aspectRatios.map(ar => (
                    <option key={ar} value={ar}>{ar}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1.5">Color Palette Focus</label>
              <input
                type="text"
                value={sceneMemory.colorPalette}
                onChange={(e) => setSceneMemory({ ...sceneMemory, colorPalette: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="Vivid colors, amber tints, emerald greens..."
                id="palette-input"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1.5">Environment Backdrop Prompt</label>
              <input
                type="text"
                value={sceneMemory.backgroundPrompt}
                onChange={(e) => setSceneMemory({ ...sceneMemory, backgroundPrompt: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="Giant redwood pines with hanging moss..."
                id="bg-prompt-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1.5">Lighting Environment</label>
                <input
                  type="text"
                  value={sceneMemory.lightingPrompt}
                  onChange={(e) => setSceneMemory({ ...sceneMemory, lightingPrompt: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                  placeholder="Atmospheric cinematic, foggy sunrays"
                  id="lighting-prompt-input"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1.5">Weather Setting</label>
                <input
                  type="text"
                  value={sceneMemory.weatherPrompt}
                  onChange={(e) => setSceneMemory({ ...sceneMemory, weatherPrompt: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                  placeholder="Drizzling rain"
                  id="weather-prompt-input"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800/50 space-y-2">
              <span className="font-mono text-[9px] uppercase text-slate-400 tracking-wider">Advanced Seed Control</span>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    type="number"
                    value={sceneMemory.seed}
                    onChange={(e) => setSceneMemory({ ...sceneMemory, seed: parseInt(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-emerald-400"
                    id="seed-input"
                  />
                </div>
                <button
                  onClick={() => setSceneMemory({ ...sceneMemory, seed: Math.floor(Math.random() * 99999) })}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] rounded text-slate-200 transition font-mono"
                  id="randomize-seed-btn"
                >
                  RANDOM
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. SYSTEM LOCKS CONTROLS */}
        {activeTab === "locks" && (
          <div className="space-y-4">
            
            {/* CHARACTER LOCK */}
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span className="font-sans font-semibold text-xs text-white">Character Facial & Outfit Lock</span>
                </div>
                <button
                  onClick={() => handleLockToggle("characterLock")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${locks.characterLock ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40" : "bg-white/5 text-slate-400 border border-transparent"}`}
                  id="toggle-character-lock-btn"
                >
                  {locks.characterLock ? (
                    <>
                      <Lock className="w-3 h-3" /> ENABLED
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3" /> DISABLED
                    </>
                  )}
                </button>
              </div>

              {locks.characterLock && (
                <div className="space-y-2.5 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-mono text-[9px] uppercase text-slate-400 mb-1">Face Details</label>
                      <input
                        type="text"
                        value={locks.characterDetails.face}
                        onChange={(e) => handleCharacterDetailChange("face", e.target.value)}
                        className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        id="char-face-input"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[9px] uppercase text-slate-400 mb-1">Hair Structure</label>
                      <input
                        type="text"
                        value={locks.characterDetails.hair}
                        onChange={(e) => handleCharacterDetailChange("hair", e.target.value)}
                        className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        id="char-hair-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-mono text-[9px] uppercase text-slate-400 mb-1">Eye Expression</label>
                      <input
                        type="text"
                        value={locks.characterDetails.eyes}
                        onChange={(e) => handleCharacterDetailChange("eyes", e.target.value)}
                        className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        id="char-eyes-input"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[9px] uppercase text-slate-400 mb-1">Locked Outfit</label>
                      <input
                        type="text"
                        value={locks.characterDetails.clothes}
                        onChange={(e) => handleCharacterDetailChange("clothes", e.target.value)}
                        className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        id="char-clothes-input"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BACKGROUND LOCK */}
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-indigo-400" />
                  <span className="font-sans font-semibold text-xs text-white">Scenery Background Lock</span>
                </div>
                <button
                  onClick={() => handleLockToggle("backgroundLock")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${locks.backgroundLock ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40" : "bg-white/5 text-slate-400 border border-transparent"}`}
                  id="toggle-bg-lock-btn"
                >
                  {locks.backgroundLock ? (
                    <>
                      <Lock className="w-3 h-3" /> ENABLED
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3" /> DISABLED
                    </>
                  )}
                </button>
              </div>

              {locks.backgroundLock && (
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="block font-mono text-[9px] uppercase text-slate-400 mb-1">Preserved Backdrop</label>
                    <input
                      type="text"
                      value={locks.backgroundDetails.description}
                      onChange={(e) => handleBackgroundDetailChange("description", e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      id="bg-lock-desc-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-mono text-[9px] uppercase text-slate-400 mb-1">Time of Day</label>
                      <input
                        type="text"
                        value={locks.backgroundDetails.timeOfDay}
                        onChange={(e) => handleBackgroundDetailChange("timeOfDay", e.target.value)}
                        className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        id="bg-lock-time-input"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[9px] uppercase text-slate-400 mb-1">Sky & Atmosphere</label>
                      <input
                        type="text"
                        value={locks.backgroundDetails.skyState}
                        onChange={(e) => handleBackgroundDetailChange("skyState", e.target.value)}
                        className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        id="bg-lock-sky-input"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CAMERA LOCK */}
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-indigo-400" />
                  <span className="font-sans font-semibold text-xs text-white">Camera Viewport Lock</span>
                </div>
                <button
                  onClick={() => handleLockToggle("cameraLock")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${locks.cameraLock ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40" : "bg-white/5 text-slate-400 border border-transparent"}`}
                  id="toggle-camera-lock-btn"
                >
                  {locks.cameraLock ? (
                    <>
                      <Lock className="w-3 h-3" /> ENABLED
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3" /> DISABLED
                    </>
                  )}
                </button>
              </div>

              {locks.cameraLock && (
                <div className="space-y-2.5 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-mono text-[9px] uppercase text-slate-400 mb-1">Angle / Height</label>
                      <input
                        type="text"
                        value={locks.cameraDetails.angle}
                        onChange={(e) => handleCameraDetailChange("angle", e.target.value)}
                        className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        id="cam-angle-input"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[9px] uppercase text-slate-400 mb-1">Lens Profile</label>
                      <input
                        type="text"
                        value={locks.cameraDetails.lens}
                        onChange={(e) => handleCameraDetailChange("lens", e.target.value)}
                        className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        id="cam-lens-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] uppercase text-slate-400 mb-1">Motion Restriction Style</label>
                    <input
                      type="text"
                      value={locks.cameraDetails.motion}
                      onChange={(e) => handleCameraDetailChange("motion", e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      id="cam-motion-input"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 3. MOVEMENT ENGINE */}
        {activeTab === "movement" && (
          <div className="space-y-4">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
              <p className="text-xs text-indigo-300 font-sans leading-relaxed flex items-start gap-2">
                <Compass className="w-4 h-4 shrink-0 mt-0.5" />
                <span>The Movement Engine determines <strong>which segments of the locked asset are allowed to animate</strong> from frame to frame. Static areas remain frozen.</span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase text-slate-400 mb-2">Micro-Motion Elements</label>
              
              <div className="space-y-1 bg-black/40 border border-white/10 rounded-xl p-3">
                <label className="flex items-center gap-3 py-1.5 px-1 hover:bg-white/5 rounded cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={movement.walk}
                    onChange={(e) => handleMovementChange("walk", e.target.checked)}
                    className="rounded border-white/10 text-indigo-500 focus:ring-indigo-500 bg-black/40 w-4 h-4"
                    id="move-walk-checkbox"
                  />
                  <div>
                    <span className="text-sm text-slate-200 block">Character Walking Cycle</span>
                    <span className="text-[10px] text-slate-400 font-mono">Bobs torso, shifts leg paths over frame timeline</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 py-1.5 px-1 hover:bg-white/5 rounded cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={movement.run}
                    onChange={(e) => handleMovementChange("run", e.target.checked)}
                    className="rounded border-white/10 text-indigo-500 focus:ring-indigo-500 bg-black/40 w-4 h-4"
                    id="move-run-checkbox"
                  />
                  <div>
                    <span className="text-sm text-slate-200 block">Character Speed Run</span>
                    <span className="text-[10px] text-slate-400 font-mono">High intensity rapid limbs loop oscillation</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 py-1.5 px-1 hover:bg-white/5 rounded cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={movement.talk}
                    onChange={(e) => handleMovementChange("talk", e.target.checked)}
                    className="rounded border-white/10 text-indigo-500 focus:ring-indigo-500 bg-black/40 w-4 h-4"
                    id="move-talk-checkbox"
                  />
                  <div>
                    <span className="text-sm text-slate-200 block">Linguistic Lip Sync</span>
                    <span className="text-[10px] text-slate-400 font-mono">Modulates mouth radius and shape dynamically</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 py-1.5 px-1 hover:bg-white/5 rounded cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={movement.blink}
                    onChange={(e) => handleMovementChange("blink", e.target.checked)}
                    className="rounded border-white/10 text-indigo-500 focus:ring-indigo-500 bg-black/40 w-4 h-4"
                    id="move-blink-checkbox"
                  />
                  <div>
                    <span className="text-sm text-slate-200 block">Autonomic Eye Blink</span>
                    <span className="text-[10px] text-slate-400 font-mono">Eyelid shut trigger on periodic index thresholds</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 py-1.5 px-1 hover:bg-white/5 rounded cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={movement.handMovement}
                    onChange={(e) => handleMovementChange("handMovement", e.target.checked)}
                    className="rounded border-white/10 text-indigo-500 focus:ring-indigo-500 bg-black/40 w-4 h-4"
                    id="move-hand-checkbox"
                  />
                  <div>
                    <span className="text-sm text-slate-200 block">Hand Gesture Signals</span>
                    <span className="text-[10px] text-slate-400 font-mono">Waving and lifting of frontal limb group</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 py-1.5 px-1 hover:bg-white/5 rounded cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={movement.wind}
                    onChange={(e) => handleMovementChange("wind", e.target.checked)}
                    className="rounded border-white/10 text-indigo-500 focus:ring-indigo-500 bg-black/40 w-4 h-4"
                    id="move-wind-checkbox"
                  />
                  <div>
                    <span className="text-sm text-slate-200 block">Wind/Breeze Force</span>
                    <span className="text-[10px] text-slate-400 font-mono">Drifts hair path and environment leaves horizontally</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1.5">Active Facial Expression</label>
              <select
                value={movement.expressions}
                onChange={(e) => handleMovementChange("expressions", e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                id="expression-select"
              >
                <option value="neutral" className="bg-slate-900">Neutral Focus</option>
                <option value="happy" className="bg-slate-900">Smiling/Joyful</option>
                <option value="sad" className="bg-slate-900">Sorrow/Melancholic</option>
                <option value="excited" className="bg-slate-900">Ecstatic / Wide Eye</option>
                <option value="angry" className="bg-slate-900">Stern / Intense</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
