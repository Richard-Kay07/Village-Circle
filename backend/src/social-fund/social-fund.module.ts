import { Module } from '@nestjs/common';
import { SocialFundService } from './social-fund.service';
import { SocialFundController } from './social-fund.controller';
import { GroupModule } from '../group/group.module';

@Module({
  imports: [GroupModule],
  controllers: [SocialFundController],
  providers: [SocialFundService],
  exports: [SocialFundService],
})
export class SocialFundModule {}
