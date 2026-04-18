import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  me(): Promise<{ userId: string | null }> {
    return this.authService.getActorUserIdFromRequest().then((userId) => ({ userId }));
  }
}
