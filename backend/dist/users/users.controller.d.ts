import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: number;
        email: string;
        nombres: string;
        apellidos: string;
        activo: boolean;
        rolId: number;
        sucursalId: number;
        createdAt: Date;
        updatedAt: Date;
        rol: {
            id: number;
            nombre: string;
            descripcion: string | null;
        };
        sucursal: {
            id: number;
            activo: boolean;
            nombre: string;
            direccion: string | null;
            telefono: string | null;
            empresaId: number;
        };
    }[]>;
    findOne(id: string): Promise<({
        rol: {
            id: number;
            nombre: string;
            descripcion: string | null;
        };
        sucursal: {
            id: number;
            activo: boolean;
            nombre: string;
            direccion: string | null;
            telefono: string | null;
            empresaId: number;
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
    update(id: string, data: any): Promise<{
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
    remove(id: string): Promise<{
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
