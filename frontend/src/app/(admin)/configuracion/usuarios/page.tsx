"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Search, Users, X, Save, Mail, Briefcase, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSort } from "@/hooks/useSort";
import { SortableTableHead } from "@/components/ui/SortableTableHead";

interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  activo: boolean;
  rolId: number;
  sucursalId: number;
  rol: { nombre: string };
  sucursal: { nombre: string };
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const { sortedItems: usuariosOrdenados, sortField, sortOrder, handleSort } = useSort(usuarios, "nombres", "asc");
  const [roles, setRoles] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  
  const initialForm = {
    nombres: "", apellidos: "", email: "", password: "", rolId: "", sucursalId: "1", activo: true
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) setUsuarios(await res.json());
    } catch (error) {
      console.error("Error fetching usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      if (res.ok) setRoles(await res.json());
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PATCH" : "POST";
      
      const payload: Partial<typeof formData> = { ...formData };
      if (editingUser && !payload.password) {
        delete payload.password; // Don't send empty password when updating
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchUsuarios();
      }
    } catch (error) {
      console.error("Error saving usuario:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Desactivar/Eliminar este usuario?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) fetchUsuarios();
    } catch (error) {
      console.error("Error deleting usuario:", error);
    }
  };

  const openModal = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUser(usuario);
      setFormData({
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        password: "", // Empty so it's not changed unless user types
        rolId: String(usuario.rolId),
        sucursalId: String(usuario.sucursalId),
        activo: usuario.activo
      });
    } else {
      setEditingUser(null);
      setFormData({ ...initialForm, rolId: roles.length > 0 ? String(roles[0].id) : "" });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Users className="text-indigo-500" /> Usuarios
          </h1>
          <p className="text-slate-600">Gestiona los usuarios y sus credenciales</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
        >
          <Plus size={18} />
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-[#1A2235] rounded-2xl border border-white/5 overflow-hidden shadow-xl flex-1 flex flex-col">
        <div className="p-4 border-b border-white/5 bg-white/[0.02] shrink-0">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              className="w-full bg-[#0B0F19] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#1A2235] z-10">
              <tr className="border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <SortableTableHead label="Usuario" field="nombres" currentSortField={sortField} currentSortOrder={sortOrder} onSort={handleSort} className="px-6 py-4" />
                <SortableTableHead label="Rol" field="rol.nombre" currentSortField={sortField} currentSortOrder={sortOrder} onSort={handleSort} className="px-6 py-4" />
                <SortableTableHead label="Sucursal" field="sucursal.nombre" currentSortField={sortField} currentSortOrder={sortOrder} onSort={handleSort} className="px-6 py-4" />
                <SortableTableHead label="Estado" field="activo" currentSortField={sortField} currentSortOrder={sortOrder} onSort={handleSort} className="px-6 py-4" />
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : usuariosOrdenados.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-slate-300">
                        {user.nombres.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.nombres} {user.apellidos}</div>
                        <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                          <Mail size={12} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className="text-slate-500" />
                      <span className="font-medium text-slate-300">{user.rol?.nombre || "-"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-500" />
                      <span className="text-slate-400">{user.sucursal?.nombre || "Principal"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border",
                      user.activo 
                        ? "bg-green-500/10 text-green-400 border-green-500/20" 
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                      {user.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(user)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A2235] border border-white/10 rounded-2xl w-full max-w-xl my-8 overflow-hidden shadow-2xl relative"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#1A2235] z-10">
                <h3 className="text-xl font-bold text-white">
                  {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Nombres</label>
                    <input
                      type="text" required
                      value={formData.nombres}
                      onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                      className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Apellidos</label>
                    <input
                      type="text" required
                      value={formData.apellidos}
                      onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                      className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Correo Electrónico</label>
                  <input
                    type="email" required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Contraseña {editingUser && "(dejar en blanco para no cambiar)"}</label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Rol del Usuario</label>
                    <select
                      required
                      value={formData.rolId}
                      onChange={(e) => setFormData({ ...formData, rolId: e.target.value })}
                      className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                    >
                      <option value="" disabled>Seleccione un rol...</option>
                      {roles.map(rol => (
                        <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Estado</label>
                    <select
                      value={formData.activo ? "true" : "false"}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.value === "true" })}
                      className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-6">
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
                    Guardar Usuario
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
