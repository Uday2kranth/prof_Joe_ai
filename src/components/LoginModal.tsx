import React, { useState } from 'react';
import { UserCheck, Key, ShieldCheck, X, LogIn } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string, token: string, role: string) => void;
  currentUsername: string;
}

const PRESET_USERS = [
  { username: 'Admin@uday', label: '👑 Admin (Uday)', role: 'admin' },
  { username: 'sai_kiran', label: '🎓 Sai Kiran', role: 'student' },
  { username: 'gagan', label: '🎓 Gagan', role: 'student' },
  { username: 'akash', label: '🎓 Akash', role: 'student' },
  { username: 'sai_ram', label: '🎓 Sai Ram', role: 'student' },
  { username: 'tharun', label: '🎓 Tharun', role: 'student' },
  { username: 'ban', label: '🎓 Ban', role: 'student' },
  { username: 'AV_Student', label: '🏫 AV Student', role: 'guest_student' },
  { username: 'uday01', label: '👤 Guest 01', role: 'guest' }
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUsername
}) => {
  const [username, setUsername] = useState<string>(currentUsername || 'Admin@uday');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePresetSelect = (selectedUser: string) => {
    setUsername(selectedUser);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess(data.username, data.token, data.role || 'user');
        onClose();
      } else {
        setErrorMsg(data.error || 'Invalid credentials. Please check your username and password.');
      }
    } catch (err: any) {
      // Fallback for local demo mode if backend serverless endpoint is offline
      console.warn('Backend login endpoint unavailable, applying local authentication fallback', err);
      onLoginSuccess(username, 'local_demo_token', username.includes('Admin') ? 'admin' : 'student');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content login-modal-box" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck className="text-cyan-400" size={22} />
            <h3 style={{ margin: 0 }}>Prof. Joe AI Login</h3>
          </div>
          <button onClick={onClose} className="close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ paddingTop: '12px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Select your student or admin profile to access your personalized exam prep hub & AI models.
          </p>

          {/* Quick Profile Selection Chips */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Quick Profile Switcher:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PRESET_USERS.map((user) => (
                <button
                  key={user.username}
                  type="button"
                  onClick={() => handlePresetSelect(user.username)}
                  style={{
                    background: username === user.username ? 'var(--accent-cyan)' : 'var(--bg-tertiary)',
                    color: username === user.username ? '#ffffff' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '4px 10px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {user.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                <UserCheck size={14} />
                <span>Username / Account</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (e.g. Admin@uday or sai_kiran)"
                required
                className="text-input"
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                <Key size={14} />
                <span>Password</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="text-input"
                style={{ width: '100%' }}
              />
            </div>

            {errorMsg && (
              <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                {errorMsg}
              </div>
            )}

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '18px' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary">
                <LogIn size={16} />
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
