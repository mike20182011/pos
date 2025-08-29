import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '@prisma/client';

@Controller('proveedores')
@UseGuards(JwtAuthGuard, RolesGuard) // Protegemos todas las rutas
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @Post()
  @Roles(Rol.ADMIN) // Solo ADMIN puede crear
  create(@Body() createProveedorDto: CreateProveedorDto) {
    return this.proveedorService.create(createProveedorDto);
  }

  @Get()
  findAll() {
    return this.proveedorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proveedorService.findOne(id);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN) // Solo ADMIN puede eliminar
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.proveedorService.remove(id);
  }

  //controlador para consultar la deuda total de un proveedor
    @Get('proveedor/:id/deuda')
  async obtenerDeudaProveedor(@Param('id', ParseIntPipe) proveedorId: number) {
    return this.proveedorService.obtenerDeudaProveedor(proveedorId);
  }

}
