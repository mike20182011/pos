import { IsNumber, IsDefined, IsOptional } from 'class-validator';

export class CerrarParcialCompraAbiertaDto {
  @IsNumber()
  @IsDefined()
  compraAbiertaId: number;


  
  
  @IsNumber()
  @IsDefined()
  onzasCerradas: number;

  // opcional, solo se requiere si la compra está en BOB
  @IsNumber()
  @IsOptional()
  tipoCambio?: number;

  // opcional, pero lo enviamos desde el body si corresponde (USD)
  @IsNumber()
  @IsOptional()
  descuento?: number;

  @IsNumber()
  @IsDefined()
  precioUnitActual: number;
}
