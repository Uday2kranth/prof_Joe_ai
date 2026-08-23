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
        theme={activeConfig.theme || 'vs-dark'}
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

