import { Controller, Post, Body, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ComprasAbiertasService } from './compras-abiertas.service';
import { CreateCompraAbiertaDto } from './dto/create-compra-abierta.dto';
import { CerrarParcialCompraAbiertaDto } from './dto/cerrar-parcial-compra-abierta.dto';
import { CerrarParcialPorBarraDto } from './dto/cerrar-parcial-por-barra.dto';
import { CerrarParcialPorBarrasDto } from './dto/cerrar-parcial-por-barras.dto';

@Controller('compras-abiertas')
export class ComprasAbiertasController {
  constructor(private readonly service: ComprasAbiertasService) {}

  @Post()
  async create(@Body() dto: CreateCompraAbiertaDto) {
    return this.service.createCompraAbierta(dto);
  }

  @Post('cerrar-parcial')
  async cerrarParcial(@Body() dto: CerrarParcialCompraAbiertaDto) {
    return this.service.cerrarParcialCompraAbierta(dto);
  }

  @Get('deuda-proveedor')
  async obtenerDeudaProveedor(@Query('proveedorId', ParseIntPipe) proveedorId: number) {
    return this.service.obtenerDeudaProveedor(proveedorId);
  }

  @Post('cerrar-por-barra')
async cerrarPorBarra(@Body() dto: CerrarParcialPorBarraDto) {
  return this.service.cerrarPorBarra(dto);
}


@Post('cerrar-barras')
async cerrarPorBarras(@Body() dto: CerrarParcialPorBarrasDto) {
  return this.service.cerrarPorBarras(dto);
}


}
