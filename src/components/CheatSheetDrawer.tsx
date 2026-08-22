import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Pin, Search, Trash2, Printer, X, Sparkles, Copy, Check, ExternalLink, Layers, Terminal, MessageSquare } from 'lucide-react';
import type { PinnedItem } from '../types';
import { MathText } from './MathText';
import { printSinglePinToPdf, printSessionPinsToPdf } from '../services/printPdfService';

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
  const [scopeFilter, setScopeFilter] = useState<'session' | 'workspace' | 'all'>(currentSessionId ? 'session' : 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Derive counts
  const sessionPinsCount = useMemo(() => {
    if (!currentSessionId) return 0;
    return pinnedItems.filter(p => p.sessionId === currentSessionId).length;
  }, [pinnedItems, currentSessionId]);

  const workspacePinsCount = useMemo(() => {
    return pinnedItems.filter(p => getPinWorkspace(p) === currentWorkspace).length;
  }, [pinnedItems, currentWorkspace]);

  // Filter pins by scope and search
  const filteredPins = useMemo(() => {
    let list = [...pinnedItems];
    
    if (scopeFilter === 'session' && currentSessionId) {
      list = list.filter(p => (p.sessionId || 'general-notes') === currentSessionId);
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

  // 🖨️ LEVEL 1: Message-Wise Print (Unified Academic Layout)
  const handlePrintSinglePin = (pin: PinnedItem) => {
    printSinglePinToPdf(pin);
  };

  // 🖨️ LEVEL 2: Scope-Wise Revision Sheet Print (Unified Academic Layout)
  const handlePrintCheatSheet = () => {
    if (filteredPins.length === 0) return;

    const scopeTitle = scopeFilter === 'session' 
      ? 'Active Session Revision Sheet' 
      : scopeFilter === 'workspace' 
        ? `${currentWorkspace === 'code_lab' ? 'Code Dungeon' : 'Academic Chat'} Revision Sheet`
        : 'Master Exam Cheat Sheet';

    printSessionPinsToPdf(filteredPins, scopeTitle);
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
