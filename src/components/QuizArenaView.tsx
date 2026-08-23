import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Trash2, 
  BookOpen, 
  ArrowLeft, 
  Clock, 
  Target
} from 'lucide-react';
import type { QuizDeck, QuizQuestion } from '../types';
import { MathText } from './MathText';
import { 
  getSavedQuizDecks, 
  deleteQuizDeck, 
  saveQuizAttemptScore 
} from '../services/studyToolsService';
import { fetchCloudStudyTools } from '../services/studyToolsSyncService';

interface QuizArenaViewProps {
  currentUser: string;
  onBackToHub: () => void;
  onNavigateToChat?: () => void;
}

export const QuizArenaView: React.FC<QuizArenaViewProps> = ({
  currentUser,
  onBackToHub,
  onNavigateToChat
}) => {
  const [quizzes, setQuizzes] = useState<QuizDeck[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [activeQuiz, setActiveQuiz] = useState<QuizDeck | null>(null);

  // Active Quiz State
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [mistakesOnlyMode, setMistakesOnlyMode] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    const loaded = getSavedQuizDecks(currentUser);
    setQuizzes(loaded);

    if (currentUser && currentUser !== 'guest') {
      const token = localStorage.getItem('chatterbot_token') || undefined;
      fetchCloudStudyTools(currentUser, token).then(data => {
        if (data && Array.isArray(data.quizDecks) && data.quizDecks.length > 0) {
          const map = new Map<string, QuizDeck>();
          data.quizDecks.forEach(d => { if (d && d.id) map.set(d.id, d); });
          loaded.forEach(d => { if (d && d.id) map.set(d.id, d); });
          const merged = Array.from(map.values());
          localStorage.setItem(`chatterbot_quiz_decks_${currentUser}`, JSON.stringify(merged));
          setQuizzes(merged);
        }
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (!activeQuiz) return;
    if (mistakesOnlyMode) {
      const missed = activeQuiz.questions.filter((q, idx) => selectedAnswers[idx] !== q.correctIndex);
      setActiveQuestions(missed.length > 0 ? missed : activeQuiz.questions);
    } else {
      setActiveQuestions(activeQuiz.questions);
    }
  }, [activeQuiz, mistakesOnlyMode]);

  const currentQ = activeQuestions[currentQIdx] || activeQuestions[0];
  const selectedOpt = selectedAnswers[currentQIdx];
  const hasAnsweredCurrent = selectedOpt !== undefined;

  const handleSelectOption = (optIdx: number) => {
    if (hasAnsweredCurrent) return;
    const nextAnswers = { ...selectedAnswers, [currentQIdx]: optIdx };
    setSelectedAnswers(nextAnswers);

    if (Object.keys(nextAnswers).length === activeQuestions.length) {
      let finalScore = 0;
      activeQuestions.forEach((q, idx) => {
        if (nextAnswers[idx] === q.correctIndex) finalScore++;
      });
      if (activeQuiz) {
        const updatedDecks = saveQuizAttemptScore(currentUser, activeQuiz.id, finalScore, activeQuestions.length);
        setQuizzes(updatedDecks);
      }
      setTimeout(() => setIsCompleted(true), 1000);
    }
  };

  const calculateScore = () => {
    let score = 0;
    activeQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) score++;
    });
    return score;
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setCurrentQIdx(0);
    setIsCompleted(false);
    setMistakesOnlyMode(false);
  };

  const handleRetakeMistakes = () => {
    const missed = activeQuestions.filter((q, idx) => selectedAnswers[idx] !== q.correctIndex);
    if (missed.length === 0) return;
    setActiveQuestions(missed);
    setSelectedAnswers({});
    setCurrentQIdx(0);
    setIsCompleted(false);
    setMistakesOnlyMode(true);
  };

  const handleDeleteQuiz = (deckId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm('Delete this practice quiz permanently?')) {
      const updated = deleteQuizDeck(currentUser, deckId);
      setQuizzes(updated);
      if (activeQuiz?.id === deckId) {
        setActiveQuiz(null);
      }
    }
  };

  const allTags = Array.from(new Set(quizzes.map(q => q.categoryTag).filter(Boolean))) as string[];

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.questions.some(q => q.question.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = selectedTag === 'all' || quiz.categoryTag === selectedTag;
    return matchesSearch && matchesTag;
  });

  const finalScore = calculateScore();
  const scorePercent = activeQuestions.length > 0 ? Math.round((finalScore / activeQuestions.length) * 100) : 0;

  return (
    <div className="studio-workspace-container">
      {/* Top Header Bar */}
      <div className="studio-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            type="button" 
            onClick={activeQuiz ? () => setActiveQuiz(null) : onBackToHub} 
            className="studio-back-btn"
            title={activeQuiz ? "Back to Quiz Dashboard" : "Return to Home Hub"}
          >
            <ArrowLeft size={16} />
            <span>{activeQuiz ? "Quiz Arena" : "Home Hub"}</span>
          </button>

          <div className="studio-title-block">
            <div className="studio-icon-badge emerald">
              <Award size={18} />
            </div>
            <div>
              <h2 className="studio-title">
                {activeQuiz ? activeQuiz.topic : "Practice Quiz Arena"}
              </h2>
              <p className="studio-subtitle">
                {activeQuiz 
                  ? `${activeQuestions.length} Questions • Live Exam Assessment` 
                  : `${quizzes.length} Saved Assessment Decks Available`}
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

      {/* Main Content Body */}
      {!activeQuiz ? (
        /* ================= 🏆 ASSESSMENTS DASHBOARD ================= */
        <div className="studio-content-body">
          {/* Filter Bar */}
          <div className="studio-filter-toolbar">
            <div className="studio-search-dock">
              <Search size={15} className="text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quizzes, questions, or subjects..."
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
                #All ({quizzes.length})
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

          {/* Quizzes Grid */}
          {filteredQuizzes.length > 0 ? (
            <div className="studio-deck-grid">
              {filteredQuizzes.map(quiz => {
                const totalQ = quiz.questions.length;
                const lastScore = quiz.lastAttemptScore;

                return (
                  <div 
                    key={quiz.id} 
                    className="studio-deck-card"
                    onClick={() => {
                      setActiveQuiz(quiz);
                      setActiveQuestions(quiz.questions);
                      setSelectedAnswers({});
                      setCurrentQIdx(0);
                      setIsCompleted(false);
                      setMistakesOnlyMode(false);
                    }}
                  >
                    <div className="deck-card-top">
                      <div className="deck-type-badge" style={{ color: 'var(--accent-cyan)', borderColor: 'var(--border-color)', background: 'var(--pill-bg)' }}>
                        <Target size={12} style={{ color: 'var(--accent-cyan)' }} />
                        <span>{quiz.sourceType === 'message' ? 'Question Assessment' : 'Full Exam Mock'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteQuiz(quiz.id, e)}
                        className="deck-delete-btn"
                        title="Delete Quiz"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <h3 className="deck-card-title">{quiz.topic}</h3>

                    <div className="deck-progress-section">
                      <div className="deck-progress-labels">
                        <span>Best Score</span>
                        <span className="font-bold">
                          {lastScore 
                            ? `${lastScore.score} / ${lastScore.total} (${Math.round((lastScore.score / lastScore.total) * 100)}%)` 
                            : 'Not Attempted'}
                        </span>
                      </div>
                      <div className="deck-progress-track">
                        <div 
                          className="deck-progress-fill" 
                          style={{ 
                            width: lastScore ? `${Math.round((lastScore.score / lastScore.total) * 100)}%` : '0%',
                            background: 'var(--btn-primary-bg)'
                          }} 
                        />
                      </div>
                    </div>

                    <p className="deck-card-desc">
                      {quiz.questions[0]?.question ? `${quiz.questions[0].question.slice(0, 100)}...` : 'Comprehensive Exam Practice'}
                    </p>

                    <div className="deck-card-footer">
                      <div className="deck-date-meta">
                        <Clock size={12} />
                        <span>{totalQ} MCQs • {new Date(quiz.createdAt).toLocaleDateString()}</span>
                      </div>
                      <button 
                        type="button" 
                        className="deck-study-btn"
                        style={{ color: 'var(--accent-cyan)' }}
                      >
                        <span>Take Quiz</span>
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
                <Award size={36} />
              </div>
              <h3>No Practice Quizzes Yet</h3>
              <p>
                Generate an instant practice assessment by clicking <strong>📝 Quiz</strong> on any AI response or inside the <strong>Chat Command Deck</strong>!
              </p>
              {onNavigateToChat && (
                <button 
                  type="button" 
                  onClick={onNavigateToChat}
                  className="btn-theme-primary flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold"
                >
                  <BookOpen size={16} />
                  <span>Go to Chat & Generate Quiz</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ================= 📝 ACTIVE QUIZ RUNNER ================= */
        <div className="studio-player-container">
          {!isCompleted ? (
            <div className="studio-card-wrapper" style={{ maxWidth: '720px' }}>
              {/* Progress & Counter */}
              <div className="quiz-player-header-bar">
                <span className="quiz-q-counter-pill">
                  Question {currentQIdx + 1} of {activeQuestions.length}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {Object.keys(selectedAnswers).length} / {activeQuestions.length} Answered
                </span>
              </div>

              <div className="quiz-progress-track" style={{ margin: '10px 0 20px 0' }}>
                <div
                  className="quiz-progress-fill"
                  style={{ width: `${((currentQIdx + 1) / activeQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <h3 className="quiz-question-title" style={{ fontSize: '1.15rem', marginBottom: '16px' }}>
                <MathText content={currentQ?.question} />
              </h3>

              {/* Options */}
              <div className="quiz-options-list">
                {currentQ?.options.map((opt, optIdx) => {
                  const isSelected = selectedOpt === optIdx;
                  const isCorrect = currentQ.correctIndex === optIdx;

                  let cardStateClass = '';
                  const letter = String.fromCharCode(65 + optIdx);

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
                      <span className="quiz-option-letter">{letter}</span>
                      <span style={{ flex: 1 }}>
                        <MathText content={opt} inline />
                      </span>
                      {hasAnsweredCurrent && isCorrect && <CheckCircle2 size={18} style={{ color: '#34d399', flexShrink: 0 }} />}
                      {hasAnsweredCurrent && isSelected && !isCorrect && <XCircle size={18} style={{ color: '#fb7185', flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>

              {/* Solution Derivation */}
              {hasAnsweredCurrent && (
                <div className="quiz-solution-box" style={{ marginTop: '16px' }}>
                  <div style={{ fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Prof. Joe's Solution Derivation:</span>
                  </div>
                  <div style={{ margin: 0, color: 'var(--text-primary)' }}>
                    <MathText content={currentQ?.explanation} />
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="studio-player-nav" style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentQIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentQIdx === 0}
                  className="studio-nav-btn secondary"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="studio-dots-row">
                  {activeQuestions.map((q, i) => (
                    <span
                      key={q.id || i}
                      onClick={() => setCurrentQIdx(i)}
                      className={`studio-dot ${i === currentQIdx ? 'active' : ''} ${selectedAnswers[i] !== undefined ? 'mastered' : ''}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentQIdx(prev => Math.min(activeQuestions.length - 1, prev + 1))}
                  disabled={currentQIdx === activeQuestions.length - 1}
                  className="studio-nav-btn primary"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* ================= 📊 SCORECARD REVIEW ================= */
            <div className="studio-empty-state" style={{ maxWidth: '520px', padding: '40px 24px' }}>
              <div className="studio-empty-icon emerald" style={{ width: '68px', height: '68px' }}>
                <Award size={40} />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '8px 0 4px 0' }}>Quiz Completed!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Your Exam Readiness Score</p>

              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: scorePercent >= 70 ? '#10b981' : '#f59e0b', lineHeight: 1 }}>
                  {scorePercent}%
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  {finalScore} of {activeQuestions.length} Questions Correct
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="btn-theme-primary"
                  style={{ padding: '10px 20px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <RotateCcw size={15} />
                  <span>Retake Entire Quiz</span>
                </button>

                {finalScore < activeQuestions.length && (
                  <button
                    type="button"
                    onClick={handleRetakeMistakes}
                    className="btn-theme-secondary"
                    style={{ padding: '10px 18px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>Practice {activeQuestions.length - finalScore} Missed Only</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveQuiz(null)}
                  className="btn-theme-secondary"
                  style={{ padding: '10px 18px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Back to Arena</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
