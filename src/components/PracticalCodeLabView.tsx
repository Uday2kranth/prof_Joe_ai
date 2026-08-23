import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Send, 
  Paperclip, 
  Code, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  FileCode,
  Sliders,
  ChevronDown,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Zap,
  Package,
  MessageSquare,
  Edit3,
  RotateCcw,
  Printer,
  Pin,
  GitBranch
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import { extractDiagrams, fetchKrokiSvg } from '../services/krokiService';
import { renderMarkdownWithMathAndDiagrams } from './MessageItem';
import { exportBubbleToImage } from '../services/exportService';
import { printBubbleToPdf } from '../services/printPdfService';
import { PdfPreviewModal } from './PdfPreviewModal';
import { QuickExtractionModal } from './QuickExtractionModal';
import { CodeLabPresetDrawer, ACADEMIC_PRESETS } from './CodeLabPresetDrawer';
import { MonacoEditorWrapper } from './MonacoEditorWrapper';
import { CodeLabControlDeck } from './CodeLabControlDeck';
import { ResetSessionModal } from './ResetSessionModal';
import { saveCodeLabSession } from '../services/indexedDbService';
import { PROVIDERS } from '../constants';
import type { UserCustomModels, ChatSession, Message, IdeConfig, CodeStyleConfig } from '../types';
import { DEFAULT_IDE_CONFIG, DEFAULT_CODE_STYLE } from '../types';

interface GeneratedFile {
  fileName: string;
  language: string;
  codeContent: string;
}

interface CodeDungeonMessageBubbleProps {
  msg: any;
  isLastUserMessage?: boolean;
  isLastAssistantMessage?: boolean;
  onRetry?: () => void;
  onEditUserMessage?: (oldText: string) => void;
  onBranch?: (msg: Message) => void;
  onPin?: (msg: Message) => void;
  isPinned?: boolean;
  selectedModel?: string;
  extractCodeBlocksFromMessage: (content: string) => GeneratedFile[];
  handleOpenInIde: (file: GeneratedFile) => void;
}

const CodeDungeonMessageBubble: React.FC<CodeDungeonMessageBubbleProps> = ({
  msg,
  isLastUserMessage,
  isLastAssistantMessage,
  onRetry,
  onEditUserMessage,
  onBranch,
  onPin,
  isPinned,
  selectedModel,
  extractCodeBlocksFromMessage,
  handleOpenInIde
}) => {
  const isUser = msg.role === 'user';
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [exportingImage, setExportingImage] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(msg.content || '');
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftContent(msg.content || '');
  }, [msg.content]);

  const generateExportFilename = (extension: 'png' | 'pdf') => {
    const textOnly = (msg.content || '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/[#*`$\-\\_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const rawTopic = textOnly.slice(0, 25).trim();
    const cleanTopic = rawTopic.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_') || 'CodeLab';
    const rawModel = msg.modelUsed || selectedModel || 'AI';
    const modelSlug = (rawModel.includes('/') ? rawModel.split('/')[1] : rawModel).replace(/[^a-zA-Z0-9.-]/g, '');
    const dateStr = new Date().toISOString().split('T')[0];
    return `ProfJoe_Lab_${cleanTopic}_${modelSlug}_${dateStr}.${extension}`;
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

  const handleDirectPrint = async () => {
    await printBubbleToPdf(msg.content, msg.modelUsed || selectedModel, generateExportFilename('pdf').replace(/\.pdf$/, ''));
  };

  const handleStartEdit = () => {
    setIsInlineEditing(true);
    setDraftContent(msg.content || '');
    setTimeout(() => {
      if (editTextareaRef.current) {
        editTextareaRef.current.focus();
        editTextareaRef.current.style.height = 'auto';
        editTextareaRef.current.style.height = `${Math.min(editTextareaRef.current.scrollHeight, 200)}px`;
      }
    }, 50);
  };

  const handleCancelEdit = () => {
    setIsInlineEditing(false);
    setDraftContent(msg.content || '');
  };

  const handleSaveEdit = () => {
    if (!draftContent.trim()) return;
    setIsInlineEditing(false);
    if (onEditUserMessage) {
      onEditUserMessage(draftContent.trim());
    }
  };

  const handleCopyMessage = () => {
    if (!msg.content) return;
    navigator.clipboard.writeText(msg.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    let isMounted = true;
    if (isUser) {
      setRenderedHtml('');
      return;
    }

    async function processMessage() {
      const rawContent = msg.content || '';
      const diagrams = extractDiagrams(rawContent);
      const diagramMap = new Map<string, string>();

      for (let index = 0; index < diagrams.length; index++) {
        const diag = diagrams[index];
        const token = `KROKIDIAGRAMTOKEN${index}ENDTOKEN`;
        const svgHtml = await fetchKrokiSvg(diag.type, diag.source);
        const ctaNoteHtml = `<div class="codelab-kroki-cta-note" style="display: block; width: 100%; margin-top: 6px; font-size: 0.72rem; color: #06b6d4; opacity: 0.9; font-weight: 600;">📊 Diagram generated via Kroki. Check this diagram out in Diagram Studio for full editing.</div>`;
        diagramMap.set(token, `<div class="kroki-container" data-type="${diag.type}" style="display: flex; flex-direction: column; align-items: flex-start; gap: 6px; width: 100%; margin: 12px 0;"><div class="kroki-svg-wrapper" style="width: 100%; overflow-x: auto;">${svgHtml}</div>${ctaNoteHtml}</div>`);
      }

      let markdownToParse = rawContent;
      let tokenIndex = 0;
      diagrams.forEach(diag => {
        const token = `KROKIDIAGRAMTOKEN${tokenIndex++}ENDTOKEN`;
        markdownToParse = markdownToParse.replace(diag.fullMatch, token);
      });

      const parsedHtml = renderMarkdownWithMathAndDiagrams(markdownToParse, diagramMap);

      if (isMounted) {
        setRenderedHtml(parsedHtml);
      }
    }

    processMessage();

    return () => {
      isMounted = false;
    };
  }, [msg.content, isUser]);

  return (
    <div
      ref={bubbleRef}
      className={isUser ? 'user-bubble' : 'assistant-bubble'}
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '92%',
        padding: '12px 16px',
        borderRadius: '16px',
        fontSize: '0.84rem',
        lineHeight: 1.5,
        position: 'relative'
      }}
    >
      {/* Clean Header Bar: Role, Model Badge & Timestamp */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, opacity: 0.85 }}>
          <span>{isUser ? '👤 Student Prompt' : '🎓 Prof. Joe AI'}</span>
          {!isUser && msg.modelUsed && (
            <span style={{
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              color: '#38bdf8',
              fontSize: '0.65rem',
              padding: '1px 6px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)'
            }}>
              {msg.modelUsed.includes('/') ? msg.modelUsed.split('/')[1] : msg.modelUsed}
            </span>
          )}
        </div>
        {msg.timestamp && (
          <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {isUser ? (
        isInlineEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', minWidth: '240px' }}>
            <textarea
              ref={editTextareaRef}
              value={draftContent}
              onChange={(e) => {
                setDraftContent(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveEdit();
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(6, 182, 212, 0.5)',
                borderRadius: '8px',
                padding: '6px 8px',
                color: '#f8fafc',
                fontSize: '0.84rem',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                minHeight: '40px'
              }}
              placeholder="Edit your lab prompt..."
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Cancel Edit (Esc)"
              >
                <X size={11} />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={!draftContent.trim()}
                className="extractor-btn-primary"
                style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Save and submit (Enter)"
              >
                <Send size={11} />
                <span>Save & Submit</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
        )
      ) : (
        <div
          className="formatted-content markdown-body"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      )}

      {!isUser && (() => {
        const blocks = extractCodeBlocksFromMessage(msg.content);
        if (blocks.length === 0) return null;
        return (
          <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {blocks.map((block, bIdx) => (
              <button
                key={bIdx}
                type="button"
                onClick={() => handleOpenInIde(block)}
                className="code-lab-view-in-ide-btn"
                title="Open snippet in IDE viewer"
              >
                <Eye size={13} />
                <span>View {block.fileName} in IDE</span>
              </button>
            ))}
          </div>
        );
      })()}

      {/* Dedicated Bottom Action Dock */}
      {!isInlineEditing && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          gap: '5px',
          flexWrap: 'wrap',
          marginTop: '10px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            type="button"
            onClick={handleCopyMessage}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: isCopied ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              border: isCopied ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: isCopied ? '#38bdf8' : '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title={isCopied ? 'Copied to clipboard!' : 'Copy message text'}
          >
            {isCopied ? <Check size={12} className="text-cyan-400" /> : <Copy size={12} />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* PNG Image Export */}
          <button
            type="button"
            onClick={handleExportImage}
            disabled={exportingImage}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Export Bubble to PNG Image"
          >
            <Download size={12} />
            <span>{exportingImage ? '...' : 'PNG'}</span>
          </button>

          {/* PDF Preview Modal */}
          <button
            type="button"
            onClick={handleExportPdf}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Preview Styled PDF Document"
          >
            <Eye size={12} />
            <span>PDF</span>
          </button>

          {/* Direct System Print */}
          <button
            type="button"
            onClick={handleDirectPrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Direct System Print Preview"
          >
            <Printer size={12} />
            <span>Print</span>
          </button>

          {/* Pin to Exam Cheat Sheet & Lab Notebook */}
          {!isUser && onPin && (
            <button
              type="button"
              onClick={() => onPin(msg)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: isPinned ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                border: isPinned ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: isPinned ? '#fbbf24' : '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title={isPinned ? "Pinned in Exam Cheat Sheet & Lab Notebook" : "Pin to Exam Cheat Sheet & Lab Notebook"}
            >
              <Pin size={12} style={{ color: isPinned ? '#fbbf24' : '#94a3b8' }} className={isPinned ? 'fill-amber-400 text-amber-400' : ''} />
              <span>{isPinned ? 'Pinned ⭐' : 'Pin'}</span>
            </button>
          )}

          {/* Branch Conversation */}
          {!isUser && onBranch && (
            <button
              type="button"
              onClick={() => onBranch(msg)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(52, 211, 153, 0.15)',
                border: '1px solid rgba(52, 211, 153, 0.35)',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#34d399',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Branch / Fork Code Lab session from this turn"
            >
              <GitBranch size={12} />
              <span>Branch</span>
            </button>
          )}

          {isUser && isLastUserMessage && onEditUserMessage && (
            <button
              type="button"
              onClick={handleStartEdit}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Edit Prompt in Bubble"
            >
              <Edit3 size={12} />
              <span>Edit</span>
            </button>
          )}

          {!isUser && isLastAssistantMessage && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#38bdf8',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Regenerate / Retry Answer"
            >
              <RotateCcw size={12} />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Custom Animated PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        content={msg.content}
        modelUsed={msg.modelUsed || selectedModel}
        docTitle={generateExportFilename('pdf').replace(/\.pdf$/, '')}
        renderedHtml={renderedHtml}
      />
    </div>
  );
};

interface PracticalCodeLabViewProps {
  onBackToHub?: () => void;
  onSendMessage: (prompt: string, webSearch: boolean, mode: string, systemPrompt?: string) => void;
  onRetry?: () => void;
  onEditUserMessage?: (oldText: string) => void;
  onBranchMessage?: (msg: Message) => void;
  onPinMessage?: (msg: Message) => void;
  pinnedMessageIds?: Set<string>;
  onOpenCheatSheet?: () => void;
  pinnedCount?: number;
  isLoading: boolean;
  messages: any[];
  selectedProvider?: string;
  selectedModel: string;
  onProviderChange?: (provider: string) => void;
  onModelChange?: (model: string) => void;
  customModels?: UserCustomModels;
  activePresetId?: string;
  onSelectPresetId?: (presetId: string) => void;
  onResetPresetChat?: (presetId: string) => void;
  presetSessions?: ChatSession[];
  activeSessionId?: string;
  onSelectSession?: (sessionId: string) => void;
  onNewSession?: () => void;
  onDeleteSession?: (sessionId: string) => void;
  isExternalDrawerOpen?: boolean;
  onCloseExternalDrawer?: () => void;
}

interface GeneratedFile {
  fileName: string;
  language: string;
  codeContent: string;
}

export function PracticalCodeLabView({
  onBackToHub: _onBackToHub,
  onSendMessage,
  onRetry,
  onEditUserMessage,
  onBranchMessage,
  onPinMessage,
  pinnedMessageIds,
  onOpenCheatSheet,
  pinnedCount = 0,
  isLoading,
  messages,
  selectedProvider = 'Ollama Cloud',
  selectedModel,
  onProviderChange,
  onModelChange,
  customModels,
  activePresetId = 'stat_inference_lab',
  onSelectPresetId,
  onResetPresetChat,
  presetSessions = [],
  activeSessionId = '',
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isExternalDrawerOpen,
  onCloseExternalDrawer
}: PracticalCodeLabViewProps) {
  const [inputPrompt, setInputPrompt] = useState('');
  const activePreset = ACADEMIC_PRESETS.find(p => p.id === activePresetId) || ACADEMIC_PRESETS[0];
  const [isPresetDrawerOpen, setIsPresetDrawerOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  const effectiveDrawerOpen = isExternalDrawerOpen ?? isHistoryDrawerOpen;
  const handleCloseDrawer = () => {
    setIsHistoryDrawerOpen(false);
    if (onCloseExternalDrawer) onCloseExternalDrawer();
  };
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isQuickExtractionOpen, setIsQuickExtractionOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [ideConfig, setIdeConfig] = useState<IdeConfig>(() => {
    try {
      const saved = localStorage.getItem('chatterbot_ide_settings');
      if (saved) return { ...DEFAULT_IDE_CONFIG, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_IDE_CONFIG;
  });

  const [codeStyle, setCodeStyle] = useState<CodeStyleConfig>(() => {
    try {
      const saved = localStorage.getItem('chatterbot_code_style');
      if (saved) return { ...DEFAULT_CODE_STYLE, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_CODE_STYLE;
  });

  const [editorMode, setEditorMode] = useState<'fast' | 'monaco'>(() => {
    try {
      const saved = localStorage.getItem('chatterbot_ide_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.editorEngine) return parsed.editorEngine;
      }
    } catch {}
    return 'fast';
  });

  useEffect(() => {
    const handleIdeSettingsUpdate = () => {
      try {
        const saved = localStorage.getItem('chatterbot_ide_settings');
        if (saved) {
          const parsed = { ...DEFAULT_IDE_CONFIG, ...JSON.parse(saved) };
          setIdeConfig(parsed);
          if (parsed.editorEngine) setEditorMode(parsed.editorEngine);
        }
      } catch {}
    };

    const handleCodeStyleUpdate = () => {
      try {
        const saved = localStorage.getItem('chatterbot_code_style');
        if (saved) setCodeStyle({ ...DEFAULT_CODE_STYLE, ...JSON.parse(saved) });
      } catch {}
    };

    window.addEventListener('chatterbot_ide_settings_updated', handleIdeSettingsUpdate);
    window.addEventListener('chatterbot_code_style_updated', handleCodeStyleUpdate);
    window.addEventListener('storage', handleIdeSettingsUpdate);
    return () => {
      window.removeEventListener('chatterbot_ide_settings_updated', handleIdeSettingsUpdate);
      window.removeEventListener('chatterbot_code_style_updated', handleCodeStyleUpdate);
      window.removeEventListener('storage', handleIdeSettingsUpdate);
    };
  }, []);

  const [isWebSearch, setIsWebSearch] = useState(false);
  const activeUser = localStorage.getItem('chatterbot_username') || 'guest';

  // Custom Dropdown Popups state (prevents Android native <select> white modal overlay)
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const providerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (providerRef.current && !providerRef.current.contains(e.target as Node)) {
        setIsProviderOpen(false);
      }
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) {
        setIsModelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCodeContentChange = (newCode: string | undefined) => {
    if (newCode === undefined || activeFileIndex < 0) return;
    setFiles(prev => {
      const next = [...prev];
      if (next[activeFileIndex]) {
        next[activeFileIndex] = {
          ...next[activeFileIndex],
          codeContent: newCode
        };
      }
      return next;
    });
  };

  // Available models for selected provider
  const currentProviderGroup = useMemo(() => {
    return PROVIDERS.find(p => p.id === selectedProvider || p.name === selectedProvider) || PROVIDERS[0];
  }, [selectedProvider]);

  const availableModels = useMemo(() => {
    const customList = customModels ? (customModels[selectedProvider] || customModels[currentProviderGroup.id] || customModels[currentProviderGroup.name]) : undefined;
    if (Array.isArray(customList) && customList.length > 0) {
      const enabledCustom = customList.filter(m => m.enabled).map(m => ({
        value: m.id,
        name: m.name
      }));
      if (enabledCustom.length > 0) return enabledCustom;
    }
    return currentProviderGroup.models;
  }, [selectedProvider, customModels, currentProviderGroup]);

  // Split Pane Resizing
  const [leftPaneWidthPercent, setLeftPaneWidthPercent] = useState(42);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabListRef = useRef<HTMLDivElement>(null);

  // Parsed Files & Tabs
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [mobileActiveTab, setMobileActiveTab] = useState<'chat' | 'code'>('chat');

  const handleScrollTabs = (direction: 'left' | 'right') => {
    if (tabListRef.current) {
      const scrollAmount = direction === 'left' ? -180 : 180;
      tabListRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Mouse move resizing handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth >= 20 && newWidth <= 75) {
        setLeftPaneWidthPercent(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const CODE_DUNGEON_BASE_SYSTEM_PROMPT = `
You are Prof. Joe AI operating inside Code Dungeon (Split-Screen IDE).
Follow these mandatory formatting rules for all responses:
1. CONCISE & DIRECT: Provide concise, high-impact technical explanations and clean code blocks. Do not write long conversational essays or filler text.
2. STRICT CODE BLOCK & FILE NAMING RULES:
   - EVERY code snippet, diagram, or dataset file MUST start with an explicit language tag (e.g. \`\`\`python, \`\`\`erd, \`\`\`plantuml, \`\`\`text).
   - EVERY code block header MUST include a filename hint following this exact pattern:
     \`\`\`[lang] filename: [model_name]_[dataset_name].[ext]
     Examples:
     - \`\`\`python filename: logistic_regression_iris.py
     - \`\`\`erd filename: logistic_regression_iris_architecture.erd
     - \`\`\`text filename: logistic_regression_iris_requirements.txt
   - NEVER output untagged \`\`\` code blocks.
3. DIAGRAM PREFERENCE HIERARCHY:
   - Primary: Use ERD (Entity-Relationship Diagrams in \`\`\`erd blocks) for database schemas, data pipelines, or architecture relations.
   - Fallback 1: Use PlantUML diagrams (\`\`\`plantuml).
   - Fallback 2: Use ASCII File Trees (\`\`\`text or \`\`\`tree).
   - STRICT RULE: Do NOT output mermaid diagrams.
4. LATEX MATHEMATICS: Format mathematical equations using standard LaTeX syntax ($...$ for inline, $$...$$ for block formulas).
`;

  // Helper for Smart Topic & Code-Aware File Naming
  const determineSmartFileName = (
    lang: string,
    headerHint: string,
    code: string,
    userPromptText: string = '',
    fileIndex: number = 0
  ): string => {
    let cleanHint = headerHint.trim();
    if (cleanHint && /^[a-zA-Z0-9_\-.]+\.[a-zA-Z0-9]+$/.test(cleanHint) && !cleanHint.includes(';') && !cleanHint.includes('(')) {
      return cleanHint;
    }

    const trimmedCode = code.trim();
    const firstLine = trimmedCode.split('\n')[0] || '';
    const commentMatch = firstLine.match(/^(?:#|\/\/|\/\*|<!--)\s*(?:filename:)?\s*([a-zA-Z0-9_\-.]+\.[a-zA-Z0-9]+)/i);
    if (commentMatch && commentMatch[1]) {
      return commentMatch[1];
    }

    if (lang === 'java') {
      const classMatch = trimmedCode.match(/(?:public\s+)?class\s+([A-Z][a-zA-Z0-9_]+)/);
      if (classMatch && classMatch[1]) {
        return `${classMatch[1]}.java`;
      }
    }

    if (lang === 'cpp' || lang === 'c') {
      const ext = lang === 'cpp' ? 'cpp' : 'c';
      const mainMatch = trimmedCode.match(/(?:void|int)\s+([a-zA-Z0-9_]+)\s*\(/i);
      if (mainMatch && mainMatch[1] && mainMatch[1] !== 'main') {
        return `${mainMatch[1]}.${ext}`;
      }
    }

    if (lang === 'python') {
      const defMatch = trimmedCode.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
      if (defMatch && defMatch[1] && defMatch[1] !== 'main') {
        return `${defMatch[1]}.py`;
      }
    }

    const promptLower = userPromptText.toLowerCase();
    let topicSlug = '';
    if (promptLower.includes('iris')) topicSlug = 'iris_classifier';
    else if (promptLower.includes('k-means') || promptLower.includes('kmeans')) topicSlug = 'kmeans_clustering';
    else if (promptLower.includes('decision tree')) topicSlug = 'decision_tree';
    else if (promptLower.includes('random forest')) topicSlug = 'random_forest';
    else if (promptLower.includes('logistic regression')) topicSlug = 'logistic_regression';
    else if (promptLower.includes('linear regression')) topicSlug = 'linear_regression';
    else if (promptLower.includes('knn') || promptLower.includes('nearest neighbor')) topicSlug = 'knn_classifier';
    else if (promptLower.includes('svm') || promptLower.includes('support vector')) topicSlug = 'svm_classifier';
    else if (promptLower.includes('binary search')) topicSlug = 'binary_search';
    else if (promptLower.includes('linked list')) topicSlug = 'linked_list';

    const extMap: Record<string, string> = {
      python: 'py', javascript: 'js', typescript: 'ts', html: 'html', css: 'css',
      cpp: 'cpp', c: 'c', java: 'java', sql: 'sql', json: 'json'
    };
    const ext = extMap[lang] || lang || 'txt';

    if (topicSlug) {
      return `${topicSlug}${fileIndex > 0 ? `_${fileIndex + 1}` : ''}.${ext}`;
    }

    const defaultNames: Record<string, string> = {
      python: 'script.py', javascript: 'script.js', typescript: 'app.ts',
      html: 'index.html', css: 'style.css', cpp: 'main.cpp', c: 'main.c', java: 'Main.java'
    };

    return defaultNames[lang] || `script_${fileIndex + 1}.${ext}`;
  };

  // Parse Code Blocks from AI Assistant messages
  useEffect(() => {
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    if (assistantMessages.length === 0) return;

    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    const userPromptText = lastUserMsg ? lastUserMsg.content : '';

    const latestMessage = assistantMessages[assistantMessages.length - 1].content || '';
    const codeBlockRegex = /```(\w+)?(?:\s+([^\n]+))?\n([\s\S]*?)```/g;
    const detectedFiles: GeneratedFile[] = [];
    let match;

    while ((match = codeBlockRegex.exec(latestMessage)) !== null) {
      let lang = (match[1] || 'text').toLowerCase();
      let hintName = (match[2] || '').trim();
      let code = match[3] || '';

      const smartName = determineSmartFileName(lang, hintName, code, userPromptText, detectedFiles.length);

      detectedFiles.push({
        fileName: smartName,
        language: lang,
        codeContent: code
      });
    }

    if (detectedFiles.length > 0) {
      setFiles(detectedFiles);
      setActiveFileIndex(0);
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      saveCodeLabSession(activeUser, activePresetId, {
        id: `codelab-session-${activePresetId}`,
        title: `${activePreset?.name || 'Code Lab'} Session`,
        provider: selectedProvider,
        model: selectedModel,
        messages: messages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        presetId: activePresetId
      });
    }
  }, [messages, activePresetId, selectedProvider, selectedModel, activeUser, activePreset]);

  const handleSend = () => {
    if (!inputPrompt.trim()) return;
    const combinedSystemPrompt = [
      CODE_DUNGEON_BASE_SYSTEM_PROMPT,
      activePreset ? activePreset.systemInstruction : ''
    ].filter(Boolean).join('\n\n');

    onSendMessage(
      inputPrompt, 
      isWebSearch, 
      'general', 
      combinedSystemPrompt
    );
    setInputPrompt('');
  };

  const handleDownloadSingleFile = (file: GeneratedFile) => {
    const blob = new Blob([file.codeContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    if (files.length === 0) return;
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    files.forEach(file => {
      zip.file(file.fileName, file.codeContent);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codelab_${activePresetId}_files.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCloseTab = (indexToClose: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles(prev => {
      const nextFiles = prev.filter((_, i) => i !== indexToClose);
      if (nextFiles.length === 0) {
        setActiveFileIndex(0);
      } else if (activeFileIndex >= nextFiles.length) {
        setActiveFileIndex(nextFiles.length - 1);
      } else if (activeFileIndex === indexToClose) {
        setActiveFileIndex(Math.max(0, indexToClose - 1));
      }
      return nextFiles;
    });
  };

  const handleOpenInIde = (file: GeneratedFile) => {
    setMobileActiveTab('code');
    setFiles(prev => {
      const existingIdx = prev.findIndex(f => f.fileName === file.fileName || f.codeContent.trim() === file.codeContent.trim());
      if (existingIdx >= 0) {
        setActiveFileIndex(existingIdx);
        return prev;
      } else {
        const nextFiles = [...prev, file];
        setActiveFileIndex(nextFiles.length - 1);
        return nextFiles;
      }
    });
  };

  const extractCodeBlocksFromMessage = (content: string): GeneratedFile[] => {
    const codeBlockRegex = /```(\w+)?(?:\s+([^\n]+))?\n([\s\S]*?)```/g;
    const blocks: GeneratedFile[] = [];
    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      let lang = (match[1] || 'text').toLowerCase();
      let hintName = (match[2] || '').trim();
      let code = match[3] || '';
      const smartName = determineSmartFileName(lang, hintName, code, '', blocks.length);
      blocks.push({ fileName: smartName, language: lang, codeContent: code });
    }
    return blocks;
  };

  const activeFile = files[activeFileIndex] || null;

  const lastUserMsgIndex = messages.map(m => m.role).lastIndexOf('user');
  const lastAssistantMsgIndex = messages.map(m => m.role).lastIndexOf('assistant');

  return (
    <div className="code-lab-view-container" data-code-theme={codeStyle.codeTheme}>
      {/* Header Bar */}
      <div className="code-lab-header">
        <div className="code-lab-header-left" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Code Dungeon 🏰</span>
            <span className="extractor-studio-tag">SPLIT-SCREEN IDE</span>
          </h1>

          <button
            type="button"
            onClick={() => setIsPresetDrawerOpen(true)}
            className="extractor-btn-primary codelab-mobile-preset-btn"
            style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: '10px' }}
            title={activePreset ? 'Change Lab Preset' : 'Select Lab Preset'}
          >
            <Sliders size={13} />
            <span className="codelab-preset-btn-text">{activePreset ? 'Change Preset' : 'Select Preset'}</span>
          </button>
        </div>

        {/* Active Preset & Model Controls */}
        <div className="code-lab-header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="codelab-dropdowns-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Provider Custom Dropdown */}
            <div className="relative inline-block provider-picker-wrapper" ref={providerRef} style={{ position: 'relative', flex: 1 }}>
              <button
                type="button"
                onClick={() => {
                  setIsProviderOpen(!isProviderOpen);
                  setIsModelOpen(false);
                }}
                className="custom-dropdown-pill"
                style={{ fontSize: '0.76rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                title="Select AI Provider"
              >
                <span className="truncate">{currentProviderGroup.name}</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${isProviderOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProviderOpen && (
                <div className="custom-dropdown-menu paper-menu provider-menu" style={{ position: 'absolute', top: '100%', zIndex: 9999999 }}>
                  <div className="dropdown-header">AI Providers</div>
                  {PROVIDERS.map(p => {
                    const isSelected = p.id === selectedProvider || p.name === selectedProvider;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onProviderChange && onProviderChange(p.id);
                          const pCustom = customModels ? (customModels[p.id] || customModels[p.name]) : undefined;
                          const enabledCustom = Array.isArray(pCustom) ? pCustom.filter(m => m.enabled) : [];
                          if (enabledCustom.length > 0) {
                            onModelChange && onModelChange(enabledCustom[0].id);
                          } else if (p.models.length > 0) {
                            onModelChange && onModelChange(p.models[0].value);
                          }
                          setIsProviderOpen(false);
                        }}
                        className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                      >
                        <span>{p.name}</span>
                        {isSelected && <Check size={13} className="text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Model Custom Dropdown */}
            <div className="relative inline-block model-picker-wrapper" ref={modelRef} style={{ position: 'relative', flex: 1 }}>
              <button
                type="button"
                onClick={() => {
                  setIsModelOpen(!isModelOpen);
                  setIsProviderOpen(false);
                }}
                className="custom-dropdown-pill"
                style={{ fontSize: '0.76rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                title="Select AI Model"
              >
                <span className="truncate">
                  {availableModels.find(m => m.value === selectedModel)?.name || selectedModel}
                </span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${isModelOpen ? 'rotate-180' : ''}`} />
              </button>

              {isModelOpen && (
                <div className="custom-dropdown-menu paper-menu model-menu" style={{ position: 'absolute', top: '100%', zIndex: 9999999 }}>
                  <div className="dropdown-header">AI Models</div>
                  {availableModels.map(m => {
                    const isSelected = m.value === selectedModel;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => {
                          onModelChange && onModelChange(m.value);
                          setIsModelOpen(false);
                        }}
                        className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                      >
                        <span>{m.name}</span>
                        {isSelected && <Check size={13} className="text-purple-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="codelab-controls-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activePreset && (
              <div className="codelab-preset-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '16px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.4)', color: '#06b6d4', fontSize: '0.74rem', fontWeight: 700 }}>
                <Sparkles size={13} />
                <span className="codelab-preset-badge-text">{activePreset.name}</span>
              </div>
            )}

            {/* Editor Mode Switcher Pill */}
            <div className="codelab-editor-mode-toggle" style={{ display: 'flex', alignItems: 'center', borderRadius: '20px', padding: '2px' }}>
              <button
                type="button"
                onClick={() => setEditorMode('fast')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '4px 8px', borderRadius: '16px', border: 'none',
                  background: editorMode === 'fast' ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(168, 85, 247, 0.25))' : 'transparent',
                  color: editorMode === 'fast' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer'
                }}
                title="Fast Preview Mode (Instant Load)"
              >
                <Zap size={12} />
                <span>⚡ Fast</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('monaco')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '4px 8px', borderRadius: '16px', border: 'none',
                  background: editorMode === 'monaco' ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(168, 85, 247, 0.25))' : 'transparent',
                  color: editorMode === 'monaco' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer'
                }}
                title="Full Interactive VS Code Monaco Editor"
              >
                <Code size={12} />
                <span>💻 Full IDE</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsPresetDrawerOpen(true)}
              className="extractor-btn-primary codelab-desktop-preset-btn"
              style={{ fontSize: '0.78rem', padding: '6px 14px' }}
            >
              <Sliders size={14} />
              <span>{activePreset ? 'Change Lab Preset' : 'Select Lab Preset'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Tabs (Only visible on screens <= 768px) */}
      <div className="codelab-mobile-tab-nav">
        <button
          type="button"
          onClick={() => setMobileActiveTab('chat')}
          className={`codelab-mobile-tab-btn ${mobileActiveTab === 'chat' ? 'active' : ''}`}
        >
          <MessageSquare size={15} />
          <span>Chat & Prompts</span>
          {messages.length > 0 && <span className="codelab-tab-badge">{messages.length}</span>}
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveTab('code')}
          className={`codelab-mobile-tab-btn ${mobileActiveTab === 'code' ? 'active' : ''}`}
        >
          <Code size={15} />
          <span>Code & Workspace</span>
          {files.length > 0 && <span className="codelab-tab-badge accent">{files.length}</span>}
        </button>
      </div>

      {/* Split Pane */}
      <div ref={containerRef} className="code-lab-split-pane">
        {/* Left Panel: Chat & Prompt OCR */}
        <div className={`code-lab-chat-panel ${mobileActiveTab === 'chat' ? 'mobile-active' : 'mobile-hidden'}`} style={{ width: `${leftPaneWidthPercent}%` }}>
              {/* Chat Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {messages.length === 0 ? (
                  <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', maxWidth: '340px' }}>
                    <Code size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Practical Code & ML Lab Ready</h3>
                    <p style={{ fontSize: '0.78rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      Ask Prof. Joe AI to write lab code, train ML models, process paper dataset tables, or generate multi-file web apps.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <CodeDungeonMessageBubble
                      key={idx}
                      msg={msg}
                      isLastUserMessage={idx === lastUserMsgIndex}
                      isLastAssistantMessage={idx === lastAssistantMsgIndex}
                      onRetry={onRetry}
                      onEditUserMessage={onEditUserMessage}
                      onBranch={onBranchMessage}
                      onPin={onPinMessage}
                      isPinned={pinnedMessageIds?.has(msg.id)}
                      selectedModel={selectedModel}
                      extractCodeBlocksFromMessage={extractCodeBlocksFromMessage}
                      handleOpenInIde={handleOpenInIde}
                    />
                  ))
                )}
              </div>

          {/* Prompt Input Box with Quick Extractor OCR */}
          <div className="codelab-bottom-input-bar" style={{ padding: '14px' }}>
            <div className="codelab-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '14px', padding: '8px 12px' }}>
              <button
                type="button"
                onClick={() => setIsQuickExtractionOpen(true)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', padding: '4px' }}
                title="Paper Dataset & Image OCR Extractor"
              >
                <Paperclip size={18} />
              </button>

              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={activePreset ? `Ask for ${activePreset.name} lab code...` : "Ask for lab code or dataset analysis..."}
                className="codelab-textarea"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '0.84rem', resize: 'none', height: '40px', fontFamily: 'inherit' }}
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={isLoading || !inputPrompt.trim()}
                className="extractor-btn-primary"
                style={{ padding: '8px 14px', borderRadius: '10px' }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Resizable Handle Divider */}
        <div 
          className="code-lab-resize-handle desktop-only"
          onMouseDown={() => setIsResizing(true)}
          title="Drag to resize panels"
        />

        {/* Right Panel: Resizable Code Viewer IDE */}
        <div className={`code-lab-ide-panel ${mobileActiveTab === 'code' ? 'mobile-active' : 'mobile-hidden'}`}>
          {/* File Tab Bar */}
          <div className="code-lab-tab-bar">
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
              <div ref={tabListRef} className="code-lab-tabs-list">
                {files.length === 0 ? (
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>No files generated yet</span>
                ) : (
                  files.map((file, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveFileIndex(idx)}
                      className={`code-lab-tab-item ${idx === activeFileIndex ? 'active' : ''}`}
                    >
                      <FileCode size={13} />
                      <span>{file.fileName}</span>
                      <span
                        onClick={(e) => handleCloseTab(idx, e)}
                        className="code-lab-tab-close-btn"
                        title="Close tab"
                      >
                        <X size={12} />
                      </span>
                    </button>
                  ))
                )}
              </div>
              {files.length > 2 && (
                <div style={{ display: 'flex', gap: '2px', marginLeft: '6px', zIndex: 3 }}>
                  <button
                    type="button"
                    onClick={() => handleScrollTabs('left')}
                    className="code-lab-scroll-btn"
                    title="Scroll tabs left"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScrollTabs('right')}
                    className="code-lab-scroll-btn"
                    title="Scroll tabs right"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Action Tools */}
            {activeFile && (
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleCopyCode(activeFile.codeContent)}
                  className="btn-theme-secondary"
                  style={{ fontSize: '0.74rem', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  title={isCopied ? 'Copied to clipboard' : 'Copy code to clipboard'}
                >
                  {isCopied ? <Check size={13} style={{ color: 'var(--accent-cyan)' }} /> : <Copy size={13} />}
                  <span className="codelab-action-btn-text">{isCopied ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSingleFile(activeFile)}
                  className="btn-theme-primary"
                  style={{ fontSize: '0.74rem', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  title={`Download ${activeFile.fileName}`}
                >
                  <Download size={13} />
                  <span className="codelab-action-btn-text">Download</span>
                </button>

                {files.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    className="btn-theme-secondary"
                    style={{ fontSize: '0.74rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    title="Download all open code files as ZIP archive"
                  >
                    <Package size={13} />
                    <span>ZIP</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Code Viewer Area */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {editorMode === 'monaco' && activeFile ? (
              <MonacoEditorWrapper
                code={activeFile.codeContent}
                language={activeFile.language}
                onChange={handleCodeContentChange}
                ideConfig={ideConfig}
              />
            ) : (
              <pre
                className="code-lab-editor-area"
                data-code-theme={codeStyle.codeTheme}
                style={{
                  height: '100%',
                  margin: 0,
                  fontSize: `${ideConfig.fontSize}px`,
                  tabSize: ideConfig.tabSize,
                  whiteSpace: ideConfig.wordWrap === 'on' ? 'pre-wrap' : 'pre'
                }}
              >
                {activeFile ? activeFile.codeContent : '// Generated lab code will stream live into this IDE viewer...'}
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* Side Drawer Preset Selector */}
      <CodeLabPresetDrawer
        isOpen={isPresetDrawerOpen}
        onClose={() => setIsPresetDrawerOpen(false)}
        activePresetId={activePreset?.id || 'stat_inference_lab'}
        onSelectPreset={(preset) => {
          if (preset && onSelectPresetId) {
            onSelectPresetId(preset.id);
          }
        }}
        onResetPresetChat={onResetPresetChat}
      />

      {/* In-Chat Dataset & Paper OCR Extractor */}
      <QuickExtractionModal
        isOpen={isQuickExtractionOpen}
        onClose={() => setIsQuickExtractionOpen(false)}
        onSendToChat={(extractedText: string, fileName: string) => {
          setInputPrompt(prev => `${prev}\n\n[Lab Paper Dataset: ${fileName}]\n${extractedText}`);
        }}
      />

      {/* Native Code Lab Control Deck Sidebar */}
      <CodeLabControlDeck
        isOpen={effectiveDrawerOpen}
        onClose={handleCloseDrawer}
        presetName={activePreset?.name || 'Code Lab'}
        presetId={activePresetId}
        selectedModel={selectedModel}
        sessions={presetSessions}
        activeSessionId={activeSessionId}
        onSelectSession={(sessionId) => {
          if (onSelectSession) onSelectSession(sessionId);
          handleCloseDrawer();
        }}
        onNewSession={() => {
          if (onNewSession) onNewSession();
          handleCloseDrawer();
        }}
        onDeleteSession={(sessionId) => {
          if (onDeleteSession) onDeleteSession(sessionId);
        }}
        onResetSession={() => {
          setIsResetModalOpen(true);
          handleCloseDrawer();
        }}
        webSearch={isWebSearch}
        onToggleWebSearch={() => setIsWebSearch(prev => !prev)}
        onOpenCheatSheet={onOpenCheatSheet}
        pinnedCount={pinnedCount}
      />

      {/* Reset Session Warning Confirmation Modal */}
      <ResetSessionModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={() => {
          if (onResetPresetChat && activePresetId) {
            onResetPresetChat(activePresetId);
          }
        }}
        presetName={activePreset?.name || 'Code Lab'}
      />
    </div>
  );
}
