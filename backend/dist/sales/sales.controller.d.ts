import { SalesService } from './sales.service';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    findAll(): Promise<({
        usuario: {
            id: number;
            email: string;
            nombres: string;
            apellidos: string;
            passwordHash: string;
            activo: boolean;
            rolId: number;
            sucursalId: number;
            createdAt: Date;
            updatedAt: Date;
        };
        cliente: {
            id: number;
            nombres: string | null;
            apellidos: string | null;
            createdAt: Date;
            updatedAt: Date;
            estado: boolean;
            tipoDocumento: string;
            numeroDocumento: string;
            razonSocial: string | null;
            direccion: string | null;
            telefono: string | null;
            correo: string | null;
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
            ventaId: number;
            precioUnitario: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        estado: string;
        codigoSistema: string | null;
        fecha: Date;
        observacion: string | null;
        tipoDocumento: string;
        numeroDocumento: string;
        archivoAdjunto: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        igv: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        clienteId: number;
        usuarioId: number;
    })[]>;
    getClientes(): Promise<{
        id: number;
        nombres: string | null;
        apellidos: string | null;
        createdAt: Date;
        updatedAt: Date;
        estado: boolean;
        tipoDocumento: string;
        numeroDocumento: string;
        razonSocial: string | null;
        direccion: string | null;
        telefono: string | null;
        correo: string | null;
    }[]>;
    create(data: any, req: any): Promise<any>;
}
