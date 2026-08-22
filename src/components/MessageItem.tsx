import React, { useEffect, useState, useRef } from 'react';
import { User, Copy, Download, Eye, Printer, Volume2, Check, RotateCcw, Edit3, Send, X, GitBranch, Pin, Layers, Award } from 'lucide-react';
import 'katex/dist/katex.min.css';

import type { Message } from '../types';
import { extractDiagrams, fetchKrokiSvg } from '../services/krokiService';
import { getRenderCache, setRenderCache } from '../services/renderCacheService';
import { exportBubbleToImage } from '../services/exportService';
import { printBubbleToPdf } from '../services/printPdfService';
import { PdfPreviewModal } from './PdfPreviewModal';

import { renderMathHtml, sanitizeLatexForKatex } from './MathText';
export { sanitizeLatexForKatex };

export function renderMarkdownWithMathAndDiagrams(content: string, diagramMap: Map<string, string>): string {
  return renderMathHtml(content, { diagramMap });
}

interface MessageItemProps {
  message: Message;
  isLast?: boolean;
  isLastUserMessage?: boolean;
  isLastAssistantMessage?: boolean;
  onRetry?: () => void;
  onEditUserMessage?: (oldText: string) => void;
  onBranch?: (msg: Message) => void;
  onPin?: (msg: Message) => void;
  isPinned?: boolean;
  onGenerateFlashcards?: (msg: Message) => void;
  onGenerateQuiz?: (msg: Message) => void;
}

const MessageItemComponent: React.FC<MessageItemProps> = ({
  message,
  isLast,
  isLastUserMessage,
  isLastAssistantMessage,
  onRetry,
  onEditUserMessage,
  onBranch,
  onPin,
  isPinned,
  onGenerateFlashcards,
  onGenerateQuiz
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [exportingImage, setExportingImage] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [diagramHtml, setDiagramHtml] = useState<string | null>(null);

  // Synchronously compute initial HTML so the DOM is instantly rendered without flash or node replacements
  const synchronousInitialHtml = React.useMemo(() => {
    const rawContent = message.content || '';
    if (!rawContent) return '';
    const diagrams = extractDiagrams(rawContent);
    const skeletonMap = new Map<string, string>();
    let markdownToParse = rawContent;
    diagrams.forEach((diag, index) => {
      const token = `KROKIDIAGRAMTOKEN${index}ENDTOKEN`;
      skeletonMap.set(token, `<div class="kroki-container-skeleton" style="padding:16px; margin:12px 0; border:1px dashed rgba(6,182,212,0.4); border-radius:8px; background:rgba(6,182,212,0.05); color:#06b6d4; font-size:0.85rem; font-weight:600; display:flex; align-items:center; gap:8px;">⏳ Loading ${diag.type.toUpperCase()} Diagram...</div>`);
      markdownToParse = markdownToParse.replace(diag.fullMatch, token);
    });
    return renderMarkdownWithMathAndDiagrams(markdownToParse, skeletonMap);
  }, [message.content]);

  const renderedHtml = diagramHtml || synchronousInitialHtml;
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(message.content || '');
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const lastParsedTimeRef = useRef<number>(0);

  useEffect(() => {
    setDraftContent(message.content || '');
  }, [message.content]);

  const handleStartEdit = () => {
    setIsInlineEditing(true);
    setDraftContent(message.content || '');
    setTimeout(() => {
      if (editTextareaRef.current) {
        editTextareaRef.current.focus();
        editTextareaRef.current.style.height = 'auto';
        editTextareaRef.current.style.height = `${Math.min(editTextareaRef.current.scrollHeight, 240)}px`;
      }
    }, 50);
  };

  const handleCancelEdit = () => {
    setIsInlineEditing(false);
    setDraftContent(message.content || '');
  };

  const handleSaveEdit = () => {
    if (!draftContent.trim()) return;
    setIsInlineEditing(false);
    if (onEditUserMessage) {
      onEditUserMessage(draftContent.trim());
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function processMessage() {
      const rawContent = message.content || '';
      if (!rawContent) return;

      const diagrams = extractDiagrams(rawContent);
      if (diagrams.length === 0) {
        // No async diagrams needed — synchronousInitialHtml handles it completely
        return;
      }

      // If diagrams exist, check cache or asynchronously fetch SVGs
      const msgHash = `msg_rendered_v4_${message.id || 'msg'}_${rawContent.length}_${rawContent.slice(0, 40)}`;
      const cachedHtml = await getRenderCache(msgHash);
      if (cachedHtml && isMounted) {
        setDiagramHtml(cachedHtml);
        return;
      }

      let markdownToParse = rawContent;
      let tokenIndex = 0;
      diagrams.forEach(diag => {
        const token = `KROKIDIAGRAMTOKEN${tokenIndex++}ENDTOKEN`;
        markdownToParse = markdownToParse.replace(diag.fullMatch, token);
      });

      // Asynchronously fetch SVGs in background & upgrade placeholders cleanly
      const updatedDiagramMap = new Map<string, string>();
      const svgResults = await Promise.all(
        diagrams.map(async (diag, index) => {
          const token = `KROKIDIAGRAMTOKEN${index}ENDTOKEN`;
          const svgHtml = await fetchKrokiSvg(diag.type, diag.source);
          return { token, svgHtml, type: diag.type };
        })
      );

      svgResults.forEach(res => {
        updatedDiagramMap.set(res.token, `<div class="kroki-container" data-type="${res.type}">${res.svgHtml}</div>`);
      });

      const finalParsedHtml = renderMarkdownWithMathAndDiagrams(markdownToParse, updatedDiagramMap);
      if (isMounted) {
        setDiagramHtml(finalParsedHtml);
        setRenderCache(msgHash, finalParsedHtml);
      }
    }

    // Stream throttling: Throttle parsing updates to 80ms windows during active streaming
    const now = Date.now();
    if (message.isStreaming && now - lastParsedTimeRef.current < 80) {
      const timer = setTimeout(() => {
        if (isMounted) processMessage();
      }, 80);
      return () => clearTimeout(timer);
    }

    lastParsedTimeRef.current = now;
    processMessage();

    return () => {
      isMounted = false;
    };
  }, [message.content, message.id, message.isStreaming]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const generateExportFilename = (extension: string): string => {
    // 1. Extract plain text (strip markdown headers, bolding, code blocks, latex)
    const textOnly = (message.content || '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/[#*`$\-\\_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // 2. Extract first 25 chars for safe topic slug
    const rawTopic = textOnly.slice(0, 25).trim();
    const cleanTopic = rawTopic.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_') || 'Export';

    // 3. Shorten model name slug
    const rawModel = message.modelUsed || 'AI';
    const modelSlug = (rawModel.includes('/') ? rawModel.split('/')[1] : rawModel).replace(/[^a-zA-Z0-9.-]/g, '');

    // 4. Current date (YYYY-MM-DD)
    const dateStr = new Date().toISOString().split('T')[0];

    return `ProfJoe_${cleanTopic}_${modelSlug}_${dateStr}.${extension}`;
  };

  const handleExportImage = async () => {
    if (!bubbleRef.current) return;
    setExportingImage(true);
    try {
      const filename = generateExportFilename('png');
      await exportBubbleToImage(bubbleRef.current, filename.replace(/\.png$/, ''));
    } finally {
      setExportingImage(false);
    }
  };

  const handleExportPdf = () => {
    setIsPdfModalOpen(true);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textOnly = message.content.replace(/```[\s\S]*?```/g, '');
      const utterance = new SpeechSynthesisUtterance(textOnly);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDirectPrint = async () => {
    await printBubbleToPdf(message.content, message.modelUsed, generateExportFilename('pdf').replace(/\.pdf$/, ''));
  };

  return (
    <div id={`msg-${message.id}`} className={`message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
      <div className="avatar" style={{ overflow: 'hidden', border: !isUser ? '1px solid rgba(6, 182, 212, 0.4)' : 'none' }}>
        {isUser ? (
          <User size={16} />
        ) : (
          <img
            src="/joe-avatar.png"
            alt="Prof. Joe AI"
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          />
        )}
      </div>

      <div className="bubble-wrapper">
        <div className="bubble-header">
          <span className="role-label">{isUser ? 'You' : 'Assistant'}</span>
          {message.modelUsed && <span className="model-badge">{message.modelUsed}</span>}
          <span className="time-stamp">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <div ref={bubbleRef} className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'} ${isInlineEditing ? 'inline-editing-mode' : ''}`}>
          {isInlineEditing ? (
            <div className="inline-bubble-edit-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '260px' }}>
              <textarea
                ref={editTextareaRef}
                value={draftContent}
                onChange={(e) => {
                  setDraftContent(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 240)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
                className="inline-edit-textarea"
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(6, 182, 212, 0.5)',
                  borderRadius: '10px',
                  padding: '8px 10px',
                  color: '#f8fafc',
                  fontSize: '0.86rem',
                  lineHeight: '1.45',
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none',
                  minHeight: '44px',
                  boxShadow: '0 0 12px rgba(6, 182, 212, 0.15)'
                }}
                placeholder="Edit your prompt..."
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="kokonut-msg-btn"
                  style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.74rem' }}
                  title="Cancel Edit (Esc)"
                >
                  <X size={12} />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={!draftContent.trim()}
                  className="extractor-btn-primary"
                  style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  title="Save and submit (Enter)"
                >
                  <Send size={12} />
                  <span>Save & Submit</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              className="formatted-content markdown-body"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          )}
        </div>

        {!isInlineEditing && (
          <div className={`kokonut-msg-actions-container ${isUser ? 'user-actions' : 'assistant-actions'}`}>
            <button
              onClick={handleCopy}
              className={`kokonut-msg-btn ${copied ? 'active-action' : ''}`}
              title="Copy Text"
            >
              {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleExportImage}
              disabled={exportingImage}
              className="kokonut-msg-btn"
              title="Export Bubble to PNG Image"
            >
              <Download size={13} />
              <span>{exportingImage ? 'Exporting...' : 'PNG'}</span>
            </button>

            <button
              onClick={handleExportPdf}
              className="kokonut-msg-btn"
              title="Preview PDF Document"
            >
              <Eye size={13} />
              <span>PDF</span>
            </button>

            <button
              onClick={handleDirectPrint}
              className="kokonut-msg-btn"
              title="Direct System Print Preview"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>

            {!isUser && (
              <button onClick={handleSpeak} className="kokonut-msg-btn" title="Read Aloud">
                <Volume2 size={13} />
                <span>Listen</span>
              </button>
            )}

            {/* Pin to Exam Cheat Sheet Button */}
            {!isUser && onPin && (
              <button
                onClick={() => onPin(message)}
                className={`kokonut-msg-btn pin-btn ${isPinned ? 'active-pinned' : ''}`}
                title={isPinned ? "Pinned in Exam Cheat Sheet" : "Pin to Exam Cheat Sheet & Formula Deck"}
              >
                <Pin size={13} style={{ color: isPinned ? '#fbbf24' : '#94a3b8' }} className={isPinned ? 'fill-amber-400 text-amber-400' : ''} />
                <span>{isPinned ? 'Pinned ⭐' : 'Pin'}</span>
              </button>
            )}

            {/* Targeted Micro-Drill Flashcards */}
            {!isUser && onGenerateFlashcards && (
              <button
                onClick={() => onGenerateFlashcards(message)}
                className="kokonut-msg-btn"
                title="Generate Flashcard Deck from this specific answer"
              >
                <Layers size={13} style={{ color: '#38bdf8' }} />
                <span>Cards</span>
              </button>
            )}

            {/* Targeted Micro-Drill Quiz */}
            {!isUser && onGenerateQuiz && (
              <button
                onClick={() => onGenerateQuiz(message)}
                className="kokonut-msg-btn"
                title="Generate Practice Quiz from this specific answer"
              >
                <Award size={13} style={{ color: '#34d399' }} />
                <span>Quiz</span>
              </button>
            )}

            {/* Branch Conversation from this Turn */}
            {!isUser && onBranch && (
              <button
                onClick={() => onBranch(message)}
                className="kokonut-msg-btn branch-btn"
                title="Branch / Fork conversation from this turn"
              >
                <GitBranch size={13} style={{ color: '#34d399' }} />
                <span>Branch</span>
              </button>
            )}

            {/* Edit User Message Button */}
            {isUser && (isLastUserMessage ?? isLast) && onEditUserMessage && (
              <button
                onClick={handleStartEdit}
                className="kokonut-msg-btn"
                title="Edit Prompt Text in Bubble"
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
            )}

            {/* Retry Response Button */}
            {!isUser && (isLastAssistantMessage ?? isLast) && onRetry && (
              <button onClick={onRetry} className="kokonut-msg-btn" title="Regenerate / Retry Answer">
                <RotateCcw size={13} />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Option 3 Custom Animated PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        content={message.content}
        modelUsed={message.modelUsed}
        docTitle={generateExportFilename('pdf').replace(/\.pdf$/, '')}
        renderedHtml={renderedHtml}
      />
    </div>
  );
};

const arePropsEqual = (prevProps: MessageItemProps, nextProps: MessageItemProps) => {
  if (prevProps.isLast !== nextProps.isLast) return false;
  if (prevProps.isLastUserMessage !== nextProps.isLastUserMessage) return false;
  if (prevProps.isLastAssistantMessage !== nextProps.isLastAssistantMessage) return false;
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (prevProps.message.content !== nextProps.message.content) return false;
  if (prevProps.message.isStreaming !== nextProps.message.isStreaming) return false;
  if (prevProps.message.modelUsed !== nextProps.message.modelUsed) return false;
  if (prevProps.isPinned !== nextProps.isPinned) return false;
  return true;
};

export const MessageItem = React.memo(MessageItemComponent, arePropsEqual);
