"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Save, ArrowRight, Receipt, Plus, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function VentasPage() {
  const [ventas, setVentas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [clienteId, setClienteId] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("BOLETA");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [cart, setCart] = useState<any[]>([]);

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
      `S/ ${Number(c.precioUnitario).toFixed(2)}`,
      `S/ ${Number(c.subtotal).toFixed(2)}`
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
    doc.text(`Subtotal: S/ ${sub.toFixed(2)}`, 130, finalY + 10);
    doc.text(`IGV (18%): S/ ${i.toFixed(2)}`, 130, finalY + 16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`TOTAL: S/ ${tot.toFixed(2)}`, 130, finalY + 24);

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
      `S/ ${Number(d.precioUnitario).toFixed(2)}`,
      `S/ ${Number(d.subtotal).toFixed(2)}`
    ]) || [];

    (doc as any).autoTable({ head: [tableColumn], body: tableRows, startY: 60, theme: 'grid', headStyles: { fillColor: [15, 23, 42] } });

    const finalY = (doc as any).lastAutoTable.finalY || 60;
    doc.setFontSize(10);
    doc.text(`Subtotal: S/ ${Number(venta.subtotal).toFixed(2)}`, 130, finalY + 10);
    doc.text(`IGV (18%): S/ ${Number(venta.igv).toFixed(2)}`, 130, finalY + 16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`TOTAL: S/ ${Number(venta.total).toFixed(2)}`, 130, finalY + 24);

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
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Comprobante</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Cargando ventas...</td>
                </tr>
              ) : ventas.map((venta) => (
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
                    <span className="font-medium text-emerald-400">+ S/ {Number(venta.total).toFixed(2)}</span>
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
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Cliente</label>
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
                            {(item.cantidad * item.precioUnitario).toFixed(2)}
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
                      <span>S/ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>IGV (18%)</span>
                      <span>S/ {igv.toFixed(2)}</span>
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
                    <p className="text-4xl font-bold text-white">S/ {total.toFixed(2)}</p>
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
    </div>
  );
}
