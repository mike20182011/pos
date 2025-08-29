import { IsArray, IsNumber, IsOptional, ArrayNotEmpty } from 'class-validator';

export class CerrarParcialPorBarrasDto {
  @IsArray()
  @ArrayNotEmpty()
  barraIds: number[];

  @IsNumber()
  precioUnitActual: number;

  @IsOptional()
  @IsNumber()
  tipoCambio?: number;

  @IsOptional()
  @IsNumber()
  descuento?: number;
}
