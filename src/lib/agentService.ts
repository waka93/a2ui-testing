'use client';

import { UserPreferences } from '@/types/preferences';
import { DashboardSpec } from '@/types/componentSpec';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentResult {
  dashboard: DashboardSpec | null;
  preferenceUpdates: Partial<Omit<UserPreferences, 'version'>> | null;
  message: string | null;
}

export async function sendMessage(
  messages: ConversationMessage[],
  userId: string,
  preferences: UserPreferences,
): Promise<AgentResult> {
  const res = await fetch('/api/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, userId, preferences }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? 'Agent request failed');
  }
  return res.json();
}
