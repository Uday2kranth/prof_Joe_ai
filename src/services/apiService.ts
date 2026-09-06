import type { Message, UserKeys, CodeLabDeliveryFormat, CodeLabApproach } from '../types';

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
  mode: 'auto' | '12marks' | '2marks' | '1marks' | 'general' | 'none' = 'auto',
  systemPrompt?: string,
  persona: string = 'default',
  enableDiagrams: boolean = false,
  beginnerFriendly: boolean = false,
  workspace: 'chat' | 'code_lab' | 'fun_personas' | 'lecture_notes' | 'exam' = 'chat',
  customTuning?: { temperature?: number; maxTokens?: number; searchDepth?: number },
  codeLabOptions?: { deliveryFormat?: CodeLabDeliveryFormat; codeApproach?: CodeLabApproach }
): Promise<{ content: string; modelUsed: string; usage?: any }> {
  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: m.content
  }));

  const activeUsername = localStorage.getItem('chatterbot_username') || 'Guest_Student';
  const activeToken = localStorage.getItem('chatterbot_token') || '';

  // Read user-configured AI generation and tuning parameters
  let aiTuningConfig: any = null;
  try {
    const rawTuning = localStorage.getItem('chatterbot_ai_tuning');
    if (rawTuning) aiTuningConfig = JSON.parse(rawTuning);
  } catch {}

  let temperature = customTuning?.temperature;
  let maxTokens = customTuning?.maxTokens;
  let searchDepth = customTuning?.searchDepth;

  if (temperature === undefined) {
    if (workspace === 'code_lab') {
      temperature = aiTuningConfig?.codeDungeon?.temperature ?? 0.15;
    } else if (workspace === 'fun_personas') {
      temperature = aiTuningConfig?.funPersonas?.temperature ?? 0.8;
    } else if (workspace === 'lecture_notes') {
      temperature = aiTuningConfig?.lectureNotes?.temperature ?? 0.2;
    } else {
      temperature = aiTuningConfig?.mainChat?.temperature ?? (aiTuningConfig?.temperature ?? 0.2);
    }
  }

  if (maxTokens === undefined) {
    if (workspace === 'code_lab') {
      maxTokens = aiTuningConfig?.codeDungeon?.maxTokens ?? 4096;
    } else if (workspace === 'fun_personas') {
      maxTokens = aiTuningConfig?.funPersonas?.maxTokens ?? 3072;
    } else if (workspace === 'lecture_notes') {
      maxTokens = aiTuningConfig?.lectureNotes?.maxTokens ?? 8192;
    } else {
      maxTokens = aiTuningConfig?.mainChat?.maxTokens ?? (aiTuningConfig?.maxTokens ?? 4096);
    }
  }

  if (searchDepth === undefined) {
    if (workspace === 'code_lab') {
      searchDepth = aiTuningConfig?.codeDungeon?.searchSourcesCount ?? 3;
    } else {
      searchDepth = aiTuningConfig?.mainChat?.searchSourcesCount ?? (aiTuningConfig?.searchSourcesCount ?? (typeof aiTuningConfig?.searchDepth === 'number' ? aiTuningConfig.searchDepth : 4));
    }
  }

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
      searchDepth,
      mode,
      persona,
      systemPrompt: systemPrompt || '',
      enableDiagrams,
      beginnerFriendly,
      temperature,
      maxTokens,
      workspace,
      deliveryFormat: codeLabOptions?.deliveryFormat,
      codeApproach: codeLabOptions?.codeApproach
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
        : response.status === 400
        ? `🔑 Personal API key required for ${provider || 'this provider'}. Please add your key in Settings (⚙️) to use this model.`
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
