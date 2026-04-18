import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RbacService } from './rbac.service';

@ApiTags('rbac')
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('check')
  check(): Promise<{ allowed: boolean }> {
    return Promise.resolve({ allowed: false });
  }
}
