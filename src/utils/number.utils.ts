// utils/number.utils.ts
export function truncarDosDecimales(valor: number): number {
  return Math.floor(valor * 100) / 100;
}
