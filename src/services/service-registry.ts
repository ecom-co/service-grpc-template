import { filter } from 'lodash';

export interface GrpcServiceConfig {
    name: string;
    package: string;
    protoPath: string;
    port: number;
    enabled: boolean;
}

export class ServiceRegistry {
    private static services: GrpcServiceConfig[] = [
        {
            name: 'User Service',
            package: 'user',
            protoPath: 'src/proto/services/user.proto',
            port: 50052,
            enabled: true,
        },
    ];

    static getEnabledServices(): GrpcServiceConfig[] {
        return filter(this.services, (service) => service.enabled);
    }

    static getAllServices(): GrpcServiceConfig[] {
        return this.services;
    }

    static getServiceByName(name: string): GrpcServiceConfig | undefined {
        return this.services.find((service) => service.name === name);
    }

    static getServiceByPackage(packageName: string): GrpcServiceConfig | undefined {
        return this.services.find((service) => service.package === packageName);
    }

    static enableService(name: string): void {
        const service = this.getServiceByName(name);
        if (service) {
            service.enabled = true;
        }
    }

    static disableService(name: string): void {
        const service = this.getServiceByName(name);
        if (service) {
            service.enabled = false;
        }
    }

    static addService(config: GrpcServiceConfig): void {
        this.services.push(config);
    }
}
