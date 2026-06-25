import { PrismaService } from '../prisma/prisma.service';
export declare class PurchasesController {
    private prisma;
    constructor(prisma: PrismaService);
    getPurchases(): Promise<({
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
        proveedor: {
            id: number;
            activo: boolean;
            createdAt: Date;
            updatedAt: Date;
            codigoSistema: string | null;
            ruc: string;
            razonSocial: string;
            direccion: string | null;
            telefono: string | null;
            correo: string | null;
            contacto: string | null;
        };
        detalles: ({
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
            subtotal: import("@prisma/client/runtime/library").Decimal;
            precioUnitario: import("@prisma/client/runtime/library").Decimal;
            compraId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        estado: string;
        codigoSistema: string | null;
        fecha: Date;
        observacion: string | null;
        almacenId: number;
        tipoDocumento: string;
        numeroDocumento: string;
        archivoAdjunto: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        igv: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        proveedorId: number;
    })[]>;
    getProveedores(): Promise<{
        id: number;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        codigoSistema: string | null;
        ruc: string;
        razonSocial: string;
        direccion: string | null;
        telefono: string | null;
        correo: string | null;
        contacto: string | null;
    }[]>;
    createProveedor(data: any): Promise<{
        id: number;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        codigoSistema: string | null;
        ruc: string;
        razonSocial: string;
        direccion: string | null;
        telefono: string | null;
        correo: string | null;
        contacto: string | null;
    }>;
    createPurchase(data: any): Promise<any>;
}
