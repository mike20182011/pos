import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CompraModule } from './compras/compra.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { ComprasAbiertasModule } from './compras-abiertas/compras-abiertas.module';
import { PagosModule } from './pagos/pagos.module';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule,AuthModule, CompraModule,ProveedorModule, ComprasAbiertasModule, PagosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
