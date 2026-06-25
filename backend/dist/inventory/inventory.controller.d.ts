import { PrismaService } from '../prisma/prisma.service';
export declare class InventoryController {
    private prisma;
    constructor(prisma: PrismaService);
    getCategorias(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        descripcion: string | null;
        codigo: string;
        estado: boolean;
    }[]>;
    createCategoria(data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        descripcion: string | null;
        codigo: string;
        estado: boolean;
    }>;
    updateCategoria(data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        descripcion: string | null;
        codigo: string;
        estado: boolean;
    }>;
    deleteCategoria(body: any): Promise<{
        ok: boolean;
    }>;
    getUnidades(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        codigo: string;
        estado: boolean;
        codigoSistema: string | null;
    }[]>;
    createUnidad(data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        codigo: string;
        estado: boolean;
        codigoSistema: string | null;
    }>;
    updateUnidad(data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        codigo: string;
        estado: boolean;
        codigoSistema: string | null;
    }>;
    deleteUnidad(body: any): Promise<{
        ok: boolean;
    }>;
    getAlmacenes(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        codigo: string;
        estado: boolean;
        codigoSistema: string | null;
        ubicacion: string | null;
        responsable: string | null;
    }[]>;
    getAlmacen(id: string): Promise<({
        stocks: ({
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
            stockActual: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        codigo: string;
        estado: boolean;
        codigoSistema: string | null;
        ubicacion: string | null;
        responsable: string | null;
    }) | null>;
    createAlmacen(data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        codigo: string;
        estado: boolean;
        codigoSistema: string | null;
        ubicacion: string | null;
        responsable: string | null;
    }>;
    updateAlmacen(data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        codigo: string;
        estado: boolean;
        codigoSistema: string | null;
        ubicacion: string | null;
        responsable: string | null;
    }>;
    deleteAlmacen(body: any): Promise<{
        ok: boolean;
    }>;
    getProductos(): Promise<({
        categoria: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            nombre: string;
            descripcion: string | null;
            codigo: string;
            estado: boolean;
        };
        unidadMedida: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            nombre: string;
            codigo: string;
            estado: boolean;
            codigoSistema: string | null;
        };
    } & {
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
    })[]>;
    createProducto(data: any): Promise<{
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
    }>;
    getKardex(id: string): Promise<{
        cantidad: number;
        saldo: number;
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
        id: number;
        productoId: number;
        almacenId: number;
        fecha: Date;
        tipo: string;
        observacion: string | null;
    }[]>;
    importProductos(data: any[]): Promise<{
        ok: boolean;
        count: number;
    }>;
    updateProducto(data: any): Promise<{
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
    }>;
    deleteProducto(body: any): Promise<{
        ok: boolean;
    }>;
    patchProducto(id: string, body: any): Promise<{
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
    }>;
}
