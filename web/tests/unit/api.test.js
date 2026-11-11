import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiGet, errorCode, pendingRequests } from '../../src/lib/api';

const respond = (response) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => response),
  );

describe('apiGet', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns the JSON data', async () => {
    respond(Response.json({ events: [] }));
    await expect(apiGet('/api/splus/x/46')).resolves.toEqual({ events: [] });
    expect(pendingRequests.value).toBe(0);
  });

  it('returns null if the API has no data', async () => {
    respond(new Response(null, { status: 204 }));
    await expect(apiGet('/api/mensa')).resolves.toBeNull();
  });

  it('throws an error with the status code', async () => {
    respond(new Response('', { status: 404 }));
    const error = await apiGet('/api/splus/x/46').catch((error) => error);
    expect(error.status).toBe(404);
    expect(errorCode(error)).toBe(404);
    expect(pendingRequests.value).toBe(0);
  });

  it('describes errors without status as missing connection', () => {
    expect(errorCode(new TypeError('Failed to fetch'))).toBe(
      'keine Verbindung',
    );
  });
});
