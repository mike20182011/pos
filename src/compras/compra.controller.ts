import { Controller, Get, Post, Param, Body, Put, Delete, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service'; // tu servicio de Prisma
import { Prisma } from '@prisma/client';
import { CompraService } from './compra.service';

@Controller('compras')
export class CompraController {
  constructor(
    private readonly prisma: PrismaService,
  private readonly compraService: CompraService,) {}

  // 🔹 Crear una compra con sus barras

  @Post('cerrada')
async crearCompra(@Body() data: any) {
  return this.compraService.crearCompraCerrada(data);
}


  // 🔹 Obtener todas las compras
  @Get()
  async listarCompras() {
    return this.prisma.compra.findMany({
      include: {
        proveedor: true,
        usuario: true,
        barras: true,
        pagos: true,
      },
    });
  }

  // 🔹 Obtener una compra por ID
  @Get(':id')
  async obtenerCompra(@Param('id') id: string) {
    return this.prisma.compra.findUnique({
      where: { id: Number(id) },
      include: {
        proveedor: true,
        usuario: true,
        barras: true,
        pagos: true,
      },
    });
  }

  // 🔹 Actualizar una compra (ej: cambiar proveedor, moneda, etc.)
  @Put(':id')
  async actualizarCompra(@Param('id') id: string, @Body() data: Prisma.CompraUpdateInput) {
    return this.prisma.compra.update({
      where: { id: Number(id) },
      data,
      include: {
        proveedor: true,
        usuario: true,
        barras: true,
        pagos: true,
      },
    });
  }

  // 🔹 Eliminar compra
  @Delete(':id')
  async eliminarCompra(@Param('id') id: string) {
    return this.prisma.compra.delete({
      where: { id: Number(id) },
    });
  }

  // 🔹 Agregar un pago a una compra
//  @Post(':id/pagos')
//   async agregarPago(
//     @Param('id') id: string,
//     @Body() data: { fecha?: Date; monto: number; moneda: 'USD' | 'BOB'; observacion?: string },
//   ) {
//     try {
//       return await this.compraService.agregarPago(Number(id), data);
//     } catch (error) {
//       throw new BadRequestException(error.message);
//     }
//   }

  // 🔹 Obtener saldo de un proveedor
  @Get('proveedor/:id/saldo')
  async obtenerSaldoProveedor(@Param('id') id: string) {
    const proveedorId = Number(id);
    if (isNaN(proveedorId)) {
      throw new BadRequestException('ID de proveedor inválido');
    }

    return this.compraService.obtenerSaldoProveedor(proveedorId);
  }

  @Get('proveedor/:id/resumen')
async obtenerResumenProveedor(@Param('id') id: string) {
  return this.compraService.obtenerResumenComprasProveedor(Number(id));
}


}
