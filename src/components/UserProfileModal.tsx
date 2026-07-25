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

  const displayUsername = typeof username === 'string' && username.trim() ? username : 'Admin@uday';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content kokonut-drawer-card profile-drawer-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <User className="text-cyan-400" size={20} />
            <h2>User Account & Preferences</h2>
          </div>
          <button onClick={onClose} className="close-btn"><X size={18} /></button>
        </div>

        <div className="modal-body space-y-4" style={{ padding: '20px 0' }}>
          {/* User Info Header Card */}
          <div className="user-profile-header-card flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="profile-avatar-gradient-ring" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
              <img src="/joe-avatar.png" alt="User Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-white">{displayUsername}</span>
              <span className="profile-role-badge mt-1 flex items-center gap-1">
                <Shield size={10} /> {userRole.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Preferences Action List */}
          <div className="profile-actions-list flex flex-col gap-2">
            <button
              onClick={() => { onClose(); onOpenSettings(); }}
              className="profile-action-btn flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-cyan-500/10 border border-slate-700/40 text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Key size={18} className="text-cyan-400" />
                <span className="font-medium text-sm">API Key Credentials</span>
              </div>
              <span className="text-xs text-slate-400">Configure</span>
            </button>

            <button
              onClick={onToggleTheme}
              className="profile-action-btn flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-cyan-500/10 border border-slate-700/40 text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-purple-400" />}
                <span className="font-medium text-sm">Color Theme Mode</span>
              </div>
              <span className="text-xs text-slate-400 capitalize">{theme} Mode</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear chat history?')) {
                  onClearHistory();
                  onClose();
                }
              }}
              className="profile-action-btn flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-rose-500/10 border border-slate-700/40 text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-rose-400" />
                <span className="font-medium text-sm">Clear Active Chat History</span>
              </div>
              <span className="text-xs text-rose-400">Clear</span>
            </button>
          </div>
        </div>

        <div className="modal-footer pt-4 border-t border-slate-800">
          <button
            onClick={() => { onClose(); onLogout(); }}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-semibold text-sm transition-colors"
          >
            <LogOut size={16} />
            <span>Log Out Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
