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
  ArrowLeft,
  FileText
} from 'lucide-react';
import { extractFileContent, type ExtractedResult } from '../services/unifiedExtractorService';

interface DocumentExtractorStudioViewProps {
  onBackToHub: () => void;
  onSendToChat: (extractedText: string, fileName: string) => void;
}

export function DocumentExtractorStudioView({ onBackToHub, onSendToChat }: DocumentExtractorStudioViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [parsedDoc, setParsedDoc] = useState<ExtractedResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileParsing = async (file: File) => {
    setIsProcessing(true);
    setProcessingStatus(`Parsing ${file.name}...`);
    try {
      const result = await extractFileContent(file);
      setParsedDoc(result);
    } catch (err) {
      console.error('File extraction error:', err);
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
          <button 
            onClick={onBackToHub} 
            className="extractor-btn-secondary"
            title="Return to Home Hub"
          >
            <ArrowLeft size={16} />
            <span>Home Hub</span>
          </button>
          <div className="extractor-brand-icon">
            <Cpu size={22} />
          </div>
          <div>
            <h1 className="extractor-title-text">
              <span>Document & Code Text Extractor Studio</span>
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
                  <button type="button" onClick={handleCopyText} className="extractor-btn-secondary">
                    {isCopied ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
                    <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Extracted Text'}</span>
                  </button>

                  <button type="button" onClick={handleDownloadTxt} className="extractor-btn-secondary">
                    <Download size={14} />
                    <span>Download TXT</span>
                  </button>
                </div>

                <button 
                  type="button" 
                  onClick={() => onSendToChat(parsedDoc.extractedText, parsedDoc.fileName)} 
                  className="extractor-btn-primary"
                >
                  <Send size={15} />
                  <span>Send Extracted Text to Prof. Joe Chat</span>
                </button>
              </div>
            </>
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
