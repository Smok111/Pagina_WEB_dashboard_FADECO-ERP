"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import esLocale from "@fullcalendar/core/locales/es";

interface CalendarWrapperProps {
  events: any[];
  handleEventClick: (info: any) => void;
}

export default function CalendarWrapper({ events, handleEventClick }: CalendarWrapperProps) {
  return (
    <FullCalendar
      // @ts-ignore
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
  );
}
