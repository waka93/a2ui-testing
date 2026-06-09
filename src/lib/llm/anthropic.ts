import Anthropic from '@anthropic-ai/sdk';
import type { LLMAdapter, LLMMessage } from './types';

export class AnthropicAdapter implements LLMAdapter {
  private client = new Anthropic();

  async complete(messages: LLMMessage[], systemPrompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    return response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');
  }
}
