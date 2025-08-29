import { Module } from '@nestjs/common';
import { CompraService } from './compra.service';
import { CompraController } from './compra.controller';
import { PrismaService } from '../prisma.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
   imports: [PrismaModule],
  controllers: [CompraController],
  providers: [CompraService, PrismaService],
})
export class CompraModule {}
