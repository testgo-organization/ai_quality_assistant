import { AIGO_API_BASE_URL, API_BASE_URL } from '@/config';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string | Date;
}

export async function fetchChatHistory(token: string): Promise<ChatMessage[]> {
  try {
    const res = await fetch(`${AIGO_API_BASE_URL}aigo/chat/history`, {
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

export async function saveChatHistory(token: string, session_id: string, onboarding_process: boolean): Promise<void> {
  const res = await fetch(`${API_BASE_URL}user/update_onboarding_aigo`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      last_session_chat: session_id,
      onboarding_process
    })
  });
  if (!res.ok) {
    let errorMsg = `Error: ${res.status} - ${res.statusText}`;
    try {
      const data = await res.json();
      if (data && data.detail) errorMsg = data.detail;
    } catch {}
    throw new Error(errorMsg);
  }
  // Opcional: puedes retornar el resultado si lo necesitas
  // return await res.json();
}
