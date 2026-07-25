import React from 'react';
import {
  MessageSquare,
  BookOpen,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  X,
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
  onOpenSettings?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  currentUser?: any;
  onOpenProfileModal?: () => void;
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
  currentUser,
  onOpenProfileModal
}) => {
  let displayUsername = 'Admin@uday';
  if (currentUser && typeof currentUser === 'string' && currentUser.trim() !== '' && currentUser !== 'undefined') {
    displayUsername = currentUser;
  } else if (currentUser && typeof currentUser === 'object' && currentUser.username && currentUser.username !== 'undefined') {
    displayUsername = currentUser.username;
  } else {
    const saved = localStorage.getItem('chatterbot_username');
    if (saved && saved !== 'undefined' && saved.trim() !== '') {
      displayUsername = saved;
    }
  }

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
            <Sparkles size={16} />
            <span>System Prompt Library</span>
          </button>

          <button
            onClick={() => { onViewChange('prompts'); onCloseMobile(); }}
            className={`nav-item ${activeView === 'prompts' ? 'active' : ''}`}
          >
            <GraduationCap size={16} />
            <span>User Prompts Hub</span>
          </button>

          <button
            onClick={() => { onViewChange('diagrams'); onCloseMobile(); }}
            className={`nav-item ${activeView === 'diagrams' ? 'active' : ''}`}
          >
            <Layers size={16} />
            <span>Diagram & Mermaid Studio</span>
          </button>
        </nav>

        <div className="sidebar-history-section">
          <div className="nav-section-title">Chat History ({sessions.length})</div>
          <div className="session-list">
            {sessions.length === 0 ? (
              <div className="no-sessions">No previous chats. Start a new session above.</div>
            ) : (
              sessions.map(sess => (
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
          {/* KokonutUI Profile Card (Opens User Profile Drawer) */}
          <div
            className="kokonut-profile-card"
            onClick={onOpenProfileModal}
            style={{ cursor: 'pointer' }}
            title="Click to view Account & Preferences"
          >
            <div className="profile-avatar-container">
              <div className="profile-avatar-gradient-ring">
                <img src="/joe-avatar.png" alt="User Profile" className="profile-avatar-img" />
              </div>
            </div>
            <div className="profile-details">
              <div className="profile-username">{displayUsername}</div>
              <span className="profile-role-badge">OU PRO MENTOR</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
