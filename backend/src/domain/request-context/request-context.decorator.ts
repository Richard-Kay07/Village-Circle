import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestContext } from './request-context.types';

/**
 * Injects the current request context from the request object.
 * Use after middleware has set req[REQUEST_CONTEXT_KEY].
 */
export const ReqContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestContext => {
    const request = ctx.switchToHttp().getRequest<Record<string, RequestContext>>();
    const context = request[REQUEST_CONTEXT_KEY];
    if (!context) {
      throw new Error('RequestContext not set on request. Ensure RequestContextMiddleware is applied.');
    }
    return context;
  },
);
