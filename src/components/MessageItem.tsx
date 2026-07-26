import React, { useEffect, useState, useRef } from 'react';
import { User, Copy, Download, FileText, Volume2, Check, RotateCcw, Edit3 } from 'lucide-react';
import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';

import type { Message } from '../types';
import { extractDiagrams, fetchKrokiSvg } from '../services/krokiService';
import { exportBubbleToImage } from '../services/exportService';
import { printBubbleToPdf, exportBubbleDirectPdf } from '../services/printPdfService';

marked.setOptions({
  gfm: true,
  breaks: true
});

function renderLatex(text: string): string {
  let result = text.replace(/(\$\$|\\\[)([\s\S]*?)(\$\$|\\\])/g, (_, __, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return math;
    }
  });

  result = result.replace(/(\$|\\\()([^\$\n]+?)(\$|\\\))/g, (_, __, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return math;
    }
  });

  return result;
}

interface MessageItemProps {
  message: Message;
  isLast: boolean;
  onRetry?: () => void;
  onEditUserMessage?: (oldText: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isLast, onRetry, onEditUserMessage }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [exportingImage, setExportingImage] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function processMessage() {
      const latexProcessed = renderLatex(message.content);
      const diagrams = extractDiagrams(latexProcessed);
      const diagramMap = new Map<string, string>();

      for (let index = 0; index < diagrams.length; index++) {
        const diag = diagrams[index];
        const token = `KROKIDIAGRAMTOKEN${index}ENDTOKEN`;
        const svgHtml = await fetchKrokiSvg(diag.type, diag.source);
        diagramMap.set(token, `<div class="kroki-container" data-type="${diag.type}">${svgHtml}</div>`);
      }

      let markdownToParse = latexProcessed;
      let tokenIndex = 0;
      diagrams.forEach(diag => {
        const token = `KROKIDIAGRAMTOKEN${tokenIndex++}ENDTOKEN`;
        markdownToParse = markdownToParse.replace(diag.fullMatch, token);
      });

      let parsedHtml = marked.parse(markdownToParse) as string;

      diagramMap.forEach((svgContainerHtml, token) => {
        const paragraphWrapped = `<p>${token}</p>`;
        if (parsedHtml.includes(paragraphWrapped)) {
          parsedHtml = parsedHtml.replace(paragraphWrapped, svgContainerHtml);
        } else {
          parsedHtml = parsedHtml.replace(token, svgContainerHtml);
        }
      });

      if (isMounted) {
        setRenderedHtml(parsedHtml);
      }
    }

    processMessage();

    return () => {
      isMounted = false;
    };
  }, [message.content]);

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

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const docTitle = generateExportFilename('pdf').replace(/\.pdf$/, '');
      await exportBubbleDirectPdf(message.content, message.modelUsed, docTitle);
    } catch (err) {
      console.warn('Direct PDF export fallback to print engine:', err);
      const docTitle = generateExportFilename('pdf').replace(/\.pdf$/, '');
      await printBubbleToPdf(message.content, message.modelUsed, docTitle);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textOnly = message.content.replace(/```[\s\S]*?```/g, '');
      const utterance = new SpeechSynthesisUtterance(textOnly);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
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

        <div className="bubble-actions">
          <button onClick={handleCopy} className="icon-action-btn" title="Copy Text">
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
          <button onClick={handleExportImage} disabled={exportingImage} className="icon-action-btn" title="Export PNG Image">
            <Download size={14} />
          </button>
          <button onClick={handleExportPdf} disabled={exportingPdf} className="icon-action-btn" title="Print / Export PDF">
            <FileText size={14} />
          </button>
          {!isUser && (
            <button onClick={handleSpeak} className="icon-action-btn" title="Read Aloud">
              <Volume2 size={14} />
            </button>
          )}

          {/* Edit User Message Button */}
          {isUser && isLast && onEditUserMessage && (
            <button onClick={() => onEditUserMessage(message.content)} className="icon-action-btn text-cyan-400" title="Edit Prompt Text">
              <Edit3 size={14} />
            </button>
          )}

          {/* Retry Response Button */}
          {!isUser && isLast && onRetry && (
            <button onClick={onRetry} className="icon-action-btn text-amber-400" title="Regenerate / Retry Answer">
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
