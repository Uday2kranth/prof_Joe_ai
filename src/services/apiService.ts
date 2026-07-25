import type { Message, UserKeys } from '../types';

export async function sendChatMessage(
  provider: string,
  model: string,
  messages: Message[],
  userKeys: UserKeys,
  webSearch: boolean = false,
  mode: 'auto' | '12marks' | '2marks' | 'general' | 'none' = 'auto',
  systemPrompt?: string
): Promise<{ content: string; modelUsed: string; usage?: any }> {
  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: m.content
  }));

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-ollama-key': userKeys.ollama || '',
    'x-user-openrouter-key': userKeys.openrouter || '',
    'x-user-gemini-key': userKeys.gemini || '',
    'x-user-groq-key': userKeys.groq || '',
    'x-user-mistral-key': userKeys.mistral || '',
    'x-user-nvidia-key': userKeys.nvidia || '',
    'x-user-cerebras-key': userKeys.cerebras || '',
    'x-user-sambanova-key': userKeys.sambanova || '',
    'x-user-nararouter-key': userKeys.nararouter || '',
    'x-user-huggingface-key': userKeys.huggingface || '',
    'x-user-pollinations-key': userKeys.pollinations || ''
  };

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      user: 'Admin@uday',
      provider,
      model,
      messages: formattedMessages,
      webSearch,
      mode,
      systemPrompt: systemPrompt || ''
    })
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Error(resData.error || `HTTP ${response.status} error from server`);
  }

  return {
    content: resData.content,
    modelUsed: resData.modelUsed || model,
    usage: resData.usage
  };
}
