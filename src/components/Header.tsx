import React from 'react';
import { Menu, Settings, Trash2, UserCheck, LogOut } from 'lucide-react';
import type { ActiveViewType } from './Sidebar';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onClearChat: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  activeView: ActiveViewType;
  username?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenSettings,
  onClearChat,
  activeView,
  username = 'Admin@uday',
  onLogout
}) => {
  const viewTitles: Record<string, string> = {
    chat: 'AI Multi-Model Dashboard',
    examprep: 'Exam Prep & Syllabus Hub',
    system_prompts: 'Official System Prompt Library',
    prompts: 'User Prompts Hub',
    diagrams: 'Kroki Diagram Studio'
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button onClick={onToggleSidebar} className="menu-btn" aria-label="Toggle Navigation Sidebar">
          <Menu size={20} />
        </button>
        <div className="view-title">
          <h2>{viewTitles[activeView] || 'Prof. Joe AI Dashboard'}</h2>
        </div>
      </div>

      <div className="controls-section">
        <div className="action-buttons">
          {activeView === 'chat' && (
            <button onClick={onClearChat} className="btn btn-secondary" title="Clear Chat History">
              <Trash2 size={16} />
              <span className="desktop-only">Clear</span>
            </button>
          )}

          <button onClick={onOpenSettings} className="btn btn-secondary" title="Configure API Keys">
            <Settings size={16} />
          </button>

          <button
            onClick={onOpenSettings}
            className="btn btn-secondary user-badge-btn"
            title={`Active Account: ${username} (Click for API Settings)`}
            style={{ gap: '6px' }}
          >
            <UserCheck size={15} />
            <span>{username}</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="btn btn-primary"
              title="Sign Out of Account"
              style={{ gap: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
            >
              <LogOut size={15} />
              <span className="desktop-only">Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
