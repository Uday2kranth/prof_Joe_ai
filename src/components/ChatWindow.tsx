import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, X, Zap, FileText, CheckSquare, MessageSquare, Paperclip, Eye, Printer } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentProviderGroup = PROVIDERS.find(p => p.id === selectedProvider) || PROVIDERS[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
      if (isMobile) {
        // On mobile view, Enter inserts a new line (\n) so users can compose multi-line prompts smoothly
        return;
      }
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

  const [isSessionPreviewOpen, setIsSessionPreviewOpen] = useState(false);

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

      {/* Input Control Container */}
      <div className="input-bar-container">
        {/* System Prompt & Exam Mode Selector Pill Nav Bar */}
        <div className="input-modes-bar flex items-center justify-between gap-2 overflow-x-auto py-1 px-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setPromptMode('auto')}
              className={`mode-pill ${promptMode === 'auto' ? 'active' : ''}`}
              title="Automatic OU Exam Intelligence Engine"
            >
              <Zap size={12} /> Auto
            </button>

            <button
              type="button"
              onClick={() => setPromptMode('12marks')}
              className={`mode-pill ${promptMode === '12marks' ? 'active' : ''}`}
              title="12 Marks Essay Evaluator"
            >
              <FileText size={12} /> 12 Marks
            </button>

            <button
              type="button"
              onClick={() => setPromptMode('2marks')}
              className={`mode-pill ${promptMode === '2marks' ? 'active' : ''}`}
              title="3-4 Marks Short Answer"
            >
              <CheckSquare size={12} /> 3–4 Marks
            </button>

            <button
              type="button"
              onClick={() => setPromptMode('general')}
              className={`mode-pill ${promptMode === 'general' ? 'active' : ''}`}
              title="General AI Mode"
            >
              <MessageSquare size={12} /> General
            </button>
          </div>

          <button
            type="button"
            onClick={() => setWebSearch(!webSearch)}
            className={`web-search-toggle-pill ${webSearch ? 'active' : ''}`}
            title="Toggle Web Search RAG"
          >
            <Globe size={12} />
            <span>RAG {webSearch ? 'ON' : 'OFF'}</span>
          </button>

          {activeSystemPromptTitle && (
            <div className="system-prompt-active-badge">
              <span>📌 {activeSystemPromptTitle}</span>
              {onClearSystemPrompt && (
                <button
                  type="button"
                  onClick={onClearSystemPrompt}
                  className="clear-prompt-btn"
                  title="Clear active system prompt"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Textarea + Bottom Action Row */}
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
            placeholder={`Ask ${selectedModel}... (Press Enter to Send)`}
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
