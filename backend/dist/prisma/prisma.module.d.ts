import { OnApplicationShutdown } from '@nestjs/common';
export declare class PrismaModule implements OnApplicationShutdown {
    onApplicationShutdown(): Promise<void>;
}
