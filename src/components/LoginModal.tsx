import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Key, LogIn, AlertCircle, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (username: string, token: string, role: string) => void;
  preventClose?: boolean;
  onClose?: () => void;
}

const LOCAL_USERS: Record<string, { password: string; role: string }> = {
  "Admin@uday": { password: "Superm@n62", role: "admin" },
  "admin@uday": { password: "Superm@n62", role: "admin" },
  "sai_kiran": { password: "kiransir@bava", role: "student" },
  "gagan": { password: "gagan@kranthi", role: "student" },
  "akash": { password: "labbe@kiransir", role: "student" },
  "sai_ram": { password: "sai@ram", role: "student" },
  "tharun": { password: "mama@kiransir", role: "student" },
  "ban": { password: "DataScientist", role: "student" },
  "balraj": { password: "labbe@kiransir", role: "guest_student" },
  "AV_Student": { password: "avcollege@student", role: "guest_student" },
  "uday01": { password: "uday@01", role: "guest" },
  "uday02": { password: "uday@02", role: "guest" },
  "uday03": { password: "uday@03", role: "guest" }
};

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

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onLoginSuccess(data.username, data.token, data.role || 'student');
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      console.warn('Serverless login endpoint unavailable, applying local credential verification', err);
    }

    // Local credential verification fallback
    const matched = LOCAL_USERS[username] || LOCAL_USERS[username.trim()];
    if (matched && matched.password === password) {
      onLoginSuccess(username, `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, matched.role);
    } else {
      setErrorMsg('Invalid credentials. Please verify your username and password.');
    }
    setLoading(false);
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
        background: 'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        overflow: 'hidden'
      }}
    >
      {/* Animated Floating Glow Orbs (Magic UI / React Bits Style) */}
      <div className="kokonut-dots-overlay login-mouse-dots" />
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, rgba(59, 130, 246, 0) 70%)',
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
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0) 70%)',
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
          background: rgba(15, 23, 42, 0.82) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(6, 182, 212, 0.15) !important;
        }
      `}</style>

      {/* Glassmorphism Login Box */}
      <div
        className="modal-content login-card-glass"
        style={{
          maxWidth: '420px',
          width: '90%',
          borderRadius: '24px',
          padding: '32px 28px',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '14px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(99, 102, 241, 0.2))',
              borderRadius: '20px',
              marginBottom: '14px',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
            }}
          >
            <ShieldCheck size={36} className="text-cyan-400" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px 0', color: '#ffffff', letterSpacing: '-0.02em' }}>
            Prof. Joe AI Login
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Sparkles size={14} className="text-cyan-400" />
            <span>Enter credentials to unlock your exam prep hub</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
              <UserCheck size={14} className="text-cyan-400" />
              <span>Username / Account</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username (e.g. Admin@uday or sai_kiran)"
              required
              className="text-input"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '0.92rem',
                borderRadius: '12px',
                background: 'rgba(2, 6, 23, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
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
                background: 'rgba(2, 6, 23, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
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
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)',
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
