import React from 'react';
import { X, Key, Sun, Moon, Trash2, LogOut, Shield, User } from 'lucide-react';

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

  // Robust username validation preventing 'undefined' string
  let displayUsername = 'Admin@uday';
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
          <div className="modal-title flex items-center gap-2">
            <User className="text-cyan-400" size={20} />
            <h2 className="text-lg font-bold">User Account & Preferences</h2>
          </div>
          <button onClick={onClose} className="close-btn" aria-label="Close Modal"><X size={18} /></button>
        </div>

        <div className="modal-body space-y-4" style={{ padding: '16px 0' }}>
          {/* User Info Header Card */}
          <div className="profile-user-card flex items-center gap-3 p-4 rounded-xl">
            <div className="profile-avatar-gradient-ring" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
              <img src="/joe-avatar.png" alt="User Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base profile-name-text">{displayUsername}</span>
              <span className="profile-role-badge mt-1 flex items-center gap-1">
                <Shield size={10} /> {userRole.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Preferences Action List */}
          <div className="profile-actions-list flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => { onClose(); onOpenSettings(); }}
              className="profile-action-item flex items-center justify-between p-3.5 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <Key size={18} className="text-cyan-400" />
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-sm action-title">API Key Credentials</span>
                  <span className="text-xs text-muted-custom">Configure cloud provider keys</span>
                </div>
              </div>
              <span className="action-pill-badge">Configure</span>
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              className="profile-action-item flex items-center justify-between p-3.5 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-purple-400" />}
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-sm action-title">Color Theme Mode</span>
                  <span className="text-xs text-muted-custom">Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                </div>
              </div>
              <span className="action-pill-badge capitalize">{theme} Mode</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear chat history?')) {
                  onClearHistory();
                  onClose();
                }
              }}
              className="profile-action-item danger-item flex items-center justify-between p-3.5 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-rose-400" />
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-sm action-title text-rose-400">Clear Active Chat History</span>
                  <span className="text-xs text-rose-400/70">Wipe session history</span>
                </div>
              </div>
              <span className="action-pill-badge danger-badge">Clear</span>
            </button>
          </div>
        </div>

        <div className="modal-footer pt-3 border-t border-slate-700/40">
          <button
            type="button"
            onClick={() => { onClose(); onLogout(); }}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl profile-logout-btn font-semibold text-sm transition-all"
          >
            <LogOut size={16} />
            <span>Log Out Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
