import { createApiClient } from '@/lib/api/client';

describe('createApiClient', () => {
  it('sends Idempotency-Key header when provided in config', async () => {
    const fetchSpy = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('{}') });
    global.fetch = fetchSpy;
    const client = createApiClient({ baseUrl: 'https://api.test' });
    await client.post('contributions', {}, { idempotencyKey: 'key-123' });
    const call = fetchSpy.mock.calls[0];
    const headers = call[1].headers as Headers;
    expect(headers.get('Idempotency-Key')).toBe('key-123');
  });
});
