"use client";

import { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, TrendingDown, Factory, AlertCircle, Wrench, 
  PackageOpen, Activity, FileText, Box, Users, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar 
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";
import { useTranslations } from "@/providers/AccessibilityProvider";

export default function DashboardPage() {
  const { t } = useTranslations();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    fetch("/api/dashboard/metrics")
      .then(async r => {
        if (!r.ok) throw new Error("API Error");
        return r.json();
      })
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setMetrics({
          ingresosTotales: 0, gastosTotales: 0, ordenesEnProceso: 0, valorInventario: 0,
          historialFinanciero: [], opsPorEstado: [], topProductos: [], saludEquipos: [], fuerzaLaboral: [],
          inventarioPorCategoria: [],
          alertasStock: [], mantenimientosPendientes: [], movimientosRecientes: []
        });
        setLoading(false);
      });
  }, []);

  const exportPDF = async () => {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, { scale: 2, backgroundColor: "#f8fafc" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Reporte_FADECO_Dashboard_V3.pdf");
  };

  const exportCSV = () => {
    if (!metrics || !metrics.movimientosRecientes) return;
    const rows = [
      ["Fecha", "Tipo", "Observación", "Producto", "Cantidad"],
      ...metrics.movimientosRecientes.map((m: any) => [
        new Date(m.fecha).toLocaleString(),
        m.tipo,
        m.observacion || "",
        m.producto?.nombre || "",
        m.cantidad
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "movimientos_recientes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-slate-500 animate-pulse flex items-center justify-center h-full">{t("Cargando Mega Centro de Mando V3...")}</div>;

  return (
    <div className="p-6 h-full flex flex-col space-y-6 overflow-y-auto bg-transparent" ref={dashboardRef}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Activity className="text-blue-600" size={32} strokeWidth={2.5} />
            {t("Mega Centro de Control V3")}
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            {t("Análisis en tiempo real de Producción, Finanzas, RRHH y Mantenimiento.")}
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={exportCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-semibold shadow-sm text-sm">
            <Download size={18} className="text-emerald-500" />
            {t("Exportar Inventario (CSV)")}
          </button>
          <button onClick={exportPDF} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-[0_4px_14px_rgba(220,38,38,0.3)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.4)] text-sm hover:-translate-y-0.5">
            <FileText size={18} />
            {t("Auditoría Global (PDF)")}
          </button>
        </div>
      </div>

      {/* 4 KPIs Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Finanzas Rápidas */}
        <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors" />
          <h3 className="text-emerald-600 font-bold mb-2 flex items-center gap-2">
            {t("Ingresos (7 días)")}
          </h3>
          <p className="text-3xl font-black text-slate-800 mb-4 tracking-tight">
            S/ {metrics.ingresosTotales?.toFixed(2) || "0.00"}
          </p>
          <div className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
            <TrendingUp size={14} className="mr-1" />
            {t("Flujo de Ventas")}
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full blur-2xl group-hover:bg-red-100 transition-colors" />
          <h3 className="text-red-600 font-bold mb-2 flex items-center gap-2">
            {t("Egresos (7 días)")}
          </h3>
          <p className="text-3xl font-black text-slate-800 mb-4 tracking-tight">
            S/ {metrics.gastosTotales?.toFixed(2) || "0.00"}
          </p>
          <div className="flex items-center text-xs font-semibold text-red-600 bg-red-50 w-fit px-2 py-1 rounded-md">
            <TrendingDown size={14} className="mr-1" />
            {t("Gasto en Insumos")}
          </div>
        </motion.div>

        {/* Inventario Global */}
        <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors" />
          <h3 className="text-indigo-600 font-bold mb-2 flex items-center gap-2">
            {t("Valor del Inventario")}
          </h3>
          <p className="text-3xl font-black text-slate-800 mb-4 tracking-tight">
            S/ {metrics.valorInventario?.toFixed(2) || "0.00"}
          </p>
          <div className="flex items-center text-xs font-semibold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded-md">
            <Box size={14} className="mr-1" />
            {t("Capital inmovilizado")}
          </div>
        </motion.div>

        {/* Producción */}
        <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full blur-2xl group-hover:bg-orange-100 transition-colors" />
          <h3 className="text-orange-600 font-bold mb-2 flex items-center gap-2">
            {t("Fábrica Activa")}
          </h3>
          <p className="text-3xl font-black text-slate-800 mb-4 tracking-tight">
            {metrics.ordenesEnProceso || 0} <span className="text-base text-slate-400 font-medium">OPs</span>
          </p>
          <div className="flex items-center text-xs font-semibold text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded-md">
            <Factory size={14} className="mr-1" />
            {t("Órdenes en proceso")}
          </div>
        </motion.div>
      </motion.div>

      {/* Row 1 Gráficos: Flujo vs Producción vs Inventario */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={18} />
            {t("Flujo Financiero (Últimos 7 Días)")}
          </h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.historialFinanciero} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `S/${value}`} />
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Ingresos" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                <Area type="monotone" dataKey="Gastos" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorGastos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución OPs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Factory className="text-orange-500" size={18} />
            {t("Distribución OPs")}
          </h3>
          <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.opsPorEstado || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {(metrics.opsPorEstado || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-900">
                {(metrics.opsPorEstado || []).reduce((acc: number, curr: any) => acc + curr.value, 0)}
              </span>
              <span className="text-xs text-slate-500 uppercase tracking-widest mt-1 font-semibold">Total</span>
            </div>
          </div>
        </div>

        {/* Distribución Inventario */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PackageOpen className="text-blue-500" size={18} />
            {t("Inventario por Categoría")}
          </h3>
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
             {(metrics.inventarioPorCategoria?.length || 0) === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">{t("Sin categorías registradas")}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={metrics.inventarioPorCategoria} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                    {metrics.inventarioPorCategoria.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 2 Gráficos: Top Productos, Equipos, RRHH */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Top Vendidos */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={18} />
            {t("Top 5 Vendidos")}
          </h3>
          <div className="flex-1 min-h-[250px]">
            {(metrics.topProductos?.length || 0) === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">Sin datos de ventas</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.topProductos} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} width={100} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px' }} cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="cantidad" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Maquinaria Estado */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Wrench className="text-slate-500" size={18} />
            {t("Maquinaria (Planta)")}
          </h3>
          <div className="flex-1 min-h-[250px] flex items-center justify-center">
             {(metrics.saludEquipos?.length || 0) === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">No hay equipos registrados</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={metrics.saludEquipos} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                    {metrics.saludEquipos.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* RRHH Mini */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Users className="text-indigo-500" size={18} />
            {t("Fuerza Laboral")}
          </h3>
          <div className="flex-1 min-h-[250px]">
            {(metrics.fuerzaLaboral?.length || 0) === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">Sin empleados registrados</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.fuerzaLaboral} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px' }} cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="Trabajadores" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Row 3 Tablas Inferiores (Alertas y Movimientos) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 pb-10">
        {/* Alertas Críticas */}
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-500" /> Alertas del Sistema
            </h2>
          </div>
          <div className="flex-1 p-5 space-y-6">
            
            {/* Stock Alerts */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <PackageOpen size={16}/> {t("Stock Crítico")}
              </h3>
              <div className="space-y-3">
                {metrics.alertasStock?.length === 0 && <p className="text-sm text-emerald-600 font-medium">Todo el stock está en niveles óptimos.</p>}
                {metrics.alertasStock?.map((prod: any) => (
                  <div key={prod.codigo} className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-slate-900 font-bold text-sm">{prod.nombre}</p>
                      <p className="text-xs text-rose-600 font-medium">Quedan {Number(prod.stockActual)} (Mínimo: {Number(prod.stockMinimo)})</p>
                    </div>
                    <span className="text-rose-700 bg-rose-100 px-2 py-1 rounded-md text-xs font-bold animate-pulse">REABASTECER</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mantenimiento Alerts */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Wrench size={16}/> {t("Mantenimientos Pendientes")}
              </h3>
              <div className="space-y-3">
                {metrics.mantenimientosPendientes?.length === 0 && <p className="text-sm text-emerald-600 font-medium">No hay máquinas esperando mantenimiento.</p>}
                {metrics.mantenimientosPendientes?.map((mant: any) => (
                  <div key={mant.id} className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-slate-900 font-bold text-sm">{mant.equipo.nombre}</p>
                      <p className="text-xs text-amber-600 font-medium">Para el {new Date(mant.fechaProgramada).toLocaleDateString()}</p>
                    </div>
                    <span className="text-amber-700 bg-amber-100 px-2 py-1 rounded-md text-xs font-bold">{mant.tipo}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Últimos Movimientos de Inventario */}
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity size={20} className="text-indigo-500" /> Movimientos Recientes
            </h2>
          </div>
          <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[400px]">
            {metrics.movimientosRecientes?.length === 0 && <p className="text-slate-500 text-sm font-medium">No hay actividad reciente.</p>}
            {metrics.movimientosRecientes?.map((mov: any) => (
              <div key={mov.id} className="flex gap-4 items-start relative before:absolute before:left-[19px] before:top-10 before:bottom-[-20px] before:w-[2px] before:bg-slate-100 last:before:hidden">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10",
                  mov.tipo === 'INGRESO' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                )}>
                  {mov.tipo === 'INGRESO' ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-slate-900 font-bold text-sm">{mov.observacion || mov.tipo}</p>
                    <span className="text-xs font-medium text-slate-500">{new Date(mov.fecha).toLocaleString()}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Producto: <span className="text-slate-900 font-semibold">{mov.producto?.nombre}</span></p>
                  <p className={cn("text-lg font-black font-mono", mov.tipo === 'INGRESO' ? "text-emerald-600" : "text-rose-600")}>
                    {mov.tipo === 'INGRESO' ? '+' : '-'}{Number(mov.cantidad)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}