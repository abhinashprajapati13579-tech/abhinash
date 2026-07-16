export interface CharacterDetails {
  face: string;
  eyes: string;
  hair: string;
  clothes: string;
  age: string;
  body: string;
  accessories: string;
}

export interface BackgroundDetails {
  description: string;
  timeOfDay: string;
  skyState: string;
  weather: string;
  staticObjects: string;
}

export interface CameraDetails {
  position: string;
  angle: string;
  height: string;
  distance: string;
  lens: string;
  fov: string;
  motion: string;
}

export interface LocksState {
  characterLock: boolean;
  backgroundLock: boolean;
  cameraLock: boolean;
  characterDetails: CharacterDetails;
  backgroundDetails: BackgroundDetails;
  cameraDetails: CameraDetails;
}

export interface MovementSettings {
  walk: boolean;
  run: boolean;
  talk: boolean;
  blink: boolean;
  handMovement: boolean;
  hairMovement: boolean;
  wind: boolean;
  expressions: string; // 'neutral' | 'happy' | 'sad' | 'excited' | 'angry' | 'surprised'
}

export interface SceneMemory {
  characterPrompt: string;
  backgroundPrompt: string;
  lightingPrompt: string;
  weatherPrompt: string;
  cameraPrompt: string;
  aspectRatio: string; // '1:1' | '16:9' | '9:16' | '3:4' | '4:3'
  style: string; // 'Realistic' | 'Anime' | 'Disney' | 'Pixar' | '3D' | 'Cartoon' | 'Fantasy' | 'Cyberpunk' | 'Pixel Art' | 'Watercolor' | 'Oil Painting'
  colorPalette: string;
  negativePrompt: string;
  seed: number;
  cfgScale: number;
  inferenceSteps: number;
}

export interface PromptScheduleItem {
  id: string;
  startFrame: number;
  endFrame: number;
  action: string;
  promptWeight: number; // 0.1 to 2.0
}

export interface AnimationFrame {
  id: string;
  index: number; // 1-indexed
  prompt: string;
  negativePrompt: string;
  imageUrl: string;
  beforeImageUrl?: string; // For comparing edit results
  isGenerated: boolean;
  seed: number;
  locked: boolean;
  scheduleAction?: string;
  timestamp?: number;
}

export interface GenerationJob {
  id: string;
  frameIndex: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0 to 100
  prompt: string;
  error?: string;
}

export interface AnimationProject {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  fps: number; // e.g. 10
  duration: number; // seconds
  frameCount: number; // fps * duration
  basePrompt: string;
  negativePrompt: string;
  selectedModel: string; // 'google-imagen' | 'gemini-image' | 'sdxl' | 'flux' | 'veo-video'
  sceneMemory: SceneMemory;
  locks: LocksState;
  movement: MovementSettings;
  schedule: PromptScheduleItem[];
  frames: AnimationFrame[];
  queue: GenerationJob[];
}
