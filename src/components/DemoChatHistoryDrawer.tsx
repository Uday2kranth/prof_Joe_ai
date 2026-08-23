import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  X, 
  MessageSquare, 
  Clock, 
  Globe, 
  Eye, 
  Printer, 
  Search, 
  RotateCcw,
  Sparkles,
  Layers,
  GraduationCap,
  Pin,
  Award,
  Tag,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { ChatSession } from '../types';

interface DemoChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  isPersistentWebSearch?: boolean;
  onTogglePersistentWebSearch?: () => void;
  isDiagramsEnabled?: boolean;
  onToggleDiagrams?: () => void;
  isBeginnerFriendly?: boolean;
  onToggleBeginnerFriendly?: () => void;
  onOpenPdfPreview?: () => void;
  onNativePrintPdf?: () => void;
  onClearActiveSession?: () => void;
  onOpenCheatSheet?: () => void;
  onOpenFlashcards?: () => void;
  onOpenQuiz?: () => void;
  onToggleSessionTag?: (sessionId: string, tag: string) => void;
  onSyncSessions?: () => void;
}

export const DemoChatHistoryDrawer: React.FC<DemoChatHistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isPersistentWebSearch = false,
  onTogglePersistentWebSearch,
  isDiagramsEnabled = false,
  onToggleDiagrams,
  isBeginnerFriendly = false,
  onToggleBeginnerFriendly,
  onOpenPdfPreview,
  onNativePrintPdf,
  onClearActiveSession,
  onOpenCheatSheet,
  onOpenFlashcards,
  onOpenQuiz,
  onToggleSessionTag,
  onSyncSessions
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('ALL');
  const [isTagsExpanded, setIsTagsExpanded] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [taggingSessionId, setTaggingSessionId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const defaultTags = useMemo(() => [
    'Unit-1', 'Unit-2', '12-Marks', 'MIGFHT', 'Networks', 'Stats', 'Exam-Day', 'Viva'
  ], []);

  const [customTags, setCustomTags] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chatterbot_custom_tags');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAddingCustomTag, setIsAddingCustomTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const allAvailableTags = useMemo(() => {
    return Array.from(new Set([...defaultTags, ...customTags]));
  }, [defaultTags, customTags]);

  const handleCreateCustomTag = (tagStr?: string) => {
    const raw = (tagStr !== undefined ? tagStr : newTagInput).trim().replace(/^#+/, '').trim();
    if (!raw) {
      setIsAddingCustomTag(false);
      return;
    }
    const cleanTag = raw.replace(/\s+/g, '-');
    if (!allAvailableTags.includes(cleanTag)) {
      const updated = [...customTags, cleanTag];
      setCustomTags(updated);
      try {
        localStorage.setItem('chatterbot_custom_tags', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save custom tags:', e);
      }
    }
    setSelectedTagFilter(cleanTag);
    setNewTagInput('');
    setIsAddingCustomTag(false);
  };

  const handleDeleteCustomTag = (tagToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customTags.filter(t => t !== tagToDelete);
    setCustomTags(updated);
    try {
      localStorage.setItem('chatterbot_custom_tags', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not update custom tags:', e);
    }
    if (selectedTagFilter === tagToDelete) {
      setSelectedTagFilter('ALL');
    }
  };

  const handleManualSync = async () => {
    if (!onSyncSessions || isSyncing) return;
    setIsSyncing(true);
    try {
      await onSyncSessions();
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  if (!isOpen) return null;

  // Real-time Session Search & Tag Filter
  const filteredSessions = sessions.filter(s => {
    if (selectedTagFilter !== 'ALL') {
      const hasTag = (s.tags || []).includes(selectedTagFilter);
      const titleMatches = (s.title || '').toLowerCase().includes(selectedTagFilter.toLowerCase());
      if (!hasTag && !titleMatches) return false;
    }
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = (s.title || '').toLowerCase().includes(query);
    const messageMatch = s.messages.some(m => (m.content || '').toLowerCase().includes(query));
    return titleMatch || messageMatch;
  });

  return (
    <div className="demo-drawer-overlay" onClick={onClose}>
      <aside 
        className="demo-chat-history-drawer"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '390px', maxWidth: '92vw' }}
      >
        {/* Drawer Header */}
        <div className="demo-drawer-header">
          <div className="demo-drawer-title">
            <Clock size={16} style={{ color: 'var(--accent-cyan)' }} />
            <h3>Chat Control Deck</h3>
          </div>
          <div className="flex items-center gap-1.5">
            {onSyncSessions && (
              <button
                type="button"
                onClick={handleManualSync}
                className="demo-sync-btn"
                title="Live Cloud Sync with Mobile & Other Devices"
                disabled={isSyncing}
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
              </button>
            )}
            <button 
              type="button" 
              onClick={onClose} 
              className="demo-icon-btn"
              aria-label="Close Chat History Drawer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 🍱 BENTO CONTROL DECK (4-COLUMN COMPACT GRID) */}
        <div className="demo-bento-deck">
          <div className="bento-deck-header">
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} style={{ color: 'var(--accent-cyan)' }} />
              <span>COMMAND CONTROLS</span>
            </div>
            {onClearActiveSession && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="bento-clear-context-btn"
                title="Clear messages in active chat"
              >
                <RotateCcw size={11} />
                <span>Clear Context</span>
              </button>
            )}
          </div>

          <div className="bento-grid-container-4col">
            {/* Tile 1: Exam Cheat Sheet */}
            {onOpenCheatSheet && (
              <div 
                className="bento-card-tile-compact active-glow-amber"
                onClick={() => {
                  onOpenCheatSheet();
                  onClose();
                }}
                title="Open Pinned Formulas, Definitions & 1-Page Cheat Sheet Print"
              >
                <div className="bento-tile-icon-sm amber">
                  <Pin size={13} />
                </div>
                <span className="bento-tile-label">Cheat Sheet</span>
              </div>
            )}

            {/* Tile 2: Interactive Flashcards */}
            {onOpenFlashcards && (
              <div 
                className="bento-card-tile-compact active-glow-cyan"
                onClick={() => {
                  onOpenFlashcards();
                  onClose();
                }}
                title="Generate 3D Flip Flashcards from Active Discussion"
              >
                <div className="bento-tile-icon-sm cyan">
                  <Layers size={13} />
                </div>
                <span className="bento-tile-label">Flashcards</span>
              </div>
            )}

            {/* Tile 3: Practice Quiz */}
            {onOpenQuiz && (
              <div 
                className="bento-card-tile-compact active-glow-emerald"
                onClick={() => {
                  onOpenQuiz();
                  onClose();
                }}
                title="Generate 5-Question Practice Exam Quiz with Solutions"
              >
                <div className="bento-tile-icon-sm emerald">
                  <Award size={13} />
                </div>
                <span className="bento-tile-label">Quiz</span>
              </div>
            )}

            {/* Tile 4: Web Search */}
            <div 
              className={`bento-card-tile-compact ${isPersistentWebSearch ? 'active-glow-cyan' : ''}`}
              onClick={onTogglePersistentWebSearch}
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

            {/* Tile 5: Visual Diagrams */}
            <div 
              className={`bento-card-tile-compact ${isDiagramsEnabled ? 'active-glow-purple' : ''}`}
              onClick={onToggleDiagrams}
              title="Toggle Multi-Engine Visual Diagrams (Mermaid, Kroki, Graphviz, PlantUML, FunctionPlot)"
            >
              <div className="bento-tile-icon-sm purple">
                <Layers size={13} />
              </div>
              <span className="bento-tile-label">Diagrams</span>
              <span className={`bento-mini-badge ${isDiagramsEnabled ? 'on' : 'off'}`}>
                {isDiagramsEnabled ? 'ON' : 'OFF'}
              </span>
            </div>

            {/* Tile 6: Beginner Mode */}
            <div 
              className={`bento-card-tile-compact ${isBeginnerFriendly ? 'active-glow-emerald' : ''}`}
              onClick={onToggleBeginnerFriendly}
              title="Toggle 6-Stage Beginner-Friendly Scaffolding & Term Breakdown"
            >
              <div className="bento-tile-icon-sm emerald">
                <GraduationCap size={13} />
              </div>
              <span className="bento-tile-label">Beginner</span>
              <span className={`bento-mini-badge ${isBeginnerFriendly ? 'on' : 'off'}`}>
                {isBeginnerFriendly ? 'ON' : 'OFF'}
              </span>
            </div>

            {/* Tile 7: Preview Chat */}
            <div 
              className="bento-card-tile-compact"
              onClick={() => {
                if (onOpenPdfPreview) onOpenPdfPreview();
                onClose();
              }}
              title="Open styled in-app Preview Modal with Save Image & Save PDF"
            >
              <div className="bento-tile-icon-sm blue">
                <Eye size={13} />
              </div>
              <span className="bento-tile-label">Preview</span>
            </div>

            {/* Tile 8: Native Print / PDF */}
            <div 
              className="bento-card-tile-compact"
              onClick={() => {
                if (onNativePrintPdf) onNativePrintPdf();
              }}
              title="Open System Native Chrome Print Preview Dialog"
            >
              <div className="bento-tile-icon-sm purple">
                <Printer size={13} />
              </div>
              <span className="bento-tile-label">Print / PDF</span>
            </div>
          </div>
        </div>

        {/* Clear Context Safety Confirmation */}
        {showClearConfirm && (
          <div className="demo-clear-confirm-banner">
            <p>Clear all messages in active chat?</p>
            <div className="flex items-center gap-2 mt-2">
              <button 
                type="button" 
                className="confirm-yes-btn"
                onClick={() => {
                  if (onClearActiveSession) onClearActiveSession();
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

        {/* 🏷️ SUBJECT / UNIT TAG FILTER BAR (COLLAPSIBLE ACCORDION) */}
        <div className="demo-drawer-tags-deck">
          <div 
            className="demo-drawer-tags-header"
            onClick={() => setIsTagsExpanded(prev => !prev)}
            title="Toggle tag filters"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Tag size={12} style={{ color: 'var(--accent-cyan)' }} />
              <span className="tags-header-label">TAG FILTERS</span>
              {selectedTagFilter !== 'ALL' && (
                <span className="tags-header-active-badge">#{selectedTagFilter}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {selectedTagFilter !== 'ALL' && (
                <span 
                  className="tags-header-clear-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTagFilter('ALL');
                  }}
                  title="Reset to All"
                >
                  Clear
                </span>
              )}
              <button 
                type="button" 
                className="tag-toggle-btn"
                aria-label={isTagsExpanded ? 'Collapse tags' : 'Expand tags'}
              >
                {isTagsExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          </div>

          {isTagsExpanded && (
            <div className="demo-drawer-tags-bar">
              <button
                type="button"
                onClick={() => setSelectedTagFilter('ALL')}
                className={`drawer-tag-filter-pill ${selectedTagFilter === 'ALL' ? 'active' : ''}`}
              >
                <Tag size={10} />
                <span>All</span>
              </button>

              {allAvailableTags.map(tag => {
                const isCustom = customTags.includes(tag);
                const isSelected = selectedTagFilter === tag;

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTagFilter(isSelected ? 'ALL' : tag)}
                    className={`drawer-tag-filter-pill ${isSelected ? 'active' : ''} ${isCustom ? 'custom-tag' : ''}`}
                  >
                    <span>#{tag}</span>
                    {isCustom && (
                      <span
                        onClick={(e) => handleDeleteCustomTag(tag, e)}
                        className="delete-custom-tag-btn"
                        title={`Delete custom tag #${tag}`}
                      >
                        ×
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Inline Custom Tag Creator */}
              {isAddingCustomTag ? (
                <div className="inline-tag-creator">
                  <input
                    type="text"
                    autoFocus
                    placeholder="tag name..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateCustomTag();
                      if (e.key === 'Escape') setIsAddingCustomTag(false);
                    }}
                    className="inline-tag-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleCreateCustomTag()}
                    className="inline-tag-confirm-btn"
                    title="Add Tag"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomTag(false)}
                    className="inline-tag-cancel-btn"
                    title="Cancel"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingCustomTag(true)}
                  className="drawer-tag-filter-pill add-custom-tag-pill"
                  title="Add Custom Tag"
                >
                  <Plus size={11} />
                  <span>Custom Tag</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 🔍 UNIFIED SEARCH BAR & NEW CHAT ACTION ROW (DIRECTLY ABOVE CHAT HISTORY) */}
        <div className="demo-drawer-search-action-row">
          <div className="demo-drawer-search-bar">
            <Search size={14} style={{ color: 'var(--accent-cyan)' }} />
            <input
              type="text"
              placeholder="Search past chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="demo-search-input"
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
          <button
            type="button"
            onClick={() => {
              onNewSession();
              onClose();
            }}
            className="drawer-new-chat-btn"
            title="Start New Chat Session"
          >
            <Plus size={15} />
            <span>New Chat</span>
          </button>
        </div>

        {/* 📜 SCROLLABLE SESSIONS LIST */}
        <div className="demo-drawer-sessions-list">
          {filteredSessions.length === 0 ? (
            <div className="demo-empty-sessions">
              <MessageSquare size={24} className="text-slate-500 mb-1" />
              <p>{searchQuery || selectedTagFilter !== 'ALL' ? 'No matching chat sessions' : 'No chat history yet'}</p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const msgCount = session.messages.length;
              const titleText = session.title || 'Untitled Conversation';
              const sessionTags = session.tags || [];

              return (
                <div
                  key={session.id}
                  className={`demo-session-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                  style={{ flexDirection: 'column', alignItems: 'stretch', gap: '6px' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="demo-session-info flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare size={14} className="flex-shrink-0" style={{ color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
                      <span className="demo-session-title truncate">
                        {titleText}
                      </span>
                    </div>

                    <div className="demo-session-meta flex items-center gap-1 flex-shrink-0">
                      <span className="demo-msg-badge">{msgCount} msgs</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="demo-delete-session-btn"
                        title="Delete chat session"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Inline Tag Pills & Tag Selector */}
                  <div className="flex items-center gap-1.5 flex-wrap pl-6" onClick={(e) => e.stopPropagation()}>
                    {sessionTags.map(tag => (
                      <span
                        key={tag}
                        onClick={() => onToggleSessionTag && onToggleSessionTag(session.id, tag)}
                        className="session-tag-badge"
                        title={`Click to remove #${tag}`}
                      >
                        #{tag}
                      </span>
                    ))}

                    <button
                      type="button"
                      onClick={() => setTaggingSessionId(taggingSessionId === session.id ? null : session.id)}
                      className="tag-add-btn"
                      title="Add Subject / Unit Tag"
                    >
                      <Tag size={9} />
                      <span>{taggingSessionId === session.id ? '✕ Close' : '+ Tag'}</span>
                    </button>

                    {taggingSessionId === session.id && (
                      <div className="session-tag-selector-popover" onClick={(e) => e.stopPropagation()}>
                        <div className="tag-selector-header">
                          <Tag size={10} className="text-cyan-400" />
                          <span>Select / Add Tag:</span>
                        </div>
                        <div className="tag-selector-grid">
                          {allAvailableTags.map(t => {
                            const isTagged = sessionTags.includes(t);
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onToggleSessionTag) onToggleSessionTag(session.id, t);
                                }}
                                className={`tag-selector-pill ${isTagged ? 'active' : ''}`}
                                title={isTagged ? `Remove #${t}` : `Add #${t}`}
                              >
                                <span>#{t}</span>
                                {isTagged && <Check size={10} strokeWidth={3} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
};

export default DemoChatHistoryDrawer;
