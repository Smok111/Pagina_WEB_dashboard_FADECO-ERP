"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Search, Shield, X, Save, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  usuarios?: any[];
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [formData, setFormData] = useState({ nombre: "", descripcion: "" });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      if (res.ok) setRoles(await res.json());
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingRol ? `/api/roles/${editingRol.id}` : "/api/roles";
      const method = editingRol ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchRoles();
      }
    } catch (error) {
      console.error("Error saving rol:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este rol?")) return;
    try {
      const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
      if (res.ok) fetchRoles();
    } catch (error) {
      console.error("Error deleting rol:", error);
    }
  };

  const openModal = (rol?: Rol) => {
    if (rol) {
      setEditingRol(rol);
      setFormData({ nombre: rol.nombre, descripcion: rol.descripcion || "" });
    } else {
      setEditingRol(null);
      setFormData({ nombre: "", descripcion: "" });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Shield className="text-red-500" /> Roles y Permisos
          </h1>
          <p className="text-slate-600">Gestiona los niveles de acceso al sistema</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
        >
          <Plus size={18} />
          Nuevo Rol
        </button>
      </div>

      <div className="bg-[#1A2235] rounded-2xl border border-white/5 overflow-hidden shadow-xl flex-1 flex flex-col">
        <div className="p-4 border-b border-white/5 bg-white/[0.02] shrink-0">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar roles..."
              className="w-full bg-[#0B0F19] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#1A2235] z-10">
              <tr className="border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4">Usuarios Asignados</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Cargando roles...
                  </td>
                </tr>
              ) : roles.map((rol) => (
                <tr key={rol.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{rol.nombre}</td>
                  <td className="px-6 py-4 text-slate-400">{rol.descripcion || "-"}</td>
                  <td className="px-6 py-4">
                    <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-medium">
                      {rol.usuarios?.length || 0} usuarios
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(rol)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(rol.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A2235] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h3 className="text-xl font-bold text-white">
                  {editingRol ? "Editar Rol" : "Nuevo Rol"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Nombre del Rol</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                    placeholder="Ej. CAJERO, ADMINISTRADOR"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50 transition-colors min-h-[100px]"
                    placeholder="Breve descripción de los permisos..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-slate-300 hover:bg-white/5 rounded-xl transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-red-500/25"
                  >
                    <Save size={18} />
                    Guardar
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
