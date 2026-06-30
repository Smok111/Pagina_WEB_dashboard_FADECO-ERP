"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Settings, Package, Hammer, CheckCircle2, Play, AlertCircle, Users, Upload, FileText, Trash2, Image as ImageIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useSort } from "@/hooks/useSort";

export default function ProduccionPage() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [almacenes, setAlmacenes] = useState<any[]>([]);
  const [trabajadores, setTrabajadores] = useState<any[]>([]);
  const [areasProduccion, setAreasProduccion] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isNewOpOpen, setIsNewOpOpen] = useState(false);
  const [activeOp, setActiveOp] = useState<any>(null);
  const [isConsumoOpen, setIsConsumoOpen] = useState(false);
  const [isFinishOpen, setIsFinishOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { sortedItems: ordenesOrdenadas, sortField, sortOrder, setSortField, setSortOrder } = useSort(ordenes, "codigoOP", "desc");

  // Form states
  const [productoFinalId, setProductoFinalId] = useState("");
  const [cantidadEsperada, setCantidadEsperada] = useState(1);
  const [cantidadReal, setCantidadReal] = useState(1);
  const [destino, setDestino] = useState("STOCK");
  const [areaProduccionId, setAreaProduccionId] = useState("");
  const [responsableId, setResponsableId] = useState("");

  // Consumo form
  const [insumoId, setInsumoId] = useState("");
  const [cantidadInsumo, setCantidadInsumo] = useState(1);
  
  // Asignar & Finalizar extra
  const [selectedTrabajadores, setSelectedTrabajadores] = useState<number[]>([]);
  const [horasTrabajadas, setHorasTrabajadas] = useState(8);
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  // Carga solo las órdenes (rápido, para refrescar después de acciones)
  const refreshOrdenes = async () => {
    try {
      const res = await fetch("/api/production");
      if (res.ok) setOrdenes(await res.json());
    } catch (error) {
      console.error("Error refreshing ordenes:", error);
    }
  };

  // Carga inicial completa
  const fetchData = async () => {
    try {
      // Primero cargar órdenes para mostrar UI rápidamente
      const resOP = await fetch("/api/production");
      if (resOP.ok) setOrdenes(await resOP.json());
      setLoading(false);
      
      // Datos secundarios en paralelo (no bloquean la UI)
      const [resProd, resAlm, resTrab, resAreas] = await Promise.all([
        fetch("/api/inventory/productos"),
        fetch("/api/inventory/almacenes"),
        fetch("/api/rrhh/trabajadores"),
        fetch("/api/rrhh/areas-produccion")
      ]);
      if (resProd.ok) setProductos(await resProd.json());
      if (resAlm.ok) setAlmacenes(await resAlm.json());
      if (resTrab.ok) setTrabajadores(await resTrab.json());
      if (resAreas.ok) setAreasProduccion(await resAreas.json());
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
      body: JSON.stringify({ productoFinalId, cantidadEsperada, destino, areaProduccionId, responsableId }),
    });
    if (res.ok) {
      setIsNewOpOpen(false);
      setProductoFinalId("");
      setAreaProduccionId("");
      setResponsableId("");
      refreshOrdenes();
    }
  };

  const handleStartOP = async (id: number) => {
    const res = await fetch(`/api/production/${id}/start`, { method: "PATCH" });
    if (res.ok) refreshOrdenes();
  };

  const handleAssignWorkers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOp) return;
    const res = await fetch(`/api/production/${activeOp.id}/assign-workers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trabajadorIds: selectedTrabajadores }),
    });
    if (res.ok) {
      setIsAssignOpen(false);
      refreshOrdenes();
    }
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
      refreshOrdenes();
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
      body: JSON.stringify({ cantidadReal, horasTrabajadas, observaciones }),
    });
    if (res.ok) {
      setIsFinishOpen(false);
      refreshOrdenes();
    }
  };

  const handleDeleteOP = async (id: number) => {
    if (!confirm("¿Seguro que deseas cancelar esta Orden de Producción?")) return;
    try {
      const res = await fetch(`/api/production/${id}`, { method: "DELETE" });
      if (res.ok) {
        refreshOrdenes();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Error al eliminar");
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteConsumo = async (consumoId: number) => {
    if (!confirm("¿Seguro que deseas eliminar este consumo? El stock se devolverá al almacén.")) return;
    try {
      const res = await fetch(`/api/production/consumos/${consumoId}`, { method: "DELETE" });
      if (res.ok) refreshOrdenes();
    } catch (e) { console.error(e); }
  };

  const handleDeleteFile = async (opId: number, archivoId: number) => {
    if (!confirm("¿Seguro que deseas eliminar este archivo?")) return;
    try {
      const res = await fetch(`/api/production/${opId}/archivos/${archivoId}`, { method: "DELETE" });
      if (res.ok) refreshOrdenes();
    } catch (e) { console.error(e); }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOp || !selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`/api/production/${activeOp.id}/archivos`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setIsUploadOpen(false);
        setSelectedFile(null);
        refreshOrdenes();
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const descargarPDF = async (op: any) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text("FADECO", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Orden de Producción Finalizada", 14, 26);
    
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`OP: ${op.codigoOP}`, 14, 40);
    doc.text(`Fecha Inicio: ${new Date(op.fechaInicio).toLocaleDateString()}`, 14, 46);
    doc.text(`Fecha Fin: ${new Date(op.fechaFin).toLocaleDateString()}`, 14, 52);
    doc.text(`Producto: ${op.productoFinal?.nombre}`, 14, 58);
    doc.text(`Cantidad Producida: ${op.cantidadReal}`, 14, 64);
    doc.text(`Lote: ${op.lotes?.[0]?.numeroLote || 'N/A'}`, 14, 70);

    const tableColumn = ["Operario", "Cargo", "Cantidad Producida"];
    const tableRows = op.trabajadores && op.trabajadores.length > 0
      ? op.trabajadores.map((t: any) => [
          t.trabajador?.nombres + " " + (t.trabajador?.apellidos || ''),
          t.trabajador?.cargo?.nombre || 'Operario',
          (Number(op.cantidadReal) / op.trabajadores.length).toFixed(2)
        ])
      : [["Sin operarios asignados", "-", "-"]];

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });

    if (op.consumos && op.consumos.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || 80;
      doc.text("Materia Prima Consumida:", 14, finalY + 15);
      
      const tableColumn2 = ["Insumo", "Cantidad"];
      const tableRows2 = op.consumos.map((c: any) => [
        c.producto?.nombre,
        c.cantidad
      ]);
      
      autoTable(doc, {
        head: [tableColumn2],
        body: tableRows2,
        startY: finalY + 20,
        theme: 'grid',
        headStyles: { fillColor: [245, 158, 11] }
      });
    }

    if (op.archivos && op.archivos.length > 0) {
      const images = op.archivos.filter((a: any) => a.tipoArchivo?.includes('image'));
      if (images.length > 0) {
        for (const img of images) {
          try {
            doc.addPage();
            doc.text(`Evidencia Adjunta: ${img.nombreArchivo}`, 14, 20);
            
            const imageElement = new Image();
            imageElement.crossOrigin = "Anonymous";
            imageElement.src = img.urlArchivo;
            
            await new Promise((resolve, reject) => {
              imageElement.onload = resolve;
              imageElement.onerror = reject;
            });

            const maxW = 180;
            let imgW = imageElement.width;
            let imgH = imageElement.height;
            if (imgW > maxW) {
              imgH = (imgH * maxW) / imgW;
              imgW = maxW;
            }
            if (imgH > 250) {
              imgW = (imgW * 250) / imgH;
              imgH = 250;
            }

            doc.addImage(imageElement, 'JPEG', 15, 30, imgW, imgH);
          } catch (e) {
            console.error("Error loading image for PDF", e);
          }
        }
      }

      const pdfs = op.archivos.filter((a: any) => a.tipoArchivo?.includes('pdf'));
      if (pdfs.length > 0) {
        doc.addPage();
        doc.setTextColor(15, 23, 42);
        doc.text("Documentos Adjuntos (PDFs):", 14, 20);
        let y = 30;
        for (const pdf of pdfs) {
           doc.setTextColor(59, 130, 246);
           doc.textWithLink(pdf.nombreArchivo, 14, y, { url: pdf.urlArchivo });
           y += 10;
        }
      }
    }

    doc.save(`OP_${op.codigoOP}_Evidencia.pdf`);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Settings className="text-orange-500" /> Control de Producción
          </h1>
          <p className="text-slate-600">Órdenes de producción, consumos y lotes.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Ordenar:</span>
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
                  <div className="flex gap-1">
                    <button onClick={() => handleDeleteOP(op.id)} className="text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 tooltip-trigger" title="Cancelar Producción">
                      <Trash2 size={12} />
                    </button>
                    <button onClick={() => { setActiveOp(op); setIsUploadOpen(true); }} className="text-purple-400 hover:text-purple-300 bg-purple-500/10 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 tooltip-trigger" title="Adjuntar Archivos">
                      <Upload size={12} />
                    </button>
                    <button onClick={() => { setActiveOp(op); setSelectedTrabajadores(op.trabajadores?.map((t: any) => t.trabajadorId) || []); setIsAssignOpen(true); }} className="text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 tooltip-trigger" title="Asignar Operarios">
                      <Users size={12} />
                    </button>
                    <button onClick={() => handleStartOP(op.id)} className="text-orange-400 hover:text-orange-300 bg-orange-500/10 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors">
                      <Play size={12} /> Iniciar
                    </button>
                  </div>
                </div>
                <h4 className="text-white font-medium mb-1">{op.productoFinal.nombre}</h4>
                <p className="text-sm text-slate-400 flex items-center gap-2"><Package size={14}/> Esperado: {Number(op.cantidadEsperada)}</p>
                {op.trabajadores?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/5 text-xs text-blue-400 flex items-center gap-1">
                    <Users size={12}/> {op.trabajadores.length} operarios
                  </div>
                )}
                {op.archivos?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/5 text-xs text-slate-400 flex flex-col gap-2">
                    {op.archivos.map((a: any) => (
                      <div key={a.id} className="flex flex-col gap-1 bg-[#0B0F19]/50 p-2 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between">
                          <a href={a.urlArchivo} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline flex items-center gap-1 truncate w-[85%]">
                            {a.tipoArchivo?.includes('image') ? <ImageIcon size={10}/> : <FileText size={10}/>} 
                            <span className="truncate">{a.nombreArchivo}</span>
                          </a>
                          <button onClick={() => handleDeleteFile(op.id, a.id)} className="text-red-400 hover:text-red-300 transition-colors" title="Eliminar archivo">
                            <Trash2 size={12} />
                          </button>
                        </div>
                        {a.tipoArchivo?.includes('image') && (
                          <div className="mt-1 w-full flex justify-center bg-black/20 rounded">
                            <img src={a.urlArchivo} alt={a.nombreArchivo} className="max-h-24 object-contain rounded border border-white/10" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
                    <button onClick={() => { setActiveOp(op); setIsUploadOpen(true); }} className="text-purple-400 hover:text-purple-300 bg-purple-500/10 p-1.5 rounded-lg tooltip-trigger" title="Adjuntar Archivos">
                      <Upload size={14} />
                    </button>
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
                    {(!op.consumos || op.consumos.length === 0) && <span className="text-xs text-slate-500 italic">Sin consumos aún</span>}
                    {op.consumos?.map((c: any, i: number) => (
                      <div key={i} className="text-xs flex justify-between group items-center">
                        <span className="text-slate-300 truncate pr-2">- {c.producto?.nombre}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-300 font-mono">{Number(c.cantidad)}</span>
                          <button onClick={() => handleDeleteConsumo(c.id)} className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity" title="Eliminar Consumo">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {op.trabajadores?.length > 0 && (
                    <div className="mt-2 text-xs text-blue-400 flex items-center gap-1">
                      <Users size={12}/> {op.trabajadores.map((t:any) => t.trabajador.nombres.split(' ')[0]).join(', ')}
                    </div>
                  )}
                  {op.archivos?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/5 text-xs text-slate-400 flex flex-col gap-2">
                      {op.archivos.map((a: any) => (
                        <div key={a.id} className="flex flex-col gap-1 bg-[#0B0F19]/50 p-2 rounded-lg border border-white/5">
                          <div className="flex items-center justify-between">
                            <a href={a.urlArchivo} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline flex items-center gap-1 truncate w-[85%]">
                              {a.tipoArchivo?.includes('image') ? <ImageIcon size={10}/> : <FileText size={10}/>} 
                              <span className="truncate">{a.nombreArchivo}</span>
                            </a>
                            <button onClick={() => handleDeleteFile(op.id, a.id)} className="text-red-400 hover:text-red-300 transition-colors" title="Eliminar archivo">
                              <Trash2 size={12} />
                            </button>
                          </div>
                          {a.tipoArchivo?.includes('image') && (
                            <div className="mt-1 w-full flex justify-center bg-black/20 rounded">
                              <img src={a.urlArchivo} alt={a.nombreArchivo} className="max-h-24 object-contain rounded border border-white/10" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-2">
                      {op.codigoOP}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">{new Date(op.fechaFin).toLocaleDateString()}</span>
                  </div>
                  <button onClick={() => descargarPDF(op)} className="text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/30 p-1.5 rounded-lg transition-colors" title="Descargar Evidencia en PDF">
                    <Download size={14} />
                  </button>
                </div>
                <h4 className="text-white font-medium mb-1">{op.productoFinal.nombre}</h4>
                <div className="flex justify-between mt-3 text-sm">
                  <span className="text-slate-400">Logrado: <strong className="text-emerald-400">{Number(op.cantidadReal)}</strong></span>
                  <span className="text-emerald-400 font-mono text-xs bg-emerald-500/10 px-2 py-0.5 rounded">{op.lotes?.[0]?.numeroLote}</span>
                </div>
                {op.archivos?.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/5 text-xs text-slate-400 flex flex-col gap-2">
                    {op.archivos.map((a: any) => (
                      <div key={a.id} className="flex flex-col gap-1 bg-[#0B0F19]/50 p-2 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between">
                          <a href={a.urlArchivo} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline flex items-center gap-1 truncate w-[85%]">
                            {a.tipoArchivo?.includes('image') ? <ImageIcon size={10}/> : <FileText size={10}/>} 
                            <span className="truncate">{a.nombreArchivo}</span>
                          </a>
                          <button onClick={() => handleDeleteFile(op.id, a.id)} className="text-red-400 hover:text-red-300 transition-colors" title="Eliminar archivo">
                            <Trash2 size={12} />
                          </button>
                        </div>
                        {a.tipoArchivo?.includes('image') && (
                          <div className="mt-1 w-full flex justify-center bg-black/20 rounded">
                            <img src={a.urlArchivo} alt={a.nombreArchivo} className="max-h-24 object-contain rounded border border-white/10" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Destino de Producción</label>
                  <select required value={destino} onChange={e => setDestino(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50">
                    <option value="STOCK">Stock Interno</option>
                    <option value="PEDIDO_CLIENTE">Pedido de Cliente</option>
                  </select>
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Área de Producción</label>
                  <select required value={areaProduccionId} onChange={e => { setAreaProduccionId(e.target.value); setResponsableId(""); }} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50">
                    <option value="" disabled>Seleccione el área...</option>
                    {areasProduccion.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                </div>
                {areaProduccionId && (
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Responsable / Encargado</label>
                    <select required value={responsableId} onChange={e => setResponsableId(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50">
                      <option value="" disabled>Seleccione el responsable...</option>
                      {trabajadores.filter(t => t.areaProduccionId === Number(areaProduccionId)).map(t => (
                        <option key={t.id} value={t.id}>{t.nombres} {t.apellidos} - {t.cargo?.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}
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

                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Cantidad Real Fabricada</label>
                  <input type="number" min="0.01" step="0.01" required value={cantidadReal} onChange={e => setCantidadReal(Number(e.target.value))} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:border-emerald-500/50" />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Horas Trabajadas (Total)</label>
                    <input type="number" min="0.5" step="0.5" required value={horasTrabajadas} onChange={e => setHorasTrabajadas(Number(e.target.value))} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Observaciones Calidad</label>
                    <input type="text" value={observaciones} onChange={e => setObservaciones(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50" placeholder="Todo OK..." />
                  </div>
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

      {/* MODAL ADJUNTAR ARCHIVO */}
      <AnimatePresence>
        {isUploadOpen && activeOp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1A2235] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Upload className="text-purple-500"/> Adjuntar Archivo</h3>
                <button onClick={() => { setIsUploadOpen(false); setSelectedFile(null); }} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleUploadFile} className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Seleccionar Archivo (Imagen o PDF)</label>
                  <input type="file" accept="image/*,application/pdf" required onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => { setIsUploadOpen(false); setSelectedFile(null); }} className="px-5 py-2.5 text-slate-300 hover:bg-white/5 rounded-xl transition-colors font-medium">Cancelar</button>
                  <button type="submit" disabled={uploading || !selectedFile} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-purple-500/25 flex items-center gap-2">
                    {uploading ? <span className="animate-pulse">Subiendo...</span> : <><Upload size={18}/> Subir Archivo</>}
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
