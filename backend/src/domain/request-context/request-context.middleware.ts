import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RequestContext } from './request-context.types';
import { REQUEST_CONTEXT_KEY } from './request-context.types';
import { AuditChannel } from '../enums';

export type RequestWithContext = Request & { [REQUEST_CONTEXT_KEY]: RequestContext };

/**
 * Middleware that creates and attaches a RequestContext to each request.
 * actorUserId and tenantGroupId are set by auth/tenancy later; here we set defaults.
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: RequestWithContext, _res: Response, next: NextFunction): void {
    const requestId = (req.headers['x-request-id'] as string) ?? uuidv4();
    const channel = this.inferChannel(req);
    const context: RequestContext = {
      actorUserId: null,
      tenantGroupId: (req.headers['x-tenant-group-id'] as string) ?? null,
      channel,
      requestId,
      ip: req.ip ?? req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
    };
    req[REQUEST_CONTEXT_KEY] = context;
    next();
  }

  private inferChannel(req: Request): AuditChannel {
    const source = req.headers['x-audit-channel'] as string;
    if (source) {
      const upper = source.toUpperCase().replace(/-/g, '_');
      if (['WEB', 'MOBILE_APP', 'ADMIN_PORTAL', 'SYSTEM', 'SMS_WEBHOOK'].includes(upper)) {
        return upper as AuditChannel;
      }
    }
    return AuditChannel.WEB;
  }
}
