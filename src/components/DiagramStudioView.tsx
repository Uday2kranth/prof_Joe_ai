import React, { useState, useEffect } from 'react';
import { Layers, Download, RefreshCw, Code2, Sparkles } from 'lucide-react';
import { fetchKrokiSvg } from '../services/krokiService';

interface DiagramTemplate {
  id: string;
  name: string;
  engine: string;
  code: string;
}

const TEMPLATES: DiagramTemplate[] = [
  {
    id: 'mermaid-flowchart',
    name: 'Mermaid.js Flowchart',
    engine: 'mermaid',
    code: `graph TD
  A[Client Web App] -->|HTTP POST| B[Vercel Serverless API]
  B -->|Query| C[Ollama Cloud / Gemini API]
  B -->|Render SVG| D[Kroki Diagram Engine]
  C --> B
  D --> B
  B -->|JSON Response| A`
  },
  {
    id: 'mermaid-erd',
    name: 'Mermaid.js Entity Relationship (ERD)',
    engine: 'mermaid',
    code: `erDiagram
    USERS ||--o{ CHAT_SESSIONS : "owns"
    USERS {
        int id PK
        string username
        string role
    }
    CHAT_SESSIONS ||--o{ MESSAGES : "contains"
    CHAT_SESSIONS {
        string id PK
        int user_id FK
        string title
        datetime created_at
    }
    MESSAGES {
        string id PK
        string session_id FK
        string sender
        text content
        datetime timestamp
    }`
  },
  {
    id: 'mermaid-sequence',
    name: 'Mermaid.js Sequence Diagram',
    engine: 'mermaid',
    code: `sequenceDiagram
    autonumber
    actor User
    participant App as React Frontend
    participant API as Vercel API Gateway
    participant LLM as Gemini / Ollama Model
    participant Kroki as Kroki SVG Engine

    User->>App: Submits Prompt Request
    App->>API: POST /api/chat {prompt, model}
    API->>LLM: Stream Inference Request
    LLM-->>API: Streams Tokens / Code
    API-->>App: Sends Completed Response
    App->>Kroki: Render Code to SVG
    Kroki-->>App: Returns Vector SVG
    App-->>User: Displays Output`
  },
  {
    id: 'mermaid-class',
    name: 'Mermaid.js Class Diagram',
    engine: 'mermaid',
    code: `classDiagram
    class User {
        +String username
        +String role
        +login()
        +logout()
    }
    class ChatSession {
        +String id
        +String title
        +List~Message~ messages
        +addMessage()
    }
    class Message {
        +String sender
        +String content
        +Date timestamp
    }
    User "1" -- "*" ChatSession : manages
    ChatSession "1" -- "*" Message : holds`
  },
  {
    id: 'mermaid-state',
    name: 'Mermaid.js State Diagram',
    engine: 'mermaid',
    code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Typing : User enters prompt
    Typing --> Generating : Click Send / Enter
    Generating --> StreamingTokens : API Connected
    StreamingTokens --> Rendered : Stream Completed
    Rendered --> Idle : Clear / New Chat
    Generating --> ErrorState : Provider Timeout
    ErrorState --> Idle : Retry`
  },
  {
    id: 'mermaid-gantt',
    name: 'Mermaid.js Gantt Roadmap',
    engine: 'mermaid',
    code: `gantt
    title Osmania University Final Exam Roadmap 2026
    dateFormat  YYYY-MM-DD
    section Cryptography
    DES & AES Ciphers          :active, 2026-08-01, 5d
    Public Key & RSA           : 2026-08-06, 5d
    section Data Mining
    Association Rules & Apriori: 2026-08-11, 4d
    Clustering & DBSCAN        : 2026-08-15, 5d`
  },
  {
    id: 'mermaid-pie',
    name: 'Mermaid.js Pie Chart',
    engine: 'mermaid',
    code: `pie title OU Exam Paper Weightage Distribution
    "12-Mark Essay Questions" : 60
    "2-Mark Short Answers" : 20
    "Internal Assessment" : 20`
  },
  {
    id: 'graphviz',
    name: 'Graphviz Directed Graph (DOT)',
    engine: 'graphviz',
    code: `digraph G {
  rankdir=LR;
  node [shape=box, style=filled, fillcolor="#0284c7", fontcolor="#ffffff", color="#06b6d4", fontname="Inter"];
  OSI_Security -> Security_Services;
  OSI_Security -> Security_Mechanisms;
  OSI_Security -> Security_Attacks;
}`
  },
  {
    id: 'plantuml-mindmap',
    name: 'PlantUML Mindmap',
    engine: 'plantuml',
    code: `@startmindmap
* Data Visualization & Mining
** Pixel-Oriented
*** Heatmap
*** Icon Tile Map
** Hierarchical
*** Tree Map
*** Dendrogram
@endmindmap`
  },
  {
    id: 'plantuml-component',
    name: 'PlantUML Component Diagram',
    engine: 'plantuml',
    code: `@startuml
package "Prof. Joe AI Platform" {
  [React Frontend] ..> [Vercel API Routes] : HTTP / REST
  [Vercel API Routes] ..> [Kroki Engine] : HTTP POST
  [Vercel API Routes] ..> [Gemini AI Service] : gRPC / REST
}
@enduml`
  },
  {
    id: 'erd',
    name: 'Kroki ERD Syntax',
    engine: 'erd',
    code: `[Users]
  *id {label: "int"}
  name
  email

[Sessions]
  *id {label: "int"}
  +user_id {label: "int"}
  created_at

Users 1--* Sessions`
  },
  {
    id: 'blockdiag',
    name: 'BlockDiag System Architecture',
    engine: 'blockdiag',
    code: `blockdiag {
  Web_Browser -> Load_Balancer -> Web_Server;
  Web_Server -> Database;
}`
  },
  {
    id: 'wavedrom',
    name: 'WaveDrom Digital Timing Waveform',
    engine: 'wavedrom',
    code: `{signal: [
  {name: "clk", wave: "p......"},
  {name: "bus", wave: "x.==.x.", data: ["head", "body", "tail"]},
  {name: "wire", wave: "0.1..0."}
]}`
  }
];

export const DiagramStudioView: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<DiagramTemplate>(TEMPLATES[0]);
  const [diagramSource, setDiagramSource] = useState<string>(TEMPLATES[0].code);
  const [renderedSvg, setRenderedSvg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDiagramMenuOpen, setIsDiagramMenuOpen] = useState<boolean>(false);
  const diagramMenuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (diagramMenuRef.current && !diagramMenuRef.current.contains(e.target as Node)) {
        setIsDiagramMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRender = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const svg = await fetchKrokiSvg(selectedTemplate.engine, diagramSource);
      setRenderedSvg(svg);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to render diagram on Kroki server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleRender();
  }, [selectedTemplate.id]);

  const handleDownloadSvg = () => {
    if (!renderedSvg) return;
    const blob = new Blob([renderedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagram-${selectedTemplate.id}-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="diagram-studio-container p-4">
      <div className="studio-header flex flex-wrap items-center justify-between gap-4 mb-6" style={{ overflow: 'visible', zIndex: 100 }}>
        <div className="studio-title-area flex items-center gap-3">
          <Layers className="text-cyan-400" size={26} />
          <div>
            <h2 className="text-xl font-bold text-slate-100">Kroki Diagram Studio Engine</h2>
            <p className="subtitle text-xs text-slate-400">Live interactive visual diagram builder & vector SVG exporter</p>
          </div>
        </div>

        <div className="studio-controls flex items-center gap-3 relative" style={{ overflow: 'visible', zIndex: 100 }}>
          {/* Custom Glass Diagram Dropdown */}
          <div className="relative inline-block" style={{ position: 'relative' }} ref={diagramMenuRef}>
            <button
              type="button"
              onClick={() => setIsDiagramMenuOpen(!isDiagramMenuOpen)}
              className="custom-dropdown-pill"
              title="Select Diagram Engine & Type"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <span className="picker-icon">📐</span>
              <span className="font-semibold text-slate-100">{selectedTemplate.name}</span>
              <span className="text-slate-400 text-xs">▾</span>
            </button>

            {isDiagramMenuOpen && (
              <div className="custom-dropdown-menu diagram-menu" style={{ minWidth: '340px', width: '340px', maxHeight: '360px', overflowY: 'auto' }}>
                <div className="dropdown-header">Diagram Types</div>
                {TEMPLATES.map(t => {
                  const isSelected = t.id === selectedTemplate.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(t);
                        setDiagramSource(t.code);
                        setIsDiagramMenuOpen(false);
                      }}
                      className={`dropdown-item flex items-center justify-between gap-3 w-full ${isSelected ? 'selected' : ''}`}
                    >
                      <span className="text-xs text-cyan-400 font-mono flex-shrink-0">[{t.engine}]</span>
                      <span className="text-right truncate">{t.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={handleRender}
            disabled={isLoading}
            className="kroki-render-btn"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Rendering...' : 'Render Diagram'}</span>
          </button>
        </div>
      </div>

      <div className="studio-content-grid grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Editor Box */}
        <div className="editor-box card-box" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="editor-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={16} className="text-cyan-400" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                Source Code ({selectedTemplate.engine.toUpperCase()})
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Edit Mermaid / PlantUML code below
            </span>
          </div>

          <textarea
            value={diagramSource}
            onChange={(e) => setDiagramSource(e.target.value)}
            rows={20}
            className="code-editor-textarea"
            style={{
              width: '100%',
              minHeight: '380px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.84rem',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Preview Box */}
        <div className="preview-box card-box" style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '440px' }}>
          <div className="preview-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} className="text-amber-400" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Live Vector SVG Preview</span>
            </div>

            {renderedSvg && (
              <button
                onClick={handleDownloadSvg}
                className="kroki-export-btn"
              >
                <Download size={14} />
                <span>Export SVG</span>
              </button>
            )}
          </div>

          <div
            className="svg-display-area"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px',
              overflow: 'auto',
              minHeight: '360px'
            }}
          >
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                <RefreshCw size={28} className="animate-spin text-cyan-400" />
                <span>Rendering vector SVG from Kroki Engine...</span>
              </div>
            ) : errorMsg ? (
              <div style={{ color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.3)', textAlign: 'center' }}>
                <p style={{ fontWeight: 700, margin: '0 0 6px' }}>⚠️ Kroki Server Render Error</p>
                <p style={{ fontSize: '0.8rem', margin: 0 }}>{errorMsg}</p>
              </div>
            ) : renderedSvg ? (
              <div
                style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                dangerouslySetInnerHTML={{ __html: renderedSvg }}
              />
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Click "Render Diagram" to preview vector diagram</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
