import { Controller, Post, Body, Get, Param, NotFoundException } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}


  @Get('balance-general-todos')
  async obtenerBalanceGeneralTodos() {
    return this.pagosService.obtenerBalanceGeneralTodosProveedores();
  }

  @Get('todos-los-pagos')
  async obtenerTodosLosPagos() {
    return this.pagosService.obtenerTodosLosPagos();
  }
  
  @Post()
  registrarPago(@Body() dto: CreatePagoDto) {
    return this.pagosService.registrarPago(dto);
  }

  // pagos.controller.ts
@Get('balance-proveedor/:id')
async getBalanceProveedor(@Param('id') id: string) {
  const balance = await this.pagosService.obtenerBalanceProveedor2(Number(id));
  if (!balance) throw new NotFoundException('Proveedor no encontrado');
  return balance;
}


  @Get(':proveedorId')
  obtenerPagos(@Param('proveedorId') proveedorId: string) {
    return this.pagosService.obtenerPagosProveedor(Number(proveedorId));
  }

  @Get('balance/:proveedorId')
  obtenerBalance(@Param('proveedorId') proveedorId: string) {
    return this.pagosService.obtenerBalanceProveedor(Number(proveedorId));
  }

  @Get('balance-general/:proveedorId')
async obtenerBalanceGeneral(@Param('proveedorId') proveedorId: string) {
  return this.pagosService.obtenerBalanceGeneralProveedor(Number(proveedorId));
}


}
