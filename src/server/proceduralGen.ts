// Procedural vector illustration generator for FrameFlow AI fallback mode.
// This generates visually stunning, highly consistent, frame-by-frame animated SVG data-URIs
// that represent character lock, background lock, camera lock, and specific styles.

export interface GenerationParams {
  prompt: string;
  index: number;
  totalFrames: number;
  fps: number;
  locks: {
    characterLock: boolean;
    backgroundLock: boolean;
    cameraLock: boolean;
    characterDetails: {
      face: string;
      eyes: string;
      hair: string;
      clothes: string;
      age: string;
      body: string;
      accessories: string;
    };
    backgroundDetails: {
      description: string;
      timeOfDay: string;
      skyState: string;
      weather: string;
      staticObjects: string;
    };
    cameraDetails: {
      position: string;
      angle: string;
      height: string;
      distance: string;
      lens: string;
      fov: string;
      motion: string;
    };
  };
  movement: {
    walk: boolean;
    run: boolean;
    talk: boolean;
    blink: boolean;
    handMovement: boolean;
    hairMovement: boolean;
    wind: boolean;
    expressions: string;
  };
  style: string;
}

export function generateProceduralFrame(params: GenerationParams): string {
  const { prompt, index, totalFrames, locks, movement, style } = params;
  
  // Phase of animation (loops or cycles over time)
  const t = (index - 1) / (params.fps || 10);
  const cycle = t * Math.PI * 2; // Full circle oscillation per second
  
  // Clean prompt parsing for keywords to decide the "scene type"
  const text = prompt.toLowerCase();
  let theme = 'forest'; // default
  if (text.includes('space') || text.includes('nebula') || text.includes('star') || text.includes('galaxy') || text.includes('spaceship')) {
    theme = 'space';
  } else if (text.includes('city') || text.includes('cyberpunk') || text.includes('street') || text.includes('neon') || text.includes('futuristic')) {
    theme = 'cyberpunk';
  } else if (text.includes('ocean') || text.includes('water') || text.includes('sea') || text.includes('beach')) {
    theme = 'ocean';
  } else if (text.includes('cheetah') || text.includes('animal') || text.includes('cat') || text.includes('dog')) {
    theme = 'animal';
  } else if (text.includes('desert') || text.includes('sand') || text.includes('dune')) {
    theme = 'desert';
  }

  // Derive styles colors and filters based on style choice
  let filterEffect = '';
  let colorOverlay = '';
  let strokeWidth = '1.5';
  let strokeColor = '#00000033';
  let fontStyle = 'font-family: sans-serif;';
  
  switch (style) {
    case 'Anime':
      colorOverlay = '<rect width="100%" height="100%" fill="#ff00ff" opacity="0.04" mix-blend-mode="color-burn"/>';
      strokeWidth = '1';
      strokeColor = '#1f1e33';
      break;
    case 'Disney':
    case 'Pixar':
      colorOverlay = '<rect width="100%" height="100%" fill="#ffaa00" opacity="0.05" mix-blend-mode="soft-light"/>';
      strokeWidth = '0.5';
      strokeColor = '#5c4033';
      break;
    case 'Cyberpunk':
      colorOverlay = '<rect width="100%" height="100%" fill="#00ffff" opacity="0.07" mix-blend-mode="color-dodge"/>';
      strokeWidth = '2';
      strokeColor = '#ff0055';
      break;
    case 'Pixel Art':
      filterEffect = 'filter="url(#pixelate)"';
      strokeWidth = '3';
      strokeColor = '#000000';
      break;
    case 'Watercolor':
      filterEffect = 'filter="url(#watercolor-paper)"';
      strokeWidth = '0.8';
      strokeColor = '#4b556355';
      break;
    case 'Oil Painting':
      filterEffect = 'filter="url(#oil-texture)"';
      strokeWidth = '0.1';
      break;
    case 'Realistic':
    default:
      strokeWidth = '0.2';
      strokeColor = '#00000022';
      break;
  }

  // Determine Camera offset (Camera Lock disables motion, else we zoom or pan slightly)
  let camX = 0;
  let camY = 0;
  let camZoom = 1.0;
  if (!locks.cameraLock) {
    const motionType = locks.cameraDetails.motion.toLowerCase();
    if (motionType.includes('pan') || text.includes('pan') || text.includes('walking') || text.includes('running')) {
      camX = Math.sin(cycle * 0.2) * 30;
    } else if (motionType.includes('tilt') || text.includes('tilt')) {
      camY = Math.cos(cycle * 0.2) * 20;
    } else if (motionType.includes('zoom') || text.includes('zoom') || text.includes('slowly walking')) {
      camZoom = 1.0 + Math.sin(cycle * 0.15) * 0.08;
    } else {
      // Default subtle handheld float
      camX = Math.sin(cycle * 0.4) * 2;
      camY = Math.cos(cycle * 0.5) * 1.5;
    }
  }

  // Generate SVG parts
  let svgContent = '';
  
  // 1. Gradients and Definitions
  svgContent += `
    <defs>
      <!-- Pixelate Filter -->
      <filter id="pixelate" x="0%" y="0%" width="100%" height="100%">
        <feFlood flood-opacity="0" result="transparent" />
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues="0 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1" />
          <feFuncG type="discrete" tableValues="0 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1" />
          <feFuncB type="discrete" tableValues="0 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1" />
        </feComponentTransfer>
      </filter>
      
      <!-- Glow filter for cyberpunk -->
      <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- Watercolor Texture -->
      <filter id="watercolor-paper">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.07 0" />
        <feComposite operator="in" in2="SourceGraphic" />
      </filter>

      <!-- Gradients -->
      <linearGradient id="forest-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1e293b" />
        <stop offset="60%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1e3a1e" />
      </linearGradient>
      <linearGradient id="cyber-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#090514" />
        <stop offset="60%" stop-color="#120c28" />
        <stop offset="100%" stop-color="#2a0845" />
      </linearGradient>
      <linearGradient id="space-sky" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#020005" />
        <stop offset="50%" stop-color="#05021a" />
        <stop offset="100%" stop-color="#0b001d" />
      </linearGradient>
      <linearGradient id="ocean-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="50%" stop-color="#bae6fd" />
        <stop offset="100%" stop-color="#f0f9ff" />
      </linearGradient>
      <linearGradient id="desert-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f97316" />
        <stop offset="40%" stop-color="#fdba74" />
        <stop offset="100%" stop-color="#fef3c7" />
      </linearGradient>
      
      <radialGradient id="nebula-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ff00aa" stop-opacity="0.35" />
        <stop offset="50%" stop-color="#3b82f6" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fef08a" stop-opacity="1" />
        <stop offset="100%" stop-color="#fef08a" stop-opacity="0" />
      </radialGradient>
    </defs>
  `;

  // Start transformation group based on Camera Lock parameters
  svgContent += `<g ${filterEffect} transform="scale(${camZoom}) translate(${camX}, ${camY})">`;

  // 2. BACKGROUND RENDERING (Dependent on theme, static unless camera moves, perfectly preserved if background is locked)
  switch (theme) {
    case 'space':
      svgContent += `<rect width="800" height="450" fill="url(#space-sky)" />`;
      // Nebulae
      svgContent += `<circle cx="300" cy="200" r="280" fill="url(#nebula-glow)" />`;
      svgContent += `<circle cx="550" cy="150" r="220" fill="url(#nebula-glow)" transform="rotate(30, 550, 150)" />`;
      // Stars (perfectly static background)
      const starSeed = 42; // static seed for background lock
      for (let s = 0; s < 40; s++) {
        const sx = ((s * 33) + 7) % 800;
        const sy = ((s * 77) + 13) % 450;
        const size = (s % 3 === 0) ? 2 : 1;
        const opacity = 0.3 + (Math.sin(cycle + s) * 0.4); // subtle twinkling
        svgContent += `<circle cx="${sx}" cy="${sy}" r="${size}" fill="#ffffff" opacity="${opacity}" />`;
      }
      break;

    case 'cyberpunk':
      svgContent += `<rect width="800" height="450" fill="url(#cyber-sky)" />`;
      // City skyline (background lock ensures same skyscrapers)
      svgContent += `<g opacity="0.25">`;
      for (let i = 0; i < 15; i++) {
        const w = 40 + (i % 3) * 15;
        const h = 150 + (i % 4) * 40;
        const x = i * 60 - 20;
        svgContent += `<rect x="${x}" y="${450 - h}" width="${w}" height="${h}" fill="#0d0415" />`;
      }
      svgContent += `</g>`;
      // Mid-ground buildings with neon outlines
      svgContent += `<g opacity="0.6">`;
      for (let i = 0; i < 8; i++) {
        const w = 60 + (i % 2) * 25;
        const h = 100 + (i % 3) * 60;
        const x = i * 110 + 20;
        const neonColor = i % 2 === 0 ? '#ff007f' : '#00f0ff';
        svgContent += `
          <rect x="${x}" y="${450 - h}" width="${w}" height="${h}" fill="#160c2c" stroke="${neonColor}" stroke-width="1.5" />
          <!-- Neon Window Rows -->
          <line x1="${x + 10}" y1="${450 - h + 30}" x2="${x + w - 10}" y2="${450 - h + 30}" stroke="${neonColor}" stroke-width="1" stroke-dasharray="2, 4" />
          <line x1="${x + 10}" y1="${450 - h + 60}" x2="${x + w - 10}" y2="${450 - h + 60}" stroke="${neonColor}" stroke-width="1" stroke-dasharray="2, 4" />
        `;
      }
      svgContent += `</g>`;
      // Wet slick street floor
      svgContent += `
        <rect x="0" y="380" width="800" height="70" fill="#080312" />
        <line x1="0" y1="380" x2="800" y2="380" stroke="#ff0055" stroke-width="2" filter="url(#neon-glow)" />
        <!-- Floor Reflections -->
        <ellipse cx="200" cy="410" rx="150" ry="8" fill="#ff007f" opacity="0.2" filter="url(#neon-glow)" />
        <ellipse cx="600" cy="415" rx="120" ry="6" fill="#00f0ff" opacity="0.2" filter="url(#neon-glow)" />
      `;
      break;

    case 'ocean':
      svgContent += `<rect width="800" height="450" fill="url(#ocean-sky)" />`;
      // Distant sun
      svgContent += `<circle cx="400" cy="220" r="120" fill="url(#sun-glow)" />`;
      svgContent += `<circle cx="400" cy="220" r="45" fill="#fffbe6" />`;
      // Mountains/Islands
      svgContent += `<path d="M-50,280 Q150,180 300,280 T700,280 T850,280 L850,450 L-50,450 Z" fill="#38bdf8" opacity="0.3" />`;
      // Sea Water Waves
      svgContent += `<rect x="0" y="270" width="800" height="180" fill="#0284c7" />`;
      // Wave lines (animated based on cycle if wind or water is active)
      const waveOffset = movement.wind ? Math.sin(cycle) * 15 : 0;
      svgContent += `
        <path d="M 0 280 Q 200 ${280 + Math.sin(cycle)*5} 400 280 T 800 280 L 800 450 L 0 450 Z" fill="#0369a1" opacity="0.8" />
        <path d="M 0 310 Q 250 ${310 + Math.cos(cycle)*8} 500 310 T 800 310 L 800 450 L 0 450 Z" fill="#075985" opacity="0.6" />
        <path d="M 0 350 Q 150 ${350 + Math.sin(cycle + 1)*10} 450 350 T 800 350 L 800 450 L 0 450 Z" fill="#0c4a6e" />
      `;
      break;

    case 'desert':
      svgContent += `<rect width="800" height="450" fill="url(#desert-sky)" />`;
      // Huge setting sun
      svgContent += `<circle cx="550" cy="240" r="160" fill="#f97316" opacity="0.3" />`;
      svgContent += `<circle cx="550" cy="240" r="80" fill="#facc15" />`;
      // Sand Dunes (perfect static background lock unless camera pans)
      svgContent += `
        <path d="M -100 330 Q 150 220 400 330 T 900 330 L 900 450 L -100 450 Z" fill="#ca8a04" opacity="0.8" />
        <path d="M -50 360 Q 300 270 600 360 T 1000 360 L 1000 450 L -50 450 Z" fill="#a16207" />
        <path d="M 0 400 Q 200 340 500 400 T 900 400 L 900 450 L 0 450 Z" fill="#854d0e" />
      `;
      break;

    case 'forest':
    default:
      svgContent += `<rect width="800" height="450" fill="url(#forest-sky)" />`;
      // Misty background lights
      svgContent += `
        <circle cx="200" cy="180" r="160" fill="#22c55e" opacity="0.1" filter="url(#neon-glow)" />
        <circle cx="600" cy="150" r="140" fill="#15803d" opacity="0.1" filter="url(#neon-glow)" />
      `;
      // Distant Forest Trees (static background)
      svgContent += `<g opacity="0.25">`;
      for (let i = 0; i < 12; i++) {
        const tx = i * 80 + (i % 3) * 15;
        const th = 260 + (i % 4) * 40;
        const tw = 25 + (i % 2) * 10;
        svgContent += `
          <rect x="${tx}" y="${380 - th}" width="${tw}" height="${th}" fill="#0f172a" />
          <polygon points="${tx - 20},${380 - th} ${tx + tw/2},${320 - th} ${tx + tw + 20},${380 - th}" fill="#14532d" />
        `;
      }
      svgContent += `</g>`;
      // Near ground bushes and forest floor
      svgContent += `
        <rect x="0" y="380" width="800" height="70" fill="#14532d" />
        <ellipse cx="150" cy="385" rx="120" ry="15" fill="#166534" />
        <ellipse cx="550" cy="390" rx="180" ry="20" fill="#166534" />
      `;
      break;
  }

  // 3. CHARACTER RENDERING & MOVEMENT (Includes character-lock details + movement state)
  // Determine position of character on screen
  let posX = 400;
  let posY = 310;
  
  // Custom configurations for lock overrides
  const hairColor = locks.characterLock ? (locks.characterDetails.hair.toLowerCase().includes('blonde') ? '#fef08a' : locks.characterDetails.hair.toLowerCase().includes('red') ? '#f97316' : '#27272a') : '#3b82f6';
  const jacketColor = locks.characterLock ? (locks.characterDetails.clothes.toLowerCase().includes('yellow') ? '#eab308' : locks.characterDetails.clothes.toLowerCase().includes('red') ? '#ef4444' : '#10b981') : '#db2777';
  
  if (theme === 'space') {
    // Character is a Spaceship
    // Animate ship flying, engine pulsing
    const enginePulse = 10 + Math.sin(cycle * 3) * 4;
    const hoverOffset = Math.sin(cycle * 1.5) * 12;
    posX = 400;
    posY = 200 + hoverOffset;
    
    svgContent += `
      <!-- Thruster fire (pulsing) -->
      <path d="M ${posX - 85} ${posY} Q ${posX - 120 - enginePulse} ${posY} ${posX - 85} ${posY + 15} Z" fill="#ff4500" filter="url(#neon-glow)" />
      <path d="M ${posX - 85} ${posY + 5} Q ${posX - 105 - enginePulse/2} ${posY + 7.5} ${posX - 85} ${posY + 10} Z" fill="#ffff00" />
      
      <!-- Ship Wing Back -->
      <polygon points="${posX - 40},${posY - 40} ${posX - 10},${posY - 10} ${posX - 60},${posY - 5}" fill="#1e293b" stroke="#384252" stroke-width="${strokeWidth}" />
      
      <!-- Ship Body (Sleek futuristic drone/craft) -->
      <path d="M ${posX - 70} ${posY - 10} Q ${posX} ${posY - 25} ${posX + 80} ${posY} Q ${posX} ${posY + 25} ${posX - 70} ${posY + 10} Z" fill="#e2e8f0" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
      
      <!-- Cockpit Glow -->
      <path d="M ${posX + 10} ${posY - 8} Q ${posX + 35} ${posY - 10} ${posX + 50} ${posY} Q ${posX + 25} ${posY + 8} ${posX + 10} ${posY} Z" fill="#00ffff" opacity="0.8" filter="url(#neon-glow)" />
      
      <!-- Top Fins -->
      <polygon points="${posX - 30},${posY - 15} ${posX - 10},${posY - 35} ${posX},${posY - 15}" fill="#cbd5e1" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
      
      <!-- Wing Front -->
      <polygon points="${posX - 40},${posY + 40} ${posX - 10},${posY + 10} ${posX - 60},${posY + 5}" fill="#475569" stroke="#64748b" stroke-width="${strokeWidth}" />
    `;
  } else if (theme === 'animal') {
    // Character is a Cyber Cheetah running
    const runCycle = cycle * 2.5; // Running legs cycle faster
    posX = 350 + Math.sin(cycle * 0.2) * 50; // runs forward/back slightly
    posY = 320;
    
    const leg1Angle = Math.sin(runCycle) * 35;
    const leg2Angle = Math.sin(runCycle + Math.PI) * 35;
    const tailAngle = Math.sin(runCycle * 0.8) * 15;
    
    svgContent += `
      <!-- Cybernetic Running Cat -->
      <!-- Tail -->
      <path d="M ${posX - 60} ${posY - 15} Q ${posX - 90} ${posY - 40 + tailAngle} ${posX - 120} ${posY - 20}" fill="none" stroke="#ff00aa" stroke-width="6" stroke-linecap="round" filter="url(#neon-glow)" />
      
      <!-- Back legs -->
      <g transform="rotate(${leg2Angle}, ${posX - 40}, ${posY + 10})">
        <line x1="${posX - 40}" y1="${posY + 10}" x2="${posX - 50}" y2="${posY + 40}" stroke="#00ffff" stroke-width="7" stroke-linecap="round" />
        <line x1="${posX - 50}" y1="${posY + 40}" x2="${posX - 35}" y2="${posY + 60}" stroke="#00ffff" stroke-width="5" stroke-linecap="round" />
      </g>
      <g transform="rotate(${leg1Angle}, ${posX - 30}, ${posY + 10})">
        <line x1="${posX - 30}" y1="${posY + 10}" x2="${posX - 40}" y2="${posY + 40}" stroke="#1e293b" stroke-width="7" stroke-linecap="round" />
        <line x1="${posX - 40}" y1="${posY + 40}" x2="${posX - 25}" y2="${posY + 60}" stroke="#1e293b" stroke-width="5" stroke-linecap="round" />
      </g>
      
      <!-- Torso -->
      <rect x="${posX - 60}" y="${posY - 25}" width="110" height="40" rx="15" fill="#0f172a" stroke="#ff00aa" stroke-width="2.5" />
      <line x1="${posX - 40}" y1="${posY - 5}" x2="${posX + 20}" y2="${posY - 5}" stroke="#ff00aa" stroke-width="3" filter="url(#neon-glow)" />
      
      <!-- Front legs -->
      <g transform="rotate(${leg1Angle}, ${posX + 30}, ${posY + 10})">
        <line x1="${posX + 30}" y1="${posY + 10}" x2="${posX + 45}" y2="${posY + 40}" stroke="#00ffff" stroke-width="7" stroke-linecap="round" />
        <line x1="${posX + 45}" y1="${posY + 40}" x2="${posX + 60}" y2="${posY + 55}" stroke="#00ffff" stroke-width="5" stroke-linecap="round" />
      </g>
      <g transform="rotate(${leg2Angle}, ${posX + 40}, ${posY + 10})">
        <line x1="${posX + 40}" y1="${posY + 10}" x2="${posX + 55}" y2="${posY + 40}" stroke="#1e293b" stroke-width="7" stroke-linecap="round" />
        <line x1="${posX + 55}" y1="${posY + 40}" x2="${posX + 70}" y2="${posY + 55}" stroke="#1e293b" stroke-width="5" stroke-linecap="round" />
      </g>
      
      <!-- Head -->
      <path d="M ${posX + 40} ${posY - 35} L ${posX + 75} ${posY - 25} L ${posX + 60} ${posY - 5} L ${posX + 35} ${posY - 10} Z" fill="#1e293b" stroke="#ff00aa" stroke-width="2" />
      <!-- Glowing Eyes -->
      <ellipse cx="${posX + 58}" cy="${posY - 23}" rx="4" ry="2" fill="#00ffff" filter="url(#neon-glow)" />
      <!-- Ears -->
      <polygon points="${posX + 42},${posY - 35} ${posX + 45},${posY - 50} ${posX + 52},${posY - 35}" fill="#0f172a" stroke="#ff00aa" stroke-width="1.5" />
    `;
  } else {
    // Human Character (e.g. Walking Girl)
    const activeWalk = movement.walk || text.includes('walk') || text.includes('walking');
    const activeRun = movement.run || text.includes('run') || text.includes('running') || text.includes('chase');
    const handWave = movement.handMovement || text.includes('hand') || text.includes('wave') || text.includes('waving');
    const talkMotion = movement.talk || text.includes('talk') || text.includes('talking') || text.includes('singing');
    const eyeBlink = movement.blink && (index % 8 === 0 || index % 9 === 0);
    
    // Animate walking vertical bob
    let bob = 0;
    let limbAngle = 0;
    if (activeRun) {
      bob = Math.sin(cycle * 3.0) * 10;
      limbAngle = Math.sin(cycle * 3.0) * 45;
    } else if (activeWalk) {
      bob = Math.abs(Math.sin(cycle * 1.5)) * -6;
      limbAngle = Math.sin(cycle * 1.5) * 28;
    } else {
      // Breathing idle motion
      bob = Math.sin(cycle * 0.5) * 2.5;
    }
    
    const charY = posY + bob;
    
    // Hair blow motion
    const windBlow = movement.wind || text.includes('wind') || text.includes('breeze') || text.includes('storm');
    const hairOffset = windBlow ? Math.sin(cycle * 2.5) * 12 + 8 : Math.sin(cycle * 0.5) * 2;
    
    svgContent += `
      <g id="character-group">
        <!-- Back Arm -->
        <g transform="rotate(${-limbAngle}, ${posX}, ${charY - 60})">
          <line x1="${posX}" y1="${charY - 60}" x2="${posX - 10}" y2="${charY - 20}" stroke="#000" stroke-opacity="0.15" stroke-width="12" stroke-linecap="round" />
          <line x1="${posX}" y1="${charY - 60}" x2="${posX - 10}" y2="${charY - 20}" stroke="${jacketColor}" stroke-width="10" stroke-linecap="round" />
        </g>

        <!-- Back Leg -->
        <g transform="rotate(${limbAngle}, ${posX}, ${charY - 15})">
          <line x1="${posX}" y1="${charY - 15}" x2="${posX - 15}" y2="${charY + 25}" stroke="#27272a" stroke-width="13" stroke-linecap="round" />
          <line x1="${posX - 15}" y1="${charY + 25}" x2="${posX - 22}" y2="${charY + 65}" stroke="#1f2937" stroke-width="10" stroke-linecap="round" />
          <!-- Boot -->
          <path d="M ${posX - 25} ${charY + 60} L ${posX - 40} ${charY + 65} L ${posX - 20} ${charY + 70} Z" fill="#000" />
        </g>
        
        <!-- Front Leg -->
        <g transform="rotate(${-limbAngle}, ${posX}, ${charY - 15})">
          <line x1="${posX}" y1="${charY - 15}" x2="${posX + 15}" y2="${charY + 25}" stroke="#4b5563" stroke-width="13" stroke-linecap="round" />
          <line x1="${posX + 15}" y1="${charY + 25}" x2="${posX + 22}" y2="${charY + 65}" stroke="#374151" stroke-width="10" stroke-linecap="round" />
          <!-- Boot -->
          <path d="M ${posX + 18} ${charY + 60} L ${posX + 35} ${charY + 65} L ${posX + 23} ${charY + 70} Z" fill="#111" />
        </g>

        <!-- Torso / Raincoat Coat -->
        <path d="M ${posX - 22} ${charY - 65} L ${posX + 22} ${charY - 65} L ${posX + 28} ${charY - 15} L ${posX - 28} ${charY - 15} Z" fill="${jacketColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
        
        <!-- Yellow Raincoat Hood Back -->
        <path d="M ${posX - 22} ${charY - 65} Q ${posX} ${charY - 95} ${posX + 20} ${charY - 65} Z" fill="${jacketColor}" opacity="0.8" />

        <!-- Head / Neck -->
        <rect x="${posX - 7}" y="${charY - 76}" width="14" height="15" fill="#fbcfe8" rx="2" />
        <circle cx="${posX}" cy="${charY - 88}" r="17" fill="#fbcfe8" stroke="${strokeColor}" stroke-width="${strokeWidth}" />

        <!-- Hair Back (Behind Face) -->
        <path d="M ${posX - 18} ${charY - 98} Q ${posX - 25 - hairOffset} ${charY - 80} ${posX - 18} ${charY - 68} L ${posX + 18} ${charY - 68} Q ${posX + 25 + hairOffset} ${charY - 80} ${posX + 18} ${charY - 98} Z" fill="${hairColor}" />
        
        <!-- Face Features -->
        <!-- Eyes (Blinking support) -->
        ${eyeBlink ? `
          <line x1="${posX + 4}" y1="${charY - 88}" x2="${posX + 11}" y2="${charY - 88}" stroke="#000" stroke-width="2.5" />
        ` : `
          <circle cx="${posX + 7}" cy="${charY - 89}" r="2" fill="#000" />
          <ellipse cx="${posX + 7}" cy="${charY - 89}" rx="1.5" ry="2.5" fill="#22c55e" /> <!-- Green eyes -->
          <circle cx="${posX + 7.5}" cy="${charY - 90}" r="0.5" fill="#fff" />
        `}

        <!-- Mouth (Talking support) -->
        ${talkMotion ? `
          <ellipse cx="${posX + 8}" cy="${charY - 80}" rx="3.5" ry="${2.5 + Math.sin(cycle * 4)*1.5}" fill="#991b1b" />
        ` : `
          <path d="M ${posX + 5} ${charY - 80} Q ${posX + 8} ${charY - 78} ${posX + 11} ${charY - 80}" fill="none" stroke="#991b1b" stroke-width="1.5" stroke-linecap="round" />
        `}

        <!-- Cheek blush -->
        <circle cx="${posX + 12}" cy="${charY - 83}" r="2" fill="#f43f5e" opacity="0.4" />

        <!-- Hair Front / Bangs -->
        <path d="M ${posX - 18} ${charY - 95} Q ${posX} ${charY - 105} ${posX + 18} ${charY - 95} Q ${posX + 10} ${charY - 88} ${posX} ${charY - 92} Q ${posX - 12} ${charY - 88} ${posX - 18} ${charY - 95} Z" fill="${hairColor}" />
        
        <!-- Hood Edge Rim -->
        <path d="M ${posX - 18} ${charY - 70} Q ${posX - 10} ${charY - 104} ${posX} ${charY - 105} Q ${posX + 14} ${charY - 102} ${posX + 18} ${charY - 70}" fill="none" stroke="${jacketColor}" stroke-width="4.5" />

        <!-- Front Arm -->
        <g transform="rotate(${handWave ? -60 + Math.sin(cycle * 3)*25 : limbAngle}, ${posX}, ${charY - 60})">
          <line x1="${posX}" y1="${charY - 60}" x2="${posX + 15}" y2="${charY - 22}" stroke="${jacketColor}" stroke-width="11" stroke-linecap="round" />
          <circle cx="${posX + 15}" cy="${charY - 22}" r="6.5" fill="#fbcfe8" />
        </g>
      </g>
    `;
  }

  // 4. Close Scene transformation group
  svgContent += `</g>`;

  // 5. Stylistic Overlay filters for vintage texture/shading
  svgContent += colorOverlay;
  
  // Render current watermark parameters visually inside the frame grid if needed for professional feedback
  svgContent += `
    <!-- Frame metadata watermark overlay -->
    <rect x="15" y="15" width="150" height="42" rx="6" fill="#000000aa" backdrop-filter="blur(10px)" />
    <text x="25" y="32" font-size="11" fill="#10b981" font-family="monospace">Frame ${index.toString().padStart(3, '0')} / ${totalFrames.toString().padStart(3, '0')}</text>
    <text x="25" y="46" font-size="9" fill="#94a3b8" font-family="monospace">${(index / params.fps).toFixed(2)}s @ ${params.fps} FPS</text>
    
    <rect x="635" y="15" width="150" height="42" rx="6" fill="#000000aa" />
    <text x="645" y="32" font-size="11" fill="#38bdf8" font-family="monospace">Lock: ${locks.characterLock ? 'C' : '-'}${locks.backgroundLock ? 'B' : '-'}${locks.cameraLock ? 'K' : '-'}</text>
    <text x="645" y="46" font-size="9" fill="#94a3b8" font-family="monospace">Style: ${style}</text>
  `;

  const finalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">${svgContent}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(finalSvg).toString('base64')}`;
}
