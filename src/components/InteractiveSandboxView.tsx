import React, { useState } from 'react';
import {
  FlaskConical, Activity, Sparkles, Layers, BarChart3
} from 'lucide-react';
import { NeuralSimulatorModule } from './sandbox/NeuralSimulatorModule';
import { StatisticalOptimizationModule } from './sandbox/StatisticalOptimizationModule';
import { WhiteboardModule } from './sandbox/WhiteboardModule';
import { ExcalidrawModule } from './sandbox/ExcalidrawModule';
import { SmartTeachingBoardModule } from './sandbox/SmartTeachingBoardModule';

export type SandboxModuleType = 
  | 'smart_teaching_board'
  | 'neural_physics'
  | 'statistical_optimization'
  | 'academic_whiteboard'
  | 'excalidraw';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class SandboxModuleErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[SandboxModuleError] Error in ${this.props.fallbackTitle}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '24px',
          background: 'var(--card-bg, rgba(15, 23, 42, 0.9))',
          borderRadius: '16px',
          border: '1px solid var(--card-border, rgba(51, 65, 85, 0.8))',
          textAlign: 'center',
          gap: '12px'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan, #38bdf8)', margin: 0 }}>
            {this.props.fallbackTitle} Encountered an Issue
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #94a3b8)', maxWidth: '480px', margin: 0 }}>
            {this.state.error?.message || 'An unexpected rendering error occurred in this module.'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="app-btn-primary"
            style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            🔄 Reload Module
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const InteractiveSandboxView: React.FC = () => {
  const [activeModule, setActiveModule] = useState<SandboxModuleType>('smart_teaching_board');

  return (
    <div className="interactive-sandbox-container">
      {/* ─── Top Header & Master Module Switcher ─── */}
      <div className="sandbox-header">
        <div className="sandbox-header-top-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                color: '#c084fc',
                flexShrink: 0
              }}
            >
              <FlaskConical size={16} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary, #f8fafc)', margin: 0 }}>
                  <span className="module-label-desktop">Interactive Learning Sandbox & Whiteboard Lab</span>
                  <span className="module-label-mobile">Interactive Sandbox</span>
                </h2>
                <span
                  className="module-label-desktop"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    background: 'var(--pill-bg, rgba(56, 189, 248, 0.18))',
                    color: 'var(--accent-cyan, #38bdf8)',
                    border: '1px solid var(--pill-border, rgba(56, 189, 248, 0.4))',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap'
                  }}
                >
                  5 LAB MODULES ACTIVE
                </span>
              </div>
              <p className="sandbox-header-subtitle">
                Hands-on experimentation deck for 120+ Teaching Gizmos, Neural Gradients, Statistical Optimization, KaTeX Chalkboards & Vector Whiteboards
              </p>
            </div>
          </div>
        </div>

        {/* Mobile-First Dropdown Switcher (Visible on Mobile & Narrow Screens) */}
        <div className="sandbox-mobile-select-wrap dsa-header-card" style={{ alignItems: 'center', gap: '8px', width: '100%', minWidth: 0, maxWidth: '100%' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
            MODULE:
          </span>
          <select
            value={activeModule}
            onChange={(e) => setActiveModule(e.target.value as SandboxModuleType)}
            className="dsa-select-control"
            style={{
              minHeight: '36px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'var(--dropdown-bg, rgba(30, 41, 59, 0.95))',
              border: '1.5px solid var(--accent-cyan, #a855f7)',
              color: 'var(--text-primary, #f8fafc)',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 0 10px rgba(168, 85, 247, 0.25)'
            }}
          >
            <option value="smart_teaching_board">🌟 Smart Teaching Board & Gizmos</option>
            <option value="neural_physics">⚡ Data Science & AI Simulator</option>
            <option value="statistical_optimization">📊 Statistical & Optimization Lab</option>
            <option value="academic_whiteboard">🖌️ Prof. Joe Academic Board</option>
            <option value="excalidraw">✏️ Excalidraw Engine (Free MIT)</option>
          </select>
        </div>

        {/* Master Module Switcher Pills (Desktop View) */}
        <div className="sandbox-module-switcher-deck">
          {/* Module 1: Smart Teaching Board & Gizmos Studio */}
          <button
            type="button"
            onClick={() => setActiveModule('smart_teaching_board')}
            className="sandbox-module-pill-btn"
            style={{
              background: activeModule === 'smart_teaching_board' ? 'var(--dock-item-active-bg, linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(168, 85, 247, 0.3)))' : 'transparent',
              color: activeModule === 'smart_teaching_board' ? 'var(--accent-cyan, #38bdf8)' : 'var(--text-secondary, #94a3b8)',
              border: activeModule === 'smart_teaching_board' ? '1px solid var(--accent-cyan, rgba(56, 189, 248, 0.6))' : '1px solid transparent',
              boxShadow: activeModule === 'smart_teaching_board' ? '0 0 14px rgba(6, 182, 212, 0.3)' : 'none'
            }}
            title="🌟 Prof. Joe Smart Teaching Board with 120+ Gizmos, Animations & AI Multi-Object Auto-Layout"
          >
            <Sparkles size={16} />
            <span className="module-label-desktop">🌟 Smart Teaching Board & Gizmos</span>
            <span className="module-label-mobile">🌟 Smart Board</span>
          </button>

          {/* Module 2: Neural Simulator */}
          <button
            type="button"
            onClick={() => setActiveModule('neural_physics')}
            className="sandbox-module-pill-btn"
            style={{
              background: activeModule === 'neural_physics' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
              color: activeModule === 'neural_physics' ? '#fbbf24' : 'var(--text-secondary, #94a3b8)',
              border: activeModule === 'neural_physics' ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid transparent',
              boxShadow: activeModule === 'neural_physics' ? '0 0 12px rgba(245, 158, 11, 0.2)' : 'none'
            }}
            title="Real-Time Data Science, Machine Learning & AI Simulator"
          >
            <Activity size={16} />
            <span className="module-label-desktop">⚡ Data Science & AI Simulator</span>
            <span className="module-label-mobile">⚡ Neural AI</span>
          </button>

          {/* Module 3: Statistical & Optimization Lab */}
          <button
            type="button"
            onClick={() => setActiveModule('statistical_optimization')}
            className="sandbox-module-pill-btn"
            style={{
              background: activeModule === 'statistical_optimization' ? 'var(--pill-active-bg, rgba(56, 189, 248, 0.25))' : 'transparent',
              color: activeModule === 'statistical_optimization' ? 'var(--accent-cyan, #38bdf8)' : 'var(--text-secondary, #94a3b8)',
              border: activeModule === 'statistical_optimization' ? '1px solid var(--accent-cyan, rgba(56, 189, 248, 0.5))' : '1px solid transparent',
              boxShadow: activeModule === 'statistical_optimization' ? '0 0 12px rgba(56, 189, 248, 0.2)' : 'none'
            }}
            title="Statistical, Probabilistic & Numerical Optimization Lab (MLE, MAP, EM, MCMC, Adam/SGD, Newton-Raphson, Lagrange, LDA, SVD)"
          >
            <BarChart3 size={16} />
            <span className="module-label-desktop">📊 Statistical & Optimization Lab</span>
            <span className="module-label-mobile">📊 Statistics</span>
          </button>

          {/* Module 4: Prof. Joe Academic Board */}
          <button
            type="button"
            onClick={() => setActiveModule('academic_whiteboard')}
            className="sandbox-module-pill-btn"
            style={{
              background: activeModule === 'academic_whiteboard' ? 'rgba(192, 132, 252, 0.25)' : 'transparent',
              color: activeModule === 'academic_whiteboard' ? '#c084fc' : 'var(--text-secondary, #94a3b8)',
              border: activeModule === 'academic_whiteboard' ? '1px solid rgba(192, 132, 252, 0.5)' : '1px solid transparent',
              boxShadow: activeModule === 'academic_whiteboard' ? '0 0 12px rgba(192, 132, 252, 0.2)' : 'none'
            }}
            title="Dedicated Prof. Joe Academic Chalkboard with Draggable KaTeX Math Cards & Sticky Notes"
          >
            <Sparkles size={16} />
            <span className="module-label-desktop">🖌️ Prof. Joe Academic Board</span>
            <span className="module-label-mobile">🖌️ KaTeX Board</span>
          </button>

          {/* Module 5: Excalidraw MIT Engine */}
          <button
            type="button"
            onClick={() => setActiveModule('excalidraw')}
            className="sandbox-module-pill-btn"
            style={{
              background: activeModule === 'excalidraw' ? 'rgba(236, 72, 153, 0.25)' : 'transparent',
              color: activeModule === 'excalidraw' ? '#f472b6' : 'var(--text-secondary, #94a3b8)',
              border: activeModule === 'excalidraw' ? '1px solid rgba(236, 72, 153, 0.5)' : '1px solid transparent',
              boxShadow: activeModule === 'excalidraw' ? '0 0 12px rgba(236, 72, 153, 0.2)' : 'none'
            }}
            title="Excalidraw Hand-Drawn Vector Diagramming Suite (100% Free MIT)"
          >
            <Layers size={16} />
            <span className="module-label-desktop">✏️ Excalidraw Engine (Free MIT)</span>
            <span className="module-label-mobile">✏️ Excalidraw</span>
          </button>
        </div>
      </div>

      {/* ─── Persistent Active Module Rendering (Preserves 100% State Across Tabs) ─── */}
      <div style={{ flex: 1, height: '100%', minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: activeModule === 'smart_teaching_board' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <SandboxModuleErrorBoundary fallbackTitle="Smart Teaching Board">
            <SmartTeachingBoardModule />
          </SandboxModuleErrorBoundary>
        </div>
        <div style={{ display: activeModule === 'neural_physics' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <SandboxModuleErrorBoundary fallbackTitle="Neural & AI Simulator">
            <NeuralSimulatorModule />
          </SandboxModuleErrorBoundary>
        </div>
        <div style={{ display: activeModule === 'statistical_optimization' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <SandboxModuleErrorBoundary fallbackTitle="Statistical Optimization Lab">
            <StatisticalOptimizationModule />
          </SandboxModuleErrorBoundary>
        </div>
        <div style={{ display: activeModule === 'academic_whiteboard' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <SandboxModuleErrorBoundary fallbackTitle="Prof. Joe Academic Board">
            <WhiteboardModule />
          </SandboxModuleErrorBoundary>
        </div>
        <div style={{ display: activeModule === 'excalidraw' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <SandboxModuleErrorBoundary fallbackTitle="Excalidraw Engine">
            <ExcalidrawModule />
          </SandboxModuleErrorBoundary>
        </div>
      </div>
    </div>
  );
};
