import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { truncarDosDecimales } from 'src/utils/number.utils';

@Injectable()
export class PagosService {
  constructor(private prisma: PrismaService) {}

  async registrarPago(dto: CreatePagoDto) {
    // Verificar que el proveedor existe
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id: dto.proveedorId },
    });

    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    // Registrar el pago
    return this.prisma.pagoProveedor.create({
      data: {
        proveedorId: dto.proveedorId,
        monto: dto.monto,
        moneda: dto.moneda,
        observacion: dto.observacion,
      },
    });
  }

  async obtenerPagosProveedor(proveedorId: number) {
    return this.prisma.pagoProveedor.findMany({
      where: { proveedorId },
      orderBy: { fecha: 'desc' },
    });
  }

  async obtenerBalanceProveedor(proveedorId: number) {
  // Total deuda por compras activas
  const compras = await this.prisma.compraAbierta.findMany({
    where: { proveedorId },
    include: { cierres: true }, // 👈 traemos los cierres asociados
  });

  // Deuda por compras (montoTotal de las compras abiertas)
  const deudaCompras = compras.reduce(
    (acc, c) => acc + (c.montoTotal ?? 0),
    0,
  );

  // Deuda por cierres (sumar los montos de cada cierre)
  const deudaCierres = compras.reduce((acc, c) => {
    return (
      acc +
      c.cierres.reduce((sumCierre, cierre) => sumCierre + (cierre.montoCierre ?? 0), 0)
    );
  }, 0);

  // Total deuda = compras + cierres
  const deudaTotal = deudaCompras + deudaCierres;

  // Total de pagos registrados
  const pagos = await this.prisma.pagoProveedor.findMany({
    where: { proveedorId },
  });

  const pagosTotal = pagos.reduce((acc, p) => acc + p.monto, 0);

  return {
    proveedorId,
    deudaCompras,
    deudaCierres,
    deudaTotal,
    pagosTotal,
    saldoPendiente: deudaTotal - pagosTotal,
  };
}


// pagos en general de compras abiertas
async obtenerBalanceGeneralProveedor(proveedorId: number) {
  // 1️⃣ Obtener todas las compras de ese proveedor
  const compras = await this.prisma.compraAbierta.findMany({
    where: { proveedorId },
    include: { cierres: true },
  });

  // 2️⃣ Sumar montos de compras
  const deudaCompras = compras.reduce(
    (acc, c) => acc + (c.montoTotal ?? 0),
    0,
  );

  // 3️⃣ Sumar montos de cierres (de todas las compras de este proveedor)
  const deudaCierres = compras.reduce((acc, c) => {
    const totalCierres = c.cierres.reduce((suma, cierre) => suma + (cierre.montoCierre ?? 0), 0);
    return acc + totalCierres;
  }, 0);

  // 4️⃣ Total deuda = compras + cierres
  const deudaTotal = truncarDosDecimales(deudaCompras + deudaCierres);

  // 5️⃣ Pagos hechos al proveedor
  const pagos = await this.prisma.pagoProveedor.findMany({
    where: { proveedorId },
  });

  const pagosTotal = pagos.reduce((acc, p) => acc + p.monto, 0);

  // 6️⃣ Resultado final
  return {
    proveedorId,
    deudaCompras: truncarDosDecimales(deudaCompras),
    deudaCierres: truncarDosDecimales(deudaCierres),
    deudaTotal,
    pagosTotal: truncarDosDecimales(pagosTotal),
    saldoPendiente: truncarDosDecimales(deudaTotal - pagosTotal),
  };
}


}
