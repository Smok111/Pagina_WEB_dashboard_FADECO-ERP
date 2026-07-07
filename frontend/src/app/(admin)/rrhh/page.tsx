"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Users, Briefcase, MapPin, Search, Trash2, FileSpreadsheet, Shield, HardHat, ClipboardList, Calendar, Package } from "lucide-react";
import { useSort } from "@/hooks/useSort";
import { toast } from "sonner";

export default function RrhhPage() {
  const [activeTab, setActiveTab] = useState<"personal" | "epp">("personal");

  // --- PERSONAL STATE ---
  const [trabajadores, setTrabajadores] = useState<any[]>([]);
  const { sortedItems: trabajadoresOrdenados, sortField, sortOrder, setSortField, setSortOrder } = useSort(trabajadores, "nombres", "asc");
  const [areas, setAreas] = useState<any[]>([]);
  const [areasProduccion, setAreasProduccion] = useState<any[]>([]);
  const [cargos, setCargos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [dni, setDni] = useState("");
  const [codigoInterno, setCodigoInterno] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [areaId, setAreaId] = useState("");
  const [cargoId, setCargoId] = useState("");
  const [areaProduccionId, setAreaProduccionId] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [salarioBase, setSalarioBase] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EPP STATE ---
  const [entregasEPP, setEntregasEPP] = useState<any[]>([]);
  const [loadingEPP, setLoadingEPP] = useState(false);
  const [isEPPModalOpen, setIsEPPModalOpen] = useState(false);
  const [isKardexModalOpen, setIsKardexModalOpen] = useState(false);
  const [kardexTrabajador, setKardexTrabajador] = useState<any>(null);
  const [kardexData, setKardexData] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [almacenes, setAlmacenes] = useState<any[]>([]);
  const [eppSearchTerm, setEppSearchTerm] = useState("");

  // EPP Form state
  const [eppTrabajadorId, setEppTrabajadorId] = useState("");
  const [eppProductoId, setEppProductoId] = useState("");
  const [eppAlmacenId, setEppAlmacenId] = useState("");
  const [eppCantidad, setEppCantidad] = useState("1");
  const [eppFecha, setEppFecha] = useState(new Date().toISOString().split("T")[0]);
  const [eppObservacion, setEppObservacion] = useState("");
  const [eppProductSearch, setEppProductSearch] = useState("");
  const [showEppProductDropdown, setShowEppProductDropdown] = useState(false);

  const filteredEppProducts = productos.filter(p =>
    p.nombre.toLowerCase().includes(eppProductSearch.toLowerCase()) ||
    (p.codigo && p.codigo.toLowerCase().includes(eppProductSearch.toLowerCase()))
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const procesarImportacion = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/rrhh/trabajadores/import", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Se importaron ${data.imported} trabajadores exitosamente.`);
        setIsImportModalOpen(false);
        setSelectedFile(null);
        fetchData();
      } else {
        toast.error("Error al importar trabajadores");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al importar trabajadores");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === "epp") {
      fetchEPPData();
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [resT, resA, resC, resAP] = await Promise.all([
        fetch("/api/rrhh/trabajadores"),
        fetch("/api/rrhh/areas"),
        fetch("/api/rrhh/cargos"),
        fetch("/api/rrhh/areas-produccion")
      ]);
      if (resT.ok) setTrabajadores(await resT.json());
      if (resA.ok) setAreas(await resA.json());
      if (resC.ok) setCargos(await resC.json());
      if (resAP.ok) setAreasProduccion(await resAP.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEPPData = async () => {
    setLoadingEPP(true);
    try {
      const [resEPP, resProd, resAlm] = await Promise.all([
        fetch("/api/rrhh/entregas-epp"),
        fetch("/api/inventory/productos"),
        fetch("/api/inventory/almacenes"),
      ]);
      if (resEPP.ok) setEntregasEPP(await resEPP.json());
      if (resProd.ok) setProductos(await resProd.json());
      if (resAlm.ok) setAlmacenes(await resAlm.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingEPP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/rrhh/trabajadores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombres, apellidos, dni, codigoInterno, telefono, correo, direccion, areaId, cargoId, areaProduccionId, fechaIngreso, salarioBase }),
    });
    if (res.ok) {
      setIsModalOpen(false);
      fetchData();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este trabajador?")) return;
    const res = await fetch(`/api/rrhh/trabajadores/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchData();
    }
  };

  const handleSubmitEPP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eppTrabajadorId || !eppProductoId || !eppAlmacenId) {
      toast.warning("Complete todos los campos obligatorios");
      return;
    }
    try {
      const res = await fetch("/api/rrhh/entregas-epp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trabajadorId: eppTrabajadorId,
          productoId: eppProductoId,
          almacenId: eppAlmacenId,
          cantidad: eppCantidad,
          fecha: eppFecha,
          observacion: eppObservacion,
        }),
      });
      if (res.ok) {
        toast.success("EPP entregado exitosamente. Stock descontado.");
        setIsEPPModalOpen(false);
        resetEPPForm();
        fetchEPPData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Error al registrar la entrega");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar la entrega EPP");
    }
  };

  const resetEPPForm = () => {
    setEppTrabajadorId("");
    setEppProductoId("");
    setEppAlmacenId("");
    setEppCantidad("1");
    setEppFecha(new Date().toISOString().split("T")[0]);
    setEppObservacion("");
    setEppProductSearch("");
  };

  const abrirKardexTrabajador = async (trab: any) => {
    setKardexTrabajador(trab);
    setIsKardexModalOpen(true);
    setKardexData([]);
    try {
      const res = await fetch(`/api/rrhh/entregas-epp/trabajador/${trab.id}`);
      if (res.ok) setKardexData(await res.json());
    } catch (e) {
      toast.error("Error al cargar el Kardex EPP");
    }
  };

  const entregasFiltradas = entregasEPP.filter(e => {
    const search = eppSearchTerm.toLowerCase();
    return (
      e.trabajador?.nombres?.toLowerCase().includes(search) ||
      e.trabajador?.apellidos?.toLowerCase().includes(search) ||
      e.trabajador?.dni?.includes(search) ||
      e.producto?.nombre?.toLowerCase().includes(search) ||
      e.producto?.codigo?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Users className="text-fuchsia-500" /> Recursos Humanos
          </h1>
          <p className="text-slate-600">Directorio de personal y gestión de EPP</p>
        </div>
        <div className="flex gap-3">
          {activeTab === "personal" && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
              >
                <FileSpreadsheet size={18} />
                Importar Excel
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-fuchsia-500/25"
              >
                <Plus size={18} />
                Nuevo Trabajador
              </button>
            </>
          )}
          {activeTab === "epp" && (
            <button
              onClick={() => setIsEPPModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-amber-500/25"
            >
              <HardHat size={18} />
              Nueva Entrega EPP
            </button>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-1 mb-6 bg-[#1A2235] p-1 rounded-xl w-fit border border-white/5">
        <button
          onClick={() => setActiveTab("personal")}
          className={`px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
            activeTab === "personal"
              ? "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/25"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Users size={16} /> Personal
        </button>
        <button
          onClick={() => setActiveTab("epp")}
          className={`px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
            activeTab === "epp"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-500/25"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Shield size={16} /> Kardex EPP
        </button>
      </div>

      {/* ===== TAB: PERSONAL ===== */}
      {activeTab === "personal" && (
        <div className="bg-[#1A2235] rounded-2xl border border-white/5 overflow-hidden shadow-xl flex-1 flex flex-col">
          <div className="p-4 border-b border-white/5 flex gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por DNI o Nombre..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0B0F19] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-fuchsia-500/50" 
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-slate-400">Ordenar por:</span>
              <select 
                className="bg-[#0B0F19] text-white text-sm rounded-xl px-3 py-2 border border-white/10 focus:outline-none"
                value={`${sortField}-${sortOrder}`}
                onChange={(e) => {
                  const [f, o] = e.target.value.split('-');
                  setSortField(f);
                  setSortOrder(o as any);
                }}
              >
                 <option value="nombres-asc">Nombres (A-Z)</option>
                 <option value="nombres-desc">Nombres (Z-A)</option>
                 <option value="apellidos-asc">Apellidos (A-Z)</option>
                 <option value="dni-asc">DNI</option>
                 <option value="salarioBase-desc">Mayor Salario</option>
              </select>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center text-slate-500">Cargando personal...</div>
            ) : trabajadoresOrdenados.filter(t => {
              const search = searchTerm.toLowerCase();
              return (
                t.nombres.toLowerCase().includes(search) ||
                t.apellidos.toLowerCase().includes(search) ||
                t.dni.includes(search) ||
                (t.codigoInterno && t.codigoInterno.toLowerCase().includes(search))
              );
            }).map(t => (
              <div key={t.id} className="bg-[#0B0F19] p-5 rounded-2xl border border-white/5 flex items-start gap-4 hover:border-fuchsia-500/30 transition-colors">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-fuchsia-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {t.nombres[0]}{t.apellidos[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold truncate">{t.nombres} {t.apellidos}</h3>
                  <p className="text-slate-400 text-sm mb-3">DNI: {t.dni} {t.codigoInterno && `| Cod: ${t.codigoInterno}`}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mb-1">
                    <MapPin size={14} className="text-fuchsia-400"/> {t.area?.nombre} {t.areaProduccion && `(${t.areaProduccion.nombre})`}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Briefcase size={14} className="text-fuchsia-400"/> {t.cargo?.nombre}
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button 
                    onClick={() => abrirKardexTrabajador(t)}
                    className="text-slate-500 hover:text-amber-400 p-2 rounded-lg hover:bg-amber-500/10 transition-colors"
                    title="Kardex EPP"
                  >
                    <Shield size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(t.id)} 
                    className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== TAB: KARDEX EPP ===== */}
      {activeTab === "epp" && (
        <div className="bg-[#1A2235] rounded-2xl border border-white/5 overflow-hidden shadow-xl flex-1 flex flex-col">
          <div className="p-4 border-b border-white/5 flex gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por trabajador, DNI o producto..." 
                value={eppSearchTerm}
                onChange={(e) => setEppSearchTerm(e.target.value)}
                className="w-full bg-[#0B0F19] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-amber-500/50" 
              />
            </div>
          </div>
          <div className="overflow-auto flex-1 w-full">
            <table className="w-full text-left min-w-[900px]">
              <thead className="sticky top-0 bg-[#1A2235] z-10">
                <tr className="border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Trabajador</th>
                  <th className="px-6 py-4">DNI</th>
                  <th className="px-6 py-4">EPP / Producto</th>
                  <th className="px-6 py-4">Almacén</th>
                  <th className="px-6 py-4 text-center">Cant.</th>
                  <th className="px-6 py-4">Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                {loadingEPP ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Cargando entregas EPP...</td></tr>
                ) : entregasFiltradas.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No hay entregas EPP registradas.</td></tr>
                ) : entregasFiltradas.map(e => (
                  <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{new Date(e.fecha).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">{e.trabajador?.nombres} {e.trabajador?.apellidos}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{e.trabajador?.dni}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <HardHat size={16} className="text-amber-400 shrink-0" />
                        <div>
                          <span className="text-white font-medium">{e.producto?.nombre}</span>
                          <span className="text-slate-500 text-xs ml-2">({e.producto?.codigo})</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{e.almacen?.nombre}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold">
                        {e.cantidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs max-w-[200px] truncate">{e.observacion || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== MODALES ===== */}
      <AnimatePresence>
        {/* Modal Nuevo Trabajador */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1A2235] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Users className="text-fuchsia-500"/> Registrar Trabajador</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
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
                    <label className="block text-sm font-medium text-slate-400 mb-2">Código Interno</label>
                    <input type="text" value={codigoInterno} onChange={e => setCodigoInterno(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Teléfono</label>
                    <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Correo</label>
                    <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Dirección</label>
                    <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Fecha de Ingreso</label>
                    <input type="date" required value={fechaIngreso} onChange={e => setFechaIngreso(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Salario Base (S/)</label>
                    <input type="number" step="0.01" required value={salarioBase} onChange={e => setSalarioBase(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Área Administrativa</label>
                    <select required value={areaId} onChange={e => setAreaId(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50">
                      <option value="" disabled>Seleccionar área...</option>
                      {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Área Producción (Opcional)</label>
                    <select value={areaProduccionId} onChange={e => setAreaProduccionId(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50">
                      <option value="">No aplica...</option>
                      {areasProduccion.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Cargo</label>
                    <select required value={cargoId} onChange={e => setCargoId(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50">
                      <option value="" disabled>Seleccionar cargo...</option>
                      {cargos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
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

        {/* Modal Importar Excel */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1A2235] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><FileSpreadsheet className="text-emerald-500"/> Importación Masiva</h3>
                <button onClick={() => { setIsImportModalOpen(false); setSelectedFile(null); }} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="bg-[#0B0F19] p-4 rounded-xl border border-white/5 text-sm text-slate-300">
                  <p className="font-semibold text-white mb-2">Instrucciones:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Sube un archivo `.xlsx` o `.csv`</li>
                    <li>Las columnas recomendadas son: <strong>DNI, Nombres, Apellidos, CodigoInterno, Area, Cargo, Salario</strong></li>
                    <li>El sistema autogenerará las áreas y cargos si no existen.</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-400">Seleccionar archivo Excel/CSV</label>
                  <input
                    type="file"
                    accept=".xlsx, .csv"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50 cursor-pointer"
                  />
                </div>
                
                {selectedFile && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center justify-between">
                    <span className="text-emerald-400 text-sm font-medium">Archivo seleccionado: {selectedFile.name}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-white/5">
                <button onClick={() => { setIsImportModalOpen(false); setSelectedFile(null); }} className="px-5 py-2.5 text-slate-300 hover:bg-white/5 rounded-xl transition-colors font-medium">Cancelar</button>
                <button onClick={procesarImportacion} disabled={!selectedFile} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-500/25">Importar Trabajadores</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal Nueva Entrega EPP */}
        {isEPPModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1A2235] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><HardHat className="text-amber-500"/> Registrar Entrega de EPP</h3>
                <button type="button" onClick={() => { setIsEPPModalOpen(false); resetEPPForm(); }} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmitEPP} className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-5 mb-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Trabajador *</label>
                    <select required value={eppTrabajadorId} onChange={e => setEppTrabajadorId(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50">
                      <option value="" disabled>Seleccionar trabajador...</option>
                      {trabajadores.map(t => <option key={t.id} value={t.id}>{t.nombres} {t.apellidos} — DNI: {t.dni}</option>)}
                    </select>
                  </div>

                  <div className="col-span-2 relative">
                    <label className="block text-sm font-medium text-slate-400 mb-2">EPP / Producto *</label>
                    <input
                      type="text"
                      placeholder="Buscar EPP por nombre o código..."
                      value={eppProductSearch}
                      onChange={(e) => {
                        setEppProductSearch(e.target.value);
                        setShowEppProductDropdown(true);
                        setEppProductoId("");
                      }}
                      onFocus={() => setShowEppProductDropdown(true)}
                      className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 text-sm"
                    />
                    
                    {showEppProductDropdown && (
                      <div className="fixed inset-0 z-10" onClick={() => setShowEppProductDropdown(false)} />
                    )}

                    {showEppProductDropdown && (
                      <div className="absolute z-20 w-full mt-1 bg-[#1A2235] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                        {filteredEppProducts.length === 0 ? (
                          <div className="p-4 text-slate-400 text-sm text-center">No se encontraron productos</div>
                        ) : (
                          filteredEppProducts.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 text-slate-300 text-sm focus:bg-white/5 outline-none transition-colors flex justify-between items-center"
                              onClick={() => {
                                setEppProductoId(String(p.id));
                                setEppProductSearch(`${p.codigo} — ${p.nombre}`);
                                setShowEppProductDropdown(false);
                              }}
                            >
                              <span><span className="font-medium text-white">{p.codigo}</span> — {p.nombre}</span>
                              <span className="text-amber-400 font-medium whitespace-nowrap ml-2">(Stock: {Number(p.stockActual)})</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Almacén de Origen *</label>
                    <select required value={eppAlmacenId} onChange={e => setEppAlmacenId(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50">
                      <option value="" disabled>Seleccionar almacén...</option>
                      {almacenes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Cantidad</label>
                    <input type="number" min="1" value={eppCantidad} onChange={e => setEppCantidad(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Fecha de Entrega</label>
                    <input type="date" value={eppFecha} onChange={e => setEppFecha(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Observación</label>
                    <input type="text" value={eppObservacion} onChange={e => setEppObservacion(e.target.value)} placeholder="Opcional..." className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                  <button type="button" onClick={() => { setIsEPPModalOpen(false); resetEPPForm(); }} className="px-5 py-2.5 text-slate-300 hover:bg-white/5 rounded-xl transition-colors font-medium">Cancelar</button>
                  <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-amber-500/25 flex items-center gap-2">
                    <HardHat size={18} /> Registrar Entrega
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal Kardex EPP por Trabajador */}
        {isKardexModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1A2235] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ClipboardList className="text-amber-500"/> Kardex EPP
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Historial de entregas para: <span className="text-white font-medium">{kardexTrabajador?.nombres} {kardexTrabajador?.apellidos}</span> (DNI: {kardexTrabajador?.dni})
                  </p>
                </div>
                <button type="button" onClick={() => setIsKardexModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {kardexData.length === 0 ? (
                  <div className="text-center text-slate-500 py-12">
                    <HardHat size={48} className="mx-auto mb-4 text-slate-600" />
                    <p>Este trabajador no tiene entregas EPP registradas.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {kardexData.map(e => (
                      <div key={e.id} className="bg-[#0B0F19] p-4 rounded-xl border border-white/5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                          <HardHat size={20} className="text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium">{e.producto?.nombre} <span className="text-slate-500 text-xs">({e.producto?.codigo})</span></p>
                          <p className="text-slate-400 text-xs mt-1">
                            <Calendar size={12} className="inline mr-1" />
                            {new Date(e.fecha).toLocaleDateString()} · Almacén: {e.almacen?.nombre}
                            {e.observacion && ` · ${e.observacion}`}
                          </p>
                        </div>
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-1.5 rounded-full text-sm font-bold shrink-0">
                          × {e.cantidad}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end p-5 border-t border-white/5">
                <button onClick={() => setIsKardexModalOpen(false)} className="px-5 py-2.5 text-slate-300 hover:bg-white/5 rounded-xl transition-colors font-medium">Cerrar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
