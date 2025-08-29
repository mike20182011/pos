import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  registrarPago(@Body() dto: CreatePagoDto) {
    return this.pagosService.registrarPago(dto);
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
