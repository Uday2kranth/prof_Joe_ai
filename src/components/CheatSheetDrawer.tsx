import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Pin, Search, Trash2, Printer, X, Sparkles, Copy, Check } from 'lucide-react';
import type { PinnedItem } from '../types';
import { renderMarkdownWithMathAndDiagrams } from './MessageItem';

interface CheatSheetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pinnedItems: PinnedItem[];
  onDeletePin: (id: string) => void;
  onClearAllPins: () => void;
}

export const CheatSheetDrawer: React.FC<CheatSheetDrawerProps> = ({
  isOpen,
  onClose,
  pinnedItems,
  onDeletePin,
  onClearAllPins
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPins = useMemo(() => {
    if (!searchQuery.trim()) return pinnedItems;
    const q = searchQuery.toLowerCase();
    return pinnedItems.filter(p =>
      p.content.toLowerCase().includes(q) ||
      (p.sessionTitle && p.sessionTitle.toLowerCase().includes(q))
    );
  }, [pinnedItems, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handlePrintCheatSheet = () => {
    if (pinnedItems.length === 0) return;

    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const cardsHtml = pinnedItems.map((p, idx) => `
      <div class="cheat-card">
        <div class="card-header">
          <span class="card-num">#${idx + 1}</span>
          <span class="card-title">${p.sessionTitle || 'High-Yield Note'}</span>
        </div>
        <div class="card-body">
          ${renderMarkdownWithMathAndDiagrams(p.content, new Map())}
        </div>
      </div>
    `).join('');

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prof. Joe AI — Exam Cheat Sheet & Key Formulas</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <style>
          body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 24px;
            font-size: 11pt;
            line-height: 1.45;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0 0 4px 0;
            font-size: 18pt;
            color: #0369a1;
          }
          .header p {
            margin: 0;
            font-size: 9pt;
            color: #64748b;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .cheat-card {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 12px 14px;
            background: #f8fafc;
            page-break-inside: avoid;
          }
          .card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 700;
            font-size: 10pt;
            color: #0369a1;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 8px;
          }
          .card-num {
            background: #0284c7;
            color: #ffffff;
            font-size: 8pt;
            padding: 2px 6px;
            border-radius: 4px;
          }
          .card-body {
            font-size: 9.5pt;
            color: #1e293b;
          }
          .card-body p { margin: 4px 0; }
          .katex-display { margin: 6px 0 !important; font-size: 1.05em; }
          @media print {
            body { padding: 0; }
            .grid { grid-template-columns: 1fr 1fr; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎓 Prof. Joe AI — High-Yield Exam Cheat Sheet</h1>
          <p>Osmania University Academic Revision Deck • ${pinnedItems.length} Key Formulas & Definitions</p>
        </div>
        <div class="grid">
          ${cardsHtml}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 500);
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
      >
        {/* Drawer Header */}
        <div className="demo-drawer-header" style={{ padding: '16px 20px', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="drawer-icon-box" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(249, 115, 22, 0.25))', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
              <Pin size={17} style={{ color: '#fbbf24' }} />
            </div>
            <div>
              <h3 className="drawer-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                Exam Cheat Sheet
              </h3>
              <p className="drawer-subtitle" style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                {pinnedItems.length} Pinned Formulas & High-Yield Points
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="demo-icon-btn" title="Close Drawer">
            <X size={18} />
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handlePrintCheatSheet}
            disabled={pinnedItems.length === 0}
            className="cheat-sheet-print-btn"
            style={{ opacity: pinnedItems.length === 0 ? 0.4 : 1 }}
            title="Export clean 2-column printable formula sheet"
          >
            <Printer size={14} />
            <span>Print 1-Page Cheat Sheet</span>
          </button>

          {pinnedItems.length > 0 && (
            <button
              type="button"
              onClick={onClearAllPins}
              className="cheat-sheet-clear-btn"
              title="Clear all saved pins"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div className="demo-drawer-search-bar" style={{ padding: '6px 12px' }}>
            <Search size={13} className="text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formulas or definitions..."
              className="demo-drawer-search-input"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="search-clear-btn">
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Pinned Cards List */}
        <div className="cheat-sheet-list" style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredPins.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400" style={{ margin: 'auto 0' }}>
              <Sparkles size={32} className="mx-auto mb-2 text-amber-400" style={{ opacity: 0.8 }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 4px 0' }}>No Pinned Key Points Yet</p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, maxWidth: '280px', marginInline: 'auto' }}>
                Click the 📌 Pin button on any AI response in chat to bookmark key formulas, theorems, and definitions here!
              </p>
            </div>
          ) : (
            filteredPins.map((item) => (
              <div
                key={item.id}
                className="pinned-cheat-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <Pin size={12} className="text-amber-400" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.sessionTitle || 'Key Concept'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.content)}
                      className="pinned-card-btn"
                      title="Copy Card Text"
                    >
                      {copiedId === item.id ? <Check size={13} style={{ color: '#34d399' }} /> : <Copy size={13} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePin(item.id)}
                      className="pinned-card-btn delete"
                      title="Remove Pin"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div
                  className="pinned-content formatted-content markdown-body"
                  style={{ fontSize: '0.86rem', lineHeight: '1.5', color: '#cbd5e1', maxHeight: '240px', overflowY: 'auto' }}
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdownWithMathAndDiagrams(item.content, new Map())
                  }}
                />
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );

  return createPortal(drawerContent, document.body);
};
