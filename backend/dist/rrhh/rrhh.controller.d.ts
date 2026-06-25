import { RrhhService } from './rrhh.service';
export declare class RrhhController {
    private readonly rrhhService;
    constructor(rrhhService: RrhhService);
    getAreas(): Promise<{
        id: number;
        nombre: string;
        descripcion: string | null;
    }[]>;
    getCargos(): Promise<{
        id: number;
        nombre: string;
        descripcion: string | null;
    }[]>;
    getTrabajadores(): Promise<({
        area: {
            id: number;
            nombre: string;
            descripcion: string | null;
        };
        cargo: {
            id: number;
            nombre: string;
            descripcion: string | null;
        };
    } & {
        id: number;
        nombres: string;
        apellidos: string;
        createdAt: Date;
        updatedAt: Date;
        estado: string;
        dni: string;
        fechaIngreso: Date;
        areaId: number;
        cargoId: number;
        salarioBase: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    createTrabajador(data: any): Promise<{
        id: number;
        nombres: string;
        apellidos: string;
        createdAt: Date;
        updatedAt: Date;
        estado: string;
        dni: string;
        fechaIngreso: Date;
        areaId: number;
        cargoId: number;
        salarioBase: import("@prisma/client/runtime/library").Decimal;
    }>;
    createArea(data: any): Promise<{
        id: number;
        nombre: string;
        descripcion: string | null;
    }>;
    createCargo(data: any): Promise<{
        id: number;
        nombre: string;
        descripcion: string | null;
    }>;
}
