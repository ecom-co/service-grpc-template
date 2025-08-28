/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutionContext, Injectable } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { GrpcUnauthorizedException } from '@ecom-co/grpc';

interface GrpcCall {
    internalRepr?: {
        get: (key: string) => string[] | undefined;
    };
    ssid?: string;
    user?: any;
}

@Injectable()
export class GrpcRefreshTokenGuard extends AuthGuard('refresh-token') {
    canActivate(context: ExecutionContext) {
        const rpcContext = context.switchToRpc();
        const call: GrpcCall = rpcContext.getContext();

        const authHeader = call.internalRepr?.get('authorization')?.[0];

        const fakeRequest = {
            headers: {
                authorization: authHeader || '',
            } as Record<string, string>,
            metadata: call,
        };

        (context as any).grpcCall = call;

        const modifiedContext = {
            ...context,
            switchToHttp: () => ({
                getRequest: () => fakeRequest,
                getResponse: () => ({}),
            }),
        };

        return super.canActivate(modifiedContext as ExecutionContext);
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        if (err || !user) {
            throw err || new GrpcUnauthorizedException('Invalid refresh token');
        }

        const call: GrpcCall = (context as any).grpcCall;

        call.user = user;
        call.ssid = user.ssid; // Set SSID from user object

        return user;
    }
}
