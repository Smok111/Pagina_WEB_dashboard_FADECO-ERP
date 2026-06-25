import { PrismaService } from '../prisma/prisma.service';
export declare class ProductionService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        lotes: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            estado: string;
            numeroLote: string;
            ordenProduccionId: number;
            fechaFabricacion: Date;
            fechaVencimiento: Date;
            responsableId: number;
        }[];
        consumos: ({
            producto: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                nombre: string;
                descripcion: string | null;
                codigo: string;
                estado: boolean;
                codigoSistema: string | null;
                stockActual: import("@prisma/client/runtime/library").Decimal;
                imagen: string | null;
                categoriaId: number;
                unidadMedidaId: number;
                stockMinimo: import("@prisma/client/runtime/library").Decimal;
                costo: import("@prisma/client/runtime/library").Decimal;
                precioVenta: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            productoId: number;
            almacenId: number;
            cantidad: import("@prisma/client/runtime/library").Decimal;
            ordenProduccionId: number;
            fechaConsumo: Date;
        })[];
        productoFinal: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            nombre: string;
            descripcion: string | null;
            codigo: string;
            estado: boolean;
            codigoSistema: string | null;
            stockActual: import("@prisma/client/runtime/library").Decimal;
            imagen: string | null;
            categoriaId: number;
            unidadMedidaId: number;
            stockMinimo: import("@prisma/client/runtime/library").Decimal;
            costo: import("@prisma/client/runtime/library").Decimal;
            precioVenta: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        estado: string;
        codigoOP: string;
        productoFinalId: number;
        cantidadEsperada: import("@prisma/client/runtime/library").Decimal;
        cantidadReal: import("@prisma/client/runtime/library").Decimal | null;
        fechaInicio: Date;
        fechaFin: Date | null;
    })[]>;
    create(data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        estado: string;
        codigoOP: string;
        productoFinalId: number;
        cantidadEsperada: import("@prisma/client/runtime/library").Decimal;
        cantidadReal: import("@prisma/client/runtime/library").Decimal | null;
        fechaInicio: Date;
        fechaFin: Date | null;
    }>;
    start(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        estado: string;
        codigoOP: string;
        productoFinalId: number;
        cantidadEsperada: import("@prisma/client/runtime/library").Decimal;
        cantidadReal: import("@prisma/client/runtime/library").Decimal | null;
        fechaInicio: Date;
        fechaFin: Date | null;
    }>;
    addConsumo(opId: number, data: any): Promise<any>;
    finish(id: number, data: any, userId: number): Promise<any>;
}
