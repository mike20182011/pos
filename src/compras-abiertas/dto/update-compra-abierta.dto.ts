// src/compras-abiertas/dto/update-compra-abierta.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCompraAbiertaDto } from './create-compra-abierta.dto';

export class UpdateCompraAbiertaDto extends PartialType(CreateCompraAbiertaDto) {}
