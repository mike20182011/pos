/*
  Warnings:

  - You are about to drop the column `fechaSaldoLimite` on the `Compra` table. All the data in the column will be lost.
  - You are about to drop the column `saldoPeso` on the `Compra` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Compra" DROP COLUMN "fechaSaldoLimite",
DROP COLUMN "saldoPeso";
