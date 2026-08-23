import React, { useState, useRef } from 'react';
import { 
  FileCode, 
  Upload, 
  Copy, 
  Download, 
  Send, 
  Check, 
  Sparkles, 
  Cpu,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { extractFileContent, type ExtractedResult } from '../services/unifiedExtractorService';

interface DocumentExtractorStudioViewProps {
  onBackToHub?: () => void;
  onSendToChat: (extractedText: string, fileName: string) => void;
}

export function DocumentExtractorStudioView({ onSendToChat }: DocumentExtractorStudioViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [parsedDoc, setParsedDoc] = useState<ExtractedResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileParsing = async (file: File) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setParsedDoc(null);
    setProcessingStatus(`Parsing ${file.name}...`);
    try {
      const result = await extractFileContent(file);
      setParsedDoc(result);
    } catch (err: any) {
      console.error('File extraction error:', err);
      setErrorMsg(`Failed to extract "${file.name}": ${err?.message || 'Unknown error occurred'}`);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileParsing(e.dataTransfer.files[0]);
    }
  };

  const handleCopyText = () => {
    if (!parsedDoc) return;
    navigator.clipboard.writeText(parsedDoc.extractedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!parsedDoc) return;
    const blob = new Blob([parsedDoc.extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Extracted_${parsedDoc.fileName.replace(/\.[^/.]+$/, '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="extractor-studio-view-container">
      {/* Header Bar */}
      <div className="extractor-header-bar">
        <div className="extractor-brand-title">
          <div className="extractor-brand-icon">
            <Cpu size={22} />
          </div>
          <div>
            <h1 className="extractor-title-text">
              <span>Textractor ⚡</span>
              <span className="extractor-studio-tag">STANDALONE STUDIO</span>
            </h1>
            <p className="extractor-subtitle">Client-Side Text Extraction & Parsing Engine (PDF, DOCX, IPYNB, Code & Images)</p>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="extractor-grid-layout">
        {/* Upload Zone Panel */}
        <div className="extractor-upload-panel">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="extractor-dropzone"
            style={{
              borderColor: isDragging ? '#06b6d4' : undefined,
              background: isDragging ? 'rgba(6, 182, 212, 0.15)' : undefined
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && e.target.files[0] && handleFileParsing(e.target.files[0])}
              className="hidden"
              style={{ display: 'none' }}
            />

            <div className="extractor-drop-icon">
              <Upload size={26} />
            </div>

            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
              Drag & Drop Study Material or Browse
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              100% Client-Side In-Browser Extraction
            </p>

            <div className="extractor-formats-pill-row">
              <span className="extractor-format-chip">PDF</span>
              <span className="extractor-format-chip">DOCX</span>
              <span className="extractor-format-chip">IPYNB</span>
              <span className="extractor-format-chip">JS / TS</span>
              <span className="extractor-format-chip">PYTHON</span>
              <span className="extractor-format-chip">TXT / MD</span>
            </div>
          </div>

          {/* Status Indicator */}
          {isProcessing && (
            <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.4)', color: '#67e8f9', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} />
              <span>{processingStatus}</span>
            </div>
          )}

          {/* Error Display */}
          {errorMsg && !isProcessing && (
            <div className="extractor-error-card" style={{ padding: '14px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#f43f5e', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.85rem' }}>⚠️ Extraction Error</p>
                <p style={{ margin: 0, fontWeight: 500, opacity: 0.9 }}>{errorMsg}</p>
              </div>
            </div>
          )}
        </div>

        {/* Viewer Panel */}
        <div className="extractor-viewer-panel">
          {parsedDoc ? (
            <>
              {/* Stats Bar */}
              <div className="extractor-stats-bar">
                <div className="extractor-file-info">
                  <FileCode size={18} style={{ color: '#f43f5e' }} />
                  <span className="extractor-file-name">{parsedDoc.fileName}</span>
                  <span className="extractor-format-chip">{parsedDoc.formatType}</span>
                </div>

                <div className="extractor-stats-group">
                  <span className="extractor-stat-item">Size:<strong>{parsedDoc.fileSizeKb} KB</strong></span>
                  <span className="extractor-stat-item">Words:<strong>{parsedDoc.wordCount.toLocaleString()}</strong></span>
                  <span className="extractor-stat-item">Chars:<strong>{parsedDoc.charCount.toLocaleString()}</strong></span>
                </div>
              </div>

              {/* Code Box */}
              <pre className="extractor-code-box">
                {parsedDoc.extractedText}
              </pre>

              {/* Action Bar */}
              <div className="extractor-action-bar">
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={handleCopyText} className="btn-theme-secondary" style={{ padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    {isCopied ? <Check size={14} style={{ color: 'var(--accent-cyan)' }} /> : <Copy size={14} />}
                    <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Extracted Text'}</span>
                  </button>

                  <button type="button" onClick={handleDownloadTxt} className="btn-theme-secondary" style={{ padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={14} />
                    <span>Download TXT</span>
                  </button>
                </div>

                <button 
                  type="button" 
                  onClick={() => onSendToChat(parsedDoc.extractedText, parsedDoc.fileName)} 
                  className="btn-theme-primary"
                  style={{ padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={15} />
                  <span>Send Extracted Text to Prof. Joe Chat</span>
                </button>
              </div>
            </>
          ) : errorMsg ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', textAlign: 'center' }}>
              <AlertTriangle size={48} style={{ marginBottom: '16px', color: '#f43f5e', opacity: 0.7 }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f43f5e', marginBottom: '6px' }}>Extraction Failed</h3>
              <p style={{ fontSize: '0.82rem', maxWidth: '420px', margin: '0 0 12px', color: '#94a3b8' }}>
                {errorMsg}
              </p>
              <p style={{ fontSize: '0.75rem', maxWidth: '360px', margin: 0, color: '#64748b' }}>
                Try uploading a different file or check the console for detailed error logs.
              </p>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', color: '#64748b', textAlign: 'center' }}>
              <FileText size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>No File Loaded Yet</h3>
              <p style={{ fontSize: '0.82rem', maxWidth: '360px', margin: 0 }}>
                Upload a PDF, Word document, Jupyter notebook, or code file on the left to extract and inspect its text layers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
