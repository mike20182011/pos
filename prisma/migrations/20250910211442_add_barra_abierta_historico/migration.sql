-- CreateTable
CREATE TABLE "public"."BarraAbiertaHistorico" (
    "id" SERIAL NOT NULL,
    "barraAbiertaId" INTEGER NOT NULL,
    "onzasOriginal" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER,

    CONSTRAINT "BarraAbiertaHistorico_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."BarraAbiertaHistorico" ADD CONSTRAINT "BarraAbiertaHistorico_barraAbiertaId_fkey" FOREIGN KEY ("barraAbiertaId") REFERENCES "public"."BarraAbierta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
