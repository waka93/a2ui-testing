'use client';

import { useState } from 'react';
import { Settings, BarChart3 } from 'lucide-react';
import UserSwitcher from './UserSwitcher';
import ProviderSwitcher from './ProviderSwitcher';
import SettingsPanel from './SettingsPanel';
import ChatView from './ChatView';

export default function AppShell() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
            <BarChart3 size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">
            a2ui
          </span>
          <span className="hidden sm:inline text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-1">
            dashboard agent
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ProviderSwitcher />
          <UserSwitcher />
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            data-testid="settings-button"
          >
            <Settings size={17} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden max-w-3xl w-full mx-auto">
        <ChatView />
      </main>

      {settingsOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setSettingsOpen(false)}
            data-testid="settings-overlay"
          />
          <SettingsPanel onClose={() => setSettingsOpen(false)} />
        </>
      )}
    </div>
  );
}
