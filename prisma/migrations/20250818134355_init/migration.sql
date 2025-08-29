/*
  Warnings:

  - You are about to drop the `Pago` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `rol` on the `Usuario` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."Rol" AS ENUM ('ADMIN', 'OPERADOR', 'VENDEDOR');

-- DropForeignKey
ALTER TABLE "public"."Pago" DROP CONSTRAINT "Pago_barraId_fkey";

-- AlterTable
ALTER TABLE "public"."Usuario" DROP COLUMN "rol",
ADD COLUMN     "rol" "public"."Rol" NOT NULL;

-- DropTable
DROP TABLE "public"."Pago";

-- CreateTable
CREATE TABLE "public"."PagoCompra" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DOUBLE PRECISION NOT NULL,
    "moneda" "public"."Moneda" NOT NULL,
    "observacion" TEXT,
    "compraId" INTEGER NOT NULL,

    CONSTRAINT "PagoCompra_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PagoCompra" ADD CONSTRAINT "PagoCompra_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "public"."Compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
