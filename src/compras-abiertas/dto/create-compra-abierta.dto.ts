import { IsNumber, IsOptional, Min, Max, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BarraDto {
  @IsNumber()
  pesoGr: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  purezaArriba: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  purezaAbajo: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  purezaDerecha: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  purezaIzquierda: number;
}

export class CreateCompraAbiertaDto {
  @IsNumber()
  usuarioId: number;

  @IsNumber()
  proveedorId: number;

  @IsNumber()
  precioInicial: number;

  @IsEnum(['USD', 'BOB'])
  moneda: 'USD' | 'BOB';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  descuentoPorcentaje?: number; // se recibe del front

  @IsNumber() @IsOptional() tipoCambio?: number; // solo si BOB
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BarraDto)
  barras: BarraDto[];
}
