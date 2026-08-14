import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Download, Sparkles, FileText, Image as ImageIcon, Palette, Check } from 'lucide-react';
import { exportBubbleToPdf, exportBubbleToImage } from '../services/exportService';

export interface DocumentTheme {
  id: string;
  name: string;
  dotColor: string;
  primary: string;
  accent: string;
  cardBg: string;
  textColor: string;
  glowGradient: string;
  headerBorder: string;
  tableHeaderBg: string;
  tableHeaderText: string;
  tableBorder: string;
  tableRowOdd: string;
  tableRowEven: string;
}

export const DOCUMENT_THEMES: DocumentTheme[] = [
  {
    id: 'cyan',
    name: 'Ocean Cyan',
    dotColor: '#0284c7',
    primary: '#0284c7',
    accent: '#0369a1',
    cardBg: '#ffffff',
    textColor: '#0f172a',
    glowGradient: 'linear-gradient(125deg, rgba(2, 132, 199, 0.45), rgba(14, 165, 233, 0.35), rgba(99, 102, 241, 0.35))',
    headerBorder: 'rgba(2, 132, 199, 0.65)',
    tableHeaderBg: 'rgba(2, 132, 199, 0.09)',
    tableHeaderText: '#0369a1',
    tableBorder: 'rgba(2, 132, 199, 0.22)',
    tableRowOdd: '#ffffff',
    tableRowEven: 'rgba(240, 249, 255, 0.75)'
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    dotColor: '#7c3aed',
    primary: '#7c3aed',
    accent: '#6d28d9',
    cardBg: '#ffffff',
    textColor: '#0f172a',
    glowGradient: 'linear-gradient(125deg, rgba(124, 58, 237, 0.45), rgba(168, 85, 247, 0.35), rgba(99, 102, 241, 0.35))',
    headerBorder: 'rgba(124, 58, 237, 0.65)',
    tableHeaderBg: 'rgba(124, 58, 237, 0.09)',
    tableHeaderText: '#6d28d9',
    tableBorder: 'rgba(124, 58, 237, 0.22)',
    tableRowOdd: '#ffffff',
    tableRowEven: 'rgba(250, 245, 255, 0.75)'
  },
  {
    id: 'emerald',
    name: 'Emerald Sage',
    dotColor: '#059669',
    primary: '#059669',
    accent: '#047857',
    cardBg: '#ffffff',
    textColor: '#0f172a',
    glowGradient: 'linear-gradient(125deg, rgba(5, 150, 105, 0.45), rgba(16, 185, 129, 0.35), rgba(20, 184, 166, 0.35))',
    headerBorder: 'rgba(5, 150, 105, 0.65)',
    tableHeaderBg: 'rgba(5, 150, 105, 0.09)',
    tableHeaderText: '#047857',
    tableBorder: 'rgba(5, 150, 105, 0.22)',
    tableRowOdd: '#ffffff',
    tableRowEven: 'rgba(240, 253, 244, 0.75)'
  },
  {
    id: 'rose',
    name: 'Crimson Rose',
    dotColor: '#e11d48',
    primary: '#e11d48',
    accent: '#be123c',
    cardBg: '#ffffff',
    textColor: '#0f172a',
    glowGradient: 'linear-gradient(125deg, rgba(225, 29, 72, 0.45), rgba(244, 63, 94, 0.35), rgba(217, 70, 239, 0.35))',
    headerBorder: 'rgba(225, 29, 72, 0.65)',
    tableHeaderBg: 'rgba(225, 29, 72, 0.09)',
    tableHeaderText: '#be123c',
    tableBorder: 'rgba(225, 29, 72, 0.22)',
    tableRowOdd: '#ffffff',
    tableRowEven: 'rgba(255, 241, 242, 0.75)'
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    dotColor: '#d97706',
    primary: '#d97706',
    accent: '#b45309',
    cardBg: '#ffffff',
    textColor: '#0f172a',
    glowGradient: 'linear-gradient(125deg, rgba(217, 119, 6, 0.45), rgba(245, 158, 11, 0.35), rgba(234, 179, 8, 0.35))',
    headerBorder: 'rgba(217, 119, 6, 0.65)',
    tableHeaderBg: 'rgba(217, 119, 6, 0.09)',
    tableHeaderText: '#b45309',
    tableBorder: 'rgba(217, 119, 6, 0.22)',
    tableRowOdd: '#ffffff',
    tableRowEven: 'rgba(254, 252, 232, 0.75)'
  },
  {
    id: 'parchment',
    name: 'Clean Paper',
    dotColor: '#64748b',
    primary: '#475569',
    accent: '#334155',
    cardBg: '#faf9f6',
    textColor: '#1e293b',
    glowGradient: 'linear-gradient(125deg, rgba(148, 163, 184, 0.45), rgba(203, 213, 225, 0.5), rgba(100, 116, 139, 0.45))',
    headerBorder: '#94a3b8',
    tableHeaderBg: 'rgba(226, 232, 240, 0.85)',
    tableHeaderText: '#334155',
    tableBorder: 'rgba(148, 163, 184, 0.35)',
    tableRowOdd: '#ffffff',
    tableRowEven: '#f1f5f9'
  },
  {
    id: 'midnight',
    name: 'Midnight Dark',
    dotColor: '#38bdf8',
    primary: '#38bdf8',
    accent: '#818cf8',
    cardBg: '#0f172a',
    textColor: '#f8fafc',
    glowGradient: 'linear-gradient(125deg, rgba(56, 189, 248, 0.55), rgba(129, 140, 248, 0.55), rgba(168, 85, 247, 0.55))',
    headerBorder: '#38bdf8',
    tableHeaderBg: 'rgba(30, 41, 59, 0.95)',
    tableHeaderText: '#38bdf8',
    tableBorder: 'rgba(56, 189, 248, 0.35)',
    tableRowOdd: '#0f172a',
    tableRowEven: '#1e293b'
  }
];

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  modelUsed?: string;
  docTitle: string;
  renderedHtml: string;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  content: _content,
  modelUsed,
  docTitle,
  renderedHtml
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string>('cyan');
  const [downloading, setDownloading] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const activeTheme = DOCUMENT_THEMES.find(t => t.id === selectedThemeId) || DOCUMENT_THEMES[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      await exportBubbleToPdf(cardRef.current, docTitle, activeTheme.cardBg);
    } finally {
      setDownloading(false);
    }
  };

  const handleExportPng = async () => {
    if (!cardRef.current) return;
    setDownloadingImage(true);
    try {
      await exportBubbleToImage(cardRef.current, docTitle, activeTheme.cardBg);
    } finally {
      setDownloadingImage(false);
    }
  };

  const modalNode = (
    <div className="pdf-preview-modal-overlay" onClick={onClose} style={{ zIndex: 9999999 }}>
      <div className="pdf-preview-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="pdf-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} className="text-cyan-400" />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
              Interactive Document Preview & Theme Styler
            </span>
          </div>
          <button
            onClick={onClose}
            className="pdf-action-btn-secondary"
            style={{ padding: '6px', borderRadius: '50%', border: 'none' }}
            title="Close Preview"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Color Palette Selection Bar - Sleek Round Color Swatch Buttons */}
        <div className="pdf-theme-palette-bar" style={{ padding: '8px 20px', background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>
            <Palette size={14} className="text-cyan-400" />
            <span>Note Color:</span>
            <span style={{ color: activeTheme.dotColor, fontWeight: 700, marginLeft: '4px' }}>{activeTheme.name}</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {DOCUMENT_THEMES.map(theme => {
              const isSelected = theme.id === selectedThemeId;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedThemeId(theme.id)}
                  title={`${theme.name} Theme`}
                  aria-label={`${theme.name} Theme`}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: theme.dotColor,
                    border: isSelected ? '2.5px solid #ffffff' : '1.5px solid rgba(255, 255, 255, 0.25)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: isSelected ? `0 0 12px ${theme.dotColor}, 0 0 4px #ffffff` : `0 2px 4px rgba(0,0,0,0.4)`,
                    transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                    padding: 0
                  }}
                >
                  {isSelected && <Check size={12} color="#ffffff" strokeWidth={3.5} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body: Wave Card Page Preview with Dynamic Theme Injection */}
        <div className="pdf-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'rgba(2, 6, 23, 0.7)' }}>
          <div
            className="pdf-page-wave-card"
            ref={cardRef}
            style={{
              background: activeTheme.cardBg,
              color: activeTheme.textColor,
              borderRadius: '14px',
              padding: '36px',
              maxWidth: '820px',
              width: '100%',
              margin: '0 auto',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
              position: 'relative'
            }}
          >
            {/* Dynamic Wave Border Accent */}
            <div
              style={{
                position: 'absolute',
                inset: '-2px',
                borderRadius: '16px',
                background: activeTheme.glowGradient,
                zIndex: -1,
                filter: 'blur(8px)',
                opacity: 0.8
              }}
            />

            {/* Document Header */}
            <div
              style={{
                borderBottom: `2px solid ${activeTheme.headerBorder}`,
                paddingBottom: '12px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <h1 style={{ fontSize: '1.4rem', margin: 0, color: activeTheme.primary, fontWeight: 700 }}>
                Prof. Joe AI Document
              </h1>
              <div style={{ fontSize: '0.82rem', color: activeTheme.id === 'midnight' ? '#94a3b8' : '#64748b', fontFamily: 'monospace' }}>
                Model: {modelUsed || 'AI Model'} • {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* Rendered HTML Content with Themed Overrides */}
            <div
              className="markdown-content themed-doc-content"
              style={{
                lineHeight: 1.7,
                color: activeTheme.textColor,
                fontSize: '0.94rem'
              }}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        </div>

        {/* Modal Footer: Action Toolbar */}
        <div className="pdf-modal-footer" style={{ padding: '14px 24px', background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.82rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <FileText size={15} style={{ color: activeTheme.primary }} />
            <span>{docTitle}</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleExportPng}
              disabled={downloadingImage}
              className="pdf-action-btn-secondary"
              title="Save styled preview card as PNG Image"
              style={{ padding: '8px 16px', borderRadius: '10px' }}
            >
              <ImageIcon size={15} />
              <span>{downloadingImage ? 'Saving...' : 'Save PNG Image'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="pdf-action-btn-primary"
              title="Download themed PDF Document directly"
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${activeTheme.primary} 0%, ${activeTheme.accent} 100%)`
              }}
            >
              <Download size={15} />
              <span>{downloading ? 'Downloading...' : 'Download PDF File'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalNode, document.body);
};
