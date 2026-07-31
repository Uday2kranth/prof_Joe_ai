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
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface DocumentExtractorStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (extractedText: string, fileName: string) => void;
}

interface ParsedDocStats {
  fileName: string;
  fileSizeKb: number;
  formatType: string;
  wordCount: number;
  charCount: number;
  extractedText: string;
}

export function DocumentExtractorStudio({ isOpen, onClose, onSendToChat }: DocumentExtractorStudioProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [parsedDoc, setParsedDoc] = useState<ParsedDocStats | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileParsing = async (file: File) => {
    setIsProcessing(true);
    setProcessingStatus(`Parsing ${file.name}...`);
    const sizeKb = Math.round(file.size / 1024);
    const fileName = file.name;
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    try {
      let extractedText = '';
      let formatType = ext.toUpperCase();

      // 1. Jupyter Notebook (.ipynb)
      if (ext === 'ipynb') {
        formatType = 'JUPYTER NOTEBOOK';
        const rawJson = await file.text();
        try {
          const notebook = JSON.parse(rawJson);
          const cells = notebook.cells || [];
          const lines: string[] = [`# Notebook: ${fileName}\n`];

          cells.forEach((cell: any, idx: number) => {
            const cellType = cell.cell_type || 'code';
            const source = Array.isArray(cell.source) ? cell.source.join('') : (cell.source || '');
            
            if (cellType === 'markdown') {
              lines.push(`\n<!-- Cell ${idx + 1}: Markdown -->\n${source}\n`);
            } else if (cellType === 'code') {
              lines.push(`\n\`\`\`python\n# Cell ${idx + 1}: Code\n${source}\n\`\`\`\n`);
              // Outputs
              if (cell.outputs && Array.isArray(cell.outputs)) {
                cell.outputs.forEach((out: any) => {
                  if (out.text) {
                    const outText = Array.isArray(out.text) ? out.text.join('') : out.text;
                    lines.push(`\`\`\`output\n${outText}\n\`\`\`\n`);
                  }
                });
              }
            }
          });
          extractedText = lines.join('\n');
        } catch {
          extractedText = rawJson;
        }
      } 
      // 2. Word Documents (.docx)
      else if (ext === 'docx') {
        formatType = 'WORD DOCX';
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value || '[No text found in Word document]';
      }
      // 3. PDF Documents (.pdf)
      else if (ext === 'pdf') {
        formatType = 'PDF DOCUMENT';
        setProcessingStatus('Extracting PDF text layers...');
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const pdfTexts: string[] = [`# PDF: ${fileName} (${pdf.numPages} Pages)\n`];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageStrings = textContent.items.map((item: any) => item.str || '').join(' ');
          pdfTexts.push(`--- Page ${pageNum} ---\n${pageStrings}\n`);
        }
        extractedText = pdfTexts.join('\n');
      }
      // 4. Code & Text Files (.js, .ts, .py, .cpp, .html, .css, .txt, .md, etc.)
      else if (!file.type.startsWith('image/')) {
        extractedText = await file.text();
      }
      // 5. Image Fallback
      else {
        formatType = 'IMAGE OCR';
        extractedText = `[Image File: ${fileName} (${sizeKb} KB)]\nImage text OCR ready for AI analysis.`;
      }

      const words = extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0;
      const chars = extractedText.length;

      setParsedDoc({
        fileName,
        fileSizeKb: sizeKb,
        formatType,
        wordCount: words,
        charCount: chars,
        extractedText
      });
    } catch (err) {
      console.error('File extraction error:', err);
      setParsedDoc({
        fileName,
        fileSizeKb: sizeKb,
        formatType: ext.toUpperCase(),
        wordCount: 0,
        charCount: 0,
        extractedText: `Error extracting text from ${fileName}.`
      });
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
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>Document & Code Text Extractor Studio</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">DEMO STUDIO</span>
              </h3>
              <p className="text-xs text-slate-400">Extract, inspect & clean text from PDFs, DOCX, IPYNB, Code & Images client-side</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Studio Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-950/60">
          {/* Drop & Drag Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging 
                ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]' 
                : 'border-slate-800 hover:border-cyan-500/50 bg-slate-900/50 hover:bg-slate-900/80'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && e.target.files[0] && handleFileParsing(e.target.files[0])}
              className="hidden"
            />
            
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 shadow-lg shadow-cyan-500/10">
              <Upload size={24} />
            </div>

            <h4 className="font-bold text-sm text-slate-200 mb-1">
              Drag & Drop file here or <span className="text-cyan-400 underline">Browse File</span>
            </h4>
            <p className="text-xs text-slate-400 max-w-md">
              Supports <strong className="text-slate-300">PDF, DOCX, IPYNB (Jupyter), JS, PY, CPP, HTML, TXT, MD, PNG, JPG</strong>
            </p>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs font-semibold text-cyan-300 animate-pulse">
              <Sparkles size={16} className="text-cyan-400 animate-spin" />
              <span>{processingStatus}</span>
            </div>
          )}

          {/* Parsed Output Card */}
          {parsedDoc && !isProcessing && (
            <div className="space-y-3">
              {/* File Info Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <FileCode size={16} className="text-rose-400 flex-shrink-0" />
                  <span className="font-bold text-slate-100 truncate">{parsedDoc.fileName}</span>
                  <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-slate-800 text-cyan-300 font-bold">
                    {parsedDoc.formatType}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                  <span>Size: <strong className="text-slate-200">{parsedDoc.fileSizeKb} KB</strong></span>
                  <span>Words: <strong className="text-slate-200">{parsedDoc.wordCount.toLocaleString()}</strong></span>
                  <span>Chars: <strong className="text-slate-200">{parsedDoc.charCount.toLocaleString()}</strong></span>
                </div>
              </div>

              {/* Text Viewer Box */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                  <span>Extracted Text Stream</span>
                  <span>UTF-8 • Client-Side Parsed</span>
                </div>

                <pre className="p-5 max-h-[380px] overflow-auto text-xs font-mono text-cyan-200 leading-relaxed whitespace-pre-wrap word-break-break-word">
                  {parsedDoc.extractedText}
                </pre>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{isCopied ? 'Copied!' : 'Copy Text'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
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
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white transition-all shadow-lg shadow-rose-500/20"
                >
                  <Send size={14} />
                  <span>Send Extracted Text to Prof. Joe Chat</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
