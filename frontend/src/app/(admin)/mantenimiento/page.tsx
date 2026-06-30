"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Wrench, Settings2, AlertTriangle, CheckCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MaintenancePage() {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [mantenimientos, setMantenimientos] = useState<any[]>([]);
  const [almacenes, setAlmacenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewEquipoModalOpen, setIsNewEquipoModalOpen] = useState(false);
  const [newEquipo, setNewEquipo] = useState({ nombre: "", ubicacion: "" });
  const [equipoId, setEquipoId] = useState("");
  const [tipo, setTipo] = useState("PREVENTIVO");
  const [fechaProgramada, setFechaProgramada] = useState("");
  const [detalles, setDetalles] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resE, resM, resA] = await Promise.all([
        fetch("/api/maintenance/equipos"),
        fetch("/api/maintenance/mantenimientos"),
        fetch("/api/inventory/almacenes")
      ]);
      if (resE.ok) setEquipos(await resE.json());
      if (resM.ok) setMantenimientos(await resM.json());
      if (resA.ok) setAlmacenes(await resA.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/maintenance/mantenimientos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipoId, tipo, fechaProgramada, detalles }),
    });
    if (res.ok) {
      setIsModalOpen(false);
      fetchData();
    }
  };

  const handleCreateEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/maintenance/equipos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEquipo),
    });
    if (res.ok) {
      const created = await res.json();
      setEquipos([created, ...equipos]);
      setEquipoId(String(created.id));
      setIsNewEquipoModalOpen(false);
      setNewEquipo({ nombre: "", ubicacion: "" });
    }
  };

  const handleFinish = async (id: number) => {
    const res = await fetch(`/api/maintenance/mantenimientos/${id}/finish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ costo: 0, detalles: "Completado desde UI" })
    });
    if (res.ok) fetchData();
  };

  const handleDeleteEquipo = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este equipo? Se borrará todo su historial.")) return;
    const res = await fetch(`/api/maintenance/equipos/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  const handleDeleteMantenimiento = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta orden?")) return;
    const res = await fetch(`/api/maintenance/mantenimientos/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Wrench className="text-cyan-500" /> Mantenimiento de Equipos
          </h1>
          <p className="text-slate-600">Gestión de maquinaria y órdenes de mantenimiento</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/25"
        >
          <Plus size={18} />
          Programar Mantenimiento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Lista de Equipos */}
        <div className="bg-[#1A2235] rounded-2xl border border-white/5 flex flex-col shadow-xl">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings2 size={20} className="text-slate-400" /> Maquinaria y Equipos
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {equipos.map(eq => (
              <div key={eq.id} className="bg-[#0B0F19] p-4 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-cyan-400">{eq.codigo}</span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded uppercase font-bold", eq.estado === 'OPERATIVO' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400")}>
                      {eq.estado}
                    </span>
                  </div>
                  <h3 className="text-white font-medium">{eq.nombre}</h3>
                  <p className="text-sm text-slate-400">{eq.ubicacion}</p>
                </div>
                <button onClick={() => handleDeleteEquipo(eq.id)} className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Órdenes de Mantenimiento */}
        <div className="bg-[#1A2235] rounded-2xl border border-white/5 flex flex-col shadow-xl">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-400" /> Órdenes Programadas
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mantenimientos.filter(m => m.estado === 'PROGRAMADO').map(m => (
              <div key={m.id} className="bg-[#0B0F19] p-4 rounded-xl border border-amber-500/20 border-l-4 border-l-amber-500 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] bg-white/5 text-slate-300 px-2 py-0.5 rounded mb-2 inline-block">
                      {m.tipo}
                    </span>
                    <h3 className="text-white font-medium mb-1">{m.equipo?.nombre}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2">{m.detalles}</p>
                    <p className="text-xs text-amber-400 mt-2 font-mono">Para: {new Date(m.fechaProgramada).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => handleFinish(m.id)} className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                      <CheckCircle size={16}/> Completar
                    </button>
                    <button onClick={() => handleDeleteMantenimiento(m.id)} className="text-red-400 hover:text-red-300 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg flex items-center justify-center gap-1 text-xs">
                      <Trash2 size={14}/> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {mantenimientos.filter(m => m.estado === 'PROGRAMADO').length === 0 && (
              <div className="text-center py-10 text-slate-500">No hay mantenimientos programados pendientes.</div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1A2235] border border-white/10 rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh] shadow-2xl relative">
              <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0 bg-[#1A2235] z-10 rounded-t-2xl">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Wrench className="text-cyan-500"/> Programar Orden</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
                <div className="space-y-5 mb-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-slate-400">Equipo</label>
                      <button type="button" onClick={() => setIsNewEquipoModalOpen(true)} className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
                        <Plus size={12}/> Nuevo Equipo
                      </button>
                    </div>
                    <select required value={equipoId} onChange={e => setEquipoId(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50">
                      <option value="" disabled>Seleccionar equipo...</option>
                      {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.codigo} - {eq.nombre}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Tipo de Mantenimiento</label>
                      <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50">
                        <option value="PREVENTIVO">PREVENTIVO</option>
                        <option value="CORRECTIVO">CORRECTIVO</option>
                        <option value="PREDICTIVO">PREDICTIVO</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Fecha Programada</label>
                      <input type="date" required value={fechaProgramada} onChange={e => setFechaProgramada(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Detalles / Problema reportado</label>
                    <textarea required value={detalles} onChange={e => setDetalles(e.target.value)} rows={3} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-300 hover:bg-white/5 rounded-xl transition-colors font-medium">Cancelar</button>
                  <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-cyan-500/25">Guardar Orden</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNewEquipoModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1A2235] border border-white/10 rounded-2xl w-full max-w-sm flex flex-col max-h-[90vh] shadow-2xl relative">
              <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0 bg-[#1A2235] z-10 rounded-t-2xl">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="text-cyan-500" /> Nuevo Equipo
                </h3>
                <button type="button" onClick={() => setIsNewEquipoModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateEquipo} className="p-6 overflow-y-auto flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Nombre del Equipo *</label>
                  <input type="text" required value={newEquipo.nombre} onChange={e => setNewEquipo({...newEquipo, nombre: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Ubicación / Área (Almacén)</label>
                  <select required value={newEquipo.ubicacion} onChange={e => setNewEquipo({...newEquipo, ubicacion: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500/50">
                    <option value="" disabled>Seleccionar almacén...</option>
                    {almacenes.map(a => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button type="button" onClick={() => setIsNewEquipoModalOpen(false)} className="px-5 py-2.5 text-slate-300 hover:bg-white/5 rounded-xl transition-colors font-medium text-sm">Cancelar</button>
                  <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-cyan-500/25 text-sm">Guardar Equipo</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
