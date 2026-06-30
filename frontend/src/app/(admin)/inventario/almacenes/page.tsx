"use client";

import { useEffect, useState } from "react";
import { useSort } from "@/hooks/useSort";
import { SortableTableHead } from "@/components/ui/SortableTableHead";

interface Almacén {
  id: number;
  codigoSistema: string;
  codigo: string;
  nombre: string;
  ubicacion: string;
  responsable: string;
  estado: boolean;
}

export default function AlmacenesPage() {
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);

  const { sortedItems: almacenesOrdenados, sortField, sortOrder, handleSort } = useSort(almacenes, "id");

  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [responsable, setResponsable] = useState("");

  const [editandoId, setEditandoId] =
    useState<number | null>(null);

  async function cargarAlmacenes() {
    try {
      const response = await fetch(
        "/api/inventory/almacenes"
      );

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setAlmacenes(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function guardarAlmacen() {
    try {
      if (editandoId) {
        const response = await fetch(
          `/api/inventory/almacenes`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              id: editandoId,
              nombre,
              ubicacion,
              responsable,
            }),
          }
        );

        if (!response.ok) {
          throw new Error();
        }

        setEditandoId(null);
      } else {
        const response = await fetch(
          "/api/inventory/almacenes",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              nombre,
              ubicacion,
              responsable,
            }),
          }
        );

        if (!response.ok) {
          throw new Error();
        }
      }

      setNombre("");
      setUbicacion("");
      setResponsable("");

      await cargarAlmacenes();

      alert("Almacén guardado correctamente");
    } catch (error) {
      console.error(error);

      alert("Error al guardar almacén");
    }
  }

  function editarAlmacen(
    almacen: Almacén
  ) {
    setEditandoId(almacen.id);

    setNombre(almacen.nombre);

    setUbicacion(
      almacen.ubicacion ?? ""
    );

    setResponsable(
      almacen.responsable ?? ""
    );
  }

  async function cambiarEstado(
    id: number,
    estadoActual: boolean
  ) {
    try {
      const response = await fetch(
        `/api/inventory/almacenes/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            estado: !estadoActual,
          }),
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      await cargarAlmacenes();
    } catch (error) {
      console.error(error);
    }
  }

  async function eliminarAlmacen(
    id: number
  ) {
    const confirmar = confirm(
      "¿Deseas eliminar este almacén?"
    );

    if (!confirmar) return;

    try {
      const response = await fetch(
        `/api/inventory/almacenes/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      await cargarAlmacenes();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    cargarAlmacenes();
  }, []);

  return (
    <main className="p-8 bg-slate-100 min-h-screen text-slate-800">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Almacenes
        </h1>

        <p className="text-slate-600 mt-2">
          Administración de almacenes.
        </p>
      </div>

      <div className="form-card mb-8">
        <h2 className="text-xl font-semibold mb-6">
          {editandoId
            ? "Editar Almacén"
            : "Nuevo Almacén"}
        </h2>

        <div className="grid grid-cols-2 gap-6">

          <div className="soft-panel p-4 text-slate-600">
            <div className="font-semibold">Código Sistema</div>
            <div>Automático</div>
          </div>

          <input
            value={nombre}
            onChange={(e) =>
              setNombre(e.target.value)
            }
            placeholder="Nombre"
            className="w-full"
          />

          <input
            value={ubicacion}
            onChange={(e) =>
              setUbicacion(
                e.target.value
              )
            }
            placeholder="Ubicación"
            className="w-full"
          />

          <input
            value={responsable}
            onChange={(e) =>
              setResponsable(
                e.target.value
              )
            }
            placeholder="Responsable"
            className="w-full"
          />
        </div>

        <button
          onClick={guardarAlmacen}
          className="btn btn-primary mt-6"
        >
          {editandoId
            ? "Actualizar Almacén"
            : "Guardar Almacén"}
        </button>
      </div>

      <div className="table-card overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            Listado de Almacenes
          </h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <SortableTableHead label="Código Sistema" field="codigoSistema" currentSortField={sortField} currentSortOrder={sortOrder} onSort={handleSort} className="p-4" />
              <SortableTableHead label="Nombre" field="nombre" currentSortField={sortField} currentSortOrder={sortOrder} onSort={handleSort} className="p-4" />
              <SortableTableHead label="Ubicación" field="ubicacion" currentSortField={sortField} currentSortOrder={sortOrder} onSort={handleSort} className="p-4" />
              <SortableTableHead label="Responsable" field="responsable" currentSortField={sortField} currentSortOrder={sortOrder} onSort={handleSort} className="p-4" />
              <SortableTableHead label="Estado" field="estado" currentSortField={sortField} currentSortOrder={sortOrder} onSort={handleSort} className="p-4" />

              <th className="text-left p-4">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {almacenesOrdenados.map(
              (almacen) => (
                <tr
                  key={almacen.id}
                  className="border-b"
                >
                  <td className="p-4 font-mono">
                    {
                      almacen.codigoSistema
                    }
                  </td>

                  <td className="p-4">
                    {almacen.nombre}
                  </td>

                  <td className="p-4">
                    {
                      almacen.ubicacion
                    }
                  </td>

                  <td className="p-4">
                    {
                      almacen.responsable
                    }
                  </td>

                  <td className="p-4">
                    {almacen.estado ? (
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
                        editarAlmacen(
                          almacen
                        )
                      }
                      className="btn btn-secondary px-3 py-1"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() =>
                        cambiarEstado(
                          almacen.id,
                          almacen.estado
                        )
                      }
                      className={
                        almacen.estado
                          ? "btn btn-secondary px-3 py-1"
                          : "btn btn-primary px-3 py-1"
                      }
                    >
                      {almacen.estado
                        ? "🚫"
                        : "✅"}
                    </button>

                    <button
                      onClick={() =>
                        eliminarAlmacen(
                          almacen.id
                        )
                      }
                      className="btn btn-secondary px-3 py-1"
                    >
                      🗑️
                    </button>
                    <button
                      onClick={() =>
                        window.location.href =
                          `/inventario/almacenes/${almacen.id}`
                      }
                      className="btn btn-primary px-3 py-1"
                    >
                      📦
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
