export type { LLMAdapter, LLMMessage, Provider, ProviderMeta } from './types';
export { PROVIDERS } from './types';

import type { Provider, LLMAdapter } from './types';
import { AnthropicAdapter } from './anthropic';
import { ClaudeCliAdapter } from './claude-cli';

export function getAdapter(provider: Provider): LLMAdapter {
  switch (provider) {
    case 'anthropic':   return new AnthropicAdapter();
    case 'claude-cli':  return new ClaudeCliAdapter();
    default:            throw new Error(`Unknown provider: ${provider}`);
  }
}
