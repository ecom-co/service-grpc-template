import { get } from 'lodash';

import { GrpcServiceConfig } from './service-registry';

/**
 * Default service configurations
 */
export const DEFAULT_SERVICES: GrpcServiceConfig[] = [
    {
        name: 'User Service',
        package: 'user',
        protoPath: 'src/proto/services/user.proto',
        port: 50052,
        enabled: true,
    },
];

/**
 * Service port ranges
 */
export const SERVICE_PORT_RANGES = {
    USER_SERVICES: { start: 50052, end: 50060 },
};

/**
 * Get next available port for a service type
 */
export const getNextAvailablePort = (serviceType: keyof typeof SERVICE_PORT_RANGES): number => {
    const range = get(SERVICE_PORT_RANGES, serviceType);
    // In a real implementation, you would check which ports are actually in use
    return range?.start || 50051;
};
