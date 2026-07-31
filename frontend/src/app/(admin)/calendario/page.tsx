"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import esLocale from "@fullcalendar/core/locales/es";
import { CalendarDays } from "lucide-react";

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
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <CalendarDays className="text-blue-500" /> Calendario Maestro
          </h1>
          <p className="text-slate-600">Agenda global de operaciones y mantenimiento.</p>
        </div>
        <div className="flex gap-4 items-center flex-wrap">
           <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
             <div className="w-3 h-3 rounded-full bg-slate-500"></div> OP Pendiente
           </div>
           <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
             <div className="w-3 h-3 rounded-full bg-orange-500"></div> OP en Proceso
           </div>
           <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
             <div className="w-3 h-3 rounded-full bg-red-500"></div> Mantenimiento Programado
           </div>
        </div>
      </div>

      <div className="flex-1 bg-[#1A2235] rounded-2xl border border-white/5 p-4 shadow-xl overflow-hidden calendar-container min-h-[600px]">
        {loading ? (
           <div className="h-full w-full flex items-center justify-center text-slate-400">
             <span className="animate-pulse">Cargando eventos...</span>
           </div>
        ) : (
          <FullCalendar
            // @ts-ignore - Type mismatch in FullCalendar plugins definitions
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            }}
            locales={[esLocale]}
            locale="es"
            events={events}
            eventClick={handleEventClick}
            height="100%"
            dayMaxEvents={true}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false,
              hour12: false
            }}
          />
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .calendar-container {
           --fc-border-color: rgba(255, 255, 255, 0.1);
           --fc-page-bg-color: transparent;
           --fc-neutral-bg-color: rgba(255, 255, 255, 0.05);
           --fc-neutral-text-color: #94a3b8;
           --fc-today-bg-color: rgba(59, 130, 246, 0.1);
        }
        .fc-theme-standard td, .fc-theme-standard th {
           border-color: var(--fc-border-color);
        }
        .fc-col-header-cell-cushion, .fc-daygrid-day-number {
           color: #cbd5e1;
           text-decoration: none !important;
        }
        .fc-button-primary {
           background-color: #3b82f6 !important;
           border-color: #2563eb !important;
        }
        .fc-button-primary:not(:disabled):active, .fc-button-primary:not(:disabled).fc-button-active {
           background-color: #2563eb !important;
           border-color: #1d4ed8 !important;
        }
        .fc .fc-toolbar-title {
           color: #f8fafc;
           font-size: 1.5rem;
           font-weight: 600;
        }
        .fc-list-day-cushion {
           background-color: var(--fc-neutral-bg-color) !important;
        }
        .fc-list-event-title, .fc-list-event-time {
           color: #e2e8f0 !important;
        }
        .fc-event {
           cursor: pointer;
           border-radius: 4px;
           padding: 2px 4px;
           font-size: 0.75rem;
           border: none;
        }
        .fc-daygrid-event-dot {
           border-color: currentColor !important;
        }
      `}} />
    </div>
  );
}
