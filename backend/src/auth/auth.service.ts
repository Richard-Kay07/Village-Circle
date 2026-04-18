import { Injectable } from '@nestjs/common';
import { IAuthService } from './auth.interface';

/**
 * Auth service skeleton. No business logic yet.
 */
@Injectable()
export class AuthService implements IAuthService {
  async validateRequest(): Promise<string | null> {
    return null;
  }

  async getActorUserIdFromRequest(): Promise<string | null> {
    return null;
  }
}
