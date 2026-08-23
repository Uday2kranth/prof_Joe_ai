import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  BookOpen,
  Presentation,
  FileText,
  Network,
  Printer,
  Sparkles,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  FileSearch,
  CheckCircle2,
  ArrowRight,
  Globe,
  BookMarked,
  Clock,
  Eye,
  BarChart2,
  RotateCcw,
  Zap,
  Check,
  AlertTriangle,
  List
} from 'lucide-react';
import type { UserKeys, UserCustomModels, CodeStyleConfig } from '../types';
import { DEFAULT_CODE_STYLE } from '../types';
import { sendChatMessage } from '../services/apiService';
import { PROVIDERS } from '../constants';
import { extractDiagrams, fetchKrokiSvg } from '../services/krokiService';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { sanitizeLatexForKatex } from './MessageItem';
import { PdfPreviewModal } from './PdfPreviewModal';
import { printBubbleToPdf } from '../services/printPdfService';

export type TeacherPresetType = 'detailed' | 'classroom' | 'handout' | 'connect_dots';

export interface LectureNoteSession {
  id: string;
  title: string;
  subject: string;
  customSubjectName?: string;
  topic: string;
  preset: TeacherPresetType;
  syllabusSnippet?: string;
  notesContent: string;
  provider: string;
  model: string;
  webSearch?: boolean;
  createdAt: number;
  updatedAt: number;
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

interface LectureNotesStudioViewProps {
  userKeys: UserKeys;
  customModels?: UserCustomModels;
  currentUser?: string;
  isDemoView?: boolean;
  isExternalDrawerOpen?: boolean;
  onCloseExternalDrawer?: () => void;
}

const PRESET_SUBJECTS = [
  'Cryptography & Network Security',
  'Big Data Applications & Fast Data',
  'Machine Learning & Data Science',
  'Web Mining & Information Retrieval',
  'Custom Course / Subject'
];

const PRESETS: Array<{
  id: TeacherPresetType;
  title: string;
  badge: string;
  icon: React.ElementType;
  description: string;
  instructionPrompt: string;
}> = [
  {
    id: 'detailed',
    title: 'Detailed Topic Notes',
    badge: 'Theory & Rigor',
    icon: BookOpen,
    description: 'Deep theoretical foundations, step-by-step mathematical proofs, and textbook-style depth.',
    instructionPrompt: `AUTHORING MANDATES FOR DETAILED TOPIC NOTES:
1. STRUCTURE & DEPTH:
   - ## 1. Theoretical Foundations & Formal Definition (Rigorous definitions with KaTeX $...$)
   - ## 2. Core Architecture & Mathematical Formulations (Step-by-step derivations with every equation strictly enclosed in $$...$$; complete every proof to its final boxed/concluded result)
   - ## 3. Algorithm / Protocol Mechanics (Structured numbered execution steps + concise pseudocode block)
   - ## 4. Worked Numerical Walkthrough (Concrete numerical example with step-by-step KaTeX computations)
   - ## 5. Comparative Evaluation & Exam Takeaways (Markdown comparison table + key scoring takeaways)
2. VISUAL DIAGRAM ARCHITECTURE: Provide exactly 1 clean Mermaid (\`\`\`mermaid) diagram. Select the layout students and evaluators would like to see: sequence lifelines for protocols, modular subgraphs for ML/data pipelines, or compact flowcharts for algorithms. Every node MUST have an explicit descriptive title in quotes (e.g. Node1["1. Feature Extraction Matrix X"]). NEVER output dummy single-letter nodes (A, B).
3. CONCISENESS & COMPLETION: Keep derivations focused and ensure 100% of derivations, code blocks, and formulas reach their full conclusion within the response without truncating.`
  },
  {
    id: 'classroom',
    title: 'Classroom & Boardwork',
    badge: '45-Min Lecture',
    icon: Presentation,
    description: 'Paced classroom delivery: modular blocks, chalkboard diagrams, and interactive student questions.',
    instructionPrompt: `AUTHORING MANDATES FOR CLASSROOM & BOARDWORK LECTURE SCRIPT:
1. STRUCTURE & PACING:
   - ## 1. 2-Minute Intuitive Lecture Hook (A compelling real-world scenario or analogy)
   - ## 2. Blackboard / Boardwork Diagram (Render a clean Mermaid \`\`\`mermaid vector diagram for the chalkboard depicting system components and flow)
   - ## 3. Modular Teaching Segments (Block 1: Foundations & Core Intuition, Block 2: Key Derivations & Mechanics with $$...$$ math)
   - ## 4. Student Misconceptions & Discussion Check (Top 2 common exam pitfalls + 2 concept-check questions with solutions)
2. SMART DIAGRAM MANDATE: Ensure every diagram node has an explicit descriptive title in quotes. Never use bare single-letter nodes (A, B).`
  },
  {
    id: 'handout',
    title: 'Student Handout',
    badge: 'Printable Sheet',
    icon: FileText,
    description: 'Concise printable summary: core definitions, key formulas, comparative tables, and quick exam review points.',
    instructionPrompt: `AUTHORING MANDATES FOR STUDENT STUDY HANDOUT:
1. STRUCTURE:
   - ## 1. Executive Summary & Core Definitions (Punchy, high-density definitions)
   - ## 2. Master Formula Reference Matrix (Compact KaTeX formulas: $...$ inline, $$...$$ display)
   - ## 3. Comparative Matrix & Algorithm Flow (Markdown comparison table + brief Mermaid \`\`\`mermaid flowchart or sequence diagram)
   - ## 4. High-Yield University Exam Scoring Points (Bulleted checklist of critical scoring points)
2. COMPLETION: Keep explanations high-yield, compact, and completely self-contained with meaningful node labels in any diagram.`
  },
  {
    id: 'connect_dots',
    title: 'Unit Breakdown & Dots',
    badge: 'Pedagogy & Links',
    icon: Network,
    description: 'Maps prerequisite knowledge chains, conceptual flow, and inter-topic bridges across syllabus units.',
    instructionPrompt: `AUTHORING MANDATES FOR UNIT BREAKDOWN & PEDAGOGICAL ROADMAP:
1. STRUCTURE:
   - ## 1. Prerequisite Knowledge Map (Required foundational concepts before this chapter)
   - ## 2. Evolutionary Need & Conceptual Bridge (Why this method was invented over legacy approaches)
   - ## 3. Topic Dependency & Concept Map (Visual Mermaid \`\`\`mermaid graph LR concept roadmap with clear concept names on all nodes)
   - ## 4. Upstream & Downstream Syllabus Connections (How this bridges into subsequent syllabus units)
   - ## 5. Pedagogical Synthesis Matrix (Learning outcomes summary table)`
  }
];

// 🛡️ Auto-close hanging/unclosed code blocks and math blocks before real headings
export const healMarkdownFences = (rawMarkdown: string): string => {
  if (!rawMarkdown) return '';
  const rawLines = rawMarkdown.split('\n');
  const healedLines: string[] = [];
  let inCode = false;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      inCode = !inCode;
      healedLines.push(line);
      continue;
    }

    // If inside an unclosed code block, but encounter a real Markdown heading (e.g. ## 4. Worked Numerical Walkthrough)
    if (inCode && /^(#{1,3})\s+(\d+(\.\d+)*\.?|[A-Z]|🎓|📚|[IVXLCDM]+\.)/.test(trimmed)) {
      healedLines.push('```');
      inCode = false;
    }

    healedLines.push(line);
  }

  if (inCode) {
    healedLines.push('```');
  }

  let healedMarkdown = healedLines.join('\n');

  const mathBlockCount = (healedMarkdown.match(/\$\$/g) || []).length;
  if (mathBlockCount % 2 !== 0) {
    healedMarkdown += '\n$$\n';
  }

  return healedMarkdown;
};

export const LectureNotesStudioView: React.FC<LectureNotesStudioViewProps> = ({
  userKeys,
  customModels = {},
  currentUser = 'guest',
  isDemoView: _isDemoView = false,
  isExternalDrawerOpen,
  onCloseExternalDrawer
}) => {
  // 1. Isolated Session Storage (STRICT LANE - Zero mix with main chat)
  const storageKey = `chatterbot_lecture_sessions_${currentUser}`;
  const [sessions, setSessions] = useState<LectureNoteSession[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse lecture sessions', e);
      }
    }
    return [
      {
        id: `lecture-sess-${Date.now()}`,
        title: 'New Lecture Note',
        subject: PRESET_SUBJECTS[0],
        customSubjectName: '',
        topic: 'RSA Algorithm & Diffie-Hellman Key Exchange',
        preset: 'detailed',
        syllabusSnippet: '',
        notesContent: '',
        provider: 'OpenRouter',
        model: 'openrouter/free',
        webSearch: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || `lecture-sess-${Date.now()}`);
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Persist sessions strictly in isolated storage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(sessions));
  }, [sessions, storageKey]);

  // Form & Authoring State
  const [activePreset, setActivePreset] = useState<TeacherPresetType>(activeSession?.preset || 'detailed');
  const [selectedSubject, setSelectedSubject] = useState<string>(activeSession?.subject || PRESET_SUBJECTS[0]);
  const [customSubjectName, setCustomSubjectName] = useState<string>(activeSession?.customSubjectName || '');
  const [topicInput, setTopicInput] = useState<string>(activeSession?.topic || 'RSA Algorithm & Diffie-Hellman Key Exchange');
  const [syllabusContext, setSyllabusContext] = useState<string>(activeSession?.syllabusSnippet || '');
  const [generatedNotes, setGeneratedNotes] = useState<string>(activeSession?.notesContent || '');
  const [webSearch, setWebSearch] = useState<boolean>(activeSession?.webSearch ?? true);
  const [isSyllabusDrawerOpen, setIsSyllabusDrawerOpen] = useState<boolean>(false);

  // Model & Provider Selection (Exact matching main chat)
  const [selectedProvider, setSelectedProvider] = useState<string>(() => {
    return activeSession?.provider || localStorage.getItem(`chatterbot_lecture_provider_${currentUser}`) || 'OpenRouter';
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return activeSession?.model || localStorage.getItem(`chatterbot_lecture_model_${currentUser}`) || 'openrouter/free';
  });

  // Dropdown States
  const [isProviderOpen, setIsProviderOpen] = useState<boolean>(false);
  const [isModelOpen, setIsModelOpen] = useState<boolean>(false);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState<boolean>(false);

  // Left Control Deck Drawer State
  const [isControlDeckOpen, setIsControlDeckOpen] = useState<boolean>(false);
  const effectiveControlDeckOpen = isExternalDrawerOpen ?? isControlDeckOpen;
  const handleCloseControlDeck = () => {
    setIsControlDeckOpen(false);
    if (onCloseExternalDrawer) onCloseExternalDrawer();
  };
  const [controlDeckSearchQuery, setControlDeckSearchQuery] = useState<string>('');
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // UI state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string>('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [diagramMap, setDiagramMap] = useState<Map<string, string>>(new Map());
  const [lastGeneratedTopic, setLastGeneratedTopic] = useState<string>(activeSession?.topic || '');
  const [isOutlineOpen, setIsOutlineOpen] = useState<boolean>(false);
  const [outlineSearchQuery, setOutlineSearchQuery] = useState<string>('');

  const [codeStyle, setCodeStyle] = useState<CodeStyleConfig>(() => {
    try {
      const saved = localStorage.getItem('chatterbot_code_style');
      if (saved) return { ...DEFAULT_CODE_STYLE, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_CODE_STYLE;
  });

  useEffect(() => {
    const handleCodeStyleUpdate = () => {
      try {
        const saved = localStorage.getItem('chatterbot_code_style');
        if (saved) setCodeStyle({ ...DEFAULT_CODE_STYLE, ...JSON.parse(saved) });
      } catch {}
    };
    window.addEventListener('chatterbot_code_style_updated', handleCodeStyleUpdate);
    window.addEventListener('storage', handleCodeStyleUpdate);
    return () => {
      window.removeEventListener('chatterbot_code_style_updated', handleCodeStyleUpdate);
      window.removeEventListener('storage', handleCodeStyleUpdate);
    };
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const providerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const subjectRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLElement>(null);

  // 🎯 Initial landing: scroll directly down to the composer deck
  useEffect(() => {
    const timer = setTimeout(() => {
      composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 180);
    return () => clearTimeout(timer);
  }, []);

  // 📑 Parse single-line numbered headings from generated notes for chapter outline
  const outlineHeadings = useMemo(() => {
    if (!generatedNotes) return [];
    const healed = healMarkdownFences(generatedNotes);
    const lines = healed.split('\n');
    const headings: Array<{ id: string; title: string; level: number; index: number }> = [];
    let inCodeBlock = false;
    let count = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;

      const match = trimmed.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        count++;
        const level = match[1].length;
        const rawTitle = match[2]
          .replace(/\*\*/g, '')
          .replace(/`([^`]+)`/g, '$1')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .trim();
        headings.push({
          id: `lecture-heading-${count}`,
          title: rawTitle,
          level,
          index: count
        });
      }
    }
    return headings;
  }, [generatedNotes]);

  const filteredOutlineHeadings = useMemo(() => {
    if (!outlineSearchQuery.trim()) return outlineHeadings;
    return outlineHeadings.filter(h =>
      h.title.toLowerCase().includes(outlineSearchQuery.toLowerCase())
    );
  }, [outlineHeadings, outlineSearchQuery]);

  // Asynchronously render Kroki vector diagrams (Mermaid, PlantUML, Graphviz)
  useEffect(() => {
    let isMounted = true;
    async function loadDiagrams() {
      if (!generatedNotes) {
        if (isMounted) setDiagramMap(new Map());
        return;
      }
      const extracted = extractDiagrams(generatedNotes);
      if (extracted.length === 0) {
        if (isMounted) setDiagramMap(new Map());
        return;
      }

      const newMap = new Map<string, string>();
      for (const diag of extracted) {
        try {
          const svgHtml = await fetchKrokiSvg(diag.type, diag.source);
          const containerHtml = `<div class="kroki-container" data-diagram-type="${diag.type}">${svgHtml}</div>`;
          newMap.set(diag.fullMatch, containerHtml);
        } catch (e) {
          console.warn('Failed to render diagram:', e);
        }
      }
      if (isMounted) {
        setDiagramMap(newMap);
      }
    }
    loadDiagrams();
    return () => {
      isMounted = false;
    };
  }, [generatedNotes]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (providerRef.current && !providerRef.current.contains(event.target as Node)) {
        setIsProviderOpen(false);
      }
      if (modelRef.current && !modelRef.current.contains(event.target as Node)) {
        setIsModelOpen(false);
      }
      if (subjectRef.current && !subjectRef.current.contains(event.target as Node)) {
        setIsSubjectDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync state when switching active session
  useEffect(() => {
    if (activeSession) {
      setActivePreset(activeSession.preset || 'detailed');
      setSelectedSubject(activeSession.subject || PRESET_SUBJECTS[0]);
      setCustomSubjectName(activeSession.customSubjectName || '');
      setTopicInput(activeSession.topic || '');
      setLastGeneratedTopic(activeSession.topic || '');
      setSyllabusContext(activeSession.syllabusSnippet || '');
      setGeneratedNotes(activeSession.notesContent || '');
      setWebSearch(activeSession.webSearch ?? true);
      if (activeSession.provider) setSelectedProvider(activeSession.provider);
      if (activeSession.model) setSelectedModel(activeSession.model);
    }
  }, [activeSessionId]);

  // Update current session helper
  const updateCurrentSession = (updates: Partial<LectureNoteSession>) => {
    setSessions(prev =>
      prev.map(s => (s.id === activeSession.id ? { ...s, ...updates, updatedAt: Date.now() } : s))
    );
  };

  // Provider & Model choices (Matching ChatWindow logic with ModelManager sync)
  const currentProviderGroup = React.useMemo(() => {
    return PROVIDERS.find(p => p.id === selectedProvider || p.name === selectedProvider) || PROVIDERS[0];
  }, [selectedProvider]);

  const availableModels = React.useMemo(() => {
    const customList = customModels
      ? (customModels[selectedProvider] || customModels[currentProviderGroup.id] || customModels[currentProviderGroup.name])
      : undefined;
    if (Array.isArray(customList) && customList.length > 0) {
      const enabledCustom = customList.filter(m => m.enabled).map(m => ({
        value: m.id,
        name: m.name
      }));
      if (enabledCustom.length > 0) return enabledCustom;
    }
    return currentProviderGroup.models || [];
  }, [selectedProvider, customModels, currentProviderGroup]);

  const currentModelName = availableModels.find(m => m.value === selectedModel)?.name || selectedModel;

  // Auto-sync active model if current selected model is not in available models
  useEffect(() => {
    if (availableModels.length > 0 && !availableModels.some(m => m.value === selectedModel)) {
      const firstVal = availableModels[0].value;
      setSelectedModel(firstVal);
      localStorage.setItem(`chatterbot_lecture_model_${currentUser}`, firstVal);
      updateCurrentSession({ model: firstVal });
    }
  }, [availableModels, selectedModel, currentUser]);

  // Robust API Key resolution with fallback
  const effectiveUserKeys: UserKeys = React.useMemo(() => {
    if (userKeys && Object.values(userKeys).some(Boolean)) {
      return userKeys;
    }
    const activeUser = localStorage.getItem('chatterbot_username') || currentUser;
    if (activeUser) {
      const saved = localStorage.getItem(`chatterbot_user_keys_${activeUser}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return userKeys;
  }, [userKeys, currentUser]);

  const handleProviderChange = (providerIdOrName: string) => {
    const pObj = PROVIDERS.find(p => p.id === providerIdOrName || p.name === providerIdOrName) || PROVIDERS[0];
    setSelectedProvider(pObj.name);
    localStorage.setItem(`chatterbot_lecture_provider_${currentUser}`, pObj.name);

    const customList = customModels
      ? (customModels[pObj.name] || customModels[pObj.id])
      : undefined;
    let firstModel = pObj.models?.[0]?.value || 'openai-fast';
    if (Array.isArray(customList) && customList.length > 0) {
      const enabled = customList.filter(m => m.enabled);
      if (enabled.length > 0) firstModel = enabled[0].id;
    }

    setSelectedModel(firstModel);
    localStorage.setItem(`chatterbot_lecture_model_${currentUser}`, firstModel);
    updateCurrentSession({ provider: pObj.name, model: firstModel });
    setIsProviderOpen(false);
  };

  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);
    localStorage.setItem(`chatterbot_lecture_model_${currentUser}`, newModel);
    updateCurrentSession({ model: newModel });
    setIsModelOpen(false);
  };

  const handleSubjectChange = (subjectName: string) => {
    setSelectedSubject(subjectName);
    updateCurrentSession({ subject: subjectName });
    setIsSubjectDropdownOpen(false);
  };

  const handlePresetSelect = (presetId: TeacherPresetType) => {
    setActivePreset(presetId);
    updateCurrentSession({ preset: presetId });
  };

  const handleToggleWebSearch = () => {
    const nextVal = !webSearch;
    setWebSearch(nextVal);
    updateCurrentSession({ webSearch: nextVal });
  };

  const handleNewLectureSession = () => {
    const sessionName = window.prompt('Enter a title for this new lecture note session:', topicInput || 'New Lecture Note');
    if (sessionName === null) return; // User clicked cancel
    const finalTitle = sessionName.trim() || 'New Lecture Note';

    const newSess: LectureNoteSession = {
      id: `lecture-sess-${Date.now()}`,
      title: finalTitle,
      subject: selectedSubject,
      customSubjectName: '',
      topic: '',
      preset: activePreset,
      syllabusSnippet: '',
      notesContent: '',
      provider: selectedProvider,
      model: selectedModel,
      webSearch,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setSessions([newSess, ...sessions]);
    setActiveSessionId(newSess.id);
    handleCloseControlDeck();
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const filtered = sessions.filter(s => s.id !== id);
    const fallback = filtered.length > 0 ? filtered : [
      {
        id: `lecture-sess-${Date.now()}`,
        title: 'New Lecture Note',
        subject: PRESET_SUBJECTS[0],
        customSubjectName: '',
        topic: '',
        preset: 'detailed' as TeacherPresetType,
        syllabusSnippet: '',
        notesContent: '',
        provider: selectedProvider,
        model: selectedModel,
        webSearch: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];
    setSessions(fallback);
    if (activeSessionId === id) {
      setActiveSessionId(fallback[0].id);
    }
  };

  const handleClearAllSessions = () => {
    const fresh: LectureNoteSession = {
      id: `lecture-sess-${Date.now()}`,
      title: 'New Lecture Note',
      subject: PRESET_SUBJECTS[0],
      customSubjectName: '',
      topic: '',
      preset: 'detailed',
      syllabusSnippet: '',
      notesContent: '',
      provider: selectedProvider,
      model: selectedModel,
      webSearch: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    setShowClearConfirm(false);
    setIsControlDeckOpen(false);
  };


  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrStatus('Scanning syllabus image with OCR...');
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const ret = await worker.recognize(file);
      await worker.terminate();

      if (ret && ret.data && ret.data.text) {
        const cleaned = ret.data.text.trim();
        setSyllabusContext(cleaned);
        updateCurrentSession({ syllabusSnippet: cleaned });
        setOcrStatus('Syllabus extracted successfully!');
        setTimeout(() => setOcrStatus(''), 4000);
      }
    } catch (err) {
      console.error('OCR Extraction error:', err);
      setOcrStatus('OCR failed. Please paste syllabus manually.');
      setTimeout(() => setOcrStatus(''), 4000);
    }
  };

  const handleClearCurrentNotes = () => {
    setGeneratedNotes('');
    updateCurrentSession({ notesContent: '' });
  };

  const executeNoteGeneration = async (targetTopic: string, baseNotes: string) => {
    if (!targetTopic.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenerationError('');
    setLastGeneratedTopic(targetTopic.trim());

    const currentPresetObj = PRESETS.find(p => p.id === activePreset) || PRESETS[0];
    const subjectDisplayName = selectedSubject === 'Custom Course / Subject'
      ? (customSubjectName.trim() || 'Custom University Course')
      : selectedSubject;

    const studioSystemPrompt = `ROLE PERSONA: You are Prof. Joe, Senior University Professor & Distinguished Academic Lecturer.

CORE AUTHORING RULES (STRICTLY ENFORCED):
1. ZERO CONVERSATIONAL FLUFF: Never output pleasantries, conversational intros, or filler. Begin IMMEDIATELY on Line 1 with the document heading.
2. STRICT LATEX ENCLOSURE: Every mathematical symbol, variable, Greek letter, equation, and matrix derivation MUST be enclosed in $...$ for inline expressions (e.g. $K = g^{xy} \\pmod{p}$) or $$...$$ on dedicated separate lines for display math. NEVER output bare LaTeX commands without $...$ or $$...$$.
3. FULL-OUTPUT ENFORCEMENT & ZERO SHORTCUTS:
   • Never use placeholders (\`// ...\`, "and so on", "for brevity", "left as an exercise"). Deliver every proof, equation, code block, and step in full.
   • Every derivation MUST reach its final boxed/concluded mathematical result. All markdown and code blocks (\`\`\`) MUST be completely closed.
4. PACING & SECTION BREAKPOINT PROTOCOL:
   • If the requested syllabus topics exceed single-response output capacity, maintain 100% textbook depth for the current sections, complete the current section cleanly, and conclude with:
     [PAUSED — Part X Complete. Next Chapter: <Exact Next Topic Name>]
   • When given a continuation prompt, do NOT recap or repeat prior sections. Pick up IMMEDIATELY on Line 1 with the next chapter.
5. VISUAL DIAGRAM ARCHITECTURE:
   When visual structure enhances comprehension, render exactly 1 clean Mermaid block (\`\`\`mermaid ... \`\`\`). Every node MUST have an explicit descriptive title in quotes (e.g. Node1["1. Feature Extraction Matrix X"]). NEVER output bare single-letter nodes (A, B).
6. CLEAN COMPARISON TABLES: Use clean Markdown tables with compact inline math ($...$) for side-by-side comparative analysis.
7. STANDARDS COMPLIANCE: Conclude with standard university textbook references where applicable.`;

    const promptMessage = `# 🎓 LECTURE MATERIAL: ${targetTopic.trim().toUpperCase()}
**University Course / Discipline:** ${subjectDisplayName}
**Pedagogical Framework:** ${currentPresetObj.title} [${currentPresetObj.badge}]

${syllabusContext.trim() ? `**Prescribed Course Syllabus & Scope Boundaries:**\n"""\n${syllabusContext.trim()}\n"""\n` : ''}

**Specific Pedagogical Directives:**
${currentPresetObj.instructionPrompt}

**Formatting Enforcement:**
- Output clean, polished GitHub-Flavored Markdown.
- Every single equation and variable must be enclosed in LaTeX ($...$ inline, $$...$$ block) and ensure all derivations are completed to their final result.
- Render visual diagrams and taxonomies as valid Mermaid (\`\`\`mermaid\`) vector diagrams with meaningful labels on every node (never output bare single letters).
- Include comprehensive comparative tables and structured breakdown blocks.
- Conclude with standard academic textbook references and key takeaway points.`;

    const initialMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      {
        role: 'user',
        content: promptMessage
      }
    ];

    try {
      const response = await sendChatMessage(
        selectedProvider,
        selectedModel,
        initialMessages as any,
        effectiveUserKeys,
        webSearch,
        'none',
        studioSystemPrompt,
        'default'
      );

      const newContent = response.content.trim();
      const existing = (baseNotes || '').trim();

      // Continuous Multi-Chapter Note Appending (Pure client-side append)
      const combinedNotes = existing
        ? `${existing}\n\n---\n\n${newContent}`
        : newContent;

      setGeneratedNotes(combinedNotes);

      const baseTitle = `${targetTopic.trim().substring(0, 24)} (${currentPresetObj.badge})`;
      const currentTitle = activeSession?.title;
      const finalTitle = (!currentTitle || currentTitle === 'New Lecture Note' || !existing)
        ? baseTitle
        : currentTitle.includes(targetTopic.trim().substring(0, 15))
          ? currentTitle
          : `${currentTitle.split(' + ')[0]} + ${targetTopic.trim().substring(0, 16)}`;

      const updatedMessages = [
        ...initialMessages,
        {
          role: 'assistant' as const,
          content: newContent
        }
      ];

      updateCurrentSession({
        notesContent: combinedNotes,
        messages: updatedMessages,
        title: finalTitle,
        subject: selectedSubject,
        customSubjectName,
        topic: targetTopic.trim(),
        preset: activePreset,
        syllabusSnippet: syllabusContext,
        webSearch
      });
    } catch (err: any) {
      console.error('Lecture note generation failed:', err);
      const errMsg = `Failed to generate lecture section for "${targetTopic}": ${err.message || 'Server error'}. Please verify API keys or select Pollinations AI (Free Keyless).`;
      setGenerationError(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinueNextChapter = async () => {
    if (isGenerating || !generatedNotes.trim()) return;

    setIsGenerating(true);
    setGenerationError('');

    const currentPresetObj = PRESETS.find(p => p.id === activePreset) || PRESETS[0];
    const subjectDisplayName = selectedSubject === 'Custom Course / Subject'
      ? (customSubjectName.trim() || 'Custom University Course')
      : selectedSubject;

    const studioSystemPrompt = `ROLE PERSONA: You are Prof. Joe, Senior University Professor & Distinguished Academic Lecturer.

CORE AUTHORING RULES (STRICTLY ENFORCED):
1. ZERO CONVERSATIONAL FLUFF: Never output pleasantries, conversational intros, or filler. Begin IMMEDIATELY on Line 1 with the document heading.
2. STRICT LATEX ENCLOSURE: Every mathematical symbol, variable, Greek letter, equation, and matrix derivation MUST be enclosed in $...$ for inline expressions or $$...$$ on dedicated separate lines for display math. NEVER output bare LaTeX commands without $...$ or $$...$$.
3. FULL-OUTPUT ENFORCEMENT & ZERO SHORTCUTS:
   • Never use placeholders (\`// ...\`, "and so on", "for brevity", "left as an exercise"). Deliver every proof, equation, code block, and step in full.
   • Every derivation MUST reach its final boxed/concluded mathematical result. All markdown and code blocks (\`\`\`) MUST be completely closed.
4. PACING & SECTION BREAKPOINT PROTOCOL:
   • If the requested syllabus topics exceed single-response output capacity, maintain 100% textbook depth for the current sections, complete the current section cleanly, and conclude with:
     [PAUSED — Part X Complete. Next Chapter: <Exact Next Topic Name>]
   • When given a continuation prompt, do NOT recap or repeat prior sections. Pick up IMMEDIATELY on Line 1 with the next chapter.
5. VISUAL DIAGRAM ARCHITECTURE:
   When visual structure enhances comprehension, render exactly 1 clean Mermaid block (\`\`\`mermaid ... \`\`\`). Every node MUST have an explicit descriptive title in quotes. NEVER output bare single-letter nodes (A, B).
6. CLEAN COMPARISON TABLES: Use clean Markdown tables with compact inline math ($...$) for side-by-side comparative analysis.
7. STANDARDS COMPLIANCE: Conclude with standard university textbook references where applicable.`;

    const continuePrompt = `Continue authoring the lecture notes for "${subjectDisplayName} — ${topicInput.trim() || lastGeneratedTopic}".
Pedagogical Framework: ${currentPresetObj.title} [${currentPresetObj.badge}]

Do NOT repeat, recap, or summarize the already authored chapters.
Begin IMMEDIATELY on Line 1 with the next chapter, delivering full theoretical rigor, complete step-by-step mathematical proofs in LaTeX ($$...$$), concrete numerical examples, and comparative tables.`;

    const baseHistory = (activeSession?.messages && activeSession.messages.length > 0)
      ? activeSession.messages
      : [
          { role: 'user' as const, content: `# LECTURE MATERIAL: ${topicInput.trim().toUpperCase()}` },
          { role: 'assistant' as const, content: generatedNotes }
        ];

    const messagesPayload = [
      ...baseHistory,
      {
        role: 'user' as const,
        content: continuePrompt
      }
    ];

    try {
      const response = await sendChatMessage(
        selectedProvider,
        selectedModel,
        messagesPayload as any,
        effectiveUserKeys,
        webSearch,
        'none',
        studioSystemPrompt,
        'default'
      );

      const newContent = response.content.trim();
      const existing = (generatedNotes || '').trim();

      // Clean trailing [PAUSED ...] from existing notes so it forms a seamless textbook
      const cleanedBase = existing.replace(/\n*\[PAUSED[\s\S]*?\]\s*$/i, '').trim();

      const combinedNotes = cleanedBase
        ? `${cleanedBase}\n\n---\n\n${newContent}`
        : newContent;

      setGeneratedNotes(combinedNotes);

      const updatedHistory = [
        ...messagesPayload,
        {
          role: 'assistant' as const,
          content: newContent
        }
      ];

      updateCurrentSession({
        notesContent: combinedNotes,
        messages: updatedHistory,
        updatedAt: Date.now()
      });
    } catch (err: any) {
      console.error('Continuation generation failed:', err);
      setGenerationError(`Failed to continue note generation: ${err.message || 'Server error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateNotes = () => {
    executeNoteGeneration(topicInput.trim(), generatedNotes.trim());
  };

  const handleRetryLastSection = () => {
    const topicToRetry = lastGeneratedTopic || topicInput.trim();
    if (!topicToRetry || isGenerating) return;

    const existing = (generatedNotes || '').trim();
    if (existing.includes('\n\n---\n\n')) {
      const parts = existing.split('\n\n---\n\n');
      parts.pop(); // Remove only the latest failed or incomplete section
      const preservedNotes = parts.join('\n\n---\n\n');
      setGeneratedNotes(preservedNotes);
      updateCurrentSession({ notesContent: preservedNotes });
      executeNoteGeneration(topicToRetry, preservedNotes);
    } else {
      // Single section note
      setGeneratedNotes('');
      updateCurrentSession({ notesContent: '' });
      executeNoteGeneration(topicToRetry, '');
    }
  };

  const renderFormattedNotes = (rawMarkdown: string) => {
    if (!rawMarkdown) return '';

    // Step 0A: Auto-close hanging/unclosed code blocks before headings to prevent layout breakages
    const healedMarkdown = healMarkdownFences(rawMarkdown);

    // Step 0B: Extract Kroki / Mermaid diagrams and replace with tokens so marked and DOMPurify never mangle SVGs or leak <style> text
    const diagrams = extractDiagrams(healedMarkdown);
    const renderDiagramTokens = new Map<string, string>();
    let markdownWithTokens = healedMarkdown;
    let diagTokenIdx = 0;

    diagrams.forEach(diag => {
      const token = `STUDIODIAGRAMTOKEN${diagTokenIdx++}ENDTOKEN`;
      const svgContainer = diagramMap.get(diag.fullMatch);
      if (svgContainer) {
        renderDiagramTokens.set(token, svgContainer);
      } else {
        // Asynchronous loading placeholder
        renderDiagramTokens.set(
          token,
          `<div class="kroki-container kroki-loading-box" style="padding: 20px; text-align: center; color: #64748b; font-size: 0.85rem; background: #ffffff; border-radius: 8px; border: 1px dashed rgba(6, 182, 212, 0.4);">
            <span style="display: inline-block; margin-right: 6px;">⚡</span> Rendering Vector Diagram (${diag.type})...
          </div>`
        );
      }
      markdownWithTokens = markdownWithTokens.replace(diag.fullMatch, token);
    });

    let processed = markdownWithTokens;
    const mathMap = new Map<string, string>();
    let tokenIdx = 0;

    // Step 1: Extract already-delimited display math ($$...$$ and \[...\])
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      const token = `KATEXBLOCKTOKEN${tokenIdx++}ENDTOKEN`;
      try {
        const sanitized = sanitizeLatexForKatex(math);
        mathMap.set(
          token,
          `<div class="katex-display katex-block">${katex.renderToString(sanitized, {
            displayMode: true,
            throwOnError: false
          })}</div>`
        );
      } catch {
        mathMap.set(token, `$$${math}$$`);
      }
      return token;
    });

    processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
      const token = `KATEXBLOCKTOKEN${tokenIdx++}ENDTOKEN`;
      try {
        const sanitized = sanitizeLatexForKatex(math);
        mathMap.set(
          token,
          `<div class="katex-display katex-block">${katex.renderToString(sanitized, {
            displayMode: true,
            throwOnError: false
          })}</div>`
        );
      } catch {
        mathMap.set(token, `\\[${math}\\]`);
      }
      return token;
    });

    // Step 2: Extract already-delimited inline math (\(...\) and $...$)
    processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
      const token = `KATEXINLINETOKEN${tokenIdx++}ENDTOKEN`;
      try {
        const sanitized = sanitizeLatexForKatex(math);
        mathMap.set(
          token,
          `<span class="katex-inline">${katex.renderToString(sanitized, {
            displayMode: false,
            throwOnError: false
          })}</span>`
        );
      } catch {
        mathMap.set(token, `\\(${math}\\)`);
      }
      return token;
    });

    processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      const token = `KATEXINLINETOKEN${tokenIdx++}ENDTOKEN`;
      try {
        const sanitized = sanitizeLatexForKatex(math);
        mathMap.set(
          token,
          `<span class="katex-inline">${katex.renderToString(sanitized, {
            displayMode: false,
            throwOnError: false
          })}</span>`
        );
      } catch {
        mathMap.set(token, `$${math}$`);
      }
      return token;
    });

    // Step 3: Auto-detect bare LaTeX formulas & equations that the AI wrote without $$ delimiters
    const lines = processed.split('\n');
    let inCodeBlock = false;

    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return line;
      }
      if (inCodeBlock) return line;

      // Check if line contains bare LaTeX math without existing KATEX token
      const hasMathKeywords =
        trimmed.startsWith('\\') ||
        (/^[a-zA-Z_]\s*(\([^\)]*\))?\s*=\s*/.test(trimmed) && (trimmed.includes('\\') || trimmed.includes('^') || trimmed.includes('_'))) ||
        /\\(begin|bmatrix|pmatrix|vmatrix|matrix|align|equation|cases|frac|sum|prod|int|sqrt|mathbf|mathcal|mathbb|boldsymbol|nabla|partial|alpha|beta|gamma|delta|epsilon|theta|lambda|mu|sigma|omega|arg|min|max|vec|hat|tilde|in|subseteq|times|pm|le|ge|neq|approx|to|rightarrow|implies|mid|vert|parallel|mathbb)/.test(trimmed);

      const isStandaloneFormula =
        !line.includes('KATEX') &&
        hasMathKeywords &&
        !trimmed.startsWith('#') &&
        !trimmed.startsWith('- ') &&
        !trimmed.startsWith('* ') &&
        !trimmed.startsWith('>') &&
        !trimmed.startsWith('|') &&
        !trimmed.startsWith('1.') &&
        !trimmed.startsWith('2.') &&
        !trimmed.startsWith('3.') &&
        !trimmed.startsWith('4.') &&
        !trimmed.startsWith('5.');

      if (isStandaloneFormula) {
        const token = `KATEXBLOCKTOKEN${tokenIdx++}ENDTOKEN`;
        try {
          const sanitized = sanitizeLatexForKatex(trimmed);
          mathMap.set(
            token,
            `<div class="katex-display katex-block">${katex.renderToString(sanitized, {
              displayMode: true,
              throwOnError: false
            })}</div>`
          );
        } catch {
          mathMap.set(token, trimmed);
        }
        return token;
      }

      return line;
    });

    const prepped = processedLines.join('\n');

    // 4. Parse Markdown structure (tables, lists, headings, code)
    let dirtyHtml = marked.parse(prepped) as string;

    // 5. Restore math HTML
    mathMap.forEach((html, token) => {
      dirtyHtml = dirtyHtml.replaceAll(token, html);
    });

    // 6. Sanitize sanitized document HTML (without corrupting SVG tags)
    let cleanHtml = DOMPurify.sanitize(dirtyHtml, {
      ADD_TAGS: [
        'math', 'annotation', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub',
        'mfrac', 'mover', 'munder', 'msqrt', 'table', 'thead', 'tbody', 'tr', 'th',
        'td', 'span', 'div', 'hr', 'blockquote', 'code', 'pre'
      ],
      ADD_ATTR: ['display', 'style', 'class', 'id', 'aria-hidden']
    });

    // 7. Inject pristine vector SVG diagrams AFTER DOMPurify
    renderDiagramTokens.forEach((svgContainerHtml, token) => {
      const paragraphWrapped = `<p>${token}</p>`;
      if (cleanHtml.includes(paragraphWrapped)) {
        cleanHtml = cleanHtml.replace(paragraphWrapped, svgContainerHtml);
      } else {
        cleanHtml = cleanHtml.replaceAll(token, svgContainerHtml);
      }
    });

    // 8. Inject index IDs into headings for 1-click chapter outline jumping
    let headingCounter = 0;
    cleanHtml = cleanHtml.replace(/<(h[1-3])([^>]*)>([\s\S]*?)<\/\1>/gi, (_match, tag, attrs, content) => {
      headingCounter++;
      const headingId = `lecture-heading-${headingCounter}`;
      return `<${tag} id="${headingId}" ${attrs}>${content}</${tag}>`;
    });

    return cleanHtml;
  };

  const handlePrint = () => {
    if (!generatedNotes) return;
    const effectiveSubject = selectedSubject === 'Custom Course / Subject' ? (customSubjectName || 'Custom') : selectedSubject;
    printBubbleToPdf(generatedNotes, selectedModel, `${effectiveSubject}-${topicInput}-LectureNotes`);
  };

  const filteredSessions = sessions.filter(s =>
    (s.title || '').toLowerCase().includes(controlDeckSearchQuery.toLowerCase()) ||
    (s.topic || '').toLowerCase().includes(controlDeckSearchQuery.toLowerCase()) ||
    (s.subject || '').toLowerCase().includes(controlDeckSearchQuery.toLowerCase()) ||
    (s.customSubjectName || '').toLowerCase().includes(controlDeckSearchQuery.toLowerCase())
  );

  const activePresetObj = PRESETS.find(p => p.id === activePreset) || PRESETS[0];
  const effectiveSubjectLabel = selectedSubject === 'Custom Course / Subject'
    ? (customSubjectName.trim() || 'Custom Course')
    : selectedSubject;

  return (
    <>
      <div className="studio-unified-wrapper" data-code-theme={codeStyle.codeTheme}>
        {/* 📄 Dedicated Academic Parchment Stage (Natural Top Reading Stage) */}
        <main className="studio-parchment-stage">
          <div className="academic-parchment-sheet">
            {/* Header Watermark Plate */}
            <div className="parchment-header-plate">
              <div className="parchment-faculty-identity">
                <div className="faculty-seal-badge">
                  <img src="/joe-avatar.png" alt="Prof. Joe" className="faculty-seal-img" />
                </div>
                <div>
                  <h3 className="parchment-subject-title">{effectiveSubjectLabel}</h3>
                  <p className="parchment-meta-line">
                    <span className="meta-topic">{topicInput || 'Topic Preview'}</span>
                    <span className="meta-sep">•</span>
                    <span className="meta-preset">{activePresetObj.title}</span>
                    {webSearch && (
                      <>
                        <span className="meta-sep">•</span>
                        <span className="text-cyan-400 font-semibold text-xs">🌐 Web Grounded</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="parchment-right-meta flex items-center gap-2">
                <span className="parchment-date">
                  {new Date(activeSession?.updatedAt || Date.now()).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                {generatedNotes && (
                  <button
                    type="button"
                    onClick={handleClearCurrentNotes}
                    title="Reset canvas and clear notes on this document"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '5px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      background: 'rgba(244, 63, 94, 0.12)',
                      color: '#f43f5e',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={11} />
                    <span>Reset</span>
                  </button>
                )}
                <span className="parchment-seal-tag">Faculty Archive</span>
              </div>
            </div>

            {/* Parchment Body */}
            <div className="parchment-body">
              {generatedNotes ? (
                <>
                  <article
                    className="markdown-content lecture-parchment-content"
                    dangerouslySetInnerHTML={{ __html: renderFormattedNotes(generatedNotes) }}
                  />

                  {/* ⚡ Multi-Part Full-Output Pause Indicator */}
                  {generatedNotes.includes('[PAUSED') && !isGenerating && (
                    <div className="parchment-pause-indicator">
                      <div className="flex items-center gap-2">
                        <div className="pause-pulse-dot" />
                        <span className="pause-indicator-title">
                          Multi-Part Note Paused at Clean Boundary
                        </span>
                      </div>
                      {(() => {
                        const pauseMatch = generatedNotes.match(/\[PAUSED[\s\S]*?Next(?:\s+Chapter)?:\s*([^\]\n]+)\]/i);
                        const nextChapterName = pauseMatch ? pauseMatch[1].trim() : '';
                        return nextChapterName ? (
                          <span className="pause-indicator-badge">
                            Next: {nextChapterName}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  )}

                  {/* 🍱 2×2 Balanced Bento Action Deck */}
                  {!isGenerating && (
                    <div className="parchment-bento-deck">
                      {/* Tile 1: Continue Next Chapter */}
                      <button
                        type="button"
                        onClick={handleContinueNextChapter}
                        className="bento-tile bento-tile-continue"
                        title="Continue generating next chapter with full mathematical rigor"
                      >
                        <div className="bento-tile-icon cyan">
                          <Zap size={16} />
                        </div>
                        <div className="bento-tile-content">
                          <div className="bento-tile-title">⚡ Continue Next Chapter</div>
                          <div className="bento-tile-desc">Author next syllabus section seamlessly</div>
                        </div>
                      </button>

                      {/* Tile 2: Add Topic Section */}
                      <button
                        type="button"
                        onClick={() => {
                          composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className="bento-tile bento-tile-add"
                        title="Scroll down to compose a different topic"
                      >
                        <div className="bento-tile-icon blue">
                          <Plus size={16} />
                        </div>
                        <div className="bento-tile-content">
                          <div className="bento-tile-title">+ Add Topic Section</div>
                          <div className="bento-tile-desc">Enter new concept into this master note</div>
                        </div>
                      </button>

                      {/* Tile 3: Regenerate Section */}
                      <button
                        type="button"
                        onClick={handleRetryLastSection}
                        className="bento-tile bento-tile-retry"
                        title="Regenerate only the latest section"
                      >
                        <div className="bento-tile-icon slate">
                          <RotateCcw size={15} />
                        </div>
                        <div className="bento-tile-content">
                          <div className="bento-tile-title">Regenerate Section</div>
                          <div className="bento-tile-desc">Redo latest section with active AI model</div>
                        </div>
                      </button>

                      {/* Tile 4: Print / Export PDF */}
                      <button
                        type="button"
                        onClick={handlePrint}
                        className="bento-tile bento-tile-print"
                        title="Export document to PDF or Native Print"
                      >
                        <div className="bento-tile-icon amber">
                          <Printer size={15} />
                        </div>
                        <div className="bento-tile-content">
                          <div className="bento-tile-title">Print / Export PDF</div>
                          <div className="bento-tile-desc">High-res export with KaTeX & diagrams</div>
                        </div>
                      </button>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="mt-6 p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center gap-3 animate-pulse">
                      <RefreshCw size={18} className="text-cyan-400 animate-spin flex-shrink-0" />
                      <span className="text-sm font-semibold text-cyan-300">
                        Synthesizing and appending next section for "{topicInput || lastGeneratedTopic}"...
                      </span>
                    </div>
                  )}
                </>
              ) : isGenerating ? (
                <div className="parchment-loading-skeleton">
                  <div className="skeleton-icon-circle">
                    <GraduationCap size={32} className="text-cyan-400 animate-pulse" />
                  </div>
                  <h3 className="skeleton-title">Synthesizing University Lecture Material</h3>
                  <p className="skeleton-subtitle">
                    Applying {activePresetObj.title} pedagogical directives, {webSearch ? 'live academic web search,' : ''} KaTeX math rendering, and blackboard diagrams.
                  </p>
                </div>
              ) : (
                <div className="parchment-empty-hero">
                  <div className="empty-hero-icon">
                    <GraduationCap size={36} className="text-cyan-400" />
                  </div>
                  <h3 className="empty-hero-title">Academic Lecture Studio Canvas</h3>
                  <p className="empty-hero-sub">
                    Enter any topic, textbook chapter, or concept below, then click <strong>Generate Notes</strong> to produce masterfully structured lecture notes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ⚠️ Floating Error Notification Banner */}
        {generationError && (
          <div className="studio-error-toast mt-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-300 flex-shrink-0" />
              <span>{generationError}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleRetryLastSection}
                className="studio-retry-pill-btn"
                title="Retry generating this section"
              >
                <RotateCcw size={12} />
                <span>Retry Topic</span>
              </button>
              <button
                type="button"
                onClick={() => setGenerationError('')}
                className="p-1 hover:bg-rose-900/50 rounded text-rose-200 hover:text-white cursor-pointer"
                title="Dismiss error"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* 🎓 Unified Smart Command Bar (Placed right below the notes canvas) */}
        <header className="studio-smart-bar studio-top-nav-bar mt-2">
          <div className="smart-bar-left">
            {/* 📜 Command Deck Trigger Button (Opens Left-Side Control Deck) */}
            <button
              type="button"
              onClick={() => setIsControlDeckOpen(true)}
              className="demo-view-toggle-btn lecture-command-deck-btn"
              title="Open Lecture Control Deck & Saved History"
            >
              <Zap size={14} />
              <span>📜 Command Deck</span>
            </button>

            {/* Brand Pill */}
            <div className="smart-brand-pill hidden sm:inline-flex">
              <GraduationCap size={17} />
              <span className="smart-brand-text">Lecture Studio</span>
              <span className="smart-role-tag">Educator</span>
            </div>

            {/* Live Context Summary Pill */}
            <div className="smart-context-summary">
              <span className="context-subject">{effectiveSubjectLabel}</span>
              <span className="context-divider">•</span>
              <span className="context-preset">{activePresetObj.badge}</span>
              <span className="context-divider">•</span>
              <span className="context-topic" title={topicInput}>{topicInput || 'No Topic Chosen'}</span>
            </div>
          </div>

          <div className="smart-bar-right">
            {/* ⚡ Provider & 🤖 Model Pickers (Exact Main Chat Styling) */}
            <div className="desktop-model-selectors flex items-center gap-2">
              {/* Provider Picker */}
              <div className="relative inline-block provider-picker-wrapper" ref={providerRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsProviderOpen(!isProviderOpen);
                    setIsModelOpen(false);
                  }}
                  className="custom-dropdown-pill"
                  title="Select AI Provider"
                >
                  <span className="picker-icon">⚡</span>
                  <span className="truncate">{currentProviderGroup.name}</span>
                  <ChevronDown size={13} className={`transition-transform duration-200 ${isProviderOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProviderOpen && (
                  <div className="custom-dropdown-menu top-downward-menu provider-menu">
                    <div className="dropdown-header">AI Providers</div>
                    {PROVIDERS.map(p => {
                      const isSelected = p.id === currentProviderGroup.id || p.name === selectedProvider;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleProviderChange(p.id)}
                          className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                        >
                          <span>{p.name}</span>
                          {isSelected && <Check size={13} className="text-cyan-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Model Picker */}
              <div className="relative inline-block model-picker-wrapper" ref={modelRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsModelOpen(!isModelOpen);
                    setIsProviderOpen(false);
                  }}
                  className="custom-dropdown-pill"
                  title="Select AI Model"
                >
                  <span className="picker-icon">🤖</span>
                  <span className="truncate">{currentModelName}</span>
                  <ChevronDown size={13} className={`transition-transform duration-200 ${isModelOpen ? 'rotate-180' : ''}`} />
                </button>

                {isModelOpen && (
                  <div className="custom-dropdown-menu top-downward-menu model-menu">
                    <div className="dropdown-header">{currentProviderGroup.name.toUpperCase()} MODELS</div>
                    {availableModels.map(m => {
                      const isSelected = m.value === selectedModel;
                      return (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => handleModelChange(m.value)}
                          className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                        >
                          <span>{m.name}</span>
                          {isSelected && <Check size={13} className="text-cyan-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Clean Quick Action Tools: New Note, Print */}
            <div className="smart-actions-deck">
              <button
                type="button"
                onClick={handleNewLectureSession}
                className="smart-action-btn highlight"
                title="Start a Fresh Lecture Draft"
              >
                <Plus size={15} />
                <span className="btn-label-desktop">New Note</span>
              </button>

              {generatedNotes && (
                <button
                  type="button"
                  onClick={handlePrint}
                  className="smart-action-btn"
                  title="Native Print / PDF"
                >
                  <Printer size={15} />
                  <span className="btn-label-desktop">Print</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* 🎛️ Bottom Authoring & Control Deck (Box 1 & Box 2 directly below the notes) */}
        <section className="studio-composer-dock mt-2" ref={composerRef}>
          {/* Step 1: Pedagogical Modes (Box 1) */}
          <div className="composer-row">
              <div className="composer-row-header">
                <span className="composer-step-badge">1</span>
                <span className="composer-row-title">Select Pedagogical Mode</span>
              </div>
              <div className="pedagogy-pills-carousel">
                {PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetSelect(preset.id)}
                      className={`pedagogy-pill ${isSelected ? 'active' : ''}`}
                      title={preset.description}
                    >
                      <Icon size={16} className="pedagogy-icon" />
                      <div className="pedagogy-text">
                        <span className="pedagogy-title">{preset.title}</span>
                        <span className="pedagogy-badge">{preset.badge}</span>
                      </div>
                      {isSelected && <CheckCircle2 size={14} className="pedagogy-check" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Course Subject & Target Topic Authoring (Box 2) */}
            <div className="composer-row">
              <div className="composer-row-header justify-between">
                <div className="flex items-center gap-2">
                  <span className="composer-step-badge">2</span>
                  <span className="composer-row-title">Course Subject & Target Topic</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSyllabusDrawerOpen(!isSyllabusDrawerOpen)}
                  className={`syllabus-scope-toggle-btn ${syllabusContext.trim() ? 'has-content' : ''}`}
                  title="Configure Course Syllabus Scope & Reference Boundary"
                >
                  <FileSearch size={13} />
                  <span>
                    {syllabusContext.trim() ? 'Syllabus Attached (Strict Scope)' : '+ Attach Syllabus / Scope'}
                  </span>
                  {isSyllabusDrawerOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              {/* Subject & Topic Row */}
              <div className="catalog-selection-top-row">
                {/* Course / Subject Picker Dropdown */}
                <div className="subject-dropdown-wrapper" ref={subjectRef}>
                  <label className="field-label">Course / Subject</label>
                  <button
                    type="button"
                    onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                    className="custom-subject-trigger"
                  >
                    <BookMarked size={15} className="text-cyan-400 flex-shrink-0" />
                    <span className="subject-trigger-name">{effectiveSubjectLabel}</span>
                    <ChevronDown size={14} className={`dropdown-chevron ${isSubjectDropdownOpen ? 'open' : ''}`} />
                  </button>

                  {isSubjectDropdownOpen && (
                    <div className="custom-dropdown-menu dropup-menu w-full" style={{ minWidth: '280px', maxWidth: '380px' }}>
                      <div className="dropdown-header">University Course / Subject</div>
                      {PRESET_SUBJECTS.map(s => {
                        const isSelected = selectedSubject === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleSubjectChange(s)}
                            className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                          >
                            <span>{s}</span>
                            {isSelected && <Check size={13} className="text-cyan-400" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Target Concept / Chapter / Topic Input Field */}
                <div className="topic-text-wrapper">
                  <label className="field-label">
                    Target Topic / Concept to Author (e.g. RSA Algorithm, Diffie-Hellman from Stallings)
                  </label>
                  <div className="topic-input-glow-box">
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => {
                        setTopicInput(e.target.value);
                        updateCurrentSession({ topic: e.target.value });
                      }}
                      placeholder="Type the specific topic, chapter or concept you want generated..."
                      className="topic-text-field"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleGenerateNotes();
                      }}
                    />
                    {topicInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setTopicInput('');
                          updateCurrentSession({ topic: '' });
                        }}
                        className="clear-topic-btn"
                        title="Clear topic input"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* If Custom Subject selected, show custom name field */}
              {selectedSubject === 'Custom Course / Subject' && (
                <div className="mt-1">
                  <label className="field-label">Custom Subject Title</label>
                  <input
                    type="text"
                    value={customSubjectName}
                    onChange={(e) => {
                      setCustomSubjectName(e.target.value);
                      updateCurrentSession({ customSubjectName: e.target.value });
                    }}
                    placeholder="e.g. Advanced Operating Systems, Cloud Computing, Compiler Design..."
                    className="clean-composer-input"
                  />
                </div>
              )}

              {/* 📑 Expandable Syllabus Scope & Context Area */}
              {isSyllabusDrawerOpen && (
                <div className="syllabus-context-collapsible-box">
                  <div className="ocr-upload-bar">
                    <span className="text-xs font-semibold text-slate-300">
                      Syllabus Scope Boundary (Notes will be strictly framed within this scope):
                    </span>
                    <label className="ocr-file-btn">
                      <Upload size={13} />
                      <span>{ocrStatus || 'Scan Syllabus Image (OCR)'}</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleOcrUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  <textarea
                    value={syllabusContext}
                    onChange={(e) => {
                      setSyllabusContext(e.target.value);
                      updateCurrentSession({ syllabusSnippet: e.target.value });
                    }}
                    placeholder="Paste full syllabus outline, unit breakdown, textbook reference chapters, or course topics here. The AI will strictly anchor all generated notes to this scope."
                    rows={3}
                    className="clean-composer-textarea"
                  />
                </div>
              )}
            </div>

            {/* Step 3: Synthesis Trigger Bar */}
            <div className="composer-footer">
              <div className="flex items-center gap-2">
                {generatedNotes.trim() ? (
                  <button
                    type="button"
                    onClick={handleClearCurrentNotes}
                    className="studio-reset-parchment-btn"
                    title="Clear canvas to start a blank document"
                  >
                    <Trash2 size={13} />
                    <span>Clear Canvas</span>
                  </button>
                ) : (
                  <span className="composer-hint-text hidden sm:inline-flex">
                    Press <kbd className="composer-kbd">Enter ↵</kbd> to author lecture notes
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleGenerateNotes}
                disabled={isGenerating || !topicInput.trim()}
                className="synthesize-btn"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Synthesizing Lecture Notes...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>{generatedNotes.trim() ? '+ Append Section to Notes' : 'Generate Notes'}</span>
                    <ArrowRight size={14} className="opacity-70" />
                  </>
                )}
              </button>
            </div>
          </section>

        {/* 📱 Mobile Floating Sticky Action Bar (FAB) */}
        <div className="mobile-floating-action-bar">
          <button
            type="button"
            onClick={
              generatedNotes.includes('[PAUSED') && (!topicInput.trim() || topicInput.trim() === lastGeneratedTopic)
                ? handleContinueNextChapter
                : handleGenerateNotes
            }
            disabled={
              isGenerating ||
              (!generatedNotes.includes('[PAUSED') && !topicInput.trim())
            }
            className="mobile-fab-btn primary"
            style={
              generatedNotes.includes('[PAUSED') && (!topicInput.trim() || topicInput.trim() === lastGeneratedTopic)
                ? { background: 'linear-gradient(135deg, #06b6d4, #6366f1)', boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)' }
                : undefined
            }
          >
            {isGenerating ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : generatedNotes.includes('[PAUSED') && (!topicInput.trim() || topicInput.trim() === lastGeneratedTopic) ? (
              <Zap size={16} />
            ) : (
              <Sparkles size={16} />
            )}
            <span>
              {isGenerating
                ? 'Synthesizing...'
                : generatedNotes.includes('[PAUSED') && (!topicInput.trim() || topicInput.trim() === lastGeneratedTopic)
                  ? '⚡ Continue Next Chapter'
                  : generatedNotes.trim()
                    ? '+ Append Section'
                    : 'Generate Notes'}
            </span>
          </button>

          {generatedNotes && (
            <div className="mobile-fab-tools">
              {outlineHeadings.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsOutlineOpen(true)}
                  className="mobile-fab-tool-btn highlight"
                  title="Chapter Outline"
                >
                  <List size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={handlePrint}
                className="mobile-fab-tool-btn"
                title="Native Print"
              >
                <Printer size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Themed PDF & PNG Preview Modal */}
        {isPreviewModalOpen && generatedNotes && (
          <PdfPreviewModal
            isOpen={isPreviewModalOpen}
            onClose={() => setIsPreviewModalOpen(false)}
            content={generatedNotes}
            modelUsed={selectedModel}
            docTitle={`${effectiveSubjectLabel.replace(/[^a-zA-Z0-9]/g, '_')}_${topicInput.replace(/[^a-zA-Z0-9]/g, '_')}_LectureNotes`}
            renderedHtml={renderFormattedNotes(generatedNotes)}
          />
        )}
      </div>

      {/* 📜 UNIFIED LEFT-SIDE LECTURE CONTROL DECK DRAWER (100% Exact Matching Screenshot 1 & Bento Architecture) */}
      {effectiveControlDeckOpen && (
        <div className="demo-drawer-overlay" onClick={handleCloseControlDeck} style={{ zIndex: 999999 }}>
          <aside
            className="demo-chat-history-drawer"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '380px', maxWidth: '90vw' }}
          >
            {/* 1. Drawer Header Bar */}
            <div className="demo-drawer-header">
              <div className="demo-drawer-title">
                <Clock size={16} style={{ color: 'var(--accent-cyan)' }} />
                <h3>Lecture Control Deck</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseControlDeck}
                className="demo-icon-btn"
                aria-label="Close Lecture Control Deck"
              >
                <X size={16} />
              </button>
            </div>

            {/* 2. Bento Command Control Deck (4-Column Compact Grid) */}
            <div className="demo-bento-deck">
              <div className="bento-deck-header">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={12} style={{ color: 'var(--accent-cyan)' }} />
                  <span>COMMAND CONTROLS</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="bento-clear-context-btn"
                  title="Reset and clear all saved lecture note drafts"
                >
                  <RotateCcw size={11} />
                  <span>Clear All</span>
                </button>
              </div>

              <div className="bento-grid-container-4col">
                {/* Tile 1: Persistent Web Search */}
                <div
                  className={`bento-card-tile-compact ${webSearch ? 'active-glow-cyan' : ''}`}
                  onClick={handleToggleWebSearch}
                  title="Toggle Persistent Academic Web Search Grounding"
                >
                  <div className="bento-tile-icon-sm cyan">
                    <Globe size={13} />
                  </div>
                  <span className="bento-tile-label">Web Search</span>
                  <span className={`bento-mini-badge ${webSearch ? 'on' : 'off'}`}>
                    {webSearch ? 'ON' : 'OFF'}
                  </span>
                </div>

                {/* Tile 2: Model & Session Monitor */}
                <div className="bento-card-tile-compact" title={`Provider: ${selectedProvider} | Model: ${selectedModel}`}>
                  <div className="bento-tile-icon-sm purple">
                    <BarChart2 size={13} />
                  </div>
                  <span className="bento-tile-label">{selectedModel.slice(0, 10)}</span>
                  <span className="bento-mini-badge off">{sessions.length} drafts</span>
                </div>

                {/* Tile 3: Preview Note Modal */}
                <div
                  className="bento-card-tile-compact"
                  onClick={() => {
                    if (generatedNotes) {
                      setIsPreviewModalOpen(true);
                      handleCloseControlDeck();
                    }
                  }}
                  title="Open styled in-app Document Preview Modal"
                  style={{ opacity: generatedNotes ? 1 : 0.6 }}
                >
                  <div className="bento-tile-icon-sm blue">
                    <Eye size={13} />
                  </div>
                  <span className="bento-tile-label">Preview</span>
                </div>

                {/* Tile 4: Native Print / PDF */}
                <div
                  className="bento-card-tile-compact"
                  onClick={() => {
                    if (generatedNotes) {
                      handlePrint();
                      handleCloseControlDeck();
                    }
                  }}
                  title="Open System Native Chrome Print Preview Dialog"
                  style={{ opacity: generatedNotes ? 1 : 0.6 }}
                >
                  <div className="bento-tile-icon-sm emerald">
                    <Printer size={13} />
                  </div>
                  <span className="bento-tile-label">Print / PDF</span>
                </div>
              </div>
            </div>

            {/* Clear All Confirmation Modal Inside Drawer */}
            {showClearConfirm && (
              <div className="demo-clear-confirm-banner" style={{ marginBottom: '10px' }}>
                <p>Clear all saved lecture notes drafts?</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    className="confirm-yes-btn"
                    onClick={handleClearAllSessions}
                  >
                    Yes, Clear All
                  </button>
                  <button
                    type="button"
                    className="confirm-no-btn"
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* 3. Unified Search Bar & New Lecture Note Action Row */}
            <div className="demo-drawer-search-action-row">
              <div className="demo-drawer-search-bar">
                <Search size={14} style={{ color: 'var(--accent-cyan)' }} />
                <input
                  type="text"
                  placeholder="Search past lecture notes..."
                  value={controlDeckSearchQuery}
                  onChange={(e) => setControlDeckSearchQuery(e.target.value)}
                  className="demo-search-input"
                />
                {controlDeckSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setControlDeckSearchQuery('')}
                    className="clear-search-btn"
                    aria-label="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  handleNewLectureSession();
                  setIsControlDeckOpen(false);
                }}
                className="drawer-new-chat-btn"
                title="Create New Lecture Note"
              >
                <Plus size={15} />
                <span>New Note</span>
              </button>
            </div>

            {/* 4. Scrollable Session List */}
            <div className="demo-drawer-sessions-list">
              {filteredSessions.length === 0 ? (
                <div className="demo-empty-sessions">
                  <GraduationCap size={24} className="text-slate-500 mb-1" />
                  <p>{controlDeckSearchQuery ? 'No matching lecture notes' : 'No lecture history yet'}</p>
                </div>
              ) : (
                filteredSessions.map((s) => {
                  const isActive = s.id === activeSession.id;
                  const titleText = s.title || s.topic || 'New Lecture Note';
                  const presetObj = PRESETS.find(p => p.id === s.preset) || PRESETS[0];

                  return (
                    <div
                      key={s.id}
                      className={`demo-session-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setActiveSessionId(s.id);
                        handleCloseControlDeck();
                      }}
                    >
                      <div className="demo-session-info">
                        <GraduationCap size={15} style={{ color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
                        <span className="demo-session-title">
                          {titleText}
                        </span>
                      </div>

                      <div className="demo-session-meta">
                        <span className="demo-msg-badge">{presetObj.badge}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(e, s.id);
                          }}
                          className="demo-delete-session-btn"
                          title="Delete lecture note draft"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        </div>
      )}

      {/* 🧭 Vertical Navigation Micro-Dock (Stationed on Desktop Right Margin) */}
      {outlineHeadings.length > 0 && (
        <div className="parchment-vertical-micro-dock" aria-label="Lecture Notes Navigation Dock">
          <button
            type="button"
            onClick={() => {
              const scrollContainer = document.querySelector('.studio-content-wrapper, .studio-paper-scroll, .main-scroll-area');
              if (scrollContainer) {
                scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="micro-dock-btn"
            title="Scroll to Top of Notes"
          >
            <ChevronUp size={18} />
          </button>
          <button
            type="button"
            onClick={() => setIsOutlineOpen(true)}
            className="micro-dock-btn outline-active"
            title={`Open Chapter Outline (${outlineHeadings.length} Sections)`}
          >
            <BookOpen size={18} />
            <span className="micro-dock-count">{outlineHeadings.length}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const scrollContainer = document.querySelector('.studio-content-wrapper, .studio-paper-scroll, .main-scroll-area');
              if (scrollContainer) {
                scrollContainer.scrollTo({ top: scrollContainer.scrollHeight + 10000, behavior: 'smooth' });
              }
              composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }}
            className="micro-dock-btn"
            title="Jump to Composer & Actions"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      )}

      {/* 📖 Isolated Document Outline / Chapter TOC Drawer (Rule #1 DOM Root Placement) */}
      {isOutlineOpen && (
        <div className="demo-drawer-overlay right-drawer" onClick={() => setIsOutlineOpen(false)} style={{ zIndex: 999999 }}>
          <aside className="studio-outline-drawer" onClick={(e) => e.stopPropagation()}>
            {/* 1. Drawer Header Bar (Compact Inline Single-Row Plate) */}
            <div className="demo-drawer-header" style={{ marginBottom: '14px', paddingBottom: '12px' }}>
              <div className="demo-drawer-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="brand-circle">
                  <List size={16} className="text-cyan-400" />
                </div>
                <div className="brand-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap' }}>
                    Chapter Outline
                  </h3>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid rgba(6, 182, 212, 0.35)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {outlineHeadings.length} Sections
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOutlineOpen(false)}
                className="demo-icon-btn"
                aria-label="Close Chapter Outline"
                title="Close Chapter Outline"
              >
                <X size={18} />
              </button>
            </div>

            {/* 2. Primary Action Button: Jump to Composer & Actions */}
            <div className="demo-primary-action-wrap" style={{ marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsOutlineOpen(false);
                  const scrollContainer = document.querySelector('.studio-content-wrapper, .studio-paper-scroll, .main-scroll-area');
                  if (scrollContainer) {
                    scrollContainer.scrollTo({ top: scrollContainer.scrollHeight + 10000, behavior: 'smooth' });
                  }
                  composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
                className="demo-new-chat-btn"
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)'
                }}
              >
                <Zap size={15} />
                <span>Jump to Composer & Actions</span>
              </button>
            </div>

            {/* 3. Search Outline Input with Clean Spacing */}
            <div className="demo-drawer-search-bar" style={{ marginBottom: '14px' }}>
              <Search size={14} className="text-cyan-400" />
              <input
                type="text"
                placeholder="Search outline headings..."
                value={outlineSearchQuery}
                onChange={(e) => setOutlineSearchQuery(e.target.value)}
                className="demo-search-input"
              />
              {outlineSearchQuery && (
                <button
                  type="button"
                  onClick={() => setOutlineSearchQuery('')}
                  className="clear-search-btn"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* 4. Single-Line Numbered Outline Headings List with Model-Picker Style Smooth Scroll */}
            <div className="studio-outline-list">
              {filteredOutlineHeadings.length === 0 ? (
                <div className="demo-empty-sessions">
                  <FileText size={24} className="text-slate-500 mb-1" />
                  <p>{outlineSearchQuery ? 'No matching chapters found' : 'No headings found in notes'}</p>
                </div>
              ) : (
                filteredOutlineHeadings.map((h) => (
                  <div
                    key={h.id}
                    className="outline-heading-item"
                    onClick={() => {
                      setIsOutlineOpen(false);
                      let targetEl = document.getElementById(`lecture-heading-${h.index}`);
                      if (!targetEl) {
                        // Intelligent Fallback: Match text content across rendered headings
                        const cleanTitle = h.title.toLowerCase().replace(/[^a-z0-9]/g, '');
                        const allHeadings = Array.from(
                          document.querySelectorAll('.lecture-parchment-content h1, .lecture-parchment-content h2, .lecture-parchment-content h3')
                        );
                        targetEl = (allHeadings.find(el => {
                          const elText = (el.textContent || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                          return elText.includes(cleanTitle) || cleanTitle.includes(elText);
                        }) as HTMLElement) || null;
                      }
                      if (targetEl) {
                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    title={h.title}
                  >
                    <div className="outline-item-left">
                      <span className="outline-index-badge">{h.index}</span>
                      <span className="outline-heading-title">{h.title}</span>
                    </div>
                    <ArrowRight size={13} className="outline-arrow" />
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
export default LectureNotesStudioView;
