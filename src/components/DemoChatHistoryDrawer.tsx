import React, { useState } from 'react';
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
  BarChart2,
  Layers,
  GraduationCap
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
  activeProviderName?: string;
  activeModelName?: string;
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
  activeProviderName = 'AI Provider',
  activeModelName = 'AI Model'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const activeMsgCount = activeSession ? activeSession.messages.length : 0;

  // Real-time Session Search Filter
  const filteredSessions = sessions.filter(s => {
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
        style={{ width: '380px', maxWidth: '90vw' }}
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

        {/* 🍱 OPTION 1 BENTO CONTROL DECK */}
        <div className="demo-bento-deck">
          <div className="bento-deck-header">
            <Sparkles size={13} className="text-cyan-400" />
            <span>COMMAND CONTROLS</span>
          </div>

          <div className="bento-grid-container">
            {/* Tile 1: Persistent Web Search */}
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
                  {isPersistentWebSearch ? '🟢 Always ON' : '⚪ OFF'}
                </span>
              </div>
            </div>

            {/* Tile 2: Dedicated Visual Diagrams Toggle */}
            <div 
              className={`bento-card-tile ${isDiagramsEnabled ? 'active-glow-purple' : ''}`}
              onClick={onToggleDiagrams}
              title="Toggle Multi-Engine Visual Diagrams (Mermaid, Kroki, Graphviz, FunctionPlot)"
            >
              <div className="bento-tile-icon purple">
                <Layers size={16} />
              </div>
              <div className="bento-tile-content">
                <span className="bento-tile-title">Visual Diagrams</span>
                <span className="bento-tile-status">
                  {isDiagramsEnabled ? '🟢 Always ON' : '⚪ OFF'}
                </span>
              </div>
            </div>

            {/* Tile 3: Dedicated Beginner-Friendly Mode Toggle */}
            <div 
              className={`bento-card-tile ${isBeginnerFriendly ? 'active-glow-emerald' : ''}`}
              onClick={onToggleBeginnerFriendly}
              title="Toggle 6-Stage Beginner-Friendly Scaffolding, Formula Term Breakdown & Concrete Numbers"
            >
              <div className="bento-tile-icon emerald">
                <GraduationCap size={16} />
              </div>
              <div className="bento-tile-content">
                <span className="bento-tile-title">Beginner Friendly</span>
                <span className="bento-tile-status">
                  {isBeginnerFriendly ? '🟢 Always ON' : '⚪ OFF'}
                </span>
              </div>
            </div>

            {/* Tile 4: Session Monitor */}
            <div className="bento-card-tile" title={`Provider: ${activeProviderName} | Model: ${activeModelName}`}>
              <div className="bento-tile-icon blue">
                <BarChart2 size={16} />
              </div>
              <div className="bento-tile-content">
                <span className="bento-tile-title">{activeModelName.slice(0, 12)}</span>
                <span className="bento-tile-sub font-mono">{activeMsgCount} msgs</span>
              </div>
            </div>

            {/* Tile 5: Preview Chat (In-App Styled Modal) */}
            <div 
              className="bento-card-tile"
              onClick={() => {
                if (onOpenPdfPreview) onOpenPdfPreview();
                onClose();
              }}
              title="Open styled in-app Preview Modal with Save Image & Save PDF"
            >
              <div className="bento-tile-icon amber">
                <Eye size={16} />
              </div>
              <div className="bento-tile-content">
                <span className="bento-tile-title">Preview Chat</span>
                <span className="bento-tile-sub">In-App Pop-up</span>
              </div>
            </div>

            {/* Tile 6: Native Print / PDF (Chrome Native Window) */}
            <div 
              className="bento-card-tile"
              onClick={() => {
                if (onNativePrintPdf) onNativePrintPdf();
              }}
              title="Open System Native Chrome Print Preview Dialog to print or save PDF"
            >
              <div className="bento-tile-icon emerald">
                <Printer size={16} />
              </div>
              <div className="bento-tile-content">
                <span className="bento-tile-title">Native Print / PDF</span>
                <span className="bento-tile-sub">System Chrome</span>
              </div>
            </div>

            {/* Tile 7 (Full Width Span 2): Clear Session Context */}
            <div 
              className="bento-card-tile span-2-tile danger-tile"
              onClick={() => setShowClearConfirm(true)}
              title="Clear messages in active session"
            >
              <div className="bento-tile-icon rose">
                <RotateCcw size={16} />
              </div>
              <div className="bento-tile-content" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span className="bento-tile-title">Clear Session Context</span>
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
              <p>{searchQuery ? 'No matching chat sessions' : 'No chat history yet'}</p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const msgCount = session.messages.length;
              const titleText = session.title || 'Untitled Conversation';

              return (
                <div
                  key={session.id}
                  className={`demo-session-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                >
                  <div className="demo-session-info">
                    <MessageSquare size={14} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                    <span className="demo-session-title">
                      {titleText}
                    </span>
                  </div>

                  <div className="demo-session-meta">
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
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
};

export default DemoChatHistoryDrawer;
