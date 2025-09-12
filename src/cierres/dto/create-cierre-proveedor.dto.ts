import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateCierreProveedorDto {
  @IsInt()
  proveedorId: number;

  @IsEnum(['USD', 'BOB'])
  moneda: 'USD' | 'BOB';

  @IsNumber()
  @IsPositive()
  onzasCerradas: number;

  @IsNumber()
  @IsPositive()
  precioUnitario: number;

  @IsOptional()
  @IsNumber()
  descuento?: number; // Solo para USD

  @IsOptional()
  @IsNumber()
  tipoCambio?: number; // Solo para BOB
}
