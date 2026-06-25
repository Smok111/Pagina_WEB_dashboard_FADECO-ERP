import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getMetrics(): Promise<{
        ingresosTotales: number;
        gastosTotales: number;
        ordenesEnProceso: number;
        valorInventario: number;
        historialFinanciero: {
            name: string;
            Ingresos: number;
            Gastos: number;
        }[];
        opsPorEstado: {
            name: string;
            value: number;
            fill: string;
        }[];
        topProductos: {
            name: string;
            cantidad: number;
        }[];
        saludEquipos: {
            name: string;
            value: number;
            fill: string;
        }[];
        fuerzaLaboral: {
            name: string;
            Trabajadores: number;
        }[];
        inventarioPorCategoria: {
            name: string;
            value: number;
            fill: string;
        }[];
        alertasStock: {
            nombre: string;
            codigo: string;
            stockActual: import("@prisma/client/runtime/library").Decimal;
            stockMinimo: import("@prisma/client/runtime/library").Decimal;
        }[];
        mantenimientosPendientes: ({
            equipo: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                nombre: string;
                codigo: string;
                estado: string;
                ubicacion: string | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            estado: string;
            costo: import("@prisma/client/runtime/library").Decimal;
            tipo: string;
            archivoAdjunto: string | null;
            detalles: string | null;
            fechaProgramada: Date;
            equipoId: number;
            fechaRealizacion: Date | null;
        })[];
        movimientosRecientes: ({
            producto: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                nombre: string;
                descripcion: string | null;
                codigo: string;
                estado: boolean;
                codigoSistema: string | null;
                imagen: string | null;
                categoriaId: number;
                unidadMedidaId: number;
                stockActual: import("@prisma/client/runtime/library").Decimal;
                stockMinimo: import("@prisma/client/runtime/library").Decimal;
                costo: import("@prisma/client/runtime/library").Decimal;
                precioVenta: import("@prisma/client/runtime/library").Decimal;
            };
            almacen: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                nombre: string;
                codigo: string;
                estado: boolean;
                codigoSistema: string | null;
                ubicacion: string | null;
                responsable: string | null;
            };
        } & {
            id: number;
            fecha: Date;
            tipo: string;
            cantidad: import("@prisma/client/runtime/library").Decimal;
            observacion: string | null;
            productoId: number;
            almacenId: number;
        })[];
    }>;
}
