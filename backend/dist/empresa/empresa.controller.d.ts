import { EmpresaService } from './empresa.service';
export declare class EmpresaController {
    private readonly empresaService;
    constructor(empresaService: EmpresaService);
    getEmpresa(): Promise<{
        id: number;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        igv: import("@prisma/client/runtime/library").Decimal;
        ruc: string;
        razonSocial: string;
        direccion: string | null;
        telefono: string | null;
        correo: string | null;
        moneda: string;
        logo: string | null;
    } | null>;
    upsertEmpresa(data: any): Promise<{
        id: number;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
        igv: import("@prisma/client/runtime/library").Decimal;
        ruc: string;
        razonSocial: string;
        direccion: string | null;
        telefono: string | null;
        correo: string | null;
        moneda: string;
        logo: string | null;
    }>;
}
