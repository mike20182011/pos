// cierres-proveedor.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCierreProveedorDto } from './dto/create-cierre-proveedor.dto';
//import { PrismaService } from 'prisma/prisma.service';
//import { PrismaService } from '../prisma/prisma.service';

export interface CerrarParcialProveedorDto {
  proveedorId: number;
  onzasCerradas: number;
  precioUnitActual: number;
  descuento?: number;
  tipoCambio?: number;
}

@Injectable()
export class CierresProveedorService {
  constructor(private prisma: PrismaService) {}

  // Obtener total de onzas por proveedor, diferenciando moneda
  async obtenerOnzasPorProveedor() {
    const compras = await this.prisma.compraAbierta.findMany({
      select: {
        proveedorId: true,
        onzasTotales: true,
        moneda: true,
        proveedor: { select: { id: true, nombre: true } },
      },
    });

    // Agrupar y sumar por proveedor y moneda
    const resultado = compras.reduce(
      (acc, compra) => {
        const key = `${compra.proveedorId}-${compra.moneda}`;
        if (!acc[key]) {
          acc[key] = {
            proveedorId: compra.proveedor.id,
            proveedorNombre: compra.proveedor.nombre,
            moneda: compra.moneda,
            totalOnzas: 0,
          };
        }
        acc[key].totalOnzas += compra.onzasTotales ?? 0;
        return acc;
      },
      {} as Record<string, { proveedorId: number; proveedorNombre: string; totalOnzas: number; moneda: string }>
    );

    return Object.values(resultado);
  }


    private truncarDosDecimales(value: number): number {
    return Math.floor(value * 100) / 100;
  }

  // Cerrar onzas de todas las compras abiertas de un proveedor
async cerrarParcial(createDto: CreateCierreProveedorDto) {
  const { proveedorId, onzasCerradas, precioUnitario, moneda, descuento, tipoCambio } = createDto;

  // 1️⃣ Verificar proveedor
  const proveedor = await this.prisma.proveedor.findUnique({
    where: { id: proveedorId },
  });
  if (!proveedor) throw new NotFoundException('Proveedor no encontrado');

  // 2️⃣ Verificar que hay suficientes onzas según moneda
  const onzasDisponibles = moneda === 'USD' ? proveedor.onzasUSD : proveedor.onzasBOB;
  if (onzasCerradas > onzasDisponibles)
    throw new BadRequestException('No se pueden cerrar más onzas de las disponibles');

  // 3️⃣ Calcular montos según moneda
  let montoCierreUSD: number | null = null;
  let montoCierreBOB: number | null = null;

  if (moneda === 'USD') {
    const factorDescuento = descuento ? (100 - descuento) / 100 : 1;
    montoCierreUSD = this.truncarDosDecimales(onzasCerradas * precioUnitario * factorDescuento);
  } else if (moneda === 'BOB') {
    if (!tipoCambio) throw new BadRequestException('Se requiere tipo de cambio para BOB');
    montoCierreBOB = this.truncarDosDecimales(onzasCerradas * precioUnitario * tipoCambio);
  }

  // 4️⃣ Crear registro del cierre
  const cierre = await this.prisma.cierreProveedor.create({
    data: {
      proveedorId,
      moneda,
      onzasCerradas: this.truncarDosDecimales(onzasCerradas),
      precioUnitario: this.truncarDosDecimales(precioUnitario),
      descuento: moneda === 'USD' ? descuento ?? null : null,
      tipoCambio: moneda === 'BOB' ? tipoCambio ?? null : null,
      montoCierreUSD,
      montoCierreBOB,
    },
  });

  // 5️⃣ Restar onzas cerradas del proveedor según moneda
  const updateField = moneda === 'USD'
    ? { onzasUSD: { decrement: this.truncarDosDecimales(onzasCerradas) } }
    : { onzasBOB: { decrement: this.truncarDosDecimales(onzasCerradas) } };

  await this.prisma.proveedor.update({
    where: { id: proveedorId },
    data: updateField,
  });

  return cierre;
}


  // GET para obtener todos los cierres
  async obtenerCierres() {
    return this.prisma.cierreProveedor.findMany({
      include: { proveedor: true },
      orderBy: { creadoEn: 'desc' },
    });
  }

}
