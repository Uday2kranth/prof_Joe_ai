import React, { Suspense, lazy, useState, useEffect } from 'react';
import type { IdeConfig } from '../types';
import { DEFAULT_IDE_CONFIG } from '../types';

const Editor = lazy(() => import('@monaco-editor/react'));

interface MonacoEditorWrapperProps {
  code: string;
  language: string;
  onChange?: (val: string | undefined) => void;
  ideConfig?: IdeConfig;
}

const defineCustomThemes = (monaco: any) => {
  try {
    monaco.editor.defineTheme('onedark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c678dd' },
        { token: 'string', foreground: '98c379' },
        { token: 'number', foreground: 'd19a66' },
        { token: 'type', foreground: 'e5c07b' },
        { token: 'function', foreground: '61afef' }
      ],
      colors: {
        'editor.background': '#282c34',
        'editor.foreground': '#abb2bf',
        'editorLineNumber.foreground': '#4b5263',
        'editorLineNumber.activeForeground': '#61afef',
        'editorCursor.foreground': '#528bff'
      }
    });

    monaco.editor.defineTheme('monokai', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'f92672' },
        { token: 'string', foreground: 'e6db74' },
        { token: 'number', foreground: 'ae81ff' },
        { token: 'type', foreground: '66d9ef' },
        { token: 'function', foreground: 'a6e22e' }
      ],
      colors: {
        'editor.background': '#272822',
        'editor.foreground': '#f8f8f2',
        'editorLineNumber.foreground': '#90908a',
        'editorCursor.foreground': '#f8f8f0'
      }
    });

    monaco.editor.defineTheme('tokyo_night', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '565f89', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'bb9af7' },
        { token: 'string', foreground: '9ece6a' },
        { token: 'number', foreground: 'ff9e64' },
        { token: 'type', foreground: '2ac3de' },
        { token: 'function', foreground: '7aa2f7' }
      ],
      colors: {
        'editor.background': '#1a1b26',
        'editor.foreground': '#c0caf5',
        'editorLineNumber.foreground': '#3b4261',
        'editorCursor.foreground': '#c0caf5'
      }
    });

    monaco.editor.defineTheme('neon', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '059669', fontStyle: 'italic' },
        { token: 'keyword', foreground: '06b6d4' },
        { token: 'string', foreground: '10b981' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'type', foreground: '8b5cf6' },
        { token: 'function', foreground: '38bdf8' }
      ],
      colors: {
        'editor.background': '#0b0f19',
        'editor.foreground': '#e2e8f0',
        'editorLineNumber.foreground': '#1e293b',
        'editorLineNumber.activeForeground': '#06b6d4',
        'editorCursor.foreground': '#06b6d4'
      }
    });

    monaco.editor.defineTheme('github_light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6e7781', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'cf222e' },
        { token: 'string', foreground: '0a3069' },
        { token: 'number', foreground: '0550ae' },
        { token: 'type', foreground: '953800' },
        { token: 'function', foreground: '8250df' }
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#24292f',
        'editorLineNumber.foreground': '#8c959f',
        'editorLineNumber.activeForeground': '#24292f',
        'editorCursor.foreground': '#0969da'
      }
    });
  } catch {}
};

const mapTheme = (t?: string) => {
  if (!t) return 'onedark';
  if (t === 'vs-dark' || t === 'vscode_dark') return 'vs-dark';
  if (t === 'vs-light' || t === 'vs' || t === 'light') return 'vs';
  if (t === 'hc-black' || t === 'hc_black') return 'hc-black';
  return t; // 'onedark' | 'monokai' | 'tokyo_night' | 'github_light' | 'neon'
};

export const MonacoEditorWrapper: React.FC<MonacoEditorWrapperProps> = ({ 
  code, 
  language, 
  onChange,
  ideConfig: propIdeConfig
}) => {
  const [internalIdeConfig, setInternalIdeConfig] = useState<IdeConfig>(() => {
    try {
      const saved = localStorage.getItem('chatterbot_ide_settings');
      if (saved) return { ...DEFAULT_IDE_CONFIG, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_IDE_CONFIG;
  });

  useEffect(() => {
    const handleIdeUpdate = () => {
      try {
        const saved = localStorage.getItem('chatterbot_ide_settings');
        if (saved) setInternalIdeConfig({ ...DEFAULT_IDE_CONFIG, ...JSON.parse(saved) });
      } catch {}
    };
    window.addEventListener('chatterbot_ide_settings_updated', handleIdeUpdate);
    window.addEventListener('storage', handleIdeUpdate);
    return () => {
      window.removeEventListener('chatterbot_ide_settings_updated', handleIdeUpdate);
      window.removeEventListener('storage', handleIdeUpdate);
    };
  }, []);

  const activeConfig = propIdeConfig || internalIdeConfig;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

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
    return langMap[l.toLowerCase()] || 'plaintext';
  };

  return (
    <Suspense fallback={<div style={{ padding: '20px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.84rem' }}>⚡ Loading Interactive Monaco Editor...</div>}>
      <Editor
        height="100%"
        language={mapLang(language)}
        value={code}
        beforeMount={defineCustomThemes}
        theme={mapTheme(activeConfig.theme)}
        onChange={onChange}
        options={{
          automaticLayout: true,
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
  );
};


