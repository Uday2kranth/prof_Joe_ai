import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Lock, Unlock, Trash2, Box, X, Search, Copy, Sparkles, RefreshCw, Send,
  Undo, Redo, ZoomOut, ZoomIn, Play, Pause, Clock, Hand, Move, PenTool, Type, Eraser, Briefcase
} from 'lucide-react';
import { GIZMOS_CATALOG, GIZMO_CATEGORIES, type GizmoItem } from '../../data/gizmosCatalog';
import { sendChatMessage } from '../../services/apiService';
import type { Message, UserKeys } from '../../types';

export type DrawingToolType =
  | 'select'
  | 'hand'
  | 'pen'
  | 'highlighter'
  | 'line'
  | 'arrow'
  | 'double_arrow'
  | 'curve'
  | 'shape_circle'
  | 'shape_rect'
  | 'shape_triangle'
  | 'shape_polygon'
  | 'shape_star'
  | 'shape_diamond'
  | 'shape_cylinder'
  | 'shape_cube'
  | 'shape_cone'
  | 'shape_speech_bubble'
  | 'shape_thought_bubble'
  | 'shape_arrow_block'
  | 'shape_parallelogram'
  | 'shape_heart'
  | 'magic_draw'
  | 'eraser_object'
  | 'eraser_whiteout';

export interface BoardStroke {
  id: string;
  tool: DrawingToolType;
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
  isDashed: boolean;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  fillMode?: 'pastel' | 'solid' | 'none';
  cornerRadius?: number;
  opacity: number;
  polygonEdges?: number;
}

export interface BoardPlacedItem {
  id: string;
  gizmoId?: string;
  iconifyIcon?: string;
  type: 'gizmo' | 'shape' | 'text' | 'postit' | 'katex' | 'dice_spinner' | 'piano_widget';
  name: string;
  category?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
  zIndex: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  locked?: boolean;
  flipped?: boolean;
  svgContent?: string;
  text?: string;
  latex?: string;
  label?: string;
  polygonEdges?: number;
  widgetData?: any;
  animation?: {
    type: 'none' | 'rotate' | 'move' | 'color';
    speed: number;
    active: boolean;
    waypoint?: { x: number; y: number }; // Point B target coordinates for Animate-Move
  };
}

export interface BoardConnection {
  id: string;
  fromId: string;
  fromAnchor: 'top' | 'bottom' | 'left' | 'right';
  toId: string;
  toAnchor: 'top' | 'bottom' | 'left' | 'right';
  label?: string;
  style: 'solid' | 'dashed';
  color: string;
}

export const SmartTeachingBoardModule: React.FC = () => {
  // ─── 1. DYNAMIC THEME TRACKING ───
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return document.documentElement.getAttribute('data-theme') === 'light';
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      setIsLightMode(isLight);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-atmosphere'] });
    return () => observer.disconnect();
  }, []);

  // ─── 2. TOOL SELECTION & FLYOUT STATES ───
  const [activeTool, setActiveTool] = useState<DrawingToolType>('pen');
  const [activeFlyout, setActiveFlyout] = useState<'none' | 'pen' | 'text' | 'eraser' | 'upload' | 'tools'>('none');
  const [polygonEdgeCount, setPolygonEdgeCount] = useState<number>(5);

  // Line & Fill Styling Modifiers
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [fillMode, setFillMode] = useState<'pastel' | 'solid' | 'none'>('pastel');
  const [shapeCornerRadius, setShapeCornerRadius] = useState<number>(8);

  // Interactive Classroom Widgets
  const [isProtractorVisible, setIsProtractorVisible] = useState<boolean>(false);
  const [protractorPos, setProtractorPos] = useState<{ x: number; y: number; rotation: number }>({ x: 300, y: 250, rotation: 0 });
  const [, setIsDraggingProtractor] = useState<boolean>(false);

  const [isDiceRollerVisible, setIsDiceRollerVisible] = useState<boolean>(false);
  const [diceValue, setDiceValue] = useState<number>(6);
  const [isDiceRolling, setIsDiceRolling] = useState<boolean>(false);

  const [isTrafficLightVisible, setIsTrafficLightVisible] = useState<boolean>(false);
  const [trafficStatus, setTrafficStatus] = useState<'red' | 'yellow' | 'green'>('green');

  const [isStudentPickerVisible, setIsStudentPickerVisible] = useState<boolean>(false);
  const [studentList] = useState<string>('Alex, Maya, Priya, Rohan, Sarah, Liam, Jin, Fatima, David, Chen');
  const [pickedStudent, setPickedStudent] = useState<string | null>(null);
  const [isPickingStudent, setIsPickingStudent] = useState<boolean>(false);

  // Classroom Countdown Timer & Stopwatch Widget
  const [timerSeconds, setTimerSeconds] = useState<number>(300);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isStopwatchMode] = useState<boolean>(false);

  // Global Dashed Stroke Modifier Switch
  const [isDashedMode, setIsDashedMode] = useState<boolean>(false);

  // Global Animation Pause Toggle
  const [areAnimationsPaused, setAreAnimationsPaused] = useState<boolean>(false);

  // Waypoint Path Setting Mode
  const [settingWaypointForId, setSettingWaypointForId] = useState<string | null>(null);

  // Brush & Styling Attributes
  const [currentColor, setCurrentColor] = useState<string>('#38bdf8');
  const [strokeThickness, setStrokeThickness] = useState<number>(4);

  // Canvas Viewport & Background State
  const [bgGridType, setBgGridType] = useState<'grid' | 'dots' | 'isometric' | 'lined' | 'none'>('grid');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Freehand Inking & Stroke State (Dual-Layer Drawing Engine)
  const [strokes, setStrokes] = useState<BoardStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<BoardStroke | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  // Placed Interactive Items & Connectors State
  const [items, setItems] = useState<BoardPlacedItem[]>([
    {
      id: 'item_init_1',
      type: 'gizmo',
      gizmoId: 'robot_classroom_tutor',
      name: 'Classroom Tutor Bot',
      category: 'others_robots',
      x: 120,
      y: 130,
      width: 100,
      height: 110,
      scale: 1,
      rotation: 0,
      zIndex: 1,
      svgContent: GIZMOS_CATALOG.find(g => g.id === 'bot_tutor')?.svgContent || GIZMOS_CATALOG[0].svgContent,
      label: 'Tutor Bot Avatar',
      animation: { type: 'none', speed: 1, active: false }
    },
    {
      id: 'item_init_2',
      type: 'gizmo',
      gizmoId: 'logic_and',
      name: 'Digital AND Gate',
      category: 'exp_electrical',
      x: 340,
      y: 150,
      width: 120,
      height: 80,
      scale: 1,
      rotation: 0,
      zIndex: 2,
      svgContent: GIZMOS_CATALOG.find(g => g.id === 'logic_and')?.svgContent || '',
      label: '7408 AND Logic',
      animation: { type: 'none', speed: 1, active: false }
    },
    {
      id: 'item_init_3',
      type: 'postit',
      name: 'Yellow Sticky Note',
      x: 550,
      y: 130,
      width: 150,
      height: 130,
      scale: 1,
      rotation: 0,
      zIndex: 3,
      fillColor: '#fef08a',
      color: '#854d0e',
      text: '📌 Rule: Output Q is HIGH (1) only when BOTH input pins A & B are 1.',
      label: 'Lecture Note'
    },
    {
      id: 'item_init_4',
      type: 'gizmo',
      gizmoId: 'fb_2',
      name: 'Teacher Stamp: This Rocks!',
      category: 'stickers_feedback',
      x: 750,
      y: 150,
      width: 120,
      height: 60,
      scale: 1,
      rotation: 0,
      zIndex: 4,
      svgContent: GIZMOS_CATALOG.find(g => g.id === 'fb_2')?.svgContent || '',
      label: 'Grade Stamp',
      animation: { type: 'color', speed: 1, active: true }
    }
  ]);

  const [connections, setConnections] = useState<BoardConnection[]>([
    {
      id: 'conn_1',
      fromId: 'item_init_1',
      fromAnchor: 'right',
      toId: 'item_init_2',
      toAnchor: 'left',
      label: 'Input Data Stream',
      style: 'dashed',
      color: '#38bdf8'
    },
    {
      id: 'conn_2',
      fromId: 'item_init_2',
      fromAnchor: 'right',
      toId: 'item_init_3',
      toAnchor: 'left',
      label: 'Truth Evaluation',
      style: 'solid',
      color: '#a855f7'
    }
  ]);

  // History Stack for Undo/Redo
  const [historyStack, setHistoryStack] = useState<{ items: BoardPlacedItem[]; strokes: BoardStroke[]; connections: BoardConnection[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ items: BoardPlacedItem[]; strokes: BoardStroke[]; connections: BoardConnection[] }[]>([]);

  // Gizmos Deck Drawer State (Docked outside as an Overlay Drawer)
  const [isGizmoDrawerOpen, setIsGizmoDrawerOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected item & connecting anchor states
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<{
    itemId: string;
    anchor: 'top' | 'bottom' | 'left' | 'right';
  } | null>(null);

  // AI Prompt Composer State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [animTime, setAnimTime] = useState<number>(0);

  // Live RAF Animation Loop (Calculates continuous rotation, sinusoidal waypoint movement, and breathing glow)
  useEffect(() => {
    let startTime = performance.now();
    const loop = (time: number) => {
      if (!areAnimationsPaused) {
        setAnimTime((time - startTime) / 1000);
      }
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [areAnimationsPaused]);

  // Push Snapshot to History for Undo
  const pushHistorySnapshot = () => {
    setHistoryStack(prev => [...prev, { items, strokes, connections }]);
    setRedoStack([]);
  };

  // Timer & Stopwatch Tick
  useEffect(() => {
    let timerInterval: any = null;
    if (isTimerRunning) {
      timerInterval = setInterval(() => {
        if (isStopwatchMode) {
          setTimerSeconds((prev: number) => prev + 1);
        } else {
          setTimerSeconds((prev: number) => {
            if (prev <= 1) {
              setIsTimerRunning(false);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isTimerRunning, isStopwatchMode]);

  // Filtered Gizmos
  const filteredGizmos = GIZMOS_CATALOG.filter(gizmo => {
    const matchesCategory = selectedCategory === 'all' || gizmo.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      gizmo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gizmo.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
      gizmo.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Stamp Item onto Canvas
  const handleStampItem = (itemConfig: Partial<BoardPlacedItem>) => {
    pushHistorySnapshot();

    const nextZ = items.length > 0 ? Math.max(...items.map(i => i.zIndex)) + 1 : 1;
    const offsetX = (items.length % 6) * 35 - panOffset.x + 220;
    const offsetY = (items.length % 5) * 30 - panOffset.y + 140;

    const newItem: BoardPlacedItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: itemConfig.type || 'gizmo',
      name: itemConfig.name || 'Placed Item',
      category: itemConfig.category,
      gizmoId: itemConfig.gizmoId,
      iconifyIcon: itemConfig.iconifyIcon,
      x: offsetX,
      y: offsetY,
      width: itemConfig.width || 100,
      height: itemConfig.height || 100,
      scale: 1,
      rotation: 0,
      zIndex: nextZ,
      color: itemConfig.color || currentColor,
      fillColor: itemConfig.fillColor,
      strokeWidth: itemConfig.strokeWidth || strokeThickness,
      svgContent: itemConfig.svgContent,
      text: itemConfig.text,
      latex: itemConfig.latex,
      label: itemConfig.label,
      polygonEdges: itemConfig.polygonEdges,
      widgetData: itemConfig.widgetData,
      animation: { type: 'none', speed: 1, active: false }
    };

    setItems(prev => [...prev, newItem]);
    setSelectedItemId(newItem.id);
  };

  // Stamp a Gizmo from Catalog
  const handleStampGizmo = (gizmo: GizmoItem) => {
    handleStampItem({
      type: 'gizmo',
      gizmoId: gizmo.id,
      name: gizmo.name,
      category: gizmo.category,
      width: gizmo.width,
      height: gizmo.height,
      svgContent: gizmo.svgContent,
      label: gizmo.badge || gizmo.name
    });
  };

  // ─── DUAL-LAYER INKING & DRAWING LOGIC (Touch + Mouse Support) ───
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left - panOffset.x) / zoomLevel,
      y: (clientY - rect.top - panOffset.y) / zoomLevel
    };
  };

  // Dragging Placed Items
  const draggingItemRef = useRef<{ id: string; startX: number; startY: number; itemX: number; itemY: number } | null>(null);

  const handleItemMouseDown = (e: React.MouseEvent, item: BoardPlacedItem) => {
    if (item.locked) return;
    if (activeTool === 'hand') return;

    // If in Object Eraser Mode, delete on click!
    if (activeTool === 'eraser_object') {
      pushHistorySnapshot();
      setItems(prev => prev.filter(i => i.id !== item.id));
      setConnections(prev => prev.filter(c => c.fromId !== item.id && c.toId !== item.id));
      return;
    }

    if (settingWaypointForId === item.id) return;

    e.stopPropagation();
    setSelectedItemId(item.id);

    draggingItemRef.current = {
      id: item.id,
      startX: e.clientX,
      startY: e.clientY,
      itemX: item.x,
      itemY: item.y
    };
  };

  const handleItemTouchStart = (e: React.TouchEvent, item: BoardPlacedItem) => {
    if (item.locked) return;
    if (activeTool === 'hand') return;

    if (activeTool === 'eraser_object') {
      pushHistorySnapshot();
      setItems(prev => prev.filter(i => i.id !== item.id));
      setConnections(prev => prev.filter(c => c.fromId !== item.id && c.toId !== item.id));
      return;
    }

    if (settingWaypointForId === item.id) return;

    if (e.touches.length > 0) {
      e.stopPropagation();
      setSelectedItemId(item.id);
      draggingItemRef.current = {
        id: item.id,
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        itemX: item.x,
        itemY: item.y
      };
    }
  };

  // Canvas Mouse Down
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (settingWaypointForId) {
      handleSetWaypointPointB(settingWaypointForId, e);
      return;
    }

    if (activeTool === 'hand' || e.button === 1 || (activeTool === 'select' && e.target === boardRef.current)) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      setSelectedItemId(null);
      setActiveFlyout('none');
      return;
    }

    if (
      activeTool === 'pen' ||
      activeTool === 'highlighter' ||
      activeTool === 'line' ||
      activeTool === 'arrow' ||
      activeTool === 'double_arrow' ||
      activeTool === 'curve' ||
      activeTool.startsWith('shape_') ||
      activeTool === 'magic_draw' ||
      activeTool === 'eraser_whiteout'
    ) {
      isDrawingRef.current = true;
      const pt = getCanvasCoords(e);

      const isHighlighter = activeTool === 'highlighter';
      const isDashed = isHighlighter ? false : (lineStyle === 'dashed' || lineStyle === 'dotted' || isDashedMode);
      const stroke: BoardStroke = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        tool: activeTool,
        points: [pt, pt],
        color: activeTool === 'eraser_whiteout' ? '#090d16' : currentColor,
        strokeWidth: isHighlighter ? 24 : strokeThickness,
        isDashed,
        lineStyle,
        fillMode,
        cornerRadius: shapeCornerRadius,
        opacity: isHighlighter ? 0.35 : 1,
        polygonEdges: polygonEdgeCount
      };

      setCurrentStroke(stroke);
    }
  };

  // Canvas Touch Start
  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];

    if (settingWaypointForId) {
      handleSetWaypointPointB(settingWaypointForId, e);
      return;
    }

    if (activeTool === 'hand' || (activeTool === 'select' && e.target === boardRef.current)) {
      setIsPanning(true);
      panStartRef.current = { x: touch.clientX, y: touch.clientY };
      setSelectedItemId(null);
      setActiveFlyout('none');
      return;
    }

    if (
      activeTool === 'pen' ||
      activeTool === 'highlighter' ||
      activeTool === 'line' ||
      activeTool === 'arrow' ||
      activeTool === 'double_arrow' ||
      activeTool === 'curve' ||
      activeTool.startsWith('shape_') ||
      activeTool === 'magic_draw' ||
      activeTool === 'eraser_whiteout'
    ) {
      isDrawingRef.current = true;
      const pt = getCanvasCoords(e);

      const isHighlighter = activeTool === 'highlighter';
      const isDashed = isHighlighter ? false : (lineStyle === 'dashed' || lineStyle === 'dotted' || isDashedMode);
      const stroke: BoardStroke = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        tool: activeTool,
        points: [pt, pt],
        color: activeTool === 'eraser_whiteout' ? '#090d16' : currentColor,
        strokeWidth: isHighlighter ? 24 : strokeThickness,
        isDashed,
        lineStyle,
        fillMode,
        cornerRadius: shapeCornerRadius,
        opacity: isHighlighter ? 0.35 : 1,
        polygonEdges: polygonEdgeCount
      };

      setCurrentStroke(stroke);
    }
  };

  // Global Mouse Move
  const handleGlobalMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      panStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (draggingItemRef.current) {
      const { id, startX, startY, itemX, itemY } = draggingItemRef.current;
      const dx = (e.clientX - startX) / zoomLevel;
      const dy = (e.clientY - startY) / zoomLevel;
      setItems(prev =>
        prev.map(it => (it.id === id ? { ...it, x: Math.round(itemX + dx), y: Math.round(itemY + dy) } : it))
      );
      return;
    }

    if (isDrawingRef.current && currentStroke) {
      const pt = getCanvasCoords(e);
      if (
        currentStroke.tool === 'pen' ||
        currentStroke.tool === 'highlighter' ||
        currentStroke.tool === 'magic_draw' ||
        currentStroke.tool === 'eraser_whiteout'
      ) {
        setCurrentStroke(prev => (prev ? { ...prev, points: [...prev.points, pt] } : null));
      } else {
        setCurrentStroke(prev => (prev ? { ...prev, points: [prev.points[0], pt] } : null));
      }
    }
  }, [isPanning, zoomLevel, currentStroke]);

  // Global Touch Move
  const handleGlobalTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];

    if (isPanning) {
      const dx = touch.clientX - panStartRef.current.x;
      const dy = touch.clientY - panStartRef.current.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      panStartRef.current = { x: touch.clientX, y: touch.clientY };
      return;
    }

    if (draggingItemRef.current) {
      const { id, startX, startY, itemX, itemY } = draggingItemRef.current;
      const dx = (touch.clientX - startX) / zoomLevel;
      const dy = (touch.clientY - startY) / zoomLevel;
      setItems(prev =>
        prev.map(it => (it.id === id ? { ...it, x: Math.round(itemX + dx), y: Math.round(itemY + dy) } : it))
      );
      return;
    }

    if (isDrawingRef.current && currentStroke) {
      const pt = getCanvasCoords(e);
      if (
        currentStroke.tool === 'pen' ||
        currentStroke.tool === 'highlighter' ||
        currentStroke.tool === 'magic_draw' ||
        currentStroke.tool === 'eraser_whiteout'
      ) {
        setCurrentStroke(prev => (prev ? { ...prev, points: [...prev.points, pt] } : null));
      } else {
        setCurrentStroke(prev => (prev ? { ...prev, points: [prev.points[0], pt] } : null));
      }
    }
  }, [isPanning, zoomLevel, currentStroke]);

  // Global Mouse Up / Touch End
  const handleGlobalMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (draggingItemRef.current) {
      draggingItemRef.current = null;
    }
    if (isDrawingRef.current && currentStroke) {
      isDrawingRef.current = false;
      pushHistorySnapshot();
      setStrokes(prev => [...prev, currentStroke]);
      setCurrentStroke(null);
    }
  }, [isPanning, currentStroke]);

  // Set Waypoint Point B for Animate-Move
  const handleSetWaypointPointB = (itemId: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const pt = getCanvasCoords(e);

    setItems(prev =>
      prev.map(i => {
        if (i.id !== itemId) return i;
        return {
          ...i,
          animation: {
            type: 'move',
            speed: 1,
            active: true,
            waypoint: { x: Math.round(pt.x - i.width / 2), y: Math.round(pt.y - i.height / 2) }
          }
        };
      })
    );
    setSettingWaypointForId(null);
    setAiStatusMessage('✨ Waypoint trajectory path set! Object is moving back and forth (A ↔ B).');
    setTimeout(() => setAiStatusMessage(null), 3500);
  };

  // Cardinal Anchor Coordinates
  const getAnchorPosition = (item: BoardPlacedItem, anchor: 'top' | 'bottom' | 'left' | 'right') => {
    let currentX = item.x;
    let currentY = item.y;

    if (item.animation?.active && item.animation.type === 'move' && item.animation.waypoint) {
      const t = (Math.sin(animTime * 2 * item.animation.speed) + 1) / 2;
      currentX = item.x + (item.animation.waypoint.x - item.x) * t;
      currentY = item.y + (item.animation.waypoint.y - item.y) * t;
    }

    const cx = currentX + (item.width * item.scale) / 2;
    const cy = currentY + (item.height * item.scale) / 2;

    switch (anchor) {
      case 'top': return { x: cx, y: currentY };
      case 'bottom': return { x: cx, y: currentY + item.height * item.scale };
      case 'left': return { x: currentX, y: cy };
      case 'right': return { x: currentX + item.width * item.scale, y: cy };
    }
  };

  // Handle Anchor Click to Connect
  const handleAnchorClick = (itemId: string, anchor: 'top' | 'bottom' | 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!connectingFrom) {
      setConnectingFrom({ itemId, anchor });
    } else {
      if (connectingFrom.itemId !== itemId) {
        pushHistorySnapshot();
        const newConn: BoardConnection = {
          id: `conn_${Date.now()}`,
          fromId: connectingFrom.itemId,
          fromAnchor: connectingFrom.anchor,
          toId: itemId,
          toAnchor: anchor,
          label: 'Dataflow Link',
          style: isDashedMode ? 'dashed' : 'solid',
          color: currentColor
        };
        setConnections(prev => [...prev, newConn]);
      }
      setConnectingFrom(null);
    }
  };

  // 🤖 AI Multi-Sticker Auto-Layout Composer
  const handleAiAutoLayout = async (customPrompt?: string) => {
    const promptText = customPrompt || aiPrompt;
    if (!promptText.trim()) return;

    setIsAiGenerating(true);
    setAiStatusMessage('AI analyzing teaching concepts & composing multi-gizmo layout...');

    try {
      const systemInstruction = `You are the Prof. Joe Smart Teaching Whiteboard AI Assistant.
Generate a structured multi-object teaching schema with vector gizmos, post-it notes, logic gates, and labeled connectors.
Available Gizmo IDs in catalog:
- math_base10: "base10_cube_1000", "base10_flat_100", "base10_rod_10"
- exp_electrical: "logic_and_gate", "logic_not_inverter"
- others_robots: "robot_classroom_tutor", "robot_astro_mech", "robot_industrial_arm"
- stickers_feedback: "feedback_study", "feedback_this_rocks", "feedback_try_again", "feedback_show_proof"
- alphabets_telugu: "telugu_vowel_1", "telugu_consonant_1"
- alphabets_hindi: "hindi_letter_1", "hindi_letter_22"
- fest_holi: "fest_holi_gulal", "fest_ramadan_crescent"
- math_tangram: "tangram_7_pieces"
- others_tech: "tech_wifi_router"

Return ONLY a strictly valid JSON object with NO markdown formatting:
{
  "items": [
    { "gizmoId": "robot_classroom_tutor", "x": 100, "y": 140, "label": "Tutor Bot", "scale": 1 },
    { "gizmoId": "logic_and_gate", "x": 300, "y": 140, "label": "AND Logic", "scale": 1 },
    { "type": "postit", "x": 520, "y": 120, "text": "Logic Truth Table: A=1, B=1 -> Q=1", "fillColor": "#fef08a", "label": "Note" }
  ],
  "connections": [
    { "fromIndex": 0, "toIndex": 1, "label": "Input Stream", "style": "dashed", "color": "#38bdf8" },
    { "fromIndex": 1, "toIndex": 2, "label": "Evaluation", "style": "solid", "color": "#a855f7" }
  ]
}`;

      const activeUser = localStorage.getItem('chatterbot_username') || 'Guest_Student';
      const userKeysStr = localStorage.getItem(`chatterbot_user_keys_${activeUser}`)
        || localStorage.getItem('chatterbot_user_keys')
        || localStorage.getItem('prof_joe_user_keys');
      const userKeys: UserKeys = userKeysStr ? JSON.parse(userKeysStr) : {};
      const messages: Message[] = [{
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        role: 'user',
        content: promptText,
        timestamp: Date.now()
      }];

      const response = await sendChatMessage('gemini', 'gemini-3.6-flash', messages, userKeys, false, 'none', systemInstruction);
      const cleaned = response.content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
        pushHistorySnapshot();
        const newPlacedItems: BoardPlacedItem[] = [];
        const baseZ = items.length > 0 ? Math.max(...items.map(i => i.zIndex)) + 1 : 1;

        parsed.items.forEach((pItem: any, idx: number) => {
          if (pItem.type === 'postit') {
            newPlacedItems.push({
              id: `item_ai_${Date.now()}_${idx}`,
              type: 'postit',
              name: 'Post-it Note',
              x: pItem.x || 100 + idx * 180,
              y: pItem.y || 140,
              width: 140,
              height: 120,
              scale: 1,
              rotation: 0,
              zIndex: baseZ + idx,
              fillColor: pItem.fillColor || '#fef08a',
              color: '#854d0e',
              text: pItem.text || 'Teaching Note',
              label: pItem.label || 'Note'
            });
          } else {
            const catalogItem = GIZMOS_CATALOG.find(g => g.id === pItem.gizmoId) || GIZMOS_CATALOG[0];
            newPlacedItems.push({
              id: `item_ai_${Date.now()}_${idx}`,
              type: 'gizmo',
              gizmoId: catalogItem.id,
              name: catalogItem.name,
              category: catalogItem.category,
              x: pItem.x || 100 + idx * 180,
              y: pItem.y || 140,
              width: catalogItem.width,
              height: catalogItem.height,
              scale: pItem.scale || 1,
              rotation: 0,
              zIndex: baseZ + idx,
              svgContent: catalogItem.svgContent,
              label: pItem.label || catalogItem.badge,
              animation: { type: 'none', speed: 1, active: false }
            });
          }
        });

        const newConns: BoardConnection[] = [];
        if (Array.isArray(parsed.connections)) {
          parsed.connections.forEach((c: any, cIdx: number) => {
            if (newPlacedItems[c.fromIndex] && newPlacedItems[c.toIndex]) {
              newConns.push({
                id: `conn_ai_${Date.now()}_${cIdx}`,
                fromId: newPlacedItems[c.fromIndex].id,
                fromAnchor: 'right',
                toId: newPlacedItems[c.toIndex].id,
                toAnchor: 'left',
                label: c.label || 'Connection',
                style: c.style === 'solid' ? 'solid' : 'dashed',
                color: c.color || '#38bdf8'
              });
            }
          });
        }

        setItems(newPlacedItems);
        setConnections(newConns);
        setAiStatusMessage(`✨ Generated ${newPlacedItems.length} vector objects & labeled connectors!`);
        setTimeout(() => setAiStatusMessage(null), 4000);
      }
    } catch (err) {
      console.warn('AI Composer Fallback:', err);
      const fallbackItem1 = GIZMOS_CATALOG.find(g => g.id === 'bot_tutor') || GIZMOS_CATALOG[0];
      const fallbackItem2 = GIZMOS_CATALOG.find(g => g.id === 'logic_and') || GIZMOS_CATALOG[1] || GIZMOS_CATALOG[0];
      handleStampGizmo(fallbackItem1);
      handleStampGizmo(fallbackItem2);
      setAiStatusMessage('✨ Stamped teaching objects from catalog.');
      setTimeout(() => setAiStatusMessage(null), 3000);
    } finally {
      setIsAiGenerating(false);
      setAiPrompt('');
    }
  };

  // Helper to render SVG paths for strokes & drag-to-draw shapes
  const renderStrokeSVG = (stroke: BoardStroke) => {
    const { tool, points, color, strokeWidth, isDashed, lineStyle: stLineStyle, fillMode: stFillMode, cornerRadius: stRadius, opacity, polygonEdges } = stroke;
    if (!points || points.length === 0) return null;

    let strokeDash: string | undefined = undefined;
    if (stLineStyle === 'dotted') {
      strokeDash = '2 5';
    } else if (stLineStyle === 'dashed' || isDashed) {
      strokeDash = '8 6';
    }

    const currentFillMode = stFillMode || fillMode || 'pastel';
    const getFillColor = (defaultPastel: string) => {
      if (currentFillMode === 'solid') return color;
      if (currentFillMode === 'none') return 'none';
      return defaultPastel;
    };

    if (tool === 'pen' || tool === 'highlighter' || tool === 'magic_draw' || tool === 'eraser_whiteout') {
      if (points.length === 1) {
        return (
          <circle
            key={stroke.id}
            cx={points[0].x}
            cy={points[0].y}
            r={strokeWidth / 2}
            fill={color}
            opacity={opacity}
          />
        );
      }

      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        d += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
      }
      d += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;

      return (
        <path
          key={stroke.id}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={strokeDash}
          opacity={opacity}
        />
      );
    }

    const p0 = points[0];
    const p1 = points[points.length - 1];

    if (tool === 'line') {
      return (
        <line
          key={stroke.id}
          x1={p0.x}
          y1={p0.y}
          x2={p1.x}
          y2={p1.y}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDash}
        />
      );
    }

    if (tool === 'arrow') {
      const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      const headLen = 14;
      const xA = p1.x - headLen * Math.cos(angle - Math.PI / 6);
      const yA = p1.y - headLen * Math.sin(angle - Math.PI / 6);
      const xB = p1.x - headLen * Math.cos(angle + Math.PI / 6);
      const yB = p1.y - headLen * Math.sin(angle + Math.PI / 6);

      return (
        <g key={stroke.id}>
          <line
            x1={p0.x}
            y1={p0.y}
            x2={p1.x}
            y2={p1.y}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          <polygon points={`${p1.x},${p1.y} ${xA},${yA} ${xB},${yB}`} fill={color} />
        </g>
      );
    }

    if (tool === 'double_arrow') {
      const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      const headLen = 14;
      const xA1 = p1.x - headLen * Math.cos(angle - Math.PI / 6);
      const yA1 = p1.y - headLen * Math.sin(angle - Math.PI / 6);
      const xB1 = p1.x - headLen * Math.cos(angle + Math.PI / 6);
      const yB1 = p1.y - headLen * Math.sin(angle + Math.PI / 6);
      const xA0 = p0.x + headLen * Math.cos(angle - Math.PI / 6);
      const yA0 = p0.y + headLen * Math.sin(angle - Math.PI / 6);
      const xB0 = p0.x + headLen * Math.cos(angle + Math.PI / 6);
      const yB0 = p0.y + headLen * Math.sin(angle + Math.PI / 6);

      return (
        <g key={stroke.id}>
          <line
            x1={p0.x}
            y1={p0.y}
            x2={p1.x}
            y2={p1.y}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          <polygon points={`${p1.x},${p1.y} ${xA1},${yA1} ${xB1},${yB1}`} fill={color} />
          <polygon points={`${p0.x},${p0.y} ${xA0},${yA0} ${xB0},${yB0}`} fill={color} />
        </g>
      );
    }

    if (tool === 'curve') {
      const cx = (p0.x + p1.x) / 2 + (p1.y - p0.y) * 0.25;
      const cy = (p0.y + p1.y) / 2 - (p1.x - p0.x) * 0.25;
      return (
        <path
          key={stroke.id}
          d={`M ${p0.x} ${p0.y} Q ${cx} ${cy}, ${p1.x} ${p1.y}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
        />
      );
    }

    if (tool === 'shape_rect') {
      const rx = Math.min(p0.x, p1.x);
      const ry = Math.min(p0.y, p1.y);
      const rw = Math.abs(p1.x - p0.x);
      const rh = Math.abs(p1.y - p0.y);
      return (
        <rect
          key={stroke.id}
          x={rx}
          y={ry}
          width={rw}
          height={rh}
          rx={stRadius ?? shapeCornerRadius ?? 8}
          fill={getFillColor('rgba(56, 189, 248, 0.12)')}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
        />
      );
    }

    if (tool === 'shape_circle') {
      const cx = (p0.x + p1.x) / 2;
      const cy = (p0.y + p1.y) / 2;
      const rx = Math.abs(p1.x - p0.x) / 2;
      const ry = Math.abs(p1.y - p0.y) / 2;
      return (
        <ellipse
          key={stroke.id}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={getFillColor('rgba(56, 189, 248, 0.12)')}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
        />
      );
    }

    if (tool === 'shape_triangle') {
      const topX = (p0.x + p1.x) / 2;
      const topY = Math.min(p0.y, p1.y);
      const botY = Math.max(p0.y, p1.y);
      return (
        <polygon
          key={stroke.id}
          points={`${topX},${topY} ${p1.x},${botY} ${p0.x},${botY}`}
          fill={getFillColor('rgba(234, 179, 8, 0.12)')}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
        />
      );
    }

    if (tool === 'shape_star') {
      const cx = (p0.x + p1.x) / 2;
      const cy = (p0.y + p1.y) / 2;
      const rOuter = Math.hypot(p1.x - p0.x, p1.y - p0.y) / 2;
      const rInner = rOuter * 0.45;
      let pts = '';
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? rOuter : rInner;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        pts += `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)} `;
      }
      return (
        <polygon
          key={stroke.id}
          points={pts.trim()}
          fill={getFillColor('rgba(250, 204, 21, 0.15)')}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
        />
      );
    }

    if (tool === 'shape_diamond') {
      const rx = Math.min(p0.x, p1.x);
      const ry = Math.min(p0.y, p1.y);
      const rw = Math.abs(p1.x - p0.x);
      const rh = Math.abs(p1.y - p0.y);
      return (
        <polygon
          key={stroke.id}
          points={`${rx + rw / 2},${ry} ${rx + rw},${ry + rh / 2} ${rx + rw / 2},${ry + rh} ${rx},${ry + rh / 2}`}
          fill={getFillColor('rgba(168, 85, 247, 0.15)')}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
        />
      );
    }

    if (tool === 'shape_parallelogram') {
      const rx = Math.min(p0.x, p1.x);
      const ry = Math.min(p0.y, p1.y);
      const rw = Math.abs(p1.x - p0.x);
      const rh = Math.abs(p1.y - p0.y);
      const skew = rw * 0.25;
      return (
        <polygon
          key={stroke.id}
          points={`${rx + skew},${ry} ${rx + rw},${ry} ${rx + rw - skew},${ry + rh} ${rx},${ry + rh}`}
          fill={getFillColor('rgba(56, 189, 248, 0.15)')}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
        />
      );
    }

    if (tool === 'shape_speech_bubble') {
      const rx = Math.min(p0.x, p1.x);
      const ry = Math.min(p0.y, p1.y);
      const rw = Math.max(40, Math.abs(p1.x - p0.x));
      const rh = Math.max(30, Math.abs(p1.y - p0.y));
      const r = 8;
      const beakW = rw * 0.15;
      const beakH = rh * 0.25;
      const d = `M ${rx + r} ${ry} H ${rx + rw - r} Q ${rx + rw} ${ry} ${rx + rw} ${ry + r} V ${ry + rh - r} Q ${rx + rw} ${ry + rh} ${rx + rw - r} ${ry + rh} H ${rx + rw * 0.4 + beakW} L ${rx + rw * 0.3} ${ry + rh + beakH} L ${rx + rw * 0.4} ${ry + rh} H ${rx + r} Q ${rx} ${ry + rh} ${rx} ${ry + rh - r} V ${ry + r} Q ${rx} ${ry} ${rx + r} ${ry} Z`;
      return (
        <path
          key={stroke.id}
          d={d}
          fill={getFillColor('rgba(56, 189, 248, 0.15)')}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
        />
      );
    }

    if (tool === 'shape_arrow_block') {
      const rx = Math.min(p0.x, p1.x);
      const ry = Math.min(p0.y, p1.y);
      const rw = Math.abs(p1.x - p0.x);
      const rh = Math.abs(p1.y - p0.y);
      const headW = rw * 0.35;
      const shaftH = rh * 0.4;
      const shaftY = ry + (rh - shaftH) / 2;
      const pts = `${rx},${shaftY} ${rx + rw - headW},${shaftY} ${rx + rw - headW},${ry} ${rx + rw},${ry + rh / 2} ${rx + rw - headW},${ry + rh} ${rx + rw - headW},${shaftY + shaftH} ${rx},${shaftY + shaftH}`;
      return (
        <polygon
          key={stroke.id}
          points={pts}
          fill={getFillColor('rgba(34, 197, 94, 0.15)')}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
        />
      );
    }

    if (tool === 'shape_cube') {
      const rx = Math.min(p0.x, p1.x);
      const ry = Math.min(p0.y, p1.y);
      const s = Math.min(Math.abs(p1.x - p0.x), Math.abs(p1.y - p0.y));
      const offset = s * 0.3;
      const w = s * 0.7;
      const h = s * 0.7;
      return (
        <g key={stroke.id}>
          <polygon
            points={`${rx},${ry + offset} ${rx + offset},${ry} ${rx + offset + w},${ry} ${rx + w},${ry + offset}`}
            fill="rgba(56, 189, 248, 0.25)"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          <polygon
            points={`${rx + w},${ry + offset} ${rx + offset + w},${ry} ${rx + offset + w},${ry + h} ${rx + w},${ry + offset + h}`}
            fill="rgba(56, 189, 248, 0.18)"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          <rect
            x={rx}
            y={ry + offset}
            width={w}
            height={h}
            fill="rgba(56, 189, 248, 0.12)"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
        </g>
      );
    }

    if (tool === 'shape_cylinder') {
      const rx = Math.min(p0.x, p1.x);
      const ry = Math.min(p0.y, p1.y);
      const rw = Math.abs(p1.x - p0.x);
      const rh = Math.abs(p1.y - p0.y);
      const ellH = rw * 0.25;
      return (
        <g key={stroke.id}>
          <path
            d={`M ${rx} ${ry + ellH} V ${ry + rh - ellH} A ${rw / 2} ${ellH} 0 0 0 ${rx + rw} ${ry + rh - ellH} V ${ry + ellH} Z`}
            fill="rgba(168, 85, 247, 0.15)"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          <path
            d={`M ${rx} ${ry + rh - ellH} A ${rw / 2} ${ellH} 0 0 1 ${rx + rw} ${ry + rh - ellH}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray="4 4"
          />
          <ellipse
            cx={rx + rw / 2}
            cy={ry + ellH}
            rx={rw / 2}
            ry={ellH}
            fill="rgba(168, 85, 247, 0.25)"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
        </g>
      );
    }

    if (tool === 'shape_cone') {
      const rx = Math.min(p0.x, p1.x);
      const ry = Math.min(p0.y, p1.y);
      const rw = Math.abs(p1.x - p0.x);
      const rh = Math.abs(p1.y - p0.y);
      const ellH = rw * 0.2;
      const topX = rx + rw / 2;
      const topY = ry;
      return (
        <g key={stroke.id}>
          <path
            d={`M ${topX} ${topY} L ${rx} ${ry + rh - ellH} A ${rw / 2} ${ellH} 0 0 0 ${rx + rw} ${ry + rh - ellH} Z`}
            fill="rgba(234, 179, 8, 0.15)"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          <path
            d={`M ${rx} ${ry + rh - ellH} A ${rw / 2} ${ellH} 0 0 1 ${rx + rw} ${ry + rh - ellH}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray="4 4"
          />
        </g>
      );
    }

    if (tool === 'shape_polygon') {
      const n = polygonEdges || 5;
      const cx = (p0.x + p1.x) / 2;
      const cy = (p0.y + p1.y) / 2;
      const r = Math.hypot(p1.x - p0.x, p1.y - p0.y) / 2;
      let pts = '';
      for (let i = 0; i < n; i++) {
        const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
        pts += `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)} `;
      }
      return (
        <polygon
          key={stroke.id}
          points={pts.trim()}
          fill={getFillColor('rgba(16, 185, 129, 0.12)')}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
        />
      );
    }

    return null;
  };

  const selectedItem = items.find(i => i.id === selectedItemId);

  return (
    <div
      className="smart-board-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: 0,
        flex: 1,
        position: 'relative',
        background: isLightMode ? 'var(--bg-secondary, #ffffff)' : 'var(--bg-primary, #090d16)',
        borderRadius: '14px',
        border: '1px solid var(--card-border, rgba(56, 189, 248, 0.3))',
        overflow: 'hidden',
        boxShadow: 'var(--card-shadow, 0 12px 40px rgba(0, 0, 0, 0.6))'
      }}
      onMouseMove={handleGlobalMouseMove}
      onMouseUp={handleGlobalMouseUp}
      onTouchMove={handleGlobalTouchMove}
      onTouchEnd={handleGlobalMouseUp}
      onTouchCancel={handleGlobalMouseUp}
    >
      {/* ─── 1. TOP HEADER CLASSROOM CONTROLS BAR ─── */}
      <div
        className="smart-board-top-toolbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          background: 'var(--card-bg, rgba(15, 23, 42, 0.95))',
          borderBottom: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))',
          backdropFilter: 'blur(16px)',
          zIndex: 40,
          gap: '8px',
          overflowX: 'auto',
          flexWrap: 'nowrap',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          flexShrink: 0
        }}
      >
        {/* Left: Undo, Redo, Clear, Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => {
              if (historyStack.length > 0) {
                const prev = historyStack[historyStack.length - 1];
                setRedoStack(r => [...r, { items, strokes, connections }]);
                setHistoryStack(h => h.slice(0, -1));
                setItems(prev.items);
                setStrokes(prev.strokes);
                setConnections(prev.connections);
              }
            }}
            disabled={historyStack.length === 0}
            style={{ padding: '5px 7px', borderRadius: '6px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', color: historyStack.length > 0 ? '#38bdf8' : '#475569', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))', cursor: historyStack.length > 0 ? 'pointer' : 'not-allowed' }}
            title="Undo"
          >
            <Undo size={13} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (redoStack.length > 0) {
                const next = redoStack[redoStack.length - 1];
                setHistoryStack(h => [...h, { items, strokes, connections }]);
                setRedoStack(r => r.slice(0, -1));
                setItems(next.items);
                setStrokes(next.strokes);
                setConnections(next.connections);
              }
            }}
            disabled={redoStack.length === 0}
            style={{ padding: '5px 7px', borderRadius: '6px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', color: redoStack.length > 0 ? '#38bdf8' : '#475569', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))', cursor: historyStack.length > 0 ? 'pointer' : 'not-allowed' }}
            title="Redo"
          >
            <Redo size={13} />
          </button>
          <button
            type="button"
            onClick={() => {
              pushHistorySnapshot();
              setItems([]);
              setStrokes([]);
              setConnections([]);
            }}
            style={{ minHeight: '36px', padding: '6px 10px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Clear Board (Trash)"
          >
            <Trash2 size={16} />
          </button>

          <div style={{ width: '1px', height: '22px', background: 'rgba(51, 65, 85, 0.6)', margin: '0 4px' }} />

          {/* Zoom Slider */}
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.max(0.4, Number((prev - 0.1).toFixed(1))))}
            style={{ minHeight: '36px', padding: '6px 10px', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.7)', color: 'var(--text-primary, #cbd5e1)', border: '1px solid rgba(51, 65, 85, 0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ZoomOut size={15} />
          </button>
          <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 800, minWidth: '40px', textAlign: 'center' }}>
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.min(2.5, Number((prev + 0.1).toFixed(1))))}
            style={{ minHeight: '36px', padding: '6px 10px', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.7)', color: 'var(--text-primary, #cbd5e1)', border: '1px solid rgba(51, 65, 85, 0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ZoomIn size={15} />
          </button>

          {/* Background Grid Selector */}
          <select
            value={bgGridType}
            onChange={e => setBgGridType(e.target.value as any)}
            style={{ minHeight: '36px', padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.9))', color: 'var(--text-primary, #f8fafc)', border: '1px solid rgba(51, 65, 85, 0.7)', fontSize: '0.8rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
          >
            <option value="grid">Grid: Square</option>
            <option value="dots">Grid: Dots</option>
            <option value="isometric">Grid: Isometric</option>
            <option value="lined">Grid: Lined</option>
            <option value="none">Grid: None</option>
          </select>
        </div>

        {/* Center: Line Style Selector, Fill Mode Selector, Color Swatches & Stroke Width Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
          {/* LINE STYLE MULTI-TOGGLE (Solid / Dashed / Dotted) */}
          <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.85)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(51, 65, 85, 0.7)', gap: '4px' }}>
            <button
              type="button"
              onClick={() => { setLineStyle('solid'); setIsDashedMode(false); }}
              style={{ minHeight: '30px', padding: '4px 10px', borderRadius: '6px', border: 'none', background: lineStyle === 'solid' ? '#0284c7' : 'transparent', color: lineStyle === 'solid' ? '#ffffff' : '#94a3b8', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              title="Solid Continuous Line"
            >
              — Solid
            </button>
            <button
              type="button"
              onClick={() => { setLineStyle('dashed'); setIsDashedMode(true); }}
              style={{ minHeight: '30px', padding: '4px 10px', borderRadius: '6px', border: 'none', background: lineStyle === 'dashed' ? '#0284c7' : 'transparent', color: lineStyle === 'dashed' ? '#ffffff' : '#94a3b8', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              title="Dashed Line"
            >
              ╌ Dashed
            </button>
            <button
              type="button"
              onClick={() => { setLineStyle('dotted'); setIsDashedMode(true); }}
              style={{ minHeight: '30px', padding: '4px 10px', borderRadius: '6px', border: 'none', background: lineStyle === 'dotted' ? '#0284c7' : 'transparent', color: lineStyle === 'dotted' ? '#ffffff' : '#94a3b8', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              title="Dotted Line"
            >
              ⋯ Dotted
            </button>
          </div>

          {/* FILL MODE SELECTOR */}
          <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.85)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(51, 65, 85, 0.7)', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setFillMode('pastel')}
              style={{ minHeight: '30px', padding: '4px 10px', borderRadius: '6px', border: 'none', background: fillMode === 'pastel' ? '#0284c7' : 'transparent', color: fillMode === 'pastel' ? '#ffffff' : '#94a3b8', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              title="Translucent Pastel Fill"
            >
              ▨ Pastel
            </button>
            <button
              type="button"
              onClick={() => setFillMode('solid')}
              style={{ minHeight: '30px', padding: '4px 10px', borderRadius: '6px', border: 'none', background: fillMode === 'solid' ? '#0284c7' : 'transparent', color: fillMode === 'solid' ? '#ffffff' : '#94a3b8', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              title="Solid Opaque Fill"
            >
              █ Solid
            </button>
            <button
              type="button"
              onClick={() => setFillMode('none')}
              style={{ minHeight: '30px', padding: '4px 10px', borderRadius: '6px', border: 'none', background: fillMode === 'none' ? '#0284c7' : 'transparent', color: fillMode === 'none' ? '#ffffff' : '#94a3b8', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              title="Outline Only (No Fill)"
            >
              ▢ Outline
            </button>
          </div>

          {/* Stroke Width Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(30, 41, 59, 0.85)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(51, 65, 85, 0.7)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 700 }}>{strokeThickness}px</span>
            <input
              type="range"
              min={1}
              max={24}
              value={strokeThickness}
              onChange={e => setStrokeThickness(Number(e.target.value))}
              style={{ width: '56px', height: '5px', cursor: 'pointer', accentColor: '#38bdf8' }}
            />
          </div>

          {/* Quick Color Swatches */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(30, 41, 59, 0.85)', padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(51, 65, 85, 0.7)' }}>
            {['#38bdf8', '#22c55e', '#facc15', '#ec4899', '#a855f7', '#f8fafc'].map(col => (
              <div
                key={col}
                onClick={() => setCurrentColor(col)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: col,
                  border: currentColor === col ? '2.5px solid #ffffff' : '1px solid rgba(0,0,0,0.5)',
                  cursor: 'pointer',
                  boxShadow: currentColor === col ? `0 0 10px ${col}` : 'none',
                  transition: 'transform 0.15s ease'
                }}
              />
            ))}
          </div>

          {/* Pause / Resume Animations Toggle */}
          <button
            type="button"
            onClick={() => setAreAnimationsPaused(!areAnimationsPaused)}
            style={{
              minHeight: '36px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: areAnimationsPaused ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: areAnimationsPaused ? '#f87171' : '#34d399',
              border: `1px solid ${areAnimationsPaused ? 'rgba(239, 68, 68, 0.45)' : 'rgba(16, 185, 129, 0.45)'}`,
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            {areAnimationsPaused ? <Play size={14} /> : <Pause size={14} />}
            <span>{areAnimationsPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Classroom Timer Widget */}
          <button
            type="button"
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            style={{
              minHeight: '36px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: isTimerRunning ? 'rgba(234, 179, 8, 0.2)' : 'rgba(30, 41, 59, 0.7)',
              color: isTimerRunning ? '#facc15' : '#cbd5e1',
              border: `1px solid ${isTimerRunning ? 'rgba(234, 179, 8, 0.5)' : 'rgba(51, 65, 85, 0.7)'}`,
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Clock size={14} />
            <span>
              {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
            </span>
          </button>
        </div>

        {/* Right: Open Gizmos Slide-out Deck */}
        <div style={{ flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setIsGizmoDrawerOpen(!isGizmoDrawerOpen)}
            style={{
              minHeight: '38px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: isGizmoDrawerOpen ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'linear-gradient(135deg, #0284c7, #9333ea)',
              color: '#ffffff',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(6, 182, 212, 0.35)'
            }}
          >
            <Box size={16} />
            <span>{isGizmoDrawerOpen ? 'Close Gizmos' : '🌟 Gizmos (1,200+)'}</span>
          </button>
        </div>
      </div>

      {/* ─── 2. MAIN WORKSPACE WITH LEFT FLYOUT TOOLBAR & 100% FULL-WIDTH CANVAS ─── */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* LEFT DOCKED VERTICAL TOOLBAR */}
        <div
          style={{
            width: '52px',
            background: 'var(--card-bg, rgba(15, 23, 42, 0.95))',
            borderRight: '1px solid rgba(51, 65, 85, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '10px 0',
            gap: '8px',
            zIndex: 35,
            backdropFilter: 'blur(16px)'
          }}
        >
          {/* Hand / Pan Tool */}
          <button
            type="button"
            onClick={() => { setActiveTool('hand'); setActiveFlyout('none'); }}
            style={{ width: '38px', height: '38px', borderRadius: '8px', background: activeTool === 'hand' ? 'rgba(56, 189, 248, 0.25)' : 'transparent', color: activeTool === 'hand' ? '#38bdf8' : '#94a3b8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Pan / Hand Tool"
          >
            <Hand size={18} />
          </button>

          {/* Select Tool */}
          <button
            type="button"
            onClick={() => { setActiveTool('select'); setActiveFlyout('none'); }}
            style={{ width: '38px', height: '38px', borderRadius: '8px', background: activeTool === 'select' ? 'rgba(56, 189, 248, 0.25)' : 'transparent', color: activeTool === 'select' ? '#38bdf8' : '#94a3b8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Select / Move Objects"
          >
            <Move size={18} />
          </button>

          {/* 1. PEN SUITE FLYOUT TRIGGER */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setActiveFlyout(activeFlyout === 'pen' ? 'none' : 'pen')}
              style={{ width: '38px', height: '38px', borderRadius: '8px', background: activeFlyout === 'pen' || activeTool === 'pen' || activeTool === 'highlighter' || activeTool.includes('shape') || activeTool.includes('line') || activeTool.includes('arrow') ? 'rgba(168, 85, 247, 0.25)' : 'transparent', color: activeFlyout === 'pen' || activeTool === 'pen' || activeTool === 'highlighter' ? '#c084fc' : '#94a3b8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              title="Drawing & Shapes Suite"
            >
              <PenTool size={18} />
            </button>

            {activeFlyout === 'pen' && (
              <div
                style={{
                  position: 'absolute',
                  left: '56px',
                  top: '-10px',
                  width: '270px',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  background: 'var(--card-bg, rgba(15, 23, 42, 0.98))',
                  border: '1px solid rgba(168, 85, 247, 0.5)',
                  borderRadius: '14px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  zIndex: 50,
                  boxShadow: '0 12px 36px rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c084fc', padding: '2px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>✏️ INKING & LINES</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary, #94a3b8)' }}>{lineStyle.toUpperCase()}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('pen'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', background: activeTool === 'pen' ? 'rgba(168, 85, 247, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    ✏️ Pen
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('highlighter'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', background: activeTool === 'highlighter' ? 'rgba(168, 85, 247, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    🖍️ Highlighter
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('line'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', background: activeTool === 'line' ? 'rgba(168, 85, 247, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    📏 Line
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('arrow'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', background: activeTool === 'arrow' ? 'rgba(168, 85, 247, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    ➔ Arrow
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('double_arrow'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', background: activeTool === 'double_arrow' ? 'rgba(168, 85, 247, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    ⇄ 2-Way Arrow
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('curve'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', background: activeTool === 'curve' ? 'rgba(168, 85, 247, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    ➰ Curve
                  </button>
                </div>

                <div style={{ height: '1px', background: 'rgba(51, 65, 85, 0.6)', margin: '4px 0' }} />
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', padding: '2px 4px' }}>📐 2D ACADEMIC SHAPES</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('shape_rect'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'shape_rect' ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    ▭ Rectangle
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('shape_circle'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'shape_circle' ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    ⭕ Circle / Oval
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('shape_triangle'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'shape_triangle' ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    🔺 Triangle
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('shape_star'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'shape_star' ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    ⭐️ 5-Point Star
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('shape_diamond'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'shape_diamond' ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    💎 Diamond
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('shape_parallelogram'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'shape_parallelogram' ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    ▱ Parallelogram
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('shape_speech_bubble'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'shape_speech_bubble' ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    💬 Speech Bubble
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('shape_arrow_block'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'shape_arrow_block' ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    ➔ Block Arrow
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const edges = prompt('Enter number of polygon edges (3 to 12):', polygonEdgeCount.toString()) || '5';
                    const n = Math.max(3, Math.min(12, parseInt(edges) || 5));
                    setPolygonEdgeCount(n);
                    setActiveTool('shape_polygon');
                    setActiveFlyout('none');
                  }}
                  style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'shape_polygon' ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer', marginTop: '2px' }}
                >
                  ⬡ Parametric Polygon ({polygonEdgeCount}-Edges)
                </button>

                <div style={{ height: '1px', background: 'rgba(51, 65, 85, 0.6)', margin: '4px 0' }} />
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#facc15', padding: '2px 4px' }}>🧊 3D SOLID MORPH GEOMETRIES</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('shape_cube'); setActiveFlyout('none'); }}
                    style={{ padding: '6px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'center', fontSize: '0.72rem', background: activeTool === 'shape_cube' ? 'rgba(250, 204, 21, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    🧊 3D Cube
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('shape_cylinder'); setActiveFlyout('none'); }}
                    style={{ padding: '6px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'center', fontSize: '0.72rem', background: activeTool === 'shape_cylinder' ? 'rgba(250, 204, 21, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    🛢️ Cylinder
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('shape_cone'); setActiveFlyout('none'); }}
                    style={{ padding: '6px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'center', fontSize: '0.72rem', background: activeTool === 'shape_cone' ? 'rgba(250, 204, 21, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    🍦 3D Cone
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. TEXT & MATH SUITE FLYOUT TRIGGER */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setActiveFlyout(activeFlyout === 'text' ? 'none' : 'text')}
              style={{ width: '38px', height: '38px', borderRadius: '8px', background: activeFlyout === 'text' ? 'rgba(56, 189, 248, 0.25)' : 'transparent', color: activeFlyout === 'text' ? '#38bdf8' : '#94a3b8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              title="Text, Math & Post-it Notes"
            >
              <Type size={18} />
            </button>

            {activeFlyout === 'text' && (
              <div
                style={{
                  position: 'absolute',
                  left: '56px',
                  top: '-10px',
                  width: '220px',
                  background: 'var(--card-bg, rgba(15, 23, 42, 0.96))',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '12px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 50,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', padding: '2px 6px' }}>📝 TEXT & MATH EDITORS</div>
                <button
                  type="button"
                  onClick={() => {
                    const text = prompt('Enter text for board:', 'Classroom Lecture Note') || 'Note';
                    handleStampItem({ type: 'text', name: 'Text Card', text, width: 140, height: 50 });
                    setActiveFlyout('none');
                  }}
                  style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', background: 'transparent', cursor: 'pointer' }}
                >
                  🔤 Click & Type Text
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const latex = prompt('Enter LaTeX equation (e.g. \\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}):', '\\int_{0}^{\\infty} e^{-x} dx = 1');
                    if (latex) {
                      handleStampItem({ type: 'katex', name: 'LaTeX Equation', latex, width: 180, height: 75, label: 'KaTeX Math' });
                    }
                    setActiveFlyout('none');
                  }}
                  style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', background: 'transparent', cursor: 'pointer' }}
                >
                  <span style={{ fontFamily: 'serif', fontWeight: 700, color: '#c084fc' }}>eˣ</span> Math Equation Editor
                </button>
                <div style={{ height: '1px', background: 'rgba(51, 65, 85, 0.6)', margin: '4px 0' }} />
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#facc15', padding: '2px 6px' }}>📄 POST-IT NOTES</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      handleStampItem({ type: 'postit', name: 'Yellow Note', text: 'Important Concept', fillColor: '#fef08a', color: '#854d0e', width: 140, height: 120 });
                      setActiveFlyout('none');
                    }}
                    style={{ padding: '6px', borderRadius: '6px', background: '#fef08a', color: '#854d0e', border: 'none', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    🟨 Yellow
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleStampItem({ type: 'postit', name: 'Blue Note', text: 'Key Formula', fillColor: '#bae6fd', color: '#0369a1', width: 140, height: 120 });
                      setActiveFlyout('none');
                    }}
                    style={{ padding: '6px', borderRadius: '6px', background: '#bae6fd', color: '#0369a1', border: 'none', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    🟦 Blue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleStampItem({ type: 'postit', name: 'Pink Note', text: 'Review Note', fillColor: '#fbcfe8', color: '#9d174d', width: 140, height: 120 });
                      setActiveFlyout('none');
                    }}
                    style={{ padding: '6px', borderRadius: '6px', background: '#fbcfe8', color: '#9d174d', border: 'none', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    🟪 Pink
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleStampItem({ type: 'postit', name: 'Green Note', text: 'Practice Step', fillColor: '#bbf7d0', color: '#166534', width: 140, height: 120 });
                      setActiveFlyout('none');
                    }}
                    style={{ padding: '6px', borderRadius: '6px', background: '#bbf7d0', color: '#166534', border: 'none', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    🟩 Green
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. ERASER SUITE FLYOUT TRIGGER */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setActiveFlyout(activeFlyout === 'eraser' ? 'none' : 'eraser')}
              style={{ width: '38px', height: '38px', borderRadius: '8px', background: activeFlyout === 'eraser' || activeTool.includes('eraser') ? 'rgba(244, 63, 94, 0.25)' : 'transparent', color: activeFlyout === 'eraser' || activeTool.includes('eraser') ? '#f43f5e' : '#94a3b8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              title="Eraser Suite"
            >
              <Eraser size={18} />
            </button>

            {activeFlyout === 'eraser' && (
              <div
                style={{
                  position: 'absolute',
                  left: '56px',
                  top: '-10px',
                  width: '180px',
                  background: 'var(--card-bg, rgba(15, 23, 42, 0.96))',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  borderRadius: '12px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 50,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f43f5e', padding: '2px 6px' }}>🧹 ERASER TOOLS</div>
                <button
                  type="button"
                  onClick={() => { setActiveTool('eraser_object'); setActiveFlyout('none'); }}
                  style={{ padding: '6px 8px', borderRadius: '6px', background: activeTool === 'eraser_object' ? 'rgba(244, 63, 94, 0.2)' : 'transparent', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  🧹 Object Eraser (Click item/stroke)
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTool('eraser_whiteout'); setActiveFlyout('none'); }}
                  style={{ padding: '6px 8px', borderRadius: '6px', background: activeTool === 'eraser_whiteout' ? 'rgba(244, 63, 94, 0.2)' : 'transparent', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  ⚪ Whiteout Mask Brush
                </button>
              </div>
            )}
          </div>

          {/* 4. ADVANCED TEACHING TOOLS & WIDGETS FLYOUT TRIGGER */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setActiveFlyout(activeFlyout === 'tools' ? 'none' : 'tools')}
              style={{ width: '38px', height: '38px', borderRadius: '8px', background: activeFlyout === 'tools' ? 'rgba(168, 85, 247, 0.25)' : 'transparent', color: activeFlyout === 'tools' ? '#c084fc' : '#94a3b8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              title="Classroom Teaching Tools & Widgets"
            >
              <Briefcase size={18} />
            </button>

            {activeFlyout === 'tools' && (
              <div
                style={{
                  position: 'absolute',
                  left: '56px',
                  top: '-10px',
                  width: '210px',
                  background: 'var(--card-bg, rgba(15, 23, 42, 0.96))',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  borderRadius: '12px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 50,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#c084fc', padding: '2px 6px' }}>🧰 TEACHING UTILITIES</div>
                <button
                  type="button"
                  onClick={() => {
                    setIsProtractorVisible(!isProtractorVisible);
                    setActiveFlyout('none');
                  }}
                  style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', background: isProtractorVisible ? 'rgba(56, 189, 248, 0.25)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  📐 {isProtractorVisible ? 'Hide Protractor' : 'Show 180° Protractor'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDiceRollerVisible(!isDiceRollerVisible);
                    setActiveFlyout('none');
                  }}
                  style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', background: isDiceRollerVisible ? 'rgba(168, 85, 247, 0.25)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  🎲 {isDiceRollerVisible ? 'Hide Dice Roller' : 'Show 3D Dice Roller'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsTrafficLightVisible(!isTrafficLightVisible);
                    setActiveFlyout('none');
                  }}
                  style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', background: isTrafficLightVisible ? 'rgba(34, 197, 94, 0.25)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  🚦 {isTrafficLightVisible ? 'Hide Traffic Light' : 'Show Traffic Light'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsStudentPickerVisible(!isStudentPickerVisible);
                    setActiveFlyout('none');
                  }}
                  style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', background: isStudentPickerVisible ? 'rgba(234, 179, 8, 0.25)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  👥 {isStudentPickerVisible ? 'Hide Student Picker' : 'Show Student Picker'}
                </button>
                <div style={{ height: '1px', background: 'rgba(51, 65, 85, 0.6)', margin: '4px 0' }} />
                <button
                  type="button"
                  onClick={() => { setAreAnimationsPaused(!areAnimationsPaused); setActiveFlyout('none'); }}
                  style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', background: 'transparent', cursor: 'pointer' }}
                >
                  ⏸️ {areAnimationsPaused ? 'Resume Animations' : 'Pause Animations'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('✨ Whiteboard ready for high-resolution PNG export!');
                    setActiveFlyout('none');
                  }}
                  style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', background: 'transparent', cursor: 'pointer' }}
                >
                  💾 Download Board PNG
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── MAIN DUAL-LAYER DRAWING & GIZMOS CANVAS (100% FULL-WIDTH) ─── */}
        <div
          ref={boardRef}
          onMouseDown={handleCanvasMouseDown}
          onTouchStart={handleCanvasTouchStart}
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            position: 'relative',
            touchAction: 'none',
            background: isLightMode ? '#ffffff' : 'var(--bg-primary, #090d16)',
            backgroundImage:
              bgGridType === 'grid'
                ? (isLightMode ? 'radial-gradient(rgba(124, 58, 237, 0.16) 1px, transparent 1px)' : 'radial-gradient(rgba(56, 189, 248, 0.18) 1px, transparent 1px)')
                : bgGridType === 'dots'
                ? (isLightMode ? 'radial-gradient(rgba(15, 23, 42, 0.22) 1.5px, transparent 1.5px)' : 'radial-gradient(rgba(248, 250, 252, 0.22) 1.5px, transparent 1.5px)')
                : bgGridType === 'isometric'
                ? (isLightMode ? 'linear-gradient(60deg, rgba(124, 58, 237, 0.08) 1px, transparent 1px), linear-gradient(120deg, rgba(124, 58, 237, 0.08) 1px, transparent 1px)' : 'linear-gradient(60deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px), linear-gradient(120deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px)')
                : bgGridType === 'lined'
                ? (isLightMode ? 'linear-gradient(rgba(124, 58, 237, 0.12) 1px, transparent 1px)' : 'linear-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 1px)')
                : 'none',
            backgroundSize: `${28 * zoomLevel}px ${28 * zoomLevel}px`,
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
            cursor: settingWaypointForId
              ? 'crosshair'
              : activeTool === 'hand' || isPanning
              ? 'grab'
              : activeTool === 'pen' || activeTool === 'highlighter' || activeTool.includes('shape') || activeTool.includes('line')
              ? 'crosshair'
              : activeTool === 'eraser_object'
              ? 'not-allowed'
              : 'default',
            overflow: 'hidden',
            userSelect: 'none'
          }}
        >
          {/* Canvas Transform Layer */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: '0 0'
            }}
          >
            {/* ─── LAYER 1: SVG FREEHAND INK & SHAPES LAYER ─── */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '6000px',
                height: '6000px',
                pointerEvents: 'none',
                zIndex: 10
              }}
            >
              {/* Completed Strokes */}
              {strokes.map(renderStrokeSVG)}

              {/* Active In-Progress Stroke */}
              {currentStroke && renderStrokeSVG(currentStroke)}

              {/* Waypoint Trajectory Lines (Animate-Move Point A -> Point B) */}
              {items.map(item => {
                if (item.animation?.active && item.animation.type === 'move' && item.animation.waypoint) {
                  return (
                    <g key={`waypoint_${item.id}`}>
                      <line
                        x1={item.x + item.width / 2}
                        y1={item.y + item.height / 2}
                        x2={item.animation.waypoint.x + item.width / 2}
                        y2={item.animation.waypoint.y + item.height / 2}
                        stroke="#a855f7"
                        strokeWidth={2}
                        strokeDasharray="6 4"
                      />
                      <circle
                        cx={item.animation.waypoint.x + item.width / 2}
                        cy={item.animation.waypoint.y + item.height / 2}
                        r={6}
                        fill="#c084fc"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    </g>
                  );
                }
                return null;
              })}

              {/* Magnetic Connectors */}
              {connections.map(conn => {
                const fromItem = items.find(i => i.id === conn.fromId);
                const toItem = items.find(i => i.id === conn.toId);
                if (!fromItem || !toItem) return null;

                const fromPt = getAnchorPosition(fromItem, conn.fromAnchor);
                const toPt = getAnchorPosition(toItem, conn.toAnchor);

                const midX = (fromPt.x + toPt.x) / 2;
                const midY = (fromPt.y + toPt.y) / 2;

                return (
                  <g key={conn.id}>
                    <line
                      x1={fromPt.x}
                      y1={fromPt.y}
                      x2={toPt.x}
                      y2={toPt.y}
                      stroke={conn.color}
                      strokeWidth={2.5}
                      strokeDasharray={conn.style === 'dashed' ? '6 4' : 'none'}
                    />
                    {conn.label && (
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x={-conn.label.length * 4 - 8}
                          y={-12}
                          width={conn.label.length * 8 + 16}
                          height={20}
                          rx={6}
                          fill="rgba(15, 23, 42, 0.92)"
                          stroke={conn.color}
                          strokeWidth={1}
                        />
                        <text
                          x={0}
                          y={2}
                          fill="#f8fafc"
                          fontSize={10}
                          fontWeight={600}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          {conn.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* ─── LAYER 2: INTERACTIVE OBJECTS & STAMPED GIZMOS ─── */}
            {items.map(item => {
              const isSelected = item.id === selectedItemId;

              let itemRenderX = item.x;
              let itemRenderY = item.y;
              let transformStyle = `scale(${item.scale}) rotate(${item.rotation}deg)`;
              let boxGlow = isSelected ? '0 0 0 2px #38bdf8, 0 8px 24px rgba(56, 189, 248, 0.3)' : 'none';

              if (item.animation?.active && !areAnimationsPaused) {
                if (item.animation.type === 'rotate') {
                  const angle = (animTime * 60 * item.animation.speed) % 360;
                  transformStyle = `scale(${item.scale}) rotate(${angle}deg)`;
                } else if (item.animation.type === 'move' && item.animation.waypoint) {
                  const t = (Math.sin(animTime * 2 * item.animation.speed) + 1) / 2;
                  itemRenderX = item.x + (item.animation.waypoint.x - item.x) * t;
                  itemRenderY = item.y + (item.animation.waypoint.y - item.y) * t;
                } else if (item.animation.type === 'color') {
                  const glowIntensity = 10 + Math.sin(animTime * 4 * item.animation.speed) * 12;
                  boxGlow = `0 0 ${glowIntensity}px #38bdf8, 0 0 ${glowIntensity * 1.5}px rgba(56, 189, 248, 0.6)`;
                }
              }

              return (
                <div
                  key={item.id}
                  onMouseDown={e => handleItemMouseDown(e, item)}
                  onTouchStart={e => handleItemTouchStart(e, item)}
                  style={{
                    position: 'absolute',
                    left: `${itemRenderX}px`,
                    top: `${itemRenderY}px`,
                    width: `${item.width}px`,
                    height: `${item.height}px`,
                    zIndex: item.zIndex,
                    transform: transformStyle,
                    transformOrigin: 'center center',
                    cursor: activeTool === 'eraser_object' ? 'not-allowed' : item.locked ? 'not-allowed' : 'move',
                    borderRadius: '8px',
                    boxShadow: boxGlow,
                    transition: isPanning ? 'none' : 'box-shadow 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.type === 'postit' ? (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: item.fillColor || '#fef08a',
                        color: item.color || '#854d0e',
                        padding: '10px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        overflowY: 'auto'
                      }}
                    >
                      {item.text}
                    </div>
                  ) : item.type === 'katex' ? (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'var(--card-bg, rgba(15, 23, 42, 0.9))',
                        border: '1px solid rgba(168, 85, 247, 0.4)',
                        color: '#c084fc',
                        padding: '8px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'serif',
                        fontSize: '0.85rem'
                      }}
                    >
                      {item.latex}
                    </div>
                  ) : item.type === 'dice_spinner' ? (
                    <div
                      onClick={e => {
                        e.stopPropagation();
                        setItems(prev =>
                          prev.map(it => (it.id === item.id ? { ...it, widgetData: { value: Math.floor(Math.random() * 6) + 1 } } : it))
                        );
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #0284c7, #9333ea)',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        cursor: 'pointer',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
                      }}
                    >
                      <span style={{ fontSize: '2rem', fontWeight: 900 }}>{item.widgetData?.value || 6}</span>
                      <span style={{ fontSize: '0.62rem', fontWeight: 600, opacity: 0.9 }}>🎲 Click to Roll</span>
                    </div>
                  ) : (
                    <div
                      style={{ width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      dangerouslySetInnerHTML={{ __html: item.svgContent || '' }}
                    />
                  )}

                  {item.label && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-20px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: 'var(--card-bg, rgba(15, 23, 42, 0.9))',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        color: 'var(--text-primary, #cbd5e1)',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none'
                      }}
                    >
                      {item.label}
                    </div>
                  )}

                  {(isSelected || connectingFrom) && (
                    <>
                      <div onClick={e => handleAnchorClick(item.id, 'top', e)} style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', width: '12px', height: '12px', borderRadius: '50%', background: '#38bdf8', border: '2px solid #ffffff', cursor: 'crosshair', zIndex: 50 }} />
                      <div onClick={e => handleAnchorClick(item.id, 'bottom', e)} style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '12px', height: '12px', borderRadius: '50%', background: '#38bdf8', border: '2px solid #ffffff', cursor: 'crosshair', zIndex: 50 }} />
                      <div onClick={e => handleAnchorClick(item.id, 'left', e)} style={{ position: 'absolute', left: '-6px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', borderRadius: '50%', background: '#38bdf8', border: '2px solid #ffffff', cursor: 'crosshair', zIndex: 50 }} />
                      <div onClick={e => handleAnchorClick(item.id, 'right', e)} style={{ position: 'absolute', right: '-6px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', borderRadius: '50%', background: '#38bdf8', border: '2px solid #ffffff', cursor: 'crosshair', zIndex: 50 }} />
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* ─── INTERACTIVE CLASSROOM OVERLAY WIDGETS ─── */}

          {/* 1. 📐 ACADEMIC PROTRACTOR OVERLAY */}
          {isProtractorVisible && (
            <div
              style={{
                position: 'absolute',
                left: `${protractorPos.x}px`,
                top: `${protractorPos.y}px`,
                transform: `rotate(${protractorPos.rotation}deg)`,
                transformOrigin: '160px 160px',
                zIndex: 45,
                userSelect: 'none',
                filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.6))'
              }}
              onMouseDown={e => {
                e.stopPropagation();
                setIsDraggingProtractor(true);
              }}
            >
              <svg width="320" height="180" viewBox="0 0 320 180" style={{ cursor: 'move' }}>
                {/* Semi-Circle Body (Glassmorphic) */}
                <path
                  d="M 10 160 A 150 150 0 0 1 310 160 Z"
                  fill="rgba(15, 23, 42, 0.85)"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />
                {/* Inner Cutout Arc */}
                <path
                  d="M 60 160 A 100 100 0 0 1 260 160 Z"
                  fill="rgba(2, 132, 199, 0.12)"
                  stroke="rgba(56, 189, 248, 0.4)"
                  strokeWidth="1.5"
                />
                {/* Center Pin Crosshair */}
                <circle cx="160" cy="160" r="4" fill="#facc15" />
                <line x1="160" y1="145" x2="160" y2="160" stroke="#facc15" strokeWidth="2" />
                <line x1="145" y1="160" x2="175" y2="160" stroke="#facc15" strokeWidth="2" />

                {/* Degree Tick Marks & Labels */}
                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180].map(deg => {
                  const rad = ((180 - deg) * Math.PI) / 180;
                  const x1 = 160 + 150 * Math.cos(rad);
                  const y1 = 160 - 150 * Math.sin(rad);
                  const tickLen = deg % 30 === 0 ? 16 : deg % 10 === 0 ? 10 : 6;
                  const x2 = 160 + (150 - tickLen) * Math.cos(rad);
                  const y2 = 160 - (150 - tickLen) * Math.sin(rad);

                  const labelX = 160 + 120 * Math.cos(rad);
                  const labelY = 160 - 120 * Math.sin(rad);

                  return (
                    <g key={deg}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#38bdf8" strokeWidth={deg % 30 === 0 ? 2 : 1} />
                      {deg % 30 === 0 && (
                        <text
                          x={labelX}
                          y={labelY + 4}
                          fill="#f8fafc"
                          fontSize="9"
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {deg}°
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Rotation & Close Controls */}
              <div style={{ position: 'absolute', top: '-36px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', background: 'var(--card-bg, rgba(15, 23, 42, 0.95))', padding: '3px 8px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.4)', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 800 }}>Angle: {Math.round(protractorPos.rotation % 360)}°</span>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setProtractorPos(prev => ({ ...prev, rotation: (prev.rotation + 15) % 360 }));
                  }}
                  style={{ padding: '2px 6px', borderRadius: '4px', background: '#0284c7', color: '#ffffff', border: 'none', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 700 }}
                >
                  ↻ +15°
                </button>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setProtractorPos(prev => ({ ...prev, rotation: (prev.rotation - 15 + 360) % 360 }));
                  }}
                  style={{ padding: '2px 6px', borderRadius: '4px', background: '#0284c7', color: '#ffffff', border: 'none', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 700 }}
                >
                  ↺ -15°
                </button>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setIsProtractorVisible(false);
                  }}
                  style={{ padding: '2px 6px', borderRadius: '4px', background: '#ef4444', color: '#ffffff', border: 'none', fontSize: '0.65rem', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* 2. 🎲 INTERACTIVE 3D DICE ROLLER WIDGET */}
          {isDiceRollerVisible && (
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '180px',
                background: 'var(--card-bg, rgba(15, 23, 42, 0.95))',
                border: '1px solid rgba(168, 85, 247, 0.5)',
                borderRadius: '14px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                zIndex: 42,
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                backdropFilter: 'blur(16px)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c084fc' }}>🎲 CLASSROOM DICE</span>
                <button
                  type="button"
                  onClick={() => setIsDiceRollerVisible(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  ✕
                </button>
              </div>

              {/* Big Animated Die Face */}
              <div
                onClick={() => {
                  if (isDiceRolling) return;
                  setIsDiceRolling(true);
                  let rollCount = 0;
                  const interval = setInterval(() => {
                    setDiceValue(Math.floor(Math.random() * 6) + 1);
                    rollCount++;
                    if (rollCount > 8) {
                      clearInterval(interval);
                      setIsDiceRolling(false);
                    }
                  }, 60);
                }}
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(168, 85, 247, 0.4)',
                  transform: isDiceRolling ? 'rotate(360deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                  transition: 'transform 0.5s ease'
                }}
              >
                {diceValue}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isDiceRolling) return;
                  setIsDiceRolling(true);
                  let rollCount = 0;
                  const interval = setInterval(() => {
                    setDiceValue(Math.floor(Math.random() * 6) + 1);
                    rollCount++;
                    if (rollCount > 8) {
                      clearInterval(interval);
                      setIsDiceRolling(false);
                    }
                  }, 60);
                }}
                style={{ width: '100%', padding: '6px', borderRadius: '8px', background: '#0284c7', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer' }}
              >
                {isDiceRolling ? 'Rolling...' : 'Roll Dice'}
              </button>
            </div>
          )}

          {/* 3. 🚦 CLASSROOM TRAFFIC LIGHT & FOCUS METER */}
          {isTrafficLightVisible && (
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '70px',
                background: 'var(--card-bg, rgba(15, 23, 42, 0.95))',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '14px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                zIndex: 42,
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                backdropFilter: 'blur(16px)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8' }}>🚦 FOCUS LIGHT</span>
                <button
                  type="button"
                  onClick={() => setIsTrafficLightVisible(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', background: '#090d16', padding: '6px 10px', borderRadius: '20px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))' }}>
                {/* Red */}
                <div
                  onClick={() => setTrafficStatus('red')}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: trafficStatus === 'red' ? '#ef4444' : 'rgba(239, 68, 68, 0.25)',
                    boxShadow: trafficStatus === 'red' ? '0 0 14px #ef4444' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Silent Individual Study"
                />
                {/* Yellow */}
                <div
                  onClick={() => setTrafficStatus('yellow')}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: trafficStatus === 'yellow' ? '#facc15' : 'rgba(250, 204, 21, 0.25)',
                    boxShadow: trafficStatus === 'yellow' ? '0 0 14px #facc15' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Whisper / Partner Work"
                />
                {/* Green */}
                <div
                  onClick={() => setTrafficStatus('green')}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: trafficStatus === 'green' ? '#22c55e' : 'rgba(34, 197, 94, 0.25)',
                    boxShadow: trafficStatus === 'green' ? '0 0 14px #22c55e' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Active Class Discussion"
                />
              </div>

              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: trafficStatus === 'red' ? '#f87171' : trafficStatus === 'yellow' ? '#facc15' : '#4ade80' }}>
                {trafficStatus === 'red' ? '🔴 Silent Focus' : trafficStatus === 'yellow' ? '🟡 Group Work' : '🟢 Open Discussion'}
              </span>
            </div>
          )}

          {/* 4. 👥 RANDOM STUDENT PICKER WIDGET */}
          {isStudentPickerVisible && (
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '260px',
                width: '240px',
                background: 'var(--card-bg, rgba(15, 23, 42, 0.95))',
                border: '1px solid rgba(234, 179, 8, 0.5)',
                borderRadius: '14px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                zIndex: 42,
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                backdropFilter: 'blur(16px)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#facc15' }}>👥 STUDENT PICKER</span>
                <button
                  type="button"
                  onClick={() => setIsStudentPickerVisible(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: '8px', borderRadius: '8px', background: '#090d16', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))', textAlign: 'center', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 900, color: '#38bdf8' }}>
                  {pickedStudent || 'Click Pick!'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const names = studentList.split(',').map((s: string) => s.trim()).filter(Boolean);
                  if (names.length === 0) return;
                  setIsPickingStudent(true);
                  let count = 0;
                  const interval = setInterval(() => {
                    setPickedStudent(names[Math.floor(Math.random() * names.length)]);
                    count++;
                    if (count > 12) {
                      clearInterval(interval);
                      setIsPickingStudent(false);
                    }
                  }, 60);
                }}
                style={{ padding: '6px', borderRadius: '6px', background: '#eab308', color: '#000000', border: 'none', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
              >
                {isPickingStudent ? 'Selecting...' : '🎯 Pick Random Student'}
              </button>
            </div>
          )}

          {/* 5. 🔄 SHAPE MORPHER & TRANSFORM INSPECTOR HUD (When an Item is Selected) */}
          {selectedItem && (
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--card-bg, rgba(15, 23, 42, 0.96))',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                borderRadius: '12px',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                zIndex: 48,
                boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                backdropFilter: 'blur(16px)'
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8' }}>
                {selectedItem.name}
              </span>

              {/* Corner Rounding Morpher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary, #94a3b8)' }}>Round:</span>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={shapeCornerRadius}
                  onChange={e => setShapeCornerRadius(Number(e.target.value))}
                  style={{ width: '50px', accentColor: '#06b6d4' }}
                />
              </div>

              {/* Lock Toggle */}
              <button
                type="button"
                onClick={() => {
                  setItems(prev =>
                    prev.map(it => (it.id === selectedItem.id ? { ...it, locked: !it.locked } : it))
                  );
                }}
                style={{ padding: '4px 8px', borderRadius: '6px', background: selectedItem.locked ? 'rgba(239, 68, 68, 0.25)' : 'rgba(51, 65, 85, 0.6)', color: selectedItem.locked ? '#f87171' : '#f8fafc', border: 'none', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {selectedItem.locked ? <Lock size={12} /> : <Unlock size={12} />}
                {selectedItem.locked ? 'Locked' : 'Lock'}
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={() => {
                  pushHistorySnapshot();
                  setItems(prev => prev.filter(it => it.id !== selectedItem.id));
                  setSelectedItemId(null);
                }}
                style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.25)', color: '#f87171', border: 'none', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>

        {/* ─── 3. OVERLAY SLIDE-OUT GIZMOS BENTO DRAWER (OUTSIDE CANVAS WORKSPACE) ─── */}
        {isGizmoDrawerOpen && (
          <div
            className="gizmos-side-drawer-master"
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '380px',
              maxWidth: '90vw',
              background: 'var(--card-bg, rgba(15, 23, 42, 0.98))',
              borderLeft: '1px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 60,
              backdropFilter: 'blur(24px)',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8)',
              animation: 'slideInRight 0.25s ease'
            }}
          >
            {/* Header & Category Dropdown */}
            <div style={{ padding: '14px', borderBottom: '1px solid rgba(51, 65, 85, 0.6)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Box size={18} className="text-cyan-400" />
                  <span>Gizmos Library (1,200+ Items)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsGizmoDrawerOpen(false)}
                  style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(51, 65, 85, 0.6)', color: 'var(--text-secondary, #94a3b8)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Live Search */}
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Search 80+ Telugu, Hindi, Robots, Math, Food..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: '8px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))', color: 'var(--text-primary, #f8fafc)', fontSize: '0.75rem', outline: 'none' }}
                />
              </div>

              {/* Master 25+ Category Filter Dropdown */}
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.95)', border: '1px solid rgba(56, 189, 248, 0.5)', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
              >
                <option value="all">🌟 All Categories ({GIZMOS_CATALOG.length} Items)</option>
                {GIZMO_CATEGORIES.map(cat => {
                  const count = GIZMOS_CATALOG.filter(g => g.category === cat.id).length;
                  return (
                    <option key={cat.id} value={cat.id}>
                      {cat.label} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 3-Column Bento Grid */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                alignContent: 'start'
              }}
            >
              {filteredGizmos.map(gizmo => (
                <div
                  key={gizmo.id}
                  onClick={() => handleStampGizmo(gizmo)}
                  style={{
                    padding: '6px',
                    borderRadius: '10px',
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '4px',
                    minHeight: '85px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.8)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(51, 65, 85, 0.6)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    dangerouslySetInnerHTML={{ __html: gizmo.svgContent }}
                  />
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-primary, #f8fafc)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {gizmo.name}
                    </div>
                    {gizmo.badge && (
                      <span style={{ fontSize: '0.55rem', color: '#38bdf8', fontWeight: 600 }}>
                        {gizmo.badge}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── 4. FLOATING OBJECT CONTEXT MENU & WAYPOINT ANIMATION BAR ─── */}
      {selectedItem && (
        <div
          style={{
            position: 'absolute',
            bottom: '68px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--card-bg, rgba(15, 23, 42, 0.95))',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '12px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(16px)',
            zIndex: 50,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', borderRight: '1px solid rgba(51, 65, 85, 0.6)', paddingRight: '8px' }}>
            {selectedItem.name}
          </span>

          <button
            type="button"
            onClick={() => setItems(prev => prev.map(i => i.id === selectedItemId ? { ...i, scale: Math.max(0.4, Number((i.scale - 0.1).toFixed(1))) } : i))}
            style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', color: 'var(--text-primary, #cbd5e1)', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))', fontSize: '0.7rem', cursor: 'pointer' }}
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => setItems(prev => prev.map(i => i.id === selectedItemId ? { ...i, scale: Math.min(2.5, Number((i.scale + 0.1).toFixed(1))) } : i))}
            style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', color: 'var(--text-primary, #cbd5e1)', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))', fontSize: '0.7rem', cursor: 'pointer' }}
          >
            A+
          </button>

          <button
            type="button"
            onClick={() => {
              setSettingWaypointForId(selectedItem.id);
              setAiStatusMessage('📍 Click anywhere on canvas to set Target Point B for Animate-Move!');
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              background: selectedItem.animation?.type === 'move' && selectedItem.animation?.active ? 'rgba(168, 85, 247, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))',
              color: selectedItem.animation?.type === 'move' && selectedItem.animation?.active ? '#c084fc' : '#cbd5e1',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Set Target Destination (Point B) for smooth looping movement"
          >
            ↗️ Animate-Move (A ↔ B)
          </button>

          <button
            type="button"
            onClick={() => {
              setItems(prev =>
                prev.map(i => {
                  if (i.id !== selectedItemId) return i;
                  const isCurrent = i.animation?.type === 'color' && i.animation?.active;
                  return {
                    ...i,
                    animation: {
                      type: 'color',
                      speed: 1,
                      active: !isCurrent
                    }
                  };
                })
              );
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              background: selectedItem.animation?.type === 'color' && selectedItem.animation?.active ? 'rgba(56, 189, 248, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))',
              color: selectedItem.animation?.type === 'color' && selectedItem.animation?.active ? '#38bdf8' : '#cbd5e1',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Toggle Continuous Breathing Glow"
          >
            💡 Breathing Glow
          </button>

          <button
            type="button"
            onClick={() => {
              setItems(prev =>
                prev.map(i => {
                  if (i.id !== selectedItemId) return i;
                  const isCurrent = i.animation?.type === 'rotate' && i.animation?.active;
                  return {
                    ...i,
                    animation: {
                      type: 'rotate',
                      speed: 1,
                      active: !isCurrent
                    }
                  };
                })
              );
            }}
            style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', color: 'var(--text-primary, #cbd5e1)', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))', fontSize: '0.7rem', cursor: 'pointer' }}
          >
            🔄 Rotate
          </button>

          <button
            type="button"
            onClick={() => {
              const cloned = { ...selectedItem, id: `item_${Date.now()}`, x: selectedItem.x + 25, y: selectedItem.y + 25 };
              setItems(prev => [...prev, cloned]);
            }}
            style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', fontSize: '0.7rem', cursor: 'pointer' }}
          >
            <Copy size={12} />
          </button>
          <button
            type="button"
            onClick={() => {
              setItems(prev => prev.filter(i => i.id !== selectedItemId));
              setConnections(prev => prev.filter(c => c.fromId !== selectedItemId && c.toId !== selectedItemId));
              setSelectedItemId(null);
            }}
            style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', fontSize: '0.7rem', cursor: 'pointer' }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* ─── 5. BOTTOM FLOATING AI AUTO-LAYOUT PROMPT BAR ─── */}
      <div
        className="smart-board-bottom-bar"
        style={{
          padding: '10px 18px',
          background: 'var(--card-bg, rgba(15, 23, 42, 0.95))',
          borderTop: '1px solid rgba(51, 65, 85, 0.7)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 40,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc', flexShrink: 0 }}>
          <Sparkles size={16} />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.02em' }}>AI Auto-Board:</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => handleAiAutoLayout('Show Tutor Robot explaining AND Logic Gate truth table with yellow sticky note')}
            style={{ minHeight: '34px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            🤖 Robot & Logic Gates
          </button>
          <button
            type="button"
            onClick={() => handleAiAutoLayout('Show base-10 addition of 1000 cube and 100 flat with Teacher Study feedback stamp')}
            style={{ minHeight: '34px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(234, 179, 8, 0.15)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.4)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            📐 Base-10 Math
          </button>
          <button
            type="button"
            onClick={() => handleAiAutoLayout('Show Telugu alphabet flashcards with Amma and Aavu alongside Teacher This Rocks feedback stamp')}
            style={{ minHeight: '34px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.4)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            🎨 Telugu & Holi
          </button>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Type any teaching concept (e.g. 'Show Telugu vowels connected to tutor bot')..."
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAiAutoLayout(); }}
            style={{
              width: '100%',
              minHeight: '38px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'rgba(30, 41, 59, 0.85)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: 'var(--text-primary, #f8fafc)',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => handleAiAutoLayout()}
          disabled={isAiGenerating}
          style={{
            minHeight: '38px',
            padding: '8px 18px',
            borderRadius: '10px',
            background: isAiGenerating ? 'rgba(71, 85, 105, 0.6)' : 'linear-gradient(135deg, #0284c7, #9333ea)',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: isAiGenerating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
            boxShadow: '0 0 12px rgba(147, 51, 234, 0.35)'
          }}
        >
          {isAiGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
          <span>{isAiGenerating ? 'Generating...' : 'Auto-Layout'}</span>
        </button>
      </div>

      {aiStatusMessage && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--card-bg, rgba(15, 23, 42, 0.96))',
            border: '1px solid rgba(56, 189, 248, 0.5)',
            color: '#38bdf8',
            borderRadius: '8px',
            padding: '6px 16px',
            fontSize: '0.78rem',
            fontWeight: 600,
            zIndex: 70,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
          }}
        >
          {aiStatusMessage}
        </div>
      )}
    </div>
  );
};
