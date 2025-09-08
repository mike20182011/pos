import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Compra, Barra, PagoCompra, TipoCompra, Moneda, Prisma } from '@prisma/client';
import { truncarDosDecimales } from 'src/utils/number.utils';

@Injectable()
export class CompraService {
  constructor(private readonly prisma: PrismaService) {}

  async crearCompraCerrada(data: {
    fecha?: Date | string;
    moneda: 'USD' | 'BOB';
    descuento?: number;
    tipoCambio?: number;
    precioUnit: number;
    usuarioId: number;
    proveedorId: number;
    barras: {
      pesoGr: number;
      purezaArriba: number;
      purezaAbajo: number;
      purezaDerecha: number;
      purezaIzquierda: number;
    }[];
  }): Promise<Compra & { barras: Barra[] }> {
    try {
      // 1️⃣ Validar usuario y proveedor
      const usuario = await this.prisma.usuario.findUnique({ where: { id: data.usuarioId } });
      if (!usuario) throw new BadRequestException('Usuario no encontrado');

      const proveedor = await this.prisma.proveedor.findUnique({ where: { id: data.proveedorId } });
      if (!proveedor) throw new BadRequestException('Proveedor no encontrado');

      // 2️⃣ Validaciones según moneda
      if (data.moneda === 'USD') {
        if (data.descuento == null) throw new BadRequestException('El campo "descuento" es obligatorio en USD');
        if (data.descuento <= 0) throw new BadRequestException('El "descuento" debe ser mayor a 0');
        if (data.tipoCambio != null) throw new BadRequestException('No se puede especificar tipoCambio en USD');
      }

      if (data.moneda === 'BOB') {
        if (data.tipoCambio == null) throw new BadRequestException('El campo "tipoCambio" es obligatorio en BOB');
        if (data.tipoCambio <= 0) throw new BadRequestException('El "tipoCambio" debe ser mayor a 0');
        if (data.descuento != null) throw new BadRequestException('No se puede especificar descuento en BOB');
      }

      // 3️⃣ Preparar barras y calcular onzas totales
      let totalOnzas = 0;

      const barrasCreate: Prisma.BarraCreateWithoutCompraInput[] = data.barras.map((b) => {
        const purezaFinal = truncarDosDecimales(
          (b.purezaArriba + b.purezaAbajo + b.purezaDerecha + b.purezaIzquierda) / 4,
        );

        const pesoFino = truncarDosDecimales(purezaFinal * b.pesoGr);
        const onzas = truncarDosDecimales(pesoFino / 31.1035);
        const montoTotal = truncarDosDecimales(onzas * data.precioUnit);

        totalOnzas += onzas;

        return {
          pesoGr: truncarDosDecimales(b.pesoGr),
          purezaArriba: truncarDosDecimales(b.purezaArriba),
          purezaAbajo: truncarDosDecimales(b.purezaAbajo),
          purezaDerecha: truncarDosDecimales(b.purezaDerecha),
          purezaIzquierda: truncarDosDecimales(b.purezaIzquierda),
          pureza: purezaFinal,
          pesoFino,
          onzas,
          precioUnit: data.precioUnit,
          montoTotal,
          tipoCompra: TipoCompra.CERRADA, // ✅ enum correcto
        };
      });

      const montoCompra = truncarDosDecimales(totalOnzas * data.precioUnit);

      // 4️⃣ Crear compra con monto en la columna correcta
      const compra = await this.prisma.compra.create({
        data: {
          fecha: data.fecha ? new Date(data.fecha) : new Date(),
          tipoCompra: TipoCompra.CERRADA, // ✅ enum correcto
          moneda: data.moneda === 'USD' ? Moneda.USD : Moneda.BOB, // ✅ enum correcto
          descuento: data.descuento ?? null,
          tipoCambio: data.tipoCambio ?? null,
          precioUnit: data.precioUnit,
          montoUSD: data.moneda === 'USD' ? montoCompra : null,
          montoBOB: data.moneda === 'BOB' ? montoCompra : null,
          usuario: { connect: { id: usuario.id } },
          proveedor: { connect: { id: proveedor.id } },
          barras: { create: barrasCreate },
        },
        include: { barras: true, proveedor: true, usuario: true },
      });

      return compra;
    } catch (error) {
      console.error(error);
      throw new Error(`Error al crear la compra: ${error.message}`);
    }
  }

  async obtenerSaldoProveedor(proveedorId: number) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id: proveedorId },
    });

    if (!proveedor) throw new BadRequestException('Proveedor no encontrado');

    const compras = await this.prisma.compra.findMany({
      where: { proveedorId },
      include: { pagos: true, barras: true },
    });

    const totalCompras = compras.reduce((sum, compra) => {
      const totalBarras = compra.barras.reduce((sumB, barra) => sumB + barra.montoTotal, 0);
      return sum + totalBarras;
    }, 0);

    const totalPagos = compras.reduce((sum, compra) => {
      const pagosCompra = compra.pagos.reduce((sumP, pago) => sumP + pago.monto, 0);
      return sum + pagosCompra;
    }, 0);

    const saldo = totalCompras - totalPagos;

    return {
      proveedor,
      saldo,
      totalCompras,
      totalPagos,
    };
  }

  async obtenerResumenComprasProveedor(proveedorId: number) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id: proveedorId },
    });

    if (!proveedor) {
      throw new BadRequestException('Proveedor no encontrado');
    }

    const compras = await this.prisma.compra.findMany({
      where: { proveedorId },
      include: {
        barras: true,
        pagos: true,
      },
      orderBy: { fecha: 'asc' },
    });

    const resumen = compras.map((c) => {
      const totalCompra = c.barras.reduce((sum, b) => sum + b.montoTotal, 0);
      const totalPagos = c.pagos.reduce((sum, p) => sum + p.monto, 0);
      const saldo = totalCompra - totalPagos;

      return {
        compraId: c.id,
        fecha: c.fecha,
        moneda: c.moneda,
        totalCompra,
        totalPagos,
        saldo,
      };
    });

    return {
      proveedor,
      resumenCompras: resumen,
    };
  }
}
