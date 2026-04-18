import { Injectable } from '@nestjs/common';
import { ITenancyService } from './tenancy.interface';

/**
 * Tenancy service skeleton. No business logic yet.
 */
@Injectable()
export class TenancyService implements ITenancyService {
  async getTenantGroupId(): Promise<string | null> {
    return null;
  }

  async requireTenantGroupId(): Promise<string> {
    throw new Error('TenancyService.requireTenantGroupId not implemented');
  }
}
