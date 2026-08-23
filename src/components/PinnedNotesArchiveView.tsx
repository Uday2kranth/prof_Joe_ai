import React, { useState, useMemo } from 'react';
import { 
  Pin, 
  Search, 
  Trash2, 
  Printer, 
  ArrowLeft, 
  Sparkles, 
  Copy, 
  Check, 
  Terminal, 
  MessageSquare, 
  FolderOpen, 
  Layers,
  X
} from 'lucide-react';
import type { PinnedItem } from '../types';
import { MathText } from './MathText';
import { getPinWorkspace } from './CheatSheetDrawer';
import { printSinglePinToPdf, printSessionPinsToPdf } from '../services/printPdfService';

interface PinnedNotesArchiveViewProps {
  currentUser: string;
  pinnedItems: PinnedItem[];
  onDeletePin: (id: string) => void;
  onClearAllPins: () => void;
  onBackToHub: () => void;
  onNavigateToChat?: () => void;
}

export const PinnedNotesArchiveView: React.FC<PinnedNotesArchiveViewProps> = ({
  currentUser,
  pinnedItems,
  onDeletePin,
  onClearAllPins,
  onBackToHub,
  onNavigateToChat
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState<'all' | 'chat' | 'code_lab' | 'persona'>('all');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Group pins by workspace and session
  const workspaceCounts = useMemo(() => {
    return {
      all: pinnedItems.length,
      chat: pinnedItems.filter(p => getPinWorkspace(p) === 'chat').length,
      code_lab: pinnedItems.filter(p => getPinWorkspace(p) === 'code_lab').length,
      persona: pinnedItems.filter(p => getPinWorkspace(p) === 'persona').length,
    };
  }, [pinnedItems]);

  // Derive unique sessions within selected workspace
  const sessionGroups = useMemo(() => {
    let filtered = pinnedItems;
    if (selectedWorkspace !== 'all') {
      filtered = filtered.filter(p => getPinWorkspace(p) === selectedWorkspace);
    }

    const map = new Map<string, { sessionId: string; sessionTitle: string; workspace: string; count: number; latestAt: number }>();
    filtered.forEach(p => {
      const sId = p.sessionId || 'general-notes';
      const existing = map.get(sId);
      if (!existing) {
        map.set(sId, {
          sessionId: sId,
          sessionTitle: p.sessionTitle || 'High-Yield Note Topic',
          workspace: getPinWorkspace(p),
          count: 1,
          latestAt: p.createdAt || Date.now()
        });
      } else {
        existing.count += 1;
        if ((p.createdAt || 0) > existing.latestAt) {
          existing.latestAt = p.createdAt || 0;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.latestAt - a.latestAt);
  }, [pinnedItems, selectedWorkspace]);

  // Derive displayed pins based on workspace, session, and search
  const displayedPins = useMemo(() => {
    let list = pinnedItems;

    if (selectedWorkspace !== 'all') {
      list = list.filter(p => getPinWorkspace(p) === selectedWorkspace);
    }

    if (selectedSessionId !== 'all') {
      list = list.filter(p => (p.sessionId || 'general-notes') === selectedSessionId);
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(p =>
      p.content.toLowerCase().includes(q) ||
      (p.sessionTitle && p.sessionTitle.toLowerCase().includes(q))
    );
  }, [pinnedItems, selectedWorkspace, selectedSessionId, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // 🖨️ LEVEL 1: Message-Wise Print (Unified Academic Document Layout)
  const handlePrintSinglePin = (pin: PinnedItem) => {
    printSinglePinToPdf(pin);
  };

  // 🖨️ LEVEL 2: Session-Wise Print (Unified Academic Revision Deck)
  const handlePrintSessionDeck = (pinsToPrint: PinnedItem[], sessionTitle: string) => {
    if (pinsToPrint.length === 0) return;
    printSessionPinsToPdf(pinsToPrint, sessionTitle);
  };

  const selectedSessionInfo = useMemo(() => {
    if (selectedSessionId === 'all') return null;
    return sessionGroups.find(s => s.sessionId === selectedSessionId);
  }, [selectedSessionId, sessionGroups]);

  return (
    <div className="pinned-notes-archive-layout" style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Bar */}
      <header style={{
        padding: '14px 24px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={onBackToHub}
            className="btn-theme-secondary"
            style={{ borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700 }}
          >
            <ArrowLeft size={16} />
            <span>Hub</span>
          </button>

          {onNavigateToChat && (
            <button
              type="button"
              onClick={onNavigateToChat}
              className="btn-theme-secondary"
              style={{ borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700 }}
            >
              <MessageSquare size={15} />
              <span>Chat</span>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '6px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(249, 115, 22, 0.25))',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24'
            }}>
              <Pin size={20} className="fill-amber-400" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                Pinned Notes & Exam Archive 🏛️
              </h1>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                Centralized Revision Repository • {pinnedItems.length} Saved Points • Scholar: {currentUser || 'Guest'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="demo-drawer-search-bar" style={{ width: '220px', padding: '6px 12px' }}>
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search archives..."
              className="demo-drawer-search-input"
              style={{ fontSize: '0.82rem' }}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="search-clear-btn">
                <X size={12} />
              </button>
            )}
          </div>

          {pinnedItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all pinned notes across all sessions?')) {
                  onClearAllPins();
                }
              }}
              className="btn-theme-danger"
              style={{ borderRadius: '10px', padding: '8px 12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Clear all pinned notes"
            >
              <Trash2 size={14} />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Studio Body: 3-Column Bento Layout */}
      <div className="archive-studio-content" style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 320px 1fr', minHeight: 'calc(100vh - 70px)' }}>
        
        {/* COLUMN 1: WORKSPACE SELECTOR */}
        <aside style={{ borderRight: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            📁 Workspaces
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* All Workspaces */}
            <button
              type="button"
              onClick={() => {
                setSelectedWorkspace('all');
                setSelectedSessionId('all');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: selectedWorkspace === 'all' ? 'rgba(168, 85, 247, 0.5)' : 'transparent',
                background: selectedWorkspace === 'all' ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-tertiary)',
                color: selectedWorkspace === 'all' ? '#c084fc' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} />
                <span>All Notes</span>
              </div>
              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>{workspaceCounts.all}</span>
            </button>

            {/* AI Chat Theory */}
            <button
              type="button"
              onClick={() => {
                setSelectedWorkspace('chat');
                setSelectedSessionId('all');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: selectedWorkspace === 'chat' ? 'rgba(16, 185, 129, 0.5)' : 'transparent',
                background: selectedWorkspace === 'chat' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)',
                color: selectedWorkspace === 'chat' ? '#34d399' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} />
                <span>AI Chat Theory</span>
              </div>
              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>{workspaceCounts.chat}</span>
            </button>

            {/* Practical Code Dungeon */}
            <button
              type="button"
              onClick={() => {
                setSelectedWorkspace('code_lab');
                setSelectedSessionId('all');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: selectedWorkspace === 'code_lab' ? 'rgba(6, 182, 212, 0.5)' : 'transparent',
                background: selectedWorkspace === 'code_lab' ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                color: selectedWorkspace === 'code_lab' ? 'var(--accent-cyan)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={16} />
                <span>Code Dungeon</span>
              </div>
              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>{workspaceCounts.code_lab}</span>
            </button>

            {/* Fun Personas */}
            <button
              type="button"
              onClick={() => {
                setSelectedWorkspace('persona');
                setSelectedSessionId('all');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: selectedWorkspace === 'persona' ? 'rgba(236, 72, 153, 0.5)' : 'transparent',
                background: selectedWorkspace === 'persona' ? 'rgba(236, 72, 153, 0.15)' : 'var(--bg-tertiary)',
                color: selectedWorkspace === 'persona' ? '#f472b6' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} />
                <span>Fun Personas</span>
              </div>
              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>{workspaceCounts.persona}</span>
            </button>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              💡 All pins are synchronized in real-time across your PC, Android app, and cloud storage.
            </div>
          </div>
        </aside>

        {/* COLUMN 2: SESSIONS LIST */}
        <section style={{ borderRight: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📂 Sessions & Topics ({sessionGroups.length})
            </div>
          </div>

          {/* "All Sessions" Pill */}
          <button
            type="button"
            onClick={() => setSelectedSessionId('all')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid',
              borderColor: selectedSessionId === 'all' ? 'rgba(245, 158, 11, 0.5)' : 'var(--border-color)',
              background: selectedSessionId === 'all' ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-secondary)',
              color: selectedSessionId === 'all' ? '#fbbf24' : 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderOpen size={15} />
              <span>All Sessions Combined</span>
            </div>
            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
              {selectedWorkspace === 'all' ? workspaceCounts.all : workspaceCounts[selectedWorkspace]}
            </span>
          </button>

          {/* List of Sessions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {sessionGroups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No active session archives in this workspace.
              </div>
            ) : (
              sessionGroups.map(grp => (
                <button
                  key={grp.sessionId}
                  type="button"
                  onClick={() => setSelectedSessionId(grp.sessionId)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: selectedSessionId === grp.sessionId ? 'rgba(6, 182, 212, 0.5)' : 'var(--border-color)',
                    background: selectedSessionId === grp.sessionId ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-secondary)',
                    color: selectedSessionId === grp.sessionId ? 'var(--accent-cyan)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {grp.sessionTitle}
                    </span>
                    <span style={{
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      flexShrink: 0
                    }}>
                      {grp.count} {grp.count === 1 ? 'pin' : 'pins'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{grp.workspace === 'code_lab' ? 'Code Dungeon 🏰' : grp.workspace === 'persona' ? 'Persona 🎭' : 'AI Chat 💬'}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        {/* COLUMN 3: PINNED CARDS DECK & VIEWER */}
        <main style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Deck Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {selectedSessionInfo ? selectedSessionInfo.sessionTitle : 'Combined Revision Notes'}
              </h2>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                Showing {displayedPins.length} pinned formulas, definitions, and code algorithms
              </p>
            </div>

            {displayedPins.length > 0 && (
              <button
                type="button"
                onClick={() => handlePrintSessionDeck(displayedPins, selectedSessionInfo ? selectedSessionInfo.sessionTitle : 'Selected Session Notes')}
                className="extractor-btn-primary"
                style={{ borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Print this session deck"
              >
                <Printer size={14} />
                <span>Print Session Deck ({displayedPins.length})</span>
              </button>
            )}
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {displayedPins.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <Sparkles size={36} className="mx-auto mb-3 text-amber-400" style={{ opacity: 0.8 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>No Notes Found</h3>
                <p style={{ fontSize: '0.8rem', maxWidth: '320px', margin: '0 auto' }}>
                  Bookmark any formula, definition, or code snippet using the 📌 Pin button in any conversation!
                </p>
              </div>
            ) : (
              displayedPins.map((item, idx) => {
                const ws = getPinWorkspace(item);
                return (
                  <div
                    key={item.id}
                    className="pinned-cheat-card"
                    style={{
                      borderRadius: '14px',
                      padding: '16px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    {/* Card Top Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span style={{
                          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '6px'
                        }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.sessionTitle || 'High-Yield Point'}
                        </span>
                        <span style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: ws === 'code_lab' ? 'rgba(6, 182, 212, 0.15)' : ws === 'persona' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: ws === 'code_lab' ? '#22d3ee' : ws === 'persona' ? '#f472b6' : '#34d399'
                        }}>
                          {ws === 'code_lab' ? 'Code Dungeon 🏰' : ws === 'persona' ? 'Persona 🎭' : 'AI Chat 💬'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handlePrintSinglePin(item)}
                          className="pinned-card-btn"
                          title="Print This Note"
                          style={{ color: '#0284c7' }}
                        >
                          <Printer size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.id, item.content)}
                          className="pinned-card-btn"
                          title="Copy Full Content"
                        >
                          {copiedId === item.id ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeletePin(item.id)}
                          className="pinned-card-btn delete"
                          title="Remove from Saved Pins"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Card Content with MathText */}
                    <div className="pinned-content" style={{ fontSize: '0.92rem', lineHeight: '1.65' }}>
                      <MathText content={item.content} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
