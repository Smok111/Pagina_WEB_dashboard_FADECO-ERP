"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Save, ArrowRight, Receipt, Plus, Download } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useSort } from "@/hooks/useSort";
import { SortableTableHead } from "@/components/ui/SortableTableHead";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function VentasPage() {
  const [ventas, setVentas] = useState<any[]>([]);
  const { sortedItems: ventasOrdenadas, sortField, sortOrder, handleSort } = useSort(ventas, "fecha", "desc");
  const [clientes, setClientes] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    tipoDocumento: "DNI",
    numeroDocumento: "",
    nombres: "",
    apellidos: "",
    razonSocial: "",
    direccion: "",
    telefono: "",
    correo: ""
  });

  // Form State
  const [clienteId, setClienteId] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("BOLETA");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [isSearchingClient, setIsSearchingClient] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resV, resC, resProd] = await Promise.all([
        fetch("/api/sales"),
        fetch("/api/sales/clientes"),
        fetch("/api/inventory/productos")
      ]);
      if (resV.ok) setVentas(await resV.json());
      if (resC.ok) setClientes(await resC.json());
      if (resProd.ok) setProductos(await resProd.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/sales/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient)
      });
      if (res.ok) {
        const created = await res.json();
        setClientes([...clientes, created]);
        setClienteId(String(created.id));
        setIsNewClientModalOpen(false);
        setNewClient({ tipoDocumento: "DNI", numeroDocumento: "", nombres: "", apellidos: "", razonSocial: "", direccion: "", telefono: "", correo: "" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const buscarClientePorDocumento = async () => {
    if (!newClient.numeroDocumento) return;
    
    setIsSearchingClient(true);
    try {
      const endpoint = newClient.tipoDocumento === "DNI" 
        ? `/api-apis-net-pe/dni?numero=${newClient.numeroDocumento}`
        : `/api-apis-net-pe/ruc?numero=${newClient.numeroDocumento}`;
        
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (newClient.tipoDocumento === "DNI") {
          setNewClient({
            ...newClient,
            nombres: data.nombres || "",
            apellidos: `${data.apellidoPaterno || ""} ${data.apellidoMaterno || ""}`.trim(),
            razonSocial: "",
          });
        } else {
          setNewClient({
            ...newClient,
            razonSocial: data.nombre || "",
            direccion: data.direccion || "",
            nombres: "",
            apellidos: "",
          });
        }
      } else {
        alert("No se encontraron resultados para el documento ingresado.");
      }
    } catch (error) {
      console.error("Error buscando documento:", error);
    } finally {
      setIsSearchingClient(false);
    }
  };

  const addProductToCart = (productoId: string) => {
    if (!productoId) return;
    const prod = productos.find(p => p.id === Number(productoId));
    if (!prod) return;
    
    setCart([...cart, { productoId: prod.id, nombre: prod.nombre, cantidad: 1, precioUnitario: Number(prod.precioVenta) || 0, maxStock: prod.stockActual }]);
  };

  const updateCartItem = (index: number, field: string, value: number) => {
    const newCart = [...cart];
    newCart[index][field] = value;
    setCart(newCart);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  const generateProformaPDF = (vData: any, cData: any[], sub: number, i: number, tot: number) => {
    const doc = new jsPDF();
    const client = clientes.find(c => c.id === Number(clienteId));
    const clientName = client ? (client.nombres || client.razonSocial) : "Cliente Final";

    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text("FADECO Enterprise", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Proforma Comercial", 14, 26);
    
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`Proforma: ${vData.numeroDocumento}`, 14, 40);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 46);
    doc.text(`Cliente: ${clientName}`, 14, 52);

    const tableColumn = ["Producto", "Cantidad", "P. Unit", "Subtotal"];
    const tableRows = cData.map(c => [
      c.nombre,
      c.cantidad,
      formatCurrency(c.precioUnitario),
      formatCurrency(c.subtotal)
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 60;
    doc.setFontSize(10);
    doc.text(`Subtotal: ${formatCurrency(sub)}`, 130, finalY + 10);
    doc.text(`IGV (18%): ${formatCurrency(i)}`, 130, finalY + 16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`TOTAL: ${formatCurrency(tot)}`, 130, finalY + 24);

    doc.save(`Proforma_${vData.numeroDocumento}_FADECO.pdf`);
  };

  const descargarProformaAntigua = (venta: any) => {
    const doc = new jsPDF();
    const clientName = venta.cliente ? (venta.cliente.nombres || venta.cliente.razonSocial) : "Cliente Final";

    doc.setFontSize(22);
    doc.text("FADECO Enterprise", 14, 20);
    doc.setFontSize(10);
    doc.text("Proforma Comercial", 14, 26);
    
    doc.setFontSize(11);
    doc.text(`Proforma: ${venta.numeroDocumento}`, 14, 40);
    doc.text(`Fecha: ${new Date(venta.fecha).toLocaleDateString()}`, 14, 46);
    doc.text(`Cliente: ${clientName}`, 14, 52);

    const tableColumn = ["Producto", "Cantidad", "P. Unit", "Subtotal"];
    const tableRows = venta.detalles?.map((d: any) => [
      d.producto?.nombre || "N/A",
      d.cantidad,
      formatCurrency(d.precioUnitario),
      formatCurrency(d.subtotal)
    ]) || [];

    (doc as any).autoTable({ head: [tableColumn], body: tableRows, startY: 60, theme: 'grid', headStyles: { fillColor: [15, 23, 42] } });

    const finalY = (doc as any).lastAutoTable.finalY || 60;
    doc.setFontSize(10);
    doc.text(`Subtotal: ${formatCurrency(venta.subtotal)}`, 130, finalY + 10);
    doc.text(`IGV (18%): ${formatCurrency(venta.igv)}`, 130, finalY + 16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`TOTAL: ${formatCurrency(venta.total)}`, 130, finalY + 24);

    doc.save(`Proforma_${venta.numeroDocumento}_FADECO.pdf`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Agrega al menos un producto");

    const isProforma = tipoDocumento === "PROFORMA";
    const estado = isProforma ? "PENDIENTE" : "COMPLETADA";

    const vData = {
      clienteId, tipoDocumento, numeroDocumento,
      subtotal, igv, total,
      estado,
      detalles: cart.map(c => ({
        productoId: c.productoId,
        cantidad: c.cantidad,
        precioUnitario: c.precioUnitario,
        subtotal: c.cantidad * c.precioUnitario
      }))
    };

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vData),
      });

      if (res.ok) {
        if (isProforma) {
          generateProformaPDF(vData, cart, subtotal, igv, total);
        }
        setIsModalOpen(false);
        setCart([]);
        setNumeroDocumento("");
        fetchData();
      }
    } catch (error) {
      console.error("Error saving sale:", error);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Receipt className="text-emerald-500" /> Ventas (POS)
          </h1>
          <p className="text-slate-400">Punto de venta y registro de salidas</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
        >
          <Plus size={18} />
          Nueva Venta
        </button>
      </div>

      <div className="bg-[#1A2235] rounded-2xl border border-white/5 overflow-hidden shadow-xl flex-1 flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#1A2235] z-10">
              <tr className="border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <SortableTableHead label="Código" field="codigoSistema" currentSortField={sortField} currentSortOrder={sortOrder} onSort={handleSort} className="px-6 py-4" />
                <SortableTableHead label="Fecha" field="fecha" currentSortField={sortField} currentSortOrder={sortOrder} onSort={handleSort} className="px-6 py-4" />
                <SortableTableHead label="Cliente" field="cliente.nombres" currentSortField={sortField} currentSortOrder={sortOrder} onSort={handleSort} className="px-6 py-4" />
                <SortableTableHead label="Comprobante" field="tipoDocumento" currentSortField={sortField} currentSortOrder={sortOrder} onSort={handleSort} className="px-6 py-4" />
                <SortableTableHead label="Total" field="total" currentSortField={sortField} currentSortOrder={sortOrder} onSort={handleSort} align="right" className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Cargando ventas...</td>
                </tr>
              ) : ventasOrdenadas.map((venta) => (
                <tr key={venta.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{venta.codigoSistema}</td>
                  <td className="px-6 py-4">{new Date(venta.fecha).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{venta.cliente?.nombres || venta.cliente?.razonSocial || "Cliente Final"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${venta.tipoDocumento === 'PROFORMA' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-slate-300'}`}>
                      {venta.tipoDocumento} {venta.numeroDocumento}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end items-center gap-3">
                    {venta.tipoDocumento === 'PROFORMA' && (
                      <button onClick={() => descargarProformaAntigua(venta)} className="text-red-400 hover:text-red-300 transition-colors" title="Descargar Proforma">
                        <Download size={18} />
                      </button>
                    )}
                    <span className="font-medium text-emerald-400">+ {formatCurrency(venta.total)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A2235] border border-white/10 rounded-2xl w-full max-w-5xl my-8 overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-20">
                <X size={20} />
              </button>

              {/* Lado Izquierdo: Formulario de Venta y Carrito */}
              <div className="w-full md:w-2/3 p-6 flex flex-col border-r border-white/5">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Receipt className="text-emerald-500" /> Registro de Venta
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-medium text-slate-400">Cliente</label>
                      <button type="button" onClick={() => setIsNewClientModalOpen(true)} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
                        <Plus size={12}/> Nuevo Cliente
                      </button>
                    </div>
                    <select required value={clienteId} onChange={e => setClienteId(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500/50">
                      <option value="" disabled>Seleccione un cliente...</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nombres || c.razonSocial}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">N° Comprobante</label>
                    <div className="flex gap-2">
                      <select value={tipoDocumento} onChange={e => setTipoDocumento(e.target.value)} className="w-1/2 bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500/50">
                        <option value="BOLETA">Boleta</option>
                        <option value="FACTURA">Factura</option>
                        <option value="PROFORMA">Proforma (Sin descontar stock)</option>
                      </select>
                      <input type="text" required value={numeroDocumento} onChange={e => setNumeroDocumento(e.target.value)} placeholder="0001" className="w-1/2 bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <select onChange={(e) => { addProductToCart(e.target.value); e.target.value = ""; }} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 text-sm">
                    <option value="">+ Buscar producto para añadir a la venta (por código o nombre)...</option>
                    {productos.filter(p => Number(p.stockActual) > 0).map(p => (
                      <option key={p.id} value={p.id}>{p.codigo} - {p.nombre} (Stock: {p.stockActual})</option>
                    ))}
                  </select>
                </div>

                <div className="bg-[#0B0F19] rounded-xl border border-white/5 overflow-y-auto flex-1 min-h-[200px]">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-white/5 text-slate-400 sticky top-0 bg-[#0B0F19] z-10">
                      <tr>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3 w-24">Cant.</th>
                        <th className="px-4 py-3 w-32">Precio (S/)</th>
                        <th className="px-4 py-3 w-28 text-right">Subtotal</th>
                        <th className="px-4 py-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {cart.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Agrega productos a la venta</td></tr>
                      )}
                      {cart.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 font-medium text-white truncate max-w-[150px]">{item.nombre}</td>
                          <td className="px-4 py-3">
                            <input type="number" min="1" max={item.maxStock} value={item.cantidad} onChange={e => updateCartItem(index, 'cantidad', Number(e.target.value))} className="w-full bg-transparent border-b border-white/20 focus:border-emerald-500 outline-none py-1 text-center" />
                          </td>
                          <td className="px-4 py-3">
                            <input type="number" min="0" step="0.01" value={item.precioUnitario} onChange={e => updateCartItem(index, 'precioUnitario', Number(e.target.value))} className="w-full bg-transparent border-b border-white/20 focus:border-emerald-500 outline-none py-1" />
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-emerald-400">
                            {formatCurrency(item.cantidad * item.precioUnitario).replace('S/ ', '')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button type="button" onClick={() => setCart(cart.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-300"><X size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lado Derecho: Totales y Cobro */}
              <div className="w-full md:w-1/3 bg-[#0B0F19] p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Resumen de Venta</h4>
                  
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between text-slate-300">
                      <span>Subtotal Operación</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>IGV (18%)</span>
                      <span>{formatCurrency(igv)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Descuento Global</span>
                      <span className="text-red-400">- S/ 0.00</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="bg-[#1A2235] rounded-xl p-5 border border-white/5 mb-6 text-center">
                    <p className="text-slate-400 text-sm mb-1">TOTAL A COBRAR</p>
                    <p className="text-4xl font-bold text-white">{formatCurrency(total)}</p>
                  </div>

                  <div className="space-y-3">
                    <button type="submit" onClick={handleSubmit} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] ${tipoDocumento === 'PROFORMA' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 text-white' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25 text-white'}`}>
                      {tipoDocumento === 'PROFORMA' ? 'Guardar y Generar PDF' : 'Cobrar y Emitir'}
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 py-3 rounded-xl font-medium transition-colors">
                      Cancelar Operación
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNewClientModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A2235] border border-white/10 rounded-2xl w-full max-w-lg my-8 overflow-hidden shadow-2xl relative"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#1A2235]">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="text-emerald-500" /> Nuevo Cliente
                </h3>
                <button onClick={() => setIsNewClientModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateClient} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Tipo de Documento *</label>
                    <select value={newClient.tipoDocumento} onChange={e => setNewClient({...newClient, tipoDocumento: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500/50">
                      <option value="DNI">DNI</option>
                      <option value="RUC">RUC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">N° Documento *</label>
                    <div className="flex gap-2">
                      <input type="text" required value={newClient.numeroDocumento} onChange={e => setNewClient({...newClient, numeroDocumento: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" />
                      <button type="button" onClick={buscarClientePorDocumento} disabled={isSearchingClient} className="bg-[#0B0F19] border border-white/10 rounded-xl px-3 text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0">
                        {isSearchingClient ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div> : <Search size={18} />}
                      </button>
                    </div>
                  </div>
                  {newClient.tipoDocumento === "RUC" ? (
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Razón Social *</label>
                      <input type="text" required value={newClient.razonSocial} onChange={e => setNewClient({...newClient, razonSocial: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Nombres *</label>
                        <input type="text" required value={newClient.nombres} onChange={e => setNewClient({...newClient, nombres: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Apellidos</label>
                        <input type="text" value={newClient.apellidos} onChange={e => setNewClient({...newClient, apellidos: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" />
                      </div>
                    </>
                  )}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Dirección</label>
                    <input type="text" value={newClient.direccion} onChange={e => setNewClient({...newClient, direccion: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Teléfono</label>
                    <input type="text" value={newClient.telefono} onChange={e => setNewClient({...newClient, telefono: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Correo</label>
                    <input type="email" value={newClient.correo} onChange={e => setNewClient({...newClient, correo: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button type="button" onClick={() => setIsNewClientModalOpen(false)} className="px-5 py-2.5 text-slate-300 hover:bg-white/5 rounded-xl transition-colors font-medium text-sm">
                    Cancelar
                  </button>
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25 text-sm">
                    <Save size={16} /> Guardar Cliente
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
