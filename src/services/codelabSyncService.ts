import type { ChatSession } from '../types';
import { saveCodeLabSession } from './indexedDbService';
import { getApiUrl } from './apiService';

export async function fetchCloudCodeLabPresetSessions(
  username: string, 
  token?: string
): Promise<Record<string, ChatSession[]> | null> {
  if (!username) return null;
  try {
    const query = new URLSearchParams({ username });
    if (token) query.append('token', token);

    const response = await fetch(getApiUrl(`/api/codelab-sessions?${query.toString()}`));
    if (!response.ok) return null;

    const data = await response.json();
    if (data && data.success && data.presetSessions) {
      return data.presetSessions;
    }
  } catch (err) {
    console.error('Failed to fetch Code Lab cloud preset sessions:', err);
  }
  return null;
}

export async function saveCloudCodeLabPresetSessions(
  username: string, 
  presetSessions: Record<string, ChatSession[]>
): Promise<boolean> {
  if (!username) return false;
  try {
    const response = await fetch(getApiUrl('/api/codelab-sessions'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, presetSessions })
    });
    return response.ok;
  } catch (err) {
    console.error('Failed to save Code Lab cloud preset sessions:', err);
    return false;
  }
}

export async function syncCodeLabPresetSessions(
  username: string,
  presetId: string,
  activeSession: ChatSession,
  allPresetSessions: Record<string, ChatSession[]>
): Promise<void> {
  // 1. Save active session locally in IndexedDB for instant 0ms access
  await saveCodeLabSession(username, presetId, activeSession);

  // 2. Asynchronously sync complete preset session mapping to MongoDB Cloud
  saveCloudCodeLabPresetSessions(username, allPresetSessions).catch(err => {
    console.error('Background MongoDB Code Lab sync failed:', err);
  });
}
