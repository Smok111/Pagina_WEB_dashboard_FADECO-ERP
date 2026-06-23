"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import KpiCard from "@/components/dashboard/KpiCard";
import ChartPanel from "@/components/dashboard/ChartPanel";
import DataTable from "@/components/ui/DataTable";
import Skeleton from "@/components/ui/Skeleton";
import VentasPanel from "@/components/dashboard/VentasPanel";
import DoughnutPanel from "@/components/dashboard/DoughnutPanel";
import SucursalLinePanel from "@/components/dashboard/SucursalLinePanel";
import DateFilter from "@/components/ui/DateFilter";

export default function DashboardPage() {
  const [start, setStart] = useState<string | undefined>(undefined);
  const [end, setEnd] = useState<string | undefined>(undefined);
  const [compras, setCompras] = useState<any[]>([]);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (start) qs.set('start', start);
    if (end) qs.set('end', end);

    fetch(`/api/compras?${qs.toString()}`)
      .then((r) => r.json())
      .then((json) => setCompras((json.recent ?? []).map((c: any) => ({ id: c.codigoSistema ?? c.id, proveedor: c.proveedor?.razonSocial ?? c.proveedorId, monto: `S/ ${Number(c.total ?? 0).toFixed(2)}`, estado: c.estado }))))
      .catch(console.error);
  }, [start, end]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-4 rounded-3xl bg-white/95 px-4 py-3 shadow-lg shadow-slate-900/10 border border-slate-200">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-3xl bg-slate-950/5 p-2">
              <img
                src="/logo-fadeco.png"
                alt="Logo FADECO"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Panel Principal</h1>
              <p className="text-slate-500">Resumen visual de operaciones y métricas clave.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateFilter start={start} end={end} onChange={(s, e) => { setStart(s); setEnd(e); }} />
          <button type="button" className="btn btn-primary">Nueva operación</button>
          <button type="button" className="btn btn-secondary">Ver reportes</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard titulo="Ventas del Mes" valor="S/ 0.00" change="+0.0%" changeType="up" />
        <KpiCard titulo="Producción Hoy" valor="0 m³" change="+0%" changeType="up" />
        <KpiCard titulo="Alertas de Stock" valor="0" change="0%" changeType="down" />
        <KpiCard titulo="Compras Pendientes" valor="0" change="+0%" changeType="up" />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartPanel start={start} end={end} />
            <VentasPanel start={start} end={end} />
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Panel de acciones</h2>
                <p className="text-slate-500 mt-1">Atajos rápidos para tareas importantes.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">Estado activo</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button type="button" className="btn btn-primary w-full">Nueva orden</button>
              <button type="button" className="btn btn-secondary w-full">Inventario</button>
              <button type="button" className="btn btn-secondary w-full">Alertas</button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <DoughnutPanel start={start} end={end} />
          <SucursalLinePanel start={start} end={end} />
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="font-semibold text-slate-900">Últimas Compras</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">Actualizado ahora</span>
        </div>
        <DataTable
          columns={[
            { key: "id", label: "ID" },
            { key: "proveedor", label: "Proveedor" },
            { key: "monto", label: "Monto" },
            { key: "estado", label: "Estado" },
          ]}
          data={compras}
        />
      </div>
    </>
  );
}