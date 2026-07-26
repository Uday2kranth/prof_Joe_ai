import React, { useEffect, useState, useRef } from 'react';
import { X, Download, Printer, Sparkles, FileText, Image as ImageIcon } from 'lucide-react';
import { exportBubbleDirectPdf, printBubbleToPdf } from '../services/printPdfService';
import { exportBubbleToImage } from '../services/exportService';

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
  content,
  modelUsed,
  docTitle,
  renderedHtml
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [printing, setPrinting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await exportBubbleDirectPdf(content, modelUsed, docTitle);
    } finally {
      setDownloading(false);
    }
  };

  const handleExportPng = async () => {
    if (!cardRef.current) return;
    setDownloadingImage(true);
    try {
      await exportBubbleToImage(cardRef.current, docTitle);
    } finally {
      setDownloadingImage(false);
    }
  };

  const handlePrint = async () => {
    setPrinting(true);
    try {
      await printBubbleToPdf(content, modelUsed, docTitle);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="pdf-preview-modal-overlay" onClick={onClose}>
      <div className="pdf-preview-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="pdf-modal-header">
          <h3>
            <Sparkles size={18} className="text-cyan-400" />
            <span>Interactive PDF & Image Document Preview</span>
          </h3>
          <button
            onClick={onClose}
            className="pdf-action-btn-secondary"
            style={{ padding: '6px', borderRadius: '50%' }}
            title="Close Preview"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Wave Card Page Preview */}
        <div className="pdf-modal-body">
          <div className="pdf-page-wave-card" ref={cardRef} style={{ background: '#ffffff', color: '#0f172a' }}>
            <div style={{ borderBottom: '2px solid #06b6d4', paddingBottom: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 style={{ fontSize: '1.4rem', margin: 0, color: '#06b6d4' }}>Prof. Joe AI Document</h1>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Model: {modelUsed || 'AI Model'}</div>
            </div>
            <div
              className="markdown-content"
              style={{ lineHeight: 1.65, color: '#0f172a' }}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        </div>

        {/* Modal Footer: Action Toolbar */}
        <div className="pdf-modal-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
            <FileText size={16} className="text-cyan-400" />
            <span>{docTitle}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportPng}
              disabled={downloadingImage}
              className="pdf-action-btn-secondary"
              title="Save Preview as PNG Image"
            >
              <ImageIcon size={16} />
              <span>{downloadingImage ? 'Saving...' : 'Save PNG Image'}</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={printing}
              className="pdf-action-btn-secondary"
              title="Print via Browser Print Engine"
            >
              <Printer size={16} />
              <span>{printing ? 'Preparing...' : 'Print Paper'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="pdf-action-btn-primary"
              title="Save PDF File Directly"
            >
              <Download size={16} />
              <span>{downloading ? 'Downloading...' : 'Save PDF File'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
