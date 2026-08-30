import React, { useState } from 'react';
import {
  FlaskConical, Activity, Sparkles, Layers, BarChart3, ExternalLink, ArrowRight, Brain, Cpu
} from 'lucide-react';
import { WhiteboardModule } from './sandbox/WhiteboardModule';
import { ExcalidrawModule } from './sandbox/ExcalidrawModule';
import { SmartTeachingBoardModule } from './sandbox/SmartTeachingBoardModule';

export type SandboxModuleType = 
  | 'smart_teaching_board'
  | 'academic_whiteboard'
  | 'excalidraw'
  | 'neural_physics'
  | 'statistical_optimization';

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

interface InteractiveSandboxViewProps {
  onNavigateWorkspace?: (workspace: 'deep_learning_studio' | 'test_diagrams' | 'dsa_lab' | 'chat') => void;
}

export const InteractiveSandboxView: React.FC<InteractiveSandboxViewProps> = ({ onNavigateWorkspace }) => {
  const [activeModule, setActiveModule] = useState<SandboxModuleType>('smart_teaching_board');

  const handleLaunchDeepLearning = () => {
    if (onNavigateWorkspace) {
      onNavigateWorkspace('deep_learning_studio');
    }
  };

  const handleLaunchMathStudio = () => {
    if (onNavigateWorkspace) {
      onNavigateWorkspace('test_diagrams');
    }
  };

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
                  <span className="module-label-desktop">Interactive Teaching Board & Drawing Canvas Lab</span>
                  <span className="module-label-mobile">Teaching Sandbox</span>
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
                  TEACHING SUITE ACTIVE
                </span>
              </div>
              <p className="sandbox-header-subtitle">
                Hands-on teaching deck for 120+ Gizmos, KaTeX Academic Chalkboards, and Vector Diagramming Surfaces
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
            <option value="academic_whiteboard">🖌️ Prof. Joe Academic Board</option>
            <option value="excalidraw">✏️ Excalidraw Engine (Free MIT)</option>
            <option value="neural_physics">⚡ Launch Deep Learning Studio</option>
            <option value="statistical_optimization">📊 Launch Math & Stats Studio</option>
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

          {/* Module 2: Prof. Joe Academic Board */}
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

          {/* Module 3: Excalidraw MIT Engine */}
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

          {/* Gateway Tab: Deep Learning Studio */}
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
            title="Deep Learning & Neural Matrix Studio Gateway"
          >
            <Activity size={16} />
            <span className="module-label-desktop">⚡ Deep Learning Studio</span>
            <span className="module-label-mobile">⚡ Neural AI</span>
          </button>

          {/* Gateway Tab: Statistical Optimization */}
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
            title="Advanced Math, Stats & ML Studio Gateway"
          >
            <BarChart3 size={16} />
            <span className="module-label-desktop">📊 Math & Stats Studio</span>
            <span className="module-label-mobile">📊 Math Lab</span>
          </button>
        </div>
      </div>

      {/* ─── Persistent Active Module Rendering ─── */}
      <div style={{ flex: 1, height: '100%', minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        {/* Module 1: Smart Teaching Board */}
        <div style={{ display: activeModule === 'smart_teaching_board' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <SandboxModuleErrorBoundary fallbackTitle="Smart Teaching Board">
            <SmartTeachingBoardModule />
          </SandboxModuleErrorBoundary>
        </div>

        {/* Module 2: Prof. Joe Academic Board */}
        <div style={{ display: activeModule === 'academic_whiteboard' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <SandboxModuleErrorBoundary fallbackTitle="Prof. Joe Academic Board">
            <WhiteboardModule />
          </SandboxModuleErrorBoundary>
        </div>

        {/* Module 3: Excalidraw Engine */}
        <div style={{ display: activeModule === 'excalidraw' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <SandboxModuleErrorBoundary fallbackTitle="Excalidraw Engine">
            <ExcalidrawModule />
          </SandboxModuleErrorBoundary>
        </div>

        {/* Gateway View: Deep Learning Studio */}
        {activeModule === 'neural_physics' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '24px',
            background: 'radial-gradient(ellipse at center, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.95) 100%)'
          }}>
            <div style={{
              maxWidth: '560px',
              padding: '32px',
              borderRadius: '20px',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              backdropFilter: 'blur(16px)',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px',
                borderRadius: '16px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24'
              }}>
                <Brain size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px' }}>
                Deep Learning & Neural Studio
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 24px' }}>
                Neural simulation has been upgraded into our full-power <strong>Deep Learning Studio</strong> featuring 8 dedicated modules: Multi-Layer Perceptrons, CNN feature maps, RNN/LSTM unrolling, Transformer multi-head attention, and Latent space embeddings.
              </p>
              <button
                type="button"
                onClick={handleLaunchDeepLearning}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <span>Launch Deep Learning Studio</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Gateway View: Statistical Optimization */}
        {activeModule === 'statistical_optimization' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '24px',
            background: 'radial-gradient(ellipse at center, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.95) 100%)'
          }}>
            <div style={{
              maxWidth: '560px',
              padding: '32px',
              borderRadius: '20px',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              backdropFilter: 'blur(16px)',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px',
                borderRadius: '16px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}>
                <BarChart3 size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px' }}>
                Advanced Math, Stats & ML Studio
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 24px' }}>
                Statistical models and gradient optimization have been consolidated into our <strong>Math & ML Studio</strong>, powered by pure calculation engines with 3D loss surfaces, Support Vector Machines, OLS Regression, and ODE dynamics.
              </p>
              <button
                type="button"
                onClick={handleLaunchMathStudio}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(56, 189, 248, 0.35)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <span>Launch Math & Stats Studio</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
