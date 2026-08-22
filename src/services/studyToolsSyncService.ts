import type { PinnedItem, FlashcardDeck, QuizDeck } from '../types';
import { getApiUrl } from './apiService';
const PINS_PREFIX = 'chatterbot_pins_';

export function getSavedPins(username: string): PinnedItem[] {
  try {
    const raw = localStorage.getItem(`${PINS_PREFIX}${username || 'guest'}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load pins:', e);
  }
  return [];
}

export function savePinsLocally(username: string, pins: PinnedItem[]): void {
  try {
    localStorage.setItem(`${PINS_PREFIX}${username || 'guest'}`, JSON.stringify(pins));
  } catch (e) {
    console.error('Failed to save pins locally:', e);
  }
}

export async function fetchCloudStudyTools(username: string, token?: string): Promise<{
  pins?: PinnedItem[];
  flashcardDecks?: FlashcardDeck[];
  quizDecks?: QuizDeck[];
} | null> {
  if (!username || username === 'guest') return null;

  try {
    const queryParams = new URLSearchParams({ username });
    if (token) queryParams.append('token', token);

    const res = await fetch(getApiUrl(`/api/study-tools?${queryParams.toString()}`));
    if (!res.ok) return null;

    const data = await res.json();
    if (data.success) {
      return {
        pins: Array.isArray(data.pins) ? data.pins : [],
        flashcardDecks: Array.isArray(data.flashcardDecks) ? data.flashcardDecks : [],
        quizDecks: Array.isArray(data.quizDecks) ? data.quizDecks : []
      };
    }
  } catch (err) {
    console.warn('Failed to fetch cloud study tools:', err);
  }
  return null;
}

let syncTimeout: any = null;

export function syncCloudStudyTools(
  username: string,
  payload: {
    pins?: PinnedItem[];
    flashcardDecks?: FlashcardDeck[];
    quizDecks?: QuizDeck[];
  }
): void {
  if (!username || username === 'guest') return;

  if (syncTimeout) clearTimeout(syncTimeout);

  syncTimeout = setTimeout(() => {
    fetch(getApiUrl('/api/study-tools'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        pins: payload.pins,
        flashcardDecks: payload.flashcardDecks,
        quizDecks: payload.quizDecks
      })
    }).catch(err => console.warn('Could not sync study tools to cloud immediately:', err));
  }, 400);
}
