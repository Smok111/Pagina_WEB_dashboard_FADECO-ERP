"use client";

import { useEffect, useState } from "react";

export default function EmpresaPage() {
  const [razonSocial, setRazonSocial] = useState("");
  const [ruc, setRuc] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [direccion, setDireccion] = useState("");

  async function cargarEmpresa() {
    try {
      const response = await fetch("/api/empresa");

      if (!response.ok) return;

      const data = await response.json();

      if (!data) return;

      setRazonSocial(data.razonSocial || "");
      setRuc(data.ruc || "");
      setTelefono(data.telefono || "");
      setCorreo(data.correo || "");
      setDireccion(data.direccion || "");
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    cargarEmpresa();
  }, []);

  async function guardarEmpresa() {
    try {
      const response = await fetch("/api/empresa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razonSocial,
          ruc,
          telefono,
          correo,
          direccion,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar");
      }

      alert("Empresa guardada correctamente");

      await cargarEmpresa();
    } catch (error) {
      console.error(error);
      alert("Error al guardar la empresa");
    }
  }

  return (
    <main className="p-8 bg-slate-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Datos de la Empresa</h1>
        <p className="text-slate-500 mt-2">Configura la información principal de tu organización.</p>
      </div>

      <div className="form-card">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 field-title">Razón Social</label>
            <input
              type="text"
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              placeholder="FADECO S.A.C."
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-2 field-title">RUC</label>
            <input
              type="text"
              value={ruc}
              onChange={(e) => setRuc(e.target.value)}
              placeholder="20123456789"
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-2 field-title">Teléfono</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="987654321"
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-2 field-title">Correo</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="contacto@fadeco.com"
              className="w-full"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block mb-2 field-title">Dirección</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Dirección principal"
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={guardarEmpresa} className="btn btn-primary">Guardar Información</button>
          <button type="button" className="btn btn-secondary">Cancelar</button>
        </div>
      </div>
    </main>
  );
}