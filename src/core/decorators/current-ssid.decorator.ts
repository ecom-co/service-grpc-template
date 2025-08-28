import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

interface GrpcCall {
    ssid?: string;
}

export const CurrentSsid = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
    const rpcContext = ctx.switchToRpc();
    const call: GrpcCall = rpcContext.getContext();

    if (!call.ssid) {
        throw new Error('SSID not found in context');
    }

    return call.ssid;
});
