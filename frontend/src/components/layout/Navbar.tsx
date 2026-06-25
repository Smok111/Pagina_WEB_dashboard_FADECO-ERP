"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/providers/AuthProvider";
import { usePathname } from "next/navigation";
import { Search, Bell, Calendar as CalendarIcon, AlertCircle, PackageOpen, Wrench, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/metrics")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        const alerts: any[] = [];
        if (data.alertasStock) {
          data.alertasStock.forEach((a: any) => {
            alerts.push({
              id: `stock-${a.codigo}`,
              type: 'stock',
              title: `Stock Crítico: ${a.nombre}`,
              message: `Quedan solo ${a.stockActual} unidades.`,
              time: 'Ahora'
            });
          });
        }
        if (data.mantenimientosPendientes) {
          data.mantenimientosPendientes.forEach((m: any) => {
            alerts.push({
              id: `mant-${m.id}`,
              type: 'mant',
              title: `Mantenimiento: ${m.equipo?.nombre || 'Máquina'}`,
              message: `Programado para ${new Date(m.fechaProgramada).toLocaleDateString()}`,
              time: 'Pendiente'
            });
          });
        }
        setNotifs(alerts);
      })
      .catch(() => {});
  }, []);

  // Generar breadcrumbs desde la ruta
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const isLast = index === pathSegments.length - 1;
    const title = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { title, isLast };
  });

  const fecha = new Date().toLocaleDateString("es-PE", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="h-[72px] bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-40 flex items-center justify-between px-6 lg:px-10 transition-all duration-200">
      <div className="flex items-center gap-6 flex-1">
        
        {/* Breadcrumbs */}
        <div className="hidden md:flex items-center text-sm font-medium text-muted-foreground">
          <span className="text-muted-foreground/70">Plataforma</span>
          <span className="mx-2 text-border">/</span>
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center">
              <span className={crumb.isLast ? "text-foreground font-semibold" : "text-muted-foreground"}>
                {crumb.title}
              </span>
              {!crumb.isLast && <span className="mx-2 text-border">/</span>}
            </div>
          ))}
          {breadcrumbs.length === 0 && <span className="text-foreground font-semibold">Dashboard</span>}
        </div>

        {/* Búsqueda Moderna */}
        <div className="flex-1 max-w-md ml-auto md:ml-8 relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Buscar transacciones, productos o clientes..."
            className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border-transparent hover:bg-muted focus:bg-background focus:border-primary/30 focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm transition-all duration-200 text-foreground placeholder:text-muted-foreground"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-[10px] font-semibold text-muted-foreground bg-background px-1.5 py-0.5 rounded shadow-sm border border-border">⌘K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-6">
        {/* Fecha Dinámica */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border text-xs font-medium text-muted-foreground">
          <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="capitalize">{fecha}</span>
        </div>

        <div className="w-px h-6 bg-border hidden sm:block mx-2"></div>

        {/* Notificaciones */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-90"
          >
            <Bell className="w-5 h-5" />
            {notifs.length > 0 && (
              <>
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white animate-ping"></span>
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-white shadow-sm"
                >
                  {notifs.length > 9 ? '9+' : notifs.length}
                </motion.div>
              </>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <>
                <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setShowNotifs(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden z-50 flex flex-col"
                >
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Bell size={16} className="text-blue-500" /> Notificaciones
                    </h3>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{notifs.length}</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifs.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                        <AlertCircle className="w-10 h-10 text-slate-200 mb-2" />
                        <p className="font-medium text-sm">No tienes notificaciones</p>
                      </div>
                    ) : (
                      notifs.map((n) => (
                        <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 group cursor-pointer">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                            n.type === 'stock' ? "bg-red-50 text-red-500 border border-red-100" : "bg-amber-50 text-amber-500 border border-amber-100"
                          )}>
                            {n.type === 'stock' ? <PackageOpen size={18} /> : <Wrench size={18} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 mb-0.5 group-hover:text-blue-600 transition-colors">{n.title}</p>
                            <p className="text-xs font-medium text-slate-500 mb-1">{n.message}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{n.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifs.length > 0 && (
                    <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                      <button 
                        onClick={() => setNotifs([])}
                        className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-1"
                      >
                        Marcar todas como leídas
                      </button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Perfil Usuario (Mobile mainly, desktop has it in sidebar) */}
        <div className="flex items-center gap-3 ml-2 lg:hidden">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-slate-600 text-sm font-bold shadow-sm border border-slate-200">
            {session?.user?.name?.charAt(0) || "A"}
          </div>
        </div>
      </div>
    </header>
  );
}