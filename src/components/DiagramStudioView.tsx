import React, { useState, useEffect } from 'react';
import { Layers, Download, RefreshCw, Code2, Sparkles } from 'lucide-react';
import { fetchKrokiSvg } from '../services/krokiService';

const SAMPLE_DIAGRAMS: Record<string, string> = {
  mermaid: `graph TD
  A[Client Web App] -->|HTTP POST| B[Vercel Serverless API]
  B -->|Query| C[Ollama Cloud / Gemini API]
  B -->|Render SVG| D[Kroki Diagram Engine]
  C --> B
  D --> B
  B -->|JSON Response| A`,
  graphviz: `digraph G {
  rankdir=LR;
  node [shape=box, style=filled, fillcolor="#e0f2fe", color="#0284c7", fontname="Inter"];
  OSI_Security -> Security_Services;
  OSI_Security -> Security_Mechanisms;
  OSI_Security -> Security_Attacks;
}`,
  plantuml: `@startmindmap
* Data Visualization
** Pixel-Oriented
*** Heatmap
*** Icon Tile Map
** Hierarchical
*** Tree Map
*** Dendrogram
@endmindmap`,
  erd: `[Users]
  *id {GERUND}
  name
  email

[Sessions]
  *id {GERUND}
  +user_id
  created_at

Users 1--* Sessions`
};

export const DiagramStudioView: React.FC = () => {
  const [engineType, setEngineType] = useState<string>('mermaid');
  const [diagramSource, setDiagramSource] = useState<string>(SAMPLE_DIAGRAMS.mermaid);
  const [renderedSvg, setRenderedSvg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRender = async () => {
    setIsLoading(true);
    try {
      const svg = await fetchKrokiSvg(engineType, diagramSource);
      setRenderedSvg(svg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleRender();
  }, [engineType]);

  const handleDownloadSvg = () => {
    if (!renderedSvg) return;
    const blob = new Blob([renderedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagram-${engineType}-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="diagram-studio-container">
      <div className="studio-header">
        <div className="studio-title-area">
          <Layers className="text-cyan-400" size={24} />
          <div>
            <h2>Kroki Diagram Studio Engine</h2>
            <p className="subtitle">Live interactive visual diagram builder & vector SVG exporter</p>
          </div>
        </div>

        <div className="studio-controls">
          <select
            value={engineType}
            onChange={(e) => {
              const newEngine = e.target.value;
              setEngineType(newEngine);
              if (SAMPLE_DIAGRAMS[newEngine]) {
                setDiagramSource(SAMPLE_DIAGRAMS[newEngine]);
              }
            }}
            className="select-input engine-select"
          >
            <option value="mermaid">Mermaid.js Flowchart</option>
            <option value="graphviz">Graphviz Directed Graph</option>
            <option value="plantuml">PlantUML Mindmap</option>
            <option value="erd">Entity Relationship (ERD)</option>
          </select>

          <button onClick={handleRender} disabled={isLoading} className="btn btn-primary">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Render Diagram</span>
          </button>
        </div>
      </div>

      <div className="studio-workspace">
        <div className="editor-pane card-box">
          <div className="pane-header">
            <Code2 size={16} className="text-cyan-400" />
            <span>Diagram Source Code ({engineType.toUpperCase()})</span>
          </div>
          <textarea
            value={diagramSource}
            onChange={(e) => setDiagramSource(e.target.value)}
            className="source-textarea"
            placeholder="Enter raw diagram code..."
          />
        </div>

        <div className="preview-pane card-box">
          <div className="pane-header">
            <Sparkles size={16} className="text-cyan-400" />
            <span>Live Vector SVG Preview</span>
            {renderedSvg && (
              <button onClick={handleDownloadSvg} className="btn btn-secondary btn-sm" title="Download Vector SVG">
                <Download size={14} />
                <span>Export SVG</span>
              </button>
            )}
          </div>

          <div className="svg-preview-area">
            {isLoading ? (
              <div className="studio-loading">Rendering Kroki SVG...</div>
            ) : (
              <div
                className="kroki-container"
                dangerouslySetInnerHTML={{ __html: renderedSvg }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
