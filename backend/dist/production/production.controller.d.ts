import { ProductionService } from './production.service';
export declare class ProductionController {
    private readonly productionService;
    constructor(productionService: ProductionService);
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
                imagen: string | null;
                categoriaId: number;
                unidadMedidaId: number;
                stockActual: import("@prisma/client/runtime/library").Decimal;
                stockMinimo: import("@prisma/client/runtime/library").Decimal;
                costo: import("@prisma/client/runtime/library").Decimal;
                precioVenta: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            cantidad: import("@prisma/client/runtime/library").Decimal;
            productoId: number;
            almacenId: number;
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
            imagen: string | null;
            categoriaId: number;
            unidadMedidaId: number;
            stockActual: import("@prisma/client/runtime/library").Decimal;
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
    start(id: string): Promise<{
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
    addConsumo(id: string, data: any): Promise<any>;
    finish(id: string, data: any, req: any): Promise<any>;
}
