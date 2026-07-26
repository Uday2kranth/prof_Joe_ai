import React from 'react';
import { X, Key, Sun, Moon, Trash2, LogOut, Shield, User, ChevronRight } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  userRole?: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onClearHistory: () => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  username,
  userRole = 'OU STUDENT',
  theme,
  onToggleTheme,
  onOpenSettings,
  onClearHistory,
  onLogout
}) => {
  if (!isOpen) return null;

  let displayUsername = 'Guest User';
  if (username && typeof username === 'string' && username.trim() !== '' && username !== 'undefined') {
    displayUsername = username;
  } else {
    const saved = localStorage.getItem('chatterbot_username');
    if (saved && saved !== 'undefined' && saved.trim() !== '') {
      displayUsername = saved;
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content kokonut-drawer-card profile-drawer-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User className="text-cyan-400" size={20} />
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>User Account & Preferences</h2>
          </div>
          <button onClick={onClose} className="close-btn" aria-label="Close Modal"><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* User Info Header Card */}
          <div className="profile-user-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '16px' }}>
            <div className="profile-avatar-gradient-ring" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
              <img src="/joe-avatar.png" alt="User Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="profile-name-text" style={{ fontWeight: 700, fontSize: '1.05rem' }}>{displayUsername}</span>
              <span className="profile-role-badge" style={{ marginTop: '2px', display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                <Shield size={10} /> {userRole.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Preferences Action List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              onClick={() => { onClose(); onOpenSettings(); }}
              className="profile-action-item"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '14px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Key size={18} className="text-cyan-400" style={{ flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span className="action-title" style={{ fontWeight: 600, fontSize: '0.88rem' }}>API Key Credentials</span>
                  <span className="text-muted-custom" style={{ fontSize: '0.72rem' }}>Configure cloud provider keys</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400" style={{ flexShrink: 0 }} />
            </div>

            <div
              onClick={onToggleTheme}
              className="profile-action-item"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '14px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {theme === 'dark' ? <Sun size={18} className="text-amber-400" style={{ flexShrink: 0 }} /> : <Moon size={18} className="text-purple-400" style={{ flexShrink: 0 }} />}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span className="action-title" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Color Theme Mode</span>
                  <span className="text-muted-custom" style={{ fontSize: '0.72rem' }}>Currently in {theme.toUpperCase()} mode</span>
                </div>
              </div>
              <span className="action-pill-badge" style={{ textTransform: 'capitalize', flexShrink: 0 }}>{theme} Mode</span>
            </div>

            <div
              onClick={() => {
                if (window.confirm('Are you sure you want to clear chat history?')) {
                  onClearHistory();
                  onClose();
                }
              }}
              className="profile-action-item danger-item"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '14px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Trash2 size={18} className="text-rose-400" style={{ flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span className="action-title text-rose-400" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Clear Active Chat History</span>
                  <span className="text-muted-custom" style={{ fontSize: '0.72rem' }}>Wipe session history</span>
                </div>
              </div>
              <span className="action-pill-badge danger-badge" style={{ flexShrink: 0 }}>Clear</span>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => { onClose(); onLogout(); }}
            className="profile-logout-btn"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '14px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
          >
            <LogOut size={16} />
            <span>Log Out Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
