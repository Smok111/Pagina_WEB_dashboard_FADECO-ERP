"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, ShoppingCart, X, Save, ArrowRight, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ComprasPage() {
  const [compras, setCompras] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [almacenes, setAlmacenes] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [proveedorId, setProveedorId] = useState("");
  const [almacenId, setAlmacenId] = useState("1");
  const [tipoDocumento, setTipoDocumento] = useState("FACTURA");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resC, resP, resA, resProd] = await Promise.all([
        fetch("/api/purchases"),
        fetch("/api/purchases/proveedores"),
        fetch("/api/inventory/almacenes"),
        fetch("/api/inventory/productos")
      ]);
      if (resC.ok) setCompras(await resC.json());
      if (resP.ok) setProveedores(await resP.json());
      if (resA.ok) setAlmacenes(await resA.json());
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
    
    setCart([...cart, { productoId: prod.id, nombre: prod.nombre, cantidad: 1, precioUnitario: Number(prod.costo) || 0 }]);
  };

  const updateCartItem = (index: number, field: string, value: number) => {
    const newCart = [...cart];
    newCart[index][field] = value;
    setCart(newCart);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Agrega al menos un producto");

    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proveedorId, almacenId, tipoDocumento, numeroDocumento,
          subtotal, igv, total,
          estado: "RECIBIDA", // Para descontar/aumentar stock inmediatamente en la demo
          detalles: cart.map(c => ({
            productoId: c.productoId,
            cantidad: c.cantidad,
            precioUnitario: c.precioUnitario,
            subtotal: c.cantidad * c.precioUnitario
          }))
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setCart([]);
        setNumeroDocumento("");
        fetchData();
      }
    } catch (error) {
      console.error("Error saving purchase:", error);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <ShoppingCart className="text-blue-500" /> Compras
          </h1>
          <p className="text-slate-400">Gestiona las compras e ingresos a almacén</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus size={18} />
          Nueva Compra
        </button>
      </div>

      <div className="bg-[#1A2235] rounded-2xl border border-white/5 overflow-hidden shadow-xl flex-1 flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#1A2235] z-10">
              <tr className="border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Cargando compras...</td>
                </tr>
              ) : compras.map((compra) => (
                <tr key={compra.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{compra.codigoSistema}</td>
                  <td className="px-6 py-4">{new Date(compra.fecha).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{compra.proveedor?.razonSocial || "N/A"}</td>
                  <td className="px-6 py-4">{compra.tipoDocumento} {compra.numeroDocumento}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border",
                      compra.estado === "RECIBIDA" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    )}>
                      {compra.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-white">
                    S/ {Number(compra.total).toFixed(2)}
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
              className="bg-[#1A2235] border border-white/10 rounded-2xl w-full max-w-4xl my-8 overflow-hidden shadow-2xl relative"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#1A2235] z-10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <PackageOpen className="text-blue-500" /> Registrar Ingreso por Compra
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Proveedor</label>
                    <select required value={proveedorId} onChange={e => setProveedorId(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50">
                      <option value="" disabled>Seleccione un proveedor...</option>
                      {proveedores.map(p => <option key={p.id} value={p.id}>{p.razonSocial}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Almacén Destino</label>
                    <select required value={almacenId} onChange={e => setAlmacenId(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50">
                      {almacenes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Tipo Comprobante</label>
                    <select value={tipoDocumento} onChange={e => setTipoDocumento(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50">
                      <option value="FACTURA">Factura</option>
                      <option value="BOLETA">Boleta</option>
                      <option value="GUIA">Guía de Remisión</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">N° Documento</label>
                    <input type="text" required value={numeroDocumento} onChange={e => setNumeroDocumento(e.target.value)} placeholder="F001-000234" className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50" />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Agregar Productos</label>
                  <select onChange={(e) => { addProductToCart(e.target.value); e.target.value = ""; }} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50">
                    <option value="">+ Seleccionar producto para agregar al carrito...</option>
                    {productos.map(p => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>)}
                  </select>
                </div>

                <div className="bg-[#0B0F19] rounded-xl border border-white/5 overflow-hidden mb-8">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-white/5 text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3 w-32">Cantidad</th>
                        <th className="px-4 py-3 w-40">Costo Unitario (S/)</th>
                        <th className="px-4 py-3 w-32 text-right">Subtotal</th>
                        <th className="px-4 py-3 w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {cart.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No hay productos en el detalle</td></tr>
                      )}
                      {cart.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 font-medium text-white">{item.nombre}</td>
                          <td className="px-4 py-3">
                            <input type="number" min="1" value={item.cantidad} onChange={e => updateCartItem(index, 'cantidad', Number(e.target.value))} className="w-full bg-transparent border-b border-white/20 focus:border-blue-500 outline-none py-1" />
                          </td>
                          <td className="px-4 py-3">
                            <input type="number" min="0" step="0.01" value={item.precioUnitario} onChange={e => updateCartItem(index, 'precioUnitario', Number(e.target.value))} className="w-full bg-transparent border-b border-white/20 focus:border-blue-500 outline-none py-1" />
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-white">
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

                <div className="flex items-start justify-between">
                  <div className="w-1/2">
                  </div>
                  <div className="w-1/3 bg-[#0B0F19] rounded-xl p-5 border border-white/5 space-y-3">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span>S/ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>IGV (18%)</span>
                      <span>S/ {igv.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-white pt-3 border-t border-white/10">
                      <span>Total</span>
                      <span>S/ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-8 mt-8 border-t border-white/5">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-300 hover:bg-white/5 rounded-xl transition-colors font-medium">
                    Cancelar
                  </button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25">
                    <Save size={18} /> Procesar Compra e Ingresar a Almacén
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