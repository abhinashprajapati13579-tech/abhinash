import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { generateProceduralFrame, GenerationParams } from "./src/server/proceduralGen.js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Path to storage
const PROJECTS_FILE = path.join(process.cwd(), "projects.json");

// Helper to load/save projects
function loadProjects(): any[] {
  if (!fs.existsSync(PROJECTS_FILE)) {
    // Generate default preloaded samples
    const defaultProjects = createDefaultProjects();
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(defaultProjects, null, 2));
    return defaultProjects;
  }
  try {
    const data = fs.readFileSync(PROJECTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading projects, returning defaults:", err);
    return createDefaultProjects();
  }
}

function saveProjects(projects: any[]) {
  try {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
  } catch (err) {
    console.error("Error saving projects:", err);
  }
}

// Lazy Gemini API Client Initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    throw new Error("GEMINI_API_KEY environment variable is missing. Please add it via Settings > Secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Default Projects Builder
function createDefaultProjects(): any[] {
  return [
    {
      id: "proj_forest_girl",
      name: "Forest Rain Sequence",
      description: "A girl walking slowly in a dense redwood forest under foggy morning drizzle.",
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now(),
      fps: 10,
      duration: 3,
      frameCount: 30,
      basePrompt: "A girl is walking slowly in a misty green forest, wearing a bright yellow raincoat.",
      negativePrompt: "low quality, blurry, deformed face, changing background, camera shake",
      selectedModel: "google-imagen",
      sceneMemory: {
        characterPrompt: "A girl with a shoulder-length bob chestnut hair, emerald eyes, age 22, wearing a yellow raincoat and boots",
        backgroundPrompt: "misty redwood forest with green moss, giant tree trunks, thick fog, morning atmosphere",
        lightingPrompt: "soft diffused lighting, foggy morning haze",
        weatherPrompt: "gentle rain drizzle, light mist",
        cameraPrompt: "eye-level, wide lens 35mm, dolly track movement",
        aspectRatio: "16:9",
        style: "Realistic",
        colorPalette: "earthy, emerald green, rain yellow, soft gray",
        negativePrompt: "noisy, modern city, cars, neon",
        seed: 8827,
        cfgScale: 7.5,
        inferenceSteps: 25
      },
      locks: {
        characterLock: true,
        backgroundLock: true,
        cameraLock: true,
        characterDetails: {
          face: "symmetrical, high cheekbones, gentle smile",
          eyes: "emerald green, round",
          hair: "chestnut brown, shoulder-length bob with bangs",
          clothes: "bright yellow rain jacket with hood, black collar",
          age: "22",
          body: "slender, medium height",
          accessories: "small silver hoop earrings"
        },
        backgroundDetails: {
          description: "primeval giant forest with towering mossy trunks",
          timeOfDay: "morning",
          skyState: "overcast and white fog",
          weather: "drizzling rain",
          staticObjects: "large static hollow redwood trunk on right, mossy ferns on left"
        },
        cameraDetails: {
          position: "centered, tracking dolly",
          angle: "eye-level",
          height: "1.4m",
          distance: "3m medium-full shot",
          lens: "35mm cinematic",
          fov: "65 degrees",
          motion: "slow smooth linear dolly forward"
        }
      },
      movement: {
        walk: true,
        run: false,
        talk: false,
        blink: true,
        handMovement: false,
        hairMovement: true,
        wind: true,
        expressions: "neutral"
      },
      schedule: [
        { id: "s1", startFrame: 1, endFrame: 12, action: "walking slowly", promptWeight: 1.0 },
        { id: "s2", startFrame: 13, endFrame: 22, action: "stopping and turning head", promptWeight: 1.2 },
        { id: "s3", startFrame: 23, endFrame: 30, action: "smiling and waving slowly", promptWeight: 1.5 }
      ],
      frames: Array.from({ length: 30 }).map((_, i) => ({
        id: `frame_${i + 1}`,
        index: i + 1,
        prompt: `A girl is walking slowly in a misty green forest, wearing a bright yellow raincoat. Frame ${i + 1}`,
        negativePrompt: "low quality, blurry, changing background",
        imageUrl: "",
        isGenerated: false,
        seed: 8827 + i,
        locked: false,
        scheduleAction: i < 12 ? "walking slowly" : (i < 22 ? "stopping and turning head" : "smiling and waving slowly")
      })),
      queue: []
    },
    {
      id: "proj_space_voyage",
      name: "Nebula Voyage",
      description: "A futuristic scout spaceship navigating a glowing stellar violet nebula.",
      createdAt: Date.now() - 7200000,
      updatedAt: Date.now(),
      fps: 10,
      duration: 3,
      frameCount: 30,
      basePrompt: "A sleek silver spaceship gliding gracefully through a glowing violet nebula with blue solar flares.",
      negativePrompt: "low quality, text, logos, planets colliding",
      selectedModel: "flux",
      sceneMemory: {
        characterPrompt: "A sleek spearhead silver spaceship, blue glowing engines",
        backgroundPrompt: "stellar dust, violet and deep navy space, glowing nebulae clouds",
        lightingPrompt: "luminescent ambient backlighting from nebula",
        weatherPrompt: "solar wind ripples",
        cameraPrompt: "cinematic tracking pan",
        aspectRatio: "16:9",
        style: "Cyberpunk",
        colorPalette: "indigo, electric pink, violet, deep space black",
        negativePrompt: "stars shaking, debris",
        seed: 1420,
        cfgScale: 8.0,
        inferenceSteps: 30
      },
      locks: {
        characterLock: true,
        backgroundLock: true,
        cameraLock: false,
        characterDetails: {
          face: "sleek cockpit glass visor",
          eyes: "blue scanner lights",
          hair: "none",
          clothes: "carbon-reinforced plating",
          age: "new",
          body: "aerodynamic delta-wing design",
          accessories: "two high-frequency antennas"
        },
        backgroundDetails: {
          description: "cosmic clouds of hydrogen and interstellar stardust",
          timeOfDay: "eternal dark",
          skyState: "nebula gaseous swirls",
          weather: "magnetic storms",
          staticObjects: "distant quiescent dwarf star, celestial asteroid ring background"
        },
        cameraDetails: {
          position: "chase camera view",
          angle: "3/4 high angle",
          height: "space",
          distance: "20m flight track",
          lens: "anamorphic",
          fov: "90 degrees",
          motion: "handheld floating chase"
        }
      },
      movement: {
        walk: false,
        run: true,
        talk: false,
        blink: false,
        handMovement: false,
        hairMovement: false,
        wind: true,
        expressions: "neutral"
      },
      schedule: [
        { id: "sh1", startFrame: 1, endFrame: 15, action: "gliding through nebula", promptWeight: 1.0 },
        { id: "sh2", startFrame: 16, endFrame: 30, action: "thrusters firing, executing barrel roll", promptWeight: 1.3 }
      ],
      frames: Array.from({ length: 30 }).map((_, i) => ({
        id: `space_frame_${i + 1}`,
        index: i + 1,
        prompt: `A sleek silver spaceship gliding through violet nebula. Frame ${i + 1}`,
        negativePrompt: "low quality, blurry",
        imageUrl: "",
        isGenerated: false,
        seed: 1420 + i,
        locked: false,
        scheduleAction: i < 15 ? "gliding through nebula" : "thrusters firing, executing barrel roll"
      })),
      queue: []
    }
  ];
}

// REST API ROUTES

// 1. Projects Management
app.get("/api/projects", (req, res) => {
  const projects = loadProjects();
  // Strip frame image data to keep list lightweight
  const list = projects.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    fps: p.fps,
    frameCount: p.frameCount,
    duration: p.duration,
    selectedModel: p.selectedModel,
    basePrompt: p.basePrompt
  }));
  res.json(list);
});

app.get("/api/projects/:id", (req, res) => {
  const projects = loadProjects();
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  res.json(project);
});

app.post("/api/projects", (req, res) => {
  const { name, description, basePrompt, fps, duration, selectedModel, style } = req.body;
  const projects = loadProjects();
  
  const calculatedDuration = duration || 3;
  const calculatedFps = fps || 10;
  const totalFramesCount = calculatedFps * calculatedDuration;

  const newProject = {
    id: "proj_" + Math.random().toString(36).substring(2, 9),
    name: name || "Untitled Animation",
    description: description || "Consistent AI Animation Project",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    fps: calculatedFps,
    duration: calculatedDuration,
    frameCount: totalFramesCount,
    basePrompt: basePrompt || "A character walking",
    negativePrompt: "low quality, blurry, deformed",
    selectedModel: selectedModel || "google-imagen",
    sceneMemory: {
      characterPrompt: "A consistent character matching the prompt",
      backgroundPrompt: "A static matching background environment",
      lightingPrompt: "cinematic soft ambient",
      weatherPrompt: "clear day",
      cameraPrompt: "eye-level locked camera",
      aspectRatio: "16:9",
      style: style || "Realistic",
      colorPalette: "balanced, vivid, natural",
      negativePrompt: "noisy, blurry",
      seed: Math.floor(Math.random() * 9999),
      cfgScale: 7.5,
      inferenceSteps: 25
    },
    locks: {
      characterLock: true,
      backgroundLock: true,
      cameraLock: true,
      characterDetails: {
        face: "distinct, consistent features",
        eyes: "focused",
        hair: "matching style",
        clothes: "matching uniform outfit",
        age: "25",
        body: "standard proportions",
        accessories: "none"
      },
      backgroundDetails: {
        description: "clean scenic environment matching base prompt",
        timeOfDay: "daylight",
        skyState: "partly cloudy",
        weather: "fine",
        staticObjects: "matching environment markers"
      },
      cameraDetails: {
        position: "centered",
        angle: "eye-level",
        height: "1.5m",
        distance: "3m",
        lens: "50mm photo",
        fov: "45 degrees",
        motion: "locked tripod"
      }
    },
    movement: {
      walk: true,
      run: false,
      talk: false,
      blink: true,
      handMovement: false,
      hairMovement: true,
      wind: true,
      expressions: "neutral"
    },
    schedule: [
      { id: "s1", startFrame: 1, endFrame: totalFramesCount, action: "idle movement", promptWeight: 1.0 }
    ],
    frames: Array.from({ length: totalFramesCount }).map((_, i) => ({
      id: `frame_${i + 1}`,
      index: i + 1,
      prompt: `${basePrompt || "A character walking"}. Frame ${i + 1}`,
      negativePrompt: "low quality, blurry",
      imageUrl: "",
      isGenerated: false,
      seed: Math.floor(Math.random() * 9999) + i,
      locked: false,
      scheduleAction: "idle movement"
    })),
    queue: []
  };

  projects.push(newProject);
  saveProjects(projects);
  res.status(201).json(newProject);
});

app.put("/api/projects/:id", (req, res) => {
  const projects = loadProjects();
  const index = projects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Project not found" });
  }

  // Update fields
  const updatedProject = {
    ...projects[index],
    ...req.body,
    updatedAt: Date.now()
  };

  // Ensure bounds of frames list if duration or FPS changes
  if (req.body.fps || req.body.duration) {
    const newFps = req.body.fps || projects[index].fps;
    const newDur = req.body.duration || projects[index].duration;
    const newCount = newFps * newDur;
    
    let currentFrames = updatedProject.frames || [];
    if (currentFrames.length < newCount) {
      // Append extra frames
      for (let i = currentFrames.length; i < newCount; i++) {
        currentFrames.push({
          id: `frame_${i + 1}`,
          index: i + 1,
          prompt: `${updatedProject.basePrompt}. Frame ${i + 1}`,
          negativePrompt: updatedProject.negativePrompt,
          imageUrl: "",
          isGenerated: false,
          seed: Math.floor(Math.random() * 9999) + i,
          locked: false,
          scheduleAction: "idle movement"
        });
      }
    } else if (currentFrames.length > newCount) {
      // Trim frames
      currentFrames = currentFrames.slice(0, newCount);
    }
    updatedProject.frames = currentFrames;
    updatedProject.frameCount = newCount;
  }

  projects[index] = updatedProject;
  saveProjects(projects);
  res.json(updatedProject);
});

app.delete("/api/projects/:id", (req, res) => {
  const projects = loadProjects();
  const filtered = projects.filter(p => p.id !== req.params.id);
  if (filtered.length === projects.length) {
    return res.status(404).json({ error: "Project not found" });
  }
  saveProjects(filtered);
  res.json({ success: true });
});


// 2. AI Prompt Optimizer / Consistency Expansion using gemini-3.5-flash
app.post("/api/optimize-prompts", async (req, res) => {
  const { basePrompt, sceneMemory, locks, movement, schedule, frameCount, fps } = req.body;
  
  try {
    const ai = getGeminiClient();
    const systemPrompt = `
      You are an elite AI Prompt Engineering Assistant specialized in frame-by-frame video consistency (Temporal Lock).
      The user wants to generate consistent animation frames at ${fps || 10} FPS.
      
      Your task is to analyze:
      1. Base Prompt: "${basePrompt}"
      2. Style: "${sceneMemory?.style || 'Realistic'}"
      3. Character Details: ${JSON.stringify(locks?.characterDetails)}
      4. Background Details: ${JSON.stringify(locks?.backgroundDetails)}
      5. Camera Details: ${JSON.stringify(locks?.cameraDetails)}
      6. Movement Settings: ${JSON.stringify(movement)}
      7. Action Timeline Schedule: ${JSON.stringify(schedule)}

      Write a detailed, individual prompt for key frames or intervals across ${frameCount || 30} total frames.
      Keep character, hair, face, clothes, background scenery, camera angle, and style perfectly LOCKED and IDENTICAL.
      Only describe highly incremental physical movement or expressions progressing smoothly.
      
      Provide your output in valid JSON format matching this schema:
      {
        "optimizedSchedule": [
          {
            "startFrame": 1,
            "endFrame": 15,
            "action": "Description of action",
            "detailedPrompt": "Highly specific prompt including the style, character attributes, static background and the incremental motion"
          }
        ]
      }
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Optimize this sequence and output ONLY valid JSON",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });

    const data = JSON.parse(result.text.trim());
    res.json(data);
  } catch (err: any) {
    console.warn("Gemini prompt optimizer error, using mock expansion:", err.message);
    
    // Smooth fallback optimization
    const expandedSchedule = (schedule && schedule.length > 0) ? schedule.map((s: any) => ({
      startFrame: s.startFrame,
      endFrame: s.endFrame,
      action: s.action,
      detailedPrompt: `${sceneMemory?.style || 'Realistic'} painting, ${basePrompt}, character ${locks?.characterDetails?.hair} hair, ${locks?.characterDetails?.clothes} clothes. Background of ${locks?.backgroundDetails?.description}. Doing ${s.action}. Smooth frame movement.`
    })) : [
      {
        startFrame: 1,
        endFrame: frameCount || 30,
        action: "idle breathing and looking around",
        detailedPrompt: `${sceneMemory?.style || 'Realistic'} rendering of ${basePrompt}, absolute consistency. Beautiful lighting.`
      }
    ];
    
    res.json({ optimizedSchedule: expandedSchedule });
  }
});


// 3. Dynamic Frame Generator (Integrates Gemini Image API or Fallback Procedural Vector Art)
app.post("/api/generate-frame", async (req, res) => {
  const { prompt, index, totalFrames, fps, locks, movement, style, mode } = req.body;

  // Render mode: 'procedural' or 'live-gemini'
  if (mode === "live-gemini") {
    try {
      const ai = getGeminiClient();
      
      // Let's build a highly locked prompt for actual Gemini generation
      let lockedPrompt = `${prompt}. Style: ${style}. `;
      if (locks.characterLock) {
        lockedPrompt += `Character details: face ${locks.characterDetails.face}, hair ${locks.characterDetails.hair}, clothes ${locks.characterDetails.clothes}. `;
      }
      if (locks.backgroundLock) {
        lockedPrompt += `Static Background: ${locks.backgroundDetails.description}, same trees, same sky, absolutely identical surroundings. `;
      }
      if (locks.cameraLock) {
        lockedPrompt += `Camera position: ${locks.cameraDetails.position}, locked distance ${locks.cameraDetails.distance}, zero camera movement. `;
      }
      
      // Add motion description
      lockedPrompt += `Only animate the following movement: ${JSON.stringify(movement)}. Single clean frame.`;

      console.log(`Generating live image for frame ${index} with prompt:`, lockedPrompt);

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            {
              text: lockedPrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: locks.cameraDetails.fov.includes("wide") ? "16:9" : "1:1"
          }
        }
      });

      let base64Image = "";
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (base64Image) {
        return res.json({ imageUrl: base64Image, seed: Math.floor(Math.random() * 9999) });
      } else {
        throw new Error("No image part returned from Gemini");
      }

    } catch (err: any) {
      console.warn(`Live Gemini failed for frame ${index} (falling back to vector engine):`, err.message);
      // Fallback gracefully to procedural vector art
    }
  }

  // Fallback / Procedural execution
  const params: GenerationParams = {
    prompt,
    index,
    totalFrames,
    fps,
    locks,
    movement,
    style
  };

  const svgDataUrl = generateProceduralFrame(params);
  res.json({ imageUrl: svgDataUrl, seed: params.locks.characterLock ? 42 : Math.floor(Math.random() * 9999) });
});


// 4. Video-to-Image / Frame Extraction
app.post("/api/extract-video-frames", (req, res) => {
  const { sampleName, fps, totalFrames } = req.body;
  const count = totalFrames || 30;
  
  // Create beautiful consistent frames based on a theme
  const prompt = sampleName === "spaceship" 
    ? "A sleek silver spaceship gliding through nebula" 
    : (sampleName === "cheetah" ? "A cybernetic cheetah running on neon wet street" : "A girl walking in misty redwood forest");
    
  const style = sampleName === "spaceship" ? "Cyberpunk" : (sampleName === "cheetah" ? "Cyberpunk" : "Realistic");
  const theme = sampleName === "spaceship" ? "space" : (sampleName === "cheetah" ? "cyberpunk" : "forest");

  const locks = {
    characterLock: true,
    backgroundLock: true,
    cameraLock: true,
    characterDetails: {
      face: "standard", eyes: "glowing", hair: "chestnut", clothes: "jacket", age: "young", body: "fit", accessories: "earrings"
    },
    backgroundDetails: {
      description: theme, timeOfDay: "day", skyState: "foggy", weather: "rain", staticObjects: "trees"
    },
    cameraDetails: {
      position: "centered", angle: "level", height: "1.5m", distance: "3m", lens: "35mm", fov: "60", motion: "locked"
    }
  };

  const movement = {
    walk: true, run: false, talk: false, blink: true, handMovement: false, hairMovement: true, wind: true, expressions: "neutral"
  };

  // Pre-generate SVG sequences
  const extracted = Array.from({ length: count }).map((_, i) => {
    const params: GenerationParams = {
      prompt: `${prompt} (Extracted Video Frame)`,
      index: i + 1,
      totalFrames: count,
      fps: fps || 10,
      locks,
      movement,
      style
    };
    return {
      index: i + 1,
      imageUrl: generateProceduralFrame(params),
      seed: 5000 + i,
      prompt: `${prompt} (Frame ${i + 1})`
    };
  });

  res.json({
    success: true,
    frames: extracted
  });
});


// 5. Video to Animation Style Transfer
app.post("/api/transfer-animation-style", (req, res) => {
  const { frames, style, prompt } = req.body;
  if (!frames || !Array.isArray(frames)) {
    return res.status(400).json({ error: "Missing source frames list" });
  }

  // Transform each frame's metadata/styling
  const transformed = frames.map((f: any, idx: number) => {
    // Generate new procedural frame matching the selected style
    const count = frames.length;
    const isSpaceship = prompt?.toLowerCase().includes("space") || prompt?.toLowerCase().includes("nebula");
    const isCheetah = prompt?.toLowerCase().includes("cheetah") || prompt?.toLowerCase().includes("neon");
    
    const theme = isSpaceship ? "space" : (isCheetah ? "cyberpunk" : "forest");
    
    const params: GenerationParams = {
      prompt: prompt || "Animation style transfer",
      index: idx + 1,
      totalFrames: count,
      fps: 10,
      locks: {
        characterLock: true,
        backgroundLock: true,
        cameraLock: true,
        characterDetails: {
          face: "standard", eyes: "glowing", hair: "chestnut", clothes: "jacket", age: "young", body: "fit", accessories: "earrings"
        },
        backgroundDetails: {
          description: theme, timeOfDay: "day", skyState: "foggy", weather: "rain", staticObjects: "trees"
        },
        cameraDetails: {
          position: "centered", angle: "level", height: "1.5m", distance: "3m", lens: "35mm", fov: "60", motion: "locked"
        }
      },
      movement: {
        walk: true, run: false, talk: false, blink: true, handMovement: false, hairMovement: true, wind: true, expressions: "neutral"
      },
      style: style || "Anime"
    };

    return {
      ...f,
      imageUrl: generateProceduralFrame(params),
      isGenerated: true,
      timestamp: Date.now()
    };
  });

  res.json({ success: true, frames: transformed });
});


// Setup development/production Vite layers
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode (Vite middleware enabled)...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode (Serving build assets)...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FrameFlow AI Server running at http://localhost:${PORT}`);
  });
}

startServer();
