"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Users, Briefcase, MapPin, Search } from "lucide-react";

export default function RrhhPage() {
  const [trabajadores, setTrabajadores] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [cargos, setCargos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [dni, setDni] = useState("");
  const [areaId, setAreaId] = useState("");
  const [cargoId, setCargoId] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [salarioBase, setSalarioBase] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resT, resA, resC] = await Promise.all([
        fetch("/api/rrhh/trabajadores"),
        fetch("/api/rrhh/areas"),
        fetch("/api/rrhh/cargos")
      ]);
      if (resT.ok) setTrabajadores(await resT.json());
      if (resA.ok) setAreas(await resA.json());
      if (resC.ok) setCargos(await resC.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/rrhh/trabajadores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombres, apellidos, dni, areaId, cargoId, fechaIngreso, salarioBase }),
    });
    if (res.ok) {
      setIsModalOpen(false);
      fetchData();
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="text-fuchsia-500" /> Recursos Humanos
          </h1>
          <p className="text-slate-400">Directorio de personal de planta y administración</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-fuchsia-500/25"
        >
          <Plus size={18} />
          Nuevo Trabajador
        </button>
      </div>

      <div className="bg-[#1A2235] rounded-2xl border border-white/5 overflow-hidden shadow-xl flex-1 flex flex-col">
        <div className="p-4 border-b border-white/5 flex gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Buscar por DNI o Nombre..." className="w-full bg-[#0B0F19] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-fuchsia-500/50" />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center text-slate-500">Cargando personal...</div>
          ) : trabajadores.map(t => (
            <div key={t.id} className="bg-[#0B0F19] p-5 rounded-2xl border border-white/5 flex items-start gap-4 hover:border-fuchsia-500/30 transition-colors">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-fuchsia-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
                {t.nombres[0]}{t.apellidos[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold truncate">{t.nombres} {t.apellidos}</h3>
                <p className="text-slate-400 text-sm mb-3">DNI: {t.dni}</p>
                <div className="flex items-center gap-2 text-xs text-slate-300 mb-1">
                  <MapPin size={14} className="text-fuchsia-400"/> {t.area?.nombre}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Briefcase size={14} className="text-fuchsia-400"/> {t.cargo?.nombre}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1A2235] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Users className="text-fuchsia-500"/> Registrar Trabajador</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-2 gap-5 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Nombres</label>
                    <input type="text" required value={nombres} onChange={e => setNombres(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Apellidos</label>
                    <input type="text" required value={apellidos} onChange={e => setApellidos(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">DNI</label>
                    <input type="text" required value={dni} onChange={e => setDni(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Fecha de Ingreso</label>
                    <input type="date" required value={fechaIngreso} onChange={e => setFechaIngreso(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Área</label>
                    <select required value={areaId} onChange={e => setAreaId(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50">
                      <option value="" disabled>Seleccionar área...</option>
                      {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Cargo</label>
                    <select required value={cargoId} onChange={e => setCargoId(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50">
                      <option value="" disabled>Seleccionar cargo...</option>
                      {cargos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Salario Base (S/)</label>
                    <input type="number" step="0.01" required value={salarioBase} onChange={e => setSalarioBase(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50" />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-300 hover:bg-white/5 rounded-xl transition-colors font-medium">Cancelar</button>
                  <button type="submit" className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-fuchsia-500/25">Guardar Trabajador</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
