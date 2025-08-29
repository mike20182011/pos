-- CreateEnum
CREATE TYPE "public"."EstadoCompra" AS ENUM ('ABIERTO', 'CERRADO', 'ANULADO');

-- CreateEnum
CREATE TYPE "public"."SaldoEstado" AS ENUM ('OPEN', 'CLOSED', 'EXPIRED');

-- AlterTable
ALTER TABLE "public"."Compra" ADD COLUMN     "estado" "public"."EstadoCompra" NOT NULL DEFAULT 'ABIERTO',
ADD COLUMN     "fechaSaldoLimite" TIMESTAMP(3),
ADD COLUMN     "montoPagado" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "saldoPeso" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."SaldoPendiente" (
    "id" SERIAL NOT NULL,
    "compraId" INTEGER,
    "proveedorId" INTEGER NOT NULL,
    "saldoPeso" DOUBLE PRECISION NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLimite" TIMESTAMP(3) NOT NULL,
    "estado" "public"."SaldoEstado" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "SaldoPendiente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SaldoPago" (
    "id" SERIAL NOT NULL,
    "saldoId" INTEGER NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "precioOnza" DOUBLE PRECISION NOT NULL,
    "tipoCambio" DOUBLE PRECISION NOT NULL,
    "montoDolares" DOUBLE PRECISION NOT NULL,
    "montoBolivianos" DOUBLE PRECISION NOT NULL,
    "observacion" TEXT,

    CONSTRAINT "SaldoPago_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."SaldoPendiente" ADD CONSTRAINT "SaldoPendiente_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "public"."Compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SaldoPendiente" ADD CONSTRAINT "SaldoPendiente_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "public"."Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SaldoPago" ADD CONSTRAINT "SaldoPago_saldoId_fkey" FOREIGN KEY ("saldoId") REFERENCES "public"."SaldoPendiente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
