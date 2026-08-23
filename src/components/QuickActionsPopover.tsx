import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image, FileText, Mic, FileCode, Eye, X, Sparkles } from 'lucide-react';

export interface AttachedFileDetails {
  name: string;
  sizeKb: number;
  type: 'image' | 'document' | 'code';
  previewUrl?: string;
  textContent?: string;
}

interface QuickActionsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUploadFile: () => void;
  onSelectCodeSnippet: () => void;
  attachedFile: AttachedFileDetails | null;
  onRemoveAttachedFile?: () => void;
  onOpenPreviewModal: () => void;
  onOpenExtractorStudio?: () => void;
}

export function QuickActionsPopover({
  isOpen,
  onClose,
  onSelectUploadFile,
  onSelectCodeSnippet,
  attachedFile,
  onOpenPreviewModal,
  onOpenExtractorStudio
}: QuickActionsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="quick-actions-glass-popover"
        >
          <div className="quick-actions-glass-header">
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} />
              <span>Quick Actions</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={13} />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            {/* If a file is attached: Show Preview Action */}
            {attachedFile && (
              <button
                type="button"
                onClick={() => {
                  onOpenPreviewModal();
                  onClose();
                }}
                className="quick-actions-item highlight-item"
              >
                <Eye size={15} />
                <div className="flex-1 truncate">
                  <div className="truncate font-bold">Preview Attached File</div>
                  <div className="text-[10px] opacity-75 truncate">{attachedFile.name}</div>
                </div>
              </button>
            )}

            {/* Upload Image or Document */}
            <button
              type="button"
              onClick={() => {
                onSelectUploadFile();
                onClose();
              }}
              className="quick-actions-item"
            >
              <Image size={15} style={{ color: 'var(--accent-cyan)' }} />
              <span>{attachedFile ? 'Replace Image / Document' : 'Upload Image / Document'}</span>
            </button>

            {/* Import Code / Text Snippet */}
            <button
              type="button"
              onClick={() => {
                onSelectCodeSnippet();
                onClose();
              }}
              className="quick-actions-item"
            >
              <FileCode size={15} style={{ color: 'var(--accent-blue, var(--accent-cyan))' }} />
              <span>Import Code Snippet / Text File</span>
            </button>

            {/* Quick Extraction Engine */}
            {onOpenExtractorStudio && (
              <button
                type="button"
                onClick={() => {
                  onOpenExtractorStudio();
                  onClose();
                }}
                className="quick-actions-item border-t pt-2 mt-1 font-bold"
                style={{ borderColor: 'var(--border-color)', color: 'var(--accent-cyan)' }}
              >
                <Sparkles size={15} style={{ color: 'var(--accent-cyan)' }} />
                <span>⚡ Quick Extraction Engine</span>
              </button>
            )}

            {/* Record Voice Note (Future Integration Placeholder) */}
            <button
              type="button"
              className="quick-actions-item opacity-60 cursor-not-allowed justify-between"
              title="Voice recording integration coming soon"
            >
              <span className="flex items-center gap-2.5">
                <Mic size={15} style={{ color: 'var(--text-muted)' }} />
                <span>Record Voice Note</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'var(--pill-bg)', color: 'var(--pill-text)' }}>SOON</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachedFile: AttachedFileDetails | null;
}

export function FilePreviewModal({ isOpen, onClose, attachedFile }: FilePreviewModalProps) {
  if (!isOpen || !attachedFile) return null;

  const lineCount = attachedFile.textContent ? attachedFile.textContent.split('\n').length : 1;

  return (
    <div className="chatgpt-doc-modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="chatgpt-doc-modal-card"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
      >
        {/* Header */}
        <div className="chatgpt-doc-modal-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2.5 truncate">
            {attachedFile.type === 'image' ? (
              <Image size={18} style={{ color: 'var(--accent-cyan)' }} className="flex-shrink-0" />
            ) : attachedFile.type === 'code' ? (
              <FileCode size={18} style={{ color: 'var(--accent-blue, var(--accent-cyan))' }} className="flex-shrink-0" />
            ) : (
              <FileText size={18} style={{ color: 'var(--accent-cyan)' }} className="flex-shrink-0" />
            )}
            <span className="font-bold text-base text-slate-100 truncate" style={{ color: 'var(--text-primary)' }}>{attachedFile.name}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase" style={{ background: 'var(--bg-tertiary)', color: 'var(--accent-cyan)', border: '1px solid var(--border-color)' }}>
              {attachedFile.type} • {attachedFile.sizeKb} KB
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ChatGPT Style Document Toolbar */}
        <div className="chatgpt-doc-modal-toolbar" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
          <div className="flex items-center gap-3">
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {attachedFile.type === 'image' ? 'Image View' : `Document Stream (${lineCount} lines)`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>100% Zoom</span>
          </div>
        </div>

        {/* Body View */}
        <div className="chatgpt-doc-modal-body">
          {attachedFile.type === 'image' && attachedFile.previewUrl ? (
            <img
              src={attachedFile.previewUrl}
              alt={attachedFile.name}
              className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-2xl"
              style={{ border: '1px solid var(--border-color)' }}
            />
          ) : (
            <div className="w-full h-full flex flex-col">
              <pre className="w-full h-full p-5 rounded-2xl text-xs font-mono overflow-auto whitespace-pre-wrap leading-relaxed" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                {attachedFile.textContent || '[No text content available]'}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex items-center justify-between" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Press Esc or click Close to dismiss</span>
          <button
            type="button"
            onClick={onClose}
            className="btn-theme-primary px-5 py-1.5 rounded-xl text-xs font-bold"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
