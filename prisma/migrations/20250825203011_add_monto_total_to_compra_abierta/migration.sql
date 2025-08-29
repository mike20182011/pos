/*
  Warnings:

  - Added the required column `montoTotal` to the `CompraAbierta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."CompraAbierta" ADD COLUMN     "montoTotal" DOUBLE PRECISION NOT NULL;
