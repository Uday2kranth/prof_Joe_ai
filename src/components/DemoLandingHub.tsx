import React from 'react';
import { 
  MessageSquare, 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  Box, 
  ArrowRight, 
  Key,
  Moon, 
  Sun, 
  Settings,
  Cpu, 
  PenTool, 
  Layers,
  Zap,
  FlaskConical,
  Binary,
  Award,
  Pin,
  Compass
} from 'lucide-react';
import { MorphingText } from './MorphingText';
import { Hero3DPreviewShowcase } from './Hero3DPreviewShowcase';


interface DemoLandingHubProps {
  onSelectWorkspace: (workspaceId: 'chat' | 'personas' | 'fun_personas' | 'examprep' | 'diagrams' | 'system_prompts' | 'prompts' | 'cubes' | 'extractor_studio' | 'code_lab' | 'lecture_notes' | 'sandbox' | 'dsa_lab' | 'flashcards_studio' | 'quiz_arena' | 'pinned_archive' | 'test_diagrams' | 'deep_learning_studio' | 'master_syllabus') => void;
  onOpenSettings: () => void;
  onOpenSettingsStudio?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  userRole?: string;
}

export const DemoLandingHub: React.FC<DemoLandingHubProps> = ({
  onSelectWorkspace,
  onOpenSettings,
  onOpenSettingsStudio,
  theme,
  onToggleTheme,
  userRole = 'student'
}) => {
  const [isSpinning, setIsSpinning] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const rafId = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.setProperty('--mouse-x', '30vw');
      containerRef.current.style.setProperty('--mouse-y', '260px');
    }
  }, [theme]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const x = e.clientX;
    const y = e.clientY;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${x}px`);
        containerRef.current.style.setProperty('--mouse-y', `${y}px`);
      }
    });
  };

  const toggleSpin = () => {
    setIsSpinning(prev => !prev);
  };

  return (
    <div 
      ref={containerRef} 
      className="demo-landing-container"
      onMouseMove={handleMouseMove}
    >
      {/* Top Header Navigation Bar */}
      <header className="demo-hub-header">
        <div className="demo-brand-logo">
          {/* Animated Prof. Joe Dog Avatar */}
          <div
            onClick={toggleSpin}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              overflow: 'hidden',
              cursor: 'pointer',
              border: '2px solid var(--accent-cyan, #06b6d4)',
              boxShadow: isSpinning ? '0 0 16px rgba(6, 182, 212, 0.9)' : '0 0 8px rgba(6, 182, 212, 0.4)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0f172a',
              flexShrink: 0
            }}
            title="Click to spin Prof. Joe!"
          >
            <img
              src="/joe-avatar.png"
              alt="Prof. Joe Avatar"
              className={isSpinning ? 'spinning-dog' : ''}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <h1 className="demo-app-title">Prof. Joe AI</h1>
            <span className="demo-app-subtitle">Command Portal & Academic Workspace</span>
          </div>
        </div>

        <div className="demo-header-actions">
          {/* Theme Switcher */}
          <button 
            type="button" 
            onClick={onToggleTheme} 
            className="demo-icon-btn"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-purple-400" />}
          </button>

          {/* Quick API Keys & Model Selector (Key Symbol) */}
          <button 
            type="button" 
            onClick={onOpenSettings} 
            className="demo-quick-key-btn"
            title="Quick API Keys & Model Selector"
            aria-label="Quick API Keys & Model Selector"
          >
            <Key size={18} className="key-bounce-on-hover" />
          </button>

          {/* Universal Settings & Print Studio 3D Gear Button */}
          <button 
            type="button" 
            onClick={onOpenSettingsStudio || onOpenSettings} 
            className="demo-settings-gear-btn"
            title="Open Universal Settings & Print Studio"
            aria-label="Universal Settings & Print Studio"
          >
            <Settings size={18} className="gear-spin-on-hover" />
          </button>
        </div>
      </header>

      {/* Main Hero & Workspace Cards Grid */}
      <main className="demo-hub-main">
        <div className="demo-hero-section">
          <div className="demo-hero-badge">
            <Zap size={14} className="text-cyan-400" />
            <span>Multi-Model AI & Exam Intelligence Portal</span>
          </div>
          <h2 className="demo-hero-title">Select Your Academic Workspace</h2>

          <MorphingText 
            texts={[
              "Multi-Model AI Lounge",
              "OU Exam Prep & Question Bank",
              "Kroki Architecture Studio",
              "Official System Prompt Library",
              "Fun AI Personas Lounge",
              "Interactive 3D Physics Lab"
            ]} 
            className="my-3"
          />

          {/* 🌟 2-Tier Architecture: Live 60 FPS 3D Hero Preview Showcase */}
          <Hero3DPreviewShowcase onLaunchStudio={onSelectWorkspace} />
        </div>


        {/* Workspace Cards Grid */}
        <div className="demo-portals-grid">
          {/* Card 1: AI Chat & Lounge */}
          <div 
            className="hub-portal-card chat-portal"
            onClick={() => onSelectWorkspace('chat')}
          >
            <div className="portal-card-header">
              <div className="portal-icon-badge cyan-bg">
                <MessageSquare size={24} />
              </div>
              <span className="portal-tag cyan-tag">Primary Hub</span>
            </div>
            <div className="portal-card-body">
              <h3>AI Chat & Multi-Model Lounge</h3>
              <p>Chat seamlessly with OpenRouter, Gemini, Groq, and NVIDIA models. Multi-key rotation support.</p>
            </div>
            <div className="portal-card-footer">
              <button type="button" className="launch-portal-btn">
                <span>Launch Chat</span>
                <ArrowRight size={14} className="launch-arrow" />
              </button>
            </div>
          </div>

          {/* Teacher / Admin Exclusive: Lecture Notes Studio */}
          {(userRole === 'teacher' || userRole === 'admin') && (
            <div 
              className="hub-portal-card lecture-portal"
              onClick={() => onSelectWorkspace('lecture_notes')}
            >
              <div className="portal-card-header">
                <div className="portal-icon-badge cyan-bg">
                  <GraduationCap size={24} />
                </div>
                <span className="portal-tag cyan-tag">Educator Studio</span>
              </div>
              <div className="portal-card-body">
                <h3>Lecture Notes Studio 🎓</h3>
                <p>Generate classroom scripts, blackboard notes, student handouts, and syllabus maps with print & PDF export.</p>
              </div>
              <div className="portal-card-footer">
                <button type="button" className="launch-portal-btn">
                  <span>Open Studio</span>
                  <ArrowRight size={14} className="launch-arrow" />
                </button>
              </div>
            </div>
          )}

          {/* Card: Fun AI Personas Lounge (Hidden for Teacher role) */}
          {userRole !== 'teacher' && (
            <div 
              className="hub-portal-card personas-portal"
              onClick={() => onSelectWorkspace('fun_personas')}
            >
              <div className="portal-card-header">
                <div className="portal-icon-badge rose-bg">
                  <Sparkles size={24} />
                </div>
                <span className="portal-tag rose-tag">Fun AI Personas</span>
              </div>
              <div className="portal-card-body">
                <h3>Fun AI Personas Lounge</h3>
                <p>Interact with Balaraju, Aakash, Rick-inspired, and specialized AI tutor personas with custom tones.</p>
              </div>
              <div className="portal-card-footer">
                <button type="button" className="launch-portal-btn">
                  <span>Open Personas</span>
                  <ArrowRight size={14} className="launch-arrow" />
                </button>
              </div>
            </div>
          )}

          {/* Card 2: Exam Prep Hub */}
          <div 
            className="hub-portal-card exam-portal"
            onClick={() => onSelectWorkspace('examprep')}
          >
            <div className="portal-card-header">
              <div className="portal-icon-badge emerald-bg">
                <GraduationCap size={24} />
              </div>
              <span className="portal-tag emerald-tag">OU Semester 4</span>
            </div>
            <div className="portal-card-body">
              <h3>OU Exam Prep & Question Bank</h3>
              <p>High-yield exam questions, syllabus breakdowns, 12-mark essay guides, and unit predictions.</p>
            </div>
            <div className="portal-card-footer">
              <button type="button" className="launch-portal-btn">
                <span>Open Exam Hub</span>
                <ArrowRight size={14} className="launch-arrow" />
              </button>
            </div>
          </div>

          {/* Card: Unified Master Syllabus & Roadmaps */}
          <div 
            className="hub-portal-card master-syllabus-portal"
            onClick={() => onSelectWorkspace('master_syllabus')}
            style={{
              borderColor: 'rgba(56, 189, 248, 0.45)',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.75))'
            }}
          >
            <div className="portal-card-header">
              <div className="portal-icon-badge cyan-bg">
                <Compass size={24} />
              </div>
              <span className="portal-tag cyan-tag">Tier-1 Curriculum & Paths</span>
            </div>
            <div className="portal-card-body">
              <h3>Syllabus & Roadmaps 🗺️</h3>
              <p>Exhaustive subject-wise & education-level syllabus breakdown (Foundations ➔ B.Tech ➔ M.Tech ➔ Ph.D.) + interactive career roadmap generator.</p>
            </div>
            <div className="portal-card-footer">
              <button type="button" className="launch-portal-btn">
                <span>Explore Syllabus & Roadmaps</span>
                <ArrowRight size={14} className="launch-arrow" />
              </button>
            </div>
          </div>

          {/* Card: Flashcard Study Studio */}
          <div 
            className="hub-portal-card flashcards-portal"
            onClick={() => onSelectWorkspace('flashcards_studio')}
          >
            <div className="portal-card-header">
              <div className="portal-icon-badge cyan-bg">
                <Layers size={24} />
              </div>
              <span className="portal-tag cyan-tag">Persistent Decks</span>
            </div>
            <div className="portal-card-body">
              <h3>Flashcards Studio & Deck Hub 📇</h3>
              <p>3D interactive flip revision decks, spaced repetition cram mode, formula recall, and mastery tracking with 0 tokens.</p>
            </div>
            <div className="portal-card-footer">
              <button type="button" className="launch-portal-btn">
                <span>Open Studio</span>
                <ArrowRight size={14} className="launch-arrow" />
              </button>
            </div>
          </div>

          {/* Card: Practice Quiz Arena */}
          <div 
            className="hub-portal-card quiz-portal"
            onClick={() => onSelectWorkspace('quiz_arena')}
          >
            <div className="portal-card-header">
              <div className="portal-icon-badge emerald-bg">
                <Award size={24} />
              </div>
              <span className="portal-tag emerald-tag">Exam Arena</span>
            </div>
            <div className="portal-card-body">
              <h3>Exam Practice Quiz Arena 🏆</h3>
              <p>Multiple-choice exam simulations, instant solution derivations, mistake drill replay, and readiness ratings.</p>
            </div>
            <div className="portal-card-footer">
              <button type="button" className="launch-portal-btn">
                <span>Launch Arena</span>
                <ArrowRight size={14} className="launch-arrow" />
              </button>
            </div>
          </div>

          {/* Card 3: Diagram Studio */}
          <div 
            className="hub-portal-card diagram-portal"
            onClick={() => onSelectWorkspace('diagrams')}
          >
            <div className="portal-card-header">
              <div className="portal-icon-badge purple-bg">
                <PenTool size={24} />
              </div>
              <span className="portal-tag purple-tag">Full-Bleed Studio</span>
            </div>
            <div className="portal-card-body">
              <h3>Kroki Diagram Studio</h3>
              <p>50/50 Code-to-SVG Editor for Mermaid, PlantUML, and Graphviz architecture diagrams.</p>
            </div>
            <div className="portal-card-footer">
              <button type="button" className="launch-portal-btn">
                <span>Open Studio</span>
                <ArrowRight size={14} className="launch-arrow" />
              </button>
            </div>
          </div>

          {/* Card: Dedicated DSA Lab */}
          <div 
            className="hub-portal-card dsa-portal"
            onClick={() => onSelectWorkspace('dsa_lab')}
          >
            <div className="portal-card-header">
              <div className="portal-icon-badge cyan-bg">
                <Binary size={24} />
              </div>
              <span className="portal-tag cyan-tag">
                7 Sub-Labs
              </span>
            </div>
            <div className="portal-card-body">
              <h3>Data Structures & Algorithms (DSA Lab) ⚡</h3>
              <p>Sorting, Two-Pointers, Stacks/Queues/AVL, Graph Dijkstra/BFS/DFS, DP Knapsack/LCS, N-Queens & KMP with Multi-Language Code.</p>
            </div>
            <div className="portal-card-footer">
              <button type="button" className="launch-portal-btn">
                <span>Launch DSA Lab</span>
                <ArrowRight size={14} className="launch-arrow" />
              </button>
            </div>
          </div>

          {/* Card: Interactive Sandbox & Whiteboard Lab */}
          <div 
            className="hub-portal-card sandbox-portal"
            onClick={() => onSelectWorkspace('sandbox')}
          >
            <div className="portal-card-header">
              <div className="portal-icon-badge purple-bg">
                <FlaskConical size={24} />
              </div>
              <span className="portal-tag purple-tag">
                5-in-1 Lab
              </span>
            </div>
            <div className="portal-card-body">
              <h3>Interactive Sandbox & Whiteboard</h3>
              <p>Smart Teaching Board & 120+ Gizmos, KaTeX Academic Chalkboards, Excalidraw Vector Canvas & 1-Click Studio Gateways.</p>
            </div>
            <div className="portal-card-footer">
              <button type="button" className="launch-portal-btn">
                <span>Launch Sandbox</span>
                <ArrowRight size={14} className="launch-arrow" />
              </button>
            </div>
          </div>

          {/* Card: Mafs, JSXGraph & MathBox Diagram Studio */}
          <div 
            className="hub-portal-card math-diagrams-portal"
            onClick={() => onSelectWorkspace('test_diagrams')}
          >
            <div className="portal-card-header">
              <div className="portal-icon-badge cyan-bg">
                <Compass size={24} />
              </div>
              <span className="portal-tag cyan-tag">
                Interactive Math Suite
              </span>
            </div>
            <div className="portal-card-body">
              <h3>Mafs, JSXGraph & MathBox Studio 📐</h3>
              <p>Declarative math & ML visualizations: React-SVG graphs, 3D WebGL surfaces, and client-side data modeling with 0 tokens.</p>
            </div>
            <div className="portal-card-footer">
              <button type="button" className="launch-portal-btn">
                <span>Launch Framework Studio</span>
                <ArrowRight size={14} className="launch-arrow" />
              </button>
            </div>
          </div>

          {/* Card: Deep Learning & Neural Network Studio */}
          <div 
            className="hub-portal-card deep-learning-portal"
            onClick={() => onSelectWorkspace('deep_learning_studio')}
          >
            <div className="portal-card-header">
              <div className="portal-icon-badge purple-bg">
                <Cpu size={24} />
              </div>
              <span className="portal-tag purple-tag">
                Neural & DL Suite
              </span>
            </div>
            <div className="portal-card-body">
              <h3>Deep Learning Studio 🧠</h3>
              <p>In-browser neural networks, CNN feature maps, RNN unrolling, Transformer attention heatmaps, and 3D latent embeddings with 0 backend.</p>
            </div>
            <div className="portal-card-footer">
              <button type="button" className="launch-portal-btn">
                <span>Launch DL Studio</span>
                <ArrowRight size={14} className="launch-arrow" />
              </button>
            </div>
          </div>

          {/* Card 4: Official System Prompts Library */}
          <div 
            className="hub-portal-card system-prompts-portal"
            onClick={() => onSelectWorkspace('system_prompts')}
          >
            <div className="portal-card-header">
              <div className="portal-icon-badge cyan-bg">
                <Sparkles size={24} />
              </div>
              <span className="portal-tag cyan-tag">Official Systems</span>
            </div>
            <div className="portal-card-body">
              <h3>Official System Prompt Library</h3>
              <p>Curated AI persona system prompts, exam evaluator rules, and academic persona behaviors.</p>
            </div>
            <div className="portal-card-footer">
              <button type="button" className="launch-portal-btn">
                <span>Open System Prompts</span>
                <ArrowRight size={14} className="launch-arrow" />
              </button>
            </div>
          </div>

          {/* Card 5: User Prompt Templates */}
          <div 
            className="hub-portal-card prompts-portal"
            onClick={() => onSelectWorkspace('prompts')}
          >
            <div className="portal-card-header">
              <div className="portal-icon-badge amber-bg">
                <BookOpen size={24} />
              </div>
              <span className="portal-tag amber-tag">User Templates</span>
            </div>
            <div className="portal-card-body">
              <h3>User Prompts & Templates</h3>
              <p>Custom user exam prompt templates, quick revision shortcuts, and essay outline generators.</p>
            </div>
            <div className="portal-card-footer">
              <button type="button" className="launch-portal-btn">
                <span>Open User Prompts</span>
                <ArrowRight size={14} className="launch-arrow" />
              </button>
            </div>
          </div>

          {/* Card 6: 3D Physics Lab (Hidden for Teacher role) */}
          {userRole !== 'teacher' && (
            <div 
              className="hub-portal-card cubes-portal"
              onClick={() => onSelectWorkspace('cubes')}
            >
              <div className="portal-card-header">
                <div className="portal-icon-badge blue-bg">
                  <Box size={24} />
                </div>
                <span className="portal-tag blue-tag">Interactive 3D</span>
              </div>
              <div className="portal-card-body">
                <h3>3D Physics Lab</h3>
                <p>Interactive Three.js physics canvas with real-time matrix, tilt sensitivity, and ripple controls.</p>
              </div>
              <div className="portal-card-footer">
                <button type="button" className="launch-portal-btn">
                  <span>Launch Lab</span>
                  <ArrowRight size={14} className="launch-arrow" />
                </button>
              </div>
            </div>
          )}

          {/* Card 7: Textractor */}
          <div 
            className="hub-portal-card text-extractor-portal"
            onClick={() => onSelectWorkspace('extractor_studio')}
          >
            <div className="portal-card-header">
              <div className="portal-icon-badge cyan-bg">
                <Cpu size={24} />
              </div>
              <span className="portal-tag cyan-tag">Client-Side Parser</span>
            </div>
            <div className="portal-card-body">
              <h3>Textractor ⚡</h3>
              <p>Extract text, inspect code, and parse PDF, DOCX, IPYNB & Images 100% locally in browser without token limits!</p>
            </div>
            <div className="portal-card-footer">
              <button type="button" className="launch-portal-btn">
                <span>Open Textractor</span>
                <ArrowRight size={14} className="launch-arrow" />
              </button>
            </div>
          </div>

          {/* Card 8: Code Dungeon */}
          <div 
            className="hub-portal-card code-dungeon-portal"
            onClick={() => onSelectWorkspace('code_lab')}
          >
            <div className="portal-card-header">
              <div className="portal-icon-badge purple-bg">
                <PenTool size={24} />
              </div>
              <span className="portal-tag purple-tag">Split IDE Workspace</span>
            </div>
            <div className="portal-card-body">
              <h3>Code Dungeon 🏰</h3>
              <p>Split-screen resizable IDE for ML, Web Dev & Systems labs with paper dataset OCR, 8 Bento presets, and .zip exports!</p>
            </div>
            <div className="portal-card-footer">
              <button type="button" className="launch-portal-btn">
                <span>Open Code Dungeon</span>
                <ArrowRight size={14} className="launch-arrow" />
              </button>
            </div>
          </div>

          {/* Card 9: Pinned Notes & Exam Archive */}
          <div 
            className="hub-portal-card pinned-archive-portal"
            onClick={() => onSelectWorkspace('pinned_archive')}
          >
            <div className="portal-card-header">
              <div className="portal-icon-badge amber-bg">
                <Pin size={24} className="fill-amber-400" />
              </div>
              <span className="portal-tag amber-tag">Exam Cheat Sheet</span>
            </div>
            <div className="portal-card-body">
              <h3>Pinned Notes & Exam Archive 🏛️</h3>
              <p>Centralized revision hub for all bookmarked formulas, definitions, algorithms, and 1-page print cheat sheets.</p>
            </div>
            <div className="portal-card-footer">
              <button type="button" className="launch-portal-btn">
                <span>Open Archive</span>
                <ArrowRight size={14} className="launch-arrow" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Landing Footer */}
      <footer className="demo-hub-footer">
        <span>Prof. Joe AI — Command Portal Demo View</span>
        <span>Click any workspace to experience full-bleed view</span>
      </footer>
    </div>
  );
};
