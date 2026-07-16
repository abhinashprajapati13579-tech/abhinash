import React, { useState, useEffect, useCallback } from "react";
import { AnimationProject, AnimationFrame, LocksState, SceneMemory, MovementSettings } from "./types.js";
import LeftPanel from "./components/LeftPanel.js";
import CinemaCanvas from "./components/CinemaCanvas.js";
import RightPanel from "./components/RightPanel.js";
import TimelinePanel from "./components/TimelinePanel.js";
import { Sparkles, Cpu, Layers, HelpCircle, Monitor, RefreshCw } from "lucide-react";

export default function App() {
  const [projectsList, setProjectsList] = useState<{ id: string; name: string; description: string; frameCount: number }[]>([]);
  const [activeProject, setActiveProject] = useState<AnimationProject | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(1);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [isGeneratingSingle, setIsGeneratingSingle] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [renderMode, setRenderMode] = useState<"procedural" | "live-gemini">("procedural");
  
  // Notice Banner for API configurations
  const [showConfigNotice, setShowConfigNotice] = useState(true);

  // Fetch all projects on mount
  const fetchProjectsList = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjectsList(data);
        
        // Auto-load first project if none active
        if (data.length > 0 && !activeProject) {
          loadProjectDetails(data[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading projects list:", err);
    }
  }, [activeProject]);

  useEffect(() => {
    fetchProjectsList();
  }, [fetchProjectsList]);

  // Load a single detailed project
  const loadProjectDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const project = await res.json();
        setActiveProject(project);
        setCurrentFrameIndex(1);
      }
    } catch (err) {
      console.error("Error loading project details:", err);
    }
  };

  // Create a new project
  const handleCreateProject = async (name: string, prompt: string, style: string) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, basePrompt: prompt, style })
      });
      if (res.ok) {
        const newProj = await res.json();
        setProjectsList(prev => [...prev, {
          id: newProj.id,
          name: newProj.name,
          description: newProj.description,
          frameCount: newProj.frameCount
        }]);
        setActiveProject(newProj);
        setCurrentFrameIndex(1);
      }
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  // Delete a project
  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjectsList(prev => prev.filter(p => p.id !== id));
        if (activeProject?.id === id) {
          setActiveProject(null);
        }
        // Reload projects list to trigger default first selection
        fetchProjectsList();
      }
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  // Push updates to database on local adjustments (autosave)
  const syncProjectChanges = async (updatedProj: AnimationProject) => {
    if (!updatedProj) return;
    try {
      await fetch(`/api/projects/${updatedProj.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProj)
      });
    } catch (err) {
      console.error("Error autosaving project state:", err);
    }
  };

  // State wrappers for active project nested values
  const handleSetLocks = (newLocks: LocksState) => {
    if (!activeProject) return;
    const updated = { ...activeProject, locks: newLocks };
    setActiveProject(updated);
    syncProjectChanges(updated);
  };

  const handleSetSceneMemory = (newMemory: SceneMemory) => {
    if (!activeProject) return;
    const updated = { ...activeProject, sceneMemory: newMemory };
    setActiveProject(updated);
    syncProjectChanges(updated);
  };

  const handleSetMovement = (newMovement: MovementSettings) => {
    if (!activeProject) return;
    const updated = { ...activeProject, movement: newMovement };
    setActiveProject(updated);
    syncProjectChanges(updated);
  };

  const handleSetModel = (newModel: string) => {
    if (!activeProject) return;
    const updated = { ...activeProject, selectedModel: newModel };
    setActiveProject(updated);
    syncProjectChanges(updated);
  };

  const handleSetBasePrompt = (newPrompt: string) => {
    if (!activeProject) return;
    const updated = { ...activeProject, basePrompt: newPrompt };
    setActiveProject(updated);
    syncProjectChanges(updated);
  };

  const handleSetNegativePrompt = (newPrompt: string) => {
    if (!activeProject) return;
    const updated = { ...activeProject, negativePrompt: newPrompt };
    setActiveProject(updated);
    syncProjectChanges(updated);
  };

  const handleSetFps = (newFps: number) => {
    if (!activeProject) return;
    const updated = { ...activeProject, fps: newFps };
    setActiveProject(updated);
    syncProjectChanges(updated);
  };

  // Trigger prompt schedule optimizer using gemini-3.5-flash
  const handleOptimizePrompts = async () => {
    if (!activeProject) return;
    setIsOptimizing(true);
    try {
      const res = await fetch("/api/optimize-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basePrompt: activeProject.basePrompt,
          sceneMemory: activeProject.sceneMemory,
          locks: activeProject.locks,
          movement: activeProject.movement,
          schedule: activeProject.schedule,
          frameCount: activeProject.frameCount,
          fps: activeProject.fps
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.optimizedSchedule && data.optimizedSchedule.length > 0) {
          // Re-map frame instructions and updates
          const updatedFrames = activeProject.frames.map((frame) => {
            const index = frame.index;
            const match = data.optimizedSchedule.find((s: any) => index >= s.startFrame && index <= s.endFrame);
            return {
              ...frame,
              prompt: match ? match.detailedPrompt : frame.prompt,
              scheduleAction: match ? match.action : frame.scheduleAction
            };
          });

          // Convert optimized schedule to model list
          const updatedSchedule = data.optimizedSchedule.map((s: any, idx: number) => ({
            id: `opt_${idx}`,
            startFrame: s.startFrame,
            endFrame: s.endFrame,
            action: s.action,
            promptWeight: 1.0
          }));

          const updatedProject = {
            ...activeProject,
            frames: updatedFrames,
            schedule: updatedSchedule
          };
          setActiveProject(updatedProject);
          syncProjectChanges(updatedProject);
        }
      }
    } catch (err) {
      console.error("Cohesion optimization failed:", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Extract frames from pre-baked or uploaded video feeds
  const handleExtractVideo = async (sampleName: string) => {
    if (!activeProject) return;
    setIsExtracting(true);
    try {
      const res = await fetch("/api/extract-video-frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sampleName,
          fps: activeProject.fps,
          totalFrames: activeProject.frameCount
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.frames) {
          // Map extracted frames onto timeline
          const updatedFrames = activeProject.frames.map((frame, idx) => {
            const extracted = data.frames[idx] || data.frames[data.frames.length - 1];
            return {
              ...frame,
              imageUrl: extracted.imageUrl,
              isGenerated: true,
              seed: extracted.seed,
              prompt: extracted.prompt
            };
          });

          const updatedProject = { ...activeProject, frames: updatedFrames };
          setActiveProject(updatedProject);
          syncProjectChanges(updatedProject);
          setCurrentFrameIndex(1);
        }
      }
    } catch (err) {
      console.error("Frame extraction error:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  // Video-to-Animation style transfer
  const handleStyleTransfer = async (targetStyle: string) => {
    if (!activeProject) return;
    setIsExtracting(true);
    try {
      const res = await fetch("/api/transfer-animation-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frames: activeProject.frames,
          style: targetStyle,
          prompt: activeProject.basePrompt
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.frames) {
          const updatedProject = {
            ...activeProject,
            frames: data.frames,
            sceneMemory: {
              ...activeProject.sceneMemory,
              style: targetStyle
            }
          };
          setActiveProject(updatedProject);
          syncProjectChanges(updatedProject);
          setCurrentFrameIndex(1);
        }
      }
    } catch (err) {
      console.error("Style transfer error:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  // Generate an individual frame
  const handleGenerateSingleFrame = async (frameIndex: number) => {
    if (!activeProject) return;
    setIsGeneratingSingle(true);
    
    const frame = activeProject.frames.find(f => f.index === frameIndex);
    if (!frame) return;

    try {
      const res = await fetch("/api/generate-frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: frame.prompt,
          index: frame.index,
          totalFrames: activeProject.frameCount,
          fps: activeProject.fps,
          locks: activeProject.locks,
          movement: activeProject.movement,
          style: activeProject.sceneMemory.style,
          mode: renderMode
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        const updatedFrames = activeProject.frames.map(f => {
          if (f.index === frameIndex) {
            return {
              ...f,
              imageUrl: data.imageUrl,
              beforeImageUrl: f.imageUrl || undefined, // capture before-and-after
              isGenerated: true,
              seed: data.seed
            };
          }
          return f;
        });

        const updatedProject = { ...activeProject, frames: updatedFrames };
        setActiveProject(updatedProject);
        syncProjectChanges(updatedProject);
      }
    } catch (err) {
      console.error(`Frame ${frameIndex} generation failed:`, err);
    } finally {
      setIsGeneratingSingle(false);
    }
  };

  // Generate all frames sequentially (Queue processing)
  const handleGenerateAll = async () => {
    if (!activeProject || isGeneratingAll) return;
    setIsGeneratingAll(true);

    try {
      let currentProj = activeProject;
      for (let i = 0; i < currentProj.frames.length; i++) {
        const frame = currentProj.frames[i];
        
        // Skip locked generated frames to save computations, otherwise render
        if (frame.locked && frame.imageUrl) continue;

        setCurrentFrameIndex(frame.index);
        
        const res = await fetch("/api/generate-frame", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: frame.prompt,
            index: frame.index,
            totalFrames: currentProj.frameCount,
            fps: currentProj.fps,
            locks: currentProj.locks,
            movement: currentProj.movement,
            style: currentProj.sceneMemory.style,
            mode: renderMode
          })
        });

        if (res.ok) {
          const data = await res.json();
          
          const updatedFrames = currentProj.frames.map(f => {
            if (f.index === frame.index) {
              return {
                ...f,
                imageUrl: data.imageUrl,
                isGenerated: true,
                seed: data.seed
              };
            }
            return f;
          });

          const updatedProject = { ...currentProj, frames: updatedFrames };
          setActiveProject(updatedProject);
          syncProjectChanges(updatedProject);
          currentProj = updatedProject;
        }
        
        // Slight interval between rendering frames for visuals
        await new Promise(resolve => setTimeout(resolve, 80));
      }
    } catch (err) {
      console.error("Timeline rendering failed:", err);
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // Frame operations from timeline panel
  const handleDeleteFrame = (index: number) => {
    if (!activeProject || activeProject.frames.length <= 1) return;
    
    const updatedFrames = activeProject.frames
      .filter(f => f.index !== index)
      .map((f, idx) => ({ ...f, index: idx + 1 })); // re-index

    const updatedProject = {
      ...activeProject,
      frames: updatedFrames,
      frameCount: updatedFrames.length,
      duration: updatedFrames.length / activeProject.fps
    };
    setActiveProject(updatedProject);
    syncProjectChanges(updatedProject);
    setCurrentFrameIndex(Math.max(1, index - 1));
  };

  const handleDuplicateFrame = (index: number) => {
    if (!activeProject) return;
    
    const sourceFrame = activeProject.frames.find(f => f.index === index);
    if (!sourceFrame) return;

    const newFrame: AnimationFrame = {
      ...sourceFrame,
      id: `frame_dup_${Math.random().toString(36).substring(2, 6)}`,
      index: index + 1,
      isGenerated: !!sourceFrame.imageUrl,
      locked: false
    };

    const updatedFrames = [...activeProject.frames];
    updatedFrames.splice(index, 0, newFrame);
    
    // Re-index remaining frames
    const reindexed = updatedFrames.map((f, idx) => ({ ...f, index: idx + 1 }));

    const updatedProject = {
      ...activeProject,
      frames: reindexed,
      frameCount: reindexed.length,
      duration: reindexed.length / activeProject.fps
    };
    setActiveProject(updatedProject);
    syncProjectChanges(updatedProject);
    setCurrentFrameIndex(index + 1);
  };

  const handleInsertFrame = (index: number) => {
    if (!activeProject) return;

    const blankFrame: AnimationFrame = {
      id: `frame_ins_${Math.random().toString(36).substring(2, 6)}`,
      index: index + 1,
      prompt: `${activeProject.basePrompt}. Frame ${index + 1}`,
      negativePrompt: activeProject.negativePrompt,
      imageUrl: "",
      isGenerated: false,
      seed: Math.floor(Math.random() * 9999),
      locked: false
    };

    const updatedFrames = [...activeProject.frames];
    updatedFrames.splice(index, 0, blankFrame);
    
    const reindexed = updatedFrames.map((f, idx) => ({ ...f, index: idx + 1 }));

    const updatedProject = {
      ...activeProject,
      frames: reindexed,
      frameCount: reindexed.length,
      duration: reindexed.length / activeProject.fps
    };
    setActiveProject(updatedProject);
    syncProjectChanges(updatedProject);
    setCurrentFrameIndex(index + 1);
  };

  const handleMoveFrameLeft = (index: number) => {
    if (!activeProject || index <= 1) return;
    
    const updated = [...activeProject.frames];
    // swap
    const temp = updated[index - 1];
    updated[index - 1] = updated[index - 2];
    updated[index - 2] = temp;

    const reindexed = updated.map((f, idx) => ({ ...f, index: idx + 1 }));
    const updatedProject = { ...activeProject, frames: reindexed };
    setActiveProject(updatedProject);
    syncProjectChanges(updatedProject);
    setCurrentFrameIndex(index - 1);
  };

  const handleMoveFrameRight = (index: number) => {
    if (!activeProject || index >= activeProject.frames.length) return;

    const updated = [...activeProject.frames];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;

    const reindexed = updated.map((f, idx) => ({ ...f, index: idx + 1 }));
    const updatedProject = { ...activeProject, frames: reindexed };
    setActiveProject(updatedProject);
    syncProjectChanges(updatedProject);
    setCurrentFrameIndex(index + 1);
  };

  const handleToggleFrameLock = (index: number) => {
    if (!activeProject) return;

    const updatedFrames = activeProject.frames.map(f => {
      if (f.index === index) {
        return { ...f, locked: !f.locked };
      }
      return f;
    });

    const updatedProject = { ...activeProject, frames: updatedFrames };
    setActiveProject(updatedProject);
    syncProjectChanges(updatedProject);
  };

  // Trigger download action of animations
  const handleExport = (format: "gif" | "png" | "zip" | "mp4") => {
    if (!activeProject) return;

    // Filter frames that actually have generated content
    const renderedFrames = activeProject.frames.filter(f => f.imageUrl);
    if (renderedFrames.length === 0) {
      alert("Please render at least one frame before exporting.");
      return;
    }

    if (format === "png" || format === "zip") {
      // Trigger sequence downloads
      renderedFrames.forEach((frame) => {
        const link = document.createElement("a");
        link.href = frame.imageUrl;
        link.download = `${activeProject.name.toLowerCase().replace(/\s+/g, "_")}_frame_${frame.index.toString().padStart(3, "0")}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } else {
      // Compiled GIF or Simulated MP4 container trigger
      const link = document.createElement("a");
      // Grab first or last render as container, or sequence animation
      link.href = renderedFrames[0].imageUrl;
      link.download = `${activeProject.name.toLowerCase().replace(/\s+/g, "_")}_compiled.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!activeProject) {
    return (
      <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center p-6 text-slate-100 font-sans relative overflow-hidden">
        {/* Glow ambient blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/30 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-fuchsia-900/20 rounded-full blur-[100px]"></div>
        </div>
        <div className="z-10 p-8 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col items-center justify-center max-w-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center mb-4 animate-pulse">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">Initializing Studio Interface...</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">Constituting FrameFlow Temporal Continuity Engine.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-slate-100 flex flex-col font-sans select-none overflow-hidden relative">
      {/* Background ambient blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] bg-indigo-950/20 rounded-full blur-[130px]"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[600px] h-[600px] bg-fuchsia-950/15 rounded-full blur-[110px]"></div>
      </div>

      {/* Header Info Notification */}
      {showConfigNotice && (
        <div className="bg-black/40 backdrop-blur-md border-b border-white/10 px-4 py-2.5 flex items-center justify-between text-xs font-sans z-20">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-white/80">
              <strong>Studio Mode:</strong> Running with consistent local <strong className="text-indigo-300">Vector Illustration Engine</strong> fallback. Configure <strong className="text-fuchsia-300">GEMINI_API_KEY</strong> in <strong>Settings &gt; Secrets</strong> to unlock actual photorealistic Imagen generations!
            </span>
          </div>
          <button
            onClick={() => setShowConfigNotice(false)}
            className="text-[10px] text-white/40 hover:text-white underline font-mono cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Main Multi-Panel Workbench Layout */}
      <div className="flex-1 flex overflow-hidden z-10 relative">
        {/* Left Control Column */}
        <div className="w-[320px] shrink-0 h-full">
          <LeftPanel
            locks={activeProject.locks}
            setLocks={handleSetLocks}
            sceneMemory={activeProject.sceneMemory}
            setSceneMemory={handleSetSceneMemory}
            movement={activeProject.movement}
            setMovement={handleSetMovement}
            selectedModel={activeProject.selectedModel}
            setSelectedModel={handleSetModel}
            basePrompt={activeProject.basePrompt}
            setBasePrompt={handleSetBasePrompt}
            negativePrompt={activeProject.negativePrompt}
            setNegativePrompt={handleSetNegativePrompt}
            mode={renderMode}
            setMode={setRenderMode}
            onGenerateAll={handleGenerateAll}
            isGeneratingAny={isGeneratingAll}
          />
        </div>

        {/* Center Canvas & Timeline Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black/10">
          {/* Main Cinema Viewport */}
          <div className="flex-1 relative">
            <CinemaCanvas
              frames={activeProject.frames}
              currentFrameIndex={currentFrameIndex}
              setCurrentFrameIndex={setCurrentFrameIndex}
              fps={activeProject.fps}
              setFps={handleSetFps}
              onGenerateSingleFrame={handleGenerateSingleFrame}
              isGeneratingFrame={isGeneratingSingle}
            />
          </div>

          {/* Bottom Animation Timeline Scrubber */}
          <div className="h-[200px] shrink-0">
            <TimelinePanel
              frames={activeProject.frames}
              currentFrameIndex={currentFrameIndex}
              setCurrentFrameIndex={setCurrentFrameIndex}
              onDeleteFrame={handleDeleteFrame}
              onDuplicateFrame={handleDuplicateFrame}
              onInsertFrame={handleInsertFrame}
              onMoveFrameLeft={handleMoveFrameLeft}
              onMoveFrameRight={handleMoveFrameRight}
              onToggleFrameLock={handleToggleFrameLock}
              onRegenerateFrame={handleGenerateSingleFrame}
              isGeneratingAny={isGeneratingAll || isGeneratingSingle}
            />
          </div>
        </div>

        {/* Right Orchestrations Column */}
        <div className="w-[340px] shrink-0 h-full">
          <RightPanel
            projectsList={projectsList}
            activeProject={activeProject}
            onSelectProject={loadProjectDetails}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            onOptimizePrompts={handleOptimizePrompts}
            onExtractVideo={handleExtractVideo}
            onStyleTransfer={handleStyleTransfer}
            onExport={handleExport}
            isOptimizing={isOptimizing}
            isExtracting={isExtracting}
          />
        </div>
      </div>
    </div>
  );
}
