import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import type { IdeConfig } from '../types';
import { DEFAULT_IDE_CONFIG } from '../types';

const Editor = lazy(() => import('@monaco-editor/react'));

interface MonacoEditorWrapperProps {
  code: string;
  language: string;
  onChange?: (val: string | undefined) => void;
  ideConfig?: IdeConfig;
}

export const MonacoEditorWrapper: React.FC<MonacoEditorWrapperProps> = ({ 
  code, 
  language, 
  onChange,
  ideConfig: propIdeConfig
}) => {
  const editorRef = useRef<any>(null);

  // Read the active global app theme directly from document and localStorage
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      const attr = document.documentElement.getAttribute('data-theme');
      if (attr === 'light') return true;
      if (attr === 'dark') return false;
    }
    try {
      const saved = localStorage.getItem('chatterbot_theme') || localStorage.getItem('theme');
      if (saved === 'light') return true;
    } catch {}
    return false;
  });

  const [internalIdeConfig, setInternalIdeConfig] = useState<IdeConfig>(() => {
    try {
      const savedIde = localStorage.getItem('chatterbot_ide_settings');
      let base = DEFAULT_IDE_CONFIG;
      if (savedIde) base = { ...base, ...JSON.parse(savedIde) };
      return base;
    } catch {}
    return DEFAULT_IDE_CONFIG;
  });

  useEffect(() => {
    const handleThemeSync = () => {
      let light = false;
      if (typeof document !== 'undefined') {
        const attr = document.documentElement.getAttribute('data-theme');
        if (attr === 'light') light = true;
      }
      try {
        const saved = localStorage.getItem('chatterbot_theme') || localStorage.getItem('theme');
        if (saved === 'light') light = true;
      } catch {}
      setIsLightMode(light);

      // Instantly update active Monaco instance if mounted
      if (editorRef.current && (window as any).monaco) {
        try {
          (window as any).monaco.editor.setTheme(light ? 'vs' : 'vs-dark');
        } catch {}
      }
    };

    const handleIdeUpdate = () => {
      try {
        const savedIde = localStorage.getItem('chatterbot_ide_settings');
        let base = DEFAULT_IDE_CONFIG;
        if (savedIde) base = { ...base, ...JSON.parse(savedIde) };
        setInternalIdeConfig(base);
      } catch {}
    };

    window.addEventListener('chatterbot_theme_updated', handleThemeSync);
    window.addEventListener('chatterbot_ide_settings_updated', handleIdeUpdate);
    window.addEventListener('storage', handleThemeSync);
    window.addEventListener('storage', handleIdeUpdate);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'data-theme') {
          handleThemeSync();
        }
      }
    });

    if (typeof document !== 'undefined' && document.documentElement) {
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    return () => {
      window.removeEventListener('chatterbot_theme_updated', handleThemeSync);
      window.removeEventListener('chatterbot_ide_settings_updated', handleIdeUpdate);
      window.removeEventListener('storage', handleThemeSync);
      window.removeEventListener('storage', handleIdeUpdate);
      observer.disconnect();
    };
  }, []);

  const activeConfig = propIdeConfig || internalIdeConfig;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Native built-in Monaco themes (100% immune to missing custom themes or white flashes in Dark mode)
  const targetTheme = isLightMode ? 'vs' : 'vs-dark';
  const containerBg = isLightMode ? '#ffffff' : '#1e1e1e';

  const mapLang = (l: string) => {
    const langMap: Record<string, string> = {
      python: 'python',
      javascript: 'javascript',
      typescript: 'typescript',
      html: 'html',
      css: 'css',
      cpp: 'cpp',
      c: 'c',
      java: 'java',
      sql: 'sql',
      json: 'json'
    };
    return langMap[(l || '').toLowerCase()] || 'plaintext';
  };

  return (
    <div style={{ width: '100%', height: '100%', background: containerBg, overflow: 'hidden' }}>
      <Suspense fallback={
        <div style={{ padding: '20px', color: isLightMode ? '#0284c7' : '#38bdf8', fontFamily: 'monospace', fontSize: '0.84rem' }}>
          ⚡ Loading Monaco Editor...
        </div>
      }>
        <Editor
          height="100%"
          language={mapLang(language)}
          value={code}
          theme={targetTheme}
          onMount={(editor, monaco) => {
            editorRef.current = editor;
            (window as any).monaco = monaco;
            monaco.editor.setTheme(targetTheme);
            editor.updateOptions({ theme: targetTheme });
          }}
          onChange={onChange}
          options={{
            automaticLayout: true,
            theme: targetTheme,
            minimap: { enabled: isMobile ? false : activeConfig.minimap },
            fontSize: activeConfig.fontSize || 13,
            tabSize: activeConfig.tabSize || 2,
            wordWrap: activeConfig.wordWrap || 'on',
            lineNumbers: activeConfig.lineNumbers || 'on',
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 }
          }}
        />
      </Suspense>
    </div>
  );
};
