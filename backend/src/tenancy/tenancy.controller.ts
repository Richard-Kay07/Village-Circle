import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TenancyService } from './tenancy.service';

@ApiTags('tenancy')
@Controller('tenancy')
export class TenancyController {
  constructor(private readonly tenancyService: TenancyService) {}

  @Get('current')
  current(): Promise<{ tenantGroupId: string | null }> {
    return this.tenancyService.getTenantGroupId().then((tenantGroupId) => ({ tenantGroupId }));
  }
}
