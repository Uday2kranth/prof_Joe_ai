import React, { useState } from 'react';
import { Menu, Sparkles, Layout, RotateCw } from 'lucide-react';
import type { ActiveViewType } from '../types';
import Toolbar from './Toolbar';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSettings?: () => void;
  onClearChat?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  activeView: ActiveViewType;
  onViewChange?: (view: ActiveViewType) => void;
  username?: string;
  onLogout?: () => void;
  onOpenProfileModal?: () => void;
  appLayoutMode?: 'standard' | 'hub-demo';
  onToggleAppLayoutMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  activeView,
  onViewChange,
  appLayoutMode = 'standard',
  onToggleAppLayoutMode
}) => {
  const [isSpinning, setIsSpinning] = useState(false);

  const viewTitles: Record<string, string> = {
    chat: 'AI Multi-Model Dashboard',
    examprep: 'Exam Prep & Syllabus Hub',
    system_prompts: 'Official System Prompt Library',
    prompts: 'User Prompts Hub',
    diagrams: 'Kroki Diagram Studio',
    fun_personas: 'Fun AI Personas Lounge',
    cubes: 'Interactive 3D Cubes Playground'
  };

  const toggleSpin = () => {
    setIsSpinning(prev => !prev);
  };

  return (
    <header className="app-header" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}>
      <div className="header-top-row">
        <div className="header-left">
          <button onClick={onToggleSidebar} className="menu-btn" aria-label="Toggle Navigation Sidebar">
            <Menu size={20} />
          </button>

          {/* Animated Prof. Joe Dog Icon Avatar */}
          <div
            onClick={toggleSpin}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              overflow: 'hidden',
              cursor: 'pointer',
              border: '2px solid var(--accent-cyan)',
              boxShadow: isSpinning ? '0 0 14px rgba(6, 182, 212, 0.9)' : '0 0 6px rgba(6, 182, 212, 0.4)',
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
              alt="Prof. Joe"
              className={isSpinning ? 'spinning-dog' : ''}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div className="view-title">
            <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700 }}>{viewTitles[activeView] || 'Prof. Joe AI Dashboard'}</h2>
          </div>
        </div>

        {/* Demo Hub View Switcher Toggle Pill & Refresh Button */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onToggleAppLayoutMode && (
            <button 
              type="button" 
              onClick={onToggleAppLayoutMode} 
              className="demo-view-toggle-btn"
              title="Switch between Classic View and New Version Hub"
            >
              {appLayoutMode === 'hub-demo' ? <Layout size={14} /> : <Sparkles size={14} className="text-amber-400" />}
              <span className="demo-view-toggle-text">{appLayoutMode === 'hub-demo' ? 'Classic View' : 'New Version'}</span>
            </button>
          )}

          <button 
            type="button" 
            onClick={() => window.location.reload()} 
            className="demo-view-toggle-btn"
            style={{ padding: '6px 10px' }}
            title="Refresh App"
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      {/* KokonutUI Figma-Inspired Animated Toolbar Navigation */}
      <div className="header-dock-center">
        <Toolbar
          activeId={activeView}
          onSelect={(itemId) => onViewChange?.(itemId as ActiveViewType)}
        />
      </div>
    </header>
  );
};
