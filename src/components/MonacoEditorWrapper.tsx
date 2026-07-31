import React, { Suspense, lazy } from 'react';

const Editor = lazy(() => import('@monaco-editor/react'));

interface MonacoEditorWrapperProps {
  code: string;
  language: string;
  onChange?: (val: string | undefined) => void;
}

export const MonacoEditorWrapper: React.FC<MonacoEditorWrapperProps> = ({ code, language, onChange }) => {
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
        theme="vs-dark"
        onChange={onChange}
        options={{
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 12 }
        }}
      />
    </Suspense>
  );
};
