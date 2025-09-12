/*
  Warnings:

  - You are about to drop the column `onzasTotales` on the `Proveedor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Proveedor" DROP COLUMN "onzasTotales",
ADD COLUMN     "onzasBOB" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "onzasUSD" DOUBLE PRECISION NOT NULL DEFAULT 0;
