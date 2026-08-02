import React, { useEffect, useState, useRef } from 'react';
import { User, Copy, Download, Eye, Printer, Volume2, Check, RotateCcw, Edit3 } from 'lucide-react';
import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';

import type { Message } from '../types';
import { extractDiagrams, fetchKrokiSvg } from '../services/krokiService';
import { getRenderCache, setRenderCache } from '../services/renderCacheService';
import { exportBubbleToImage } from '../services/exportService';
import { printBubbleToPdf } from '../services/printPdfService';
import { PdfPreviewModal } from './PdfPreviewModal';

marked.setOptions({
  gfm: true,
  breaks: true
});

export function renderMarkdownWithMathAndDiagrams(content: string, diagramMap: Map<string, string>): string {
  if (!content) return '';
  const mathMap = new Map<string, string>();
  let tokenIdx = 0;

  // 1. Extract block math $$...$$
  let prepped = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    const token = `KATEXBLOCKTOKEN${tokenIdx++}ENDTOKEN`;
    try {
      mathMap.set(token, `<div class="katex-block">${katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })}</div>`);
    } catch {
      mathMap.set(token, `$$${math}$$`);
    }
    return token;
  });

  // 2. Extract inline math $...$
  prepped = prepped.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    const token = `KATEXINLINETOKEN${tokenIdx++}ENDTOKEN`;
    try {
      mathMap.set(token, katex.renderToString(math.trim(), { displayMode: false, throwOnError: false }));
    } catch {
      mathMap.set(token, `$${math}$`);
    }
    return token;
  });

  // 3. Parse clean markdown tables and text
  let parsedHtml = marked.parse(prepped) as string;

  // 4. Restore math HTML
  mathMap.forEach((html, token) => {
    parsedHtml = parsedHtml.replaceAll(token, html);
  });

  // 5. Restore Kroki diagram containers
  diagramMap.forEach((svgContainerHtml, token) => {
    const paragraphWrapped = `<p>${token}</p>`;
    if (parsedHtml.includes(paragraphWrapped)) {
      parsedHtml = parsedHtml.replace(paragraphWrapped, svgContainerHtml);
    } else {
      parsedHtml = parsedHtml.replaceAll(token, svgContainerHtml);
    }
  });

  return parsedHtml;
}

interface MessageItemProps {
  message: Message;
  isLast: boolean;
  onRetry?: () => void;
  onEditUserMessage?: (oldText: string) => void;
}

const MessageItemComponent: React.FC<MessageItemProps> = ({ message, isLast, onRetry, onEditUserMessage }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [exportingImage, setExportingImage] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const bubbleRef = useRef<HTMLDivElement>(null);
  const lastParsedTimeRef = useRef<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function processMessage() {
      const rawContent = message.content || '';
      if (!rawContent) {
        if (isMounted) setRenderedHtml('');
        return;
      }

      // Check IndexedDB render cache for completed messages
      const msgHash = `msg_rendered_v4_${message.id || 'msg'}_${rawContent.length}_${rawContent.slice(0, 40)}`;
      const cachedHtml = await getRenderCache(msgHash);
      if (cachedHtml && isMounted) {
        setRenderedHtml(cachedHtml);
        return;
      }

      const diagrams = extractDiagrams(rawContent);

      // Pass 1: Render Markdown & LaTeX Math INSTANTLY with skeleton diagram placeholders (< 10ms!)
      const skeletonMap = new Map<string, string>();
      diagrams.forEach((diag, index) => {
        const token = `KROKIDIAGRAMTOKEN${index}ENDTOKEN`;
        skeletonMap.set(token, `<div class="kroki-container-skeleton" style="padding:16px; margin:12px 0; border:1px dashed rgba(6,182,212,0.4); border-radius:8px; background:rgba(6,182,212,0.05); color:#06b6d4; font-size:0.85rem; font-weight:600; display:flex; align-items:center; gap:8px;">⏳ Loading ${diag.type.toUpperCase()} Diagram...</div>`);
      });

      let markdownToParse = rawContent;
      let tokenIndex = 0;
      diagrams.forEach(diag => {
        const token = `KROKIDIAGRAMTOKEN${tokenIndex++}ENDTOKEN`;
        markdownToParse = markdownToParse.replace(diag.fullMatch, token);
      });

      const initialParsedHtml = renderMarkdownWithMathAndDiagrams(markdownToParse, skeletonMap);
      if (isMounted) {
        setRenderedHtml(initialParsedHtml);
      }

      if (diagrams.length === 0) {
        setRenderCache(msgHash, initialParsedHtml);
        return;
      }

      // Pass 2: Asynchronously fetch SVGs in background & upgrade placeholders cleanly
      const updatedDiagramMap = new Map<string, string>();
      const svgResults = await Promise.all(
        diagrams.map(async (diag, index) => {
          const token = `KROKIDIAGRAMTOKEN${index}ENDTOKEN`;
          const svgHtml = await fetchKrokiSvg(diag.type, diag.source);
          return { token, svgHtml, type: diag.type };
        })
      );

      svgResults.forEach(res => {
        updatedDiagramMap.set(res.token, `<div class="kroki-container" data-type="${res.type}">${res.svgHtml}</div>`);
      });

      const finalParsedHtml = renderMarkdownWithMathAndDiagrams(markdownToParse, updatedDiagramMap);
      if (isMounted) {
        setRenderedHtml(finalParsedHtml);
        setRenderCache(msgHash, finalParsedHtml);
      }
    }

    // Stream throttling: Throttle parsing updates to 80ms windows during active streaming
    const now = Date.now();
    if (message.isStreaming && now - lastParsedTimeRef.current < 80) {
      const timer = setTimeout(() => {
        if (isMounted) processMessage();
      }, 80);
      return () => clearTimeout(timer);
    }

    lastParsedTimeRef.current = now;
    processMessage();

    return () => {
      isMounted = false;
    };
  }, [message.content, message.id, message.isStreaming]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const generateExportFilename = (extension: string): string => {
    // 1. Extract plain text (strip markdown headers, bolding, code blocks, latex)
    const textOnly = (message.content || '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/[#*`$\-\\_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // 2. Extract first 25 chars for safe topic slug
    const rawTopic = textOnly.slice(0, 25).trim();
    const cleanTopic = rawTopic.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_') || 'Export';

    // 3. Shorten model name slug
    const rawModel = message.modelUsed || 'AI';
    const modelSlug = (rawModel.includes('/') ? rawModel.split('/')[1] : rawModel).replace(/[^a-zA-Z0-9.-]/g, '');

    // 4. Current date (YYYY-MM-DD)
    const dateStr = new Date().toISOString().split('T')[0];

    return `ProfJoe_${cleanTopic}_${modelSlug}_${dateStr}.${extension}`;
  };

  const handleExportImage = async () => {
    if (!bubbleRef.current) return;
    setExportingImage(true);
    try {
      const filename = generateExportFilename('png');
      await exportBubbleToImage(bubbleRef.current, filename.replace(/\.png$/, ''));
    } finally {
      setExportingImage(false);
    }
  };

  const handleExportPdf = () => {
    setIsPdfModalOpen(true);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textOnly = message.content.replace(/```[\s\S]*?```/g, '');
      const utterance = new SpeechSynthesisUtterance(textOnly);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDirectPrint = async () => {
    await printBubbleToPdf(message.content, message.modelUsed, generateExportFilename('pdf').replace(/\.pdf$/, ''));
  };

  return (
    <div id={`msg-${message.id}`} className={`message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
      <div className="avatar" style={{ overflow: 'hidden', border: !isUser ? '1px solid rgba(6, 182, 212, 0.4)' : 'none' }}>
        {isUser ? (
          <User size={16} />
        ) : (
          <img
            src="/joe-avatar.png"
            alt="Prof. Joe AI"
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          />
        )}
      </div>

      <div className="bubble-wrapper">
        <div className="bubble-header">
          <span className="role-label">{isUser ? 'You' : 'Assistant'}</span>
          {message.modelUsed && <span className="model-badge">{message.modelUsed}</span>}
          <span className="time-stamp">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <div ref={bubbleRef} className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
          <div
            className="formatted-content markdown-body"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>

        <div className={`kokonut-msg-actions-container ${isUser ? 'user-actions' : 'assistant-actions'}`}>
          <button
            onClick={handleCopy}
            className={`kokonut-msg-btn ${copied ? 'active-action' : ''}`}
            title="Copy Text"
          >
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleExportImage}
            disabled={exportingImage}
            className="kokonut-msg-btn"
            title="Export Bubble to PNG Image"
          >
            <Download size={13} />
            <span>{exportingImage ? 'Exporting...' : 'PNG'}</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="kokonut-msg-btn"
            title="Preview PDF Document"
          >
            <Eye size={13} />
            <span>PDF</span>
          </button>

          <button
            onClick={handleDirectPrint}
            className="kokonut-msg-btn"
            title="Direct System Print Preview"
          >
            <Printer size={13} />
            <span>Print</span>
          </button>

          {!isUser && (
            <button onClick={handleSpeak} className="kokonut-msg-btn" title="Read Aloud">
              <Volume2 size={13} />
              <span>Listen</span>
            </button>
          )}

          {/* Edit User Message Button */}
          {isUser && isLast && onEditUserMessage && (
            <button
              onClick={() => onEditUserMessage(message.content)}
              className="kokonut-msg-btn"
              title="Edit Prompt Text"
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </button>
          )}

          {/* Retry Response Button */}
          {!isUser && isLast && onRetry && (
            <button onClick={onRetry} className="kokonut-msg-btn" title="Regenerate / Retry Answer">
              <RotateCcw size={13} />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>

      {/* Option 3 Custom Animated PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        content={message.content}
        modelUsed={message.modelUsed}
        docTitle={generateExportFilename('pdf').replace(/\.pdf$/, '')}
        renderedHtml={renderedHtml}
      />
    </div>
  );
};

const arePropsEqual = (prevProps: MessageItemProps, nextProps: MessageItemProps) => {
  if (prevProps.isLast !== nextProps.isLast) return false;
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (prevProps.message.content !== nextProps.message.content) return false;
  if (prevProps.message.isStreaming !== nextProps.message.isStreaming) return false;
  if (prevProps.message.modelUsed !== nextProps.message.modelUsed) return false;
  return true;
};

export const MessageItem = React.memo(MessageItemComponent, arePropsEqual);
