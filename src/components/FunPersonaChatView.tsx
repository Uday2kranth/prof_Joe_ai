import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  ChevronDown, 
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
  FileText
} from 'lucide-react';
import { useTypewriterPlaceholder } from '../hooks/useTypewriterPlaceholder';
import type { Message, ChatSession } from '../types';
import { MessageItem } from './MessageItem';
import { PROVIDERS, PERSONAS } from '../constants';
import { PdfPreviewModal } from './PdfPreviewModal';
import { QuickActionsPopover, FilePreviewModal, type AttachedFileDetails } from './QuickActionsPopover';
import { QuickExtractionModal } from './QuickExtractionModal';
import { printSessionToPdf } from '../services/printPdfService';

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
  personaSessions?: ChatSession[];
  activePersonaSessionId?: string;
  onSelectPersonaSession?: (id: string) => void;
  onNewPersonaSession?: () => void;
  onDeletePersonaSession?: (id: string) => void;
  isDemoView?: boolean;
  isExternalDrawerOpen?: boolean;
  onCloseExternalDrawer?: () => void;
}

export const FunPersonaChatView: React.FC<FunPersonaChatViewProps> = ({
  messages,
  isLoading,
  onSendMessage,
  selectedProvider = 'Pollinations AI (Free Keyless)',
  selectedModel,
  selectedPersona,
  isPersonaEnabled = true,
  onTogglePersonaEnabled,
  onProviderChange,
  onModelChange,
  onPersonaChange,
  onRetry,
  onEditUserMessage,
  personaSessions = [],
  activePersonaSessionId = '',
  onSelectPersonaSession,
  onNewPersonaSession,
  onDeletePersonaSession,
  isDemoView = false,
  isExternalDrawerOpen,
  onCloseExternalDrawer
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isPersistentWebSearch, setIsPersistentWebSearch] = useState<boolean>(() => {
    return localStorage.getItem('chatterbot_persona_persistent_websearch') === 'true';
  });
  const [isSessionPreviewOpen, setIsSessionPreviewOpen] = useState(false);

  // Persona Character Panel & History Drawer State
  const [isPersonaDrawerOpen, setIsPersonaDrawerOpen] = useState(false);
  const [stagedPersona, setStagedPersona] = useState(selectedPersona);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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

  const currentProviderGroup = PROVIDERS.find(p => p.id === selectedProvider || p.name === selectedProvider) || PROVIDERS[0];
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
                <Clock size={18} className="text-rose-400" />
                <div>
                  <h3 style={{ fontSize: '0.94rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Fun Persona Deck
                  </h3>
                  <div style={{ fontSize: '0.7rem', color: '#f43f5e', fontWeight: 600 }}>
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
                <X size={18} />
              </button>
            </div>

            {/* Primary Action Button */}
            {onNewPersonaSession && (
              <div className="demo-drawer-action" style={{ marginBottom: '14px' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    onNewPersonaSession();
                    handleCloseDrawer();
                  }} 
                  className="demo-new-chat-btn rose-new-chat-btn"
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} />
                  <span>New Persona Chat Session</span>
                </button>
              </div>
            )}

            {/* SECTION 1: BENTO COMMAND CONTROL DECK (TOP PRIORITY CONTROLS) */}
            {isDemoView && (
              <div className="demo-bento-deck" style={{ marginBottom: '14px' }}>
                <div className="bento-deck-header">
                  <Zap size={13} className="text-rose-400" />
                  <span>COMMAND CONTROLS</span>
                </div>

                <div className="bento-grid-container">
                  {/* Tile 1: Persistent Web Search */}
                  <div 
                    className={`bento-card-tile ${isPersistentWebSearch ? 'active-glow-cyan' : ''}`}
                    onClick={handleTogglePersistentWebSearch}
                    title="Toggle Persistent Internet Search across all messages"
                  >
                    <div className="bento-tile-icon cyan">
                      <Globe size={16} />
                    </div>
                    <div className="bento-tile-content">
                      <span className="bento-tile-title">Web Search</span>
                      <span className="bento-tile-status">
                        {isPersistentWebSearch ? '🟢 Always ON' : '⚪ OFF'}
                      </span>
                    </div>
                  </div>

                  {/* Tile 2: Session Monitor */}
                  <div className="bento-card-tile" title={`Model: ${selectedModel}`}>
                    <div className="bento-tile-icon purple">
                      <BarChart2 size={16} />
                    </div>
                    <div className="bento-tile-content">
                      <span className="bento-tile-title">{selectedModel.slice(0, 12)}</span>
                      <span className="bento-tile-sub font-mono">{messages.length} msgs</span>
                    </div>
                  </div>

                  {/* Tile 3: Preview Chat (In-App Styled Modal) */}
                  <div 
                    className="bento-card-tile"
                    onClick={() => {
                      handleExportFullChatPdf();
                      handleCloseDrawer();
                    }}
                    title="Open styled in-app Preview Modal with Save Image & Save PDF"
                  >
                    <div className="bento-tile-icon blue">
                      <Eye size={16} />
                    </div>
                    <div className="bento-tile-content">
                      <span className="bento-tile-title">Preview Chat</span>
                      <span className="bento-tile-sub">In-App Pop-up</span>
                    </div>
                  </div>

                  {/* Tile 4: Native Print / PDF (Chrome Native Window) */}
                  <div 
                    className="bento-card-tile"
                    onClick={handleDirectSessionPrint}
                    title="Open System Native Chrome Print Preview Dialog to print or save PDF"
                  >
                    <div className="bento-tile-icon emerald">
                      <Printer size={16} />
                    </div>
                    <div className="bento-tile-content">
                      <span className="bento-tile-title">Native Print / PDF</span>
                      <span className="bento-tile-sub">System Chrome</span>
                    </div>
                  </div>

                  {/* Tile 5 (Full Width Span 2): Clear Session Context */}
                  <div 
                    className="bento-card-tile span-2-tile danger-tile"
                    onClick={() => setShowClearConfirm(true)}
                    title="Clear messages in active persona session"
                  >
                    <div className="bento-tile-icon rose">
                      <RotateCcw size={16} />
                    </div>
                    <div className="bento-tile-content" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span className="bento-tile-title">Clear Session Context</span>
                      <span className="bento-tile-sub">Reset Messages</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: 3-COLUMN CHARACTER BENTO GRID */}
            <div className="persona-drawer-section mb-3">
              <div className="section-label mb-2">
                <span>SELECT AI CHARACTER</span>
              </div>

              <div className="persona-bento-grid">
                {PERSONAS.filter(p => p.id !== 'default').map(p => {
                  const isSelected = p.id === stagedPersona;
                  const cleanName = p.name
                    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
                    .replace("Courage's Computer", 'C. Computer')
                    .replace('-Inspired', '')
                    .trim();
                  return (
                    <div 
                      key={p.id}
                      className={`persona-bento-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setStagedPersona(p.id)}
                      title={`${p.name}: ${p.description}`}
                    >
                      <span className="persona-micro-icon">{p.icon}</span>
                      <span className="persona-micro-name truncate">{cleanName}</span>
                    </div>
                  );
                })}
              </div>

              {/* Drawer Action Controls: Apply + Enable Toggle Pill */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  className="apply-persona-btn flex-1"
                  onClick={() => {
                    onPersonaChange(stagedPersona);
                    if (!isPersonaEnabled && onTogglePersonaEnabled) {
                      onTogglePersonaEnabled();
                    }
                    handleCloseDrawer();
                  }}
                  title="Apply character and automatically enable persona prompt"
                >
                  <span>Apply Selected Persona</span>
                  <Check size={16} />
                </button>

                {onTogglePersonaEnabled && (
                  <button
                    type="button"
                    onClick={onTogglePersonaEnabled}
                    className="persona-status-toggle-pill flex-shrink-0"
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: isPersonaEnabled
                        ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(244, 63, 94, 0.3))'
                        : 'rgba(30, 41, 59, 0.7)',
                      border: isPersonaEnabled
                        ? '1.5px solid rgba(244, 63, 94, 0.7)'
                        : '1px solid rgba(255, 255, 255, 0.15)',
                      color: isPersonaEnabled ? '#fda4af' : '#94a3b8',
                      boxShadow: isPersonaEnabled ? '0 0 12px rgba(244, 63, 94, 0.35)' : 'none',
                      transition: 'all 0.2s ease',
                      height: '38px'
                    }}
                    title="Toggle persona prompt ON or OFF"
                  >
                    <span style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: isPersonaEnabled ? '#f43f5e' : '#64748b',
                      boxShadow: isPersonaEnabled ? '0 0 8px #f43f5e' : 'none'
                    }} className={isPersonaEnabled ? 'animate-pulse' : ''} />
                    <span>{isPersonaEnabled ? 'Active' : 'Disabled'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Clear Context Safety Confirmation */}
            {showClearConfirm && (
              <div className="demo-clear-confirm-banner" style={{ marginBottom: '14px' }}>
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

            {/* SECTION 3: SEARCH & PERSONA CHAT HISTORY */}
            {isDemoView && (
              <div className="persona-drawer-section persona-history-section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="section-label flex justify-between items-center mb-2">
                  <span>PERSONA CHAT HISTORY</span>
                </div>

                {/* Live Persona Search Bar */}
                <div className="demo-drawer-search-bar mb-3" style={{ padding: '6px 12px' }}>
                  <Search size={14} className="text-rose-400" />
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
                    >
                      <X size={12} />
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

      <div className="chat-window-container fun-persona-lounge-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
        <div className="chat-messages-container">
          <div className="messages-inner">
            {messages.length === 0 ? (
              <div className="empty-chat-hero flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-purple-500/20 border border-rose-500/30 flex items-center justify-center text-4xl shadow-xl shadow-rose-500/10">
                  {activePersonaObj.icon}
                </div>
                <div className="max-w-md space-y-2">
                  <h2 className="text-xl font-bold text-slate-100">{activePersonaObj.name}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">{activePersonaObj.description}</p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <MessageItem
                  key={msg.id || index}
                  message={msg}
                  isLast={index === messages.length - 1}
                  onRetry={onRetry}
                  onEditUserMessage={onEditUserMessage}
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
                caretColor: '#06b6d4',
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
                                  if (p.models.length > 0) {
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
                          {currentProviderGroup.models.find(m => m.value === selectedModel)?.name || selectedModel}
                        </span>
                        <ChevronDown size={13} className={`transition-transform duration-200 ${isModelOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isModelOpen && (
                        <div className="custom-dropdown-menu bottom-upward-menu model-menu">
                          <div className="dropdown-header">{currentProviderGroup.name} Models</div>
                          {currentProviderGroup.models.map(m => {
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
                            className="kokonut-action-btn export-pdf-action text-cyan-400"
                            title="Interactive Preview Modal"
                          >
                            <Eye size={14} />
                            <span>Preview</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleDirectSessionPrint}
                            className="kokonut-action-btn export-pdf-action text-blue-400"
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
                      className="demo-view-toggle-btn rose-toggle-btn"
                      style={{ height: '32px', padding: '0 12px', fontSize: '11px', borderRadius: '16px' }}
                      title="Open Command Deck & Persona Drawer"
                    >
                      <Zap size={13} className="text-rose-400" />
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
