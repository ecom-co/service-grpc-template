import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

import type { SessionUser } from '@/modules/auth/services/auth-redis.service';

interface GrpcCall {
    user?: SessionUser;
}

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): SessionUser => {
    const rpcContext = ctx.switchToRpc();
    const call: GrpcCall = rpcContext.getContext();

    if (!call.user) {
        throw new Error('User not found in context');
    }

    return call.user;
});
