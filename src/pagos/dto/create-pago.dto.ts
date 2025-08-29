import { IsNumber, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { Moneda } from '@prisma/client';

export class CreatePagoDto {
  @IsNumber()
  @IsNotEmpty()
  proveedorId: number;

  @IsNumber()
  @IsNotEmpty()
  monto: number;

  @IsEnum(Moneda)
  @IsNotEmpty()
  moneda: Moneda;

  @IsOptional()
  observacion?: string;
}
