import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Key, LogIn, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (username: string, token: string, role: string) => void;
  preventClose?: boolean;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLoginSuccess,
  preventClose = false,
  onClose
}) => {
  const [username, setUsername] = useState<string>('Admin@uday');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

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
        onLoginSuccess(data.username, data.token, data.role || 'student');
      } else {
        setErrorMsg(data.error || 'Invalid credentials. Please check your password.');
      }
    } catch (err: any) {
      console.error('Login network error:', err);
      setErrorMsg('Connection error. Please ensure Vercel environment variables are configured.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ background: 'rgba(5, 7, 15, 0.92)', backdropFilter: 'blur(12px)', zIndex: 9999 }}>
      <div className="modal-content login-modal-box" style={{ maxWidth: '420px', width: '90%', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px', paddingTop: '10px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '50%', marginBottom: '12px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <ShieldCheck size={32} className="text-cyan-400" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>Prof. Joe AI Login</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Enter your credentials to unlock your exam prep hub.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              <UserCheck size={14} />
              <span>Username / Account</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username (e.g. Admin@uday or sai_kiran)"
              required
              className="text-input"
              style={{ width: '100%', padding: '10px 12px', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              <Key size={14} />
              <span>Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter account password"
              required
              className="text-input"
              style={{ width: '100%', padding: '10px 12px', fontSize: '0.9rem' }}
            />
          </div>

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            {!preventClose && onClose && (
              <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 1, padding: '10px', justifyContent: 'center', fontSize: '0.95rem' }}
            >
              <LogIn size={16} />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
