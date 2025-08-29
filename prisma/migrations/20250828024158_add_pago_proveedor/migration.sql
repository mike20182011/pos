-- CreateTable
CREATE TABLE "public"."PagoProveedor" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DOUBLE PRECISION NOT NULL,
    "moneda" "public"."Moneda" NOT NULL,
    "observacion" TEXT,
    "proveedorId" INTEGER NOT NULL,

    CONSTRAINT "PagoProveedor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PagoProveedor" ADD CONSTRAINT "PagoProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "public"."Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
