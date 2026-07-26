import React from 'react';
import { Menu } from 'lucide-react';
import type { ActiveViewType } from '../types';
// @ts-ignore
import Dock from './Dock';

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
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  activeView,
  onViewChange
}) => {
  const viewTitles: Record<string, string> = {
    chat: 'AI Multi-Model Dashboard',
    examprep: 'Exam Prep & Syllabus Hub',
    system_prompts: 'Official System Prompt Library',
    prompts: 'User Prompts Hub',
    diagrams: 'Kroki Diagram Studio',
    fun_personas: 'Fun AI Personas Lounge',
    cubes: 'Interactive 3D Cubes Playground'
  };

  const dockNavItems = [
    { icon: '💬', label: 'Chat', onClick: () => onViewChange?.('chat'), active: activeView === 'chat' },
    { icon: '🎓', label: 'Exam Prep', onClick: () => onViewChange?.('examprep'), active: activeView === 'examprep' },
    { icon: '📘', label: 'System Prompts', onClick: () => onViewChange?.('system_prompts'), active: activeView === 'system_prompts' },
    { icon: '✨', label: 'Prompts', onClick: () => onViewChange?.('prompts'), active: activeView === 'prompts' },
    { icon: '📊', label: 'Diagrams', onClick: () => onViewChange?.('diagrams'), active: activeView === 'diagrams' },
    { icon: '🎭', label: 'Fun Personas', onClick: () => onViewChange?.('fun_personas'), active: activeView === 'fun_personas' },
    { icon: '🎮', label: '3D Cubes', onClick: () => onViewChange?.('cubes'), active: activeView === 'cubes' }
  ];

  return (
    <header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid var(--border-color)', gap: '12px' }}>
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onToggleSidebar} className="menu-btn" aria-label="Toggle Navigation Sidebar">
          <Menu size={20} />
        </button>
        <div className="view-title" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{viewTitles[activeView] || 'Prof. Joe AI Dashboard'}</h2>
        </div>
      </div>

      {/* React Bits Magnetic Dock Section Navigation */}
      <div className="header-dock-center flex items-center justify-center">
        <Dock
          items={dockNavItems}
          panelHeight={46}
          baseItemSize={38}
          magnification={56}
          distance={160}
        />
      </div>
    </header>
  );
};
