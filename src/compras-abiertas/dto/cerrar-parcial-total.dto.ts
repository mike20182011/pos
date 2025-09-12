export class CerrarParcialTotalDto {
  proveedorId: number;        // para saber de qué proveedor restar onzas
  onzasCerradas: number;
  precioUnitActual: number;
  descuento?: number;
  tipoCambio?: number;        // requerido si la moneda es BOB
}
