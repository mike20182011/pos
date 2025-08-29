/*
  Warnings:

  - Added the required column `onzas` to the `Barra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pesoFino` to the `Barra` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Barra" ADD COLUMN     "onzas" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "pesoFino" DOUBLE PRECISION NOT NULL;
