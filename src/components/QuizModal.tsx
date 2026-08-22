import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, XCircle, RotateCcw, Award, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import type { QuizQuestion } from '../types';
import { MathText } from './MathText';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  sessionTitle?: string;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  questions,
  sessionTitle
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen || !questions || questions.length === 0 || typeof document === 'undefined') return null;

  const currentQ = questions[currentIndex];
  const selectedOpt = selectedAnswers[currentIndex];
  const hasAnsweredCurrent = selectedOpt !== undefined;

  const handleSelectOption = (optIdx: number) => {
    if (hasAnsweredCurrent) return; // Locked once clicked
    const nextAnswers = { ...selectedAnswers, [currentIndex]: optIdx };
    setSelectedAnswers(nextAnswers);

    if (Object.keys(nextAnswers).length === questions.length) {
      setTimeout(() => setIsCompleted(true), 1200);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsCompleted(false);
  };

  const score = calculateScore();
  const scorePercent = Math.round((score / questions.length) * 100);

  const modalContent = (
    <div className="pdf-preview-modal-overlay" onClick={onClose} style={{ zIndex: 9999999 }}>
      <div
        className="quiz-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="quiz-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="quiz-header-badge">
              <Award size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Osmania Exam Practice Quiz
                </h3>
                <span className="quiz-q-counter-pill" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                  {Object.keys(selectedAnswers).length} / {questions.length} Answered
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {sessionTitle || 'Active Discussion'} • Live Knowledge Assessment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="selection-tool-close"
            style={{ width: '28px', height: '28px', borderRadius: '50%' }}
            title="Close Quiz"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="quiz-progress-track">
          <div
            className="quiz-progress-fill"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        {!isCompleted ? (
          <div className="quiz-body-scroll">
            <div>
              <span className="quiz-q-counter-pill">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <h4 className="quiz-question-title">
                <MathText content={currentQ.question} />
              </h4>
            </div>

            {/* Options List */}
            <div className="quiz-options-list">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedOpt === optIdx;
                const isCorrect = currentQ.correctIndex === optIdx;

                let cardStateClass = '';
                let indicator = String.fromCharCode(65 + optIdx);

                if (hasAnsweredCurrent) {
                  if (isCorrect) {
                    cardStateClass = 'correct';
                  } else if (isSelected) {
                    cardStateClass = 'incorrect';
                  } else {
                    cardStateClass = 'muted';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={hasAnsweredCurrent}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`quiz-option-card ${cardStateClass}`}
                  >
                    <span className="quiz-option-letter">
                      {indicator}
                    </span>
                    <span style={{ flex: 1 }}>
                      <MathText content={opt} inline />
                    </span>
                    {hasAnsweredCurrent && isCorrect && <CheckCircle2 size={18} style={{ color: '#34d399', flexShrink: 0 }} />}
                    {hasAnsweredCurrent && isSelected && !isCorrect && <XCircle size={18} style={{ color: '#fb7185', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>

            {/* Explanation reveal */}
            {hasAnsweredCurrent && (
              <div className="quiz-solution-box">
                <div style={{ fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Prof. Joe's Solution Derivation:</span>
                </div>
                <div style={{ margin: 0, color: '#fef3c7' }}>
                  <MathText content={currentQ.explanation} />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Quiz Complete Score Card */
          <div className="quiz-body-scroll" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
            <div className="quiz-header-badge" style={{ width: '64px', height: '64px', borderRadius: '20px', marginBottom: '16px' }}>
              <Award size={36} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0' }}>
              Quiz Completed!
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 20px 0' }}>
              Your instant exam readiness rating
            </p>

            <div style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '18px',
              padding: '24px 32px',
              maxWidth: '360px',
              width: '100%',
              marginBottom: '28px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#34d399', lineHeight: 1, marginBottom: '8px' }}>
                {score} / {questions.length}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1' }}>
                {scorePercent >= 80 ? '🌟 Distinction Grade Predicted!' : scorePercent >= 60 ? '👍 First Class Pass - Solid Knowledge' : '📚 Needs Quick Revision Blitz'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={handleReset}
                className="quiz-nav-btn secondary"
                style={{ padding: '10px 20px' }}
              >
                <RotateCcw size={14} />
                <span>Retry Quiz</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="quiz-nav-btn finish"
                style={{ padding: '10px 24px' }}
              >
                <span>Done & Return to Chat</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Navigation Bar */}
        {!isCompleted && (
          <div className="quiz-modal-footer">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="quiz-nav-btn secondary"
            >
              <ArrowLeft size={14} />
              <span>Previous</span>
            </button>

            <div className="quiz-dot-track">
              {questions.map((_, i) => {
                const ans = selectedAnswers[i];
                let dotState = '';
                if (ans !== undefined) {
                  dotState = ans === questions[i].correctIndex ? 'answered-correct' : 'answered-incorrect';
                }
                return (
                  <span
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`quiz-nav-dot ${i === currentIndex ? 'active' : ''} ${dotState}`}
                  />
                );
              })}
            </div>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="quiz-nav-btn primary"
              >
                <span>Next</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={Object.keys(selectedAnswers).length < questions.length}
                onClick={() => setIsCompleted(true)}
                className="quiz-nav-btn finish"
                style={{ opacity: Object.keys(selectedAnswers).length < questions.length ? 0.4 : 1 }}
              >
                <span>View Score</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
