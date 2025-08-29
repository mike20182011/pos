import {
  IsNotEmpty,
  IsInt,
  IsNumber,
  IsPositive,
  IsDateString,
  Min,
  ValidateIf,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateCompraDto {
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
  purezaArriba: number;
  @IsNumber()
  @IsPositive()
  purezaAbajo: number;
  @IsNumber()
  @IsPositive()
  purezaDerecha: number;
  @IsNumber()
  @IsPositive()
  purezaIzquierda: number;

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
  estado?: 'ABIERTO' | 'CERRADO';

  @IsOptional()
  @IsDateString()
  fechaSaldoLimite?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  saldosPendientesIds?: number[]; // IDs de saldos pendientes a aplicar
}
