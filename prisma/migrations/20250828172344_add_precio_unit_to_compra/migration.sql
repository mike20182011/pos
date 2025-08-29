/*
  Warnings:

  - Added the required column `precioUnit` to the `Compra` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Compra" ADD COLUMN     "precioUnit" DOUBLE PRECISION NOT NULL;
