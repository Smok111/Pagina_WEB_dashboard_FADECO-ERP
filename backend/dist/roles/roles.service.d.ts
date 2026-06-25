import { PrismaService } from '../prisma/prisma.service';
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        usuarios: {
            id: number;
            email: string;
        }[];
    } & {
        id: number;
        nombre: string;
        descripcion: string | null;
    })[]>;
    findOne(id: number): Promise<{
        id: number;
        nombre: string;
        descripcion: string | null;
    } | null>;
    create(data: {
        nombre: string;
        descripcion?: string;
    }): Promise<{
        id: number;
        nombre: string;
        descripcion: string | null;
    }>;
    update(id: number, data: {
        nombre?: string;
        descripcion?: string;
    }): Promise<{
        id: number;
        nombre: string;
        descripcion: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        nombre: string;
        descripcion: string | null;
    }>;
}
