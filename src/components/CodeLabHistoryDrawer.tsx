import React, { useState, useEffect } from 'react';
import { History, X, Plus, Trash2, Globe, Database, MessageSquare } from 'lucide-react';
import type { ChatSession } from '../types';
import { getCodeLabSessions, deleteCodeLabSession } from '../services/indexedDbService';

interface CodeLabHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  presetId: string;
  presetName: string;
  currentSessionId: string;
  onSelectSession: (session: ChatSession) => void;
  onNewSession: () => void;
  webSearch: boolean;
  onToggleWebSearch: () => void;
}

export const CodeLabHistoryDrawer: React.FC<CodeLabHistoryDrawerProps> = ({
  isOpen,
  onClose,
  username,
  presetId,
  presetName,
  currentSessionId,
  onSelectSession,
  onNewSession,
  webSearch,
  onToggleWebSearch
}) => {
  const [historySessions, setHistorySessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    const sessions = await getCodeLabSessions(username, presetId);
    setHistorySessions(sessions);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, username, presetId]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteCodeLabSession(id);
    setHistorySessions(prev => prev.filter(s => s.id !== id));
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2, 6, 23, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 140
        }}
      />

      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '320px',
          maxWidth: '85vw',
          background: 'rgba(2, 6, 23, 0.96)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 30px rgba(6, 182, 212, 0.2)',
          zIndex: 150,
          display: 'flex',
          flexDirection: 'column',
          color: '#f8fafc'
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} style={{ color: '#06b6d4' }} />
            <div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Lab History</h3>
              <p style={{ fontSize: '0.7rem', color: '#38bdf8', margin: 0 }}>{presetName}</p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            type="button"
            onClick={() => {
              onNewSession();
              onClose();
            }}
            className="extractor-btn-primary"
            style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem', justifyContent: 'center' }}
          >
            <Plus size={15} />
            <span>New {presetName} Session</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#cbd5e1' }}>
              <Globe size={14} style={{ color: webSearch ? '#34d399' : '#64748b' }} />
              <span>Web Search Grounding</span>
            </div>
            <button
              type="button"
              onClick={onToggleWebSearch}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: webSearch ? 'rgba(52, 211, 153, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                background: webSearch ? 'rgba(52, 211, 153, 0.15)' : 'rgba(30, 41, 59, 0.5)',
                color: webSearch ? '#34d399' : '#94a3b8',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {webSearch ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.78rem', fontFamily: 'monospace' }}>
              Loading sessions...
            </div>
          ) : historySessions.length === 0 ? (
            <div style={{ padding: '30px 16px', textAlign: 'center', color: '#64748b' }}>
              <MessageSquare size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
              <p style={{ fontSize: '0.78rem' }}>No saved sessions for {presetName} yet.</p>
            </div>
          ) : (
            historySessions.map((session) => {
              const isActive = session.id === currentSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session);
                    onClose();
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid',
                    borderColor: isActive ? 'rgba(6, 182, 212, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                    borderLeft: isActive ? '3px solid #06b6d4' : undefined,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isActive ? '#38bdf8' : '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {session.title || 'Code Lab Session'}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                      {session.messages?.length || 0} messages • {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, session.id)}
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

        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#34d399' }}>
          <Database size={13} />
          <span>🟢 IndexedDB Storage Active</span>
        </div>
      </div>
    </>
  );
};
