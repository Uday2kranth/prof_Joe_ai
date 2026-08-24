import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Printer, 
  User, 
  Key, 
  Bot, 
  Palette, 
  Database, 
  ArrowLeft, 
  Sparkles, 
  Sliders, 
  Eye, 
  EyeOff,
  Layers, 
  Trash2, 
  Download,
  Upload,
  Check,
  Cpu,
  Code,
  Command,
  SlidersHorizontal,
  Terminal,
  BookOpen,
  Zap,
  Menu,
  X,
  Smartphone,
  Tablet,
  Copy,
  Play,
  Globe,
  FileText,
  Volume2,
  Award,
  CheckCircle2,
  Flame,
  Activity
} from 'lucide-react';
import { 
  getPrintCustomConfig, 
  savePrintCustomConfig, 
  type PrintCustomConfig, 
  printBubbleToPdf 
} from '../services/printPdfService';
import type { UserKeys, UserCustomModels, AiTuningConfig, CodeStyleConfig, IdeConfig } from '../types';
import { DEFAULT_AI_TUNING, DEFAULT_CODE_STYLE, DEFAULT_IDE_CONFIG } from '../types';
import { ModelManagerTab } from './ModelManagerTab';

export type { CodeStyleConfig, IdeConfig };
export { DEFAULT_CODE_STYLE, DEFAULT_IDE_CONFIG };

interface NavItem {
  id: 'print' | 'keys' | 'models' | 'ai_tuning' | 'code_style' | 'shortcuts' | 'account' | 'theme' | 'data';
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: 'print', label: 'Print Studio', icon: Printer, badge: 'Popular' },
  { id: 'keys', label: 'API Credentials', icon: Key },
  { id: 'models', label: 'Model Manager', icon: Bot },
  { id: 'ai_tuning', label: 'AI Generation & Tuning', icon: Cpu, badge: 'New' },
  { id: 'code_style', label: 'Syntax & Math Styling', icon: Code },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Command },
  { id: 'account', label: 'User Profile', icon: User },
  { id: 'theme', label: 'Appearance & Theme', icon: Palette },
  { id: 'data', label: 'Data & Storage', icon: Database }
];

interface SettingsStudioViewProps {
  onBack: () => void;
  currentUser: string;
  userRole?: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  userKeys: UserKeys;
  onSaveKeys: (keys: UserKeys) => void;
  customModels: UserCustomModels;
  onSaveCustomModels: (models: UserCustomModels) => void;
  activeProvider?: string;
  activeModel?: string;
  onSelectActiveModel?: (providerId: string, modelId: string) => void;
  onClearHistory: () => void;
  onLogout: () => void;
  initialTab?: 'print' | 'account' | 'keys' | 'models' | 'ai_tuning' | 'code_style' | 'shortcuts' | 'theme' | 'data';
}

export const SettingsStudioView: React.FC<SettingsStudioViewProps> = ({
  onBack,
  currentUser,
  userRole = 'student',
  userKeys,
  onSaveKeys,
  customModels,
  onSaveCustomModels,
  activeProvider,
  activeModel,
  onSelectActiveModel,
  onClearHistory,
  onLogout,
  initialTab = 'print'
}) => {
  const [activeTab, setActiveTab] = useState<'print' | 'account' | 'keys' | 'models' | 'ai_tuning' | 'code_style' | 'shortcuts' | 'theme' | 'data'>(initialTab);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [printConfig, setPrintConfig] = useState<PrintCustomConfig>(getPrintCustomConfig());
  const [savedKeysState, setSavedKeysState] = useState<UserKeys>(userKeys);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
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

  const [activePreviewTab, setActivePreviewTab] = useState<'chat' | 'code' | 'deck' | 'exam'>('chat');

  const activeNavLabel = useMemo(() => {
    return NAV_ITEMS.find(item => item.id === activeTab)?.label || 'Settings';
  }, [activeTab]);

  const activePaperTintName = useMemo(() => {
    const currentHex = (printConfig.paperBgColor || '#ffffff').toLowerCase();
    const match = [
      { name: 'Pure White', color: '#ffffff' },
      { name: 'Warm Ivory', color: '#faf7ee' },
      { name: 'Oxford Cream', color: '#f7f5f0' },
      { name: 'Vintage Newsprint', color: '#f4efe6' },
      { name: 'Solarized Light', color: '#fdf6e3' },
      { name: 'Soft Pearl', color: '#f8f9fa' },
      { name: 'Nordic Mist', color: '#f1f5f9' },
      { name: 'Eco Mint', color: '#f2f7f4' },
      { name: 'Exam Yellow', color: '#fefbe8' },
      { name: 'Soft Rose', color: '#fdf2f4' },
      { name: 'Lavender Mist', color: '#f5f3ff' },
      { name: 'Parchment', color: '#fdf6e2' },
      { name: 'Sage Tint', color: '#ebf2eb' },
      { name: 'Sky Ice', color: '#ebf5fb' },
      { name: 'Antique Linen', color: '#faf0e6' },
      { name: 'Tea Wash', color: '#f5edd6' }
    ].find(s => s.color.toLowerCase() === currentHex);
    return match ? match.name : 'Custom Tint';
  }, [printConfig.paperBgColor]);

  const updateAiTuning = (patch: Partial<AiTuningConfig>) => {
    const next = { ...aiTuning, ...patch };
    setAiTuning(next);
    localStorage.setItem('chatterbot_ai_tuning', JSON.stringify(next));
    setSaveFeedback('AI Generation & Tuning parameters saved!');
    setTimeout(() => setSaveFeedback(null), 2500);
  };

  const updateCodeStyle = (patch: Partial<CodeStyleConfig>) => {
    const next = { ...codeStyle, ...patch };
    setCodeStyle(next);
    localStorage.setItem('chatterbot_code_style', JSON.stringify(next));
    window.dispatchEvent(new Event('chatterbot_code_style_updated'));
    if (patch.atmosphere) {
      document.documentElement.setAttribute('data-atmosphere', patch.atmosphere);
      localStorage.setItem('chatterbot_atmosphere', patch.atmosphere);
      const isLightAtmo = patch.atmosphere === 'oxford_daylight' || patch.atmosphere === 'amber_parchment';
      const targetTheme = isLightAtmo ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('chatterbot_theme', targetTheme);
      localStorage.setItem('theme', targetTheme);
      window.dispatchEvent(new Event('chatterbot_atmosphere_updated'));
      window.dispatchEvent(new Event('storage'));
    }
    if (patch.bubbleStyle) {
      document.documentElement.setAttribute('data-bubble-style', patch.bubbleStyle);
      localStorage.setItem('chatterbot_bubble_style', patch.bubbleStyle);
    }
    if (patch.canvasAtmosphere) {
      document.documentElement.setAttribute('data-canvas-atmosphere', patch.canvasAtmosphere);
      localStorage.setItem('chatterbot_canvas_atmosphere', patch.canvasAtmosphere);
      window.dispatchEvent(new Event('chatterbot_canvas_atmosphere_updated'));
    }
    setSaveFeedback('Atmosphere & Styling preferences applied!');
    setTimeout(() => setSaveFeedback(null), 2500);
  };

  const updateIdeConfig = (patch: Partial<IdeConfig>) => {
    const next = { ...ideConfig, ...patch };
    setIdeConfig(next);
    localStorage.setItem('chatterbot_ide_settings', JSON.stringify(next));
    window.dispatchEvent(new Event('chatterbot_ide_settings_updated'));
    setSaveFeedback('Code Dungeon & IDE settings applied!');
    setTimeout(() => setSaveFeedback(null), 2500);
  };

  useEffect(() => {
    setSavedKeysState(userKeys);
  }, [userKeys]);

  const updateConfig = (patch: Partial<PrintCustomConfig>) => {
    const updated = savePrintCustomConfig(patch);
    setPrintConfig(updated);
  };

  const handlePresetSelect = (preset: PrintCustomConfig['preset']) => {
    if (preset === 'academic') {
      updateConfig({
        preset: 'academic',
        showHeader: true,
        showModelTag: true,
        showDateTag: true,
        showWorkspaceTag: true,
        showFooter: true,
        marginPreset: 'standard',
        hideDividers: false,
        inkMode: 'rich',
        fontFamily: 'sans',
        fontSize: 'standard'
      });
    } else if (preset === 'clean') {
      updateConfig({
        preset: 'clean',
        showHeader: false,
        showModelTag: false,
        showDateTag: false,
        showWorkspaceTag: false,
        showFooter: false,
        marginPreset: 'standard',
        hideDividers: false,
        inkMode: 'rich'
      });
    } else if (preset === 'eco') {
      updateConfig({
        preset: 'eco',
        showHeader: true,
        showModelTag: false,
        showDateTag: true,
        showWorkspaceTag: false,
        showFooter: true,
        marginPreset: 'compact',
        hideDividers: true,
        inkMode: 'eco'
      });
    } else {
      updateConfig({ preset: 'custom' });
    }
  };

  const handleTestPrint = () => {
    const sampleMarkdown = `
# 1. Neyman-Pearson Lemma (12-Mark Demonstration)

Testing simple $H_0: \\theta = \\theta_0$ vs $H_1: \\theta = \\theta_1$ with most powerful critical region:

$$\\Lambda(X) = \\frac{L(\\theta_1; X)}{L(\\theta_0; X)} \\ge k$$

---

### Python Verification Script
\`\`\`python
# Computation of Critical Value k
import numpy as np

def neyman_pearson_ratio(L1, L0, alpha=0.05):
    lr = np.where(L0 > 0, L1 / L0, np.inf)
    k_threshold = np.percentile(lr, 100 * (1 - alpha))
    return k_threshold
\`\`\`
    `;

    printBubbleToPdf(
      sampleMarkdown,
      activeModel || 'gemini-2.5-pro',
      printConfig.customTitle || 'MDS-104-T Statistical Inference'
    );
  };

  const toggleVisibility = (field: string) => {
    setVisibleFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSaveApiKeys = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKeys(savedKeysState);
    setSaveFeedback('All API Credentials successfully saved to encrypted storage!');
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedKeysState, null, 2));
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
            const merged = { ...savedKeysState, ...imported };
            setSavedKeysState(merged);
            onSaveKeys(merged);
            setSaveFeedback('API keys JSON successfully imported and saved!');
            setTimeout(() => setSaveFeedback(null), 3000);
          }
        } catch (err) {
          alert('Invalid JSON file format.');
        }
      };
    }
  };

  const configuredKeysCount = useMemo(() => {
    return Object.entries(savedKeysState).filter(([_, val]) => typeof val === 'string' && val.trim().length > 0).length;
  }, [savedKeysState]);

  const providerFields = [
    { id: 'gemini', label: 'Google Gemini API Key(s)', desc: 'Gemini 3.7 Flash, Gemma 4 31B' },
    { id: 'openrouter', label: 'OpenRouter API Key', desc: '420+ Multi-vendor models & free routers' },
    { id: 'groq', label: 'Groq Cloud API Key', desc: 'Ultra-low latency LPU inference' },
    { id: 'mistral', label: 'Mistral AI API Key', desc: 'Mistral Large, Codestral coding models' },
    { id: 'nvidia', label: 'NVIDIA NIM Gateway API Key', desc: 'Nemotron & optimized NVIDIA models' },
    { id: 'sambanova', label: 'SambaNova Cloud API Key', desc: 'Reconfigurable Dataflow Unit (RDU) models' },
    { id: 'ollama', label: 'Ollama Cloud API Key (Slot 1)', desc: 'Online Ollama Cloud remote cluster' },
    { id: 'local_endpoint', label: 'Local Device / Custom Tunnel URL (Slot 2)', desc: 'Local Ollama, vLLM, or LM Studio endpoint' },
    { id: 'nararouter', label: 'NaraRouter API Key', desc: 'Free router for Agnes & Laguna engines' },
    { id: 'huggingface', label: 'Hugging Face Access Token', desc: 'Inference router for open weights' },
    { id: 'opencode', label: 'OpenCode AI API Key', desc: '50 req/day, 20 req/hr free coding tier' },
    { id: 'poolside', label: 'Poolside AI API Key', desc: 'Laguna software engineering specialist' },
    { id: 'pollinations', label: 'Pollinations Priority Key (Optional)', desc: 'Keyless free or fast priority queue' }
  ] as const;

  const providerCategories = [
    {
      category: 'Primary Cloud Providers',
      desc: 'High-intelligence frontier reasoning & coding models',
      icon: Cpu,
      color: 'var(--accent-cyan)',
      fields: [
        { id: 'gemini', label: 'Google Gemini API Key(s)', placeholder: 'AQ.Ab8RN6...', desc: 'Gemini 3.7 Flash, Gemma 4 31B' },
        { id: 'openrouter', label: 'OpenRouter API Key', placeholder: 'sk-or-v1-...', desc: '420+ Multi-vendor models & free routers' },
        { id: 'groq', label: 'Groq Cloud API Key', placeholder: 'gsk_...', desc: 'Ultra-low latency LPU inference' },
        { id: 'mistral', label: 'Mistral AI API Key', placeholder: '8W6aSCXb...', desc: 'Mistral Large, Codestral coding models' }
      ]
    },
    {
      category: 'Local & Private Endpoints',
      desc: 'Self-hosted inference running on your local machine or private network',
      icon: Sliders,
      color: '#a855f7',
      fields: [
        { id: 'ollama', label: 'Ollama Cloud API Key (Slot 1)', placeholder: 'ol_...', desc: 'Online Ollama Cloud remote cluster' },
        { id: 'local_endpoint', label: 'Local Device / Custom Tunnel URL (Slot 2)', placeholder: 'http://localhost:11434 or https://xxxx.ngrok.io', desc: 'Local Ollama, vLLM, or LM Studio endpoint' }
      ]
    },
    {
      category: 'Accelerated Cloud Routers',
      desc: 'Specialized high-throughput chips and open-weight model gateways',
      icon: Layers,
      color: '#3b82f6',
      fields: [
        { id: 'nvidia', label: 'NVIDIA NIM Gateway API Key', placeholder: 'nvapi-...', desc: 'Nemotron & optimized NVIDIA models' },
        { id: 'sambanova', label: 'SambaNova Cloud API Key', placeholder: 'c72d24de-...', desc: 'Reconfigurable Dataflow Unit (RDU) models' },
        { id: 'nararouter', label: 'NaraRouter API Key', placeholder: 'sk-nry-...', desc: 'Free router for Agnes & Laguna engines' },
        { id: 'huggingface', label: 'Hugging Face Access Token', placeholder: 'hf_...', desc: 'Inference router for open weights' }
      ]
    },
    {
      category: 'Code & Experimental Engines',
      desc: 'Next-generation agentic code generation and free priority relays',
      icon: Bot,
      color: '#10b981',
      fields: [
        { id: 'opencode', label: 'OpenCode AI API Key', placeholder: 'oc_...', desc: '50 req/day, 20 req/hr free coding tier' },
        { id: 'poolside', label: 'Poolside AI API Key', placeholder: 'sky_...', desc: 'Laguna software engineering specialist' },
        { id: 'pollinations', label: 'Pollinations Priority Key (Optional)', placeholder: 'sk_...', desc: 'Keyless free or fast priority queue' }
      ]
    }
  ] as const;

  return (
    <div className="settings-studio-container">
      {/* Slide-over Mobile Drawer for Phone Viewports */}
      {isMobileDrawerOpen && (
        <div className="settings-mobile-drawer-overlay" onClick={() => setIsMobileDrawerOpen(false)}>
          <div className="settings-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={18} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Settings Sections</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                aria-label="Close Settings Drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const isCurrent = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileDrawerOpen(false);
                    }}
                    className="settings-studio-nav-btn"
                    style={{
                      border: isCurrent ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                      background: isCurrent ? 'rgba(6, 182, 212, 0.18)' : 'transparent',
                      color: isCurrent ? 'var(--accent-cyan)' : 'var(--text-primary)',
                      fontWeight: isCurrent ? 700 : 500
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        background: 'rgba(6, 182, 212, 0.25)',
                        color: 'var(--accent-cyan)',
                        fontWeight: 700
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="settings-studio-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'nowrap', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 1 }}>
          <button
            onClick={onBack}
            className="action-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.12)',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              flexShrink: 0
            }}
            title="Back to Workspace"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          {/* Mobile Drawer Trigger Pill */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="settings-mobile-menu-trigger action-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
              maxWidth: '170px'
            }}
          >
            <Menu size={15} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeNavLabel}</span>
          </button>

          <div style={{ minWidth: 0 }} className="settings-desktop-title-block">
            <h2 className="settings-studio-header-title" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>Settings</span>
            </h2>
            <p className="settings-studio-header-desc" style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Manage system preferences, API credentials, AI models, and Print Studio
            </p>
          </div>
        </div>
      </header>

      {/* Main Studio Body: Sidebar Navigation + Content Area */}
      <div className="settings-studio-layout">
        {/* Desktop Permanent Navigation Sidebar */}
        <aside className="settings-desktop-sidebar settings-studio-sidebar">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className="settings-studio-nav-btn"
                style={{
                  border: isCurrent ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                  background: isCurrent ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                  color: isCurrent ? 'var(--accent-cyan)' : 'var(--text-primary)',
                  fontWeight: isCurrent ? 700 : 500
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={17} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: 'rgba(6, 182, 212, 0.25)',
                    color: 'var(--accent-cyan)',
                    fontWeight: 700,
                    marginLeft: '8px'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Right Scrollable Content Area */}
        <main className="settings-studio-content">
          {/* TAB 1: 🖨️ PRINT STUDIO */}
          {activeTab === 'print' && (
            <div className="settings-bento-2col">
              {/* Left Column: Bento Control Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 1. Presets */}
                <div style={{ padding: '18px 20px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Sparkles size={18} style={{ color: 'var(--accent-cyan)' }} />
                    <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.04em' }}>PRESET TEMPLATES</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'academic', label: 'Academic', desc: 'Title + Model + Date' },
                      { id: 'clean', label: 'Unbranded', desc: 'Raw Notes (No Header)' },
                      { id: 'eco', label: 'Eco-Ink 🌿', desc: 'Saves 70% Printer Ink' },
                      { id: 'custom', label: 'Custom ⚙️', desc: 'Manual Tuning' }
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePresetSelect(p.id as any)}
                        style={{
                          padding: '12px 8px',
                          borderRadius: '10px',
                          border: printConfig.preset === p.id ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                          background: printConfig.preset === p.id ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-tertiary)',
                          color: printConfig.preset === p.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{p.label}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Paper Background Color & Custom Color Picker */}
                <div style={{ padding: '18px 20px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Palette size={18} style={{ color: 'var(--accent-cyan)' }} />
                      <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.04em' }}>PAPER BACKGROUND TINT & INK COLOR</h3>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>Visual Palette & Custom Ink Wheel</span>
                  </div>

                  {/* Swatches Grid */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PRESET ACADEMIC PAPER SHADES</label>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                        {activePaperTintName}
                      </span>
                    </div>
                    <div className="settings-swatches-compact">
                      {[
                        { name: 'Pure White', color: '#ffffff', border: '#cbd5e1' },
                        { name: 'Warm Ivory', color: '#faf7ee', border: '#e7e5e4' },
                        { name: 'Oxford Cream', color: '#f7f5f0', border: '#e2e8f0' },
                        { name: 'Vintage Newsprint', color: '#f4efe6', border: '#e6dfd5' },
                        { name: 'Solarized Light', color: '#fdf6e3', border: '#eee8d5' },
                        { name: 'Soft Pearl', color: '#f8f9fa', border: '#e9ecef' },
                        { name: 'Nordic Mist', color: '#f1f5f9', border: '#cbd5e1' },
                        { name: 'Eco Mint', color: '#f2f7f4', border: '#a7f3d0' },
                        { name: 'Exam Yellow', color: '#fefbe8', border: '#fef08a' },
                        { name: 'Soft Rose', color: '#fdf2f4', border: '#fecdd3' },
                        { name: 'Lavender Mist', color: '#f5f3ff', border: '#ddd6fe' },
                        { name: 'Parchment', color: '#fdf6e2', border: '#fde68a' },
                        { name: 'Sage Tint', color: '#ebf2eb', border: '#bbf7d0' },
                        { name: 'Sky Ice', color: '#ebf5fb', border: '#bae6fd' },
                        { name: 'Antique Linen', color: '#faf0e6', border: '#fed7aa' },
                        { name: 'Tea Wash', color: '#f5edd6', border: '#e7dac0' }
                      ].map(swatch => {
                        const isSelected = (printConfig.paperBgColor || '#ffffff').toLowerCase() === swatch.color.toLowerCase();
                        return (
                          <button
                            key={swatch.color}
                            type="button"
                            onClick={() => updateConfig({ paperBgColor: swatch.color, preset: 'custom' })}
                            className="settings-swatch-tile"
                            style={{
                              background: swatch.color,
                              border: isSelected ? '2.5px solid var(--accent-cyan)' : `1px solid ${swatch.border}`,
                              boxShadow: isSelected ? '0 0 12px rgba(6, 182, 212, 0.4)' : '0 1px 3px rgba(0,0,0,0.1)'
                            }}
                            title={swatch.name}
                          >
                            {isSelected && <Check size={16} style={{ color: 'var(--accent-cyan)' }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Visual Color Pickers Row: Paper Background & Primary Text Ink */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', marginTop: '6px' }}>
                    {/* Visual Paper Color Picker */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', boxSizing: 'border-box', minWidth: 0 }}>
                      <label style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-muted)' }}>CUSTOM PAPER COLOR & WHEEL</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
                        <div style={{ position: 'relative', width: '42px', height: '38px', borderRadius: '8px', border: '1px solid var(--border-color)', background: printConfig.paperBgColor || '#ffffff', overflow: 'hidden', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                          <input
                            type="color"
                            value={printConfig.paperBgColor || '#ffffff'}
                            onChange={(e) => updateConfig({ paperBgColor: e.target.value, preset: 'custom' })}
                            style={{ position: 'absolute', top: '-10px', left: '-10px', width: '60px', height: '60px', opacity: 0, cursor: 'pointer' }}
                            title="Click to visually pick any paper background color"
                          />
                        </div>
                        <input
                          type="text"
                          value={printConfig.paperBgColor || '#ffffff'}
                          onChange={(e) => updateConfig({ paperBgColor: e.target.value, preset: 'custom' })}
                          placeholder="#ffffff"
                          style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.82rem', fontFamily: 'monospace' }}
                        />
                      </div>
                      {/* Contrast / Dark Paper Guardrail */}
                      {(() => {
                        const hex = (printConfig.paperBgColor || '').replace('#', '');
                        let isDark = false;
                        if (hex.length === 6) {
                          const r = parseInt(hex.substring(0, 2), 16);
                          const g = parseInt(hex.substring(2, 4), 16);
                          const b = parseInt(hex.substring(4, 6), 16);
                          isDark = (r * 0.299 + g * 0.587 + b * 0.114) < 170;
                        }
                        if (isDark) {
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', padding: '4px 8px', borderRadius: '6px', marginTop: '4px' }}>
                              <span>⚠️ High ink usage: Selected background tone is dark. Recommended for digital PDFs; use light tints for physical printing.</span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Primary Ink & Text Color Picker */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', boxSizing: 'border-box', minWidth: 0 }}>
                      <label style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-muted)' }}>TEXT & PRIMARY INK COLOR</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '4px', flex: 1, minWidth: 0 }}>
                          {[
                            { id: '#000000', label: 'Black' },
                            { id: '#0a2540', label: 'Navy' },
                            { id: '#1e293b', label: 'Slate' },
                            { id: '#2c1810', label: 'Sepia' }
                          ].map(ink => (
                            <button
                              key={ink.id}
                              type="button"
                              onClick={() => updateConfig({ primaryInkColor: ink.id, preset: 'custom' })}
                              style={{
                                padding: '8px 2px',
                                borderRadius: '8px',
                                border: (printConfig.primaryInkColor || '#000000').toLowerCase() === ink.id.toLowerCase() ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                                background: (printConfig.primaryInkColor || '#000000').toLowerCase() === ink.id.toLowerCase() ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                                color: (printConfig.primaryInkColor || '#000000').toLowerCase() === ink.id.toLowerCase() ? 'var(--accent-cyan)' : 'var(--text-primary)',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                textAlign: 'center',
                                minWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                boxSizing: 'border-box'
                              }}
                            >
                              {ink.label}
                            </button>
                          ))}
                        </div>
                        {/* Custom Visual Text Color Wheel */}
                        <div style={{ position: 'relative', width: '38px', height: '36px', borderRadius: '8px', border: '1px solid var(--border-color)', background: printConfig.primaryInkColor || '#000000', overflow: 'hidden', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} title="Click to visually pick custom text ink color">
                          <input
                            type="color"
                            value={printConfig.primaryInkColor || '#000000'}
                            onChange={(e) => updateConfig({ primaryInkColor: e.target.value, preset: 'custom' })}
                            style={{ position: 'absolute', top: '-10px', left: '-10px', width: '60px', height: '60px', opacity: 0, cursor: 'pointer' }}
                            title="Click to visually pick custom text ink color"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Header Banner & Accent Styling */}
                <div style={{ padding: '18px 20px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SlidersHorizontal size={18} style={{ color: 'var(--accent-cyan)' }} />
                    <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.04em' }}>HEADER BANNER & ACCENT STYLING</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
                    {/* Header Banner Style */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', boxSizing: 'border-box', minWidth: 0 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>BANNER STYLE</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px' }}>
                        {[
                          { id: 'minimal', label: 'Minimal Line', desc: 'Clean border rule' },
                          { id: 'banner', label: 'Solid Banner', desc: 'Filled color block' },
                          { id: 'double_border', label: 'Double Border', desc: 'University traditional' },
                          { id: 'accent_bar', label: 'Left Accent Bar', desc: 'Modern sidebar line' }
                        ].map(st => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => updateConfig({ headerStyle: st.id as any, preset: 'custom' })}
                            style={{
                              padding: '10px 8px',
                              borderRadius: '8px',
                              border: (printConfig.headerStyle || 'minimal') === st.id ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                              background: (printConfig.headerStyle || 'minimal') === st.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                              color: (printConfig.headerStyle || 'minimal') === st.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                              boxSizing: 'border-box',
                              minWidth: 0
                            }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.label}</span>
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Header Accent Color */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', boxSizing: 'border-box', minWidth: 0 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>HEADER ACCENT COLOR</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 115px), 1fr))', gap: '6px' }}>
                        {[
                          { name: 'Cyan Blue', color: '#0284c7' },
                          { name: 'OU Maroon', color: '#800000' },
                          { name: 'Forest Green', color: '#064e3b' },
                          { name: 'Royal Indigo', color: '#4f46e5' },
                          { name: 'Jet Black', color: '#111827' }
                        ].map(c => (
                          <button
                            key={c.color}
                            type="button"
                            onClick={() => updateConfig({ headerAccentColor: c.color, preset: 'custom' })}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 6px',
                              borderRadius: '8px',
                              border: (printConfig.headerAccentColor || '#0284c7').toLowerCase() === c.color.toLowerCase()
                                ? '2px solid var(--accent-cyan)'
                                : '1px solid var(--border-color)',
                              background: 'var(--bg-tertiary)',
                              cursor: 'pointer',
                              color: 'var(--text-primary)',
                              boxSizing: 'border-box',
                              minWidth: 0
                            }}
                          >
                            <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                          </button>
                        ))}
                        {/* 100% Clickable Interactive Custom Color Button with Wheel */}
                        <div style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 6px',
                          borderRadius: '8px',
                          border: !['#0284c7', '#800000', '#064e3b', '#4f46e5', '#111827'].includes((printConfig.headerAccentColor || '').toLowerCase())
                            ? '2px solid var(--accent-cyan)'
                            : '1px solid var(--border-color)',
                          background: 'var(--bg-tertiary)',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          boxSizing: 'border-box',
                          minWidth: 0
                        }}>
                          <span style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: printConfig.headerAccentColor || '#0284c7',
                            border: '1px solid rgba(255,255,255,0.2)',
                            flexShrink: 0
                          }} />
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {!['#0284c7', '#800000', '#064e3b', '#4f46e5', '#111827'].includes((printConfig.headerAccentColor || '').toLowerCase())
                              ? (printConfig.headerAccentColor || 'Custom')
                              : 'Custom'}
                          </span>
                          <input
                            type="color"
                            value={printConfig.headerAccentColor || '#0284c7'}
                            onChange={(e) => updateConfig({ headerAccentColor: e.target.value, preset: 'custom' })}
                            style={{
                              position: 'absolute',
                              top: '-10px',
                              left: '-10px',
                              width: '120%',
                              height: '200%',
                              opacity: 0,
                              cursor: 'pointer'
                            }}
                            title="Click to visually pick custom header accent color"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Page Geometry & Layout */}
                <div style={{ padding: '18px 20px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
                    <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.04em' }}>PAGE GEOMETRY & COLUMN LAYOUT</h3>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    {/* Paper Size */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PAPER SIZE</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        {(['a4', 'letter'] as const).map(ps => (
                          <button
                            key={ps}
                            type="button"
                            onClick={() => updateConfig({ paperSize: ps, preset: 'custom' })}
                            style={{
                              padding: '8px 4px',
                              borderRadius: '8px',
                              border: printConfig.paperSize === ps ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                              background: printConfig.paperSize === ps ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                              color: printConfig.paperSize === ps ? 'var(--accent-cyan)' : 'var(--text-primary)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              cursor: 'pointer'
                            }}
                          >
                            {ps}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Orientation */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ORIENTATION</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        {(['portrait', 'landscape'] as const).map(orient => (
                          <button
                            key={orient}
                            type="button"
                            onClick={() => updateConfig({ orientation: orient, preset: 'custom' })}
                            style={{
                              padding: '8px 4px',
                              borderRadius: '8px',
                              border: printConfig.orientation === orient ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                              background: printConfig.orientation === orient ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                              color: printConfig.orientation === orient ? 'var(--accent-cyan)' : 'var(--text-primary)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            {orient === 'portrait' ? <Smartphone size={12} /> : <Tablet size={12} />}
                            <span>{orient === 'portrait' ? 'Port' : 'Land'}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Column Layout */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>COLUMNS</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        {[
                          { id: 'single', label: '1 Col' },
                          { id: 'two_column', label: '2 Col' }
                        ].map(col => (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => updateConfig({ columnLayout: col.id as any, preset: 'custom' })}
                            style={{
                              padding: '8px 4px',
                              borderRadius: '8px',
                              border: (printConfig.columnLayout || 'single') === col.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                              background: (printConfig.columnLayout || 'single') === col.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                              color: (printConfig.columnLayout || 'single') === col.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {col.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Margins */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>MARGINS</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                        {[
                          { id: 'standard', label: '14mm' },
                          { id: 'compact', label: '6mm' },
                          { id: 'none', label: '0mm' }
                        ].map(m => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => updateConfig({ marginPreset: m.id as any, preset: 'custom' })}
                            style={{
                              padding: '8px 2px',
                              borderRadius: '8px',
                              border: printConfig.marginPreset === m.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                              background: printConfig.marginPreset === m.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                              color: printConfig.marginPreset === m.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Typography, DPI & Ink Saver */}
                <div style={{ padding: '18px 20px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Sliders size={18} style={{ color: 'var(--accent-cyan)' }} />
                    <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.04em' }}>TYPOGRAPHY, DPI & INK SAVER</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    {/* Font Family with Times New Roman */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>FONT FAMILY</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                        {[
                          { id: 'times', label: 'Times Roman', desc: 'OU Exam' },
                          { id: 'sans', label: 'Inter Sans', desc: 'Modern' },
                          { id: 'mono', label: 'JetBrains', desc: 'Lab Code' },
                          { id: 'latex', label: 'LaTeX CM', desc: 'Standard' }
                        ].map(ff => (
                          <button
                            key={ff.id}
                            type="button"
                            onClick={() => updateConfig({ fontFamily: ff.id as any, preset: 'custom' })}
                            style={{
                              padding: '8px 6px',
                              borderRadius: '8px',
                              border: (printConfig.fontFamily === ff.id || (ff.id === 'times' && printConfig.fontFamily === 'serif')) ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                              background: (printConfig.fontFamily === ff.id || (ff.id === 'times' && printConfig.fontFamily === 'serif')) ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                              color: (printConfig.fontFamily === ff.id || (ff.id === 'times' && printConfig.fontFamily === 'serif')) ? 'var(--accent-cyan)' : 'var(--text-primary)',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '1px'
                            }}
                          >
                            <span>{ff.label}</span>
                            <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>{ff.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Scale */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>FONT SCALING (pt)</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                        {[
                          { id: 'compact', label: '9' },
                          { id: 'standard', label: '11' },
                          { id: 'large', label: '13' }
                        ].map(fs => (
                          <button
                            key={fs.id}
                            type="button"
                            onClick={() => updateConfig({ fontSize: fs.id as any, preset: 'custom' })}
                            style={{
                              padding: '10px 4px',
                              borderRadius: '8px',
                              border: printConfig.fontSize === fs.id ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                              background: printConfig.fontSize === fs.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                              color: printConfig.fontSize === fs.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                              fontSize: '0.86rem',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            {fs.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ink Mode */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>INK & BACKGROUNDS</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                        {[
                          { id: 'rich', label: 'Rich PDF' },
                          { id: 'eco', label: 'Eco-Ink 🌿' },
                          { id: 'mono', label: 'Mono' }
                        ].map(im => (
                          <button
                            key={im.id}
                            type="button"
                            onClick={() => updateConfig({ inkMode: im.id as any, preset: 'custom' })}
                            style={{
                              padding: '8px 4px',
                              borderRadius: '8px',
                              border: printConfig.inkMode === im.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                              background: printConfig.inkMode === im.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                              color: printConfig.inkMode === im.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {im.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Document Headers & Content Filters */}
                <div style={{ padding: '18px 20px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sliders size={18} style={{ color: 'var(--accent-cyan)' }} />
                    <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.04em' }}>DOCUMENT HEADERS & CONTENT FILTERING</h3>
                  </div>

                  {/* Custom Title Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>CUSTOM SUBJECT / RECORD TITLE (OPTIONAL)</label>
                    <input
                      type="text"
                      value={printConfig.customTitle}
                      onChange={(e) => updateConfig({ customTitle: e.target.value, preset: 'custom' })}
                      placeholder="e.g. MDS-104-T Statistical Inference Lab Record"
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  {/* Watermark Input & Angle/Opacity Controls */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 0.8fr) minmax(0, 0.8fr)', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>WATERMARK TEXT</label>
                      <input
                        type="text"
                        value={printConfig.watermarkText}
                        onChange={(e) => updateConfig({ watermarkText: e.target.value, preset: 'custom' })}
                        placeholder="e.g. OU DRAFT, CONFIDENTIAL"
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.82rem'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ANGLE</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px' }}>
                        {[
                          { id: -45, label: '-45°' },
                          { id: -30, label: '-30°' },
                          { id: 0, label: '0°' }
                        ].map(a => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => updateConfig({ watermarkAngle: a.id, preset: 'custom' })}
                            style={{
                              padding: '6px 2px',
                              borderRadius: '6px',
                              border: (printConfig.watermarkAngle ?? -35) === a.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                              background: (printConfig.watermarkAngle ?? -35) === a.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                              color: (printConfig.watermarkAngle ?? -35) === a.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        OPACITY: {Math.round((printConfig.watermarkOpacity ?? 0.12) * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.04"
                        max="0.4"
                        step="0.02"
                        value={printConfig.watermarkOpacity ?? 0.12}
                        onChange={(e) => updateConfig({ watermarkOpacity: parseFloat(e.target.value), preset: 'custom' })}
                        style={{ width: '100%', accentColor: 'var(--accent-cyan)', marginTop: '4px' }}
                      />
                    </div>
                  </div>

                  {/* Checkboxes 2-Column Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer' }}>
                      <span>Hide Section Lines (---)</span>
                      <input
                        type="checkbox"
                        checked={printConfig.hideDividers}
                        onChange={(e) => updateConfig({ hideDividers: e.target.checked, preset: 'custom' })}
                        style={{ accentColor: 'var(--accent-cyan)' }}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer' }}>
                      <span>Include Top Header Bar</span>
                      <input
                        type="checkbox"
                        checked={printConfig.showHeader}
                        onChange={(e) => updateConfig({ showHeader: e.target.checked, preset: 'custom' })}
                        style={{ accentColor: 'var(--accent-cyan)' }}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer' }}>
                      <span>Show AI Model & Provider Tag</span>
                      <input
                        type="checkbox"
                        checked={printConfig.showModelTag}
                        onChange={(e) => updateConfig({ showModelTag: e.target.checked, preset: 'custom' })}
                        style={{ accentColor: 'var(--accent-cyan)' }}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer' }}>
                      <span>Show Date & Timestamp</span>
                      <input
                        type="checkbox"
                        checked={printConfig.showDateTag}
                        onChange={(e) => updateConfig({ showDateTag: e.target.checked, preset: 'custom' })}
                        style={{ accentColor: 'var(--accent-cyan)' }}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer' }}>
                      <span>Show OU Workspace Badge</span>
                      <input
                        type="checkbox"
                        checked={printConfig.showWorkspaceTag}
                        onChange={(e) => updateConfig({ showWorkspaceTag: e.target.checked, preset: 'custom' })}
                        style={{ accentColor: 'var(--accent-cyan)' }}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer' }}>
                      <span>Include Page Footers</span>
                      <input
                        type="checkbox"
                        checked={printConfig.showFooter}
                        onChange={(e) => updateConfig({ showFooter: e.target.checked, preset: 'custom' })}
                        style={{ accentColor: 'var(--accent-cyan)' }}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer' }}>
                      <span>Include Code Blocks</span>
                      <input
                        type="checkbox"
                        checked={printConfig.includeCode}
                        onChange={(e) => updateConfig({ includeCode: e.target.checked, preset: 'custom' })}
                        style={{ accentColor: 'var(--accent-cyan)' }}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer' }}>
                      <span>Include Flowchart Diagrams</span>
                      <input
                        type="checkbox"
                        checked={printConfig.includeDiagrams}
                        onChange={(e) => updateConfig({ includeDiagrams: e.target.checked, preset: 'custom' })}
                        style={{ accentColor: 'var(--accent-cyan)' }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Live A4 Interactive Paper Mockup */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '0px', height: 'fit-content' }}>
                <div style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Eye size={16} style={{ color: 'var(--accent-cyan)' }} />
                      <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700 }}>LIVE A4 PAPER PREVIEW</h4>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {printConfig.paperSize} | {printConfig.orientation}
                    </span>
                  </div>

                  {/* Simulated Paper Sheet */}
                  <div style={{
                    width: '100%',
                    maxWidth: printConfig.orientation === 'landscape' ? 'min(100%, 400px)' : 'min(100%, 320px)',
                    margin: '0 auto',
                    aspectRatio: printConfig.orientation === 'landscape' ? '1.414 / 1' : '1 / 1.414',
                    background: printConfig.paperBgColor || '#ffffff',
                    color: printConfig.primaryInkColor || '#0f172a',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                    borderRadius: '4px',
                    padding: printConfig.marginPreset === 'standard' ? '16px' : printConfig.marginPreset === 'compact' ? '8px' : '4px',
                    boxSizing: 'border-box',
                    fontFamily: (printConfig.fontFamily === 'times' || printConfig.fontFamily === 'serif')
                      ? "'Times New Roman', 'Times', 'Liberation Serif', serif"
                      : printConfig.fontFamily === 'latex'
                      ? "'Computer Modern', 'Latin Modern Roman', 'Times New Roman', serif"
                      : printConfig.fontFamily === 'mono'
                      ? "'JetBrains Mono', 'Consolas', monospace"
                      : "'Inter', system-ui, sans-serif",
                    fontSize: printConfig.fontSize === 'compact' ? '0.65rem' : printConfig.fontSize === 'large' ? '0.85rem' : '0.75rem',
                    lineHeight: 1.4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Diagonal Watermark if set */}
                    {printConfig.watermarkText && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${printConfig.watermarkAngle ?? -35}deg)`,
                        fontSize: '1.2rem',
                        fontWeight: 900,
                        color: `rgba(148, 163, 184, ${printConfig.watermarkOpacity ?? 0.12})`,
                        letterSpacing: '0.15em',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        zIndex: 1
                      }}>
                        {printConfig.watermarkText}
                      </div>
                    )}

                    <div>
                      {printConfig.showHeader && (
                        <div style={{
                          ...(printConfig.headerStyle === 'banner' ? {
                            background: printConfig.headerAccentColor || '#0284c7',
                            color: '#ffffff',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            marginBottom: '8px'
                          } : printConfig.headerStyle === 'double_border' ? {
                            borderTop: `2px double ${printConfig.headerAccentColor || '#0284c7'}`,
                            borderBottom: `2px double ${printConfig.headerAccentColor || '#0284c7'}`,
                            padding: '4px 0',
                            marginBottom: '8px'
                          } : printConfig.headerStyle === 'accent_bar' ? {
                            borderLeft: `4px solid ${printConfig.headerAccentColor || '#0284c7'}`,
                            borderBottom: '1px solid #e2e8f0',
                            paddingLeft: '6px',
                            paddingBottom: '2px',
                            marginBottom: '8px'
                          } : {
                            borderBottom: `2px solid ${printConfig.headerAccentColor || '#0284c7'}`,
                            paddingBottom: '4px',
                            marginBottom: '8px'
                          }),
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            color: printConfig.headerStyle === 'banner' ? '#ffffff' : (printConfig.headerAccentColor || '#0284c7')
                          }}>
                            {printConfig.customTitle || 'Prof. Joe AI Document'}
                          </div>
                          {printConfig.showDateTag && (
                            <div style={{ fontSize: '0.55rem', color: printConfig.headerStyle === 'banner' ? 'rgba(255,255,255,0.85)' : '#64748b' }}>
                              {new Date().toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{
                        ...(printConfig.columnLayout === 'two_column' ? {
                          columnCount: 2,
                          columnGap: '12px',
                          columnRule: '1px solid rgba(148, 163, 184, 0.2)'
                        } : {})
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '4px', color: printConfig.primaryInkColor || '#0f172a' }}>
                          1. Neyman-Pearson Lemma
                        </div>
                        <p style={{ margin: '0 0 6px 0', fontSize: '0.65rem', color: printConfig.primaryInkColor ? `${printConfig.primaryInkColor}cc` : '#475569' }}>
                          Testing simple $H_0: \theta = \theta_0$ vs $H_1: \theta = \theta_1$ with most powerful critical region:
                        </p>
                        
                        <div style={{
                          textAlign: 'center',
                          padding: '4px',
                          fontWeight: 600,
                          background: printConfig.inkMode === 'eco' ? 'transparent' : 'rgba(2, 132, 199, 0.05)',
                          borderRadius: '4px',
                          border: printConfig.inkMode === 'eco' ? '1px dashed #cbd5e1' : 'none',
                          color: printConfig.primaryInkColor || '#0f172a'
                        }}>
                          {"Λ(X) = L(θ₁; X) / L(θ₀; X) ≥ k"}
                        </div>

                        {!printConfig.hideDividers && (
                          <div style={{ borderBottom: '1px solid #e2e8f0', margin: '4px 0' }} />
                        )}

                        {printConfig.includeCode && (
                          <div style={{
                            background: printConfig.inkMode === 'eco' ? 'transparent' : '#f8fafc',
                            border: '1px solid #cbd5e1',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '0.58rem',
                            color: '#334155',
                            margin: '4px 0'
                          }}>
                            <code>def test_stat(l1, l0): return l1 / l0</code>
                          </div>
                        )}
                      </div>
                    </div>

                    {printConfig.showFooter && (
                      <div style={{
                        borderTop: '1px solid #e2e8f0',
                        paddingTop: '3px',
                        marginTop: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.52rem',
                        color: '#94a3b8'
                      }}>
                        <span>Prof. Joe AI Document</span>
                        <span>Page 1 of 1</span>
                      </div>
                    )}
                  </div>

                  {/* Test Print Action Button */}
                  <button
                    type="button"
                    onClick={handleTestPrint}
                    style={{
                      width: '100%',
                      marginTop: '16px',
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'var(--accent-cyan)',
                      color: '#000',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '0.88rem'
                    }}
                  >
                    <Printer size={16} />
                    <span>Test Print / Export PDF Now</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 🔑 API CREDENTIALS (EXPANSIVE 2-COLUMN BENTO GRID) */}
          {activeTab === 'keys' && (
            <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Top Banner & Control Deck */}
              <div style={{
                padding: '20px 24px',
                borderRadius: '16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                    <Key size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>API Key Credentials Hub</h3>
                      <span style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                        🟢 {configuredKeysCount} of {providerFields.length} Providers Ready
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Configure API keys for cloud providers, accelerated routers, and self-hosted inference endpoints
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={14} />
                    <span>Export JSON</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportJson}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Upload size={14} />
                    <span>Import JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveApiKeys}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      background: 'var(--accent-cyan)',
                      color: '#000',
                      border: 'none',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Check size={16} />
                    <span>Save All Keys</span>
                  </button>
                </div>
              </div>

              {saveFeedback && (
                <div style={{ padding: '12px 18px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={18} />
                  <span>{saveFeedback}</span>
                </div>
              )}

              {/* 2-Column Bento Deck for 4 Categories */}
              <form onSubmit={handleSaveApiKeys} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
                {providerCategories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.category}
                      style={{
                        padding: '20px 22px',
                        borderRadius: '16px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        boxSizing: 'border-box',
                        minWidth: 0,
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', minWidth: 0 }}>
                        <Icon size={20} style={{ color: cat.color, flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.category}</h4>
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.desc}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
                        {cat.fields.map(field => {
                          const isVisible = visibleFields[field.id];
                          const hasValue = Boolean((savedKeysState as any)[field.id]);

                          return (
                            <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', boxSizing: 'border-box', minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', minWidth: 0 }}>
                                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: hasValue ? '#10b981' : '#64748b', flexShrink: 0 }} />
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{field.label}</span>
                                </label>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{field.desc}</span>
                              </div>

                              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
                                <input
                                  type={isVisible ? 'text' : 'password'}
                                  value={(savedKeysState as any)[field.id] || ''}
                                  onChange={(e) => setSavedKeysState({ ...savedKeysState, [field.id]: e.target.value })}
                                  placeholder={field.placeholder}
                                  style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    padding: '10px 42px 10px 14px',
                                    borderRadius: '8px',
                                    border: hasValue ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid var(--border-color)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    fontFamily: isVisible ? 'inherit' : 'monospace',
                                    minWidth: 0
                                  }}
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
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  title={isVisible ? 'Hide value' : 'Show value'}
                                >
                                  {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </form>
            </div>
          )}

          {/* TAB 3: 🤖 MODEL MANAGER (EXPANSIVE WIDE BENTO GRID) */}
          {activeTab === 'models' && (
            <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
              <ModelManagerTab
                userKeys={userKeys}
                customModels={customModels}
                onSaveCustomModels={onSaveCustomModels}
                activeProvider={activeProvider}
                activeModel={activeModel}
                onSelectActiveModel={onSelectActiveModel}
                isWideMode={true}
              />
            </div>
          )}

          {/* TAB 3b: 🧠 AI GENERATION & PARAMETER TUNING (2-COLUMN BENTO DECK) */}
          {activeTab === 'ai_tuning' && (
            <div className="settings-bento-2col">
              {/* Left Column: Temperature & Token Generation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Temperature Controls */}
                <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Cpu size={20} style={{ color: 'var(--accent-cyan)' }} />
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Temperature & Creativity Control</h3>
                    </div>
                    <span style={{
                      fontSize: '0.85rem',
                      padding: '3px 12px',
                      borderRadius: '20px',
                      background: 'rgba(6, 182, 212, 0.2)',
                      color: 'var(--accent-cyan)',
                      fontWeight: 800,
                      border: '1px solid rgba(6, 182, 212, 0.4)'
                    }}>
                      {aiTuning.temperature.toFixed(2)}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Controls randomness. Lower values are strictly deterministic (ideal for math derivations, exam proofs & code), while higher values produce creative explanations.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={aiTuning.temperature}
                      onChange={(e) => updateAiTuning({ temperature: parseFloat(e.target.value) })}
                      style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>0.0 (Strict Proofs)</span>
                      <span>0.5 (Balanced Tutor)</span>
                      <span>1.0 (Creative Essay)</span>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '4px' }}>
                    {[
                      { val: 0.0, label: '0.0 Strict' },
                      { val: 0.2, label: '0.2 Exam (Def)' },
                      { val: 0.5, label: '0.5 Tutor' },
                      { val: 0.8, label: '0.8 Creative' }
                    ].map(p => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => updateAiTuning({ temperature: p.val })}
                        style={{
                          padding: '8px 4px',
                          borderRadius: '8px',
                          border: Math.abs(aiTuning.temperature - p.val) < 0.01 ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                          background: Math.abs(aiTuning.temperature - p.val) < 0.01 ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-tertiary)',
                          color: Math.abs(aiTuning.temperature - p.val) < 0.01 ? 'var(--accent-cyan)' : 'var(--text-primary)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Tokens Generation */}
                <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SlidersHorizontal size={20} style={{ color: 'var(--accent-cyan)' }} />
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Maximum Output Tokens</h3>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Sets the upper length limit for generated exam solutions and lecture notes.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
                    {[
                      { val: 1024, label: '1,024', desc: 'Concise' },
                      { val: 2048, label: '2,048', desc: 'Standard' },
                      { val: 4096, label: '4,096', desc: '12-Mark Answer' },
                      { val: 8192, label: '8,192', desc: 'Full Unit' },
                      { val: 16384, label: '16,384', desc: 'Monograph' }
                    ].map(tk => (
                      <button
                        key={tk.val}
                        type="button"
                        onClick={() => updateAiTuning({ maxTokens: tk.val })}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '10px',
                          border: aiTuning.maxTokens === tk.val ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                          background: aiTuning.maxTokens === tk.val ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-tertiary)',
                          color: aiTuning.maxTokens === tk.val ? 'var(--accent-cyan)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>{tk.label}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{tk.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Execution Modes & Exam Scheme */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Streaming & Real-time Synthesis */}
                <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={20} style={{ color: 'var(--accent-cyan)' }} />
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Streaming & Delivery</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Live Token Streaming</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Stream AI responses token-by-token with zero initial latency</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={aiTuning.streaming}
                        onChange={(e) => updateAiTuning({ streaming: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
                      />
                    </label>

                    {/* Web Search Depth */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Web Research Search Depth</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {[
                          { id: 'fast', label: 'Fast (3 Sources)', desc: 'Instant citations' },
                          { id: 'deep', label: 'Deep (10 Sources)', desc: 'Multi-paper synthesis' }
                        ].map(d => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => updateAiTuning({ searchDepth: d.id as any })}
                            style={{
                              padding: '10px 8px',
                              borderRadius: '8px',
                              border: aiTuning.searchDepth === d.id ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                              background: aiTuning.searchDepth === d.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                              color: aiTuning.searchDepth === d.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                              textAlign: 'left'
                            }}
                          >
                            <span>{d.label}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{d.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exam Evaluation Mode */}
                <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={20} style={{ color: 'var(--accent-cyan)' }} />
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>OU Exam Answer Schema</h3>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Standard response formatting tailored to Osmania University M.Sc. Data Science marking criteria.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                    {[
                      { id: 'rigorous_12mark', label: '12-Mark Rigorous Proof Scheme', desc: 'Theorem Statement → Proof → Step Derivation → Python Code → Time Complexity' },
                      { id: 'step_by_step', label: 'Step-by-Step Friendly Tutor', desc: 'Concept Intuition → Example Scenario → Bullet Points → Quick Summary' },
                      { id: 'compact', label: 'Ultra-Compact Cheat Sheet Mode', desc: 'Formulas and critical values only without conversational prose' }
                    ].map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => updateAiTuning({ graderMode: g.id as any })}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: aiTuning.graderMode === g.id ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                          background: aiTuning.graderMode === g.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                          color: aiTuning.graderMode === g.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>{g.label}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{g.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3c: 💻 CODE & MATH SYNTAX STYLING (VERTICAL BENTO DECK) */}
          {activeTab === 'code_style' && (() => {
            const UNIFIED_CODE_THEMES = [
              { id: 'onedark', label: 'OneDark Pro', desc: 'Atom / VS Code dark charcoal', bg: '#282c34', color: '#abb2bf', keywordColor: '#c678dd', funcColor: '#61afef', stringColor: '#98c379', numberColor: '#d19a66', commentColor: '#5c6370', borderColor: 'rgba(97, 175, 239, 0.4)' },
              { id: 'vscode_dark', label: 'VS Code Dark+', desc: 'Classic Microsoft dark engine', bg: '#1e1e1e', color: '#d4d4d4', keywordColor: '#569cd6', funcColor: '#dcdcaa', stringColor: '#ce9178', numberColor: '#b5cea8', commentColor: '#6a9955', borderColor: 'rgba(78, 201, 176, 0.4)' },
              { id: 'monokai', label: 'Monokai Pro', desc: 'Iconic dark gold & hot pink', bg: '#272822', color: '#f8f8f2', keywordColor: '#f92672', funcColor: '#a6e22e', stringColor: '#e6db74', numberColor: '#ae81ff', commentColor: '#75715e', borderColor: 'rgba(255, 216, 102, 0.4)' },
              { id: 'tokyo_night', label: 'Tokyo Night', desc: 'Midnight neon purple & cyan', bg: '#1a1b26', color: '#c0caf5', keywordColor: '#bb9af7', funcColor: '#7aa2f7', stringColor: '#9ece6a', numberColor: '#ff9e64', commentColor: '#565f89', borderColor: 'rgba(122, 162, 247, 0.4)' },
              { id: 'github_light', label: 'GitHub Light', desc: 'High-contrast academic white', bg: '#ffffff', color: '#24292f', keywordColor: '#cf222e', funcColor: '#8250df', stringColor: '#0a3069', numberColor: '#0550ae', commentColor: '#6e7781', borderColor: 'rgba(9, 105, 218, 0.4)' },
              { id: 'neon', label: 'Cyberpunk Neon', desc: 'Deep jet black with electric cyan', bg: '#0b0f19', color: '#e2e8f0', keywordColor: '#06b6d4', funcColor: '#38bdf8', stringColor: '#10b981', numberColor: '#f59e0b', commentColor: '#059669', borderColor: 'rgba(6, 182, 212, 0.6)' },
              { id: 'hc_black', label: 'High Contrast', desc: 'Pure OLED black accessibility', bg: '#000000', color: '#ffffff', keywordColor: '#06b6d4', funcColor: '#38bdf8', stringColor: '#10b981', numberColor: '#facc15', commentColor: '#94a3b8', borderColor: '#06b6d4' }
            ];

            const activeThemeId = (codeStyle.codeTheme || ideConfig.theme || 'onedark') as string;
            const currentThemeMeta = UNIFIED_CODE_THEMES.find(t => 
              t.id === activeThemeId || 
              (activeThemeId === 'vs-dark' && t.id === 'vscode_dark') || 
              (activeThemeId === 'vs-light' && t.id === 'github_light') || 
              (activeThemeId === 'hc-black' && t.id === 'hc_black')
            ) || UNIFIED_CODE_THEMES[0];

            return (
              <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
                
                {/* 1. Unified Syntax Theme Hub */}
                <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Code size={22} style={{ color: 'var(--accent-cyan)' }} />
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Unified Code & Syntax Theme Engine</h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Choose your global syntax theme. Synchronizes across Chat, Code Dungeon, Lecture Notes, and Sandboxes.
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '4px 12px', borderRadius: '12px', fontWeight: 700 }}>
                      Universal Theme Sync Active
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
                    {UNIFIED_CODE_THEMES.map(th => {
                      const isSelected = currentThemeMeta.id === th.id;
                      return (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => {
                            updateCodeStyle({ codeTheme: th.id as any });
                            updateIdeConfig({ theme: th.id as any });
                          }}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: isSelected ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                            background: th.bg,
                            color: th.color,
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            boxShadow: isSelected ? '0 0 16px rgba(6, 182, 212, 0.35)' : '0 2px 8px rgba(0,0,0,0.15)',
                            boxSizing: 'border-box',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>{th.label}</span>
                              <div style={{ fontSize: '0.68rem', opacity: 0.75, marginTop: '2px' }}>{th.desc}</div>
                            </div>
                            {isSelected && (
                              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Check size={14} style={{ color: '#000000', strokeWidth: 3 }} />
                              </div>
                            )}
                          </div>
                          <code style={{ fontSize: '0.72rem', padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.25)', fontFamily: 'monospace', display: 'flex', gap: '6px' }}>
                            <span style={{ color: th.keywordColor }}>def</span>
                            <span style={{ color: th.funcColor }}>solve</span>():
                            <span style={{ color: th.stringColor }}>'OU Exam'</span>
                          </code>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Code Dungeon & IDE Engine Controls */}
                <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '18px', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Terminal size={22} style={{ color: 'var(--accent-cyan)' }} />
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Code Dungeon & Practical Lab Configuration</h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Configure typography, indentation, line numbers, and default rendering engine for the Practical Code Lab.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Engine Mode Toggle: Monaco vs Fast */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>DEFAULT CODE ENGINE MODE</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
                      <button
                        type="button"
                        onClick={() => updateIdeConfig({ editorEngine: 'monaco' })}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: (ideConfig.editorEngine || 'monaco') === 'monaco' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                          background: (ideConfig.editorEngine || 'monaco') === 'monaco' ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-primary)',
                          color: (ideConfig.editorEngine || 'monaco') === 'monaco' ? 'var(--accent-cyan)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          boxSizing: 'border-box'
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>💻 Monaco Engine (Full VS Code)</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Advanced IDE with multi-cursor, intellisense, & minimap</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateIdeConfig({ editorEngine: 'fast' })}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: ideConfig.editorEngine === 'fast' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                          background: ideConfig.editorEngine === 'fast' ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-primary)',
                          color: ideConfig.editorEngine === 'fast' ? 'var(--accent-cyan)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          boxSizing: 'border-box'
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>⚡ Fast & Lightweight Editor</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Zero-latency instant streaming viewer (low memory)</span>
                      </button>
                    </div>
                  </div>

                  {/* Grid of IDE Properties */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
                    {/* Font Size */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>IDE CODE FONT SIZE</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '6px' }}>
                        {[12, 13, 14, 16].map(sz => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => updateIdeConfig({ fontSize: sz })}
                            style={{
                              padding: '10px 4px',
                              borderRadius: '8px',
                              border: ideConfig.fontSize === sz ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                              background: ideConfig.fontSize === sz ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-primary)',
                              color: ideConfig.fontSize === sz ? 'var(--accent-cyan)' : 'var(--text-primary)',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              textAlign: 'center',
                              boxSizing: 'border-box'
                            }}
                          >
                            {sz}px
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Minimap & Tab Size */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>MINIMAP & INDENTATION</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => updateIdeConfig({ minimap: !ideConfig.minimap })}
                          style={{
                            padding: '10px 8px',
                            borderRadius: '8px',
                            border: ideConfig.minimap ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                            background: ideConfig.minimap ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-primary)',
                            color: ideConfig.minimap ? 'var(--accent-cyan)' : 'var(--text-primary)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxSizing: 'border-box'
                          }}
                        >
                          Minimap: {ideConfig.minimap ? 'Enabled' : 'Disabled'}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateIdeConfig({ tabSize: ideConfig.tabSize === 2 ? 4 : 2 })}
                          style={{
                            padding: '10px 8px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxSizing: 'border-box'
                          }}
                        >
                          Tab: {ideConfig.tabSize} Spaces
                        </button>
                      </div>
                    </div>

                    {/* Word Wrap & Line Numbers */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>LINE DISPLAY & WRAPPING</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => updateIdeConfig({ wordWrap: ideConfig.wordWrap === 'on' ? 'off' : 'on' })}
                          style={{
                            padding: '10px 8px',
                            borderRadius: '8px',
                            border: ideConfig.wordWrap === 'on' ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                            background: ideConfig.wordWrap === 'on' ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-primary)',
                            color: ideConfig.wordWrap === 'on' ? 'var(--accent-cyan)' : 'var(--text-primary)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxSizing: 'border-box'
                          }}
                        >
                          Wrap: {ideConfig.wordWrap === 'on' ? 'On' : 'Scroll'}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateIdeConfig({ lineNumbers: ideConfig.lineNumbers === 'on' ? 'off' : 'on' })}
                          style={{
                            padding: '10px 8px',
                            borderRadius: '8px',
                            border: ideConfig.lineNumbers === 'on' ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                            background: ideConfig.lineNumbers === 'on' ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-primary)',
                            color: ideConfig.lineNumbers === 'on' ? 'var(--accent-cyan)' : 'var(--text-primary)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxSizing: 'border-box'
                          }}
                        >
                          Lines: {ideConfig.lineNumbers === 'on' ? 'Shown' : 'Hidden'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 👁️ Live Interactive Code Editor Preview Window */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                      👁️ LIVE CODE EDITOR PREVIEW ({currentThemeMeta.label})
                    </label>
                    <div style={{
                      padding: '16px 20px',
                      borderRadius: '12px',
                      background: currentThemeMeta.bg,
                      border: `1.5px solid ${currentThemeMeta.borderColor || 'rgba(6, 182, 212, 0.3)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      overflow: 'hidden',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', opacity: 0.8 }} />
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', opacity: 0.8 }} />
                          <span style={{ marginLeft: '8px', fontSize: '0.74rem', color: currentThemeMeta.color, fontFamily: 'monospace', fontWeight: 700 }}>
                            dijkstra_shortest_path.py — {(ideConfig.editorEngine || 'monaco') === 'fast' ? 'Fast Lightweight Engine' : 'Monaco VS Code Engine'}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {ideConfig.fontSize}px • {ideConfig.tabSize}sp • {ideConfig.wordWrap === 'on' ? 'Wrap' : 'Scroll'}
                        </span>
                      </div>
                      <div style={{
                        fontFamily: 'monospace',
                        fontSize: `${ideConfig.fontSize}px`,
                        lineHeight: 1.6,
                        display: 'flex',
                        gap: '14px',
                        overflowX: 'auto',
                        whiteSpace: ideConfig.wordWrap === 'on' ? 'pre-wrap' : 'pre'
                      }}>
                        {ideConfig.lineNumbers === 'on' && (
                          <div style={{ display: 'flex', flexDirection: 'column', userSelect: 'none', opacity: 0.4, textAlign: 'right', color: currentThemeMeta.color, minWidth: '16px' }}>
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                            <span>4</span>
                            <span>5</span>
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div><span style={{ color: currentThemeMeta.keywordColor }}>def</span> <span style={{ color: currentThemeMeta.funcColor }}>dijkstra</span>(graph, start):</div>
                          <div style={{ paddingLeft: `${ideConfig.tabSize * 8}px` }}>distances = &#123;node: <span style={{ color: currentThemeMeta.numberColor }}>float</span>(<span style={{ color: currentThemeMeta.stringColor }}>'inf'</span>) <span style={{ color: currentThemeMeta.keywordColor }}>for</span> node <span style={{ color: currentThemeMeta.keywordColor }}>in</span> graph&#125;</div>
                          <div style={{ paddingLeft: `${ideConfig.tabSize * 8}px` }}>distances[start] = <span style={{ color: currentThemeMeta.numberColor }}>0</span></div>
                          <div style={{ paddingLeft: `${ideConfig.tabSize * 8}px` }}><span style={{ color: currentThemeMeta.commentColor }}># Dijkstra priority heap traversal</span></div>
                          <div style={{ paddingLeft: `${ideConfig.tabSize * 8}px` }}><span style={{ color: currentThemeMeta.keywordColor }}>return</span> distances</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. KaTeX Math Preferences */}
                <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={20} style={{ color: 'var(--accent-cyan)' }} />
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>KaTeX Mathematical Formula Scaling & Copy Behavior</h3>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Adjust rendering dimensions and copy behavior for LaTeX mathematical proofs, matrix formulations, and integral derivations.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '10px' }}>
                    {[
                      { id: 'compact', label: 'Compact 90%', desc: 'Dense math' },
                      { id: 'standard', label: 'Standard 100%', desc: 'Default TeX scale' },
                      { id: 'large', label: 'Large 115%', desc: 'Classroom size' }
                    ].map(sc => (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => updateCodeStyle({ katexScale: sc.id as any })}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: codeStyle.katexScale === sc.id ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                          background: codeStyle.katexScale === sc.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                          color: codeStyle.katexScale === sc.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          textAlign: 'left',
                          boxSizing: 'border-box'
                        }}
                      >
                        <span>{sc.label}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{sc.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Formula Copy Mode */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>1-CLICK FORMULA COPY ACTION</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '8px' }}>
                      {[
                        { id: 'latex', label: 'LaTeX Code ($$ ... $$)', desc: 'For Overleaf, LaTeX documents, & research papers' },
                        { id: 'unicode', label: 'Unicode Text (∫ e^-x² dx)', desc: 'For Plain Text notes & quick messaging' }
                      ].map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => updateCodeStyle({ equationCopyMode: m.id as any })}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: codeStyle.equationCopyMode === m.id ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                            background: codeStyle.equationCopyMode === m.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                            color: codeStyle.equationCopyMode === m.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            boxSizing: 'border-box'
                          }}
                        >
                          <span>{m.label}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{m.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* TAB 3d: ⌨️ KEYBOARD SHORTCUTS STUDIO (FULL-WIDTH BENTO DECK) */}
          {activeTab === 'shortcuts' && (
            <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Command size={22} style={{ color: 'var(--accent-cyan)' }} />
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Keyboard Shortcuts & Hotkeys</h3>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Accelerate your workflow with quick power-user keyboard combinations.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '12px', marginTop: '8px' }}>
                  {[
                    { keys: ['Ctrl', 'K'], desc: 'Open Model Command Deck & Picker', category: 'Navigation' },
                    { keys: ['Ctrl', 'P'], desc: 'Open Print Studio & PDF Preview', category: 'Export' },
                    { keys: ['Ctrl', 'Enter'], desc: 'Send Message / Execute Code Prompt', category: 'Chat' },
                    { keys: ['Ctrl', '/'], desc: 'Toggle Navigation Sidebar', category: 'Navigation' },
                    { keys: ['Ctrl', 'Shift', 'L'], desc: 'Toggle Dark / Light Visual Theme', category: 'Appearance' },
                    { keys: ['Ctrl', 'Shift', 'N'], desc: 'Start Brand New Chat Session', category: 'Chat' },
                    { keys: ['Ctrl', 'Shift', 'S'], desc: 'Open Universal Settings & Print Studio', category: 'Settings' }
                  ].map((sc, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        boxSizing: 'border-box',
                        minWidth: 0
                      }}
                    >
                      <div style={{ minWidth: 0, flex: '1 1 170px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{sc.desc}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '2px' }}>{sc.category}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0, flexWrap: 'wrap' }}>
                        {sc.keys.map((k, kIdx) => (
                          <React.Fragment key={kIdx}>
                            <kbd style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              background: 'var(--bg-tertiary)',
                              border: '1px solid var(--border-color)',
                              boxShadow: '0 2px 0 rgba(0,0,0,0.3)',
                              color: 'var(--accent-cyan)',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              fontFamily: 'monospace'
                            }}>
                              {k}
                            </kbd>
                            {kIdx < sc.keys.length - 1 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 👤 USER PROFILE (2-COLUMN BENTO DASHBOARD) */}
          {activeTab === 'account' && (
            <div className="settings-bento-2col">
              {/* Left Column: Student Identity Card */}
              <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: '2.5px solid var(--accent-cyan)', boxShadow: '0 0 16px rgba(6, 182, 212, 0.3)', flexShrink: 0 }}>
                    <img src="/joe-avatar.png" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{currentUser}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                        {userRole?.toUpperCase() || 'OU STUDENT'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                        ● Active Session
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Institution</span>
                    <span style={{ fontWeight: 600 }}>Osmania University (OU)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Degree / Program</span>
                    <span style={{ fontWeight: 600 }}>M.Sc. Data Science</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Academic Semester</span>
                    <span style={{ fontWeight: 600 }}>Semester IV (Final Year)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Core Syllabus Track</span>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Statistical Inference & ML</span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  style={{
                    marginTop: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.88rem'
                  }}
                >
                  <span>Log Out of Session</span>
                </button>
              </div>

              {/* Right Column: Workspace Intelligence & Activity */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>Workspace Activity & Intelligence</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '12px' }}>
                    <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTIVE PROVIDER</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeProvider || 'OpenRouter'}</div>
                    </div>
                    <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTIVE MODEL</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeModel || 'Auto-Free'}</div>
                    </div>
                    <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>CONFIGURED API KEYS</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>{configuredKeysCount} / {providerFields.length} Ready</div>
                    </div>
                    <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>DOCUMENT EXPORT ENGINE</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, marginTop: '4px' }}>A4 Print Studio 🌿</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 🎨 APPEARANCE & ATMOSPHERE STUDIO (FULL BENTO DECK + LIVE PREVIEW) */}
          {activeTab === 'theme' && (
            <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Card 1: 🌌 Global Workspace Atmosphere (1-Click Color Suite) */}
              <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                      <Palette size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Global Workspace Multi-Color Atmosphere</h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Transform application backgrounds, sidebars, header navigation, and accent glow with 1 click.
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', fontWeight: 700, border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                    Active: {(codeStyle.atmosphere || 'cyber_osmania').replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px', marginTop: '6px' }}>
                  {[
                    {
                      id: 'cyber_osmania',
                      name: 'Cyber Osmania (Default)',
                      desc: 'Deep slate navy with electric cyan glow',
                      baseColor: '#020617',
                      accentColor: '#06b6d4',
                      isLight: false
                    },
                    {
                      id: 'midnight_academy',
                      name: 'Midnight Academy',
                      desc: 'Royal indigo with nocturnal lavender glow',
                      baseColor: '#0a081e',
                      accentColor: '#a855f7',
                      isLight: false
                    },
                    {
                      id: 'emerald_scholar',
                      name: 'Emerald Scholar',
                      desc: 'Deep forest dark with academic mint glow',
                      baseColor: '#021a12',
                      accentColor: '#10b981',
                      isLight: false
                    },
                    {
                      id: 'obsidian_oled',
                      name: 'Obsidian OLED',
                      desc: 'Pure OLED black with high-contrast razor cyan',
                      baseColor: '#000000',
                      accentColor: '#38bdf8',
                      isLight: false
                    },
                    {
                      id: 'oxford_daylight',
                      name: 'Oxford Daylight (Light)',
                      desc: 'Warm ivory paper with Oxford navy typography',
                      baseColor: '#f8fafc',
                      accentColor: '#1e3a8a',
                      isLight: true
                    },
                    {
                      id: 'amber_parchment',
                      name: 'Amber Parchment (Warm)',
                      desc: 'Vintage cream paper with warm amber gold',
                      baseColor: '#fbf7ee',
                      accentColor: '#d97706',
                      isLight: true
                    }
                  ].map(atmo => {
                    const isSelected = (codeStyle.atmosphere || 'cyber_osmania') === atmo.id;
                    return (
                      <button
                        key={atmo.id}
                        type="button"
                        onClick={() => updateCodeStyle({ atmosphere: atmo.id as any })}
                        style={{
                          padding: '16px 18px',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                          background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          boxShadow: isSelected ? '0 0 16px rgba(6, 182, 212, 0.25)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* Swatch preview */}
                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: atmo.baseColor, border: `2px solid ${atmo.accentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 10px ${atmo.accentColor}33` }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: atmo.accentColor }} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                              {atmo.name}
                            </div>
                            {isSelected && <Check size={16} style={{ color: 'var(--accent-cyan)' }} />}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {atmo.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card 2: 🧪 Data Visualization & Sandbox Canvas Atmosphere (5 Presets) */}
              <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                      <Activity size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Data Visualization & Sandbox Canvas Atmosphere</h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Dedicated backdrops for Statistical & Neural Simulators. Frame and controls preserve your global app theme.
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    Active Canvas: {(codeStyle.canvasAtmosphere || 'deep_void').replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '14px', marginTop: '6px' }}>
                  {[
                    {
                      id: 'deep_void',
                      name: 'Deep Void Slate',
                      desc: 'Deep cosmic slate with electric cyan coordinate grid',
                      bgColor: '#020617',
                      accentColor: '#38bdf8',
                      gridColor: 'rgba(56, 189, 248, 0.25)',
                      inkColor: '#f8fafc'
                    },
                    {
                      id: 'blueprint_matrix',
                      name: 'Blueprint Matrix',
                      desc: 'Engineering cyan grid with technical architectural drafting',
                      bgColor: '#071927',
                      accentColor: '#06b6d4',
                      gridColor: 'rgba(6, 182, 212, 0.35)',
                      inkColor: '#e0f2fe'
                    },
                    {
                      id: 'academic_parchment',
                      name: 'Warm Academic Parchment',
                      desc: 'Vintage lecture parchment with rich sepia mathematical ink',
                      bgColor: '#fdfaf3',
                      accentColor: '#d97706',
                      gridColor: 'rgba(217, 119, 6, 0.2)',
                      inkColor: '#3e2723'
                    },
                    {
                      id: 'oxford_daylight',
                      name: 'Oxford Daylight Crisp',
                      desc: 'High-key classroom whiteboard with crisp navy axes',
                      bgColor: '#ffffff',
                      accentColor: '#1e3a8a',
                      gridColor: 'rgba(148, 163, 184, 0.3)',
                      inkColor: '#0f172a'
                    },
                    {
                      id: 'oled_black',
                      name: 'OLED Pure Black',
                      desc: 'Pure #000000 AMOLED contrast with maximum battery savings',
                      bgColor: '#000000',
                      accentColor: '#38bdf8',
                      gridColor: 'rgba(51, 65, 85, 0.4)',
                      inkColor: '#ffffff'
                    }
                  ].map(canvasAtmo => {
                    const isSelected = (codeStyle.canvasAtmosphere || 'deep_void') === canvasAtmo.id;
                    return (
                      <button
                        key={canvasAtmo.id}
                        type="button"
                        onClick={() => updateCodeStyle({ canvasAtmosphere: canvasAtmo.id as any })}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #38bdf8' : '1px solid var(--border-color)',
                          background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          boxShadow: isSelected ? '0 0 16px rgba(56, 189, 248, 0.25)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* Mini Canvas Swatch */}
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            background: canvasAtmo.bgColor,
                            border: `2px solid ${canvasAtmo.accentColor}`,
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            overflow: 'hidden'
                          }}
                        >
                          {/* Mini Grid Lines */}
                          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(to right, ${canvasAtmo.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${canvasAtmo.gridColor} 1px, transparent 1px)`, backgroundSize: '8px 8px' }} />
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: canvasAtmo.accentColor, zIndex: 1 }} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#38bdf8' : 'var(--text-primary)' }}>
                              {canvasAtmo.name}
                            </div>
                            {isSelected && <Check size={16} style={{ color: '#38bdf8' }} />}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                            {canvasAtmo.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card 3: 👁️ INTERACTIVE MULTI-VIEW ATMOSPHERE PREVIEW DECK */}
              <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--pill-bg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                      <Eye size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Interactive Multi-View Atmosphere Preview Deck</h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Live simulation of your active atmosphere across all core interfaces: Chat, Code Lab, Control Deck, and Exam Notes.
                      </p>
                    </div>
                  </div>

                  {/* Multi-View Tab Switcher */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    {[
                      { id: 'chat', label: '💬 Chat & Math', icon: Sparkles },
                      { id: 'code', label: '💻 Code Lab', icon: Code },
                      { id: 'deck', label: '🎛️ Control Deck', icon: Layers },
                      { id: 'exam', label: '📝 Exam & Notes', icon: BookOpen }
                    ].map(tab => {
                      const isActive = activePreviewTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActivePreviewTab(tab.id as any)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: isActive ? 'var(--btn-primary-bg)' : 'transparent',
                            color: isActive ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
                            fontWeight: isActive ? 700 : 500,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: isActive ? '0 2px 10px rgba(0,0,0,0.2)' : 'none'
                          }}
                        >
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Simulated Viewport Frame */}
                <div
                  style={{
                    borderRadius: '14px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    padding: '20px',
                    minHeight: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.25)',
                    transition: 'all 0.25s ease'
                  }}
                  data-atmosphere={codeStyle.atmosphere || 'cyber_osmania'}
                  data-theme={(codeStyle.atmosphere === 'oxford_daylight' || codeStyle.atmosphere === 'amber_parchment') ? 'light' : 'dark'}
                >
                  {/* VIEW 1: 💬 CHAT & MATH VIEW */}
                  {activePreviewTab === 'chat' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* User Bubble Row */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', maxWidth: '85%', alignSelf: 'flex-end' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600 }}>You (OU Student)</span>
                          <span>•</span>
                          <span>10:42 AM</span>
                        </div>
                        <div className="user-bubble message-bubble" style={{ fontSize: '0.86rem', lineHeight: '1.45' }}>
                          Prof. Joe, can you explain Bayes' Theorem formula for the Osmania University Sem IV Data Science exam?
                        </div>
                      </div>

                      {/* Assistant Bubble Row */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', maxWidth: '92%', alignSelf: 'flex-start' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--accent-cyan)' }}>
                            <img src="/joe-avatar.png" alt="Prof Joe" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>Prof. Joe AI</span>
                          <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '6px', background: 'var(--pill-bg)', color: 'var(--accent-cyan)', fontWeight: 600, border: '1px solid var(--border-color)' }}>
                            Auto-Free (Exam Mode)
                          </span>
                        </div>
                        <div className="assistant-bubble message-bubble" style={{ fontSize: '0.86rem', lineHeight: '1.55', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            Under conditional probability, <strong>Bayes' Theorem</strong> calculates the posterior probability of hypothesis $A$ given evidence $B$:
                          </div>

                          {/* Display Math Equation */}
                          <div style={{ padding: '12px 18px', borderRadius: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.94rem', color: 'var(--accent-cyan)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            P(A | B) = [ P(B | A) · P(A) ] / P(B)
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            <span>• <strong>P(A|B)</strong>: Posterior probability</span>
                            <span>• <strong>P(B|A)</strong>: Likelihood</span>
                            <span>• <strong>P(A)</strong>: Prior probability</span>
                          </div>

                          {/* Message Quick Action Deck */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-color)' }}>
                            <button type="button" className="btn-theme-secondary" style={{ padding: '4px 10px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '6px' }}>
                              <Copy size={12} />
                              <span>Copy Solution</span>
                            </button>
                            <button type="button" className="btn-theme-secondary" style={{ padding: '4px 10px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '6px' }}>
                              <Zap size={12} style={{ color: 'var(--accent-cyan)' }} />
                              <span>Generate Practice Quiz</span>
                            </button>
                            <button type="button" className="btn-theme-secondary" style={{ padding: '4px 10px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '6px' }}>
                              <Volume2 size={12} />
                              <span>Voice Narration</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VIEW 2: 💻 CODE LAB & TERMINAL VIEW */}
                  {activePreviewTab === 'code' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Code Editor Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px 10px 0 0', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderBottom: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Terminal size={15} style={{ color: 'var(--accent-cyan)' }} />
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', fontWeight: 600 }}>neyman_pearson_simulation.py</span>
                          <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--pill-bg)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                            PYTHON 3.11
                          </span>
                        </div>
                        <button type="button" className="btn-theme-primary" style={{ padding: '4px 12px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Play size={12} />
                          <span>Run Script</span>
                        </button>
                      </div>

                      {/* Code Editor Body */}
                      <div style={{ margin: 0, padding: '14px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '0 0 10px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: '1.6', overflowX: 'auto' }}>
                        <div style={{ color: 'var(--text-muted)' }}># Statistical Inference: Uniformly Most Powerful Region</div>
                        <div><span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>import</span> numpy <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>as</span> np</div>
                        <br />
                        <div><span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>def</span> <span style={{ color: '#38bdf8' }}>neyman_pearson_ratio</span>(L1, L0, alpha=0.05):</div>
                        <div style={{ paddingLeft: '18px' }}>likelihood_ratio = np.where(L0 &gt; 0, L1 / L0, np.inf)</div>
                        <div style={{ paddingLeft: '18px' }}>k_threshold = np.percentile(likelihood_ratio, 100 * (1 - alpha))</div>
                        <div style={{ paddingLeft: '18px' }}><span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>return</span> k_threshold, np.mean(likelihood_ratio &gt;= k_threshold)</div>
                      </div>

                      {/* Simulated Execution Terminal */}
                      <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={13} />
                          <span>Output: Critical Value k = 2.71828 • Statistical Power 1-β = 0.942</span>
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>14.2ms • 100% OK</span>
                      </div>
                    </div>
                  )}

                  {/* VIEW 3: 🎛️ CONTROL DECK & BENTO VIEW */}
                  {activePreviewTab === 'deck' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Drawer Top Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
                          <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Session Control Deck</span>
                          <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--pill-bg)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                            STUDENT SUITE
                          </span>
                        </div>
                        <button type="button" className="btn-theme-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                          + New Session
                        </button>
                      </div>

                      {/* Bento Action Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '10px' }}>
                        {[
                          { icon: Globe, label: 'Web Grounding', desc: 'Live Academic Search', active: true },
                          { icon: Cpu, label: 'Model Monitor', desc: 'gemini-2.5-pro • Free', active: true },
                          { icon: FileText, label: 'Native Print / PDF', desc: 'Custom Exam Layout', active: false },
                          { icon: Trash2, label: 'Purge Context', desc: 'Zero Token Reset', active: false }
                        ].map((bento, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '12px',
                              borderRadius: '10px',
                              background: 'var(--bg-secondary)',
                              border: bento.active ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              boxShadow: bento.active ? '0 0 10px rgba(6, 182, 212, 0.15)' : 'none'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <bento.icon size={16} style={{ color: bento.active ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
                              {bento.active && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: bento.active ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                              {bento.label}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{bento.desc}</div>
                          </div>
                        ))}
                      </div>

                      {/* Active Persona Status Card */}
                      <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid var(--accent-cyan)' }}>
                            <img src="/joe-avatar.png" alt="Prof Joe" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>Prof. Joe (Academic Professor)</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Osmania University Exam Rigor • S-Rank Reasoning</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px', background: 'var(--pill-bg)', color: 'var(--accent-cyan)', fontWeight: 700, border: '1px solid var(--border-color)' }}>
                          Active Persona
                        </span>
                      </div>
                    </div>
                  )}

                  {/* VIEW 4: 📝 EXAM & NOTES VIEW */}
                  {activePreviewTab === 'exam' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Exam Question Card */}
                      <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <div className="deck-type-badge" style={{ color: 'var(--accent-cyan)', borderColor: 'var(--border-color)', background: 'var(--pill-bg)', display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}>
                            <Award size={13} style={{ color: 'var(--accent-cyan)' }} />
                            <span>12-MARK ESSAY QUESTION • MDS-104-T INFERENCE</span>
                          </div>
                          <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Flame size={13} /> High Exam Probability (98%)
                          </span>
                        </div>

                        <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                          Q3. (a) State and prove the Neyman-Pearson Lemma. Establish the existence of a Uniformly Most Powerful (UMP) test for testing simple $H_0$ against simple $H_1$.
                        </div>

                        {/* Scheme Breakdown */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '8px', marginTop: '4px' }}>
                          <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: '0.74rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>1. Ratio Setup [3M]</div>
                            <div style={{ color: 'var(--text-muted)' }}>$L(x; \theta_1) / L(x; \theta_0) \ge k$</div>
                          </div>
                          <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: '0.74rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>2. Power Max [5M]</div>
                            <div style={{ color: 'var(--text-muted)' }}>Lagrangian multiplier proof</div>
                          </div>
                          <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: '0.74rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>3. Cutoff Threshold [4M]</div>
                            <div style={{ color: 'var(--text-muted)' }}>Size &alpha; = P(Reject H₀ | H₀)</div>
                          </div>
                        </div>

                        {/* Card Action Footer */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            Osmania University Syllabus • 12/12 Marks Scheme
                          </span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" className="btn-theme-secondary" style={{ padding: '4px 10px', fontSize: '0.74rem' }}>
                              Generate 14 Flashcards
                            </button>
                            <button type="button" className="btn-theme-primary" style={{ padding: '4px 12px', fontSize: '0.74rem' }}>
                              Practice in Quiz Arena
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: 💾 DATA & STORAGE (2-COLUMN STORAGE COMMAND DECK) */}
          {activeTab === 'data' && (
            <div className="settings-bento-2col">
              <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Data & Local Storage</h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  All chat logs, model preferences, and custom credentials are encrypted and stored locally on your device.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.85rem' }}>Offline Storage Location</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>Browser LocalStorage</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.85rem' }}>Telemetry & Tracking</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>Disabled (100% Private)</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>Danger Zone</h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Purge active chat sessions or reset all model configurations to factory defaults.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all active chat sessions? This cannot be undone.')) {
                      onClearHistory();
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.88rem'
                  }}
                >
                  <Trash2 size={16} />
                  <span>Clear All Active Chat Sessions</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
