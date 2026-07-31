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
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2, 6, 23, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 140
        }}
      />

      {/* Control Deck Sidebar Container */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '330px',
          maxWidth: '85vw',
          background: 'rgba(2, 6, 23, 0.96)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 35px rgba(6, 182, 212, 0.25)',
          zIndex: 150,
          display: 'flex',
          flexDirection: 'column',
          color: '#f8fafc',
          padding: '16px'
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: '#06b6d4' }} />
            <div>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                Code Lab Deck
              </h3>
              <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>
                {presetName}
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#cbd5e1',
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
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '12px', marginBottom: '14px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em', marginBottom: '10px', textTransform: 'uppercase' }}>
            ⚡ Command Controls
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            {/* Web Search Toggle Pill */}
            <button
              type="button"
              onClick={onToggleWebSearch}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: webSearch ? 'rgba(52, 211, 153, 0.5)' : 'rgba(255, 255, 255, 0.08)',
                background: webSearch ? 'rgba(52, 211, 153, 0.15)' : 'rgba(30, 41, 59, 0.6)',
                color: webSearch ? '#34d399' : '#94a3b8',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Globe size={14} style={{ color: webSearch ? '#34d399' : '#64748b' }} />
              <span>Search: {webSearch ? 'ON' : 'OFF'}</span>
            </button>

            {/* Active Model Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: '10px',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                background: 'rgba(168, 85, 247, 0.12)',
                color: '#c084fc',
                fontSize: '0.72rem',
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={`Active Model: ${selectedModel}`}
            >
              <Cpu size={14} style={{ color: '#c084fc', flexShrink: 0 }} />
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
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Reset</span>
          </button>
        </div>

        {/* Search Input Filter */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search past ${presetName} chats...`}
            style={{
              width: '100%',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '8px 10px 8px 32px',
              color: '#f8fafc',
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
                  style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: isActive ? 'rgba(6, 182, 212, 0.16)' : 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid',
                    borderColor: isActive ? 'rgba(6, 182, 212, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                    borderLeft: isActive ? '3px solid #06b6d4' : undefined,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <div style={{ overflow: 'hidden', flex: 1, marginRight: '8px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isActive ? '#38bdf8' : '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {session.title || 'Code Lab Chat'}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '1px 6px', borderRadius: '6px', color: '#cbd5e1' }}>
                        {msgCount} {msgCount === 1 ? 'msg' : 'msgs'}
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
