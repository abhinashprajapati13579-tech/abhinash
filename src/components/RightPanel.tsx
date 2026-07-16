import React, { useState } from "react";
import { 
  AnimationProject, 
  PromptScheduleItem, 
  GenerationJob 
} from "../types.js";
import { 
  FolderOpen, 
  Clock, 
  Video, 
  Download, 
  Sparkles, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Layers, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Cpu
} from "lucide-react";

interface RightPanelProps {
  projectsList: { id: string; name: string; description: string; frameCount: number }[];
  activeProject: AnimationProject;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string, prompt: string, style: string) => void;
  onDeleteProject: (id: string) => void;
  onOptimizePrompts: () => void;
  onExtractVideo: (sampleName: string) => void;
  onStyleTransfer: (style: string) => void;
  onExport: (format: "gif" | "png" | "zip" | "mp4") => void;
  isOptimizing: boolean;
  isExtracting: boolean;
}

export default function RightPanel({
  projectsList,
  activeProject,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onOptimizePrompts,
  onExtractVideo,
  onStyleTransfer,
  onExport,
  isOptimizing,
  isExtracting
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<"projects" | "optimizer" | "video" | "export">("projects");
  const [newProjName, setNewProjName] = useState("");
  const [newProjPrompt, setNewProjPrompt] = useState("");
  const [newProjStyle, setNewProjStyle] = useState("Realistic");

  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [targetFps, setTargetFps] = useState(10);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedVideo(e.dataTransfer.files[0]);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    onCreateProject(newProjName, newProjPrompt, newProjStyle);
    setNewProjName("");
    setNewProjPrompt("");
  };

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-md border-l border-white/10 text-slate-100 overflow-hidden" id="right-panel">
      {/* Tab Switchers */}
      <div className="flex border-b border-white/10 bg-black/20">
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex-1 py-3 text-xs font-mono border-b-2 transition cursor-pointer ${activeTab === "projects" ? "border-indigo-500 text-white bg-white/5" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          id="right-tab-projects-btn"
        >
          <FolderOpen className="w-3.5 h-3.5 inline mr-1.5" /> PROJECTS
        </button>
        <button
          onClick={() => setActiveTab("optimizer")}
          className={`flex-1 py-3 text-xs font-mono border-b-2 transition cursor-pointer ${activeTab === "optimizer" ? "border-indigo-500 text-white bg-white/5" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          id="right-tab-optimizer-btn"
        >
          <Sparkles className="w-3.5 h-3.5 inline mr-1.5" /> OPTIMIZER
        </button>
        <button
          onClick={() => setActiveTab("video")}
          className={`flex-1 py-3 text-xs font-mono border-b-2 transition cursor-pointer ${activeTab === "video" ? "border-indigo-500 text-white bg-white/5" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          id="right-tab-video-btn"
        >
          <Video className="w-3.5 h-3.5 inline mr-1.5" /> VIDEO HUB
        </button>
        <button
          onClick={() => setActiveTab("export")}
          className={`flex-1 py-3 text-xs font-mono border-b-2 transition cursor-pointer ${activeTab === "export" ? "border-indigo-500 text-white bg-white/5" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          id="right-tab-export-btn"
        >
          <Download className="w-3.5 h-3.5 inline mr-1.5" /> EXPORT
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        
        {/* 1. PROJECTS TAB */}
        {activeTab === "projects" && (
          <div className="space-y-4 animate-fade-in">
            {/* Create New Project Section */}
            <form onSubmit={handleCreateSubmit} className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <span className="font-mono text-[10px] uppercase text-indigo-400 font-bold block tracking-wider">Initialize Animation Scene</span>
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Project Name (e.g. Cyber City Walk)"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                  id="new-project-name"
                />
                
                <input
                  type="text"
                  placeholder="Base Action (e.g. Cheetah sprinting on neon wet pavement)"
                  value={newProjPrompt}
                  onChange={(e) => setNewProjPrompt(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  id="new-project-base-action"
                />

                <select
                  value={newProjStyle}
                  onChange={(e) => setNewProjStyle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  id="new-project-style"
                >
                  <option value="Realistic" className="bg-slate-900">Style: Realistic Rendering</option>
                  <option value="Anime" className="bg-slate-900">Style: Anime Key Art</option>
                  <option value="Disney" className="bg-slate-900">Style: Disney Animation</option>
                  <option value="Pixar" className="bg-slate-900">Style: 3D Pixar Style</option>
                  <option value="Cyberpunk" className="bg-slate-900">Style: Neon Cyberpunk</option>
                  <option value="Pixel Art" className="bg-slate-900">Style: 16-Bit Pixel Art</option>
                  <option value="Watercolor" className="bg-slate-900">Style: Watercolor Sketch</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-white/10 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-fuchsia-600 hover:text-white border border-white/15 text-slate-200 font-sans font-medium text-xs rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                id="create-project-submit-btn"
              >
                <Plus className="w-3.5 h-3.5" /> CREATE NEW ANIMATION
              </button>
            </form>

            {/* List of Projects */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase text-slate-400 block tracking-wider">Saved Studio Timelines</span>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {projectsList.map(proj => (
                  <div
                    key={proj.id}
                    onClick={() => onSelectProject(proj.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                      activeProject.id === proj.id
                        ? "bg-indigo-500/10 border-indigo-500 shadow-md shadow-indigo-500/5"
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    }`}
                    id={`project-card-${proj.id}`}
                  >
                    <div className="space-y-1">
                      <h4 className={`font-sans font-semibold text-xs transition ${activeProject.id === proj.id ? "text-indigo-400 font-bold" : "text-slate-100 group-hover:text-white"}`}>{proj.name}</h4>
                      <p className="text-[10px] text-slate-400 max-w-[180px] truncate">{proj.description}</p>
                      <div className="flex items-center gap-2 font-mono text-[9px] text-slate-500 pt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{proj.frameCount} frames @ 10fps</span>
                      </div>
                    </div>
                    
                    {/* Delete project button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(proj.id);
                      }}
                      className="p-1.5 text-slate-600 hover:text-rose-500 rounded-md hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Delete Project"
                      id={`delete-project-${proj.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. OPTIMIZER TAB */}
        {activeTab === "optimizer" && (
          <div className="space-y-4 animate-fade-in">
            {/* Overview Box */}
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-2">
              <span className="font-sans font-semibold text-xs text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400 fill-current" />
                AI Sequence Continuity Expansion
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                The Gemini model will parse your base prompt, style presets, locked characters and camera metrics. It will automatically build detailed scheduled frames with smooth motion instructions.
              </p>
            </div>

            {/* Prompt Schedule Visualizer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase text-slate-400">Current Action Schedule</span>
                <button
                  onClick={onOptimizePrompts}
                  disabled={isOptimizing}
                  className="px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-500 text-white font-sans font-semibold text-[10px] rounded-md transition flex items-center gap-1 cursor-pointer"
                  id="ai-optimize-prompts-btn"
                >
                  <Cpu className="w-3 h-3" /> {isOptimizing ? "COHESION PASS..." : "AI OPTIMIZE PASS"}
                </button>
              </div>

              <div className="space-y-2 font-mono">
                {activeProject.schedule.map((item, index) => (
                  <div key={item.id} className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1.5 relative overflow-hidden" id={`schedule-item-${item.id}`}>
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-indigo-500"></div>
                    
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-indigo-400 font-bold">INTERVAL #{index + 1}</span>
                      <span className="text-slate-300 bg-black/40 px-2 py-0.5 rounded border border-white/10">
                        Frames {item.startFrame} - {item.endFrame} ({(item.endFrame - item.startFrame + 1) / activeProject.fps}s)
                      </span>
                    </div>

                    <div className="space-y-1 text-xs font-sans">
                      <span className="text-slate-400 block font-mono text-[9px] uppercase">LOCKED MOTION</span>
                      <span className="text-slate-200 font-semibold">{item.action}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/5">
                      <span className="text-slate-500">Weight: {item.promptWeight}x</span>
                      <span className="text-slate-500">Cohesion: Excellent</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. VIDEO HUB TAB */}
        {activeTab === "video" && (
          <div className="space-y-4 animate-fade-in">
            {/* Video to Image Frame Extractor */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase text-slate-400 block">Video Frame Extractor</span>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  isDragging 
                    ? "border-indigo-500 bg-indigo-500/5" 
                    : uploadedVideo 
                      ? "border-indigo-500/50 bg-white/5" 
                      : "border-white/10 hover:border-white/20 bg-black/10"
                }`}
                id="video-dropzone"
              >
                <Video className="w-8 h-8 text-slate-500 mx-auto mb-2.5" />
                {uploadedVideo ? (
                  <div className="space-y-1">
                    <p className="text-xs font-sans font-semibold text-indigo-400 truncate">{uploadedVideo.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Size: {(uploadedVideo.size / 1024 / 1024).toFixed(1)} MB</p>
                    <button
                      onClick={() => setUploadedVideo(null)}
                      className="text-[9px] text-rose-400 underline hover:text-rose-300 mt-1 cursor-pointer"
                    >
                      Remove Video
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-center">
                    <p className="text-xs font-sans font-semibold text-slate-300">Drag &amp; Drop Video Here</p>
                    <p className="text-[10px] text-slate-500 font-mono">Supports MP4, MOV, WEBM up to 20MB</p>
                    <label className="inline-block mt-2 px-3 py-1 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-[10px] font-semibold rounded cursor-pointer transition">
                      SELECT FILE
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setUploadedVideo(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Extraction settings */}
            {uploadedVideo && (
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[9px] uppercase text-slate-400">Extract Target FPS</span>
                  <select 
                    value={targetFps} 
                    onChange={(e) => setTargetFps(parseInt(e.target.value))} 
                    className="bg-black/40 border border-white/10 rounded px-2 py-0.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                    id="video-hub-target-fps"
                  >
                    <option value={5} className="bg-slate-900">5 FPS</option>
                    <option value={10} className="bg-slate-900">10 FPS</option>
                    <option value={24} className="bg-slate-900">24 FPS</option>
                  </select>
                </div>
                <button
                  onClick={() => onExtractVideo("custom")}
                  disabled={isExtracting}
                  className="w-full py-1.5 bg-indigo-600 text-white font-sans font-semibold text-xs rounded-lg hover:bg-indigo-500 transition cursor-pointer"
                  id="extract-custom-video-btn"
                >
                  {isExtracting ? "EXTRACTING FRAMES..." : "EXTRACT & POPULATE TIMELINE"}
                </button>
              </div>
            )}

            {/* Preloaded High-Quality Consistent Feeds (Developer Craft) */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase text-slate-400 block">Preloaded Consistency Sources</span>
              <p className="text-[10px] text-slate-500 font-sans mb-2 leading-relaxed">
                No custom video on hand? Instantly extract perfectly aligned, temporally consistent sequences from high-fidelity source feeds:
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => onExtractVideo("forest")}
                  disabled={isExtracting}
                  className="w-full p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-between text-left transition group cursor-pointer"
                  id="extract-forest-feed-btn"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-sans font-semibold text-slate-200 block group-hover:text-white">Forest Rain Sequence</span>
                    <span className="text-[9px] text-indigo-400 font-mono block">Realistic (10 FPS, 30 Frames)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
                </button>

                <button
                  onClick={() => onExtractVideo("spaceship")}
                  disabled={isExtracting}
                  className="w-full p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-between text-left transition group cursor-pointer"
                  id="extract-space-feed-btn"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-sans font-semibold text-slate-200 block group-hover:text-white">Nebula Space Voyage</span>
                    <span className="text-[9px] text-indigo-400 font-mono block">Cyberpunk Space (10 FPS, 30 Frames)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
                </button>

                <button
                  onClick={() => onExtractVideo("cheetah")}
                  disabled={isExtracting}
                  className="w-full p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-between text-left transition group cursor-pointer"
                  id="extract-cheetah-feed-btn"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-sans font-semibold text-slate-200 block group-hover:text-white">Neon Cyber Cheetah</span>
                    <span className="text-[9px] text-indigo-400 font-mono block">High-Motion Run (10 FPS, 30 Frames)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>

            {/* Video to Animation Style Transfer */}
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <span className="font-mono text-[10px] uppercase text-indigo-400 block font-bold">Animation Transfer Engine</span>
              <p className="text-[10px] text-slate-400 leading-normal">
                Redistribute and render all current extracted frames with a completely fresh target style reference:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {["Anime", "Cyberpunk", "Pixel Art", "Watercolor"].map(st => (
                  <button
                    key={st}
                    onClick={() => onStyleTransfer(st)}
                    className="py-1.5 bg-black/40 border border-white/10 rounded text-[10px] hover:border-indigo-500 text-slate-300 hover:text-white transition cursor-pointer"
                    id={`style-transfer-${st}-btn`}
                  >
                    TO {st.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. EXPORT TAB */}
        {activeTab === "export" && (
          <div className="space-y-4 animate-fade-in">
            {/* Format Selection Cards */}
            <div className="space-y-2.5">
              <span className="font-mono text-[10px] uppercase text-slate-400 block">Select Target Package Format</span>

              <div className="space-y-2">
                <button
                  onClick={() => onExport("gif")}
                  className="w-full p-3.5 bg-white/5 border border-white/10 hover:border-indigo-500/60 rounded-xl flex items-center justify-between text-left transition group cursor-pointer"
                  id="export-gif-btn"
                >
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-sans font-bold text-slate-200 group-hover:text-white">Animated GIF Package</h5>
                    <p className="text-[10px] text-slate-500 font-sans">Compiles timeline frames into a self-contained smooth playback image loop.</p>
                  </div>
                  <Download className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition" />
                </button>

                <button
                  onClick={() => onExport("zip")}
                  className="w-full p-3.5 bg-white/5 border border-white/10 hover:border-indigo-500/60 rounded-xl flex items-center justify-between text-left transition group cursor-pointer"
                  id="export-png-seq-btn"
                >
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-sans font-bold text-slate-200 group-hover:text-white">PNG Sequence Archive (.zip)</h5>
                    <p className="text-[10px] text-slate-500 font-sans">Lossless high-definition independent frame files for After Effects compilation.</p>
                  </div>
                  <Download className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition" />
                </button>

                <button
                  onClick={() => onExport("mp4")}
                  className="w-full p-3.5 bg-white/5 border border-white/10 hover:border-indigo-500/60 rounded-xl flex items-center justify-between text-left transition group cursor-pointer"
                  id="export-mp4-btn"
                >
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-sans font-bold text-slate-200 group-hover:text-white">MPEG-4 H.264 Video (.mp4)</h5>
                    <p className="text-[10px] text-slate-500 font-sans">Direct hardware accelerated video export supporting Web Video standard.</p>
                  </div>
                  <Download className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition" />
                </button>
              </div>
            </div>

            {/* Render queue status overlay */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 font-mono">
              <span className="text-[9px] uppercase text-indigo-400 block font-bold tracking-wider">Active Render Queue</span>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Completed frames:</span>
                  <span className="text-indigo-400 font-bold">
                    {activeProject.frames.filter(f => f.imageUrl).length} / {activeProject.frames.length}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-300"
                    style={{ width: `${(activeProject.frames.filter(f => f.imageUrl).length / activeProject.frames.length) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Render Thread: Idle</span>
                  <span>ETA: ~0s</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
