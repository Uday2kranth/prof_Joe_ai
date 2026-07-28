import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Send, Award } from 'lucide-react';
import { marked } from 'marked';
import examData from '../data/examPrepData.json';
// @ts-ignore
import MagicBento from './MagicBento';

interface ExamPrepViewProps {
  onLoadQuestionToChat: (questionText: string) => void;
}

const renderFormattedContent = (content: string) => {
  if (!content) return '';
  if (content.trim().startsWith('<')) {
    return content;
  }
  return marked.parse(content) as string;
};

export const ExamPrepView: React.FC<ExamPrepViewProps> = ({ onLoadQuestionToChat }) => {
  const subjectKeys = Object.keys(examData);
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectKeys[0] || 'crypto');
  const [activeTab, setActiveTab] = useState<'syllabus' | 'bank' | 'sets'>('bank');
  const [selectedPaperSet, setSelectedPaperSet] = useState<'all' | 'set-a' | 'set-b' | 'set-c' | 'set-d'>('all');
  const [bankSubTab, setBankSubTab] = useState<'standard' | 'gagan'>('standard');

  const [isPaperMenuOpen, setIsPaperMenuOpen] = useState<boolean>(false);
  const paperMenuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (paperMenuRef.current && !paperMenuRef.current.contains(e.target as Node)) {
        setIsPaperMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSubjectData = (examData as any)[selectedSubject] || {};

  const handleBentoCardClick = (card: any) => {
    if (card.id === 'gagan') {
      setActiveTab('bank');
      setBankSubTab('gagan');
    } else if (card.id === 'sets') {
      setActiveTab('sets');
    } else if (examData[card.id as keyof typeof examData]) {
      setSelectedSubject(card.id);
      setActiveTab('bank');
      setBankSubTab('standard');
    }
  };

  return (
    <div className="exam-prep-container p-4">
      <div className="exam-prep-header flex flex-wrap items-center justify-between gap-4 mb-6" style={{ overflow: 'visible', zIndex: 100 }}>
        <div className="subject-selector-area flex items-center gap-3">
          <BookOpen className="text-cyan-400" size={26} />
          <div>
            <h2 className="text-xl font-bold text-slate-100">Exam Prep & Syllabus Hub</h2>
            <p className="subtitle text-xs text-slate-400">Osmania University M.Sc (CBCS) Final Examination Prep</p>
          </div>
        </div>

        {/* Custom Glassmorphic Paper Dropdown */}
        <div className="relative inline-block" style={{ overflow: 'visible', zIndex: 100 }} ref={paperMenuRef}>
          <button
            type="button"
            onClick={() => setIsPaperMenuOpen(!isPaperMenuOpen)}
            className="custom-dropdown-pill"
            title="Select Paper / Subject"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <span className="picker-icon">📖</span>
            <span className="font-semibold text-slate-100">{currentSubjectData.title || selectedSubject.toUpperCase()}</span>
            <span className="text-slate-400 text-xs ml-1">▾</span>
          </button>

          {isPaperMenuOpen && (
            <div className="custom-dropdown-menu paper-menu" style={{ minWidth: '280px', maxHeight: '300px', overflowY: 'auto' }}>
              <div className="dropdown-header">Select Examination Paper</div>
              {subjectKeys.map((key) => {
                const item = (examData as any)[key];
                const isSelected = key === selectedSubject;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedSubject(key);
                      setIsPaperMenuOpen(false);
                    }}
                    className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                  >
                    <span>{item.title || key.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* React Bits MagicBento Interactive Grid */}
      <div className="bento-wrapper-container" style={{ marginBottom: '16px', width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
        <MagicBento
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={true}
          clickEffect={true}
          spotlightRadius={280}
          particleCount={10}
          glowColor="6, 182, 212"
          onCardClick={handleBentoCardClick}
        />
      </div>

      <div className="exam-tabs-container">
        <div className="exam-tabs">
          <button
            onClick={() => setActiveTab('bank')}
            className={`tab-btn ${activeTab === 'bank' ? 'active' : ''}`}
          >
            <Award size={16} />
            <span>High-Yield Question Bank</span>
          </button>
          <button
            onClick={() => setActiveTab('sets')}
            className={`tab-btn ${activeTab === 'sets' ? 'active' : ''}`}
          >
            <FileText size={16} />
            <span>Predicted Paper Sets (A–D)</span>
          </button>
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`tab-btn ${activeTab === 'syllabus' ? 'active' : ''}`}
          >
            <BookOpen size={16} />
            <span>Full Syllabus Outline</span>
          </button>
        </div>
      </div>

      <div className="exam-tab-content">
        {activeTab === 'syllabus' && (
          <div className="syllabus-content card-box">
            <div
              className="formatted-content markdown-body"
              dangerouslySetInnerHTML={{ __html: renderFormattedContent(currentSubjectData.syllabus || 'No syllabus available.') }}
            />
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="question-bank-content card-box">
            {/* Sub-tab toggle for Gagan's High-Yield Topics when available */}
            {currentSubjectData['gagan-important-topics'] && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'var(--bg-tertiary)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setBankSubTab('standard')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: bankSubTab === 'standard' ? 'var(--accent-cyan)' : 'transparent',
                    color: bankSubTab === 'standard' ? '#ffffff' : 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🎯 Standard Question Bank
                </button>
                <button
                  type="button"
                  onClick={() => setBankSubTab('gagan')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: bankSubTab === 'gagan' ? '#ef4444' : 'transparent',
                    color: bankSubTab === 'gagan' ? '#ffffff' : 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🔥 Gagan's High-Yield Topics
                </button>
              </div>
            )}

            <div
              className="formatted-content markdown-body"
              dangerouslySetInnerHTML={{
                __html: renderFormattedContent(
                  bankSubTab === 'gagan' && currentSubjectData['gagan-important-topics']
                    ? currentSubjectData['gagan-important-topics']
                    : (currentSubjectData['question-bank'] || 'No question bank available.')
                )
              }}
            />
          </div>
        )}

        {activeTab === 'sets' && (
          <div className="paper-sets-content">
            {/* Paper Set Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', background: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', marginRight: '4px' }}>Filter Paper:</span>
              {[
                { id: 'all', label: '🎯 All Sets' },
                { id: 'set-a', label: '📄 Set A (Baseline)' },
                { id: 'set-b', label: '📄 Set B (Alternative)' },
                { id: 'set-c', label: '📄 Set C (Wildcard)' },
                { id: 'set-d', label: '📄 Set D (Final Review)' }
              ].map(setItem => (
                <button
                  key={setItem.id}
                  type="button"
                  onClick={() => setSelectedPaperSet(setItem.id as any)}
                  style={{
                    background: selectedPaperSet === setItem.id ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
                    color: selectedPaperSet === setItem.id ? '#ffffff' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '4px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {setItem.label}
                </button>
              ))}
            </div>

            {['set-a', 'set-b', 'set-c', 'set-d']
              .filter(setKey => selectedPaperSet === 'all' || selectedPaperSet === setKey)
              .map((setKey) => {
                const htmlContent = currentSubjectData[setKey];
                if (!htmlContent) return null;

                return (
                  <div key={setKey} className="paper-set-card card-box" style={{ marginBottom: '20px' }}>
                    <div
                      className="formatted-content markdown-body"
                      dangerouslySetInnerHTML={{ __html: renderFormattedContent(htmlContent) }}
                    />
                    <div className="card-actions" style={{ marginTop: '16px' }}>
                      <button
                        onClick={() => onLoadQuestionToChat(`Explain and answer all questions from ${setKey.toUpperCase()} of ${currentSubjectData.title}:`)}
                        className="btn btn-primary"
                      >
                        <Send size={14} />
                        <span>Ask AI to Solve Paper {setKey.toUpperCase().replace('SET-', 'SET ')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
