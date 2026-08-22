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
import { MathText, renderMathHtml } from './MathText';
import { getPinWorkspace } from './CheatSheetDrawer';

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

  // 🖨️ LEVEL 1: Message-Wise Print (Single Pinned Note Revision Card)
  const handlePrintSinglePin = (pin: PinnedItem) => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const ws = getPinWorkspace(pin);
    const wsLabel = ws === 'code_lab' ? 'Code Dungeon 🏰' : ws === 'persona' ? 'Fun Persona 🎭' : 'AI Chat 💬';

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prof. Joe AI — Pinned Note (${pin.sessionTitle || 'Revision Card'})</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <style>
          body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 32px 40px;
            font-size: 11pt;
            line-height: 1.65;
          }
          .single-pin-container {
            max-width: 820px;
            margin: 0 auto;
            border: 2px solid #0284c7;
            border-radius: 12px;
            padding: 22px 26px;
            background: #ffffff;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
          }
          .header-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .brand-title {
            font-size: 14pt;
            font-weight: 800;
            color: #0369a1;
            margin: 0 0 3px 0;
          }
          .session-subtitle {
            font-size: 9.5pt;
            font-weight: 600;
            color: #64748b;
            margin: 0;
          }
          .badge {
            font-size: 8.5pt;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 6px;
            background: #e0f2fe;
            color: #0369a1;
          }
          .note-body {
            font-size: 10.2pt;
            color: #1e293b;
            line-height: 1.7;
          }
          .note-body p { margin: 6px 0; }
          .note-body pre {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 10px 14px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 9.5pt;
            overflow-x: auto;
          }
          .note-body code {
            background: #f1f5f9;
            padding: 2px 5px;
            border-radius: 4px;
            font-size: 9.2pt;
            color: #0f172a;
          }
          .note-body strong { color: #0369a1; font-weight: 700; }
          .katex-display { margin: 10px 0 !important; font-size: 1.1em; overflow-x: auto; }
          .footer-bar {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 8pt;
            color: #94a3b8;
          }
          @media print {
            body { padding: 12mm 15mm; }
            .single-pin-container {
              box-shadow: none;
              border: 1.5px solid #0284c7;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="single-pin-container">
          <div class="header-bar">
            <div>
              <h1 class="brand-title">🎓 Prof. Joe AI — Pinned Revision Note</h1>
              <p class="session-subtitle">Topic: ${pin.sessionTitle || 'Academic Study Session'}</p>
            </div>
            <span class="badge">${wsLabel}</span>
          </div>
          <div class="note-body">
            ${renderMathHtml(pin.content)}
          </div>
          <div class="footer-bar">
            <span>Note ID: #${pin.id.slice(-8)}</span>
            <span>Pinned on ${new Date(pin.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  // 🖨️ LEVEL 2: Session-Wise Print (Selected Session Pinned Deck)
  const handlePrintSessionDeck = (pinsToPrint: PinnedItem[], sessionTitle: string) => {
    if (pinsToPrint.length === 0) return;

    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const cardsHtml = pinsToPrint.map((p, idx) => `
      <div class="cheat-card">
        <div class="card-header">
          <span class="card-num">#${idx + 1}</span>
          <span class="card-title">${p.sessionTitle || 'High-Yield Note'}</span>
          <span class="card-ws">${getPinWorkspace(p) === 'code_lab' ? 'Code Lab 🏰' : getPinWorkspace(p) === 'persona' ? 'Persona 🎭' : 'Exam Theory 💬'}</span>
        </div>
        <div class="card-body">
          ${renderMathHtml(p.content)}
        </div>
      </div>
    `).join('');

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prof. Joe AI — ${sessionTitle} (Revision Deck)</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <style>
          body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 24px 36px;
            font-size: 10.5pt;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 2.5px solid #0284c7;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0 0 4px 0;
            font-size: 18pt;
            color: #0369a1;
            font-weight: 800;
          }
          .header p {
            margin: 0;
            font-size: 9pt;
            color: #64748b;
            font-weight: 600;
          }
          .cheat-sheet-deck {
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: 100%;
          }
          .cheat-card {
            border: 1.5px solid #cbd5e1;
            border-radius: 10px;
            padding: 14px 18px;
            background: #ffffff;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 12px;
            width: 100%;
            box-sizing: border-box;
          }
          .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-weight: 700;
            font-size: 10.5pt;
            color: #0369a1;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 10px;
          }
          .card-num {
            background: #0284c7;
            color: #ffffff;
            font-size: 8pt;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 5px;
            margin-right: 8px;
          }
          .card-title {
            font-size: 10pt;
            font-weight: 700;
            color: #0f172a;
            flex: 1;
          }
          .card-ws {
            font-size: 8pt;
            font-weight: 600;
            color: #64748b;
            background: #f1f5f9;
            padding: 2px 8px;
            border-radius: 6px;
          }
          .card-body {
            font-size: 9.8pt;
            color: #1e293b;
            line-height: 1.6;
          }
          .card-body p { margin: 4px 0; }
          .card-body pre { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px; font-family: monospace; font-size: 9pt; overflow-x: auto; }
          .card-body code { background: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-size: 9pt; }
          .card-body strong { color: #0369a1; font-weight: 700; }
          .katex-display { margin: 8px 0 !important; font-size: 1.05em; overflow-x: auto; }
          @media print {
            body { padding: 10mm 12mm; }
            .cheat-card {
              border: 1px solid #94a3b8;
              box-shadow: none;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎓 Prof. Joe AI — ${sessionTitle}</h1>
          <p>Session Revision Deck • ${pinsToPrint.length} Pinned Notes, Formulas & Code Algorithms</p>
        </div>
        <div class="cheat-sheet-deck">
          ${cardsHtml}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
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
            className="extractor-btn-secondary"
            style={{ borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700 }}
          >
            <ArrowLeft size={16} />
            <span>Hub</span>
          </button>

          {onNavigateToChat && (
            <button
              type="button"
              onClick={onNavigateToChat}
              className="extractor-btn-secondary"
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
              className="extractor-btn-secondary"
              style={{ borderRadius: '10px', padding: '8px 12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171' }}
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
