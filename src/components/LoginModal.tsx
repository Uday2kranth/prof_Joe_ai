import React, { useState } from 'react';
import { UserCheck, Key, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { BorderBeam } from './ui/BorderBeam';
import { LetterGlitch } from './LetterGlitch';
import { getApiUrl } from '../services/apiService';

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
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  React.useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch(getApiUrl('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        const userObj = data.user || data;
        onLoginSuccess(
          userObj.username || username.trim(),
          userObj.token || `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          userObj.role || 'student'
        );
        setLoading(false);
        return;
      } else {
        setErrorMsg(data.error || 'Invalid credentials. Please verify your username and password.');
      }
    } catch (err: any) {
      console.error('Authentication request failed:', err);
      setErrorMsg('Unable to connect to authentication server. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay login-backdrop-animated"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#020617',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        overflow: 'hidden'
      }}
    >
      {/* React Bits LetterGlitch Scrambling Matrix Background */}
      <LetterGlitch
        glitchColors={['#06b6d4', '#61dca3', '#3b82f6', '#a855f7']}
        glitchSpeed={45}
        centerVignette={false}
        outerVignette={true}
        smooth={true}
      />

      {/* Animated Floating Glow Orbs */}
      <div className="kokonut-dots-overlay login-mouse-dots" style={{ zIndex: 2 }} />
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(59, 130, 246, 0) 70%)',
          top: '-10%',
          left: '15%',
          filter: 'blur(60px)',
          animation: 'orbFloat 10s ease-in-out infinite alternate',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(236, 72, 153, 0) 70%)',
          bottom: '-10%',
          right: '15%',
          filter: 'blur(70px)',
          animation: 'orbFloat 14s ease-in-out infinite alternate-reverse',
          pointerEvents: 'none'
        }}
      />

      <style>{`
        @keyframes orbFloat {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.12); }
          100% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes loginCardEntrance {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .login-card-glass {
          animation: loginCardEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          background: rgba(15, 23, 42, 0.88) !important;
          backdrop-filter: blur(24px) saturate(180%) !important;
          border: 1px solid rgba(6, 182, 212, 0.3) !important;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(6, 182, 212, 0.2) !important;
        }
      `}</style>

      {/* Glassmorphism Login Box with Magic UI BorderBeam */}
      <div
        className="modal-content login-card-glass"
        style={{
          maxWidth: '420px',
          width: '90%',
          borderRadius: '24px',
          padding: '32px 28px',
          position: 'relative',
          zIndex: 10,
          overflow: 'hidden'
        }}
      >
        {/* Magic UI BorderBeam Animated Border Gradient Beam */}
        <BorderBeam size={160} duration={6} colorFrom="#06b6d4" colorTo="#a855f7" borderWidth={2} />
        <BorderBeam size={160} duration={6} delay={3} colorFrom="#f43f5e" colorTo="#3b82f6" borderWidth={2} />

        <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative', zIndex: 25 }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              margin: '0 auto 12px auto',
              padding: '3px',
              background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.5)'
            }}
          >
            <img src="/joe-avatar.png" alt="Prof. Joe AI" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px 0', color: '#ffffff', letterSpacing: '-0.02em' }}>
            Prof. Joe AI Portal
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Sparkles size={14} className="text-cyan-400" />
            <span>Enter credentials to unlock your exam prep hub</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative', zIndex: 25 }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
              <UserCheck size={14} className="text-cyan-400" />
              <span>Username / Account</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username (e.g. professor@Joe or sai_kiran)"
              required
              className="text-input"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '0.92rem',
                borderRadius: '12px',
                background: 'rgba(2, 6, 23, 0.7)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: '#ffffff'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
              <Key size={14} className="text-cyan-400" />
              <span>Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter account password"
              required
              className="text-input"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '0.92rem',
                borderRadius: '12px',
                background: 'rgba(2, 6, 23, 0.7)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: '#ffffff'
              }}
            />
          </div>

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '0.82rem', background: 'rgba(239, 68, 68, 0.12)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            {!preventClose && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '12px', borderRadius: '12px', fontWeight: 600 }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                justifyContent: 'center',
                fontSize: '0.95rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
                boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <LogIn size={18} />
              <span>{loading ? 'Verifying...' : 'Sign In'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
