"use client";

import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend);

export default function ChartPanel({ start, end }: { start?: string; end?: string }) {
  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState<{ month: string; total: number }[]>([]);

  useEffect(() => {
    let mounted = true;

    const qs = new URLSearchParams();
    if (start) qs.set('start', start);
    if (end) qs.set('end', end);

    fetch(`/api/compras?${qs.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        const m = json.monthly ?? [];
        setMonthly(m.slice(-6));
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
        label: "Compras",
        data: monthly.map((m) => Math.round(m.total ?? 0)),
        borderColor: "rgba(194,38,44,0.95)",
        backgroundColor: "rgba(194,38,44,0.12)",
        tension: 0.3,
        fill: true,
        pointRadius: 2,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "rgba(15,23,42,0.04)" } },
    },
  };

  return (
    <div className="card p-4 h-56">
      <h4 className="font-semibold">Compras - Últimos meses</h4>

      <div className="mt-3 h-44">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-full h-28 skeleton rounded-lg" />
          </div>
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  );
}
