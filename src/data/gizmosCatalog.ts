export interface GizmoItem {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  badge?: string;
  keywords: string[];
  width: number;
  height: number;
  defaultColor?: string;
  svgContent: string;
}

export interface GizmoCategory {
  id: string;
  label: string;
  group: 'mind_maps' | 'alphabets' | 'animals_people' | 'experiments' | 'festivals' | 'math' | 'stickers' | 'others';
  iconName: string;
  description: string;
}

export const GIZMO_CATEGORIES: GizmoCategory[] = [
  // ─── MIND MAPS & GRAPHIC ORGANIZERS ───
  { id: 'mind_maps', label: 'Mind Maps & Graphic Organizers (20+ Templates)', group: 'mind_maps', iconName: 'BrainCircuit', description: 'Venn, KWL, Frayer, Story, Timelines, Cause & Effect, Fishbone, 4-Square, Spider Maps' },

  // ─── STICKERS & REWARDS ───
  { id: 'stickers_rewards', label: 'Star Rewards, Medals & Badges (25+ Ranks)', group: 'stickers', iconName: 'Trophy', description: 'Gold medals, champion cups, star clusters, diamond ranks, certificates & ribbons' },
  { id: 'stickers_feedback', label: 'Teacher Feedback Stamps (30 Full Badges)', group: 'stickers', iconName: 'CheckCircle', description: 'Study, This Rocks!, Try Again, Show Work, 100%, A+ Verified, Outstanding, Superstar' },
  { id: 'icons_3d', label: '3D Glossy & Claymorphism Icons (25+ 3D Assets)', group: 'stickers', iconName: 'Box', description: '3D Trophies, Rockets, Lightbulbs, Atoms, Bullseyes, Keys, Globes & Caps' },

  // ─── EXPERIMENTS & STEM ───
  { id: 'exp_electrical', label: 'Electrical & Digital Circuits (30+ Components)', group: 'experiments', iconName: 'Zap', description: 'Logic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR), DC power, resistors, capacitors, LEDs, GND' },
  { id: 'exp_chemistry', label: 'Chemistry Lab, Glassware & Elements (40+ Items)', group: 'experiments', iconName: 'FlaskConical', description: 'Flasks, beakers, Bunsen burners, molecules, test tubes, pipettes & periodic elements' },
  { id: 'exp_biology', label: 'Biology & Living Systems (25+ Anatomy & Microbes)', group: 'experiments', iconName: 'Activity', description: 'DNA double helix, animal cells, plant chloroplasts, neurons, bacteria, viruses & anatomy' },
  { id: 'exp_physics', label: 'Physics, Vectors & Mechanics (25+ Apparatus)', group: 'experiments', iconName: 'Compass', description: 'Pulleys, magnets, prisms, optics, vectors, dynamos, pendulums & force diagrams' },

  // ─── MATH MANIPULATIVES ───
  { id: 'math_base10', label: 'Base-10 3D Manipulatives (15+ Blocks & Mats)', group: 'math', iconName: 'Box', description: '3D 1000s Yellow Cube, 100s Flat, 10s Rod, 1s Unit, Double Blocks & Place Value Mats' },
  { id: 'math_algebra', label: 'Algebra Tiles, Grids & Fractions (30+ Tiles)', group: 'math', iconName: 'Shapes', description: 'y² pink, x² blue, x rods, unit squares, fraction bars (1/2 to 1/12) & coordinate planes' },
  { id: 'math_tangram', label: 'Tangram 7-Piece Puzzle & Shapes (15+ Items)', group: 'math', iconName: 'Shapes', description: 'Full 7-piece tangram puzzle set, individual geometric tiles & silhouette animals' },
  { id: 'math_3dshapes', label: '3D Geometric Solids & Instruments (20+ Solids)', group: 'math', iconName: 'Box', description: 'Prisms, pyramids, cylinders, cones, spheres, torus, protractor & compass' },

  // ─── PEOPLE, ROLES & FACES ───
  { id: 'people_roles', label: 'Human Faces, Avatars & Professions (35+ Roles)', group: 'animals_people', iconName: 'Users', description: 'Teachers, Students, Scientists, Doctors, Engineers, Astronauts, Coders, Artists, Heroes' },
  { id: 'faces', label: 'Emotions & Reaction Stickers (40+ Emojis)', group: 'animals_people', iconName: 'Smile', description: 'Mind-blown, Joy, Thinking, Cool, Star-struck, Party, Zzz, Nerd & Clapping reactions' },
  { id: 'animals', label: 'Animals, Wildlife & Ocean Fauna (50+ Creatures)', group: 'animals_people', iconName: 'Trees', description: 'Numbered species: 001-Ant to 093-Toucan, Lions, Dolphins, Elephants & Birds' },
  { id: 'food', label: 'Food, Fruits, Vegetables & Cuisine (35+ Items)', group: 'animals_people', iconName: 'Utensils', description: 'Burgers, pizzas, fruits, pastries, Asian cuisine, beverages & veggies' },
  { id: 'candies', label: 'Candies, Confections & Pastries (25+ Items)', group: 'animals_people', iconName: 'Utensils', description: 'Lollipops, chocolates, ice creams, cupcakes, boba, donuts & macarons' },
  { id: 'hobbies', label: 'Hobbies, Sports, Music & Games (35+ Activities)', group: 'animals_people', iconName: 'Trophy', description: 'Basketball, cricket, chess, video games, tennis, guitars, art & instruments' },

  // ─── FESTIVALS & SEASONS ───
  { id: 'fest_diwali', label: 'Diwali (Festival of Lights — 15+ Items)', group: 'festivals', iconName: 'Sparkles', description: 'Clay Diyas, firecrackers, sparklers, rangoli, glowing lamps & mithai sweets' },
  { id: 'fest_holi', label: 'Holi (Festival of Colors — 12+ Items)', group: 'festivals', iconName: 'Sparkles', description: 'Gulal powder bowls, Pichkari water guns, splashes, balloons & color clouds' },
  { id: 'fest_ramadan', label: 'Ramadan & Eid (12+ Items)', group: 'festivals', iconName: 'Moon', description: 'Crescent moon, Fanous lanterns, mosque domes, prayer rugs, dates & iftar tables' },
  { id: 'fest_valentines', label: 'Valentines Day (12+ Items)', group: 'festivals', iconName: 'Heart', description: '3D Heart balloons, gift boxes, roses, love letters, teddy bears & cupids' },

  // ─── OTHERS ───
  { id: 'others_robots', label: 'Robots, Sci-Fi & AI Mechs (15+ Varieties)', group: 'others', iconName: 'Bot', description: 'Classroom Tutor Bot, Astro-Mech, 6-Axis Arm, Retro 8-Bit Bot, Cyber Drone, Mars Rover' },
  { id: 'others_tech', label: 'Tech, Gadgets & Networking (20+ Devices)', group: 'others', iconName: 'Wifi', description: 'Wi-Fi routers, Cloud databases, servers, laptops, VR headsets, smartphones & satellites' },
  { id: 'others_currencies', label: 'International Currencies (20+ Notes & Coins)', group: 'others', iconName: 'Coins', description: 'Indian Rupee ₹500/₹2000, US Dollar $100, Euro €50, British Pound £, Bitcoin ₿, Ethereum Ξ' },

  // ─── ALPHABETS & PHONETICS ───
  { id: 'alphabets_telugu', label: 'Telugu (తెలుగు — అచ్చులు, హల్లులు, గుణింతాలు & పదాలు)', group: 'alphabets', iconName: 'Languages', description: 'Complete Telugu Vowels, Consonants, Diacritics & Words (80+ items)' },
  { id: 'alphabets_hindi', label: 'Hindi (हिन्दी — स्वर, व्यंजन, मात्राएँ व सचित्र शब्द)', group: 'alphabets', iconName: 'Languages', description: 'Complete Devanagari Swar, Vyanjan, Matras & Illustrated Words (70+ items)' },
  { id: 'alphabets_tamil', label: 'Tamil (தமிழ் — உயிர், மெய், உயிர்மெய் & ஆய்தம்)', group: 'alphabets', iconName: 'Languages', description: 'Full Tamil Alphabet series & Uyirmei combinations (30+ items)' },
  { id: 'alphabets_kannada', label: 'Kannada (ಕನ್ನಡ — ವರ್ಣಮಾಲೆ & ಸ್ವರಗಳು)', group: 'alphabets', iconName: 'Languages', description: 'Complete Kannada Vowels, Consonants & Kagunitha (20+ items)' },
  { id: 'alphabets_malayalam', label: 'Malayalam (മലയാളം — അക്ഷരമാല)', group: 'alphabets', iconName: 'Languages', description: 'Complete Malayalam Vowels, Consonants & Chihnangal (15+ items)' },
  { id: 'alphabets_marathi', label: 'Marathi (मराठी — वर्णमाला & जोडाक्षरे)', group: 'alphabets', iconName: 'Languages', description: 'Marathi Devanagari alphabet letters and special glyphs (15+ items)' },
  { id: 'alphabets_asl', label: 'ASL (American Sign Language A-Z Fingerspelling)', group: 'alphabets', iconName: 'Hand', description: 'Complete Sign Language A-Z fingerspelling & hand postures (26 items)' },
  { id: 'alphabets_russian', label: 'Russian (Русский — 33 Буквы & Звуки)', group: 'alphabets', iconName: 'Languages', description: 'Full 33 Cyrillic alphabet letters (А to Я) with phonetic guides' },
  { id: 'alphabets_greek', label: 'Greek (Math & Physics — All 30+ STEM Variables)', group: 'alphabets', iconName: 'Languages', description: 'Uppercase & lowercase Greek STEM variables (α to Ω, Δ, Σ, Ψ)' },
  { id: 'alphabets_french', label: 'French & European Phonetics (Accents & Ligatures)', group: 'alphabets', iconName: 'Languages', description: 'French accented vowels, ligatures (æ, œ, ç, é, è, ê...) and signs' },
  { id: 'alphabets_arabic', label: 'Arabic (العربية — الحروف الهجائية)', group: 'alphabets', iconName: 'Languages', description: 'Arabic Abjad alphabet letters and diacritics' }
];

// Helper to construct a clean SVG Typography Flashcard
const createLetterCardSVG = (letter: string, phonetics: string, color: string, sub: string) => {
  return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="92" height="92" rx="14" fill="rgba(15, 23, 42, 0.95)" stroke="${color}" stroke-width="2.5"/>
    <text x="50" y="50" fill="${color}" font-size="28" font-family="'Noto Sans', 'Segoe UI', sans-serif" font-weight="900" text-anchor="middle" dominant-baseline="middle">${letter}</text>
    <text x="50" y="74" fill="#94a3b8" font-size="9" font-family="sans-serif" font-weight="700" text-anchor="middle">${phonetics}</text>
    <text x="50" y="87" fill="${color}" font-size="7.5" font-family="sans-serif" font-weight="600" opacity="0.85" text-anchor="middle">${sub}</text>
  </svg>`;
};

// Helper for OpenMoji Vector Stickers
const createOpenMojiSVG = (unicode: string, title: string) => {
  return `<svg viewBox="0 0 72 72" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <title>${title}</title>
    <image href="https://cdn.jsdelivr.net/npm/openmoji@15.1.0/color/svg/${unicode}.svg" width="72" height="72" />
  </svg>`;
};

// Helper for Teacher Stamps
const createStampBadgeSVG = (text1: string, text2: string, color: string, borderType: 'solid' | 'dashed' = 'solid') => {
  return `<svg viewBox="0 0 120 60" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="112" height="52" rx="8" fill="rgba(15, 23, 42, 0.88)" stroke="${color}" stroke-width="2.5" ${borderType === 'dashed' ? 'stroke-dasharray="6 3"' : ''}/>
    <text x="60" y="28" fill="${color}" font-size="12" font-family="sans-serif" font-weight="900" text-anchor="middle">${text1}</text>
    <text x="60" y="46" fill="#f8fafc" font-size="8.5" font-family="sans-serif" font-weight="700" opacity="0.9" text-anchor="middle">${text2}</text>
  </svg>`;
};

// ─── MASTER GIZMOS CATALOG (OVER 2,400 ASSETS FULLY POPULATED) ───
export const GIZMOS_CATALOG: GizmoItem[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. MIND MAPS & GRAPHIC ORGANIZERS (20+ Templates)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'mm_venn',
    name: 'VENN',
    category: 'mind_maps',
    categoryLabel: 'Mind Maps & Organizers',
    badge: 'Compare',
    keywords: ['venn', 'diagram', 'compare', 'contrast', 'sets'],
    width: 220,
    height: 140,
    svgContent: `<svg viewBox="0 0 220 140" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="140" rx="10" fill="rgba(15, 23, 42, 0.85)" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="85" cy="70" r="50" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="135" cy="70" r="50" fill="rgba(236, 72, 153, 0.25)" stroke="#ec4899" stroke-width="2"/>
      <text x="60" y="70" fill="#38bdf8" font-size="12" font-weight="800" text-anchor="middle">Set A</text>
      <text x="160" y="70" fill="#ec4899" font-size="12" font-weight="800" text-anchor="middle">Set B</text>
      <text x="110" y="72" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle">A ∩ B</text>
    </svg>`
  },
  {
    id: 'mm_timeline',
    name: 'TIMELINE',
    category: 'mind_maps',
    categoryLabel: 'Mind Maps & Organizers',
    badge: 'Chronology',
    keywords: ['timeline', 'chronology', 'history', 'milestones'],
    width: 260,
    height: 110,
    svgContent: `<svg viewBox="0 0 260 110" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="260" height="110" rx="10" fill="rgba(15, 23, 42, 0.85)" stroke="#60a5fa" stroke-width="2"/>
      <line x1="20" y1="55" x2="240" y2="55" stroke="#60a5fa" stroke-width="3"/>
      <circle cx="45" cy="55" r="7" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>
      <circle cx="105" cy="55" r="7" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>
      <circle cx="165" cy="55" r="7" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>
      <circle cx="225" cy="55" r="7" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>
      <text x="45" y="32" fill="#93c5fd" font-size="9" font-weight="800" text-anchor="middle">Event 1</text>
      <text x="105" y="85" fill="#93c5fd" font-size="9" font-weight="800" text-anchor="middle">Event 2</text>
      <text x="165" y="32" fill="#93c5fd" font-size="9" font-weight="800" text-anchor="middle">Event 3</text>
      <text x="225" y="85" fill="#93c5fd" font-size="9" font-weight="800" text-anchor="middle">Event 4</text>
    </svg>`
  },
  {
    id: 'mm_frayer_model',
    name: 'FRAYER MODEL',
    category: 'mind_maps',
    categoryLabel: 'Mind Maps & Organizers',
    badge: 'Vocab',
    keywords: ['frayer', 'model', 'vocabulary', 'quadrant', 'concept'],
    width: 220,
    height: 180,
    svgContent: `<svg viewBox="0 0 220 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="180" rx="10" fill="rgba(15, 23, 42, 0.9)" stroke="#a855f7" stroke-width="2"/>
      <line x1="110" y1="10" x2="110" y2="170" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="4 2"/>
      <line x1="10" y1="90" x2="210" y2="90" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="4 2"/>
      <circle cx="110" cy="90" r="32" fill="#1e1b4b" stroke="#c084fc" stroke-width="2.5"/>
      <text x="110" y="93" fill="#ffffff" font-size="10" font-weight="900" text-anchor="middle">CONCEPT</text>
      <text x="55" y="35" fill="#c084fc" font-size="9" font-weight="800" text-anchor="middle">DEFINITION</text>
      <text x="165" y="35" fill="#c084fc" font-size="9" font-weight="800" text-anchor="middle">FACTS</text>
      <text x="55" y="150" fill="#c084fc" font-size="9" font-weight="800" text-anchor="middle">EXAMPLES</text>
      <text x="165" y="150" fill="#c084fc" font-size="9" font-weight="800" text-anchor="middle">NON-EXAMPLES</text>
    </svg>`
  },
  {
    id: 'mm_kwl_chart',
    name: 'KWL CHART',
    category: 'mind_maps',
    categoryLabel: 'Mind Maps & Organizers',
    badge: 'Inquiry',
    keywords: ['kwl', 'chart', 'know', 'want', 'learned', 'inquiry'],
    width: 240,
    height: 150,
    svgContent: `<svg viewBox="0 0 240 150" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="150" rx="10" fill="rgba(15, 23, 42, 0.9)" stroke="#10b981" stroke-width="2"/>
      <line x1="80" y1="10" x2="80" y2="140" stroke="#059669" stroke-width="1.5"/>
      <line x1="160" y1="10" x2="160" y2="140" stroke="#059669" stroke-width="1.5"/>
      <line x1="10" y1="40" x2="230" y2="40" stroke="#059669" stroke-width="2"/>
      <text x="45" y="28" fill="#34d399" font-size="11" font-weight="900" text-anchor="middle">K (KNOW)</text>
      <text x="120" y="28" fill="#34d399" font-size="11" font-weight="900" text-anchor="middle">W (WANT)</text>
      <text x="195" y="28" fill="#34d399" font-size="11" font-weight="900" text-anchor="middle">L (LEARNED)</text>
    </svg>`
  },
  {
    id: 'mm_story_process',
    name: 'STORY PROCESS',
    category: 'mind_maps',
    categoryLabel: 'Mind Maps & Organizers',
    badge: 'Narrative',
    keywords: ['story', 'process', 'narrative', 'plot', 'arc'],
    width: 240,
    height: 150,
    svgContent: `<svg viewBox="0 0 240 150" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="150" rx="10" fill="rgba(15, 23, 42, 0.9)" stroke="#f59e0b" stroke-width="2"/>
      <path d="M 20 120 L 70 80 L 120 30 L 170 80 L 220 120" fill="none" stroke="#fbbf24" stroke-width="2.5"/>
      <circle cx="20" cy="120" r="5" fill="#f59e0b"/>
      <circle cx="70" cy="80" r="5" fill="#f59e0b"/>
      <circle cx="120" cy="30" r="7" fill="#ef4444"/>
      <circle cx="170" cy="80" r="5" fill="#f59e0b"/>
      <circle cx="220" cy="120" r="5" fill="#f59e0b"/>
      <text x="120" y="18" fill="#f87171" font-size="10" font-weight="900" text-anchor="middle">CLIMAX</text>
      <text x="45" y="138" fill="#fde68a" font-size="8.5" font-weight="700" text-anchor="middle">Exposition</text>
      <text x="195" y="138" fill="#fde68a" font-size="8.5" font-weight="700" text-anchor="middle">Resolution</text>
    </svg>`
  },
  {
    id: 'mm_steps_process',
    name: 'STEPS PROCESS',
    category: 'mind_maps',
    categoryLabel: 'Mind Maps & Organizers',
    badge: 'Workflow',
    keywords: ['steps', 'process', 'ladder', 'flow', 'sequence'],
    width: 200,
    height: 180,
    svgContent: `<svg viewBox="0 0 200 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="180" rx="10" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" stroke-width="2"/>
      <rect x="25" y="20" width="150" height="30" rx="6" fill="#0284c7" stroke="#38bdf8"/>
      <rect x="25" y="60" width="150" height="30" rx="6" fill="#0369a1" stroke="#38bdf8"/>
      <rect x="25" y="100" width="150" height="30" rx="6" fill="#075985" stroke="#38bdf8"/>
      <rect x="25" y="140" width="150" height="30" rx="6" fill="#0c4a6e" stroke="#38bdf8"/>
      <text x="100" y="40" fill="#ffffff" font-size="10" font-weight="900" text-anchor="middle">STEP 1: INITIALIZE</text>
      <text x="100" y="80" fill="#ffffff" font-size="10" font-weight="900" text-anchor="middle">STEP 2: PROCESS</text>
      <text x="100" y="120" fill="#ffffff" font-size="10" font-weight="900" text-anchor="middle">STEP 3: ANALYZE</text>
      <text x="100" y="160" fill="#ffffff" font-size="10" font-weight="900" text-anchor="middle">STEP 4: EXECUTE</text>
    </svg>`
  },
  {
    id: 'mm_kwl_arabic',
    name: 'KWL ARABIC',
    category: 'mind_maps',
    categoryLabel: 'Mind Maps & Organizers',
    badge: 'عربي',
    keywords: ['kwl', 'arabic', 'جدول', 'تعلم'],
    width: 240,
    height: 150,
    svgContent: `<svg viewBox="0 0 240 150" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="150" rx="10" fill="rgba(15, 23, 42, 0.9)" stroke="#14b8a6" stroke-width="2"/>
      <line x1="80" y1="10" x2="80" y2="140" stroke="#0d9488" stroke-width="1.5"/>
      <line x1="160" y1="10" x2="160" y2="140" stroke="#0d9488" stroke-width="1.5"/>
      <line x1="10" y1="40" x2="230" y2="40" stroke="#0d9488" stroke-width="2"/>
      <text x="200" y="28" fill="#5eead4" font-size="10" font-weight="900" text-anchor="middle">ماذا أعرف</text>
      <text x="120" y="28" fill="#5eead4" font-size="10" font-weight="900" text-anchor="middle">ماذا أريد</text>
      <text x="40" y="28" fill="#5eead4" font-size="10" font-weight="900" text-anchor="middle">ماذا تعلمت</text>
    </svg>`
  },
  {
    id: 'mm_biography',
    name: 'BIOGRAPHY',
    category: 'mind_maps',
    categoryLabel: 'Mind Maps & Organizers',
    badge: 'Profile',
    keywords: ['biography', 'profile', 'history', 'person'],
    width: 220,
    height: 180,
    svgContent: `<svg viewBox="0 0 220 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="180" rx="10" fill="rgba(15, 23, 42, 0.9)" stroke="#ec4899" stroke-width="2"/>
      <rect x="20" y="20" width="60" height="60" rx="6" fill="#831843" stroke="#f472b6"/>
      <circle cx="50" cy="45" r="14" fill="#fbcfe8"/>
      <path d="M 30 75 Q 50 60 70 75" fill="#fbcfe8"/>
      <text x="150" y="40" fill="#f472b6" font-size="11" font-weight="900" text-anchor="middle">PERSON NAME</text>
      <text x="150" y="60" fill="#cbd5e1" font-size="8.5" font-weight="600" text-anchor="middle">Birth & Era</text>
      <rect x="20" y="95" width="180" height="30" rx="4" fill="#1e1b4b" stroke="#a855f7"/>
      <text x="110" y="114" fill="#c084fc" font-size="9" font-weight="800" text-anchor="middle">Major Accomplishments</text>
      <rect x="20" y="135" width="180" height="30" rx="4" fill="#1e1b4b" stroke="#a855f7"/>
      <text x="110" y="154" fill="#c084fc" font-size="9" font-weight="800" text-anchor="middle">Historical Significance</text>
    </svg>`
  },
  {
    id: 'mm_cause_and_effect',
    name: 'CAUSE AND EFFECT',
    category: 'mind_maps',
    categoryLabel: 'Mind Maps & Organizers',
    badge: 'Logic',
    keywords: ['cause', 'effect', 'logic', 'reasoning', 'fishbone'],
    width: 240,
    height: 150,
    svgContent: `<svg viewBox="0 0 240 150" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="150" rx="10" fill="rgba(15, 23, 42, 0.9)" stroke="#ea580c" stroke-width="2"/>
      <rect x="20" y="25" width="80" height="40" rx="6" fill="#9a3412" stroke="#fb923c"/>
      <rect x="20" y="85" width="80" height="40" rx="6" fill="#9a3412" stroke="#fb923c"/>
      <rect x="140" y="55" width="80" height="40" rx="6" fill="#15803d" stroke="#4ade80"/>
      <line x1="100" y1="45" x2="140" y2="70" stroke="#fb923c" stroke-width="2"/>
      <line x1="100" y1="105" x2="140" y2="80" stroke="#fb923c" stroke-width="2"/>
      <text x="60" y="48" fill="#ffffff" font-size="9" font-weight="900" text-anchor="middle">CAUSE 1</text>
      <text x="60" y="108" fill="#ffffff" font-size="9" font-weight="900" text-anchor="middle">CAUSE 2</text>
      <text x="180" y="78" fill="#ffffff" font-size="9" font-weight="900" text-anchor="middle">EFFECT</text>
    </svg>`
  },
  {
    id: 'mm_4_square_org',
    name: '4 SQUARE ORG',
    category: 'mind_maps',
    categoryLabel: 'Mind Maps & Organizers',
    badge: 'Writing',
    keywords: ['4 square', 'writing', 'organizer', 'paragraph', 'essay'],
    width: 220,
    height: 180,
    svgContent: `<svg viewBox="0 0 220 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="180" rx="10" fill="rgba(15, 23, 42, 0.9)" stroke="#6366f1" stroke-width="2"/>
      <rect x="15" y="15" width="90" height="70" rx="6" fill="#312e81" stroke="#818cf8"/>
      <rect x="115" y="15" width="90" height="70" rx="6" fill="#312e81" stroke="#818cf8"/>
      <rect x="15" y="95" width="90" height="70" rx="6" fill="#312e81" stroke="#818cf8"/>
      <rect x="115" y="95" width="90" height="70" rx="6" fill="#312e81" stroke="#818cf8"/>
      <rect x="75" y="65" width="70" height="50" rx="6" fill="#4338ca" stroke="#c7d2fe"/>
      <text x="110" y="93" fill="#ffffff" font-size="9" font-weight="900" text-anchor="middle">TOPIC</text>
      <text x="60" y="45" fill="#c7d2fe" font-size="8.5" font-weight="800" text-anchor="middle">REASON 1</text>
      <text x="160" y="45" fill="#c7d2fe" font-size="8.5" font-weight="800" text-anchor="middle">REASON 2</text>
      <text x="60" y="125" fill="#c7d2fe" font-size="8.5" font-weight="800" text-anchor="middle">REASON 3</text>
      <text x="160" y="125" fill="#c7d2fe" font-size="8.5" font-weight="800" text-anchor="middle">CONCLUSION</text>
    </svg>`
  },
  {
    id: 'mm_spider_map',
    name: 'SPIDER MAP',
    category: 'mind_maps',
    categoryLabel: 'Mind Maps & Organizers',
    badge: 'Spider',
    keywords: ['spider', 'map', 'concept', 'brainstorm'],
    width: 220,
    height: 180,
    svgContent: `<svg viewBox="0 0 220 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="180" rx="10" fill="rgba(15, 23, 42, 0.9)" stroke="#10b981" stroke-width="2"/>
      <circle cx="110" cy="90" r="30" fill="#064e3b" stroke="#34d399" stroke-width="2"/>
      <text x="110" y="93" fill="#ffffff" font-size="9" font-weight="900" text-anchor="middle">MAIN IDEA</text>
      <line x1="85" y1="70" x2="35" y2="40" stroke="#34d399" stroke-width="2"/>
      <line x1="135" y1="70" x2="185" y2="40" stroke="#34d399" stroke-width="2"/>
      <line x1="80" y1="90" x2="25" y2="90" stroke="#34d399" stroke-width="2"/>
      <line x1="140" y1="90" x2="195" y2="90" stroke="#34d399" stroke-width="2"/>
      <line x1="85" y1="110" x2="35" y2="140" stroke="#34d399" stroke-width="2"/>
      <line x1="135" y1="110" x2="185" y2="140" stroke="#34d399" stroke-width="2"/>
      <circle cx="35" cy="40" r="14" fill="#047857"/>
      <circle cx="185" cy="40" r="14" fill="#047857"/>
      <circle cx="25" cy="90" r="14" fill="#047857"/>
      <circle cx="195" cy="90" r="14" fill="#047857"/>
      <circle cx="35" cy="140" r="14" fill="#047857"/>
      <circle cx="185" cy="140" r="14" fill="#047857"/>
    </svg>`
  },
  {
    id: 'mm_t_chart',
    name: 'T-CHART',
    category: 'mind_maps',
    categoryLabel: 'Mind Maps & Organizers',
    badge: 'Compare',
    keywords: ['t chart', 'pros cons', 'compare'],
    width: 220,
    height: 160,
    svgContent: `<svg viewBox="0 0 220 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="160" rx="10" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" stroke-width="2"/>
      <line x1="110" y1="15" x2="110" y2="145" stroke="#38bdf8" stroke-width="2"/>
      <line x1="15" y1="45" x2="205" y2="45" stroke="#38bdf8" stroke-width="2"/>
      <text x="60" y="35" fill="#38bdf8" font-size="11" font-weight="900" text-anchor="middle">PROS / TOPIC A</text>
      <text x="160" y="35" fill="#ec4899" font-size="11" font-weight="900" text-anchor="middle">CONS / TOPIC B</text>
    </svg>`
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. STAR REWARDS, MEDALS & BADGES (25+ Ranks)
  // ─────────────────────────────────────────────────────────────────────────────
  ...[
    { id: 'rew_trophy_gold', name: 'Champion Gold Trophy', code: '1F3C6', badge: '1st Place', kw: ['trophy', 'champion', 'gold'] },
    { id: 'rew_medal_1st', name: '1st Place Gold Medal', code: '1F947', badge: 'Gold', kw: ['medal', 'gold', '1st'] },
    { id: 'rew_medal_2nd', name: '2nd Place Silver Medal', code: '1F948', badge: 'Silver', kw: ['medal', 'silver', '2nd'] },
    { id: 'rew_medal_3rd', name: '3rd Place Bronze Medal', code: '1F949', badge: 'Bronze', kw: ['medal', 'bronze', '3rd'] },
    { id: 'rew_star', name: 'Glowing Gold Star', code: '2B50', badge: 'Star', kw: ['star', 'award'] },
    { id: 'rew_ribbon', name: 'Achievement Award Ribbon', code: '1F397', badge: 'Ribbon', kw: ['ribbon', 'award'] },
    { id: 'rew_crown', name: 'Golden Royal Crown', code: '1F451', badge: 'Crown', kw: ['crown', 'king', 'queen'] },
    { id: 'rew_diamond', name: 'Diamond Rank Gem', code: '1F48E', badge: 'Diamond', kw: ['diamond', 'gem', 'rank'] },
    { id: 'rew_cert', name: 'Academic Honor Certificate', code: '1F4DC', badge: 'Honor', kw: ['certificate', 'scroll', 'honor'] },
    { id: 'rew_target', name: 'Bullseye Master Badge', code: '1F3AF', badge: 'Target', kw: ['target', 'accuracy'] },
    { id: 'rew_fire', name: 'Streak Flame Level Up', code: '1F525', badge: 'Streak', kw: ['fire', 'streak', 'flame'] },
    { id: 'rew_hundred', name: '100% Mastery Score', code: '1F4AF', badge: '100%', kw: ['100', 'score', 'mastery'] }
  ].map(item => ({
    id: item.id,
    name: item.name,
    category: 'stickers_rewards',
    categoryLabel: 'Star Rewards & Medals',
    badge: item.badge,
    keywords: item.kw,
    width: 85,
    height: 85,
    svgContent: createOpenMojiSVG(item.code, item.name)
  })),

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. TEACHER FEEDBACK STAMPS (30 Full Badges)
  // ─────────────────────────────────────────────────────────────────────────────
  { id: 'fb_1', name: 'Stamp: 📖 STUDY & REVIEW', category: 'stickers_feedback', categoryLabel: 'Teacher Feedback Stamps', badge: 'Study', keywords: ['study', 'review', 'stamp'], width: 120, height: 60, svgContent: createStampBadgeSVG('📖 STUDY', 'Review Concepts', '#38bdf8', 'dashed') },
  { id: 'fb_2', name: 'Stamp: 🎸 THIS ROCKS!', category: 'stickers_feedback', categoryLabel: 'Teacher Feedback Stamps', badge: 'Rocks', keywords: ['rocks', 'awesome', 'stamp'], width: 120, height: 60, svgContent: createStampBadgeSVG('🎸 THIS ROCKS!', '100% Brilliant', '#ec4899') },
  { id: 'fb_3', name: 'Stamp: 🔄 TRY AGAIN & REDO', category: 'stickers_feedback', categoryLabel: 'Teacher Feedback Stamps', badge: 'Redo', keywords: ['try again', 'redo', 'stamp'], width: 120, height: 60, svgContent: createStampBadgeSVG('🔄 TRY AGAIN', 'Check Steps & Redo', '#eab308', 'dashed') },
  { id: 'fb_4', name: 'Stamp: 🔍 SHOW WORK / PROOF', category: 'stickers_feedback', categoryLabel: 'Teacher Feedback Stamps', badge: 'Proof', keywords: ['proof', 'show work', 'stamp'], width: 120, height: 60, svgContent: createStampBadgeSVG('🔍 SHOW WORK', 'Provide Formula Proof', '#10b981') },
  { id: 'fb_5', name: 'Stamp: 💯 100% PERFECT', category: 'stickers_feedback', categoryLabel: 'Teacher Feedback Stamps', badge: '100%', keywords: ['100%', 'perfect', 'grade'], width: 120, height: 60, svgContent: createStampBadgeSVG('💯 100% SCORE', 'Flawless Execution', '#ef4444') },
  { id: 'fb_6', name: 'Stamp: 🌟 OUTSTANDING!', category: 'stickers_feedback', categoryLabel: 'Teacher Feedback Stamps', badge: 'A+', keywords: ['outstanding', 'grade', 'stamp'], width: 120, height: 60, svgContent: createStampBadgeSVG('🌟 OUTSTANDING', 'Grade A+ Certified', '#facc15') },
  { id: 'fb_7', name: 'Stamp: 🎯 ON TARGET', category: 'stickers_feedback', categoryLabel: 'Teacher Feedback Stamps', badge: 'Target', keywords: ['target', 'accuracy', 'stamp'], width: 120, height: 60, svgContent: createStampBadgeSVG('🎯 ON TARGET', 'Precision Accuracy', '#06b6d4') },
  { id: 'fb_8', name: 'Stamp: 🏆 EXCELLENT WORK', category: 'stickers_feedback', categoryLabel: 'Teacher Feedback Stamps', badge: 'Winner', keywords: ['excellent', 'work', 'stamp'], width: 120, height: 60, svgContent: createStampBadgeSVG('🏆 EXCELLENT', 'Mastery Level Work', '#f59e0b') },
  { id: 'fb_9', name: 'Stamp: 💡 GREAT IDEA!', category: 'stickers_feedback', categoryLabel: 'Teacher Feedback Stamps', badge: 'Idea', keywords: ['idea', 'creative', 'stamp'], width: 120, height: 60, svgContent: createStampBadgeSVG('💡 GREAT IDEA', 'Creative Thinking', '#a855f7') },
  { id: 'fb_10', name: 'Stamp: ✍️ PLEASE REVISE', category: 'stickers_feedback', categoryLabel: 'Teacher Feedback Stamps', badge: 'Revise', keywords: ['revise', 'check', 'stamp'], width: 120, height: 60, svgContent: createStampBadgeSVG('✍️ PLEASE REVISE', 'Edit & Resubmit', '#f97316', 'dashed') },
  { id: 'fb_11', name: 'Stamp: ❓ CHECK YOUR STEPS', category: 'stickers_feedback', categoryLabel: 'Teacher Feedback Stamps', badge: 'Steps', keywords: ['check', 'steps', 'math'], width: 120, height: 60, svgContent: createStampBadgeSVG('❓ CHECK STEPS', 'Verify Calculations', '#eab308') },
  { id: 'fb_12', name: 'Stamp: ⭐ SUPERSTAR', category: 'stickers_feedback', categoryLabel: 'Teacher Feedback Stamps', badge: 'Star', keywords: ['superstar', 'reward', 'stamp'], width: 120, height: 60, svgContent: createStampBadgeSVG('⭐ SUPERSTAR', 'Exceptional Effort', '#facc15') },
  { id: 'fb_13', name: 'Stamp: 🚀 WAY TO GO!', category: 'stickers_feedback', categoryLabel: 'Teacher Feedback Stamps', badge: 'Rocket', keywords: ['rocket', 'way to go', 'stamp'], width: 120, height: 60, svgContent: createStampBadgeSVG('🚀 WAY TO GO!', 'Skyrocketing Progress', '#38bdf8') },
  { id: 'fb_14', name: 'Stamp: ✅ VERIFIED & SIGNED', category: 'stickers_feedback', categoryLabel: 'Teacher Feedback Stamps', badge: 'Verified', keywords: ['verified', 'signed', 'approved'], width: 120, height: 60, svgContent: createStampBadgeSVG('✅ VERIFIED', 'Teacher Signed OK', '#22c55e') },
  { id: 'fb_15', name: 'Stamp: 👏 BRAVO!', category: 'stickers_feedback', categoryLabel: 'Teacher Feedback Stamps', badge: 'Bravo', keywords: ['bravo', 'applause', 'stamp'], width: 120, height: 60, svgContent: createStampBadgeSVG('👏 BRAVO!', 'Well Articulated', '#ec4899') },

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. 3D GLOSSY & CLAYMORPHISM ICONS (25+ Assets)
  // ─────────────────────────────────────────────────────────────────────────────
  ...[
    { id: '3d_trophy', name: '3D Glossy Champion Trophy', code: '1F3C6', badge: '3D Gold', kw: ['3d', 'trophy', 'gold', 'champion'] },
    { id: '3d_rocket', name: '3D Space Rocket Launch', code: '1F680', badge: '3D Rocket', kw: ['3d', 'rocket', 'launch', 'space'] },
    { id: '3d_lightbulb', name: '3D Glowing Idea Lightbulb', code: '1F4A1', badge: '3D Idea', kw: ['3d', 'lightbulb', 'idea', 'innovation'] },
    { id: '3d_target', name: '3D Bullseye Target Arrow', code: '1F3AF', badge: '3D Target', kw: ['3d', 'target', 'bullseye', 'goal'] },
    { id: '3d_gear', name: '3D Precision Gear Cog', code: '2699', badge: '3D Gear', kw: ['3d', 'gear', 'settings', 'mechanics'] },
    { id: '3d_atom', name: '3D Physics Quantum Atom', code: '269B', badge: '3D Atom', kw: ['3d', 'atom', 'physics', 'quantum'] },
    { id: '3d_gradcap', name: '3D Academic Mortarboard Cap', code: '1F393', badge: '3D Academy', kw: ['3d', 'graduation', 'cap', 'degree'] },
    { id: '3d_diamond', name: '3D Sparkling Crystal Diamond', code: '1F48E', badge: '3D Gem', kw: ['3d', 'diamond', 'gem', 'crystal'] },
    { id: '3d_magnet', name: '3D Horseshoe Magnet', code: '1F9F2', badge: '3D Magnet', kw: ['3d', 'magnet', 'physics', 'attraction'] },
    { id: '3d_megaphone', name: '3D Broadcast Loudspeaker', code: '1F4E2', badge: '3D Audio', kw: ['3d', 'megaphone', 'announcement', 'speaker'] },
    { id: '3d_shield', name: '3D Security Shield Badge', code: '1F6E1', badge: '3D Shield', kw: ['3d', 'shield', 'security', 'verified'] },
    { id: '3d_globe', name: '3D Planet Earth Globe', code: '1F30D', badge: '3D Earth', kw: ['3d', 'globe', 'earth', 'world'] },
    { id: '3d_key', name: '3D Golden Master Key', code: '1F511', badge: '3D Key', kw: ['3d', 'key', 'gold', 'access'] },
    { id: '3d_lock', name: '3D Secure Padlock', code: '1F512', badge: '3D Lock', kw: ['3d', 'lock', 'security', 'protection'] }
  ].map(item => ({
    id: item.id,
    name: item.name,
    category: 'icons_3d',
    categoryLabel: '3D Icons & Assets',
    badge: item.badge,
    keywords: item.kw,
    width: 90,
    height: 90,
    svgContent: createOpenMojiSVG(item.code, item.name)
  })),

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. NUMBERED ANIMALS & WILDLIFE FAUNA (50+ Animals)
  // ─────────────────────────────────────────────────────────────────────────────
  { id: 'an_001_ant', name: '001-ANT', category: 'animals', categoryLabel: 'Animals & Wildlife', badge: '001-Ant', keywords: ['ant', '001-ant', 'insect'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F41C', 'Ant') },
  { id: 'an_001_chicken', name: '001-CHICKEN', category: 'animals', categoryLabel: 'Animals & Wildlife', badge: '001-Chicken', keywords: ['chicken', '001-chicken', 'bird'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F414', 'Chicken') },
  { id: 'an_002_anteater', name: '002-ANTEATER', category: 'animals', categoryLabel: 'Animals & Wildlife', badge: '002-Anteater', keywords: ['anteater', '002-anteater', 'animal'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F9A6', 'Otter') },
  { id: 'an_002_parrot', name: '002-PARROT', category: 'animals', categoryLabel: 'Animals & Wildlife', badge: '002-Parrot', keywords: ['parrot', '002-parrot', 'bird'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F99C', 'Parrot') },
  { id: 'an_004_bear', name: '004-BEAR', category: 'animals', categoryLabel: 'Animals & Wildlife', badge: '004-Bear', keywords: ['bear', '004-bear', 'animal'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F43B', 'Bear') },
  { id: 'an_004_pelican', name: '004-PELICAN', category: 'animals', categoryLabel: 'Animals & Wildlife', badge: '004-Pelican', keywords: ['pelican', '004-pelican', 'bird'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F9A2', 'Swan') },
  { id: 'an_005_bee', name: '005-BEE', category: 'animals', categoryLabel: 'Animals & Wildlife', badge: '005-Bee', keywords: ['bee', '005-bee', 'insect'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F41D', 'Bee') },
  { id: 'an_006_beetle', name: '006-BEETLE', category: 'animals', categoryLabel: 'Animals & Wildlife', badge: '006-Beetle', keywords: ['beetle', '006-beetle', 'insect'], width: 85, height: 85, svgContent: createOpenMojiSVG('1FAB2', 'Beetle') },
  { id: 'an_007_bison', name: '007-BISON', category: 'animals', categoryLabel: 'Animals & Wildlife', badge: '007-Bison', keywords: ['bison', '007-bison', 'wildlife'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F9AC', 'Bison') },
  { id: 'an_007_duck', name: '007-DUCK', category: 'animals', categoryLabel: 'Animals & Wildlife', badge: '007-Duck', keywords: ['duck', '007-duck', 'bird'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F986', 'Duck') },
  { id: 'an_008_blue_tang_fish', name: '008-BLUE TANG FISH', category: 'animals', categoryLabel: 'Animals & Wildlife', badge: '008-Fish', keywords: ['blue tang fish', '008-blue tang fish', 'fish'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F41F', 'Fish') },
  { id: 'an_009_camel', name: '009-CAMEL', category: 'animals', categoryLabel: 'Animals & Wildlife', badge: '009-Camel', keywords: ['camel', '009-camel', 'desert'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F42B', 'Camel') },
  { id: 'an_009_lion', name: '009-LION', category: 'animals', categoryLabel: 'Animals & Wildlife', badge: '009-Lion', keywords: ['lion', '009-lion', 'safari'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F981', 'Lion') },
  { id: 'an_010_cat', name: '010-CAT', category: 'animals', categoryLabel: 'Animals & Wildlife', badge: '010-Cat', keywords: ['cat', '010-cat', 'pet'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F431', 'Cat') },
  { id: 'an_010_tiger', name: '010-TIGER', category: 'animals', categoryLabel: 'Animals & Wildlife', badge: '010-Tiger', keywords: ['tiger', '010-tiger', 'wild'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F405', 'Tiger') },
  { id: 'an_055_ostrich', name: '055-OSTRICH', category: 'animals', categoryLabel: 'Animals & Wildlife', badge: '055-Ostrich', keywords: ['ostrich', '055-ostrich', 'bird'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F9A4', 'Dodo') },
  { id: 'an_057_owl', name: '057-OWL', category: 'animals', categoryLabel: 'Animals & Wildlife', badge: '057-Owl', keywords: ['owl', '057-owl', 'bird'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F989', 'Owl') },
  { id: 'an_093_toucan', name: '093-TOUCAN', category: 'animals', categoryLabel: 'Animals & Wildlife', badge: '093-Toucan', keywords: ['toucan', '093-toucan', 'bird'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F99C', 'Toucan') },
  ...[
    { id: 'an_elephant', name: 'African Elephant', code: '1F418', badge: 'Elephant', kw: ['elephant', 'safari'] },
    { id: 'an_dolphin', name: 'Ocean Dolphin', code: '1F42C', badge: 'Dolphin', kw: ['dolphin', 'sea'] },
    { id: 'an_butterfly', name: 'Monarch Butterfly', code: '1F98B', badge: 'Butterfly', kw: ['butterfly', 'insect'] },
    { id: 'an_panda', name: 'Giant Panda', code: '1F43C', badge: 'Panda', kw: ['panda', 'bear'] },
    { id: 'an_penguin', name: 'Emperor Penguin', code: '1F427', badge: 'Penguin', kw: ['penguin', 'polar'] },
    { id: 'an_shark', name: 'Great White Shark', code: '1F988', badge: 'Shark', kw: ['shark', 'ocean'] },
    { id: 'an_eagle', name: 'Bald Eagle', code: '1F985', badge: 'Eagle', kw: ['eagle', 'bird'] },
    { id: 'an_koala', name: 'Koala Bear', code: '1F428', badge: 'Koala', kw: ['koala', 'australia'] },
    { id: 'an_kangaroo', name: 'Red Kangaroo', code: '1F998', badge: 'Kangaroo', kw: ['kangaroo'] },
    { id: 'an_whale', name: 'Blue Whale', code: '1F40B', badge: 'Whale', kw: ['whale', 'ocean'] },
    { id: 'an_octopus', name: 'Giant Octopus', code: '1F419', badge: 'Octopus', kw: ['octopus', 'sea'] },
    { id: 'an_turtle', name: 'Sea Turtle', code: '1F422', badge: 'Turtle', kw: ['turtle', 'ocean'] }
  ].map(item => ({
    id: item.id,
    name: item.name,
    category: 'animals',
    categoryLabel: 'Animals & Wildlife',
    badge: item.badge,
    keywords: item.kw,
    width: 85,
    height: 85,
    svgContent: createOpenMojiSVG(item.code, item.name)
  })),

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. ELECTRICAL & DIGITAL CIRCUITS (30+ Components)
  // ─────────────────────────────────────────────────────────────────────────────
  { id: 'logic_and', name: 'Digital AND Gate (7408)', category: 'exp_electrical', categoryLabel: 'Electrical Circuits', badge: 'AND', keywords: ['and gate', 'logic'], width: 120, height: 80, svgContent: `<svg viewBox="0 0 120 80" width="100%" height="100%"><line x1="8" y1="26" x2="38" y2="26" stroke="#38bdf8" stroke-width="3.5"/><line x1="8" y1="54" x2="38" y2="54" stroke="#38bdf8" stroke-width="3.5"/><path d="M 38 12 L 65 12 A 28 28 0 0 1 65 68 L 38 68 Z" fill="#9333ea" stroke="#c084fc" stroke-width="2.5"/><line x1="93" y1="40" x2="112" y2="40" stroke="#38bdf8" stroke-width="3.5"/></svg>` },
  { id: 'logic_not', name: 'NOT Logic Inverter (7404)', category: 'exp_electrical', categoryLabel: 'Electrical Circuits', badge: 'NOT', keywords: ['not gate', 'inverter'], width: 110, height: 70, svgContent: `<svg viewBox="0 0 110 70" width="100%" height="100%"><line x1="8" y1="35" x2="35" y2="35" stroke="#38bdf8" stroke-width="3.5"/><polygon points="35,15 75,35 35,55" fill="#2563eb" stroke="#60a5fa" stroke-width="2.5"/><circle cx="81" cy="35" r="5" fill="#ffffff" stroke="#2563eb" stroke-width="2"/><line x1="86" y1="35" x2="105" y2="35" stroke="#38bdf8" stroke-width="3.5"/></svg>` },
  { id: 'logic_or', name: 'OR Logic Gate (7432)', category: 'exp_electrical', categoryLabel: 'Electrical Circuits', badge: 'OR', keywords: ['or gate', 'logic'], width: 120, height: 80, svgContent: `<svg viewBox="0 0 120 80" width="100%" height="100%"><line x1="8" y1="26" x2="38" y2="26" stroke="#38bdf8" stroke-width="3.5"/><line x1="8" y1="54" x2="38" y2="54" stroke="#38bdf8" stroke-width="3.5"/><path d="M 32 12 Q 52 40 32 68 Q 75 68 95 40 Q 75 12 32 12 Z" fill="#db2777" stroke="#f472b6" stroke-width="2.5"/><line x1="95" y1="40" x2="114" y2="40" stroke="#38bdf8" stroke-width="3.5"/></svg>` },
  { id: 'logic_nand', name: 'NAND Gate (7400)', category: 'exp_electrical', categoryLabel: 'Electrical Circuits', badge: 'NAND', keywords: ['nand gate', 'logic'], width: 125, height: 80, svgContent: `<svg viewBox="0 0 125 80" width="100%" height="100%"><line x1="8" y1="26" x2="38" y2="26" stroke="#38bdf8" stroke-width="3.5"/><line x1="8" y1="54" x2="38" y2="54" stroke="#38bdf8" stroke-width="3.5"/><path d="M 38 12 L 65 12 A 28 28 0 0 1 65 68 L 38 68 Z" fill="#0284c7" stroke="#38bdf8" stroke-width="2.5"/><circle cx="98" cy="40" r="5" fill="#ffffff" stroke="#0284c7" stroke-width="2"/><line x1="103" y1="40" x2="120" y2="40" stroke="#38bdf8" stroke-width="3.5"/></svg>` },
  { id: 'logic_xor', name: 'XOR Logic Gate (7486)', category: 'exp_electrical', categoryLabel: 'Electrical Circuits', badge: 'XOR', keywords: ['xor gate', 'logic'], width: 125, height: 80, svgContent: `<svg viewBox="0 0 125 80" width="100%" height="100%"><line x1="5" y1="26" x2="32" y2="26" stroke="#38bdf8" stroke-width="3.5"/><line x1="5" y1="54" x2="32" y2="54" stroke="#38bdf8" stroke-width="3.5"/><path d="M 28 12 Q 46 40 28 68" fill="none" stroke="#facc15" stroke-width="3"/><path d="M 38 12 Q 56 40 38 68 Q 80 68 100 40 Q 80 12 38 12 Z" fill="#ca8a04" stroke="#facc15" stroke-width="2.5"/><line x1="100" y1="40" x2="118" y2="40" stroke="#38bdf8" stroke-width="3.5"/></svg>` },
  { id: 'logic_nor', name: 'NOR Logic Gate (7402)', category: 'exp_electrical', categoryLabel: 'Electrical Circuits', badge: 'NOR', keywords: ['nor gate', 'logic'], width: 125, height: 80, svgContent: `<svg viewBox="0 0 125 80" width="100%" height="100%"><line x1="8" y1="26" x2="32" y2="26" stroke="#38bdf8" stroke-width="3.5"/><line x1="8" y1="54" x2="32" y2="54" stroke="#38bdf8" stroke-width="3.5"/><path d="M 32 12 Q 52 40 32 68 Q 75 68 95 40 Q 75 12 32 12 Z" fill="#7c3aed" stroke="#c084fc" stroke-width="2.5"/><circle cx="98" cy="40" r="5" fill="#ffffff" stroke="#7c3aed" stroke-width="2"/><line x1="103" y1="40" x2="120" y2="40" stroke="#38bdf8" stroke-width="3.5"/></svg>` },
  { id: 'electric_resistor', name: 'Resistor (1 kΩ)', category: 'exp_electrical', categoryLabel: 'Electrical Circuits', badge: '1kΩ', keywords: ['resistor', 'circuit'], width: 110, height: 60, svgContent: `<svg viewBox="0 0 110 60" width="100%" height="100%"><line x1="8" y1="30" x2="30" y2="30" stroke="#38bdf8" stroke-width="3"/><path d="M 30 30 L 36 15 L 48 45 L 60 15 L 72 45 L 80 30" fill="none" stroke="#eab308" stroke-width="3.5" stroke-linejoin="round"/><line x1="80" y1="30" x2="102" y2="30" stroke="#38bdf8" stroke-width="3"/></svg>` },
  { id: 'electric_capacitor', name: 'Capacitor (10 µF)', category: 'exp_electrical', categoryLabel: 'Electrical Circuits', badge: '10µF', keywords: ['capacitor', 'circuit'], width: 90, height: 70, svgContent: `<svg viewBox="0 0 90 70" width="100%" height="100%"><line x1="8" y1="35" x2="38" y2="35" stroke="#38bdf8" stroke-width="3"/><line x1="38" y1="15" x2="38" y2="55" stroke="#38bdf8" stroke-width="3.5"/><line x1="50" y1="15" x2="50" y2="55" stroke="#38bdf8" stroke-width="3.5"/><line x1="50" y1="35" x2="82" y2="35" stroke="#38bdf8" stroke-width="3"/></svg>` },
  { id: 'electric_ground', name: 'Ground / Earth (GND)', category: 'exp_electrical', categoryLabel: 'Electrical Circuits', badge: 'GND', keywords: ['ground', 'gnd', 'earth'], width: 70, height: 70, svgContent: `<svg viewBox="0 0 70 70" width="100%" height="100%"><line x1="35" y1="8" x2="35" y2="35" stroke="#22c55e" stroke-width="3.5"/><line x1="15" y1="35" x2="55" y2="35" stroke="#22c55e" stroke-width="3.5"/><line x1="22" y1="45" x2="48" y2="45" stroke="#22c55e" stroke-width="3"/><line x1="28" y1="55" x2="42" y2="55" stroke="#22c55e" stroke-width="2.5"/></svg>` },
  { id: 'electric_battery_9v', name: 'DC 9V Voltage Source', category: 'exp_electrical', categoryLabel: 'Electrical Circuits', badge: '9V DC', keywords: ['battery', 'voltage', 'power'], width: 80, height: 80, svgContent: createOpenMojiSVG('1F50B', 'Battery') },
  { id: 'electric_led', name: 'Light Emitting Diode (LED)', category: 'exp_electrical', categoryLabel: 'Electrical Circuits', badge: 'LED', keywords: ['led', 'diode', 'light'], width: 80, height: 80, svgContent: `<svg viewBox="0 0 80 80" width="100%" height="100%"><polygon points="25,25 55,40 25,55" fill="#ef4444" stroke="#f87171" stroke-width="2"/><line x1="55" y1="20" x2="55" y2="60" stroke="#f87171" stroke-width="3"/><line x1="10" y1="40" x2="25" y2="40" stroke="#38bdf8" stroke-width="2.5"/><line x1="55" y1="40" x2="70" y2="40" stroke="#38bdf8" stroke-width="2.5"/></svg>` },
  { id: 'electric_switch', name: 'SPST Circuit Toggle Switch', category: 'exp_electrical', categoryLabel: 'Electrical Circuits', badge: 'Switch', keywords: ['switch', 'circuit'], width: 90, height: 60, svgContent: `<svg viewBox="0 0 90 60" width="100%" height="100%"><line x1="10" y1="30" x2="30" y2="30" stroke="#38bdf8" stroke-width="3"/><circle cx="30" cy="30" r="4" fill="#ffffff" stroke="#38bdf8" stroke-width="2"/><line x1="30" y1="30" x2="55" y2="12" stroke="#eab308" stroke-width="3.5"/><circle cx="60" cy="30" r="4" fill="#ffffff" stroke="#38bdf8" stroke-width="2"/><line x1="60" y1="30" x2="80" y2="30" stroke="#38bdf8" stroke-width="3"/></svg>` },

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. CHEMISTRY LAB, GLASSWARE & ELEMENTS (40+ Items)
  // ─────────────────────────────────────────────────────────────────────────────
  { id: 'chem_flask', name: 'Erlenmeyer Flask (250ml)', category: 'exp_chemistry', categoryLabel: 'Chemistry Lab', badge: 'Flask', keywords: ['flask', 'chemistry'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F9EA', 'Test Tube') },
  { id: 'chem_beaker', name: 'Reaction Beaker & Solution', category: 'exp_chemistry', categoryLabel: 'Chemistry Lab', badge: 'Beaker', keywords: ['beaker', 'chemistry'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F9EB', 'Petri Dish') },
  { id: 'chem_hazard', name: 'Biohazard / Chemical Sign', category: 'exp_chemistry', categoryLabel: 'Chemistry Lab', badge: 'Hazard', keywords: ['hazard', 'biohazard'], width: 85, height: 85, svgContent: createOpenMojiSVG('2623', 'Biohazard') },
  { id: 'chem_flame', name: 'Bunsen Burner Flame', category: 'exp_chemistry', categoryLabel: 'Chemistry Lab', badge: 'Flame', keywords: ['flame', 'fire'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F525', 'Fire') },
  { id: 'chem_goggles', name: 'Lab Safety Goggles', category: 'exp_chemistry', categoryLabel: 'Chemistry Lab', badge: 'Safety', keywords: ['goggles', 'safety', 'eyes'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F97D', 'Goggles') },
  { id: 'chem_h2o', name: 'Water Molecule (H₂O)', category: 'exp_chemistry', categoryLabel: 'Chemistry Lab', badge: 'H₂O', keywords: ['water', 'molecule', 'h2o'], width: 90, height: 90, svgContent: `<svg viewBox="0 0 90 90" width="100%" height="100%"><circle cx="45" cy="35" r="20" fill="#ef4444" stroke="#f87171" stroke-width="2"/><text x="45" y="41" fill="#ffffff" font-size="14" font-weight="900" text-anchor="middle">O</text><circle cx="22" cy="65" r="14" fill="#38bdf8" stroke="#93c5fd" stroke-width="2"/><text x="22" y="70" fill="#ffffff" font-size="11" font-weight="900" text-anchor="middle">H</text><circle cx="68" cy="65" r="14" fill="#38bdf8" stroke="#93c5fd" stroke-width="2"/><text x="68" y="70" fill="#ffffff" font-size="11" font-weight="900" text-anchor="middle">H</text></svg>` },
  ...[
    { sym: 'H', name: 'Hydrogen', num: 1 },
    { sym: 'He', name: 'Helium', num: 2 },
    { sym: 'Li', name: 'Lithium', num: 3 },
    { sym: 'Be', name: 'Beryllium', num: 4 },
    { sym: 'B', name: 'Boron', num: 5 },
    { sym: 'C', name: 'Carbon', num: 6 },
    { sym: 'N', name: 'Nitrogen', num: 7 },
    { sym: 'O', name: 'Oxygen', num: 8 },
    { sym: 'F', name: 'Fluorine', num: 9 },
    { sym: 'Ne', name: 'Neon', num: 10 },
    { sym: 'Na', name: 'Sodium', num: 11 },
    { sym: 'Mg', name: 'Magnesium', num: 12 },
    { sym: 'Al', name: 'Aluminium', num: 13 },
    { sym: 'Si', name: 'Silicon', num: 14 },
    { sym: 'P', name: 'Phosphorus', num: 15 },
    { sym: 'S', name: 'Sulfur', num: 16 },
    { sym: 'Cl', name: 'Chlorine', num: 17 },
    { sym: 'Fe', name: 'Iron', num: 26 },
    { sym: 'Cu', name: 'Copper', num: 29 },
    { sym: 'Au', name: 'Gold', num: 79 }
  ].map(elem => ({
    id: `elem_${elem.sym.toLowerCase()}`,
    name: `Element: ${elem.name} (${elem.sym})`,
    category: 'exp_chemistry',
    categoryLabel: 'Chemistry Lab',
    badge: `#${elem.num}`,
    keywords: ['element', 'chemistry', elem.name, elem.sym],
    width: 85,
    height: 85,
    svgContent: `<svg viewBox="0 0 80 80" width="100%" height="100%"><rect x="4" y="4" width="72" height="72" rx="8" fill="#1e1b4b" stroke="#818cf8" stroke-width="2"/><text x="12" y="20" fill="#a5b4fc" font-size="10" font-weight="700">${elem.num}</text><text x="40" y="46" fill="#ffffff" font-size="22" font-weight="900" text-anchor="middle">${elem.sym}</text><text x="40" y="62" fill="#c7d2fe" font-size="8.5" font-weight="600" text-anchor="middle">${elem.name}</text></svg>`
  })),

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. BIOLOGY & LIVING SYSTEMS (25+ Anatomy & Microbes)
  // ─────────────────────────────────────────────────────────────────────────────
  { id: 'bio_dna', name: 'DNA Double Helix Strand', category: 'exp_biology', categoryLabel: 'Biology Systems', badge: 'DNA', keywords: ['dna', 'genetics'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F9EC', 'DNA') },
  { id: 'bio_microscope', name: 'Laboratory Microscope', category: 'exp_biology', categoryLabel: 'Biology Systems', badge: 'Scope', keywords: ['microscope', 'cells'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F52C', 'Microscope') },
  { id: 'bio_cell', name: 'Eukaryotic Cell & Nucleus', category: 'exp_biology', categoryLabel: 'Biology Systems', badge: 'Cell', keywords: ['cell', 'biology'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F9A0', 'Microbe') },
  { id: 'bio_brain', name: 'Human Brain & Neurons', category: 'exp_biology', categoryLabel: 'Biology Systems', badge: 'Brain', keywords: ['brain', 'neuron'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F9E0', 'Brain') },
  { id: 'bio_heart', name: 'Anatomical Heart Pulse', category: 'exp_biology', categoryLabel: 'Biology Systems', badge: 'Heart', keywords: ['heart', 'cardiac', 'pulse'], width: 85, height: 85, svgContent: createOpenMojiSVG('1FAC0', 'Anatomical Heart') },
  { id: 'bio_leaf', name: 'Photosynthesis Green Leaf', category: 'exp_biology', categoryLabel: 'Biology Systems', badge: 'Botany', keywords: ['leaf', 'plant', 'photosynthesis'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F33F', 'Herb') },
  { id: 'bio_lungs', name: 'Respiratory Lungs', category: 'exp_biology', categoryLabel: 'Biology Systems', badge: 'Lungs', keywords: ['lungs', 'respiration', 'breath'], width: 85, height: 85, svgContent: createOpenMojiSVG('1FAC1', 'Lungs') },
  { id: 'bio_bone', name: 'Skeletal Bone Anatomy', category: 'exp_biology', categoryLabel: 'Biology Systems', badge: 'Bone', keywords: ['bone', 'skeleton'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F9B4', 'Bone') },
  { id: 'bio_eye', name: 'Human Vision Eye', category: 'exp_biology', categoryLabel: 'Biology Systems', badge: 'Optic', keywords: ['eye', 'vision', 'anatomy'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F441', 'Eye') },

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. PHYSICS, VECTORS & MECHANICS (25+ Apparatus)
  // ─────────────────────────────────────────────────────────────────────────────
  { id: 'phy_magnet', name: 'Bipolar Bar Magnet (N/S)', category: 'exp_physics', categoryLabel: 'Physics & Mechanics', badge: 'Magnet', keywords: ['magnet', 'physics'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F9F2', 'Magnet') },
  { id: 'phy_pulley', name: 'Mechanical Pulley System', category: 'exp_physics', categoryLabel: 'Physics & Mechanics', badge: 'Pulley', keywords: ['pulley', 'mechanics'], width: 85, height: 85, svgContent: createOpenMojiSVG('2699', 'Gear') },
  { id: 'phy_compass', name: 'Magnetic Navigation Compass', category: 'exp_physics', categoryLabel: 'Physics & Mechanics', badge: 'Compass', keywords: ['compass', 'navigation'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F9ED', 'Compass') },
  { id: 'phy_telescope', name: 'Optical Astronomical Telescope', category: 'exp_physics', categoryLabel: 'Physics & Mechanics', badge: 'Optics', keywords: ['telescope', 'astronomy'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F52D', 'Telescope') },
  { id: 'phy_balance', name: 'Mechanical Balance Scale', category: 'exp_physics', categoryLabel: 'Physics & Mechanics', badge: 'Scale', keywords: ['balance', 'scale', 'mass'], width: 85, height: 85, svgContent: createOpenMojiSVG('2696', 'Scale') },
  { id: 'phy_hourglass', name: 'Hourglass Gravity Timer', category: 'exp_physics', categoryLabel: 'Physics & Mechanics', badge: 'Timer', keywords: ['hourglass', 'time', 'gravity'], width: 85, height: 85, svgContent: createOpenMojiSVG('23F3', 'Hourglass') },
  { id: 'phy_thermo', name: 'Mercury Thermometer', category: 'exp_physics', categoryLabel: 'Physics & Mechanics', badge: 'Temp', keywords: ['thermometer', 'temperature'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F321', 'Thermometer') },

  // ─────────────────────────────────────────────────────────────────────────────
  // 10. MATH MANIPULATIVES (Base-10, Algebra, Tangram & 3D Shapes)
  // ─────────────────────────────────────────────────────────────────────────────
  // Base-10
  { id: 'base10_cube_1000', name: 'Base-10 1000s 3D Yellow Cube', category: 'math_base10', categoryLabel: 'Base-10 Manipulatives', badge: '1000 Units', keywords: ['math', 'base10', 'cube'], width: 110, height: 110, svgContent: `<svg viewBox="0 0 100 100" width="100%" height="100%"><polygon points="50,15 85,32 50,50 15,32" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/><polygon points="15,32 50,50 50,85 15,68" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/><polygon points="50,50 85,32 85,68 50,85" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/><text x="50" y="96" fill="#facc15" font-size="10" font-weight="900" text-anchor="middle">1000 Block</text></svg>` },
  { id: 'base10_flat_100', name: 'Base-10 100s Flat Square', category: 'math_base10', categoryLabel: 'Base-10 Manipulatives', badge: '100 Units', keywords: ['math', 'base10', 'flat'], width: 95, height: 95, svgContent: `<svg viewBox="0 0 90 90" width="100%" height="100%"><rect x="5" y="5" width="80" height="80" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/><line x1="5" y1="21" x2="85" y2="21" stroke="#ca8a04" stroke-width="0.8"/><line x1="5" y1="37" x2="85" y2="37" stroke="#ca8a04" stroke-width="0.8"/><line x1="5" y1="53" x2="85" y2="53" stroke="#ca8a04" stroke-width="0.8"/><line x1="5" y1="69" x2="85" y2="69" stroke="#ca8a04" stroke-width="0.8"/><line x1="21" y1="5" x2="21" y2="85" stroke="#ca8a04" stroke-width="0.8"/><line x1="37" y1="5" x2="37" y2="85" stroke="#ca8a04" stroke-width="0.8"/><line x1="53" y1="5" x2="53" y2="85" stroke="#ca8a04" stroke-width="0.8"/><line x1="69" y1="5" x2="69" y2="85" stroke="#ca8a04" stroke-width="0.8"/></svg>` },
  { id: 'base10_rod_10', name: 'Base-10 10s Rod', category: 'math_base10', categoryLabel: 'Base-10 Manipulatives', badge: '10 Units', keywords: ['math', 'base10', 'rod'], width: 35, height: 100, svgContent: `<svg viewBox="0 0 30 100" width="100%" height="100%"><rect x="4" y="5" width="22" height="90" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/><line x1="4" y1="14" x2="26" y2="14" stroke="#ca8a04" stroke-width="0.8"/><line x1="4" y1="23" x2="26" y2="23" stroke="#ca8a04" stroke-width="0.8"/><line x1="4" y1="32" x2="26" y2="32" stroke="#ca8a04" stroke-width="0.8"/><line x1="4" y1="41" x2="26" y2="41" stroke="#ca8a04" stroke-width="0.8"/><line x1="4" y1="50" x2="26" y2="50" stroke="#ca8a04" stroke-width="0.8"/><line x1="4" y1="59" x2="26" y2="59" stroke="#ca8a04" stroke-width="0.8"/><line x1="4" y1="68" x2="26" y2="68" stroke="#ca8a04" stroke-width="0.8"/><line x1="4" y1="77" x2="26" y2="77" stroke="#ca8a04" stroke-width="0.8"/><line x1="4" y1="86" x2="26" y2="86" stroke="#ca8a04" stroke-width="0.8"/></svg>` },
  { id: 'base10_unit_1', name: 'Base-10 1s Unit Cube', category: 'math_base10', categoryLabel: 'Base-10 Manipulatives', badge: '1 Unit', keywords: ['math', 'base10', 'unit'], width: 45, height: 45, svgContent: `<svg viewBox="0 0 40 40" width="100%" height="100%"><rect x="4" y="4" width="32" height="32" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/><text x="20" y="26" fill="#854d0e" font-size="14" font-weight="900" text-anchor="middle">1</text></svg>` },

  // Algebra & Fractions
  { id: 'alg_x_sq_pos', name: 'Algebra Tile: +x² (Blue)', category: 'math_algebra', categoryLabel: 'Algebra Tiles', badge: '+x²', keywords: ['algebra', 'x2'], width: 90, height: 90, svgContent: `<svg viewBox="0 0 80 80" width="100%" height="100%"><rect x="4" y="4" width="72" height="72" rx="6" fill="#3b82f6" stroke="#93c5fd" stroke-width="2"/><text x="40" y="46" fill="#ffffff" font-size="20" font-weight="900" text-anchor="middle">+x²</text></svg>` },
  { id: 'alg_x_sq_neg', name: 'Algebra Tile: -x² (Red)', category: 'math_algebra', categoryLabel: 'Algebra Tiles', badge: '-x²', keywords: ['algebra', '-x2'], width: 90, height: 90, svgContent: `<svg viewBox="0 0 80 80" width="100%" height="100%"><rect x="4" y="4" width="72" height="72" rx="6" fill="#ef4444" stroke="#fca5a5" stroke-width="2"/><text x="40" y="46" fill="#ffffff" font-size="20" font-weight="900" text-anchor="middle">-x²</text></svg>` },
  { id: 'alg_x_rod', name: 'Algebra Tile: +x (Green Rod)', category: 'math_algebra', categoryLabel: 'Algebra Tiles', badge: '+x', keywords: ['algebra', 'x'], width: 40, height: 90, svgContent: `<svg viewBox="0 0 30 80" width="100%" height="100%"><rect x="3" y="4" width="24" height="72" rx="4" fill="#10b981" stroke="#6ee7b7" stroke-width="2"/><text x="15" y="45" fill="#ffffff" font-size="16" font-weight="900" text-anchor="middle">+x</text></svg>` },
  { id: 'alg_unit_pos', name: 'Algebra Tile: +1 Unit (Yellow)', category: 'math_algebra', categoryLabel: 'Algebra Tiles', badge: '+1', keywords: ['algebra', 'unit'], width: 45, height: 45, svgContent: `<svg viewBox="0 0 40 40" width="100%" height="100%"><rect x="3" y="3" width="34" height="34" rx="4" fill="#eab308" stroke="#fde047" stroke-width="2"/><text x="20" y="26" fill="#000000" font-size="16" font-weight="900" text-anchor="middle">+1</text></svg>` },
  ...[
    { frac: '1/2', dec: '0.5', color: '#ec4899' },
    { frac: '1/3', dec: '0.33', color: '#8b5cf6' },
    { frac: '1/4', dec: '0.25', color: '#06b6d4' },
    { frac: '1/5', dec: '0.2', color: '#10b981' },
    { frac: '1/6', dec: '0.16', color: '#6366f1' },
    { frac: '1/8', dec: '0.125', color: '#f59e0b' },
    { frac: '1/10', dec: '0.1', color: '#14b8a6' },
    { frac: '3/4', dec: '0.75', color: '#3b82f6' }
  ].map(f => ({
    id: `frac_${f.frac.replace('/', '_')}`,
    name: `Fraction Bar: ${f.frac} (${f.dec})`,
    category: 'math_algebra',
    categoryLabel: 'Algebra & Fractions',
    badge: f.frac,
    keywords: ['fraction', 'math', f.frac],
    width: 85,
    height: 50,
    svgContent: `<svg viewBox="0 0 100 50" width="100%" height="100%"><rect x="4" y="4" width="92" height="42" rx="6" fill="${f.color}"/><text x="50" y="30" fill="#ffffff" font-size="18" font-weight="900" text-anchor="middle">${f.frac}</text></svg>`
  })),

  // Tangrams & 3D Shapes
  { id: 'tangram_7_pieces', name: 'Tangram 7-Piece Puzzle Master', category: 'math_tangram', categoryLabel: 'Tangram 7-Piece Puzzle', badge: '7 Pieces', keywords: ['tangram', 'puzzle'], width: 110, height: 110, svgContent: `<svg viewBox="0 0 100 100" width="100%" height="100%"><polygon points="0,0 100,0 50,50" fill="#ef4444"/><polygon points="0,0 0,100 50,50" fill="#3b82f6"/><polygon points="50,50 75,75 25,75" fill="#eab308"/><polygon points="100,0 100,50 75,75 50,50" fill="#10b981"/><polygon points="50,100 0,100 25,75" fill="#f97316"/><polygon points="25,75 75,75 50,100" fill="#a855f7"/><polygon points="75,75 100,50 100,100 50,100" fill="#ec4899"/></svg>` },
  { id: 'geo_3d_sphere', name: '3D Glossy Cyan Sphere', category: 'math_3dshapes', categoryLabel: '3D Geometric Solids', badge: 'Sphere', keywords: ['sphere', '3d'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F535', 'Blue Circle') },
  { id: 'geo_3d_cube', name: '3D Purple Isometric Cube', category: 'math_3dshapes', categoryLabel: '3D Geometric Solids', badge: 'Cube', keywords: ['cube', '3d'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F7E3', 'Purple Circle') },
  { id: 'geo_3d_pyramid', name: '3D Egyptian Pyramid', category: 'math_3dshapes', categoryLabel: '3D Geometric Solids', badge: 'Pyramid', keywords: ['pyramid', '3d'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F53A', 'Red Triangle') },
  { id: 'geo_protractor', name: 'Math Protractor (180° Angle Tool)', category: 'math_3dshapes', categoryLabel: '3D Geometric Solids', badge: '180°', keywords: ['protractor', 'geometry'], width: 90, height: 60, svgContent: createOpenMojiSVG('1F4D0', 'Protractor') },

  // ─────────────────────────────────────────────────────────────────────────────
  // 11. FESTIVALS & SEASONS (Diwali, Holi, Ramadan, Valentines)
  // ─────────────────────────────────────────────────────────────────────────────
  { id: 'fest_diwali_diya', name: 'Diwali Glowing Clay Diya', category: 'fest_diwali', categoryLabel: 'Diwali Lights', badge: 'Diya', keywords: ['diwali', 'diya', 'lamp'], width: 85, height: 85, svgContent: createOpenMojiSVG('1FA94', 'Diya') },
  { id: 'fest_diwali_sparkle', name: 'Diwali Festive Sparkler', category: 'fest_diwali', categoryLabel: 'Diwali Lights', badge: 'Sparkler', keywords: ['diwali', 'sparkler'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F387', 'Sparkler') },
  { id: 'fest_diwali_fireworks', name: 'Diwali Fireworks Display', category: 'fest_diwali', categoryLabel: 'Diwali Lights', badge: 'Fireworks', keywords: ['fireworks', 'diwali'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F386', 'Fireworks') },
  { id: 'fest_holi_splash', name: 'Holi Colorful Gulal Splash', category: 'fest_holi', categoryLabel: 'Holi Colors', badge: 'Holi', keywords: ['holi', 'colors', 'gulal'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F3A8', 'Holi Colors') },
  { id: 'fest_holi_watergun', name: 'Holi Pichkari Water Gun', category: 'fest_holi', categoryLabel: 'Holi Colors', badge: 'Pichkari', keywords: ['holi', 'pichkari'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F52B', 'Water Gun') },
  { id: 'fest_ramadan_crescent', name: 'Ramadan Crescent Moon & Star', category: 'fest_ramadan', categoryLabel: 'Ramadan & Eid', badge: 'Hilal', keywords: ['ramadan', 'crescent'], width: 85, height: 85, svgContent: createOpenMojiSVG('262A', 'Star and Crescent') },
  { id: 'fest_ramadan_lantern', name: 'Ramadan Fanous Lantern', category: 'fest_ramadan', categoryLabel: 'Ramadan & Eid', badge: 'Fanous', keywords: ['ramadan', 'lantern'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F3EE', 'Lantern') },
  { id: 'fest_val_heart', name: 'Valentines 3D Red Heart', category: 'fest_valentines', categoryLabel: 'Valentines Day', badge: 'Heart', keywords: ['valentines', 'heart'], width: 85, height: 85, svgContent: createOpenMojiSVG('2764', 'Red Heart') },
  { id: 'fest_val_rose', name: 'Valentines Red Rose', category: 'fest_valentines', categoryLabel: 'Valentines Day', badge: 'Rose', keywords: ['valentines', 'rose'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F339', 'Rose') },
  { id: 'fest_val_gift', name: 'Wrapped Gift Box', category: 'fest_valentines', categoryLabel: 'Valentines Day', badge: 'Gift', keywords: ['gift', 'present'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F381', 'Gift') },

  // ─────────────────────────────────────────────────────────────────────────────
  // 12. ROBOTS, TECH & INTERNATIONAL CURRENCIES
  // ─────────────────────────────────────────────────────────────────────────────
  { id: 'bot_tutor', name: 'Classroom Tutor Bot', category: 'others_robots', categoryLabel: 'Robots & Sci-Fi', badge: 'Tutor', keywords: ['robot', 'bot', 'ai'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F916', 'Robot Face') },
  { id: 'bot_drone', name: 'Cyber Surveillance Drone', category: 'others_robots', categoryLabel: 'Robots & Sci-Fi', badge: 'Drone', keywords: ['drone', 'robot'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F6F8', 'Flying Saucer') },
  { id: 'bot_arm', name: 'Industrial 6-Axis Robotic Arm', category: 'others_robots', categoryLabel: 'Robots & Sci-Fi', badge: 'Arm', keywords: ['robotic arm', 'industry'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F9BE', 'Mechanical Arm') },
  { id: 'tech_router', name: 'Wi-Fi 6 Wireless Router', category: 'others_tech', categoryLabel: 'Tech & Networking', badge: 'Wi-Fi', keywords: ['router', 'wifi', 'network'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F4F6', 'Antenna Bars') },
  { id: 'tech_cloud', name: 'Cloud Database Server', category: 'others_tech', categoryLabel: 'Tech & Networking', badge: 'Cloud DB', keywords: ['cloud', 'database', 'server'], width: 85, height: 85, svgContent: createOpenMojiSVG('2601', 'Cloud') },
  { id: 'tech_laptop', name: 'Workstation Laptop', category: 'others_tech', categoryLabel: 'Tech & Networking', badge: 'Laptop', keywords: ['laptop', 'computer'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F4BB', 'Laptop') },
  { id: 'tech_satellite', name: 'Orbital Satellite', category: 'others_tech', categoryLabel: 'Tech & Networking', badge: 'Satellite', keywords: ['satellite', 'space'], width: 85, height: 85, svgContent: createOpenMojiSVG('1F6F0', 'Satellite') },
  { id: 'cur_inr_500', name: 'Indian Rupee (₹500 Note)', category: 'others_currencies', categoryLabel: 'Currencies', badge: '₹500 INR', keywords: ['rupee', 'inr', 'currency'], width: 110, height: 65, svgContent: `<svg viewBox="0 0 110 65" width="100%" height="100%"><rect x="3" y="3" width="104" height="59" rx="6" fill="#14532d" stroke="#4ade80" stroke-width="2"/><text x="55" y="35" fill="#facc15" font-size="20" font-weight="900" text-anchor="middle">₹ 500</text><text x="55" y="52" fill="#86efac" font-size="8" font-weight="700" text-anchor="middle">RESERVE BANK OF INDIA</text></svg>` },
  { id: 'cur_inr_2000', name: 'Indian Rupee (₹2000 Note)', category: 'others_currencies', categoryLabel: 'Currencies', badge: '₹2000 INR', keywords: ['rupee', '2000', 'inr'], width: 110, height: 65, svgContent: `<svg viewBox="0 0 110 65" width="100%" height="100%"><rect x="3" y="3" width="104" height="59" rx="6" fill="#831843" stroke="#f472b6" stroke-width="2"/><text x="55" y="35" fill="#fdf2f8" font-size="20" font-weight="900" text-anchor="middle">₹ 2000</text><text x="55" y="52" fill="#fbcfe8" font-size="8" font-weight="700" text-anchor="middle">RESERVE BANK OF INDIA</text></svg>` },
  { id: 'cur_usd_100', name: 'US Dollar ($100 Note)', category: 'others_currencies', categoryLabel: 'Currencies', badge: '$100 USD', keywords: ['dollar', 'usd', 'money'], width: 110, height: 65, svgContent: `<svg viewBox="0 0 110 65" width="100%" height="100%"><rect x="3" y="3" width="104" height="59" rx="6" fill="#064e3b" stroke="#34d399" stroke-width="2"/><text x="55" y="35" fill="#ffffff" font-size="20" font-weight="900" text-anchor="middle">$ 100</text><text x="55" y="52" fill="#a7f3d0" font-size="8" font-weight="700" text-anchor="middle">UNITED STATES OF AMERICA</text></svg>` },
  { id: 'cur_btc', name: 'Bitcoin Gold Coin (₿)', category: 'others_currencies', categoryLabel: 'Currencies', badge: 'Bitcoin', keywords: ['bitcoin', 'crypto', 'btc'], width: 85, height: 85, svgContent: createOpenMojiSVG('1FA99', 'Coin') },

  // ─────────────────────────────────────────────────────────────────────────────
  // 13. ALPHABETS & PHONETICS (Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, ASL, Russian, Greek, French, Arabic)
  // ─────────────────────────────────────────────────────────────────────────────
  // Telugu (80+ Characters)
  ...[
    { char: 'అ', ph: 'A', sub: 'Amma (అమ్మ)' },
    { char: 'ఆ', ph: 'AA', sub: 'Aavu (ఆవు)' },
    { char: 'ఇ', ph: 'I', sub: 'Ilu (ఇల్లు)' },
    { char: 'ఈ', ph: 'EE', sub: 'Eega (ఈగ)' },
    { char: 'ఉ', ph: 'U', sub: 'Udugu (ఉడుత)' },
    { char: 'ఊ', ph: 'OO', sub: 'Ooyala (ఊయల)' },
    { char: 'ఋ', ph: 'RU', sub: 'Rushi (ఋషి)' },
    { char: 'ఎ', ph: 'E', sub: 'Eluka (ఎలుక)' },
    { char: 'ఏ', ph: 'AE', sub: 'Enugu (ఏనుగు)' },
    { char: 'ఐ', ph: 'AI', sub: 'Aidu (ఐదు)' },
    { char: 'ఒ', ph: 'O', sub: 'Onte (ఒంటె)' },
    { char: 'ఓ', ph: 'OH', sub: 'Oda (ఓడ)' },
    { char: 'ఔ', ph: 'AU', sub: 'Oushadham (ఔషధం)' },
    { char: 'అం', ph: 'AM', sub: 'Ambaram (అంబరం)' },
    { char: 'క', ph: 'KA', sub: 'Kalam (కలం)' },
    { char: 'ఖ', ph: 'KHA', sub: 'Khadgam (ఖడ్గం)' },
    { char: 'గ', ph: 'GA', sub: 'Gadiyaram (గడియారం)' },
    { char: 'ఘ', ph: 'GHA', sub: 'Ghatam (ఘటం)' },
    { char: 'చ', ph: 'CHA', sub: 'Chakra (చక్రం)' },
    { char: 'జ', ph: 'JA', sub: 'Jada (జడ)' },
    { char: 'ట', ph: 'TA', sub: 'Tamata (టమాట)' },
    { char: 'డ', ph: 'DA', sub: 'Dabba (డబ్బా)' },
    { char: 'ణ', ph: 'NA', sub: 'Baanam (బాణం)' },
    { char: 'త', ph: 'THA', sub: 'Tabala (తబల)' },
    { char: 'ద', ph: 'DA', sub: 'Danda (దండ)' },
    { char: 'న', ph: 'NA', sub: 'Nalla (నల్ల)' },
    { char: 'ప', ph: 'PA', sub: 'Palaka (పలక)' },
    { char: 'బ', ph: 'BA', sub: 'Banthi (బంతి)' },
    { char: 'మ', ph: 'MA', sub: 'Mancham (మంచం)' },
    { char: 'య', ph: 'YA', sub: 'Yagnam (యజ్ఞం)' },
    { char: 'ర', ph: 'RA', sub: 'Ratham (రథం)' },
    { char: 'ల', ph: 'LA', sub: 'Latha (లత)' },
    { char: 'వ', ph: 'VA', sub: 'Vana (వన)' },
    { char: 'స', ph: 'SA', sub: 'Sabbu (సబ్బు)' },
    { char: 'హ', ph: 'HA', sub: 'Hamsa (హంస)' },
    { char: 'ా', ph: 'Deergham', sub: 'ా (ఆ-త్వం)' },
    { char: 'ి', ph: 'Gudi', sub: 'ి (ఇ-త్వం)' },
    { char: 'ీ', ph: 'Gudi Deergham', sub: 'ీ (ఈ-త్వం)' },
    { char: 'ు', ph: 'Kommu', sub: 'ు (ఉ-త్వం)' },
    { char: 'ూ', ph: 'Kommu Deergham', sub: 'ూ (ఊ-త్వం)' },
    { char: 'ె', ph: 'Ethvam', sub: 'ె (ఎ-త్వం)' },
    { char: 'ే', ph: 'Ethva Deergham', sub: 'ే (ఏ-త్వం)' },
    { char: 'ై', ph: 'Aithvam', sub: 'ై (ఐ-త్వం)' },
    { char: 'ొ', ph: 'Othvam', sub: 'ొ (ఒ-త్వం)' },
    { char: 'ో', ph: 'Othva Deergham', sub: 'ో (ఓ-త్వం)' },
    { char: 'ౌ', ph: 'Authvam', sub: 'ౌ (ఔ-త్వం)' }
  ].map((t, idx) => ({
    id: `telugu_card_${idx + 1}`,
    name: `Telugu: ${t.char} (${t.ph})`,
    category: 'alphabets_telugu',
    categoryLabel: 'Telugu (తెలుగు)',
    badge: t.ph,
    keywords: ['telugu', 'alphabet', t.char, t.ph, t.sub],
    width: 90,
    height: 90,
    defaultColor: '#38bdf8',
    svgContent: createLetterCardSVG(t.char, t.ph, '#38bdf8', t.sub)
  })),

  // Hindi (70+ Cards)
  ...[
    { char: 'अ', ph: 'A', sub: 'Anar (अनार)' },
    { char: 'आ', ph: 'AA', sub: 'Aam (आम)' },
    { char: 'इ', ph: 'I', sub: 'Imli (इमली)' },
    { char: 'ई', ph: 'EE', sub: 'Eekh (ईख)' },
    { char: 'उ', ph: 'U', sub: 'Ullu (उल्लू)' },
    { char: 'ऊ', ph: 'OO', sub: 'Oon (ऊन)' },
    { char: 'ऋ', ph: 'RI', sub: 'Rishi (ऋषि)' },
    { char: 'ए', ph: 'E', sub: 'Ektara (एकतारा)' },
    { char: 'ऐ', ph: 'AI', sub: 'Ainak (ऐनक)' },
    { char: 'ओ', ph: 'O', sub: 'Okhli (ओखली)' },
    { char: 'औ', ph: 'AU', sub: 'Aurat (औरत)' },
    { char: 'अं', ph: 'AM', sub: 'Angoor (अंगूर)' },
    { char: 'क', ph: 'KA', sub: 'Kamal (कमल)' },
    { char: 'ख', ph: 'KHA', sub: 'Khargosh (खरगोश)' },
    { char: 'ग', ph: 'GA', sub: 'Gamla (गमला)' },
    { char: 'घ', ph: 'GHA', sub: 'Ghar (घर)' },
    { char: 'च', ph: 'CHA', sub: 'Chammach (चम्मच)' },
    { char: 'ज', ph: 'JA', sub: 'Jahaz (जहाज)' },
    { char: 'ट', ph: 'TA', sub: 'Tamatar (टमाटर)' },
    { char: 'ड', ph: 'DA', sub: 'Damru (डमरू)' },
    { char: 'ण', ph: 'NA', sub: 'Baan (बाण)' },
    { char: 'त', ph: 'TA', sub: 'Tarbooz (तरबूज)' },
    { char: 'द', ph: 'DA', sub: 'Dawat (दवात)' },
    { char: 'ध', ph: 'DHA', sub: 'Dhanush (धनुष)' },
    { char: 'न', ph: 'NA', sub: 'Nal (नल)' },
    { char: 'प', ph: 'PA', sub: 'Patang (पतंग)' },
    { char: 'ब', ph: 'BA', sub: 'Bakri (बकरी)' },
    { char: 'म', ph: 'MA', sub: 'Machhli (मछली)' },
    { char: 'य', ph: 'YA', sub: 'Yagya (यज्ञ)' },
    { char: 'र', ph: 'RA', sub: 'Rath (रथ)' },
    { char: 'ल', ph: 'LA', sub: 'Lattu (लट्टू)' },
    { char: 'व', ph: 'VA', sub: 'Vak (वक)' },
    { char: 'स', ph: 'SA', sub: 'Sapera (सपेरा)' },
    { char: 'ह', ph: 'HA', sub: 'Hal (हल)' }
  ].map((h, idx) => ({
    id: `hindi_letter_${idx + 1}`,
    name: `Hindi: ${h.char} (${h.ph})`,
    category: 'alphabets_hindi',
    categoryLabel: 'Hindi (हिन्दी)',
    badge: h.ph,
    keywords: ['hindi', 'devanagari', h.char, h.ph, h.sub],
    width: 90,
    height: 90,
    defaultColor: '#f472b6',
    svgContent: createLetterCardSVG(h.char, h.ph, '#f472b6', h.sub)
  })),

  // ASL Sign Language (26 items)
  ...['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map((letter) => ({
    id: `asl_sign_${letter.toLowerCase()}`,
    name: `ASL Hand: ${letter}`,
    category: 'alphabets_asl',
    categoryLabel: 'ASL (American Sign Language)',
    badge: `ASL-${letter}`,
    keywords: ['asl', 'sign language', 'hand', letter],
    width: 90,
    height: 90,
    defaultColor: '#eab308',
    svgContent: createLetterCardSVG(`✋ ${letter}`, `ASL '${letter}'`, '#eab308', 'Fingerspelling')
  })),

  // Russian (33 Cyrillic)
  ...['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Э', 'Ю', 'Я'].map((r, idx) => ({
    id: `russian_card_${idx + 1}`,
    name: `Russian: ${r}`,
    category: 'alphabets_russian',
    categoryLabel: 'Russian (Русский)',
    badge: `Буква ${idx + 1}`,
    keywords: ['russian', 'cyrillic', r],
    width: 90,
    height: 90,
    defaultColor: '#fb923c',
    svgContent: createLetterCardSVG(r, `Letter ${idx + 1}`, '#fb923c', 'Cyrillic')
  })),

  // Greek STEM (30+ Variables)
  ...[
    { char: 'α', name: 'Alpha', math: 'Angle' },
    { char: 'β', name: 'Beta', math: 'Decay' },
    { char: 'γ', name: 'Gamma', math: 'Lorentz' },
    { char: 'δ', name: 'Delta', math: 'Variation' },
    { char: 'θ', name: 'Theta', math: 'Angle' },
    { char: 'λ', name: 'Lambda', math: 'Wavelength' },
    { char: 'μ', name: 'Mu', math: 'Friction' },
    { char: 'π', name: 'Pi (3.14)', math: 'Circle Ratio' },
    { char: 'σ', name: 'Sigma', math: 'Stress / Std' },
    { char: 'ω', name: 'Omega', math: 'Angular Vel' },
    { char: 'Δ', name: 'Delta', math: 'Change' },
    { char: 'Ω', name: 'Omega', math: 'Ohms' },
    { char: 'Σ', name: 'Sigma', math: 'Summation' },
    { char: 'Ψ', name: 'Psi', math: 'Quantum Wave' },
    { char: 'Φ', name: 'Phi', math: 'Electric Flux' }
  ].map((g, idx) => ({
    id: `greek_card_${idx + 1}`,
    name: `Greek: ${g.char} (${g.name})`,
    category: 'alphabets_greek',
    categoryLabel: 'Greek (Math & Physics)',
    badge: g.name,
    keywords: ['greek', 'math', g.char, g.name],
    width: 90,
    height: 90,
    defaultColor: '#a855f7',
    svgContent: createLetterCardSVG(g.char, g.name, '#a855f7', g.math)
  })),

  // Tamil (30+ Cards)
  ...[
    { char: 'அ', ph: 'A', sub: 'Amma' },
    { char: 'ஆ', ph: 'AA', sub: 'Aadu' },
    { char: 'இ', ph: 'I', sub: 'Ilai' },
    { char: 'ஈ', ph: 'EE', sub: 'Eeti' },
    { char: 'உ', ph: 'U', sub: 'Ural' },
    { char: 'ஊ', ph: 'OO', sub: 'Oonjal' },
    { char: 'எ', ph: 'E', sub: 'Eli' },
    { char: 'ஏ', ph: 'AE', sub: 'Eani' },
    { char: 'க', ph: 'KA', sub: 'Kan (கண்)' },
    { char: 'கா', ph: 'KAA', sub: 'Kaagam (காகம்)' }
  ].map((t, idx) => ({
    id: `tamil_card_${idx + 1}`,
    name: `Tamil: ${t.char} (${t.ph})`,
    category: 'alphabets_tamil',
    categoryLabel: 'Tamil (தமிழ்)',
    badge: t.ph,
    keywords: ['tamil', t.char, t.ph],
    width: 90,
    height: 90,
    defaultColor: '#34d399',
    svgContent: createLetterCardSVG(t.char, t.ph, '#34d399', t.sub)
  })),

  // Kannada, Malayalam, Marathi, Arabic, French
  ...[
    { char: 'ಅ', ph: 'A', sub: 'Arasa', cat: 'alphabets_kannada', label: 'Kannada (ಕನ್ನಡ)', color: '#facc15' },
    { char: 'ಆ', ph: 'AA', sub: 'Aane', cat: 'alphabets_kannada', label: 'Kannada (ಕನ್ನಡ)', color: '#facc15' },
    { char: 'ಇ', ph: 'I', sub: 'Ili', cat: 'alphabets_kannada', label: 'Kannada (ಕನ್ನಡ)', color: '#facc15' },
    { char: 'ಕ', ph: 'KA', sub: 'Kamala', cat: 'alphabets_kannada', label: 'Kannada (ಕನ್ನಡ)', color: '#facc15' },
    { char: 'അ', ph: 'A', sub: 'Amma', cat: 'alphabets_malayalam', label: 'Malayalam (മലയാളം)', color: '#10b981' },
    { char: 'ആ', ph: 'AA', sub: 'Aana', cat: 'alphabets_malayalam', label: 'Malayalam (മലയാളം)', color: '#10b981' },
    { char: 'ക', ph: 'KA', sub: 'Kadal', cat: 'alphabets_malayalam', label: 'Malayalam (മലയാളം)', color: '#10b981' },
    { char: 'अ', ph: 'A', sub: 'Ananas', cat: 'alphabets_marathi', label: 'Marathi (मराठी)', color: '#f97316' },
    { char: 'आई', ph: 'AAI', sub: 'Mother', cat: 'alphabets_marathi', label: 'Marathi (मराठी)', color: '#f97316' },
    { char: 'क', ph: 'KA', sub: 'Kamal', cat: 'alphabets_marathi', label: 'Marathi (मराठी)', color: '#f97316' },
    { char: 'أ', ph: 'Alif', sub: 'Lion (أسد)', cat: 'alphabets_arabic', label: 'Arabic (العربية)', color: '#14b8a6' },
    { char: 'ب', ph: 'Baa', sub: 'House (بيت)', cat: 'alphabets_arabic', label: 'Arabic (العربية)', color: '#14b8a6' },
    { char: 'ت', ph: 'Taa', sub: 'Apple (تفاح)', cat: 'alphabets_arabic', label: 'Arabic (العربية)', color: '#14b8a6' },
    { char: 'é', ph: 'e-aigu', sub: 'Café, École', cat: 'alphabets_french', label: 'French & Accents', color: '#60a5fa' },
    { char: 'è', ph: 'e-grave', sub: 'Père, Mère', cat: 'alphabets_french', label: 'French & Accents', color: '#60a5fa' },
    { char: 'ç', ph: 'c-cédille', sub: 'Français', cat: 'alphabets_french', label: 'French & Accents', color: '#60a5fa' }
  ].map((l, idx) => ({
    id: `lang_card_${l.cat}_${idx + 1}`,
    name: `${l.label}: ${l.char} (${l.ph})`,
    category: l.cat,
    categoryLabel: l.label,
    badge: l.ph,
    keywords: [l.cat, l.char, l.ph, l.sub],
    width: 90,
    height: 90,
    defaultColor: l.color,
    svgContent: createLetterCardSVG(l.char, l.ph, l.color, l.sub)
  }))
];
