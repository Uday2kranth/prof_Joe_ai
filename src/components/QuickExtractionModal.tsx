import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  FileCode, 
  Upload, 
  X, 
  Copy, 
  Download, 
  Send, 
  Check, 
  Sparkles, 
  Cpu
} from 'lucide-react';
import { extractFileContent, type ExtractedResult } from '../services/unifiedExtractorService';

interface QuickExtractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (extractedText: string, fileName: string) => void;
}

export function QuickExtractionModal({ isOpen, onClose, onSendToChat }: QuickExtractionModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [parsedDoc, setParsedDoc] = useState<ExtractedResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileParsing = async (file: File) => {
    setIsProcessing(true);
    setProcessingStatus(`Parsing ${file.name}...`);
    try {
      const result = await extractFileContent(file);
      setParsedDoc(result);
    } catch (err) {
      console.error('Quick file extraction error:', err);
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
    <div 
      onClick={onClose}
      className="extractor-studio-overlay"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="extractor-studio-modal-card"
        style={{ maxWidth: '780px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', background: 'rgba(2, 6, 23, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.4)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Quick Extraction Engine</span>
                <span className="extractor-studio-tag">IN-CHAT TOOL</span>
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Extract text from files client-side before sending to AI prompt</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="extractor-dropzone"
            style={{ padding: '24px 16px', borderColor: isDragging ? '#06b6d4' : undefined }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && e.target.files[0] && handleFileParsing(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <Upload size={22} style={{ color: '#06b6d4', marginBottom: '8px' }} />
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Click or Drag File to Extract Text
            </h4>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Supports PDF, DOCX, IPYNB, Code Scripts, TXT & Images
            </p>
          </div>

          {isProcessing && (
            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: '#67e8f9', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={15} />
              <span>{processingStatus}</span>
            </div>
          )}

          {parsedDoc && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="extractor-stats-bar" style={{ borderRadius: '12px' }}>
                <div className="extractor-file-info">
                  <FileCode size={16} style={{ color: '#f43f5e' }} />
                  <span className="extractor-file-name">{parsedDoc.fileName}</span>
                  <span className="extractor-format-chip">{parsedDoc.formatType}</span>
                </div>
                <div className="extractor-stats-group">
                  <span className="extractor-stat-item">Size:<strong>{parsedDoc.fileSizeKb} KB</strong></span>
                  <span className="extractor-stat-item">Words:<strong>{parsedDoc.wordCount.toLocaleString()}</strong></span>
                </div>
              </div>

              <pre className="extractor-code-box" style={{ maxHeight: '280px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                {parsedDoc.extractedText}
              </pre>

              <div className="extractor-action-bar" style={{ borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={handleCopyText} className="extractor-btn-secondary">
                    {isCopied ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
                    <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button type="button" onClick={handleDownloadTxt} className="extractor-btn-secondary">
                    <Download size={14} />
                    <span>Download TXT</span>
                  </button>
                </div>

                <button 
                  type="button" 
                  onClick={() => {
                    onSendToChat(parsedDoc.extractedText, parsedDoc.fileName);
                    onClose();
                  }} 
                  className="extractor-btn-primary"
                >
                  <Send size={14} />
                  <span>Send to Chat Prompt</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
