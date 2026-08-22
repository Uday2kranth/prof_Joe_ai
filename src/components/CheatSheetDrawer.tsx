import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Pin, Search, Trash2, Printer, X, Sparkles, Copy, Check, ExternalLink, Layers, Terminal, MessageSquare } from 'lucide-react';
import type { PinnedItem } from '../types';
import { MathText, renderMathHtml } from './MathText';

interface CheatSheetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pinnedItems: PinnedItem[];
  currentSessionId?: string;
  currentWorkspace?: 'chat' | 'code_lab' | 'persona';
  onDeletePin: (id: string) => void;
  onClearAllPins: () => void;
  onOpenArchive?: () => void;
}

export const getPinWorkspace = (pin: PinnedItem): 'chat' | 'code_lab' | 'persona' => {
  if (pin.workspace) return pin.workspace;
  if (pin.sessionId?.startsWith('codelab') || pin.sessionTitle?.toLowerCase().includes('lab')) return 'code_lab';
  if (pin.sessionId?.startsWith('persona')) return 'persona';
  return 'chat';
};

export const CheatSheetDrawer: React.FC<CheatSheetDrawerProps> = ({
  isOpen,
  onClose,
  pinnedItems,
  currentSessionId,
  currentWorkspace = 'chat',
  onDeletePin,
  onClearAllPins,
  onOpenArchive
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'session' | 'workspace' | 'all'>(() => {
    return currentSessionId ? 'session' : 'all';
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Derive counts
  const sessionPinsCount = useMemo(() => {
    if (!currentSessionId) return 0;
    return pinnedItems.filter(p => p.sessionId === currentSessionId).length;
  }, [pinnedItems, currentSessionId]);

  const workspacePinsCount = useMemo(() => {
    return pinnedItems.filter(p => getPinWorkspace(p) === currentWorkspace).length;
  }, [pinnedItems, currentWorkspace]);

  const filteredPins = useMemo(() => {
    let list = pinnedItems;

    if (scopeFilter === 'session' && currentSessionId) {
      list = list.filter(p => p.sessionId === currentSessionId);
    } else if (scopeFilter === 'workspace') {
      list = list.filter(p => getPinWorkspace(p) === currentWorkspace);
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(p =>
      p.content.toLowerCase().includes(q) ||
      (p.sessionTitle && p.sessionTitle.toLowerCase().includes(q))
    );
  }, [pinnedItems, scopeFilter, currentSessionId, currentWorkspace, searchQuery]);

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

  const handlePrintCheatSheet = () => {
    if (filteredPins.length === 0) return;

    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const scopeTitle = scopeFilter === 'session' 
      ? 'Active Session Revision Sheet' 
      : scopeFilter === 'workspace' 
        ? `${currentWorkspace === 'code_lab' ? 'Code Dungeon' : 'Academic Chat'} Revision Sheet`
        : 'Master Exam Cheat Sheet';

    const cardsHtml = filteredPins.map((p, idx) => `
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
        <title>Prof. Joe AI — ${scopeTitle}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <style>
          body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 24px 32px;
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
          <h1>🎓 Prof. Joe AI — ${scopeTitle}</h1>
          <p>Academic Revision Deck • ${filteredPins.length} Key Formulas, Definitions & Code Snippets</p>
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

  if (!isOpen || typeof document === 'undefined') return null;

  const drawerContent = (
    <div className="demo-drawer-overlay right-drawer" onClick={onClose} style={{ zIndex: 9999999 }}>
      <aside
        className="cheat-sheet-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '420px', maxWidth: '94vw', display: 'flex', flexDirection: 'column' }}
      >
        {/* Drawer Header */}
        <div className="demo-drawer-header" style={{ padding: '14px 18px', marginBottom: 0, borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="drawer-icon-box" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(249, 115, 22, 0.25))', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '10px', padding: '6px' }}>
              <Pin size={17} style={{ color: '#fbbf24' }} />
            </div>
            <div>
              <h3 className="drawer-title" style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Exam Cheat Sheet
              </h3>
              <p className="drawer-subtitle" style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {pinnedItems.length} Pinned Notes & Formulas
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="demo-icon-btn" title="Close Drawer">
            <X size={18} />
          </button>
        </div>

        {/* 🎯 SCOPE FILTER TABS */}
        <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {currentSessionId && (
            <button
              type="button"
              onClick={() => setScopeFilter('session')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: scopeFilter === 'session' ? 'rgba(245, 158, 11, 0.5)' : 'var(--border-color)',
                background: scopeFilter === 'session' ? 'rgba(245, 158, 11, 0.18)' : 'var(--bg-tertiary)',
                color: scopeFilter === 'session' ? '#fbbf24' : 'var(--text-secondary)',
                whiteSpace: 'nowrap'
              }}
            >
              <span>📍 This Session</span>
              <span style={{ opacity: 0.8, fontSize: '0.64rem' }}>({sessionPinsCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setScopeFilter('workspace')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: scopeFilter === 'workspace' ? 'rgba(6, 182, 212, 0.5)' : 'var(--border-color)',
              background: scopeFilter === 'workspace' ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-tertiary)',
              color: scopeFilter === 'workspace' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              whiteSpace: 'nowrap'
            }}
          >
            {currentWorkspace === 'code_lab' ? <Terminal size={12} /> : <MessageSquare size={12} />}
            <span>{currentWorkspace === 'code_lab' ? 'Code Dungeon' : 'Chat'}</span>
            <span style={{ opacity: 0.8, fontSize: '0.64rem' }}>({workspacePinsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setScopeFilter('all')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: scopeFilter === 'all' ? 'rgba(168, 85, 247, 0.5)' : 'var(--border-color)',
              background: scopeFilter === 'all' ? 'rgba(168, 85, 247, 0.18)' : 'var(--bg-tertiary)',
              color: scopeFilter === 'all' ? '#c084fc' : 'var(--text-secondary)',
              whiteSpace: 'nowrap'
            }}
          >
            <span>🌟 All Pins</span>
            <span style={{ opacity: 0.8, fontSize: '0.64rem' }}>({pinnedItems.length})</span>
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <button
            type="button"
            onClick={handlePrintCheatSheet}
            disabled={filteredPins.length === 0}
            className="cheat-sheet-print-btn"
            style={{ opacity: filteredPins.length === 0 ? 0.4 : 1, padding: '7px 12px', fontSize: '0.76rem' }}
            title="Export clean printable formula sheet for current selection"
          >
            <Printer size={13} />
            <span>Print ({filteredPins.length})</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onOpenArchive && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenArchive();
                }}
                className="extractor-btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.72rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}
                title="Open the complete Pinned Notes & Exam Archive Studio"
              >
                <Layers size={13} style={{ color: 'var(--accent-cyan)' }} />
                <span>Full Archive</span>
                <ExternalLink size={11} style={{ opacity: 0.7 }} />
              </button>
            )}

            {pinnedItems.length > 0 && (
              <button
                type="button"
                onClick={onClearAllPins}
                className="cheat-sheet-clear-btn"
                style={{ padding: '6px 8px', fontSize: '0.72rem' }}
                title="Clear all saved pins"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-color)' }}>
          <div className="demo-drawer-search-bar" style={{ padding: '5px 10px' }}>
            <Search size={12} className="text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formulas or definitions..."
              className="demo-drawer-search-input"
              style={{ fontSize: '0.78rem' }}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="search-clear-btn">
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Pinned Cards List */}
        <div className="cheat-sheet-list" style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredPins.length === 0 ? (
            <div className="text-center py-12 px-4" style={{ margin: 'auto 0' }}>
              <Sparkles size={28} className="mx-auto mb-2 text-amber-400" style={{ opacity: 0.8 }} />
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                {scopeFilter === 'session' ? 'No Pins in This Session' : 'No Pinned Points Yet'}
              </p>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, maxWidth: '260px', marginInline: 'auto' }}>
                Click the 📌 Pin button on any message in chat or code dungeon to bookmark formulas and algorithms!
              </p>
            </div>
          ) : (
            filteredPins.map((item) => {
              const ws = getPinWorkspace(item);
              return (
                <div
                  key={item.id}
                  className="pinned-cheat-card"
                  style={{ borderRadius: '12px', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <Pin size={12} className="text-amber-400" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.sessionTitle || 'Key Concept'}
                      </span>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '6px',
                        background: ws === 'code_lab' ? 'rgba(6, 182, 212, 0.15)' : ws === 'persona' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: ws === 'code_lab' ? '#22d3ee' : ws === 'persona' ? '#f472b6' : '#34d399',
                        flexShrink: 0
                      }}>
                        {ws === 'code_lab' ? 'Lab 🏰' : ws === 'persona' ? 'Persona 🎭' : 'Chat 💬'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handlePrintSinglePin(item)}
                        className="pinned-card-btn"
                        title="Print This Note"
                        style={{ color: '#0284c7' }}
                      >
                        <Printer size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, item.content)}
                        className="pinned-card-btn"
                        title="Copy Card Text"
                      >
                        {copiedId === item.id ? <Check size={12} style={{ color: '#34d399' }} /> : <Copy size={12} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePin(item.id)}
                        className="pinned-card-btn delete"
                        title="Remove Pin"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div
                    className="pinned-content"
                    style={{ fontSize: '0.82rem', lineHeight: '1.5', maxHeight: '220px', overflowY: 'auto' }}
                  >
                    <MathText content={item.content} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );

  return createPortal(drawerContent, document.body);
};
