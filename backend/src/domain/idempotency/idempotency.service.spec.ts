import { IdempotencyService } from './idempotency.service';

describe('IdempotencyService (stub)', () => {
  let service: IdempotencyService;

  beforeEach(() => {
    service = new IdempotencyService();
  });

  it('get returns null', async () => {
    const result = await service.get('contribution', 'key-1');
    expect(result).toBeNull();
  });

  it('set resolves without error', async () => {
    await expect(
      service.set('repayment', 'key-1', { id: 'r1', createdAt: new Date() }),
    ).resolves.toBeUndefined();
  });
});
