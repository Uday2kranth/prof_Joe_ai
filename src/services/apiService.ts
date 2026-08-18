import type { Message, UserKeys } from '../types';

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isFileProto = window.location.protocol === 'file:';
    if (isCapacitor || isFileProto || (isLocalhost && window.location.port === '')) {
      return `https://prof-joe-ai.vercel.app${cleanPath}`;
    }
  }
  return cleanPath;
}

export async function sendChatMessage(
  provider: string,
  model: string,
  messages: Message[],
  userKeys: UserKeys,
  webSearch: boolean = false,
  mode: 'auto' | '12marks' | '2marks' | 'general' | 'none' = 'auto',
  systemPrompt?: string,
  persona: string = 'default',
  enableDiagrams: boolean = false,
  beginnerFriendly: boolean = false
): Promise<{ content: string; modelUsed: string; usage?: any }> {
  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: m.content
  }));

  const activeUsername = localStorage.getItem('chatterbot_username') || 'Guest_Student';
  const activeToken = localStorage.getItem('chatterbot_token') || '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-authorization': activeToken,
    'x-user-ollama-key': userKeys.ollama || '',
    'x-user-local-endpoint': userKeys.local_endpoint || '',
    'x-user-openrouter-key': userKeys.openrouter || '',
    'x-user-gemini-key': userKeys.gemini || '',
    'x-user-groq-key': userKeys.groq || '',
    'x-user-mistral-key': userKeys.mistral || '',
    'x-user-nvidia-key': userKeys.nvidia || '',
    'x-user-cerebras-key': userKeys.cerebras || '',
    'x-user-sambanova-key': userKeys.sambanova || '',
    'x-user-nararouter-key': userKeys.nararouter || '',
    'x-user-huggingface-key': userKeys.huggingface || '',
    'x-user-opencode-key': userKeys.opencode || '',
    'x-user-poolside-key': userKeys.poolside || '',
    'x-user-pollinations-key': userKeys.pollinations || ''
  };

  const response = await fetch(getApiUrl('/api/chat'), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      user: activeUsername,
      provider,
      model,
      messages: formattedMessages,
      webSearch,
      mode,
      persona,
      systemPrompt: systemPrompt || '',
      enableDiagrams,
      beginnerFriendly
    })
  });

  const resText = await response.text();
  let resData: any = {};

  if (resText && resText.trim()) {
    try {
      resData = JSON.parse(resText);
    } catch (e) {
      console.error('Non-JSON response received from server:', resText);
      resData = { error: `Server returned invalid response (${response.status}): ${resText.substring(0, 150)}` };
    }
  } else {
    resData = {
      error: response.status === 502
        ? '❌ Local API Server Offline (HTTP 502). Please start `node local-server.js` or run `npm run dev`.'
        : `Server returned empty response (HTTP ${response.status}). Please verify API key configuration.`
    };
  }

  if (!response.ok) {
    let errMessage = resData.error;
    if (typeof errMessage === 'object' && errMessage !== null) {
      errMessage = errMessage.message || JSON.stringify(errMessage);
    }
    throw new Error(errMessage || `HTTP ${response.status} error from server`);
  }

  return {
    content: resData.content || resData.message || resData.text || '',
    modelUsed: resData.modelUsed || model,
    usage: resData.usage
  };
}
