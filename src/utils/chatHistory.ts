import { AIGO_API_BASE_URL } from '@/config';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string | Date;
}

export async function fetchChatHistory(token: string): Promise<ChatMessage[]> {
  try {
    const res = await fetch(`${AIGO_API_BASE_URL}/aigo/chat/history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.messages)) {
        // Normaliza el timestamp a tipo Date siempre
        return data.messages.map((msg: any) => ({
          ...msg,
          timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp
        }));
      }
    }
  } catch {
    // Silenciar error de fetch
  }
  return [];
}

export async function saveChatHistory(token: string, messages: ChatMessage[]): Promise<void> {
  await fetch(`${AIGO_API_BASE_URL}/aigo/chat/history`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: messages.map(m => ({
        ...m,
        timestamp: typeof m.timestamp === 'string' ? m.timestamp : m.timestamp.toISOString()
      }))
    })
  });
}
