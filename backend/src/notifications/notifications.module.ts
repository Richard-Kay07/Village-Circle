import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationsService } from './notifications.service';
import { NotificationTriggerService } from './notification-trigger.service';
import { InAppDispatcher } from './dispatchers/in-app.dispatcher';
import { EmailDispatcher } from './dispatchers/email.dispatcher';
import { SmsDispatcher } from './dispatchers/sms.dispatcher';
import { NotificationPreferenceService } from './notification-preference.service';
import { AuditModule } from '../audit/audit.module';
import { GroupRulesModule } from '../group-rules/group-rules.module';
import { RbacModule } from '../rbac/rbac.module';
import { SmsWebhookController } from './sms/sms-webhook.controller';
import { SmsWebhookService } from './sms/sms-webhook.service';
import { NotificationTriggerController } from './notification-trigger.controller';
import { MockSmsAdapter } from './sms/adapters/mock-sms.adapter';
import { SMS_PROVIDER_ADAPTER } from './sms/sms.constants';

@Module({
  imports: [AuditModule, GroupRulesModule, RbacModule],
  controllers: [SmsWebhookController, NotificationTriggerController],
  providers: [
    NotificationService,
    NotificationsService,
    NotificationTriggerService,
    InAppDispatcher,
    EmailDispatcher,
    { provide: SMS_PROVIDER_ADAPTER, useClass: MockSmsAdapter },
    SmsDispatcher,
    NotificationPreferenceService,
    SmsWebhookService,
  ],
  exports: [NotificationService, NotificationsService, NotificationTriggerService],
})
export class NotificationsModule {}
