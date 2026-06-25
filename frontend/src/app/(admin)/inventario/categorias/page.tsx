"use client";

import { useEffect, useState } from "react";

interface Categoria {
  id: number;
  codigo: string;
  nombre: string;
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombre, setNombre] = useState("");

  const [editandoId, setEditandoId] = useState<number | null>(null);

  async function cargarCategorias() {
    try {
      const response = await fetch("/api/inventory/categorias");

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setCategorias(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function guardarCategoria() {
    try {
      if (editandoId) {
        const response = await fetch(
          `/api/inventory/categorias/${editandoId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nombre,
            }),
          }
        );

        if (!response.ok) {
          throw new Error();
        }

        setEditandoId(null);
        setNombre("");

        await cargarCategorias();

        alert("Categoría actualizada correctamente");

        return;
      }

      const response = await fetch("/api/inventory/categorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      setNombre("");

      await cargarCategorias();

      alert("Categoría creada correctamente");
    } catch (error) {
      console.error(error);

      alert("Error al guardar categoría");
    }
  }

  async function eliminarCategoria(id: number) {
    const confirmar = confirm(
      "¿Deseas eliminar esta categoría?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const response = await fetch(
        `/api/inventory/categorias/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      await cargarCategorias();

      alert("Categoría eliminada correctamente");
    } catch (error) {
      console.error(error);

      alert("Error al eliminar categoría");
    }
  }

  function editarCategoria(categoria: Categoria) {
    setEditandoId(categoria.id);

    setNombre(categoria.nombre);
  }

  useEffect(() => {
    cargarCategorias();
  }, []);

  return (
    <main className="p-8 bg-slate-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Categorías
        </h1>

        <p className="text-slate-600 mt-2">
          Administración de categorías del inventario.
        </p>
      </div>

      <div className="form-card mb-8">
        <h2 className="text-xl font-semibold mb-6">
          {editandoId
            ? "Editar Categoría"
            : "Nueva Categoría"}
        </h2>

        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la categoría"
          className="w-full"
        />

        <button
          onClick={guardarCategoria}
          className="btn btn-primary mt-6"
        >
          {editandoId
            ? "Actualizar Categoría"
            : "Guardar Categoría"}
        </button>
      </div>

      <div className="table-card overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            Listado de Categorías
          </h2>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-4">ID</th>
              <th className="text-left p-4">Código</th>
              <th className="text-left p-4">Nombre</th>
              <th className="text-left p-4">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {categorias.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center p-8 text-slate-500"
                >
                  No existen categorías registradas.
                </td>
              </tr>
            ) : (
              categorias.map((categoria) => (
                <tr
                  key={categoria.id}
                  className="border-b hover:bg-slate-50"
                >
                 <td className="p-4">{categoria.id}</td>

<td className="p-4 font-mono">
  {categoria.codigo}
</td>

<td className="p-4">
  {categoria.nombre}
</td>

                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() =>
                        editarCategoria(categoria)
                      }
                      className="btn btn-secondary px-3 py-1"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() =>
                        eliminarCategoria(categoria.id)
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
