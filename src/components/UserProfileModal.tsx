import React, { useState } from 'react';
import { X, Key, Sun, Moon, Trash2, LogOut, Shield, User, ChevronRight, Printer } from 'lucide-react';
import { getPrintCustomConfig, savePrintCustomConfig, type PrintCustomConfig } from '../services/printPdfService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  userRole?: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenSettingsStudio?: () => void;
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
  onOpenSettingsStudio,
  onClearHistory,
  onLogout
}) => {
  const [printConfig, setPrintConfig] = useState<PrintCustomConfig>(getPrintCustomConfig());
  const [isPrintCustomOpen, setIsPrintCustomOpen] = useState(false);

  if (!isOpen) return null;

  const handlePresetChange = (preset: PrintCustomConfig['preset']) => {
    let updated: Partial<PrintCustomConfig> = { preset };
    if (preset === 'academic') {
      updated = { preset: 'academic', showHeader: true, showModelTag: true, showDateTag: true, showFooter: true };
    } else if (preset === 'clean') {
      updated = { preset: 'clean', showHeader: false, showModelTag: false, showDateTag: false, showFooter: false };
    } else if (preset === 'branded') {
      updated = { preset: 'branded', showHeader: true, showModelTag: true, showDateTag: true, showFooter: true };
    }
    const nextConfig = savePrintCustomConfig(updated);
    setPrintConfig(nextConfig);
  };

  const handleCustomFieldChange = <K extends keyof PrintCustomConfig>(key: K, value: PrintCustomConfig[K]) => {
    const nextConfig = savePrintCustomConfig({ [key]: value, preset: 'custom' });
    setPrintConfig(nextConfig);
  };

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
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '16px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="profile-icon-squircle cyan-squircle">
                  <Key size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span className="action-title" style={{ fontWeight: 600, fontSize: '0.88rem' }}>API Key Credentials</span>
                  <span className="text-muted-custom" style={{ fontSize: '0.72rem' }}>Configure cloud provider keys</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="action-pill-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }}></span>
                  Configured
                </span>
                <ChevronRight size={16} className="text-slate-400" style={{ flexShrink: 0 }} />
              </div>
            </div>

            <div
              onClick={onToggleTheme}
              className="profile-action-item"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '16px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className={`profile-icon-squircle ${theme === 'dark' ? 'purple-squircle' : 'cyan-squircle'}`}>
                  {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span className="action-title" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Color Theme Mode</span>
                  <span className="text-muted-custom" style={{ fontSize: '0.72rem' }}>Currently in {theme.toUpperCase()} mode</span>
                </div>
              </div>
              <button type="button" className="glass-theme-switch" aria-label="Toggle Theme Mode">
                {theme === 'dark' ? (
                  <>
                    <Moon size={12} />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <Sun size={12} />
                    <span>Light</span>
                  </>
                )}
              </button>
            </div>

            {/* 🖨️ PRINT & PDF CUSTOMIZER DECK */}
            <div
              style={{
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                overflow: 'hidden'
              }}
            >
              <div
                onClick={() => setIsPrintCustomOpen(prev => !prev)}
                className="profile-action-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  borderBottom: isPrintCustomOpen ? '1px solid var(--border-color)' : 'none'
                }}
                title="Click to customize Print & PDF Export options"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="profile-icon-squircle cyan-squircle">
                    <Printer size={18} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="action-title" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Print & PDF Customizer</span>
                    <span className="text-muted-custom" style={{ fontSize: '0.72rem' }}>
                      {printConfig.preset === 'academic' 
                        ? 'Academic Preset (Title + Model + Date)' 
                        : printConfig.preset === 'clean' 
                          ? 'Raw / Unbranded (No AI Header)' 
                          : printConfig.preset === 'branded'
                            ? 'Official Brand Preset'
                            : 'Custom Configuration ⚙️'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    className="action-pill-badge"
                    style={{
                      textTransform: 'capitalize',
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: 'var(--accent-cyan)'
                    }}
                  >
                    {printConfig.preset}
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-slate-400"
                    style={{
                      transform: isPrintCustomOpen ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </div>
              </div>

              {/* Collapsible Custom Settings Panel */}
              {isPrintCustomOpen && (
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-tertiary)' }}>
                  {/* Preset Pills Selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>PRESET TEMPLATE</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                      {(['academic', 'clean', 'custom'] as const).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handlePresetChange(p)}
                          style={{
                            padding: '6px 4px',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            fontWeight: printConfig.preset === p ? 700 : 500,
                            border: printConfig.preset === p ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                            background: printConfig.preset === p ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-secondary)',
                            color: printConfig.preset === p ? 'var(--accent-cyan)' : 'var(--text-primary)',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                          }}
                        >
                          {p === 'academic' ? 'Academic' : p === 'clean' ? 'Unbranded' : 'Custom ⚙️'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Title Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      CUSTOM SUBJECT / RECORD TITLE (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      value={printConfig.customTitle}
                      onChange={(e) => handleCustomFieldChange('customTitle', e.target.value)}
                      placeholder="e.g. MDS-104-T Statistical Inference"
                      style={{
                        padding: '7px 10px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Page Margins Selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>PAGE MARGINS</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                      {(['standard', 'compact', 'none'] as const).map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleCustomFieldChange('marginPreset', m)}
                          style={{
                            padding: '6px 4px',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            fontWeight: (printConfig.marginPreset || 'standard') === m ? 700 : 500,
                            border: (printConfig.marginPreset || 'standard') === m ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                            background: (printConfig.marginPreset || 'standard') === m ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-secondary)',
                            color: (printConfig.marginPreset || 'standard') === m ? 'var(--accent-cyan)' : 'var(--text-primary)',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                          }}
                        >
                          {m === 'standard' ? 'Standard (14mm)' : m === 'compact' ? 'Compact (6mm)' : 'None (Edge)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Granular Toggles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>PRINTED DOCUMENT ELEMENTS</label>

                    {/* Toggle: Hide Markdown Divider Lines */}
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', cursor: 'pointer' }}>
                      <span>Hide Section Divider Lines (---)</span>
                      <input
                        type="checkbox"
                        checked={printConfig.hideDividers || false}
                        onChange={(e) => handleCustomFieldChange('hideDividers', e.target.checked)}
                        style={{ accentColor: 'var(--accent-cyan)', width: '15px', height: '15px', cursor: 'pointer' }}
                      />
                    </label>

                    {/* Toggle: Top Header Bar */}
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', cursor: 'pointer' }}>
                      <span>Include Top Header Bar</span>
                      <input
                        type="checkbox"
                        checked={printConfig.showHeader}
                        onChange={(e) => handleCustomFieldChange('showHeader', e.target.checked)}
                        style={{ accentColor: 'var(--accent-cyan)', width: '15px', height: '15px', cursor: 'pointer' }}
                      />
                    </label>

                    {/* Toggle: AI Model Tag */}
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', cursor: 'pointer' }}>
                      <span>Show AI Model & Provider Tag</span>
                      <input
                        type="checkbox"
                        checked={printConfig.showModelTag}
                        onChange={(e) => handleCustomFieldChange('showModelTag', e.target.checked)}
                        style={{ accentColor: 'var(--accent-cyan)', width: '15px', height: '15px', cursor: 'pointer' }}
                      />
                    </label>

                    {/* Toggle: Date & Timestamp */}
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', cursor: 'pointer' }}>
                      <span>Show Date & Timestamp</span>
                      <input
                        type="checkbox"
                        checked={printConfig.showDateTag}
                        onChange={(e) => handleCustomFieldChange('showDateTag', e.target.checked)}
                        style={{ accentColor: 'var(--accent-cyan)', width: '15px', height: '15px', cursor: 'pointer' }}
                      />
                    </label>

                    {/* Launch Full Studio Link */}
                    {onOpenSettingsStudio && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenSettingsStudio();
                        }}
                        style={{
                          marginTop: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '8px',
                          borderRadius: '8px',
                          background: 'rgba(6, 182, 212, 0.15)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          color: 'var(--accent-cyan)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Printer size={14} />
                        <span>Open Full Settings & Print Studio ⚙️</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div
              onClick={() => {
                if (window.confirm('Are you sure you want to clear chat history?')) {
                  onClearHistory();
                  onClose();
                }
              }}
              className="profile-action-item danger-item"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '16px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="profile-icon-squircle rose-squircle">
                  <Trash2 size={18} />
                </div>
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
