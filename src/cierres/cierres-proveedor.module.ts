// cierres-proveedor.module.ts
import { Module } from '@nestjs/common';
import { CierresProveedorService } from './cierres-proveedor.service';
import { CierresProveedorController } from './cierres-proveedor.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { PrismaService } from 'prisma/prisma.service';
//import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CierresProveedorController],
  providers: [CierresProveedorService,PrismaService],
})
export class CierresProveedorModule {}
