import React, { useState } from 'react';
import { 
  Clock, 
  X, 
  Plus, 
  Globe, 
  Cpu, 
  RefreshCw, 
  Search, 
  MessageSquare, 
  Trash2, 
  Cloud 
} from 'lucide-react';
import type { ChatSession } from '../types';

interface CodeLabControlDeckProps {
  isOpen: boolean;
  onClose: () => void;
  presetName: string;
  presetId: string;
  selectedModel: string;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onResetSession: () => void;
  webSearch: boolean;
  onToggleWebSearch: () => void;
}

export const CodeLabControlDeck: React.FC<CodeLabControlDeckProps> = ({
  isOpen,
  onClose,
  presetName,
  selectedModel,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onResetSession,
  webSearch,
  onToggleWebSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredSessions = sessions.filter(s => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = s.title?.toLowerCase().includes(query);
    const msgMatch = s.messages?.some(m => m.content?.toLowerCase().includes(query));
    return titleMatch || msgMatch;
  });

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="codelab-deck-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          backdropFilter: 'blur(4px)',
          zIndex: 999998
        }}
      />

      {/* Control Deck Sidebar Container */}
      <div 
        className="codelab-control-deck-drawer"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '330px',
          maxWidth: '85vw',
          borderRight: '1px solid var(--border-color)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 35px rgba(6, 182, 212, 0.25)',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px'
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: 'var(--accent-cyan)' }} />
            <div>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Code Dungeon Deck 🏰
              </h3>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                {presetName}
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            className="extractor-btn-secondary"
            style={{
              borderRadius: '8px',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* New Session Action Button */}
        <button
          type="button"
          onClick={() => {
            onNewSession();
          }}
          className="extractor-btn-primary"
          style={{ width: '100%', padding: '10px 14px', fontSize: '0.82rem', justifyContent: 'center', marginBottom: '14px', borderRadius: '12px' }}
        >
          <Plus size={16} />
          <span>New {presetName} Session</span>
        </button>

        {/* Command Controls Card */}
        <div className="codelab-command-controls-card" style={{ borderRadius: '14px', padding: '12px', marginBottom: '14px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '10px', textTransform: 'uppercase' }}>
            ⚡ Command Controls
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            {/* Web Search Toggle Pill */}
            <button
              type="button"
              onClick={onToggleWebSearch}
              className="codelab-control-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: webSearch ? 'rgba(52, 211, 153, 0.5)' : 'var(--border-color)',
                background: webSearch ? 'rgba(52, 211, 153, 0.15)' : 'var(--bg-tertiary)',
                color: webSearch ? '#34d399' : 'var(--text-secondary)',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Globe size={14} />
              <span>Search: {webSearch ? 'ON' : 'OFF'}</span>
            </button>

            {/* Selected Model Pill */}
            <div
              className="codelab-control-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '0.74rem',
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={`Active Model: ${selectedModel}`}
            >
              <Cpu size={14} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedModel}</span>
            </div>
          </div>

          {/* Reset Context Button */}
          <button
            type="button"
            onClick={onResetSession}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#f87171',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={13} />
              <span>Clear Session Context</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Reset</span>
          </button>
        </div>

        {/* Search Input Filter */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search past ${presetName} chats...`}
            className="codelab-search-input"
            style={{
              width: '100%',
              borderRadius: '10px',
              padding: '8px 10px 8px 32px',
              fontSize: '0.76rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Segregated Sessions List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '2px' }}>
          {filteredSessions.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: '#64748b' }}>
              <MessageSquare size={28} style={{ marginBottom: '6px', opacity: 0.4 }} />
              <p style={{ fontSize: '0.76rem', margin: 0 }}>No sessions found for {presetName}.</p>
            </div>
          ) : (
            filteredSessions.map(session => {
              const isActive = session.id === activeSessionId;
              const msgCount = session.messages?.length || 0;
              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`codelab-session-item demo-session-item ${isActive ? 'active' : ''}`}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    borderLeft: isActive ? '3px solid #06b6d4' : undefined,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <div style={{ overflow: 'hidden', flex: 1, marginRight: '8px' }}>
                    <div className="demo-session-title" style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {session.title || 'Code Lab Chat'}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="demo-msg-badge">
                        {msgCount} msgs
                      </span>
                      <span>•</span>
                      <span>{new Date(session.updatedAt || session.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                    title="Delete session"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Storage Indicator */}
        <div style={{ paddingTop: '12px', marginTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>
          <Cloud size={13} />
          <span>🟢 IndexedDB & MongoDB Cloud Sync Active</span>
        </div>
      </div>
    </>
  );
};
