import React, { useState, useMemo } from 'react';
import katex from 'katex';
import { DSA_CATEGORIES, DSA_ALGORITHMS } from './dsaData';
import type { DsaCategory } from './types';
import { SortingLab } from './modules/SortingLab';
import { SearchingLab } from './modules/SearchingLab';
import { DataStructuresLab } from './modules/DataStructuresLab';
import { GraphLab } from './modules/GraphLab';
import { RecursionLab } from './modules/RecursionLab';
import { DynamicProgrammingLab } from './modules/DynamicProgrammingLab';
import { BacktrackingLab } from './modules/BacktrackingLab';
import { GreedyStringLab } from './modules/GreedyStringLab';
import {
  Code2,
  Copy,
  Check,
  Zap,
  Clock,
  HardDrive,
  BookOpen,
  Search,
  ArrowRight,
  ChevronLeft,
  Grid,
  Boxes
} from 'lucide-react';

export const DsaLabView: React.FC = () => {
  const [dsaViewLevel, setDsaViewLevel] = useState<'categories' | 'algorithms' | 'visualizer'>('categories');
  const [activeCategory, setActiveCategory] = useState<DsaCategory>('sorting');
  const [activeAlgoId, setActiveAlgoId] = useState<string>('bubble_sort');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [speed, setSpeed] = useState<number>(3); // 1x to 8x
  const [speedInput, setSpeedInput] = useState<string>('3');
  const [activeCodeTab, setActiveCodeTab] = useState<'pseudo' | 'python' | 'cpp' | 'java'>('python');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<'visualizer' | 'code'>('visualizer');

  const handleApplySpeed = () => {
    const val = parseInt(speedInput, 10);
    if (!isNaN(val) && val >= 1 && val <= 8) {
      setSpeed(val);
    } else {
      setSpeedInput(String(speed));
    }
  };

  const activeAlgo = DSA_ALGORITHMS[activeAlgoId] || DSA_ALGORITHMS.bubble_sort;
  const activeCatMeta = DSA_CATEGORIES.find(c => c.id === activeCategory) || DSA_CATEGORIES[0];

  // Algorithms belonging to the active category
  const categoryAlgos = useMemo(() => {
    return Object.values(DSA_ALGORITHMS).filter(a => a.category === activeCategory);
  }, [activeCategory]);

  // Filtered categories for Level 1
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return DSA_CATEGORIES;
    return DSA_CATEGORIES.filter(cat => {
      const matchesCat = cat.title.toLowerCase().includes(q) || cat.desc.toLowerCase().includes(q);
      // Check if any algorithms in this category match
      const matchingAlgos = Object.values(DSA_ALGORITHMS).filter(
        a => a.category === cat.id && (a.name.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q))
      );
      return matchesCat || matchingAlgos.length > 0;
    });
  }, [searchQuery]);

  // Filtered algorithms for Level 2
  const filteredAlgos = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categoryAlgos;
    return categoryAlgos.filter(
      a =>
        a.name.toLowerCase().includes(q) ||
        a.tag.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.timeComplexityAverage.toLowerCase().includes(q) ||
        a.timeComplexityWorst.toLowerCase().includes(q)
    );
  }, [categoryAlgos, searchQuery]);

  const renderMathProof = (mathFormula: string) => {
    if (!mathFormula) return null;
    try {
      const html = katex.renderToString(mathFormula, {
        throwOnError: false,
        displayMode: true
      });
      return <div className="dsa-math-formula-katex" dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
      return <code style={{ fontSize: '0.8rem', color: '#e2e8f0', fontFamily: 'monospace' }}>{mathFormula}</code>;
    }
  };

  const handleCopyCode = () => {
    let codeStr = activeAlgo.pythonCode;
    if (activeCodeTab === 'pseudo') codeStr = activeAlgo.pseudoCode;
    else if (activeCodeTab === 'cpp') codeStr = activeAlgo.cppCode;
    else if (activeCodeTab === 'java') codeStr = activeAlgo.javaCode;

    navigator.clipboard.writeText(codeStr);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenCategory = (catId: DsaCategory) => {
    setActiveCategory(catId);
    setSearchQuery('');
    // Set default algorithm for this category
    const firstInCat = Object.values(DSA_ALGORITHMS).find(a => a.category === catId);
    if (firstInCat) {
      setActiveAlgoId(firstInCat.id);
    }
    setDsaViewLevel('algorithms');
  };

  const handleLaunchVisualizer = (algoId: string) => {
    setActiveAlgoId(algoId);
    const targetAlgo = DSA_ALGORITHMS[algoId];
    if (targetAlgo) {
      setActiveCategory(targetAlgo.category as DsaCategory);
    }
    setDsaViewLevel('visualizer');
  };

  /* ═══════════════════════════════════════════════════════════════════════
     LEVEL 1: CATEGORY BENTO DECK (MAIN GALLERY)
     ═══════════════════════════════════════════════════════════════════════ */
  if (dsaViewLevel === 'categories') {
    return (
      <div className="mathbox-bento-hub" style={{ minHeight: 'calc(100vh - 70px)' }}>
        {/* Top Bento Header Bar */}
        <div className="mathbox-bento-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.16)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8'
              }}
            >
              <Boxes size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>
                  Data Structures & Algorithms Studio
                </h2>
                <span
                  style={{
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(56, 189, 248, 0.2)',
                    border: '1px solid rgba(56, 189, 248, 0.45)',
                    color: '#38bdf8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  8 CATEGORIES • 50+ VISUALIZERS
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: 'var(--text-muted, #94a3b8)' }}>
                Select a category to explore animated step-by-step algorithms, memory graphs, and Big-O invariants.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                color: 'var(--text-muted, #94a3b8)',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Search categories & algorithms..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="mathbox-bento-search-input"
              style={{ width: '260px' }}
            />
          </div>
        </div>

        {/* 8 Category Bento Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '14px',
            width: '100%'
          }}
        >
          {filteredCategories.map(cat => {
            const countInCat = Object.values(DSA_ALGORITHMS).filter(a => a.category === cat.id).length;
            return (
              <div
                key={cat.id}
                onClick={() => handleOpenCategory(cat.id)}
                className="mathbox-bento-card"
                style={{
                  cursor: 'pointer',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '190px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.8rem' }}>{cat.icon}</span>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background: 'var(--pill-active-bg, rgba(56, 189, 248, 0.2))',
                        color: 'var(--accent-cyan, #38bdf8)',
                        border: '1px solid var(--card-border, rgba(56, 189, 248, 0.35))'
                      }}
                    >
                      {countInCat} Algorithms
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.02rem', fontWeight: 800 }}>
                    {cat.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', lineHeight: '1.45' }}>
                    {cat.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid var(--card-border, rgba(51, 65, 85, 0.4))' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
                    Interactive Studio
                  </span>
                  <button
                    type="button"
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: 'var(--pill-active-bg, rgba(56, 189, 248, 0.22))',
                      color: 'var(--accent-cyan, #38bdf8)',
                      border: '1px solid var(--accent-cyan, #38bdf8)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>Explore</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     LEVEL 2: SUB-ALGORITHM BENTO DECK FOR SELECTED CATEGORY
     ═══════════════════════════════════════════════════════════════════════ */
  if (dsaViewLevel === 'algorithms') {
    return (
      <div className="mathbox-bento-hub">
        {/* Top Navigation & Breadcrumb Header */}
        <div className="mathbox-bento-header" style={{ flexShrink: 0, marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => { setDsaViewLevel('categories'); setSearchQuery(''); }}
              style={{
                height: '32px',
                padding: '0 12px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--pill-bg, rgba(30, 41, 59, 0.7))',
                color: 'var(--text-primary, #f8fafc)',
                border: '1px solid var(--card-border, rgba(51, 65, 85, 0.7))',
                transition: 'all 0.18s ease'
              }}
            >
              <ChevronLeft size={14} />
              <span>All Categories</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>{activeCatMeta.icon}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.04rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>
                  {activeCatMeta.title}
                </h2>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)' }}>
                  {activeCatMeta.desc}
                </span>
              </div>
            </div>
          </div>

          {/* Search Input for Algorithms */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                color: 'var(--text-muted, #94a3b8)',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder={`Search in ${activeCatMeta.title.replace(/^[0-9.]+\s*/, '')}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="mathbox-bento-search-input"
              style={{ width: '240px' }}
            />
          </div>
        </div>

        {/* Quick Category Switcher Pill Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginBottom: '16px',
            flexShrink: 0,
            width: '100%',
            position: 'relative',
            zIndex: 2
          }}
        >
          {DSA_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleOpenCategory(cat.id)}
              className={`mathbox-bento-pill ${activeCategory === cat.id ? 'active' : ''}`}
              style={{ flexShrink: 0 }}
            >
              <span>{cat.icon}</span>
              <span>{cat.title.replace(/^[0-9.]+\s*/, '')}</span>
            </button>
          ))}
        </div>

        {/* Algorithms Bento Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '14px',
            width: '100%'
          }}
        >
          {filteredAlgos.map(algo => {
            return (
              <div
                key={algo.id}
                onClick={() => handleLaunchVisualizer(algo.id)}
                className="mathbox-bento-card"
                style={{
                  cursor: 'pointer',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '220px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                    <span
                      style={{
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: 'var(--accent-cyan, #38bdf8)',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        textTransform: 'uppercase'
                      }}
                    >
                      {algo.tag}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#a78bfa', fontWeight: 700 }}>
                      💾 {algo.spaceComplexity}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.02rem', fontWeight: 800 }}>
                    {algo.name}
                  </h3>

                  <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-muted, #94a3b8)', lineHeight: '1.45', marginBottom: '10px' }}>
                    {algo.description}
                  </p>

                  {/* Asymptotic Complexities Preview Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                      Best: {algo.timeComplexityBest}
                    </span>
                    <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                      Avg: {algo.timeComplexityAverage}
                    </span>
                    <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(248, 113, 113, 0.15)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
                      Worst: {algo.timeComplexityWorst}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--card-border, rgba(51, 65, 85, 0.4))' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
                    Visualizer Ready
                  </span>
                  <button
                    type="button"
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      background: 'var(--pill-active-bg, rgba(56, 189, 248, 0.22))',
                      color: 'var(--accent-cyan, #38bdf8)',
                      border: '1px solid var(--accent-cyan, #38bdf8)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>Launch</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     LEVEL 3: INTERACTIVE VISUALIZER WORKSPACE SHEET
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      boxSizing: 'border-box',
      background: '#070b14',
      color: '#f8fafc',
      padding: '14px 18px',
      gap: '10px',
      overflowY: 'auto'
    }}>
      {/* Top Header Bar with Multi-Level Navigation & Sibling Algorithm Dock */}
      <div className="dsa-header-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '10px 14px',
        background: 'var(--card-bg, rgba(15, 23, 42, 0.88))',
        borderRadius: '14px',
        border: '1px solid var(--card-border, rgba(51, 65, 85, 0.7))',
        boxShadow: 'var(--card-shadow, 0 8px 32px rgba(0, 0, 0, 0.35))',
        flexShrink: 0
      }}>
        {/* Left Navigation Buttons & Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setDsaViewLevel('algorithms')}
            style={{
              height: '32px',
              padding: '0 10px',
              borderRadius: '8px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'var(--pill-active-bg, rgba(56, 189, 248, 0.22))',
              color: '#38bdf8',
              border: '1px solid var(--accent-cyan, rgba(56, 189, 248, 0.45))',
              transition: 'all 0.18s ease'
            }}
            title="Return to Category Algorithms Bento"
          >
            <ChevronLeft size={14} />
            <span>{activeCatMeta.icon} {activeCatMeta.title.replace(/^[0-9.]+\s*/, '')} Deck</span>
          </button>

          <button
            type="button"
            onClick={() => setDsaViewLevel('categories')}
            style={{
              height: '32px',
              padding: '0 10px',
              borderRadius: '8px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'var(--pill-bg, rgba(30, 41, 59, 0.7))',
              color: 'var(--text-muted, #94a3b8)',
              border: '1px solid var(--card-border, rgba(51, 65, 85, 0.7))',
              transition: 'all 0.18s ease'
            }}
            title="Return to All Categories Hub"
          >
            <Grid size={13} />
            <span>All Hubs</span>
          </button>
        </div>

        {/* Center: Algorithm / Data Structure Selector Dropdown (Replaces horizontal scrollport across all categories) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flex: '1 1 240px',
          maxWidth: '380px',
          minWidth: '200px'
        }}>
          <select
            value={activeAlgoId}
            onChange={(e) => setActiveAlgoId(e.target.value)}
            className="dsa-select-control"
            style={{
              width: '100%',
              minHeight: '34px',
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1.5px solid var(--accent-cyan, #38bdf8)',
              color: '#f8fafc',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.18)'
            }}
            title="Select Algorithm / Data Structure"
          >
            {categoryAlgos.map(algo => (
              <option key={algo.id} value={algo.id}>
                {algo.name} {algo.tag ? `(${algo.tag})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Global Speed Controller with [Speed: 3]x [Set] Input Pattern */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: 'var(--bg-tertiary, rgba(15, 23, 42, 0.95))',
          padding: '4px 8px',
          borderRadius: '8px',
          border: '1px solid var(--border-color, rgba(51, 65, 85, 0.7))',
          flexShrink: 0
        }}>
          <Zap size={13} color="var(--accent-cyan, #38bdf8)" />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 700 }}>Speed:</span>
          <input
            type="number"
            min={1}
            max={8}
            value={speedInput}
            onChange={(e) => setSpeedInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleApplySpeed(); }}
            style={{
              width: '38px',
              padding: '2px 4px',
              borderRadius: '5px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: '#0f172a',
              color: '#fff',
              fontSize: '0.76rem',
              textAlign: 'center',
              outline: 'none'
            }}
          />
          <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan, #38bdf8)', fontWeight: 800 }}>x</span>
          <button
            type="button"
            title="Set Speed"
            onClick={handleApplySpeed}
            style={{
              background: 'var(--accent-cyan, #0284c7)',
              color: '#fff',
              border: 'none',
              padding: '3px 8px',
              borderRadius: '5px',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Set
          </button>
        </div>
      </div>

      {/* Mobile Navigation Tabs (Only visible on screens <= 1024px) */}
      <div className="dsa-mobile-tab-nav">
        <button
          type="button"
          onClick={() => setMobileActiveTab('visualizer')}
          className={`dsa-mobile-tab-btn ${mobileActiveTab === 'visualizer' ? 'active' : ''}`}
        >
          <Zap size={15} />
          <span>Visualizer & Animation</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveTab('code')}
          className={`dsa-mobile-tab-btn ${mobileActiveTab === 'code' ? 'active' : ''}`}
        >
          <Code2 size={15} />
          <span>Math & Code Studio</span>
        </button>
      </div>

      {/* Split Workspace Layout: Visualizer Canvas (Left/Center) + Telemetry & Code Deck (Right) */}
      <div className="dsa-split-workspace">
        {/* Left Column: Interactive Visualizer Modules */}
        <div className={`dsa-visualizer-panel ${mobileActiveTab === 'visualizer' ? 'mobile-active' : 'mobile-hidden'}`}>
          {activeCategory === 'sorting' && (
            <SortingLab
              activeAlgorithm={activeAlgoId}
              onSelectAlgorithm={setActiveAlgoId}
              speed={speed}
            />
          )}
          {activeCategory === 'searching' && (
            <SearchingLab
              activeAlgorithm={activeAlgoId}
              onSelectAlgorithm={setActiveAlgoId}
              speed={speed}
            />
          )}
          {activeCategory === 'data_structures' && (
            <DataStructuresLab
              activeAlgorithm={activeAlgoId}
              onSelectAlgorithm={setActiveAlgoId}
            />
          )}
          {activeCategory === 'graph' && (
            <GraphLab
              activeAlgorithm={activeAlgoId}
              onSelectAlgorithm={setActiveAlgoId}
              speed={speed}
            />
          )}
          {activeCategory === 'recursion' && (
            <RecursionLab
              activeAlgorithm={activeAlgoId}
              onSelectAlgorithm={setActiveAlgoId}
              speed={speed}
            />
          )}
          {activeCategory === 'dp' && (
            <DynamicProgrammingLab
              activeAlgorithm={activeAlgoId}
              onSelectAlgorithm={setActiveAlgoId}
              speed={speed}
            />
          )}
          {activeCategory === 'backtracking' && (
            <BacktrackingLab
              activeAlgorithm={activeAlgoId}
              onSelectAlgorithm={setActiveAlgoId}
              speed={speed}
            />
          )}
          {activeCategory === 'greedy_strings' && (
            <GreedyStringLab
              activeAlgorithm={activeAlgoId}
              onSelectAlgorithm={setActiveAlgoId}
              speed={speed}
            />
          )}
        </div>

        {/* Right Column: Mathematical & Telemetry Deck + Multi-Language Code */}
        <div className={`dsa-code-panel ${mobileActiveTab === 'code' ? 'mobile-active' : 'mobile-hidden'}`}>
          {/* Algorithm Info & Complexity Card */}
          <div style={{
            background: 'var(--card-bg, rgba(15, 23, 42, 0.88))',
            borderRadius: '16px',
            border: '1px solid var(--card-border, rgba(51, 65, 85, 0.7))',
            boxShadow: 'var(--card-shadow, 0 8px 32px rgba(0, 0, 0, 0.35))',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-cyan, #38bdf8)', fontWeight: 800 }}>
                  {activeAlgo.category.toUpperCase().replace('_', ' ')}
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>
                  {activeAlgo.name}
                </h2>
              </div>
              <span style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'var(--pill-active-bg, rgba(56, 189, 248, 0.22))',
                color: 'var(--accent-cyan, #38bdf8)',
                fontSize: '0.72rem',
                fontWeight: 800,
                border: '1px solid var(--card-border, rgba(51, 65, 85, 0.7))'
              }}>
                {activeAlgo.tag}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: '1.45' }}>
              {activeAlgo.description}
            </p>

            {/* Asymptotic Complexities Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              paddingTop: '6px'
            }}>
              <div style={{ background: 'var(--bg-tertiary, rgba(15, 23, 42, 0.95))', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.7))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)' }}>
                  <Clock size={12} color="#34d399" />
                  <span>Best Time:</span>
                </div>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#34d399' }}>
                  {activeAlgo.timeComplexityBest}
                </span>
              </div>

              <div style={{ background: 'var(--bg-tertiary, rgba(15, 23, 42, 0.95))', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.7))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)' }}>
                  <Clock size={12} color="#fbbf24" />
                  <span>Average Time:</span>
                </div>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fbbf24' }}>
                  {activeAlgo.timeComplexityAverage}
                </span>
              </div>

              <div style={{ background: 'var(--bg-tertiary, rgba(15, 23, 42, 0.95))', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.7))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)' }}>
                  <Clock size={12} color="#f87171" />
                  <span>Worst Time:</span>
                </div>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f87171' }}>
                  {activeAlgo.timeComplexityWorst}
                </span>
              </div>

              <div style={{ background: 'var(--bg-tertiary, rgba(15, 23, 42, 0.95))', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.7))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)' }}>
                  <HardDrive size={12} color="#a78bfa" />
                  <span>Space Complexity:</span>
                </div>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#a78bfa' }}>
                  {activeAlgo.spaceComplexity}
                </span>
              </div>
            </div>

            {/* Recurrence Relation / Mathematical Formula */}
            <div style={{
              background: 'var(--bg-tertiary, rgba(15, 23, 42, 0.95))',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, rgba(51, 65, 85, 0.7))',
              marginTop: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--accent-cyan, #38bdf8)', fontWeight: 700, marginBottom: '4px' }}>
                <BookOpen size={13} />
                <span>Mathematical Proof & Recurrence Relation:</span>
              </div>
              {renderMathProof(activeAlgo.mathFormula)}
            </div>
          </div>

          {/* Multi-Language Code Implementation Studio */}
          <div style={{
            background: 'var(--card-bg, rgba(15, 23, 42, 0.88))',
            borderRadius: '16px',
            border: '1px solid var(--card-border, rgba(51, 65, 85, 0.7))',
            boxShadow: 'var(--card-shadow, 0 8px 32px rgba(0, 0, 0, 0.35))',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            flex: 1
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Code2 size={16} color="#38bdf8" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>Algorithm Implementation</span>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: isCopied ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isCopied ? <Check size={12} /> : <Copy size={12} />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Language Selector Tabs */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'python', label: 'Python 3' },
                { id: 'cpp', label: 'C++ 20' },
                { id: 'java', label: 'Java' },
                { id: 'pseudo', label: 'Pseudocode' }
              ].map(lang => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setActiveCodeTab(lang.id as any)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: activeCodeTab === lang.id ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
                    color: activeCodeTab === lang.id ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Code Block Content */}
            <pre style={{
              margin: 0,
              background: '#030712',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#38bdf8',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.78rem',
              lineHeight: '1.45',
              overflowX: 'auto',
              maxHeight: '260px'
            }}>
              {activeCodeTab === 'python' && activeAlgo.pythonCode}
              {activeCodeTab === 'cpp' && activeAlgo.cppCode}
              {activeCodeTab === 'java' && activeAlgo.javaCode}
              {activeCodeTab === 'pseudo' && activeAlgo.pseudoCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
