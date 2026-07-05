"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function StockAlmacenPage() {
  const params = useParams();
  const id = params.id;
  const [almacen, setAlmacen] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/inventory/almacenes/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setAlmacen(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return <main className="p-8">Cargando...</main>;
  }

  if (!almacen) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">
          Almacén no encontrado
        </h1>
      </main>
    );
  }

  return (
    <main className="p-8 bg-slate-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-3xl font-bold text-slate-800">
          {almacen.nombre}
        </h1>

        <div className="mt-4 space-y-2">
          <p>
            <strong>Código Sistema:</strong>{" "}
            {almacen.codigoSistema || almacen.codigo}
          </p>

          <p>
            <strong>Ubicación:</strong>{" "}
            {almacen.ubicacion}
          </p>

          <p>
            <strong>Responsable:</strong>{" "}
            {almacen.responsable}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm mt-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            Productos del Almacén
          </h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="text-left p-4">
                Código
              </th>

              <th className="text-left p-4">
                Producto
              </th>

              <th className="text-left p-4">
                Stock
              </th>
            </tr>
          </thead>

          <tbody>
            {(!almacen.stocks || almacen.stocks.length === 0) ? (
              <tr>
                <td
                  colSpan={3}
                  className="p-8 text-center text-slate-500"
                >
                  No existen productos asignados
                  a este almacén.
                </td>
              </tr>
            ) : (
              almacen.stocks.map((stock: any) => (
                <tr
                  key={stock.id}
                  className="border-b"
                >
                  <td className="p-4 font-mono">
                    {stock.producto.codigoSistema || stock.producto.codigo}
                  </td>

                  <td className="p-4">
                    {stock.producto.nombre}
                  </td>

                  <td className="p-4">
                    {Number(stock.stockActual)}
                  </td>
                </tr>
              ))
            )}
        </table>
      </div>

      {/* NUEVA SECCIÓN DE MAQUINARIA */}
      <div className="bg-white rounded-2xl shadow-sm mt-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            Maquinaria y Equipos
          </h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="text-left p-4">Código</th>
              <th className="text-left p-4">Nombre / Modelo</th>
              <th className="text-left p-4">Estado</th>
            </tr>
          </thead>

          <tbody>
            {(!almacen.equipos || almacen.equipos.length === 0) ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-500">
                  No hay maquinaria asignada a este almacén.
                </td>
              </tr>
            ) : (
              almacen.equipos.map((equipo: any) => (
                <tr key={equipo.id} className="border-b">
                  <td className="p-4 font-mono text-sm">
                    {equipo.codigo}
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{equipo.nombre}</div>
                    <div className="text-xs text-slate-500">{equipo.marca} {equipo.modelo}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      equipo.estado === "OPERATIVO" ? "bg-emerald-100 text-emerald-700" :
                      equipo.estado === "EN_MANTENIMIENTO" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {equipo.estado === "EN_MANTENIMIENTO" ? "En Mtto." : equipo.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}