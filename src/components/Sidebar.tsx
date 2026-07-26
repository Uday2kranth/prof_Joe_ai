import React from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import type { ChatSession } from '../types';

export type ActiveViewType = 'chat' | 'examprep' | 'prompts' | 'system_prompts' | 'diagrams' | 'cubes';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  activeView?: ActiveViewType;
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
  onClearChat?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  onViewChange,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  currentUser,
  onOpenProfileModal,
  onClearChat
}) => {
  let displayUsername = 'Guest User';
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

      <aside className={`app-sidebar ${isOpen ? 'open' : 'collapsed'}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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

        <div className="sidebar-action-top" style={{ padding: '12px 16px' }}>
          <button onClick={onNewSession} className="new-chat-btn" style={{ width: '100%' }}>
            <Plus size={16} />
            <span>New Chat Session</span>
          </button>
        </div>

        {/* Scrollable Chat History List (Expanded to fill vertical space) */}
        <div className="sidebar-history-section" style={{ flex: 1, overflowY: 'auto', padding: '0 16px', display: 'flex', flexDirection: 'column' }}>
          <div className="nav-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span>Chat History ({sessions.length})</span>
            {onClearChat && (
              <button
                onClick={onClearChat}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', fontWeight: 700 }}
                title="Clear All Chat History"
              >
                <Trash2 size={12} />
                <span>Clear All</span>
              </button>
            )}
          </div>
          <div className="session-list" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sessions.length === 0 ? (
              <div className="no-sessions" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '12px 0' }}>
                No previous chats. Start a new session above.
              </div>
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

        {/* KokonutUI Profile Card Anchored at Very Bottom */}
        <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid var(--border-color)' }}>
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
