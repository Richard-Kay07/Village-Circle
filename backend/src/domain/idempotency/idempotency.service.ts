import { Injectable } from '@nestjs/common';
import { IIdempotencyService, IdempotencyResult } from './idempotency.interface';

/**
 * Stub idempotency service. Always returns null from get() and no-ops set().
 * Replace with Redis/DB implementation for production.
 */
@Injectable()
export class IdempotencyService implements IIdempotencyService {
  async get<T = unknown>(_scope: string, _key: string): Promise<IdempotencyResult<T> | null> {
    return null;
  }

  async set<T = unknown>(_scope: string, _key: string, _response: T, _ttlSeconds?: number): Promise<void> {
    // no-op
  }
}
