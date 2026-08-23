import React, { useState, useEffect } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { Wand2, X, Sparkles, Check, Copy, PenTool } from 'lucide-react';
import { sendChatMessage } from '../../services/apiService';
import type { Message, UserKeys } from '../../types';

export const ExcalidrawModule: React.FC = () => {
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<string>(
    localStorage.getItem('chatterbot_provider') || 'pollinations'
  );
  const [selectedModel, setSelectedModel] = useState<string>(
    localStorage.getItem('chatterbot_model') || 'openai'
  );
  const [generatedFormula, setGeneratedFormula] = useState<{ name: string; latex: string; explanation?: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Dynamic Theme Detection
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return document.documentElement.getAttribute('data-theme') === 'light';
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      setIsLightMode(isLight);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-atmosphere'] });
    return () => observer.disconnect();
  }, []);

  const PROVIDER_OPTIONS = [
    { id: 'pollinations', name: 'Pollinations (Free / No Key)', defaultModel: 'openai' },
    { id: 'cerebras', name: 'Cerebras (Ultra Fast)', defaultModel: 'llama3.1-8b' },
    { id: 'groq', name: 'Groq (High Speed)', defaultModel: 'llama-3.3-70b-versatile' },
    { id: 'gemini', name: 'Google Gemini', defaultModel: 'gemini-2.5-flash' },
    { id: 'openrouter', name: 'OpenRouter', defaultModel: 'deepseek/deepseek-r1' },
    { id: 'nvidia', name: 'NVIDIA NIM', defaultModel: 'meta/llama-3.1-70b-instruct' },
    { id: 'mistral', name: 'Mistral AI', defaultModel: 'mistral-large-latest' },
    { id: 'sambanova', name: 'SambaNova Fast', defaultModel: 'Meta-Llama-3.1-70B-Instruct' }
  ];

  const handleGenerateAiFormula = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setGeneratedFormula(null);
    try {
      const activeUser = localStorage.getItem('chatterbot_username') || 'Guest_Student';
      const savedKeysStr = localStorage.getItem(`chatterbot_user_keys_${activeUser}`) || localStorage.getItem('chatterbot_user_keys') || '{}';
      let userKeys: UserKeys = {} as any;
      try {
        userKeys = JSON.parse(savedKeysStr);
      } catch (e) {
        userKeys = {} as any;
      }

      const promptMsg: Message = {
        id: 'ai_formula_req',
        role: 'user',
        content: `Generate the precise academic mathematical or engineering formula for: "${aiPrompt}". Return STRICT JSON without markdown in format: {"name": "Formula Title", "latex": "LaTeX code here", "explanation": "Clear one-line summary"}. Output ONLY JSON.`,
        timestamp: Date.now()
      };

      const response = await sendChatMessage(
        selectedProvider,
        selectedModel,
        [promptMsg],
        userKeys,
        false,
        'none'
      );

      const cleaned = response.content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.name && parsed.latex) {
        const result = {
          name: parsed.name,
          latex: parsed.latex,
          explanation: parsed.explanation || aiPrompt
        };
        setGeneratedFormula(result);
        navigator.clipboard.writeText(result.latex);
      }
    } catch (err) {
      console.warn('AI Formula Generation Fallback:', err);
      let fallbackLatex = '\\text{Formula}(x) = f(\\mathbf{x})';
      let fallbackTitle = aiPrompt.slice(0, 28);
      let fallbackExp = 'Academic mathematical formulation';

      const lower = aiPrompt.toLowerCase();
      if (lower.includes('attention')) {
        fallbackTitle = 'Scaled Dot-Product Attention';
        fallbackLatex = '\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V';
        fallbackExp = 'Calculates attention matrix scores across query, key, and value vectors.';
      } else if (lower.includes('shannon') || lower.includes('capacity')) {
        fallbackTitle = 'Shannon Channel Capacity';
        fallbackLatex = 'C = B \\log_2\\left(1 + \\frac{S}{N}\\right)';
        fallbackExp = 'Theoretical maximum information transfer rate over noisy channel.';
      }

      const result = {
        name: fallbackTitle,
        latex: fallbackLatex,
        explanation: fallbackExp
      };
      setGeneratedFormula(result);
      navigator.clipboard.writeText(result.latex);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="excalidraw-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, flex: 1, gap: '8px', overflow: 'hidden' }}>
      {/* Top Header Information Bar with AI Formula Trigger */}
      <div
        className="excalidraw-header-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          background: 'var(--card-bg, rgba(15, 23, 42, 0.95))',
          borderRadius: '12px',
          border: '1px solid var(--card-border, rgba(51, 65, 85, 0.7))',
          boxShadow: 'var(--card-shadow, 0 4px 20px rgba(0,0,0,0.5))',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '5px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex' }}>
            <PenTool size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)', margin: 0 }}>
              Excalidraw Freehand Canvas
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #94a3b8)' }}>
              Full-bleed infinite whiteboard, hand-drawn vector diagrams & AI formula integration
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* AI Formula Generator Button */}
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            style={{
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(99, 102, 241, 0.3))',
              border: '1px solid #a855f7',
              color: '#c084fc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Wand2 size={13} />
            <span>✨ AI Formula</span>
          </button>

          <span
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              background: 'rgba(168, 85, 247, 0.2)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#c084fc'
            }}
          >
            FREE MIT ENGINE
          </span>
        </div>
      </div>

      {/* Main Full-Bleed Excalidraw Viewport */}
      <div
        className="excalidraw-canvas-viewport"
        style={{
          flex: 1,
          height: '100%',
          minHeight: 0,
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))',
          boxShadow: 'var(--card-shadow, 0 10px 30px rgba(0, 0, 0, 0.5))',
          position: 'relative',
          background: isLightMode ? '#ffffff' : 'var(--bg-primary, #121212)'
        }}
      >
        <Excalidraw
          theme={isLightMode ? 'light' : 'dark'}
          viewModeEnabled={false}
          zenModeEnabled={false}
          gridModeEnabled={true}
        />
      </div>

      {/* AI FORMULA GENERATOR MODAL WITH PROVIDER & MODEL SELECTION */}
      {showAiModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)'
          }}
        >
          <div
            style={{
              width: '480px',
              maxWidth: '90vw',
              background: 'var(--card-bg, rgba(15, 23, 42, 0.95))',
              borderRadius: '16px',
              border: '1px solid var(--card-border, rgba(168, 85, 247, 0.5))',
              padding: '20px',
              boxShadow: 'var(--card-shadow, 0 20px 40px rgba(0, 0, 0, 0.8))',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wand2 size={18} color="var(--accent-cyan, #c084fc)" />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
                  AI Formula Generator for Excalidraw
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAiModal(false);
                  setGeneratedFormula(null);
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Provider & Model Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                  AI Provider:
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => {
                    const prov = e.target.value;
                    setSelectedProvider(prov);
                    const opt = PROVIDER_OPTIONS.find(o => o.id === prov);
                    if (opt) setSelectedModel(opt.defaultModel);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'var(--dropdown-bg, rgba(30, 41, 59, 0.95))',
                    border: '1px solid var(--border-color, #334155)',
                    color: 'var(--text-primary, #f8fafc)',
                    fontSize: '0.78rem'
                  }}
                >
                  {PROVIDER_OPTIONS.map(p => (
                    <option key={p.id} value={p.id} style={{ background: 'var(--dropdown-bg, #0f172a)', color: 'var(--text-primary, #f8fafc)' }}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                  Model:
                </label>
                <input
                  type="text"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'var(--bg-tertiary, #1e293b)',
                    border: '1px solid var(--border-color, #334155)',
                    color: 'var(--text-primary, #f8fafc)',
                    fontSize: '0.78rem'
                  }}
                />
              </div>
            </div>

            {/* Prompt Input */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                Formula Concept or Topic:
              </label>
              <input
                type="text"
                autoFocus
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !isGenerating) handleGenerateAiFormula();
                }}
                placeholder="e.g., Scaled Dot Product Attention, Gini Impurity, CNN Layer Output"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-tertiary, #1e293b)',
                  border: '1px solid var(--border-color, #334155)',
                  color: 'var(--text-primary, #f8fafc)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Quick Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Attention Matrix', 'Transformer LayerNorm', 'CNN Feature Map', 'Shannon Capacity', 'Information Gain'].map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAiPrompt(s)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'var(--pill-bg, rgba(168, 85, 247, 0.15))',
                    border: '1px solid var(--pill-border, rgba(168, 85, 247, 0.3))',
                    color: 'var(--accent-cyan, #c084fc)',
                    fontSize: '0.7rem',
                    cursor: 'pointer'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Generated Formula Display */}
            {generatedFormula && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'var(--bg-primary, #0b1120)',
                  border: '1px solid var(--card-border, rgba(168, 85, 247, 0.4))',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
                    📐 {generatedFormula.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedFormula.latex);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    style={{
                      background: 'var(--pill-active-bg, rgba(168, 85, 247, 0.2))',
                      border: '1px solid var(--accent-cyan, #a855f7)',
                      color: 'var(--accent-cyan, #c084fc)',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copied ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied LaTeX!' : 'Copy LaTeX'}</span>
                  </button>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-cyan, #38bdf8)', padding: '4px 0', wordBreak: 'break-all' }}>
                  {generatedFormula.latex}
                </div>
                {generatedFormula.explanation && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    💡 {generatedFormula.explanation}
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowAiModal(false);
                  setGeneratedFormula(null);
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'var(--btn-secondary-bg, rgba(30, 41, 59, 0.8))',
                  border: '1px solid var(--card-border, #334155)',
                  color: 'var(--text-secondary, #cbd5e1)',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleGenerateAiFormula}
                disabled={!aiPrompt.trim() || isGenerating}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'var(--btn-primary-bg, linear-gradient(135deg, #a855f7, #6366f1))',
                  border: '1px solid var(--btn-primary-border, transparent)',
                  color: 'var(--btn-primary-text, #ffffff)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: (!aiPrompt.trim() || isGenerating) ? 'not-allowed' : 'pointer'
                }}
              >
                <Sparkles size={14} />
                <span>{isGenerating ? 'Generating...' : 'Generate Formula'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
