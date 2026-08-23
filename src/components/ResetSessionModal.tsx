import React from 'react';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';

interface ResetSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  presetName: string;
}

export const ResetSessionModal: React.FC<ResetSessionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  presetName
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2, 6, 23, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 200
        }}
      />

      {/* Warning Dialog Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '420px',
          maxWidth: '90vw',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.45)',
          zIndex: 210,
          padding: '24px',
          color: 'var(--text-primary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Confirm Session Reset
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 20px 0' }}>
          Are you sure you want to clear your active chat history and code files for <strong style={{ color: '#ef4444' }}>{presetName}</strong>? Your session history remains safely saved in <strong style={{ color: 'var(--accent-cyan)' }}>Lab History</strong>.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-theme-secondary"
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              padding: '8px 18px',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(239, 68, 68, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={14} />
            <span>Yes, Reset Session</span>
          </button>
        </div>
      </div>
    </>
  );
};
