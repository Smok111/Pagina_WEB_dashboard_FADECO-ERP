import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        sucursal: {
            id: number;
            activo: boolean;
            nombre: string;
            direccion: string | null;
            telefono: string | null;
            empresaId: number;
        };
        rol: {
            id: number;
            nombre: string;
            descripcion: string | null;
        };
        id: number;
        email: string;
        nombres: string;
        apellidos: string;
        activo: boolean;
        rolId: number;
        sucursalId: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): Promise<({
        sucursal: {
            id: number;
            activo: boolean;
            nombre: string;
            direccion: string | null;
            telefono: string | null;
            empresaId: number;
        };
        rol: {
            id: number;
            nombre: string;
            descripcion: string | null;
        };
    } & {
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
    }) | null>;
    create(data: any): Promise<{
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
    }>;
    update(id: number, data: any): Promise<{
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
    }>;
    remove(id: number): Promise<{
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
    }>;
}
