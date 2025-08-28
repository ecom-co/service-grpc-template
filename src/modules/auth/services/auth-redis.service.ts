import { Injectable } from '@nestjs/common';

import { isEmpty, map, replace } from 'lodash';

import { User } from '@ecom-co/orm';
import { InjectRedisFacade, RedisFacade } from '@ecom-co/redis';

export interface SessionUser extends Partial<User> {
    email: string;
    id: string;
    ssid?: string;
}

export const AuthRedisKey = {
    authUser: (userId: string) => `auth:user:${userId}`,
    sessionUser: (ssid: string) => `session:user:${ssid}`,
};

export interface SaveUserSessionParams<TMeta extends object = Record<string, unknown>> {
    ssid: string;
    ttlSeconds: number;
    userId: string;
    value: SessionValue<TMeta>;
}

export interface SessionValue<TMeta extends object = Record<string, unknown>> extends Record<string, unknown> {
    accessJti: string;
    meta?: TMeta;
    refreshJti: string;
    user: SessionUser;
}

@Injectable()
export class AuthRedisService {
    constructor(@InjectRedisFacade() private readonly redis: RedisFacade) {}

    async addUserSsid(userId: string, ssid: string): Promise<void> {
        await this.redis.sadd(AuthRedisKey.authUser(userId), ssid);
    }

    async saveUserSession<TMeta extends object = Record<string, unknown>>(
        params: SaveUserSessionParams<TMeta>,
    ): Promise<void> {
        await Promise.all([
            this.setSession(params.ssid, params.value, params.ttlSeconds),
            this.addUserSsid(params.userId, params.ssid),
        ]);
    }

    async getActiveSessionsCount(userId: string): Promise<number> {
        return await this.redis.scard(AuthRedisKey.authUser(userId));
    }

    async getSession(ssid: string): Promise<null | SessionValue> {
        return await this.redis.getJson<SessionValue>(AuthRedisKey.sessionUser(ssid));
    }

    async getUserSessions(userId: string): Promise<string[]> {
        return await this.redis.smembers(AuthRedisKey.authUser(userId));
    }

    async setSession<TMeta extends object = Record<string, unknown>>(
        ssid: string,
        value: SessionValue<TMeta>,
        ttlSeconds: number,
    ): Promise<void> {
        await this.redis.set(AuthRedisKey.sessionUser(ssid), value, { ttlSeconds });
    }

    async deleteSession(ssid: string): Promise<void> {
        await this.redis.del(AuthRedisKey.sessionUser(ssid));
    }

    async removeUserSsid(userId: string, ssid: string): Promise<void> {
        await this.redis.srem(AuthRedisKey.authUser(userId), ssid);
    }

    async cleanupExpiredSessions(): Promise<number> {
        // This is a cleanup utility that can be run periodically
        const pattern = AuthRedisKey.sessionUser('*');
        const keys = await this.redis.keys(pattern);
        let cleanedCount = 0;

        for (const key of keys) {
            const session = await this.redis.getJson<SessionValue>(key);

            if (!session) {
                await this.redis.del(key);
                cleanedCount++;
            }
        }

        return cleanedCount;
    }

    async isSessionValid(ssid: string): Promise<boolean> {
        const session = await this.getSession(ssid);

        return session !== null;
    }

    // Auth-specific operations
    async logout(userId: string, ssid: string): Promise<void> {
        await Promise.all([this.deleteSession(ssid), this.removeUserSsid(userId, ssid)]);
    }

    async revokeAllSessionsForUser(userId: string): Promise<string[]> {
        const ssids = await this.getUserSessions(userId);

        if (isEmpty(ssids)) return [];

        await Promise.all([
            ...map(ssids, (ssid) => this.deleteSession(ssid)),
            this.redis.del(AuthRedisKey.authUser(userId)),
        ]);

        return ssids;
    }

    async revokeSessionByJti(jti: string): Promise<null | string> {
        // This would require additional indexing or scanning
        // For now, we'll implement a simple approach
        // In production, consider using a separate index: jti -> ssid
        const pattern = AuthRedisKey.sessionUser('*');
        const keys = await this.redis.keys(pattern);

        for (const key of keys) {
            const session = await this.redis.getJson<SessionValue>(key);

            if (session && (session.accessJti === jti || session.refreshJti === jti)) {
                const ssid = replace(key, AuthRedisKey.sessionUser(''), '');

                await this.deleteSession(ssid);

                return ssid;
            }
        }

        return null;
    }
}
