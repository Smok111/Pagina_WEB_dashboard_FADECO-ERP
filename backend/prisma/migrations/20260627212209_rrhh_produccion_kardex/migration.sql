-- AlterTable
ALTER TABLE "Auditoria" ADD COLUMN     "ip" TEXT;

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "igv" DECIMAL(65,30) NOT NULL DEFAULT 18.0,
ADD COLUMN     "moneda" TEXT NOT NULL DEFAULT 'PEN';

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "imagen" TEXT;

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "nombres" TEXT,
    "apellidos" TEXT,
    "razonSocial" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "correo" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" SERIAL NOT NULL,
    "codigoSistema" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipoDocumento" TEXT NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'COMPLETADA',
    "observacion" TEXT,
    "archivoAdjunto" TEXT,
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "igv" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "clienteId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleVenta" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "precioUnitario" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "DetalleVenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenProduccion" (
    "id" SERIAL NOT NULL,
    "codigoOP" TEXT NOT NULL,
    "productoFinalId" INTEGER NOT NULL,
    "cantidadEsperada" DECIMAL(65,30) NOT NULL,
    "cantidadReal" DECIMAL(65,30),
    "cantidadPendiente" DECIMAL(65,30) DEFAULT 0,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "destino" TEXT DEFAULT 'STOCK',
    "observaciones" TEXT,
    "areaProduccionId" INTEGER,
    "responsableId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdenProduccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsumoMateriaPrima" (
    "id" SERIAL NOT NULL,
    "ordenProduccionId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "almacenId" INTEGER NOT NULL,
    "fechaConsumo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsumoMateriaPrima_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lote" (
    "id" SERIAL NOT NULL,
    "numeroLote" TEXT NOT NULL,
    "ordenProduccionId" INTEGER NOT NULL,
    "fechaFabricacion" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "responsableId" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipo" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'OPERATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MantenimientoEquipo" (
    "id" SERIAL NOT NULL,
    "equipoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "fechaProgramada" TIMESTAMP(3) NOT NULL,
    "fechaRealizacion" TIMESTAMP(3),
    "costo" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "detalles" TEXT,
    "archivoAdjunto" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PROGRAMADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MantenimientoEquipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cargo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Cargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trabajador" (
    "id" SERIAL NOT NULL,
    "codigoInterno" TEXT,
    "dni" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "telefono" TEXT,
    "correo" TEXT,
    "direccion" TEXT,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "areaId" INTEGER NOT NULL,
    "cargoId" INTEGER NOT NULL,
    "salarioBase" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "usuarioId" INTEGER,
    "areaProduccionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trabajador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asistencia" (
    "id" SERIAL NOT NULL,
    "trabajadorId" INTEGER NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entrada" TIMESTAMP(3),
    "salida" TIMESTAMP(3),
    "horasTrabajadas" DECIMAL(65,30),

    CONSTRAINT "Asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vacaciones" (
    "id" SERIAL NOT NULL,
    "trabajadorId" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "diasTomados" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'APROBADO',

    CONSTRAINT "Vacaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Caja" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "saldo" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tipo" TEXT NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Caja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoCaja" (
    "id" SERIAL NOT NULL,
    "cajaId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "concepto" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    "comprobante" TEXT,

    CONSTRAINT "MovimientoCaja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AreaProduccion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AreaProduccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenProduccionTrabajador" (
    "ordenProduccionId" INTEGER NOT NULL,
    "trabajadorId" INTEGER NOT NULL,
    "asignadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrdenProduccionTrabajador_pkey" PRIMARY KEY ("ordenProduccionId","trabajadorId")
);

-- CreateTable
CREATE TABLE "KardexProduccion" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ordenProduccionId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "trabajadorId" INTEGER NOT NULL,
    "cantidadProgramada" DECIMAL(65,30) NOT NULL,
    "cantidadFabricada" DECIMAL(65,30) NOT NULL,
    "horasTrabajadas" DECIMAL(65,30),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KardexProduccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstadoProduccion" (
    "id" SERIAL NOT NULL,
    "ordenProduccionId" INTEGER NOT NULL,
    "estadoAnterior" TEXT,
    "estadoNuevo" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstadoProduccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlCalidad" (
    "id" SERIAL NOT NULL,
    "ordenProduccionId" INTEGER NOT NULL,
    "resultado" TEXT NOT NULL,
    "observaciones" TEXT,
    "inspectorId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ControlCalidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidenciaProduccion" (
    "id" SERIAL NOT NULL,
    "ordenProduccionId" INTEGER NOT NULL,
    "trabajadorId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidenciaProduccion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_numeroDocumento_key" ON "Cliente"("numeroDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "Venta_codigoSistema_key" ON "Venta"("codigoSistema");

-- CreateIndex
CREATE UNIQUE INDEX "OrdenProduccion_codigoOP_key" ON "OrdenProduccion"("codigoOP");

-- CreateIndex
CREATE UNIQUE INDEX "Lote_numeroLote_key" ON "Lote"("numeroLote");

-- CreateIndex
CREATE UNIQUE INDEX "Equipo_codigo_key" ON "Equipo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Area_nombre_key" ON "Area"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Cargo_nombre_key" ON "Cargo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Trabajador_codigoInterno_key" ON "Trabajador"("codigoInterno");

-- CreateIndex
CREATE UNIQUE INDEX "Trabajador_dni_key" ON "Trabajador"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Trabajador_usuarioId_key" ON "Trabajador"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Caja_nombre_key" ON "Caja"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "AreaProduccion_nombre_key" ON "AreaProduccion"("nombre");

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleVenta" ADD CONSTRAINT "DetalleVenta_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleVenta" ADD CONSTRAINT "DetalleVenta_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenProduccion" ADD CONSTRAINT "OrdenProduccion_productoFinalId_fkey" FOREIGN KEY ("productoFinalId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenProduccion" ADD CONSTRAINT "OrdenProduccion_areaProduccionId_fkey" FOREIGN KEY ("areaProduccionId") REFERENCES "AreaProduccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenProduccion" ADD CONSTRAINT "OrdenProduccion_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Trabajador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumoMateriaPrima" ADD CONSTRAINT "ConsumoMateriaPrima_ordenProduccionId_fkey" FOREIGN KEY ("ordenProduccionId") REFERENCES "OrdenProduccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumoMateriaPrima" ADD CONSTRAINT "ConsumoMateriaPrima_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumoMateriaPrima" ADD CONSTRAINT "ConsumoMateriaPrima_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_ordenProduccionId_fkey" FOREIGN KEY ("ordenProduccionId") REFERENCES "OrdenProduccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MantenimientoEquipo" ADD CONSTRAINT "MantenimientoEquipo_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trabajador" ADD CONSTRAINT "Trabajador_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trabajador" ADD CONSTRAINT "Trabajador_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trabajador" ADD CONSTRAINT "Trabajador_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trabajador" ADD CONSTRAINT "Trabajador_areaProduccionId_fkey" FOREIGN KEY ("areaProduccionId") REFERENCES "AreaProduccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vacaciones" ADD CONSTRAINT "Vacaciones_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_cajaId_fkey" FOREIGN KEY ("cajaId") REFERENCES "Caja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenProduccionTrabajador" ADD CONSTRAINT "OrdenProduccionTrabajador_ordenProduccionId_fkey" FOREIGN KEY ("ordenProduccionId") REFERENCES "OrdenProduccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenProduccionTrabajador" ADD CONSTRAINT "OrdenProduccionTrabajador_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KardexProduccion" ADD CONSTRAINT "KardexProduccion_ordenProduccionId_fkey" FOREIGN KEY ("ordenProduccionId") REFERENCES "OrdenProduccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KardexProduccion" ADD CONSTRAINT "KardexProduccion_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KardexProduccion" ADD CONSTRAINT "KardexProduccion_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstadoProduccion" ADD CONSTRAINT "EstadoProduccion_ordenProduccionId_fkey" FOREIGN KEY ("ordenProduccionId") REFERENCES "OrdenProduccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstadoProduccion" ADD CONSTRAINT "EstadoProduccion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlCalidad" ADD CONSTRAINT "ControlCalidad_ordenProduccionId_fkey" FOREIGN KEY ("ordenProduccionId") REFERENCES "OrdenProduccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlCalidad" ADD CONSTRAINT "ControlCalidad_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidenciaProduccion" ADD CONSTRAINT "IncidenciaProduccion_ordenProduccionId_fkey" FOREIGN KEY ("ordenProduccionId") REFERENCES "OrdenProduccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidenciaProduccion" ADD CONSTRAINT "IncidenciaProduccion_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
