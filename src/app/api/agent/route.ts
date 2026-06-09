import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { UserPreferences } from '@/types/preferences';

const client = new Anthropic();

function buildSystemPrompt(prefs: UserPreferences): string {
  return `You are a data visualization agent for a2ui. You create multi-chart dashboards from data and update user preferences based on conversational requests.

Always respond with ONLY valid JSON using this exact schema — no prose outside the object:
{
  "dashboard": {
    "title": "string",
    "charts": [
      {
        "type": "chart",
        "title": "string",
        "chartType": "bar" | "line" | "pie",
        "data": [{ "label": "string", "value": number }],
        "description": "string (optional)"
      }
    ]
  },
  "preferenceUpdates": {
    "chartFontSize": number,
    "titleFontSize": number,
    "colorTheme": "default" | "dark" | "pastel",
    "defaultChartType": "bar" | "line" | "pie",
    "showLegend": boolean,
    "showGrid": boolean
  },
  "message": "string"
}

Rules:
- Include "dashboard" only when creating or updating visualizations. When given tabular/CSV data, generate 2-4 charts that each highlight a different insight.
- Include "preferenceUpdates" ONLY when the user explicitly requests a visual change (e.g. "bigger title", "no legend", "dark theme", "hide grid"). Include only the keys that should change.
- Always include "message" with a short, natural reply explaining what you did.
- Apply current preferences to all generated charts.

Preference interpretation guide:
- "larger/bigger title" → increase titleFontSize by 4 (max 32)
- "smaller title" → decrease titleFontSize by 4 (min 10)
- "no legend" / "hide legend" / "remove legend" → showLegend: false
- "show legend" → showLegend: true
- "no grid" / "hide grid" → showGrid: false
- "show grid" → showGrid: true
- "dark theme/mode" → colorTheme: "dark"
- "light theme/mode" / "default theme" → colorTheme: "default"
- "pastel theme" → colorTheme: "pastel"

Current user preferences (apply to all generated charts):
- Title font size: ${prefs.titleFontSize}px
- Chart font size: ${prefs.chartFontSize}px
- Color theme: ${prefs.colorTheme}
- Default chart type: ${prefs.defaultChartType}
- Show legend: ${prefs.showLegend}
- Show grid: ${prefs.showGrid}`;
}

export async function POST(req: NextRequest) {
  let body: { messages?: unknown; userId?: unknown; preferences?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { messages, userId, preferences } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
  }
  if (typeof userId !== 'string' || !userId.trim()) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }
  if (!preferences || typeof preferences !== 'object') {
    return NextResponse.json({ error: 'preferences is required' }, { status: 400 });
  }

  const prefs = preferences as UserPreferences;
  const apiMessages = messages as { role: 'user' | 'assistant'; content: string }[];

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: buildSystemPrompt(prefs),
      messages: apiMessages,
    });

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    let parsed: {
      dashboard?: unknown;
      preferenceUpdates?: unknown;
      message?: string;
    } | null = null;

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // non-JSON response
    }

    if (!parsed) {
      return NextResponse.json({ message: text, rawText: text });
    }

    return NextResponse.json({
      dashboard: parsed.dashboard ?? null,
      preferenceUpdates: parsed.preferenceUpdates ?? null,
      message: parsed.message ?? null,
      rawJson: text,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
