import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle2, 
  Search, 
  Trash2, 
  BookOpen, 
  ArrowLeft, 
  Filter, 
  CheckCheck,
  Flame,
  Clock
} from 'lucide-react';
import type { FlashcardDeck, Flashcard } from '../types';
import { MathText } from './MathText';
import { 
  getSavedFlashcardDecks, 
  deleteFlashcardDeck, 
  updateFlashcardMastery, 
  saveFlashcardDeck 
} from '../services/studyToolsService';
import { fetchCloudStudyTools } from '../services/studyToolsSyncService';

interface FlashcardsStudioViewProps {
  currentUser: string;
  onBackToHub: () => void;
  onNavigateToChat?: () => void;
}

export const FlashcardsStudioView: React.FC<FlashcardsStudioViewProps> = ({
  currentUser,
  onBackToHub,
  onNavigateToChat
}) => {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);

  // Active Player State
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cramModeUnmastered, setCramModeUnmastered] = useState(false);

  useEffect(() => {
    const loaded = getSavedFlashcardDecks(currentUser);
    setDecks(loaded);

    if (currentUser && currentUser !== 'guest') {
      const token = localStorage.getItem('chatterbot_token') || undefined;
      fetchCloudStudyTools(currentUser, token).then(data => {
        if (data && Array.isArray(data.flashcardDecks) && data.flashcardDecks.length > 0) {
          const map = new Map<string, FlashcardDeck>();
          data.flashcardDecks.forEach(d => { if (d && d.id) map.set(d.id, d); });
          loaded.forEach(d => { if (d && d.id) map.set(d.id, d); });
          const merged = Array.from(map.values());
          localStorage.setItem(`chatterbot_flashcard_decks_${currentUser}`, JSON.stringify(merged));
          setDecks(merged);
        }
      });
    }
  }, [currentUser]);

  // Keyboard navigation for active deck player
  useEffect(() => {
    if (!activeDeck) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleToggleMastered();
      } else if (e.key === 'Escape') {
        setActiveDeck(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDeck, currentCardIdx, cramModeUnmastered]);

  const activeCards: Flashcard[] = activeDeck
    ? (cramModeUnmastered ? activeDeck.cards.filter(c => !c.mastered) : activeDeck.cards)
    : [];

  const currentCard = activeCards[currentCardIdx] || activeCards[0];

  const handleNextCard = () => {
    setIsFlipped(false);
    if (activeCards.length === 0) return;
    setCurrentCardIdx(prev => (prev + 1) % activeCards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    if (activeCards.length === 0) return;
    setCurrentCardIdx(prev => (prev - 1 + activeCards.length) % activeCards.length);
  };

  const handleToggleMastered = () => {
    if (!activeDeck || !currentCard) return;
    const nextMastered = !currentCard.mastered;
    const updatedDecks = updateFlashcardMastery(currentUser, activeDeck.id, currentCard.id, nextMastered);
    setDecks(updatedDecks);
    const updatedActive = updatedDecks.find(d => d.id === activeDeck.id);
    if (updatedActive) {
      setActiveDeck(updatedActive);
    }
  };

  const handleResetDeckMastery = () => {
    if (!activeDeck) return;
    const updatedCards = activeDeck.cards.map(c => ({ ...c, mastered: false }));
    const updatedDeck: FlashcardDeck = { ...activeDeck, cards: updatedCards, lastStudiedAt: Date.now() };
    const nextDecks = saveFlashcardDeck(currentUser, updatedDeck);
    setDecks(nextDecks);
    setActiveDeck(updatedDeck);
    setCurrentCardIdx(0);
    setIsFlipped(false);
  };

  const handleDeleteDeck = (deckId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm('Delete this flashcard deck permanently?')) {
      const updated = deleteFlashcardDeck(currentUser, deckId);
      setDecks(updated);
      if (activeDeck?.id === deckId) {
        setActiveDeck(null);
      }
    }
  };

  // Filter Decks
  const allTags = Array.from(new Set(decks.map(d => d.categoryTag).filter(Boolean))) as string[];

  const filteredDecks = decks.filter(deck => {
    const matchesSearch = deck.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.cards.some(c => c.front.toLowerCase().includes(searchQuery.toLowerCase()) || c.back.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = selectedTag === 'all' || deck.categoryTag === selectedTag;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="studio-workspace-container">
      {/* Top Header Bar */}
      <div className="studio-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            type="button" 
            onClick={activeDeck ? () => setActiveDeck(null) : onBackToHub} 
            className="studio-back-btn"
            title={activeDeck ? "Back to Deck Library" : "Return to Home Hub"}
          >
            <ArrowLeft size={16} />
            <span>{activeDeck ? "Decks Library" : "Home Hub"}</span>
          </button>

          <div className="studio-title-block">
            <div className="studio-icon-badge cyan">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="studio-title">
                {activeDeck ? activeDeck.topic : "Flashcards Studio & Deck Hub"}
              </h2>
              <p className="studio-subtitle">
                {activeDeck 
                  ? `${activeCards.length} Cards • 0 Tokens (Offline Stored)` 
                  : `${decks.length} Persistent High-Yield Decks Saved`}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onNavigateToChat && (
            <button 
              type="button" 
              onClick={onNavigateToChat}
              className="studio-action-pill"
            >
              <BookOpen size={14} />
              <span>Back to Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Studio View Body */}
      {!activeDeck ? (
        /* ================= 📚 DECK LIBRARY VIEW ================= */
        <div className="studio-content-body">
          {/* Filter Bar */}
          <div className="studio-filter-toolbar">
            <div className="studio-search-dock">
              <Search size={15} className="text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search flashcards, topics, or formulas..."
                className="studio-search-input"
              />
            </div>

            {/* Tag Pills */}
            <div className="studio-tags-cloud">
              <button
                type="button"
                onClick={() => setSelectedTag('all')}
                className={`studio-tag-pill ${selectedTag === 'all' ? 'active' : ''}`}
              >
                #All ({decks.length})
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`studio-tag-pill ${selectedTag === tag ? 'active' : ''}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Decks Grid */}
          {filteredDecks.length > 0 ? (
            <div className="studio-deck-grid">
              {filteredDecks.map(deck => {
                const totalCards = deck.cards.length;
                const masteredCards = deck.cards.filter(c => c.mastered).length;
                const percent = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

                return (
                  <div 
                    key={deck.id} 
                    className="studio-deck-card"
                    onClick={() => {
                      setActiveDeck(deck);
                      setCurrentCardIdx(0);
                      setIsFlipped(false);
                      setCramModeUnmastered(false);
                    }}
                  >
                    <div className="deck-card-top">
                      <div className="deck-type-badge">
                        <Flame size={12} style={{ color: 'var(--accent-cyan)' }} />
                        <span>{deck.sourceType === 'message' ? 'Question Drill' : 'Full Session Deck'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteDeck(deck.id, e)}
                        className="deck-delete-btn"
                        title="Delete Deck"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <h3 className="deck-card-title">{deck.topic}</h3>

                    <div className="deck-progress-section">
                      <div className="deck-progress-labels">
                        <span>Mastery</span>
                        <span className="font-bold">{masteredCards} / {totalCards} ({percent}%)</span>
                      </div>
                      <div className="deck-progress-track">
                        <div 
                          className="deck-progress-fill" 
                          style={{ width: `${percent}%` }} 
                        />
                      </div>
                    </div>

                    <div className="deck-card-footer">
                      <div className="deck-date-meta">
                        <Clock size={12} />
                        <span>{new Date(deck.createdAt).toLocaleDateString()}</span>
                      </div>
                      <button 
                        type="button" 
                        className="deck-study-btn"
                      >
                        <span>Study Deck</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="studio-empty-state">
              <div className="studio-empty-icon" style={{ background: 'var(--pill-bg)', color: 'var(--accent-cyan)' }}>
                <Layers size={36} />
              </div>
              <h3>No Flashcard Decks Yet</h3>
              <p>
                Open any chat session and click <strong>📇 Flashcards</strong> on an AI explanation or inside the <strong>Command Deck</strong> to generate your first zero-token study deck!
              </p>
              {onNavigateToChat && (
                <button 
                  type="button" 
                  onClick={onNavigateToChat}
                  className="btn-theme-primary flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold"
                >
                  <BookOpen size={16} />
                  <span>Go to Chat & Generate Deck</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ================= 📇 ACTIVE 3D STUDY PLAYER ================= */
        <div className="studio-player-container">
          {/* Controls Bar */}
          <div className="studio-player-toolbar">
            <div className="player-mode-toggles">
              <button
                type="button"
                onClick={() => {
                  setCramModeUnmastered(false);
                  setCurrentCardIdx(0);
                  setIsFlipped(false);
                }}
                className={`player-toggle-btn ${!cramModeUnmastered ? 'active' : ''}`}
              >
                <BookOpen size={13} />
                <span>All Cards ({activeDeck.cards.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCramModeUnmastered(true);
                  setCurrentCardIdx(0);
                  setIsFlipped(false);
                }}
                className={`player-toggle-btn ${cramModeUnmastered ? 'active' : ''}`}
              >
                <Filter size={13} />
                <span>Unmastered Only ({activeDeck.cards.filter(c => !c.mastered).length})</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleResetDeckMastery}
                className="player-action-btn"
                title="Reset Mastery Progress"
              >
                <RotateCcw size={13} />
                <span>Reset Mastery</span>
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDeck(activeDeck.id)}
                className="player-action-btn text-rose-400"
                title="Delete Deck"
              >
                <Trash2 size={13} />
                <span>Delete Deck</span>
              </button>
            </div>
          </div>

          {/* 3D Scene */}
          {activeCards.length > 0 ? (
            <div className="studio-card-wrapper">
              <div className="flashcard-3d-scene" style={{ maxWidth: '640px', width: '100%', height: '360px' }}>
                <div
                  className="flashcard-3d-card"
                  onClick={() => setIsFlipped(prev => !prev)}
                  style={{
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* FRONT FACE */}
                  <div className="flashcard-face front">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="flashcard-pill-tag">
                        {currentCard?.category || 'High-Yield Concept'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={13} className="text-amber-400" />
                        <span>Tap to flip (Space)</span>
                      </span>
                    </div>

                    <div className="flashcard-question-text">
                      <MathText content={currentCard?.front} />
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Card {currentCardIdx + 1} of {activeCards.length} • Click or Press Space to Reveal
                    </div>
                  </div>

                  {/* BACK FACE */}
                  <div className="flashcard-face back">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="quiz-q-counter-pill" style={{ color: 'var(--accent-cyan)', borderColor: 'var(--border-color)', background: 'var(--pill-bg)' }}>
                        Answer & Derivation
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <RotateCcw size={13} />
                        <span>Tap to flip back</span>
                      </span>
                    </div>

                    <div className="flashcard-answer-scroll" style={{ overflowY: 'auto', maxHeight: '200px' }}>
                      <MathText content={currentCard?.back} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMastered();
                        }}
                        className={`flashcard-master-btn ${currentCard?.mastered ? 'mastered' : ''}`}
                      >
                        <CheckCircle2 size={14} />
                        <span>{currentCard?.mastered ? 'Mastered ✓' : 'Mark as Mastered (M)'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Player Navigation Controls */}
              <div className="studio-player-nav">
                <button
                  type="button"
                  onClick={handlePrevCard}
                  className="btn-theme-secondary"
                  style={{ padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="studio-dots-row">
                  {activeCards.map((c, i) => (
                    <span
                      key={c.id || i}
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIdx(i);
                      }}
                      className={`studio-dot ${i === currentCardIdx ? 'active' : ''} ${c.mastered ? 'mastered' : ''}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNextCard}
                  className="btn-theme-primary"
                  style={{ padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="studio-empty-state">
              <CheckCheck size={40} className="text-emerald-400" />
              <h3>All Cards Mastered! 🎉</h3>
              <p>You have mastered every card in this deck. Toggle to "All Cards" or click Reset Mastery to review again.</p>
              <button
                type="button"
                onClick={() => setCramModeUnmastered(false)}
                className="btn-theme-primary"
                style={{ padding: '10px 20px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <span>View All Cards</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
