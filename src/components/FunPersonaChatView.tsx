import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, Paperclip, Eye, Printer, ChevronDown, Check } from 'lucide-react';
// @ts-ignore
import TextType from './TextType';
import type { Message } from '../types';
import { MessageItem } from './MessageItem';
import { PROVIDERS, PERSONAS } from '../constants';
import { PdfPreviewModal } from './PdfPreviewModal';
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
  onEditUserMessage
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const [isSessionPreviewOpen, setIsSessionPreviewOpen] = useState(false);

  // Custom Glass Dropdown States
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const providerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const personaMenuRef = useRef<HTMLDivElement>(null);

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
      if (personaMenuRef.current && !personaMenuRef.current.contains(e.target as Node)) {
        setIsPersonaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentProviderGroup = PROVIDERS.find(p => p.id === selectedProvider) || PROVIDERS[0];
  const activePersonaObj = PERSONAS.find(p => p.id === selectedPersona) || PERSONAS[1];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;
    onSendMessage(inputPrompt, webSearch, 'general', selectedPersona);
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
    if (files && files.length > 0) {
      const file = files[0];
      setInputPrompt(prev => `${prev}\n\n[Attached File: ${file.name} (${Math.round(file.size / 1024)} KB)]`);
    }
  };

  const handleExportFullChatPdf = () => {
    setIsSessionPreviewOpen(true);
  };

  const handleDirectSessionPrint = async () => {
    const docTitle = `ProfJoe_FunPersona_${activePersonaObj.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    await printSessionToPdf(messages, docTitle);
  };

  return (
    <div className="chat-window-container fun-persona-lounge-container">
      {/* Dual-Mode Adaptive Persona Header Strip */}
      <div className="persona-selector-header-strip p-2 flex items-center justify-between gap-2" style={{ background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(6, 182, 212, 0.25)', minHeight: '48px', flexShrink: 0 }}>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span style={{ fontSize: '1.2rem' }}>🎭</span>
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-cyan)' }} className="hidden sm:inline">Fun AI Personas</span>
        </div>

        {/* Mobile View: Custom Glass Persona Dropdown */}
        <div className="relative inline-block sm:hidden" ref={personaMenuRef}>
          <button
            type="button"
            onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
            className="custom-dropdown-pill"
            title="Select AI Persona"
          >
            <span className="picker-icon">{activePersonaObj.icon}</span>
            <span className="font-semibold text-xs text-slate-100">{activePersonaObj.name}</span>
            <ChevronDown size={13} className={`transition-transform duration-200 ${isPersonaMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isPersonaMenuOpen && (
            <div className="custom-dropdown-menu persona-menu">
              <div className="dropdown-header">Select AI Persona</div>
              {PERSONAS.filter(p => p.id !== 'default').map(p => {
                const isSelected = p.id === selectedPersona;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onPersonaChange(p.id);
                      setIsPersonaMenuOpen(false);
                    }}
                    className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                  >
                    <span className="text-base mr-2">{p.icon}</span>
                    <span>{p.name}</span>
                    {isSelected && <Check size={13} className="text-cyan-400 ml-auto" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop View: Sleek 36px Single-Row Avatar Strip */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none flex-grow">
          {PERSONAS.filter(p => p.id !== 'default').map(p => {
            const isActive = selectedPersona === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPersonaChange(p.id)}
                className={`persona-avatar-chip flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${isActive ? 'active-chip' : ''}`}
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.35), rgba(99, 102, 241, 0.35))' : 'rgba(30, 41, 59, 0.65)',
                  border: isActive ? '1.5px solid #06b6d4' : '1px solid rgba(148, 163, 184, 0.2)',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  boxShadow: isActive ? '0 0 14px rgba(6, 182, 212, 0.5)' : 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: '0.8rem'
                }}
                title={p.name}
              >
                <span style={{ fontSize: '1.05rem' }}>{p.icon}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: isActive ? 700 : 500 }}>
                  {p.name.replace('-Inspired', '')}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onTogglePersonaEnabled && (
            <button
              type="button"
              onClick={onTogglePersonaEnabled}
              style={{
                padding: '4px 10px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: isPersonaEnabled
                  ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(168, 85, 247, 0.25))'
                  : 'rgba(30, 41, 59, 0.6)',
                border: isPersonaEnabled
                  ? '1px solid rgba(56, 189, 248, 0.6)'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                color: isPersonaEnabled ? '#38bdf8' : 'var(--text-muted)'
              }}
            >
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isPersonaEnabled ? '#38bdf8' : '#64748b'
              }} className={isPersonaEnabled ? 'animate-pulse' : ''} />
              <span className="hidden sm:inline">{isPersonaEnabled ? 'Active' : 'Disabled'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Viewport */}
      <div className="messages-viewport">
        <div className="messages-scroll-area">
          {messages.length === 0 ? (
            <div className="empty-state-hero kokonut-hero-card">
              <div className="kokonut-dots-overlay" />
              <div className="hero-icon-box" style={{ padding: 0, overflow: 'hidden', borderRadius: '50%', width: '80px', height: '80px', margin: '0 auto 16px auto', border: '3px solid var(--accent-cyan)', boxShadow: '0 0 24px rgba(6, 182, 212, 0.5)' }}>
                <span style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  {activePersonaObj.icon}
                </span>
              </div>
              <h2 style={{ minHeight: '38px', margin: '0 0 8px 0' }}>
                <TextType
                  text={[
                    `Welcome to ${activePersonaObj.name} 🎭`,
                    "Chat with Rick, Stewie, Peter, Morty & Courage's Computer 🤖",
                    "100% Factually Accurate Logic with Character Humor ⚡"
                  ]}
                />
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{activePersonaObj.description}</p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <MessageItem
                key={m.id}
                message={m}
                isLast={idx === messages.length - 1}
                onRetry={onRetry}
                onEditUserMessage={onEditUserMessage}
              />
            ))
          )}

          {isLoading && (
            <div className="message-row assistant-row">
              <div className="avatar" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '50%', width: '36px', height: '36px' }}>
                {activePersonaObj.icon}
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

      {/* Input Bar Container */}
      <div className="input-bar-container">
        <form onSubmit={handleSubmit} className="chat-form-modern kokonut-form">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <textarea
            ref={textareaRef}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${activePersonaObj.name} (${selectedModel})...`}
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
                        {currentProviderGroup.models.find(m => m.value === selectedModel)?.name || selectedModel}
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
                onClick={() => setWebSearch(!webSearch)}
                className={`web-search-toggle-pill ${webSearch ? 'active' : ''}`}
                title="Toggle Web Search RAG"
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
              >
                <Globe size={12} />
                <span>RAG {webSearch ? 'ON' : 'OFF'}</span>
              </button>

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
                    title="Interactive Preview Modal"
                  >
                    <Eye size={14} />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDirectSessionPrint}
                    className="kokonut-action-btn export-pdf-action text-blue-400"
                    style={{ marginRight: '10px' }}
                    title="Direct System Print Preview"
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
    </div>
  );
};
