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
              <Image size={15} className="text-cyan-400" />
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
              <FileCode size={15} className="text-purple-400" />
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
                className="quick-actions-item border-t border-slate-800/80 pt-2 mt-1 text-cyan-300 font-bold"
              >
                <Sparkles size={15} className="text-cyan-400" />
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
                <Mic size={15} className="text-amber-400" />
                <span>Record Voice Note</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">SOON</span>
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
      >
        {/* Header */}
        <div className="chatgpt-doc-modal-header">
          <div className="flex items-center gap-2.5 truncate">
            {attachedFile.type === 'image' ? (
              <Image size={18} className="text-cyan-400 flex-shrink-0" />
            ) : attachedFile.type === 'code' ? (
              <FileCode size={18} className="text-purple-400 flex-shrink-0" />
            ) : (
              <FileText size={18} className="text-rose-400 flex-shrink-0" />
            )}
            <span className="font-bold text-base text-slate-100 truncate">{attachedFile.name}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 uppercase border border-slate-700">
              {attachedFile.type} • {attachedFile.sizeKb} KB
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ChatGPT Style Document Toolbar */}
        <div className="chatgpt-doc-modal-toolbar">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-300">
              {attachedFile.type === 'image' ? 'Image View' : `Document Stream (${lineCount} lines)`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">100% Zoom</span>
          </div>
        </div>

        {/* Body View */}
        <div className="chatgpt-doc-modal-body">
          {attachedFile.type === 'image' && attachedFile.previewUrl ? (
            <img
              src={attachedFile.previewUrl}
              alt={attachedFile.name}
              className="max-w-full max-h-[60vh] object-contain rounded-2xl border border-slate-800 shadow-2xl"
            />
          ) : (
            <div className="w-full h-full flex flex-col">
              <pre className="w-full h-full p-5 rounded-2xl bg-[#090d16] border border-slate-800 text-xs font-mono text-cyan-200 overflow-auto whitespace-pre-wrap leading-relaxed">
                {attachedFile.textContent || '[No text content available]'}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0f172a] border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">Press Esc or click Close to dismiss</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white transition-colors shadow-lg shadow-rose-500/20"
          >
            Close Viewer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
