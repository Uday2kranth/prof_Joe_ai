import React, { useState, useRef, useEffect } from 'react';
import { X, Key, Save, Check, Eye, EyeOff, Download, Upload, Cpu, Zap, SlidersHorizontal, BookOpen, Code, Terminal } from 'lucide-react';
import type { UserKeys, UserCustomModels, AiTuningConfig, CodeStyleConfig, IdeConfig } from '../types';
import { DEFAULT_AI_TUNING, DEFAULT_CODE_STYLE, DEFAULT_IDE_CONFIG } from '../types';
import { ModelManagerTab } from './ModelManagerTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userKeys: UserKeys;
  onSaveKeys: (newKeys: UserKeys) => void;
  customModels: UserCustomModels;
  onSaveCustomModels: (newCustomModels: UserCustomModels) => void;
  activeProvider?: string;
  activeModel?: string;
  onSelectActiveModel?: (providerId: string, modelId: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userKeys,
  onSaveKeys,
  customModels,
  onSaveCustomModels,
  activeProvider,
  activeModel,
  onSelectActiveModel
}) => {
  const [activeTab, setActiveTab] = useState<'keys' | 'models' | 'tuning' | 'code'>('keys');
  const [keys, setKeys] = useState<UserKeys>({ ...userKeys });
  const [saved, setSaved] = useState(false);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiTuning, setAiTuning] = useState<AiTuningConfig>(() => {
    try {
      const saved = localStorage.getItem('chatterbot_ai_tuning');
      if (saved) return { ...DEFAULT_AI_TUNING, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_AI_TUNING;
  });

  const [codeStyle, setCodeStyle] = useState<CodeStyleConfig>(() => {
    try {
      const saved = localStorage.getItem('chatterbot_code_style');
      if (saved) return { ...DEFAULT_CODE_STYLE, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_CODE_STYLE;
  });

  const [ideConfig, setIdeConfig] = useState<IdeConfig>(() => {
    try {
      const saved = localStorage.getItem('chatterbot_ide_settings');
      if (saved) return { ...DEFAULT_IDE_CONFIG, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_IDE_CONFIG;
  });

  const updateAiTuning = (patch: Partial<AiTuningConfig>) => {
    const next = { ...aiTuning, ...patch };
    setAiTuning(next);
    localStorage.setItem('chatterbot_ai_tuning', JSON.stringify(next));
  };

  const updateCodeStyle = (patch: Partial<CodeStyleConfig>) => {
    const next = { ...codeStyle, ...patch };
    setCodeStyle(next);
    localStorage.setItem('chatterbot_code_style', JSON.stringify(next));
    window.dispatchEvent(new Event('chatterbot_code_style_updated'));
    if (patch.canvasAtmosphere) {
      document.documentElement.setAttribute('data-canvas-atmosphere', patch.canvasAtmosphere);
      localStorage.setItem('chatterbot_canvas_atmosphere', patch.canvasAtmosphere);
      window.dispatchEvent(new Event('chatterbot_canvas_atmosphere_updated'));
    }
  };

  const updateIdeConfig = (patch: Partial<IdeConfig>) => {
    const next = { ...ideConfig, ...patch };
    setIdeConfig(next);
    localStorage.setItem('chatterbot_ide_settings', JSON.stringify(next));
    window.dispatchEvent(new Event('chatterbot_ide_settings_updated'));
  };

  useEffect(() => {
    if (isOpen) {
      setKeys({ ...userKeys });
    }
  }, [userKeys, isOpen]);

  if (!isOpen) return null;

  const toggleVisibility = (field: string) => {
    setVisibleFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field: keyof UserKeys, value: string) => {
    setKeys(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSaveKeys(keys);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(keys, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `chatterbot_api_keys_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (imported && typeof imported === 'object') {
            const mergedKeys = { ...keys, ...imported };
            setKeys(mergedKeys);
            onSaveKeys(mergedKeys);
            alert('API Credentials JSON successfully imported and saved!');
          }
        } catch (err) {
          alert('Invalid JSON file format.');
        }
      };
    }
  };

  const providerFields = [
    { id: 'ollama', label: 'Ollama Cloud API Key (Slot 1: Online API Key)', placeholder: '6661bc9b7e6a..., bdb8f1ef6819...' },
    { id: 'local_endpoint', label: 'Local Device / Custom Tunnel URL (Slot 2: Localhost / Ngrok)', placeholder: 'http://localhost:11434 or https://xxxx.ngrok.io' },
    { id: 'gemini', label: 'Google Gemini API Key(s)', placeholder: 'AQ.Ab8RN6...' },
    { id: 'openrouter', label: 'OpenRouter API Key', placeholder: 'sk-or-v1-...' },
    { id: 'nvidia', label: 'NVIDIA NIM Gateway API Key', placeholder: 'nvapi-...' },
    { id: 'groq', label: 'Groq Cloud API Key', placeholder: 'gsk_...' },
    { id: 'mistral', label: 'Mistral AI API Key', placeholder: '8W6aSCXb...' },
    { id: 'sambanova', label: 'SambaNova Cloud API Key', placeholder: 'c72d24de-...' },
    { id: 'nararouter', label: 'NaraRouter API Key', placeholder: 'sk-nry-...' },
    { id: 'huggingface', label: 'Hugging Face Access Token', placeholder: 'hf_...' },
    { id: 'opencode', label: 'OpenCode AI API Key (50 req/day, 20 req/hr free tier)', placeholder: 'oc_...' },
    { id: 'poolside', label: 'Poolside AI API Key (Code Engine)', placeholder: 'sky_...' },
    { id: 'pollinations', label: 'Pollinations Priority Key (Optional)', placeholder: 'sk_...' }
  ] as const;

  return (
    <div className="modal-overlay">
      <div className="modal-content kokonut-drawer-card" style={{ maxWidth: '680px', width: '92%', maxHeight: 'min(85vh, 740px)' }}>
        <div className="modal-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="modal-title">
              <Key style={{ color: 'var(--accent-cyan)' }} size={20} />
              <h2>Settings & Model Workspace</h2>
            </div>
            <button onClick={onClose} className="close-btn"><X size={18} /></button>
          </div>

          {/* Tab Navigation Header */}
          <div className="settings-tab-nav settings-modal-tabs" style={{
            display: 'flex',
            gap: '8px',
            padding: '4px',
            borderRadius: '10px'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('keys')}
              style={{
                flex: 1,
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'keys' ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(147, 51, 234, 0.25))' : 'transparent',
                color: activeTab === 'keys' ? '#38bdf8' : 'var(--text-muted)',
                boxShadow: activeTab === 'keys' ? '0 0 12px rgba(56, 189, 248, 0.2)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <Key size={15} />
              <span>🔑 API Credentials</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('models')}
              style={{
                flex: 1,
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'models' ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(147, 51, 234, 0.25))' : 'transparent',
                color: activeTab === 'models' ? '#38bdf8' : 'var(--text-muted)',
                boxShadow: activeTab === 'models' ? '0 0 12px rgba(56, 189, 248, 0.2)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <Cpu size={15} />
              <span>🤖 Model Manager</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tuning')}
              style={{
                flex: 1,
                padding: '8px 10px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'tuning' ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(147, 51, 234, 0.25))' : 'transparent',
                color: activeTab === 'tuning' ? '#38bdf8' : 'var(--text-muted)',
                boxShadow: activeTab === 'tuning' ? '0 0 12px rgba(56, 189, 248, 0.2)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <Zap size={14} />
              <span>🧠 AI Tuning</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('code')}
              style={{
                flex: 1,
                padding: '8px 10px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'code' ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(147, 51, 234, 0.25))' : 'transparent',
                color: activeTab === 'code' ? '#38bdf8' : 'var(--text-muted)',
                boxShadow: activeTab === 'code' ? '0 0 12px rgba(56, 189, 248, 0.2)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <Code size={14} />
              <span>💻 Code & IDE</span>
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ maxHeight: 'calc(85vh - 160px)', overflowY: 'auto' }}>
          {activeTab === 'keys' ? (
            <>
              <div className="json-sync-bar">
                <button onClick={handleExportJson} className="btn-theme-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }} title="Export credentials to JSON file">
                  <Download size={14} />
                  <span>Export JSON</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="btn-theme-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }} title="Import credentials from JSON file">
                  <Upload size={14} />
                  <span>Import JSON</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportJson}
                  accept=".json"
                  style={{ display: 'none' }}
                />
              </div>

              {providerFields.map(field => (
                <div key={field.id} className="key-field">
                  <label>{field.label}</label>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <input
                      type={visibleFields[field.id] ? 'text' : 'password'}
                      placeholder={field.placeholder}
                      value={keys[field.id as keyof UserKeys] || ''}
                      onChange={e => handleChange(field.id as keyof UserKeys, e.target.value)}
                      className="key-input"
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility(field.id)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title={visibleFields[field.id] ? 'Hide Key' : 'Show Key'}
                    >
                      {visibleFields[field.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : activeTab === 'models' ? (
            <ModelManagerTab
              userKeys={keys}
              customModels={customModels}
              onSaveCustomModels={onSaveCustomModels}
              activeProvider={activeProvider}
              activeModel={activeModel}
              onSelectActiveModel={onSelectActiveModel}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '4px' }}>
              {/* Temperature */}
              <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Cpu size={16} style={{ color: 'var(--accent-cyan)' }} />
                    <span>Temperature & Creativity</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    {aiTuning.temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={aiTuning.temperature}
                  onChange={(e) => updateAiTuning({ temperature: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  <span>0.0 (Strict Proofs)</span>
                  <span>0.5 (Tutor)</span>
                  <span>1.0 (Creative)</span>
                </div>
              </div>

              {/* Max Output Tokens */}
              <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <SlidersHorizontal size={16} style={{ color: 'var(--accent-cyan)' }} />
                  <span>Maximum Output Tokens</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                  {[
                    { val: 1024, label: '1K' },
                    { val: 2048, label: '2K' },
                    { val: 4096, label: '4K' },
                    { val: 8192, label: '8K' },
                    { val: 16384, label: '16K' }
                  ].map(tk => (
                    <button
                      key={tk.val}
                      type="button"
                      onClick={() => updateAiTuning({ maxTokens: tk.val })}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '8px',
                        border: aiTuning.maxTokens === tk.val ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                        background: aiTuning.maxTokens === tk.val ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-primary)',
                        color: aiTuning.maxTokens === tk.val ? 'var(--accent-cyan)' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textAlign: 'center'
                      }}
                    >
                      {tk.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Streaming & Search Depth */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Live Token Streaming</span>
                  <input
                    type="checkbox"
                    checked={aiTuning.streaming}
                    onChange={(e) => updateAiTuning({ streaming: e.target.checked })}
                    style={{ accentColor: 'var(--accent-cyan)' }}
                  />
                </label>

                <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  {(['fast', 'deep'] as const).map(sd => (
                    <button
                      key={sd}
                      type="button"
                      onClick={() => updateAiTuning({ searchDepth: sd })}
                      style={{
                        flex: 1,
                        padding: '8px 4px',
                        borderRadius: '6px',
                        border: aiTuning.searchDepth === sd ? '1px solid var(--accent-cyan)' : 'none',
                        background: aiTuning.searchDepth === sd ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                        color: aiTuning.searchDepth === sd ? 'var(--accent-cyan)' : 'var(--text-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {sd === 'fast' ? 'Fast (3 Sources)' : 'Deep (10 Sources)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* OU Exam Answer Schema */}
              <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={16} style={{ color: 'var(--accent-cyan)' }} />
                  <span>OU Exam Answer Schema</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { id: 'rigorous_12mark', label: '12-Mark Rigorous Proof Scheme', desc: 'Theorem Statement → Proof → Step Derivation → Python Code' },
                    { id: 'step_by_step', label: 'Step-by-Step Friendly Tutor', desc: 'Concept Intuition → Example Scenario → Bullet Points' },
                    { id: 'compact', label: 'Ultra-Compact Cheat Sheet', desc: 'Formulas and critical values only' }
                  ].map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => updateAiTuning({ graderMode: g.id as any })}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: aiTuning.graderMode === g.id ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                        background: aiTuning.graderMode === g.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-primary)',
                        color: aiTuning.graderMode === g.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{g.label}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{g.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Code Block Syntax Theme */}
              <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code size={16} style={{ color: 'var(--accent-cyan)' }} />
                  <span>Code Block Syntax Theme</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 110px), 1fr))', gap: '6px' }}>
                  {[
                    { id: 'onedark', label: 'One Dark Pro', bg: '#282c34', color: '#61afef' },
                    { id: 'vscode_dark', label: 'VS Code Dark+', bg: '#1e1e1e', color: '#4ec9b0' },
                    { id: 'monokai', label: 'Monokai Pro', bg: '#272822', color: '#ffd866' },
                    { id: 'tokyo_night', label: 'Tokyo Night', bg: '#1a1b26', color: '#7aa2f7' },
                    { id: 'github_light', label: 'GitHub Light', bg: '#ffffff', color: '#0969da' },
                    { id: 'neon', label: 'Cyberpunk Neon', bg: '#0b0f19', color: '#06b6d4' },
                    { id: 'emerald_matrix', label: 'Emerald Matrix', bg: '#04160e', color: '#10b981' },
                    { id: 'dracula', label: 'Electric Magenta', bg: '#19051d', color: '#ff007f' },
                    { id: 'cyber_pink', label: 'Cyber Pink', bg: '#1c0b16', color: '#fb7185' },
                    { id: 'cobalt', label: 'Cobalt Sapphire', bg: '#0d1b2a', color: '#00f5d4' },
                    { id: 'solarized_amber', label: 'Solarized Amber', bg: '#18120c', color: '#f59e0b' }
                  ].map(th => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => updateCodeStyle({ codeTheme: th.id as any })}
                      style={{
                        padding: '8px 6px',
                        borderRadius: '8px',
                        border: codeStyle.codeTheme === th.id ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                        background: th.bg,
                        color: th.color,
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {th.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* KaTeX Math Scaling */}
              <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Terminal size={16} style={{ color: 'var(--accent-cyan)' }} />
                  <span>KaTeX Math Formula Scaling</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {[
                    { id: 'compact', label: 'Compact 90%' },
                    { id: 'standard', label: 'Standard 100%' },
                    { id: 'large', label: 'Large 115%' }
                  ].map(sc => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => updateCodeStyle({ katexScale: sc.id as any })}
                      style={{
                        padding: '8px 6px',
                        borderRadius: '8px',
                        border: codeStyle.katexScale === sc.id ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                        background: codeStyle.katexScale === sc.id ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-primary)',
                        color: codeStyle.katexScale === sc.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Dungeon & Monaco Editor Settings */}
              <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code size={16} style={{ color: 'var(--accent-cyan)' }} />
                  <span>Code Dungeon & Monaco Editor (IDE)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {/* Theme */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>IDE THEME</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                      {[
                        { id: 'vs-dark', label: 'Dark+' },
                        { id: 'vs-light', label: 'Light' },
                        { id: 'hc-black', label: 'HC' }
                      ].map(th => (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => updateIdeConfig({ theme: th.id as any })}
                          style={{
                            padding: '6px 4px',
                            borderRadius: '6px',
                            border: ideConfig.theme === th.id ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                            background: ideConfig.theme === th.id ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-primary)',
                            color: ideConfig.theme === th.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {th.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>FONT SIZE</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                      {[12, 13, 14, 16].map(sz => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => updateIdeConfig({ fontSize: sz })}
                          style={{
                            padding: '6px 2px',
                            borderRadius: '6px',
                            border: ideConfig.fontSize === sz ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                            background: ideConfig.fontSize === sz ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-primary)',
                            color: ideConfig.fontSize === sz ? 'var(--accent-cyan)' : 'var(--text-primary)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Minimap and WordWrap Toggles */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => updateIdeConfig({ minimap: !ideConfig.minimap })}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: ideConfig.minimap ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                      background: ideConfig.minimap ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-primary)',
                      color: ideConfig.minimap ? 'var(--accent-cyan)' : 'var(--text-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Minimap: {ideConfig.minimap ? 'On' : 'Off'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateIdeConfig({ wordWrap: ideConfig.wordWrap === 'on' ? 'off' : 'on' })}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: ideConfig.wordWrap === 'on' ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                      background: ideConfig.wordWrap === 'on' ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-primary)',
                      color: ideConfig.wordWrap === 'on' ? 'var(--accent-cyan)' : 'var(--text-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Word Wrap: {ideConfig.wordWrap === 'on' ? 'On' : 'Off'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-theme-secondary" style={{ padding: '8px 16px' }}>Close</button>
          {activeTab === 'keys' && (
            <button onClick={handleSave} className="btn-theme-primary" style={{ padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {saved ? <Check size={16} /> : <Save size={16} />}
              <span>{saved ? 'Saved!' : 'Save Credentials'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

