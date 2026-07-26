import React from 'react';
import { Menu } from 'lucide-react';
import type { ActiveViewType } from '../types';
// @ts-ignore
import { PillNav } from './PillNav';

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

  const navItems = [
    { label: '💬 Chat', href: 'chat' },
    { label: '🎓 Exam Prep', href: 'examprep' },
    { label: '📘 System Prompts', href: 'system_prompts' },
    { label: '✨ Prompts', href: 'prompts' },
    { label: '📊 Diagrams', href: 'diagrams' },
    { label: '🎭 Fun Personas', href: 'fun_personas' },
    { label: '🎮 3D Cubes', href: 'cubes' }
  ];

  return (
    <header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border-color)', gap: '12px' }}>
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onToggleSidebar} className="menu-btn" aria-label="Toggle Navigation Sidebar">
          <Menu size={20} />
        </button>
        <div className="view-title" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{viewTitles[activeView] || 'Prof. Joe AI Dashboard'}</h2>
        </div>
      </div>

      {/* PillNav GSAP Liquid Nav Container */}
      <div className="header-pillnav-center">
        <PillNav
          items={navItems}
          activeHref={activeView}
          onItemSelect={(href: string) => onViewChange && onViewChange(href as ActiveViewType)}
          logo="/joe-avatar.png"
          logoAlt="Prof. Joe AI Avatar"
        />
      </div>
    </header>
  );
};
