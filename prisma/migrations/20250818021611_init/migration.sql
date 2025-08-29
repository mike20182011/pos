/*
  Warnings:

  - You are about to drop the column `cantidadBarras` on the `Compra` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Compra` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `Compra` table. All the data in the column will be lost.
  - You are about to drop the column `fechaCompra` on the `Compra` table. All the data in the column will be lost.
  - You are about to drop the column `montoPagado` on the `Compra` table. All the data in the column will be lost.
  - You are about to drop the column `onzas` on the `Compra` table. All the data in the column will be lost.
  - You are about to drop the column `pesoFino` on the `Compra` table. All the data in the column will be lost.
  - You are about to drop the column `pesoGramos` on the `Compra` table. All the data in the column will be lost.
  - You are about to drop the column `precioAbierto` on the `Compra` table. All the data in the column will be lost.
  - You are about to drop the column `precioCerrado` on the `Compra` table. All the data in the column will be lost.
  - You are about to drop the column `pureza` on the `Compra` table. All the data in the column will be lost.
  - You are about to drop the column `totalBolivianos` on the `Compra` table. All the data in the column will be lost.
  - You are about to drop the column `totalDolares` on the `Compra` table. All the data in the column will be lost.
  - You are about to drop the column `carnet` on the `Proveedor` table. All the data in the column will be lost.
  - You are about to drop the column `celular` on the `Proveedor` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Proveedor` table. All the data in the column will be lost.
  - You are about to drop the column `nombreCompleto` on the `Proveedor` table. All the data in the column will be lost.
  - You are about to drop the `SaldoPago` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SaldoPendiente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `moneda` to the `Compra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoCompra` to the `Compra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `Compra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizadoEn` to the `Proveedor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Proveedor` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TipoCompra" AS ENUM ('CERRADA', 'ABIERTA');

-- CreateEnum
CREATE TYPE "public"."Moneda" AS ENUM ('USD', 'BOB');

-- DropForeignKey
ALTER TABLE "public"."SaldoPago" DROP CONSTRAINT "SaldoPago_saldoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SaldoPendiente" DROP CONSTRAINT "SaldoPendiente_compraId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SaldoPendiente" DROP CONSTRAINT "SaldoPendiente_proveedorId_fkey";

-- DropIndex
DROP INDEX "public"."Proveedor_carnet_key";

-- AlterTable
ALTER TABLE "public"."Compra" DROP COLUMN "cantidadBarras",
DROP COLUMN "createdAt",
DROP COLUMN "estado",
DROP COLUMN "fechaCompra",
DROP COLUMN "montoPagado",
DROP COLUMN "onzas",
DROP COLUMN "pesoFino",
DROP COLUMN "pesoGramos",
DROP COLUMN "precioAbierto",
DROP COLUMN "precioCerrado",
DROP COLUMN "pureza",
DROP COLUMN "totalBolivianos",
DROP COLUMN "totalDolares",
ADD COLUMN     "descuento" DOUBLE PRECISION,
ADD COLUMN     "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "moneda" "public"."Moneda" NOT NULL,
ADD COLUMN     "tipoCompra" "public"."TipoCompra" NOT NULL,
ADD COLUMN     "usuarioId" INTEGER NOT NULL,
ALTER COLUMN "tipoCambio" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Proveedor" DROP COLUMN "carnet",
DROP COLUMN "celular",
DROP COLUMN "createdAt",
DROP COLUMN "nombreCompleto",
ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "telefono" TEXT;

-- DropTable
DROP TABLE "public"."SaldoPago";

-- DropTable
DROP TABLE "public"."SaldoPendiente";

-- DropTable
DROP TABLE "public"."User";

-- DropEnum
DROP TYPE "public"."EstadoCompra";

-- DropEnum
DROP TYPE "public"."Role";

-- DropEnum
DROP TYPE "public"."SaldoEstado";

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Barra" (
    "id" SERIAL NOT NULL,
    "pesoGr" DOUBLE PRECISION NOT NULL,
    "pureza" DOUBLE PRECISION NOT NULL,
    "precioUnit" DOUBLE PRECISION NOT NULL,
    "montoTotal" DOUBLE PRECISION NOT NULL,
    "tipoCompra" "public"."TipoCompra" NOT NULL,
    "compraId" INTEGER NOT NULL,

    CONSTRAINT "Barra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pago" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DOUBLE PRECISION NOT NULL,
    "moneda" "public"."Moneda" NOT NULL,
    "barraId" INTEGER NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "public"."Usuario"("email");

-- AddForeignKey
ALTER TABLE "public"."Compra" ADD CONSTRAINT "Compra_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Barra" ADD CONSTRAINT "Barra_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "public"."Compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pago" ADD CONSTRAINT "Pago_barraId_fkey" FOREIGN KEY ("barraId") REFERENCES "public"."Barra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
