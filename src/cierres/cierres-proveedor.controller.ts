// cierres-proveedor.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CerrarParcialProveedorDto, CierresProveedorService } from './cierres-proveedor.service';
import { CreateCierreProveedorDto } from './dto/create-cierre-proveedor.dto';
//import { CierresProveedorService, CerrarParcialProveedorDto } from './cierres-proveedor.service';
import { PrismaService } from '../prisma.service'; // tu servicio de Prisma
import { Prisma } from '@prisma/client';


@Controller('cierres-proveedor')
export class CierresProveedorController {
  constructor(private service: CierresProveedorService) {}

  @Get('total-onzas-proveedor')
  async getOnzasPorProveedor() {
    return this.service.obtenerOnzasPorProveedor();
  }

 @Post('cerrar-parcial')
  async cerrarParcial(@Body() createDto: CreateCierreProveedorDto) {
    return this.service.cerrarParcial(createDto);
  }

  // Obtener todos los cierres con información del proveedor
  @Get()
  async obtenerCierres() {
    return this.service.obtenerCierres();
  }
}
