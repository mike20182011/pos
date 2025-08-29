/*
  Warnings:

  - Added the required column `purezaAbajo` to the `Barra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purezaArriba` to the `Barra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purezaDerecha` to the `Barra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purezaIzquierda` to the `Barra` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Barra" ADD COLUMN     "purezaAbajo" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "purezaArriba" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "purezaDerecha" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "purezaIzquierda" DOUBLE PRECISION NOT NULL;
