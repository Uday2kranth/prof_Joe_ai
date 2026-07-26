import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, Paperclip, Eye, Printer } from 'lucide-react';
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
  onProviderChange,
  onModelChange,
  onPersonaChange,
  onRetry,
  onEditUserMessage
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const [isSessionPreviewOpen, setIsSessionPreviewOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      {/* Top Character Selector Strip */}
      <div className="persona-selector-header-strip flex flex-col gap-2 p-3" style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(6, 182, 212, 0.2)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.4rem' }}>🎭</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-cyan)' }}>Fun AI Personas Lounge</span>
          </div>
          <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: activePersonaObj.allowDiagrams ? 'rgba(6, 182, 212, 0.15)' : 'rgba(148, 163, 184, 0.15)', color: activePersonaObj.allowDiagrams ? '#06b6d4' : '#94a3b8', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            {activePersonaObj.allowDiagrams ? '📊 Kroki Diagrams Supported' : '📝 Text-Only Roleplay Mode'}
          </span>
        </div>

        {/* Character Card Pills Slider */}
        <div className="persona-pills-scroll-row flex items-center gap-2 overflow-x-auto py-1">
          {PERSONAS.filter(p => p.id !== 'default').map(p => {
            const isActive = selectedPersona === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPersonaChange(p.id)}
                className={`persona-card-pill flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${isActive ? 'active-pill' : ''}`}
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(99, 102, 241, 0.25))' : 'rgba(30, 41, 59, 0.6)',
                  border: isActive ? '1.5px solid var(--accent-cyan)' : '1px solid rgba(148, 163, 184, 0.2)',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  boxShadow: isActive ? '0 0 14px rgba(6, 182, 212, 0.3)' : 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{p.icon}</span>
                <div className="text-left">
                  <div style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500 }}>{p.name}</div>
                </div>
              </button>
            );
          })}
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
            <div className="kokonut-left-actions flex items-center gap-2">
              {onProviderChange && onModelChange && (
                <>
                  <div className="kokonut-model-picker-pill provider-pill flex items-center gap-1">
                    <span className="picker-icon">⚡</span>
                    <select
                      value={selectedProvider}
                      onChange={(e) => {
                        const newProvider = e.target.value;
                        onProviderChange(newProvider);
                        const group = PROVIDERS.find(p => p.id === newProvider);
                        if (group && group.models.length > 0) {
                          onModelChange(group.models[0].value);
                        }
                      }}
                      className="kokonut-bottom-model-select"
                    >
                      {PROVIDERS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="kokonut-model-picker-pill model-pill flex items-center gap-1">
                    <span className="picker-icon">🤖</span>
                    <select
                      value={selectedModel}
                      onChange={(e) => onModelChange(e.target.value)}
                      className="kokonut-bottom-model-select"
                    >
                      {currentProviderGroup.models.map(m => (
                        <option key={m.value} value={m.value}>{m.name}</option>
                      ))}
                    </select>
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
