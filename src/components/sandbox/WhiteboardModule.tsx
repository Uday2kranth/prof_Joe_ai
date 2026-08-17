import React, { useState, useRef, useEffect, useCallback } from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import {
  Edit3, PenTool, Sparkles, Download,
  Square, Circle, ArrowRight, Minus, Trash2,
  Check, Undo, Grid, Type, Plus, Wand2, X,
  StickyNote, Copy, Move, Hand, MousePointer,
  Image as ImageIcon, Link2, Triangle, Star,
  RotateCcw, RotateCw, Shapes, Database,
  Cloud, MessageSquare, Hexagon, Component
} from 'lucide-react';
import { sendChatMessage } from '../../services/apiService';
import type { Message, UserKeys } from '../../types';

export type ShapeType =
  | 'rect'
  | 'rounded_rect'
  | 'circle'
  | 'diamond'
  | 'cylinder'
  | 'triangle'
  | 'hexagon'
  | 'parallelogram'
  | 'cloud'
  | 'callout'
  | 'pill'
  | 'star';

export interface ChalkboardItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'formula' | 'note' | 'image' | ShapeType;
  name?: string; // Title / Header
  text?: string; // Editable Text inside shape
  latex?: string;
  explanation?: string;
  color?: string; // Theme / Stroke color
  fillColor?: string; // Background fill
  strokeWidth?: number;
  rotation?: number; // In degrees (0 - 360)
  imageUrl?: string;
}

export interface RelationshipConnection {
  id: string;
  fromItemId: string;
  fromAnchor: 'top' | 'bottom' | 'left' | 'right';
  toItemId: string;
  toAnchor: 'top' | 'bottom' | 'left' | 'right';
  label?: string;
}

export const WhiteboardModule: React.FC = () => {
  const [activeFormulaFeedback, setActiveFormulaFeedback] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Active Tool: Selection (move objects), Hand (pan frame), Shapes or Drawing Tools
  const [activeTool, setActiveTool] = useState<
    'select' | 'hand' | 'pen' | 'highlighter' | 'text' | 'eraser' | 'rect' | 'circle' | 'triangle' | 'star' | 'arrow' | 'line'
  >('select');

  // Infinite Chalkboard Pan Offset
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Viewport Container Ref
  const boardContainerRef = useRef<HTMLDivElement | null>(null);

  // Custom Canvas Drawing State (for freehand ink, lines & arrows)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState<string>('#38bdf8');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [canvasHistory, setCanvasHistory] = useState<ImageData[]>([]);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const snapshotRef = useRef<ImageData | null>(null);

  // Relationship Forming & Anchor Points State
  const [relationshipMode, setRelationshipMode] = useState<boolean>(false);
  const [connections, setConnections] = useState<RelationshipConnection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<{
    itemId: string;
    anchor: 'top' | 'bottom' | 'left' | 'right';
    startX: number;
    startY: number;
  } | null>(null);
  const [tempConnectionEnd, setTempConnectionEnd] = useState<{ x: number; y: number } | null>(null);
  const [hoveredAnchor, setHoveredAnchor] = useState<{
    itemId: string;
    anchor: 'top' | 'bottom' | 'left' | 'right';
  } | null>(null);

  // All Interactive Draggable Items (KaTeX Formulas, Sticky Notes, Images, Shapes)
  const [items, setItems] = useState<ChalkboardItem[]>([
    {
      id: 'init_softmax',
      x: 340,
      y: 110,
      width: 420,
      height: 170,
      name: 'Softmax Activation Function',
      latex: '\\sigma(\\mathbf{z})_i = \\frac{e^{z_i}}{\\sum_{j=1}^K e^{z_j}}',
      explanation: 'Normalizes logits into a valid probability distribution where sum equals 1.',
      type: 'formula'
    },
    {
      id: 'init_note',
      x: 820,
      y: 110,
      width: 280,
      height: 120,
      name: 'Key Exam Note',
      latex: '',
      explanation: 'Tip: Always normalize input vectors before computing cosine similarity or softmax!',
      type: 'note',
      color: '#f59e0b'
    },
    {
      id: 'init_rect',
      x: 340,
      y: 330,
      width: 200,
      height: 100,
      type: 'rect',
      name: 'Input Layer',
      text: 'X = [x₁, x₂, ..., xₙ]',
      color: '#38bdf8',
      strokeWidth: 3,
      rotation: 0
    },
    {
      id: 'init_circle',
      x: 620,
      y: 330,
      width: 130,
      height: 130,
      type: 'circle',
      name: 'Neuron Node',
      text: 'f(∑wᵢxᵢ + b)',
      color: '#a855f7',
      strokeWidth: 3,
      rotation: 0
    }
  ]);

  // Selected / Dragging Item State
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Rotating Item State
  const [rotatingItemId, setRotatingItemId] = useState<string | null>(null);

  // Text Tool State
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState<string>('');
  const [quickNoteText, setQuickNoteText] = useState<string>('');
  const [showQuickNoteModal, setShowQuickNoteModal] = useState<boolean>(false);

  // Custom Shape Creator / Palette Modal State
  const [showCustomShapeModal, setShowCustomShapeModal] = useState<boolean>(false);
  const [editingShapeId, setEditingShapeId] = useState<string | null>(null);
  const [shapeFormType, setShapeFormType] = useState<ShapeType>('rect');
  const [shapeFormTitle, setShapeFormTitle] = useState<string>('');
  const [shapeFormText, setShapeFormText] = useState<string>('');
  const [shapeFormColor, setShapeFormColor] = useState<string>('#38bdf8');
  const [shapeFormRotation, setShapeFormRotation] = useState<number>(0);
  const [shapeFormSize, setShapeFormSize] = useState<'sm' | 'md' | 'lg'>('md');

  // Image Upload Ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Custom Formula / Edit Modal State
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [customFormulaName, setCustomFormulaName] = useState<string>('');
  const [customFormulaLatex, setCustomFormulaLatex] = useState<string>('');
  const [customFormulaExplanation, setCustomFormulaExplanation] = useState<string>('');

  // AI Formula Generator State with Provider & Model Selectors
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingAiFormula, setIsGeneratingAiFormula] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<string>(
    localStorage.getItem('chatterbot_provider') || 'pollinations'
  );
  const [selectedModel, setSelectedModel] = useState<string>(
    localStorage.getItem('chatterbot_model') || 'openai'
  );

  const PROVIDER_OPTIONS = [
    { id: 'pollinations', name: 'Pollinations (Free / No Key)', defaultModel: 'openai' },
    { id: 'cerebras', name: 'Cerebras (Ultra Fast)', defaultModel: 'llama3.1-8b' },
    { id: 'groq', name: 'Groq (High Speed)', defaultModel: 'llama-3.3-70b-versatile' },
    { id: 'gemini', name: 'Google Gemini', defaultModel: 'gemini-2.5-flash' },
    { id: 'openrouter', name: 'OpenRouter', defaultModel: 'deepseek/deepseek-r1' },
    { id: 'nvidia', name: 'NVIDIA NIM', defaultModel: 'meta/llama-3.1-70b-instruct' },
    { id: 'mistral', name: 'Mistral AI', defaultModel: 'mistral-large-latest' },
    { id: 'sambanova', name: 'SambaNova Fast', defaultModel: 'Meta-Llama-3.1-70B-Instruct' }
  ];

  // Rich Shape Library Catalog
  const SHAPE_CATALOG: Array<{ type: ShapeType; label: string; icon: React.ReactNode; defaultW: number; defaultH: number }> = [
    { type: 'rect', label: 'Box / Process', icon: <Square size={16} />, defaultW: 190, defaultH: 100 },
    { type: 'rounded_rect', label: 'Rounded Box', icon: <Component size={16} />, defaultW: 190, defaultH: 100 },
    { type: 'circle', label: 'Circle / State', icon: <Circle size={16} />, defaultW: 130, defaultH: 130 },
    { type: 'diamond', label: 'Diamond (Decision)', icon: <Shapes size={16} />, defaultW: 160, defaultH: 130 },
    { type: 'cylinder', label: 'Database Cylinder', icon: <Database size={16} />, defaultW: 150, defaultH: 130 },
    { type: 'triangle', label: 'Triangle / Filter', icon: <Triangle size={16} />, defaultW: 150, defaultH: 120 },
    { type: 'hexagon', label: 'Hexagon (Prep/Loop)', icon: <Hexagon size={16} />, defaultW: 170, defaultH: 110 },
    { type: 'parallelogram', label: 'Parallelogram (I/O)', icon: <Square size={16} style={{ transform: 'skewX(-15deg)' }} />, defaultW: 180, defaultH: 95 },
    { type: 'cloud', label: 'Cloud (Network)', icon: <Cloud size={16} />, defaultW: 180, defaultH: 120 },
    { type: 'callout', label: 'Speech Callout', icon: <MessageSquare size={16} />, defaultW: 170, defaultH: 110 },
    { type: 'pill', label: 'Pill (Start / End)', icon: <Minus size={16} style={{ strokeWidth: 5 }} />, defaultW: 170, defaultH: 75 },
    { type: 'star', label: 'Star (Milestone)', icon: <Star size={16} />, defaultW: 140, defaultH: 140 }
  ];

  // Formula Presets Chips
  const FORMULA_PRESETS: Array<{ name: string; latex: string; explanation: string }> = [
    {
      name: 'Bayes Theorem',
      latex: 'P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}',
      explanation: 'Posterior probability computed from prior and likelihood.'
    },
    {
      name: 'Softmax Activation',
      latex: '\\sigma(\\mathbf{z})_i = \\frac{e^{z_i}}{\\sum_{j=1}^K e^{z_j}}',
      explanation: 'Converts raw logit scores into probability distribution.'
    },
    {
      name: 'MSE Loss',
      latex: 'L(y, \\hat{y}) = \\frac{1}{N} \\sum_{i=1}^N (y_i - \\hat{y}_i)^2',
      explanation: 'Mean Squared Error loss for regression optimization.'
    },
    {
      name: 'Gradient Descent',
      latex: 'w_{t+1} = w_t - \\eta \\nabla L(w_t)',
      explanation: 'Weights updated in the opposite direction of loss gradient.'
    },
    {
      name: 'Gini Impurity',
      latex: 'I_G(p) = 1 - \\sum_{i=1}^J p_i^2',
      explanation: 'Measure of node heterogeneity in Decision Trees.'
    },
    {
      name: 'Transformer Attention',
      latex: '\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
      explanation: 'Scaled Dot-Product Attention mechanism in Transformers.'
    }
  ];

  // Draw Background Grid
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, width, height);

    if (showGrid) {
      const gridSize = 32;
      ctx.fillStyle = 'rgba(148, 163, 184, 0.14)';
      for (let x = gridSize; x < width; x += gridSize) {
        for (let y = gridSize; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
  }, [showGrid]);

  // Initialize Canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    drawBackground(ctx, rect.width, rect.height);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasHistory([imgData]);
  }, [drawBackground]);

  useEffect(() => {
    const timer = setTimeout(initCanvas, 100);
    window.addEventListener('resize', initCanvas);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', initCanvas);
    };
  }, [initCanvas]);

  // Delete Connection on Backspace/Delete Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedConnectionId) {
        setConnections(prev => prev.filter(c => c.id !== selectedConnectionId));
        setSelectedConnectionId(null);
      }
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedItemId && activeTool === 'select') {
        const activeElem = document.activeElement;
        if (activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA')) return;
        deleteItem(selectedItemId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedConnectionId, selectedItemId, activeTool]);

  // Add KaTeX Formula Card to Chalkboard
  const addFormulaCard = (formula: { name: string; latex: string; explanation?: string }) => {
    navigator.clipboard.writeText(formula.latex);
    setActiveFormulaFeedback(formula.name);
    setTimeout(() => setActiveFormulaFeedback(null), 2500);

    const newItem: ChalkboardItem = {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      x: 60 - panOffset.x + Math.random() * 240,
      y: 70 - panOffset.y + Math.random() * 160,
      width: 420,
      height: 170,
      name: formula.name,
      latex: formula.latex,
      explanation: formula.explanation || '',
      type: 'formula'
    };

    setItems(prev => [...prev, newItem]);
  };

  // Add Sticky Note Card
  const addStickyNoteCard = () => {
    if (!quickNoteText.trim()) return;
    const newNote: ChalkboardItem = {
      id: `note_${Date.now()}`,
      x: 80 - panOffset.x + Math.random() * 200,
      y: 90 - panOffset.y + Math.random() * 140,
      width: 280,
      height: 120,
      name: 'Sticky Note',
      latex: '',
      explanation: quickNoteText.trim(),
      type: 'note',
      color: '#f59e0b'
    };
    setItems(prev => [...prev, newNote]);
    setShowQuickNoteModal(false);
    setQuickNoteText('');
  };

  // Insert Local Image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const newImgItem: ChalkboardItem = {
        id: `img_${Date.now()}`,
        x: 100 - panOffset.x + Math.random() * 160,
        y: 100 - panOffset.y + Math.random() * 140,
        width: 320,
        height: 220,
        name: file.name.slice(0, 24),
        latex: '',
        explanation: 'Inserted Diagram / Reference',
        type: 'image',
        imageUrl: url
      };
      setItems(prev => [...prev, newImgItem]);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Open Custom Shape Creator Modal
  const openCustomShapeModal = () => {
    setEditingShapeId(null);
    setShapeFormType('rect');
    setShapeFormTitle('');
    setShapeFormText('');
    setShapeFormColor('#38bdf8');
    setShapeFormRotation(0);
    setShapeFormSize('md');
    setShowCustomShapeModal(true);
  };

  // Open Edit Modal for an Existing Shape
  const openEditShapeModal = (item: ChalkboardItem) => {
    setEditingShapeId(item.id);
    setShapeFormType(item.type as ShapeType);
    setShapeFormTitle(item.name || '');
    setShapeFormText(item.text || '');
    setShapeFormColor(item.color || '#38bdf8');
    setShapeFormRotation(item.rotation || 0);
    setShowCustomShapeModal(true);
  };

  // Save Custom Shape from Modal
  const handleSaveCustomShape = () => {
    const shapeDef = SHAPE_CATALOG.find(s => s.type === shapeFormType) || SHAPE_CATALOG[0];

    const sizeMultiplier = shapeFormSize === 'sm' ? 0.75 : shapeFormSize === 'lg' ? 1.35 : 1.0;
    const finalW = Math.round(shapeDef.defaultW * sizeMultiplier);
    const finalH = Math.round(shapeDef.defaultH * sizeMultiplier);

    if (editingShapeId) {
      setItems(prev =>
        prev.map(item =>
          item.id === editingShapeId
            ? {
                ...item,
                type: shapeFormType,
                name: shapeFormTitle.trim() || undefined,
                text: shapeFormText.trim() || undefined,
                color: shapeFormColor,
                rotation: shapeFormRotation
              }
            : item
        )
      );
    } else {
      const newShape: ChalkboardItem = {
        id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        x: 120 - panOffset.x + Math.random() * 180,
        y: 120 - panOffset.y + Math.random() * 140,
        width: finalW,
        height: finalH,
        type: shapeFormType,
        name: shapeFormTitle.trim() || undefined,
        text: shapeFormText.trim() || undefined,
        color: shapeFormColor,
        strokeWidth: 3,
        rotation: shapeFormRotation
      };
      setItems(prev => [...prev, newShape]);
      setSelectedItemId(newShape.id);
    }

    setShowCustomShapeModal(false);
    setEditingShapeId(null);
  };

  // Delete Item & Associated Connections
  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(c => c.id !== id));
    setConnections(prev => prev.filter(cn => cn.fromItemId !== id && cn.toItemId !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  // Open Edit Modal for a Formula Card
  const openEditModal = (item: ChalkboardItem) => {
    setEditingItemId(item.id);
    setCustomFormulaName(item.name || '');
    setCustomFormulaLatex(item.latex || '');
    setCustomFormulaExplanation(item.explanation || '');
    setShowFormulaModal(true);
  };

  // Save Custom or Edited Formula
  const handleSaveFormula = () => {
    if (!customFormulaName.trim() || !customFormulaLatex.trim()) return;

    if (editingItemId) {
      setItems(prev =>
        prev.map(c =>
          c.id === editingItemId
            ? {
                ...c,
                name: customFormulaName.trim(),
                latex: customFormulaLatex.trim(),
                explanation: customFormulaExplanation.trim()
              }
            : c
        )
      );
    } else {
      const newItem: ChalkboardItem = {
        id: `custom_${Date.now()}`,
        x: 100 - panOffset.x + Math.random() * 200,
        y: 100 - panOffset.y + Math.random() * 150,
        width: 420,
        height: 170,
        name: customFormulaName.trim(),
        latex: customFormulaLatex.trim(),
        explanation: customFormulaExplanation.trim() || 'Custom academic formula',
        type: 'formula'
      };
      setItems(prev => [...prev, newItem]);
    }

    setShowFormulaModal(false);
    setEditingItemId(null);
    setCustomFormulaName('');
    setCustomFormulaLatex('');
    setCustomFormulaExplanation('');
  };

  // Item Mouse Drag Handlers
  const handleItemMouseDown = (e: React.MouseEvent, item: ChalkboardItem) => {
    if (activeTool === 'hand' || relationshipMode) return;
    e.stopPropagation();
    setSelectedItemId(item.id);
    setSelectedConnectionId(null);
    setDraggingItemId(item.id);
    dragOffsetRef.current = {
      x: e.clientX - item.x,
      y: e.clientY - item.y
    };
  };

  // Anchor Dot Position Calculation for Relationships (Rotates with shape)
  const getAnchorCoords = (item: ChalkboardItem, anchor: 'top' | 'bottom' | 'left' | 'right') => {
    const cx = item.x + item.width / 2;
    const cy = item.y + item.height / 2;
    let ax = 0;
    let ay = 0;

    switch (anchor) {
      case 'top': ax = cx; ay = item.y; break;
      case 'bottom': ax = cx; ay = item.y + item.height; break;
      case 'left': ax = item.x; ay = cy; break;
      case 'right': ax = item.x + item.width; ay = cy; break;
    }

    if (item.rotation) {
      const rad = (item.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const rx = cos * (ax - cx) - sin * (ay - cy) + cx;
      const ry = sin * (ax - cx) + cos * (ay - cy) + cy;
      return { x: rx, y: ry };
    }

    return { x: ax, y: ay };
  };

  // Start Relationship Anchor Link (Fluid Drag)
  const handleAnchorMouseDown = (e: React.MouseEvent, item: ChalkboardItem, anchor: 'top' | 'bottom' | 'left' | 'right') => {
    e.stopPropagation();
    e.preventDefault();
    const coords = getAnchorCoords(item, anchor);
    setConnectingFrom({
      itemId: item.id,
      anchor,
      startX: coords.x,
      startY: coords.y
    });
    setTempConnectionEnd({ x: coords.x, y: coords.y });
  };

  // Start Rotating Shape Handle
  const handleRotateStart = (e: React.MouseEvent, item: ChalkboardItem) => {
    e.stopPropagation();
    e.preventDefault();
    setRotatingItemId(item.id);
  };

  // Global Mouse Move (Item Dragging, Rotation, Connection Elastic Drawing & Canvas Panning)
  const handleMouseMoveGlobal = (e: React.MouseEvent) => {
    if (isPanning && activeTool === 'hand') {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      panStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Interactive Shape Rotation by Mouse Dragging
    if (rotatingItemId && boardContainerRef.current) {
      const item = items.find(i => i.id === rotatingItemId);
      if (item) {
        const containerRect = boardContainerRef.current.getBoundingClientRect();
        const itemCenterX = containerRect.left + panOffset.x + item.x + item.width / 2;
        const itemCenterY = containerRect.top + panOffset.y + item.y + item.height / 2;

        const rad = Math.atan2(e.clientY - itemCenterY, e.clientX - itemCenterX);
        let deg = Math.round((rad * 180) / Math.PI) + 90;
        if (deg < 0) deg += 360;
        deg = deg % 360;

        // Snap to 15-degree increments if shift key is pressed
        if (e.shiftKey) {
          deg = Math.round(deg / 15) * 15;
        }

        setItems(prev =>
          prev.map(i => (i.id === rotatingItemId ? { ...i, rotation: deg } : i))
        );
      }
      return;
    }

    if (draggingItemId) {
      const newX = e.clientX - dragOffsetRef.current.x;
      const newY = e.clientY - dragOffsetRef.current.y;

      setItems(prev =>
        prev.map(c => (c.id === draggingItemId ? { ...c, x: newX, y: newY } : c))
      );
    }

    // Dynamic Elastic Relationship Line
    if (connectingFrom && boardContainerRef.current) {
      const containerRect = boardContainerRef.current.getBoundingClientRect();
      const currentBoardX = e.clientX - containerRect.left - panOffset.x;
      const currentBoardY = e.clientY - containerRect.top - panOffset.y;

      setTempConnectionEnd({ x: currentBoardX, y: currentBoardY });
    }
  };

  const handleMouseUpGlobal = () => {
    if (isPanning) setIsPanning(false);
    if (draggingItemId) setDraggingItemId(null);
    if (rotatingItemId) setRotatingItemId(null);

    // If released over a valid target anchor
    if (connectingFrom) {
      if (hoveredAnchor && hoveredAnchor.itemId !== connectingFrom.itemId) {
        const newConn: RelationshipConnection = {
          id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          fromItemId: connectingFrom.itemId,
          fromAnchor: connectingFrom.anchor,
          toItemId: hoveredAnchor.itemId,
          toAnchor: hoveredAnchor.anchor,
          label: 'maps_to'
        };
        setConnections(prev => [...prev, newConn]);
      }
      setConnectingFrom(null);
      setTempConnectionEnd(null);
      setHoveredAnchor(null);
    }
  };

  // Text Tool Canvas Placement
  const confirmTextInput = () => {
    if (!textInputPos || !textInputValue.trim()) {
      setTextInputPos(null);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.fillStyle = strokeColor;
    ctx.font = `bold ${strokeWidth * 4 + 12}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(textInputValue, textInputPos.x, textInputPos.y + 16);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasHistory(prev => [...prev.slice(-25), imgData]);
    setTextInputPos(null);
    setTextInputValue('');
  };

  // Canvas Drawing & Interactive Shape Creation Handlers
  const isShapeTool = activeTool === 'rect' || activeTool === 'circle' || activeTool === 'triangle' || activeTool === 'star';

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'hand') {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }
    if (activeTool === 'select' || relationshipMode) {
      setSelectedItemId(null);
      setSelectedConnectionId(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - panOffset.x;
    const y = e.clientY - rect.top - panOffset.y;

    if (activeTool === 'text') {
      setTextInputPos({ x, y });
      setTextInputValue('');
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    setIsDrawing(true);
    startPosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === 'text' || activeTool === 'hand' || activeTool === 'select') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    if (activeTool === 'eraser') {
      ctx.strokeStyle = '#0b1120';
      ctx.lineWidth = strokeWidth * 7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(rawX, rawY);
      ctx.stroke();
    } else if (activeTool === 'highlighter') {
      ctx.strokeStyle = strokeColor + '55';
      ctx.lineWidth = strokeWidth * 4.5;
      ctx.lineCap = 'square';
      ctx.lineTo(rawX, rawY);
      ctx.stroke();
    } else if (activeTool === 'pen') {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(rawX, rawY);
      ctx.stroke();
    } else if (snapshotRef.current) {
      // Shape / Line / Arrow Real-Time Preview
      ctx.putImageData(snapshotRef.current, 0, 0);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;

      const startX = startPosRef.current.x;
      const startY = startPosRef.current.y;

      if (activeTool === 'rect') {
        ctx.strokeRect(startX, startY, rawX - startX, rawY - startY);
      } else if (activeTool === 'circle') {
        const r = Math.sqrt(Math.pow(rawX - startX, 2) + Math.pow(rawY - startY, 2));
        ctx.beginPath();
        ctx.arc(startX, startY, r, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (activeTool === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(startX + (rawX - startX) / 2, startY);
        ctx.lineTo(rawX, rawY);
        ctx.lineTo(startX, rawY);
        ctx.closePath();
        ctx.stroke();
      } else if (activeTool === 'star') {
        const cx = startX + (rawX - startX) / 2;
        const cy = startY + (rawY - startY) / 2;
        const r = Math.abs(rawX - startX) / 2;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(Math.cos((18 + i * 72) * 0.01745) * r + cx, -Math.sin((18 + i * 72) * 0.01745) * r + cy);
          ctx.lineTo(Math.cos((54 + i * 72) * 0.01745) * (r / 2) + cx, -Math.sin((54 + i * 72) * 0.01745) * (r / 2) + cy);
        }
        ctx.closePath();
        ctx.stroke();
      } else if (activeTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(rawX, rawY);
        ctx.stroke();
      } else if (activeTool === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(rawX, rawY);
        ctx.stroke();

        const angle = Math.atan2(rawY - startY, rawX - startX);
        const headLen = 14;
        ctx.beginPath();
        ctx.moveTo(rawX, rawY);
        ctx.lineTo(rawX - headLen * Math.cos(angle - Math.PI / 6), rawY - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(rawX, rawY);
        ctx.lineTo(rawX - headLen * Math.cos(angle + Math.PI / 6), rawY - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    const startX = startPosRef.current.x;
    const startY = startPosRef.current.y;

    // IF DRAWING A SHAPE -> CONVERT TO INTERACTIVE DRAGGABLE VECTOR ITEM WITH EDITABLE TEXT
    if (isShapeTool) {
      if (snapshotRef.current) ctx.putImageData(snapshotRef.current, 0, 0);

      const xMin = Math.min(startX, rawX) - panOffset.x;
      const yMin = Math.min(startY, rawY) - panOffset.y;
      const w = Math.max(48, Math.abs(rawX - startX));
      const h = Math.max(48, Math.abs(rawY - startY));

      const newShapeItem: ChalkboardItem = {
        id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        x: xMin,
        y: yMin,
        width: w,
        height: h,
        type: activeTool as ShapeType,
        color: strokeColor,
        strokeWidth: strokeWidth,
        rotation: 0
      };

      setItems(prev => [...prev, newShapeItem]);
      setSelectedItemId(newShapeItem.id);
      setActiveTool('select');
      return;
    }

    // Freehand strokes & arrows save to canvas history
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasHistory(prev => [...prev.slice(-25), imgData]);
  };

  const undoCanvas = () => {
    if (canvasHistory.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const newHistory = [...canvasHistory];
    newHistory.pop();
    const previous = newHistory[newHistory.length - 1];
    ctx.putImageData(previous, 0, 0);
    setCanvasHistory(newHistory);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    drawBackground(ctx, rect.width, rect.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasHistory([imgData]);
    setItems([]);
    setConnections([]);
    setSelectedItemId(null);
    setSelectedConnectionId(null);
  };

  const downloadCanvasImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `prof-joe-academic-board-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Generate Formula with AI with Selected Provider & Model
  const handleGenerateAiFormula = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAiFormula(true);
    try {
      const activeUser = localStorage.getItem('chatterbot_username') || 'Guest_Student';
      const savedKeysStr = localStorage.getItem(`chatterbot_user_keys_${activeUser}`) || localStorage.getItem('chatterbot_user_keys') || '{}';
      let userKeys: UserKeys = {} as any;
      try {
        userKeys = JSON.parse(savedKeysStr);
      } catch (e) {
        userKeys = {} as any;
      }

      const promptMsg: Message = {
        id: 'ai_formula_req',
        role: 'user',
        content: `Generate the precise academic mathematical or engineering formula for: "${aiPrompt}". Return STRICT JSON without markdown code fences in format: {"name": "Accurate Formula Title", "latex": "valid standard LaTeX formula code", "explanation": "Clear one-line summary"}. Output ONLY JSON.`,
        timestamp: Date.now()
      };

      const response = await sendChatMessage(
        selectedProvider,
        selectedModel,
        [promptMsg],
        userKeys,
        false,
        'none'
      );

      const cleaned = response.content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.name && parsed.latex) {
        addFormulaCard({
          name: parsed.name,
          latex: parsed.latex,
          explanation: parsed.explanation || aiPrompt
        });
        setShowAiModal(false);
        setAiPrompt('');
      }
    } catch (err) {
      console.warn('AI Formula Generation Fallback:', err);
      let fallbackLatex = '\\text{Formula}(x) = f(\\mathbf{x})';
      let fallbackTitle = aiPrompt.slice(0, 28);
      let fallbackExp = 'Academic mathematical formulation';

      const lower = aiPrompt.toLowerCase();
      if (lower.includes('attention')) {
        fallbackTitle = 'Scaled Dot-Product Attention';
        fallbackLatex = '\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V';
        fallbackExp = 'Calculates attention matrix scores across query, key, and value vectors.';
      } else if (lower.includes('shannon') || lower.includes('capacity')) {
        fallbackTitle = 'Shannon Channel Capacity';
        fallbackLatex = 'C = B \\log_2\\left(1 + \\frac{S}{N}\\right)';
        fallbackExp = 'Theoretical maximum information transfer rate over noisy channel.';
      } else if (lower.includes('convolution') || lower.includes('cnn')) {
        fallbackTitle = 'CNN Output Feature Map Dimension';
        fallbackLatex = 'O = \\left\\lfloor \\frac{W - K + 2P}{S} \\right\\rfloor + 1';
        fallbackExp = 'Computes spatial output dimensions given kernel size K, padding P, stride S.';
      }

      addFormulaCard({
        name: fallbackTitle,
        latex: fallbackLatex,
        explanation: fallbackExp
      });
      setShowAiModal(false);
      setAiPrompt('');
    } finally {
      setIsGeneratingAiFormula(false);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMoveGlobal}
      onMouseUp={handleMouseUpGlobal}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}
    >
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Top Academic Bar: 1-Click KaTeX Formula Presets & Triggers */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          padding: '10px 16px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderRadius: '14px',
          border: '1px solid rgba(51, 65, 85, 0.7)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '5px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex' }}>
            <Sparkles size={16} />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
            Prof. Joe Academic Teaching Whiteboard
          </span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            | Rotatable Shapes, Inner Text Labels, Smart Relationship Links & Infinite Pan
          </span>
        </div>

        {/* Action Controls & Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
          {/* Relationship Forming Toggle */}
          <button
            type="button"
            onClick={() => {
              setRelationshipMode(prev => !prev);
              setSelectedConnectionId(null);
            }}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: relationshipMode ? 'rgba(6, 182, 212, 0.3)' : 'rgba(30, 41, 59, 0.8)',
              border: relationshipMode ? '1px solid #06b6d4' : '1px solid #334155',
              color: relationshipMode ? '#22d3ee' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: relationshipMode ? '0 0 10px rgba(6, 182, 212, 0.3)' : 'none'
            }}
            title="Toggle Entity Relationship Anchor Spots"
          >
            <Link2 size={13} />
            <span>{relationshipMode ? '🔗 Relationships ON' : '🔗 Connect Spots'}</span>
          </button>

          {/* New Custom Shape Trigger */}
          <button
            type="button"
            onClick={openCustomShapeModal}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(14, 165, 233, 0.25))',
              border: '1px solid #38bdf8',
              color: '#38bdf8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Insert Rich Customizable Vector Shape with Text & Rotation"
          >
            <Shapes size={13} />
            <span>🔷 + Custom Shape</span>
          </button>

          {/* Insert Image Trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid #10b981',
              color: '#34d399',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ImageIcon size={13} />
            <span>🖼️ Image</span>
          </button>

          {/* Sticky Note Trigger */}
          <button
            type="button"
            onClick={() => setShowQuickNoteModal(true)}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid #f59e0b',
              color: '#fbbf24',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <StickyNote size={13} />
            <span>📝 Sticky Note</span>
          </button>

          {/* AI Generator Trigger */}
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(99, 102, 241, 0.25))',
              border: '1px solid #a855f7',
              color: '#c084fc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Wand2 size={13} />
            <span>✨ AI Formula</span>
          </button>

          {/* Custom Formula Trigger */}
          <button
            type="button"
            onClick={() => {
              setEditingItemId(null);
              setCustomFormulaName('');
              setCustomFormulaLatex('');
              setCustomFormulaExplanation('');
              setShowFormulaModal(true);
            }}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: 'rgba(2, 132, 199, 0.2)',
              border: '1px solid #0284c7',
              color: '#38bdf8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={13} />
            <span>+ Custom LaTeX</span>
          </button>

          <div style={{ width: '1px', height: '20px', background: 'rgba(51, 65, 85, 0.8)', margin: '0 2px' }} />

          {/* Preset Formula Chips */}
          {FORMULA_PRESETS.slice(0, 4).map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addFormulaCard(item)}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 500,
                background: 'rgba(30, 41, 59, 0.85)',
                border: '1px solid rgba(51, 65, 85, 0.7)',
                color: '#cbd5e1',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title={`Add KaTeX card: ${item.latex}`}
            >
              {activeFormulaFeedback === item.name ? (
                <>
                  <Check size={11} color="#34d399" />
                  <span style={{ color: '#34d399' }}>Added!</span>
                </>
              ) : (
                item.name
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Board Viewport with Infinite Pan + HTML5 Canvas + Draggable Items */}
      <div
        ref={boardContainerRef}
        style={{
          flex: 1,
          minHeight: '680px',
          height: 'calc(100vh - 210px)',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(51, 65, 85, 0.8)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          background: '#0b1120'
        }}
      >
        {/* Floating Tool Palette Deck */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '1px solid rgba(51, 65, 85, 0.8)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Mode Switchers: Select (Move Objects) vs Hand (Pan Canvas) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <button
              type="button"
              onClick={() => setActiveTool('select')}
              style={{
                padding: '6px 9px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: activeTool === 'select' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                color: activeTool === 'select' ? '#38bdf8' : '#94a3b8',
                borderBottom: activeTool === 'select' ? '2px solid #38bdf8' : '2px solid transparent'
              }}
              title="Select & Move Objects, Shapes & Cards"
            >
              <MousePointer size={14} />
              <span>Select</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('hand')}
              style={{
                padding: '6px 9px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: activeTool === 'hand' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
                color: activeTool === 'hand' ? '#c084fc' : '#94a3b8',
                borderBottom: activeTool === 'hand' ? '2px solid #c084fc' : '2px solid transparent'
              }}
              title="Hand Tool: Pan Entire Canvas Frame"
            >
              <Hand size={14} />
              <span>Hand (Pan)</span>
            </button>
          </div>

          <div style={{ width: '1px', height: '20px', background: 'rgba(51, 65, 85, 0.8)', margin: '0 2px' }} />

          {/* Drawing & Shape Tool Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            {[
              { id: 'pen', icon: <PenTool size={14} />, label: 'Pen' },
              { id: 'highlighter', icon: <Edit3 size={14} />, label: 'Highlighter' },
              { id: 'text', icon: <Type size={14} />, label: 'Text' },
              { id: 'rect', icon: <Square size={14} />, label: 'Box' },
              { id: 'circle', icon: <Circle size={14} />, label: 'Circle' },
              { id: 'triangle', icon: <Triangle size={14} />, label: 'Triangle' },
              { id: 'star', icon: <Star size={14} />, label: 'Star' },
              { id: 'arrow', icon: <ArrowRight size={14} />, label: 'Arrow' },
              { id: 'line', icon: <Minus size={14} />, label: 'Line' },
              { id: 'eraser', icon: <Trash2 size={14} />, label: 'Eraser' }
            ].map(tool => (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveTool(tool.id as any)}
                style={{
                  padding: '6px 9px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  background: activeTool === tool.id ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                  color: activeTool === tool.id ? '#38bdf8' : '#94a3b8',
                  borderBottom: activeTool === tool.id ? '2px solid #38bdf8' : '2px solid transparent'
                }}
                title={tool.label}
              >
                {tool.icon}
                <span>{tool.label}</span>
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '20px', background: 'rgba(51, 65, 85, 0.8)', margin: '0 2px' }} />

          {/* Stroke Width Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            {[
              { w: 2, label: 'Thin' },
              { w: 4, label: 'Med' },
              { w: 8, label: 'Thick' }
            ].map(s => (
              <button
                key={s.w}
                type="button"
                onClick={() => setStrokeWidth(s.w)}
                style={{
                  padding: '3px 6px',
                  borderRadius: '6px',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: strokeWidth === s.w ? 'rgba(56, 189, 248, 0.3)' : 'rgba(30, 41, 59, 0.7)',
                  color: strokeWidth === s.w ? '#38bdf8' : '#94a3b8'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '20px', background: 'rgba(51, 65, 85, 0.8)', margin: '0 2px' }} />

          {/* Color Swatches */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {['#38bdf8', '#a855f7', '#34d399', '#f59e0b', '#ef4444', '#f8fafc'].map(col => (
              <button
                key={col}
                type="button"
                onClick={() => setStrokeColor(col)}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: col,
                  border: strokeColor === col ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  transform: strokeColor === col ? 'scale(1.2)' : 'scale(1)',
                  transition: 'transform 0.15s ease'
                }}
                title={col}
              />
            ))}
          </div>

          <div style={{ width: '1px', height: '20px', background: 'rgba(51, 65, 85, 0.8)', margin: '0 2px' }} />

          {/* Pan & Canvas Reset Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setPanOffset({ x: 0, y: 0 })}
              style={{
                padding: '6px',
                borderRadius: '8px',
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(51, 65, 85, 0.6)',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
              title="Reset Canvas Viewport Position"
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              onClick={() => setShowGrid(prev => !prev)}
              style={{
                padding: '6px',
                borderRadius: '8px',
                background: showGrid ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(51, 65, 85, 0.6)',
                color: showGrid ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer'
              }}
              title="Toggle Background Dot Grid"
            >
              <Grid size={14} />
            </button>
            <button
              type="button"
              onClick={undoCanvas}
              disabled={canvasHistory.length <= 1}
              style={{
                padding: '6px',
                borderRadius: '8px',
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(51, 65, 85, 0.6)',
                color: canvasHistory.length <= 1 ? '#475569' : '#cbd5e1',
                cursor: canvasHistory.length <= 1 ? 'not-allowed' : 'pointer'
              }}
              title="Undo Last Action"
            >
              <Undo size={14} />
            </button>
            <button
              type="button"
              onClick={clearCanvas}
              style={{
                padding: '6px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                cursor: 'pointer'
              }}
              title="Clear Board, Shapes & Cards"
            >
              <Trash2 size={14} />
            </button>
            <button
              type="button"
              onClick={downloadCanvasImage}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontWeight: 600
              }}
              title="Download High-Res PNG"
            >
              <Download size={13} />
              <span>PNG</span>
            </button>
          </div>
        </div>

        {/* Text Tool Floating Inline Input */}
        {textInputPos && (
          <div
            style={{
              position: 'absolute',
              top: Math.max(10, textInputPos.y + panOffset.y),
              left: Math.max(10, textInputPos.x + panOffset.x),
              zIndex: 35,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(15, 23, 42, 0.96)',
              padding: '6px 10px',
              borderRadius: '10px',
              border: '1px solid #38bdf8',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
            }}
          >
            <input
              type="text"
              autoFocus
              value={textInputValue}
              onChange={e => setTextInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') confirmTextInput();
                if (e.key === 'Escape') setTextInputPos(null);
              }}
              placeholder="Type notes / equation label..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: strokeColor,
                fontSize: '0.85rem',
                fontWeight: 600,
                width: '240px'
              }}
            />
            <button
              type="button"
              onClick={confirmTextInput}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#0284c7',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Place
            </button>
            <button
              type="button"
              onClick={() => setTextInputPos(null)}
              style={{
                padding: '4px',
                borderRadius: '6px',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* RELATIONSHIP SVG OVERLAY LAYER (Always rendered & connectable between all shapes, formulas & notes) */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 15
          }}
        >
          <defs>
            <marker
              id="rel-arrowhead-cyan"
              markerWidth="10"
              markerHeight="7"
              refX="8"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#06b6d4" />
            </marker>
            <marker
              id="rel-arrowhead-red"
              markerWidth="10"
              markerHeight="7"
              refX="8"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
            </marker>
          </defs>

          {/* Render Active Connections (Always Visible Even When Connect Spots is OFF) */}
          {connections.map(conn => {
            const fromItem = items.find(c => c.id === conn.fromItemId);
            const toItem = items.find(c => c.id === conn.toItemId);
            if (!fromItem || !toItem) return null;

            const fromCoord = getAnchorCoords(fromItem, conn.fromAnchor);
            const toCoord = getAnchorCoords(toItem, conn.toAnchor);

            const startX = fromCoord.x + panOffset.x;
            const startY = fromCoord.y + panOffset.y;
            const endX = toCoord.x + panOffset.x;
            const endY = toCoord.y + panOffset.y;

            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            const isConnSelected = selectedConnectionId === conn.id;

            return (
              <g key={conn.id}>
                {/* Thick Invisible Click Target for easy selecting */}
                <path
                  d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                  stroke="transparent"
                  strokeWidth="18"
                  fill="none"
                  style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedConnectionId(conn.id);
                    setSelectedItemId(null);
                  }}
                />

                {/* Visible Smart Curve Line */}
                <path
                  d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                  stroke={isConnSelected ? '#ef4444' : '#06b6d4'}
                  strokeWidth={isConnSelected ? '3.5' : '2.5'}
                  strokeDasharray={isConnSelected ? 'none' : '6,4'}
                  fill="none"
                  markerEnd={isConnSelected ? 'url(#rel-arrowhead-red)' : 'url(#rel-arrowhead-cyan)'}
                  style={{ pointerEvents: 'none', transition: 'stroke 0.2s ease' }}
                />

                {/* Cardinal Anchor Dots on Endpoints */}
                <circle cx={startX} cy={startY} r="4.5" fill={isConnSelected ? '#ef4444' : '#06b6d4'} />
                <circle cx={endX} cy={endY} r="4.5" fill={isConnSelected ? '#ef4444' : '#06b6d4'} />

                {/* 1-Click Delete Badge when Connection is Selected */}
                {isConnSelected && (
                  <g
                    transform={`translate(${midX - 35}, ${midY - 14})`}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConnections(prev => prev.filter(c => c.id !== conn.id));
                      setSelectedConnectionId(null);
                    }}
                  >
                    <rect
                      width="70"
                      height="24"
                      rx="6"
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x="35"
                      y="16"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      ✕ Delete
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Live Elastic Connection Drag Preview */}
          {connectingFrom && tempConnectionEnd && (() => {
            const startX = connectingFrom.startX + panOffset.x;
            const startY = connectingFrom.startY + panOffset.y;
            const endX = tempConnectionEnd.x + panOffset.x;
            const endY = tempConnectionEnd.y + panOffset.y;
            const midX = (startX + endX) / 2;

            return (
              <g>
                <path
                  d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                  strokeDasharray="4,4"
                  fill="none"
                  markerEnd="url(#rel-arrowhead-cyan)"
                />
                <circle cx={startX} cy={startY} r="5" fill="#22d3ee" />
                <circle cx={endX} cy={endY} r="5" fill="#22d3ee" />
              </g>
            );
          })()}
        </svg>

        {/* DRAGGABLE & ROTATABLE VECTOR OBJECTS (KaTeX Formulas, Sticky Notes, Images, Shapes) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            pointerEvents: 'none',
            zIndex: 20
          }}
        >
          {items.map(item => {
            const isSelected = selectedItemId === item.id;
            const rot = item.rotation || 0;

            // Anchor Spot Rendering Helper (Common across ALL entity types)
            const renderAnchors = () => {
              if (!relationshipMode) return null;

              const anchors: Array<'top' | 'bottom' | 'left' | 'right'> = ['top', 'bottom', 'left', 'right'];

              return (
                <>
                  {anchors.map(anchor => {
                    const isHovered = hoveredAnchor?.itemId === item.id && hoveredAnchor?.anchor === anchor;
                    const isSource = connectingFrom?.itemId === item.id && connectingFrom?.anchor === anchor;

                    let posStyle: React.CSSProperties = {};
                    if (anchor === 'top') posStyle = { top: '-7px', left: '50%', transform: 'translateX(-50%)' };
                    if (anchor === 'bottom') posStyle = { bottom: '-7px', left: '50%', transform: 'translateX(-50%)' };
                    if (anchor === 'left') posStyle = { left: '-7px', top: '50%', transform: 'translateY(-50%)' };
                    if (anchor === 'right') posStyle = { right: '-7px', top: '50%', transform: 'translateY(-50%)' };

                    return (
                      <div
                        key={anchor}
                        onMouseDown={(e) => handleAnchorMouseDown(e, item, anchor)}
                        onMouseEnter={() => setHoveredAnchor({ itemId: item.id, anchor })}
                        onMouseLeave={() => setHoveredAnchor(null)}
                        style={{
                          position: 'absolute',
                          ...posStyle,
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: isHovered ? '#10b981' : isSource ? '#f59e0b' : '#06b6d4',
                          border: '2px solid #ffffff',
                          boxShadow: isHovered ? '0 0 12px #10b981' : '0 0 8px #06b6d4',
                          cursor: 'crosshair',
                          pointerEvents: 'auto',
                          zIndex: 30,
                          transform: `${posStyle.transform || ''} ${isHovered ? 'scale(1.4)' : 'scale(1)'}`,
                          transition: 'transform 0.15s ease, background 0.15s ease'
                        }}
                        title={`Connect ${anchor} anchor spot`}
                      />
                    );
                  })}
                </>
              );
            };

            // 1. DRAGGABLE & ROTATABLE VECTOR SHAPES WITH INNER TEXT LABELS
            const isShape = item.type !== 'formula' && item.type !== 'note' && item.type !== 'image';

            if (isShape) {
              const shapeColor = item.color || '#38bdf8';
              const sWidth = item.strokeWidth || 3;
              const w = item.width;
              const h = item.height;

              return (
                <div
                  key={item.id}
                  onMouseDown={e => handleItemMouseDown(e, item)}
                  onDoubleClick={() => openEditShapeModal(item)}
                  style={{
                    position: 'absolute',
                    top: item.y,
                    left: item.x,
                    width: `${w}px`,
                    height: `${h}px`,
                    pointerEvents: 'auto',
                    cursor: activeTool === 'select' ? (draggingItemId === item.id ? 'grabbing' : 'grab') : 'default',
                    transform: `rotate(${rot}deg)`,
                    transformOrigin: 'center center',
                    boxSizing: 'border-box'
                  }}
                >
                  {renderAnchors()}

                  {/* Top Rotation Handle & Action Controls on Selection */}
                  {isSelected && activeTool === 'select' && (
                    <>
                      {/* Selection Outline */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: '-5px',
                          border: '1.5px dashed #38bdf8',
                          borderRadius: '8px',
                          pointerEvents: 'none'
                        }}
                      />

                      {/* Rotation Stem & Handle */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '-26px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          zIndex: 40
                        }}
                      >
                        <div
                          onMouseDown={(e) => handleRotateStart(e, item)}
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: '#38bdf8',
                            border: '2px solid #ffffff',
                            cursor: 'grab',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
                          }}
                          title={`Drag to rotate (Current: ${rot}°)`}
                        >
                          <RotateCw size={10} color="#0f172a" />
                        </div>
                        <div style={{ width: '1.5px', height: '8px', background: '#38bdf8' }} />
                      </div>

                      {/* Floating Edit & Delete Action Pill */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '-32px',
                          right: '-8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'rgba(15, 23, 42, 0.95)',
                          padding: '3px 6px',
                          borderRadius: '8px',
                          border: '1px solid rgba(56, 189, 248, 0.6)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                          zIndex: 45
                        }}
                      >
                        {rot !== 0 && (
                          <span style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 700, paddingRight: '2px' }}>
                            {rot}°
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditShapeModal(item);
                          }}
                          style={{
                            background: 'rgba(56, 189, 248, 0.2)',
                            color: '#38bdf8',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '2px 5px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          title="Edit Text, Title & Style"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(item.id);
                          }}
                          style={{
                            background: 'rgba(239, 68, 68, 0.25)',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '2px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}
                          title="Delete Shape"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </>
                  )}

                  {/* SVG Shape Graphic */}
                  <svg
                    style={{ width: '100%', height: '100%', overflow: 'visible' }}
                    viewBox={`0 0 ${w} ${h}`}
                  >
                    {/* Rectangle / Process Box */}
                    {item.type === 'rect' && (
                      <rect
                        x={sWidth / 2}
                        y={sWidth / 2}
                        width={w - sWidth}
                        height={h - sWidth}
                        rx={4}
                        fill="rgba(15, 23, 42, 0.6)"
                        stroke={shapeColor}
                        strokeWidth={sWidth}
                      />
                    )}

                    {/* Rounded Rectangle */}
                    {item.type === 'rounded_rect' && (
                      <rect
                        x={sWidth / 2}
                        y={sWidth / 2}
                        width={w - sWidth}
                        height={h - sWidth}
                        rx={16}
                        fill="rgba(15, 23, 42, 0.6)"
                        stroke={shapeColor}
                        strokeWidth={sWidth}
                      />
                    )}

                    {/* Circle / Ellipse */}
                    {item.type === 'circle' && (
                      <ellipse
                        cx={w / 2}
                        cy={h / 2}
                        rx={(w - sWidth) / 2}
                        ry={(h - sWidth) / 2}
                        fill="rgba(15, 23, 42, 0.6)"
                        stroke={shapeColor}
                        strokeWidth={sWidth}
                      />
                    )}

                    {/* Diamond (Decision Block) */}
                    {item.type === 'diamond' && (
                      <polygon
                        points={`${w / 2},${sWidth} ${w - sWidth},${h / 2} ${w / 2},${h - sWidth} ${sWidth},${h / 2}`}
                        fill="rgba(15, 23, 42, 0.6)"
                        stroke={shapeColor}
                        strokeWidth={sWidth}
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Database Cylinder */}
                    {item.type === 'cylinder' && (() => {
                      const rx = (w - sWidth) / 2;
                      const ry = 14;
                      return (
                        <g>
                          <path
                            d={`M ${sWidth / 2} ${ry} L ${sWidth / 2} ${h - ry} A ${rx} ${ry} 0 0 0 ${w - sWidth / 2} ${h - ry} L ${w - sWidth / 2} ${ry} Z`}
                            fill="rgba(15, 23, 42, 0.6)"
                            stroke={shapeColor}
                            strokeWidth={sWidth}
                          />
                          <ellipse
                            cx={w / 2}
                            cy={ry}
                            rx={rx}
                            ry={ry}
                            fill="rgba(30, 41, 59, 0.8)"
                            stroke={shapeColor}
                            strokeWidth={sWidth}
                          />
                          <ellipse
                            cx={w / 2}
                            cy={h - ry}
                            rx={rx}
                            ry={ry}
                            fill="none"
                            stroke={shapeColor}
                            strokeWidth={sWidth}
                          />
                        </g>
                      );
                    })()}

                    {/* Triangle / Filter */}
                    {item.type === 'triangle' && (
                      <polygon
                        points={`${w / 2},${sWidth} ${w - sWidth},${h - sWidth} ${sWidth},${h - sWidth}`}
                        fill="rgba(15, 23, 42, 0.6)"
                        stroke={shapeColor}
                        strokeWidth={sWidth}
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Hexagon */}
                    {item.type === 'hexagon' && (() => {
                      const offset = 22;
                      return (
                        <polygon
                          points={`${offset},${sWidth} ${w - offset},${sWidth} ${w - sWidth},${h / 2} ${w - offset},${h - sWidth} ${offset},${h - sWidth} ${sWidth},${h / 2}`}
                          fill="rgba(15, 23, 42, 0.6)"
                          stroke={shapeColor}
                          strokeWidth={sWidth}
                          strokeLinejoin="round"
                        />
                      );
                    })()}

                    {/* Parallelogram (I/O Data) */}
                    {item.type === 'parallelogram' && (() => {
                      const skew = 22;
                      return (
                        <polygon
                          points={`${skew},${sWidth} ${w - sWidth},${sWidth} ${w - skew},${h - sWidth} ${sWidth},${h - sWidth}`}
                          fill="rgba(15, 23, 42, 0.6)"
                          stroke={shapeColor}
                          strokeWidth={sWidth}
                          strokeLinejoin="round"
                        />
                      );
                    })()}

                    {/* Cloud (Network) */}
                    {item.type === 'cloud' && (
                      <path
                        d={`M 25 ${h - 18} A 16 16 0 0 1 20 ${h / 2} A 22 22 0 0 1 ${w / 2 - 10} 14 A 24 24 0 0 1 ${w - 24} 24 A 18 18 0 0 1 ${w - 12} ${h - 18} Z`}
                        fill="rgba(15, 23, 42, 0.6)"
                        stroke={shapeColor}
                        strokeWidth={sWidth}
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Speech Callout */}
                    {item.type === 'callout' && (
                      <path
                        d={`M 8 8 L ${w - 8} 8 L ${w - 8} ${h - 22} L 36 ${h - 22} L 18 ${h - 4} L 22 ${h - 22} L 8 ${h - 22} Z`}
                        fill="rgba(15, 23, 42, 0.6)"
                        stroke={shapeColor}
                        strokeWidth={sWidth}
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Pill (Start/End) */}
                    {item.type === 'pill' && (
                      <rect
                        x={sWidth / 2}
                        y={sWidth / 2}
                        width={w - sWidth}
                        height={h - sWidth}
                        rx={(h - sWidth) / 2}
                        fill="rgba(15, 23, 42, 0.6)"
                        stroke={shapeColor}
                        strokeWidth={sWidth}
                      />
                    )}

                    {/* Star */}
                    {item.type === 'star' && (() => {
                      const cx = w / 2;
                      const cy = h / 2;
                      const r = Math.min(w, h) / 2 - sWidth;
                      let pts = '';
                      for (let i = 0; i < 5; i++) {
                        const a1 = (18 + i * 72) * 0.01745;
                        const a2 = (54 + i * 72) * 0.01745;
                        pts += `${Math.cos(a1) * r + cx},${-Math.sin(a1) * r + cy} `;
                        pts += `${Math.cos(a2) * (r / 2) + cx},${-Math.sin(a2) * (r / 2) + cy} `;
                      }
                      return (
                        <polygon
                          points={pts.trim()}
                          fill="rgba(15, 23, 42, 0.6)"
                          stroke={shapeColor}
                          strokeWidth={sWidth}
                          strokeLinejoin="round"
                        />
                      );
                    })()}
                  </svg>

                  {/* Centered Integrated Text & Title Container */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      pointerEvents: 'none',
                      userSelect: 'none',
                      gap: '2px'
                    }}
                  >
                    {item.name && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: shapeColor,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          maxWidth: '90%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.name}
                      </span>
                    )}
                    {item.text && (
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#f8fafc',
                          lineHeight: '1.25',
                          maxWidth: '92%',
                          wordBreak: 'break-word'
                        }}
                      >
                        {item.text}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            // 2. IMAGE CARD
            if (item.type === 'image') {
              return (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    top: item.y,
                    left: item.x,
                    width: `${item.width}px`,
                    background: '#0f172a',
                    border: isSelected ? '2px solid #34d399' : '1.5px solid rgba(52, 211, 153, 0.7)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
                    overflow: 'hidden',
                    pointerEvents: 'auto',
                    cursor: draggingItemId === item.id ? 'grabbing' : 'default'
                  }}
                >
                  {renderAnchors()}
                  {/* Image Header */}
                  <div
                    onMouseDown={e => handleItemMouseDown(e, item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      cursor: 'grab',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Move size={12} color="#ffffff" />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>🖼️ {item.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                  {/* Image Content */}
                  <div style={{ padding: '8px', background: '#0b1120', display: 'flex', justifyContent: 'center' }}>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '8px', objectFit: 'contain' }}
                    />
                  </div>
                </div>
              );
            }

            // 3. STICKY NOTE CARD
            if (item.type === 'note') {
              return (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    top: item.y,
                    left: item.x,
                    width: `${item.width}px`,
                    background: 'rgba(245, 158, 11, 0.95)',
                    border: isSelected ? '2px solid #ffffff' : '1px solid #fde047',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    pointerEvents: 'auto',
                    cursor: draggingItemId === item.id ? 'grabbing' : 'default'
                  }}
                >
                  {renderAnchors()}
                  {/* Note Header */}
                  <div
                    onMouseDown={e => handleItemMouseDown(e, item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      background: '#d97706',
                      cursor: 'grab',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Move size={12} color="#ffffff" />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>📌 STICKY NOTE</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                  {/* Note Content */}
                  <div style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#1e293b', fontWeight: 600, lineHeight: '1.4' }}>
                    {item.explanation}
                  </div>
                </div>
              );
            }

            // 4. TRUE KATEX FORMULA CARD
            let renderedHtml = '';
            try {
              renderedHtml = katex.renderToString(item.latex || '', { displayMode: true, throwOnError: false });
            } catch (err) {
              renderedHtml = `<span style="color:#f87171">${item.latex}</span>`;
            }

            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  top: item.y,
                  left: item.x,
                  width: `${item.width}px`,
                  background: 'rgba(15, 23, 42, 0.96)',
                  backdropFilter: 'blur(12px)',
                  border: isSelected ? '2px solid #38bdf8' : '1.5px solid rgba(56, 189, 248, 0.6)',
                  borderRadius: '12px',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
                  overflow: 'hidden',
                  pointerEvents: 'auto',
                  cursor: draggingItemId === item.id ? 'grabbing' : 'default',
                  transition: draggingItemId === item.id ? 'none' : 'box-shadow 0.2s ease'
                }}
              >
                {renderAnchors()}

                {/* Card Header Bar (Draggable Handle) */}
                <div
                  onMouseDown={e => handleItemMouseDown(e, item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    cursor: 'grab',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Move size={12} color="#ffffff" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>📐 {item.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {/* Copy LaTeX */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(item.latex || '');
                        setActiveFormulaFeedback(`Copied: ${item.name}`);
                        setTimeout(() => setActiveFormulaFeedback(null), 2000);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '3px 6px',
                        color: '#ffffff',
                        fontSize: '0.68rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      title="Copy LaTeX"
                    >
                      <Copy size={11} />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(item);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '3px 6px',
                        color: '#ffffff',
                        fontSize: '0.68rem',
                        cursor: 'pointer'
                      }}
                      title="Edit Formula"
                    >
                      Edit
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.3)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '3px',
                        color: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex'
                      }}
                      title="Remove from Chalkboard"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>

                {/* KaTeX Mathematical Rendering Container */}
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(11, 17, 32, 0.9)',
                    overflowX: 'auto',
                    textAlign: 'center',
                    color: '#f8fafc',
                    borderBottom: item.explanation ? '1px solid rgba(51, 65, 85, 0.6)' : 'none'
                  }}
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />

                {/* Subtitle Explanation */}
                {item.explanation && (
                  <div style={{ padding: '8px 12px', fontSize: '0.72rem', color: '#94a3b8', lineHeight: '1.4' }}>
                    💡 {item.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* HTML5 Canvas (Chalkboard Freehand & Arrow Ink) */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{
            width: '100%',
            height: '100%',
            cursor: activeTool === 'hand' ? (isPanning ? 'grabbing' : 'grab') : activeTool === 'text' ? 'text' : activeTool === 'eraser' ? 'cell' : activeTool === 'select' ? 'default' : 'crosshair'
          }}
        />
      </div>

      {/* CUSTOM SHAPE CREATOR & EDIT PALETTE MODAL */}
      {showCustomShapeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div
            style={{
              width: '540px',
              maxWidth: '92vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#0f172a',
              borderRadius: '18px',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              padding: '22px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shapes size={20} color="#38bdf8" />
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                  {editingShapeId ? 'Edit Shape & Inner Text' : 'Insert Custom Vector Shape'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomShapeModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Shape Category Grid */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                Select Shape Architecture:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {SHAPE_CATALOG.map(s => {
                  const isCur = shapeFormType === s.type;
                  return (
                    <button
                      key={s.type}
                      type="button"
                      onClick={() => setShapeFormType(s.type)}
                      style={{
                        padding: '10px 6px',
                        borderRadius: '10px',
                        background: isCur ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.8)',
                        border: isCur ? '1.5px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.8)',
                        color: isCur ? '#38bdf8' : '#cbd5e1',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {s.icon}
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, textAlign: 'center' }}>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text Input Inside Shape */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Text / Label Inside Shape:
              </label>
              <textarea
                autoFocus
                value={shapeFormText}
                onChange={e => setShapeFormText(e.target.value)}
                placeholder="e.g., Hidden State h_t = tanh(W_h h_{t-1} + W_x x_t)"
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Optional Shape Title Banner */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Shape Header Title (Optional):
              </label>
              <input
                type="text"
                value={shapeFormTitle}
                onChange={e => setShapeFormTitle(e.target.value)}
                placeholder="e.g., Decision Gate, Input Vector, Output Layer"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.82rem'
                }}
              />
            </div>

            {/* Color & Rotation Controls Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Color Theme */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Outline Theme Color:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {['#38bdf8', '#a855f7', '#34d399', '#f59e0b', '#ef4444', '#f8fafc'].map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setShapeFormColor(col)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: col,
                        border: shapeFormColor === col ? '2.5px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                        transform: shapeFormColor === col ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Rotation Angle with Slider & Number Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8' }}>
                    Rotation Angle:
                  </label>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>
                    {shapeFormRotation}°
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={shapeFormRotation}
                    onChange={e => setShapeFormRotation(parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: '#38bdf8', cursor: 'pointer' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShapeFormRotation(prev => (prev + 90) % 360)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid #334155',
                      color: '#cbd5e1',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                    title="+90° Rotate"
                  >
                    <RotateCw size={11} />
                    <span>+90°</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sizing Preset (When creating new shape) */}
            {!editingShapeId && (
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Initial Size Preset:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'sm', label: 'Compact' },
                    { id: 'md', label: 'Medium (Standard)' },
                    { id: 'lg', label: 'Large (Hero)' }
                  ].map(sz => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setShapeFormSize(sz.id as any)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: shapeFormSize === sz.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                        border: shapeFormSize === sz.id ? '1px solid #38bdf8' : '1px solid #334155',
                        color: shapeFormSize === sz.id ? '#38bdf8' : '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setShowCustomShapeModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid #334155',
                  color: '#cbd5e1',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomShape}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)'
                }}
              >
                <Shapes size={14} />
                <span>{editingShapeId ? 'Update Shape' : 'Insert Shape to Board'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STICKY QUICK NOTE MODAL */}
      {showQuickNoteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)'
          }}
        >
          <div
            style={{
              width: '420px',
              maxWidth: '90vw',
              background: '#0f172a',
              borderRadius: '16px',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              padding: '20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StickyNote size={18} color="#fbbf24" />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  Add Sticky Note on Chalkboard
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickNoteModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Note Content:
              </label>
              <textarea
                autoFocus
                value={quickNoteText}
                onChange={e => setQuickNoteText(e.target.value)}
                placeholder="e.g., Remember: Dijkstra does not support negative edge weights!"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowQuickNoteModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid #334155',
                  color: '#cbd5e1',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addStickyNoteCard}
                disabled={!quickNoteText.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: !quickNoteText.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                Add Note to Chalkboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM / EDIT FORMULA MODAL WITH LIVE KATEX PREVIEW */}
      {showFormulaModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)'
          }}
        >
          <div
            style={{
              width: '500px',
              maxWidth: '90vw',
              background: '#0f172a',
              borderRadius: '16px',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              padding: '20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="#38bdf8" />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  {editingItemId ? 'Edit KaTeX Formula Card' : 'Add Custom KaTeX Formula'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Formula Title */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Formula Title:
              </label>
              <input
                type="text"
                value={customFormulaName}
                onChange={e => setCustomFormulaName(e.target.value)}
                placeholder="e.g., Scaled Dot-Product Attention"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* LaTeX Code */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                LaTeX Mathematical Code:
              </label>
              <textarea
                value={customFormulaLatex}
                onChange={e => setCustomFormulaLatex(e.target.value)}
                placeholder="e.g., \text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V"
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#38bdf8',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            {/* Live KaTeX Rendered Preview */}
            {customFormulaLatex.trim() && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#0b1120',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Live KaTeX Rendered Preview:
                </span>
                <div
                  style={{ overflowX: 'auto', padding: '6px 0', color: '#f8fafc', textAlign: 'center' }}
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      try {
                        return katex.renderToString(customFormulaLatex.trim(), { displayMode: true, throwOnError: false });
                      } catch (e) {
                        return `<span style="color:#f87171">LaTeX Syntax Error</span>`;
                      }
                    })()
                  }}
                />
              </div>
            )}

            {/* Optional Explanation */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Explanation / Note (Optional):
              </label>
              <input
                type="text"
                value={customFormulaExplanation}
                onChange={e => setCustomFormulaExplanation(e.target.value)}
                placeholder="One-line summary for students"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.8rem'
                }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid #334155',
                  color: '#cbd5e1',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFormula}
                disabled={!customFormulaName.trim() || !customFormulaLatex.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: (!customFormulaName.trim() || !customFormulaLatex.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {editingItemId ? 'Update Card' : 'Add to Chalkboard'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI FORMULA GENERATOR MODAL WITH PROVIDER & MODEL SELECTION */}
      {showAiModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)'
          }}
        >
          <div
            style={{
              width: '480px',
              maxWidth: '90vw',
              background: '#0f172a',
              borderRadius: '16px',
              border: '1px solid rgba(168, 85, 247, 0.5)',
              padding: '20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wand2 size={18} color="#c084fc" />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  Ask AI to Generate KaTeX Formula
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Provider & Model Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  AI Provider:
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => {
                    const prov = e.target.value;
                    setSelectedProvider(prov);
                    const opt = PROVIDER_OPTIONS.find(o => o.id === prov);
                    if (opt) setSelectedModel(opt.defaultModel);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    fontSize: '0.78rem'
                  }}
                >
                  {PROVIDER_OPTIONS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Model:
                </label>
                <input
                  type="text"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    fontSize: '0.78rem'
                  }}
                />
              </div>
            </div>

            {/* Prompt Input */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Formula Concept or Topic:
              </label>
              <input
                type="text"
                autoFocus
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !isGeneratingAiFormula) handleGenerateAiFormula();
                }}
                placeholder="e.g., Attention Matrix, Shannon Channel Capacity, LeakyReLU"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Suggestions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Attention Matrix', 'Transformer LayerNorm', 'CNN Feature Dimension', 'Shannon Capacity', 'Information Gain'].map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAiPrompt(s)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(168, 85, 247, 0.15)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    color: '#c084fc',
                    fontSize: '0.7rem',
                    cursor: 'pointer'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid #334155',
                  color: '#cbd5e1',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateAiFormula}
                disabled={!aiPrompt.trim() || isGeneratingAiFormula}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: (!aiPrompt.trim() || isGeneratingAiFormula) ? 'not-allowed' : 'pointer'
                }}
              >
                <Sparkles size={14} />
                <span>{isGeneratingAiFormula ? 'Generating...' : 'Generate & Add Card'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
