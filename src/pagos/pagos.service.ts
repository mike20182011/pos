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
  if (!proveedorId) throw new Error('proveedorId es requerido'); // opcional para debug
  return this.prisma.pagoProveedor.findMany({
    where: { proveedorId: proveedorId }, // o simplemente { proveedorId }
    orderBy: { fecha: 'desc' },
  });
}

async obtenerTodosLosPagos() {
  const pagos = await this.prisma.pagoProveedor.findMany({
    orderBy: { fecha: 'desc' },
    include: {
      proveedor: {
        select: { nombre: true },
      },
    },
  });

  // Aplana el resultado para que sea más fácil en el frontend
  return pagos.map(p => ({
    id: p.id,
    fecha: p.fecha,
    monto: p.monto,
    moneda: p.moneda,
    observacion: p.observacion,
    proveedorId: p.proveedorId,
    proveedorNombre: p.proveedor?.nombre ?? '---',
  }));
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

//funcion para devolver todos los proveedorres con su
async obtenerBalanceGeneralTodosProveedores() {
  // 1️⃣ Obtener todos los proveedores
  const proveedores = await this.prisma.proveedor.findMany({
    select: { id: true, nombre: true },
  });

  // 2️⃣ Procesar cada proveedor
  const balances = await Promise.all(
    proveedores.map(async (prov) => {
      // 🟢 COMPRAS ABIERTAS
      const comprasAbiertas = await this.prisma.compraAbierta.findMany({
        where: { proveedorId: prov.id },
        include: { cierres: true },
      });

      const comprasUSD = comprasAbiertas.filter(c => c.moneda === 'USD');
      const comprasBOB = comprasAbiertas.filter(c => c.moneda === 'BOB');

      const deudaComprasUSD = comprasUSD.reduce((acc, c) => acc + (c.montoTotal ?? 0), 0);
      const deudaComprasBOB = comprasBOB.reduce((acc, c) => acc + (c.montoBOB ?? 0), 0);

      const deudaCierresUSD = comprasUSD.reduce(
        (acc, c) => acc + c.cierres.reduce((sum, cierre) => sum + (cierre.montoCierre ?? 0), 0),
        0
      );
      const deudaCierresBOB = comprasBOB.reduce(
        (acc, c) => acc + c.cierres.reduce((sum, cierre) => sum + (cierre.precioCierreBOB ?? 0), 0),
        0
      );

      // 🟢 COMPRAS CERRADAS
      const comprasCerradas = await this.prisma.compra.findMany({
        where: { proveedorId: prov.id },
      });

      const deudaCompraCerradaUSD = comprasCerradas
        .filter(c => c.moneda === 'USD')
        .reduce((acc, c) => acc + (c.montoUSD ?? 0), 0);

      const deudaCompraCerradaBOB = comprasCerradas
        .filter(c => c.moneda === 'BOB')
        .reduce((acc, c) => acc + (c.montoBOB ?? 0), 0);

      // 🟢 SUMAR TODO
      const deudaTotalUSD = deudaComprasUSD + deudaCierresUSD + deudaCompraCerradaUSD;
      const deudaTotalBOB = deudaComprasBOB + deudaCierresBOB + deudaCompraCerradaBOB;

      // 🟢 PAGOS
      const pagos = await this.prisma.pagoProveedor.findMany({
        where: { proveedorId: prov.id },
      });

      const pagosUSD = pagos.filter(p => p.moneda === 'USD').reduce((acc, p) => acc + p.monto, 0);
      const pagosBOB = pagos.filter(p => p.moneda === 'BOB').reduce((acc, p) => acc + p.monto, 0);

      return {
        proveedorId: prov.id,
        nombre: prov.nombre,

        // saldos finales
        saldoUSD: deudaTotalUSD - pagosUSD,
        saldoBOB: deudaTotalBOB - pagosBOB,

        // desglose de deudas
        deudaComprasUSD,
        deudaComprasBOB,
        deudaCierresUSD,
        deudaCierresBOB,
        deudaCompraCerradaUSD,
        deudaCompraCerradaBOB,

        // totales
        deudaTotalUSD,
        deudaTotalBOB,

        // pagos
        pagosTotalUSD: pagosUSD,
        pagosTotalBOB: pagosBOB,
      };
    })
  );

  return balances;
}


// pagos.service.ts
async obtenerBalanceProveedor2(proveedorId: number) {
  const balances = await this.obtenerBalanceGeneralTodosProveedores(); // reutilizas tu función existente
  return balances.find(b => b.proveedorId === proveedorId);
}


}
