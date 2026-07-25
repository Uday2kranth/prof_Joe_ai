import React, { useState, useEffect } from 'react';
import type { ChatSession, Message, UserKeys } from './types';
import { Sidebar, type ActiveViewType } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { ExamPrepView } from './components/ExamPrepView';
import { SystemPromptLibraryView } from './components/SystemPromptLibraryView';
import { PromptLibraryView } from './components/PromptLibraryView';
import { DiagramStudioView } from './components/DiagramStudioView';
import { SettingsModal } from './components/SettingsModal';
import { LoginModal } from './components/LoginModal';
import { sendChatMessage } from './services/apiService';

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
  local_endpoint: ''
};

export const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('chatterbot_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse sessions from localStorage', e);
      }
    }
    return [
      {
        id: 'default-session-1',
        title: 'New Chat Session',
        provider: 'OpenRouter',
        model: 'google/gemini-2.0-flash-lite-001',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];
  });

  const [activeSessionIdState, setActiveSessionIdState] = useState<string>(() => {
    return sessions[0]?.id || 'default-session-1';
  });

  const [userKeys, setUserKeys] = useState<UserKeys>(() => {
    const savedKeys = localStorage.getItem('chatterbot_user_keys');
    if (savedKeys) {
      try {
        return { ...DEFAULT_KEYS, ...JSON.parse(savedKeys) };
      } catch (e) {
        console.error('Failed to parse userKeys', e);
      }
    }
    return DEFAULT_KEYS;
  });

  const [activeView, setActiveView] = useState<ActiveViewType>('chat');
  const [selectedProvider, setSelectedProvider] = useState<string>('OpenRouter');
  const [selectedModel, setSelectedModel] = useState<string>('google/gemini-2.0-flash-lite-001');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string>(() => localStorage.getItem('chatterbot_username') || '');
  const [authToken, setAuthToken] = useState<string>(() => localStorage.getItem('chatterbot_token') || '');
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(() => !localStorage.getItem('chatterbot_token'));
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const activeSession = sessions.find(s => s.id === activeSessionIdState) || sessions[0];

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSession.id ? { ...s, provider, updatedAt: Date.now() } : s
      )
    );
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSession.id ? { ...s, model, updatedAt: Date.now() } : s
      )
    );
  };

  const handleLoginSuccess = (username: string, token: string, role: string) => {
    setCurrentUser(username);
    setAuthToken(token);
    localStorage.setItem('chatterbot_username', username);
    localStorage.setItem('chatterbot_token', token);
    localStorage.setItem('chatterbot_role', role);
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser('');
    setAuthToken('');
    localStorage.removeItem('chatterbot_username');
    localStorage.removeItem('chatterbot_token');
    localStorage.removeItem('chatterbot_role');
    setIsLoginOpen(true);
  };

  // Save sessions to localStorage & Cloud Storage
  useEffect(() => {
    localStorage.setItem('chatterbot_sessions', JSON.stringify(sessions));

    if (currentUser && sessions && sessions.length > 0) {
      fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, sessions })
      }).catch(err => console.warn('Could not sync sessions to cloud:', err));
    }
  }, [sessions, currentUser]);

  // Fetch Cloud Sessions when currentUser logs in or opens app
  useEffect(() => {
    if (!currentUser) return;

    const fetchCloudSessions = async () => {
      try {
        const response = await fetch(`/api/sessions?username=${encodeURIComponent(currentUser)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.sessions) && data.sessions.length > 0) {
            setSessions(data.sessions);
            localStorage.setItem('chatterbot_sessions', JSON.stringify(data.sessions));
            if (data.sessions[0]?.id) {
              setActiveSessionIdState(data.sessions[0].id);
            }
          }
        }
      } catch (err) {
        console.warn('Could not sync sessions from cloud storage:', err);
      }
    };

    fetchCloudSessions();
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('chatterbot_user_keys', JSON.stringify(userKeys));
  }, [userKeys]);

  // Fetch Cloud API Keys when currentUser logs in or opens app
  useEffect(() => {
    if (!currentUser) return;

    const fetchCloudKeys = async () => {
      try {
        const response = await fetch(`/api/user-keys?username=${encodeURIComponent(currentUser)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.keys && Object.keys(data.keys).length > 0) {
            setUserKeys(prev => {
              const merged = { ...prev, ...data.keys };
              localStorage.setItem('chatterbot_user_keys', JSON.stringify(merged));
              return merged;
            });
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
    localStorage.setItem('chatterbot_user_keys', JSON.stringify(newKeys));

    if (currentUser) {
      try {
        await fetch('/api/user-keys', {
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
    mode: 'auto' | '12marks' | '2marks' | 'general' | 'none' = 'auto'
  ) => {
    const currentSess = activeSession || sessions[0];
    if (!currentSess) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now()
    };

    const updatedMessages = [...currentSess.messages, userMsg];
    const newTitle = currentSess.messages.length === 0
      ? (prompt.slice(0, 32) + (prompt.length > 32 ? '...' : ''))
      : currentSess.title;

    setSessions(prev => prev.map(s => {
      if (s.id === currentSess.id) {
        return { ...s, title: newTitle, messages: updatedMessages, updatedAt: Date.now() };
      }
      return s;
    }));

    setIsLoading(true);

    try {
      const response = await sendChatMessage(
        selectedProvider,
        selectedModel,
        updatedMessages,
        userKeys,
        webSearch,
        mode,
        currentSess.systemPrompt
      );

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        modelUsed: response.modelUsed,
        usage: response.usage
      };

      setSessions(prev => prev.map(s => {
        if (s.id === currentSess.id) {
          return { ...s, messages: [...updatedMessages, assistantMsg], updatedAt: Date.now() };
        }
        return s;
      }));
    } catch (err: any) {
      const errorMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `❌ **Failed to query model:** ${err.message || 'Unknown network error.'}`,
        timestamp: Date.now()
      };
      setSessions(prev => prev.map(s => {
        if (s.id === currentSess.id) {
          return { ...s, messages: [...updatedMessages, errorMsg], updatedAt: Date.now() };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryLastAssistantMessage = async () => {
    const currentSess = activeSession || sessions[0];
    if (!currentSess || currentSess.messages.length === 0 || isLoading) return;

    let updated = [...currentSess.messages];
    if (updated[updated.length - 1].role === 'assistant') {
      updated.pop();
    }
    if (updated.length === 0) return;

    setSessions(prev => prev.map(s => {
      if (s.id === currentSess.id) {
        return { ...s, messages: updated, updatedAt: Date.now() };
      }
      return s;
    }));

    setIsLoading(true);

    try {
      const response = await sendChatMessage(
        selectedProvider,
        selectedModel,
        updated,
        userKeys,
        false,
        'auto',
        currentSess.systemPrompt
      );

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        modelUsed: response.modelUsed,
        usage: response.usage
      };

      setSessions(prev => prev.map(s => {
        if (s.id === currentSess.id) {
          return { ...s, messages: [...updated, assistantMsg], updatedAt: Date.now() };
        }
        return s;
      }));
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLastUserMessage = (_oldText: string) => {
    setActiveView('chat');
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

  return (
    <div className="app-container">
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        activeView={activeView}
        onViewChange={setActiveView}
        sessions={sessions}
        activeSessionId={activeSession ? activeSession.id : activeSessionIdState}
        onSelectSession={setActiveSessionIdState}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <div className="app-main-viewport">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onClearChat={handleClearChat}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          activeView={activeView}
          username={currentUser}
          onLogout={handleLogout}
        />

        <main className="app-main">
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
            <DiagramStudioView />
          )}
        </main>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userKeys={userKeys}
        onSaveKeys={handleSaveUserKeys}
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
