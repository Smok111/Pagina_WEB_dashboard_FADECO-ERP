import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from './prisma.service';

const prismaClient = new PrismaClient();

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useValue: prismaClient,
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule implements OnApplicationShutdown {
  async onApplicationShutdown() {
    await prismaClient.$disconnect();
  }
}
