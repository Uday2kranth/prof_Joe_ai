import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, Sparkles, Layers } from 'lucide-react';
import type { Flashcard } from '../types';
import { MathText } from './MathText';

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashcards: Flashcard[];
  sessionTitle?: string;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({
  isOpen,
  onClose,
  flashcards: initialFlashcards,
  sessionTitle
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>(initialFlashcards);

  useEffect(() => {
    setCards(initialFlashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [initialFlashcards]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, cards.length]);

  if (!isOpen || cards.length === 0 || typeof document === 'undefined') return null;

  const currentCard = cards[currentIndex] || cards[0];
  const masteredCount = cards.filter(c => c.mastered).length;
  const progressPercent = Math.round((masteredCount / cards.length) * 100);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length);
  };

  const toggleMastered = () => {
    setCards(prev => prev.map((c, idx) =>
      idx === currentIndex ? { ...c, mastered: !c.mastered } : c
    ));
  };

  const modalContent = (
    <div className="pdf-preview-modal-overlay" onClick={onClose} style={{ zIndex: 9999999 }}>
      <div
        className="flashcards-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flashcards-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="flashcard-header-badge">
              <Layers size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Interactive Exam Flashcards
                </h3>
                <span className="flashcard-pill-tag">
                  {currentIndex + 1} / {cards.length}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {sessionTitle || 'Active Discussion Deck'} • {masteredCount} Mastered ({progressPercent}%)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="selection-tool-close"
            style={{ width: '28px', height: '28px', borderRadius: '50%' }}
            title="Close Flashcards"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="quiz-progress-track">
          <div
            className="quiz-progress-fill"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>

        {/* 3D Flip Card Scene */}
        <div className="flashcard-3d-scene">
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
                  {currentCard.category || 'High-Yield Concept'}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Tap to flip</span>
                </span>
              </div>

              <div className="flashcard-question-text">
                <MathText content={currentCard.front} />
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                Click card or press Space to reveal answer
              </div>
            </div>

            {/* BACK FACE */}
            <div className="flashcard-face back">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="quiz-q-counter-pill" style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                  Answer & Formula
                </span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <RotateCcw size={13} />
                  <span>Tap to flip back</span>
                </span>
              </div>

              <div className="flashcard-answer-scroll text-center" style={{ overflowY: 'auto', maxHeight: '180px' }}>
                <MathText content={currentCard.back} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMastered();
                  }}
                  className={`flashcard-master-btn ${currentCard.mastered ? 'mastered' : ''}`}
                >
                  <CheckCircle2 size={14} />
                  <span>{currentCard.mastered ? 'Mastered ✓' : 'Mark as Mastered'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="quiz-modal-footer">
          <button
            type="button"
            onClick={handlePrev}
            className="quiz-nav-btn secondary"
          >
            <ChevronLeft size={15} />
            <span>Previous</span>
          </button>

          <div className="quiz-dot-track">
            {cards.map((c, i) => (
              <span
                key={i}
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex(i);
                }}
                className={`quiz-nav-dot ${i === currentIndex ? 'active' : ''} ${c.mastered ? 'answered-correct' : ''}`}
                title={`Card ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="quiz-nav-btn primary"
          >
            <span>Next</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
