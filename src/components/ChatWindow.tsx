import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, Sparkles, Loader2, Cpu, Zap, FileText, CheckSquare, MessageSquare, X, CheckCircle2, Paperclip, Download, Layers } from 'lucide-react';
import type { Message } from '../types';
import { MessageItem } from './MessageItem';
import { PROVIDERS } from '../constants';
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
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

  const handleExportFullChatPdf = async () => {
    await printSessionToPdf(messages, activeSystemPromptTitle || 'Exam Chat Session');
  };

  return (
    <div className="chat-window-container">
      <div className="messages-viewport">
        {/* Top Header Bar for Active Prompt */}
        {activeSystemPromptTitle && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid var(--accent-cyan)',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '0.82rem',
            color: 'var(--accent-cyan)',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} />
              <span><strong>Active System Prompt:</strong> {activeSystemPromptTitle}</span>
            </div>
            {onClearSystemPrompt && (
              <button
                onClick={onClearSystemPrompt}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
                title="Remove Active System Prompt"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="empty-state-hero">
            <div className="hero-icon-box" style={{ padding: 0, overflow: 'hidden', borderRadius: '50%', width: '72px', height: '72px', margin: '0 auto 16px auto', border: '2px solid var(--accent-cyan)' }}>
              <img src="/joe-avatar.png" alt="Prof. Joe" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h2>Welcome to Prof. Joe AI Engine</h2>
            <p>Active Provider: <strong>{selectedProvider || 'Ollama Cloud'}</strong> | Model: <strong>{selectedModel}</strong></p>

            <div className="quick-suggestions-grid">
              <div
                className="suggestion-card card-box"
                onClick={() => setInputPrompt('Explain Apriori algorithm step-by-step with an association rule mining example.')}
              >
                <Zap size={18} className="text-amber-400" />
                <span>Apriori Algorithm Step-by-Step</span>
              </div>
              <div
                className="suggestion-card card-box"
                onClick={() => setInputPrompt('Compare K-Means vs DBSCAN clustering in a clean 4-row markdown table.')}
              >
                <Sparkles size={18} className="text-purple-400" />
                <span>K-Means vs DBSCAN Comparison</span>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <MessageItem
              key={msg.id}
              message={msg}
              isLast={index === messages.length - 1}
              onRetry={onRetry}
              onEditUserMessage={handleEditPromptInBox}
            />
          ))
        )}

        {isLoading && (
          <div className="message-row assistant-row loading-row">
            <div className="avatar">
              <Cpu size={18} className="spin-icon text-cyan-400" />
            </div>
            <div className="bubble-wrapper">
              <div className="message-bubble assistant-bubble loading-bubble">
                <Loader2 size={16} className="spin-icon" />
                <span>Generating response...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* KokonutUI-Inspired Sleek Input Bar Container */}
      <div className="chat-input-bar-container card-box">
        <div className="input-toolbar-top">
          {/* KokonutUI Model Selector Dropdown inside Input Bar */}
          {onProviderChange && onModelChange && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={13} className="text-cyan-400" />
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
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {PROVIDERS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <select
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: '150px'
                }}
              >
                {currentProviderGroup.models.map(m => (
                  <option key={m.value} value={m.value}>{m.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="mode-selector-strip">
            <button
              type="button"
              onClick={() => setPromptMode('auto')}
              className={`mode-pill ${promptMode === 'auto' ? 'active' : ''}`}
              title="Auto-Detect question type"
            >
              <Zap size={12} /> Auto
            </button>

            <button
              type="button"
              onClick={() => setPromptMode('12marks')}
              className={`mode-pill ${promptMode === '12marks' ? 'active' : ''}`}
              title="12 Marks Essay Evaluator (600-900 words)"
            >
              <FileText size={12} /> 12 Marks
            </button>

            <button
              type="button"
              onClick={() => setPromptMode('2marks')}
              className={`mode-pill ${promptMode === '2marks' ? 'active' : ''}`}
              title="3-4 Marks Short Answer (150-250 words)"
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
            <Globe size={13} />
            <span>Web Search {webSearch ? 'ON' : 'OFF'}</span>
          </button>

          {activeSystemPromptTitle && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(168, 85, 247, 0.15)',
              color: '#c084fc',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              padding: '3px 10px',
              borderRadius: '16px',
              fontSize: '0.72rem',
              fontWeight: 600,
              flexShrink: 0
            }}>
              <span>📌 {activeSystemPromptTitle}</span>
              {onClearSystemPrompt && (
                <button
                  type="button"
                  onClick={onClearSystemPrompt}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Clear active system prompt"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}

          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleExportFullChatPdf}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)',
                border: '1px solid var(--accent-cyan)',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Export complete chat session to PDF"
            >
              <Download size={13} />
              <span>Export PDF</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="chat-form-modern">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.15s'
            }}
            title="Attach File or PDF"
          >
            <Paperclip size={18} />
          </button>

          <textarea
            ref={textareaRef}
            value={inputPrompt}
            onChange={(e) => {
              setInputPrompt(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${selectedModel}... (Press Enter to send, Shift+Enter for newline)`}
            rows={1}
            className="chat-textarea-modern"
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="send-btn-modern"
            title="Send Message"
          >
            {isLoading ? <Loader2 size={16} className="spin-icon" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};
