// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendChatMessage } from '../../services/apiService';
import type { Message } from '../../types';

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
      modelUsed: 'gemini-3.6-flash',
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
      'gemini-3.6-flash',
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
    expect(result.modelUsed).toBe('gemini-3.6-flash');
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
      sendChatMessage('gemini', 'gemini-3.6-flash', dummyMessages, dummyKeys)
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
      sendChatMessage('gemini', 'gemini-3.6-flash', dummyMessages, dummyKeys)
    ).rejects.toThrow('Google Free Tier Rate Limit Exceeded');
  });

  it('correctly resolves workspace-specific AI tuning parameters', async () => {
    let capturedBody: any = null;
    global.fetch = vi.fn().mockImplementation((_url, options) => {
      capturedBody = JSON.parse(options.body);
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ content: 'Code response', modelUsed: 'gemini-3.6-flash' })
      });
    });

    // Test code_lab workspace resolution
    await sendChatMessage(
      'gemini',
      'gemini-3.6-flash',
      dummyMessages,
      dummyKeys,
      true,
      'none',
      'CODE_PROMPT',
      'default',
      false,
      false,
      'code_lab'
    );

    expect(capturedBody.temperature).toBe(0.15); // Code Dungeon deterministic temperature
    expect(capturedBody.maxTokens).toBe(4096);
    expect(capturedBody.searchDepth).toBe(3); // Code lab search depth

    // Test fun_personas workspace resolution
    await sendChatMessage(
      'gemini',
      'gemini-3.6-flash',
      dummyMessages,
      dummyKeys,
      false,
      'general',
      undefined,
      'peter',
      false,
      false,
      'fun_personas'
    );

    expect(capturedBody.temperature).toBe(0.8); // High humor creativity
    expect(capturedBody.maxTokens).toBe(3072);
  });
});
