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
  Menu
} from 'lucide-react';
import { QuickExtractionModal } from './QuickExtractionModal';
import { CodeLabPresetDrawer, ACADEMIC_PRESETS } from './CodeLabPresetDrawer';
import { MonacoEditorWrapper } from './MonacoEditorWrapper';
import { CodeLabControlDeck } from './CodeLabControlDeck';
import { ResetSessionModal } from './ResetSessionModal';
import { saveCodeLabSession } from '../services/indexedDbService';
import { PROVIDERS } from '../constants';
import type { UserCustomModels, ChatSession } from '../types';

interface PracticalCodeLabViewProps {
  onBackToHub?: () => void;
  onSendMessage: (prompt: string, webSearch: boolean, mode: string, systemPrompt?: string) => void;
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
}

interface GeneratedFile {
  fileName: string;
  language: string;
  codeContent: string;
}

export function PracticalCodeLabView({
  onBackToHub: _onBackToHub,
  onSendMessage,
  isLoading,
  messages,
  selectedProvider = 'Ollama Cloud',
  selectedModel,
  onProviderChange,
  onModelChange,
  customModels,
  activePresetId = 'ml_science',
  onSelectPresetId,
  onResetPresetChat,
  presetSessions = [],
  activeSessionId = '',
  onSelectSession,
  onNewSession,
  onDeleteSession
}: PracticalCodeLabViewProps) {
  const [inputPrompt, setInputPrompt] = useState('');
  const activePreset = ACADEMIC_PRESETS.find(p => p.id === activePresetId) || ACADEMIC_PRESETS[0];
  const [isPresetDrawerOpen, setIsPresetDrawerOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isQuickExtractionOpen, setIsQuickExtractionOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [editorMode, setEditorMode] = useState<'fast' | 'monaco'>('fast');
  const [isWebSearch, setIsWebSearch] = useState(false);
  const activeUser = localStorage.getItem('chatterbot_username') || 'guest';

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
    return PROVIDERS.find(p => p.name === selectedProvider) || PROVIDERS[0];
  }, [selectedProvider]);

  const availableModels = useMemo(() => {
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

  // Split Pane Resizing
  const [leftPaneWidthPercent, setLeftPaneWidthPercent] = useState(42);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabListRef = useRef<HTMLDivElement>(null);

  // Parsed Files & Tabs
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

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
    onSendMessage(
      inputPrompt, 
      isWebSearch, 
      'general', 
      activePreset ? activePreset.systemInstruction : undefined
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

  return (
    <div className="code-lab-view-container">
      {/* Header Bar */}
      <div className="code-lab-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            type="button" 
            onClick={() => setIsHistoryDrawerOpen(true)} 
            className="extractor-btn-secondary"
            style={{ padding: '7px 10px', borderRadius: '10px' }}
            title="Open Code Lab Deck (Menu & History)"
          >
            <Menu size={18} style={{ color: '#06b6d4' }} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Practical Academic Code Lab</span>
              <span className="extractor-studio-tag">SPLIT-SCREEN IDE</span>
            </h1>
          </div>
        </div>

        {/* Active Preset & Model Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Provider Dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={selectedProvider}
              onChange={(e) => onProviderChange && onProviderChange(e.target.value)}
              style={{
                appearance: 'none',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                borderRadius: '12px',
                padding: '6px 28px 6px 12px',
                color: '#38bdf8',
                fontSize: '0.78rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {PROVIDERS.map((p) => (
                <option key={p.name} value={p.name} style={{ background: '#0f172a', color: '#f8fafc' }}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '8px', color: '#38bdf8', pointerEvents: 'none' }} />
          </div>

          {/* Model Dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={selectedModel}
              onChange={(e) => onModelChange && onModelChange(e.target.value)}
              style={{
                appearance: 'none',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                borderRadius: '12px',
                padding: '6px 28px 6px 12px',
                color: '#c084fc',
                fontSize: '0.78rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {availableModels.map((m) => (
                <option key={m.value} value={m.value} style={{ background: '#0f172a', color: '#f8fafc' }}>
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '8px', color: '#c084fc', pointerEvents: 'none' }} />
          </div>

          {activePreset && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '16px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.4)', color: '#06b6d4', fontSize: '0.78rem', fontWeight: 700 }}>
              <Sparkles size={14} />
              <span>Mode: {activePreset.name}</span>
            </div>
          )}

          {/* Editor Mode Switcher Pill */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '2px' }}>
            <button
              type="button"
              onClick={() => setEditorMode('fast')}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '16px', border: 'none',
                background: editorMode === 'fast' ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(168, 85, 247, 0.25))' : 'transparent',
                color: editorMode === 'fast' ? '#38bdf8' : '#94a3b8',
                fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer'
              }}
              title="Fast Preview Mode (Instant Load)"
            >
              <Zap size={12} />
              <span>⚡ Fast Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('monaco')}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '16px', border: 'none',
                background: editorMode === 'monaco' ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(168, 85, 247, 0.25))' : 'transparent',
                color: editorMode === 'monaco' ? '#38bdf8' : '#94a3b8',
                fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer'
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
            className="extractor-btn-primary"
            style={{ fontSize: '0.78rem', padding: '6px 14px' }}
          >
            <Sliders size={14} />
            <span>{activePreset ? 'Change Lab Preset' : 'Select Lab Preset'}</span>
          </button>
        </div>
      </div>

      {/* Split Pane */}
      <div ref={containerRef} className="code-lab-split-pane">
        {/* Left Panel: Chat & Prompt OCR */}
        <div className="code-lab-chat-panel" style={{ width: `${leftPaneWidthPercent}%` }}>
          {/* Chat Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b', maxWidth: '340px' }}>
                <Code size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>Practical Code & ML Lab Ready</h3>
                <p style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                  Ask Prof. Joe AI to write lab code, train ML models, process paper dataset tables, or generate multi-file web apps.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '90%',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(30, 41, 59, 0.8)',
                    color: '#f8fafc',
                    fontSize: '0.84rem',
                    lineHeight: 1.5,
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.7, marginBottom: '4px' }}>
                    {msg.role === 'user' ? 'Student Prompt' : 'Prof. Joe AI'}
                  </div>
                  {msg.content}
                  {msg.role === 'assistant' && (() => {
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
                </div>
              ))
            )}
          </div>

          {/* Prompt Input Box with Quick Extractor OCR */}
          <div style={{ padding: '14px', background: 'rgba(2, 6, 23, 0.9)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '8px 12px' }}>
              <button
                type="button"
                onClick={() => setIsQuickExtractionOpen(true)}
                style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', padding: '4px' }}
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
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f8fafc', fontSize: '0.84rem', resize: 'none', height: '40px', fontFamily: 'inherit' }}
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
          className="code-lab-resize-handle"
          onMouseDown={() => setIsResizing(true)}
          title="Drag to resize panels"
        />

        {/* Right Panel: Resizable Code Viewer IDE */}
        <div className="code-lab-ide-panel">
          {/* File Tab Bar */}
          <div className="code-lab-tab-bar">
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
              <div className="code-lab-tab-edge-left" />
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
              <div className="code-lab-tab-edge-right" />
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
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleCopyCode(activeFile.codeContent)}
                  className="extractor-btn-secondary"
                  style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                >
                  {isCopied ? <Check size={13} style={{ color: '#34d399' }} /> : <Copy size={13} />}
                  <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSingleFile(activeFile)}
                  className="extractor-btn-primary"
                  style={{ fontSize: '0.74rem', padding: '4px 12px' }}
                >
                  <Download size={13} />
                  <span>Download {activeFile.fileName}</span>
                </button>

                {files.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    className="code-lab-zip-btn"
                    title="Download all open code files as ZIP archive"
                  >
                    <Package size={13} />
                    <span>Download All (.zip)</span>
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
              />
            ) : (
              <pre className="code-lab-editor-area" style={{ height: '100%', margin: 0 }}>
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
        activePresetId={activePreset?.id || 'ml_science'}
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
        onSendToChat={(extractedText, fileName) => {
          setInputPrompt(prev => `${prev}\n\n[Lab Paper Dataset: ${fileName}]\n${extractedText}`);
        }}
      />

      {/* Native Code Lab Control Deck Sidebar */}
      <CodeLabControlDeck
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        presetName={activePreset?.name || 'Code Lab'}
        presetId={activePresetId}
        selectedModel={selectedModel}
        sessions={presetSessions}
        activeSessionId={activeSessionId}
        onSelectSession={(sessionId) => {
          if (onSelectSession) onSelectSession(sessionId);
          setIsHistoryDrawerOpen(false);
        }}
        onNewSession={() => {
          if (onNewSession) onNewSession();
          setIsHistoryDrawerOpen(false);
        }}
        onDeleteSession={(sessionId) => {
          if (onDeleteSession) onDeleteSession(sessionId);
        }}
        onResetSession={() => {
          setIsResetModalOpen(true);
          setIsHistoryDrawerOpen(false);
        }}
        webSearch={isWebSearch}
        onToggleWebSearch={() => setIsWebSearch(prev => !prev)}
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
