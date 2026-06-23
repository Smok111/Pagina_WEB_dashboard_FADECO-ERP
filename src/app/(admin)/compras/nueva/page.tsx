"use client";
import BuscadorProducto from "@/components/BuscadorProducto";
import { useEffect, useState } from "react";

interface Almacen {
  id: number;
  nombre: string;
}

export default function NuevaCompraPage() {
   const [almacenes, setAlmacenes] =
  useState<Almacen[]>([]);

const [
  productoSeleccionado,
  setProductoSeleccionado,
] = useState("");
const [cantidad, setCantidad] =
  useState(0);

const [
  precioUnitario,
  setPrecioUnitario,
] = useState(0);

const subtotal =
  cantidad * precioUnitario;
  async function cargarAlmacenes() {
  try {
    const response = await fetch(
      "/api/compras/almacenes"
    );

    const data = await response.json();

    setAlmacenes(data);
  } catch (error) {
    console.error(error);
  }
}useEffect(() => {
  cargarAlmacenes();
}, []);
  return (
    <main className="p-8 bg-slate-100 min-h-screen">
      <div className="form-card space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Nueva Compra</h1>
          <p className="text-slate-600">Registra una compra con datos de proveedor, documento y destino.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="soft-panel p-4">
            <div className="text-slate-500">Código Compra</div>
            <div className="text-slate-900 font-semibold">Automático</div>
          </div>
          <input type="date" className="w-full" />
          <input type="time" className="w-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <select className="w-full">
            <option>Seleccione Tipo Documento</option>
            <option>Boleta</option>
            <option>Factura</option>
            <option>Nota de Venta</option>
            <option>Guía</option>
          </select>
          <input placeholder="Número Documento" className="w-full" />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Datos del Proveedor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input placeholder="RUC" className="w-full" />
            <input placeholder="Razón Social" className="w-full" />
            <input placeholder="Teléfono" className="w-full" />
            <input placeholder="Correo" className="w-full" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Destino de la Compra</h2>
          <select className="w-full">
            <option value="">Seleccione Almacén</option>
            {almacenes.map((almacen) => (
              <option key={almacen.id} value={almacen.id}>{almacen.nombre}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Documento Adjunto</h2>
          <input type="file" className="w-full" />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Detalle de Productos</h2>
          <div className="card p-6">
            <div className="mb-6">
              <BuscadorProducto onSelect={(producto) => { setProductoSeleccionado(producto.nombre); }} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Producto</label>
                <input
                  value={productoSeleccionado || "Seleccione un producto"}
                  readOnly
                  className="w-full bg-slate-100"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Cantidad</label>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Precio Unitario</label>
                <input
                  type="number"
                  value={precioUnitario}
                  onChange={(e) => setPrecioUnitario(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Subtotal</label>
                <div className="rounded-2xl bg-slate-100 p-3">S/ {subtotal.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

<div className="soft-panel p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-slate-600">
              <span>Subtotal:</span>
              <strong>S/ 0.00</strong>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>IGV:</span>
              <strong>S/ 0.00</strong>
            </div>
            <div className="flex items-center justify-between text-xl font-semibold text-slate-900">
              <span>Total:</span>
              <strong>S/ 0.00</strong>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <button className="btn btn-primary">Guardar Compra</button>
          <button className="btn btn-secondary">Cancelar</button>
        </div>
      </div>
    </main>
  );
}