"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);

  const menuItems = [
    { nombre: "Dashboard", icono: "📊", ruta: "/dashboard" },
    { nombre: "Empresa", icono: "🏢", ruta: "/empresa" },
    { nombre: "Categorías", icono: "📂", ruta: "/inventario/categorias" },
    { nombre: "Unidades", icono: "📏", ruta: "/inventario/unidades" },
    { nombre: "Productos", icono: "📦", ruta: "/inventario/productos" },
    { nombre: "Almacenes", icono: "🏬", ruta: "/inventario/almacenes" },
    { nombre: "Compras", icono: "🛒", ruta: "/compras" },
    { nombre: "Ventas", icono: "💰", ruta: "/ventas" },
  ];

  return (
    <aside
      className={`min-h-screen bg-slate-900 text-white border-r border-slate-800 transition-smooth ${
        compact ? "w-20" : "w-72"
      }`}
    >
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg fadeco-gradient flex items-center justify-center overflow-hidden">
            <img src="/logo-fadeco.png" alt="FADECO" className="h-full w-full object-contain" />
          </div>

          {!compact && (
            <div>
              <h2 className="font-bold text-lg">FADECO ERP</h2>
              <p className="text-xs text-slate-300">Sistema Empresarial</p>
            </div>
          )}
        </div>

        <button
          aria-label="Toggle sidebar"
          className="text-slate-300 hover:text-white p-2 rounded-md"
          onClick={() => setCompact((s) => !s)}
        >
          {compact ? "➡️" : "⬅️"}
        </button>
      </div>

      <nav className="p-3">
        <p className={`text-xs uppercase text-slate-500 mb-3 ${compact ? "hidden" : "block"}`}>
          Navegación
        </p>

        <ul className="space-y-2">
          {menuItems.map((item) => {
            const active = pathname === item.ruta;

            return (
              <li key={item.ruta}>
                <Link
                  href={item.ruta}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-smooth ${
                    active
                      ? "bg-red-600 text-white shadow-md"
                      : "hover:bg-slate-800 text-slate-200"
                  }`}
                >
                  <span className="w-9 h-9 flex items-center justify-center bg-white/6 rounded-lg text-base">
                    {item.icono}
                  </span>

                  {!compact && <span>{item.nombre}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={`mt-6 ${compact ? "hidden" : "block"}`}>
          <p className="text-xs uppercase text-slate-500 mb-2">Usuario</p>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">A</div>
            <div>
              <p className="text-sm font-semibold">Administrador</p>
              <p className="text-xs text-slate-400">administrador@fadeco.com</p>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}