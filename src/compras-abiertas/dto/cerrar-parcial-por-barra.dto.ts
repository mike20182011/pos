import { IsNumber, IsOptional, IsDefined } from 'class-validator';

export class CerrarParcialPorBarraDto {
  @IsNumber()
  @IsDefined()
  barraId: number;

  @IsNumber()
  @IsDefined()
  precioUnitActual: number;

  @IsOptional()
  @IsNumber()
  tipoCambio?: number;

  @IsOptional()
  @IsNumber()
  descuento?: number;
}
