import React, { useState } from 'react';
import { 
  Clock, 
  X, 
  Plus, 
  Globe, 
  Cpu, 
  RotateCcw, 
  Search, 
  MessageSquare, 
  Trash2, 
  Cloud,
  Pin,
  Printer,
  Sparkles
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
  onOpenCheatSheet?: () => void;
  pinnedCount?: number;
  onPrintSession?: () => void;
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
  onToggleWebSearch,
  onOpenCheatSheet,
  pinnedCount = 0,
  onPrintSession
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
          width: '350px',
          maxWidth: '88vw',
          borderRight: '1px solid var(--border-color)',
          backdropFilter: 'blur(16px)',
          boxShadow: '10px 0 40px var(--card-shadow)',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px'
        }}
      >
        {/* Header Bar */}
        <div className="demo-drawer-header">
          <div className="demo-drawer-title">
            <Clock size={16} style={{ color: 'var(--accent-cyan)' }} />
            <div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Code Dungeon Deck 🏰
              </h3>
              <div style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                {presetName}
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            className="demo-icon-btn"
            aria-label="Close Code Lab Control Deck"
          >
            <X size={16} />
          </button>
        </div>

        {/* 🍱 COMMAND CONTROLS CARD (4-COLUMN COMPACT GRID) */}
        <div className="demo-bento-deck">
          <div className="bento-deck-header">
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} style={{ color: 'var(--accent-cyan)' }} />
              <span>COMMAND CONTROLS</span>
            </div>
            <button
              type="button"
              onClick={onResetSession}
              className="bento-clear-context-btn"
              title="Clear context for this lab session"
            >
              <RotateCcw size={11} />
              <span>Clear Context</span>
            </button>
          </div>

          <div className="bento-grid-container-4col">
            {/* Tile 1: Exam Cheat Sheet & Lab Notebook */}
            {onOpenCheatSheet && (
              <div
                onClick={() => {
                  onOpenCheatSheet();
                  onClose();
                }}
                className="bento-card-tile-compact active-glow-amber"
                title="View Pinned Formulas, Snippets & Print 1-Page Cheat Sheet"
              >
                <div className="bento-tile-icon-sm amber">
                  <Pin size={13} />
                </div>
                <span className="bento-tile-label">Cheat Sheet</span>
                {pinnedCount > 0 && (
                  <span className="bento-mini-badge on">
                    {pinnedCount}
                  </span>
                )}
              </div>
            )}

            {/* Tile 2: Web Search Toggle */}
            <div
              onClick={onToggleWebSearch}
              className={`bento-card-tile-compact ${webSearch ? 'active-glow-cyan' : ''}`}
              title="Toggle Live Web Search for Dataset documentation and papers"
            >
              <div className="bento-tile-icon-sm cyan">
                <Globe size={13} />
              </div>
              <span className="bento-tile-label">Web Search</span>
              <span className={`bento-mini-badge ${webSearch ? 'on' : 'off'}`}>
                {webSearch ? 'ON' : 'OFF'}
              </span>
            </div>

            {/* Tile 3: Selected Model Monitor */}
            <div
              className="bento-card-tile-compact"
              title={`Active Code Model: ${selectedModel}`}
            >
              <div className="bento-tile-icon-sm purple">
                <Cpu size={13} />
              </div>
              <span className="bento-tile-label">Model</span>
              <span className="bento-mini-badge off truncate max-w-full">
                {selectedModel.slice(0, 8)}
              </span>
            </div>

            {/* Tile 4: Native Print / PDF Lab Session */}
            <div
              onClick={() => {
                if (onPrintSession) onPrintSession();
                else window.print();
                onClose();
              }}
              className="bento-card-tile-compact"
              title="Print or Export Full Code Lab Session to PDF"
            >
              <div className="bento-tile-icon-sm emerald">
                <Printer size={13} />
              </div>
              <span className="bento-tile-label">Print Lab</span>
            </div>
          </div>
        </div>

        {/* Unified Search & New Session Action Row */}
        <div className="demo-drawer-search-action-row">
          <div className="demo-drawer-search-bar">
            <Search size={14} style={{ color: 'var(--accent-cyan)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${presetName} chats...`}
              className="demo-search-input codelab-search-input"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')} 
                className="clear-search-btn"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNewSession()}
            className="drawer-new-chat-btn"
            title={`Start New ${presetName} Session`}
          >
            <Plus size={15} />
            <span>New Lab</span>
          </button>
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
                    borderLeft: isActive ? '3px solid var(--accent-cyan)' : undefined,
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
