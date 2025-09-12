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
  descuento?: number;

  @IsOptional()
  @IsNumber()
  tipoCambio?: number;
}
