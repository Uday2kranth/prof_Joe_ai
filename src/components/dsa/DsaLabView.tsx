import React, { useState } from 'react';
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

  const activeAlgo = DSA_ALGORITHMS[activeAlgoId] || DSA_ALGORITHMS.bubble_sort;

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
      gap: '16px',
      overflowY: 'auto'
    }}>
      {/* Top Main Category Navigation Deck */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 18px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.8))',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 0 16px rgba(2, 132, 199, 0.6)'
          }}>
            ⚡
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Data Structures & Algorithms Laboratory (DSA Lab)
            </h1>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Interactive Visual Execution & Multi-Language Code Studio • Osmania University Curriculum
            </span>
          </div>
        </div>

        {/* Global Speed Controller */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Zap size={15} color="#38bdf8" />
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Speed: <strong>{speed}x</strong></span>
          <input
            type="range"
            min={1}
            max={8}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: '90px', accentColor: '#38bdf8' }}
          />
        </div>
      </div>

      {/* 7-Category Horizontal Tab Deck */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {DSA_CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '12px',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(2, 132, 199, 0.25))'
                  : 'rgba(15, 23, 42, 0.6)',
                border: isActive
                  ? '1px solid #38bdf8'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                color: isActive ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.85rem',
                boxShadow: isActive ? '0 0 14px rgba(56, 189, 248, 0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.title}</span>
              <span style={{
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '6px',
                background: isActive ? '#38bdf8' : 'rgba(255,255,255,0.1)',
                color: isActive ? '#0f172a' : '#94a3b8',
                fontWeight: 800
              }}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Split Workspace Layout: Visualizer Canvas (Left/Center) + Telemetry & Code Deck (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(360px, 0.8fr)',
        gap: '16px',
        flex: 1,
        minHeight: '600px'
      }}>
        {/* Left Column: Interactive Visualizer Modules */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(15, 23, 42, 0.7)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
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
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          overflowY: 'auto'
        }}>
          {/* Algorithm Info & Complexity Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8', fontWeight: 800 }}>
                  {activeAlgo.category.toUpperCase().replace('_', ' ')}
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  {activeAlgo.name}
                </h2>
              </div>
              <span style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                fontSize: '0.72rem',
                fontWeight: 800,
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}>
                {activeAlgo.tag}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.84rem', color: '#cbd5e1', lineHeight: '1.45' }}>
              {activeAlgo.description}
            </p>

            {/* Asymptotic Complexities Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              paddingTop: '6px'
            }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: '#94a3b8' }}>
                  <Clock size={12} color="#34d399" />
                  <span>Best Time:</span>
                </div>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#34d399' }}>
                  {activeAlgo.timeComplexityBest}
                </span>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: '#94a3b8' }}>
                  <Clock size={12} color="#fbbf24" />
                  <span>Average Time:</span>
                </div>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fbbf24' }}>
                  {activeAlgo.timeComplexityAverage}
                </span>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: '#94a3b8' }}>
                  <Clock size={12} color="#f87171" />
                  <span>Worst Time:</span>
                </div>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f87171' }}>
                  {activeAlgo.timeComplexityWorst}
                </span>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: '#94a3b8' }}>
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
              background: 'rgba(0,0,0,0.4)',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              marginTop: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}>
                <BookOpen size={13} />
                <span>Mathematical Proof & Recurrence Relation:</span>
              </div>
              <code style={{ fontSize: '0.8rem', color: '#e2e8f0', fontFamily: 'monospace' }}>
                {activeAlgo.mathFormula}
              </code>
            </div>
          </div>

          {/* Multi-Language Code Implementation Studio */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
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
