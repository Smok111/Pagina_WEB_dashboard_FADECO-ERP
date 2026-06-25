import { RolesService } from './roles.service';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
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
    findOne(id: string): Promise<{
        id: number;
        nombre: string;
        descripcion: string | null;
    } | null>;
    create(data: any): Promise<{
        id: number;
        nombre: string;
        descripcion: string | null;
    }>;
    update(id: string, data: any): Promise<{
        id: number;
        nombre: string;
        descripcion: string | null;
    }>;
    remove(id: string): Promise<{
        id: number;
        nombre: string;
        descripcion: string | null;
    }>;
}
