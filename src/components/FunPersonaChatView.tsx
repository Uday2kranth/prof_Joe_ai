import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Send, 
  Paperclip, 
  ChevronDown, 
  ChevronUp,
  Check, 
  Plus, 
  Trash2, 
  Clock, 
  X, 
  Globe,
  Eye, 
  Printer, 
  BarChart2, 
  RotateCcw, 
  Zap, 
  Search, 
  FileCode, 
  FileText,
  MessageSquare,
  BookOpen,
  List,
  ListFilter,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useTypewriterPlaceholder } from '../hooks/useTypewriterPlaceholder';
import type { Message, ChatSession, UserCustomModels, CodeStyleConfig } from '../types';
import { DEFAULT_CODE_STYLE } from '../types';
import { MessageItem } from './MessageItem';
import { PROVIDERS, PERSONAS } from '../constants';
import { PdfPreviewModal } from './PdfPreviewModal';
import { QuickActionsPopover, FilePreviewModal, type AttachedFileDetails } from './QuickActionsPopover';
import { QuickExtractionModal } from './QuickExtractionModal';
import { printSessionToPdf } from '../services/printPdfService';
import { TextSelectionToolbar } from './TextSelectionToolbar';

interface FunPersonaChatViewProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (prompt: string, webSearch: boolean, mode: any, persona: string) => void;
  selectedProvider?: string;
  selectedModel: string;
  selectedPersona: string;
  isPersonaEnabled?: boolean;
  onTogglePersonaEnabled?: () => void;
  onProviderChange?: (provider: string) => void;
  onModelChange?: (model: string) => void;
  onPersonaChange: (persona: string) => void;
  onRetry?: () => void;
  onEditUserMessage?: (oldText: string) => void;
  onBranchMessage?: (message: Message) => void;
  onPinMessage?: (message: Message) => void;
  pinnedMessageIds?: Set<string>;
  personaSessions?: ChatSession[];
  activePersonaSessionId?: string;
  onSelectPersonaSession?: (id: string) => void;
  onNewPersonaSession?: () => void;
  onDeletePersonaSession?: (id: string) => void;
  customModels?: UserCustomModels;
  isDemoView?: boolean;
  isExternalDrawerOpen?: boolean;
  onCloseExternalDrawer?: () => void;
}

export const FunPersonaChatView: React.FC<FunPersonaChatViewProps> = ({
  messages,
  isLoading,
  onSendMessage,
  selectedProvider = 'OpenRouter',
  selectedModel,
  selectedPersona,
  isPersonaEnabled = true,
  onTogglePersonaEnabled,
  onProviderChange,
  onModelChange,
  onPersonaChange,
  onRetry,
  onEditUserMessage,
  onBranchMessage,
  onPinMessage,
  pinnedMessageIds = new Set(),
  personaSessions = [],
  activePersonaSessionId = '',
  onSelectPersonaSession,
  onNewPersonaSession,
  onDeletePersonaSession,
  customModels,
  isDemoView = false,
  isExternalDrawerOpen,
  onCloseExternalDrawer
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isPersistentWebSearch, setIsPersistentWebSearch] = useState(() => {
    return localStorage.getItem('chatterbot_persona_persistent_websearch') === 'true';
  });
  const [isSessionPreviewOpen, setIsSessionPreviewOpen] = useState(false);
  const [isOutlineDrawerOpen, setIsOutlineDrawerOpen] = useState(false);
  const [outlineSearchQuery, setOutlineSearchQuery] = useState('');

  const [codeStyle, setCodeStyle] = useState<CodeStyleConfig>(() => {
    try {
      const saved = localStorage.getItem('chatterbot_code_style');
      if (saved) return { ...DEFAULT_CODE_STYLE, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_CODE_STYLE;
  });

  useEffect(() => {
    const handleStyleUpdate = () => {
      try {
        const saved = localStorage.getItem('chatterbot_code_style');
        if (saved) setCodeStyle({ ...DEFAULT_CODE_STYLE, ...JSON.parse(saved) });
      } catch {}
    };
    window.addEventListener('chatterbot_code_style_updated', handleStyleUpdate);
    window.addEventListener('storage', handleStyleUpdate);
    return () => {
      window.removeEventListener('chatterbot_code_style_updated', handleStyleUpdate);
      window.removeEventListener('storage', handleStyleUpdate);
    };
  }, []);

  const personaContainerRef = useRef<HTMLDivElement>(null);

  const handleQuickAction = (actionType: 'explain' | 'math' | '2marks' | 'hinglish', selectedText: string) => {
    if (!selectedText.trim()) return;
    if (actionType === 'explain') {
      onSendMessage(`Please explain this specific excerpt simply in character:\n\n> "${selectedText}"`, false, 'auto', selectedPersona);
    } else if (actionType === 'math') {
      onSendMessage(`Provide the detailed step-by-step mathematical derivation for:\n\n> "${selectedText}"`, false, 'auto', selectedPersona);
    } else if (actionType === '2marks') {
      onSendMessage(`Turn this excerpt into a 2-mark question and answer:\n\n> "${selectedText}"`, false, '2marks', selectedPersona);
    } else if (actionType === 'hinglish') {
      onSendMessage(`Explain this in colloquial bilingual Hinglish:\n\n> "${selectedText}"`, false, 'general', selectedPersona);
    }
  };

  // Persona Character Panel & History Drawer State
  const [isPersonaDrawerOpen, setIsPersonaDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // 🎭 Top-Down Character Canopy Vault State
  const [isCanopyOpen, setIsCanopyOpen] = useState(false);
  const [canopyCategory, setCanopyCategory] = useState<string>('ALL');
  const [canopySearch, setCanopySearch] = useState<string>('');

  const canopyCategories = useMemo(() => {
    const cats = new Set<string>();
    // Main genres
    PERSONAS.forEach(p => {
      if (p.id !== 'default' && p.category && p.category !== 'Academic') {
        cats.add(p.category);
      }
    });
    // Specific shows / franchises
    PERSONAS.forEach(p => {
      if (p.id !== 'default' && p.franchise && p.franchise !== 'Academic') {
        cats.add(p.franchise);
      }
    });
    return ['ALL', ...Array.from(cats)];
  }, []);

  const filteredCanopyPersonas = useMemo(() => {
    return PERSONAS.filter(p => {
      // In specific franchise or category filters, omit default unless searched
      if (canopyCategory !== 'ALL' && p.id === 'default' && !canopySearch.trim()) return false;
      if (canopyCategory !== 'ALL' && p.category !== canopyCategory && p.franchise !== canopyCategory) return false;
      if (!canopySearch.trim()) return true;
      const q = canopySearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.catchphrase || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.franchise || '').toLowerCase().includes(q) ||
        (p.id === 'default' && ('standard default academic none prof joe'.includes(q)))
      );
    });
  }, [canopyCategory, canopySearch]);

  const effectiveDrawerOpen = isExternalDrawerOpen !== undefined ? isExternalDrawerOpen : isPersonaDrawerOpen;

  const handleCloseDrawer = () => {
    if (onCloseExternalDrawer) {
      onCloseExternalDrawer();
    }
    setIsPersonaDrawerOpen(false);
  };

  // Custom Glass Dropdown States
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileDetails[]>([]);
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<AttachedFileDetails | null>(null);
  const [isFilePreviewModalOpen, setIsFilePreviewModalOpen] = useState(false);
  const [isExtractorStudioOpen, setIsExtractorStudioOpen] = useState(false);

  const providerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 📑 Parse single-line numbered user questions for persona chat outline
  const userQueries = useMemo(() => {
    return messages
      .filter(m => m.role === 'user')
      .map((m, idx) => {
        const cleanText = m.content
          .replace(/```[\s\S]*?```/g, '')
          .replace(/\*\*|`|_|#/g, '')
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
          .join(' ')
          .slice(0, 85);
        return {
          id: m.id,
          index: idx + 1,
          badge: `Q${idx + 1}`,
          title: cleanText || `Question ${idx + 1}`,
          rawContent: m.content
        };
      });
  }, [messages]);

  const filteredUserQueries = useMemo(() => {
    if (!outlineSearchQuery.trim()) return userQueries;
    const qLower = outlineSearchQuery.toLowerCase();
    return userQueries.filter(q =>
      q.title.toLowerCase().includes(qLower) ||
      q.rawContent.toLowerCase().includes(qLower)
    );
  }, [userQueries, outlineSearchQuery]);

  const handleJumpToQuery = (msgId: string) => {
    setIsOutlineDrawerOpen(false);
    let targetEl = document.getElementById(`msg-${msgId}`);
    if (!targetEl) {
      const qObj = userQueries.find(q => q.id === msgId);
      if (qObj) {
        const clean = qObj.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        const allBubbles = Array.from(document.querySelectorAll('.message-row.user-row, .user-bubble, [id^="msg-"]'));
        targetEl = (allBubbles.find(el => (el.textContent || '').toLowerCase().replace(/[^a-z0-9]/g, '').includes(clean)) as HTMLElement) || null;
      }
    }
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetEl.classList.add('highlight-query');
      setTimeout(() => targetEl?.classList.remove('highlight-query'), 2000);
    }
  };

  const handleScrollToTop = () => {
    if (personaContainerRef.current) {
      personaContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScrollToBottom = () => {
    if (personaContainerRef.current) {
      personaContainerRef.current.scrollTo({
        top: personaContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
    textareaRef.current?.focus();
  };

  const currentProviderGroup = PROVIDERS.find(p => p.id === selectedProvider || p.name === selectedProvider) || PROVIDERS[0];
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

  const currentModelName = availableModels.find(m => m.value === selectedModel)?.name || selectedModel;
  const activePersonaObj = PERSONAS.find(p => p.id === selectedPersona) || PERSONAS[1];

  const handleTogglePersistentWebSearch = () => {
    setIsPersistentWebSearch(prev => {
      const next = !prev;
      localStorage.setItem('chatterbot_persona_persistent_websearch', String(next));
      return next;
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const personaPlaceholderPrompts = [
    `Ask ${activePersonaObj.name} anything...`,
    `Tell ${activePersonaObj.name} a joke or prompt...`,
    `Ask ${activePersonaObj.name} for exam tips...`,
    `Type your prompt for ${activePersonaObj.name}...`
  ];

  const animatedPersonaPlaceholder = useTypewriterPlaceholder(personaPlaceholderPrompts, 50, 25, 2000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;
    onSendMessage(inputPrompt, isPersistentWebSearch, 'general', selectedPersona);
    setInputPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
    if (e.key === 'Enter') {
      if (isMobile) return;
      if (!e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const sizeKb = Math.round(file.size / 1024);
    const isImage = file.type.startsWith('image/');

    if (isImage) {
      const url = URL.createObjectURL(file);
      const newFile: AttachedFileDetails = {
        name: file.name,
        sizeKb,
        type: 'image',
        previewUrl: url
      };
      setAttachedFiles(prev => [...prev, newFile]);
      setInputPrompt(prev => prev ? prev : `Hey ${activePersonaObj.name}, check out this image: ${file.name}`);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const newFile: AttachedFileDetails = {
          name: file.name,
          sizeKb,
          type: file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.py') ? 'code' : 'document',
          textContent: content
        };
        setAttachedFiles(prev => [...prev, newFile]);
        setInputPrompt(prev => `${prev}\n\n[Attached File: ${file.name}]\n${content}`);
      };
      reader.readAsText(file);
    }
  };

  const lastUserMsgIndex = messages.map(m => m.role).lastIndexOf('user');
  const lastAssistantMsgIndex = messages.map(m => m.role).lastIndexOf('assistant');

  const handleExportFullChatPdf = () => {
    handleDirectSessionPrint();
  };

  const handleDirectSessionPrint = async () => {
    const docTitle = `ProfJoe_FunPersona_${activePersonaObj.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    await printSessionToPdf(messages, docTitle);
  };

  // Real-time Persona Session Search Filter
  const filteredSessions = personaSessions.filter(s => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = (s.title || '').toLowerCase().includes(query);
    const messageMatch = s.messages.some(m => (m.content || '').toLowerCase().includes(query));
    return titleMatch || messageMatch;
  });

  return (
    <>
      {/* 📜 UNIFIED CONTROL DECK SIDEBAR DRAWER (MATCHING MAIN CHAT HISTORY DRAWER 100%) */}
      {effectiveDrawerOpen && (
        <div className="demo-drawer-overlay" onClick={handleCloseDrawer} style={{ zIndex: 999999 }}>
          <aside 
            className="demo-chat-history-drawer persona-selection-drawer" 
            onClick={(e) => e.stopPropagation()}
            style={{ width: '380px', maxWidth: '90vw' }}
          >
            {/* Drawer Header Bar */}
            <div className="demo-drawer-header">
              <div className="demo-drawer-title">
                <Clock size={16} style={{ color: 'var(--accent-cyan)' }} />
                <div>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Fun Persona Deck
                  </h3>
                  <div style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    {activePersonaObj.name}
                  </div>
                </div>
              </div>
              <button 
                type="button" 
                onClick={handleCloseDrawer} 
                className="demo-icon-btn"
                aria-label="Close Persona Drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* SECTION 1: BENTO COMMAND CONTROL DECK (4-COLUMN COMPACT GRID) */}
            {isDemoView && (
              <div className="demo-bento-deck">
                <div className="bento-deck-header">
                  <div className="flex items-center gap-1.5">
                    <Zap size={12} style={{ color: 'var(--accent-cyan)' }} />
                    <span>COMMAND CONTROLS</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="bento-clear-context-btn"
                    title="Clear messages in active persona session"
                  >
                    <RotateCcw size={11} />
                    <span>Clear Context</span>
                  </button>
                </div>

                <div className="bento-grid-container-4col">
                  {/* Tile 1: Persistent Web Search */}
                  <div 
                    className={`bento-card-tile-compact ${isPersistentWebSearch ? 'active-glow-cyan' : ''}`}
                    onClick={handleTogglePersistentWebSearch}
                    title="Toggle Persistent Internet Search across all messages"
                  >
                    <div className="bento-tile-icon-sm cyan">
                      <Globe size={13} />
                    </div>
                    <span className="bento-tile-label">Web Search</span>
                    <span className={`bento-mini-badge ${isPersistentWebSearch ? 'on' : 'off'}`}>
                      {isPersistentWebSearch ? 'ON' : 'OFF'}
                    </span>
                  </div>

                  {/* Tile 2: Session Monitor */}
                  <div className="bento-card-tile-compact" title={`Model: ${selectedModel}`}>
                    <div className="bento-tile-icon-sm purple">
                      <BarChart2 size={13} />
                    </div>
                    <span className="bento-tile-label">{selectedModel.slice(0, 10)}</span>
                    <span className="bento-mini-badge off">{messages.length} msgs</span>
                  </div>

                  {/* Tile 3: Preview Chat */}
                  <div 
                    className="bento-card-tile-compact"
                    onClick={() => {
                      handleExportFullChatPdf();
                      handleCloseDrawer();
                    }}
                    title="Open styled in-app Preview Modal with Save Image & Save PDF"
                  >
                    <div className="bento-tile-icon-sm blue">
                      <Eye size={13} />
                    </div>
                    <span className="bento-tile-label">Preview</span>
                  </div>

                  {/* Tile 4: Native Print / PDF */}
                  <div 
                    className="bento-card-tile-compact"
                    onClick={handleDirectSessionPrint}
                    title="Open System Native Chrome Print Preview Dialog to print or save PDF"
                  >
                    <div className="bento-tile-icon-sm emerald">
                      <Printer size={13} />
                    </div>
                    <span className="bento-tile-label">Print / PDF</span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: AI CHARACTER VAULT TRIGGER & UNIFIED STATUS ROW */}
            <div className="persona-drawer-section mb-3">
              <div className="section-label mb-1.5 flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
                <span>AI CHARACTER CONTROLS</span>
                <span className="text-[11px] font-bold" style={{ color: (isPersonaEnabled && selectedPersona !== 'default') ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                  {(isPersonaEnabled && selectedPersona !== 'default') ? '● Persona Active' : '○ Standard Mode'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* 🎭 Button to open the Top-Down Persona Vault */}
                <button
                  type="button"
                  onClick={() => {
                    handleCloseDrawer();
                    setIsCanopyOpen(true);
                  }}
                  className="drawer-open-vault-btn flex-1"
                  title="Open AI Persona Vault Deck"
                >
                  <span className="drawer-vault-icon">{activePersonaObj.icon}</span>
                  <div className="drawer-vault-text">
                    <span className="drawer-vault-name truncate">
                      {activePersonaObj.id === 'default'
                        ? 'Standard Academic AI'
                        : activePersonaObj.name.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').replace("Courage's Computer", 'C. Computer').replace('-Inspired', '').trim()}
                    </span>
                    <span className="drawer-vault-hint">Switch Character Vault ▾</span>
                  </div>
                  <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />
                </button>

                {/* Status Toggle Pill: ON / OFF */}
                {onTogglePersonaEnabled && (
                  <button
                    type="button"
                    onClick={onTogglePersonaEnabled}
                    className={`persona-status-toggle-pill flex-shrink-0 ${isPersonaEnabled && selectedPersona !== 'default' ? 'active' : 'inactive'}`}
                    title={isPersonaEnabled ? "Character flavor active (Tap to pause)" : "Character flavor paused (Tap to enable)"}
                  >
                    <span className="status-dot" />
                    <span>{isPersonaEnabled && selectedPersona !== 'default' ? 'ON' : 'OFF'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Clear Context Safety Confirmation */}
            {showClearConfirm && (
              <div className="demo-clear-confirm-banner" style={{ marginBottom: '10px' }}>
                <p>Clear all messages in active persona chat?</p>
                <div className="flex items-center gap-2 mt-2">
                  <button 
                    type="button" 
                    className="confirm-yes-btn"
                    onClick={() => {
                      if (onNewPersonaSession) onNewPersonaSession();
                      setShowClearConfirm(false);
                    }}
                  >
                    Yes, Clear
                  </button>
                  <button 
                    type="button" 
                    className="confirm-no-btn"
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 3: UNIFIED SEARCH & PERSONA CHAT HISTORY */}
            {isDemoView && (
              <div className="persona-drawer-section persona-history-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div className="section-label flex justify-between items-center mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  <span>PERSONA CHAT HISTORY</span>
                </div>

                {/* Unified Search & New Persona Chat Row */}
                <div className="demo-drawer-search-action-row">
                  <div className="demo-drawer-search-bar">
                    <Search size={14} style={{ color: 'var(--accent-cyan)' }} />
                    <input
                      type="text"
                      placeholder="Search past persona chats..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="demo-search-input codelab-search-input"
                    />
                    {searchQuery && (
                      <button 
                        type="button" 
                        onClick={() => setSearchQuery('')} 
                        className="clear-search-btn"
                        aria-label="Clear search"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {onNewPersonaSession && (
                    <button
                      type="button"
                      onClick={() => {
                        onNewPersonaSession();
                        handleCloseDrawer();
                      }}
                      className="drawer-new-chat-btn"
                      title="Start New Persona Chat"
                    >
                      <Plus size={15} />
                      <span>New Chat</span>
                    </button>
                  )}
                </div>

                <div className="demo-drawer-sessions-list" style={{ flex: 1, overflowY: 'auto' }}>
                  {filteredSessions.length === 0 ? (
                    <div className="demo-empty-sessions">
                      <Clock size={24} className="text-slate-500 mb-1" />
                      <p>{searchQuery ? 'No matching persona chats' : 'No persona chat history yet.'}</p>
                    </div>
                  ) : (
                    filteredSessions.map(session => {
                      const isActive = session.id === activePersonaSessionId;
                      const msgCount = session.messages?.length || 0;
                      return (
                        <div
                          key={session.id}
                          className={`codelab-session-item demo-session-item ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            onSelectPersonaSession?.(session.id);
                            handleCloseDrawer();
                          }}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '12px',
                            borderLeft: isActive ? '3px solid #f43f5e' : undefined,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '6px',
                            transition: 'all 0.18s ease'
                          }}
                        >
                          <div style={{ overflow: 'hidden', flex: 1, marginRight: '8px' }}>
                            <div className="demo-session-title" style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {session.title || 'Persona Chat'}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="demo-msg-badge">
                                {msgCount} {msgCount === 1 ? 'msg' : 'msgs'}
                              </span>
                              <span>•</span>
                              <span>{new Date(session.updatedAt || session.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {onDeletePersonaSession && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeletePersonaSession(session.id);
                              }}
                              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                              title="Delete session"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* 🎭 TOP-DOWN AI PERSONA VAULT / CHARACTER CANOPY DECK */}
      {isCanopyOpen && (
        <div className="persona-canopy-overlay" onClick={() => setIsCanopyOpen(false)}>
          <div 
            className="persona-canopy-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Canopy Header Bar */}
            <div className="persona-canopy-header">
              <div className="flex items-center gap-3">
                <span className="persona-canopy-icon">🎭</span>
                <div>
                  <h3 className="persona-canopy-title">
                    <span>AI Persona Vault</span>
                    <span style={{ fontSize: '0.7rem', color: '#f43f5e', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.14)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                      {PERSONAS.filter(p => p.id !== 'default').length} Characters
                    </span>
                  </h3>
                  <span className="persona-canopy-sub">Switch dynamic personality flavor for your discussions</span>
                </div>
              </div>

              <div className="persona-canopy-actions">
                {/* Expanded Live Search Input */}
                <div className="persona-canopy-search-bar">
                  <Search size={13} style={{ color: 'var(--accent-cyan)' }} />
                  <input
                    type="text"
                    placeholder="Search 25+ characters..."
                    value={canopySearch}
                    onChange={(e) => setCanopySearch(e.target.value)}
                    className="persona-canopy-search-input"
                  />
                  {canopySearch && (
                    <button type="button" onClick={() => setCanopySearch('')} className="clear-search-btn" aria-label="Clear search">
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Close Canopy Button */}
                <button
                  type="button"
                  onClick={() => setIsCanopyOpen(false)}
                  className="persona-canopy-close-btn"
                  title="Close Persona Vault"
                >
                  <ChevronUp size={15} />
                  <span>Close Vault</span>
                </button>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="persona-canopy-categories">
              {canopyCategories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCanopyCategory(cat)}
                  className={`persona-canopy-cat-pill ${canopyCategory === cat ? 'active' : ''}`}
                >
                  <span>{cat === 'ALL' ? '★ All Characters' : cat}</span>
                </button>
              ))}
            </div>

            {/* Panoramic Grid of Character Cards */}
            <div className="persona-canopy-grid">
              {filteredCanopyPersonas.map(p => {
                const isSelected = p.id === selectedPersona;
                return (
                  <div
                    key={p.id}
                    className={`persona-canopy-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (p.id === 'default' || p.id === selectedPersona) {
                        onPersonaChange('default');
                        setIsCanopyOpen(false);
                      } else {
                        onPersonaChange(p.id);
                        if (!isPersonaEnabled && onTogglePersonaEnabled) {
                          onTogglePersonaEnabled();
                        }
                        setIsCanopyOpen(false);
                      }
                    }}
                    title={isSelected ? `Active: Click to deselect (revert to Standard Mode)` : `Activate ${p.name}`}
                  >
                    <div className="persona-card-top">
                      <span className="persona-card-emoji">{p.icon}</span>
                      {isSelected && (
                        <span className="persona-card-active-tag">Active</span>
                      )}
                    </div>
                    <div className="persona-card-info">
                      <h4 className="persona-card-name">{p.name}</h4>
                      <p className="persona-card-desc">{p.description}</p>
                      {p.catchphrase && (
                        <span className="persona-card-quote">{p.catchphrase}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="chat-window-container fun-persona-lounge-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
        <div 
          className="chat-messages-container" 
          ref={personaContainerRef}
          data-code-theme={codeStyle.codeTheme}
          data-bubble-style={codeStyle.bubbleStyle || 'cyan_glass'}
          data-katex-scale={codeStyle.katexScale}
        >
          <TextSelectionToolbar containerRef={personaContainerRef} onQuickAction={handleQuickAction} />
          <div className="messages-inner">
            {messages.length === 0 ? (
              <div className="empty-chat-hero flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                <div 
                  onClick={() => setIsCanopyOpen(true)}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl cursor-pointer hover:scale-105 transition-transform"
                  style={{ background: 'var(--pill-bg)', border: '1.5px solid var(--border-color)', boxShadow: '0 8px 24px var(--cursor-glow)' }}
                  title="Click to open Persona Vault & switch character"
                >
                  {activePersonaObj.icon}
                </div>
                <div className="max-w-md space-y-2">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{activePersonaObj.name}</h2>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{activePersonaObj.description}</p>
                  <button
                    type="button"
                    onClick={() => setIsCanopyOpen(true)}
                    className="persona-hero-vault-btn"
                    title="Open AI Persona Vault"
                  >
                    <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />
                    <span>Open Persona Vault (6 Characters) ▾</span>
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <MessageItem
                  key={msg.id || index}
                  message={msg}
                  isLast={index === messages.length - 1}
                  isLastUserMessage={index === lastUserMsgIndex}
                  isLastAssistantMessage={index === lastAssistantMsgIndex}
                  onRetry={onRetry}
                  onEditUserMessage={onEditUserMessage}
                  onBranch={onBranchMessage}
                  onPin={onPinMessage}
                  isPinned={pinnedMessageIds.has(msg.id)}
                />
              ))
            )}

            {isLoading && (
              <div className="message-row assistant-row">
                <div className="avatar">
                  <img src="/joe-avatar.png" alt="Prof. Joe" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
                <div className="bubble-wrapper">
                  <div className="bubble-header">
                    <span className="role-label">{activePersonaObj.name}</span>
                    <span className="model-badge">{selectedModel}</span>
                  </div>
                  <div className="message-bubble assistant-bubble loading-bubble">
                    <div className="loading-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

      {/* Modern Floating Input Capsule Bar */}
      <div className="chat-input-sticky-footer p-4 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md" style={{ overflow: 'visible', position: 'relative', zIndex: 40 }}>
        <form onSubmit={handleSubmit} className="chat-form-modern kokonut-form" style={{ overflow: 'visible', position: 'relative' }}>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />

          <div style={{ position: 'relative', width: '100%' }}>
            {/* Attached Files Visual Cards Deck (ChatGPT & Gemini Style INSIDE Text Field Container) */}
            {attachedFiles.length > 0 && (
              <div className="attachment-cards-deck">
                {attachedFiles.map((file, idx) => (
                  <React.Fragment key={idx}>
                    {file.type === 'image' && file.previewUrl ? (
                      <div
                        onClick={() => {
                          setSelectedPreviewFile(file);
                          setIsFilePreviewModalOpen(true);
                        }}
                        className="attachment-card-image"
                        title={`Click to preview ${file.name}`}
                      >
                        <img src={file.previewUrl} alt={file.name} />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="attachment-card-remove-badge"
                          title="Remove Image"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setSelectedPreviewFile(file);
                          setIsFilePreviewModalOpen(true);
                        }}
                        className="attachment-card-doc"
                        title={`Click to preview ${file.name}`}
                      >
                        <div className={`doc-icon-box ${file.type === 'code' ? 'code-box' : 'pdf-box'}`}>
                          {file.type === 'code' ? <FileCode size={18} /> : <FileText size={18} />}
                        </div>
                        <div className="doc-info">
                          <span className="doc-title">{file.name}</span>
                          <span className="doc-subtitle">{file.type} • {file.sizeKb} KB</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="attachment-card-remove-badge"
                          title="Remove Document"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={animatedPersonaPlaceholder || `Ask ${activePersonaObj.name} (${selectedModel})...`}
              rows={3}
              style={{ 
                minHeight: '72px', 
                fontSize: '0.92rem', 
                padding: isDemoView ? '12px 56px 12px 16px' : '12px 16px',
                caretColor: 'var(--accent-cyan)',
                lineHeight: 1.5
              }}
              className="chat-textarea kokonut-textarea"
            />

            {/* Demo Mode Only: Floating Send Button Inside Input Box */}
            {isDemoView && (
              <button
                type="submit"
                disabled={isLoading || !inputPrompt.trim()}
                className="kokonut-send-btn attract-btn"
                style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  bottom: '12px', 
                  zIndex: 10,
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px'
                }}
                title="Send Message"
              >
                <Send size={16} />
              </button>
            )}
          </div>

          <div className="kokonut-bottom-row">
            <div className="kokonut-left-actions">
              {/* Row 1: Provider Picker + Model Picker */}
              <div className="kokonut-pickers-row">
                {onProviderChange && onModelChange && (
                  <>
                    <div className="relative inline-block provider-picker-wrapper" ref={providerRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProviderOpen(!isProviderOpen);
                          setIsModelOpen(false);
                        }}
                        className="custom-dropdown-pill"
                        title="Select AI Provider"
                      >
                        <span className="picker-icon">⚡</span>
                        <span className="truncate">{currentProviderGroup.name}</span>
                        <ChevronDown size={13} className={`transition-transform duration-200 ${isProviderOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isProviderOpen && (
                        <div className="custom-dropdown-menu bottom-upward-menu provider-menu">
                          <div className="dropdown-header">AI Providers</div>
                          {PROVIDERS.map(p => {
                            const isSelected = p.id === selectedProvider;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  onProviderChange(p.id);
                                  const pCustom = customModels ? (customModels[p.id] || customModels[p.name]) : undefined;
                                  const enabledCustom = Array.isArray(pCustom) ? pCustom.filter(m => m.enabled) : [];
                                  if (enabledCustom.length > 0) {
                                    onModelChange(enabledCustom[0].id);
                                  } else if (p.models.length > 0) {
                                    onModelChange(p.models[0].value);
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

                    <div className="relative inline-block model-picker-wrapper" ref={modelRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsModelOpen(!isModelOpen);
                          setIsProviderOpen(false);
                        }}
                        className="custom-dropdown-pill"
                        title="Select AI Model"
                      >
                        <span className="picker-icon">🤖</span>
                        <span className="truncate">
                          {currentModelName}
                        </span>
                        <ChevronDown size={13} className={`transition-transform duration-200 ${isModelOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isModelOpen && (
                        <div className="custom-dropdown-menu bottom-upward-menu model-menu">
                          <div className="dropdown-header">{currentProviderGroup.name} Models</div>
                          {availableModels.map(m => {
                            const isSelected = m.value === selectedModel;
                            return (
                              <button
                                key={m.value}
                                type="button"
                                onClick={() => {
                                  onModelChange(m.value);
                                  setIsModelOpen(false);
                                }}
                                className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                              >
                                <span>{m.name}</span>
                                {isSelected && <Check size={13} className="text-cyan-400" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 🎭 Persona Vault Trigger Pill */}
                    <button
                      type="button"
                      onClick={() => setIsCanopyOpen(!isCanopyOpen)}
                      className="custom-dropdown-pill persona-vault-trigger-btn"
                      title="Open AI Persona Vault Deck"
                      style={{
                        background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.16) 0%, rgba(168, 85, 247, 0.16) 100%)',
                        borderColor: 'rgba(244, 63, 94, 0.45)',
                        color: '#fda4af',
                        fontWeight: 700
                      }}
                    >
                      <span className="picker-icon">{activePersonaObj.icon}</span>
                      <span className="truncate">{activePersonaObj.name.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').replace("Courage's Computer", 'C. Computer').replace('-Inspired', '').trim()}</span>
                      <ChevronDown size={13} className={`transition-transform duration-200 ${isCanopyOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userQueries.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsOutlineDrawerOpen(true)}
                        className="input-dock-outline-btn"
                        title={`Open Questions Outline (${userQueries.length} Questions)`}
                      >
                        <ListFilter size={13} />
                        <span>Outline ({userQueries.length})</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Row 2: Action Tools */}
              <div className="kokonut-actions-row">
                <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                    className="kokonut-action-btn file-attach-btn"
                    title="Open Quick Actions & Attachment Menu"
                  >
                    <Paperclip size={14} />
                  </button>

                  <QuickActionsPopover
                    isOpen={isQuickActionsOpen}
                    onClose={() => setIsQuickActionsOpen(false)}
                    onSelectUploadFile={() => fileInputRef.current?.click()}
                    onSelectCodeSnippet={() => fileInputRef.current?.click()}
                    attachedFile={attachedFiles.length > 0 ? attachedFiles[attachedFiles.length - 1] : null}
                    onOpenPreviewModal={() => {
                      if (attachedFiles.length > 0) {
                        setSelectedPreviewFile(attachedFiles[attachedFiles.length - 1]);
                        setIsFilePreviewModalOpen(true);
                      }
                    }}
                    onOpenExtractorStudio={isDemoView ? () => setIsExtractorStudioOpen(true) : undefined}
                  />
                </div>

                  {/* Classic View Only: RAG, Preview, Print Buttons */}
                  {!isDemoView && (
                    <>
                      <button
                        type="button"
                        onClick={handleTogglePersistentWebSearch}
                        className={`web-search-toggle-pill ${isPersistentWebSearch ? 'active' : ''}`}
                        title="Toggle Web Search RAG"
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      >
                        <Globe size={12} />
                        <span>RAG {isPersistentWebSearch ? 'ON' : 'OFF'}</span>
                      </button>

                      {messages.length > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={handleExportFullChatPdf}
                            className="kokonut-action-btn export-pdf-action"
                            style={{ color: 'var(--accent-cyan)' }}
                            title="Interactive Preview Modal"
                          >
                            <Eye size={14} />
                            <span>Preview</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleDirectSessionPrint}
                            className="kokonut-action-btn export-pdf-action"
                            style={{ color: 'var(--accent-cyan)' }}
                            title="Direct System Print Preview"
                          >
                            <Printer size={14} />
                            <span>Print</span>
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {/* Demo Mode Only: Command Deck Shortcut Pill */}
                  {isDemoView && (
                    <button
                      type="button"
                      onClick={() => setIsPersonaDrawerOpen(true)}
                      className="demo-view-toggle-btn"
                      style={{ height: '32px', padding: '0 12px', fontSize: '11px', borderRadius: '16px' }}
                      title="Open Command Deck & Persona Drawer"
                    >
                      <Zap size={13} style={{ color: 'var(--accent-cyan)' }} />
                      <span>📜 Command Deck</span>
                    </button>
                  )}
                </div>

                {/* Classic View Only: Outer Send Button */}
                {!isDemoView && (
                  <button
                    type="submit"
                    disabled={isLoading || !inputPrompt.trim()}
                    className="kokonut-send-btn attract-btn"
                    title="Send Message"
                  >
                    <Send size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* 🧭 Vertical Navigation Micro-Dock (Stationed on Desktop Right Margin) */}
      {userQueries.length > 0 && (
        <div className="parchment-vertical-micro-dock" aria-label="Persona Chat Navigation Dock">
          <button
            type="button"
            onClick={handleScrollToTop}
            className="micro-dock-btn"
            title="Scroll to First Message"
          >
            <ChevronUp size={18} />
          </button>
          <button
            type="button"
            onClick={() => setIsOutlineDrawerOpen(true)}
            className="micro-dock-btn outline-active"
            title={`Open Questions Outline (${userQueries.length} Questions)`}
          >
            <BookOpen size={18} />
            <span className="micro-dock-count">{userQueries.length}</span>
          </button>
          <button
            type="button"
            onClick={handleScrollToBottom}
            className="micro-dock-btn"
            title="Jump to Latest Message & Composer"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      )}

      {/* 📖 Isolated Persona Questions Outline Drawer (Rule #1 DOM Root Placement) */}
      {isOutlineDrawerOpen && (
        <div className="demo-drawer-overlay right-drawer" onClick={() => setIsOutlineDrawerOpen(false)} style={{ zIndex: 999999 }}>
          <aside className="studio-outline-drawer" onClick={(e) => e.stopPropagation()}>
            {/* 1. Drawer Header Bar (Compact Inline Single-Row Plate) */}
            <div className="demo-drawer-header" style={{ marginBottom: '14px', paddingBottom: '12px' }}>
              <div className="demo-drawer-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="brand-circle">
                  <List size={16} className="text-cyan-400" />
                </div>
                <div className="brand-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap' }}>
                    Persona Chat Outline
                  </h3>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid rgba(6, 182, 212, 0.35)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {userQueries.length} Questions
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOutlineDrawerOpen(false)}
                className="demo-icon-btn"
                aria-label="Close Chat Outline"
                title="Close Chat Outline"
              >
                <X size={18} />
              </button>
            </div>

            {/* 2. Primary Action Button: Jump to Composer & Send */}
            <div className="demo-primary-action-wrap" style={{ marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsOutlineDrawerOpen(false);
                  handleScrollToBottom();
                }}
                className="demo-new-chat-btn"
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)'
                }}
              >
                <Zap size={15} />
                <span>Jump to Composer & Input Dock</span>
              </button>
            </div>

            {/* 3. Search Outline Input with Clean Spacing */}
            <div className="demo-drawer-search-bar" style={{ marginBottom: '14px' }}>
              <Search size={14} className="text-cyan-400" />
              <input
                type="text"
                placeholder="Search question queries..."
                value={outlineSearchQuery}
                onChange={(e) => setOutlineSearchQuery(e.target.value)}
                className="demo-search-input"
              />
              {outlineSearchQuery && (
                <button
                  type="button"
                  onClick={() => setOutlineSearchQuery('')}
                  className="clear-search-btn"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* 4. Single-Line Numbered Questions List with Model-Picker Style Smooth Scroll */}
            <div className="studio-outline-list">
              {filteredUserQueries.length === 0 ? (
                <div className="demo-empty-sessions">
                  <MessageSquare size={24} className="text-slate-500 mb-1" />
                  <p>{outlineSearchQuery ? 'No matching questions found' : 'No questions found in this chat'}</p>
                </div>
              ) : (
                filteredUserQueries.map((q) => (
                  <div
                    key={q.id}
                    className="outline-heading-item"
                    onClick={() => handleJumpToQuery(q.id)}
                    title={q.rawContent}
                  >
                    <div className="outline-item-left">
                      <span className="outline-index-badge">{q.badge}</span>
                      <span className="outline-heading-title">{q.title}</span>
                    </div>
                    <ArrowRight size={13} className="outline-arrow" />
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}

      {isSessionPreviewOpen && (
        <PdfPreviewModal
          isOpen={isSessionPreviewOpen}
          onClose={() => setIsSessionPreviewOpen(false)}
          content={messages.map(m => `### ${m.role === 'user' ? '👤 User Query' : `🎭 ${activePersonaObj.name}`}\n${m.content}`).join('\n\n---\n\n')}
          modelUsed={selectedModel}
          docTitle={`ProfJoe_FunPersona_${activePersonaObj.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`}
          renderedHtml={messages.map(m => `<div class="msg-block"><h4>${m.role === 'user' ? '👤 User' : `🎭 ${activePersonaObj.name}`}</h4><p>${m.content}</p></div>`).join('<hr/>')}
        />
      )}
      {/* Instant Attached File Preview Modal Card */}
      <FilePreviewModal
        isOpen={isFilePreviewModalOpen}
        onClose={() => setIsFilePreviewModalOpen(false)}
        attachedFile={selectedPreviewFile}
      />
      {/* Quick Extraction Engine Tool Modal */}
      <QuickExtractionModal
        isOpen={isExtractorStudioOpen}
        onClose={() => setIsExtractorStudioOpen(false)}
        onSendToChat={(extractedText, fileName) => {
          setInputPrompt(prev => `${prev}\n\n[Extracted File Data: ${fileName}]\n${extractedText}`);
        }}
      />
    </div>
  </>
  );
};

export default FunPersonaChatView;
