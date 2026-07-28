import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Globe, X, Zap, FileText, CheckSquare, MessageSquare, Paperclip, Eye, Printer, ChevronDown, Check, ListFilter } from 'lucide-react';
// @ts-ignore
import TextType from './TextType';
import type { Message, UserCustomModels } from '../types';
import { MessageItem, renderMarkdownWithMathAndDiagrams } from './MessageItem';
import { PROVIDERS } from '../constants';
import { PdfPreviewModal } from './PdfPreviewModal';
import { printSessionToPdf } from '../services/printPdfService';

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
  activeSystemPromptTitle?: string;
  onClearSystemPrompt?: () => void;
  customModels?: UserCustomModels;
  promptMode?: string;
  onPromptModeChange?: (mode: string) => void;
  isPersonaView?: boolean;
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
  activeSystemPromptTitle,
  onClearSystemPrompt,
  customModels,
  promptMode = 'auto',
  onPromptModeChange,
  isPersonaView = false
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const [isSessionPreviewOpen, setIsSessionPreviewOpen] = useState(false);
  const [isMinimapOpen, setIsMinimapOpen] = useState(false);

  // Custom Glass Dropdown States
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const providerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (minimapRef.current && !minimapRef.current.contains(e.target as Node)) {
        setIsMinimapOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userQueries = useMemo(() => {
    return messages.filter(m => m.role === 'user');
  }, [messages]);

  const handleJumpToQuery = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('highlight-query');
      setTimeout(() => el.classList.remove('highlight-query'), 2000);
    }
    setIsMinimapOpen(false);
  };

  const currentProviderGroup = PROVIDERS.find(p => p.id === selectedProvider) || PROVIDERS[0];

  const availableModels = React.useMemo(() => {
    const customList = customModels ? customModels[selectedProvider] : undefined;
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

  const handleEditPromptInBox = (oldText: string) => {
    setInputPrompt(oldText);
    textareaRef.current?.focus();
    if (onEditUserMessage) {
      onEditUserMessage(oldText);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputPrompt(prev => `${prev}\n\n[Uploaded File: ${file.name}]\n${content}`);
    };
    reader.readAsText(file);
  };

  const handleExportFullChatPdf = () => {
    setIsSessionPreviewOpen(true);
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
    <div className="chat-window-modern">
      <div className="chat-messages-container">
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
              key={m.id}
              message={m}
              isLast={idx === messages.length - 1}
              onRetry={onRetry}
              onEditUserMessage={handleEditPromptInBox}
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

            <div className="input-bar-right-controls flex items-center gap-2 relative" ref={minimapRef}>
              {activeSystemPromptTitle && (
                <div className="system-prompt-active-badge">
                  <span>📌 {activeSystemPromptTitle}</span>
                  {onClearSystemPrompt && (
                    <button type="button" onClick={onClearSystemPrompt} className="clear-prompt-btn"><X size={13} /></button>
                  )}
                </div>
              )}

              {userQueries.length > 0 && (
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setIsMinimapOpen(!isMinimapOpen)}
                    className="input-dock-outline-btn"
                    title="Jump to Question (Query Outline)"
                  >
                    <ListFilter size={13} />
                    <span>Outline ({userQueries.length})</span>
                  </button>

                  {isMinimapOpen && (
                    <div className="input-dock-popover">
                      <div className="popover-header">📌 Questions Outline ({userQueries.length})</div>
                      <div className="popover-scroll-area">
                        {userQueries.map((q, idx) => (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => handleJumpToQuery(q.id)}
                            className="query-popover-item"
                            title={q.content}
                          >
                            <span className="query-badge">Q{idx + 1}</span>
                            <span className="query-text truncate">{q.content}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="chat-form-modern kokonut-form">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
          <textarea
            ref={textareaRef}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${currentModelName}... (Press Enter to Send)`}
            rows={3}
            style={{ minHeight: '72px', fontSize: '0.92rem', padding: '12px 16px' }}
            className="chat-textarea kokonut-textarea"
          />

          <div className="kokonut-bottom-row">
            <div className="kokonut-left-actions flex items-center gap-2 flex-wrap">
              {onProviderChange && onModelChange && (
                <>
                  {/* Custom Glassmorphic Provider Dropdown */}
                  <div className="relative inline-block" style={{ position: 'relative' }} ref={providerRef}>
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
                      <span>{currentProviderGroup.name}</span>
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

                  {/* Custom Glassmorphic Model Dropdown */}
                  <div className="relative inline-block" style={{ position: 'relative' }} ref={modelRef}>
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
                      <span className="truncate max-w-[130px] sm:max-w-[190px]">
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

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="kokonut-action-btn file-attach-btn"
                title="Attach Document or Image"
              >
                <Paperclip size={14} />
              </button>

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

              {messages.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleExportFullChatPdf}
                    className="kokonut-action-btn export-pdf-action text-cyan-400"
                    style={{ marginRight: '4px' }}
                    title="Interactive Full Session Document Preview Modal"
                  >
                    <Eye size={14} />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDirectSessionPrint}
                    className="kokonut-action-btn export-pdf-action text-blue-400"
                    style={{ marginRight: '10px' }}
                    title="Direct Full Session System Print Preview"
                  >
                    <Printer size={14} />
                    <span>Print</span>
                  </button>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="kokonut-send-btn attract-btn"
              title="Send Message"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>

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
    </div>
  );
};
