-- CreateTable
CREATE TABLE "public"."CierreProveedor" (
    "id" SERIAL NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "moneda" "public"."Moneda" NOT NULL,
    "onzasCerradas" DOUBLE PRECISION NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "descuento" DOUBLE PRECISION,
    "tipoCambio" DOUBLE PRECISION,
    "montoCierreUSD" DOUBLE PRECISION,
    "montoCierreBOB" DOUBLE PRECISION,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CierreProveedor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."CierreProveedor" ADD CONSTRAINT "CierreProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "public"."Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
