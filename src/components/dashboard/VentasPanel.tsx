"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Filler, Title, Tooltip, Legend);

export default function VentasPanel({ start, end }: { start?: string; end?: string }) {
  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState<{ month: string; total: number }[]>([]);

  useEffect(() => {
    let mounted = true;
    const qs = new URLSearchParams();
    if (start) qs.set('start', start);
    if (end) qs.set('end', end);

    fetch(`/api/ventas?${qs.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        setMonthly((json.monthly ?? []).slice(-6));
      })
      .catch(console.error)
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const labels = monthly.map((m) => {
    const [y, mm] = m.month.split("-");
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${monthNames[Number(mm) - 1]}/${y.slice(-2)}`;
  });

  const data = {
    labels,
    datasets: [
      {
        label: "Ventas",
        data: monthly.map((m) => Math.round(m.total ?? 0)),
        backgroundColor: "rgba(14,165,164,0.9)",
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  return (
    <div className="card p-4 h-56">
      <h4 className="font-semibold">Ventas - Últimos meses</h4>
      <div className="mt-3 h-44">
        {loading ? <div className="h-full skeleton rounded-lg" /> : <Bar data={data} options={options} />}
      </div>
    </div>
  );
}
