import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { PrismaModule } from '../../prisma/prisma.module'; 

@Module({
  imports: [PrismaModule], 
  providers: [PagosService],
  controllers: [PagosController]
})
export class PagosModule {}
