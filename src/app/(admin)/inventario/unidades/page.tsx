"use client";

import { useEffect, useState } from "react";

interface Unidad {
  id: number;
  codigoSistema: string | null;
  codigo: string;
  nombre: string;
  estado: boolean;
}

export default function UnidadesPage() {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);

  async function cargarUnidades() {
    try {
      const response = await fetch("/api/unidades-medida");

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      setUnidades(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function guardarUnidad() {
    try {
      if (editandoId) {
        const response = await fetch(
          `/api/unidades-medida/${editandoId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              codigo,
              nombre,
            }),
          }
        );

        if (!response.ok) {
          throw new Error();
        }

        setEditandoId(null);
        setCodigo("");
        setNombre("");

        await cargarUnidades();

        alert("Unidad actualizada correctamente");
        return;
      }

      const response = await fetch("/api/unidades-medida", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo,
          nombre,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      setCodigo("");
      setNombre("");

      await cargarUnidades();

      alert("Unidad creada correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al guardar unidad");
    }
  }

  function editarUnidad(unidad: Unidad) {
    setEditandoId(unidad.id);
    setCodigo(unidad.codigo);
    setNombre(unidad.nombre);
  }

  async function cambiarEstado(
    id: number,
    estado: boolean
  ) {
    try {
      const response = await fetch(
        `/api/unidades-medida/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            estado,
          }),
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      await cargarUnidades();

      alert(
        estado
          ? "Unidad activada"
          : "Unidad desactivada"
      );
    } catch (error) {
      console.error(error);
      alert("Error al cambiar estado");
    }
  }

  async function borrarUnidad(id: number) {
    const confirmar = confirm(
      "¿Deseas eliminar definitivamente esta unidad?"
    );

    if (!confirmar) return;

    try {
      const response = await fetch(
        `/api/unidades-medida/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      await cargarUnidades();

      alert("Unidad eliminada");
    } catch (error) {
      console.error(error);
      alert("No se puede eliminar");
    }
  }

  useEffect(() => {
    cargarUnidades();
  }, []);

  return (
    <main className="p-8 bg-slate-100 min-h-screen text-slate-800">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Unidades de Medida
        </h1>

        <p className="text-slate-600 mt-2">
          Administración de unidades de medida del inventario.
        </p>
      </div>

      <div className="form-card mb-8">
        <h2 className="text-xl font-semibold mb-6">
          {editandoId
            ? "Editar Unidad"
            : "Nueva Unidad"}
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Código
            </label>

            <input
              type="text"
              value={codigo}
              onChange={(e) =>
                setCodigo(e.target.value)
              }
              placeholder="KG"
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Nombre
            </label>

            <input
              type="text"
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              placeholder="Kilogramo"
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={guardarUnidad}
            className="btn btn-primary"
          >
            {editandoId
              ? "Actualizar Unidad"
              : "Guardar Unidad"}
          </button>
        </div>
      </div>

      <div className="table-card overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            Listado de Unidades
          </h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="text-left p-4">ID</th>
              <th className="text-left p-4">
                Código Sistema
              </th>
              <th className="text-left p-4">
                Código
              </th>
              <th className="text-left p-4">
                Nombre
              </th>
              <th className="text-left p-4">
                Estado
              </th>
              <th className="text-left p-4">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {unidades.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center p-8 text-slate-500"
                >
                  No existen unidades registradas.
                </td>
              </tr>
            ) : (
              unidades.map((unidad) => (
                <tr
                  key={unidad.id}
                  className="border-b hover:bg-slate-50"
                >
                  <td className="p-4">
                    {unidad.id}
                  </td>

                  <td className="p-4 font-mono">
                    {unidad.codigoSistema}
                  </td>

                  <td className="p-4">
                    {unidad.codigo}
                  </td>

                  <td className="p-4">
                    {unidad.nombre}
                  </td>

                  <td className="p-4">
                    {unidad.estado ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        Activo
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                        Inactivo
                      </span>
                    )}
                  </td>

                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() =>
                        editarUnidad(unidad)
                      }
                      className="btn btn-secondary px-3 py-1"
                    >
                      ✏️
                    </button>

                    {unidad.estado ? (
                      <button
                        onClick={() =>
                          cambiarEstado(
                            unidad.id,
                            false
                          )
                        }
                        className="btn btn-secondary px-3 py-1"
                      >
                        🚫
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          cambiarEstado(
                            unidad.id,
                            true
                          )
                        }
                        className="btn btn-primary px-3 py-1"
                      >
                        ✅
                      </button>
                    )}

                    <button
                      onClick={() =>
                        borrarUnidad(unidad.id)
                      }
                      className="btn btn-secondary px-3 py-1"
                    >
                      🗑️
                    </button>
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