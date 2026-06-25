import { MaintenanceService } from './maintenance.service';
export declare class MaintenanceController {
    private readonly maintenanceService;
    constructor(maintenanceService: MaintenanceService);
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
    finishMantenimiento(id: string, data: any): Promise<{
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
