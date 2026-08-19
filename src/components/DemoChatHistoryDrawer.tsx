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
  Check
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
  isBeginnerFriendly?: boolean;
  onToggleBeginnerFriendly?: () => void;
  onOpenPdfPreview?: () => void;
  onNativePrintPdf?: () => void;
  onClearActiveSession?: () => void;
  onOpenCheatSheet?: () => void;
  onOpenFlashcards?: () => void;
  onOpenQuiz?: () => void;
  onToggleSessionTag?: (sessionId: string, tag: string) => void;
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
  isBeginnerFriendly = false,
  onToggleBeginnerFriendly,
  onOpenPdfPreview,
  onNativePrintPdf,
  onClearActiveSession,
  onOpenCheatSheet,
  onOpenFlashcards,
  onOpenQuiz,
  onToggleSessionTag
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('ALL');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [taggingSessionId, setTaggingSessionId] = useState<string | null>(null);

  const availableTags = useMemo(() => [
    'Unit-1', 'Unit-2', '12-Marks', 'MIGFHT', 'Networks', 'Stats', 'Exam-Day', 'Viva'
  ], []);

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
            <Clock size={18} className="text-cyan-400" />
            <h3>Chat Control Deck</h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="demo-icon-btn"
            aria-label="Close Chat History Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="demo-drawer-action">
          <button 
            type="button" 
            onClick={() => {
              onNewSession();
              onClose();
            }} 
            className="demo-new-chat-btn"
          >
            <Plus size={16} />
            <span>New Chat Session</span>
          </button>
        </div>

        {/* 🍱 BENTO CONTROL DECK */}
        <div className="demo-bento-deck">
          <div className="bento-deck-header">
            <Sparkles size={13} className="text-cyan-400" />
            <span>COMMAND CONTROLS</span>
          </div>

          <div className="bento-grid-container">
            {/* Tile: Exam Cheat Sheet Deck */}
            {onOpenCheatSheet && (
              <div 
                className="bento-card-tile active-glow-amber"
                onClick={() => {
                  onOpenCheatSheet();
                  onClose();
                }}
                title="Open Pinned Formulas, Definitions & 1-Page Cheat Sheet Print"
              >
                <div className="bento-tile-icon amber">
                  <Pin size={16} />
                </div>
                <div className="bento-tile-content">
                  <span className="bento-tile-title">Cheat Sheet</span>
                  <span className="bento-tile-sub">Pinned Formulas</span>
                </div>
              </div>
            )}

            {/* Tile: Interactive Flashcards */}
            {onOpenFlashcards && (
              <div 
                className="bento-card-tile active-glow-cyan"
                onClick={() => {
                  onOpenFlashcards();
                  onClose();
                }}
                title="Generate 3D Flip Flashcards from Active Discussion"
              >
                <div className="bento-tile-icon cyan">
                  <Layers size={16} />
                </div>
                <div className="bento-tile-content">
                  <span className="bento-tile-title">Flashcards</span>
                  <span className="bento-tile-sub">3D Flip Cards</span>
                </div>
              </div>
            )}

            {/* Tile: Practice Quiz */}
            {onOpenQuiz && (
              <div 
                className="bento-card-tile active-glow-emerald"
                onClick={() => {
                  onOpenQuiz();
                  onClose();
                }}
                title="Generate 5-Question Practice Exam Quiz with Solutions"
              >
                <div className="bento-tile-icon emerald">
                  <Award size={16} />
                </div>
                <div className="bento-tile-content">
                  <span className="bento-tile-title">Practice Quiz</span>
                  <span className="bento-tile-sub">Exam Test</span>
                </div>
              </div>
            )}

            {/* Tile: Persistent Web Search */}
            <div 
              className={`bento-card-tile ${isPersistentWebSearch ? 'active-glow-cyan' : ''}`}
              onClick={onTogglePersistentWebSearch}
              title="Toggle Persistent Internet Search across all messages"
            >
              <div className="bento-tile-icon cyan">
                <Globe size={16} />
              </div>
              <div className="bento-tile-content">
                <span className="bento-tile-title">Web Search</span>
                <span className="bento-tile-status">
                  {isPersistentWebSearch ? '🟢 ON' : '⚪ OFF'}
                </span>
              </div>
            </div>

            {/* Tile: Dedicated Beginner-Friendly Mode Toggle */}
            <div 
              className={`bento-card-tile ${isBeginnerFriendly ? 'active-glow-emerald' : ''}`}
              onClick={onToggleBeginnerFriendly}
              title="Toggle 6-Stage Beginner-Friendly Scaffolding & Term Breakdown"
            >
              <div className="bento-tile-icon emerald">
                <GraduationCap size={16} />
              </div>
              <div className="bento-tile-content">
                <span className="bento-tile-title">Beginner Mode</span>
                <span className="bento-tile-status">
                  {isBeginnerFriendly ? '🟢 ON' : '⚪ OFF'}
                </span>
              </div>
            </div>

            {/* Tile: Preview Chat */}
            <div 
              className="bento-card-tile"
              onClick={() => {
                if (onOpenPdfPreview) onOpenPdfPreview();
                onClose();
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

            {/* Tile: Native Print / PDF */}
            <div 
              className="bento-card-tile"
              onClick={() => {
                if (onNativePrintPdf) onNativePrintPdf();
              }}
              title="Open System Native Chrome Print Preview Dialog"
            >
              <div className="bento-tile-icon purple">
                <Printer size={16} />
              </div>
              <div className="bento-tile-content">
                <span className="bento-tile-title">Native Print</span>
                <span className="bento-tile-sub">System Chrome</span>
              </div>
            </div>

            {/* Tile: Clear Session Context */}
            <div 
              className="bento-card-tile danger-tile"
              onClick={() => setShowClearConfirm(true)}
              title="Clear messages in active session"
            >
              <div className="bento-tile-icon rose">
                <RotateCcw size={16} />
              </div>
              <div className="bento-tile-content">
                <span className="bento-tile-title">Clear Context</span>
                <span className="bento-tile-sub">Reset Messages</span>
              </div>
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

        {/* 🏷️ SUBJECT / UNIT TAG FILTER BAR */}
        <div className="demo-drawer-tags-bar">
          <button
            type="button"
            onClick={() => setSelectedTagFilter('ALL')}
            className={`drawer-tag-filter-pill ${selectedTagFilter === 'ALL' ? 'active' : ''}`}
          >
            <Tag size={10} />
            <span>All</span>
          </button>
          {availableTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTagFilter(selectedTagFilter === tag ? 'ALL' : tag)}
              className={`drawer-tag-filter-pill ${selectedTagFilter === tag ? 'active' : ''}`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* 🔍 LIVE SEARCH INPUT */}
        <div className="demo-drawer-search-bar">
          <Search size={14} className="text-cyan-400" />
          <input
            type="text"
            placeholder="Search past chats by prompt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="demo-search-input"
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
                      <MessageSquare size={14} className={isActive ? 'text-cyan-400 flex-shrink-0' : 'text-slate-400 flex-shrink-0'} />
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
                          <span>Select Subject / Unit Tag:</span>
                        </div>
                        <div className="tag-selector-grid">
                          {availableTags.map(t => {
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
