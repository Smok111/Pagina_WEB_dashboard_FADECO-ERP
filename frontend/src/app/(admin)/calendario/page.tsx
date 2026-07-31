// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { CalendarDays } from "lucide-react";

// Dynamically import the wrapper with ssr: false so none of the FullCalendar plugins load on the server
const CalendarWrapper = dynamic(() => import("./CalendarWrapper"), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center text-slate-400">
      <span className="animate-pulse">Cargando calendario interactivo...</span>
    </div>
  )
});

export default function CalendarioPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resOP, resMant] = await Promise.all([
        fetch("/api/production"),
        fetch("/api/maintenance/mantenimientos")
      ]);

      let newEvents: any[] = [];

      if (resOP.ok) {
        const ordenes = await resOP.json();
        const opEvents = ordenes.map((op: any) => {
          let color = "#3B82F6"; // default blue
          if (op.estado === "PENDIENTE") color = "#64748B"; // slate
          if (op.estado === "EN_PROCESO") color = "#F97316"; // orange
          if (op.estado === "FINALIZADA") color = "#10B981"; // emerald

          return {
            id: `op-${op.id}`,
            title: `OP: ${op.codigoOP} - ${op.productoFinal?.nombre || "Producto"}`,
            start: op.fechaInicio,
            end: op.fechaFin || op.fechaInicio,
            backgroundColor: color,
            borderColor: color,
            extendedProps: {
              type: "PRODUCCION",
              estado: op.estado,
              detalle: `Cantidad esperada: ${op.cantidadEsperada}`
            }
          };
        });
        newEvents = [...newEvents, ...opEvents];
      }

      if (resMant.ok) {
        const mantenimientos = await resMant.json();
        const mantEvents = mantenimientos.map((m: any) => {
          let color = "#EF4444"; // red for maintenance
          if (m.estado === "COMPLETADO") color = "#10B981";

          return {
            id: `mant-${m.id}`,
            title: `Mantenimiento: ${m.equipo?.nombre || "Equipo"}`,
            start: m.fechaProgramada,
            end: m.fechaRealizacion || m.fechaProgramada,
            backgroundColor: color,
            borderColor: color,
            extendedProps: {
              type: "MANTENIMIENTO",
              estado: m.estado,
              detalle: `Tipo: ${m.tipo}`
            }
          };
        });
        newEvents = [...newEvents, ...mantEvents];
      }

      setEvents(newEvents);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (info: any) => {
    alert(`Evento: ${info.event.title}\nEstado: ${info.event.extendedProps.estado}\nDetalle: ${info.event.extendedProps.detalle}`);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 shrink-0 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-500/10 rounded-2xl shadow-inner border border-blue-200 dark:border-blue-500/20">
               <CalendarDays className="text-blue-600 dark:text-blue-400" size={26} />
            </div>
            Calendario Maestro
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Visualización unificada de Operaciones de Producción y Mantenimiento.</p>
        </div>
        <div className="flex gap-4 items-center flex-wrap bg-white dark:bg-[#0F172A] py-3 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
             <div className="w-2.5 h-2.5 rounded-full bg-slate-500 shadow-sm shadow-slate-500/50"></div> PENDIENTE
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
             <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50"></div> EN PROCESO
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div> FINALIZADO
           </div>
           <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
             <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></div> MANTENIMIENTO
           </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-[#0B0F19] rounded-[2rem] border border-slate-200 dark:border-white/5 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-xl overflow-hidden calendar-container min-h-[600px] flex flex-col relative z-0">
        {loading ? (
           <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 gap-3">
             <CalendarDays className="animate-bounce text-blue-500/50" size={32} />
             <span className="animate-pulse font-medium">Sincronizando eventos...</span>
           </div>
        ) : (
          <CalendarWrapper events={events} handleEventClick={handleEventClick} />
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        /* Light mode defaults */
        .calendar-container {
           --fc-border-color: #e2e8f0;
           --fc-page-bg-color: #ffffff;
           --fc-neutral-bg-color: #f8fafc;
           --fc-neutral-text-color: #64748b;
           --fc-today-bg-color: #eff6ff;
        }
        .fc-col-header-cell-cushion, .fc-daygrid-day-number {
           color: #334155;
           text-decoration: none !important;
        }
        .fc .fc-toolbar-title {
           color: #0f172a;
           font-size: 1.5rem;
           font-weight: 800;
           letter-spacing: -0.025em;
        }
        .fc-list-event-title, .fc-list-event-time {
           color: #334155 !important;
        }
        .fc-theme-standard td, .fc-theme-standard th {
           border-color: var(--fc-border-color) !important;
        }

        /* Dark mode overrides (assuming a .dark class on html/body from next-themes) */
        :is(.dark .calendar-container) {
           --fc-border-color: rgba(255, 255, 255, 0.05);
           --fc-page-bg-color: transparent;
           --fc-neutral-bg-color: rgba(255, 255, 255, 0.02);
           --fc-neutral-text-color: #94a3b8;
           --fc-today-bg-color: rgba(59, 130, 246, 0.1);
        }
        :is(.dark .fc-col-header-cell-cushion), :is(.dark .fc-daygrid-day-number) {
           color: #cbd5e1;
        }
        :is(.dark .fc .fc-toolbar-title) {
           color: #f8fafc;
        }
        :is(.dark .fc-list-event-title), :is(.dark .fc-list-event-time) {
           color: #e2e8f0 !important;
        }

        /* Shared aesthetics */
        .fc-button-primary {
           background-color: #3b82f6 !important;
           border-color: #3b82f6 !important;
           text-transform: capitalize !important;
           font-weight: 600 !important;
           border-radius: 10px !important;
           padding: 8px 18px !important;
           transition: all 0.2s ease !important;
           box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }
        .fc-button-primary:not(:disabled):hover {
           background-color: #2563eb !important;
           border-color: #2563eb !important;
           transform: translateY(-2px);
           box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
        }
        .fc-button-primary:not(:disabled):active, .fc-button-primary:not(:disabled).fc-button-active {
           background-color: #1d4ed8 !important;
           border-color: #1d4ed8 !important;
           box-shadow: inset 0 2px 4px rgba(0,0,0,0.2) !important;
           transform: translateY(0);
        }
        .fc-list-day-cushion {
           background-color: var(--fc-neutral-bg-color) !important;
           font-weight: bold;
           padding: 12px 16px !important;
        }
        .fc-event {
           cursor: pointer;
           border-radius: 6px;
           padding: 4px 6px;
           font-size: 0.75rem;
           border: none;
           font-weight: 600;
           transition: transform 0.2s, box-shadow 0.2s;
           box-shadow: 0 2px 4px rgba(0,0,0,0.05);
           overflow: hidden;
        }
        .fc-event:hover {
           transform: scale(1.02) translateY(-1px);
           z-index: 10 !important;
           box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .fc-daygrid-event-dot {
           border-color: currentColor !important;
        }
        .fc-header-toolbar {
           margin-bottom: 2rem !important;
        }
        .fc-day-today {
           background-color: var(--fc-today-bg-color) !important;
        }
        .fc-scroller::-webkit-scrollbar {
           width: 8px;
           height: 8px;
        }
        .fc-scroller::-webkit-scrollbar-track {
           background: transparent;
        }
        .fc-scroller::-webkit-scrollbar-thumb {
           background: var(--fc-border-color);
           border-radius: 4px;
        }
      `}} />
    </div>
  );
}
