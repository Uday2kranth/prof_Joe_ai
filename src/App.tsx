import React, { useState, useEffect } from 'react';
import type { ChatSession, Message, UserKeys, ActiveViewType, UserCustomModels } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';

// Code-Split Heavy Studio Views for Instant Initial App Load & Drastic Bundle Optimization
const PracticalCodeLabView = React.lazy(() => import('./components/PracticalCodeLabView').then(m => ({ default: m.PracticalCodeLabView })));
const LectureNotesStudioView = React.lazy(() => import('./components/LectureNotesStudioView').then(m => ({ default: m.LectureNotesStudioView })));
const ExamPrepView = React.lazy(() => import('./components/ExamPrepView').then(m => ({ default: m.ExamPrepView })));
const SystemPromptLibraryView = React.lazy(() => import('./components/SystemPromptLibraryView').then(m => ({ default: m.SystemPromptLibraryView })));
const PromptLibraryView = React.lazy(() => import('./components/PromptLibraryView').then(m => ({ default: m.PromptLibraryView })));
const FunPersonaChatView = React.lazy(() => import('./components/FunPersonaChatView').then(m => ({ default: m.FunPersonaChatView })));
const DiagramStudioView = React.lazy(() => import('./components/DiagramStudioView').then(m => ({ default: m.DiagramStudioView })));
const CubesPlaygroundView = React.lazy(() => import('./components/CubesPlaygroundView').then(m => ({ default: m.CubesPlaygroundView })));
const DocumentExtractorStudioView = React.lazy(() => import('./components/DocumentExtractorStudioView').then(m => ({ default: m.DocumentExtractorStudioView })));
const InteractiveSandboxView = React.lazy(() => import('./components/InteractiveSandboxView').then(m => ({ default: m.InteractiveSandboxView })));
const DsaLabView = React.lazy(() => import('./components/dsa/DsaLabView').then(m => ({ default: m.DsaLabView })));
import { ACADEMIC_PRESETS } from './components/CodeLabPresetDrawer';
import { SettingsModal } from './components/SettingsModal';
import { LoginModal } from './components/LoginModal';
import { UserProfileModal } from './components/UserProfileModal';
import { DemoLandingHub } from './components/DemoLandingHub';
import { DemoChatHistoryDrawer } from './components/DemoChatHistoryDrawer';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { printSessionToPdf } from './services/printPdfService';
import { pruneOldRenderCache } from './services/renderCacheService';
import { Home, Layout, Key, Moon, Sun, User, Menu, RotateCw } from 'lucide-react';
import { sendChatMessage, getApiUrl } from './services/apiService';
import { fetchCloudCodeLabPresetSessions, syncCodeLabPresetSessions } from './services/codelabSyncService';

const DEFAULT_KEYS: UserKeys = {
  ollama: '',
  openrouter: '',
  gemini: '',
  groq: '',
  mistral: '',
  nvidia: '',
  cerebras: '',
  sambanova: '',
  nararouter: '',
  huggingface: '',
  pollinations: '',
  opencode: '',
  poolside: '',
  local_endpoint: ''
};

const safeDecode = (b64Str: string): string => {
  try {
    return atob(b64Str);
  } catch (e) {
    return b64Str;
  }
};

const ADMIN_BUNDLED_SYSTEM_KEYS: UserKeys = {
  gemini: safeDecode("QVEuQWI4Uk42S2NRRFhsMXFycDRDdWdhVlJoem1GSjdrd0NaMVl6ZDdjREdKOFYxWkt3b1EsIEFRLkFiOFJONkpQcDdmMERaYkxSdklhVG5iTjU4YWdBZWJmc3gwekVWU3kwcXRRMXR4OFVnLCBBUS5BYjhSTjZKWEVxX3NwZHpYSTluLXZnQ0QzNjd1WngwS0pSeGpJRF8tMVZzRFNZSEVCQSwgQVEuQWI4Uk42TFJmZEM0VjRyQ0twWUtadE8zZmYwbFhKUVpoU3VUVnVJMGdFR28tdDJZblEsIEFRLkFiOFJONEloZUpEMmE1bm9VczI5TlMtOE9ZVFYxalZPVWVVNDVxV0w4TzZpY3VZOGx3LCBBSXphU3lBVEpnb21pdXdnYm9lNWttcGVWWVNJWmhhY0ptdUROT1EsIEFRLkFiOFJONElDeDQwOWZXZXdHX1duN3l3ZkpKMUNfRnJ4MHNkX2tNUjZERld2Y2s5LUVRLCBBUS5BYjhSTjZKRjJNSEFZZDVuSmE3QjQtd0VycnkyZDQycXkwOXZudFN5VlVQSFdYT2pGUQ=="),
  openrouter: safeDecode("c2stb3ItdjEtOWRhNjBjMjI4MmQ1NDA2NTk5ZDZjYWU0MmM3OWVlNDBlMTdlOGFhOTIyMTI2ZWFiM2M4Y2I1MDMyMDYxYzlhNCwgc2stb3ItdjEtYTJjMTE1OGZjYWRmZTlhNjE2NjVhYWVlYzlkODE4NzYxZmEzNDFlZDg0ZTI3MTE2ZmJkNmYwZWNhODg5MTBmMCwgc2stb3ItdjEtY2FiMTQ1MTAxOWIyZjZiYTY3MGRjODk4YmIxZjJkMjFkYjNkNjZiMzNmZDgzNjk1OTMyNWFjNWZjZjdjZGYzLCBzay1vci12MS1jZTRiNDliNmZlOWYwMjE1OTVjZjgyMGI1YTk0ZWU0ZTdkMmI0NDM1OTU0YTVlMjBiNGU5Njc2Nzc0ZWEsIHNrLW9yLXYxLTdiZTg4YzRhODc1MGZjOWQ0NDkxZTQyOTlhODY0MmNiMmEzMzYxNjIzOTJhYjc3ZjM4NTljMDMzOTA2YTYwMTc="),
  opencode: safeDecode("c2stanN3U2xuTDc4Y1g3VTExaHBZbndBZXhRd3F0RnB3SjcxeU5ZMmpJRlpOSWVOZDJGQUl6QUdEVXBibUNIbVREQ=="),
  poolside: safeDecode("c2t5X2N0bll1TEw4Lms2dUlKT1ZCcXpaNHNWb0pxcWJaUktzdDZLbDA0MFBi"),
  nvidia: safeDecode("bnZhcGktdjA2eWlVYWRYbEJzRFRJYXFSNmxsdEJacXdDWF9MeEpHeFJoeXF0Rk92TTdTMlhkMXBYWEdpb2p3eFB0Mm93RiwgbnZhcGktbXU2ZlVIWVFHQ1BwMF9KRTB0ME5uQWVsUTBBTG1oaDQtU1ZvWk1fMkFHY1lsNlBHTDI1VFo5MnZOSDJUdWdISA=="),
  groq: safeDecode("Z3NrX1g3TGhCZ0Vib3ByMjFIZG5rYXgzV0dkeWIzRllSN3pyMjBSY2NFNDU1S2s4WGI2ZUw3bUMsIGdza181Y0k2Ujc2d1hndVNrN1lUekVzR1dHZHliM0ZZZjdyS3ZTdFFYTENKYlVabTJWb2x4V1Fy"),
  mistral: safeDecode("OFc2YVNDWGI2UVBmdmpyTFhLNUtHUnVqS0pZQVo0WWM="),
  cerebras: safeDecode("Y3NrLWU0M2UyZmt3Zm1taDRyZjM4dDV0bTUzZmM2eTR5ZXQ4dm53a3hmOTJmeXZocmR5cg=="),
  sambanova: safeDecode("YzcyZDI0ZGUtZDQ0ZC00NWJiLWEzODktMmUxMzMwYmUyN2Iw"),
  nararouter: safeDecode("c2stbnJ5LUcxcXUtbThYQzRJWXpBWEZYa0Q1QnVkbERRcWdqNnBvNUkyUjkxLUFWMA=="),
  huggingface: safeDecode("aGZfRnB6em1WbE5nQ09EQ3ZDcmR1bXZjZm1Ua2RhZkJBV0pTZSwgaGZfU2NXcHFzbVlIaEJJUmVNQnpYWVZjcm1Mcm5wd1ZNT0pnYQ=="),
  pollinations: safeDecode("c2tfU1hTb1M4R0Fza3B3VTBTQ29XU003QXFtSndDY1FVWVg="),
  ollama: safeDecode("YmRiOGYxZWY2ODE5NDg1N2IwNzUxMWYzMjhmYWJjNzQudlJjWjRoTGU4M0RMU2Ixa3lFY3N4aGUsIDY2NjFiYzliN2U2YTQwMDVhNjZiOWZhZmM3OTVlYTU0LnB6SjlJR1hFUk5Pdlh5bHlITU5valp1cCwgNDc3MTk3NjQwODIyNDkxMDliM2YxMWZkNDMyNjM1YjYuNHNRZTVyLVUtTHI1SkpNd2NSdWxCdlM="),
  local_endpoint: ''
};

const sanitizeSystemPrompt = (prompt?: string): string | undefined => {
  if (!prompt || typeof prompt !== 'string') return undefined;
  const lines = prompt.split('\n');
  const filtered = lines.filter(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('3) KROKI DIAGRAM ENGINE') || trimmed.startsWith('3) DIAGRAM & GRAPH CAPABILITIES') || trimmed.startsWith('2. KROKI DIAGRAM ENGINE')) return false;
    if (trimmed.includes('```kroki-') || trimmed.includes('```functionplot') || trimmed.includes('```mermaid')) return false;
    if (/kroki diagram|mermaid diagram|kroki-mermaid|kroki-plantuml/i.test(trimmed)) return false;
    return true;
  });
  const res = filtered.join('\n').trim();
  return res || undefined;
};

export const App: React.FC = () => {
  const [isCloudSessionsLoaded, setIsCloudSessionsLoaded] = useState<boolean>(false);

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const activeUser = localStorage.getItem('chatterbot_username');
    if (activeUser) {
      const saved = localStorage.getItem(`chatterbot_sessions_${activeUser}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error('Failed to parse sessions from localStorage', e);
        }
      }
    }
    return [
      {
        id: `session-${Date.now()}`,
        title: 'New Chat Session',
        provider: 'OpenRouter',
        model: 'openrouter/free',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];
  });

  const [activeSessionIdState, setActiveSessionIdState] = useState<string>(() => {
    return sessions[0]?.id || 'default-session-1';
  });

  // 🎭 Isolated Persona Sessions State (Zero Bleed into Main Chat History)
  const [personaSessions, setPersonaSessions] = useState<ChatSession[]>(() => {
    const activeUser = localStorage.getItem('chatterbot_username');
    if (activeUser) {
      const saved = localStorage.getItem(`chatterbot_persona_sessions_${activeUser}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error('Failed to parse persona sessions', e);
        }
      }
    }
    return [
      {
        id: `persona-session-${Date.now()}`,
        title: 'Fun Persona Chat',
        provider: 'OpenRouter',
        model: 'openrouter/free',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];
  });

  const [activePersonaSessionIdState, setActivePersonaSessionIdState] = useState<string>(() => {
    return personaSessions[0]?.id || 'default-persona-session-1';
  });

  const [isDemoChatDrawerOpen, setIsDemoChatDrawerOpen] = useState<boolean>(false);
  const [isPersonaDrawerOpen, setIsPersonaDrawerOpen] = useState<boolean>(false);
  const [isCodeLabDrawerOpen, setIsCodeLabDrawerOpen] = useState<boolean>(false);
  const [isLectureDrawerOpen, setIsLectureDrawerOpen] = useState<boolean>(false);
  const [isDemoPdfPreviewOpen, setIsDemoPdfPreviewOpen] = useState<boolean>(false);
  const [isPersistentWebSearch, setIsPersistentWebSearch] = useState<boolean>(() => {
    return localStorage.getItem('chatterbot_persistent_websearch') === 'true';
  });

  const handleTogglePersistentWebSearch = () => {
    setIsPersistentWebSearch(prev => {
      const next = !prev;
      localStorage.setItem('chatterbot_persistent_websearch', String(next));
      return next;
    });
  };

  const [isDiagramsEnabled, setIsDiagramsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('chatterbot_diagrams_enabled') === 'true';
  });

  const handleToggleDiagrams = () => {
    setIsDiagramsEnabled(prev => {
      const next = !prev;
      localStorage.setItem('chatterbot_diagrams_enabled', String(next));
      return next;
    });
  };

  const [isBeginnerFriendly, setIsBeginnerFriendly] = useState<boolean>(() => {
    return localStorage.getItem('chatterbot_beginner_friendly') === 'true';
  });

  const handleToggleBeginnerFriendly = () => {
    setIsBeginnerFriendly(prev => {
      const next = !prev;
      localStorage.setItem('chatterbot_beginner_friendly', String(next));
      return next;
    });
  };

  const handleClearActiveSession = () => {
    if (!activeSession) return;
    setSessions(prev => prev.map(s => {
      if (s.id === activeSession.id) {
        return { ...s, messages: [], updatedAt: Date.now() };
      }
      return s;
    }));
  };

  const handleNativePrintPdf = () => {
    if (!activeSession || activeSession.messages.length === 0) return;
    printSessionToPdf(activeSession.messages, activeSession.title || 'Prof. Joe AI Chat Session');
  };

  const activePersonaSession = personaSessions.find(s => s.id === activePersonaSessionIdState) || personaSessions[0];

  const handleNewPersonaSession = () => {
    const newSession: ChatSession = {
      id: `persona-session-${Date.now()}`,
      title: 'New Persona Chat',
      provider: selectedProvider,
      model: selectedModel,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const updated = [newSession, ...personaSessions];
    setPersonaSessions(updated);
    setActivePersonaSessionIdState(newSession.id);
    if (currentUser) {
      localStorage.setItem(`chatterbot_persona_sessions_${currentUser}`, JSON.stringify(updated));
    }
  };

  const handleDeletePersonaSession = (id: string) => {
    const filtered = personaSessions.filter(s => s.id !== id);
    const final = filtered.length > 0 ? filtered : [{
      id: `persona-session-${Date.now()}`,
      title: 'Fun Persona Chat',
      provider: selectedProvider,
      model: selectedModel,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }];
    setPersonaSessions(final);
    setActivePersonaSessionIdState(final[0].id);
    if (currentUser) {
      localStorage.setItem(`chatterbot_persona_sessions_${currentUser}`, JSON.stringify(final));
    }
  };

  // Perform hard legacy key cache wipe on app startup
  useEffect(() => {
    localStorage.removeItem('chatterbot_user_keys');
    localStorage.removeItem('chatterbot_keys');
  }, []);

  // Android: Push WebView below the native status bar so header buttons are accessible
  useEffect(() => {
    import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#0b0f19' }).catch(() => {});
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    }).catch(() => {});
  }, []);

  const IS_ADMIN_BUILD = import.meta.env.MODE === 'admin' || import.meta.env.VITE_ENABLE_ADMIN_KEYS === 'true';

  const [userKeys, setUserKeys] = useState<UserKeys>(() => {
    const activeUser = localStorage.getItem('chatterbot_username');
    const isAuthorizedAdmin = (activeUser === 'Admin@uday' || activeUser === 'Uday@joe') && IS_ADMIN_BUILD;
    const baseFallback = isAuthorizedAdmin ? ADMIN_BUNDLED_SYSTEM_KEYS : DEFAULT_KEYS;

    if (activeUser) {
      const savedKeys = localStorage.getItem(`chatterbot_user_keys_${activeUser}`);
      if (savedKeys) {
        try {
          return { ...baseFallback, ...JSON.parse(savedKeys) };
        } catch (e) {
          console.error('Failed to parse userKeys', e);
        }
      }
    }
    return baseFallback;
  });

  const [customModels, setCustomModels] = useState<UserCustomModels>(() => {
    const activeUser = localStorage.getItem('chatterbot_username') || 'guest';
    const savedModels = localStorage.getItem(`chatterbot_user_models_${activeUser}`) || localStorage.getItem('chatterbot_user_models_global');
    if (savedModels) {
      try {
        return JSON.parse(savedModels);
      } catch (e) {
        console.error('Failed to parse custom models', e);
      }
    }
    return {};
  });

  const handleSaveCustomModels = (newCustomModels: UserCustomModels) => {
    setCustomModels(newCustomModels);
    const userKey = currentUser || localStorage.getItem('chatterbot_username') || 'guest';
    localStorage.setItem(`chatterbot_user_models_${userKey}`, JSON.stringify(newCustomModels));
    localStorage.setItem('chatterbot_user_models_global', JSON.stringify(newCustomModels));
  };

  const DEFAULT_FREE_PROVIDER = 'OpenRouter';
  const DEFAULT_FREE_MODEL = 'openrouter/free';

  const [activeView, setActiveViewState] = useState<ActiveViewType>(() => {
    const saved = localStorage.getItem('chatterbot_active_view');
    return (saved && ['chat', 'exam_prep', 'system_prompts', 'prompts', 'diagram_studio', 'cubes', 'fun_personas', 'text_extractor', 'code_lab'].includes(saved))
      ? (saved as ActiveViewType)
      : 'chat';
  });

  const setActiveView = (view: ActiveViewType) => {
    setActiveViewState(view);
    localStorage.setItem('chatterbot_active_view', view);
  };

  const [currentUser, setCurrentUser] = useState<string>(() => localStorage.getItem('chatterbot_username') || '');
  const [userRole, setUserRole] = useState<string>(() => localStorage.getItem('chatterbot_role') || 'student');
  const [authToken, setAuthToken] = useState<string>(() => localStorage.getItem('chatterbot_token') || '');
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(() => !localStorage.getItem('chatterbot_token'));
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [selectedProvider, setSelectedProvider] = useState<string>(() => {
    const activeUser = localStorage.getItem('chatterbot_username') || 'guest';
    const saved = localStorage.getItem(`chatterbot_provider_${activeUser}`) || localStorage.getItem('chatterbot_provider_global');
    if (saved) return saved;
    return DEFAULT_FREE_PROVIDER;
  });

  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const activeUser = localStorage.getItem('chatterbot_username') || 'guest';
    const saved = localStorage.getItem(`chatterbot_model_${activeUser}`) || localStorage.getItem('chatterbot_model_global');
    if (saved) return saved;
    return DEFAULT_FREE_MODEL;
  });

  // Dedicated Preset-Segregated Multi-Sessions for Practical Code Lab Workspace
  const [activeCodeLabPresetId, setActiveCodeLabPresetId] = useState<string>('stat_inference_lab');
  const [activeCodeLabSessionIds, setActiveCodeLabSessionIds] = useState<Record<string, string>>({});
  
  const [codeLabPresetSessions, setCodeLabPresetSessions] = useState<Record<string, ChatSession[]>>(() => {
    const activeUser = localStorage.getItem('chatterbot_username') || 'guest';
    const saved = localStorage.getItem(`chatterbot_codelab_preset_sessions_v2_${activeUser}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse local codeLabPresetSessions', e);
      }
    }
    return {};
  });

  // Cloud Hydration from MongoDB & 14-day LRU Cache Pruning on mount
  useEffect(() => {
    pruneOldRenderCache(14);
    const activeUser = localStorage.getItem('chatterbot_username');
    const token = localStorage.getItem('chatterbot_token') || undefined;
    if (activeUser) {
      fetchCloudCodeLabPresetSessions(activeUser, token).then(cloudPresetSessions => {
        if (cloudPresetSessions && Object.keys(cloudPresetSessions).length > 0) {
          setCodeLabPresetSessions(prev => ({
            ...cloudPresetSessions,
            ...prev
          }));
        }
      });
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(
      `chatterbot_codelab_preset_sessions_v2_${currentUser || 'guest'}`, 
      JSON.stringify(codeLabPresetSessions)
    );
  }, [codeLabPresetSessions, currentUser]);

  // Derive active session for current preset
  const presetSessionsList = codeLabPresetSessions[activeCodeLabPresetId] || [];
  const currentActiveSessionId = activeCodeLabSessionIds[activeCodeLabPresetId] || (presetSessionsList[0]?.id || '');

  const activeCodeLabSession = presetSessionsList.find(s => s.id === currentActiveSessionId) || presetSessionsList[0] || {
    id: `codelab-session-${activeCodeLabPresetId}-${Date.now()}`,
    title: `Code Lab Session`,
    provider: selectedProvider,
    model: selectedModel,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    presetId: activeCodeLabPresetId
  };

  const handleSelectCodeLabPresetId = (newPresetId: string) => {
    setActiveCodeLabPresetId(newPresetId);
    const existingList = codeLabPresetSessions[newPresetId] || [];
    if (existingList.length === 0) {
      const initialSession: ChatSession = {
        id: `codelab-session-${newPresetId}-${Date.now()}`,
        title: `${ACADEMIC_PRESETS.find(p => p.id === newPresetId)?.name || 'Code Lab'} Session`,
        provider: selectedProvider,
        model: selectedModel,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        presetId: newPresetId
      };
      setCodeLabPresetSessions(prev => {
        const next = { ...prev, [newPresetId]: [initialSession] };
        syncCodeLabPresetSessions(currentUser || 'guest', newPresetId, initialSession, next);
        return next;
      });
      setActiveCodeLabSessionIds(prev => ({ ...prev, [newPresetId]: initialSession.id }));
    } else if (!activeCodeLabSessionIds[newPresetId]) {
      setActiveCodeLabSessionIds(prev => ({ ...prev, [newPresetId]: existingList[0].id }));
    }
  };

  const handleNewCodeLabSession = (presetId: string) => {
    const newSession: ChatSession = {
      id: `codelab-session-${presetId}-${Date.now()}`,
      title: `${ACADEMIC_PRESETS.find(p => p.id === presetId)?.name || 'Code Lab'} Session`,
      provider: selectedProvider,
      model: selectedModel,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      presetId: presetId
    };

    setCodeLabPresetSessions(prev => {
      const list = prev[presetId] || [];
      const updatedList = [newSession, ...list];
      const next = { ...prev, [presetId]: updatedList };
      syncCodeLabPresetSessions(currentUser || 'guest', presetId, newSession, next);
      return next;
    });

    setActiveCodeLabSessionIds(prev => ({ ...prev, [presetId]: newSession.id }));
  };

  const handleDeleteCodeLabSession = (presetId: string, sessionId: string) => {
    setCodeLabPresetSessions(prev => {
      const list = prev[presetId] || [];
      const updatedList = list.filter(s => s.id !== sessionId);
      const next = { ...prev, [presetId]: updatedList };
      if (updatedList.length > 0) {
        syncCodeLabPresetSessions(currentUser || 'guest', presetId, updatedList[0], next);
      }
      return next;
    });

    setActiveCodeLabSessionIds(prev => {
      const list = codeLabPresetSessions[presetId] || [];
      const remaining = list.filter(s => s.id !== sessionId);
      return { ...prev, [presetId]: remaining[0]?.id || '' };
    });
  };

  const handleResetCodeLabPresetSession = (presetId: string) => {
    handleNewCodeLabSession(presetId);
  };

  const [selectedPersona, setSelectedPersona] = useState<string>(() => {
    const activeUser = localStorage.getItem('chatterbot_username');
    if (activeUser) {
      const saved = localStorage.getItem(`chatterbot_persona_${activeUser}`);
      if (saved) return saved;
    }
    return 'default';
  });

  const [promptMode, setPromptModeState] = useState<any>(() => {
    const activeUser = localStorage.getItem('chatterbot_username');
    if (activeUser) {
      const saved = localStorage.getItem(`chatterbot_prompt_mode_${activeUser}`);
      if (saved && ['auto', '12marks', '2marks', '1marks', 'general'].includes(saved)) {
        return saved;
      }
    }
    return 'auto';
  });

  const handlePromptModeChange = (newMode: string) => {
    setPromptModeState(newMode);
    if (currentUser) {
      localStorage.setItem(`chatterbot_prompt_mode_${currentUser}`, newMode);
    }
  };

  const [isPersonaEnabled, setIsPersonaEnabled] = useState<boolean>(true);

  const handleTogglePersonaEnabled = () => {
    setIsPersonaEnabled(prev => !prev);
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [appLayoutMode, setAppLayoutModeState] = useState<'standard' | 'hub-demo'>(() => {
    const saved = localStorage.getItem('chatterbot_app_layout_mode');
    return (saved === 'standard' || saved === 'hub-demo') ? saved : 'hub-demo';
  });

  const setAppLayoutMode = (mode: 'standard' | 'hub-demo') => {
    setAppLayoutModeState(mode);
    localStorage.setItem('chatterbot_app_layout_mode', mode);
  };

  const [activeHubWorkspace, setActiveHubWorkspaceState] = useState<'landing' | ActiveViewType>(() => {
    const saved = localStorage.getItem('chatterbot_active_hub_workspace');
    return (saved && ['landing', 'chat', 'prompts', 'examprep', 'system_prompts', 'diagrams', 'cubes', 'fun_personas', 'extractor_studio', 'code_lab', 'lecture_notes'].includes(saved))
      ? (saved as 'landing' | ActiveViewType)
      : 'landing';
  });

  const setActiveHubWorkspace = (ws: 'landing' | ActiveViewType) => {
    setActiveHubWorkspaceState(ws);
    localStorage.setItem('chatterbot_active_hub_workspace', ws);
  };

  // Android Native Hardware Back Button Listener (Navigates back to main view instead of closing app)
  useEffect(() => {
    let sub: any = null;
    import('@capacitor/app').then(({ App: CapApp }) => {
      CapApp.addListener('backButton', () => {
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          return;
        }
        if (isProfileModalOpen) {
          setIsProfileModalOpen(false);
          return;
        }
        if (appLayoutMode === 'hub-demo' && activeHubWorkspace !== 'landing') {
          setActiveHubWorkspace('landing');
          return;
        }
        if (activeView !== 'chat') {
          setActiveView('chat');
          return;
        }
        CapApp.minimizeApp();
      }).then(l => { sub = l; });
    }).catch(() => {});

    return () => {
      if (sub && sub.remove) sub.remove();
    };
  }, [activeView, appLayoutMode, activeHubWorkspace, isSettingsOpen, isProfileModalOpen]);

  const activeSession = sessions.find(s => s.id === activeSessionIdState) || sessions[0];

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    const userKey = currentUser || localStorage.getItem('chatterbot_username') || 'guest';
    localStorage.setItem(`chatterbot_provider_${userKey}`, provider);
    localStorage.setItem('chatterbot_provider_global', provider);
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSession.id ? { ...s, provider, updatedAt: Date.now() } : s
      )
    );
    if ((activeView === 'fun_personas' || activeHubWorkspace === 'fun_personas') && activePersonaSession) {
      setPersonaSessions(prev =>
        prev.map(s => s.id === activePersonaSession.id ? { ...s, provider, updatedAt: Date.now() } : s)
      );
    }
    if (activeHubWorkspace === 'code_lab' && activeCodeLabSession) {
      setCodeLabPresetSessions(prev => {
        const list = prev[activeCodeLabPresetId] || [];
        const updatedList = list.map(s => s.id === activeCodeLabSession.id ? { ...s, provider, updatedAt: Date.now() } : s);
        return { ...prev, [activeCodeLabPresetId]: updatedList };
      });
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    const userKey = currentUser || localStorage.getItem('chatterbot_username') || 'guest';
    localStorage.setItem(`chatterbot_model_${userKey}`, model);
    localStorage.setItem('chatterbot_model_global', model);
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSession.id ? { ...s, model, updatedAt: Date.now() } : s
      )
    );
    if ((activeView === 'fun_personas' || activeHubWorkspace === 'fun_personas') && activePersonaSession) {
      setPersonaSessions(prev =>
        prev.map(s => s.id === activePersonaSession.id ? { ...s, model, updatedAt: Date.now() } : s)
      );
    }
    if (activeHubWorkspace === 'code_lab' && activeCodeLabSession) {
      setCodeLabPresetSessions(prev => {
        const list = prev[activeCodeLabPresetId] || [];
        const updatedList = list.map(s => s.id === activeCodeLabSession.id ? { ...s, model, updatedAt: Date.now() } : s);
        return { ...prev, [activeCodeLabPresetId]: updatedList };
      });
    }
  };

  const handleSelectActiveModel = (providerId: string, modelId: string) => {
    handleProviderChange(providerId);
    handleModelChange(modelId);
  };

  const handlePersonaChange = (persona: string) => {
    setSelectedPersona(persona);
    if (currentUser) {
      localStorage.setItem(`chatterbot_persona_${currentUser}`, persona);
    }
  };

  const createFreshDefaultSession = (): ChatSession => ({
    id: `session-${Date.now()}`,
    title: 'New Chat Session',
    provider: selectedProvider,
    model: selectedModel,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  const mergeSessions = (local: ChatSession[], cloud: ChatSession[]): ChatSession[] => {
    const map = new Map<string, ChatSession>();
    for (const s of local) {
      if (s.id) map.set(s.id, s);
    }
    for (const s of cloud) {
      if (!s.id) continue;
      const existing = map.get(s.id);
      if (!existing || (s.updatedAt && s.updatedAt > existing.updatedAt)) {
        map.set(s.id, s);
      }
    }
    return Array.from(map.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  };

  const handleLoginSuccess = async (username: string, token: string, role: string) => {
    setIsCloudSessionsLoaded(false);
    setCurrentUser(username);
    setUserRole(role);
    setAuthToken(token);
    localStorage.setItem('chatterbot_username', username);
    localStorage.setItem('chatterbot_token', token);
    localStorage.setItem('chatterbot_role', role);
    setIsLoginOpen(false);

    // Dynamic API Key Loading: Gated strictly for Admin@uday & Uday@joe
    const isAuthorizedAdmin = username === 'Admin@uday' || username === 'Uday@joe';
    const baseFallback = isAuthorizedAdmin ? ADMIN_BUNDLED_SYSTEM_KEYS : DEFAULT_KEYS;
    const savedKeysStr = localStorage.getItem(`chatterbot_user_keys_${username}`);
    let loadedKeys = baseFallback;
    if (savedKeysStr) {
      try {
        loadedKeys = { ...baseFallback, ...JSON.parse(savedKeysStr) };
      } catch (e) {
        console.error('Failed to parse saved user keys on login', e);
      }
    }

    // Fetch user-isolated cloud API keys immediately on login for multi-device sync
    try {
      const keysRes = await fetch(getApiUrl(`/api/user-keys?username=${encodeURIComponent(username)}`));
      if (keysRes.ok) {
        const keysData = await keysRes.json();
        if (keysData.success && keysData.keys && Object.keys(keysData.keys).length > 0) {
          loadedKeys = { ...loadedKeys, ...keysData.keys };
          localStorage.setItem(`chatterbot_user_keys_${username}`, JSON.stringify(loadedKeys));
        }
      }
    } catch (kErr) {
      console.warn('Could not fetch cloud user keys on login:', kErr);
    }
    setUserKeys(loadedKeys);

    // Restore user-specific provider & model preference or default to Keyless Free AI
    const savedProv = localStorage.getItem(`chatterbot_provider_${username}`) || DEFAULT_FREE_PROVIDER;
    const savedMod = localStorage.getItem(`chatterbot_model_${username}`) || DEFAULT_FREE_MODEL;
    setSelectedProvider(savedProv);
    setSelectedModel(savedMod);

    // Restore saved local sessions for this user first
    let localSaved: ChatSession[] = [];
    const savedLocalStr = localStorage.getItem(`chatterbot_sessions_${username}`);
    if (savedLocalStr) {
      try {
        const parsed = JSON.parse(savedLocalStr);
        if (Array.isArray(parsed) && parsed.length > 0) localSaved = parsed;
      } catch (e) {
        console.error('Failed to parse saved local sessions on login', e);
      }
    }

    // Fetch user-isolated cloud sessions immediately on login
    try {
      const response = await fetch(getApiUrl(`/api/sessions?username=${encodeURIComponent(username)}&token=${encodeURIComponent(token)}`));
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.sessions) && data.sessions.length > 0) {
          const merged = localSaved.length > 0 ? mergeSessions(localSaved, data.sessions) : data.sessions;
          setSessions(merged);
          localStorage.setItem(`chatterbot_sessions_${username}`, JSON.stringify(merged));
          setActiveSessionIdState(merged[0].id);
          setIsCloudSessionsLoaded(true);
          return;
        }
      }
    } catch (err) {
      console.warn('Could not fetch cloud sessions on login:', err);
    }

    // Fallback: If cloud returned 0 sessions, use localSaved if available, otherwise fresh default
    const finalSessions = localSaved.length > 0 ? localSaved : [createFreshDefaultSession()];
    setSessions(finalSessions);
    localStorage.setItem(`chatterbot_sessions_${username}`, JSON.stringify(finalSessions));
    setActiveSessionIdState(finalSessions[0].id);
    setIsCloudSessionsLoaded(true);
  };

  const handleLogout = () => {
    setIsCloudSessionsLoaded(false);
    // Keep chatterbot_sessions_${currentUser} intact in localStorage so offline history is NEVER lost!
    setCurrentUser('');
    setAuthToken('');
    setUserKeys(DEFAULT_KEYS);
    localStorage.removeItem('chatterbot_username');
    localStorage.removeItem('chatterbot_token');
    localStorage.removeItem('chatterbot_role');
    const fresh = [createFreshDefaultSession()];
    setSessions(fresh);
    setActiveSessionIdState(fresh[0].id);
    setIsLoginOpen(true);
  };

  // Save sessions to localStorage & Cloud Storage ONLY AFTER cloud history has finished loading!
  useEffect(() => {
    if (!currentUser || !isCloudSessionsLoaded) return;

    localStorage.setItem(`chatterbot_sessions_${currentUser}`, JSON.stringify(sessions));

    if (sessions && sessions.length > 0) {
      fetch(getApiUrl('/api/sessions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, sessions })
      }).catch(err => console.warn('Could not sync sessions to cloud:', err));
    }
  }, [sessions, currentUser, isCloudSessionsLoaded]);

  // Fetch Cloud Sessions when currentUser logs in or opens app & verify active token
  useEffect(() => {
    if (!currentUser) return;

    const fetchCloudSessions = async () => {
      try {
        const queryToken = authToken ? `&token=${encodeURIComponent(authToken)}` : '';
        const response = await fetch(getApiUrl(`/api/sessions?username=${encodeURIComponent(currentUser)}${queryToken}`));
        
        if (response.status === 403) {
          const data = await response.json().catch(() => ({}));
          if (data.displaced) {
            alert('⚠️ Logged out: Your account was logged in on another device.');
            handleLogout();
            return;
          }
        }

        if (response.ok) {
          const data = await response.json();
          if (data.displaced) {
            alert('⚠️ Logged out: Your account was logged in on another device.');
            handleLogout();
            return;
          }
          if (data.success && Array.isArray(data.sessions) && data.sessions.length > 0) {
            setSessions(prev => mergeSessions(prev, data.sessions));
            localStorage.setItem(`chatterbot_sessions_${currentUser}`, JSON.stringify(data.sessions));
            if (data.sessions[0]?.id) {
              setActiveSessionIdState(prev => prev || data.sessions[0].id);
            }
          }
        }
      } catch (err) {
        console.warn('Could not sync sessions from cloud storage:', err);
      } finally {
        setIsCloudSessionsLoaded(true);
      }
    };

    fetchCloudSessions();

    // Passive app-focus & tab visibility re-validation (0 background timers, 0 battery drain)
    const handleFocusCheck = () => {
      if (document.visibilityState === 'visible') {
        fetchCloudSessions();
      }
    };

    window.addEventListener('visibilitychange', handleFocusCheck);
    window.addEventListener('focus', handleFocusCheck);

    return () => {
      window.removeEventListener('visibilitychange', handleFocusCheck);
      window.removeEventListener('focus', handleFocusCheck);
    };
  }, [currentUser, authToken]);

  // Fetch & Load Account API Keys safely when currentUser logs in or opens app
  useEffect(() => {
    if (!currentUser) {
      setUserKeys(DEFAULT_KEYS);
      return;
    }

    const isAuthorizedAdmin = currentUser === 'Admin@uday' || currentUser === 'Uday@joe';
    const baseFallback = isAuthorizedAdmin ? ADMIN_BUNDLED_SYSTEM_KEYS : DEFAULT_KEYS;

    // 1. Immediately load local storage keys for this user
    let currentLocalKeys = baseFallback;
    const savedLocal = localStorage.getItem(`chatterbot_user_keys_${currentUser}`);
    if (savedLocal) {
      try {
        currentLocalKeys = { ...baseFallback, ...JSON.parse(savedLocal) };
        setUserKeys(currentLocalKeys);
      } catch (e) {
        console.error('Failed to parse local userKeys', e);
      }
    } else {
      setUserKeys(baseFallback);
    }

    // 2. Sync with cloud MongoDB user_api_keys collection
    const fetchCloudKeys = async () => {
      try {
        const response = await fetch(getApiUrl(`/api/user-keys?username=${encodeURIComponent(currentUser)}`));
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.keys && Object.keys(data.keys).length > 0) {
            const merged = { ...currentLocalKeys, ...data.keys };
            localStorage.setItem(`chatterbot_user_keys_${currentUser}`, JSON.stringify(merged));
            setUserKeys(merged);
          }
        }
      } catch (err) {
        console.warn('Could not sync keys from cloud storage:', err);
      }
    };

    fetchCloudKeys();
  }, [currentUser]);

  const handleSaveUserKeys = async (newKeys: UserKeys) => {
    setUserKeys(newKeys);
    if (currentUser) {
      localStorage.setItem(`chatterbot_user_keys_${currentUser}`, JSON.stringify(newKeys));
      try {
        await fetch(getApiUrl('/api/user-keys'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: currentUser, keys: newKeys })
        });
      } catch (err) {
        console.error('Failed to backup keys to cloud storage:', err);
      }
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);


  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleNewSession = () => {
    const customTitle = prompt('Enter title for new chat session:', `Chat Session ${sessions.length + 1}`);
    const finalTitle = customTitle && customTitle.trim() ? customTitle.trim() : `Chat Session ${sessions.length + 1}`;

    const newSess: ChatSession = {
      id: `session-${Date.now()}`,
      title: finalTitle,
      provider: selectedProvider,
      model: selectedModel,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setSessions(prev => [newSess, ...prev]);
    setActiveSessionIdState(newSess.id);
    setActiveView('chat');
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) {
      setSessions([
        {
          id: `session-${Date.now()}`,
          title: 'New Chat Session',
          provider: selectedProvider,
          model: selectedModel,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ]);
      return;
    }

    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (activeSessionIdState === id) {
      setActiveSessionIdState(filtered[0].id);
    }
  };

  const handleClearChat = () => {
    if (!activeSession) return;
    setSessions(prev => prev.map(s => {
      if (s.id === activeSession.id) {
        return { ...s, messages: [], updatedAt: Date.now() };
      }
      return s;
    }));
  };

  const handleSendMessage = async (
    prompt: string,
    webSearch: boolean,
    modeOrPersona: 'auto' | '12marks' | '2marks' | 'general' | 'none' | string = 'auto',
    personaArg?: string
  ) => {
    const isCodeLabWorkspace = activeHubWorkspace === 'code_lab';
    const isPersonaWorkspace = activeView === 'fun_personas' || activeHubWorkspace === 'fun_personas';
    const currentSess = isCodeLabWorkspace
      ? activeCodeLabSession
      : (isPersonaWorkspace ? activePersonaSession : (activeSession || sessions[0]));

    if (!currentSess) return;

    let effectiveMode: 'auto' | '12marks' | '2marks' | 'general' | 'none' = 'auto';
    let effectivePersona = 'default';

    if (['auto', '12marks', '2marks', 'general', 'none'].includes(modeOrPersona)) {
      effectiveMode = modeOrPersona as any;
    }

    // Personas are active when in 'fun_personas' view AND isPersonaEnabled is true
    if (isPersonaWorkspace && isPersonaEnabled) {
      effectivePersona = personaArg || selectedPersona || 'default';
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
      personaTag: effectivePersona
    };

    const updatedMessages = [...currentSess.messages, userMsg];
    const newTitle = currentSess.messages.length === 0
      ? (prompt.slice(0, 32) + (prompt.length > 32 ? '...' : ''))
      : currentSess.title;

    const updateSessState = (msgList: Message[]) => {
      if (isCodeLabWorkspace) {
        setCodeLabPresetSessions(prev => {
          const list = prev[activeCodeLabPresetId] || [];
          let found = false;
          const updatedList = list.map(s => {
            if (s.id === activeCodeLabSession.id) {
              found = true;
              return { ...s, title: newTitle, messages: msgList, updatedAt: Date.now() };
            }
            return s;
          });
          if (!found) {
            const updatedActive = { ...activeCodeLabSession, title: newTitle, messages: msgList, updatedAt: Date.now() };
            updatedList.unshift(updatedActive);
          }
          const next = { ...prev, [activeCodeLabPresetId]: updatedList };
          const activeSess = updatedList.find(s => s.id === activeCodeLabSession.id) || updatedList[0];
          if (activeSess) {
            syncCodeLabPresetSessions(currentUser || 'guest', activeCodeLabPresetId, activeSess, next);
          }
          return next;
        });
      } else if (isPersonaWorkspace) {
        setPersonaSessions(prev => {
          const next = prev.map(s => {
            if (s.id === currentSess.id) {
              return { ...s, title: newTitle, messages: msgList, updatedAt: Date.now() };
            }
            return s;
          });
          if (currentUser) {
            localStorage.setItem(`chatterbot_persona_sessions_${currentUser}`, JSON.stringify(next));
          }
          return next;
        });
      } else {
        setSessions(prev => prev.map(s => {
          if (s.id === currentSess.id) {
            return { ...s, title: newTitle, messages: msgList, updatedAt: Date.now() };
          }
          return s;
        }));
      }
    };

    updateSessState(updatedMessages);
    setIsLoading(true);

    // Context Isolation for API payload
    const apiPayloadMessages = (!isPersonaWorkspace || effectivePersona === 'default')
      ? updatedMessages.filter(m => !m.personaTag || m.personaTag === 'default')
      : updatedMessages;

    // Injected system prompt calculation (preset system instruction for Code Lab)
    const activePresetObj = ACADEMIC_PRESETS.find(p => p.id === activeCodeLabPresetId);
    const effectiveSystemPrompt = isCodeLabWorkspace
      ? (personaArg || activePresetObj?.systemInstruction)
      : sanitizeSystemPrompt(currentSess.systemPrompt);

    try {
      const response = await sendChatMessage(
        selectedProvider,
        selectedModel,
        apiPayloadMessages,
        userKeys,
        webSearch || isPersistentWebSearch,
        effectiveMode,
        effectiveSystemPrompt,
        effectivePersona,
        isDiagramsEnabled,
        isBeginnerFriendly
      );

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        modelUsed: response.modelUsed,
        personaTag: effectivePersona,
        usage: response.usage
      };

      updateSessState([...updatedMessages, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `❌ **Failed to query model:** ${err.message || 'Unknown network error.'}`,
        timestamp: Date.now()
      };
      updateSessState([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryLastAssistantMessage = async () => {
    const isCodeLabWorkspace = activeHubWorkspace === 'code_lab';
    const isPersonaWorkspace = activeView === 'fun_personas' || activeHubWorkspace === 'fun_personas';
    const currentSess = isCodeLabWorkspace
      ? activeCodeLabSession
      : (isPersonaWorkspace ? activePersonaSession : (activeSession || sessions[0]));

    if (!currentSess || currentSess.messages.length === 0 || isLoading) return;

    let updated = [...currentSess.messages];
    if (updated[updated.length - 1].role === 'assistant') {
      updated.pop();
    }
    if (updated.length === 0) return;

    let effectivePersona = 'default';
    if (isPersonaWorkspace && isPersonaEnabled) {
      effectivePersona = selectedPersona || 'default';
    }

    const activePresetObj = ACADEMIC_PRESETS.find(p => p.id === activeCodeLabPresetId);
    const effectiveSystemPrompt = isCodeLabWorkspace
      ? activePresetObj?.systemInstruction
      : sanitizeSystemPrompt(currentSess.systemPrompt);

    const updateSessState = (msgList: Message[]) => {
      if (isCodeLabWorkspace) {
        setCodeLabPresetSessions(prev => {
          const list = prev[activeCodeLabPresetId] || [];
          let found = false;
          const updatedList = list.map(s => {
            if (s.id === activeCodeLabSession.id) {
              found = true;
              return { ...s, messages: msgList, updatedAt: Date.now() };
            }
            return s;
          });
          if (!found) {
            const updatedActive = { ...activeCodeLabSession, messages: msgList, updatedAt: Date.now() };
            updatedList.unshift(updatedActive);
          }
          const next = { ...prev, [activeCodeLabPresetId]: updatedList };
          const activeSess = updatedList.find(s => s.id === activeCodeLabSession.id) || updatedList[0];
          if (activeSess) {
            syncCodeLabPresetSessions(currentUser || 'guest', activeCodeLabPresetId, activeSess, next);
          }
          return next;
        });
      } else if (isPersonaWorkspace) {
        setPersonaSessions(prev => {
          const next = prev.map(s => {
            if (s.id === currentSess.id) {
              return { ...s, messages: msgList, updatedAt: Date.now() };
            }
            return s;
          });
          if (currentUser) {
            localStorage.setItem(`chatterbot_persona_sessions_${currentUser}`, JSON.stringify(next));
          }
          return next;
        });
      } else {
        setSessions(prev => prev.map(s => {
          if (s.id === currentSess.id) {
            return { ...s, messages: msgList, updatedAt: Date.now() };
          }
          return s;
        }));
      }
    };

    updateSessState(updated);
    setIsLoading(true);

    const apiPayloadMessages = (!isPersonaWorkspace || effectivePersona === 'default')
      ? updated.filter(m => !m.personaTag || m.personaTag === 'default')
      : updated;

    try {
      const response = await sendChatMessage(
        selectedProvider,
        selectedModel,
        apiPayloadMessages,
        userKeys,
        isPersistentWebSearch,
        promptMode,
        effectiveSystemPrompt,
        effectivePersona,
        isDiagramsEnabled,
        isBeginnerFriendly
      );

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        modelUsed: response.modelUsed,
        personaTag: effectivePersona,
        usage: response.usage
      };

      updateSessState([...updated, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `❌ **Failed to query model:** ${err.message || 'Unknown network error.'}`,
        timestamp: Date.now()
      };
      updateSessState([...updated, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLastUserMessage = async (newText: string) => {
    const isCodeLabWorkspace = activeHubWorkspace === 'code_lab';
    const isPersonaWorkspace = activeView === 'fun_personas' || activeHubWorkspace === 'fun_personas';
    const currentSess = isCodeLabWorkspace
      ? activeCodeLabSession
      : (isPersonaWorkspace ? activePersonaSession : (activeSession || sessions[0]));

    if (!currentSess || currentSess.messages.length === 0 || !newText.trim()) return;

    // Find index of the last user message
    const lastUserIdx = currentSess.messages.map(m => m.role).lastIndexOf('user');
    if (lastUserIdx < 0) return;

    let effectivePersona = 'default';
    if (isPersonaWorkspace && isPersonaEnabled) {
      effectivePersona = selectedPersona || 'default';
    }

    // Truncate messages array up to lastUserIdx (removing that user turn and any following assistant response)
    const rolledBackMessages = currentSess.messages.slice(0, lastUserIdx);

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: newText.trim(),
      timestamp: Date.now(),
      personaTag: effectivePersona
    };

    const updated = [...rolledBackMessages, userMessage];

    const activePresetObj = ACADEMIC_PRESETS.find(p => p.id === activeCodeLabPresetId);
    const effectiveSystemPrompt = isCodeLabWorkspace
      ? activePresetObj?.systemInstruction
      : sanitizeSystemPrompt(currentSess.systemPrompt);

    const updateSessState = (msgList: Message[]) => {
      if (isCodeLabWorkspace) {
        setCodeLabPresetSessions(prev => {
          const list = prev[activeCodeLabPresetId] || [];
          let found = false;
          const updatedList = list.map(s => {
            if (s.id === activeCodeLabSession.id) {
              found = true;
              return { ...s, messages: msgList, updatedAt: Date.now() };
            }
            return s;
          });
          if (!found) {
            const updatedActive = { ...activeCodeLabSession, messages: msgList, updatedAt: Date.now() };
            updatedList.unshift(updatedActive);
          }
          const next = { ...prev, [activeCodeLabPresetId]: updatedList };
          const activeSess = updatedList.find(s => s.id === activeCodeLabSession.id) || updatedList[0];
          if (activeSess) {
            syncCodeLabPresetSessions(currentUser || 'guest', activeCodeLabPresetId, activeSess, next);
          }
          return next;
        });
      } else if (isPersonaWorkspace) {
        setPersonaSessions(prev => {
          const next = prev.map(s => {
            if (s.id === currentSess.id) {
              return { ...s, messages: msgList, updatedAt: Date.now() };
            }
            return s;
          });
          if (currentUser) {
            localStorage.setItem(`chatterbot_persona_sessions_${currentUser}`, JSON.stringify(next));
          }
          return next;
        });
      } else {
        setSessions(prev => prev.map(s => {
          if (s.id === currentSess.id) {
            return { ...s, messages: msgList, updatedAt: Date.now() };
          }
          return s;
        }));
      }
    };

    updateSessState(updated);
    setIsLoading(true);

    const apiPayloadMessages = (!isPersonaWorkspace || effectivePersona === 'default')
      ? updated.filter(m => !m.personaTag || m.personaTag === 'default')
      : updated;

    try {
      const response = await sendChatMessage(
        selectedProvider,
        selectedModel,
        apiPayloadMessages,
        userKeys,
        isPersistentWebSearch,
        promptMode,
        effectiveSystemPrompt,
        effectivePersona,
        isDiagramsEnabled,
        isBeginnerFriendly
      );

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        modelUsed: response.modelUsed,
        personaTag: effectivePersona,
        usage: response.usage
      };

      updateSessState([...updated, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `❌ **Failed to query model:** ${err.message || 'Unknown network error.'}`,
        timestamp: Date.now()
      };
      updateSessState([...updated, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPromptToChat = (_promptText: string) => {
    setActiveView('chat');
  };

  const handleApplySystemPrompt = (title: string, promptText: string) => {
    const currentSess = activeSession || sessions[0];
    if (!currentSess) return;
    setSessions(prev => prev.map(s => {
      if (s.id === currentSess.id) {
        return { ...s, systemPrompt: promptText, systemPromptTitle: title, updatedAt: Date.now() };
      }
      return s;
    }));
    setActiveView('chat');
  };

  const handleClearSystemPrompt = () => {
    const currentSess = activeSession || sessions[0];
    if (!currentSess) return;
    setSessions(prev => prev.map(s => {
      if (s.id === currentSess.id) {
        return { ...s, systemPrompt: undefined, systemPromptTitle: undefined, updatedAt: Date.now() };
      }
      return s;
    }));
  };

  if (!authToken || !currentUser) {
    return (
      <LoginModal
        isOpen={true}
        preventClose={true}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Render Hub Demo Mode
  if (appLayoutMode === 'hub-demo') {
    if (activeHubWorkspace === 'landing') {
      return (
        <div className="app-container" data-theme={theme}>
          <DemoLandingHub
            onSelectWorkspace={(ws) => setActiveHubWorkspace(ws as ActiveViewType)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onSwitchToStandard={() => setAppLayoutMode('standard')}
            userRole={userRole}
          />
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            userKeys={userKeys}
            onSaveKeys={handleSaveUserKeys}
            customModels={customModels}
            onSaveCustomModels={handleSaveCustomModels}
            activeProvider={selectedProvider}
            activeModel={selectedModel}
            onSelectActiveModel={handleSelectActiveModel}
          />
          <UserProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            username={currentUser}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onClearHistory={() => setSessions([])}
            onLogout={handleLogout}
          />
          <LoginModal
            isOpen={isLoginOpen}
            preventClose={false}
            onClose={() => setIsLoginOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      );
    }

    // Full-Bleed Dedicated Workspace View inside Hub Demo
    return (
      <div className="app-container" data-theme={theme}>
        <div className="app-main-viewport" style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Top Home Navigation Breadcrumb Bar */}
          <div className="demo-workspace-header">
            <div className="demo-header-toolbar-dock">
              {/* 1. Return to Home Hub */}
              <button 
                type="button" 
                onClick={() => setActiveHubWorkspace('landing')}
                className="demo-home-breadcrumb-btn"
                title="Return to Home Hub"
              >
                <Home size={16} />
                <span>Home Hub</span>
              </button>

              {/* 2. Control Deck Drawer Button */}
              {activeHubWorkspace === 'chat' && (
                <button
                  type="button"
                  onClick={() => setIsDemoChatDrawerOpen(true)}
                  className="demo-view-toggle-btn cyan-toggle-btn"
                  title="Open Control Deck"
                >
                  <Menu size={16} />
                  <span className="demo-control-deck-text">Control Deck</span>
                </button>
              )}

              {activeHubWorkspace === 'fun_personas' && (
                <button
                  type="button"
                  onClick={() => setIsPersonaDrawerOpen(true)}
                  className="demo-view-toggle-btn rose-toggle-btn"
                  title="Open Fun Persona Deck & Character Selector"
                >
                  <Menu size={16} />
                  <span className="demo-control-deck-text">Control Deck</span>
                </button>
              )}

              {activeHubWorkspace === 'code_lab' && (
                <button
                  type="button"
                  onClick={() => setIsCodeLabDrawerOpen(true)}
                  className="demo-view-toggle-btn cyan-toggle-btn"
                  title="Open Code Lab Control Deck"
                >
                  <Menu size={16} />
                  <span className="demo-control-deck-text">Control Deck</span>
                </button>
              )}

              {activeHubWorkspace === 'lecture_notes' && (
                <button
                  type="button"
                  onClick={() => setIsLectureDrawerOpen(true)}
                  className="demo-view-toggle-btn cyan-toggle-btn"
                  title="Open Lecture Control Deck"
                >
                  <Menu size={16} />
                  <span className="demo-control-deck-text">Control Deck</span>
                </button>
              )}

              {/* 3. Refresh App */}
              <button 
                type="button" 
                onClick={() => window.location.reload()} 
                className="demo-icon-btn"
                title="Refresh App"
              >
                <RotateCw size={16} />
              </button>

              {/* 4. Settings & API Keys */}
              <button 
                type="button" 
                onClick={() => setIsSettingsOpen(true)} 
                className="demo-status-pill cyan-pill"
                title="API Settings & Keys"
              >
                <Key size={14} />
                <span>Settings</span>
              </button>

              {/* 5. Theme Toggle */}
              <button 
                type="button" 
                onClick={handleToggleTheme} 
                className="demo-icon-btn"
                title="Toggle Dark/Light Theme"
              >
                {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-purple-400" />}
              </button>

              {/* 6. User Profile */}
              <button 
                type="button" 
                onClick={() => setIsProfileModalOpen(true)} 
                className="demo-profile-avatar-btn"
                title="User Profile"
              >
                <User size={16} />
              </button>

              {/* 7. Switch to Classic View */}
              <button 
                type="button" 
                onClick={() => setAppLayoutMode('standard')}
                className="demo-view-toggle-btn"
                title="Switch to Classic View"
              >
                <Layout size={14} />
                <span className="demo-view-toggle-text">Classic View</span>
              </button>
            </div>

            <div className="demo-header-middle-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="portal-tag cyan-tag" style={{ textTransform: 'uppercase' }}>
                {activeHubWorkspace === 'code_lab'
                  ? 'CODE DUNGEON WORKSPACE 🏰'
                  : activeHubWorkspace === 'extractor_studio'
                  ? 'TEXTRACTOR WORKSPACE ⚡'
                  : `${activeHubWorkspace} Workspace`}
              </span>
            </div>
          </div>

          <main className="app-main" style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
            <React.Suspense fallback={<div className="flex items-center justify-center h-full p-8 text-cyan-400 font-semibold gap-2">⏳ Loading Studio Workspace...</div>}>
            {activeHubWorkspace === 'chat' && (
              <>
                <DemoChatHistoryDrawer
                  isOpen={isDemoChatDrawerOpen}
                  onClose={() => setIsDemoChatDrawerOpen(false)}
                  sessions={sessions}
                  activeSessionId={activeSessionIdState}
                  onSelectSession={setActiveSessionIdState}
                  onNewSession={handleNewSession}
                  onDeleteSession={handleDeleteSession}
                  isPersistentWebSearch={isPersistentWebSearch}
                  onTogglePersistentWebSearch={handleTogglePersistentWebSearch}
                  isDiagramsEnabled={isDiagramsEnabled}
                  onToggleDiagrams={handleToggleDiagrams}
                  isBeginnerFriendly={isBeginnerFriendly}
                  onToggleBeginnerFriendly={handleToggleBeginnerFriendly}
                  onOpenPdfPreview={() => setIsDemoPdfPreviewOpen(true)}
                  onNativePrintPdf={handleNativePrintPdf}
                  onClearActiveSession={handleClearActiveSession}
                  activeProviderName={selectedProvider}
                  activeModelName={selectedModel}
                />
                <ChatWindow
                  messages={activeSession ? activeSession.messages : []}
                  isLoading={isLoading}
                  onSendMessage={handleSendMessage}
                  selectedProvider={selectedProvider}
                  selectedModel={selectedModel}
                  onProviderChange={handleProviderChange}
                  onModelChange={handleModelChange}
                  onRetry={handleRetryLastAssistantMessage}
                  onEditUserMessage={handleEditLastUserMessage}
                  activeSystemPromptTitle={activeSession?.systemPromptTitle}
                  onClearSystemPrompt={handleClearSystemPrompt}
                  customModels={customModels}
                  promptMode={promptMode}
                  onPromptModeChange={handlePromptModeChange}
                  isDemoView={true}
                  onOpenCommandDeck={() => setIsDemoChatDrawerOpen(true)}
                />

                {isDemoPdfPreviewOpen && activeSession && (
                  <PdfPreviewModal
                    isOpen={isDemoPdfPreviewOpen}
                    onClose={() => setIsDemoPdfPreviewOpen(false)}
                    content={activeSession.messages.map(m => `### ${m.role === 'user' ? '👤 User' : `🎓 Prof. Joe (${m.modelUsed || selectedModel})`}\n${m.content}`).join('\n\n---\n\n')}
                    modelUsed={selectedModel}
                    docTitle={`ProfJoe_Chat_${activeSession.title ? activeSession.title.replace(/[^a-zA-Z0-9]/g, '_') : 'Session'}_${new Date().toISOString().split('T')[0]}`}
                    renderedHtml={activeSession.messages.map(m => `<div class="msg-block"><h4>${m.role === 'user' ? '👤 User' : `🎓 Prof. Joe (${m.modelUsed || selectedModel})`}</h4><p>${m.content}</p></div>`).join('<hr/>')}
                  />
                )}
              </>
            )}

            {activeHubWorkspace === 'examprep' && (
              <ExamPrepView onLoadQuestionToChat={(prompt) => {
                setActiveHubWorkspace('chat');
                handleLoadPromptToChat(prompt);
              }} />
            )}

            {activeHubWorkspace === 'system_prompts' && (
              <SystemPromptLibraryView
                onUsePrompt={(prompt) => {
                  setActiveHubWorkspace('chat');
                  handleLoadPromptToChat(prompt);
                }}
                onApplyPrompt={handleApplySystemPrompt}
              />
            )}

            {activeHubWorkspace === 'prompts' && (
              <PromptLibraryView onUsePrompt={(prompt) => {
                setActiveHubWorkspace('chat');
                handleLoadPromptToChat(prompt);
              }} />
            )}

            {activeHubWorkspace === 'diagrams' && (
              <DiagramStudioView userKeys={userKeys} />
            )}

            {activeHubWorkspace === 'cubes' && (
              <CubesPlaygroundView />
            )}

            {activeHubWorkspace === 'sandbox' && (
              <InteractiveSandboxView />
            )}

            {activeHubWorkspace === 'dsa_lab' && (
              <DsaLabView />
            )}

            {activeHubWorkspace === 'lecture_notes' && (
              <LectureNotesStudioView
                userKeys={userKeys}
                customModels={customModels}
                currentUser={currentUser}
                isDemoView={true}
                isExternalDrawerOpen={isLectureDrawerOpen}
                onCloseExternalDrawer={() => setIsLectureDrawerOpen(false)}
              />
            )}

            {activeHubWorkspace === 'fun_personas' && (
              <FunPersonaChatView
                messages={activePersonaSession ? activePersonaSession.messages : []}
                isLoading={isLoading}
                onSendMessage={(prompt, webSearch, mode, persona) => {
                  handleSendMessage(prompt, webSearch, mode, persona);
                }}
                selectedProvider={selectedProvider}
                selectedModel={selectedModel}
                selectedPersona={selectedPersona}
                isPersonaEnabled={isPersonaEnabled}
                onTogglePersonaEnabled={handleTogglePersonaEnabled}
                onProviderChange={handleProviderChange}
                onModelChange={handleModelChange}
                onPersonaChange={handlePersonaChange}
                onRetry={handleRetryLastAssistantMessage}
                onEditUserMessage={handleEditLastUserMessage}
                personaSessions={personaSessions}
                activePersonaSessionId={activePersonaSessionIdState}
                onSelectPersonaSession={setActivePersonaSessionIdState}
                onNewPersonaSession={handleNewPersonaSession}
                onDeletePersonaSession={handleDeletePersonaSession}
                isDemoView={true}
                isExternalDrawerOpen={isPersonaDrawerOpen}
                onCloseExternalDrawer={() => setIsPersonaDrawerOpen(false)}
              />
            )}
            {activeHubWorkspace === 'extractor_studio' && (
              <DocumentExtractorStudioView
                onBackToHub={() => setActiveHubWorkspace('chat')}
                onSendToChat={() => {
                  setActiveHubWorkspace('chat');
                }}
              />
            )}
            {activeHubWorkspace === 'code_lab' && (
              <PracticalCodeLabView
                onBackToHub={() => setActiveHubWorkspace('chat')}
                onSendMessage={(prompt, webSearch, mode) => {
                  handleSendMessage(prompt, webSearch, mode);
                }}
                onRetry={handleRetryLastAssistantMessage}
                onEditUserMessage={handleEditLastUserMessage}
                isLoading={isLoading}
                messages={activeCodeLabSession ? activeCodeLabSession.messages : []}
                selectedProvider={selectedProvider}
                selectedModel={selectedModel}
                onProviderChange={handleProviderChange}
                onModelChange={handleModelChange}
                customModels={customModels}
                activePresetId={activeCodeLabPresetId}
                onSelectPresetId={handleSelectCodeLabPresetId}
                onResetPresetChat={handleResetCodeLabPresetSession}
                presetSessions={presetSessionsList}
                activeSessionId={activeCodeLabSession.id}
                onSelectSession={(sessionId) => {
                  setActiveCodeLabSessionIds(prev => ({
                    ...prev,
                    [activeCodeLabPresetId]: sessionId
                  }));
                }}
                onNewSession={() => handleNewCodeLabSession(activeCodeLabPresetId)}
                onDeleteSession={(sessionId) => handleDeleteCodeLabSession(activeCodeLabPresetId, sessionId)}
                isExternalDrawerOpen={isCodeLabDrawerOpen}
                onCloseExternalDrawer={() => setIsCodeLabDrawerOpen(false)}
              />
            )}
            </React.Suspense>
          </main>
        </div>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          userKeys={userKeys}
          onSaveKeys={handleSaveUserKeys}
          customModels={customModels}
          onSaveCustomModels={handleSaveCustomModels}
          activeProvider={selectedProvider}
          activeModel={selectedModel}
          onSelectActiveModel={handleSelectActiveModel}
        />
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          username={currentUser}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onClearHistory={() => setSessions([])}
          onLogout={handleLogout}
        />
        <LoginModal
          isOpen={isLoginOpen}
          preventClose={false}
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // Render Standard Classic View
  return (
    <div className="app-container" data-theme={theme}>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onViewChange={setActiveView}
        sessions={activeView === 'fun_personas' ? personaSessions : sessions}
        activeSessionId={activeView === 'fun_personas' ? activePersonaSessionIdState : (activeSession ? activeSession.id : activeSessionIdState)}
        onSelectSession={activeView === 'fun_personas' ? setActivePersonaSessionIdState : setActiveSessionIdState}
        onNewSession={activeView === 'fun_personas' ? handleNewPersonaSession : handleNewSession}
        onDeleteSession={activeView === 'fun_personas' ? handleDeletePersonaSession : handleDeleteSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currentUser={currentUser}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onClearChat={handleClearChat}
      />

      <div className="app-main-viewport">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onClearChat={handleClearChat}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          activeView={activeView}
          onViewChange={setActiveView}
          username={currentUser}
          userRole={userRole}
          onLogout={handleLogout}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          appLayoutMode={appLayoutMode}
          onToggleAppLayoutMode={() => setAppLayoutMode('hub-demo')}
        />

        <main className="app-main">
          <React.Suspense fallback={<div className="flex items-center justify-center h-full p-8 text-cyan-400 font-semibold gap-2">⏳ Loading Studio Workspace...</div>}>
            {activeView === 'chat' && (
              <ChatWindow
                messages={activeSession ? activeSession.messages : []}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                selectedProvider={selectedProvider}
                selectedModel={selectedModel}
                onProviderChange={handleProviderChange}
                onModelChange={handleModelChange}
                onRetry={handleRetryLastAssistantMessage}
                onEditUserMessage={handleEditLastUserMessage}
                activeSystemPromptTitle={activeSession?.systemPromptTitle}
                onClearSystemPrompt={handleClearSystemPrompt}
                customModels={customModels}
                promptMode={promptMode}
                onPromptModeChange={handlePromptModeChange}
              />
            )}

            {activeView === 'lecture_notes' && (
              <LectureNotesStudioView
                userKeys={userKeys}
                customModels={customModels}
                currentUser={currentUser}
                isDemoView={false}
              />
            )}

            {activeView === 'examprep' && (
              <ExamPrepView onLoadQuestionToChat={handleLoadPromptToChat} />
            )}

            {activeView === 'system_prompts' && (
              <SystemPromptLibraryView
                onUsePrompt={handleLoadPromptToChat}
                onApplyPrompt={handleApplySystemPrompt}
              />
            )}

            {activeView === 'prompts' && (
              <PromptLibraryView onUsePrompt={handleLoadPromptToChat} />
            )}

            {activeView === 'diagrams' && (
              <DiagramStudioView userKeys={userKeys} />
            )}

            {activeView === 'cubes' && (
              <CubesPlaygroundView />
            )}

            {activeView === 'sandbox' && (
              <InteractiveSandboxView />
            )}

            {activeView === 'dsa_lab' && (
              <DsaLabView />
            )}

            {activeView === 'fun_personas' && (
              <FunPersonaChatView
                messages={activePersonaSession ? activePersonaSession.messages : []}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                selectedProvider={selectedProvider}
                selectedModel={selectedModel}
                selectedPersona={selectedPersona}
                isPersonaEnabled={isPersonaEnabled}
                onTogglePersonaEnabled={handleTogglePersonaEnabled}
                onProviderChange={handleProviderChange}
                onModelChange={handleModelChange}
                onPersonaChange={handlePersonaChange}
                onRetry={handleRetryLastAssistantMessage}
                onEditUserMessage={handleEditLastUserMessage}
                personaSessions={personaSessions}
                activePersonaSessionId={activePersonaSessionIdState}
                onSelectPersonaSession={setActivePersonaSessionIdState}
                onNewPersonaSession={handleNewPersonaSession}
                onDeletePersonaSession={handleDeletePersonaSession}
                customModels={customModels}
                isDemoView={false}
              />
            )}
          </React.Suspense>
        </main>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userKeys={userKeys}
        onSaveKeys={handleSaveUserKeys}
        customModels={customModels}
        onSaveCustomModels={handleSaveCustomModels}
        activeProvider={selectedProvider}
        activeModel={selectedModel}
        onSelectActiveModel={handleSelectActiveModel}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        username={currentUser}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onClearHistory={() => setSessions([])}
        onLogout={handleLogout}
      />

      <LoginModal
        isOpen={isLoginOpen}
        preventClose={false}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default App;
