import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics() {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 7); // Últimos 7 días

    const [
      ventas, compras, ops, productos, equipos, trabajadores,
      productosBajoStock, mantenimientosPendientes, movimientosRecientes, detallesVenta
    ] = await Promise.all([
      this.prisma.venta.findMany({ where: { estado: 'COMPLETADA', fecha: { gte: fechaInicio } } }),
      this.prisma.compra.findMany({ where: { estado: 'RECIBIDA', fecha: { gte: fechaInicio } } }),
      this.prisma.ordenProduccion.findMany(),
      this.prisma.producto.findMany({ where: { estado: true } }),
      this.prisma.equipo.findMany(),
      this.prisma.trabajador.findMany({ where: { estado: 'ACTIVO' }, include: { area: true } }),
      
      this.prisma.producto.findMany({
        where: { estado: true, stockActual: { lte: this.prisma.producto.fields.stockMinimo } },
        select: { codigo: true, nombre: true, stockActual: true, stockMinimo: true },
        take: 5,
      }),
      this.prisma.mantenimientoEquipo.findMany({
        where: { estado: 'PROGRAMADO' },
        include: { equipo: true },
        take: 5,
      }),
      this.prisma.movimientoInventario.findMany({
        orderBy: { fecha: 'desc' },
        include: { producto: true, almacen: true },
        take: 10,
      }),
      this.prisma.detalleVenta.findMany({
        include: { producto: true }
      })
    ]);

    // 1. Histórico Financiero
    const historialFinanciero = [];
    let ingresosTotales = 0;
    let gastosTotales = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const diaStr = d.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit' });
      const ventasDia = ventas.filter(v => new Date(v.fecha).toDateString() === d.toDateString());
      const comprasDia = compras.filter(c => new Date(c.fecha).toDateString() === d.toDateString());
      const ingresosDia = ventasDia.reduce((sum, v) => sum + Number(v.total), 0);
      const gastosDia = comprasDia.reduce((sum, c) => sum + Number(c.total), 0);
      ingresosTotales += ingresosDia;
      gastosTotales += gastosDia;
      historialFinanciero.push({ name: diaStr, Ingresos: ingresosDia, Gastos: gastosDia });
    }

    // 2. Distribución de Producción
    const opsPorEstado = [
      { name: 'Pendientes', value: ops.filter(o => o.estado === 'PENDIENTE').length, fill: '#64748b' },
      { name: 'En Proceso', value: ops.filter(o => o.estado === 'EN_PROCESO').length, fill: '#f59e0b' },
      { name: 'Finalizadas', value: ops.filter(o => o.estado === 'FINALIZADA').length, fill: '#10b981' }
    ];

    // 3. Valor de Inventario
    const valorInventario = productos.reduce((sum, p) => sum + (Number(p.stockActual) * Number(p.costo)), 0);

    // 4. Top 5 Productos Más Vendidos
    const productosMap = new Map<string, number>();
    detallesVenta.forEach(dv => {
      const nombre = dv.producto.nombre;
      productosMap.set(nombre, (productosMap.get(nombre) || 0) + Number(dv.cantidad));
    });
    const topProductos = Array.from(productosMap.entries())
      .map(([name, cantidad]) => ({ name, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    // 5. Salud de Maquinaria (Equipos)
    const saludEquipos = [
      { name: 'Operativos', value: equipos.filter(e => e.estado === 'OPERATIVO').length, fill: '#10b981' },
      { name: 'Mantenimiento', value: equipos.filter(e => e.estado === 'EN_MANTENIMIENTO').length, fill: '#f59e0b' },
      { name: 'Inactivos', value: equipos.filter(e => e.estado === 'INACTIVO').length, fill: '#ef4444' }
    ];

    // 6. Fuerza Laboral por Área
    const areasMap = new Map<string, number>();
    trabajadores.forEach(t => {
      const area = t.area.nombre;
      areasMap.set(area, (areasMap.get(area) || 0) + 1);
    });
    const fuerzaLaboral = Array.from(areasMap.entries()).map(([name, Trabajadores]) => ({ name, Trabajadores }));

    // 7. Inventario por Categoría (NUEVO)
    const categoriasMap = new Map<string, number>();
    const productosConCategoria = await this.prisma.producto.findMany({ include: { categoria: true } });
    productosConCategoria.forEach(p => {
      const cat = p.categoria.nombre;
      categoriasMap.set(cat, (categoriasMap.get(cat) || 0) + 1);
    });
    const inventarioPorCategoria = Array.from(categoriasMap.entries())
      .map(([name, value], index) => {
        // Generar colores variados para el Donut
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
        return { name, value, fill: colors[index % colors.length] };
      })
      .sort((a, b) => b.value - a.value);

    return {
      ingresosTotales,
      gastosTotales,
      ordenesEnProceso: ops.filter(o => o.estado === 'EN_PROCESO').length,
      valorInventario,
      historialFinanciero,
      opsPorEstado,
      topProductos,
      saludEquipos,
      fuerzaLaboral,
      inventarioPorCategoria, // NUEVO
      alertasStock: productosBajoStock,
      mantenimientosPendientes,
      movimientosRecientes
    };
  }
}
