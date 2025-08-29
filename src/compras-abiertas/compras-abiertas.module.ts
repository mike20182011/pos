// src/compras-abiertas/compras-abiertas.module.ts
import { Module } from '@nestjs/common';
import { ComprasAbiertasService } from './compras-abiertas.service';
import { ComprasAbiertasController } from './compras-abiertas.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ComprasAbiertasController],
  providers: [ComprasAbiertasService, PrismaService],
})
export class ComprasAbiertasModule {}
