import React, { useState } from 'react';
import {
  FlaskConical, Network, Activity, Sparkles, Layers, Database, BarChart3
} from 'lucide-react';
import { AlgorithmicLabModule } from './sandbox/AlgorithmicLabModule';
import { DataStructuresModule } from './sandbox/DataStructuresModule';
import { NeuralSimulatorModule } from './sandbox/NeuralSimulatorModule';
import { StatisticalOptimizationModule } from './sandbox/StatisticalOptimizationModule';
import { WhiteboardModule } from './sandbox/WhiteboardModule';
import { ExcalidrawModule } from './sandbox/ExcalidrawModule';

export type SandboxModuleType = 
  | 'algorithms'
  | 'datastructures'
  | 'neural_physics'
  | 'statistical_optimization'
  | 'academic_whiteboard'
  | 'excalidraw';

export const InteractiveSandboxView: React.FC = () => {
  const [activeModule, setActiveModule] = useState<SandboxModuleType>('algorithms');

  return (
    <div
      className="interactive-sandbox-container"
      style={{
        padding: '18px 24px',
        maxWidth: '1600px',
        margin: '0 auto',
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* ─── Top Header & Master Module Switcher ─── */}
      <div
        className="sandbox-header"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              color: '#c084fc'
            }}
          >
            <FlaskConical size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Interactive Learning Sandbox & Whiteboard Lab
              </h2>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: 'rgba(56, 189, 248, 0.18)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                6 LAB MODULES ACTIVE • PERSISTENT STATE
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Hands-on experimentation deck for Algorithms, Data Structures, Neural Gradients, Statistical Optimization, KaTeX Chalkboards & Vector Whiteboards
            </p>
          </div>
        </div>

        {/* Master Module 6-Pill Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px',
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(51, 65, 85, 0.6)',
            backdropFilter: 'blur(8px)',
            flexWrap: 'wrap'
          }}
        >
          {/* Module 1: Algorithms */}
          <button
            type="button"
            onClick={() => setActiveModule('algorithms')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeModule === 'algorithms' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: activeModule === 'algorithms' ? '#38bdf8' : '#94a3b8',
              border: activeModule === 'algorithms' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
              boxShadow: activeModule === 'algorithms' ? '0 0 12px rgba(6, 182, 212, 0.15)' : 'none'
            }}
            title="Module 1: Visual Algorithm & Flow Lab"
          >
            <Network size={14} />
            <span>🧩 Visual Algorithm & Flow Lab</span>
          </button>

          {/* Module 2: Data Structures */}
          <button
            type="button"
            onClick={() => setActiveModule('datastructures')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeModule === 'datastructures' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeModule === 'datastructures' ? '#34d399' : '#94a3b8',
              border: activeModule === 'datastructures' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
              boxShadow: activeModule === 'datastructures' ? '0 0 12px rgba(16, 185, 129, 0.15)' : 'none'
            }}
            title="Module 2: Interactive Data Structures Lab"
          >
            <Database size={14} />
            <span>🏗️ Data Structures Lab</span>
          </button>

          {/* Module 3: Neural Simulator */}
          <button
            type="button"
            onClick={() => setActiveModule('neural_physics')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeModule === 'neural_physics' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: activeModule === 'neural_physics' ? '#fbbf24' : '#94a3b8',
              border: activeModule === 'neural_physics' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
              boxShadow: activeModule === 'neural_physics' ? '0 0 12px rgba(245, 158, 11, 0.15)' : 'none'
            }}
            title="Module 3: Real-Time Data Science, Machine Learning & AI Simulator"
          >
            <Activity size={14} />
            <span>⚡ Data Science & AI Simulator</span>
          </button>

          {/* Module 4: Statistical & Optimization Lab */}
          <button
            type="button"
            onClick={() => setActiveModule('statistical_optimization')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeModule === 'statistical_optimization' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
              color: activeModule === 'statistical_optimization' ? '#38bdf8' : '#94a3b8',
              border: activeModule === 'statistical_optimization' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              boxShadow: activeModule === 'statistical_optimization' ? '0 0 12px rgba(56, 189, 248, 0.2)' : 'none'
            }}
            title="Module 4: Statistical, Probabilistic & Numerical Optimization Lab (MLE, MAP, EM, MCMC, Adam/SGD, Newton-Raphson, Lagrange, LDA, SVD)"
          >
            <BarChart3 size={14} />
            <span>📊 Statistical & Optimization Lab</span>
          </button>

          {/* Module 5: Prof. Joe Academic Board */}
          <button
            type="button"
            onClick={() => setActiveModule('academic_whiteboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeModule === 'academic_whiteboard' ? 'rgba(192, 132, 252, 0.2)' : 'transparent',
              color: activeModule === 'academic_whiteboard' ? '#c084fc' : '#94a3b8',
              border: activeModule === 'academic_whiteboard' ? '1px solid rgba(192, 132, 252, 0.4)' : '1px solid transparent',
              boxShadow: activeModule === 'academic_whiteboard' ? '0 0 12px rgba(192, 132, 252, 0.15)' : 'none'
            }}
            title="Module 5: Dedicated Prof. Joe Academic Chalkboard with Draggable KaTeX Math Cards & Sticky Notes"
          >
            <Sparkles size={14} />
            <span>🖌️ Prof. Joe Academic Board</span>
          </button>

          {/* Module 6: Excalidraw MIT Engine */}
          <button
            type="button"
            onClick={() => setActiveModule('excalidraw')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeModule === 'excalidraw' ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
              color: activeModule === 'excalidraw' ? '#f43f5e' : '#94a3b8',
              border: activeModule === 'excalidraw' ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid transparent',
              boxShadow: activeModule === 'excalidraw' ? '0 0 12px rgba(244, 63, 94, 0.15)' : 'none'
            }}
            title="Module 6: Excalidraw Hand-Drawn Vector Diagramming Suite (100% Free MIT)"
          >
            <Layers size={14} />
            <span>✏️ Excalidraw Engine (Free MIT)</span>
          </button>
        </div>
      </div>

      {/* ─── Persistent Active Module Rendering (Preserves 100% State Across Tabs) ─── */}
      <div style={{ flex: 1, minHeight: '600px', position: 'relative' }}>
        <div style={{ display: activeModule === 'algorithms' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <AlgorithmicLabModule />
        </div>
        <div style={{ display: activeModule === 'datastructures' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <DataStructuresModule />
        </div>
        <div style={{ display: activeModule === 'neural_physics' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <NeuralSimulatorModule />
        </div>
        <div style={{ display: activeModule === 'statistical_optimization' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <StatisticalOptimizationModule />
        </div>
        <div style={{ display: activeModule === 'academic_whiteboard' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <WhiteboardModule />
        </div>
        <div style={{ display: activeModule === 'excalidraw' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <ExcalidrawModule />
        </div>
      </div>
    </div>
  );
};

