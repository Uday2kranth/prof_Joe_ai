// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendChatMessage } from '../../services/apiService';
import { Message } from '../../types';

describe('apiService - sendChatMessage Standard Service', () => {
  const dummyMessages: Message[] = [
    { id: '1', role: 'user', content: 'What is Linear Regression?', timestamp: Date.now() }
  ];

  const dummyKeys = {
    gemini: 'test-gemini-key',
    groq: '',
    openrouter: '',
    mistral: '',
    nvidia: '',
    cerebras: '',
    sambanova: '',
    nararouter: '',
    huggingface: '',
    opencode: '',
    poolside: '',
    pollinations: '',
    ollama: '',
    local_endpoint: ''
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('successfully returns full response payload', async () => {
    const mockJson = {
      content: 'Linear regression models the relationship between variables.',
      modelUsed: 'gemini-2.5-flash',
      usage: { promptTokens: 10, completionTokens: 20 }
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(mockJson)
    } as any);

    const result = await sendChatMessage(
      'gemini',
      'gemini-2.5-flash',
      dummyMessages,
      dummyKeys,
      false,
      'auto',
      undefined,
      'default',
      false,
      false
    );

    expect(result.content).toBe('Linear regression models the relationship between variables.');
    expect(result.modelUsed).toBe('gemini-2.5-flash');
    expect(result.usage).toEqual({ promptTokens: 10, completionTokens: 20 });
  });

  it('handles server errors gracefully and throws formatted error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify({ error: 'Invalid API key provided.' })
    } as any);

    await expect(
      sendChatMessage('gemini', 'gemini-2.5-flash', dummyMessages, dummyKeys)
    ).rejects.toThrow('Invalid API key provided.');
  });

  it('handles quota limit 429 errors clearly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify({ error: 'Google Free Tier Rate Limit Exceeded (15 RPM / 1500 RPD quota).' })
    } as any);

    await expect(
      sendChatMessage('gemini', 'gemini-2.5-flash', dummyMessages, dummyKeys)
    ).rejects.toThrow('Google Free Tier Rate Limit Exceeded');
  });
});
