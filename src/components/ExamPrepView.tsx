import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BookOpen, FileText, Send, Award, Check, Sparkles } from 'lucide-react';
import examData from '../data/examPrepData.json';
// @ts-ignore
import MagicBento from './MagicBento';
import { renderExamHtml } from './MathText';

interface ExamPrepViewProps {
  onLoadQuestionToChat: (questionText: string) => void;
}

const renderFormattedContent = (content: string) => {
  return renderExamHtml(content);
};

const SEMESTERS = [
  { id: 'all', label: 'All Semesters', badge: 'ALL' },
  { id: 'sem-1', label: 'Semester I (1st Year)', badge: 'SEM I' },
  { id: 'sem-2', label: 'Semester II (1st Year)', badge: 'SEM II' },
  { id: 'sem-3', label: 'Semester III (2nd Year)', badge: 'SEM III' },
  { id: 'sem-4', label: 'Semester IV (2nd Year)', badge: 'SEM IV' }
];

const ALL_PAPER_SETS = [
  { id: 'set-a', label: '📄 Set A (Baseline)' },
  { id: 'set-b', label: '📄 Set B (Alternative)' },
  { id: 'set-c', label: '📄 Set C (Wildcard)' },
  { id: 'set-d', label: '📄 Set D (Final Review)' },
  { id: 'set-e', label: '📄 Set E (Bonus / Model)' }
] as const;

export const ExamPrepView: React.FC<ExamPrepViewProps> = ({ onLoadQuestionToChat }) => {
  const subjectKeys = Object.keys(examData);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectKeys[0] || 'crypto');
  const [activeTab, setActiveTab] = useState<'syllabus' | 'bank' | 'sets'>('syllabus');
  const [selectedPaperSet, setSelectedPaperSet] = useState<'all' | 'set-a' | 'set-b' | 'set-c' | 'set-d' | 'set-e'>('all');
  const [bankSubTab, setBankSubTab] = useState<'standard' | 'streamlined' | 'gagan'>('standard');

  const [isSemesterMenuOpen, setIsSemesterMenuOpen] = useState<boolean>(false);
  const [isPaperMenuOpen, setIsPaperMenuOpen] = useState<boolean>(false);

  const semesterMenuRef = useRef<HTMLDivElement>(null);
  const paperMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (semesterMenuRef.current && !semesterMenuRef.current.contains(e.target as Node)) {
        setIsSemesterMenuOpen(false);
      }
      if (paperMenuRef.current && !paperMenuRef.current.contains(e.target as Node)) {
        setIsPaperMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSubjectKeys = useMemo(() => {
    if (selectedSemester === 'all') return subjectKeys;
    return subjectKeys.filter(k => (examData as any)[k]?.semester === selectedSemester);
  }, [selectedSemester, subjectKeys]);

  const currentSubjectData = (examData as any)[selectedSubject] || {};

  const availablePaperSets = useMemo(() => {
    return ALL_PAPER_SETS.filter(setItem => !!currentSubjectData[setItem.id]);
  }, [currentSubjectData]);

  const hasSets = availablePaperSets.length > 0;

  // Auto-reset paper set filter when switching subjects if the current filter is not present
  useEffect(() => {
    if (selectedPaperSet !== 'all' && !currentSubjectData[selectedPaperSet]) {
      setSelectedPaperSet('all');
    }
  }, [selectedSubject, currentSubjectData, selectedPaperSet]);

  const handleSelectSemester = (sem: string) => {
    setSelectedSemester(sem);
    setIsSemesterMenuOpen(false);
    const matching = sem === 'all' ? subjectKeys : subjectKeys.filter(k => (examData as any)[k]?.semester === sem);
    if (matching.length > 0 && !matching.includes(selectedSubject)) {
      setSelectedSubject(matching[0]);
    }
  };

  const dynamicBentoCards = useMemo(() => {
    const keys = filteredSubjectKeys;
    const cards: any[] = [];

    keys.slice(0, 4).forEach((k) => {
      const sub = (examData as any)[k];
      if (!sub) return;
      const isLab = sub.type === 'practical';
      const cleanDesc = sub.syllabus ? sub.syllabus.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 85).trim() + '...' : `Syllabus and questions for ${sub.code || k}`;
      cards.push({
        id: k,
        color: '#0f172a',
        title: sub.title || k.toUpperCase(),
        description: cleanDesc,
        label: isLab ? '🧪 Lab' : (sub.code || 'Paper')
      });
    });

    const hasGaganInSem = keys.some(k => !!((examData as any)[k]?.['gagan-important-topics'] || (examData as any)[k]?.['star-ranked-hit-list']));
    if (hasGaganInSem) {
      cards.push({
        id: 'gagan',
        color: '#0f172a',
        title: '⭐ Star-Ranked Priority Hit List',
        description: '1–2 hour high-yield revision list rated with ⭐ priority stars for OU exams',
        label: '⭐ Star-Rated'
      });
    } else {
      cards.push({
        id: 'sets',
        color: '#0f172a',
        title: '🎯 Predicted Model Paper Sets',
        description: 'Predicted 70-mark Osmania University semester examination model papers',
        label: '🎯 Model Sets'
      });
    }

    return cards;
  }, [filteredSubjectKeys]);

  const handleBentoCardClick = (card: any) => {
    if (card.id === 'gagan') {
      const hasCurrentGagan = !!(currentSubjectData['gagan-important-topics'] || currentSubjectData['star-ranked-hit-list']);
      if (!hasCurrentGagan) {
        const matching = filteredSubjectKeys.find(k => !!((examData as any)[k]?.['gagan-important-topics'] || (examData as any)[k]?.['star-ranked-hit-list']));
        if (matching) {
          setSelectedSubject(matching);
        }
      }
      setActiveTab('bank');
      setBankSubTab('gagan');
    } else if (card.id === 'sets') {
      setActiveTab('sets');
    } else if (examData[card.id as keyof typeof examData]) {
      const targetSem = (examData as any)[card.id]?.semester;
      if (targetSem && targetSem !== selectedSemester && selectedSemester !== 'all') {
        setSelectedSemester(targetSem);
      }
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
            <p className="subtitle text-xs text-slate-400">Osmania University M.Sc (CBCS) Curriculum & Question Banks</p>
          </div>
        </div>

        {/* Dual Glassmorphic Filter Controls */}
        <div className="flex flex-wrap items-center gap-3" style={{ position: 'relative', overflow: 'visible', zIndex: 100 }}>
          {/* 1. Semester Selector Dropdown */}
          <div className="relative inline-block" style={{ position: 'relative', overflow: 'visible', zIndex: 101 }} ref={semesterMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsSemesterMenuOpen(!isSemesterMenuOpen);
                setIsPaperMenuOpen(false);
              }}
              className="custom-dropdown-pill"
              title="Filter by Semester"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <span className="picker-icon">🎓</span>
              <span className="font-semibold text-slate-100">
                {SEMESTERS.find(s => s.id === selectedSemester)?.label || 'All Semesters'}
              </span>
              <span className="text-slate-400 text-xs ml-1">▾</span>
            </button>

            {isSemesterMenuOpen && (
              <div className="custom-dropdown-menu paper-menu top-downward-menu" style={{ minWidth: '240px', zIndex: 9999 }}>
                <div className="dropdown-header">Filter by Semester</div>
                {SEMESTERS.map((sem) => {
                  const isSelected = sem.id === selectedSemester;
                  return (
                    <button
                      key={sem.id}
                      type="button"
                      onClick={() => handleSelectSemester(sem.id)}
                      className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                    >
                      <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', fontSize: '10px', padding: '2px 6px', marginRight: '6px' }}>
                        {sem.badge}
                      </span>
                      <span>{sem.label}</span>
                      {isSelected && <Check size={14} className="text-cyan-400 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Paper / Subject Selector Dropdown */}
          <div className="relative inline-block" style={{ position: 'relative', overflow: 'visible', zIndex: 100 }} ref={paperMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsPaperMenuOpen(!isPaperMenuOpen);
                setIsSemesterMenuOpen(false);
              }}
              className="custom-dropdown-pill"
              title="Select Paper / Subject"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <span className="picker-icon">{currentSubjectData.type === 'practical' ? '🧪' : '📖'}</span>
              <span className="font-semibold text-slate-100">{currentSubjectData.title || selectedSubject.toUpperCase()}</span>
              <span className="text-slate-400 text-xs ml-1">▾</span>
            </button>

            {isPaperMenuOpen && (
              <div className="custom-dropdown-menu paper-menu top-downward-menu" style={{ minWidth: '340px', maxHeight: '360px', overflowY: 'auto', zIndex: 9999 }}>
                <div className="dropdown-header">
                  Select Paper ({filteredSubjectKeys.length} available)
                </div>
                {filteredSubjectKeys.map((key) => {
                  const item = (examData as any)[key];
                  const isSelected = key === selectedSubject;
                  const isLab = item.type === 'practical';
                  const semBadge = item.semester === 'sem-1' ? 'SEM I' : item.semester === 'sem-2' ? 'SEM II' : item.semester === 'sem-3' ? 'SEM III' : 'SEM IV';
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
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                        <span
                          className="badge"
                          style={{
                            background: isLab ? 'rgba(244, 63, 94, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                            color: isLab ? '#f43f5e' : '#38bdf8',
                            fontSize: '9px',
                            padding: '2px 5px'
                          }}
                        >
                          {isLab ? '🧪 LAB' : semBadge}
                        </span>
                        <span className="truncate">{item.title || key.toUpperCase()}</span>
                        {isSelected && <Check size={14} className="text-cyan-400 ml-auto flex-shrink-0" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* React Bits MagicBento Interactive Grid */}
      <div className="bento-wrapper-container" style={{ marginBottom: '16px', width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
        <MagicBento
          cards={dynamicBentoCards}
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
            onClick={() => setActiveTab('syllabus')}
            className={`tab-btn ${activeTab === 'syllabus' ? 'active' : ''}`}
          >
            <BookOpen size={16} />
            <span>Full Syllabus Outline</span>
          </button>
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
            <span>Predicted Paper Sets (A–E)</span>
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
            {/* Sub-tab toggle bar for Standard, Streamlined, and Star-Ranked Hit List */}
            {(() => {
              const hasStreamlined = !!currentSubjectData['streamlined-question-bank'];
              const hasStarRanked = !!(currentSubjectData['gagan-important-topics'] || currentSubjectData['star-ranked-hit-list']);
              const hasSubTabs = hasStreamlined || hasStarRanked;

              if (!hasSubTabs) return null;

              return (
                <div
                  className="subtabs-toggle-bar"
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '16px',
                    background: 'var(--bg-tertiary)',
                    padding: '6px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    flexWrap: 'wrap'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setBankSubTab('standard')}
                    style={{
                      flex: 1,
                      minWidth: '140px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: bankSubTab === 'standard' ? 'var(--accent-cyan)' : 'transparent',
                      color: bankSubTab === 'standard' ? '#ffffff' : 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: bankSubTab === 'standard' ? '0 0 12px rgba(6, 182, 212, 0.3)' : 'none'
                    }}
                  >
                    {currentSubjectData['standard-tab-title'] || '🎯 Standard Question Bank'}
                  </button>

                  {hasStreamlined && (
                    <button
                      type="button"
                      onClick={() => setBankSubTab('streamlined')}
                      style={{
                        flex: 1,
                        minWidth: '140px',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: bankSubTab === 'streamlined' ? 'linear-gradient(135deg, #ec4899, #f43f5e)' : 'transparent',
                        color: bankSubTab === 'streamlined' ? '#ffffff' : 'var(--text-primary)',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: bankSubTab === 'streamlined' ? '0 0 12px rgba(244, 63, 94, 0.4)' : 'none'
                      }}
                    >
                      {currentSubjectData['streamlined-tab-title'] || '🔥 Streamlined High-Yield (Core Focus)'}
                    </button>
                  )}

                  {hasStarRanked && (
                    <button
                      type="button"
                      onClick={() => setBankSubTab('gagan')}
                      style={{
                        flex: 1,
                        minWidth: '140px',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: bankSubTab === 'gagan' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'transparent',
                        color: bankSubTab === 'gagan' ? '#ffffff' : 'var(--text-primary)',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: bankSubTab === 'gagan' ? '0 0 12px rgba(245, 158, 11, 0.4)' : 'none'
                      }}
                    >
                      {currentSubjectData['gagan-tab-title'] || '⭐ Star-Ranked Priority Hit List'}
                    </button>
                  )}
                </div>
              );
            })()}

            {currentSubjectData['question-bank'] || currentSubjectData['streamlined-question-bank'] || currentSubjectData['gagan-important-topics'] ? (
              <div
                className="formatted-content markdown-body"
                dangerouslySetInnerHTML={{
                  __html: renderFormattedContent(
                    (() => {
                      if (bankSubTab === 'streamlined' && currentSubjectData['streamlined-question-bank']) {
                        return currentSubjectData['streamlined-question-bank'];
                      }
                      if (bankSubTab === 'gagan' && (currentSubjectData['gagan-important-topics'] || currentSubjectData['star-ranked-hit-list'])) {
                        return currentSubjectData['gagan-important-topics'] || currentSubjectData['star-ranked-hit-list'];
                      }
                      return currentSubjectData['question-bank'] || 'No question bank available.';
                    })()
                  )
                }}
              />
            ) : (
              <div className="text-center p-8" style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px dashed rgba(6, 182, 212, 0.25)' }}>
                <Sparkles size={32} className="text-cyan-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-100 mb-2">
                  {currentSubjectData.type === 'practical' ? '🧪 Practical Lab Curriculum' : '📘 Theory Question Bank Pending'}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                  {currentSubjectData.type === 'practical'
                    ? 'This is a hands-on programming laboratory paper. View the complete list of practical experiments in the Full Syllabus Outline tab, or launch AI assistance below.'
                    : 'The high-yield question bank for this paper is queued for integration. You can explore the full syllabus outline or ask Prof. Joe AI to solve specific topics.'}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('syllabus')}
                    className="btn btn-primary"
                    style={{ fontSize: '0.82rem' }}
                  >
                    <BookOpen size={14} />
                    <span>View Syllabus Outline</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onLoadQuestionToChat(`Explain all concepts and practical programs for ${currentSubjectData.title}:`)}
                    className="btn"
                    style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', border: '1px solid rgba(6, 182, 212, 0.3)', fontSize: '0.82rem' }}
                  >
                    <Send size={14} />
                    <span>Ask AI about {currentSubjectData.code}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sets' && (
          <div className="paper-sets-content">
            {hasSets ? (
              <>
                {/* Dynamic Paper Set Filter Pills */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', background: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', marginRight: '4px' }}>Filter Paper:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPaperSet('all')}
                    style={{
                      background: selectedPaperSet === 'all' ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
                      color: selectedPaperSet === 'all' ? '#ffffff' : 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      padding: '4px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🎯 All Sets ({availablePaperSets.length})
                  </button>
                  {availablePaperSets.map(setItem => (
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

                {availablePaperSets
                  .filter(item => selectedPaperSet === 'all' || selectedPaperSet === item.id)
                  .map((item) => {
                    const setKey = item.id;
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
              </>
            ) : (
              <div className="card-box text-center p-8" style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px dashed rgba(6, 182, 212, 0.25)' }}>
                <FileText size={32} className="text-cyan-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-100 mb-2">Predicted Examination Sets Pending</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                  Predicted sets A–E for {currentSubjectData.title} are being generated. In the meantime, you can explore the syllabus outline or ask Prof. Joe AI to formulate practice papers.
                </p>
                <button
                  type="button"
                  onClick={() => onLoadQuestionToChat(`Generate a predicted 70-mark Osmania University model paper for ${currentSubjectData.title} with Part A (5x2=10) and Part B (5x12=60 with internal choice):`)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.82rem' }}
                >
                  <Send size={14} />
                  <span>Ask AI to Generate Model Paper</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
