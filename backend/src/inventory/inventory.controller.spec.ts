import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('InventoryController', () => {
  let controller: InventoryController;
  let prisma: PrismaService;

  const mockPrismaService = {
    almacen: {
      findUnique: jest.fn(),
    },
    producto: {
      findMany: jest.fn(),
    },
    stockAlmacen: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAlmacen', () => {
    it('should return null if warehouse not found', async () => {
      mockPrismaService.almacen.findUnique.mockResolvedValue(null);

      const result = await controller.getAlmacen('1');
      expect(result).toBeNull();
    });

    it('should return warehouse details and map all products (with stocks mapped or defaulting to 0)', async () => {
      const mockAlmacen = {
        id: 1,
        codigo: 'ALM-001',
        nombre: 'Almacén Central',
        equipos: [{ id: 10, nombre: 'Máquina A', almacenId: 1 }],
      };

      const mockProductos = [
        { id: 101, nombre: 'Producto A', codigo: 'PROD-A' },
        { id: 102, nombre: 'Producto B', codigo: 'PROD-B' },
      ];

      const mockStocksReales = [
        { id: 501, productoId: 101, almacenId: 1, stockActual: 15 },
      ];

      mockPrismaService.almacen.findUnique.mockResolvedValue(mockAlmacen);
      mockPrismaService.producto.findMany.mockResolvedValue(mockProductos);
      mockPrismaService.stockAlmacen.findMany.mockResolvedValue(mockStocksReales);

      const result = await controller.getAlmacen('1');

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.stocks).toHaveLength(2);

      // Product A has a real stock record
      const stockA = result.stocks.find((s: any) => s.productoId === 101);
      expect(stockA).toBeDefined();
      expect(stockA.stockActual).toBe(15);
      expect(stockA.id).toBe(501);

      // Product B does not have a real stock record and should default to 0
      const stockB = result.stocks.find((s: any) => s.productoId === 102);
      expect(stockB).toBeDefined();
      expect(stockB.stockActual).toBe(0);
      expect(stockB.id).toBe('temp-102');
    });
  });
});
