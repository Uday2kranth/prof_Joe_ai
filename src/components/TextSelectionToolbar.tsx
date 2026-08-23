import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Calculator, FileText, Globe, X } from 'lucide-react';

interface TextSelectionToolbarProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onQuickAction: (actionType: 'explain' | 'math' | '2marks' | 'hinglish', selectedText: string) => void;
}

export const TextSelectionToolbar: React.FC<TextSelectionToolbarProps> = ({
  containerRef,
  onQuickAction
}) => {
  const [selectedText, setSelectedText] = useState<string>('');
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number; left: number } | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const selectedTextRef = useRef<string>('');

  const updateToolbarPosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setIsVisible(false);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 2) {
      setIsVisible(false);
      return;
    }

    const range = selection.getRangeAt(0);

    // Validate that selection is inside the chat area or message bubbles
    const anchor = selection.anchorNode;
    const focus = selection.focusNode;
    const anchorEl = anchor ? (anchor.nodeType === Node.TEXT_NODE ? anchor.parentElement : anchor as HTMLElement) : null;
    const focusEl = focus ? (focus.nodeType === Node.TEXT_NODE ? focus.parentElement : focus as HTMLElement) : null;

    const isInsideChat = (el: HTMLElement | null) => {
      if (!el) return false;
      if (containerRef?.current && containerRef.current.contains(el)) return true;
      return !!el.closest('.chat-messages-container, .formatted-content, .assistant-bubble, .user-bubble, .message-bubble, .message-row, .markdown-body, .messages-inner, .katex, .katex-display, .katex-html, .chat-viewport, .app-main');
    };

    if (!isInsideChat(anchorEl) && !isInsideChat(focusEl)) {
      setIsVisible(false);
      return;
    }

    const clientRects = range.getClientRects();
    const primaryRect = clientRects.length > 0 ? clientRects[0] : range.getBoundingClientRect();
    const fullBoundingRect = range.getBoundingClientRect();

    if (fullBoundingRect.width === 0 && fullBoundingRect.height === 0) {
      setIsVisible(false);
      return;
    }

    // If selection is completely outside the visible viewport, hide
    if (fullBoundingRect.bottom < 64 || fullBoundingRect.top > window.innerHeight) {
      setIsVisible(false);
      return;
    }

    const toolbarHeight = 38;
    let top = primaryRect.top - toolbarHeight - 8;
    if (top < 70) {
      // If too close to the top navbar (64px), position right below bottom-most selection rect
      top = fullBoundingRect.bottom + 8;
    }
    // Clamp top to viewport bounds
    top = Math.max(68, Math.min(top, window.innerHeight - 56));

    // Center horizontally over primary line selection, clamped within screen margins
    const toolbarHalfWidth = 185;
    const centerX = primaryRect.left + primaryRect.width / 2;
    const left = Math.max(toolbarHalfWidth + 12, Math.min(centerX, window.innerWidth - toolbarHalfWidth - 12));

    selectedTextRef.current = text;
    setSelectedText(text);
    setToolbarPosition({ top, left });
    setIsVisible(true);
  }, [containerRef]);

  const isMouseDownRef = useRef<boolean>(false);

  useEffect(() => {
    let timer: any = null;

    const scheduleUpdate = (delay = 60) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        updateToolbarPosition();
      }, delay);
    };

    const handleMouseDown = (e: MouseEvent) => {
      // If clicking inside the toolbar, do not dismiss or reset
      if (toolbarRef.current && toolbarRef.current.contains(e.target as Node)) {
        return;
      }
      isMouseDownRef.current = true;
      // If clicking outside on an empty area without drag
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setIsVisible(false);
      }
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      scheduleUpdate(30);
    };

    const handleSelectionChange = () => {
      // While mouse is actively held down and dragging, throttle so it doesn't jitter
      if (isMouseDownRef.current) {
        scheduleUpdate(150);
      } else {
        scheduleUpdate(60);
      }
    };

    const handleScrollOrResize = () => {
      if (isVisible) {
        updateToolbarPosition();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false);
      } else if (e.shiftKey && (e.key.startsWith('Arrow') || e.key === 'Home' || e.key === 'End')) {
        scheduleUpdate(50);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [updateToolbarPosition, isVisible]);

  if (!isVisible || !toolbarPosition || typeof document === 'undefined') return null;

  const handleAction = (actionType: 'explain' | 'math' | '2marks' | 'hinglish') => {
    const textToProcess = selectedTextRef.current || selectedText;
    if (textToProcess.trim()) {
      onQuickAction(actionType, textToProcess.trim());
    }
    setIsVisible(false);
  };

  const toolbarContent = (
    <div
      ref={toolbarRef}
      className="floating-selection-toolbar"
      style={{
        position: 'fixed',
        top: `${toolbarPosition.top}px`,
        left: `${toolbarPosition.left}px`,
        transform: 'translateX(-50%)',
        zIndex: 999999,
        pointerEvents: 'auto'
      }}
      onMouseDown={(e) => {
        // Prevent clearing text selection when interacting with toolbar
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="selection-toolbar-inner">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={() => handleAction('explain')}
          className="selection-tool-btn"
          title="Explain this specific sentence in simple words"
        >
          <Sparkles size={12} style={{ color: 'var(--accent-cyan)' }} />
          <span>Explain Simply</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={() => handleAction('math')}
          className="selection-tool-btn"
          title="Derive or breakdown the mathematical formulas"
        >
          <Calculator size={12} style={{ color: 'var(--accent-cyan)' }} />
          <span>Show Math</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={() => handleAction('2marks')}
          className="selection-tool-btn"
          title="Turn this excerpt into a 2-mark Osmania exam Q&A"
        >
          <FileText size={12} style={{ color: 'var(--accent-cyan)' }} />
          <span>2-Mark Q&A</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={() => handleAction('hinglish')}
          className="selection-tool-btn"
          title="Explain in colloquial bilingual Hinglish"
        >
          <Globe size={12} style={{ color: 'var(--accent-cyan)' }} />
          <span>Hinglish</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={() => setIsVisible(false)}
          className="selection-tool-close"
          title="Dismiss Toolbar (Esc)"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );

  return createPortal(toolbarContent, document.body);
};

