'use client';

import { useProvider } from '@/contexts/ProviderContext';
import { PROVIDERS } from '@/lib/llm/types';
import { Cpu } from 'lucide-react';

export default function ProviderSwitcher() {
  const { provider, setProvider } = useProvider();
  const current = PROVIDERS.find((p) => p.id === provider)!;

  return (
    <div className="relative group flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors">
      <Cpu size={13} className="text-slate-500 shrink-0" />
      <select
        value={provider}
        onChange={(e) => setProvider(e.target.value as typeof provider)}
        className="text-xs font-medium text-slate-600 bg-transparent border-none outline-none cursor-pointer pr-1 appearance-none"
        aria-label="Select LLM provider"
        data-testid="provider-switcher"
      >
        {PROVIDERS.map((p) => (
          <option key={p.id} value={p.id} title={p.description}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  );
}
