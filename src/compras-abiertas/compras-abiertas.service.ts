// src/compras-abiertas/compras-abiertas.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCompraAbiertaDto } from './dto/create-compra-abierta.dto';
import { CerrarParcialCompraAbiertaDto } from './dto/cerrar-parcial-compra-abierta.dto';
import { truncarDosDecimales } from 'src/utils/number.utils';
import { CerrarParcialPorBarraDto } from './dto/cerrar-parcial-por-barra.dto';
import { CerrarParcialPorBarrasDto } from './dto/cerrar-parcial-por-barras.dto';


@Injectable()
export class ComprasAbiertasService {
  constructor(private prisma: PrismaService) {}


  async findAll() {
  return this.prisma.compraAbierta.findMany({
    include: {
      barras: true,
      cierres: true,
      proveedor: true, // si tienes relación con proveedor
      usuario: true,   // si tienes relación con usuario
    },
  });
}


async createCompraAbierta(data: CreateCompraAbiertaDto) {
  // Calcular las barras con los campos que Prisma espera
  const barrasProcesadas = data.barras.map(b => {
  const pureza = truncarDosDecimales(
    (b.purezaArriba + b.purezaAbajo + b.purezaDerecha + b.purezaIzquierda) / 4
  );

  const pesoFino = truncarDosDecimales(b.pesoGr * pureza);
  const onzas = truncarDosDecimales(pesoFino / 31.1035);

  // Calcular monto base de la barra
  let montoBase = truncarDosDecimales(onzas * data.precioInicial);

  // Aplicar regla del 90%
  montoBase = truncarDosDecimales(montoBase * 0.9);

  // Aplicar descuento si USD
  if (data.moneda === 'USD' && data.descuentoPorcentaje) {
    montoBase = truncarDosDecimales(
      montoBase * (100 - data.descuentoPorcentaje) / 100
    );
  }

  let montoUSD: number | null = null;
  let montoBOB: number | null = null;

  if (data.moneda === 'USD') {
    montoUSD = montoBase;
  } else if (data.moneda === 'BOB') {
    if (!data.tipoCambio) {
      throw new BadRequestException('Se requiere tipoCambio para moneda BOB');
    }
    montoBOB = truncarDosDecimales(montoBase * data.tipoCambio);
  }

  return {
    pesoGr: truncarDosDecimales(b.pesoGr),
    purezaArriba: b.purezaArriba,
    purezaAbajo: b.purezaAbajo,
    purezaDerecha: b.purezaDerecha,
    purezaIzquierda: b.purezaIzquierda,
    pureza,
    pesoFino,
    onzas,
    montoUSD,
    montoBOB,
  };
});


  // Calcular onzas totales
  const onzasTotales = truncarDosDecimales(
    barrasProcesadas.reduce((acc, b) => acc + b.onzas, 0)
  );

  // Monto total inicial
  let montoTotal = truncarDosDecimales(onzasTotales * data.precioInicial);
  montoTotal = truncarDosDecimales(montoTotal * 0.9);

  // Aplicar descuento si USD
  if (data.moneda === 'USD' && data.descuentoPorcentaje) {
    montoTotal = truncarDosDecimales(
      montoTotal * (100 - data.descuentoPorcentaje) / 100
    );
  }

  // Calcular monto BOB si corresponde
  let montoBOB: number | null = null;
  if (data.moneda === 'BOB') {
    montoBOB = truncarDosDecimales(montoTotal * data.tipoCambio!);
  }

  // Guardar la compra
  return this.prisma.compraAbierta.create({
    data: {
      usuarioId: data.usuarioId,
      proveedorId: data.proveedorId,
      precioInicial: truncarDosDecimales(data.precioInicial),
      moneda: data.moneda,
      onzasTotales,
      montoTotal,
      montoBOB,
      descuento: data.moneda === 'USD' ? data.descuentoPorcentaje ?? null : null,
      tipoCambio: data.moneda === 'BOB' ? data.tipoCambio ?? null : null,
      barras: {
        create: barrasProcesadas,
      },
    },
    include: { barras: true },
  });
}



async cerrarParcialCompraAbierta(dto: CerrarParcialCompraAbiertaDto) { const { compraAbiertaId, onzasCerradas, precioUnitActual, tipoCambio, descuento } = dto;  const compra = await this.prisma.compraAbierta.findUnique({ where: { id: compraAbiertaId }, include: { cierres: true, barras: true }, }); if (!compra) throw new NotFoundException('Compra abierta no encontrada'); if (onzasCerradas > compra.onzasTotales) { throw new BadRequestException('No se pueden cerrar más onzas de las que están abiertas'); }  const { moneda } = compra;  let montoCierreUSD = truncarDosDecimales(onzasCerradas * precioUnitActual); if (moneda === 'USD' && descuento) { montoCierreUSD = truncarDosDecimales(montoCierreUSD * (100 - descuento) / 100); }  let montoCierreBOB: number | null = null; if (moneda === 'BOB') { if (!tipoCambio) throw new BadRequestException('Se requiere tipo de cambio para moneda BOB'); montoCierreBOB = truncarDosDecimales(montoCierreUSD * tipoCambio); }  await this.prisma.cierreCompraAbierta.create({ data: { compraAbiertaId, onzasCerradas: truncarDosDecimales(onzasCerradas), precioCierre: truncarDosDecimales(precioUnitActual), precioCierreBOB: montoCierreBOB, tipoCambio: tipoCambio ?? null, montoCierre: montoCierreUSD, descuento: moneda === 'USD' ? descuento ?? null : null,  }, });  const onzasRestantes = truncarDosDecimales(compra.onzasTotales - onzasCerradas);  let montoTotalRestante = truncarDosDecimales(onzasRestantes * compra.precioInicial * 0.9);  if (moneda === 'USD' && compra.descuento) { montoTotalRestante = truncarDosDecimales(montoTotalRestante * (100 - compra.descuento) / 100); } const compraActualizada = await this.prisma.compraAbierta.update({ where: { id: compraAbiertaId }, data: { onzasTotales: onzasRestantes, montoTotal: montoTotalRestante, montoBOB: moneda === 'BOB' && tipoCambio ? truncarDosDecimales(montoTotalRestante * tipoCambio) : null, }, include: { barras: true, cierres: true }, }); return compraActualizada; }




async obtenerDeudaProveedor(proveedorId: number) {
  const compras = await this.prisma.compraAbierta.findMany({
    where: { proveedorId },
    include: { cierres: true }, // 👈 incluimos los cierres
  });

  return compras.map(compra => {
    let montoPendiente: number | null = null;

    if (compra.moneda === 'USD') {
      // deuda en USD = monto abierto + cierres en USD
      const montoCierresUSD = compra.cierres.reduce(
        (acc, c) => acc + (c.montoCierre ?? 0),
        0,
      );
      montoPendiente = truncarDosDecimales(
        (compra.montoTotal ?? 0) + montoCierresUSD,
      );
    } else if (compra.moneda === 'BOB') {
      // deuda en BOB = monto abierto en BOB + cierres en BOB
      const montoCierresBOB = compra.cierres.reduce(
        (acc, c) => acc + (c.precioCierreBOB ?? 0),
        0,
      );
      montoPendiente = truncarDosDecimales(
        (compra.montoBOB ?? 0) + montoCierresBOB,
      );
    }

    return {
      compraId: compra.id,
      onzasRestantes: truncarDosDecimales(compra.onzasTotales),
      moneda: compra.moneda,
      precioInicial: truncarDosDecimales(compra.precioInicial),
      descuento: compra.descuento,
      montoPendiente,
    };
  });
}



async cerrarPorBarra(dto: CerrarParcialPorBarraDto) {
  const { barraId, precioUnitActual, tipoCambio, descuento } = dto;

  // Buscar la barra con la compra relacionada
  const barra = await this.prisma.barraAbierta.findUnique({
    where: { id: barraId },
    include: { compraAbierta: true },
  });

  if (!barra) throw new NotFoundException('Barra no encontrada');

  const compra = barra.compraAbierta;
  const { moneda, descuento: descuentoCompra, tipoCambio: tipoCambioCompra } = compra;

  // Validaciones según moneda
  if (moneda === 'BOB' && !tipoCambio && !tipoCambioCompra) {
    throw new BadRequestException('Se requiere tipoCambio para moneda BOB');
  }
  if (moneda === 'USD' && descuento === undefined) {
    throw new BadRequestException('Se requiere descuento para moneda USD');
  }

  // 👇 Tomamos las onzas directamente de la barra
  const onzasCerradas = barra.onzas;

  if (onzasCerradas <= 0) {
    throw new BadRequestException('La barra ya fue cerrada por completo');
  }

  // Calcular monto cierre
  let montoCierreUSD = truncarDosDecimales(onzasCerradas * precioUnitActual);
  if (moneda === 'USD' && descuento) {
    montoCierreUSD = truncarDosDecimales(montoCierreUSD * (100 - descuento) / 100);
  }

  let montoCierreBOB: number | null = null;
  if (moneda === 'BOB') {
    const tipo = tipoCambio || tipoCambioCompra!;
    montoCierreBOB = truncarDosDecimales(montoCierreUSD * tipo);
  }

  // Registrar cierre parcial por barra
  const cierre = await this.prisma.cierreCompraAbierta.create({
    data: {
      compraAbiertaId: compra.id,
      onzasCerradas,
      precioCierre: precioUnitActual,
      precioCierreBOB: montoCierreBOB,
      tipoCambio: moneda === 'BOB' ? tipoCambio || tipoCambioCompra : null,
      montoCierre: montoCierreUSD,
      descuento: moneda === 'USD' ? descuento : null,
    },
  });

  // Actualizar barra y compra
  await this.prisma.barraAbierta.update({
    where: { id: barra.id },
    data: { onzas: 0 }, // barra cerrada
  });

  let montoTotalRestante = truncarDosDecimales((compra.onzasTotales - onzasCerradas) * compra.precioInicial * 0.9);
  if (moneda === 'USD' && descuentoCompra) {
    montoTotalRestante = truncarDosDecimales(montoTotalRestante * (100 - descuentoCompra) / 100);
  }

  await this.prisma.compraAbierta.update({
    where: { id: compra.id },
    data: {
      onzasTotales: compra.onzasTotales - onzasCerradas,
      montoTotal: moneda === 'USD' ? montoTotalRestante : compra.montoTotal,
      montoBOB: moneda === 'BOB' ? montoCierreBOB : compra.montoBOB,
    },
  });

  return cierre;
}


//para poder cerrar multiples barras 
async cerrarPorBarras(dto: CerrarParcialPorBarrasDto) {
  const { barraIds, precioUnitActual, tipoCambio, descuento } = dto;

  // 👇 Tipamos correctamente el array
  const cierres: any[] = []; // también puedes usar Prisma.CierreCompraAbierta[] si tienes importado

  let compraActualizada: any= null;

  for (const barraId of barraIds) {
    const barra = await this.prisma.barraAbierta.findUnique({
      where: { id: barraId },
      include: { compraAbierta: true },
    });

    if (!barra) throw new NotFoundException(`Barra ${barraId} no encontrada`);

    const compra = barra.compraAbierta;
    const { moneda, descuento: descuentoCompra, tipoCambio: tipoCambioCompra } = compra;

    // Validaciones
    if (moneda === 'BOB' && !tipoCambio && !tipoCambioCompra) {
      throw new BadRequestException('Se requiere tipoCambio para moneda BOB');
    }
    if (moneda === 'USD' && descuento === undefined) {
      throw new BadRequestException('Se requiere descuento para moneda USD');
    }

    const onzasCerradas = barra.onzas;
    if (onzasCerradas <= 0) continue;

    // Calcular monto cierre
    let montoCierreUSD = truncarDosDecimales(onzasCerradas * precioUnitActual);
    if (moneda === 'USD' && descuento) {
      montoCierreUSD = truncarDosDecimales(montoCierreUSD * (100 - descuento) / 100);
    }

    let montoCierreBOB: number | null = null;
    if (moneda === 'BOB') {
      const tipo = tipoCambio || tipoCambioCompra!;
      montoCierreBOB = truncarDosDecimales(montoCierreUSD * tipo);
    }

    // Registrar cierre
    const cierre = await this.prisma.cierreCompraAbierta.create({
      data: {
        compraAbiertaId: compra.id,
        onzasCerradas,
        precioCierre: precioUnitActual,
        precioCierreBOB: montoCierreBOB,
        tipoCambio: moneda === 'BOB' ? tipoCambio || tipoCambioCompra : null,
        montoCierre: montoCierreUSD,
        descuento: moneda === 'USD' ? descuento : null,
      },
    });

    cierres.push(cierre);

    // Cerrar barra
    await this.prisma.barraAbierta.update({
      where: { id: barra.id },
      data: { onzas: 0 },
    });

    // Actualizar compra
    let montoTotalRestante = truncarDosDecimales((compra.onzasTotales - onzasCerradas) * compra.precioInicial * 0.9);
    if (moneda === 'USD' && descuentoCompra) {
      montoTotalRestante = truncarDosDecimales(montoTotalRestante * (100 - descuentoCompra) / 100);
    }

    compraActualizada = await this.prisma.compraAbierta.update({
      where: { id: compra.id },
      data: {
        onzasTotales: compra.onzasTotales - onzasCerradas,
        montoTotal: moneda === 'USD' ? montoTotalRestante : compra.montoTotal,
        montoBOB: moneda === 'BOB' ? montoCierreBOB : compra.montoBOB,
      },
      include: { barras: true, cierres: true },
    });
  }

  return {
    cierres,
    compraActualizada,
  };
}





}
