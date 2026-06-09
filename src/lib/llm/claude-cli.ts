import { execFile } from 'child_process';
import { promisify } from 'util';
import type { LLMAdapter, LLMMessage } from './types';

const execFileAsync = promisify(execFile);

function formatHistory(messages: LLMMessage[]): string {
  return messages
    .map((m) => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
    .join('\n\n');
}

export class ClaudeCliAdapter implements LLMAdapter {
  async complete(messages: LLMMessage[], systemPrompt: string): Promise<string> {
    // Build a single prompt that includes system context + conversation history.
    // claude -p treats the entire string as a user turn; we embed prior turns
    // as text so Claude sees the conversation context.
    const history = messages.slice(0, -1);
    const current = messages[messages.length - 1];

    const parts: string[] = [systemPrompt];
    if (history.length > 0) {
      parts.push('[Conversation so far]\n' + formatHistory(history));
    }
    parts.push('[Current request]\n' + current.content);

    const prompt = parts.join('\n\n---\n\n');

    const { stdout } = await execFileAsync(
      'claude',
      ['-p', prompt],
      { timeout: 120_000, maxBuffer: 10 * 1024 * 1024 },
    );

    return stdout;
  }
}
