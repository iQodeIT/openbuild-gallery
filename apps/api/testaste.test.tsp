import { describe, it, expect, beforeAll } from 'vitest';
import { buildApp } from '../src/app';
import { prisma } from '../src/db';

describe('Paste Clone', () => {
  const app = buildApp();

  beforeAll(async () => {
    await prisma.paste.deleteMany();
  });

  it('should create and read a paste', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/clones/paste/pastes',
      payload: {
        content: 'hello world',
        viewsAllowed: 2,
      },
    });
    expect(createRes.statusCode).toBe(201);
    const { id } = createRes.json();

    const read1 = await app.inject({ method: 'GET', url: `/pastes/${id}` });
    expect(read1.statusCode).toBe(200);
    expect(read1.json().content).toBe('hello world');
    expect(read1.json().viewsLeft).toBe(1);

    const read2 = await app.inject({ method: 'GET', url: `/pastes/${id}` });
    expect(read2.statusCode).toBe(200);
    expect(read2.json().viewsLeft).toBe(0);

    const read3 = await app.inject({ method: 'GET', url: `/pastes/${id}` });
    expect(read3.statusCode).toBe(410);
    expect(read3.json().error).toBe('paste_exhausted');
  });

  it('should respect TTL', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/clones/paste/pastes',
      payload: {
        content: 'short lived',
        viewsAllowed: 10,
        expiresInSeconds: 1,
      },
    });
    const { id } = createRes.json();

    // Immediate read
    const read1 = await app.inject({ method: 'GET', url: `/pastes/${id}` });
    expect(read1.statusCode).toBe(200);

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const read2 = await app.inject({ method: 'GET', url: `/pastes/${id}` });
    expect(read2.statusCode).toBe(410);
    expect(read2.json().error).toBe('paste_expired');
  });

  it('should handle concurrent reads correctly', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/clones/paste/pastes',
      payload: {
        content: 'concurrent secret',
        viewsAllowed: 1,
      },
    });
    const { id } = createRes.json();

    const results = await Promise.all(
      Array.from({ length: 20 }, () => app.inject({ method: 'GET', url: `/pastes/${id}` })),
    );

    const statuses = results.map((r) => r.statusCode);
    const count200 = statuses.filter((s) => s === 200).length;
    const count410 = statuses.filter((s) => s === 410).length;

    expect(count200).toBe(1);
    expect(count410).toBe(19);
  });
});
