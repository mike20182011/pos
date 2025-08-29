import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { truncarDosDecimales } from 'src/utils/number.utils';

@Injectable()
export class ProveedorService {
  constructor(private prisma: PrismaService) {}

  // Crear un nuevo proveedor
  async create(data: CreateProveedorDto) {
    return this.prisma.proveedor.create({ data });
  }

  // Listar todos los proveedores
  async findAll() {
    return this.prisma.proveedor.findMany();
  }

  // Buscar proveedor por ID
  async findOne(id: number) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id },
    });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
    return proveedor;
  }

  // Eliminar proveedor
  async remove(id: number) {
    await this.findOne(id); // Valida que exista
    return this.prisma.proveedor.delete({ where: { id } });
  }

  //funcion para obtener la deuda con un proveedor, deuda total de compras abiertas y cerdasd y tamboen de los cierres

async obtenerDeudaProveedor(proveedorId: number) {
  // 1) Compras abiertas → usar montoTotal (USD) o montoBOB (BOB) de la compra
  const comprasAbiertas = await this.prisma.compraAbierta.findMany({
    where: { proveedorId },
    select: { moneda: true, montoTotal: true, montoBOB: true },
  });

  const deudaAbiertas = comprasAbiertas.reduce((acc, c) => {
    const totalCompra =
      c.moneda === 'BOB'
        ? (c.montoBOB ?? 0)
        : (c.montoTotal ?? 0);
    return acc + totalCompra;
  }, 0);

  // 2) Compras cerradas → seguimos sumando por barras
  const comprasCerradas = await this.prisma.compra.findMany({
    where: { proveedorId, tipoCompra: 'CERRADA' },
    include: { barras: true },
  });

  const deudaCerradas = comprasCerradas.reduce((acc, c) => {
    const totalCompra = c.barras.reduce((sum, b) => sum + (b.montoTotal ?? 0), 0);
    return acc + totalCompra;
  }, 0);

  // 3) Cierres de compras abiertas → USD usa montoCierre, BOB usa precioCierreBOB
  const cierres = await this.prisma.cierreCompraAbierta.findMany({
    where: { compraAbierta: { proveedorId } },
    include: { compraAbierta: { select: { moneda: true } } },
  });

  const deudaCierres = cierres.reduce((acc, cierre) => {
    const monto =
      cierre.compraAbierta.moneda === 'BOB'
        ? (cierre.precioCierreBOB ?? 0)
        : (cierre.montoCierre ?? 0);
    return acc + monto;
  }, 0);

  // 4) Pagos por proveedor
  const pagos = await this.prisma.pagoProveedor.findMany({
    where: { proveedorId },
  });
  const pagosTotal = pagos.reduce((acc, p) => acc + (p.monto ?? 0), 0);

  // 5) Totales
  const deudaTotal = deudaAbiertas + deudaCerradas + deudaCierres - pagosTotal;

  return {
    proveedorId,
    deudaAbiertas: truncarDosDecimales(deudaAbiertas),
    deudaCerradas: truncarDosDecimales(deudaCerradas),
    deudaCierres: truncarDosDecimales(deudaCierres),
    pagosTotal: truncarDosDecimales(pagosTotal),
    deudaTotal: truncarDosDecimales(deudaTotal),
  };
}






}
