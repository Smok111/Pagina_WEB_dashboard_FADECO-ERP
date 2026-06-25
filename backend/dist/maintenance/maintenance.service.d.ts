import { PrismaService } from '../prisma/prisma.service';
export declare class MaintenanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getEquipos(): Promise<({
        mantenimientos: {
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
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        codigo: string;
        estado: string;
        ubicacion: string | null;
    })[]>;
    createEquipo(data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        codigo: string;
        estado: string;
        ubicacion: string | null;
    }>;
    getMantenimientos(): Promise<({
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
    })[]>;
    createMantenimiento(data: any): Promise<{
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
    }>;
    finishMantenimiento(id: number, data: any): Promise<{
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
    }>;
}
