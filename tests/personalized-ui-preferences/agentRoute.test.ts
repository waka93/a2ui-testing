/**
 * @jest-environment node
 */
import { POST } from '@/app/api/agent/route';
import { NextRequest } from 'next/server';
import { DEFAULT_PREFERENCES } from '@/types/preferences';

jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                dashboard: {
                  title: 'Monthly Sales',
                  charts: [
                    {
                      type: 'chart',
                      title: 'Monthly Sales',
                      chartType: 'bar',
                      data: [
                        { label: 'Jan', value: 100 },
                        { label: 'Feb', value: 150 },
                      ],
                    },
                  ],
                },
                message: 'Here is your dashboard.',
              }),
            },
          ],
        }),
      },
    })),
  };
});

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/agent', () => {
  it('returns 400 when messages is missing', async () => {
    const res = await POST(makeRequest({ userId: 'alice', preferences: DEFAULT_PREFERENCES }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('returns 400 when userId is missing', async () => {
    const res = await POST(makeRequest({ messages: [{ role: 'user', content: 'show chart' }], preferences: DEFAULT_PREFERENCES }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when preferences is missing', async () => {
    const res = await POST(makeRequest({ messages: [{ role: 'user', content: 'show chart' }], userId: 'alice' }));
    expect(res.status).toBe(400);
  });

  it('returns a valid dashboard response on success', async () => {
    const res = await POST(makeRequest({
      messages: [{ role: 'user', content: 'show monthly sales' }],
      userId: 'alice',
      preferences: DEFAULT_PREFERENCES,
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.dashboard).toBeDefined();
    expect(Array.isArray(body.dashboard.charts)).toBe(true);
    expect(body.message).toBe('Here is your dashboard.');
  });

  it('includes preference values in the system prompt sent to Claude', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default as jest.MockedClass<any>;
    const mockCreate = Anthropic.mock.results[0].value.messages.create as jest.Mock;
    mockCreate.mockClear();

    const prefs = { ...DEFAULT_PREFERENCES, chartFontSize: 20, colorTheme: 'dark' as const };
    await POST(makeRequest({
      messages: [{ role: 'user', content: 'show chart' }],
      userId: 'alice',
      preferences: prefs,
    }));

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.system).toContain('20px');
    expect(callArgs.system).toContain('dark');
  });
});
