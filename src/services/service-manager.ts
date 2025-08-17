import { Injectable, Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { forEach } from 'lodash';
import { join } from 'path';

import { GrpcServiceConfig, ServiceRegistry } from './service-registry';

@Injectable()
export class ServiceManager {
    private readonly logger = new Logger(ServiceManager.name);

    /**
     * Get microservice options for a specific service
     */
    getMicroserviceOptions(service: GrpcServiceConfig): MicroserviceOptions {
        const protoPath = join(process.cwd(), service.protoPath);

        return {
            transport: Transport.GRPC,
            options: {
                package: service.package,
                protoPath,
                url: `0.0.0.0:${service.port}`,
            },
        };
    }

    /**
     * Get all enabled services
     */
    getEnabledServices(): GrpcServiceConfig[] {
        return ServiceRegistry.getEnabledServices();
    }

    /**
     * Get all services (enabled and disabled)
     */
    getAllServices(): GrpcServiceConfig[] {
        return ServiceRegistry.getAllServices();
    }

    /**
     * Enable a service
     */
    enableService(name: string): void {
        ServiceRegistry.enableService(name);
        this.logger.log(`Service "${name}" enabled`);
    }

    /**
     * Disable a service
     */
    disableService(name: string): void {
        ServiceRegistry.disableService(name);
        this.logger.log(`Service "${name}" disabled`);
    }

    /**
     * Add a new service
     */
    addService(config: GrpcServiceConfig): void {
        ServiceRegistry.addService(config);
        this.logger.log(`Service "${config.name}" added`);
    }

    /**
     * Get service by name
     */
    getServiceByName(name: string): GrpcServiceConfig | undefined {
        return ServiceRegistry.getServiceByName(name);
    }

    /**
     * Get service by package name
     */
    getServiceByPackage(packageName: string): GrpcServiceConfig | undefined {
        return ServiceRegistry.getServiceByPackage(packageName);
    }

    /**
     * Log all services status
     */
    logServicesStatus(): void {
        const allServices = this.getAllServices();
        const enabledServices = this.getEnabledServices();

        this.logger.log('=== Services Status ===');
        forEach(allServices, (service) => {
            const status = service.enabled ? '✅ Enabled' : '❌ Disabled';
            this.logger.log(`${service.name} (${service.package}): ${status} - Port ${service.port}`);
        });
        this.logger.log(`Total: ${allServices.length} services, ${enabledServices.length} enabled`);
    }
}
