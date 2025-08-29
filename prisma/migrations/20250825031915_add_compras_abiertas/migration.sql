-- CreateTable
CREATE TABLE "public"."CompraAbierta" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moneda" "public"."Moneda" NOT NULL,
    "descuento" DOUBLE PRECISION,
    "tipoCambio" DOUBLE PRECISION,
    "precioInicial" DOUBLE PRECISION NOT NULL,
    "onzasTotales" DOUBLE PRECISION NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "proveedorId" INTEGER NOT NULL,

    CONSTRAINT "CompraAbierta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BarraAbierta" (
    "id" SERIAL NOT NULL,
    "pesoGr" DOUBLE PRECISION NOT NULL,
    "purezaArriba" DOUBLE PRECISION NOT NULL,
    "purezaAbajo" DOUBLE PRECISION NOT NULL,
    "purezaDerecha" DOUBLE PRECISION NOT NULL,
    "purezaIzquierda" DOUBLE PRECISION NOT NULL,
    "pureza" DOUBLE PRECISION NOT NULL,
    "pesoFino" DOUBLE PRECISION NOT NULL,
    "onzas" DOUBLE PRECISION NOT NULL,
    "compraAbiertaId" INTEGER NOT NULL,

    CONSTRAINT "BarraAbierta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PagoCompraAbierta" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DOUBLE PRECISION NOT NULL,
    "moneda" "public"."Moneda" NOT NULL,
    "observacion" TEXT,
    "compraAbiertaId" INTEGER NOT NULL,

    CONSTRAINT "PagoCompraAbierta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CierreCompraAbierta" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onzasCerradas" DOUBLE PRECISION NOT NULL,
    "precioCierre" DOUBLE PRECISION NOT NULL,
    "montoCierre" DOUBLE PRECISION NOT NULL,
    "compraAbiertaId" INTEGER NOT NULL,

    CONSTRAINT "CierreCompraAbierta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."CompraAbierta" ADD CONSTRAINT "CompraAbierta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompraAbierta" ADD CONSTRAINT "CompraAbierta_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "public"."Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BarraAbierta" ADD CONSTRAINT "BarraAbierta_compraAbiertaId_fkey" FOREIGN KEY ("compraAbiertaId") REFERENCES "public"."CompraAbierta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PagoCompraAbierta" ADD CONSTRAINT "PagoCompraAbierta_compraAbiertaId_fkey" FOREIGN KEY ("compraAbiertaId") REFERENCES "public"."CompraAbierta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CierreCompraAbierta" ADD CONSTRAINT "CierreCompraAbierta_compraAbiertaId_fkey" FOREIGN KEY ("compraAbiertaId") REFERENCES "public"."CompraAbierta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
