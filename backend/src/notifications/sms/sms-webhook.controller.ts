import { Controller, Post, Body, Req, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { SmsWebhookService } from './sms-webhook.service';

@ApiTags('notifications')
@Controller('notifications/sms/webhook')
export class SmsWebhookController {
  constructor(private readonly webhookService: SmsWebhookService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'SMS provider delivery status webhook' })
  async handleWebhook(
    @Body() payload: unknown,
    @Req() req: Request,
    @Headers() headers: Record<string, string>,
  ): Promise<{ accepted: boolean; signatureInvalid?: boolean }> {
    const result = await this.webhookService.processWebhook(payload, headers);
    return {
      accepted: result.accepted,
      signatureInvalid: result.signatureInvalid,
    };
  }
}
