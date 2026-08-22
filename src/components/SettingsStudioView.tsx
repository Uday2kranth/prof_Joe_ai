import React, { useState, useRef, useEffect } from 'react';
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
  Sun, 
  Moon,
  Download,
  Upload,
  Check
} from 'lucide-react';
import { 
  getPrintCustomConfig, 
  savePrintCustomConfig, 
  type PrintCustomConfig, 
  printBubbleToPdf 
} from '../services/printPdfService';
import type { UserKeys, UserCustomModels } from '../types';
import { ModelManagerTab } from './ModelManagerTab';

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
  initialTab?: 'print' | 'account' | 'keys' | 'models' | 'theme' | 'data';
}

export const SettingsStudioView: React.FC<SettingsStudioViewProps> = ({
  onBack,
  currentUser,
  userRole = 'student',
  theme,
  onToggleTheme,
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
  const [activeTab, setActiveTab] = useState<'print' | 'account' | 'keys' | 'models' | 'theme' | 'data'>(initialTab);
  const [printConfig, setPrintConfig] = useState<PrintCustomConfig>(getPrintCustomConfig());
  const [savedKeysState, setSavedKeysState] = useState<UserKeys>(userKeys);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setSaveFeedback('API Key credentials updated successfully!');
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
            const mergedKeys = { ...savedKeysState, ...imported };
            setSavedKeysState(mergedKeys);
            onSaveKeys(mergedKeys);
            setSaveFeedback('API Credentials JSON imported & saved successfully!');
            setTimeout(() => setSaveFeedback(null), 3000);
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
    <div className="settings-studio-container" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      overflow: 'hidden'
    }}>
      {/* Top Header Bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              fontSize: '0.85rem'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Workspace</span>
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Settings</span>
              <span className="action-pill-badge" style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)' }}>
                v2.1 Universal
              </span>
            </h2>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Manage system preferences, API credentials, AI models, and Print Studio
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onToggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-400" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body: Sidebar Navigation + Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Navigation Sidebar */}
        <aside style={{
          width: '240px',
          borderRight: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 12px',
          gap: '6px',
          flexShrink: 0
        }}>
          {[
            { id: 'print', label: 'Print Studio', icon: Printer, badge: 'Popular' },
            { id: 'keys', label: 'API Credentials', icon: Key },
            { id: 'models', label: 'Model Manager', icon: Bot },
            { id: 'account', label: 'User Profile', icon: User },
            { id: 'theme', label: 'Appearance & Theme', icon: Palette },
            { id: 'data', label: 'Data & Storage', icon: Database }
          ].map(item => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: isCurrent ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                  background: isCurrent ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                  color: isCurrent ? 'var(--accent-cyan)' : 'var(--text-primary)',
                  fontWeight: isCurrent ? 700 : 500,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
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
        </aside>

        {/* Right Scrollable Content Area */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--bg-primary)' }}>
          {/* TAB 1: 🖨️ PRINT STUDIO */}
          {activeTab === 'print' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(360px, 0.75fr)', gap: '24px', maxWidth: '1400px', margin: '0 auto' }}>
              {/* Left Column: Bento Control Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 1. Presets */}
                <div style={{ padding: '18px 20px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Sparkles size={18} className="text-cyan-400" />
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

                {/* 2. Page Geometry & Layout */}
                <div style={{ padding: '18px 20px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Layers size={18} className="text-cyan-400" />
                    <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.04em' }}>PAGE GEOMETRY & LAYOUT</h3>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {/* Paper Size */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PAPER SIZE</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        {(['a4', 'letter'] as const).map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => updateConfig({ paperSize: size, preset: 'custom' })}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              border: printConfig.paperSize === size ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                              background: printConfig.paperSize === size ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                              color: printConfig.paperSize === size ? 'var(--accent-cyan)' : 'var(--text-primary)',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              cursor: 'pointer'
                            }}
                          >
                            {size}
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
                              padding: '8px',
                              borderRadius: '8px',
                              border: printConfig.orientation === orient ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                              background: printConfig.orientation === orient ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                              color: printConfig.orientation === orient ? 'var(--accent-cyan)' : 'var(--text-primary)',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              cursor: 'pointer'
                            }}
                          >
                            {orient}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Margins */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PAGE MARGINS</label>
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
                              padding: '8px 4px',
                              borderRadius: '8px',
                              border: printConfig.marginPreset === m.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                              background: printConfig.marginPreset === m.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                              color: printConfig.marginPreset === m.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
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

                {/* 3. Typography & Ink Saver */}
                <div style={{ padding: '18px 20px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Sliders size={18} className="text-cyan-400" />
                    <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.04em' }}>TYPOGRAPHY, DPI & INK SAVER</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {/* Font Family */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>FONT FAMILY</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                        {(['sans', 'serif', 'mono'] as const).map(ff => (
                          <button
                            key={ff}
                            type="button"
                            onClick={() => updateConfig({ fontFamily: ff, preset: 'custom' })}
                            style={{
                              padding: '8px 4px',
                              borderRadius: '8px',
                              border: printConfig.fontFamily === ff ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                              background: printConfig.fontFamily === ff ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                              color: printConfig.fontFamily === ff ? 'var(--accent-cyan)' : 'var(--text-primary)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              cursor: 'pointer'
                            }}
                          >
                            {ff === 'sans' ? 'Inter' : ff === 'serif' ? 'Times' : 'Mono'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Scale */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>FONT SCALE</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                        {[
                          { id: 'compact', label: '9pt' },
                          { id: 'standard', label: '11pt' },
                          { id: 'large', label: '13pt' }
                        ].map(fs => (
                          <button
                            key={fs.id}
                            type="button"
                            onClick={() => updateConfig({ fontSize: fs.id as any, preset: 'custom' })}
                            style={{
                              padding: '8px 4px',
                              borderRadius: '8px',
                              border: printConfig.fontSize === fs.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                              background: printConfig.fontSize === fs.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                              color: printConfig.fontSize === fs.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
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

                {/* 4. Document Headers & Content Filters */}
                <div style={{ padding: '18px 20px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sliders size={18} className="text-cyan-400" />
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

                  {/* Watermark Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>WATERMARK TEXT (OPTIONAL)</label>
                    <input
                      type="text"
                      value={printConfig.watermarkText}
                      onChange={(e) => updateConfig({ watermarkText: e.target.value, preset: 'custom' })}
                      placeholder="e.g. OU DRAFT, CONFIDENTIAL, ROLL NO: 1005-22-XXX"
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                      <Eye size={16} className="text-cyan-400" />
                      <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700 }}>LIVE A4 PAPER PREVIEW</h4>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {printConfig.paperSize} | {printConfig.orientation}
                    </span>
                  </div>

                  {/* Simulated Paper Sheet */}
                  <div style={{
                    width: '100%',
                    maxWidth: printConfig.orientation === 'landscape' ? '400px' : '320px',
                    aspectRatio: printConfig.orientation === 'landscape' ? '1.414 / 1' : '1 / 1.414',
                    background: '#ffffff',
                    color: '#0f172a',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                    borderRadius: '4px',
                    padding: printConfig.marginPreset === 'standard' ? '16px' : printConfig.marginPreset === 'compact' ? '8px' : '4px',
                    boxSizing: 'border-box',
                    fontFamily: printConfig.fontFamily === 'serif' ? 'Times New Roman, serif' : printConfig.fontFamily === 'mono' ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
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
                        transform: 'translate(-50%, -50%) rotate(-35deg)',
                        fontSize: '1.2rem',
                        fontWeight: 900,
                        color: 'rgba(203, 213, 225, 0.4)',
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
                          borderBottom: printConfig.inkMode === 'eco' ? '1px solid #cbd5e1' : '2px solid #0284c7',
                          paddingBottom: '4px',
                          marginBottom: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{ fontWeight: 800, fontSize: '0.8rem', color: printConfig.inkMode === 'eco' ? '#0f172a' : '#0284c7' }}>
                            {printConfig.customTitle || 'Prof. Joe AI Document'}
                          </div>
                          {printConfig.showDateTag && (
                            <div style={{ fontSize: '0.55rem', color: '#64748b' }}>
                              {new Date().toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
                        1. Neyman-Pearson Lemma
                      </div>
                      <p style={{ margin: '0 0 6px 0', fontSize: '0.65rem', color: '#475569' }}>
                        Testing simple $H_0: \theta = \theta_0$ vs $H_1: \theta = \theta_1$ with most powerful critical region:
                      </p>
                      
                      <div style={{
                        textAlign: 'center',
                        padding: '4px',
                        fontWeight: 600,
                        background: printConfig.inkMode === 'eco' ? '#ffffff' : 'rgba(2, 132, 199, 0.05)',
                        borderRadius: '4px',
                        border: printConfig.inkMode === 'eco' ? '1px dashed #cbd5e1' : 'none'
                      }}>
                        {"Λ(X) = L(θ₁; X) / L(θ₀; X) ≥ k"}
                      </div>

                      {!printConfig.hideDividers && (
                        <div style={{ borderBottom: '1px solid #e2e8f0', margin: '4px 0' }} />
                      )}

                      {printConfig.includeCode && (
                        <div style={{
                          background: printConfig.inkMode === 'eco' ? '#ffffff' : '#f8fafc',
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

          {/* TAB 2: 🔑 API CREDENTIALS */}
          {activeTab === 'keys' && (
            <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
                      <Key size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>API Key Credentials</h3>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Configure API keys for 14 cloud providers and local inference endpoints
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleExportJson}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.78rem',
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
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Upload size={14} />
                      <span>Import JSON</span>
                    </button>
                  </div>
                </div>

                {saveFeedback && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check size={16} />
                    <span>{saveFeedback}</span>
                  </div>
                )}

                <form onSubmit={handleSaveApiKeys} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {providerFields.map(item => {
                    const isVisible = visibleFields[item.id];
                    return (
                      <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>{item.label}</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type={isVisible ? 'text' : 'password'}
                            value={(savedKeysState as any)[item.id] || ''}
                            onChange={(e) => setSavedKeysState({ ...savedKeysState, [item.id]: e.target.value })}
                            placeholder={item.placeholder}
                            style={{
                              width: '100%',
                              padding: '10px 42px 10px 14px',
                              borderRadius: '8px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-primary)',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem',
                              outline: 'none'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => toggleVisibility(item.id)}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title={isVisible ? 'Hide value' : 'Show value'}
                          >
                            {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="submit"
                    style={{
                      marginTop: '10px',
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'var(--accent-cyan)',
                      color: '#000',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Check size={18} />
                    <span>Save API Key Credentials</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: 🤖 MODEL MANAGER */}
          {activeTab === 'models' && (
            <div style={{ maxWidth: '960px', margin: '0 auto' }}>
              <ModelManagerTab
                userKeys={userKeys}
                customModels={customModels}
                onSaveCustomModels={onSaveCustomModels}
                activeProvider={activeProvider}
                activeModel={activeModel}
                onSelectActiveModel={onSelectActiveModel}
              />
            </div>
          )}

          {/* TAB 4: 👤 USER PROFILE */}
          {activeTab === 'account' && (
            <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--accent-cyan)' }}>
                    <img src="/joe-avatar.png" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{currentUser}</h3>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                      {userRole?.toUpperCase() || 'OU STUDENT'}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>● Active & Connected</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Exam Curriculum</span>
                    <span>Osmania University MSc Data Science</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <span>Log Out of Session</span>
              </button>
            </div>
          )}

          {/* TAB 5: 🎨 APPEARANCE & THEME */}
          {activeTab === 'theme' && (
            <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Appearance & Theme Preferences</h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Customize the interface theme, color schemes, and visual contrast.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => theme !== 'dark' && onToggleTheme()}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: theme === 'dark' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                      background: '#090d16',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Moon size={24} className="text-indigo-400" />
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Dark Theme (Default)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => theme !== 'light' && onToggleTheme()}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: theme === 'light' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                      background: '#f8fafc',
                      color: '#0f172a',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Sun size={24} className="text-amber-500" />
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Light Theme</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: 💾 DATA & STORAGE */}
          {activeTab === 'data' && (
            <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Data & Local Storage</h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Manage chat sessions, cached offline data, and local storage limits.
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
