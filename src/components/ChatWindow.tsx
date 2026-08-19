import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Globe, X, Zap, FileText, FileCode, CheckSquare, MessageSquare, Paperclip, Eye, Printer, ChevronDown, ChevronUp, Check, ListFilter, RotateCw, BookOpen, List, Search, ArrowRight } from 'lucide-react';
// @ts-ignore
import TextType from './TextType';
import type { Message, UserCustomModels } from '../types';
import { MessageItem, renderMarkdownWithMathAndDiagrams } from './MessageItem';
import { PROVIDERS } from '../constants';
import { PdfPreviewModal } from './PdfPreviewModal';
import { QuickExtractionModal } from './QuickExtractionModal';
import { printSessionToPdf } from '../services/printPdfService';
import { useTypewriterPlaceholder } from '../hooks/useTypewriterPlaceholder';
import { QuickActionsPopover, FilePreviewModal, type AttachedFileDetails } from './QuickActionsPopover';
import { TextSelectionToolbar } from './TextSelectionToolbar';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (prompt: string, webSearch: boolean, mode: string) => void;
  selectedProvider?: string;
  selectedModel: string;
  onProviderChange?: (provider: string) => void;
  onModelChange?: (model: string) => void;
  onRetry?: () => void;
  onEditUserMessage?: (oldText: string) => void;
  onBranchMessage?: (message: Message) => void;
  onPinMessage?: (message: Message) => void;
  pinnedMessageIds?: Set<string>;
  activeSystemPromptTitle?: string;
  onClearSystemPrompt?: () => void;
  customModels?: UserCustomModels;
  promptMode?: string;
  onPromptModeChange?: (mode: string) => void;
  isPersonaView?: boolean;
  isDemoView?: boolean;
  onOpenCommandDeck?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  onSendMessage,
  selectedProvider = 'Ollama Cloud',
  selectedModel,
  onProviderChange,
  onModelChange,
  onRetry,
  onEditUserMessage,
  onBranchMessage,
  onPinMessage,
  pinnedMessageIds = new Set(),
  activeSystemPromptTitle,
  onClearSystemPrompt,
  customModels,
  promptMode = 'auto',
  onPromptModeChange,
  isPersonaView = false,
  isDemoView = false,
  onOpenCommandDeck
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const [isSessionPreviewOpen, setIsSessionPreviewOpen] = useState(false);
  const [isOutlineDrawerOpen, setIsOutlineDrawerOpen] = useState(false);
  const [outlineSearchQuery, setOutlineSearchQuery] = useState('');

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
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleQuickAction = (actionType: 'explain' | 'math' | '2marks' | 'hinglish', selectedText: string) => {
    if (!selectedText.trim()) return;
    if (actionType === 'explain') {
      onSendMessage(`Please explain this specific excerpt simply in 2-3 clear bullet points:\n\n> "${selectedText}"`, false, 'auto');
    } else if (actionType === 'math') {
      onSendMessage(`Provide the detailed step-by-step mathematical derivation and formula explanation for:\n\n> "${selectedText}"`, false, 'auto');
    } else if (actionType === '2marks') {
      onSendMessage(`Turn this excerpt into a high-scoring 2-mark Osmania University exam question and answer:\n\n> "${selectedText}"`, false, '2marks');
    } else if (actionType === 'hinglish') {
      onSendMessage(`Explain this concept in clear colloquial bilingual Hinglish:\n\n> "${selectedText}"`, false, 'general');
    }
  };

  const dynamicPlaceholderPrompts = useMemo(() => [
    `Ask ${selectedModel}... (Press Enter to Send)`,
    `Ask a 12-mark Osmania exam question...`,
    `Need quick revision notes for your exam?`,
    `Attach a syllabus PDF or ask anything...`
  ], [selectedModel]);

  const animatedPlaceholder = useTypewriterPlaceholder(dynamicPlaceholderPrompts, 50, 25, 2000, inputPrompt.length === 0);

  // Instant scroll to latest message on session load / new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, isLoading]);

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

  // 📑 Parse single-line numbered user questions for chat outline
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
    const scrollContainer = document.querySelector('.chat-messages-container, .messages-scroll-area, .main-chat-container');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const firstMsg = document.querySelector('.message-row, .user-bubble, .welcome-hero-card');
    if (firstMsg) {
      firstMsg.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToBottom = () => {
    const scrollContainer = document.querySelector('.chat-messages-container, .messages-scroll-area, .main-chat-container');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: scrollContainer.scrollHeight + 10000, behavior: 'smooth' });
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    textareaRef.current?.focus();
  };

  const currentProviderGroup = PROVIDERS.find(p => p.id === selectedProvider || p.name === selectedProvider) || PROVIDERS[0];

  const availableModels = React.useMemo(() => {
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

  const handleModeClick = (modeKey: string) => {
    if (onPromptModeChange) {
      onPromptModeChange(modeKey);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;
    onSendMessage(inputPrompt, webSearch, promptMode);
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
      setInputPrompt(prev => prev ? prev : `Please analyze this image: ${file.name}`);
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
        setInputPrompt(prev => `${prev}\n\n[Uploaded File: ${file.name}]\n${content}`);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const lastUserMsgIndex = messages.map(m => m.role).lastIndexOf('user');
  const lastAssistantMsgIndex = messages.map(m => m.role).lastIndexOf('assistant');

  const handleExportFullChatPdf = () => {
    handleDirectSessionPrint();
  };

  const handleDirectSessionPrint = async () => {
    const docTitle = `ProfJoe_Session_${activeSystemPromptTitle ? activeSystemPromptTitle.replace(/[^a-zA-Z0-9]/g, '_') : 'Chat'}_${new Date().toISOString().split('T')[0]}`;
    await printSessionToPdf(messages, docTitle);
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="chat-window-modern flex flex-col h-full relative">
      {/* Top Banner: Active System Prompt Notification */}
      {activeSystemPromptTitle && (
        <div className="top-system-prompt-banner">
          <div className="system-prompt-banner-text">
            <span>📌 Active Prompt Mode:</span>
            <span className="system-prompt-banner-title">{activeSystemPromptTitle}</span>
          </div>
          {onClearSystemPrompt && (
            <button
              type="button"
              onClick={onClearSystemPrompt}
              className="disable-prompt-btn"
              title="Disable Active System Prompt"
            >
              <span>Disable</span>
              <X size={12} />
            </button>
          )}
        </div>
      )}

      <div className="chat-messages-container" ref={chatContainerRef}>
        <TextSelectionToolbar containerRef={chatContainerRef} onQuickAction={handleQuickAction} />
        <div className="messages-inner">
        {messages.length === 0 ? (
          <div
            className="welcome-hero-card text-center my-auto max-w-2xl"
            onMouseMove={handleCardMouseMove}
          >
            <div className="welcome-avatar-wrapper mb-4" style={{ width: '80px', height: '80px', margin: '0 auto 20px auto', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--accent-cyan)', boxShadow: '0 0 24px rgba(6, 182, 212, 0.45)' }}>
              <img src="/joe-avatar.png" alt="Prof. Joe" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h2 className="welcome-title text-2xl sm:text-3xl font-bold text-slate-100 mb-3 relative z-10">
              <TextType
                text={["Welcome to Prof. Joe AI Exam Mentor", "OU M.Sc. Academic Specialist", "Multi-Model Intelligence Engine"]}
                typingSpeed={50}
                deletingSpeed={30}
                pauseTime={2500}
                loop={true}
                cursorCharacter="|"
              />
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed relative z-10">
              Select a model, enter your exam query or syllabus topic, and let Prof. Joe structure high-scoring answers!
            </p>
          </div>
        ) : (
          messages.map((m, idx) => (
            <MessageItem
              key={m.id || idx}
              message={m}
              isLast={idx === messages.length - 1}
              isLastUserMessage={idx === lastUserMsgIndex}
              isLastAssistantMessage={idx === lastAssistantMsgIndex}
              onRetry={onRetry}
              onEditUserMessage={onEditUserMessage}
              onBranch={onBranchMessage}
              onPin={onPinMessage}
              isPinned={pinnedMessageIds.has(m.id)}
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
                <span className="role-label">Assistant</span>
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

      <div className="input-bar-container">
        {!isPersonaView && (
          <div className="input-modes-bar">
            <div className="kokonut-mode-dock">
              <button type="button" onClick={() => handleModeClick('auto')} className={`kokonut-mode-pill ${promptMode === 'auto' ? 'active' : ''}`} aria-label="Auto Mode"><Zap size={13} /> <span>Auto</span></button>
              <button type="button" onClick={() => handleModeClick('12marks')} className={`kokonut-mode-pill ${promptMode === '12marks' ? 'active' : ''}`} aria-label="12 Marks Mode"><FileText size={13} /> <span>12 Marks</span></button>
              <button type="button" onClick={() => handleModeClick('2marks')} className={`kokonut-mode-pill ${promptMode === '2marks' ? 'active' : ''}`} aria-label="3-4 Marks Mode"><CheckSquare size={13} /> <span>3–4 Marks</span></button>
              <button type="button" onClick={() => handleModeClick('1marks')} className={`kokonut-mode-pill ${promptMode === '1marks' ? 'active' : ''}`} aria-label="1-2 Marks Mode"><Zap size={13} /> <span>1–2 Marks</span></button>
              <button type="button" onClick={() => handleModeClick('general')} className={`kokonut-mode-pill ${promptMode === 'general' ? 'active' : ''}`} aria-label="General Mode"><MessageSquare size={13} /> <span>General</span></button>
            </div>

            <div className="input-bar-right-controls flex items-center gap-2">
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
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="chat-form-modern kokonut-form">
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
              placeholder={animatedPlaceholder || `Ask ${currentModelName}... (Press Enter to Send)`}
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

            {/* Floating Send Button Inside Input Box (Demo Mode ChatGPT/Claude Style) */}
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
              {/* Row 1: 40% Provider Picker + 60% Model Picker */}
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
                  </>
                )}
              </div>

              {/* Row 2: Action Tools */}
              <div className="kokonut-actions-row">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="kokonut-action-btn file-attach-btn"
                    title="Refresh App / Reload Page"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
                  >
                    <RotateCw size={14} />
                  </button>

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

                  {/* Classic View Only: RAG Toggle Button */}
                  {!isDemoView && (
                    <button
                      type="button"
                      onClick={() => setWebSearch(!webSearch)}
                      className={`kokonut-mode-pill web-search-toggle-pill ${webSearch ? 'active' : ''}`}
                      style={{ height: '32px', borderRadius: '16px', padding: '0 10px', fontSize: '11px' }}
                      title="Toggle Web Search / RAG Knowledge Retrieval"
                    >
                      <Globe size={13} />
                      <span>RAG {webSearch ? 'ON' : 'OFF'}</span>
                    </button>
                  )}

                  {/* Demo Mode Command Deck Shortcut Pill */}
                  {isDemoView && onOpenCommandDeck && (
                    <button
                      type="button"
                      onClick={onOpenCommandDeck}
                      className="demo-view-toggle-btn"
                      style={{ height: '32px', padding: '0 12px', fontSize: '11px', borderRadius: '16px' }}
                      title="Open Side Drawer Command Deck & History"
                    >
                      <Zap size={13} className="text-cyan-400" />
                      <span>📜 Command Deck</span>
                    </button>
                  )}

                  {/* Classic View Only: Preview and Print Buttons */}
                  {!isDemoView && messages.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={handleExportFullChatPdf}
                        className="kokonut-action-btn export-pdf-action text-cyan-400"
                        title="Interactive Full Session Document Preview Modal"
                      >
                        <Eye size={14} />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDirectSessionPrint}
                        className="kokonut-action-btn export-pdf-action text-blue-400"
                        title="Direct Full Session System Print Preview"
                      >
                        <Printer size={14} />
                        <span>Print</span>
                      </button>
                    </>
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
        <div className="parchment-vertical-micro-dock" aria-label="Chat Navigation Dock">
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

      {/* 📖 Isolated Chat Questions Outline Drawer (Rule #1 DOM Root Placement) */}
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
                    Chat Outline
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

      {/* Full Chat Session Custom Animated PDF Preview Modal */}
      {isSessionPreviewOpen && (
        <PdfPreviewModal
          isOpen={isSessionPreviewOpen}
          onClose={() => setIsSessionPreviewOpen(false)}
          content={messages.map(m => `### ${m.role === 'user' ? '👤 User Query' : '🎓 Prof. Joe AI'}\n${m.content}`).join('\n\n---\n\n')}
          modelUsed={selectedModel}
          docTitle={`ProfJoe_Session_${activeSystemPromptTitle ? activeSystemPromptTitle.replace(/[^a-zA-Z0-9]/g, '_') : 'Chat'}_${new Date().toISOString().split('T')[0]}`}
          renderedHtml={renderMarkdownWithMathAndDiagrams(
            messages.map(m => `### ${m.role === 'user' ? '👤 User Query' : '🎓 Prof. Joe AI'}\n${m.content}`).join('\n\n---\n\n'),
            new Map()
          )}
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
  );
};
