"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Settings, Package, Hammer, CheckCircle2, Play, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSort } from "@/hooks/useSort";

export default function ProduccionPage() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [almacenes, setAlmacenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isNewOpOpen, setIsNewOpOpen] = useState(false);
  const [activeOp, setActiveOp] = useState<any>(null);
  const [isConsumoOpen, setIsConsumoOpen] = useState(false);
  const [isFinishOpen, setIsFinishOpen] = useState(false);

  const { sortedItems: ordenesOrdenadas, sortField, sortOrder, setSortField, setSortOrder } = useSort(ordenes, "codigoOP", "desc");

  // Form states
  const [productoFinalId, setProductoFinalId] = useState("");
  const [cantidadEsperada, setCantidadEsperada] = useState(1);
  const [cantidadReal, setCantidadReal] = useState(1);

  // Consumo form
  const [insumoId, setInsumoId] = useState("");
  const [cantidadInsumo, setCantidadInsumo] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resOP, resProd, resAlm] = await Promise.all([
        fetch("/api/production"),
        fetch("/api/inventory/productos"),
        fetch("/api/inventory/almacenes")
      ]);
      if (resOP.ok) setOrdenes(await resOP.json());
      if (resProd.ok) setProductos(await resProd.json());
      if (resAlm.ok) setAlmacenes(await resAlm.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOP = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/production", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productoFinalId, cantidadEsperada }),
    });
    if (res.ok) {
      setIsNewOpOpen(false);
      setProductoFinalId("");
      fetchData();
    }
  };

  const handleStartOP = async (id: number) => {
    const res = await fetch(`/api/production/${id}/start`, { method: "PATCH" });
    if (res.ok) fetchData();
  };

  const handleAddConsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOp) return;
    const res = await fetch(`/api/production/${activeOp.id}/consumos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productoId: insumoId, cantidad: cantidadInsumo, almacenId: almacenes[0]?.id || 1 }),
    });
    if (res.ok) {
      setInsumoId("");
      setCantidadInsumo(1);
      fetchData();
      // Update activeOp locally to see the change without closing modal
      setActiveOp({
        ...activeOp,
        consumos: [...activeOp.consumos, { producto: productos.find(p => p.id === Number(insumoId)), cantidad: cantidadInsumo }]
      });
    }
  };

  const handleFinishOP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOp) return;
    const res = await fetch(`/api/production/${activeOp.id}/finish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidadReal }),
    });
    if (res.ok) {
      setIsFinishOpen(false);
      fetchData();
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings className="text-orange-500" /> Control de Producción
          </h1>
          <p className="text-slate-400">Órdenes de producción, consumos y lotes.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Ordenar:</span>
            <select 
              className="bg-[#0B0F19] text-white text-sm rounded-xl px-3 py-2 border border-white/10 focus:outline-none"
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-');
                setSortField(f);
                setSortOrder(o as any);
              }}
            >
               <option value="codigoOP-asc">Código (Asc)</option>
               <option value="codigoOP-desc">Código (Desc)</option>
               <option value="productoFinal.nombre-asc">Producto (A-Z)</option>
               <option value="fechaFin-desc">Más Recientes</option>
            </select>
          </div>
        <button
          onClick={() => setIsNewOpOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-orange-500/25"
        >
          <Plus size={18} />
          Nueva OP
        </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Columna PENDIENTES */}
        <div className="bg-[#1A2235] rounded-2xl border border-white/5 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>
            <h3 className="font-semibold text-slate-300">Pendientes</h3>
            <span className="ml-auto bg-white/5 text-slate-400 text-xs px-2 py-1 rounded-full">
              {ordenes.filter(o => o.estado === 'PENDIENTE').length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {ordenesOrdenadas.filter(o => o.estado === 'PENDIENTE').map(op => (
              <div key={op.id} className="bg-[#0B0F19] p-4 rounded-xl border border-white/5 hover:border-slate-500/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-slate-400">{op.codigoOP}</span>
                  <button onClick={() => handleStartOP(op.id)} className="text-orange-400 hover:text-orange-300 bg-orange-500/10 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors">
                    <Play size={12} /> Iniciar
                  </button>
                </div>
                <h4 className="text-white font-medium mb-1">{op.productoFinal.nombre}</h4>
                <p className="text-sm text-slate-400 flex items-center gap-2"><Package size={14}/> Esperado: {Number(op.cantidadEsperada)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Columna EN PROCESO */}
        <div className="bg-[#1A2235] rounded-2xl border border-white/5 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></div>
            <h3 className="font-semibold text-orange-400">En Proceso</h3>
            <span className="ml-auto bg-orange-500/10 text-orange-400 text-xs px-2 py-1 rounded-full">
              {ordenes.filter(o => o.estado === 'EN_PROCESO').length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {ordenesOrdenadas.filter(o => o.estado === 'EN_PROCESO').map(op => (
              <div key={op.id} className="bg-[#0B0F19] p-4 rounded-xl border border-orange-500/20 hover:border-orange-500/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-orange-400">{op.codigoOP}</span>
                  <div className="flex gap-1">
                    <button onClick={() => { setActiveOp(op); setIsConsumoOpen(true); }} className="text-blue-400 hover:text-blue-300 bg-blue-500/10 p-1.5 rounded-lg tooltip-trigger" title="Registrar Consumo">
                      <Hammer size={14} />
                    </button>
                    <button onClick={() => { setActiveOp(op); setCantidadReal(Number(op.cantidadEsperada)); setIsFinishOpen(true); }} className="text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 p-1.5 rounded-lg tooltip-trigger" title="Finalizar Producción">
                      <CheckCircle2 size={14} />
                    </button>
                  </div>
                </div>
                <h4 className="text-white font-medium mb-1">{op.productoFinal.nombre}</h4>
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-xs text-slate-400 mb-2">Materias Primas Consumidas:</p>
                  <div className="space-y-1">
                    {op.consumos.length === 0 && <span className="text-xs text-slate-500 italic">Sin consumos aún</span>}
                    {op.consumos.map((c: any, i: number) => (
                      <div key={i} className="text-xs flex justify-between">
                        <span className="text-slate-300 truncate pr-2">- {c.producto?.nombre}</span>
                        <span className="text-orange-300 font-mono">{Number(c.cantidad)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna FINALIZADAS */}
        <div className="bg-[#1A2235] rounded-2xl border border-white/5 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <h3 className="font-semibold text-emerald-400">Finalizadas</h3>
            <span className="ml-auto bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded-full">
              {ordenes.filter(o => o.estado === 'FINALIZADA').length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {ordenesOrdenadas.filter(o => o.estado === 'FINALIZADA').map(op => (
              <div key={op.id} className="bg-[#0B0F19] p-4 rounded-xl border border-emerald-500/20 opacity-80">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-emerald-400">{op.codigoOP}</span>
                  <span className="text-[10px] text-slate-500">{new Date(op.fechaFin).toLocaleDateString()}</span>
                </div>
                <h4 className="text-white font-medium mb-1">{op.productoFinal.nombre}</h4>
                <div className="flex justify-between mt-3 text-sm">
                  <span className="text-slate-400">Logrado: <strong className="text-emerald-400">{Number(op.cantidadReal)}</strong></span>
                  <span className="text-emerald-400 font-mono text-xs bg-emerald-500/10 px-2 py-0.5 rounded">{op.lotes[0]?.numeroLote}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL NUEVA OP */}
      <AnimatePresence>
        {isNewOpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1A2235] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Settings className="text-orange-500"/> Crear Orden de Producción</h3>
                <button onClick={() => setIsNewOpOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateOP} className="p-6">
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Producto a Fabricar</label>
                  <select required value={productoFinalId} onChange={e => setProductoFinalId(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50">
                    <option value="" disabled>Seleccione producto final...</option>
                    {productos.map(p => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>)}
                  </select>
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Cantidad Esperada a Producir</label>
                  <input type="number" min="1" required value={cantidadEsperada} onChange={e => setCantidadEsperada(Number(e.target.value))} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50" />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsNewOpOpen(false)} className="px-5 py-2.5 text-slate-300 hover:bg-white/5 rounded-xl transition-colors font-medium">Cancelar</button>
                  <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-orange-500/25">Generar OP</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL REGISTRAR CONSUMO */}
      <AnimatePresence>
        {isConsumoOpen && activeOp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1A2235] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Hammer className="text-blue-500"/> Consumo de Materia Prima</h3>
                <button onClick={() => setIsConsumoOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-5 bg-blue-500/5 border-b border-white/5 flex gap-3 text-sm">
                <AlertCircle className="text-blue-400 shrink-0" size={18}/>
                <p className="text-blue-200">El registro de este consumo descontará el inventario del Almacén Central inmediatamente.</p>
              </div>
              <form onSubmit={handleAddConsumo} className="p-6">
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Materia Prima / Insumo</label>
                  <select required value={insumoId} onChange={e => setInsumoId(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50">
                    <option value="" disabled>Buscar insumo...</option>
                    {productos.filter(p => Number(p.stockActual) > 0).map(p => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre} (Stock: {p.stockActual})</option>)}
                  </select>
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Cantidad a Descontar</label>
                  <input type="number" min="0.01" step="0.01" required value={cantidadInsumo} onChange={e => setCantidadInsumo(Number(e.target.value))} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50" />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsConsumoOpen(false)} className="px-5 py-2.5 text-slate-300 hover:bg-white/5 rounded-xl transition-colors font-medium">Cerrar</button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/25">Registrar Consumo</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL FINALIZAR OP */}
      <AnimatePresence>
        {isFinishOpen && activeOp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1A2235] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><CheckCircle2 className="text-emerald-500"/> Finalizar Producción</h3>
                <button onClick={() => setIsFinishOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleFinishOP} className="p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mb-4">
                    <Package size={32} />
                  </div>
                  <h4 className="text-white text-lg font-medium">¿Completaste la Orden {activeOp.codigoOP}?</h4>
                  <p className="text-slate-400 text-sm mt-2">Confirma la cantidad real fabricada de <strong>{activeOp.productoFinal.nombre}</strong>. Se le asignará un Lote y aumentará tu inventario.</p>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Cantidad Real Fabricada</label>
                  <input type="number" min="0.01" step="0.01" required value={cantidadReal} onChange={e => setCantidadReal(Number(e.target.value))} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:border-emerald-500/50" />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsFinishOpen(false)} className="px-5 py-2.5 text-slate-300 hover:bg-white/5 rounded-xl transition-colors font-medium w-1/2">Cancelar</button>
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-500/25 w-1/2 flex justify-center items-center gap-2">
                    <CheckCircle2 size={18}/> Finalizar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
