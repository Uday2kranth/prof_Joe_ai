import type { ChatSession } from '../types';

const STORAGE_KEY = 'chatterbot_react_sessions_list';
const ACTIVE_ID_KEY = 'chatterbot_react_active_session_id';

export function loadSessions(): ChatSession[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveSessions(sessions: ChatSession[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getActiveSessionId(): string | null {
  return localStorage.getItem(ACTIVE_ID_KEY);
}

export function setActiveSessionId(id: string): void {
  localStorage.setItem(ACTIVE_ID_KEY, id);
}

export function createNewSession(
  title: string = 'New Chat Session',
  provider: string = 'ollama',
  model: string = 'gpt-oss:20b'
): ChatSession {
  const newSession: ChatSession = {
    id: `session-${Date.now()}`,
    title,
    provider,
    model,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const sessions = loadSessions();
  sessions.unshift(newSession);
  saveSessions(sessions);
  setActiveSessionId(newSession.id);
  return newSession;
}
