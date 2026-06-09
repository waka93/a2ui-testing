export type Provider = 'anthropic' | 'claude-cli';

export interface LLMMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LLMAdapter {
  complete(messages: LLMMessage[], systemPrompt: string): Promise<string>;
}

export interface ProviderMeta {
  id: Provider;
  label: string;
  description: string;
}

export const PROVIDERS: ProviderMeta[] = [
  {
    id: 'anthropic',
    label: 'Anthropic API',
    description: 'Requires ANTHROPIC_API_KEY',
  },
  {
    id: 'claude-cli',
    label: 'Claude Code',
    description: 'Uses your Claude Code subscription',
  },
];
