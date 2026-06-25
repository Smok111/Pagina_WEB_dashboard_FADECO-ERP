"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, useAuthActions } from "@/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  FolderTree,
  Scale,
  Package,
  Warehouse,
  ShoppingCart,
  Receipt,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  MoreVertical,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/providers/AccessibilityProvider";

export default function Sidebar() {
  const { data: session, status } = useSession();
  const { signOut } = useAuthActions();
  const [isCompact, setIsCompact] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { t } = useTranslations();
  const pathname = usePathname();

  if (status === "loading") return null;
  if (!session?.user) return null;

  const menuGroups = [
    {
      label: "General",
      items: [
        { nombre: "Dashboard", icono: LayoutDashboard, ruta: "/dashboard", roles: ["SUPERADMIN", "ADMIN"] },
      ],
    },
    {
      label: "Inventario",
      items: [
        { nombre: "Categorías", icono: FolderTree, ruta: "/inventario/categorias", roles: ["SUPERADMIN", "ADMIN", "ALMACEN"] },
        { nombre: "Unidades", icono: Scale, ruta: "/inventario/unidades", roles: ["SUPERADMIN", "ADMIN", "ALMACEN"] },
        { nombre: "Productos", icono: Package, ruta: "/inventario/productos", roles: ["SUPERADMIN", "ADMIN", "ALMACEN"] },
        { nombre: "Almacenes", icono: Warehouse, ruta: "/inventario/almacenes", roles: ["SUPERADMIN", "ADMIN", "ALMACEN"] },
      ],
    },
    {
      label: "Operaciones",
      items: [
        { nombre: "Compras", icono: ShoppingCart, ruta: "/compras", roles: ["SUPERADMIN", "ADMIN", "COMPRAS"] },
        { nombre: "Ventas", icono: Receipt, ruta: "/ventas", roles: ["SUPERADMIN", "ADMIN", "VENTAS"] },
        { nombre: "Producción", icono: Building2, ruta: "/produccion", roles: ["SUPERADMIN", "ADMIN", "PRODUCCION", "OPERARIO"] },
      ],
    },
    {
      label: "Administración",
      items: [
        { nombre: "Mantenimiento", icono: Wrench, ruta: "/mantenimiento", roles: ["SUPERADMIN", "ADMIN"] },
        { nombre: "RRHH", icono: Users, ruta: "/rrhh", roles: ["SUPERADMIN", "ADMIN", "RRHH"] },
      ],
    },
    {
      label: "Configuración",
      items: [
        { nombre: "Empresa", icono: Building2, ruta: "/configuracion/empresa", roles: ["SUPERADMIN", "ADMIN"] },
        { nombre: "Usuarios", icono: Users, ruta: "/configuracion/usuarios", roles: ["SUPERADMIN", "ADMIN"] },
        { nombre: "Roles", icono: Settings, ruta: "/configuracion/roles", roles: ["SUPERADMIN", "ADMIN"] },
      ],
    },
  ];

  return (
    <motion.aside
      animate={{ width: isCompact ? 80 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-4 h-[calc(100vh-32px)] ml-4 z-50 shrink-0"
    >
      <div className="w-full h-full bg-[#0F172A] border border-slate-800 rounded-3xl text-slate-300 flex flex-col overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.3)] relative">
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between p-4 h-20 border-b border-slate-800 relative z-10 shrink-0">
          <AnimatePresence mode="popLayout">
            {!isCompact ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 overflow-hidden"
              >
                <motion.div 
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0 border border-blue-900/50 overflow-hidden p-1.5"
                >
                  <Image src="/logo-fadeco.png" alt="FADECO" width={48} height={48} className="w-full h-full object-contain" />
                </motion.div>
                <div className="whitespace-nowrap">
                  <h2 className="font-bold text-white text-base tracking-tight">FADECO ERP</h2>
                  <p className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">Enterprise</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="compact-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, -4, 0] }}
                exit={{ opacity: 0 }}
                transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
                className="w-12 h-12 mx-auto rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0 border border-blue-900/50 overflow-hidden p-1.5"
              >
                <Image src="/logo-fadeco.png" alt="FADECO" width={48} height={48} className="w-full h-full object-contain" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-hide">
          {menuGroups.map((group, index) => (
            <div key={index} className="mb-6 px-3">
              {!isCompact && (
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  {t(group.label)}
                </p>
              )}
              <ul className="space-y-1">
                {group.items.filter(item => !item.roles || item.roles.includes((session?.user as any)?.role || "ADMIN")).map((item) => {
                  const isActive = pathname === item.ruta || pathname.startsWith(`${item.ruta}/`);
                  const Icon = item.icono;

                  return (
                    <li key={item.ruta}>
                      <Link
                        href={item.ruta}
                        title={isCompact ? t(item.nombre) : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
                          "hover:translate-x-1 hover:scale-[1.02] active:scale-95",
                          isActive
                            ? "bg-gradient-to-r from-blue-600/20 to-transparent text-white"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/50 shadow-none hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="active-indicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                          />
                        )}
                        
                        <div className={cn(
                          "flex items-center justify-center shrink-0 transition-colors duration-200",
                          isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                        )}>
                          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        </div>

                        <AnimatePresence>
                          {!isCompact && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="text-sm font-medium whitespace-nowrap"
                            >
                              {t(item.nombre)}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800 shrink-0 relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-300 outline-none",
              "hover:scale-[1.02] active:scale-95",
              "hover:bg-slate-800/50 focus-visible:ring-2 focus-visible:ring-blue-500/50",
              showUserMenu && "bg-slate-800"
            )}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shrink-0 border border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] overflow-hidden">
              <span className="text-sm font-bold text-white uppercase">
                {session?.user?.name?.charAt(0) || "A"}
              </span>
            </div>
            <AnimatePresence mode="popLayout">
              {!isCompact && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 text-left overflow-hidden"
                >
                  <p className="text-sm font-bold text-white truncate">{session?.user?.name || "Administrador"}</p>
                  <p className="text-xs text-blue-300 font-medium truncate">{session?.user?.email || "admin@fadeco.com"}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {!isCompact && <MoreVertical size={16} className="text-slate-500" />}
          </button>

          <AnimatePresence>
            {showUserMenu && !isCompact && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-4 right-4 mb-2 p-1 bg-[#1E293B] border border-slate-700 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-50"
              >
                <button 
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  {t("Cerrar Sesión")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Botón Flotante fuera del overflow-hidden */}
      <button
        onClick={() => setIsCompact(!isCompact)}
        className={cn(
          "absolute -right-3 top-10 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center text-white transition-all duration-300 shadow-lg shadow-blue-500/30 z-50 outline-none",
          "hover:scale-110 active:scale-90 hover:bg-blue-500",
          isCompact && "right-2 top-auto bottom-[22px] translate-y-0 bg-slate-800 border-slate-700 hover:bg-slate-700"
        )}
      >
        {isCompact ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.aside>
  );
}