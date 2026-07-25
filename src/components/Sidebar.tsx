import React from 'react';
import {
  MessageSquare,
  BookOpen,
  Sparkles,
  Layers,
  Settings,
  Plus,
  Trash2,
  X,
  Sun,
  Moon,
  GraduationCap
} from 'lucide-react';
import type { ChatSession } from '../types';

export type ActiveViewType = 'chat' | 'examprep' | 'prompts' | 'system_prompts' | 'diagrams';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  activeView: ActiveViewType;
  onViewChange: (view: ActiveViewType) => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onOpenSettings: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  activeView,
  onViewChange,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onOpenSettings,
  theme,
  onToggleTheme
}) => {
  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={onCloseMobile}
      />

      <aside className={`app-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="brand-section">
            <div className="logo-icon" style={{ padding: 0, overflow: 'hidden', borderRadius: '50%' }}>
              <img src="/joe-avatar.png" alt="Prof. Joe" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="brand-info">
              <h2>Prof. Joe AI</h2>
              <span className="badge">OU Exam Mentor</span>
            </div>
          </div>
          <button onClick={onCloseMobile} className="mobile-close-btn" aria-label="Close Sidebar">
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-action-top">
          <button onClick={onNewSession} className="new-chat-btn">
            <Plus size={16} />
            <span>New Chat Session</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Navigation Hub</div>
          <button
            onClick={() => { onViewChange('chat'); onCloseMobile(); }}
            className={`nav-item ${activeView === 'chat' ? 'active' : ''}`}
          >
            <MessageSquare size={16} />
            <span>AI Multi-Model Chat</span>
          </button>

          <button
            onClick={() => { onViewChange('examprep'); onCloseMobile(); }}
            className={`nav-item ${activeView === 'examprep' ? 'active' : ''}`}
          >
            <BookOpen size={16} />
            <span>Exam Prep & Syllabus</span>
          </button>

          <button
            onClick={() => { onViewChange('system_prompts'); onCloseMobile(); }}
            className={`nav-item ${activeView === 'system_prompts' ? 'active' : ''}`}
          >
            <GraduationCap size={16} />
            <span>System Prompt Library</span>
          </button>

          <button
            onClick={() => { onViewChange('prompts'); onCloseMobile(); }}
            className={`nav-item ${activeView === 'prompts' ? 'active' : ''}`}
          >
            <Sparkles size={16} />
            <span>User Prompts Hub</span>
          </button>

          <button
            onClick={() => { onViewChange('diagrams'); onCloseMobile(); }}
            className={`nav-item ${activeView === 'diagrams' ? 'active' : ''}`}
          >
            <Layers size={16} />
            <span>Diagram Studio Engine</span>
          </button>
        </nav>

        <div className="sidebar-sessions-list">
          <div className="nav-section-title">Chat History</div>
          <div className="sessions-scroll-area">
            {sessions.length === 0 ? (
              <div className="empty-sessions">No previous chats</div>
            ) : (
              sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`session-item ${activeSessionId === sess.id ? 'active' : ''}`}
                  onClick={() => { onSelectSession(sess.id); onViewChange('chat'); onCloseMobile(); }}
                >
                  <MessageSquare size={14} className="session-icon" />
                  <span className="session-title">{sess.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(sess.id);
                    }}
                    className="delete-session-btn"
                    title="Delete Chat"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          <button onClick={onToggleTheme} className="btn btn-secondary btn-full" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-400" />}
            <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
          </button>

          <button onClick={onOpenSettings} className="btn btn-primary btn-full" title="Configure API Keys">
            <Settings size={16} />
            <span>API Credentials</span>
          </button>
        </div>
      </aside>
    </>
  );
};
