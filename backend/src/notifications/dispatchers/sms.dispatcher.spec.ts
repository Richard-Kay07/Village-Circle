import { Test, TestingModule } from '@nestjs/testing';
import { SmsDispatcher } from './sms.dispatcher';
import { MockSmsAdapter } from '../sms/adapters/mock-sms.adapter';
import { SMS_PROVIDER_ADAPTER } from '../sms/sms.constants';

describe('SmsDispatcher', () => {
  let dispatcher: SmsDispatcher;
  let adapter: MockSmsAdapter;

  beforeEach(async () => {
    adapter = new MockSmsAdapter();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsDispatcher,
        { provide: SMS_PROVIDER_ADAPTER, useValue: adapter },
      ],
    }).compile();
    dispatcher = module.get(SmsDispatcher);
  });

  it('sends SMS through adapter and returns success with providerMessageId', async () => {
    const result = await dispatcher.dispatch(
      { phone: '+447700900123' },
      { subject: null, body: 'Hello from VC360' },
      'notif-1',
    );

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBeDefined();
    expect(adapter.lastSend).toEqual({
      to: '+447700900123',
      message: 'Hello from VC360',
      metadata: { notificationId: 'notif-1' },
    });
  });

  it('returns failure when phone is empty', async () => {
    const result = await dispatcher.dispatch(
      { phone: '   ' },
      { subject: null, body: 'Hi' },
      'n1',
    );

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('NO_PHONE');
    expect(adapter.lastSend).toBeNull();
  });

  it('rejects invalid webhook signature when adapter sets signatureInvalid', async () => {
    const result = await dispatcher.parseWebhook(
      { providerMessageId: 'sid_x', status: 'DELIVERED' },
      { 'x-mock-signature': 'invalid' },
    );

    expect(result.valid).toBe(false);
    expect(result.signatureInvalid).toBe(true);
  });

  it('delegates parseWebhook to adapter and returns payload when valid', async () => {
    const result = await dispatcher.parseWebhook(
      { providerMessageId: 'sid_456', status: 'DELIVERED' },
      {},
    );

    expect(result.valid).toBe(true);
    expect(result.payload?.providerMessageId).toBe('sid_456');
    expect(result.payload?.status).toBe('DELIVERED');
  });
});
