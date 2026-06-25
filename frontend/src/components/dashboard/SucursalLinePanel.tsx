"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

export default function SucursalLinePanel({ start, end }: { start?: string; end?: string }) {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<any>({ labels: [], series: {} });

  useEffect(() => {
    let mounted = true;
    const qs = new URLSearchParams();
    if (start) qs.set('start', start);
    if (end) qs.set('end', end);

    fetch(`/api/compras?${qs.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        const compras = json.monthly ?? [];
        const recent = json.recent ?? [];

        // build months from monthly
        const labels = (json.monthly ?? []).map((m: any) => m.month);

        // collect almacen totals per month
        const map: Record<string, Record<string, number>> = {};

        recent.forEach((c: any) => {
          const mon = new Date(c.fecha).getFullYear() + '-' + String(new Date(c.fecha).getMonth() + 1).padStart(2, '0');
          const al = c.almacen?.nombre ?? 'Sin Almacén';
          map[al] = map[al] ?? {};
          map[al][mon] = (map[al][mon] ?? 0) + Number(c.total ?? 0);
        });

        setPayload({ labels, series: map });
      })
      .catch(console.error)
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [start, end]);

  const { labels, series } = payload;
  const datasets = Object.keys(series || {}).map((k, idx) => ({
    label: k,
    data: labels.map((l: string) => Math.round((series[k]?.[l] ?? 0))),
    borderColor: ['#0ea5a4', '#c0262c', '#ef4444', '#f59e0b', '#16a34a'][idx % 5],
    backgroundColor: 'transparent',
    tension: 0.3,
  }));

  const data = { labels: (labels || []).map((m: string) => {
    const [y, mm] = m.split('-');
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${monthNames[Number(mm) - 1]}/${y.slice(-2)}`;
  }), datasets };

  return (
    <div className="card p-4 mt-4">
      <h4 className="font-semibold">Totales por Almacén</h4>
      <div className="mt-3 h-44">
        {loading ? <div className="h-full skeleton rounded-lg" /> : <Line data={data} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />}
      </div>
    </div>
  );
}
