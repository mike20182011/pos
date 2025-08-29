import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateCompraConSaldosDto {
  @IsInt()
  @IsPositive()
  proveedorId: number;

  @IsDateString()
  fechaCompra: string;

  @IsInt()
  @Min(1)
  cantidadBarras: number;

  @IsNumber()
  @IsPositive()
  pesoGramos: number;

  @IsNumber()
  @IsPositive()
  pureza: number;

  @IsNumber()
  @IsPositive()
  tipoCambio: number;

  @ValidateIf((o) => o.precioCerrado > 0)
  @IsNumber()
  @Min(0)
  precioCerrado: number;

  @ValidateIf((o) => o.precioAbierto > 0)
  @IsNumber()
  @Min(0)
  precioAbierto: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  saldosPendientesIds?: number[]; // IDs de saldos pendientes a aplicar
}
