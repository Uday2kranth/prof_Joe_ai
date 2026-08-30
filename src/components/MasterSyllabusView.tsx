import React, { useState, useMemo } from 'react';
import {
  MASTER_CURRICULUM_TRACKS,
  SUBJECT_STREAMS,
  EDUCATION_LEVELS,
  type EducationLevelType,
  type SubjectStreamType,
  type CurriculumTrack
} from '../data/masterSyllabusData';
import {
  UnifiedButton,
  UnifiedBentoTile,
  UnifiedSearchInput,
  UnifiedMasteryCheckbox
} from './syllabus/UnifiedSyllabusControls';
import type { ActiveViewType } from '../types';

export interface MasterSyllabusViewProps {
  onBackToHub?: () => void;
  onNavigateWorkspace?: (workspace: ActiveViewType) => void;
}

type MainTabType = 'syllabus' | 'roadmaps';
type CareerGoalType = 'ai_research' | 'quant_analyst' | 'algo_engineer' | 'applied_ml';

interface CareerPathConfig {
  id: CareerGoalType;
  title: string;
  icon: string;
  description: string;
  recommendedUnits: string[];
  estimatedWeeks: number;
}

const CAREER_PATHS: CareerPathConfig[] = [
  {
    id: 'ai_research',
    title: 'AI Research Scientist & Theoretician',
    icon: '🧠',
    description: 'Master axiomatic vector calculus, measure-theoretic probability, convex Lagrangian duality, Transformer attention, and generative latent diffusion.',
    recommendedUnits: ['MATH-2.1', 'MATH-4.2', 'MATH-6.2', 'MATH-7.2', 'AI-3.2', 'AI-5.1', 'AI-6.1'],
    estimatedWeeks: 24
  },
  {
    id: 'quant_analyst',
    title: 'Quantitative Analyst & Statistical Modeler',
    icon: '📊',
    description: 'Master high-dimensional matrix decompositions (SVD), bivariate Gaussian covariance ellipsoids, stochastic differential equations, and Runge-Kutta ODE dynamics.',
    recommendedUnits: ['MATH-1.1', 'MATH-2.1', 'MATH-5.2', 'MATH-4.2', 'MATH-7.1', 'MATH-8.1', 'AI-2.1'],
    estimatedWeeks: 20
  },
  {
    id: 'algo_engineer',
    title: 'Core Algorithm & Systems Architect',
    icon: '⚡',
    description: 'Master asymptotic complexity bounds, self-balancing AVL rotations, Dijkstra graph relaxations, 2D dynamic programming, and P vs NP Karp reductions.',
    recommendedUnits: ['DSA-1.1', 'DSA-2.1', 'DSA-3.2', 'DSA-4.2', 'DSA-5.1', 'DSA-6.2'],
    estimatedWeeks: 18
  },
  {
    id: 'applied_ml',
    title: 'Applied Machine Learning & Vision Engineer',
    icon: '🤖',
    description: 'Master classification hyperplanes, Mercer kernel 3D paraboloid lifts, multi-layer backpropagation, spatial CNN feature channels, and causal autoregressive LLMs.',
    recommendedUnits: ['MATH-2.1', 'AI-2.1', 'AI-2.2', 'AI-3.1', 'AI-4.1', 'AI-5.1', 'DSA-2.2'],
    estimatedWeeks: 22
  }
];

export const MasterSyllabusView: React.FC<MasterSyllabusViewProps> = ({
  onBackToHub,
  onNavigateWorkspace
}) => {
  // Navigation & Filter States
  const [activeMainTab, setActiveMainTab] = useState<MainTabType>('syllabus');
  const [selectedStream, setSelectedStream] = useState<SubjectStreamType>('all');
  const [selectedLevel, setSelectedLevel] = useState<EducationLevelType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCareerGoal, setSelectedCareerGoal] = useState<CareerGoalType>('ai_research');
  const [expandedTrackIds, setExpandedTrackIds] = useState<Set<string>>(() => {
    return new Set(MASTER_CURRICULUM_TRACKS.map(t => t.trackId));
  });

  const toggleTrackExpand = (trackId: string) => {
    setExpandedTrackIds(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  // LocalStorage Mastery Tracking
  const [completedUnitCodes, setCompletedUnitCodes] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('prof_joe_master_syllabus_completed');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleUnitMastery = (unitCode: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompletedUnitCodes(prev => {
      const next = new Set(prev);
      if (next.has(unitCode)) next.delete(unitCode);
      else next.add(unitCode);
      try {
        localStorage.setItem('prof_joe_master_syllabus_completed', JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Flattened All Units List for Counts & Search
  const allUnits = useMemo(() => {
    return MASTER_CURRICULUM_TRACKS.flatMap(track => 
      track.units.map(unit => ({
        ...unit,
        trackId: track.trackId,
        trackTitle: track.trackTitle,
        streamId: track.streamId
      }))
    );
  }, []);

  // Filtered Tracks & Units Computation
  const filteredTracks = useMemo(() => {
    return MASTER_CURRICULUM_TRACKS.map(track => {
      if (selectedStream !== 'all' && track.streamId !== selectedStream) return null;
      if (selectedLevel !== 'all' && track.educationLevel !== selectedLevel) {
        // Check if any unit matches the level
        const hasMatchingUnit = track.units.some(u => u.educationLevel === selectedLevel);
        if (!hasMatchingUnit) return null;
      }

      let matchingUnits = track.units;
      if (selectedLevel !== 'all') {
        matchingUnits = matchingUnits.filter(u => u.educationLevel === selectedLevel);
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        matchingUnits = matchingUnits.filter(unit => {
          const matchesTitle = unit.title.toLowerCase().includes(q);
          const matchesCode = unit.unitCode.toLowerCase().includes(q);
          const matchesOverview = unit.overview.toLowerCase().includes(q);
          const matchesTopics = unit.detailedTopics.some(t => t.toLowerCase().includes(q));
          const matchesCompetencies = unit.coreCompetencies.some(c => c.toLowerCase().includes(q));
          const matchesBooks = unit.recommendedTextbooks.some(b => b.toLowerCase().includes(q));
          return matchesTitle || matchesCode || matchesOverview || matchesTopics || matchesCompetencies || matchesBooks;
        });
      }

      if (matchingUnits.length === 0) return null;

      return {
        ...track,
        units: matchingUnits
      };
    }).filter(Boolean) as CurriculumTrack[];
  }, [selectedStream, selectedLevel, searchQuery]);

  const totalFilteredUnitsCount = useMemo(() => {
    return filteredTracks.reduce((acc, t) => acc + t.units.length, 0);
  }, [filteredTracks]);

  // Overall Completion Progress
  const totalUnitsCount = allUnits.length;
  const completedCount = completedUnitCodes.size;
  const progressPercent = totalUnitsCount > 0 ? Math.round((completedCount / totalUnitsCount) * 100) : 0;

  // Active Career Goal Path Data
  const activeCareerPath = useMemo(() => {
    return CAREER_PATHS.find(c => c.id === selectedCareerGoal) || CAREER_PATHS[0];
  }, [selectedCareerGoal]);

  const careerRecommendedUnits = useMemo(() => {
    return allUnits.filter(u => activeCareerPath.recommendedUnits.includes(u.unitCode));
  }, [activeCareerPath, allUnits]);

  return (
    <div className="syllabus-roadmaps-view">
      {/* ─── Top Header Bar ─── */}
      <header className="syllabus-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <UnifiedButton
            variant="secondary"
            size="sm"
            onClick={onBackToHub}
            icon="←"
            title="Return to Home Hub"
          >
            Home Hub
          </UnifiedButton>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-cyan, #06b6d4), #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
              }}
            >
              🗺️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    background: 'linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Syllabus & Roadmaps
                </h1>
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: 'var(--accent-cyan, #38bdf8)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Tier-1 Standards
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>
                Axiomatic Foundations → Undergraduate Core → Master's Rigor → Doctoral Frontiers
              </p>
            </div>
          </div>
        </div>

        {/* Header Right: Navigation Tabs & Progress Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Main Mode Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-secondary, #0b1120)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))'
            }}
          >
            <UnifiedButton
              variant={activeMainTab === 'syllabus' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveMainTab('syllabus')}
              icon="📜"
            >
              Syllabus Explorer
            </UnifiedButton>
            <UnifiedButton
              variant={activeMainTab === 'roadmaps' ? 'accent' : 'ghost'}
              size="sm"
              onClick={() => setActiveMainTab('roadmaps')}
              icon="🗺️"
            >
              Interactive Roadmaps
            </UnifiedButton>
          </div>

          {/* Mastery Progress Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 12px',
              borderRadius: '10px',
              background: 'var(--bg-secondary, #0b1120)',
              border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
              fontSize: '0.74rem'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Mastery Progress</span>
              <span style={{ fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)', fontFamily: 'var(--font-mono, monospace)' }}>
                {completedCount} / {totalUnitsCount} Units ({progressPercent}%)
              </span>
            </div>
            <div
              style={{
                width: '50px',
                height: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, var(--accent-cyan, #06b6d4), #10b981)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content Container ─── */}
      <main className="syllabus-main-container">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: SYLLABUS EXPLORER                                           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeMainTab === 'syllabus' && (
          <>
            {/* 1. Subject Stream Bento Selection Deck */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-muted, #64748b)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🍱</span>
                  <span>Select Subject Stream</span>
                </h3>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted, #64748b)', fontFamily: 'var(--font-mono, monospace)' }}>
                  Benchmarked: ISI Kolkata, IIIT Hyderabad, CLRS & Stanford
                </span>
              </div>

              <div className="syllabus-bento-grid streams">
                {/* Option 1: All Streams */}
                <UnifiedBentoTile
                  icon="🌐"
                  title="All Subject Streams"
                  subtitle="Unified table of contents across Mathematics, AI/ML, and DSA curricula."
                  badge="21 Tracks"
                  active={selectedStream === 'all'}
                  onClick={() => setSelectedStream('all')}
                  accentColor="var(--accent-cyan, #06b6d4)"
                />

                {/* Specific Streams */}
                {SUBJECT_STREAMS.map(stream => (
                  <UnifiedBentoTile
                    key={stream.id}
                    icon={stream.icon}
                    title={stream.shortName}
                    subtitle={stream.summary}
                    badge={`${stream.totalTracks} Tracks`}
                    active={selectedStream === stream.id}
                    onClick={() => setSelectedStream(stream.id)}
                    accentColor={stream.color}
                  />
                ))}
              </div>
            </div>

            {/* 2. Education Level Breakdown Bento Deck */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-muted, #64748b)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🎓</span>
                  <span>Academic Education Level Breakdown</span>
                </h3>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted, #64748b)', fontFamily: 'var(--font-mono, monospace)' }}>
                  Foundations → B.Tech / B.Sc → M.Tech / M.Sc → Ph.D. Research
                </span>
              </div>

              <div className="syllabus-bento-grid levels">
                {EDUCATION_LEVELS.map(level => (
                  <UnifiedBentoTile
                    key={level.id}
                    icon={level.icon}
                    title={level.name}
                    subtitle={level.description}
                    badge={level.badge}
                    active={selectedLevel === level.id}
                    onClick={() => setSelectedLevel(level.id)}
                    accentColor="#a855f7"
                  />
                ))}
              </div>
            </div>

            {/* 3. Search & Keywords Filter Bar */}
            <UnifiedSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search syllabus modules, theorems, formulas, or textbooks..."
              keywords={['SVD', 'Backprop', 'Attention', 'Dijkstra', 'AVL Rotations', 'KKT Duality', 'Karp Reductions']}
              onSelectKeyword={setSearchQuery}
            />

            {/* 4. Active Counter & Reset Filter */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary, #94a3b8)' }}>
              <div>
                Showing <strong style={{ color: 'var(--accent-cyan, #38bdf8)' }}>{totalFilteredUnitsCount}</strong> detailed curriculum modules across <strong style={{ color: 'var(--text-primary)' }}>{filteredTracks.length}</strong> tracks
                {selectedStream !== 'all' && (
                  <span> in <strong style={{ color: 'var(--text-primary)' }}>{SUBJECT_STREAMS.find(s => s.id === selectedStream)?.shortName}</strong></span>
                )}
                {selectedLevel !== 'all' && (
                  <span> at <strong style={{ color: '#c084fc' }}>{EDUCATION_LEVELS.find(l => l.id === selectedLevel)?.name}</strong></span>
                )}
              </div>
              {(selectedStream !== 'all' || selectedLevel !== 'all' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStream('all');
                    setSelectedLevel('all');
                    setSearchQuery('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-cyan, #06b6d4)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Reset All Filters ↺
                </button>
              )}
            </div>

            {/* 5. Hierarchical Track & Granular Units Accordion */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {filteredTracks.map(track => {
                const streamInfo = SUBJECT_STREAMS.find(s => s.id === track.streamId);
                const isExpanded = expandedTrackIds.has(track.trackId);

                return (
                  <div
                    key={track.trackId}
                    style={{
                      borderRadius: '16px',
                      background: 'var(--card-bg, rgba(11, 17, 32, 0.88))',
                      border: '1px solid var(--card-border, rgba(255, 255, 255, 0.08))',
                      overflow: 'hidden',
                      boxShadow: 'var(--card-shadow)'
                    }}
                  >
                    {/* Track Header */}
                    <div
                      onClick={() => toggleTrackExpand(track.trackId)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        padding: '16px 20px',
                        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.75))',
                        borderBottom: isExpanded ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{streamInfo?.icon}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span
                              style={{
                                fontSize: '0.66rem',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: 'rgba(168, 85, 247, 0.15)',
                                color: '#c084fc',
                                border: '1px solid rgba(168, 85, 247, 0.3)'
                              }}
                            >
                              {track.levelBadge}
                            </span>
                            <span style={{ fontSize: '0.70rem', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>
                              {streamInfo?.shortName}
                            </span>
                          </div>
                          <h2
                            style={{
                              margin: 0,
                              fontSize: '1.02rem',
                              fontWeight: 800,
                              color: 'var(--text-primary, #f8fafc)'
                            }}
                          >
                            {track.trackTitle}
                          </h2>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem', color: 'var(--text-secondary, #94a3b8)' }}>
                            {track.summary}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent-cyan, #38bdf8)' }}>
                          {track.units.length} Modules
                        </span>
                        <span style={{ fontSize: '1rem', color: 'var(--text-muted, #64748b)' }}>
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* Track Units Body */}
                    {isExpanded && (
                      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {track.units.map(unit => {
                          const isCompleted = completedUnitCodes.has(unit.unitCode);

                          return (
                            <div
                              key={unit.unitCode}
                              className={`syllabus-topic-card ${isCompleted ? 'completed' : ''}`}
                            >
                              {/* Unit Header */}
                              <div className="syllabus-topic-header">
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                  <UnifiedMasteryCheckbox
                                    checked={isCompleted}
                                    onChange={() => toggleUnitMastery(unit.unitCode)}
                                  />
                                  <div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                      <span
                                        style={{
                                          fontSize: '0.68rem',
                                          fontWeight: 800,
                                          fontFamily: 'var(--font-mono, monospace)',
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                          background: 'rgba(0, 0, 0, 0.4)',
                                          color: 'var(--accent-cyan, #38bdf8)',
                                          border: '1px solid rgba(6, 182, 212, 0.3)'
                                        }}
                                      >
                                        {unit.unitCode}
                                      </span>
                                      <span
                                        style={{
                                          fontSize: '0.68rem',
                                          fontWeight: 700,
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                          background: 'rgba(168, 85, 247, 0.15)',
                                          color: '#c084fc',
                                          border: '1px solid rgba(168, 85, 247, 0.3)'
                                        }}
                                      >
                                        {unit.levelBadge}
                                      </span>
                                    </div>
                                    <h3
                                      style={{
                                        margin: 0,
                                        fontSize: '0.94rem',
                                        fontWeight: 800,
                                        color: 'var(--text-primary, #f8fafc)'
                                      }}
                                    >
                                      {unit.title}
                                    </h3>
                                  </div>
                                </div>

                                {/* Interactive Lab Link */}
                                {unit.interactiveLab && (
                                  <UnifiedButton
                                    variant="launch"
                                    size="xs"
                                    onClick={() => onNavigateWorkspace && onNavigateWorkspace(unit.interactiveLab!.workspace)}
                                    icon="⚡"
                                  >
                                    {unit.interactiveLab.label}
                                  </UnifiedButton>
                                )}
                              </div>

                              {/* Unit Body */}
                              <div className="syllabus-topic-body">
                                <p style={{ margin: 0, fontSize: '0.80rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.5 }}>
                                  {unit.overview}
                                </p>

                                {/* Granular Syllabus Breakdown */}
                                <div className="syllabus-subtopics-box">
                                  <div
                                    style={{
                                      fontSize: '0.70rem',
                                      fontWeight: 800,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.05em',
                                      color: 'var(--accent-cyan, #06b6d4)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}
                                  >
                                    <span>📋</span>
                                    <span>Granular Syllabus Breakdown</span>
                                  </div>
                                  <ul className="syllabus-subtopics-list">
                                    {unit.detailedTopics.map((sub, idx) => (
                                      <li key={idx} className="syllabus-subtopic-item">
                                        <span className="syllabus-subtopic-bullet">•</span>
                                        <span>{sub}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Bottom Meta: Core Competencies & Textbooks */}
                                <div className="syllabus-meta-row">
                                  {/* Core Competencies */}
                                  <div className="syllabus-meta-box">
                                    <div className="syllabus-meta-title" style={{ color: '#fbbf24' }}>
                                      <span>🎯</span>
                                      <span>Core Analytical Competencies</span>
                                    </div>
                                    <div>
                                      {unit.coreCompetencies.map((comp, idx) => (
                                        <span key={idx} className="syllabus-theorem-chip">
                                          {comp}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Textbooks */}
                                  <div className="syllabus-meta-box">
                                    <div className="syllabus-meta-title" style={{ color: '#34d399' }}>
                                      <span>📚</span>
                                      <span>Standard Reference Literature</span>
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.72rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.5 }}>
                                      {unit.recommendedTextbooks.map((book, idx) => (
                                        <li key={idx}>📖 {book}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: INTERACTIVE ROADMAPS & GENERATOR                             */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeMainTab === 'roadmaps' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Career Goal Track Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '0.94rem',
                    fontWeight: 800,
                    color: 'var(--text-primary, #f8fafc)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🎯</span>
                  <span>Select Target Specialization & Career Track</span>
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem', color: 'var(--text-secondary, #94a3b8)' }}>
                  Generate a structured, milestone-driven curriculum mapped to industry and academic research expectations.
                </p>
              </div>

              <div className="syllabus-bento-grid career-paths">
                {CAREER_PATHS.map(path => (
                  <UnifiedBentoTile
                    key={path.id}
                    icon={path.icon}
                    title={path.title}
                    subtitle={path.description}
                    badge={`~${path.estimatedWeeks} Weeks`}
                    badgeColor="#c084fc"
                    active={selectedCareerGoal === path.id}
                    onClick={() => setSelectedCareerGoal(path.id)}
                    accentColor="#a855f7"
                    footerText={`${path.recommendedUnits.length} Core Modules`}
                  />
                ))}
              </div>
            </div>

            {/* Visual Milestone DAG Timeline */}
            <div
              style={{
                padding: '20px',
                borderRadius: '16px',
                background: 'var(--card-bg, rgba(11, 17, 32, 0.88))',
                border: '1px solid var(--card-border, rgba(255, 255, 255, 0.08))',
                boxShadow: 'var(--card-shadow)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '0.96rem',
                      fontWeight: 800,
                      color: 'var(--text-primary, #f8fafc)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{activeCareerPath.icon}</span>
                    <span>Visual Milestone DAG: {activeCareerPath.title}</span>
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    Linear & parallel dependency pathways from foundational prerequisites to advanced research mastery.
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono, monospace)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'var(--bg-primary, #020617)',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                    color: 'var(--accent-cyan, #38bdf8)'
                  }}
                >
                  Estimated Time: ~{activeCareerPath.estimatedWeeks * 10} Hours
                </span>
              </div>

              {/* Steps */}
              <div className="milestone-dag-timeline">
                {careerRecommendedUnits.map((unit, index) => {
                  const isCompleted = completedUnitCodes.has(unit.unitCode);
                  const streamInfo = SUBJECT_STREAMS.find(s => s.id === unit.streamId);

                  return (
                    <div key={unit.unitCode} style={{ position: 'relative' }}>
                      {/* Step Number Dot */}
                      <div className={`milestone-step-node ${isCompleted ? 'completed' : ''}`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>

                      {/* Milestone Card */}
                      <div
                        style={{
                          padding: '14px 16px',
                          borderRadius: '12px',
                          background: 'var(--bg-primary, #020617)',
                          border: isCompleted
                            ? '1px solid rgba(16, 185, 129, 0.4)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                fontSize: '0.66rem',
                                fontWeight: 800,
                                fontFamily: 'var(--font-mono, monospace)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: 'rgba(0, 0, 0, 0.5)',
                                color: 'var(--accent-cyan, #38bdf8)',
                                border: '1px solid rgba(6, 182, 212, 0.3)'
                              }}
                            >
                              {unit.unitCode}
                            </span>
                            <span
                              style={{
                                fontSize: '0.66rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: 'rgba(168, 85, 247, 0.15)',
                                color: '#c084fc'
                              }}
                            >
                              {unit.levelBadge}
                            </span>
                            <span style={{ fontSize: '0.70rem', color: 'var(--text-muted, #64748b)' }}>
                              {streamInfo?.icon} {unit.trackTitle}
                            </span>
                          </div>

                          <UnifiedButton
                            variant={isCompleted ? 'secondary' : 'ghost'}
                            size="xs"
                            onClick={() => toggleUnitMastery(unit.unitCode)}
                            icon={isCompleted ? '✓' : '○'}
                          >
                            {isCompleted ? 'Milestone Completed' : 'Mark Milestone Done'}
                          </UnifiedButton>
                        </div>

                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>
                            {unit.title}
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.45 }}>
                            {unit.overview}
                          </p>
                        </div>

                        {unit.interactiveLab && (
                          <div
                            style={{
                              paddingTop: '8px',
                              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.72rem'
                            }}
                          >
                            <span style={{ color: 'var(--text-muted, #64748b)' }}>
                              {unit.interactiveLab.description}
                            </span>
                            <UnifiedButton
                              variant="launch"
                              size="xs"
                              onClick={() => onNavigateWorkspace && onNavigateWorkspace(unit.interactiveLab!.workspace)}
                              icon="⚡"
                            >
                              Launch Lab
                            </UnifiedButton>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
