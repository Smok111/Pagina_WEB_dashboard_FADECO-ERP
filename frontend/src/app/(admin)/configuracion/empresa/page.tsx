"use client";

import { useState, useEffect } from "react";
import { Building2, Mail, MapPin, Phone, DollarSign, Percent, Save, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function EmpresaConfigPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    ruc: "",
    razonSocial: "",
    direccion: "",
    telefono: "",
    correo: "",
    moneda: "PEN",
    igv: 18,
  });

  useEffect(() => {
    fetch("/api/empresa")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setFormData({
            ruc: data.ruc || "",
            razonSocial: data.razonSocial || "",
            direccion: data.direccion || "",
            telefono: data.telefono || "",
            correo: data.correo || "",
            moneda: data.moneda || "PEN",
            igv: data.igv || 18,
          });
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando datos de empresa", err);
        setIsLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "igv" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/empresa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccessMsg("Datos de empresa actualizados correctamente.");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--color-background)]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
              <Building2 className="text-blue-500" size={28} />
              Perfil de Empresa
            </h1>
            <p className="text-slate-500 text-sm mt-1">Configura los datos fiscales que aparecerán en PDF, facturas y proformas.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* RUC */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FileText size={16} className="text-slate-400" />
                R.U.C.
              </label>
              <input
                type="text"
                name="ruc"
                value={formData.ruc}
                onChange={handleChange}
                required
                placeholder="Ej. 20123456789"
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 outline-none"
              />
            </div>

            {/* Razón Social */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Building2 size={16} className="text-slate-400" />
                Razón Social
              </label>
              <input
                type="text"
                name="razonSocial"
                value={formData.razonSocial}
                onChange={handleChange}
                required
                placeholder="FADECO S.A.C."
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 outline-none"
              />
            </div>

            {/* Dirección */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" />
                Dirección Fiscal
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Av. Los Pinos 123, Tarapoto"
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 outline-none"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Phone size={16} className="text-slate-400" />
                Teléfono de Contacto
              </label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+51 987 654 321"
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 outline-none"
              />
            </div>

            {/* Correo */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Mail size={16} className="text-slate-400" />
                Correo de Empresa
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="ventas@fadeco.com"
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 outline-none"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Moneda */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <DollarSign size={16} className="text-slate-400" />
                Moneda Principal
              </label>
              <select
                name="moneda"
                value={formData.moneda}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 outline-none appearance-none"
              >
                <option value="PEN">Soles (S/)</option>
                <option value="USD">Dólares ($)</option>
              </select>
            </div>

            {/* IGV */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Percent size={16} className="text-slate-400" />
                Impuesto (IGV %)
              </label>
              <input
                type="number"
                name="igv"
                value={formData.igv}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6">
            <div className="flex-1">
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-emerald-600 font-medium text-sm"
                >
                  <CheckCircle2 size={18} />
                  {successMsg}
                </motion.div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium shadow-lg transition-all duration-300 outline-none",
                "bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-95",
                isSaving && "opacity-70 cursor-not-allowed pointer-events-none"
              )}
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
