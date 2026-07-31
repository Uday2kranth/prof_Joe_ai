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
  User, 
  Layout, 
  Cpu, 
  PenTool, 
  Layers,
  Zap
} from 'lucide-react';
import { MorphingText } from './MorphingText';

interface DemoLandingHubProps {
  onSelectWorkspace: (workspaceId: 'chat' | 'personas' | 'fun_personas' | 'examprep' | 'diagrams' | 'system_prompts' | 'prompts' | 'cubes' | 'extractor_studio' | 'code_lab') => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSwitchToStandard: () => void;
  configuredKeysCount?: number;
}

export const DemoLandingHub: React.FC<DemoLandingHubProps> = ({
  onSelectWorkspace,
  onOpenSettings,
  onOpenProfile,
  theme,
  onToggleTheme,
  onSwitchToStandard,
  configuredKeysCount = 8
}) => {
  const [isSpinning, setIsSpinning] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const rafId = React.useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
          {/* View Switcher Pill */}
          <button 
            type="button" 
            onClick={onSwitchToStandard} 
            className="demo-view-toggle-btn"
            title="Switch back to classic sidebar & tab bar interface"
          >
            <Layout size={14} />
            <span>Classic Layout</span>
          </button>

          {/* Quick API Key Pill */}
          <button 
            type="button" 
            onClick={onOpenSettings} 
            className="demo-status-pill cyan-pill"
          >
            <Key size={14} />
            <span>{configuredKeysCount} Keys Ready</span>
          </button>

          {/* Theme Switcher */}
          <button 
            type="button" 
            onClick={onToggleTheme} 
            className="demo-icon-btn"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-purple-400" />}
          </button>

          {/* User Profile Button */}
          <button 
            type="button" 
            onClick={onOpenProfile} 
            className="demo-profile-avatar-btn"
            aria-label="User Profile"
          >
            <User size={18} />
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

          <p className="demo-hero-description">
            Experience 100% full-bleed dedicated workspaces designed to eliminate visual clutter and maximize learning focus.
          </p>
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
              <p>Chat seamlessly with Cerebras, Gemini, OpenRouter, and Groq models. Multi-key rotation support.</p>
            </div>
            <div className="portal-card-footer">
              <div className="portal-meta-features">
                <span><Cpu size={12} /> 12+ AI Models</span>
                <span>⚡ Multi-Key</span>
              </div>
              <button type="button" className="launch-portal-btn cyan-btn">
                <span>Launch Chat</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Card 2: Fun AI Personas Lounge */}
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
              <div className="portal-meta-features">
                <span>🎭 Balaraju & Aakash</span>
                <span>✨ Custom Tones</span>
              </div>
              <button type="button" className="launch-portal-btn rose-btn">
                <span>Open Personas</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

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
              <div className="portal-meta-features">
                <span><BookOpen size={12} /> MIGFHT & Networks</span>
                <span>⚡ High Yield</span>
              </div>
              <button type="button" className="launch-portal-btn emerald-btn">
                <span>Open Exam Hub</span>
                <ArrowRight size={14} />
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
              <div className="portal-meta-features">
                <span><Layers size={12} /> Kroki Engine</span>
                <span>PNG Export</span>
              </div>
              <button type="button" className="launch-portal-btn purple-btn">
                <span>Open Studio</span>
                <ArrowRight size={14} />
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
              <div className="portal-meta-features">
                <span>⚡ 1-Click System Lock</span>
                <span>Verified Rules</span>
              </div>
              <button type="button" className="launch-portal-btn cyan-btn">
                <span>Open System Prompts</span>
                <ArrowRight size={14} />
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
              <div className="portal-meta-features">
                <span>⚡ 1-Click Apply</span>
                <span>Custom Library</span>
              </div>
              <button type="button" className="launch-portal-btn amber-btn">
                <span>Open User Prompts</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Card 6: 3D Physics Lab */}
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
              <div className="portal-meta-features">
                <span>🎮 WebGL 3D</span>
                <span>Physics Sim</span>
              </div>
              <button type="button" className="launch-portal-btn blue-btn">
                <span>Launch Lab</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Card 7: Document & Code Text Extractor Studio */}
          <div 
            className="hub-portal-card diagram-portal text-extractor-portal"
            onClick={() => onSelectWorkspace('extractor_studio')}
            style={{ borderColor: 'rgba(6, 182, 212, 0.4)', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(8, 51, 68, 0.6))' }}
          >
            <div className="portal-card-header">
              <div className="portal-icon-badge cyan-bg" style={{ backgroundColor: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4' }}>
                <Cpu size={24} />
              </div>
              <span className="portal-tag cyan-tag" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.3)' }}>Client-Side Parser</span>
            </div>
            <div className="portal-card-body">
              <h3>Document & Code Extractor Studio</h3>
              <p>Extract text, inspect code, and parse PDF, DOCX, IPYNB & Images 100% locally in browser without token limits!</p>
            </div>
            <div className="portal-card-footer">
              <div className="portal-meta-features">
                <span>📄 PDF, DOCX & IPYNB</span>
                <span>⚡ 0 Server Fee</span>
              </div>
              <button type="button" className="launch-portal-btn cyan-btn">
                <span>Open Extractor Studio</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Card 8: Practical Academic Code Lab */}
          <div 
            className="hub-portal-card diagram-portal"
            onClick={() => onSelectWorkspace('code_lab')}
            style={{ borderColor: 'rgba(168, 85, 247, 0.4)', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(88, 28, 135, 0.5))' }}
          >
            <div className="portal-card-header">
              <div className="portal-icon-badge purple-bg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>
                <PenTool size={24} />
              </div>
              <span className="portal-tag purple-tag" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.3)' }}>Split IDE Workspace</span>
            </div>
            <div className="portal-card-body">
              <h3>Practical Academic Code Lab</h3>
              <p>Split-screen resizable IDE for ML, Web Dev & Systems labs with paper dataset OCR, 8 Bento presets, and .zip exports!</p>
            </div>
            <div className="portal-card-footer">
              <div className="portal-meta-features">
                <span>🧪 8 Bento Presets</span>
                <span>📦 .zip Project Export</span>
              </div>
              <button type="button" className="launch-portal-btn purple-btn">
                <span>Open Code Lab</span>
                <ArrowRight size={14} />
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
