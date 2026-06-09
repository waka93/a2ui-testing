'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Sparkles } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePreferences } from '@/contexts/PreferenceContext';
import { sendMessage, ConversationMessage } from '@/lib/agentService';
import DashboardView from './DashboardView';
import { DashboardSpec } from '@/types/componentSpec';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  dashboard?: DashboardSpec;
  prefChanged?: Record<string, unknown>;
}

function parseCsv(raw: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = raw.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map((line) => {
    const vals = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
  });
  return { headers, rows };
}

function formatCsvForAgent(raw: string, filename: string): string {
  const { headers, rows } = parseCsv(raw);
  if (!headers.length) return `[empty CSV: ${filename}]`;
  const preview = rows
    .slice(0, 50)
    .map((r) => headers.map((h) => r[h]).join(', '))
    .join('\n');
  return `CSV file: ${filename}\nColumns: ${headers.join(', ')}\nRows (${rows.length} total):\n${preview}${rows.length > 50 ? `\n... and ${rows.length - 50} more rows` : ''}`;
}

const HINTS = [
  'Show quarterly revenue across 4 regions',
  "I don't want a legend",
  'Make the title bigger',
  'Switch to dark theme',
];

export default function ChatView() {
  const { userId } = useUser();
  const { preferences, updatePref } = usePreferences();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingCsv, setPendingCsv] = useState<{ name: string; content: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMessages([]);
    setHistory([]);
    setPendingCsv(null);
    setInput('');
  }, [userId]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPendingCsv({ name: file.name, content: ev.target?.result as string });
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function handleSend() {
    const text = input.trim();
    const hasCsv = !!pendingCsv;
    if (!text && !hasCsv) return;
    if (loading) return;

    let userText = text;
    let agentContent = text;

    if (hasCsv) {
      const csvFormatted = formatCsvForAgent(pendingCsv!.content, pendingCsv!.name);
      agentContent = text
        ? `${text}\n\n${csvFormatted}`
        : `Please create a dashboard from this data.\n\n${csvFormatted}`;
      userText = text || `Uploaded: ${pendingCsv!.name}`;
    }

    setInput('');
    setPendingCsv(null);

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const newHistory: ConversationMessage[] = [...history, { role: 'user', content: agentContent }];

    try {
      const result = await sendMessage(newHistory, userId, preferences);

      if (result.preferenceUpdates) {
        for (const [key, value] of Object.entries(result.preferenceUpdates)) {
          updatePref(key as keyof typeof preferences, value as never);
        }
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        dashboard: result.dashboard ?? undefined,
        text: result.message ?? undefined,
        prefChanged: result.preferenceUpdates ?? undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      const assistantContent = JSON.stringify({
        dashboard: result.dashboard,
        preferenceUpdates: result.preferenceUpdates,
        message: result.message,
      });
      setHistory([...newHistory, { role: 'assistant', content: assistantContent }]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: err instanceof Error ? err.message : 'Something went wrong',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full" data-testid="chat-view">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg mb-5">
              <Sparkles size={26} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Start with your data</h2>
            <p className="text-slate-500 text-sm mb-7 max-w-xs leading-relaxed">
              Upload a CSV file or describe data and I'll build a personalized dashboard. You can also set your visual preferences in plain language.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {HINTS.map((hint) => (
                <button
                  key={hint}
                  onClick={() => setInput(hint)}
                  className="text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-full px-4 py-1.5 transition-colors font-medium"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'user' ? (
              <div className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-sm text-sm shadow-sm">
                {msg.text}
              </div>
            ) : (
              <div className="w-full max-w-2xl space-y-3">
                {msg.prefChanged && Object.keys(msg.prefChanged).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(msg.prefChanged).map(([k, v]) => (
                      <span
                        key={k}
                        className="text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5"
                      >
                        ✦ {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                )}
                {msg.text && (
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-700 shadow-sm leading-relaxed">
                    {msg.text}
                  </div>
                )}
                {msg.dashboard && (
                  <DashboardView dashboard={msg.dashboard} preferences={preferences} />
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start" data-testid="loading-indicator">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-slate-400">Generating dashboard…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* CSV chip */}
      {pendingCsv && (
        <div className="mx-4 mb-2 flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2">
          <Paperclip size={13} className="text-indigo-500 shrink-0" />
          <span className="text-xs font-medium text-indigo-700 truncate flex-1">{pendingCsv.name}</span>
          <button
            onClick={() => setPendingCsv(null)}
            className="text-indigo-400 hover:text-indigo-600 transition-colors"
            aria-label="Remove file"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl shadow-sm px-3 py-2">
          <input
            type="file"
            accept=".csv,text/csv"
            ref={fileRef}
            onChange={handleFileChange}
            className="hidden"
            data-testid="file-input"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            aria-label="Upload CSV"
            className="flex items-center justify-center w-8 h-8 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 transition-colors shrink-0"
            data-testid="upload-button"
          >
            <Paperclip size={17} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={pendingCsv ? 'Add a note or press send…' : 'Ask for a dashboard, upload a CSV, or set preferences…'}
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none disabled:opacity-50 min-w-0"
            data-testid="chat-input"
          />
          <button
            onClick={handleSend}
            disabled={loading || (!input.trim() && !pendingCsv)}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0 shadow-sm"
            aria-label="Send message"
            data-testid="send-button"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
