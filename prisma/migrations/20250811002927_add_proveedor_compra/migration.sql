-- CreateTable
CREATE TABLE "public"."Proveedor" (
    "id" SERIAL NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "carnet" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Compra" (
    "id" SERIAL NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "fechaCompra" TIMESTAMP(3) NOT NULL,
    "cantidadBarras" INTEGER NOT NULL DEFAULT 1,
    "pesoGramos" DOUBLE PRECISION NOT NULL,
    "pureza" DOUBLE PRECISION NOT NULL,
    "pesoFino" DOUBLE PRECISION NOT NULL,
    "onzas" DOUBLE PRECISION NOT NULL,
    "tipoCambio" DOUBLE PRECISION NOT NULL,
    "precioCerrado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "precioAbierto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDolares" DOUBLE PRECISION NOT NULL,
    "totalBolivianos" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Compra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_carnet_key" ON "public"."Proveedor"("carnet");

-- AddForeignKey
ALTER TABLE "public"."Compra" ADD CONSTRAINT "Compra_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "public"."Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
