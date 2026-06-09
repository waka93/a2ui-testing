'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Provider } from '@/lib/llm/types';

interface ProviderContextValue {
  provider: Provider;
  setProvider: (p: Provider) => void;
}

const ProviderContext = createContext<ProviderContextValue | null>(null);

export function ProviderProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<Provider>('anthropic');
  return (
    <ProviderContext.Provider value={{ provider, setProvider }}>
      {children}
    </ProviderContext.Provider>
  );
}

export function useProvider(): ProviderContextValue {
  const ctx = useContext(ProviderContext);
  if (!ctx) throw new Error('useProvider must be used within ProviderProvider');
  return ctx;
}
