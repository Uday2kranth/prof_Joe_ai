import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, X, Zap, FileText, CheckSquare, MessageSquare, Paperclip, Eye, Printer, ChevronDown, Check } from 'lucide-react';
// @ts-ignore
import TextType from './TextType';
import type { Message } from '../types';
import { MessageItem, renderMarkdownWithMathAndDiagrams } from './MessageItem';
import { PROVIDERS } from '../constants';
import { PdfPreviewModal } from './PdfPreviewModal';
import { printSessionToPdf } from '../services/printPdfService';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (prompt: string, webSearch: boolean, mode: 'auto' | '12marks' | '2marks' | 'general' | 'none') => void;
  selectedProvider?: string;
  selectedModel: string;
  onProviderChange?: (provider: string) => void;
  onModelChange?: (model: string) => void;
  onRetry?: () => void;
  onEditUserMessage?: (oldText: string) => void;
  activeSystemPromptTitle?: string;
  onClearSystemPrompt?: () => void;
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
  onClearSystemPrompt
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const [promptMode, setPromptMode] = useState<'auto' | '12marks' | '2marks' | 'general' | 'none'>('auto');
  const [isSessionPreviewOpen, setIsSessionPreviewOpen] = useState(false);

  // Custom Glass Dropdown States
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const providerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const currentProviderGroup = PROVIDERS.find(p => p.id === selectedProvider) || PROVIDERS[0];
  const currentModelName = currentProviderGroup.models.find(m => m.value === selectedModel)?.name || selectedModel;

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
    if (files && files.length > 0) {
      const file = files[0];
      setInputPrompt(prev => `${prev}\n\n[Attached File: ${file.name} (${Math.round(file.size / 1024)} KB)]`);
    }
  };

  const handleExportFullChatPdf = () => {
    setIsSessionPreviewOpen(true);
  };

  const handleDirectSessionPrint = async () => {
    const docTitle = `ProfJoe_Session_${activeSystemPromptTitle ? activeSystemPromptTitle.replace(/[^a-zA-Z0-9]/g, '_') : 'Chat'}_${new Date().toISOString().split('T')[0]}`;
    await printSessionToPdf(messages, docTitle);
  };

  return (
    <div className="chat-window-container">
      <div className="messages-viewport">
        <div className="messages-scroll-area">
        {messages.length === 0 ? (
          <div className="empty-state-hero kokonut-hero-card">
            <div className="kokonut-dots-overlay" />
            <div className="hero-icon-box" style={{ padding: 0, overflow: 'hidden', borderRadius: '50%', width: '76px', height: '76px', margin: '0 auto 16px auto', border: '3px solid var(--accent-cyan)', boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)' }}>
              <img src="/joe-avatar.png" alt="Prof. Joe" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h2 style={{ minHeight: '38px', margin: '0 0 8px 0' }}>
              <TextType
                text={[
                  "Welcome to Prof. Joe AI Engine 🚀",
                  "Osmania University M.Sc Exam Prep 🎓",
                  "Generate Mermaid Diagrams & High-Yield Banks 📊",
                  "Multi-Model Intelligence with RAG & System Prompts ⚡"
                ]}
                typingSpeed={60}
                pauseDuration={2200}
                showCursor={true}
                cursorCharacter="|"
              />
            </h2>
            <p>Select a model, enter your exam query or syllabus topic, and let Prof. Joe structure high-scoring answers!</p>
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
        <div className="input-modes-bar">
          <div className="kokonut-mode-dock">
            <button type="button" onClick={() => setPromptMode('auto')} className={`kokonut-mode-pill ${promptMode === 'auto' ? 'active' : ''}`}><Zap size={13} /> <span>Auto</span></button>
            <button type="button" onClick={() => setPromptMode('12marks')} className={`kokonut-mode-pill ${promptMode === '12marks' ? 'active' : ''}`}><FileText size={13} /> <span>12 Marks</span></button>
            <button type="button" onClick={() => setPromptMode('2marks')} className={`kokonut-mode-pill ${promptMode === '2marks' ? 'active' : ''}`}><CheckSquare size={13} /> <span>3–4 Marks</span></button>
            <button type="button" onClick={() => setPromptMode('general')} className={`kokonut-mode-pill ${promptMode === 'general' ? 'active' : ''}`}><MessageSquare size={13} /> <span>General</span></button>
          </div>

          <div className="right-controls-group">
            {activeSystemPromptTitle && (
              <div className="system-prompt-active-badge">
                <span>📌 {activeSystemPromptTitle}</span>
                {onClearSystemPrompt && (
                  <button type="button" onClick={onClearSystemPrompt} className="clear-prompt-btn"><X size={13} /></button>
                )}
              </div>
            )}
            <button type="button" onClick={() => setWebSearch(!webSearch)} className={`kokonut-mode-pill web-search-toggle-pill ${webSearch ? 'active' : ''}`}><Globe size={13} /><span>RAG {webSearch ? 'ON' : 'OFF'}</span></button>
          </div>
        </div>

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
                      <div className="custom-dropdown-menu provider-menu">
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
                      <div className="custom-dropdown-menu model-menu">
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

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="kokonut-action-btn file-attach-btn"
                title="Attach Document or Image"
              >
                <Paperclip size={14} />
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
