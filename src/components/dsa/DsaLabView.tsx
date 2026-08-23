import React, { useState } from 'react';
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
  BookOpen
} from 'lucide-react';

export const DsaLabView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<DsaCategory>('sorting');
  const [activeAlgoId, setActiveAlgoId] = useState<string>('bubble_sort');
  const [speed, setSpeed] = useState<number>(3); // 1x to 10x
  const [activeCodeTab, setActiveCodeTab] = useState<'pseudo' | 'python' | 'cpp' | 'java'>('python');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<'visualizer' | 'code'>('visualizer');

  const activeAlgo = DSA_ALGORITHMS[activeAlgoId] || DSA_ALGORITHMS.bubble_sort;
  const activeCatMeta = DSA_CATEGORIES.find(c => c.id === activeCategory) || DSA_CATEGORIES[0];

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

  const handleSelectCategory = (cat: DsaCategory) => {
    setActiveCategory(cat);
    // Set default algorithm for this category
    const firstInCat = Object.values(DSA_ALGORITHMS).find(a => a.category === cat);
    if (firstInCat) {
      setActiveAlgoId(firstInCat.id);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 'calc(100vh - 70px)',
      background: '#070b14',
      color: '#f8fafc',
      padding: '16px 20px',
      gap: '12px',
      overflowY: 'auto'
    }}>
      {/* Top Main Category & Global Controls Bar */}
      <div className="dsa-header-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '10px 14px',
        background: 'var(--card-bg)',
        borderRadius: '14px',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--card-shadow)'
      }}>
        {/* Left: Category Selector Dropdown & Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 260px', minWidth: 0, maxWidth: '100%', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 200px', minWidth: 0, maxWidth: '100%' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
              DSA:
            </span>
            <select
              value={activeCategory}
              onChange={(e) => handleSelectCategory(e.target.value as DsaCategory)}
              className="dsa-select-control"
              style={{
                minHeight: '38px',
                padding: '6px 12px',
                borderRadius: '10px',
                background: 'var(--bg-tertiary)',
                border: '1.5px solid var(--accent-cyan)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 0 12px var(--cursor-glow)'
              }}
            >
              {DSA_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  {cat.icon} {cat.title} ({cat.count} Algos)
                </option>
              ))}
            </select>
          </div>

          {/* Active Category Meta Tag */}
          <span className="dsa-meta-badge" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '8px',
            background: 'var(--pill-active-bg)',
            border: '1px solid var(--card-border)',
            color: 'var(--accent-cyan)',
            fontSize: '0.72rem',
            fontWeight: 700
          }}>
            <span>{activeCatMeta.icon}</span>
            <span>{activeCatMeta.desc}</span>
          </span>
        </div>

        {/* Right: Global Speed Controller */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-tertiary)', padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', flexShrink: 0 }}>
          <Zap size={14} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Speed: <strong style={{ color: 'var(--accent-cyan)' }}>{speed}x</strong></span>
          <input
            type="range"
            min={1}
            max={8}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: '70px', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
          />
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
            background: 'var(--card-bg)',
            borderRadius: '16px',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--card-shadow)',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-cyan)', fontWeight: 800 }}>
                  {activeAlgo.category.toUpperCase().replace('_', ' ')}
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {activeAlgo.name}
                </h2>
              </div>
              <span style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'var(--pill-active-bg)',
                color: 'var(--accent-cyan)',
                fontSize: '0.72rem',
                fontWeight: 800,
                border: '1px solid var(--card-border)'
              }}>
                {activeAlgo.tag}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
              {activeAlgo.description}
            </p>

            {/* Asymptotic Complexities Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              paddingTop: '6px'
            }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <Clock size={12} color="#34d399" />
                  <span>Best Time:</span>
                </div>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#34d399' }}>
                  {activeAlgo.timeComplexityBest}
                </span>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <Clock size={12} color="#fbbf24" />
                  <span>Average Time:</span>
                </div>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fbbf24' }}>
                  {activeAlgo.timeComplexityAverage}
                </span>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <Clock size={12} color="#f87171" />
                  <span>Worst Time:</span>
                </div>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f87171' }}>
                  {activeAlgo.timeComplexityWorst}
                </span>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
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
              background: 'var(--bg-tertiary)',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              marginTop: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '4px' }}>
                <BookOpen size={13} />
                <span>Mathematical Proof & Recurrence Relation:</span>
              </div>
              {renderMathProof(activeAlgo.mathFormula)}
            </div>
          </div>

          {/* Multi-Language Code Implementation Studio */}
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: '16px',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--card-shadow)',
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
