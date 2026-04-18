import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SocialFundService, CreateBucketDto, PostSocialFundEntryDto, ReversalSocialFundEntryDto } from './social-fund.service';
import { MemberGuard, REQUIRE_ADMIN } from '../member/member.guard';
import { SetMetadata } from '@nestjs/common';

const RequireAdmin = () => SetMetadata(REQUIRE_ADMIN, true);

@ApiTags('social-fund')
@Controller('social-fund')
export class SocialFundController {
  constructor(private readonly socialFundService: SocialFundService) {}

  @Post('buckets')
  @UseGuards(MemberGuard)
  @RequireAdmin()
  @ApiOperation({ summary: 'Create social fund bucket (admin only)' })
  createBucket(@Body() dto: CreateBucketDto): Promise<{ id: string }> {
    return this.socialFundService.createBucket(dto);
  }

  @Post('entries')
  @ApiOperation({ summary: 'Post social fund entry (contribution or disbursement)' })
  postEntry(@Body() dto: PostSocialFundEntryDto) {
    return this.socialFundService.postEntry(dto);
  }

  @Post('entries/reversal')
  @UseGuards(MemberGuard)
  @RequireAdmin()
  @ApiOperation({ summary: 'Reverse a social fund entry (admin only)' })
  reversalEntry(@Body() dto: ReversalSocialFundEntryDto) {
    return this.socialFundService.reversalEntry(dto);
  }

  @Get('buckets/group/:groupId')
  @UseGuards(MemberGuard)
  @ApiOperation({ summary: 'List buckets and balances for group' })
  listBuckets(
    @Param('groupId') groupId: string,
    @Query('actorMemberId') actorMemberId: string,
  ) {
    return this.socialFundService.listBuckets(groupId, actorMemberId);
  }

  @Get('entries/bucket/:bucketId')
  @ApiOperation({ summary: 'List entries for a bucket' })
  listEntries(
    @Param('bucketId') bucketId: string,
    @Query('actorMemberId') actorMemberId: string,
  ) {
    return this.socialFundService.listEntries(bucketId, actorMemberId);
  }
}
