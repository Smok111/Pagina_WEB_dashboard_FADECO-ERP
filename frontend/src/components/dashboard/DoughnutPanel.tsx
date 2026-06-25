"use client";

import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutPanel({ start, end }: { start?: string; end?: string }) {
  const [loading, setLoading] = useState(true);
  const [dataMap, setDataMap] = useState<Record<string, number>>({});

  useEffect(() => {
    let mounted = true;
    const qs = new URLSearchParams();
    if (start) qs.set('start', start);
    if (end) qs.set('end', end);

    fetch(`/api/compras?${qs.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        const compras = json.recent ?? [];
        const map: Record<string, number> = {};

        compras.forEach((c: any) => {
          (c.detalles ?? []).forEach((d: any) => {
            const cat = d.producto?.categoria?.nombre ?? 'Sin categoría';
            const amount = d.subtotal ?? (d.cantidad != null && d.precioUnitario != null ? d.cantidad * d.precioUnitario : 0);
            const val = Number(amount ?? 0);
            map[cat] = (map[cat] ?? 0) + val;
          });
        });

        setDataMap(map);
      })
      .catch(console.error)
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [start, end]);

  const labels = Object.keys(dataMap);
  const values = labels.map((l) => Math.round(dataMap[l]));

  const data = {
    labels,
    datasets: [{ data: values, backgroundColor: ['#c0262c', '#ef4444', '#0ea5a4', '#f59e0b', '#16a34a'] }],
  };

  return (
    <div className="card p-4">
      <h4 className="font-semibold">Distribución por Categoría</h4>
      <div className="mt-3 h-48">
        {loading ? <div className="h-full skeleton rounded-lg" /> : <Doughnut data={data} />}
      </div>
    </div>
  );
}
